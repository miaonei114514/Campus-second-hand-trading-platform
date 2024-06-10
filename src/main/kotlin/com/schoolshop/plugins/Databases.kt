package com.schoolshop.plugins

import io.ktor.server.application.*
import io.ktor.server.routing.*
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.name

/**懒链接到数据库，并将链接对象保存到全局变量以便使用，参数设置遵循JDBC规则*/
val database by lazy {
  Database.connect("jdbc:mysql://localhost:3306/school_shop", driver = "com.mysql.cj.jdbc.Driver",
                   user = "root", password = "redblock758")
}

/**数据库API不在此提供，其被编写为若干数据库服务，请参阅 [com.schoolshop.dbservice.DatabaseService]*/
fun Application.configureDatabases() {
  println(database.name) // 懒加载时机

  routing {
    //no action
  }
}
