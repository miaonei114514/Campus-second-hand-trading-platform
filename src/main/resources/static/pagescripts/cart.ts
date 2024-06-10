import {buildTopBar, showConfirm} from "../scripts/components";
import $ from "jquery";
import {CartInfo, GoodsInfo, Result, UserInfo} from "../scripts/types";

$("#topBar").wrapInner(buildTopBar("cart"))

let loginUsr: UserInfo
let elems: JQuery<HTMLElement>

$.get("usercontext", (res: Result<UserInfo>) => {
  if (res.status == "error") window.location.href = "/login";
  else {
    loginUsr = res.obj;

    $.get(`/get-cart/${loginUsr.id}`, (res: Result<CartInfo[]>) => {
      let str = ""

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
        `

        $.get(`/goods-info/${cartInfo.goods}`, (res: Result<GoodsInfo>) => {
          if (res.status == "error"){
            window.alert(res.message)
            return
          }

          let amount = $(`#amount-${cartInfo.id}`)
          let n = Math.min(res.obj.reminded, cartInfo.amount)
          amount.val(n)
          amount.attr("max", res.obj.reminded)
          if (n > 1) $(`#left-${cartInfo.id}`).removeAttr("disabled")
          if (n < res.obj.reminded) $(`#right-${cartInfo.id}`).removeAttr("disabled")
          $(`#goods-${cartInfo.id}`).attr("content", `{"id":${cartInfo.id}, "goods": ${cartInfo.goods},"amount":${res.obj.reminded},"price":${res.obj.price}}`)
          $(`#img-${cartInfo.id}`).attr("src", `/goods-res/${cartInfo.goods}/preview.png`)
          $(`#title-${cartInfo.id}`).text(res.obj.title)
          $(`#rem-${cartInfo.id}`).text(`（库存 ${res.obj.reminded} 件）`)
          $(`#price-${cartInfo.id}`).text(res.obj.price/100 + "￥")
        })
      }

      $("#goods-list").wrapInner(str)
      elems = $(".goods-selector")
      for (let elem of elems) {
        let info = Number.parseInt(elem.getAttribute("content")!)
        let amount = $(`#amount-${info}`)
        let left = $(`#left-${info}`)
        let right = $(`#right-${info}`)
        let del = $(`#delete-${info}`)

        amount.on("input", () => inputted(amount, left, right))
        left.on("click", () => delta(amount, left, right, false))
        right.on("click", () => delta(amount, left, right, true))
        del.on("click", () => showConfirm("要把这件商品从购物车中移除吗？", true, () => {
          $.post("/remove-cart", {id: info}, (res: Result) => {
            if (res.status == "error") showConfirm(res.message)
            else $(`#goods-block-${info}`).remove()
          })
        }))
      }

      elems.on("change", e => changed())
    })
  }
})

let allSelect = $("#all-select")
allSelect.on("change", e => {
  if (allSelect.prop("checked")){
    for (let e of elems){
      let info = <{id: number, goods: number, amount: number, price: number}>JSON.parse(e.getAttribute("content")!)
      $(`#goods-${info.id}`).prop("checked", true)
    }
  }
  else {
    for (let e of elems){
      let info = <{id: number, goods: number, amount: number, price: number}>JSON.parse(e.getAttribute("content")!)
      $(`#goods-${info.id}`).prop("checked", false)
    }
  }
  changed()
})

$("#maketrade").on("click", () => {
  let map = ""
  for (let element of elems) {
    if ($(element).prop("checked")){
      let info = <{id: number, goods: number, amount: number, price: number}>JSON.parse(element.getAttribute("content")!)
      let amount = Number.parseInt(<string>$(`#amount-${info.id}`).val())

      map += `${info.goods}:${amount}|`
    }
  }

  window.location.href = `/make-trade?goods=${map.substring(0, map.length - 1)}&clear-cart=true`
})

function changed(){
  let total = 0
  let totalPrice = 0

  let allSelected = true
  for (let element of elems) {
    if ($(element).prop("checked")){
      let info = <{id: number, amount: number, price: number}>JSON.parse(element.getAttribute("content")!)
      let amount = Number.parseInt(<string>$(`#amount-${info.id}`).val())
      total += amount
      totalPrice += amount * info.price
    }
    else allSelected = false
  }

  $("#total").text(`已选 ${total} 件商品`)
  $("#total-price").text(totalPrice/100 + "￥")
  allSelect.prop("checked", allSelected)
}

function delta(amount: JQuery<HTMLElement>, left: JQuery<HTMLElement>, right: JQuery<HTMLElement>, isAdd: boolean){
  let num = Number.parseInt(<string>amount.val())
  let max = Number.parseInt(<string>amount.attr("max"))

  if (isAdd){
    amount.val(num + 1);
    num++
    if (num >= max) right.attr("disabled", "disabled")
    if (num > 1) left.removeAttr("disabled")
  }
  else {
    amount.val(num - 1);
    num--
    if (num <= 1) left.attr("disabled", "disabled")
    if (num < max) right.removeAttr("disabled")
  }

  changed()
}

function inputted(amount: JQuery<HTMLElement>, left: JQuery<HTMLElement>, right: JQuery<HTMLElement>) {
  let num = Number.parseInt(<string>amount.val())
  let max = Number.parseInt(<string>amount.attr("max"))

  num = Math.min(Math.max(1, num), max)
  amount.val(num)

  if (num <= 1) left.attr("disabled", "disabled")
  if (num >= max) right.attr("disabled", "disabled")
  if (num > 1 && num < max) {
    left.removeAttr("disabled")
    right.removeAttr("disabled")
  }

  changed()
}
