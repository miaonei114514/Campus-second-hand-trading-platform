package com.schoolshop.utils

import kotlinx.serialization.Serializable

@Serializable
data class ErrorRes(
  val code: Int = -1,
  val message: String? = null
){
  val status = "error"
}
