// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    // 1.release - 正式
    // 2.test    - 测试
    // env: 'test'
    env: 'test-6guvdos0d2e13c77'
});

// 初始化数据库连接
const db = cloud.database();
const _ = db.command;


// 云函数入口函数
exports.main = async (event, context) => {
    // 我参与的数据
    const list = await db.collection('pickup-location').limit(1000).get();
    const wxContext = cloud.getWXContext()
  
  return {
      event,
      data: list.data,
      openid: wxContext.OPENID,
      appid: wxContext.APPID,
      unionid: wxContext.UNIONID,
  }
}