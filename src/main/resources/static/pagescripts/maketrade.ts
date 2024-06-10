import {buildTopBar, showConfirm} from "../scripts/components";

$("#topBar").wrapInner(buildTopBar())

function initTrades(goods: {id: number, amount: number}[]) {
  buildTrades(goods)
}

function buildTrades(goods: {id: number, amount: number}[]) {
  let res = "<h4>订单：</h4><h5 id='total'>共计 0 件商品</h5>";
  let total = 0;
  let totalPrice = 0;
  let n = goods.length
  for (let good of goods) {
    res += `
    <div class="write-back padding-box margin-hor flex">
      <div class="small-preview"><img id="img-${good.id}" src="" alt="loading..." class="description-img"></div>
      <div class="margin-side pos-relative">
        <h4 id="title-${good.id}">...</h4>
        <h5>数量：${good.amount}</h5>
        <h3 class="price bottom left" id="price-${good.id}">...￥</h3>
      </div>
    </div>`

    total += good.amount

    $.get(`/goods-info/${good.id}`, (res: Result<GoodsInfo>) => {
      if (res.status == "error"){
        window.alert(res.message)
        return
      }
      else if (res.obj.reminded < good.amount){
        showConfirm("非法操作", false)
        return
      }

      $(`#img-${good.id}`).attr("src", `/goods-res/${good.id}/preview.png`)
      $(`#title-${good.id}`).text(res.obj.title)
      $(`#price-${good.id}`).text(res.obj.price/100 + "￥")

      totalPrice += res.obj.price*good.amount
      n--
      if (n == 0) {
        $("#total").text(`总计 ${total} 件商品`)
        $(`#total-price`).text(totalPrice/100 + "￥")
      }
    })
  }

  res += `<h5>总计：</h5><h3 class="price" id="total-price">...￥</h3>`

  $("#goods-meta").html(res);
}


