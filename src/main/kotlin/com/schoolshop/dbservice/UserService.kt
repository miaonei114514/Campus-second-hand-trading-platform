package com.schoolshop.dbservice

import com.schoolshop.dbservice.Users.assignTime
import com.schoolshop.dbservice.Users.displayName
import com.schoolshop.dbservice.Users.email
import com.schoolshop.dbservice.Users.name
import com.schoolshop.dbservice.Users.passwordHash
import com.schoolshop.dbservice.Users.uid
import com.schoolshop.plugins.database
import org.jetbrains.exposed.dao.id.IntIdTable
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.transaction
import java.text.DateFormat
import java.text.SimpleDateFormat
import java.util.*

//User Info
data class User(
  var id: Int? = null,
  var uid: String? = null,

  val name: String? = null,
  val email: String? = null,
  var passwordHash: String? = null,
  var displayName: String? = null,
  var assignTime: Date? = null
)

object Users : IntIdTable() {
  val uid = varchar("uid", length = 24).nullable() //aaaa-aaaa-aa-aaaa-aaaaaa //afterInit
  val name = varchar("name", length = 50)
  val email = varchar("email", length = 50)

  val assignTime = time("assignTime")
    .defaultExpression(object : Expression<String>(){
      override fun toQueryBuilder(queryBuilder: QueryBuilder) {
        queryBuilder.append("CURRENT_TIMESTAMP()")
      }
    })
  val displayName = varchar("displayName", length = 50).nullable()

  val passwordHash = varchar("passwordHash", length = 128)
}

val userService: UserService by lazy { transaction(database) { UserService(database) } }

val hexArr = arrayOf('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f')
const val uidTemplate = "####-####-##-####-######"
private fun genUID(res: Int): String {
  val rand = java.util.Random(res.toLong())

  val builder = StringBuilder()
  for (c in uidTemplate) {
    builder.append(if (c == '-') c else hexArr[rand.nextInt(16)])
  }

  return builder.toString()
}

class UserService(database: Database): DatabaseService<User, Int> {
  init {
    transaction(database) {
      SchemaUtils.create(Users)
    }
  }

  override suspend fun create(user: User): Int{
    val res = dbQuery {
      Users.insert {
        it[name] = user.name!!
        it[email] = user.email!!
        it[passwordHash] = user.passwordHash!!
        if (user.displayName != null) it[displayName] = user.displayName!!
      }[Users.id].value
    }

    user.id = res
    user.uid = genUID(res)

    dbQuery {
      Users.update ({ Users.id eq res }) {
        it[uid] = user.uid!!
      }
    }

    return res
  }

  override suspend fun read(id: Int): User? {
    return dbQuery {
      Users.select { Users.id eq id }
        .map {
          User(
            it[Users.id].value,
            it[uid],
            it[name],
            it[email],
            it[passwordHash],
            it[displayName],
            DateFormat.getDateTimeInstance().parse(it[assignTime])
          )
        }
        .singleOrNull()
    }
  }

  override suspend fun any(where: SqlExpressionBuilder.() -> Op<Boolean>): Boolean{
    return dbQuery {
      Users.select(where).count()
    } > 0
  }

  override suspend fun filter(where: SqlExpressionBuilder.() -> Op<Boolean>): List<User>{
    return dbQuery {
      Users.select(where).map {
        User(
          it[Users.id].value,
          it[uid],
          it[name],
          it[email],
          it[passwordHash],
          it[displayName],
          DateFormat.getDateTimeInstance().parse(it[assignTime])
        )
      }
    }.toList()
  }

  override suspend fun find(where: SqlExpressionBuilder.() -> Op<Boolean>): User? {
    return dbQuery {
      Users.select(where).map {
        User(
          it[Users.id].value,
          it[uid],
          it[name],
          it[email],
          it[passwordHash],
          it[displayName],
          SimpleDateFormat("yyyy.MM.dd HH:mm:ss").parse(it[assignTime])
        )
      }
    }.singleOrNull()
  }

  override suspend fun <T> update(id: Int, vararg entries: Pair<Column<T>, T>) {
    dbQuery {
      Users.update({ Users.id eq id }) { b ->
        entries.forEach { b[it.first] = it.second }
      }
    }
  }

  override suspend fun update(user: User) {
    dbQuery {
      Users.update({ Users.id eq user.id!! }) {
        if (user.displayName != null) it[displayName] = user.displayName!!
        if (user.passwordHash != null) it[passwordHash] = user.passwordHash!!
      }
    }
  }

  override suspend fun delete(id: Int) {
    dbQuery {
      Users.deleteWhere { Users.id.eq(id) }
    }
  }
}
