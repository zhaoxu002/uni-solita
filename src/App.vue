<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  mpType: "app",
  onLaunch() {
    console.log("App Launch");
    if (!wx.cloud) {
      console.error("请使用 2.2.3 或以上的基础库以使用云能力");
    } else {
      wx.cloud.init({
        // 1.production - 正式
        // 2.test    - 测试
        // env: 'test-6guvdos0d2e13c77',
        env: "cloud1-5gnim1eid6974374",
        traceUser: true,
      });
    }
    // this.globalData = {};
  },
  onShow() {
    console.log("App Show");
  },
  onHide() {
    console.log("App Hide");
  },
});
</script>

<style>
/*每个页面公共css */
@import "@/static/iconfont.css";
</style>
