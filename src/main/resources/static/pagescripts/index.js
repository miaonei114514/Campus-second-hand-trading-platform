"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const components_1 = require("../scripts/components");
const types_1 = require("../scripts/types");
const jquery_1 = __importDefault(require("jquery"));
const utils_1 = require("../scripts/utils");
const args = (0, utils_1.receiveParameters)();
(0, jquery_1.default)("#topBar").wrapInner((0, components_1.buildTopBar)("index", true, args.search || ""));
(0, jquery_1.default)("#searchBar").wrapInner((0, components_1.buildSearch)("searchHover", args.search || ""));
if (args.searching)
    (0, jquery_1.default)("#title").text("搜索结果");
if (args.searching) {
    (0, jquery_1.default)("#recommend-box").hide();
}
else {
    (0, jquery_1.default)("#recommend").wrapInner((0, components_1.buildScrollImg)([
        new types_1.ImgInfo("/assets/img/top1.png", "1"),
        new types_1.ImgInfo("/assets/img/top2.png", "2"),
        new types_1.ImgInfo("", "3"),
        new types_1.ImgInfo("", "4"),
        new types_1.ImgInfo("", "5"),
        new types_1.ImgInfo("", "6"),
        new types_1.ImgInfo("", "7"),
        new types_1.ImgInfo("", "8"),
    ]));
}
let loading;
let noMore;
let offset = 0;
buildShopList();
let search = (0, jquery_1.default)("#topsearch");
search.hide();
(0, jquery_1.default)(window).on("scroll", () => {
    let h = (0, jquery_1.default)("#shop-list").height() - (0, jquery_1.default)(window).height();
    let st = (0, jquery_1.default)(window).scrollTop();
    if (st > 80) {
        search.show();
        (0, jquery_1.default)(".search-input").trigger("blur");
    }
    else if (st < 80) {
        search.hide();
    }
    if (!noMore && st > h && !loading) {
        loading = true;
        buildShopList();
    }
});
function buildShopList() {
    jquery_1.default.get("/goods-list", {
        offset: offset,
        amount: 24,
        search: (args.search != null ? args.search : undefined),
        tags: (args.tags != null ? args.tags : undefined)
    }, (res) => {
        if (res.status == "error") {
            alert(res.message);
            loading = false;
        }
        else {
            loading = false;
            if (res.code == 0) {
                (0, jquery_1.default)("#shop-list").append((0, components_1.buildGoodsList)(res.obj.list));
                offset = res.obj.end + 1;
                noMore = res.obj.noMore;
            }
            else
                loading = true;
        }
    });
}
(0, jquery_1.default)(".history").wrapInner(`
<h5>搜索历史</h5>
`);
(0, jquery_1.default)("#back-top").on("click", () => {
    (0, jquery_1.default)('html,body').animate({ scrollTop: "0" }, 800);
});
