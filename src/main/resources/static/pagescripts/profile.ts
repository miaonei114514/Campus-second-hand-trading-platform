import {
  buildAddressEditor, buildAddressItem,
  buildGoodsList,
  buildTopBar,
  relativeWords,
  showConfirm,
  showCropper
} from "../scripts/components";
import {AddressInfo, GoodsInfo, Result, UserInfo} from "../scripts/types";
import $, {map} from "jquery"
import {putBlob, putFile, readFile, receiveParameters} from "../scripts/utils";

$("#topBar").wrapInner(buildTopBar("prof"))

let loginUsr: UserInfo;

function postDesc(){
  let desc = $("#desc-input").val()

  $.post("/update_user_info", {description: desc}, (res: Result<UserInfo>) => {
    if (res.status === "error") alert(res.message)
    else showConfirm("修改成功", false)
  })
}

let uid = receiveParameters<{"user-uid": string}>()["user-uid"]

$.get(`/usercontext${uid? `/${uid}`: ""}`, (res: Result<UserInfo>) => {
  if (res.status === "error") window.location.replace("/login")
  else {
    if (res.code === 0) {
      loginUsr = res.obj
      $.post(`/usercontext/delete/${loginUsr.id}/avatar-tmp.png`)
    }

    wrapUserMeta(res)
    if (res.code === 0) {
      wrapAddress(res)
      wrapOrders(res)
    }
    else{
      $("#address").hide()
      $("#orders").hide()
      $("#prof").removeClass("active")
    }
    wrapPublishies(res)
  }
})

function wrapUserMeta(res: Result<UserInfo>){
  if (res.code === 0) { //self
    $("#user-meta").wrapInner(`
        <div class="flex pos-relative">
          <div class="pos-relative">
            <img src="/usercontext/${res.obj.id}/avatar.png" alt="avatar" id="avatar" class="avatar">
            <br>
            <button class="file-select center-hor">
              <h5>上传头像</h5>
              <input type="file" accept="image/png,image/jpg,image/jpeg" name="" id="upload-avatar">
            </button>
          </div>
          <div class="padding-box">
            <div class="flex">
              <div id="nickname-box">
                <h3 id="nickname">${res.obj.displayName ? res.obj.displayName : res.obj.name}</h3>
              </div>
              <button id="edit-nick" class="btn" content="small"><img src="/img/pencil.png" class="icon" alt="icon"></button>
            </div>
            <h5 id="username" class="gray">@${res.obj.name}</h5>
          </div>
          <button id="logout" class="btn topnote" content="small">登出</button>
        </div>
        
        <div class="desc-edit">
          <b>个人简介</b>
          <div class="description-bar padding-box">
            <textarea spellcheck="false" maxlength="200" id="desc-input" class="editor no-back">${res.obj.description ? res.obj.description : "这个人很懒，什么也没写"}</textarea>
            <h5 id="words" class="gray footnote hidden">字数：${res.obj.description ? res.obj.description.length : 11}/200</h5>
          </div>
          <button class="btn margin-box" id="post" content="small">更新简介</button>
        </div>
      `)

    $("#post").on("click", () => postDesc())

    $("#logout").on("click", () => {
      showConfirm("确认登出？", true, () => {
        $.post('/logout', res => {
          if (res.status === "error")
            return alert(res.message)

          window.location.replace("/login")
        })
      })
    })

    $("#upload-avatar").on("change", function() {
      let inp = $(this);
      let file = (<HTMLInputElement>inp[0]).files![0];

      readFile(file, true, (res) => {
        showCropper(<string>res, 1, "1 : 1", (crop) => {
          crop.toBlob(b => {
            putBlob(`/usercontext/${loginUsr.id}/avatar.png`, b!, (r: Result) => {
              $("#avatar").attr("src", `/usercontext/${loginUsr.id}/avatar.png?${Math.random()}`)
              showConfirm("上传成功", false)
            })
          })
        }, () => {
        })
      })
    })

    let box = $("#nickname-box")
    let btn = $("#edit-nick")
    let status = true

    btn.on("click", () => {
      if (status) {
        box.empty()
        box.wrapInner(`<input id="name-input" class="underline-input" value="${res.obj.displayName? res.obj.displayName: ""}" placeholder="未设置">`)
        $("#nickname-box>img").attr("src", "/img/ensure.png")

        status = false
      }
      else {
        let name = $("#name-input").val()

        $.post("/update_user_info", {displayName: name}, (res: Result<UserInfo>) => {
          if(res.status === "error"){
            window.alert(res.message)
          }
          else {
            box.empty()
            box.wrapInner(`<h3 id="nickname">${res.obj.displayName? res.obj.displayName: res.obj.name}</h3>`)
            $("#nickname-box>img").attr("src", "/img/pencil.png")

            status = true
          }
        })
      }
    })

    relativeWords($("#desc-input"), $("#words"), 500)
  }
  else { //visitor, display only
    $("#user-meta").wrapInner(`
        <div class="flex">
          <img src="/usercontext/${res.obj.id}/avatar.png" alt="avatar" id="avatar" class="avatar">
          <div class="padding-box">
            <h3 id="nickname">${res.obj.displayName? res.obj.displayName: res.obj.name}</h3>
            <h5 id="username" class="gray">@${res.obj.name}</h5>
          </div>
        </div>
        <b>个人简介</b>
        <pre class="description-bar padding-box">${res.obj.description? res.obj.description: "这个人很懒，什么也没写"}</pre>
      `)
  }
}

