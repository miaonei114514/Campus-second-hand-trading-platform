val ktorVersion: String by project
val kotlinVersion: String by project
val logbackVersion: String by project

val exposedVersion: String by project
val h2Version: String by project

//由于项目采用nodejs编写前端脚本，但浏览器并不包含commonJS，采用browserify对脚本进行commonJS封装
//为便于工作，如下代码块内程序被用于对页面脚本执行commonJS封包，作为gradle顶级语句，每次构建即运行一次进行自动封包，免去手动操作
run {
  val pageBuilderDir = File(project.projectDir, "src/main/resources/static/pagescripts")

  val set = HashSet<File>()
  if (pageBuilderDir.exists() && pageBuilderDir.isDirectory) pageBuilderDir.listFiles()?.forEach {
    if (!it.name.contains("-page.js") && set.add(it))
      Runtime.getRuntime().exec(
        arrayOf(
          "../node_modules/.bin/browserify",
          it.nameWithoutExtension,
          "-o",
          "${it.nameWithoutExtension}-page.js"
        ), arrayOf(), it.parentFile
      ).waitFor() //同步化
  }
}

plugins {
  kotlin("jvm") version "1.9.21"
  id("io.ktor.plugin") version "2.3.6"
  id("org.jetbrains.kotlin.plugin.serialization") version "1.9.21"
}

group = "com.schoolshop"
version = "0.0.1"

application {
  mainClass.set("com.schoolshop.ApplicationKt")

  val isDevelopment: Boolean = project.ext.has("development")
  applicationDefaultJvmArgs = listOf("-Dio.ktor.development=$isDevelopment")
}

repositories {
  mavenCentral()
}

dependencies {
  //ktor主要模块及插件
  implementation("io.ktor:ktor-server-core-jvm")
  implementation("io.ktor:ktor-server-auth-jvm")
  implementation("io.ktor:ktor-server-sessions-jvm")
  implementation("io.ktor:ktor-server-content-negotiation-jvm")
  implementation("io.ktor:ktor-serialization-jackson-jvm")
  implementation("io.ktor:ktor-server-freemarker-jvm")
  implementation("io.ktor:ktor-server-netty-jvm")

  //exposed数据库ORM工具
  implementation("org.jetbrains.exposed:exposed-core:$exposedVersion")
  implementation("org.jetbrains.exposed:exposed-jdbc:$exposedVersion")

  //日志工具
  implementation("ch.qos.logback:logback-classic:$logbackVersion")

  //mysql JDBC驱动
  implementation("mysql:mysql-connector-java:8.0.33")
}
