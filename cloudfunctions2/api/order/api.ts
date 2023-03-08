// sn查询订单
wx.cloud
  .callFunction({
    name: 'order',
    data: {
      method: 'getOneBySn',
      sn: 'GASFBlOYthUoQ5KX7wuqD',
    },
  })
  .then((res) => {
    console.log(res);
  });

// 分页查询用户订单
wx.cloud
  .callFunction({
    name: 'order',
    data: {
      method: 'getListByUserOpenIdAndPage',
      userOpenId: 'oKLCX5R8T7xun8nZcs4x_LLrJ1Is',
      pageQuery: { curPage: 1, limit: 10 },
    },
  })
  .then((res) => {
    console.log(res);
  });

// 分页查询所有订单
wx.cloud
  .callFunction({
    name: 'order',
    data: {
      method: 'getListByPage',
      query: {},
      pageQuery: { curPage: 1, limit: 10 },
    },
  })
  .then((res) => {
    console.log(res);
  });

// 根据sn删除订单(软删除)
wx.cloud
  .callFunction({
    name: 'order',
    data: {
      method: 'removeOneBySn',
      sn: 'VX67qS8WO5YKrtwpk9r4c',
    },
  })
  .then((res) => {
    console.log(res);
  });

// 根据sn删除订单(硬删除)
wx.cloud
  .callFunction({
    name: 'order',
    data: {
      method: 'deleteOneBySn',
      sn: 'VX67qS8WO5YKrtwpk9r4c',
    },
  })
  .then((res) => {
    console.log(res);
  });

// 创建订单
wx.cloud
  .callFunction({
    name: 'order',
    data: {
      method: 'createOne',
      data: {
        purchaseId: '2cc84e26640624f4033208a8355115ed',
        userOpenId: 'oKLCX5R8T7xun8nZcs4x_LLrJ1Is',
        userPhone: 13122020795,
        note: 'note1',
        userName: 'zhao xu',
        locationId: 'fc8e646564060e0203272e1234557981',
        detailAddress: '94 Ngahue Drive Stonefields',
        itemsInfo: [
          { itemId: '93e4b6a064061803032f89e712039a3a', itemQuantity: 10 },
          { itemId: '93e4b6a064061f8a03300f8872d16e48', itemQuantity: 20 },
        ],
      },
    },
  })
  .then((res) => {
    console.log(res);
  });

// 取消订单
wx.cloud
  .callFunction({
    name: 'order',
    data: {
      method: 'cancelOrderBySn',
      sn: 'cde6ca9d640474aa0004e44506cf618f',
    },
  })
  .then((res) => {
    console.log(res);
  });
