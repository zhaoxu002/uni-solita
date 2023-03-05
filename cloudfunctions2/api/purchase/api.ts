// id查询团购
wx.cloud
  .callFunction({
    name: 'purchase',
    data: {
      method: 'getOne',
      _id: '2cc84e26640624f4033208a8355115ed',
    },
  })
  .then((res) => {
    console.log(res);
  });

// 分页查询团购
wx.cloud
  .callFunction({
    name: 'purchase',
    data: {
      method: 'getListByPage',
      query: {},
      pageQuery: { curPage: 1, limit: 10 },
    },
  })
  .then((res) => {
    console.log(res);
  });

// 根据id删除团购
wx.cloud
  .callFunction({
    name: 'purchase',
    data: {
      method: 'removeOne',
      _id: '2cc84e26640624f4033208a8355115ed',
    },
  })
  .then((res) => {
    console.log(res);
  });

// 创建团购
wx.cloud
  .callFunction({
    name: 'purchase',
    data: {
      method: 'createOne',
      data: {
        title: '测测今日团购',
        startTime: Date.now(),
        endTime: 1677407247000,
        itemIds: ['93e4b6a064061803032f89e712039a3a'],
        headImages: [
          'cloud://test-6guvdos0d2e13c77.7465-test-6guvdos0d2e13c77-1316929186/cloudbase-cms/upload/2023-03-02/jm8ssq428e221wp7fv6mjdexxwgoovsm_.jfif',
        ],
        description:
          '<p>测测团购</p><p>  </p><p>   </p><p>123</p><p></p><p></p><p>123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123</p><p></p><p></p><p>今年赚大钱今年赚大钱今年赚大钱今年赚大钱今年赚大钱今年赚大钱今年赚大钱今年赚大钱今年赚大钱今年赚大钱今年赚大钱今年赚大钱今年赚大钱今年赚大钱今年赚大钱今年赚大钱今年赚大钱今年赚大钱今年赚大钱</p><p></p><p>测测洲哥说的富文本能不能用</p><p style="text-align:center;">这个是剧中</p><p></p><p>试试插入图片</p><p></p><div class="media-wrap image-wrap"><img class="media-wrap image-wrap" src="https://7465-test-6guvdos0d2e13c77-1316929186.tcb.qcloud.la/cloudbase-cms/upload/2023-03-06/axukilwqtgw0cvugwskjsuobf1suhcyz_.webp?sign=acd0b61616fb89e2248217c4d1ec6ff8&amp;t=1678073748"/></div><p></p>',
        locationIds: ['fc8e646564060e0203272e1234557981'],
      },
    },
  })
  .then((res) => {
    console.log(res);
  });

// 修改团购
wx.cloud
  .callFunction({
    name: 'purchase',
    data: {
      method: 'updateOne',
      _id: '2cc84e26640624f4033208a8355115ed',
      data: {
        title: 'tuangou1',
      },
    },
  })
  .then((res) => {
    console.log(res);
  });
