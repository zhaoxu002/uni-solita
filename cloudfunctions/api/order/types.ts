/**
 * 0 待付款
 * 1 待发货
 * 2 已发货
 * 3 已完成
 * 4 已关闭
 * 5 已取消
 */
// type OrderStatus = 0 | 1 | 2 | 4 | 5;
/**
 * 0: 未支付
 * 1: 已支付
 */
// type PaymentStatus = 0 | 1;

interface IItemInfo {
  itemId: string;
  itemQuantity: number;
}

interface IOriginOrder {
  // _id: string;
  // sn: string;
  // createTime: Date;
  // deliveryTime: Date;
  // completeTime: Date;
  // modifyTime: Date;
  // totalAmount: number;
  // status: OrderStatus;
  // paymentStatus: PaymentStatus;
  // isDelete: boolean;

  purchaseId: string;
  userOpenId: string;
  userName?: string;
  userImg?: string;
  userPhone: number;
  note: string;
  locationId?: string;
  detailAddress: string;
  itemsInfo: IItemInfo[];
}

interface IOriginOrderItems {
  // _id: string;
  orderSn: string;
  itemId: string;
  itemName: string;
  itemTitle: string;
  itemSubTitle: string;
  itemDefaultImg: string;
  itemPrice: number;
  itemQuantity: number;
}
