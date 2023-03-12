<template>
  <page-meta
    :page-style="'overflow:' + (pageContainerShow ? 'hidden' : 'visible')"
  ></page-meta>
  <!-- eslint-disable-next-line vue/no-multiple-template-root -->
  <view>
    <div class="head-img-container">
      <img :src="headImages[0]" class="head-img" mode="aspectFill" />

      <button class="share" size="mini" open-type="share">转发</button>
    </div>

    <div class="container">
      <div class="info-container">
        <div class="title">{{ title }}</div>

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
            mode="aspectFill"
            :src="item.defaultImg"
            alt=""
            @click="handleCheckDetail(item)"
          />
          <div class="good-info">
            <div class="name">{{ item.name }}</div>
            <div class="price">$ {{ item.price }}</div>
            <div class="origin-price">{{ item.originPrice }}</div>
            <uni-number-box
              v-model="item.amount"
              :min="0"
              :step="1"
              background="#f2828d"
            />
          </div>
        </div>
      </div>

      <div class="record-container">
        <div class="record" v-for="record of records" :key="record._id">
          {{ record.userName }} 购买了

          {{ record.itemName }}

          {{ record.itemQuantity }}
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
            />
            <div>
              <div class="name">{{ goodDetail.name }}</div>
              <div class="price">$ {{ goodDetail.price }}</div>
            </div>
          </div>
          <uni-number-box
            v-model="goodDetail.amount"
            :step="1"
            :min="0"
            background="#f2828d"
          />
        </div>
        <scroll-view scroll-y class="good-detail">
          <div class="padding-16 margin-bottom-60">
            <div v-for="(img, index) of goodDetail.images" :key="index">
              <image class="img-list-item" mode="aspectFit" :src="img" />
            </div>

            <mp-html
              class="rich-text"
              :tag-style="{
                p: 'min-height: 1rem',
              }"
              :content="goodDetail.description"
              container-style="word-break:break-all;white-space:pre-wrap;"
            />

            <!-- <div class="function">
              <button @click="handleAddCurrentToCart">加入已选</button>
            </div> -->
          </div>
        </scroll-view>
      </uni-popup>

      <div v-if="selected.selectedPrice > 0" class="bottom-bar">
        <div class="bar-content">
          <div @click="handleShowSelected">
            总价：$ {{ selected.selectedPrice }}
          </div>

          <div class="confirm" @click="handleConfirm">下单</div>
        </div>
      </div>

      <uni-popup ref="selectedPopup" type="bottom" background-color="#fff">
        <div class="popup-container">
          <div
            class="selected-item"
            v-for="item of selected.selectedGoods"
            :key="item._id"
          >
            <image
              mode="aspectFill"
              class="selected-img"
              :src="item.defaultImg"
            />
            <div>
              <div>{{ item.name }}</div>
              <div>{{ item.price }}</div>
              <div>{{ item.amount }}</div>
            </div>
          </div>

          <div>总价：{{ selected.selectedPrice }}</div>
        </div>
      </uni-popup>
    </div>
  </view>
</template>

<script>
import store from "@/store/index";
import formatImage from "@/utils/formatHTMLImage";
import dayjs from "dayjs";
import mpHtml from "@/uni_modules/mp-html/components/mp-html/mp-html.vue";

export default {
  components: { mpHtml },
  data() {
    return {
      activityId: "",
      title: "",
      now: Date.now(),
      description: "",
      endTime: 0,
      goods: [],
      records: [],
      headImages: [],

      pageContainerShow: false,
      goodDetail: null,
    };
  },

  computed: {
    formatEndTime() {
      return dayjs(this.endTime).format("YYYY-MM-DD HH:mm:ss");
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
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const { id } = options;

    wx.cloud
      .callFunction({
        name: "purchase",
        data: {
          method: "getOne",
          _id: id,
        },
      })
      .then((res) => {
        console.log(res.result.data);
        const {
          description,
          title,
          items,
          locations,
          endTime,
          orderItems,
          headImages,
        } = res.result.data;

        this.activityId = id;
        this.endTime = endTime;
        this.description = formatImage(description);
        this.title = title;
        this.goods = items.map((item) => {
          return {
            ...item,
            amount: 0,
          };
        });
        this.records = orderItems;
        this.headImages = headImages;
        store.commit("updateLocationList", locations);
      });

    // wx.cloud.callFunction({

    // })
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
      title: "带带go",
      path: "/pages/activity/index?id=" + this.activityId,
    };
  },
  methods: {
    handleAddCurrentToCart() {
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
      store.commit("updateCart", {
        activityId: this.activityId,
        goods: this.selected.selectedGoods,
      });

      wx.navigateTo({
        url: "/pages/order/index?id=" + this.activityId,
      });
    },
  },
};
</script>
<style scoped lang="scss">
.head-img-container {
  width: 100vw;
  height: 250px;
  position: relative;
  /* background-image: linear-gradient(rgba(255, 255, 255, 0), #f7f9fa); */
  /* background-size: 100vw 16px; */
  /* background-position: bottom; */
  /* background-repeat: no-repeat; */

  .share {
    position: absolute;
    bottom: 32px;
    right: 16px;
    height: 24px;
    line-height: 22px;
  }

  .head-img {
    width: 100vw;
    height: 250px;
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
  margin: 0 32rpx;
  padding: 16px;
  border-radius: 4px;
  background: #fff;
  transform: translateY(-16px);

  .title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 8px;
  }
}

.rich-text {
  width: 100%;
}
[alt] {
  max-width: 100%;
}

.good-container {
  display: flex;
  padding: 16rpx;
}

.good {
  background: #fff;
  border-radius: 4px;
  margin: 16rpx;
  width: 327rpx;
  /* height: 600rpx; */
  padding-bottom: 8px;
  border-radius: 8px;
  overflow: hidden;
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
  }
}

.record-container {
  padding-bottom: 66px;
}

.popup-container {
  padding: 16px;
}
.selected-item {
  display: flex;

  .selected-img {
    width: 60px;
    height: 60px;
    margin-right: 8px;
    border-radius: 4px;
  }
}
.price {
  color: $uni-color-primary;
}
.good-info {
  padding: 8px;
}
</style>
