<template>
  <div>
    <image class="page-bg" mode="aspectFill" src="@/static/pinkbg.jpg" alt="" />
    <button @click="handleAccount">my</button>
    <view class="container">
      <view
        class="activity"
        v-for="(item, index) in activities"
        :key="index"
        @tap="handleCheckDetail(item._id)"
      >
        <div class="info-content">
          <image
            class="activity-image"
            :src="item.headImages[0]"
            mode="aspectFill"
          />
          <div>
            <div>{{ item.startTimeFromNow }} 发布</div>
            <div>
              {{ item.formatEndTime }}
            </div>
            <div>
              {{ item.title }}
            </div>
          </div>
        </div>
        <div>
          <div v-for="order of item.orderList" :key="order._id">
            {{ order.userName }}
            <!-- TODO: -->
            {{ order.createTime }}
            {{ order.itemTitle }}
            {{ order.itemQuantity }}
          </div>
        </div>
      </view>
    </view>
  </div>
</template>

<script>
import Vue from "vue";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
require('dayjs/locale/zh-cn')
dayjs.extend(relativeTime);
dayjs.locale("zh-cn");

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
          this.activities = res.result.data.map((item) => {
            return {
              ...item,
              formatEndTime: dayjs(item.endTime * 1000).format(
                "YYYY-MM-DD HH:mm:ss"
              ),
              startTimeFromNow: dayjs(item.startTime).fromNow(),
            };
          });
        });
    },

    handleCheckDetail(id) {
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

<style lang="scss" scoped>
.page-bg {
  width: 100%;
  height: 30vh;
}

.container {
  background: $uni-bg-color-grey;
  padding: 16px;
  min-height: 100vh;
}

.activity {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;

  .info-content {
    display: flex;
  }

  .activity-image {
    width: 80px;
    height: 80px;
    border-radius: 4px;
    margin-right: 8px;
  }
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
</style>
