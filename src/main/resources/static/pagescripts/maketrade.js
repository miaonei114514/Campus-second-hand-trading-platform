"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const components_1 = require("../scripts/components");
const jquery_1 = __importDefault(require("jquery"));
const utils_1 = require("../scripts/utils");
(0, jquery_1.default)("#topBar").wrapInner((0, components_1.buildTopBar)());
let addressBox = (0, jquery_1.default)("#address");
buildTrades((0, utils_1.receiveParameters)());
buildAddress();
function buildTrades(args) {
    let goods = args["good-map"];
    if (goods.length === 0) {
        (0, components_1.showConfirm)("非法操作：购物车为空");
        return;
    }
    let res = "<h4>订单：</h4><h5 id='total'>共计 0 件商品</h5>";
    let total = 0;
    let totalPrice = 0;
    let n = goods.length;
    for (let good of goods) {
        res += `
    <div class="write-back padding-box margin-hor flex">
      <img id="img-${good.id}" src="" alt="loading..." class="small-preview fit-contain">
      <div class="margin-side pos-relative">
        <h4 id="title-${good.id}">...</h4>
        <h5>数量：${good.amount}</h5>
        <h3 class="price bottom left" id="price-${good.id}">...￥</h3>
      </div>
    </div>`;
        total += good.amount;
        jquery_1.default.get(`/goods-info/${good.id}`, (res) => {
            if (res.status == "error") {
                window.alert(res.message);
                return;
            }
            else if (res.obj.reminded < good.amount) {
                (0, components_1.showConfirm)("非法操作", false);
                return;
            }
            (0, jquery_1.default)(`#img-${good.id}`).attr("src", `/goods-res/${good.id}/preview.png`);
            (0, jquery_1.default)(`#title-${good.id}`).text(res.obj.title);
            (0, jquery_1.default)(`#price-${good.id}`).text(res.obj.price / 100 + "￥");
            totalPrice += res.obj.price * good.amount;
            n--;
            if (n == 0) {
                (0, jquery_1.default)("#total").text(`总计 ${total} 件商品`);
                (0, jquery_1.default)(`#total-price`).text(totalPrice / 100 + "￥");
            }
        });
    }
    res += `<h5>总计：</h5><h3 class="price" id="total-price">...￥</h3>`;
    (0, jquery_1.default)("#goods-meta").html(res);
}
function buildAddress() {
    jquery_1.default.get("/usercontext", (usrRes) => {
        jquery_1.default.get(`/default-address/${usrRes.obj.id}`, (res) => {
            if (res.status == "error") {
            }
            else {
                addressBox.wrapInner(`
          <h5>选择收货地址</h5>
          <div id="def-addr" class="address-item">
            ${(0, components_1.buildAddressItem)(res.obj, false)}
          </div>
          <div id="addr-list" class="hidden"></div>
          <button id="unfold-toggle" class="btn">展开所有</button>
          <button id="fold-toggle" class="btn hidden">收起</button>
        `);
                (0, jquery_1.default)("#unfold-toggle").on("click", () => {
                    jquery_1.default.get(`/user-address/${usrRes.obj.id}`, (res) => {
                        let build = "";
                        let map = new Map();
                        for (let address of res.obj) {
                            map.set(address.id.toString(), address);
                            build += (0, components_1.buildAddressItem)(address, false);
                        }
                        build += `<button id="add-new" class="btn margin-hor">编辑收货地址</button>`;
                        let list = (0, jquery_1.default)("#addr-list");
                        list.empty();
                        list.wrapInner(build);
                        list.show();
                        (0, jquery_1.default)("#def-addr").hide();
                        (0, jquery_1.default)("#add-new").on("click", () => {
                            //todo
                        });
                        (0, jquery_1.default)(".address-box").on("change", (e) => {
                            let def = (0, jquery_1.default)("#def-addr");
                            def.empty();
                            def.wrapInner((0, components_1.buildAddressItem)(map.get(e.currentTarget.getAttribute("value")), false));
                        });
                        (0, jquery_1.default)("#unfold-toggle").hide();
                        (0, jquery_1.default)("#fold-toggle").show();
                    });
                });
                (0, jquery_1.default)("#fold-toggle").on("click", () => {
                    (0, jquery_1.default)("#addr-list").hide();
                    (0, jquery_1.default)("#def-addr").show();
                    (0, jquery_1.default)("#unfold-toggle").show();
                    (0, jquery_1.default)("#fold-toggle").hide();
                });
            }
        });
    });
}
