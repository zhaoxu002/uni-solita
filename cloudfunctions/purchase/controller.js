const cloud = require("wx-server-sdk");
const daoUtils = require("./utils/daoUtil");
const Purchase = require("./purchaseVo");
const {
  createSuccessResponse,
  createErrorResponse,
  createPageSuccessResponse,
} = require("./utils/responseUtil");
const { nanoid } = require("nanoid");

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
    const { items, orders, orderList, locations, ...rest } = item;

    // sort item
    const sortedItems = items.sort((a, b) => {

      if (!a.displayOrder) return 1
      if (!b.displayOrder) return -1
      return a.displayOrder - b.displayOrder
    })

    // TODO: optimize limit
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
        })
        .slice(0, 3),
      locations: locations.sort((a, b) => {
        return a.description.localeCompare(b.description, "zh");
      }),
      items: sortedItems.filter(i => {
        return i.stock > 0
      })
    };

    return createSuccessResponse(res);
  } catch (error) {
    return createErrorResponse(error);
  }
};

const searchPurchaseByNanoId = async (event, context) => {
  try {
    const { nanoId } = event;
    const { data } = await collection
      .where({
        nanoId,
      })
      .get();

    if (data.length === 0) {
      return createErrorResponse("cannot found");
    }

    const [record] = data;
    const { _id } = record;

    return await searchPurchaseById({ _id }, context);
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
          _createTime: -1,
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
      // TODO: optimize limit
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
          })
          .slice(0, 3),
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

const copyPurchaseById = async (event) => {
  const { id } = event;
  try {
    const activity = await daoUtils.getOne(collection, id);
    console.log("activity", activity);
    const {
      _id,
      orderList,
      _createTime,
      _updateTime,
      isDelete,
      title,
      ...rest
    } = activity;

    const newActivity = {
      ...rest,
      title: title + "(副本)",
      _createTime: Date.now(),
      _updateTime: Date.now(),
      orderList: [],
      isDelete: true,
    };
    const result = await daoUtils.createOne(collection, newActivity);
    return createSuccessResponse(result);
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

const batchAddNanoId = async () => {
  try {
    const result = await db.runTransaction(async (transacation) => {
      try {
        const collection = transacation.collection("purchase");
        const list = await daoUtils.getList(collection, {});
        for (const item of list) {
          await daoUtils.updateOne(collection, item._id, {
            nanoId: nanoid(10),
          });
        }
      } catch (error) {
        transacation.rollback();
        throw error;
      }
    });

    return createSuccessResponse(result);
  } catch (error) {
    return createErrorResponse(error);
  }
};

module.exports = {
  searchPurchaseById,
  searchPurchaseByPage,
  searchPurchaseByNanoId,
  removePurchaseById,
  copyPurchaseById,
  createPurchase,
  modifyPurchase,
  batchAddNanoId,
};
