import {buildTopBar, relativeWords, showConfirm} from "../scripts/components";

$("#topBar").wrapInner(buildTopBar())

let logged: UserInfo | null = null;
let goodId: number

function delta(isAdd: boolean){
  let amount = $("#amount")
  let num = Number.parseInt(<string>amount.val())
  let max = Number.parseInt(<string>amount.attr("max"))

  if (isAdd){
    amount.val(num + 1);
    num++
    if (num >= max) $("#right").attr("disabled", "disabled")
    if (num > 1) $("#left").removeAttr("disabled")
  }
  else {
    amount.val(num - 1);
    num--
    if (num <= 1) $("#left").attr("disabled", "disabled")
    if (num < max) $("#right").removeAttr("disabled")
  }
}

function inputted() {
  let amount = $("#amount")
  let num = Number.parseInt(<string>amount.val())
  let max = Number.parseInt(<string>amount.attr("max"))

  num = Math.min(Math.max(1, num), max)
  amount.val(num)

  if (num <= 1) $("#left").attr("disabled", "disabled")
  if (num >= max) $("#right").attr("disabled", "disabled")
  if (num > 1 && num < max) {
    $("#left").removeAttr("disabled")
    $("#right").removeAttr("disabled")
  }
}

function buy(goods: number) {
  if (!logged){
    window.location.href = "/login"
    return
  }

  window.location.href = `/make-trade/${goods}%3A${$("#amount").val()}`
}

function cart(goods: number) {

}

function publishTopic(topic: string) {
  if (!logged){
    window.location.href = "/login"
    return
  }

  $.post(`/goods-topics/${goodId}`, {target: goodId, content: topic}, (res: Result) => {
    if(res.status == "error") window.alert(res.message)
    else buildTopics(goodId)
  })
}

function profile(id: number | string) {
  $.get(`/usercontext/${id}`, (res: Result<UserInfo>) => {
    if (res.status == "error") window.alert(res.message)
    else window.location.href = `/profile/${res.obj.uid}`
  })
}

function deleteTopic(topicId: number){
  showConfirm("确定要删除这条评论吗？", true, () => {
    if (!logged){
      window.alert("please login first")
      return
    }

    $.post(`/delete-topic`, {topicId: topicId}, (res: Result) => {
      if(res.status == "error") window.alert(res.message)
      else buildTopics(goodId)
    })
  })
}

function initGoods(id: number){
  goodId = id

  $.get(`/goods-info/${id}`, (res: Result<GoodsInfo>) => {
    $("#info").wrapInner(`
      <div class="flex">
        <img src="/goods-res/${id}/big-preview.png" alt="preview" class="margin-box big-preview fit-contain">
        <div class="pos-relative">
          <h3>${res.obj.title}</h3>
          <h2 class="price">￥${(res.obj.price / 100).toFixed(2)}</h2>
          
          <div class="margin-box">
            <h5>发布者：</h5>
            <div class="flex clickable" onclick="profile(${res.obj.owner})">
              <img id="publisher-avatar" src="" alt="..." class="avatar-mini">
              <h4 id="publisher-name">...</h4>
            </div>
          </div>
          
          <div class="pos-absolute bottom">
            <h4>数量</h4>
            <h5>剩余${res.obj.reminded}件</h5>
            
            <div class="amount-input">
              <button id="left" onclick="delta(false)" disabled="disabled">-</button>
              <input id="amount" type="number" value="1" min="1" max="${res.obj.reminded}" oninput="inputted()">
              <button id="right" onclick="delta(true)" ${res.obj.reminded <= 1 ? 'disabled="disabled"' : ""}>+</button>
            </div>
            <div class="shopping-box">
              <button id="buy" onclick="buy(${id})">购买</button>
              <button id="cart" onclick="cart(${id})">加入购物车</button>
            </div>
          </div>
        </div>
      </div>
    `)

    $.get(`/usercontext/${res.obj.owner}`, (r: Result<UserInfo>) => {
      if (r.status === "error"){
        alert(r.message)
        return
      }

      $("#publisher-avatar").attr("src", `/usercontext/${r.obj.uid}/avatar.png`)
      $("#publisher-name").text(r.obj.displayName? r.obj.displayName: r.obj.name)
    })

    $.get(`/goods-res/descriptions/${id}`, (r: Result<string[]>) => {
      if (r.status === "error") alert(r.message)
      else {
        let html = ""

        for (let file of r.obj) {
          html += `<img class="description-img" src="${file}" alt="${file}">`
        }

        if(res.obj.description){
          html += `
            <div>
                ${res.obj.description}
            </div>
          `
        }
        
        $("#description").wrapInner(html)
      }
    })

    buildTopics(id);
  })
}

function buildTopics(id: number) {
  $("#topic").empty().wrapInner(`
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
              <button class="top right btn" onclick="publishTopic($('#edit-topic').val())">发布</button>
          </div>
      </div>
      
      <div id="topic-list" style="padding-top: 16px">
          <h5 class="margin-hor">所有评论</h5>
      </div>
    `)

  relativeWords($("#edit-topic"), $("#words"), 500)

  $.get("/usercontext", (res: Result<UserInfo>) => {
    if (res.status == "error") return

    logged = res.obj
    $("#user-avatar").attr("src", `/usercontext/${res.obj.uid}/avatar.png`)
    $("#user-name").empty().wrapInner(`${res.obj.displayName ? res.obj.displayName : res.obj.name}`)
  })

  $.get(`/goods-topics/${id}`, (res: Result<TopicInfo[]>) => {
    if (res.status == "error") return

    if (res.obj.length == 0) $("#topic-list").append(`<h5 class="margin-hor padding-box write-back">这里什么都没有...</h5>`)
    else $("#topic-list").append(buildTopic(res.obj))
  })
}

function buildTopic(list: TopicInfo[]): string {
  let res = ""

  for (let topic of list) {
    res += `
        <div class="write-back padding-box margin-hor">
          <div id="usrInfo${topic.id}" class="flex pos-relative">
            <img id="avatar${topic.id}" onclick="profile(${topic.publisher})" class="avatar-small clickable" src="/assets/img/no_login.png" alt="...">
            <div class="margin-side clickable" onclick="profile(${topic.publisher})">
              <h4 id="name${topic.id}">user</h4>
              <h5>发布于: ${topic.publishTime}</h5>
            </div>
          </div>
          
          <div class="margin-hor">
            <pre>${topic.content}</pre>
          </div>
        </div>
      `

    $.get(`/usercontext/${topic.publisher}`, (res: Result<UserInfo>) => {
      $("#avatar" + topic.id).attr("src", `/usercontext/${res.obj.uid}/avatar.png`)
      $("#name" + topic.id).empty().wrapInner(`${res.obj.displayName? res.obj.displayName: res.obj.name}`)

      if(logged && logged.id == topic.publisher) {
        $("#usrInfo" + topic.id).append(`
          <button class="topnote text-btn" onclick="deleteTopic(${topic.id})">删除</button>
        `)
      }
    })
  }

  return res;
}
