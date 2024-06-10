package com.schoolshop.dbservice

import com.schoolshop.plugins.database
import org.jetbrains.exposed.dao.id.LongIdTable
import org.jetbrains.exposed.sql.Expression
import org.jetbrains.exposed.sql.QueryBuilder
import java.sql.Timestamp

//order status
const val WAIT_FOR_PAY = 0
const val WAIT_FOR_SEND = 1
const val CLOSED = 2

const val WAIT_TO_RECEIVE = 3
const val COMPLETED = 4

const val RETURNING = 5
const val CANCELLED = 6

const val DELETED_BY_SELLER = 7
const val DELETED_BY_BUYER = 8
const val DELETED = 9

object OrdersTable: LongIdTable() {
  val seller = reference("seller", Users)
  val buyer = reference("buyer", Users)
  val goods = reference("goods", GoodsTable)
  val receiveAddress = reference("receiveAddress", Addresses)
  val amount = integer("amount")
  val status = integer("status").default(WAIT_FOR_PAY)

  val createTime = time("createTime")
    .defaultExpression(object : Expression<Timestamp>(){
      override fun toQueryBuilder(queryBuilder: QueryBuilder) {
        queryBuilder.append("CURRENT_TIMESTAMP()")
      }
    })
  val endTime = time("endTime").nullable()
}

object OrdersService: DatabaseService<Long>(database, OrdersTable)

