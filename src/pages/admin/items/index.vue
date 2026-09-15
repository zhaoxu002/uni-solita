<template>
  <div class="page">
    <div class="toolbar">
      <input v-model="keyword" class="search" placeholder="搜索商品名称" confirm-type="search" />
      <button class="add" @click="editItem()">新建</button>
    </div>
    <div class="filters">
      <span v-for="option in filters" :key="option.value" :class="{ active: filter === option.value }" @click="filter = option.value">
        {{ option.label }}
      </span>
    </div>

    <div class="list">
      <div v-for="item in visibleItems" :key="item._id" class="item-row">
        <image v-if="item.defaultImg" class="image" :src="item.defaultImg" mode="aspectFill"></image>
        <div class="main">
          <div class="top-line">
            <div class="name">{{ item.title || item.name }}</div>
            <div :class="['status', item.status === 0 ? 'off' : 'on']">{{ item.status === 0 ? "已下架" : "销售中" }}</div>
          </div>
          <div class="meta">
            <span class="price">${{ Number(item.price || 0).toFixed(2) }}</span>
            <span :class="{ warning: Number(item.stock) <= 5 }">库存 {{ item.stock || 0 }}</span>
            <span>默认 {{ item.defaultStock || item.stock || 0 }}</span>
          </div>
          <div class="actions">
            <span @click="editItem(item._id)">编辑</span>
            <span @click="toggleStatus(item)">{{ item.status === 0 ? "上架" : "下架" }}</span>
            <span @click="resetStock(item)">补至默认库存</span>
          </div>
        </div>
      </div>
      <div v-if="!loading && !visibleItems.length" class="empty">没有符合条件的商品</div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loading: true,
      keyword: "",
      filter: "all",
      items: [],
      filters: [
        { label: "全部", value: "all" },
        { label: "销售中", value: "active" },
        { label: "库存预警", value: "warning" },
        { label: "已下架", value: "off" },
      ],
    };
  },
  computed: {
    visibleItems() {
      const keyword = this.keyword.trim().toLowerCase();
      return this.items.filter((item) => {
        const name = `${item.title || ""}${item.name || ""}${item.subTitle || ""}`.toLowerCase();
        const matchedKeyword = !keyword || name.includes(keyword);
        const matchedFilter = this.filter === "all"
          || (this.filter === "active" && item.status !== 0)
          || (this.filter === "warning" && item.status !== 0 && Number(item.stock) <= 5)
          || (this.filter === "off" && item.status === 0);
        return matchedKeyword && matchedFilter;
      });
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

      try {
        const adminRes = await wx.cloud.callFunction({ name: "checkIsAdmin" });
        if (!adminRes.result.isAdmin) {
          uni.showToast({ title: "无管理员权限", icon: "none" });
          setTimeout(() => uni.navigateBack(), 800);
          return;
        }
        const res = await wx.cloud.callFunction({
          name: "item",
          data: { method: "getListByPage", query: {}, pageQuery: { curPage: 1, limit: 100 } },
        });
        this.items = res.result.success ? res.result.data.data : [];
      } catch (error) {
        uni.showToast({ title: "加载失败", icon: "none" });
      } finally {
        this.loading = false;
        uni.stopPullDownRefresh();
      }
    },
    editItem(id) {
      uni.navigateTo({ url: id ? `/pages/admin/item-edit/index?id=${id}` : "/pages/admin/item-edit/index" });
    },
    toggleStatus(item) {
      const nextOn = item.status === 0;
      uni.showModal({
        title: `${nextOn ? "上架" : "下架"}商品？`,
        content: item.title || item.name,
        success: async (action) => {
          if (!action.confirm) return;
          const res = await wx.cloud.callFunction({
            name: "item",
            data: { method: nextOn ? "startSell" : "stopSell", _id: item._id },
          });
          if (res.result.success) {
            uni.showToast({ title: nextOn ? "已上架" : "已下架" });
            this.load();
          }
        },
      });
    },
    async resetStock(item) {
      const res = await wx.cloud.callFunction({ name: "item", data: { method: "reloadStock", ids: [item._id] } });
      if (res.result.success) {
        uni.showToast({ title: "库存已补充" });
        this.load();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: #f7f9fa; color: #172033; padding-bottom: 32px; }
.toolbar { display: flex; gap: 10px; padding: 16px 16px 10px; background: #fff; }
.search { flex: 1; height: 42px; box-sizing: border-box; padding: 0 14px; border-radius: 12px; background: #f4f6f8; font-size: 14px; }
.add { width: 76px; height: 42px; line-height: 42px; margin: 0; padding: 0; background: #f36f7b; color: #fff; border: 0; border-radius: 12px; font-size: 14px; }
.add::after { border: 0; }
.filters { display: flex; gap: 8px; padding: 8px 16px 14px; background: #fff; overflow-x: auto; white-space: nowrap; }
.filters span { padding: 7px 12px; border-radius: 14px; background: #f4f6f8; color: #7c8798; font-size: 12px; }
.filters span.active { background: #fff0f1; color: #ed5f6d; }
.list { margin-top: 10px; background: #fff; }
.item-row { display: flex; padding: 16px; }
.item-row + .item-row { border-top: 1px solid #edf0f4; }
.image { width: 76px; height: 76px; border-radius: 10px; flex-shrink: 0; margin-right: 12px; }
.main { flex: 1; min-width: 0; }
.top-line { display: flex; justify-content: space-between; gap: 8px; }
.name { font-size: 16px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.status { flex-shrink: 0; font-size: 11px; padding: 4px 8px; border-radius: 10px; }
.status.on { color: #159a62; background: #eaf8f1; }
.status.off { color: #8b95a7; background: #f0f2f5; }
.meta { display: flex; gap: 14px; color: #7c8798; font-size: 12px; margin-top: 10px; }
.meta .price { color: #ed5f6d; font-size: 15px; font-weight: 600; }
.meta .warning { color: #ed5f6d; }
.actions { display: flex; justify-content: flex-end; gap: 20px; margin-top: 12px; color: #4d586b; font-size: 12px; }
.empty { text-align: center; color: #8b95a7; padding: 64px 16px; }
</style>
