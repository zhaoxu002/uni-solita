<template>
  <div class="page">
    <div class="filters">
      <span v-for="option in filters" :key="option.value" :class="{ active: filter === option.value }" @click="filter = option.value">
        {{ option.label }} {{ counts[option.value] || 0 }}
      </span>
    </div>
    <div class="list">
      <div v-for="item in visibleActivities" :key="item._id" class="activity-row">
        <image v-if="item.headImages && item.headImages[0]" class="cover" :src="item.headImages[0]" mode="aspectFill"></image>
        <div class="main">
          <div class="title-line">
            <div class="title">{{ item.title }}</div>
            <div :class="['status', statusOf(item)]">{{ statusLabel(item) }}</div>
          </div>
          <div class="time">{{ formatTime(item.startTime) }} — {{ formatTime(item.endTime) }}</div>
          <div class="numbers">
            <span><strong>{{ item.orderCount || 0 }}</strong> 订单</span>
            <span><strong>{{ item.itemIds ? item.itemIds.length : 0 }}</strong> 商品</span>
          </div>
          <div class="actions">
            <span @click="openDetail(item._id)">详情</span>
            <span @click="edit(item._id)">编辑</span>
            <span @click="copy(item)">复制</span>
            <span @click="toggle(item)">{{ item.isDelete ? "展示" : "隐藏" }}</span>
          </div>
        </div>
      </div>
      <div v-if="!loading && !visibleActivities.length" class="empty">没有符合条件的接龙</div>
      <uni-load-more :status="loadingStatus" @clickLoadMore="fetchList" />
    </div>
  </div>
</template>

<script>
import dayjs from "dayjs";

