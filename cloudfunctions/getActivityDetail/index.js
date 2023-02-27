// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init({
  env: "test-6guvdos0d2e13c77",
}); // 使用当前云环境

// 初始化数据库连接
const db = cloud.database();
const _ = db.command;
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { id } = event;

  const activity = await db.collection("purchase").doc(id).get();

  const [goods, locations] = await Promise.all([
    db
      .collection("goods")
      .where({
        _id: _.in(activity.data.goods),
      })
      .get(),
    db
      .collection("pickup-location")
      .where({
        _id: _.in(activity.data.locationList),
      })
      .get(),
  ]);

  const result = {
    ...activity.data,
    goods: goods.data,
    locationList: locations.data,
  };

  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
    data: result,
  };
};
