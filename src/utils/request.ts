interface Res {
  result: {
    code: number;
    data: any
  }
}

const request = function (param: {
  isHideToast: boolean;
  moduleName: string;
  url: string;
  data: any;
}) {
  const isHideToast = param.isHideToast || false;  //是否隐藏错误提示
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: param.moduleName || "main",
      // 传递给云函数的参数
      data: {
        $url:param.url,
        ...param.data
      }
    }).then((res: any) => {
      if (res.result) {
        if (res.result.code === 200) {
          resolve(res.result.data);
        } else {
          if (isHideToast) {
            uni.showToast({
              title: res.result.data.msg || '返回失败',
              duration: 1500,
              icon:'none'
            });
          }
          reject(res.result.data);
        }
      } else {
        uni.showToast({
          title: 'url不存在',
          duration: 1500,
          icon:'none'
        });
      }

    })
  })
}

export default request
