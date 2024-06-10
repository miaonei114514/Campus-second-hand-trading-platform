package com.schoolshop

import com.schoolshop.plugins.*
import freemarker.cache.ClassTemplateLoader
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.freemarker.*
import io.ktor.server.netty.*

/**程序入口点*/
fun main() {
  //启动Ktor服务器，由于在本机进行测试，主机设置为0.0.0.0，上线部署则设置为公网IP
  embeddedServer(Netty, port = 8080, host = "0.0.0.0", module = Application::module)
    .start(wait = true)
}

fun Application.module() {
  //配置FreeMarker模板引擎，以便向特定页面传递数据
  install(FreeMarker) {
    templateLoader = ClassTemplateLoader(this::class.java.classLoader, "static")
  }

  configureSerialization() //contentType/json 序列化插件
  configureAuthentication() //关于用户登录信息的网页API
  configureTrades() //关于交易信息的网页API
  configureDatabases() //数据库配置
  configureRouting() //页面路由
  configureFiles() //文件API
}
