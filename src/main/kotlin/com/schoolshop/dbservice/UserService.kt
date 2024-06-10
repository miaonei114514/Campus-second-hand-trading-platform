package com.schoolshop.dbservice

import com.schoolshop.plugins.database
import org.jetbrains.exposed.dao.id.IntIdTable
import org.jetbrains.exposed.sql.Expression
import org.jetbrains.exposed.sql.QueryBuilder
import java.sql.Timestamp

object Permission{
  const val BANNED = 0
  const val SUSPICIOUS = 1
  const val NORMAL = 2
  const val BUSINESS = 3
  const val ADMIN = 4
}

object Users : IntIdTable() {
  val name = varchar("name", length = 18)
  val email = varchar("email", length = 50)
  val permission = integer("permission")

  val assignTime = time("assignTime")
    .defaultExpression(object : Expression<Timestamp>(){
      override fun toQueryBuilder(queryBuilder: QueryBuilder) {
        queryBuilder.append("CURRENT_TIMESTAMP()")
      }
    })
  val displayName = varchar("displayName", length = 50).nullable()
  val description = varchar("description", length = 200).nullable()

  val passwordHash = varchar("passwordHash", length = 128)
}

object UserService: DatabaseService<Int>(database, Users)
