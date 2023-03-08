class Order {
  constructor(
    sn,
    {
      userOpenId,
      userName,
      userPhone,
      totalAmount,
      note,
      detailAddress,
      purchaseId,
      itemInfo,
    }
  ) {
    this.sn = sn;
    this.purchaseId = purchaseId;
    this.userOpenId = userOpenId;
    this.userName = userName;
    this.userPhone = userPhone;
    this.totalAmount = totalAmount;
    this.note = note;
    this.detailAddress = detailAddress;
    this.itemInfo = itemInfo;
    this.status = 0;
    this.paymentStatus = 0;
    this.createTime = Date.now();
    this.isDelete = false;
  }
}

class OrderItem {
  constructor(orderSn, itemQuantity, item, activityId) {
    const {
      _id: itemId,
      name: itemName,
      title: itemTitle,
      subTitle: itemSubTitle,
      defaultImg: itemDefaultImg,
      price: itemPrice,
      userName,
    } = item;
    this.orderSn = orderSn;
    this.itemId = itemId;
    this.itemName = itemName;
    this.itemTitle = itemTitle;
    this.itemSubTitle = itemSubTitle;
    this.itemDefaultImg = itemDefaultImg;
    this.itemPrice = itemPrice;
    this.itemQuantity = itemQuantity;
    this.activityId = activityId;
    this.userName = userName;
  }
}

module.exports = {
  Order,
  OrderItem,
};
