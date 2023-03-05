<template>
  <div class="container">
    <div class="card">
      <uni-forms :modelValue="formData">
        <uni-forms-item label="提货点" name="locationId">
          <uni-data-select :localdata="locationList"></uni-data-select>
        </uni-forms-item>

        <uni-forms-item label="电话" name="phone">
          <uni-easyinput type="number"> </uni-easyinput>
        </uni-forms-item>

        <uni-forms-item label="备注">
          <uni-easyinput></uni-easyinput>
        </uni-forms-item>
      </uni-forms>
      <div>选择提货点</div>
      <div>电话号码</div>
    </div>

    <div class="card">购物车</div>

    <div class="card">接龙备注</div>

    <div class="bottom-fixed">
      <button>提交接龙</button>
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
  },
};
</script>

<style lang="scss">
.container {
  padding: 16px;
}
</style>
