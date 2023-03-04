// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: "test-6guvdos0d2e13c77",
}); // 使用当前云环境

// 初始化数据库连接
const db = cloud.database();
const _ = db.command;
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}