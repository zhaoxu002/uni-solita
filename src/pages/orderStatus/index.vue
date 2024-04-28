<template>
  <div>
    <div v-for="item of orders" :key="item.sn" class="order">
      <div>订单号：{{ item.sn }}</div>
      <div>
        用户昵称：{{ item.userName }}
        联系电话： {{ item.userPhone }}
      </div>
      <div>
        下单时间：{{ item.createTime }}
      </div>
      <div class="wrap">
        {{ item.items }}
      </div>
      <div>
        总金额：{{ item.totalAmount }}
      </div>
      <div>
        备注：{{ item.note }}
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from "dayjs";
export default {
  data() {
    return {
      id: "",
      orders: [],
      current: 1,
      pageSize: 20,
      total: 0,
      loadingStatus: "more",
    };
  },

  onLoad(options) {
    const { id } = options;
    this.id = id;
    this.fetch();
  },

  onReachBottom() {
    this.fitch();
  },

  onPullDownRefresh() {
    this.current = 1;
    this.total = 0;
    this.orders = [];
    this.fetch();
  },

  methods: {
    fetch() {
      const id = this.id;
      if (this.loadingStatus === "loading") return;

      this.loadingStatus = "loading";

      wx.cloud
        .callFunction({
          name: "order",
          data: {
            method: "searchOrdersByPurchaseId",
            id: id,
            pageQuery: {
              curPage: this.current,
              limit: this.pageSize,
            },
          },
        })
        .then((res) => {
          if (res.result.success) {
            console.log(res);
            const data = res.result.data.map((item) => {
              return {
                ...item,
                createTime: dayjs(item.createTime).format(
                  "YYYY-MM-DD HH:mm:ss"
                ),
              };
            });
            this.orders = this.orders.concat(data);
          }

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
  },
};
</script>
<style scoped lang="scss">
.order {
  padding: 16px;
  border-bottom: 1px solid #f6f6f6;
  font-size: 12px;
  line-height: 1.5;
}
.wrap {
  padding: 8px;
  background-color: #f6f6f6;
  white-space: pre-wrap;
}
</style>
