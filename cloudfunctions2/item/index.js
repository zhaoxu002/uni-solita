const {
  searchItemById,
  searchItemsByPage,
  removeItemById,
  createItem,
  stopSellItem,
  startSellItem,
} = require('./controller');

exports.main = async (event, context) => {
  switch (event.method) {
    case 'getOne':
      return await searchItemById(event, context);
    case 'getListByPage':
      return await searchItemsByPage(event, context);
    case 'removeOne':
      return await removeItemById(event, context);
    case 'createOne':
      return await createItem(event, context);
    case 'stopSell':
      return await stopSellItem(event, context);
    case 'startSell':
      return await startSellItem(event, context);
  }
};
