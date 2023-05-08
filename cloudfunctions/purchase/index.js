const {
  searchPurchaseById,
  searchPurchaseByPage,
  searchPurchaseByNanoId,
  removePurchaseById,
  createPurchase,
  modifyPurchase,
  copyPurchaseById,
  batchAddNanoId
} = require("./controller");

exports.main = async (event, context) => {
  switch (event.method) {
    case "getOne":
      return await searchPurchaseById(event, context);
    case "getListByPage":
      return await searchPurchaseByPage(event, context);
    case "getOneByNanoId":
      return await searchPurchaseByNanoId(event, context);
    case "removeOne":
      return await removePurchaseById(event, context);
    case "createOne":
      return await createPurchase(event, context);
    case "updateOne":
      return await modifyPurchase(event, context);
    case "copyOne":
      return await copyPurchaseById(event, context);
    case 'batchAddNanoId':
      return await batchAddNanoId(event, context);
  }
};
