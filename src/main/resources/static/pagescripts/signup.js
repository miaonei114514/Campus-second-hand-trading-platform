"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jquery_1 = __importDefault(require("jquery"));
(0, jquery_1.default)("#signup-action").on("click", () => {
    let form = {
        name: (0, jquery_1.default)("#name").val(),
        email: (0, jquery_1.default)("#email").val(),
        password: (0, jquery_1.default)("#password").val(),
        confirm: (0, jquery_1.default)("#confirm-password").val()
    };
    if (form.password !== form.confirm) {
        let err = (0, jquery_1.default)("#error");
        err.empty();
        err.wrapInner("<h5>两次输入的密码不一致</h5>");
        err.show();
        return;
    }
    jquery_1.default.post("/register", form, (res) => {
        if (res.status === "success") {
            document.location.href = "/";
        }
        else {
            let err = (0, jquery_1.default)("#error");
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
