const getOne = async (collection, _id) => {
  const result = await collection.doc(_id).get();
  return result.data;
};

const getList = async (collection, query) => {
  const result = await collection.where(query).orderBy('createTime', 'desc').get();
  return result.data;
};

const getListByPage = async (collection, query, curPage, limit) => {
  const result = await collection
    .where(query)
    .orderBy('createTime', 'desc')
    .skip(curPage * limit)
    .limit(limit)
    .get();
  return result.data;
};

const deleteOne = async (collection, _id) => {
  try {
    await collection.doc(_id).remove();
    return true;
  } catch (error) {
    throw error;
  }
};

const deleteList = async (collection, query) => {
  try {
    await collection.where(query).remove();
    return true;
  } catch (error) {
    throw error;
  }
};

const removeOne = async (collection, _id, statusCode) => {
  try {
    await collection.doc(_id).update({ status: statusCode });
    return true;
  } catch (error) {
    throw error;
  }
};

const removeList = async (collection, query, statusCode) => {
  try {
    await collection.where(query).update({ status: statusCode });
    return true;
  } catch (error) {
    throw error;
  }
};

const createOne = async (collection, data) => {
  try {
    const result = await collection.add({ data });
    return result;
  } catch (error) {
    throw error;
  }
};

const updateOne = async (collection, _id, data) => {
  try {
    await collection.doc(_id).update({ data });
    return true;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getOne,
  getList,
  getListByPage,
  deleteOne,
  deleteList,
  removeOne,
  removeList,
  createOne,
  updateOne,
};
