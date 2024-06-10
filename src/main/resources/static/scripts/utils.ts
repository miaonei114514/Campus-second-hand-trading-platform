import {showConfirm} from "./components";
import $ from "jquery"

export function putBlob(putUrl: string, blob: XMLHttpRequestBodyInit, callback: (((res: any) => void) | undefined) = undefined) {
  let xhreq = new XMLHttpRequest()
  xhreq.open("POST", putUrl, true);
  xhreq.setRequestHeader("Content-type", "application/octet-stream");
  xhreq.send(blob);
  xhreq.onloadend = function (e) {
    if (callback) callback(this.response)
  }
}

export function putFile(putUrl: string, file: File, callback: (((res: any) => void) | undefined) = undefined) {
  let fiRead = new FileReader()
  if (file) {
    fiRead.onloadend = () => {
      putBlob(putUrl, fiRead.result!, callback)
    }
    fiRead.readAsArrayBuffer(file);
  } else {
    showConfirm("请正确选择文件", false)
  }
}

export function readFile(file: File, toUrl: boolean, callback: (p: string | ArrayBuffer) => void) {
  let fiRead = new FileReader()
  if (file) {
    fiRead.onloadend = () => {
      callback(fiRead.result!)
    }
    if (toUrl) fiRead.readAsDataURL(file);
    else fiRead.readAsArrayBuffer(file)
  } else {
    showConfirm("请正确选择文件", false)
  }
}

export function receiveParameters<Res>(): Res{
  let str = $("#parameters").attr("content")
  return str? JSON.parse(`${str}`): {}
}
