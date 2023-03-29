const {
  searchPurchaseById,
  searchPurchaseByPage,
  removePurchaseById,
  createPurchase,
  modifyPurchase,
  copyPurchaseById,
} = require("./controller");

exports.main = async (event, context) => {
  switch (event.method) {
    case "getOne":
      return await searchPurchaseById(event, context);
    case "getListByPage":
      return await searchPurchaseByPage(event, context);
    case "removeOne":
      return await removePurchaseById(event, context);
    case "createOne":
      return await createPurchase(event, context);
    case "updateOne":
      return await modifyPurchase(event, context);
    case "copyOne":
      return await copyPurchaseById(event, context);
  }
};
