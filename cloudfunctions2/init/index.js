// 云函数入口函数
const item = require('./item');

exports.main = async (event, context) => {
  switch (event.type) {
    case 'item':
      return await item.main(event, context);
  }
};
