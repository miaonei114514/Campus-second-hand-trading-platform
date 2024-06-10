package com.schoolshop.dbservice

import com.schoolshop.plugins.database
import org.jetbrains.exposed.dao.id.LongIdTable
import org.jetbrains.exposed.sql.and

object Addresses: LongIdTable() {
  val owner = reference("owner", Users)
  val receiverName = varchar("receiverName", 64)
  val address = varchar("address", 255)
  val phone = varchar("phone", 30)
  val isDefault = bool("isDefault").default(false)
}

object AddressService: DatabaseService<Long>(database, Addresses){
  suspend fun getDefaultAddress(user: Int): QueryRes? = find { Addresses.owner eq user and Addresses.isDefault }
}
