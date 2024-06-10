package com.schoolshop.dbservice

import kotlinx.coroutines.Dispatchers
import org.jetbrains.exposed.dao.id.EntityID
import org.jetbrains.exposed.dao.id.IdTable
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import org.jetbrains.exposed.sql.transactions.transaction
import java.sql.Timestamp

/**数据库服务的基础类型，所有单个数据库表单都以一个与之相对应的数据库服务单例提供*/
abstract class DatabaseService<I: Comparable<I>>(database: Database, val table: IdTable<I>) {
  init {
    transaction(database) {
      SchemaUtils.create(table)
    }
  }

  protected fun checkColumn(column: Expression<*>){
    if (column !is Column<*>) throw IllegalArgumentException("$column is not a column")
    if (column.table != table) throw IllegalArgumentException("$column is not a column of $table")
  }

  @Suppress("UNCHECKED_CAST")
  open inner class QueryRes(val id: I){
    private val data = HashMap<Expression<*>, Any?>()

    open operator fun <T> get(column: Expression<T>): T?{
      checkColumn(column)
      return data[column] as T?
    }
    open operator fun <T : Any> set(column: Expression<T>, value: T?){
      checkColumn(column)
      data[column] = value
    }

    open suspend fun commit(){
      update(id, *data.entries.map { it.key to it.value }.toTypedArray())
    }
    open suspend fun remove(){
      delete(id)
    }

    fun toMap() = mapOf(*data.toMutableMap().also { it[table.id] = id }.map {
      (it.key as Column<*>).name to it.value.let { e -> if(e is EntityID<*>) e.value else if (e is Timestamp) e.toString() else e }
    }.toTypedArray())
  }

  protected open suspend fun <T> dbQuery(block: suspend () -> T): T =
    newSuspendedTransaction(Dispatchers.IO) { block() }

  @Suppress("UNCHECKED_CAST")
  open suspend fun <K: Expression<*>, V: Any> create(vararg data: Pair<K, V>): QueryRes {
    val id = dbQuery {
      table.insertAndGetId { t ->
        data.forEach {
          checkColumn(it.first)
          t[it.first as Column<Any>] = it.second
        }
      }
    }.value

    return read(id)!!
  }
  open suspend fun read(id: I): QueryRes? {
    return dbQuery {
      table.selectAll().where { table.id eq id }.map { row ->
        queryRes(row)
      }.let { if (it.any()) it.first() else null }
    }
  }
  open suspend fun filter(batch: Int = 1000, vararg order: Pair<Expression<*>, SortOrder> = arrayOf(table.id to SortOrder.ASC), where: SqlExpressionBuilder.() -> Op<Boolean>): List<QueryRes>{
    return dbQuery {
      table.selectAll().where(where).limit(batch).orderBy(*order).map { row ->
        queryRes(row)
      }.toList()
    }
  }
  open suspend fun find(vararg order: Pair<Expression<*>, SortOrder> = arrayOf(table.id to SortOrder.ASC), where: SqlExpressionBuilder.() -> Op<Boolean>): QueryRes?{
    return dbQuery {
      table.selectAll().where(where).orderBy(*order)
        .let { if (it.any()) it.first() else null }
        ?.let { row -> queryRes(row) }
    }
  }
  @Suppress("UNCHECKED_CAST")
  open suspend fun <K: Expression<*>, V> update(id: I, vararg entries: Pair<K, V>) {
    dbQuery {
      table.update({ table.id eq id }) { b ->
        entries.forEach {
          checkColumn(it.first)
          b[it.first as Column<Any>] = it.second as Any
        }
      }
    }
  }
  open suspend fun delete(id: I){
    dbQuery { table.deleteWhere { table.id eq id } }
  }
  open suspend fun any(where: SqlExpressionBuilder.() -> Op<Boolean>): Boolean {
    return dbQuery { table.selectAll().where(where).any() }
  }
  @Suppress("UNCHECKED_CAST")
  protected open fun queryRes(row: ResultRow): QueryRes {
    val res = QueryRes(row[table.id].value)
    row.fieldIndex.keys.forEach {
      res[it as Expression<Any>] = row[it]
    }
    return res
  }
}

class TimeStamp: ColumnType<String>(false){
  override fun sqlType(): String {
    return "TIMESTAMP"
  }

  override fun valueFromDB(value: Any): String = value as String
}

fun Table.time(name: String) = registerColumn(name, TimeStamp())
