
// 团购表
interface IPurchase {
  _id: string;
  // 标题
  title: string;
  // 创建时间
  createTime: Date;
  // 修改时间
  updateTime: Date;
  // 开始时间
  startTime: Date;
  // 结束时间
  endTime: Date;
  // 关联的商品
  itemIds: string[];
  // 列表卡片描述图片(最多3张)
  headImages: string[];
  // 商品描述(富文本)
  description: string;
  // 提货点ids
  locationIds: string[];
  // 是否被删除
  isDelete: boolean;
}
