import {Result} from "../scripts/types";
import $ from "jquery"

$("#signup-action").on("click", () => {
  let form = {
    name: $("#name").val(),
    email: $("#email").val(),
    password: $("#password").val(),
    confirm: $("#confirm-password").val()
  }

  if (form.password !== form.confirm) {
    let err = $("#error")
    err.empty()
    err.wrapInner("<h5>两次输入的密码不一致</h5>")
    err.show()
    return
  }

  $.post("/register", form, (res: Result) => {
    if(res.status === "success") {
      document.location.href = "/"
    }
    else {
      let err = $("#error")
      err.empty()
      err.wrapInner(`<h5>${
        res.code == 0? "用户名格式不正确":
        res.code == 1? "邮箱格式不正确":
        res.code == 2? "密码格式不正确":
        res.code == 3? "此用户名已被注册":
        res.code == 4? "此邮箱已被注册":
        res.message
      }</h5>`)
      err.show()
    }
  })
})