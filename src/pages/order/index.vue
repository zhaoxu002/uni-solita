<template>
  <div class="container">
    <div class="card">
      <uni-forms :model="formData" ref="form">
        <uni-forms-item label="提货点" name="locationId" required>
          <uni-data-select
            v-model="formData.locationId"
            :localdata="locationList"
            required
          ></uni-data-select>
        </uni-forms-item>

        <uni-forms-item label="昵称" name="userName" required>
          <input type="nickname" id="nickname-input" placeholder="请填写您的微信昵称" />
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
        <img :src="item.images[0]" class="image" mode="aspectFill" />
        <div>
          {{ item.name }}
        </div>

        <div>
          {{ item.amount }}
        </div>

        <div>
          {{ item.price }}
        </div>
      </div>

      <div>{{ totalPrice }}</div>
    </div>

    <div class="bottom-fixed">
      <button @click="handleConfirm">提交接龙</button>
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
      uni
        .createSelectorQuery()
        .in(this) // 注意这里要加上 in(this)
        .select("#nickname-input")
        .fields({
          properties: ["value"],
        })
        .exec((res) => {
          const nickName = res?.[0]?.value;
          console.log("nickName", nickName);

          this.$refs.form.validate().then((res) => {
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

            wx.cloud.callFunction({
              name: "order",
              data: {
                method: "createOne",
                data
              },
            }).then(res => {
              console.log('success', res)
            })
          });
        });
    },

    handleInput(e) {
      // console.log(e);
      this.input = e.detail.value;
      this.$refs.input.setValue(e.detail.value);
      // this.formData.userName = e.detail.value
    },
  },
};
</script>

<style lang="scss" scoped>
.container {
  padding: 16px;
}
.item {
  display: flex;
}
.image {
  width: 80px;
  height: 80px;
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
</style>
