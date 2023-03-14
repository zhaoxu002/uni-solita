module.exports = class Item {
  constructor({ name, title, subTitle, defaultImg, description, price, status, stock }) {
    this.name = name;
    this.title = title;
    this.subTitle = subTitle;
    this.defaultImg = defaultImg;
    this.description = description;
    this.price = price;
    this.stock = stock;
    this.status = 1;
    this.createTime = Date.now();
    this.saleCount = 0;
    this.isDelete = false;
  }
};
