"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const components_1 = require("../scripts/components");
const jquery_1 = __importDefault(require("jquery"));
const utils_1 = require("../scripts/utils");
(0, jquery_1.default)("#topBar").wrapInner((0, components_1.buildTopBar)("prof"));
let loginUsr;
function postDesc() {
    let desc = (0, jquery_1.default)("#desc-input").val();
    jquery_1.default.post("/update_user_info", { description: desc }, (res) => {
        if (res.status === "error")
            alert(res.message);
        else
            (0, components_1.showConfirm)("修改成功", false);
    });
}
let uid = (0, utils_1.receiveParameters)()["user-uid"];
jquery_1.default.get(`/usercontext${uid ? `/${uid}` : ""}`, (res) => {
    if (res.status === "error")
        window.location.replace("/login");
    else {
        if (res.code === 0) {
            loginUsr = res.obj;
            jquery_1.default.post(`/usercontext/delete/${loginUsr.id}/avatar-tmp.png`);
        }
        wrapUserMeta(res);
        if (res.code === 0) {
            wrapAddress(res);
            wrapOrders(res);
        }
        else {
            (0, jquery_1.default)("#address").hide();
            (0, jquery_1.default)("#orders").hide();
            (0, jquery_1.default)("#prof").removeClass("active");
        }
        wrapPublishies(res);
    }
});
function wrapUserMeta(res) {
    if (res.code === 0) { //self
        (0, jquery_1.default)("#user-meta").wrapInner(`
        <div class="flex pos-relative">
          <div class="pos-relative">
            <img src="/usercontext/${res.obj.id}/avatar.png" alt="avatar" id="avatar" class="avatar">
            <br>
            <button class="file-select center-hor">
              <h5>上传头像</h5>
              <input type="file" accept="image/png,image/jpg,image/jpeg" name="" id="upload-avatar">
            </button>
          </div>
          <div class="padding-box">
            <div class="flex">
              <div id="nickname-box">
                <h3 id="nickname">${res.obj.displayName ? res.obj.displayName : res.obj.name}</h3>
              </div>
              <button id="edit-nick" class="btn" content="small"><img src="/img/pencil.png" class="icon" alt="icon"></button>
            </div>
            <h5 id="username" class="gray">@${res.obj.name}</h5>
          </div>
          <button id="logout" class="btn topnote" content="small">登出</button>
        </div>
        
        <div class="desc-edit">
          <b>个人简介</b>
          <div class="description-bar padding-box">
            <textarea spellcheck="false" maxlength="200" id="desc-input" class="editor no-back">${res.obj.description ? res.obj.description : "这个人很懒，什么也没写"}</textarea>
            <h5 id="words" class="gray footnote hidden">字数：${res.obj.description ? res.obj.description.length : 11}/200</h5>
          </div>
          <button class="btn margin-box" id="post" content="small">更新简介</button>
        </div>
      `);
        (0, jquery_1.default)("#post").on("click", () => postDesc());
        (0, jquery_1.default)("#logout").on("click", () => {
            (0, components_1.showConfirm)("确认登出？", true, () => {
                jquery_1.default.post('/logout', res => {
                    if (res.status === "error")
                        return alert(res.message);
                    window.location.replace("/login");
                });
            });
        });
        (0, jquery_1.default)("#upload-avatar").on("change", function () {
            let inp = (0, jquery_1.default)(this);
            let file = inp[0].files[0];
            (0, utils_1.readFile)(file, true, (res) => {
                (0, components_1.showCropper)(res, 1, "1 : 1", (crop) => {
                    crop.toBlob(b => {
                        (0, utils_1.putBlob)(`/usercontext/${loginUsr.id}/avatar.png`, b, (r) => {
                            (0, jquery_1.default)("#avatar").attr("src", `/usercontext/${loginUsr.id}/avatar.png?${Math.random()}`);
                            (0, components_1.showConfirm)("上传成功", false);
                        });
                    });
                }, () => {
                });
            });
        });
        let box = (0, jquery_1.default)("#nickname-box");
        let btn = (0, jquery_1.default)("#edit-nick");
        let status = true;
        btn.on("click", () => {
            if (status) {
                box.empty();
                box.wrapInner(`<input id="name-input" class="underline-input" value="${res.obj.displayName ? res.obj.displayName : ""}" placeholder="未设置">`);
                (0, jquery_1.default)("#nickname-box>img").attr("src", "/img/ensure.png");
                status = false;
            }
            else {
                let name = (0, jquery_1.default)("#name-input").val();
                jquery_1.default.post("/update_user_info", { displayName: name }, (res) => {
                    if (res.status === "error") {
                        window.alert(res.message);
                    }
                    else {
                        box.empty();
                        box.wrapInner(`<h3 id="nickname">${res.obj.displayName ? res.obj.displayName : res.obj.name}</h3>`);
                        (0, jquery_1.default)("#nickname-box>img").attr("src", "/img/pencil.png");
                        status = true;
                    }
                });
            }
        });
        (0, components_1.relativeWords)((0, jquery_1.default)("#desc-input"), (0, jquery_1.default)("#words"), 500);
    }
    else { //visitor, display only
        (0, jquery_1.default)("#user-meta").wrapInner(`
        <div class="flex">
          <img src="/usercontext/${res.obj.id}/avatar.png" alt="avatar" id="avatar" class="avatar">
          <div class="padding-box">
            <h3 id="nickname">${res.obj.displayName ? res.obj.displayName : res.obj.name}</h3>
            <h5 id="username" class="gray">@${res.obj.name}</h5>
          </div>
        </div>
        <b>个人简介</b>
        <pre class="description-bar padding-box">${res.obj.description ? res.obj.description : "这个人很懒，什么也没写"}</pre>
      `);
    }
}
function wrapAddress(usrRes) {
    jquery_1.default.get(`/user-address/${usrRes.obj.id}`, (res) => {
        let addressBox = (0, jquery_1.default)("#address");
        let build = "";
        for (let address of res.obj) {
            build += (0, components_1.buildAddressItem)(address);
            (0, jquery_1.default)(() => {
                (0, jquery_1.default)(`#delete-${address.id}`).on("click", () => {
                    (0, components_1.showConfirm)("要删除这个地址记录吗？", true, () => {
                        jquery_1.default.post(`/delete-address/${usrRes.obj.id}`, { "address-id": address.id }, (r) => {
                            if (res.status == "error")
                                (0, components_1.showConfirm)(r.message);
                            else {
                                addressBox.empty();
                                wrapAddress(usrRes);
                            }
                        });
                    });
                });
            });
        }
        if (res.obj.length == 0)
            build += `<h4>未添加收货地址</h4>`;
        build += `<button id="add-new" class="btn margin-hor">添加新地址</button>`;
        addressBox.wrapInner(`
      <h5>管理我的收货地址</h5>
      ${build}
      <div id="edit-box" class="hidden">
        ${(0, components_1.buildAddressEditor)("addr-edit")}
        <div class="flex margin-hor">
          <button id="save-address" class="btn">保存</button>
          <button id="cancel-add" class="btn">取消</button>
        </div>
      </div>
    `);
        let editBox = (0, jquery_1.default)("#edit-box");
        editBox.hide();
        (0, jquery_1.default)("#add-new").on("click", () => {
            (0, jquery_1.default)("#edit-box").show();
            (0, jquery_1.default)("#add-new").hide();
        });
        (0, jquery_1.default)(".address-box").on("change", (e) => {
            jquery_1.default.post(`/set-default-address/${usrRes.obj.id}`, {
                "address-id": e.currentTarget.getAttribute("value")
            }, res => {
                if (res.status == "error")
                    (0, components_1.showConfirm)(res.message);
            });
        });
        (0, jquery_1.default)("#save-address").on("click", () => {
            let from = (0, jquery_1.default)("#addr-edit");
            let t = from.serializeArray();
            let str = "{";
            jquery_1.default.each(t, function () {
                if (str != "{")
                    str += ",";
                str += `"${this.name}":"${this.value}"`;
            });
            str += "}";
            jquery_1.default.post("/user-address", JSON.parse(str), (res) => {
                if (res.status == "error")
                    (0, components_1.showConfirm)(res.message);
                else {
                    addressBox.empty();
                    wrapAddress(usrRes);
                }
            });
        });
        (0, jquery_1.default)("#cancel-add").on("click", () => {
            editBox.hide();
            (0, jquery_1.default)("#add-new").show();
        });
    });
}
function wrapOrders(res) {
    (0, jquery_1.default)("#orders").wrapInner(`
    
  `);
}
function wrapPublishies(res) {
    jquery_1.default.get(`/usercontext/publich-goods/${res.obj.id}`, (res) => {
        if (res.status == "error") {
            window.alert(res.message);
            return;
        }
        let goods = res.obj.length == 0 ? "<h4>这里什么都没有...</h4>" : (0, components_1.buildGoodsList)(res.obj);
        (0, jquery_1.default)("#published").wrapInner(`
    <h5>发布的商品</h5>
    <div class="flex">${goods}</div>
    `);
    });
}
