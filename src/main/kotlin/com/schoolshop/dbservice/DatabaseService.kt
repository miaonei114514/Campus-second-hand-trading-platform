package com.cloud.runaway.dbservices

import kotlinx.coroutines.Dispatchers
import org.jetbrains.exposed.dao.id.EntityID
import org.jetbrains.exposed.dao.id.IdTable
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.statements.InsertStatement
import org.jetbrains.exposed.sql.statements.api.PreparedStatementApi
import org.jetbrains.exposed.sql.transactions.TransactionManager
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import java.sql.ResultSet

interface DatabaseService<Q, I> {
  suspend fun <T> dbQuery(block: suspend () -> T): T =
    newSuspendedTransaction(Dispatchers.IO) { block() }

  suspend fun create(user: Q): I
  suspend fun read(id: I): Q?
  suspend fun any(where: SqlExpressionBuilder.() -> Op<Boolean>): Boolean
  suspend fun filter(where: SqlExpressionBuilder.() -> Op<Boolean>): List<Q>
  suspend fun find(where: SqlExpressionBuilder.() -> Op<Boolean>): Q?
  suspend fun update(user: Q)
  suspend fun delete(id: I)
}

class LiteInsertStatement<T : Any>(table: Table) : InsertStatement<T>(table){
  override fun PreparedStatementApi.execInsertFunction(): Pair<Int, ResultSet?> {
    TODO("Not yet implemented")
  }

  override fun prepareSQL(transaction: Transaction): String {
    return super.prepareSQL(transaction)
  }
}

fun <Key: Comparable<Key>, T: IdTable<Key>> T.insertLite(body: T.(InsertStatement<EntityID<Key>>) -> Unit): EntityID<Key> = InsertStatement<EntityID<Key>>(this, false).run {
  body(this)
  execute(TransactionManager.current())
  get(id)
}
