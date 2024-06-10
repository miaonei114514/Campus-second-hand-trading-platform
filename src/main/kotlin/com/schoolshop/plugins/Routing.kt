package com.cloud.runaway.plugins

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.freemarker.*
import io.ktor.server.http.content.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.server.sessions.*

fun Application.configureRouting() {
  routing {
    staticResources("/", "static")
    staticResources("/files", "files")

    get("/") {
      call.respond(FreeMarkerContent("index.html", mapOf("" to "")))
    }

    get("/shop") {

    }
  }
}
