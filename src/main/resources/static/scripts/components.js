"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.relativeWords = exports.buildGoodsList = exports.showCropper = exports.showConfirm = exports.buildAddressItem = exports.buildAddressEditor = exports.buildGoods = exports.buildScrollImg = exports.buildTopBar = exports.buildSearch = void 0;
const jquery_1 = __importDefault(require("jquery"));
const cropperjs_1 = __importDefault(require("cropperjs"));
function buildSearch(id, searchDefault = "") {
    (0, jquery_1.default)(document).on("click", function () {
        let search = (0, jquery_1.default)(`#${id}`);
        search.on("focus", function () {
            (0, jquery_1.default)(`#${id}-menu`).show();
        });
        search.on("blur", function () {
            (0, jquery_1.default)(`#${id}-menu`).hide();
        });
    });
    (0, jquery_1.default)(() => {
        (0, jquery_1.default)("#toggle-" + id).on("click", () => {
            window.location.href = `/?search=${(0, jquery_1.default)("#" + id).val()}`;
        });
    });
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
  `);
}
exports.buildSearch = buildSearch;
function buildTopBar(curr = "", search = false, searchDefault = "") {
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
`);
}
exports.buildTopBar = buildTopBar;
function buildScrollImg(list) {
    let ls = "<div class='scroll-img-item' style='width: 300px'></div>";
    for (let item of list) {
        ls += `
    <div class="scroll-img-item">
      <div>
        <img src="${item.preview}" alt="${item.alt}" class="pos-relative">
        <div class=""></div>
      </div>
    </div>
    `;
    }
    ls += "<div class='scroll-img-item' style='width: 300px'></div>";
    (0, jquery_1.default)(() => {
        const list = (0, jquery_1.default)(".scroll-img");
        list.on("wheel", function (event) {
            event.currentTarget.scrollLeft -= event.originalEvent.wheelDelta;
            event.preventDefault();
        });
    });
    return (`
    <div class="scroll-img">
        ${ls}
    </div>
  `);
}
exports.buildScrollImg = buildScrollImg;
function buildGoods(goods) {
    return (`
  <div class="goods-preview" onclick="window.location.href='/goods/${goods.id}'">
    <img src="/goods-res/${goods.id}/preview.png" alt="preview">
    <div>
      <h5 class="overflow-hide">${goods.title}</h5>
      <h4 class="price">${(goods.price / 100).toFixed(2)}￥</h4>
    </div>
  </div>  
`);
}
exports.buildGoods = buildGoods;
function buildAddressEditor(id) {
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
  `;
}
exports.buildAddressEditor = buildAddressEditor;
function buildAddressItem(address, buildDelete = true) {
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
        
        ${buildDelete ? `<div class="top right pos-absolute padding-box">
          <button id="delete-${address.id}" class="btn" content="small"><img src="/assets/img/trash.png" class="icon" alt="删除"></button>
        </div>` : ""}
      </div>
    </label>
  `);
}
exports.buildAddressItem = buildAddressItem;
function showConfirm(title, type = false, resCallback = undefined, cancelText = "取消", ensureText = "确定") {
    (0, jquery_1.default)('body').append(`
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
  `);
    (0, jquery_1.default)('.cover').show();
    (0, jquery_1.default)('#cancel').on("click", function () {
        (0, jquery_1.default)('.cover').remove();
    });
    (0, jquery_1.default)('#sure').on("click", function () {
        (0, jquery_1.default)('.cover').remove();
        if (resCallback)
            resCallback();
    });
}
exports.showConfirm = showConfirm;
function showCropper(img, aspectRatio, ratioStr, callback, cancel = null) {
    (0, jquery_1.default)('body').append(`
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
  `);
    (0, jquery_1.default)('.cropper-cover').show();
    let cropper = new cropperjs_1.default((0, jquery_1.default)("#cropimg")[0], {
        aspectRatio: aspectRatio,
        viewMode: 1,
        dragMode: 'none',
        initialAspectRatio: 1,
        preview: ".cropper-preview",
        background: false,
        autoCropArea: 1,
        zoomOnWheel: true,
        crop(event) {
            (0, jquery_1.default)("#img-size").text(`图片尺寸：${Math.round(event.detail.width)}x${Math.round(event.detail.height)} ${ratioStr ? `(${ratioStr})` : ""}`);
        }
    });
    (0, jquery_1.default)("#crop-ensure").on("click", () => {
        callback(cropper.getCroppedCanvas());
        (0, jquery_1.default)('.cropper-cover').remove();
    });
    (0, jquery_1.default)("#crop-cancel").on("click", () => {
        if (cancel)
            cancel();
        (0, jquery_1.default)('.cropper-cover').remove();
    });
}
exports.showCropper = showCropper;
function buildGoodsList(goodsList) {
    let res = "";
    for (let goods of goodsList) {
        res += buildGoods(goods);
    }
    return res;
}
exports.buildGoodsList = buildGoodsList;
function relativeWords(input, words, max) {
    input.on("input", () => {
        let len = input.val().length;
        words.text("字数：" + len + "/" + max);
    });
    input.on("focus", () => {
        words.show();
    });
    input.on("blur", () => {
        words.hide();
    });
}
exports.relativeWords = relativeWords;
