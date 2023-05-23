<template>
  <page-meta
    :page-style="'overflow:' + (pageContainerShow ? 'hidden' : 'visible')"
  ></page-meta>
  <!-- eslint-disable-next-line vue/no-multiple-template-root -->
  <view>
    <div class="head-img-container">
      <img :src="headImages[0]" class="head-img" mode="aspectFill" lazy-load />

      <button class="share" size="mini" open-type="share" plain>
        <uni-icons
          custom-prefix="iconfont"
          type="icon-share"
          size="14"
        ></uni-icons>
        分享
      </button>
      <button v-if="isAdmin" class="export" size="mini" @click="handleExport">
        导出订单信息
      </button>
      <button v-if="isAdmin" class="copy" size="mini" @click="handleCopy">
        复制接龙
      </button>
      <button
        v-if="isAdmin"
        class="share-qr"
        size="mini"
        @click="handleShareQr"
      >
        分享图片
      </button>
    </div>

    <div class="container">
      <div class="info-container">
        <div class="title">{{ title }}</div>
        <div class="status" v-if="isActivityEnd">
          {{ formatStartTime }} 开始
        </div>
        <div v-if="endTime" class="status">{{ formatEndTime }} 结束</div>
        <mp-html
          class="rich-text"
          :tag-style="{
            p: 'min-height: 1rem',
          }"
          :content="description"
          container-style="word-break:break-all;white-space:pre-wrap;"
        ></mp-html>
      </div>

      <div class="good-container">
        <div class="good" v-for="item of goods" :key="item._id">
          <img
            class="good-img"
            lazy-load
            mode="aspectFill"
            :src="item.defaultImg"
            alt=""
            @click="handleCheckDetail(item)"
          />
          <div class="recommend" v-if="item.recommend">推荐</div>
          <div class="good-info">
            <div class="name">{{ item.name }}</div>
            <div class="price">
              $ {{ item.price }}
              <!-- <text>/</text> -->
              <span>/{{ item.unit || "个" }}</span>
            </div>
            <div class="origin-price">{{ item.originPrice }}</div>
            <div class="stock">库存：{{ item.stock }}</div>

            <uni-number-box
              v-model="item.amount"
              :min="0"
              :step="1"
              :max="item.stock"
              background="#f2828d"
            />
          </div>
        </div>
      </div>

      <div class="record-container">
        <div v-for="order of records" :key="order._id" class="order">
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
      <div class="space"></div>
      <div v-if="selected.selectedPrice > 0" class="bottom-bar">
        <div class="bar-content">
          <div @click="handleShowSelected" class="font14">
            总价：
            <span class="price">$ {{ selected.selectedPrice }}</span>
          </div>

          <div
            class="confirm"
            :class="isActivityEnd && 'end'"
            @click="handleConfirm"
          >
            下单
          </div>
        </div>
      </div>

      <uni-popup
        ref="popup"
        type="bottom"
        background-color="#fff"
        @change="handlePopupChange"
      >
        <div class="padding-16">
          <div class="flex margin-bottom-8">
            <image
              :src="goodDetail.defaultImg"
              class="good-image"
              mode="aspectFill"
              lazy-load
              @click="handlePreviewImage(goodDetail.defaultImg)"
            />
            <div>
              <div class="name">{{ goodDetail.name }}</div>
              <div class="price">
                $ {{ goodDetail.price }}
                <span>/{{ goodDetail.unit || "个" }}</span>
              </div>
              <div class="origin-price">{{ item.originPrice }}</div>

              <div class="stock">库存：{{ goodDetail.stock }}</div>
            </div>
          </div>
          <uni-number-box
            v-model="goodDetail.amount"
            :step="1"
            :min="0"
            :max="goodDetail.stock"
            background="#f2828d"
          />
        </div>
        <scroll-view scroll-y class="good-detail">
          <div class="padding-16 margin-bottom-60">
            <div v-for="(img, index) of goodDetail.images" :key="index">
              <image
                class="img-list-item"
                mode="aspectFit"
                :src="img"
                lazy-load
              />
            </div>

            <mp-html
              class="rich-text"
              :tag-style="{
                p: 'min-height: 1rem',
              }"
              :content="goodDetail.description"
              container-style="word-break:break-all;white-space:pre-wrap;"
            />
          </div>
        </scroll-view>
      </uni-popup>

      <uni-popup ref="selectedPopup" type="bottom" background-color="#fff">
        <div class="popup-container">
          <div
            class="selected-item"
            v-for="item of selected.selectedGoods"
            :key="item._id"
          >
            <img
              :src="item.defaultImg"
              class="image"
              mode="aspectFill"
              lazy-load
            />

            <div class="info">
              <div class="name">
                {{ item.name }}
              </div>

              <div>数量：{{ item.amount }}</div>

              <div>
                单价：
                <span class="price">$ {{ item.price }}</span>
              </div>
            </div>
          </div>
        </div>
      </uni-popup>
    </div>

    <c-canvas
      ref="cCanvas"
      :isAuto="false"
      @drawSuccess="onDrawSuccess"
      :drawData="canvasData"
      :width="480"
      :height="720"
    />

  </view>
