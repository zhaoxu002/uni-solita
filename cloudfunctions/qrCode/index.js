// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
}) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const {
    page,
    scene
  } = event

  try {
    const result = await cloud.openapi.wxacode.getUnlimited({
        "page": page,
        "scene": scene,
        "checkPath": true,
        "envVersion": 'release'
      })
    return Buffer.from(result.buffer).toString('base64')
  } catch (err) {
    return err
  }
}
