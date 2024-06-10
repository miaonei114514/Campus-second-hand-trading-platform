package com.cloud.runaway.plugins

import com.cloud.runaway.dbservices.UserService
import com.cloud.runaway.dbservices.Users
import io.ktor.server.application.*
import io.ktor.server.routing.*
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction

var _usrServ: UserService? = null
fun Application.configureDatabases() {
  val database = Database.connect(
    url = "jdbc:sqlite:database.db"
  )

  transaction(database) {
    _usrServ = UserService(database)
  }

  routing {

  }
}
