// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: 'test-6guvdos0d2e13c77' }) // 使用当前云环境
const db = cloud.database();
const _ = db.command;
const collection = db.collection("admin");
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { OPENID } = wxContext
  const admin = await collection.where({
    openId: _.eq(OPENID)
  }).get()
  console.log(admin)
  const isAdmin = admin.data.length === 1
  return {
    isAdmin
  }
}