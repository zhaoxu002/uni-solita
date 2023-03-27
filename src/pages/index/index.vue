<template>
  <div>
    <image class="page-bg" src="@/static/indexbg.jpg" mode="aspectFill"></image>
    <uni-segmented-control
      :current="currentCategory"
      :values="categories"
      @clickItem="onClickCategory"
      styleType="text"
      activeColor="#f2828d"
    ></uni-segmented-control>
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
            <div class="text">{{ item.startTimeFromNow }} 开始</div>
            <div class="text">{{ item.formatEndTime }} 结束</div>
          </div>
        </div>
        <div>
          <div v-for="order of item.orderList" :key="order._id" class="order">
            <div>
              <span :style="{ marginRight: '4px' }">{{ order.userName }}</span>
              <span> {{ order.createTimeFromNow }}购买了</span>
            </div>
            <div class="line">
              <div class="ellipsis">{{ order.itemName }}</div>
              <div>&nbsp;+{{ order.itemQuantity }}</div>
            </div>
          </div>
        </div>

        <div class="status">
          <span class="disable" v-if="item.startTime > now">未开始</span>
          <span class="active" v-else-if="item.endTime > now">进行中</span>
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

const Categories = ["baby", "life", "sale"];

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

      categories: ["母婴", "生活", "秒杀"],
      currentCategory: 0,
      category: Categories[0],
    };
  },
  onLoad() {
    this.handleGetActivities();
  },
  onPullDownRefresh() {
    this.current = 1;
    this.total = 0;
    this.handleGetActivities(true);
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: "Becky 好物推荐社",
      path: "/pages/index/index",
      imageUrl: '/static/cardbg.jpg'
    };
  },
  onReachBottom() {
    this.handleGetActivities();
  },
  methods: {
    onClickCategory(e) {
      this.currentCategory = e.currentIndex;
      this.category = Categories[e.currentIndex];
      this.current = 1;
      this.total = 0;
      this.handleGetActivities(true);
    },
    handleGetActivities(reset = false) {
      if (this.loadingStatus === "loading") return;

      this.loadingStatus = "loading";
      uni.cloud
        .callFunction({
          name: "purchase",
          data: {
            method: "getListByPage",
            query: {
              category: this.category,
            },
            pageQuery: { curPage: this.current, limit: this.pageSize },
          },
        })
        .then((res) => {
          const list = res.result.data.data.map((item) => {
            return {
              ...item,
              formatEndTime: dayjs(item.endTime).format("YYYY-MM-DD HH:mm:ss"),
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
          });
          this.activities = reset ? list : this.activities.concat(list);

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
.line {
  display: flex;
}
.ellipsis {
  width: 30vw;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
