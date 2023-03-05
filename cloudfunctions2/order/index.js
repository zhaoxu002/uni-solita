const {
  searchOrderBySn,
  searchOrderByUserOpenIdAndPage,
  searchOrderByPage,
  removeOrderBySn,
  deleteOrderBySn,
  cancelOrderBySn,
  createOrder,
} = require('./controller');

exports.main = async (event, context) => {
  switch (event.method) {
    case 'getOneBySn':
      return await searchOrderBySn(event, context);
    case 'getListByUserOpenIdAndPage':
      return await searchOrderByUserOpenIdAndPage(event, context);
    case 'getListByPage':
      return await searchOrderByPage(event, context);
    case 'removeOneBySn':
      return await removeOrderBySn(event, context);
    case 'deleteOneBySn':
      return await deleteOrderBySn(event, context);
    case 'createOne':
      return await createOrder(event, context);
    case 'cancelOrderBySn':
      return await cancelOrderBySn(event, context);
  }
};
