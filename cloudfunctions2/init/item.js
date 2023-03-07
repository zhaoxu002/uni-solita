// 云函数入口文件
const cloud = require('wx-server-sdk');
const daoUtils = require('../utils/daoUtil');
const Item = require('../item/itemVo');
const { createSuccessResponse, createErrorResponse } = require('../utils/responseUtil');

const imgUrl =
  'https://7465-test-6guvdos0d2e13c77-1316929186.tcb.qcloud.la/cloudbase-cms/upload/2023-02-24/7rpkq605w895xi7z6bntt6ncfnu15hfe_.jfif?sign=b9081100cf2fa57b8179a43ef3eb7eff&t=1677217464';
cloud.init({
  env: 'test-6guvdos0d2e13c77',
}); // 使用当前云环境

// 初始化数据库连接
const db = cloud.database();
const collection = db.collection('item');

exports.main = async (event, context) => {
  for (let i = 0; i < 10; i++) {
    const item = new Item(`name${i}`, `title${i}`, imgUrl, `description${i}`, i * 10, 0, 10 + i);
    try {
      daoUtils.createOne(collection, item);
    } catch (error) {
      return createErrorResponse(error);
    }
  }
  return createSuccessResponse();
};
