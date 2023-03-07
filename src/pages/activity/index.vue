<template>
  <view class="container">
    <div class="info-container">
      <div>{{ title }}</div>
      <button open-type="share">转发</button>
      <mp-html
        class="rich-text"
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
        {{ item.name }}
        <div class="price">
          {{ item.price }}
        </div>

        <div class="origin-price">{{ item.originPrice }}</div>
        <uni-number-box v-model="item.amount" :min="0" :step="1" />
      </div>
    </div>

    <!-- <page-view :show="pageContainerShow" round overlay close-on-slide-down>

    </page-view> -->
    <uni-popup
      ref="popup"
      type="bottom"
      background-color="#fff"
      @change="handlePopupChange"
    >
      <div class="good-detail" v-if="goodDetail">
        <div class="flex">
          <image :src="goodDetail.defaultImg" class="image" mode="aspectFill" />
          <div>
            <div class="name">{{ goodDetail.name }}</div>
            <div class="price">{{ goodDetail.price }}</div>
          </div>
        </div>

        <div>
          <uni-number-box v-model="goodDetail.amount" :step="1" />
        </div>

        <div v-for="(img, index) of goodDetail.images" :key="index">
          <image class="img-list-item" mode="aspectFit" :src="img" />
        </div>

        <div class="function">
          <button @click="handleAddCurrentToCart">加入已选</button>
        </div>
      </div>
    </uni-popup>

    <div v-if="selected.selectedPrice > 0" class="bottom-bar">
      <div class="bar-content">
        <div @click="handleShowSelected">
          总价：{{ selected.selectedPrice }}
        </div>

        <button @click="handleConfirm">下单</button>
      </div>
    </div>

    <uni-popup ref="selectedPopup" type="bottom" background-color="#fff">
      <div>
        <div v-for="item of selected.selectedGoods" :key="item._id">
          <div>{{ item.name }}</div>
          <div>{{ item.price }}</div>
          <div>{{ item.amount }}</div>
        </div>

        <div>总价：{{ selected.selectedPrice }}</div>
      </div>
    </uni-popup>
  </view>
</template>

<script>
import backButton from "@/components/backButton.vue";
import store from "@/store/index";
import formatImage from "@/utils/formatHTMLImage";

export default {
  components: { backButton },
  data() {
    return {
      activityId: "",
      title: "",
      description: "",
      goods: [],
      // locationIds: [],

      pageContainerShow: false,
      goodDetail: null,
    };
  },

  computed: {
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
          title,
          startTime,
          endTime,
          headImages,
          description,
          locationIds,
          items,
          status,
        } = res.result.data;

        this.activityId = id;
        this.description = formatImage(description);
        this.title = title;
        this.goods = items.map((item) => {
          return {
            ...item,
            amount: 0,
          };
        });
        // this.locationIds = locationIds;
        store.commit("updateLocationList", locationIds);
      });
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
      // this.pageContainerShow = true
      this.$refs.popup.open("bottom");
      this.goodDetail = item;
    },
    handlePopupChange() {},
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
      // wx.cloud.callFunction({
      //   name: 'createOrder',
      //   data: {
      //     activityId: this.activityId,
      //     locationId: '93e4b6a063f81f4901c719636aa37f0b',
      //     goodList: this.selected.selectedGoods.map(item => {
      //       return {
      //         id: item._id,
      //         amount: item.amount
      //       }
      //     }),
      //     totalPrice: this.selected.selectedPrice,
      //     phone: 13122020795,
      //     comment: '评论试试'
      //   }
      // })
    },
  },
};
</script>
<style scoped lang="scss">
/* pages/activity/index.wxss */
.container {
  margin-top: 88px;
}
.info-container {
  padding: 16rpx;
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
  margin: 16rpx;
  width: 327rpx;
  height: 600rpx;
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

.good-detail {
  padding: 16px;
  border-radius: 16px;

  .image {
    width: 80px;
    height: 80px;
  }

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

  .bar-content {
    height: 60px;
    display: flex;
  }
}
.price {
  color: $uni-color-primary;
}
</style>
