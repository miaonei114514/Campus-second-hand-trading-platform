import {Result} from "../scripts/types";
import $ from "jquery"

$("#login-active").on("click", () => {
  let form = {
    name: $("#name").val(),
    password: $("#password").val()
  }

  //encrypt(form, enced => {
    $.post("/login", form, (res: Result) => {
      if (res.status === "success") {
        document.location.href = "/"
      }
      else {
        let err = $("#error")
        err.empty()
        err.wrapInner(`<h5>${
            res.code == 0? "用户名不正确":
            res.code == 1? "此用户名不存在":
            res.code == 2? "密码错误":
            res.message
        }</h5>`)
        err.show()
      }
    })
  //})

})