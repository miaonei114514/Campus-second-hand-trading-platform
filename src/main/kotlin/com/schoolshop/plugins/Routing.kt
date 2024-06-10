package com.schoolshop.plugins

import io.ktor.server.application.*
import io.ktor.server.freemarker.*
import io.ktor.server.http.content.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Application.configureRouting() {
  routing {
    staticResources("/", "static")
    staticResources("/page-builder", "static/pagescripts")
    staticResources("/assets", "assets")

    get("/") {
      val search = call.parameters["search"]
      val tags = call.parameters["tags"]

      call.respond(FreeMarkerContent("index.html", mapOf(
        "searching" to "${search != null || tags != null}",
        "search" to (if (search != null) "\"$search\"" else "null"),
        "tags" to (if (tags != null) "\"$tags\"" else "null")
      )))
    }

    get("/login") {
      call.respond(FreeMarkerContent("login.html", mapOf<String, String>()))
    }

    get("/signup") {
      call.respond(FreeMarkerContent("signup.html", mapOf<String, String>()))
    }

    get("/profile") {
      call.respond(FreeMarkerContent("profile.html", mapOf("uid" to "")))
    }

    get("/profile/{uid}") {
      call.respond(FreeMarkerContent("profile.html", mapOf("uid" to call.parameters["uid"]!!)))
    }

    get("/goods/{id}") {
      call.respond(FreeMarkerContent("goods.html", mapOf("id" to call.parameters["id"]!!)))
    }

    get("/cart") {
      call.respond(FreeMarkerContent("cart.html", mapOf<String, String>()))
    }

    get("/make-trade") {
      val raw = call.parameters["goods"]
      val clearCart = call.parameters["clear-cart"]

      val list = (raw?:"").split("|").map {
        val pair = it.split(":")

        return@map mapOf(
          "\"id\"" to pair[0].toLong(),
          "\"amount\"" to pair[1].toInt()
        )
      }

      call.respond(FreeMarkerContent("maketrade.html", mapOf(
        "goods" to list.toString().replace("=", ":"),
        "clearcart" to clearCart.toBoolean().toString()
      )))
    }

    get("goods-edit") {
      TODO()
    }
  }
}
