<template>
  <div class="container">
    <div class="info">
      <div class="row">
        <div class="label">银行转账 ANZ:</div>
        <div class="content">
          06-0193-0903969-00

          <div class="button" @click="handleCopyAccount">
            <uni-icons
              custom-prefix="iconfont"
              type="icon-copy"
              size="14"
            ></uni-icons>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="label">公司名称:</div>
        <div class="content">
          Salessmart Ltd

          <div class="button" @click="handleCopyName">
            <uni-icons
              custom-prefix="iconfont"
              type="icon-copy"
              size="14"
            ></uni-icons>
          </div>
        </div>
      </div>
    </div>
    <div class="activity-list">
      <div class="card" v-for="item of list" :key="item._id">
        <div class="name" @click="handleCheckActivity(item.purchaseId)">
          {{ item.purchaseTitle }}
        </div>

        <div class="body">
          <div class="flex">
            <div>
              <div class="secondary">下单时间：{{ item.createTime }}</div>
            </div>
          </div>

          <div
            v-for="good of item.orderItems"
            :key="good.itemId"
            class="item-info"
          >
            <image
              class="item-img"
              :src="good.itemDefaultImg"
              mode="aspectFill"
            ></image>

            <div class="item-desc">
              <div class="item-name">
                {{ good.itemName }}
              </div>

              <div class="item-detail-wrapper">
                <div class="item-detail">
                  价格：
                  <span> ${{ good.itemPrice }} </span>
                </div>

                <div class="item-detail">数量：{{ good.itemQuantity }}</div>
              </div>
            </div>
          </div>

          <div class="right font14">
            总金额：
            <span class="price">${{ item.totalAmount }}</span>
          </div>

          <div class="info">
            <div class="flex">
              <div class="title">自提点：</div>
              <div class="content">
                <div class="address">{{ item.detailAddress }}</div>
                <div class="address-info"></div>
              </div>
            </div>

            <div class="flex">
              <div class="title">电话号码：</div>
              <div class="content">{{ item.userPhone }}</div>
            </div>

            <div class="flex">
              <div class="title">备注：</div>
              <div class="content">{{ item.note }}</div>
            </div>
          </div>
        </div>
      </div>

      <uni-load-more
        :status="loadingStatus"
        @clickLoadMore="handleGetActivities"
      />
    </div>

    <div class="contact-container">
      <button class="contact" open-type="contact">联系客服</button>
    </div>
  </div>
</template>

<script>
import dayjs from "dayjs";

export default {
  data() {
    return {
      list: [],

      loadingStatus: "more",
      current: 1,
      pageSize: 20,
      total: 0,
    };
  },
  onLoad() {
    this.handleFetch();
  },

  onReachBottom() {
    this.handleFetch();
  },

  onPullDownRefresh() {
    this.current = 1;
    this.total = 0;
    this.list = [];
    this.handleFetch();
  },

  methods: {
    handleFetch() {
      if (this.loadingStatus === "loading") return;

      this.loadingStatus = "loading";

      wx.cloud
        .callFunction({
          name: "order",
          data: {
            method: "getListByUserOpenIdAndPage",
            pageQuery: {
              curPage: this.current,
              limit: this.pageSize,
            },
          },
        })
        .then((res) => {
          console.log("res", res.result);
          this.list = this.list.concat(
            res.result.data.data.map((item) => {
              return {
                ...item,
                createTime: dayjs(item.createTime).format(
                  "YYYY-MM-DD HH:mm:ss"
                ),
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

    handleCheckActivity(id) {
      uni.navigateTo({
        url: "/pages/activity/index?id=" + id,
      });
    },

    handleCopyAccount() {
      uni.setClipboardData({
        data: "06-0193-0903969-00",
      });
    },

    handleCopyName() {
      uni.setClipboardData({
        data: "Salessmart Ltd",
      });
    },
  },
};
</script>

<style lang="scss" scoped>
$price: #f5222d;

.container {
  /* margin-top: 88px; */
  background: #f7f9fa;
}
.info {
  background: #fff;
  padding: 16px;
  font-size: 14px;
  color: #333;
  line-height: 1.8;

  .row {
    display: flex;
  }
  .label {
    margin-right: 8px;
  }

  .button {
    margin-left: 8px;
  }

  .content {
    display: flex;
  }
}
.activity-list {
  box-sizing: border-box;
  padding: 16px;
  padding-bottom: 80px;
  min-height: 100vh;
}
.card {
  background-color: #fff;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;

  .name {
    display: -webkit-box;
    word-break: break-all;
    text-overflow: ellipsis;
    font-size: 16px;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2; //设置 需要显示的行数
    margin-bottom: 8px;
  }

  .item-info {
    display: flex;
    height: 40px;
    margin-bottom: 8px;

    .item-img {
      width: 40px;
      height: 40px;
      border-radius: 4px;
      margin-right: 8px;
      flex-shrink: 0;
    }

    .item-desc {
      display: flex;
      flex-grow: 1;
      justify-content: space-between;

      .item-name {
        display: -webkit-box;
        word-break: break-all;
        text-overflow: ellipsis;
        font-size: 14px;
        overflow: hidden;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2; //设置 需要显示的行数
      }
    }
  }
}
.flex {
  display: flex;
  justify-content: space-between;
}
.body {
  .bold {
    font-weight: bold;
    font-size: 28px;
  }
  .secondary {
    font-size: 12px;
    color: $uni-text-color-grey;
    margin-bottom: 8px;
  }

  .right {
    text-align: end;
  }
  .info {
    margin-top: 8px;
    font-size: 14px;
    .title {
      text-align: end;
      color: $uni-text-color-grey;
      width: 70px;
      flex-shrink: 0;
    }
    .content {
      color: $uni-text-color-grey;
    }
  }
}
.item-detail-wrapper {
  width: 100px;
  flex-shrink: 0;
  text-align: right;
  .item-detail {
    font-size: 12px;
  }
}
.price {
  color: $price;
}
.font14 {
  font-size: 14px;
}
.contact-container {
  position: fixed;
  bottom: 0;
  width: 100vw;
  padding: 16px;
  background: #fff;
  z-index: 10000;
  box-sizing: border-box;
}
</style>
