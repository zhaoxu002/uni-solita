const cloud = require("wx-server-sdk");
const daoUtils = require("./utils/daoUtil");
const Item = require("./itemVo");
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
    await daoUtils.removeOne(collection, _id);
    return createSuccessResponse();
  } catch (error) {
    return createErrorResponse(error);
  }
};

const createItem = async (event, context) => {
  const { data } = event;
  const item = new Item(data);
  try {
    daoUtils.createOne(collection, item);
    return createSuccessResponse();
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
    await daoUtils.updateOne(collection, _id, { status: 0 });
    return createSuccessResponse();
  } catch (error) {
    return createErrorResponse(error);
  }
};

const startSellItem = async (event, context) => {
  const { _id } = event;
  try {
    await daoUtils.updateOne(collection, _id, { status: 1 });
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
};
