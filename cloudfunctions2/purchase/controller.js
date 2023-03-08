const cloud = require("wx-server-sdk");
const daoUtils = require("./utils/daoUtil");
const Purchase = require("./purchaseVo");
const {
  createSuccessResponse,
  createErrorResponse,
} = require("./utils/responseUtil");

cloud.init({
  env: "test-6guvdos0d2e13c77",
});

// 初始化数据库连接
const db = cloud.database();
const _ = db.command;
const collection = db.collection("purchase");
const itemCollection = db.collection("item");
const locationCollection = db.collection("location");
const orderItemCollection = db.collection("orderItem");

// TODO 获取团购的购买用户(数量)
// TODO 分页添加总数量
const searchPurchaseById = async (event, context) => {
  const { _id } = event;
  try {
    const purchase = await daoUtils.getOne(collection, _id);
    const { itemIds, locationIds } = purchase;
    const items = await daoUtils.getList(itemCollection, {
      _id: _.in(itemIds),
    });
    const locations = await daoUtils.getList(locationCollection, {
      _id: _.in(locationIds),
    });

    const orderItems = await daoUtils.getList(orderItemCollection, {
      activityId: _.eq(_id),
    });

    purchase.items = items;
    purchase.locations = locations;
    purchase.orderItems = orderItems;

    return createSuccessResponse(purchase);
  } catch (error) {
    return createErrorResponse(error);
  }
};

const searchPurchaseByPage = async (event, context) => {
  const {
    query,
    pageQuery: { curPage, limit },
  } = event;
  try {
    // const purchases = await daoUtils.getListByPage(
    //   collection,
    //   { ...query, isDelete: _.not(_.eq(true)) },
    //   curPage - 1,
    //   limit
    // );
    return collection
      .aggregate()
      .lookup({
        from: "orderItem",
        localField: "_id",
        foreignField: "activityId",
        as: "orderList",
      })
      .match({
        ...query,
        isDelete: _.not(_.eq(true)),
      })
      .sort({
        createTime: -1,
      })
      .skip((curPage - 1) * limit)
      .limit(limit)
      .end()
      .then((res) => {
        console.log(res);
        return createSuccessResponse(res.list)
      }).catch(err => {
        return createErrorResponse(err)
      })
    // return createSuccessResponse(purchases);
  } catch (error) {
    return createErrorResponse(error);
  }
};

const removePurchaseById = async (event, context) => {
  const { _id } = event;
  try {
    await daoUtils.removeOne(collection, _id);
    return createSuccessResponse();
  } catch (error) {
    return createErrorResponse(error);
  }
};

const createPurchase = async (event, context) => {
  const { data } = event;
  const vo = new Purchase(data);
  try {
    daoUtils.createOne(collection, vo);
    return createSuccessResponse();
  } catch (error) {
    return createErrorResponse(error);
  }
};

const modifyPurchase = async (event, context) => {
  const { _id, data } = event;
  try {
    await daoUtils.updateOne(collection, _id, data);
    return createSuccessResponse();
  } catch (error) {
    return createErrorResponse(error);
  }
};

module.exports = {
  searchPurchaseById,
  searchPurchaseByPage,
  removePurchaseById,
  createPurchase,
  modifyPurchase,
};
