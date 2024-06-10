"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartInfo = exports.UserInfo = exports.TopicInfo = exports.OrdersInfo = exports.AddressInfo = exports.GoodsListResult = exports.GoodsInfo = exports.ImgInfo = exports.Result = void 0;
class Result {
    status;
    code;
    obj;
    message;
    constructor(status, code, obj, message) {
        this.status = status;
        this.code = code;
        this.obj = obj;
        this.message = message;
    }
}
exports.Result = Result;
class ImgInfo {
    preview;
    alt;
    constructor(preview, alt) {
        this.preview = preview;
        this.alt = alt;
    }
}
exports.ImgInfo = ImgInfo;
class GoodsInfo {
    id;
    owner;
    title;
    description;
    tags;
    price;
    reminded;
    createTime;
    constructor(id, owner, title, description, tags, price, reminded, createTime) {
        this.id = id;
        this.owner = owner;
        this.title = title;
        this.description = description;
        this.tags = tags;
        this.price = price;
        this.reminded = reminded;
        this.createTime = createTime;
    }
}
exports.GoodsInfo = GoodsInfo;
class GoodsListResult {
    list;
    end;
    noMore;
    constructor(list, end, noMore) {
        this.list = list;
        this.end = end;
        this.noMore = noMore;
    }
}
exports.GoodsListResult = GoodsListResult;
class AddressInfo {
    id;
    receiverName;
    phone;
    address;
    isDefault;
    constructor(id, name, phone, address, isDefault) {
        this.id = id;
        this.receiverName = name;
        this.phone = phone;
        this.address = address;
        this.isDefault = isDefault;
    }
}
exports.AddressInfo = AddressInfo;
class OrdersInfo {
}
exports.OrdersInfo = OrdersInfo;
class TopicInfo {
    id;
    publisher;
    target;
    content;
    publishTime;
    constructor(id, publisher, target, content, publishTime) {
        this.id = id;
        this.publisher = publisher;
        this.target = target;
        this.content = content;
        this.publishTime = publishTime;
    }
}
exports.TopicInfo = TopicInfo;
class UserInfo {
    id;
    name;
    displayName;
    email;
    description;
    constructor(id, name, email) {
        this.id = id;
        this.name = name;
        this.email = email;
    }
}
exports.UserInfo = UserInfo;
class CartInfo {
    id;
    goods;
    owner;
    amount;
    constructor(id, goods, owner, amount) {
        this.id = id;
        this.goods = goods;
        this.owner = owner;
        this.amount = amount;
    }
}
exports.CartInfo = CartInfo;
