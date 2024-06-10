package com.cloud.runaway.plugins

import com.cloud.runaway.dbservices.User
import com.cloud.runaway.dbservices.Users
import com.cloud.runaway.dbservices.userService
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.server.sessions.*

data class UserContext(val user: User)
data class AssignContext(val userID: Int){
  var keyCode: Int? = null
  var lastKeySend: Long? = null
}

fun Application.configureSecurity() {
  install(Sessions) {
    cookie<UserContext>("USER_CONTEXT") {
      cookie.path = "/"
    }

    cookie<AssignContext>("ASSIGN_CONTEXT"){
      cookie.path = "/"
    }
  }

  routing {
    put("/sendKey") {
      var assignContext = call.sessions.get("ASSIGN_CONTEXT") as? AssignContext

      if (assignContext == null){
        assignContext = AssignContext(call.parameters["userID"]!!.toInt())
        call.sessions.set("ASSIGN_CONTEXT", assignContext)
      }

      if (sendKeyCode(call, assignContext)) call.respond("success")
      else call.respond("wait")
    }

    put("/assign") {
      val assignContext = call.sessions.get("ASSIGN_CONTEXT") as? AssignContext

      if (userService.any { Users.name eq call.parameters["name"] as String }) call.respond(mapOf("error" to "User already exists"))
      else if (call.parameters["passwordHash"] == null || call.parameters["passwordHash"]!!.isEmpty()) call.respond(mapOf("error" to "Password hash not provided"))
      else if (assignContext == null) call.respond(mapOf("error" to "Send keycode first"))
      else if (call.parameters["keyCode"] != assignContext.keyCode.toString()) call.respond(mapOf("error" to "Keycode error"))

      val newUser = User(
        name = call.parameters["name"],
        email = call.parameters["email"],
        displayName = call.parameters["displayName"],
        passwordHash = call.parameters["passwordHash"]
      )
      userService.create(newUser)
      call.respond(newUser)

      call.sessions.set("USER_CONTEXT", UserContext(newUser))
      call.sessions.clear("ASSIGN_CONTEXT")
    }

    put("/login") {
      val user = userService.find { Users.name eq call.parameters["name"] as String }
      if (user == null) call.respond(mapOf("error" to "No such account"))
      else if (user.passwordHash != call.parameters["passwordHash"] as String) call.respond(mapOf("error" to "Password incorrect"))

      call.sessions.set("USER_CONTEXT", UserContext(user!!))
      call.respond("success")
    }

    put("/logout") {
      val ses = call.sessions.get("USER_CONTEXT") as? UserContext
      if (ses == null){
        call.respond(mapOf("error" to "No user logged in"))
      }
      else {
        call.sessions.clear("USER_CONTEXT")
        call.respond("success")
      }
    }

    put("/update_user_info") {
      TODO("Not implemented yet")
    }

    get("/usrcontext") {
      val ses = call.sessions.get("USER_CONTEXT") as? UserContext

      if (ses != null) {
        val user = ses.user
        call.respond(mapOf(
          "uid" to user.uid
        ))
      }
      else {
        call.respond(HttpStatusCode.BadGateway)
      }
    }
  }
}

fun sendKeyCode(call: ApplicationCall, context: AssignContext): Boolean {
  if (System.nanoTime() - (context.lastKeySend?:0L) <= 60L*1000*1000*1000) return false
  context.keyCode = 100000 + Math.round(Math.random()*899999).toInt()
  context.lastKeySend = System.nanoTime()

  TODO("Send keycode to client")
}
