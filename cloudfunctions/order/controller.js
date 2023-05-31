const cloud = require("wx-server-sdk");
const { nanoid } = require("nanoid");
const XLSX = require("xlsx");
const getItemDescription = require("./utils/getItemDescription");
const daoUtils = require("./utils/daoUtil");
const { getTime } = require("./utils/getTime");
const { Order, OrderItem } = require("./orderVo");
const {
  createSuccessResponse,
  createErrorResponse,
  createPageSuccessResponse,
} = require("./utils/responseUtil");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
  // env: "production-2gohghtr3e52cd68",
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
      order.purchaseTitle =
        (order.purchase[0] && order.purchase[0].title) || "已删除的接龙";
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
    const sn = nanoid(4) + getTime();
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
    const res = await db.runTransaction(async (transaction) => {
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
        // await Promise.all(
        //   orderItemVos.map(async (orderItemVo) => {
        //     await daoUtils.createOne(orderItemCollection, orderItemVo);
        //   })
        // );
        for (const orderItemVo of orderItemVos) {
          await daoUtils.createOne(orderItemCollection, orderItemVo);
        }
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
      try {
        // await Promise.all(
        //   itemIds.map(async (itemId) => {
        //     const itemQuantity = itemIdMapQuantity.get(itemId);
        //     await daoUtils.updateOne(itemCollection, itemId, {
        //       stock: _.inc(-itemQuantity),
        //       saleCount: _.inc(itemQuantity),
        //     });
        //   })
        // );
        for (const itemId of itemIds) {
          const itemQuantity = itemIdMapQuantity.get(itemId);
          await daoUtils.updateOne(itemCollection, itemId, {
            stock: _.inc(-itemQuantity),
            saleCount: _.inc(itemQuantity),
          });
        }
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    }, 3);
    return createSuccessResponse(res);
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
        // await Promise.all(
        //   orderItems.map(async (orderItem) => {
        //     const { itemId, itemQuantity } = orderItem;
        //     await daoUtils.updateOne(itemCollection, itemId, {
        //       stock: _.inc(itemQuantity),
        //       saleCount: _.inc(-itemQuantity),
        //     });
        //   })
        // );
        for (const orderItemVo of orderItems) {
          const { itemId, itemQuantity } = orderItemVo;
          await daoUtils.updateOne(itemCollection, itemId, {
            stock: _.inc(itemQuantity),
            saleCount: _.inc(-itemQuantity),
          });
        }
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

const updateOrderComment = async (event, context) => {
  const { comment, id } = event;
  try {
    await daoUtils.updateOne(orderCollection, id, { note: comment });
    return createSuccessResponse();
  } catch (error) {
    return createErrorResponse(error);
  }
};

const exportOrdersByPurchaseId = async (event, context) => {
  const { purchaseId } = event;
  const { list } = await orderCollection
    .aggregate()
    .match({
      purchaseId: purchaseId,
      isDelete: _.not(_.eq(true)),
      status: _.not(_.eq(5)),
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
    .limit(10000)
    .end();
  const title = [
    "接龙名称",
    "买家昵称",
    "买家手机",
    "商品*数量",
    "总价",
    "备注",
  ];
  const addressMapXlsxBody = new Map();
  let purchaseTitle = "";
  for (let order of list) {
    const {
      purchase,
      userName,
      userPhone,
      orderItems,
      totalAmount,
      detailAddress,
      note,
    } = order;
    const validDetailAddress = detailAddress.replace("/", "-");
    if (!purchase[0]) {
      break;
    }
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
      note,
    ];
    if (addressMapXlsxBody.has(validDetailAddress)) {
      addressMapXlsxBody.get(validDetailAddress).push(curOrderDesc);
    } else {
      addressMapXlsxBody.set(validDetailAddress, [curOrderDesc]);
    }
  }
  const sheetOptions = {
    "!cols": [
      { width: 10 },
      { width: 10 },
      { width: 15 },
      { width: 30 },
      { width: 8 },
      { width: 30 },
    ],
  };

  // const excelContent = Array.from(addressMapXlsxBody.entries()).map(
  //   ([address, sheetContent]) => {
  //     sheetContent.unshift(title);
  //     return {
  //       name: address.substring(0, 16),
  //       data: sheetContent,
  //     };
  //   }
  // );
  console.log(addressMapXlsxBody);
  const workBook = XLSX.utils.book_new();
  Array.from(addressMapXlsxBody.entries()).forEach(
    ([address, sheetContent]) => {
      sheetContent.unshift(title);
      const sheet = XLSX.utils.aoa_to_sheet(sheetContent)
      sheet['!cols'] = [
        { wch: 10 },
        { wch: 20 },
        { wch: 15 },
        { wch: 50 },
        { wch: 10 },
        { wch: 30 },
      ]
      XLSX.utils.book_append_sheet(
        workBook,
        sheet,
        address.substring(0, 16)
      );
    }
  );
  const buffer = XLSX.write(workBook, { type: "buffer", bookType: "xlsx" });

  try {
    // let buffer = xlsx.build(excelContent);

    const { fileID } = await cloud.uploadFile({
      cloudPath: `${Date.now()}.xlsx`,
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
  updateOrderComment,
  exportOrdersByPurchaseId,
};
