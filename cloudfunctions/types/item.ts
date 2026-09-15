// 商品表

/**
 * 0: 下架
 * 1: 上架
 */
type ItemStatus = 0 | 1;

interface IItem {
  _id: string;
  // 商品名称
  name: string;
  // 创建时间
  createTime: Date;
  // 更新时间
  updateTime: Date;
  // 标题
  title: string;
  // 副标题
  subTitle?: string;
  // 默认图片(首图)
  defaultImg: string;
  // 商品描述(富文本)
  description: string;
  // 后台轻量内容编辑器的结构化数据
  descriptionBlocks?: Array<
    | { type: "text"; content: string }
    | { type: "image"; url: string }
  >;
  // 实际价格
  price: number;
  // 库存
  stock: number;
  // 重置库存时使用的默认值
  defaultStock?: number;
  // 商品状态
  status: ItemStatus;
  // 销量
  saleCount: number;
  // 接龙内是否优先展示
  recommend?: boolean;
  // 数字越小越靠前
  displayOrder?: number;
  // 是否被删除
  isDelete: boolean;
}
