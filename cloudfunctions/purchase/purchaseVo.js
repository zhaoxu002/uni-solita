const { nanoid } = require("nanoid");


module.exports = class Purchase {
  constructor({ title, startTime, endTime, itemIds, headImages, description, locationIds }) {
    const now = Date.now();
    const nanoId = nanoid(10);
    this.nanoId = nanoId;
    this.title = title;
    this.startTime = startTime || now;
    this.endTime = endTime;
    this.itemIds = itemIds;
    this.headImages = headImages;
    this.description = description;
    this.locationIds = locationIds;
    this.createTime = now;
    this.isDelete = false;
  }
};
