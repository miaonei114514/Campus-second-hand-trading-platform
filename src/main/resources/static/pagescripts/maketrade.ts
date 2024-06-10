import {buildAddressEditor, buildAddressItem, buildTopBar, showConfirm} from "../scripts/components";
import {AddressInfo, GoodsInfo, Result, UserInfo} from "../scripts/types";
import $ from "jquery"
import {receiveParameters} from "../scripts/utils";

$("#topBar").wrapInner(buildTopBar())

let addressBox = $("#address")

buildTrades(receiveParameters<{"good-map": {id: number, amount: number}[], "clear-cart": boolean}>())
buildAddress()

function buildTrades(args: {"good-map": {id: number, amount: number}[], "clear-cart": boolean}) {
  let goods = args["good-map"]
  if (goods.length === 0){
    showConfirm("非法操作：购物车为空")
    return
  }

  let res = "<h4>订单：</h4><h5 id='total'>共计 0 件商品</h5>"
  let total = 0
  let totalPrice = 0
  let n = goods.length
  for (let good of goods) {
    res += `
    <div class="write-back padding-box margin-hor flex">
      <img id="img-${good.id}" src="" alt="loading..." class="small-preview fit-contain">
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

function buildAddress(){
  $.get("/usercontext", (usrRes: Result<UserInfo>) => {
    $.get(`/default-address/${usrRes.obj.id}`, (res: Result<AddressInfo>) => {
      if (res.status == "error"){

      }
      else {
        addressBox.wrapInner(`
          <h5>选择收货地址</h5>
          <div id="def-addr" class="address-item">
            ${buildAddressItem(res.obj, false)}
          </div>
          <div id="addr-list" class="hidden"></div>
          <button id="unfold-toggle" class="btn">展开所有</button>
          <button id="fold-toggle" class="btn hidden">收起</button>
        `)

        $("#unfold-toggle").on("click", () => {
          $.get(`/user-address/${usrRes.obj.id}`, (res: Result<AddressInfo[]>) => {

            let build = ""
            let map = new Map<string, AddressInfo>()
            for (let address of res.obj) {
              map.set(address.id.toString(), address)
              build += buildAddressItem(address, false)
            }

            build += `<button id="add-new" class="btn margin-hor">编辑收货地址</button>`

            let list = $("#addr-list")
            list.empty()
            list.wrapInner(build)
            list.show()
            $("#def-addr").hide()

            $("#add-new").on("click", () => {
              //todo
            })

            $(".address-box").on("change", (e) => {
              let def = $("#def-addr")
              def.empty()
              def.wrapInner(buildAddressItem(map.get(e.currentTarget.getAttribute("value")!)!, false))
            })

            $("#unfold-toggle").hide()
            $("#fold-toggle").show()
          })
        })

        $("#fold-toggle").on("click", () => {
          $("#addr-list").hide()
          $("#def-addr").show()
          $("#unfold-toggle").show()
          $("#fold-toggle").hide()
        })
      }
    })
  })
}
