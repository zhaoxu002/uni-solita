<template>
  <view class="container">
    <!-- pages/activity/index.wxml -->
    <!-- <text>pages/activity/index.wxml</text> -->
    <back-button></back-button>
    <div>{{ title }}</div>
    <rich-text :nodes="description"></rich-text>
    <div class="good-container">
      <div class="good" v-for="item of goods" :key="item._id">
        <img class="good-img" mode="aspectFill" :src="item.images[0]" alt="">
        {{ item.name }}
        <div class="price">
          {{ item.price }}
        </div>
        <div class="origin-price">{{ item.originPrice }}</div>
      </div>
    </div>
  </view>
</template>

<script>
import backButton from '@/components/backButton.vue';
// pages/activity/index.js
export default {
  components: { backButton },
  data() {
    return {
      title: '',
      description: '',
      goods: [],
      locationList: []
    };
  }
    /**
     * 生命周期函数--监听页面加载
     */,
  onLoad(options) {
    const {
      id
    } = options

    wx.cloud.callFunction({
      name: 'getActivityDetail',
      data: {
        id
      }
    }).then(res => {
      console.log(res.result.data)
      const {
        description,
        title,
        goods,
        locationList,
        status,
        endTime
      } = res.result.data

      this.description = description
      this.title = title
      this.goods = goods
      this.locationList = locationList
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() { },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() { },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() { },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() { },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() { },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() { },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() { },
  methods: {}
};
</script>
<style scoped>
/* pages/activity/index.wxss */
.container {
  margin-top: 50px;
}
.good-container {
  display: flex;
  padding: 16rpx;
}

.good {
  margin: 16rpx;
  width: 327rpx;
  height: 600rpx;
  border-radius: 8px;
  overflow: hidden;
}

.good-img {
  width: 327rpx;
  height: 327rpx;
}
</style>
