import {buildGoodsList, buildScrollImg, buildSearch, buildTopBar} from "../scripts/components";
import {GoodsListResult, ImgInfo, Result} from "../scripts/types";
import $ from "jquery"

$("#topBar").wrapInner(buildTopBar("index", true))
$("#searchBar").wrapInner(buildSearch("searchHover"))
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

let loading: boolean;
let noMore: boolean;
let offset = 0;

buildShopList()

let search = $("#topsearch")
search.hide()
$(window).on("scroll", () => {
  let h = $(window).height()!;
  let st = $(window).scrollTop()!;
  if(st>80){
    search.show()
    $(".search-input").trigger("blur")
  }else if(st<80){
    search.hide()
  }

  if (!noMore && st > h - 20 && !loading){
    loading = true;

    buildShopList()
  }
});

function buildShopList() {
  $.get("/goods-list", {offset: offset, amount: 24}, (res: Result<GoodsListResult>) => {
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
