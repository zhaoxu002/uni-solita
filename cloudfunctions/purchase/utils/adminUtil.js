const cloud = require("wx-server-sdk");

const assertAdmin = async () => {
  const { OPENID } = cloud.getWXContext();
  const { data } = await cloud.database().collection("admin").where({
    openId: OPENID,
  }).limit(1).get();

  if (data.length !== 1) {
    throw new Error("无管理员权限");
  }
};

module.exports = {
  assertAdmin,
};
