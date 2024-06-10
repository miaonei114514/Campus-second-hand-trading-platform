import {buildGoodsList, buildScrollImg, buildSearch, buildTopBar} from "../scripts/components";
import {GoodsListResult, ImgInfo, Result} from "../scripts/types";
import $ from "jquery"
import {receiveParameters} from "../scripts/utils";

const args = receiveParameters<{searching: boolean, search: string | null, tags: string | null}>()

$("#topBar").wrapInner(buildTopBar("index", true, args.search || ""))
$("#searchBar").wrapInner(buildSearch("searchHover", args.search || ""))
if (args.searching) $("#title").text("搜索结果")

if (args.searching){
  $("#recommend-box").hide()
}
else {
  $("#recommend").wrapInner(buildScrollImg([
      new ImgInfo("/assets/img/top1.png", "1"),
      new ImgInfo("/assets/img/top2.png", "2"),
      new ImgInfo("", "3"),
      new ImgInfo("", "4"),
      new ImgInfo("", "5"),
      new ImgInfo("", "6"),
      new ImgInfo("", "7"),
      new ImgInfo("", "8"),
  ]))
}

let loading: boolean;
let noMore: boolean;
let offset = 0;

buildShopList()

let search = $("#topsearch")
search.hide()
$(window).on("scroll", () => {
  let h = $("#shop-list").height()! - $(window).height()!;
  let st = $(window).scrollTop()!;
  if(st>80){
    search.show()
    $(".search-input").trigger("blur")
  }else if(st<80){
    search.hide()
  }

  if (!noMore && st > h && !loading){
    loading = true;

    buildShopList()
  }
});

function buildShopList() {
  $.get("/goods-list",
      {
        offset: offset,
        amount: 24,
        search: (args.search != null? args.search: undefined),
        tags: (args.tags != null? args.tags: undefined)
      },
      (res: Result<GoodsListResult>) => {
    if (res.status == "error") {
      alert(res.message)
      loading = false;
    }
    else{
      loading = false;
      if (res.code == 0) {
        $("#shop-list").append(buildGoodsList(res.obj.list))
        offset = res.obj.end + 1
        noMore = res.obj.noMore
      }
      else loading = true;
    }
  })
}

$(".history").wrapInner(`
<h5>搜索历史</h5>
`)

$("#back-top").on("click", () => {
  $('html,body').animate({scrollTop:"0"}, 800)
})
