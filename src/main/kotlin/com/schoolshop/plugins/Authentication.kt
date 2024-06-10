package com.schoolshop.plugins

import com.schoolshop.dbservice.Permission
import com.schoolshop.dbservice.Users
import com.schoolshop.dbservice.Users.assignTime
import com.schoolshop.dbservice.Users.description
import com.schoolshop.dbservice.Users.displayName
import com.schoolshop.dbservice.Users.email
import com.schoolshop.dbservice.Users.name
import com.schoolshop.dbservice.Users.passwordHash
import com.schoolshop.dbservice.Users.permission
import com.schoolshop.dbservice.Users.uid
import com.schoolshop.dbservice.userService
import com.schoolshop.utils.ErrorRes
import com.schoolshop.utils.SuccessRes
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.server.sessions.*
import io.ktor.util.*
import org.jetbrains.exposed.sql.Expression
import java.io.File

val nameRegex = Regex("^([a-zA-Z0-9_])+$")
val emailRegex = Regex("^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$")
val passwordRegex = Regex("^([a-zA-Z0-9+_\\-$@&*%!?])+$")

var string: String = "";
var string1: String? = null;

data class UserContext(
  val id: Int,
  val uid: String,
  val name: String,
  val permission: Int,

  val email: String,

  var displayName: String?,
  var description: String?
)

val varList = listOf("displayName", "description")

fun Application.configureSecurity() {
  install(Sessions) {
    cookie<UserContext>("USER_CONTEXT") {
      cookie.path = "/"
      cookie.maxAgeInSeconds = 3600 * 24 * 7 // 7 days
    }
  }

  routing {

    post("/register") {
      val parameters = call.receiveParameters()

      when {
        (parameters["name"] as String).let { it.length < 6 || it.length > 18 || !nameRegex.matches(it) } -> call.respond(ErrorRes(0, "name format is invalid"))
        (parameters["email"] as String).let { !emailRegex.matches(it) } -> call.respond(ErrorRes(1, "email format is invalid"))
        (parameters["password"] as String).let { it.length < 8 || it.length > 24 || !passwordRegex.matches(it) } -> call.respond(ErrorRes(2, "password format is invalid"))
        userService.any{ name eq parameters["name"] as String } -> call.respond(ErrorRes(3, "name has been registed"))
        userService.any { email eq parameters["email"] as String } -> call.respond(ErrorRes(4, "this email has been registed"))
        else -> {
          val newUser = userService.create(
            name to parameters["name"]!!,
            email to parameters["email"]!!,
            permission to Permission.NORMAL,
            passwordHash to parameters["password"]!!
          )

          call.sessions.set("USER_CONTEXT", UserContext(
            newUser.id,
            newUser[uid]!!,
            newUser[name]!!,
            newUser[permission]!!,
            newUser[email]!!,
            newUser[displayName],
            newUser[description]
          ))

          File(userContext, "/${newUser[uid]!!}").mkdirs()

          call.respond(SuccessRes(0, null))
        }
      }
    }

    post("/login") {
      val parameters = call.receiveParameters()

      val user = userService.find { name eq parameters["name"] as String }
      if (user == null) call.respond(ErrorRes(0, "no such user"))
      else if ((user[name] as String).let { it.length < 6 || it.length > 18 || !nameRegex.matches(it) }) call.respond(ErrorRes(1, "name format is invalid"))
      else if (user[passwordHash] != parameters["password"] as String) call.respond(ErrorRes(2, "Password incorrect"))
      else {
        val usr = UserContext(
          user.id,
          user[uid]!!,
          user[name]!!,
          user[permission]!!,
          user[email]!!,
          user[displayName],
          user[description]
        )
        call.sessions.set("USER_CONTEXT", usr)
        call.respond(SuccessRes(0, obj = usr))
      }
    }

    post ("/logout") {
      val ses = call.sessions.get("USER_CONTEXT") as? UserContext
      if (ses == null){
        call.respond(ErrorRes(0, "No user logged in"))
      }
      else {
        call.sessions.clear("USER_CONTEXT")
        call.respond(SuccessRes(0, null))
      }
    }

    post ("/update_user_info/{name}") {
      val currUsr = call.sessions.get("USER_CONTEXT") as UserContext
      if (currUsr.permission < Permission.ADMIN) {
        call.respond(ErrorRes(0, "You can not use this API"))
        return@post
      }

      val targetName = call.parameters["name"]!!
      val target = userService.find { name eq targetName }
      if (target == null) {
        call.respond(ErrorRes(0, "No such user"))
        return@post
      }

      val param = call.receiveParameters()
      val pairs = param.toMap().map {
        return@map Users.columns.find { e -> e.name == it.key } as Expression<*> to it.value.firstOrNull()
      }.toTypedArray()

      userService.update(target.id, *pairs)
      val user = userService.read(target.id)!!
      call.respond(SuccessRes(0, obj = mapOf(
        "id" to user.id,
        "uid" to user[uid],
        "name" to user[name]!!,
        "email" to user[email]!!,
        "displayName" to user[displayName],
        "permission" to user[permission]!!,
        "assignTime" to user[assignTime],
        "passwordHash" to user[passwordHash],
      )))
    }

    post ("/update_user_info") {
      val param = call.receiveParameters()
      var user = call.sessions.get("USER_CONTEXT") as? UserContext

      if (user == null) {
        call.respond(ErrorRes(0, "No user logged in"))
        return@post
      }

      if (param.toMap().keys.none { varList.contains(it) }) {
        call.respond(ErrorRes(1, "This information not allowed to be updated"))
        return@post
      }

      val pairs = param.toMap().map {
        return@map Users.columns.find { e -> e.name == it.key } as Expression<*> to it.value.firstOrNull()
      }.toTypedArray()

      userService.update(user.id, *pairs)
      val res = userService.read(user.id)!!

      user = UserContext(
        res.id,
        res[uid]!!,
        res[name]!!,
        res[permission]!!,
        res[email]!!,
        res[displayName],
        res[description]
      )
      call.sessions.set("USER_CONTEXT", user)

      call.respond(SuccessRes(0, obj = user))
    }

    get ("/usercontext") {
      val ses = call.sessions.get("USER_CONTEXT") as? UserContext

      if (ses != null) {
        call.respond(SuccessRes(0, ses))
      }
      else {
        call.respond(ErrorRes(0))
      }
    }

    get ("/usercontext/{uid}") {
      val uid = call.parameters["uid"]
      val user = userService.find { Users.uid eq uid }
      val ses = call.sessions.get("USER_CONTEXT") as? UserContext

      if (user != null && user.id == ses?.id) {
        call.respond(SuccessRes(0, ses))
      }
      else if (user != null) {
        call.respond(SuccessRes(1, mapOf(
          "id" to user.id,
          "uid" to uid,
          "name" to user[name]!!,
          "displayName" to user[displayName],
          "permission" to user[permission]!!
        )))
      }
      else {
        call.respond(ErrorRes(0))
      }
    }
  }
}
