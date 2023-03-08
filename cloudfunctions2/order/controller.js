const cloud = require("wx-server-sdk");
const { nanoid } = require("nanoid");
const daoUtils = require("./utils/daoUtil");
const { Order, OrderItem } = require("./orderVo");
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
const orderCollection = db.collection("order");
const orderItemCollection = db.collection("orderItem");
const itemCollection = db.collection("item");
const purchaseCollection = db.collection("purchase");

const searchOrderBySn = async (event, context) => {
  const { sn } = event;
  try {
    const order = await daoUtils.getOneBySearch(orderCollection, { sn });
    const orderItems = await daoUtils.getList(orderItemCollection, {
      orderSn: sn,
    });
    order.items = orderItems;
    return createSuccessResponse(order);
  } catch (error) {
    return createErrorResponse(error);
  }
};

const searchOrderByUserOpenIdAndPage = async (event, context) => {
  const {
    // userOpenId,
    pageQuery: { curPage, limit },
  } = event;
  const { OPENID } = cloud.getWXContext();
  try {
    const orders = await daoUtils.getListByPage(
      orderCollection,
      { userOpenId: OPENID, isDelete: _.not(_.eq(true)) },
      curPage - 1,
      limit
    );
    if (orders && orders.length) {
      await Promise.all(
        orders.map(async (order) => {
          const { sn } = order;
          const orderItems = await daoUtils.getList(orderItemCollection, {
            orderSn: sn,
          });
          order.items = orderItems;
        })
      );
    }
    return createSuccessResponse(orders);
  } catch (error) {
    return createErrorResponse(error);
  }
};

const searchOrderByPage = async (event, context) => {
  const {
    query = {},
    pageQuery: { curPage, limit },
  } = event;
  try {
    const orders = await daoUtils.getListByPage(
      orderCollection,
      { ...query, isDelete: _.not(_.eq(true)) },
      curPage - 1,
      limit
    );
    if (orders && orders.length) {
      await Promise.all(
        orders.map(async (order) => {
          const { sn } = order;
          console.log("sn", sn);
          const orderItems = await daoUtils.getList(orderItemCollection, {
            orderSn: sn,
          });
          order.items = orderItems;
        })
      );
    }
    return createSuccessResponse(orders);
  } catch (error) {
    return createErrorResponse(error);
  }
};

const removeOrderBySn = async (event, context) => {
  const { sn } = event;
  try {
    await daoUtils.removeOneBySearch(orderCollection, { sn });
    return createSuccessResponse();
  } catch (error) {
    return createErrorResponse(error);
  }
};

const deleteOrderBySn = async (event, context) => {
  const { sn } = event;
  try {
    await db.runTransaction(async (transaction) => {
      const orderCollection = transaction.collection("order");
      const orderItemCollection = transaction.collection("orderItem");
      try {
        await daoUtils.deleteList(orderCollection, { sn });
      } catch (error) {
        transaction.rollback();
        return createErrorResponse(error);
      }
      try {
        await daoUtils.deleteList(orderItemCollection, { orderSn: sn });
      } catch (error) {
        transaction.rollback();
        return createErrorResponse(error);
      }
    });
    return createSuccessResponse();
  } catch (error) {
    return createErrorResponse(error);
  }
};

const createOrder = async (event, context) => {
  const { data: payload } = event;
  const wxContext = cloud.getWXContext();
  const { OPENID } = wxContext;

  const data = {
    ...payload,
    userOpenId: OPENID,
  };
  const { itemsInfo, purchaseId } = data;

  try {
    const purchase = await daoUtils.getOne(purchaseCollection, purchaseId);
    if (db.serverDate() > purchase.endTime) {
      return createErrorResponse("团购已结束");
    }
    if (db.serverDate() < purchase.startTime) {
      return createErrorResponse("团购还未开始");
    }
    // console.log('purchase==>', purchase);
    const itemIds = [];
    const itemIdMapQuantity = new Map();
    itemsInfo.forEach(({ itemId, itemQuantity }) => {
      itemIds.push(itemId);
      itemIdMapQuantity.set(itemId, itemQuantity);
    });
    // console.log('itemIds==>', itemIds);
    // console.log('itemIdMapQuantity==>', itemIdMapQuantity);
    const sn = nanoid();
    const orderVo = new Order(sn, data);
    const items = await daoUtils.getList(itemCollection, {
      _id: _.in(itemIds),
    });
    // console.log('items==>', items);
    const itemIdMapItem = new Map();
    items.forEach((item) => {
      itemIdMapItem.set(item._id, item);
    });
    let totalAmount = 0;
    for (let itemId of itemIds) {
      let currentItem = itemIdMapItem.get(itemId);
      let quantity = itemIdMapQuantity.get(itemId);
      if (quantity > currentItem.stock) {
        return createErrorResponse("库存不足");
      }
      totalAmount += quantity * currentItem.price;
    }
    orderVo.totalAmount = totalAmount;
    const orderItemVos = items.map((item) => {
      return new OrderItem(sn, itemIdMapQuantity.get(item._id), item);
    });
    // console.log('orderItemVos==>', orderItemVos);
    await db.runTransaction(async (transaction) => {
      const orderCollection = transaction.collection("order");
      const orderItemCollection = transaction.collection("orderItem");
      const itemCollection = transaction.collection("item");
      try {
        await daoUtils.createOne(orderCollection, orderVo);
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
      try {
        await Promise.all(
          orderItemVos.map(async (orderItemVo) => {
            await daoUtils.createOne(orderItemCollection, orderItemVo);
          })
        );
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
      try {
        await Promise.all(
          itemIds.map(async (itemId) => {
            const itemQuantity = itemIdMapQuantity.get(itemId);
            await daoUtils.updateOne(itemCollection, itemId, {
              stock: _.inc(-itemQuantity),
              saleCount: _.inc(itemQuantity),
            });
          })
        );
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    }, 3);
    return createSuccessResponse();
  } catch (error) {
    return createErrorResponse(error);
  }
};

const cancelOrderBySn = async (event, context) => {
  const { sn } = event;
  try {
    const orderItems = await daoUtils.getList(orderItemCollection, {
      orderSn: sn,
    });

    await db.runTransaction(async (transaction) => {
      const orderCollection = transaction.collection("order");
      const itemCollection = transaction.collection("item");
      try {
        await daoUtils.updateBySearch(orderCollection, { sn }, { status: 5 });
      } catch (error) {
        await transaction.rollback();
        throw error;
      }

      try {
        await Promise.all(
          orderItems.map(async (orderItem) => {
            const { itemId, itemQuantity } = orderItem;
            await daoUtils.updateOne(itemCollection, itemId, {
              stock: _.inc(itemQuantity),
              saleCount: _.inc(-itemQuantity),
            });
          })
        );
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    });
    return createSuccessResponse();
  } catch (error) {
    return createErrorResponse(error);
  }
};

module.exports = {
  searchOrderBySn,
  searchOrderByUserOpenIdAndPage,
  searchOrderByPage,
  removeOrderBySn,
  deleteOrderBySn,
  cancelOrderBySn,
  createOrder,
};
