const cloud = require("wx-server-sdk");
const daoUtils = require("./utils/daoUtil");
const Item = require("./itemVo");
const { assertAdmin } = require("./utils/adminUtil");
const { normalizeDescriptionBlocks, descriptionBlocksToHtml } = require("./utils/descriptionUtil");
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
const collection = db.collection("item");

const searchItemById = async (event, context) => {
  const { _id } = event;
  try {
    const item = await daoUtils.getOne(collection, _id);
    return createSuccessResponse(item);
  } catch (error) {
    return createErrorResponse(error);
  }
};

const searchItemsByPage = async (event, context) => {
  const {
    query,
    pageQuery: { curPage, limit },
  } = event;
  try {
    const [list, { total }] = await Promise.all([
      daoUtils.getListByPage(
        collection,
        { ...query, isDelete: _.not(_.eq(true)) },
        curPage - 1,
        limit
      ),
      collection.where({ ...query, isDelete: _.not(_.eq(true)) }).count(),
    ]);
    return createPageSuccessResponse(list, total);
  } catch (error) {
    return createErrorResponse(error);
  }
};

const removeItemById = async (event, context) => {
  const { _id } = event;
  try {
    await assertAdmin();
    await daoUtils.removeOne(collection, _id);
    return createSuccessResponse();
  } catch (error) {
    return createErrorResponse(error);
  }
};

const createItem = async (event, context) => {
  const { data } = event;
  try {
    await assertAdmin();
    const itemData = { ...data };
    if (Object.prototype.hasOwnProperty.call(data || {}, "descriptionBlocks")) {
      itemData.descriptionBlocks = normalizeDescriptionBlocks(data.descriptionBlocks);
      itemData.description = descriptionBlocksToHtml(itemData.descriptionBlocks);
    }
    const item = new Item(itemData);
    const result = await daoUtils.createOne(collection, item);
    return createSuccessResponse(result);
  } catch (error) {
    return createErrorResponse(error);
  }
};

// const modifyItem = async (event, context) => {
//   const { _id } = event;
//   try {
//     await daoUtils.updateOne(collection, _id, { status: 0 });
//   } catch (error) {
//     return createErrorResponse(error);
//   }
// };

const stopSellItem = async (event, context) => {
  const { _id } = event;
  try {
    await assertAdmin();
    await daoUtils.updateOne(collection, _id, { status: 0 });
    return createSuccessResponse();
  } catch (error) {
    return createErrorResponse(error);
  }
};

const startSellItem = async (event, context) => {
  const { _id } = event;
  try {
    await assertAdmin();
    await daoUtils.updateOne(collection, _id, { status: 1 });
    return createSuccessResponse();
  } catch (error) {
    return createErrorResponse(error);
  }
};

const reloadStock = async (event, context) => {
  try {
    await assertAdmin();
    const { ids } = event;
    const items = await daoUtils.getList(collection, {
      _id: _.in(ids),
    });
    const itemsHasDefaultStock = items.filter((item) => {
      return item.defaultStock > 0;
    });
    for (const item of itemsHasDefaultStock) {
      await daoUtils.updateOne(collection, item._id, {
        stock: item.defaultStock,
      });
    }
    return createSuccessResponse();
  } catch (e) {
    return createErrorResponse(e);
  }
};

const searchAdminItemsByPage = async (event) => {
  const {
    keyword = "",
    pageQuery: { curPage, limit },
  } = event;
  try {
    await assertAdmin();
    const baseCondition = { isDelete: _.not(_.eq(true)) };
    const trimmedKeyword = keyword.trim();
    let condition = baseCondition;

    if (trimmedKeyword) {
      const escapedKeyword = trimmedKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regexp = db.RegExp({ regexp: escapedKeyword, options: "i" });
      condition = _.and([
        baseCondition,
        _.or([{ title: regexp }, { name: regexp }, { subTitle: regexp }]),
      ]);
    }

    const [listResult, countResult] = await Promise.all([
      collection
        .where(condition)
        .orderBy("createTime", "desc")
        .skip((curPage - 1) * limit)
        .limit(limit)
        .get(),
      collection.where(condition).count(),
    ]);

    return createPageSuccessResponse(listResult.data, countResult.total);
  } catch (error) {
    return createErrorResponse(error);
  }
};

const modifyItem = async (event) => {
  const { _id, data = {} } = event;
  const allowedFields = [
    "name",
    "title",
    "subTitle",
    "defaultImg",
    "description",
    "descriptionBlocks",
    "price",
    "stock",
    "defaultStock",
    "status",
    "recommend",
    "displayOrder",
    "isDelete",
  ];
  const update = allowedFields.reduce((result, key) => {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      result[key] = data[key];
    }
    return result;
  }, {});
  if (Object.prototype.hasOwnProperty.call(data, "descriptionBlocks")) {
    update.descriptionBlocks = normalizeDescriptionBlocks(data.descriptionBlocks);
    update.description = descriptionBlocksToHtml(update.descriptionBlocks);
  }

  try {
    await assertAdmin();
    await daoUtils.updateOne(collection, _id, update);
    return createSuccessResponse();
  } catch (error) {
    return createErrorResponse(error);
  }
};

module.exports = {
  searchItemById,
  searchItemsByPage,
  removeItemById,
  createItem,
  stopSellItem,
  startSellItem,
  reloadStock,
  modifyItem,
  searchAdminItemsByPage,
};
