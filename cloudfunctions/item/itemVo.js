module.exports = class Item {
  constructor({ name, title, subTitle, defaultImg, description, descriptionBlocks, price, stock, defaultStock, recommend, displayOrder }) {
    this.name = name;
    this.title = title;
    this.subTitle = subTitle;
    this.defaultImg = defaultImg;
    this.description = description;
    this.descriptionBlocks = descriptionBlocks || [];
    this.price = price;
    this.stock = stock;
    this.defaultStock = defaultStock || stock;
    this.recommend = Boolean(recommend);
    this.displayOrder = Number(displayOrder || 0);
    this.status = 1;
    this.createTime = Date.now();
    this.saleCount = 0;
    this.isDelete = false;
  }
};
