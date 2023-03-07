const {
  searchLocationById,
  searchLocationByPage,
  deleteLocationById,
  createLocation,
  modifyLocation,
} = require('./controller');

exports.main = async (event, context) => {
  switch (event.method) {
    case 'getOne':
      return await searchLocationById(event, context);
    case 'getListByPage':
      return await searchLocationByPage(event, context);
    case 'deleteOne':
      return await deleteLocationById(event, context);
    case 'createOne':
      return await createLocation(event, context);
    case 'updateOne':
      return await modifyLocation(event, context);
  }
};
