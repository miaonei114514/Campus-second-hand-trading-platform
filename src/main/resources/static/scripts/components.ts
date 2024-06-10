import $ from "jquery"
import {AddressInfo, GoodsInfo, ImgInfo} from "./types";
import Cropper from "cropperjs";

export function buildSearch(id: string, searchDefault: string = "") {
  $(document).on("click", function () {
    let search = $(`#${id}`)
    search.on("focus", function () {
      $(`#${id}-menu`).show()
    })

    search.on("blur", function () {
      $(`#${id}-menu`).hide()
    })
  })

  $(() => {
    $("#toggle-" + id).on("click", () => {
      window.location.href = `/?search=${$("#" + id).val()}`
    })
  })

  return (`
    <div class="searchBar">
        <img src="/img/zoom.png" alt="">
        <input type="text" id="${id}" class="search-input" placeholder="输入关键字以搜索" value="${searchDefault}">
        <button id="toggle-${id}" class="btn search">搜索</button>
    </div>
    <div class="searchMenu" id="${id}-menu">
        <div>
            <div id="${id}-history" class="flexList history"></div>
            <div class="horLine"></div>
            <div class="flex">
                <div id="categoryList" class="listCont">
                </div>
                <div class="vertLine"></div>
                <div id="subCategory" class="box">
                </div>
            </div>
        </div>
    </div> 
  `)
}

export function buildTopBar(curr: string = "", search: boolean = false, searchDefault: string = "") {
  return (`
  <div class="topbar">
    <h2>Logo</h2>
    <nav>
      <a href="/" class="btn ${curr === "index" ? "active" : ""}">首页</a>
      <a href="/message" class="btn ${curr === "mess" ? "active" : ""}">消息</a>
      <a href="/cart" class="btn ${curr === "cart" ? "active" : ""}">购物车</a>
      <a href="/profile" class="btn ${curr === "prof" ? "active" : ""}">个人主页</a>
    </nav>
    
    ${search ? `<div id="topsearch">${buildSearch("topbarHover", searchDefault)}</div>` : ''}
  </div>
`)
}

export function buildScrollImg(list: ImgInfo[]) {
  let ls = "<div class='scroll-img-item' style='width: 300px'></div>"
  for (let item of list) {
    ls += `
    <div class="scroll-img-item">
      <div>
        <img src="${item.preview}" alt="${item.alt}" class="pos-relative">
        <div class=""></div>
      </div>
    </div>
    `
  }
  ls += "<div class='scroll-img-item' style='width: 300px'></div>"

  $(() => {
    const list = $(".scroll-img")
    list.on("wheel", function (event) {
      event.currentTarget.scrollLeft -= (<{ wheelDelta: number }><unknown>event.originalEvent).wheelDelta;
      event.preventDefault();
    })
  })

  return (`
    <div class="scroll-img">
        ${ls}
    </div>
  `)
}

export function buildGoods(goods: GoodsInfo) {
  return (`
  <div class="goods-preview" onclick="window.location.href='/goods/${goods.id}'">
    <img src="/goods-res/${goods.id}/preview.png" alt="preview">
    <div>
      <h5 class="overflow-hide">${goods.title}</h5>
      <h4 class="price">${(goods.price / 100).toFixed(2)}￥</h4>
    </div>
  </div>  
`)
}

export function buildAddressEditor(id: string){
  return `
    <div>
      <h5>填写收货人信息</h5>
      <form id="${id}">
        <label for="receiver" class="lab">收货人</label><input id="receiver" name="receiver" type="text" class="def-input" placeholder="收货人姓名">
        <label for="phone" class="lab">电话</label><input id="phone" name="phone" type="tel" class="def-input" placeholder="收货人电话">
        <label for="address" class="lab">收货地点</label><div class="margin-hor padding-box write-back">
          <textarea id="address" name="address" class="editor"></textarea>
        </div>
      </form>
    </div>
  `
}