export default {
  data() {
    return {
      filter: "all",
      filters: [
        { label: "全部", value: "all" },
        { label: "进行中", value: "active" },
        { label: "待开始", value: "upcoming" },
        { label: "已结束", value: "ended" },
        { label: "已隐藏", value: "hidden" },
      ],
      activities: [], loading: false, loadingStatus: "more", current: 1, pageSize: 20, now: Date.now(),
    };
  },
  computed: {
    visibleActivities() {
      return this.filter === "all" ? this.activities : this.activities.filter((item) => this.statusOf(item) === this.filter);
    },
    counts() {
      return this.activities.reduce((result, item) => {
        result.all += 1;
        result[this.statusOf(item)] += 1;
        return result;
      }, { all: 0, active: 0, upcoming: 0, ended: 0, hidden: 0 });
    },
  },
  onShow() { this.reset(); },
  onReachBottom() { this.fetchList(); },
  onPullDownRefresh() { this.reset(); },
  methods: {
    async reset() {
      this.activities = []; this.current = 1; this.loadingStatus = "more"; this.now = Date.now();
      // #ifdef H5
      this.activities = [
        { _id: "preview-1", title: "新西兰牛腩团购", startTime: dayjs().subtract(1, "day").valueOf(), endTime: dayjs().add(1, "hour").valueOf(), orderCount: 23, itemIds: ["1", "2", "3"], headImages: ["/static/cardbg.jpg"], isDelete: false },
        { _id: "preview-2", title: "阳光玫瑰葡萄团购", startTime: dayjs().subtract(2, "hour").valueOf(), endTime: dayjs().add(2, "hour").valueOf(), orderCount: 36, itemIds: ["4", "5"], headImages: ["/static/head.jpg"], isDelete: false },
        { _id: "preview-3", title: "鲜活大闸蟹团购", startTime: dayjs().add(1, "day").valueOf(), endTime: dayjs().add(4, "day").valueOf(), orderCount: 0, itemIds: ["6"], headImages: ["/static/cardbg.jpg"], isDelete: false },
      ];
      this.loadingStatus = "noMore";
      uni.stopPullDownRefresh();
      return;
      // #endif
      const adminRes = await wx.cloud.callFunction({ name: "checkIsAdmin" });
      if (!adminRes.result.isAdmin) {
        uni.showToast({ title: "无管理员权限", icon: "none" });
        uni.stopPullDownRefresh();
        return;
      }
      this.fetchList();
    },
    async fetchList() {
      if (this.loading || this.loadingStatus === "noMore") return;
      this.loading = true; this.loadingStatus = "loading";
      try {
        const res = await wx.cloud.callFunction({
          name: "purchase",
          data: { method: "getAllByPage", query: {}, pageQuery: { curPage: this.current, limit: this.pageSize } },
        });
        if (!res.result.success) throw new Error("加载失败");
        const list = res.result.data.data;
        this.activities = this.activities.concat(list);
        this.current += 1;
        this.loadingStatus = list.length < this.pageSize ? "noMore" : "more";
      } catch (error) {
        this.loadingStatus = "noMore";
        uni.showToast({ title: "加载失败", icon: "none" });
      } finally {
        this.loading = false; uni.stopPullDownRefresh();
      }
    },
    statusOf(item) {
      if (item.isDelete) return "hidden";
      if (item.startTime > this.now) return "upcoming";
      if (item.endTime <= this.now) return "ended";
      return "active";
    },
    statusLabel(item) { return { active: "进行中", upcoming: "待开始", ended: "已结束", hidden: "已隐藏" }[this.statusOf(item)]; },
    formatTime(time) { return dayjs(time).format("M月D日 HH:mm"); },
    openDetail(id) { uni.navigateTo({ url: `/pages/activity/index?id=${id}` }); },
    edit(id) { uni.navigateTo({ url: `/pages/edit/index?id=${id}` }); },
    async copy(item) {
      const res = await wx.cloud.callFunction({ name: "purchase", data: { method: "copyOne", id: item._id } });
      if (res.result.success) uni.navigateTo({ url: `/pages/edit/index?id=${res.result.data._id}` });
    },
    toggle(item) {
      const willShow = Boolean(item.isDelete);
      uni.showModal({
        title: `${willShow ? "展示" : "隐藏"}接龙？`,
        content: willShow ? "接龙将重新展示在首页。" : "隐藏后首页将不再展示。",
        success: async (action) => {
          if (!action.confirm) return;
          const res = await wx.cloud.callFunction({ name: "purchase", data: { method: "updateOne", _id: item._id, data: { isDelete: !willShow } } });
          if (res.result.success) { uni.showToast({ title: willShow ? "已展示" : "已隐藏" }); this.reset(); }
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: #f7f9fa; color: #172033; }
.filters { display: flex; gap: 8px; padding: 14px 16px; background: #fff; overflow-x: auto; white-space: nowrap; }
.filters span { padding: 8px 12px; border-radius: 15px; background: #f4f6f8; color: #7c8798; font-size: 12px; }
.filters span.active { background: #fff0f1; color: #ed5f6d; }
.list { margin-top: 10px; background: #fff; }
.activity-row { display: flex; padding: 16px 16px 0; }
.activity-row + .activity-row { border-top: 1px solid #edf0f4; }
.cover { width: 82px; height: 82px; border-radius: 10px; flex-shrink: 0; margin-right: 12px; }
.main { flex: 1; min-width: 0; }
.title-line { display: flex; justify-content: space-between; gap: 8px; align-items: center; }
.title { min-width: 0; font-size: 16px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.status { flex-shrink: 0; padding: 4px 8px; border-radius: 10px; font-size: 11px; }
.status.active { color: #159a62; background: #eaf8f1; }
.status.upcoming { color: #ed5f6d; background: #fff0f1; }
.status.ended, .status.hidden { color: #7c8798; background: #f0f2f5; }
.time { color: #8b95a7; font-size: 11px; margin-top: 9px; }
.numbers { display: flex; gap: 24px; color: #7c8798; font-size: 11px; margin-top: 10px; }
.numbers strong { color: #172033; font-size: 16px; }
.actions { height: 44px; margin-top: 11px; border-top: 1px solid #edf0f4; display: flex; justify-content: flex-end; align-items: center; gap: 22px; color: #4d586b; font-size: 12px; }
.empty { padding: 70px 16px; text-align: center; color: #8b95a7; font-size: 14px; }
</style>