</template>

<script>
import store from "@/store/index";
import formatImage from "@/utils/formatHTMLImage";
import dayjs from "dayjs";
import mpHtml from "@/uni_modules/mp-html/components/mp-html/mp-html.vue";
import cCanvas from "@/uni_modules/c-canvas/components/c-canvas/c-canvas.vue";

export default {
  components: { mpHtml, cCanvas },
  data() {
    return {
      activityId: "",
      nanoId: "",
      title: "",
      now: Date.now(),
      description: "",
      endTime: 0,
      startTime: 0,
      goods: [],
      records: [],
      headImages: [],
      isAdmin: false,

      pageContainerShow: false,
      goodDetail: null,

      qrcode: "",
      canvasData: [],
    };
  },

  computed: {
    formatEndTime() {
      return dayjs(this.endTime).format("YYYY-MM-DD HH:mm:ss");
    },
    formatStartTime() {
      return dayjs(this.startTime).format("YYYY-MM-DD HH:mm:ss");
    },
    selected() {
      const selectedGoods = this.goods.filter((item) => item.amount > 0);
      const selectedPrice = selectedGoods
        .reduce((acc, cur) => {
          return acc + cur.price * cur.amount;
        }, 0)
        .toFixed(2);
      return {
        selectedGoods,
        selectedPrice,
      };
    },
    cart() {
      return store.state.cart;
    },

    isActivityEnd() {
      return this.endTime < this.now || this.startTime > this.now;
    },
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const { id, scene } = options;

    if (scene) {
      this.fetch(decodeURIComponent(scene))
    } else {
      this.fetch(id);
    }
    this.checkIsAdmin();
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    // this.$store.commit('updateCart', [])
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {},
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {},
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: this.title,
      path: "/pages/activity/index?id=" + this.activityId,
      // imageUrl: "/static/cardbg.jpg",
      imageUrl: this.headImages[0],
    };
  },
  methods: {
    fetch(id) {
      console.log('fetch')
      wx.cloud
        .callFunction({
          name: "purchase",
          data: {
            method: "getOne",
            _id: id,
          },
        })
        .then((res) => {
          this.process(res);
        });
    },
    fetchByNanoId(nanoId) {
      console.log('nanoid', nanoId)
      wx.cloud
        .callFunction({
          name: "purchase",
          data: {
            method: "getOneByNanoId",
            nanoId: nanoId,
          },
        })
        .then((res) => {
          this.process(res);
        });
    },
    process(res) {
      console.log(res.result.data);
      const {
        description,
        title,
        items,
        locations,
        startTime,
        endTime,
        orderList,
        headImages,
        nanoId,
        _id,
      } = res.result.data;

      this.activityId = _id;
      this.nanoId = nanoId;
      this.endTime = endTime;
      this.startTime = startTime;
      this.description = formatImage(description);
      this.title = title;
      this.goods = [
        ...items.filter((i) => i.recommend === true),
        ...items.filter((i) => !i.recommend),
      ].map((item) => {
        return {
          ...item,
          amount: 0,
        };
      });
      this.records = orderList.map((order) => {
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
      });
      this.headImages = headImages;
      store.commit("updateLocationList", locations);
    },

    checkIsAdmin() {
      wx.cloud
        .callFunction({
          name: "checkIsAdmin",
        })
        .then((res) => {
          console.log(res);
          this.isAdmin = res.result.isAdmin;
        });
    },
    handleAddCurrentToCart() {
      if (this.isActivityEnd) {
        uni.showToast({
          title: "该活动已结束",
          icon: "error",
          duration: 2000,
        });
        return;
      }

      const newGoods = this.goods.map((item) => {
        if (item._id === this.goodDetail._id) {
          return {
            ...item,
            amount: this.goodDetail.amount,
          };
        }
        return item;
      });

      this.goods = newGoods;
      this.goodDetail = null;
      this.$refs.popup.close();
    },
    handleCheckDetail(item) {
      this.goodDetail = item;

      this.$refs.popup.open("bottom");
    },
    handlePopupChange(e) {
      this.pageContainerShow = e.show;
    },
    handleShowSelected() {
      this.$refs.selectedPopup.open("bottom");
    },

    handleConfirm() {
      if (this.isActivityEnd) {
        const status = this.endTime < this.now ? "已结束" : "未开始";
        uni.showToast({
          title: "该活动" + status,
          icon: "error",
          duration: 2000,
        });
        return;
      }

      store.commit("updateCart", {
        activityId: this.activityId,
        goods: this.selected.selectedGoods,
      });

      uni.navigateTo({
        url: "/pages/order/index?id=" + this.activityId,
      });
    },

    handleExport() {
      // TODO
      wx.cloud
        .callFunction({
          name: "order",
          data: {
            method: "exportExcel",
            purchaseId: this.activityId,
          },
        })
        .then((res) => {
          const { fileID } = res.result.data;
          console.log(fileID);
          wx.cloud.downloadFile({
            fileID, // 文件 ID
            success: (res) => {
              const filePath = res.tempFilePath;
              wx.openDocument({
                filePath,
                showMenu: true,
              });
            },
            fail: console.error,
          });
        });
    },

    handleCopy() {
      wx.cloud
        .callFunction({
          name: "purchase",
          data: {
            method: "copyOne",
            id: this.activityId,
          },
        })
        .then((res) => {
          if (res.result.success === true) {
            // wx.showModal({
            //   title: "复制成功",
            //   content: "请前往后台继续编辑",
            //   showCancel: false,
            // });
            const { _id } = res.result.data;
            uni.navigateTo({
              url: "/pages/edit/index?id=" + _id,
            });
          } else {
            wx.showToast({
              title: "复制失败",
              icon: "error",
            });
          }
        });
    },

    handlePreviewImage(url) {
      console.log("sb", url);
      uni.previewImage({
        urls: [url],
      });
    },

    handleShareQr() {
      uni.showLoading();
      wx.cloud
        .callFunction({
          name: "qrCode",
          data: {
            page: "pages/activity/index",
            scene: this.activityId,
          },
        })
        .then(async (res) => {
          console.log(res);

          this.qrcode = "data:image/jpeg;charset=utf-8;base64," + res.result;
          const {
            fileList: [headImage],
          } = await uni.cloud.getTempFileURL({
            fileList: [this.headImages[0]],
          });
          console.log('head',headImage);
          this.canvasData = [
            {
              type: "image",
              x: 0,
              y: 0,
              value: headImage.tempFileURL,
              width: 480,
              height: 480,
            },
            {
              type: "text",
              x: 16,
              y: 524,
              value: this.title,
              color: "#262626",
              lineMaxWidth: 425,
              lineHeight: 30,
              lineNum: 2,
              font: "normal normal bold 24px Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, SimSun, sans-serif;",
            },
            {
              type: "text",
              x: 16,
              y: 638,
              color: "#999",
              value: "长按扫码，参与接龙",
              lineMaxWidth: 350,
              lineHeight: 30,
              lineNum: 2,
              font: "normal normal bold 18px Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, SimSun, sans-serif;",
            },
            {
              type: "image",
              x: 314,
              y: 554,
              width: 150,
              height: 150,
              value: this.qrcode,
            },
          ];

          this.$refs.cCanvas.draw();
        });
    },

    onDrawSuccess(res) {
      uni.hideLoading();
      this.handlePreviewImage(res);
      this.tempImage = res
    },
  },
};
</script>
<style scoped lang="scss">
$price: #f5222d;

