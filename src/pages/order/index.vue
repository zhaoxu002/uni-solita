<template>
  <div class="container">
    <div class="card">
      <uni-forms :modelValue="formData" ref="form">
        <uni-forms-item label="提货点" name="locationId">
          <uni-data-select :localdata="locationList" required></uni-data-select>
        </uni-forms-item>

        <uni-forms-item label="电话" name="phone" required>
          <uni-easyinput type="number"> </uni-easyinput>
        </uni-forms-item>

        <uni-forms-item label="备注">
          <uni-easyinput></uni-easyinput>
        </uni-forms-item>

        <uni-forms-item label="昵称" required>
          <uni-easyinput type="nickname" name="nickname" />
        </uni-forms-item>
      </uni-forms>
      <!-- <div>选择提货点</div>
      <div>电话号码</div> -->
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

      <div>{{totalPrice}}</div>
    </div>

    <!-- <div class="card">接龙备注</div> -->

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
      formData: {},
      required: [
        {
          required: true,
        },
      ],
    };
  },

  computed: {
    locationList() {
      return store.state.locationList.map((item) => {
        return {
          value: item._id,
          text: item.title + item.location,
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
      this.$refs.form.validate().then(() => {
        console.log("success");
      });
    },
  },
};
</script>

<style lang="scss">
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
</style>
