<template>
  <page-meta
    :page-style="'overflow:' + (show ? 'hidden' : 'visible')"
  ></page-meta>
  <!-- eslint-disable-next-line vue/no-multiple-template-root -->
  <div class="container">
    <div class="header-info">
      <div class="row">
        <div class="label">电话:</div>
        <div class="content">
          09-222-1199

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
        <div class="label">地址:</div>
        <div class="content">
          Unit C, 252 Oteha Valley Road, Albany 0632

          <div class="button" @click="handleCopyName">
            <uni-icons
              custom-prefix="iconfont"
              type="icon-copy"
              size="14"
            ></uni-icons>
          </div>
        </div>
      </div>

      <div class="row" v-if="isAdmin">
        <button class="contact" @click="handleCheckAllActivities">查看全部接龙</button>
      </div>
    </div>
    <div class="activity-list">
      <div
        class="card"
        v-for="item of list"
        :key="item._id"
        :class="item.status === 5 && 'cancelled'"
      >
        <div class="name" @click="handleCheckActivity(item.purchaseId)">
          {{ item.purchaseTitle }}
        </div>

        <div class="body">
          <div class="flex-line">
            <div>
              <div class="secondary">下单时间：{{ item.createTime }}</div>
            </div>
          </div>

          <div class="flex-line">
            <div>
              <div class="secondary">订单ID： {{ item.sn }}</div>
            </div>
            <div>
              <div class="button" @click="handleCopySn(item.sn)">
                <uni-icons
                  custom-prefix="iconfont"
                  type="icon-copy"
                  size="12"
                ></uni-icons>
              </div>
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
              lazy-load
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

            <div class="flex" v-if="item.purchaseDeliveryTime">
              <div class="title">提货时间：</div>
              <div class="content">{{ item.deliveryTime }}</div>
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

        <div v-if="item.status === 5" class="flex-end">订单已取消</div>

        <div v-if="item.status !== 5 && !item.isEnd" class="flex-end">
          <button
            size="mini"
            plain
            class="edit-btn"
            @click="handleCancelOrder(item.sn)"
          >
            取消订单
          </button>
          <button
            size="mini"
            plain
            class="edit-btn"
            @click="handleUpdateComment(item)"
          >
            编辑备注
          </button>
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

    <uni-popup ref="popup" type="dialog">
      <uni-popup-dialog
        v-if="commentInput"
        ref="inputClose"
        mode="input"
        title="输入备注"
        :value="commentInput"
        placeholder="请输入内容"
        @confirm="handleConfirmUpdate"
      ></uni-popup-dialog>
    </uni-popup>
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
      isAdmin: false,
      show: false,
      commentInput: "",
      editing: "",
    };
  },
  mounted() {
    this.handleFetch();

    this.checkIsAdmin();
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
    checkIsAdmin() {
      console.log('admin')
      wx.cloud
        .callFunction({
          name: "checkIsAdmin",
        })
        .then((res) => {
          console.log(res);
          this.isAdmin = res.result.isAdmin;
        });
    },
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
                deliveryTime: dayjs(item.purchaseDeliveryTime).format(
                  "YYYY-MM-DD HH:mm:ss"
                ),
                isEnd: dayjs(item.purchaseEndTime).isBefore(dayjs()),
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

    refreshPageData() {
      this.current = 1;
      this.total = 0;
      this.list = [];
      this.handleFetch();
    },

    handleCheckActivity(id) {
      uni.navigateTo({
        url: "/pages/activity/index?id=" + id,
      });
    },

    handleCopyAccount() {
      uni.setClipboardData({
        data: "09-222-1199",
      });
    },

    handleCopyName() {
      uni.setClipboardData({
        data: "Unit C, 252 Oteha Valley Road, Albany 0632",
      });
    },

    handleCopySn(sn) {
      uni.setClipboardData({
        data: sn,
      });
    },

    handleCancelOrder(sn) {
      console.log(sn);
      uni.showModal({
        title: "确定要取消该订单吗？",
        content: "取消后无法恢复，如有需要请重新下单",
        success: (res) => {
          if (res.confirm) {
            console.log("用户点击确定");
            this.loading = true;

            wx.cloud
              .callFunction({
                name: "order",
                data: {
                  method: "cancelOrderBySn",
                  sn,
                },
              })
              .then((res) => {
                console.log(res);
                if (res.result.success) {
                  // success
                  uni.showToast({
                    title: "更新成功",
                    icon: "success",
                    duration: 1000,
                  });
                  this.refreshPageData();
                }
              });
          } else if (res.cancel) {
            console.log("用户点击取消");
          }
        },
      });
    },

    handleUpdateComment(item) {
      this.commentInput = item.note;
      this.editing = item._id;
      this.$refs.popup.open();
    },

    handleConfirmUpdate(text) {
      console.log(text);
      this.loading = true;
      wx.cloud
        .callFunction({
          name: "order",
          data: {
            method: "updateOrderComment",
            comment: text,
            id: this.editing,
          },
        })
        .then((res) => {
          if (res.result.success) {
            // success
            uni.showToast({
              title: "更新成功",
              icon: "success",
              duration: 1000,
            });

            this.refreshPageData();
          }
        });
    },
    change(e) {
      this.show = e.show;
    },

    handleCheckAllActivities() {
      uni.navigateTo({
        url: "/pages/list/index",
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
.header-info {
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
    flex-shrink: 0;
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

  &.cancelled {
    filter: grayscale(1) contrast(90%);
  }

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
    margin: 8px 0;

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
.flex-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
.flex-end {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 8px;
}
.edit-btn {
  margin-left: 8px;
  margin-right: 0;
}
</style>