.head-img-container {
  width: 100vw;
  height: 200px;
  position: relative;

  .share {
    position: absolute;
    bottom: 32px;
    right: 16px;
    height: 24px;
    border-radius: 12px;
    line-height: 24px;
  }

  .export {
    position: absolute;
    bottom: 32px;
    right: 100px;
  }
  .copy {
    position: absolute;
    bottom: 32px;
    right: 216px;
  }

  .share-qr {
    position: absolute;
    bottom: 64px;
    right: 216px;
  }

  .head-img {
    width: 100vw;
    height: 200px;
    position: relative;

    &:after {
      content: "";
      height: 16px;
      width: 100%;
      position: absolute;
      left: 0;
      bottom: 0px;
      background-image: linear-gradient(rgba(255, 255, 255, 0), #f7f9fa);
    }
  }
}
.container {
  background: #f7f9fa;
  padding-bottom: constant(safe-area-inset-bottom); /*兼容 IOS<11.2*/
  padding-bottom: env(safe-area-inset-bottom); /*兼容 IOS>11.2*/
}
.info-container {
  margin: 0 16px;
  padding: 16px;
  border-radius: 4px;
  background: #fff;
  transform: translateY(-16px);

  .title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 8px;
  }

  .status {
    font-size: 14px;
    color: $uni-text-color-grey;
  }
}

