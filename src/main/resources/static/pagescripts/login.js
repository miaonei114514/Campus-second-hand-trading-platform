"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jquery_1 = __importDefault(require("jquery"));
(0, jquery_1.default)("#login-active").on("click", () => {
    let form = {
        name: (0, jquery_1.default)("#name").val(),
        password: (0, jquery_1.default)("#password").val()
    };
    //encrypt(form, enced => {
    jquery_1.default.post("/login", form, (res) => {
        if (res.status === "success") {
            document.location.href = "/";
        }
        else {
            let err = (0, jquery_1.default)("#error");
            err.empty();
            err.wrapInner(`<h5>${res.code == 0 ? "用户名不正确" :
                res.code == 1 ? "此用户名不存在" :
                    res.code == 2 ? "密码错误" :
                        res.message}</h5>`);
            err.show();
        }
    });
    //})
});