export function buildAddressItem(address: AddressInfo, buildDelete: boolean = true) {
  return (`
    <label for="add-${address.id}">
      <div class="write-back padding-box margin-hor flex pos-relative">
        <input id="add-${address.id}" type="radio" name="address" class="address-box" value="${address.id}" ${address.isDefault ? "checked='true'" : ""}>
        <div class="margin-side">
          <h5>收货人姓名：${address.receiverName}</h5>
          <h5>电话号码：${address.phone}</h5>
          <h5>收货地：</h5>
          <h5>${address.address}</h5>
        </div>
        
        ${buildDelete? `<div class="top right pos-absolute padding-box">
          <button id="delete-${address.id}" class="btn" content="small"><img src="/assets/img/trash.png" class="icon" alt="删除"></button>
        </div>`: ""}
      </div>
    </label>
  `);
}

export function showConfirm(title: string, type: boolean = false, resCallback: (() => void) | undefined = undefined, cancelText: string = "取消", ensureText: string = "确定") {
  $('body').append(`
    <div class="cover">
      <div class="confirmbox">
        <div class="line1"> ${title} </div>
        <div class="line2">
          ${type ? `
              <span class="cancel conf_btn" id="cancel" style="width: 50%"> ${cancelText} </span>
              <span class="sure conf_btn" id="sure" style="width: 50%"> ${ensureText} </span>`
        : `<span class="ok conf_btn" id="sure" style="width: 100%"> ${ensureText} </span>`}
        </div>
      </div>
    </div>
  `)
  $('.cover').show();

  $('#cancel').on("click", function () {
    $('.cover').remove();
  });
  $('#sure').on("click", function () {
    $('.cover').remove();
    if (resCallback) resCallback();
  });
}

export function showCropper(img: string, aspectRatio: number, ratioStr: string | null, callback: (img: HTMLCanvasElement) => void, cancel: (() => void) | null = null) {
  $('body').append(`
    <div class="cropper-cover">
      <div>
        <div class="back cropper-img margin-side">
          <div class="bar">
            <img src="${img}" id="cropimg" alt="" class="cropper-can" style="aspect-ratio: ${aspectRatio}"> 
          </div>
        </div>
        <div class="back margin-box pos-relative padding-box">
          <h5>裁切预览</h5>
          <div class="flex">
            <div class="cropper-preview" style="aspect-ratio: ${aspectRatio}"></div>
            <div class="margin-side">
              <h5 id="img-size">图片尺寸：</h5>   
            </div>
          </div>
          
          <div class="bottom right pos-absolute flex padding-box">
            <button class="btn" id="crop-cancel" style="width: 72px">取消</button>
            <button class="btn" id="crop-ensure" style="width: 72px">确定</button>
          </div>
        </div>
      </div>
    </div>
  `)

  $('.cropper-cover').show();
  let cropper = new Cropper(<HTMLImageElement>$("#cropimg")[0], {
    aspectRatio: aspectRatio,
    viewMode: 1,
    dragMode: 'none',
    initialAspectRatio: 1,
    preview: ".cropper-preview",
    background: false,
    autoCropArea: 1,
    zoomOnWheel: true,

    crop(event: Cropper.CropEvent<HTMLImageElement>) {
      $("#img-size").text(
          `图片尺寸：${Math.round(event.detail.width)}x${Math.round(event.detail.height)} ${ratioStr? `(${ratioStr})`: ""}`
      )
    }
  })

  $("#crop-ensure").on("click", () => {
    callback(cropper.getCroppedCanvas())
    $('.cropper-cover').remove();
  })
  $("#crop-cancel").on("click", () => {
    if (cancel) cancel()
    $('.cropper-cover').remove();
  })
}

export function buildGoodsList(goodsList: GoodsInfo[]) {
  let res = ""

  for (let goods of goodsList) {
    res += buildGoods(goods)
  }

  return res
}

export function relativeWords(input: JQuery<HTMLElement>, words: JQuery<HTMLElement>, max: number) {
  input.on("input", () => {
    let len = (<string>input.val()!).length
    words.text("字数：" + len + "/" + max)
  })
  input.on("focus", () => {
    words.show()
  })
  input.on("blur", () => {
    words.hide()
  })
}