function wrapAddress(usrRes: Result<UserInfo>) {
  $.get(`/user-address/${usrRes.obj.id}`, (res: Result<AddressInfo[]>) => {
    let addressBox = $("#address")

    let build = ""
    for (let address of res.obj) {
      build += buildAddressItem(address)

      $(() => {
        $(`#delete-${address.id}`).on("click", () => {
          showConfirm("要删除这个地址记录吗？", true, () => {
            $.post(`/delete-address/${usrRes.obj.id}`, { "address-id": address.id }, (r: Result) => {
              if(res.status == "error") showConfirm(r.message)
              else {
                addressBox.empty()
                wrapAddress(usrRes)
              }
            })
          })
        })
      })
    }
    if (res.obj.length == 0) build += `<h4>未添加收货地址</h4>`

    build += `<button id="add-new" class="btn margin-hor">添加新地址</button>`

    addressBox.wrapInner(`
      <h5>管理我的收货地址</h5>
      ${build}
      <div id="edit-box" class="hidden">
        ${buildAddressEditor("addr-edit")}
        <div class="flex margin-hor">
          <button id="save-address" class="btn">保存</button>
          <button id="cancel-add" class="btn">取消</button>
        </div>
      </div>
    `)
    let editBox = $("#edit-box")
    editBox.hide()
    $("#add-new").on("click", () => {
      $("#edit-box").show()
      $("#add-new").hide()
    })

    $(".address-box").on("change", (e) => {
      $.post(`/set-default-address/${usrRes.obj.id}`, {
        "address-id": e.currentTarget.getAttribute("value")
      }, res => {
        if(res.status == "error") showConfirm(res.message)
      })
    })

    $("#save-address").on("click", () => {
      let from = <JQuery<HTMLFormElement>>$("#addr-edit")
      let t = from.serializeArray();

      let str = "{"
      $.each(t, function() {
        if (str != "{") str += ","
        str += `"${this.name}":"${this.value}"`
      });
      str += "}"
      $.post("/user-address", JSON.parse(str), (res: Result) => {
        if (res.status == "error") showConfirm(res.message)
        else {
          addressBox.empty()
          wrapAddress(usrRes)
        }
      })
    })

    $("#cancel-add").on("click", () => {
      editBox.hide()
      $("#add-new").show()
    })
  })


}

function wrapOrders(res: Result<UserInfo>) {
  $("#orders").wrapInner(`
    
  `)
}

function wrapPublishies(res: Result<UserInfo>) {
  $.get(`/usercontext/publich-goods/${res.obj.id}`, (res: Result<GoodsInfo[]>) => {
    if(res.status == "error"){
      window.alert(res.message)
      return
    }

    let goods = res.obj.length == 0? "<h4>这里什么都没有...</h4>": buildGoodsList(res.obj)

    $("#published").wrapInner(`
    <h5>发布的商品</h5>
    <div class="flex">${goods}</div>
    `)
  })
}
