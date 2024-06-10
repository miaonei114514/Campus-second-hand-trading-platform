package com.schoolshop.plugins

import com.schoolshop.dbservice.*
import com.schoolshop.utils.ErrorRes
import com.schoolshop.utils.SuccessRes
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.server.sessions.*
import io.ktor.util.pipeline.*
import org.jetbrains.exposed.sql.SortOrder
import org.jetbrains.exposed.sql.and

fun Application.configureTrades() {
  routing {
    post("/set-debug-items") {
      (1..100).forEach {
        GoodService.create(
          GoodsTable.owner to 1,
          GoodsTable.title to "test$it",
          GoodsTable.price to (100..100000).random(),
          GoodsTable.reminded to (1..20).random(),
          GoodsTable.description to "description as $it"
        )
      }
    }

    get("/goods-list") {
      val offset = (call.parameters["offset"]?:"0").toLong()
      val amount = call.parameters["amount"]!!.toInt()
      val search = call.parameters["search"]
      val tags = call.parameters["tags"]

      val regex = tags?.split(" ")?.map { " $it " }?.reduce{ a, b -> "$a|$b" } ?: ".*"

      val res = GoodService.filter(amount) {
        (GoodsTable.id greater offset) and
        (GoodsTable.title regexp (search?:".*")) and
        (GoodsTable.tags regexp regex)
      }
      val lastId = if(res.any()) res.last().id else offset

      call.respond(SuccessRes(0, mapOf(
        "list" to res.map { it.toMap() },
        "end" to lastId,
        "noMore" to (lastId < offset + amount)
      )))
    }

    get("/goods-info/{id}") {
      val id = call.parameters["id"]?.toLongOrNull()

      val res = if (id == null) null else GoodService.read(id)

      if (res == null) {
        call.respond(ErrorRes(0, "unknown goods id"))
        return@get
      }

      call.respond(SuccessRes(0, res.toMap()))
    }

    get("/get-cart/{id}") {
      val id = call.parameters["id"]?.toIntOrNull()
      val user = id?.let { UserService.read(it) }

      if (user == null) {
        call.respond(ErrorRes(0, "unknown user id"))
        return@get
      }

      if ((call.sessions.get("USER_CONTEXT") as? UserContext).let { it?.permission != Permission.ADMIN && (it?.id != id) }) {
        call.respond(HttpStatusCode.BadRequest, ErrorRes(0, "No access permission"))
        return@get
      }

      val cartList = CartService.filter { Carts.owner eq user[Users.id]!! }
      call.respond(SuccessRes(0, cartList.map { it.toMap() }))
    }

    post("/add-cart") {
      val usr = (call.sessions.get("USER_CONTEXT") as? UserContext)
      val param = call.receiveParameters()

      if (usr == null){
        call.respond(HttpStatusCode.BadRequest, ErrorRes(0, "No user login yet"))
        return@post
      }

      CartService.create(
        Carts.owner to usr.id,
        Carts.goods to param["goods"]!!.toLong(),
        Carts.amount to param["amount"]!!.toInt()
      )

      call.respond(SuccessRes(0, null))
    }

    post("/remove-cart") {
      val usr = (call.sessions.get("USER_CONTEXT") as? UserContext)
      val param = call.receiveParameters()

      if (usr == null){
        call.respond(HttpStatusCode.BadRequest, ErrorRes(0, "No user login yet"))
        return@post
      }

      val cart = CartService.read(param["id"]!!.toLong())

      if (cart == null){
        call.respond(HttpStatusCode.BadRequest, ErrorRes(0, "No such cart"))
        return@post
      }

      if (cart[Carts.owner]?.value != usr.id){
        call.respond(HttpStatusCode.BadRequest, ErrorRes(0, "No access permission"))
        return@post
      }

      CartService.delete(cart[Carts.id]?.value!!)
      call.respond(SuccessRes(0, null))
    }

    route("/user-address/{id?}"){
      get {
        val res = checkUsr()
        if (!res.first) return@get

        val list = AddressService.filter { Addresses.owner eq res.second }

        call.respond(SuccessRes(0, list.map { it.toMap() }))
      }

      post {
        val res = checkUsr()
        if (!res.first) return@post

        val param = call.receiveParameters()
        val receiverName = param["receiver"]!!
        val phone = param["phone"]!!
        val address = param["address"]!!

        val anyDef = AddressService.getDefaultAddress(res.second) != null

        AddressService.create(
          Addresses.owner to res.second,
          Addresses.receiverName to receiverName,
          Addresses.phone to phone,
          Addresses.address to address,
          Addresses.isDefault to !anyDef
        )
        call.respond(SuccessRes(0, null))
      }
    }

    get("/default-address/{id}") {
      val res = checkUsr()
      if (!res.first) return@get

      val def = AddressService.find { Addresses.owner eq res.second and Addresses.isDefault }

      if (def == null){
        call.respond(ErrorRes(0, "No default address"))
        return@get
      }

      call.respond(SuccessRes(0, def.toMap()))
    }

    post("/set-default-address/{id}") {
      val res = checkUsr()
      if (!res.first) return@post
      val setting = call.receiveParameters()["address-id"]!!.toLong()

      AddressService.filter { Addresses.owner eq res.second }
        .forEach { AddressService.update(it.id, Addresses.isDefault to false) }

      AddressService.update(setting, Addresses.isDefault to true)
      call.respond(SuccessRes(0, null))
    }

    post("/delete-address/{id}") {
      if (!checkUsr().first) return@post
      val setting = call.receiveParameters()["address-id"]!!.toLong()

      AddressService.delete(setting)
      call.respond(SuccessRes(0, null))
    }

    post("/make-trade") {

    }

    route("/goods-topics/{id}"){
      get {
        val id = call.parameters["id"]?.toLong()

        val res = if (id == null) null else GoodService.read(id)

        if (res == null) {
          call.respond(ErrorRes(0, "unknown goods id"))
          return@get
        }

        val topics = TopicService.filter{ Topics.target eq id }
        call.respond(SuccessRes(0, topics.map { it.toMap() }))
      }

      post {
        val id = call.parameters["id"]?.toLong()

        val param = call.receiveParameters()
        val target = param["target"]?.toLong()!!
        val content = param["content"]!!

        val publisher = call.sessions.get("USER_CONTEXT") as? UserContext
        if (publisher == null) {
          call.respond(ErrorRes(0, "no user logged in"))
          return@post
        }

        val res = if (id == null) null else GoodService.read(id)
        if (res == null) {
          call.respond(ErrorRes(0, "unknown goods id"))
          return@post
        }

        TopicService.create(
          Topics.target to target,
          Topics.publisher to publisher.id,
          Topics.content to content,
        )

        call.respond(SuccessRes(0, null))
      }
    }

    post("/delete-topic"){
      val param = call.receiveParameters()
      val id = param["topicId"]?.toLong()

      val topic = TopicService.read(id!!)
      if (topic == null) {
        call.respond(ErrorRes(0, "no such topic with id $id"))
        return@post
      }

      val publisher = call.sessions.get("USER_CONTEXT") as? UserContext
      if (publisher == null) {
        call.respond(ErrorRes(0, "no user logged in"))
        return@post
      }

      if (topic[Topics.publisher]?.value != publisher.id){
        call.respond(ErrorRes(0, "no permission to delete this topic"))
        return@post
      }

      TopicService.delete(id)
      call.respond(SuccessRes(0, null))
    }

    get("/usercontext/publich-goods/{id}") {
      val batch = call.parameters["patch"]?.toInt()
      val id = call.parameters["id"]?.toIntOrNull()
      val user = id?.let { UserService.read(it) }

      if (user == null) {
        call.respond(ErrorRes(0, "no such user"))
        return@get
      }

      val goods = GoodService.filter(
        batch?:10000,
        GoodsTable.createTime to SortOrder.ASC
      ) { GoodsTable.owner eq user.id }

      call.respond(SuccessRes(0, goods.map { it.toMap() }))
    }
  }

}

private suspend fun PipelineContext<Unit, ApplicationCall>.checkUsr(): Pair<Boolean, Int> {
  val id = call.parameters["id"]?.toIntOrNull() ?: (call.sessions.get("USER_CONTEXT") as? UserContext)?.id

  if (id == null) {
    call.respond(HttpStatusCode.BadRequest, ErrorRes(0, "Error id and no usr login"))
    return false to -1
  }

  if ((call.sessions.get("USER_CONTEXT") as UserContext).let { it.id != id && it.permission != Permission.ADMIN }) {
    call.respond(HttpStatusCode.BadRequest, ErrorRes(0, "No access permission"))
    return false to -1
  }

  return true to id
}
