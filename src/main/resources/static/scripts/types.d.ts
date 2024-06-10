export declare class Result<T = null> {
    status: string;
    code: number;
    obj: T;
    message: string;
    constructor(status: string, code: number, obj: T, message: string);
}
export declare class ImgInfo {
    preview: string;
    alt: string;
    constructor(preview: string, alt: string);
}
export declare class GoodsInfo {
    id: number;
    owner: number;
    title: string;
    description: string;
    tags: string;
    price: number;
    reminded: number;
    createTime: string;
    constructor(id: number, owner: number, title: string, description: string, tags: string, price: number, reminded: number, createTime: string);
}
export declare class GoodsListResult {
    list: GoodsInfo[];
    end: number;
    noMore: boolean;
    constructor(list: GoodsInfo[], end: number, noMore: boolean);
}
export declare class AddressInfo {
    id: number;
    receiverName: string;
    phone: string;
    address: string;
    isDefault: boolean;
    constructor(id: number, name: string, phone: string, address: string, isDefault: boolean);
}
export declare class OrdersInfo {
}
export declare class TopicInfo {
    id: number;
    publisher: number;
    target: number;
    content: string;
    publishTime: string;
    constructor(id: number, publisher: number, target: number, content: string, publishTime: string);
}
export declare class UserInfo {
    id: number;
    name: string;
    displayName: string | undefined;
    email: string;
    description: string | undefined;
    constructor(id: number, name: string, email: string);
}
export declare class CartInfo {
    id: number;
    goods: number;
    owner: number;
    amount: number;
    constructor(id: number, goods: number, owner: number, amount: number);
}
