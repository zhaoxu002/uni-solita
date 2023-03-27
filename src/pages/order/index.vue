<template>
  <div class="container">
    <div class="card">
      <uni-forms :model="formData" ref="form">
        <uni-forms-item label="提货点" name="locationId" required>
          <uni-data-picker
            v-model="formData.locationId"
            :localdata="locationList"
            required
          ></uni-data-picker>
        </uni-forms-item>

        <uni-forms-item label="昵称" name="userName" required>
          <input
            type="nickname"
            id="nickname-input"
            placeholder="请填写您的微信昵称"
          />
        </uni-forms-item>

        <uni-forms-item label="电话" name="userPhone" required>
          <uni-easyinput type="number" v-model="formData.userPhone">
          </uni-easyinput>
        </uni-forms-item>

        <uni-forms-item label="备注" name="note">
          <uni-easyinput v-model="formData.note"></uni-easyinput>
        </uni-forms-item>
      </uni-forms>
    </div>

    <div class="card">
      <div v-for="item of cart.goods" :key="item._id" class="item">
        <img :src="item.defaultImg" class="image" mode="aspectFill" />

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

      <div>总价：$ {{ totalPrice }}</div>
    </div>

    <div class="bottom-fixed">
      <button :disabled="loading" class="button" @click="handleConfirm">
        提交接龙
      </button>
    </div>
  </div>
</template>

<script>
import uniForms from "@/uni_modules/uni-forms/components/uni-forms/uni-forms.vue";
import UniFormsItem from "@/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";

import store from "@/store/index";

export default {
  components: { uniForms, UniFormsItem, UniEasyinput },
  data() {
    return {
      id: "",
      formData: {},
      input: "",
      required: [
        {
          required: true,
        },
      ],
      rules: [],
      loading: false,
    };
  },

  onLoad(options) {
    const { id } = options;
    this.id = id;
  },

  computed: {
    locationList() {
      return store.state.locationList.map((item) => {
        return {
          value: item._id,
          text: item.description + " " + item.detailAddress,
          detailAddress: item.detailAddress,
        };
      });
    },
    cart() {
      return store.state.cart;
    },
    totalPrice() {
      return store.state.cart.goods
        .reduce((acc, cur) => {
          return acc + cur.price * cur.amount;
        }, 0)
        .toFixed(2);
    },
  },

  methods: {
    handleConfirm() {
      if (this.loading) return;
      this.loading = true;
      uni.showLoading({
        title: "请稍候",
      });
      uni
        .createSelectorQuery()
        .in(this) // 注意这里要加上 in(this)
        .select("#nickname-input")
        .fields({
          properties: ["value"],
        })
        .exec((response) => {
          const nickName = response?.[0]?.value;

          this.$refs.form
            .validate()
            .then((res) => {
              console.log("res", res);
              const data = {
                purchaseId: this.id,
                userPhone: res.userPhone,
                userName: nickName,
                note: res.note,
                locationId: res.locationId,
                detailAddress: this.locationList.find(
                  (item) => item.value === res.locationId
                )["detailAddress"],
                itemsInfo: this.cart.goods.map((item) => {
                  return {
                    itemId: item._id,
                    itemQuantity: item.amount,
                  };
                }),
              };

              console.log("data", data);

              wx.cloud
                .callFunction({
                  name: "order",
                  data: {
                    method: "createOne",
                    data,
                  },
                })
                .then((res) => {
                  console.log("success", res);

                  setTimeout(() => {
                    uni.hideLoading();
                    wx.switchTab({
                      url: "/pages/person/index",
                    });
                    this.loading = false;
                  }, 500);
                })
                .catch((err) => {
                  uni.hideLoading();
                  wx.showToast({
                    title: "Whoops 出错了",
                    icon: "error",
                  });
                  this.loading = false;
                });
            })
            .catch((e) => {
              console.log("form", e);
              uni.hideLoading();
              uni.showModal({
                title: "出错了",
                content: "请检查表单填写是否完整",
                showCancel: false,
              });
              this.loading = false;
            });
        });
    },

    handleInput(e) {
      this.input = e.detail.value;
      this.$refs.input.setValue(e.detail.value);
    },
  },
};
</script>

<style lang="scss" scoped>
$price: #f5222d;

.container {
  padding: 16px;
  background: #f7f9fa;
  padding-bottom: constant(safe-area-inset-bottom); /*兼容 IOS<11.2*/
  padding-bottom: env(safe-area-inset-bottom); /*兼容 IOS>11.2*/
}
.card {
  background: #fff;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 16px;
}
.bottom-fixed {
  box-sizing: border-box;
  position: fixed;
  bottom: 0;
  width: 100%;
  left: 0;
  padding: 16px;
  padding-bottom: constant(safe-area-inset-bottom); /*兼容 IOS<11.2*/
  padding-bottom: env(safe-area-inset-bottom); /*兼容 IOS>11.2*/
  background: #fff;
  display: flex;

  .button {
    flex-grow: 1;
    margin-bottom: 16px;
  }
}
.item {
  display: flex;
  margin-bottom: 8px;
}
.image {
  width: 80px;
  height: 80px;
  margin-right: 8px;
  border-radius: 4px;
  flex-shrink: 0;
}
#nickname-input {
  font-size: 14px;
  display: flex;
  box-sizing: border-box;
  flex-direction: row;
  align-items: center;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  border-color: #e5e5e5;
  background-color: #fff;
  width: auto;
  position: relative;
  overflow: hidden;
  flex: 1;
  line-height: 1;
  font-size: 14px;
  height: 35px;
  padding-left: 10px;
}
.info {
  font-size: 12px;

  .name {
    font-size: 14px;
    margin-bottom: 8px;
  }
}
.price {
  color: $price;
}
</style>
<style>
.uni-forms-item__content {
  overflow: hidden;
}
</style>
