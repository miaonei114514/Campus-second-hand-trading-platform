"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.receiveParameters = exports.readFile = exports.putFile = exports.putBlob = void 0;
const components_1 = require("./components");
const jquery_1 = __importDefault(require("jquery"));
function putBlob(putUrl, blob, callback = undefined) {
    let xhreq = new XMLHttpRequest();
    xhreq.open("POST", putUrl, true);
    xhreq.setRequestHeader("Content-type", "application/octet-stream");
    xhreq.send(blob);
    xhreq.onloadend = function (e) {
        if (callback)
            callback(this.response);
    };
}
exports.putBlob = putBlob;
function putFile(putUrl, file, callback = undefined) {
    let fiRead = new FileReader();
    if (file) {
        fiRead.onloadend = () => {
            putBlob(putUrl, fiRead.result, callback);
        };
        fiRead.readAsArrayBuffer(file);
    }
    else {
        (0, components_1.showConfirm)("请正确选择文件", false);
    }
}
exports.putFile = putFile;
function readFile(file, toUrl, callback) {
    let fiRead = new FileReader();
    if (file) {
        fiRead.onloadend = () => {
            callback(fiRead.result);
        };
        if (toUrl)
            fiRead.readAsDataURL(file);
        else
            fiRead.readAsArrayBuffer(file);
    }
    else {
        (0, components_1.showConfirm)("请正确选择文件", false);
    }
}
exports.readFile = readFile;
function receiveParameters() {
    let str = (0, jquery_1.default)("#parameters").attr("content");
    return str ? JSON.parse(`${str}`) : {};
}
exports.receiveParameters = receiveParameters;
