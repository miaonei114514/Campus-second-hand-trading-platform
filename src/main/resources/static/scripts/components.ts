import Cropper from "cropperjs"

export function buildSearch(id: string) {
  $(document).on("click", function () {
    let search = $(`#${id}`)
    search.on("focus", function () {
      $(`#${id}-menu`).show()
    })

    search.on("blur", function () {
      $(`#${id}-menu`).hide()
    })
  })

  return (`
  <div class="searchBar">
      <img src="/img/zoom.png" alt="">
      <input type="text" id="${id}" class="search-input" placeholder="输入关键字以搜索">
      <button class="btn search">搜索</button>
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

export function buildTopBar(curr: string = "", search: boolean = false) {
  return (`
  <div class="topbar">
    <h2>Logo</h2>
    <nav>
      <a href="/" id="index" class="btn ${curr === "index" ? "active" : ""}">首页</a>
      <a href="/message" id="mess" class="btn ${curr === "mess" ? "active" : ""}">消息</a>
      <a href="/cart" id="cart" class="btn ${curr === "cart" ? "active" : ""}">购物车</a>
      <a href="/profile" id="prof" class="btn ${curr === "prof" ? "active" : ""}">个人主页</a>
    </nav>
    
    ${search ? `<div id="topsearch">${buildSearch("topbarHover")}</div>` : ''}
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

export function showConfirm(title: string, type: boolean = true, resCallback: (() => void) | undefined = undefined, cancelText: string = "取消", ensureText: string = "确定") {
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

export function showCropper(img: string, callback: (img: Cropper.CropBoxData) => void) {
  $('body').append(`
    <div id="cover" class="cropper-cover">
      <div>
         <img src=${img} alt="">
      </div>
    </div>
  `)
  $('.cover').show();
  let cropper = new Cropper(<HTMLImageElement>$("#img")[0], {
    aspectRatio: 1,
    crop(event) {
      console.log(event);
      console.log(event.detail.x);
      console.log(event.detail.y);
      console.log(event.detail.width);
      console.log(event.detail.height);
      console.log(event.detail.rotate);
      console.log(event.detail.scaleX);
      console.log(event.detail.scaleY);
    },
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

export function putFile(putUrl: string, file: File, callback: (((res: any) => void) | undefined) = undefined) {
  let fiRead = new FileReader()
  if (file) {
    fiRead.onload = e => {
      let xhreq = new XMLHttpRequest()
      xhreq.open("POST", putUrl, true);
      xhreq.setRequestHeader("Content-type", "application/octet-stream");
      xhreq.setRequestHeader("Content-length", String(file.size));
      xhreq.send(fiRead.result);
      xhreq.onload = function (e) {
        if (callback) callback(this.response)
      }
    }
    fiRead.readAsArrayBuffer(file);
  } else {
    showConfirm("请正确选择文件", false)
  }
}

$(() => {
  const list = $(".scroll-img")
  list.on("wheel", function (event) {
    event.currentTarget.scrollLeft -= (<{ wheelDelta: number }><unknown>event.originalEvent).wheelDelta;
    event.preventDefault();
  })
})