<template>
  <div class="page">
    <div v-if="isAdmin" class="content">
      <div class="heading">
        <div>
          <div class="title">任务总览</div>
          <div class="subtitle">管理接龙，让好货更快到家</div>
        </div>
        <div class="date">{{ today }}</div>
      </div>

      <div class="summary">
        <div class="summary-item">
          <div class="summary-label">全部接龙</div>
          <div class="summary-value primary">{{ purchaseTotal }}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">进行中</div>
          <div class="summary-value">{{ activeActivities.length }}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">待开始</div>
          <div class="summary-value">{{ upcomingActivities.length }}</div>
        </div>
      </div>

      <button class="create-button" @click="createBlankPurchase">
        <span class="plus">＋</span> 新建空白接龙
      </button>

      <div class="section-heading">
        <div class="section-title">进行中的接龙 <span class="count">{{ activeActivities.length }}</span></div>
        <div class="more" @click="openPurchases">查看全部 ›</div>
      </div>

      <div class="activity-list">
        <div v-if="!loading && activeActivities.length === 0" class="empty">目前没有进行中的接龙</div>
        <div v-for="item in activeActivities.slice(0, 3)" :key="item._id" class="activity-row">
          <image v-if="item.headImages && item.headImages[0]" class="cover" :src="item.headImages[0]" mode="aspectFill"></image>
          <div class="activity-main">
            <div class="activity-top">
              <div class="activity-title">{{ item.title }}</div>
              <div class="deadline">{{ formatDeadline(item.endTime) }}</div>
            </div>
            <div class="metrics">
              <div><strong>{{ item.orderCount || 0 }}</strong><span>订单</span></div>
              <div><strong>{{ item.itemIds ? item.itemIds.length : 0 }}</strong><span>商品</span></div>
            </div>
            <div class="actions">
              <span @click="editPurchase(item._id)">编辑</span>
              <span :class="{ disabled: copyingId === item._id }" @click="copyPurchase(item)">复制</span>
              <span @click="endPurchase(item)">结束</span>
              <span @click="togglePurchase(item)">隐藏</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="upcomingActivities.length" class="section-heading upcoming-heading">
        <div class="section-title">待开始的接龙 <span class="count pale">{{ upcomingActivities.length }}</span></div>
      </div>
      <div v-for="item in upcomingActivities.slice(0, 2)" :key="item._id" class="upcoming-row" @click="editPurchase(item._id)">
        <div>
          <div class="activity-title">{{ item.title }}</div>
          <div class="secondary">{{ formatStart(item.startTime) }} 开始</div>
        </div>
        <div class="upcoming-actions">
          <span :class="{ disabled: copyingId === item._id }" @click.stop="copyPurchase(item)">复制</span>
          <span class="link">编辑 ›</span>
        </div>
      </div>

      <div class="product-entry" @click="openItems">
        <div>
          <div class="product-title">商品管理</div>
          <div class="secondary">管理商品库存、价格和上下架</div>
        </div>
        <div class="stock-warning" v-if="lowStockCount">{{ lowStockCount }} 个库存预警</div>
        <div v-else class="link">进入 ›</div>
      </div>
    </div>

    <div v-else-if="!loading" class="denied">当前账号没有管理员权限</div>
  </div>
</template>

<script>
import dayjs from "dayjs";

