package com.schoolshop.dbservice

import com.schoolshop.plugins.database
import org.jetbrains.exposed.dao.id.LongIdTable

object Carts: LongIdTable() {
  val goods = reference("goods", GoodsTable)
  val owner = reference("owner", Users)
  val amount = integer("amount")
}

object CartService: DatabaseService<Long>(database, Carts)