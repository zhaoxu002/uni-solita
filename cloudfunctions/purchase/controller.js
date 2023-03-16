const cloud = require("wx-server-sdk");
const daoUtils = require("./utils/daoUtil");
const Purchase = require("./purchaseVo");
const {
  createSuccessResponse,
  createErrorResponse,
  createPageSuccessResponse,
} = require("./utils/responseUtil");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

// 初始化数据库连接
const db = cloud.database();
const _ = db.command;
const collection = db.collection("purchase");

const searchPurchaseById = async (event, context) => {
  const { _id } = event;
  try {
    const { list } = await collection
      .aggregate()
      .match({
        _id,
      })
      .lookup({
        from: "item",
        localField: "itemIds",
        foreignField: "_id",
        as: "items",
      })
      .lookup({
        from: "location",
        localField: "locationIds",
        foreignField: "_id",
        as: "locations",
      })
      .lookup({
        from: "orderItem",
        localField: "_id",
        foreignField: "activityId",
        as: "orderList",
      })
      .lookup({
        from: "order",
        localField: "_id",
        foreignField: "purchaseId",
        as: "orders",
      })
      .end();
    const [item] = list;
    const { orders, orderList, ...rest } = item;

    const res = {
      ...rest,
      orderList: orderList
        .map((orderItem) => {
          const { orderSn } = orderItem;
          let order = orders.find((order) => order.sn === orderSn);
          return {
            ...orderItem,
            ...order,
          };
        })
        .sort((a, b) => {
          return b.createTime - a.createTime;
        }),
    };

    return createSuccessResponse(res);
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
    const [{ list }, { total }] = await Promise.all([
      collection
        .aggregate()
        .match({
          ...query,
          isDelete: _.not(_.eq(true)),
        })
        .sort({
          createTime: -1,
        })
        .skip((curPage - 1) * limit)
        .limit(limit)
        .lookup({
          from: "orderItem",
          localField: "_id",
          foreignField: "activityId",
          as: "orderList",
        })
        .lookup({
          from: "order",
          localField: "_id",
          foreignField: "purchaseId",
          as: "orders",
        })
        .end(),

      collection
        .where({
          ...query,
          isDelete: _.not(_.eq(true)),
        })
        .count(),
    ]);

    const res = list.map((item) => {
      const { orders, orderList, ...rest } = item;

      return {
        ...rest,
        orderList: orderList
          .map((orderItem) => {
            const { orderSn } = orderItem;
            let order = orders.find((order) => order.sn === orderSn);
            return {
              ...orderItem,
              ...order,
            };
          })
          .sort((a, b) => {
            return b.createTime - a.createTime;
          }),
      };
    });

    return createPageSuccessResponse(res, total);
  } catch (error) {
    console.log(error);
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
