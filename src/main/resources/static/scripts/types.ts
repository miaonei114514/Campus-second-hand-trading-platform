
export class Result<T = null> {
  status: string;
  code: number;
  obj: T;
  message: string;

  constructor(status: string, code: number, obj: T, message: string) {
    this.status = status;
    this.code = code;
    this.obj = obj;
    this.message = message;
  }
}

export class ImgInfo {
  preview: string;
  alt: string;

  constructor(preview: string, alt: string){
    this.preview = preview;
    this.alt = alt;
  }
}

export class GoodsInfo {
  id: number;
  owner: number;
  title: string;
  description: string;
  tags: string;
  price: number;
  reminded: number;
  createTime: string;

  constructor(id: number, owner: number, title: string, description: string, tags: string, price: number, reminded: number, createTime: string){
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

export class GoodsListResult {
  list: GoodsInfo[];
  end: number;
  noMore: boolean;

  constructor(list: GoodsInfo[], end: number, noMore: boolean){
    this.list = list;
    this.end = end;
    this.noMore = noMore;
  }
}

export class AddressInfo {
  id: number;
  receiverName: string;
  phone: string;
  address: string;
  isDefault: boolean;

  constructor(id: number, name: string, phone: string, address: string, isDefault: boolean){
    this.id = id;
    this.receiverName = name;
    this.phone = phone;
    this.address = address;
    this.isDefault = isDefault;
  }
}

export class OrdersInfo {

}

export class TopicInfo {
  id: number;
  publisher: number;
  target: number;
  content: string;
  publishTime: string;

  constructor(id: number, publisher: number, target: number, content: string, publishTime: string){
    this.id = id;
    this.publisher = publisher;
    this.target = target;
    this.content = content;
    this.publishTime = publishTime;
  }
}

export class UserInfo {
  id: number;
  name: string;
  displayName: string | undefined;
  email: string;
  description: string | undefined;

  constructor(id: number, name: string, email: string){
    this.id = id;
    this.name = name;
    this.email = email;
  }
}

export class CartInfo {
  id: number;
  goods: number;
  owner: number;
  amount: number;

  constructor(id: number, goods: number, owner: number, amount: number) {
    this.id = id;
    this.goods = goods;
    this.owner = owner;
    this.amount = amount;
  }
}
