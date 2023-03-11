<template>
  <div class="container">
    <!-- <back-button /> -->

    <div class="header">标题</div>

    <div class="activity-list">
      <div class="card" v-for="item of list" :key="item._id">
        <div class="name">
          {{ item.purchaseTitle }}
        </div>

        <div class="body">
          <div class="flex">
            <div>
              <div class="secondary">下单时间：{{ item.createTime }}</div>
            </div>

            <!-- <div class="color">待支付</div> -->
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
              <div>
                {{ good.itemName }}
              </div>

              <div>
                <div>价格：${{ good.itemPrice }}</div>

                <div>数量：{{ good.itemQuantity }}</div>
              </div>
            </div>
          </div>

          <div class="right">总金额：${{ item.totalAmount }}</div>

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
          </div>
        </div>
      </div>
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
              curPage: 1,
              limit: 10,
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
        });
    },
  },
};
</script>

<style lang="scss">
.container {
  padding: 16px;
  /* margin-top: 88px; */
  background: #f7f9fa;
}
.header {
}
.activity-list {
}
.card {
  background-color: #fff;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;

  .name {
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
    }

    .item-desc {
      display: flex;
      flex-grow: 1;
      justify-content: space-between;
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
  }
  .color {
  }
  .right {
    text-align: end;
  }
  .info {
    margin-top: 8px;
    .title {
      text-align: end;
      color: $uni-text-color-grey;
    }
    .content {
      color: $uni-text-color-grey;
    }
  }
}
</style>
