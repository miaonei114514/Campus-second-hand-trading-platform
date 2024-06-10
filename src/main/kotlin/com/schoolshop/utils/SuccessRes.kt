package com.schoolshop.utils

import kotlinx.serialization.Serializable

@Serializable
data class SuccessRes<T>(
  val code: Int,
  val obj: T?,
  val message: String? = null,
){
  val status = "success"
}
