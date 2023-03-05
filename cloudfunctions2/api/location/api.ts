// id查询提货点
wx.cloud
  .callFunction({
    name: 'location',
    data: {
      method: 'getOne',
      _id: 'cde6ca9d640474aa0004e44506cf618f',
    },
  })
  .then((res) => {
    console.log(res);
  });

// 分页查询提货点
wx.cloud
  .callFunction({
    name: 'location',
    data: {
      method: 'getListByPage',
      query: {},
      pageQuery: { curPage: 1, limit: 10 },
    },
  })
  .then((res) => {
    console.log(res);
  });

// 根据id删除提货点
wx.cloud
  .callFunction({
    name: 'location',
    data: {
      method: 'deleteOne',
      _id: 'cde6ca9d640474aa0004e44506cf618f',
    },
  })
  .then((res) => {
    console.log(res);
  });

// 创建提货点
wx.cloud
  .callFunction({
    name: 'location',
    data: {
      method: 'createOne',
      data: {
        detailAddress: 'Waru Lane, Te Atatū Peninsula, Auckland 0610',
        description: '半岛',
      },
    },
  })
  .then((res) => {
    console.log(res);
  });

// 修改提货点
wx.cloud
  .callFunction({
    name: 'location',
    data: {
      method: 'updateOne',
      _id: 'fc8e646564060e0203272e1234557981',
      data: { detailAddress: '94 Ngahue Drive Stonefields', description: '拿噶修' },
    },
  })
  .then((res) => {
    console.log(res);
  });
