"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const components_1 = require("../scripts/components");
const jquery_1 = __importDefault(require("jquery"));
const utils_1 = require("../scripts/utils");
(0, jquery_1.default)("#topBar").wrapInner((0, components_1.buildTopBar)());
let logged = null;
let goodId;
function delta(isAdd) {
    let amount = (0, jquery_1.default)("#amount");
    let num = Number.parseInt(amount.val());
    let max = Number.parseInt(amount.attr("max"));
    if (isAdd) {
        amount.val(num + 1);
        num++;
        if (num >= max)
            (0, jquery_1.default)("#right").attr("disabled", "disabled");
        if (num > 1)
            (0, jquery_1.default)("#left").removeAttr("disabled");
    }
    else {
        amount.val(num - 1);
        num--;
        if (num <= 1)
            (0, jquery_1.default)("#left").attr("disabled", "disabled");
        if (num < max)
            (0, jquery_1.default)("#right").removeAttr("disabled");
    }
}
function inputted() {
    let amount = (0, jquery_1.default)("#amount");
    let num = Number.parseInt(amount.val());
    let max = Number.parseInt(amount.attr("max"));
    num = Math.min(Math.max(1, num), max);
    amount.val(num);
    if (num <= 1)
        (0, jquery_1.default)("#left").attr("disabled", "disabled");
    if (num >= max)
        (0, jquery_1.default)("#right").attr("disabled", "disabled");
    if (num > 1 && num < max) {
        (0, jquery_1.default)("#left").removeAttr("disabled");
        (0, jquery_1.default)("#right").removeAttr("disabled");
    }
}
function buy(goods) {
    if (!logged) {
        window.location.href = "/login";
        return;
    }
    window.location.href = `/make-trade?goods=${goods}%3A${(0, jquery_1.default)("#amount").val()}`;
}
function cart(goods) {
    if (!logged) {
        window.location.href = "/login";
        return;
    }
    jquery_1.default.post("/add-cart", { goods: goods, amount: (0, jquery_1.default)("#amount").val() }, (res) => {
        if (res.status == "error")
            window.alert(res.message);
        else
            (0, components_1.showConfirm)("操作成功", false);
    });
}
function publishTopic(topic) {
    if (!logged) {
        window.location.href = "/login";
        return;
    }
    jquery_1.default.post(`/goods-topics/${goodId}`, { target: goodId, content: topic }, (res) => {
        if (res.status == "error")
            window.alert(res.message);
    });
}
function profile(id) {
    jquery_1.default.get(`/usercontext/${id}`, (res) => {
        if (res.status == "error")
            window.alert(res.message);
        else
            window.location.href = `/profile/${res.obj.id}`;
    });
}
function deleteTopic(topicId) {
    (0, components_1.showConfirm)("确定要删除这条评论吗？", true, () => {
        if (!logged) {
            window.alert("please login first");
            return;
        }
        jquery_1.default.post(`/delete-topic`, { topicId: topicId }, (res) => {
            if (res.status == "error")
                window.alert(res.message);
            else
                buildTopics(goodId);
        });
    });
}
function buildTopics(id) {
    (0, jquery_1.default)("#topic").empty().wrapInner(`
      <div class="flex">
          <img id="user-avatar" class="avatar-small" src="/assets/img/no_login.png" alt="...">
          <h4 id="user-name" class="margin-box">请先登录</h4>
      </div>
      
      <div class="margin-hor padding-box write-back pos-relative">
          <textarea id="edit-topic" class="editor no-back" placeholder="发表一条友善的评论吧"></textarea>
          <h5 id="words" class="gray footnote hidden">字数：0/500</h5>
      </div>
      
      <div>
          <div class="pos-relative">
              <button class="top pos-absolute right btn" id="publish-topic">发布</button>
          </div>
      </div>
      
      <div id="topic-list" style="padding-top: 16px">
          <h5 class="margin-hor">所有评论</h5>
      </div>
    `);
    let edit = (0, jquery_1.default)("#edit-topic");
    (0, components_1.relativeWords)(edit, (0, jquery_1.default)("#words"), 500);
    (0, jquery_1.default)("#publish-topic").on("click", () => publishTopic(edit.val()));
    jquery_1.default.get("/usercontext", (res) => {
        if (res.status == "error")
            return;
        logged = res.obj;
        (0, jquery_1.default)("#user-avatar").attr("src", `/usercontext/${res.obj.id}/avatar.png`);
        (0, jquery_1.default)("#user-name").empty().wrapInner(`${res.obj.displayName ? res.obj.displayName : res.obj.name}`);
    });
    jquery_1.default.get(`/goods-topics/${id}`, (res) => {
        if (res.status == "error")
            return;
        if (res.obj.length == 0)
            (0, jquery_1.default)("#topic-list").append(`<h5 class="margin-hor padding-box write-back">这里什么都没有...</h5>`);
        else
            (0, jquery_1.default)("#topic-list").append(buildTopic(res.obj));
    });
}
function buildTopic(list) {
    let res = "";
    for (let topic of list) {
        res += `
        <div class="write-back padding-box margin-hor">
          <div id="usrInfo${topic.id}" class="flex pos-relative clickable">
            <img id="avatar${topic.id}" class="avatar-small prof${topic}" src="/assets/img/no_login.png" alt="...">
            <div class="margin-side">
              <h4 id="name${topic.id}">user</h4>
              <h5>发布于: ${topic.publishTime}</h5>
            </div>
          </div>
          
          <div class="margin-hor">
            <pre>${topic.content}</pre>
          </div>
        </div>
      `;
        jquery_1.default.get(`/usercontext/${topic.publisher}`, (res) => {
            (0, jquery_1.default)("#avatar" + topic.id).attr("src", `/usercontext/${res.obj.id}/avatar.png`);
            (0, jquery_1.default)("#name" + topic.id).empty().wrapInner(`${res.obj.displayName ? res.obj.displayName : res.obj.name}`);
            let usrProf = (0, jquery_1.default)("#usrInfo" + topic.id);
            usrProf.on("click", () => profile(topic.publisher));
            if (logged && logged.id == topic.publisher) {
                usrProf.append(`
          <button class="topnote text-btn" id="delet${topic.id}">删除</button>
        `);
                (0, jquery_1.default)("#delet" + topic.id).on("click", () => deleteTopic(topic.id));
            }
        });
    }
    return res;
}
let arg = (0, utils_1.receiveParameters)();
goodId = arg["good-id"];
jquery_1.default.get(`/goods-info/${goodId}`, (res) => {
    (0, jquery_1.default)("#info").wrapInner(`
    <div class="flex">
      <img src="/goods-res/${goodId}/big-preview.png" alt="preview" class="margin-box big-preview fit-contain">
      <div class="pos-relative">
        <h3>${res.obj.title}</h3>
        <h2 class="price">￥${(res.obj.price / 100).toFixed(2)}</h2>
        
        <div class="margin-box">
          <h5>发布者：</h5>
          <div class="flex clickable" id="publisher">
            <img id="publisher-avatar" src="" alt="..." class="avatar-mini">
            <h4 id="publisher-name">...</h4>
          </div>
        </div>
        
        <div class="pos-absolute bottom">
          <h4>数量</h4>
          <h5>剩余${res.obj.reminded}件</h5>
          
          <div class="amount-input">
            <button id="left" disabled="disabled">-</button>
            <input id="amount" type="number" value="1" min="1" max="${res.obj.reminded}">
            <button id="right" ${res.obj.reminded <= 1 ? 'disabled="disabled"' : ""}>+</button>
          </div>
          <div class="shopping-box">
            <button id="buy">购买</button>
            <button id="cart">加入购物车</button>
          </div>
        </div>
      </div>
    </div>
  `);
    (0, jquery_1.default)("#amount").on("input", () => inputted());
    (0, jquery_1.default)("#publisher").on("click", () => profile(res.obj.owner));
    (0, jquery_1.default)("#left").on("click", () => delta(false));
    (0, jquery_1.default)("#right").on("click", () => delta(true));
    (0, jquery_1.default)("#buy").on("click", () => buy(goodId));
    (0, jquery_1.default)("#cart").on("click", () => cart(goodId));
    jquery_1.default.get(`/usercontext/${res.obj.owner}`, (r) => {
        if (r.status === "error") {
            alert(r.message);
            return;
        }
        (0, jquery_1.default)("#publisher-avatar").attr("src", `/usercontext/${r.obj.id}/avatar.png`);
        (0, jquery_1.default)("#publisher-name").text(r.obj.displayName ? r.obj.displayName : r.obj.name);
    });
    jquery_1.default.get(`/goods-res/descriptions/${goodId}`, (r) => {
        if (r.status === "error")
            alert(r.message);
        else {
            let html = "";
            for (let file of r.obj) {
                html += `<img class="description-img" src="${file}" alt="${file}">`;
            }
            if (res.obj.description) {
                html += `
          <div>
              ${res.obj.description}
          </div>
        `;
            }
            (0, jquery_1.default)("#description").wrapInner(html);
        }
    });
    buildTopics(goodId);
});
