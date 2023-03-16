const cloud = require("wx-server-sdk");
const { nanoid } = require("nanoid");
const xlsx = require("node-xlsx");
const getItemDescription = require("./utils/getItemDescription");
const daoUtils = require("./utils/daoUtil");
const { Order, OrderItem } = require("./orderVo");
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
const orderCollection = db.collection("order");
const orderItemCollection = db.collection("orderItem");
const itemCollection = db.collection("item");
const purchaseCollection = db.collection("purchase");

const searchOrderBySn = async (event, context) => {
  const { sn } = event;
  try {
    const { list } = await collection
      .aggregate()
      .match({
        sn,
      })
      .lookup({
        from: "orderItem",
        localField: "sn",
        foreignField: "orderSn",
        as: "items",
      })
      .end();
    return createSuccessResponse(list);
  } catch (error) {
    return createErrorResponse(error);
  }
};

const searchOrderByUserOpenIdAndPage = async (event, context) => {
  const {
    pageQuery: { curPage, limit },
  } = event;
  const { OPENID } = cloud.getWXContext();
  try {
    const [{ list }, { total }] = await Promise.all([
      orderCollection
        .aggregate()
        .match({
          userOpenId: OPENID,
          isDelete: _.not(_.eq(true)),
        })
        .sort({
          createTime: -1,
        })
        .skip((curPage - 1) * limit)
        .limit(limit)
        .lookup({
          from: "orderItem",
          localField: "sn",
          foreignField: "orderSn",
          as: "orderItems",
        })
        .lookup({
          from: "purchase",
          localField: "purchaseId",
          foreignField: "_id",
          as: "purchase",
        })
        .end(),

      orderCollection
        .where({
          userOpenId: OPENID,
          isDelete: _.not(_.eq(true)),
        })
        .count(),
    ]);
    list.forEach((order) => {
      order.purchaseTitle = order.purchase[0].title;
      delete order.purchase;
    });
    return createPageSuccessResponse(list, total);
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
    const itemIds = [];
    const itemIdMapQuantity = new Map();
    itemsInfo.forEach(({ itemId, itemQuantity }) => {
      itemIds.push(itemId);
      itemIdMapQuantity.set(itemId, itemQuantity);
    });
    const sn = nanoid();
    const orderVo = new Order(sn, data);
    const items = await daoUtils.getList(itemCollection, {
      _id: _.in(itemIds),
    });
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
      return new OrderItem(
        sn,
        itemIdMapQuantity.get(item._id),
        { ...item, userName: data.userName },
        purchase._id
      );
    });
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

const exportOrdersByPurchaseId = async (event, context) => {
  const { _id } = event;
  const { list } = await orderCollection
    .aggregate()
    .match({
      purchaseId: _id,
      isDelete: _.not(_.eq(true)),
    })
    .sort({
      detailAddress: -1,
      createTime: -1,
    })
    .lookup({
      from: "orderItem",
      localField: "sn",
      foreignField: "orderSn",
      as: "orderItems",
    })
    .lookup({
      from: "purchase",
      localField: "purchaseId",
      foreignField: "_id",
      as: "purchase",
    })
    .end();
  const title = [
    "接龙名称",
    "买家昵称",
    "买家手机",
    "商品*数量",
    "总价",
    "自提点",
  ];
  let addressMapXlsxBody = new Map();
  let purchaseTitle = "";
  for (let order of list) {
    const {
      purchase,
      userName,
      userPhone,
      orderItems,
      totalAmount,
      detailAddress,
    } = order;
    const curPurchaseTitle = purchase[0].title;
    if (!purchaseTitle) {
      purchaseTitle = curPurchaseTitle;
    }
    const curOrderDesc = [
      curPurchaseTitle,
      userName,
      userPhone,
      getItemDescription(orderItems),
      totalAmount,
      detailAddress,
    ];
    if (addressMapXlsxBody.has(detailAddress)) {
      addressMapXlsxBody.get(detailAddress).push(curOrderDesc);
    } else {
      addressMapXlsxBody.set(detailAddress, [curOrderDesc]);
    }
  }

  const excelContent = Array.from(addressMapXlsxBody.entries()).map(
    ([address, sheetContent]) => {
      sheetContent.unshift(title);
      return {
        name: address.substring(0, 16),
        data: sheetContent,
      };
    }
  );

  try {
    let buffer = await xlsx.build(excelContent);

    const { fileID } = await cloud.uploadFile({
      cloudPath: `${purchaseTitle}-${Date.now()}.xlsx`,
      fileContent: buffer,
    });

    return createSuccessResponse({ fileID });
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
  exportOrdersByPurchaseId,
};
