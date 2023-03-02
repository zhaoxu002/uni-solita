<template>
  <div class="container">
    <!-- <back-button /> -->

    <div class="header">标题</div>

    <div class="activity-list">
      <div class="card">
        <div class="name">
          测测这么长的接龙名字测测这么长的接龙名字测测这么长的接龙名字测测这么长的接龙名字
        </div>

        <div class="body">
          <div class="flex">
            <div>
              <div class="bold">接龙号：29</div>
              <div class="secondary">2023-02-22 18:14:16</div>
            </div>

            <div class="color">待支付</div>
          </div>

          <div class="right">金额：$1599.99</div>

          <div class="info">
            <div class="flex">
              <div class="title">自提点：</div>
              <div class="content">
                <div class="address">半岛</div>
                <div class="address-info">61D, Kervil Avenue,</div>
              </div>
            </div>

            <div class="flex">
              <div class="title">电话号码：</div>
              <div class="content">03123455312</div>
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
