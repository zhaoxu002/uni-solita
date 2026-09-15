interface IOriginPurchase {
  // _id: string;
  // createTime: Date;
  // updateTime: Date;
  title: string;
  startTime: Date;
  endTime: Date;
  itemIds: string[];
  headImages: string[];
  description: string;
  descriptionBlocks?: Array<
    | { type: "text"; content: string }
    | { type: "image"; url: string }
  >;
  locationIds: string[];
  isDelete: boolean;
}
