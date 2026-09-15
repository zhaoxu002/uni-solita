const { nanoid } = require("nanoid");


module.exports = class Purchase {
  constructor({ title, startTime, endTime, deliveryTime, itemIds, headImages, description, descriptionBlocks, locationIds, isDelete }) {
    const now = Date.now();
    const nanoId = nanoid(10);
    this.nanoId = nanoId;
    this.title = title;
    this.startTime = startTime || now;
    this.endTime = endTime;
    this.deliveryTime = deliveryTime;
    this.itemIds = itemIds || [];
    this.headImages = headImages || [];
    this.description = description;
    this.descriptionBlocks = descriptionBlocks || [];
    this.locationIds = locationIds || [];
    this.createTime = now;
    this.isDelete = Boolean(isDelete);
  }
};
