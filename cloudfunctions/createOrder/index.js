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
  const { activityId, locationId, goodList, totalPrice, phone, comment } =
    event;
  const result = await db.runTransaction(async (transaction) => {
    try {
      const orderRes = await transaction.collection("order").add({
        data: {
          source: activityId,
          openid: wxContext.OPENID,
          location: locationId,
          // goods,
          totalPrice,
          phone,
          comment,
        },
      });
      const orderId = orderRes._id;
      const detailResList = goodList.map(async (record) => {
        const { id, amount } = record;
        const res = await transaction.collection("orderDetail").add({
          data: {
            order: orderId,
            purchase: activityId,
            good: id,
            amount,
          },
        });
        return res;
      });

      return {
        success: true,
        orderRes,
        detailResList,
      };
    } catch (error) {
      transaction.rollback(-100);
    }
  });

  return {
    result: result.data,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  };
};
