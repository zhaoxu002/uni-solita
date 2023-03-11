<template>
  <div>
    <image class="page-bg" mode="aspectFill" src="@/static/pinkbg.jpg" alt="" />
    <button @click="handleAccount">我的订单</button>
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
          <div v-for="order of item.orderList" :key="order._id" class="order">
            <div>
              <span>{{ order.userName }} &nbsp;</span>
              <!-- TODO: -->
              <span>&nbsp;{{ order.createTimeFromNow }} 购买了</span>
            </div>
            <div>
              <span>{{ order.itemTitle }}</span>
              <span>&nbsp;+{{ order.itemQuantity }}</span>
            </div>
          </div>
        </div>

        <div>
          <span v-if="(item.endTime * 1000) > now">进行中</span>
          <span v-else>已结束</span>
        </div>
      </view>

      <uni-load-more
        :status="loadingStatus"
        @clickLoadMore="handleGetActivities"
      />
    </view>
  </div>
</template>

<script>
import Vue from "vue";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
require("dayjs/locale/zh-cn");
dayjs.extend(relativeTime);
dayjs.locale("zh-cn");

export default Vue.extend({
  data() {
    return {
      title: "Hello",
      activities: [],
      now: Date.now(),

      loadingStatus: "more",
      current: 1,
      pageSize: 20,
      total: 0,
    };
  },
  onLoad() {
    this.handleGetActivities();
  },
  onPullDownRefresh() {
    this.current = 1;
    this.total = 0;
    this.handleGetActivities();
  },

  onReachBottom() {
    this.handleGetActivities();
  },
  methods: {
    handleGetActivities() {
      if (this.loadingStatus === "loading") return;

      this.loadingStatus = "loading";
      wx.cloud
        .callFunction({
          name: "purchase",
          data: {
            method: "getListByPage",
            query: {},
            pageQuery: { curPage: this.current, limit: this.pageSize },
          },
        })
        .then((res) => {
          this.activities = this.activities.concat(
            res.result.data.data.map((item) => {
              return {
                ...item,
                formatEndTime: dayjs(item.endTime * 1000).format(
                  "YYYY-MM-DD HH:mm:ss"
                ),
                startTimeFromNow: dayjs(item.startTime).fromNow(),
                orderList: item.orderList.map((order) => {
                  return {
                    ...order,
                    createTimeFromNow: dayjs(order.createTime).fromNow(),
                  };
                }),
              };
            })
          );

          this.total = res.result.data.total;

          if (res.result.data.data.length < this.pageSize) {
            this.loadingStatus = "noMore";
          } else {
            this.loadingStatus = "more";
          }

          this.current += 1;
        })
        .catch(() => {
          this.loadingStatus = "noMore";
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
.order {
  font-size: 12px;
  display: flex;
  color: $uni-text-color-grey;
  line-height: 1.8;
  justify-content: space-between;
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
