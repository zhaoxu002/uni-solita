const cloud = require("wx-server-sdk");
const daoUtils = require("./utils/daoUtil");
const Location = require("./locationVo");
const {
  createSuccessResponse,
  createPageSuccessResponse,
  createErrorResponse,
} = require("./utils/responseUtil");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

// 初始化数据库连接
const db = cloud.database();
const collection = db.collection("location");

const searchLocationById = async (event, context) => {
  const { _id } = event;
  try {
    const location = await daoUtils.getOne(collection, _id);
    return createSuccessResponse(location);
  } catch (error) {
    return createErrorResponse(error);
  }
};

const searchLocationByPage = async (event, context) => {
  const {
    query,
    pageQuery: { curPage, limit },
  } = event;
  try {
    const [list, { total }] = await Promise.all([
      daoUtils.getListByPage(collection, query, curPage - 1, limit),
      collection.where(query).count(),
    ]);
    return createPageSuccessResponse(list, total);
  } catch (error) {
    return createErrorResponse(error);
  }
};

const deleteLocationById = async (event, context) => {
  const { _id } = event;
  try {
    await daoUtils.deleteOne(collection, _id);
    return createSuccessResponse();
  } catch (error) {
    return createErrorResponse(error);
  }
};

const createLocation = async (event, context) => {
  const { data } = event;
  const vo = new Location(data);
  try {
    daoUtils.createOne(collection, vo);
    return createSuccessResponse();
  } catch (error) {
    return createErrorResponse(error);
  }
};

const modifyLocation = async (event, context) => {
  const { _id, data } = event;
  try {
    await daoUtils.updateOne(collection, _id, data);
    return createSuccessResponse();
  } catch (error) {
    return createErrorResponse(error);
  }
};

module.exports = {
  searchLocationById,
  searchLocationByPage,
  deleteLocationById,
  createLocation,
  modifyLocation,
};
