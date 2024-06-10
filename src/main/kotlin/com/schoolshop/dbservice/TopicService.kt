package com.schoolshop.dbservice

import com.schoolshop.plugins.database
import org.jetbrains.exposed.dao.id.LongIdTable
import org.jetbrains.exposed.sql.Expression
import org.jetbrains.exposed.sql.QueryBuilder
import java.sql.Timestamp

object Topics: LongIdTable(){
  val publisher = reference("publisher", Users)
  val target = reference("target", GoodsTable)
  val content = varchar("content", 500)
  val publishTime = time("publishTime")
    .defaultExpression(object : Expression<Timestamp>(){
      override fun toQueryBuilder(queryBuilder: QueryBuilder) {
        queryBuilder.append("CURRENT_TIMESTAMP()")
      }
    })
}

object TopicService: DatabaseService<Long>(database, Topics)
