/**
 * 0: 下架
 * 1: 上架
 */
// type ItemStatus = 0 | 1 ;

interface IOriginItem {
  // _id: string;
  // createTime: Date;
  // updateTime: Date;
  // saleCount: number;
  // isDelete: boolean;
  // 商品名称
  name: string;
  // 标题
  title: string;
  // 副标题
  subTitle?: string;
  // 默认图片(首图)
  defaultImg: string;
  // 商品描述(富文本)
  description: string;
  // 实际价格
  price: number;
  // 库存
  stock: number;
  // 商品状态
  status?: ItemStatus;
}
