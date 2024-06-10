package com.schoolshop.dbservice

import com.schoolshop.plugins.database
import org.jetbrains.exposed.dao.id.LongIdTable
import org.jetbrains.exposed.sql.Expression
import org.jetbrains.exposed.sql.QueryBuilder
import java.sql.Timestamp

object GoodsTable: LongIdTable() {
  val owner = reference("owner", Users)

  val title = varchar("title", 64)
  val description = varchar("description", 1024).nullable()
  val tags = varchar("tags", 256).default("")
  val price = integer("price")
  val reminded = integer("reminded")

  val createTime = time("createTime")
    .defaultExpression(object : Expression<Timestamp>(){
      override fun toQueryBuilder(queryBuilder: QueryBuilder) {
        queryBuilder.append("CURRENT_TIMESTAMP()")
      }
    })
}

object GoodService: DatabaseService<Long>(database, GoodsTable)
