<template>
  <div class="container">
    <!-- <back-button /> -->

    <div class="header">标题</div>

    <div class="activity-list">
      <div class="card" v-for="item of list" :key="item._id">
        <div class="name">
          {{ item._id }}
        </div>

        <div class="body">
          <div class="flex">
            <div>
              <div class="bold">接龙号：29</div>
              <div class="secondary">{{ item.createTime }}</div>
            </div>

            <div class="color">待支付</div>
          </div>

          <div class="right">金额：${{ item.totalAmount }}</div>

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
import backButton from "@/components/backButton.vue";

export default {
  components: { backButton },
  data() {
    return {
      list: []
    }
  },
  onLoad() {
    wx.cloud.callFunction({
      name: 'order',
      data: {
        method: 'getListByUserOpenIdAndPage',
        pageQuery: {
          curPage: 1,
          limit: 10
        }
      }
    }).then(res => {
      console.log('res', res.result)
      this.list = res.result.data
    })
  }
};
</script>

<style lang="scss">
.container {
  padding: 16px;
  margin-top: 88px;
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

  .name {
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
