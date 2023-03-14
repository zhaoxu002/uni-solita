// id查询商品
wx.cloud
  .callFunction({
    name: 'item',
    data: {
      method: 'getOne',
      _id: 'cde6ca9d640474aa0004e44506cf618f',
    },
  })
  .then((res) => {
    console.log(res);
  });

// 分页查询商品
wx.cloud
  .callFunction({
    name: 'item',
    data: {
      method: 'getListByPage',
      query: {},
      pageQuery: { curPage: 1, limit: 10 },
    },
  })
  .then((res) => {
    console.log(res);
  });

// 根据id删除商品
wx.cloud
  .callFunction({
    name: 'item',
    data: {
      method: 'removeOne',
      _id: 'cde6ca9d640474aa0004e44506cf618f',
    },
  })
  .then((res) => {
    console.log(res);
  });

// 创建商品
wx.cloud
  .callFunction({
    name: 'item',
    data: {
      method: 'createOne',
      data: {
        name: 'name2',
        title: 'title2',
        subTitle: 'subTitle2',
        defaultImg:
          'cloud://test-6guvdos0d2e13c77.7465-test-6guvdos0d2e13c77-1316929186/cloudbase-cms/upload/2023-03-01/fhlbx004svjig1li5tlegbsbhzdtxs57_.jfif',
        description: 'description2',
        price: 200,
        stock: 200,
      },
    },
  })
  .then((res) => {
    console.log(res);
  });

// 下架商品
wx.cloud
  .callFunction({
    name: 'item',
    data: {
      method: 'stopSell',
      _id: '93e4b6a064061f8a03300f8872d16e48',
    },
  })
  .then((res) => {
    console.log(res);
  });

// 上架商品
wx.cloud
  .callFunction({
    name: 'item',
    data: {
      method: 'startSell',
      _id: '93e4b6a064061f8a03300f8872d16e48',
    },
  })
  .then((res) => {
    console.log(res);
  });