export default {
  data() {
    return {
      isAdmin: false,
      loading: true,
      copyingId: "",
      activities: [],
      items: [],
      purchaseTotal: 0,
      now: Date.now(),
    };
  },
  computed: {
    today() {
      return dayjs().format("YYYY年M月D日");
    },
    activeActivities() {
      return this.activities.filter((item) => !item.isDelete && item.startTime <= this.now && item.endTime > this.now);
    },
    upcomingActivities() {
      return this.activities.filter((item) => !item.isDelete && item.startTime > this.now);
    },
    lowStockCount() {
      return this.items.filter((item) => item.status !== 0 && Number(item.stock) <= 5).length;
    },
  },
  onShow() {
    this.load();
  },
  onPullDownRefresh() {
    this.load();
  },
  methods: {
    async load() {
      this.loading = true;
      this.now = Date.now();
      // #ifdef H5
      this.isAdmin = true;
      this.activities = [
        { _id: "preview-1", title: "新西兰牛腩团购", startTime: dayjs().subtract(1, "day").valueOf(), endTime: dayjs().add(1, "hour").valueOf(), orderCount: 23, itemIds: ["1", "2", "3"], headImages: ["/static/cardbg.jpg"], isDelete: false },
        { _id: "preview-2", title: "阳光玫瑰葡萄团购", startTime: dayjs().subtract(2, "hour").valueOf(), endTime: dayjs().hour(22).minute(0).valueOf(), orderCount: 36, itemIds: ["4", "5"], headImages: ["/static/head.jpg"], isDelete: false },
        { _id: "preview-3", title: "鲜活大闸蟹团购", startTime: dayjs().add(1, "day").hour(10).minute(0).valueOf(), endTime: dayjs().add(4, "day").valueOf(), orderCount: 0, itemIds: ["6"], headImages: ["/static/cardbg.jpg"], isDelete: false },
      ];
      this.purchaseTotal = 3;
      this.items = [{ stock: 2, status: 1 }, { stock: 4, status: 1 }, { stock: 20, status: 1 }];
      this.loading = false;
      uni.stopPullDownRefresh();
      return;
      // #endif
      try {
        const adminRes = await wx.cloud.callFunction({ name: "checkIsAdmin" });
        this.isAdmin = adminRes.result.isAdmin;
        if (!this.isAdmin) return;
        const [purchaseRes, itemRes] = await Promise.all([
          wx.cloud.callFunction({
            name: "purchase",
            data: { method: "getAllByPage", query: {}, pageQuery: { curPage: 1, limit: 50 } },
          }),
          wx.cloud.callFunction({
            name: "item",
            data: { method: "getListByPage", query: {}, pageQuery: { curPage: 1, limit: 100 } },
          }),
        ]);
        this.activities = purchaseRes.result.success ? purchaseRes.result.data.data : [];
        this.purchaseTotal = purchaseRes.result.success ? purchaseRes.result.data.total : 0;
        this.items = itemRes.result.success ? itemRes.result.data.data : [];
      } catch (error) {
        uni.showToast({ title: "加载失败", icon: "none" });
      } finally {
        this.loading = false;
        uni.stopPullDownRefresh();
      }
    },
    formatDeadline(time) {
      const date = dayjs(time);
      return date.isSame(dayjs(), "day") ? `今日 ${date.format("HH:mm")} 截止` : `${date.format("M月D日 HH:mm")} 截止`;
    },
    formatStart(time) {
      const date = dayjs(time);
      return date.isSame(dayjs().add(1, "day"), "day") ? `明日 ${date.format("HH:mm")}` : date.format("M月D日 HH:mm");
    },
    openPurchases() {
      uni.navigateTo({ url: "/pages/list/index" });
    },
    openItems() {
      uni.navigateTo({ url: "/pages/admin/items/index" });
    },
    editPurchase(id) {
      uni.navigateTo({ url: `/pages/edit/index?id=${id}` });
    },
    createBlankPurchase() {
      uni.navigateTo({ url: "/pages/edit/index" });
    },
    async updatePurchase(item, data, successTitle) {
      const res = await wx.cloud.callFunction({
        name: "purchase",
        data: { method: "updateOne", _id: item._id, data },
      });
      if (!res.result.success) throw new Error(res.result.errMsg || "更新失败");
      uni.showToast({ title: successTitle });
      this.load();
    },
    endPurchase(item) {
      uni.showModal({
        title: "结束接龙？",
        content: "结束后用户将不能继续下单。",
        success: (action) => action.confirm && this.updatePurchase(item, { endTime: Date.now() }, "已结束"),
      });
    },
    togglePurchase(item) {
      uni.showModal({
        title: "隐藏接龙？",
        content: "隐藏后首页将不再展示。",
        success: (action) => action.confirm && this.updatePurchase(item, { isDelete: true }, "已隐藏"),
      });
    },
    async copyPurchase(item) {
      if (this.copyingId) return;
      this.copyingId = item._id;
      try {
        const res = await wx.cloud.callFunction({ name: "purchase", data: { method: "copyOne", id: item._id } });
        if (!res.result.success) throw new Error("复制失败");
        uni.navigateTo({ url: `/pages/edit/index?id=${res.result.data._id}` });
      } catch (error) {
        uni.showToast({ title: "复制失败", icon: "none" });
      } finally {
        this.copyingId = "";
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: #f7f9fa; color: #172033; }
.content { padding: 24px 16px 40px; }
.heading { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 22px; }
.title { font-size: 30px; line-height: 1.2; font-weight: 700; letter-spacing: 1px; }
.subtitle, .secondary { color: #8b95a7; font-size: 13px; margin-top: 6px; }
.date { color: #c75d68; background: #fff0f1; padding: 8px 12px; border-radius: 16px; font-size: 12px; }
.summary { display: flex; background: #fff0f1; border-radius: 16px; padding: 18px 4px; margin-bottom: 16px; }
.summary-item { flex: 1; text-align: center; border-right: 1px solid #f2d9dc; }
.summary-item:last-child { border-right: 0; }
.summary-label { font-size: 13px; color: #515c6e; }
.summary-value { font-size: 26px; font-weight: 700; margin-top: 6px; }
.summary-value.primary { color: #ed5f6d; }
.create-button { height: 60px; line-height: 60px; border: 0; border-radius: 16px; color: #fff; font-size: 18px; font-weight: 600; background: #f36f7b; margin-bottom: 26px; }
.create-button::after { border: 0; }
.plus { font-size: 25px; vertical-align: -1px; }
.section-heading { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.section-title { font-size: 19px; font-weight: 700; }
.count { display: inline-block; color: #fff; background: #f36f7b; font-size: 12px; min-width: 20px; height: 20px; line-height: 20px; text-align: center; border-radius: 10px; }
.count.pale { color: #ed5f6d; background: #ffe3e6; }
.more, .link { color: #778195; font-size: 13px; }
.activity-list { background: #fff; border-radius: 14px; overflow: hidden; }
.activity-row { display: flex; padding: 14px 0 0 14px; }
.activity-row + .activity-row { border-top: 1px solid #edf0f4; }
.cover { width: 86px; height: 86px; border-radius: 10px; flex-shrink: 0; margin-right: 12px; }
.activity-main { flex: 1; min-width: 0; }
.activity-top { padding-right: 14px; }
.activity-title { font-size: 16px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.deadline { display: inline-block; margin-top: 6px; color: #ed5f6d; background: #fff0f1; border-radius: 12px; padding: 4px 8px; font-size: 11px; }
.metrics { display: flex; gap: 28px; margin-top: 11px; }
.metrics div { display: flex; align-items: baseline; gap: 4px; }
.metrics strong { font-size: 18px; }
.metrics span { font-size: 11px; color: #8b95a7; }
.actions { height: 43px; margin-top: 10px; border-top: 1px solid #edf0f4; display: flex; justify-content: flex-end; align-items: center; }
.actions span { color: #4d586b; font-size: 13px; padding: 12px 14px; }
.actions .disabled, .upcoming-actions .disabled { color: #c6ccd5; }
.upcoming-heading { margin-top: 24px; }
.upcoming-row { display: flex; justify-content: space-between; align-items: center; padding: 16px; background: #fff; border-bottom: 1px solid #edf0f4; }
.upcoming-actions { display: flex; align-items: center; gap: 18px; color: #4d586b; font-size: 13px; }
.product-entry { margin-top: 24px; background: #fff; border-radius: 14px; padding: 18px; display: flex; justify-content: space-between; align-items: center; }
.product-title { font-size: 17px; font-weight: 600; }
.stock-warning { color: #ed5f6d; background: #fff0f1; padding: 6px 9px; border-radius: 12px; font-size: 11px; }
.empty, .denied { text-align: center; padding: 56px 16px; color: #8b95a7; font-size: 14px; }
</style>
