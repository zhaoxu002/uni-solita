<template>
  <div class="container">
    <div v-if="isAdmin">
      <div v-for="(item, index) of activities" :key="item._id" class="activity">
        <div>
          <div class="title">{{ item.title }}</div>
          <div class="text">{{ item.startTimeFromNow }} 开始</div>
          <div class="text">{{ item.formatEndTime }} 结束</div>
        </div>
        <div class="status">
          <span class="disable" v-if="item.startTime > now">未开始</span>
          <span class="active" v-else-if="item.endTime > now">进行中</span>
          <span class="disable" v-else>已结束</span>
          &nbsp;
          <span class="show" v-if="item.isDelete === false">展示中</span>
          <span class="hide" v-if="item.isDelete === true">已隐藏</span>
        </div>

        <div class="line">
          <button
            size="mini"
            v-if="item.isDelete === true"
            @click="handleOpen(item._id)"
          >
            展示
          </button>
          <button
            size="mini"
            v-if="item.isDelete === false"
            @click="handleClose(item._id)"
          >
            隐藏
          </button>
          <button size="mini" @click="handleCheckDetail(item._id)">详情</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
require("dayjs/locale/zh-cn");
dayjs.extend(relativeTime);
dayjs.locale("zh-cn");

export default {
  data() {
    return {
      isAdmin: false,
      loading: "more",
      current: 1,
      pageSize: 20,
      total: 0,
      now: Date.now(),

      activities: [],
    };
  },

  mounted() {
    this.checkIsAdmin().then((isAdmin) => {
      if (isAdmin) {
        this.fetchList();
      }
    });
  },
  onReachBottom() {
    this.handleGetActivities();
  },
  onPullDownRefresh() {
    this.current = 1;
    this.total = 0;
    this.handleGetActivities(true);
  },
  methods: {
    fetchList(reset = false) {
      if (this.loading === "loading") return;

      this.loading = "loading";
      uni.cloud
        .callFunction({
          name: "purchase",
          data: {
            method: "getAllByPage",
            query: {
              category: this.category,
            },
            pageQuery: {
              curPage: this.current,
              limit: this.pageSize,
            },
          },
        })
        .then((res) => {
          const list = res.result.data.data.map((item) => {
            return {
              ...item,
              formatEndTime: dayjs(item.endTime).format("YYYY-MM-DD HH:mm:ss"),
              startTimeFromNow: dayjs(item.startTime).fromNow(),
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
    async checkIsAdmin() {
      return wx.cloud
        .callFunction({
          name: "checkIsAdmin",
        })
        .then((res) => {
          console.log(res);
          this.isAdmin = res.result.isAdmin;

          return res.result.isAdmin;
        });
    },

    handleClose(id) {
      uni.showModal({
        title: "确定要隐藏接龙吗？",
        content: "隐藏后将不再展示于首页",
        showCancel: true,
        success: (action) => {
          if (action.confirm) {
            wx.cloud
              .callFunction({
                name: "purchase",
                data: {
                  method: "updateOne",
                  _id: id,
                  data: {
                    isDelete: true,
                  },
                },
              })
              .then((res) => {
                if (res.result.success) {
                  uni.showToast({
                    title: "隐藏成功",
                  });
                  this.fetch(this.activityId);
                } else {
                  uni.showToast({
                    title: "隐藏失败",
                  });
                }
              });

            this.fetchList(true);
          }
        },
      });
    },

    handleOpen(id) {
      uni.showModal({
        title: "确定要展示接龙吗？",
        content: "该接龙将展示于首页",
        showCancel: true,
        success: (action) => {
          if (action.confirm) {
            wx.cloud
              .callFunction({
                name: "purchase",
                data: {
                  method: "updateOne",
                  _id: id,
                  data: {
                    isDelete: false,
                  },
                },
              })
              .then((res) => {
                if (res.result.success) {
                  uni.showToast({
                    title: "设置成功",
                  });
                  this.fetch(this.activityId);
                } else {
                  uni.showToast({
                    title: "设置失败",
                  });
                }
              });

            this.fetchList(true);
          }
        },
      });
    },

    handleCheckDetail(id) {
      uni.navigateTo({
        url: "/pages/activity/index?id=" + id,
      });
    },
  },
};
</script>

<style lang="scss">
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

  .title {
    font-size: 16px;
  }

  .text {
    font-size: 12px;
  }
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

  .show {
    color: #333;
  }

  .hide {
    color: #999;
  }
}
.line {
  margin-top: 8px;
  display: flex;
  justify-content: space-between;
}
</style>
