// 订单表

/**
 * 0 待付款
 * 1 待发货
 * 2 已发货
 * 3 已完成
 * 4 已关闭
 * 5 已取消
 */
type OrderStatus = 0 | 1 | 2 | 4 | 5;
/**
 * 0: 未支付
 * 1: 已支付
 */
type PaymentStatus = 0 | 1;

interface IItemInfo {
  itemId: string;
  itemQuantity: number;
}

interface IOrder {
  _id: string;
  // 订单编号
  sn: string;
  // 团购Id
  purchaseId: string;
  // 订单创建时间
  createTime: Date;
  // 发货时间(确认团购数量,截单.此时订单不可取消了)
  deliveryTime: Date;
  // 完成时间(确认收货)
  completeTime: Date;
  // 修改时间
  modifyTime: Date;
  // 用户微信ID
  userOpenId: string;
  // 用户微信名称
  userName: string;
  // 用户头像
  userImg: string;
  // 收货手机号
  userPhone: number;
  // 总价
  totalAmount: number;
  // 备注
  note: string;
  // 提货地址
  detailAddress: string;
  // 地址id
  locationId: string;
  // 订单状态
  status: OrderStatus;
  // 付款状态
  paymentStatus: PaymentStatus;
  // 订单关联的商品信息
  itemsInfo: IItemInfo[];
  // 是否被删除
  isDelete: boolean;
}
