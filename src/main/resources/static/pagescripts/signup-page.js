(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
$("#signup-action").on("click", () => {
    let form = {
        name: $("#name").val(),
        email: $("#email").val(),
        password: $("#password").val(),
        confirm: $("#confirm-password").val()
    };
    if (form.password !== form.confirm) {
        let err = $("#error");
        err.empty();
        err.wrapInner("<h5>两次输入的密码不一致</h5>");
        err.show();
        return;
    }
    $.post("/register", form, (res) => {
        if (res.status === "success") {
            document.location.href = "/";
        }
        else {
            let err = $("#error");
            err.empty();
            err.wrapInner(`<h5>${res.code == 0 ? "用户名格式不正确" :
                res.code == 1 ? "邮箱格式不正确" :
                    res.code == 2 ? "密码格式不正确" :
                        res.code == 3 ? "此用户名已被注册" :
                            res.code == 4 ? "此邮箱已被注册" :
                                res.message}</h5>`);
            err.show();
        }
    });
});

},{}]},{},[1]);