.rich-text {
  width: 100%;
}
[alt] {
  max-width: 100%;
}

.good-container {
  padding: 16px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 16px;
  grid-auto-rows: minmax(100px, auto);
}

.good {
  background: #fff;
  border-radius: 4px;
  /* margin: 16rpx;
  width: 327rpx; */
  /* height: 600rpx; */
  padding-bottom: 8px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;

  .recommend {
    position: absolute;
    top: 0;
    left: 0;
    height: 16px;
    font-size: 12px;
    padding: 0 4px;
    line-height: 16px;
    border-bottom-right-radius: 4px;
    color: #fff;
    background: #f88181;
  }

  .name {
    display: -webkit-box;
    word-break: break-all;
    text-overflow: ellipsis;
    font-size: 14px;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2; //设置 需要显示的行数
  }
}

.good-img {
  width: 327rpx;
  height: 327rpx;
}

.flex {
  display: flex;
}

.margin-bottom-8 {
  margin-bottom: 8px;
}

.padding-16 {
  padding: 16px;
}
.margin-bottom-60 {
  margin-bottom: 60px;
}
.good-image {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  margin-right: 8px;
  border-radius: 4px;
}

.good-detail {
  border-radius: 16px;
  max-height: calc(80vh - 100px);
  width: 100vw;

  .img-list-item {
    width: 100%;
  }

  .name {
    font-weight: bold;
  }
}
.bottom-bar {
  /* padding-bottom: ; */
  padding-bottom: constant(safe-area-inset-bottom); /*兼容 IOS<11.2*/
  padding-bottom: env(safe-area-inset-bottom); /*兼容 IOS>11.2*/
  position: fixed;
  bottom: 0;
  width: 100vw;
  background: #fff;
  z-index: 10000;

  .bar-content {
    height: 54px;
    padding: 0 32rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 10000;
  }

  .confirm {
    height: 40px;
    border-radius: 20px;
    width: 60vw;
    margin: 0;
    line-height: 40px;
    background: #f88181;
    border: none;
    color: #fff;
    text-align: center;

    &.end {
      background: $uni-text-color-disable;
    }
  }
}

.record-container {
  margin: 0 16px;
  padding: 16px;
  border-radius: 4px;
  background: #fff;
}

.popup-container {
  padding: 16px;
  padding-bottom: 70px;
}
.selected-item {
  display: flex;
  margin-bottom: 8px;

  .image {
    width: 80px;
    height: 80px;
    margin-right: 8px;
    border-radius: 4px;
    flex-shrink: 0;
  }

  .info {
    font-size: 12px;

    .name {
      font-size: 14px;
      margin-bottom: 8px;
    }
  }
}
.space {
  height: 66px;
}
.price {
  color: $price;

  span {
    font-size: 12px;
    color: #999;
  }
}
.stock {
  font-size: 12px;
  color: #666;
  margin: 4px 0;
}
.good-info {
  padding: 8px;
}
.order {
  font-size: 14px;
  display: flex;
  color: $uni-text-color-grey;
  line-height: 1.8;
  justify-content: space-between;
}
.font14 {
  font-size: 14px;
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
