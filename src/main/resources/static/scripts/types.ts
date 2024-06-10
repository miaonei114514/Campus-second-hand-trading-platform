class Result<T = null> {
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

class ImgInfo {
  preview: string;
  alt: string;

  constructor(preview: string, alt: string){
    this.preview = preview;
    this.alt = alt;
  }
}

class GoodsInfo {
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

class GoodsListResult {
  list: GoodsInfo[];
  end: number;
  noMore: boolean;

  constructor(list: GoodsInfo[], end: number, noMore: boolean){
    this.list = list;
    this.end = end;
    this.noMore = noMore;
  }
}

class OrdersInfo {

}

class TopicInfo {
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

class UserInfo {
  id: number;
  uid: string;
  name: string;
  displayName: string | undefined;
  email: string;
  description: string | undefined;

  constructor(id: number, uid: string, name: string, email: string){
    this.id = id;
    this.uid = uid;
    this.name = name;
    this.email = email;
  }
}
