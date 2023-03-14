// 订单-商品 映射表(1对多)

interface IOrderItems {
  _id: string;
  // 订单sn
  orderSn: string;
  // 商品Id
  itemId: string;
  // 商品名称
  itemName: string;
  // 商品标题
  itemTitle: string;
  // 商品副标题
  itemSubTitle: string;
  // 商品图片
  itemDefaultImg: string;
  // 商品价格
  itemPrice: number;
  // 商品数量
  itemQuantity: number;
}
