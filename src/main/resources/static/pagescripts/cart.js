"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const components_1 = require("../scripts/components");
const jquery_1 = __importDefault(require("jquery"));
(0, jquery_1.default)("#topBar").wrapInner((0, components_1.buildTopBar)("cart"));
let loginUsr;
let elems;
jquery_1.default.get("usercontext", (res) => {
    if (res.status == "error")
        window.location.href = "/login";
    else {
        loginUsr = res.obj;
        jquery_1.default.get(`/get-cart/${loginUsr.id}`, (res) => {
            let str = "";
            for (let cartInfo of res.obj) {
                str += `
          <label for="goods-${cartInfo.id}" id="goods-block-${cartInfo.id}">
            <div class="write-back padding-box margin-hor flex pos-relative">
              <input type="checkbox" class="goods-selector" id="goods-${cartInfo.id}" content="${cartInfo.id}">
              <img id="img-${cartInfo.id}" src="" alt="loading..." class="small-preview fit-contain">
              <div class="margin-side pos-relative">
                <h4 id="title-${cartInfo.id}">...</h4>
                <div class="flex">
                  <h5>数量：</h5>
                  <div class="amount-input" content="small">
                    <button id="left-${cartInfo.id}" disabled="disabled">-</button>
                    <input id="amount-${cartInfo.id}" type="number" value="1" min="1" max="1">
                    <button id="right-${cartInfo.id}" disabled="disabled">+</button>
                  </div>
                  <h5 id="rem-${cartInfo.id}">（库存 0 件）</h5>
                </div>
                <h3 class="price bottom left pos-absolute" id="price-${cartInfo.id}">...￥</h3>
              </div>
              
              <div class="top right pos-absolute padding-box">
                <button id="delete-${cartInfo.id}" class="btn" content="small"><img src="/assets/img/trash.png" class="icon" alt="删除"></button>
              </div>
            </div>
          </label>
        `;
                jquery_1.default.get(`/goods-info/${cartInfo.goods}`, (res) => {
                    if (res.status == "error") {
                        window.alert(res.message);
                        return;
                    }
                    let amount = (0, jquery_1.default)(`#amount-${cartInfo.id}`);
                    let n = Math.min(res.obj.reminded, cartInfo.amount);
                    amount.val(n);
                    amount.attr("max", res.obj.reminded);
                    if (n > 1)
                        (0, jquery_1.default)(`#left-${cartInfo.id}`).removeAttr("disabled");
                    if (n < res.obj.reminded)
                        (0, jquery_1.default)(`#right-${cartInfo.id}`).removeAttr("disabled");
                    (0, jquery_1.default)(`#goods-${cartInfo.id}`).attr("content", `{"id":${cartInfo.id}, "goods": ${cartInfo.goods},"amount":${res.obj.reminded},"price":${res.obj.price}}`);
                    (0, jquery_1.default)(`#img-${cartInfo.id}`).attr("src", `/goods-res/${cartInfo.goods}/preview.png`);
                    (0, jquery_1.default)(`#title-${cartInfo.id}`).text(res.obj.title);
                    (0, jquery_1.default)(`#rem-${cartInfo.id}`).text(`（库存 ${res.obj.reminded} 件）`);
                    (0, jquery_1.default)(`#price-${cartInfo.id}`).text(res.obj.price / 100 + "￥");
                });
            }
            (0, jquery_1.default)("#goods-list").wrapInner(str);
            elems = (0, jquery_1.default)(".goods-selector");
            for (let elem of elems) {
                let info = Number.parseInt(elem.getAttribute("content"));
                let amount = (0, jquery_1.default)(`#amount-${info}`);
                let left = (0, jquery_1.default)(`#left-${info}`);
                let right = (0, jquery_1.default)(`#right-${info}`);
                let del = (0, jquery_1.default)(`#delete-${info}`);
                amount.on("input", () => inputted(amount, left, right));
                left.on("click", () => delta(amount, left, right, false));
                right.on("click", () => delta(amount, left, right, true));
                del.on("click", () => (0, components_1.showConfirm)("要把这件商品从购物车中移除吗？", true, () => {
                    jquery_1.default.post("/remove-cart", { id: info }, (res) => {
                        if (res.status == "error")
                            (0, components_1.showConfirm)(res.message);
                        else
                            (0, jquery_1.default)(`#goods-block-${info}`).remove();
                    });
                }));
            }
            elems.on("change", e => changed());
        });
    }
});
let allSelect = (0, jquery_1.default)("#all-select");
allSelect.on("change", e => {
    if (allSelect.prop("checked")) {
        for (let e of elems) {
            let info = JSON.parse(e.getAttribute("content"));
            (0, jquery_1.default)(`#goods-${info.id}`).prop("checked", true);
        }
    }
    else {
        for (let e of elems) {
            let info = JSON.parse(e.getAttribute("content"));
            (0, jquery_1.default)(`#goods-${info.id}`).prop("checked", false);
        }
    }
    changed();
});
(0, jquery_1.default)("#maketrade").on("click", () => {
    let map = "";
    for (let element of elems) {
        if ((0, jquery_1.default)(element).prop("checked")) {
            let info = JSON.parse(element.getAttribute("content"));
            let amount = Number.parseInt((0, jquery_1.default)(`#amount-${info.id}`).val());
            map += `${info.goods}:${amount}|`;
        }
    }
    window.location.href = `/make-trade?goods=${map.substring(0, map.length - 1)}&clear-cart=true`;
});
function changed() {
    let total = 0;
    let totalPrice = 0;
    let allSelected = true;
    for (let element of elems) {
        if ((0, jquery_1.default)(element).prop("checked")) {
            let info = JSON.parse(element.getAttribute("content"));
            let amount = Number.parseInt((0, jquery_1.default)(`#amount-${info.id}`).val());
            total += amount;
            totalPrice += amount * info.price;
        }
        else
            allSelected = false;
    }
    (0, jquery_1.default)("#total").text(`已选 ${total} 件商品`);
    (0, jquery_1.default)("#total-price").text(totalPrice / 100 + "￥");
    allSelect.prop("checked", allSelected);
}
function delta(amount, left, right, isAdd) {
    let num = Number.parseInt(amount.val());
    let max = Number.parseInt(amount.attr("max"));
    if (isAdd) {
        amount.val(num + 1);
        num++;
        if (num >= max)
            right.attr("disabled", "disabled");
        if (num > 1)
            left.removeAttr("disabled");
    }
    else {
        amount.val(num - 1);
        num--;
        if (num <= 1)
            left.attr("disabled", "disabled");
        if (num < max)
            right.removeAttr("disabled");
    }
    changed();
}
function inputted(amount, left, right) {
    let num = Number.parseInt(amount.val());
    let max = Number.parseInt(amount.attr("max"));
    num = Math.min(Math.max(1, num), max);
    amount.val(num);
    if (num <= 1)
        left.attr("disabled", "disabled");
    if (num >= max)
        right.attr("disabled", "disabled");
    if (num > 1 && num < max) {
        left.removeAttr("disabled");
        right.removeAttr("disabled");
    }
    changed();
}
