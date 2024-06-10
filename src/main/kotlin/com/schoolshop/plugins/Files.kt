@file:Suppress("DuplicatedCode")

package com.schoolshop.plugins

import com.schoolshop.dbservice.GoodService
import com.schoolshop.dbservice.GoodsTable
import com.schoolshop.dbservice.Permission
import com.schoolshop.dbservice.UserService
import com.schoolshop.utils.ErrorRes
import com.schoolshop.utils.SuccessRes
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.server.sessions.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File

val file = File("files")
val error = File(file, "error.png")

val userContext = File(file, "usercontext")
val goodsResource = File(file, "goods-res")

private val writeList = setOf(
  "goods-res/*/big-preview.png",
  "goods-res/*/preview.png",
  "goods-res/*/description/*",
  "usercontext/*/avatar.png",
)

private val writeListSplited = writeList.map { it.split("/") }

private fun checkFile(file: File): Boolean {
  val parts = file.path.split("/")
    .map { s -> s.trim() }
    .let { it.subList(it.indexOfFirst { s -> s == "usercontext" || s == "goods-res" }, it.size) }

  return writeListSplited.any { matcher ->
    if (matcher.size != parts.size) return@any false

    matcher.forEachIndexed { i, s -> if (s != "*" && s != parts[i]) return@any false }
    return@any true
  }
}

fun Application.configureFiles() {
  routing {
    route("/usercontext/{id}/{file}"){
      get {
        val id = call.parameters["id"]?.toIntOrNull()
        val fl = call.parameters["file"]

        val reading = File(userContext, "/$id/$fl")
        if (fl != "avatar.png" && (call.sessions.get("USER_CONTEXT") as? UserContext).let { it?.permission != Permission.ADMIN && it?.id != id }) {
          call.respond(HttpStatusCode.BadRequest, ErrorRes(0, "No permission"))
          return@get
        }

        reading.parentFile.mkdirs()
        if (!reading.exists() || reading.isDirectory){
          call.respond(HttpStatusCode.BadRequest, ErrorRes(1, "no such file"))
          return@get
        }

        call.respondFile(reading)
      }

      post {
        val id = call.parameters["id"]?.toIntOrNull()
        val fl = call.parameters["file"]

        val fi = File(userContext, "/$id/$fl")
        if ((call.sessions.get("USER_CONTEXT") as? UserContext).let { it?.permission != Permission.ADMIN && (it?.id != id || !checkFile(fi)) }) {
          call.respond(HttpStatusCode.BadRequest, ErrorRes(0, "No permission"))
          return@post
        }

        call.receiveStream().run {
          withContext(Dispatchers.IO) {
            val out = fi.outputStream()
            copyTo(out)
            close()
            out.close()
          }
          call.respond(SuccessRes(1, null))
        }
      }
    }

    get("/goods-res/descriptions/{id}") {
      val id = call.parameters["id"]?.toLong()
      if (id == null) {
        call.respond(HttpStatusCode.BadRequest, ErrorRes(0, "No id"))
        return@get
      }

      val dir = File(goodsResource, "/$id/description")
      if (!dir.exists() || dir.isFile) {
        call.respond(HttpStatusCode.Forbidden, ErrorRes(0, "err"))
        return@get
      }

      call.respond(SuccessRes(0, dir.listFiles()!!
        .filter { it.isFile && ".png.jpg".contains(it.extension) }
        .map { "/goods-res/${id}/description%2F${it.name}" }
      ))
    }

    route("/goods-res/{id}/{file}"){
      get{
        try {
          val id = call.parameters["id"]?.toLong()
          if (id == null) {
            call.respond(HttpStatusCode.BadRequest, ErrorRes(0, "No id"))
            return@get
          }

          val fl = call.parameters["file"]

          val reading = File(goodsResource, "/$id/$fl")
          if (!reading.exists() || reading.isDirectory){
            call.respondFile(error)
            return@get
          }
          call.respondFile(reading)

        } catch (e: NumberFormatException) { call.respond(HttpStatusCode.BadRequest, ErrorRes(2, "Error id")) }
      }

      post{
        val id = call.parameters["id"]?.toLong()
        if (id == null) {
          call.respond(HttpStatusCode.BadRequest, ErrorRes(0, "No id"))
          return@post
        }
        val goodOwner = UserService.read(GoodService.read(id)?.get(GoodsTable.owner)?.value ?: -1)

        if (goodOwner == null) {
          call.respond(HttpStatusCode.BadRequest, ErrorRes(1, "Error goods info"))
          return@post
        }

        val fl = call.parameters["file"]
        val fi = File(goodsResource, "/$id/$fl")
        if ((call.sessions.get("USER_CONTEXT") as? UserContext).let { it?.permission != Permission.ADMIN || (it.id != goodOwner.id || !checkFile(fi)) }) {
          call.respond(HttpStatusCode.BadRequest, ErrorRes(1, "No permission"))
          return@post
        }

        call.receiveStream().run {
          val out = fi.outputStream()
          copyTo(out)
          close()
          out.close()

          call.respond(SuccessRes(0, null))
        }
      }
    }

    post("/usercontext/delete/{id}/{file}") {
      val id = call.parameters["id"]?.toIntOrNull()
      val fl = call.parameters["file"]

      val del = File(userContext, "/$id/$fl")
      if ((call.sessions.get("USER_CONTEXT") as? UserContext).let { it?.permission != Permission.ADMIN && (it?.id != id || !checkFile(del)) }) {
        call.respond(HttpStatusCode.BadRequest, ErrorRes(0, "No permission"))
        return@post
      }

      if (del.exists()){
        del.deleteRecursively()
        call.respond(SuccessRes(0, "Deleted"))
      }
      else {
        call.respond(HttpStatusCode.BadRequest, ErrorRes(0, "No such file"))
      }
    }

    post("/goods-res/delete/{id}/{file}") {
      val id = call.parameters["id"]?.toLong()
      if (id == null) {
        call.respond(HttpStatusCode.BadRequest, ErrorRes(0, "No id"))
        return@post
      }
      val goodOwner = UserService.read(GoodService.read(id)?.get(GoodsTable.owner)?.value ?: -1)

      if (goodOwner == null) {
        call.respond(HttpStatusCode.BadRequest, ErrorRes(1, "Error goods info"))
        return@post
      }

      val fl = call.parameters["file"]
      val del = File(goodsResource, "/$id/$fl")

      if ((call.sessions.get("USER_CONTEXT") as? UserContext).let { it?.permission != Permission.ADMIN || (it.id != goodOwner.id || !checkFile(del)) }) {
        call.respond(HttpStatusCode.BadRequest, ErrorRes(1, "No permission"))
        return@post
      }

      if (del.exists()){
        del.deleteRecursively()
        call.respond(SuccessRes(0, "Deleted"))
      }
      else {
        call.respond(HttpStatusCode.BadRequest, ErrorRes(0, "No such file"))
      }
    }
  }
}