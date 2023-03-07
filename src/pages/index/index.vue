<template>
  <div>
    <image class="page-bg" mode="aspectFill" src="@/static/pinkbg.jpg" alt="" />
    <button @click="handleAccount">my</button>
    <view class="container">
      <view class="activity" v-for="(item, index) in activities" :key="index">
        <image
          class="activity-image"
          v-for="(pic, index) in item.headImages"
          :src="pic"
          mode="aspectFill"
        />
        {{ item.title }}

        <button @tap="handleCheckDetail(item._id)">点击查看</button>
      </view>
    </view>
  </div>
</template>

<script>
import Vue from "vue";

export default Vue.extend({
  data() {
    return {
      title: "Hello",
      activities: [],
    };
  },
  onLoad() {
    this.handleGetActivities();
  },
  methods: {
    handleGetActivities() {
      // wx.cloud
      //   .callFunction({
      //     name: "getActivities",
      //   })
      //   .then((res) => {
      //     console.log(res);
      //     // this.setData({
      //     //     activities: res.result.data
      //     // });
      //     this.activities = res.result.data;
      //   });
      wx.cloud
        .callFunction({
          name: "purchase",
          data: {
            method: "getListByPage",
            query: {},
            pageQuery: { curPage: 1, limit: 10 },
          },
        })
        .then((res) => {
          this.activities = res.result.data;
        });
    },

    handleCheckDetail(id) {
      // console.log(e.target.id);
      // wx.cloud
      //     .callFunction({
      //         name: 'getActivityDetail',
      //         data: {
      //             id: id
      //         }
      //     })
      //     .then((res) => {
      //         console.log(res.result.data);
      //     });
      wx.navigateTo({
        url: "/pages/activity/index?id=" + id,
      });
    },

    handleAccount() {
      wx.navigateTo({
        url: "/pages/person/index",
      });
    },
  },
});
</script>

<style scoped>
.page-bg {
  width: 100%;
  height: 30vh;
}

.container {
  background: #f7f9fa;
  padding: 16px;
  min-height: 100vh;
}

.activity {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.logo {
  height: 200rpx;
  width: 200rpx;
  margin: 200rpx auto 50rpx auto;
}

.text-area {
  display: flex;
  justify-content: center;
}

.title {
  font-size: 36rpx;
  color: #8f8f94;
}
.activity-image {
  width: 80px;
  height: 80px;
}
</style>
