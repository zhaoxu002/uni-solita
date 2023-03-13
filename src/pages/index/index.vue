<template>
  <div>
    <image class="page-bg" mode="aspectFill" src="@/static/pinkbg.jpg" alt="" />
    <!-- <button @click="handleAccount">我的订单</button> -->
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
            <div class="activity-title">
              {{ item.title }}
            </div>
            <div class="text">{{ item.startTimeFromNow }} 发布</div>
            <div class="text">{{ item.formatEndTime }} 结束</div>
          </div>
        </div>
        <div>
          <div v-for="order of item.orderList" :key="order._id" class="order">
            <div>
              <span :style="{ marginRight: '4px' }">{{ order.userName }}</span>
              <!-- TODO: -->
              <span> {{ order.createTimeFromNow }}购买了</span>
            </div>
            <div>
              <span>{{ order.itemTitle }}</span>
              <span>&nbsp;+{{ order.itemQuantity }}</span>
            </div>
          </div>
        </div>

        <div class="status">
          <span class="active" v-if="item.endTime > now">进行中</span>
          <span class="disable" v-else>已结束</span>
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
      uni.cloud
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
                formatEndTime: dayjs(item.endTime).format(
                  "YYYY-MM-DD HH:mm:ss"
                ),
                startTimeFromNow: dayjs(item.startTime).fromNow(),
                orderList: item.orderList.slice(0, 5).map((order) => {
                  return {
                    ...order,
                    createTimeFromNow: dayjs(order.createTime).fromNow(),
                    userName: order.userName
                      .split("")
                      .map((s, index, arr) => {
                        if (index === arr.length - 1) return s;
                        return "*";
                      })
                      .join(""),
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
        })
        .finally(() => {
          uni.stopPullDownRefresh();
        });
    },

    handleCheckDetail(id) {
      uni.navigateTo({
        url: "/pages/activity/index?id=" + id,
      });
    },

    handleAccount() {
      uni.navigateTo({
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
    flex-shrink: 0;
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

.activity-title {
  display: -webkit-box;
  word-break: break-all;
  text-overflow: ellipsis;
  font-size: 16px;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2; //设置 需要显示的行数
}

.text {
  font-size: 14px;
  color: $uni-text-color;
}

.status {
  margin-top: 8px;
  line-height: 1;
  font-size: 12px;

  .active {
    color: #65bcbf;
  }
  .disable {
    color: $uni-text-color-disable;
  }
}
</style>
