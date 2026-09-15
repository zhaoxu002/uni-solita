<template>
  <div class="container">
    <div class="intro">设置接龙信息，保存后立即生效。</div>
    <uni-forms :model="formData" ref="form">
      <uni-forms-item label="标题" name="title" required>
        <uni-easyinput v-model="formData.title"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item label="开始时间" name="startTime" required>
        <uni-datetime-picker
          v-model="formData.startTime"
          type="datetime"
          returnType="timestamp"
        ></uni-datetime-picker>
      </uni-forms-item>
      <uni-forms-item label="结束时间" name="endTime" required>
        <uni-datetime-picker
          v-model="formData.endTime"
          type="datetime"
          returnType="timestamp"
        ></uni-datetime-picker>
      </uni-forms-item>
      <uni-forms-item label="提货时间" name="deliveryTime">
        <uni-datetime-picker
          v-model="formData.deliveryTime"
          type="datetime"
          returnType="timestamp"
        ></uni-datetime-picker>
      </uni-forms-item>
    </uni-forms>

    <description-block-editor
      ref="descriptionEditor"
      v-model="descriptionBlocks"
      title="接龙介绍"
      empty-text="还没有介绍内容"
      :image-cloud-path="`admin/purchases/${id || 'new'}/description`"
    />

    <div class="goods-section">
      <div class="goods-heading">
        <div>
          <div class="goods-title">接龙商品</div>
          <div class="goods-help">已选择 {{ itemIds.length }} 个商品</div>
        </div>
        <button class="choose-button" @click="openItemPicker">选择商品</button>
      </div>
      <div v-if="selectedItems.length" class="selected-list">
        <div
          v-for="item in selectedItems.slice(0, 5)"
          :key="item._id"
          class="selected-row"
        >
          <image
            v-if="item.defaultImg"
            class="selected-image"
            :src="item.defaultImg"
            mode="aspectFill"
          ></image>
          <div class="selected-name">{{ item.title || item.name }}</div>
          <div class="remove" @click="removeSelected(item._id)">移除</div>
        </div>
        <div v-if="selectedItems.length > 5" class="more-selected">
          另有 {{ selectedItems.length - 5 }} 个商品已选择
        </div>
      </div>
    </div>

    <div class="footer">
      <button class="secondary-button" @click="handleSaveHide">
        保存并隐藏
      </button>
      <button class="primary-button" @click="handleSavePublish">
        保存并展示
      </button>
    </div>

    <uni-popup ref="itemPopup" type="bottom">
      <div class="picker">
        <div class="picker-heading">
          <div>
            <div class="picker-title">选择接龙商品</div>
            <div class="picker-help">
              最新创建的商品排在最前，共 {{ itemTotal }} 个
            </div>
          </div>
          <div class="selected-count">已选 {{ itemIds.length }}</div>
        </div>
        <div class="search-row">
          <input
            v-model="keyword"
            class="search-input"
            confirm-type="search"
            placeholder="搜索商品名称、标题或副标题"
            @input="queueSearch"
            @confirm="searchItems"
          />
          <button class="search-button" @click="searchItems">搜索</button>
        </div>
        <scroll-view class="option-list" scroll-y @scrolltolower="loadItems">
          <div
            v-for="item in itemOptions"
            :key="item._id"
            class="option-row"
            @click="toggleItem(item)"
          >
            <checkbox :checked="isSelected(item._id)" color="#f36f7b" />
            <image
              v-if="item.defaultImg"
              class="option-image"
              :src="item.defaultImg"
              mode="aspectFill"
            ></image>
            <div class="option-main">
              <div class="option-title">{{ item.title || item.name }}</div>
              <div class="option-meta">
                <span>${{ Number(item.price || 0).toFixed(2) }}</span>
                <span>库存 {{ item.stock || 0 }}</span>
                <span v-if="item.status === 0" class="off">已下架</span>
              </div>
            </div>
          </div>
          <uni-load-more
            :status="itemLoadingStatus"
            @clickLoadMore="loadItems"
          />
        </scroll-view>
        <div class="picker-footer">
          <button class="confirm-button" @click="closeItemPicker">
            完成（已选 {{ itemIds.length }}）
          </button>
        </div>
      </div>
    </uni-popup>
  </div>
</template>

<script>
import uniForms from "@/uni_modules/uni-forms/components/uni-forms/uni-forms.vue";
import UniFormsItem from "@/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import uniDatetimePicker from "@/uni_modules/uni-datetime-picker/components/uni-datetime-picker/uni-datetime-picker.vue";
import DescriptionBlockEditor from "@/components/DescriptionBlockEditor.vue";
import {
  descriptionBlocksToHtml,
  legacyHtmlToDescriptionBlocks,
  normalizeDescriptionBlocks,
} from "@/utils/descriptionBlocks";

export default {
  components: {
    uniForms,
    UniFormsItem,
    UniEasyinput,
    uniDatetimePicker,
    DescriptionBlockEditor,
  },
  data() {
    return {
      id: "",
      formData: {
        startTime: 0,
        endTime: 0,
        deliveryTime: undefined,
        title: "",
      },
      descriptionBlocks: [],
      saving: false,
      itemIds: [],
      selectedItems: [],
      itemOptions: [],
      itemTotal: 0,
      itemCurrent: 1,
      itemPageSize: 20,
      itemLoading: false,
      itemLoadingStatus: "more",
      keyword: "",
      searchTimer: null,
    };
  },
  onLoad(options) {
    if (options.id) {
      this.fetch(options.id);
      return;
    }
    const now = Date.now();
    this.formData = {
      title: "",
      startTime: now,
      endTime: now + 24 * 60 * 60 * 1000,
      deliveryTime: undefined,
    };
  },
  beforeDestroy() {
    if (this.searchTimer) clearTimeout(this.searchTimer);
  },
  methods: {
    async fetch(id) {
      const res = await wx.cloud.callFunction({
        name: "purchase",
        data: { method: "getAdminOne", _id: id },
      });
      if (!res.result.success) {
        uni.showToast({ title: "加载失败", icon: "none" });
        return;
      }
      this.process(res);
    },
    process(res) {
      const {
        title,
        description = "",
        descriptionBlocks = [],
        startTime,
        endTime,
        deliveryTime,
        itemIds = [],
        items = [],
        _id,
      } = res.result.data;
      this.id = _id;
      this.formData = { startTime, endTime, deliveryTime, title };
      this.descriptionBlocks = descriptionBlocks.length
        ? normalizeDescriptionBlocks(descriptionBlocks)
        : legacyHtmlToDescriptionBlocks(description);
      this.itemIds = itemIds.slice();
      this.selectedItems = items.filter((item) =>
        this.itemIds.includes(item._id)
      );
    },
    openItemPicker() {
      this.$refs.itemPopup.open("bottom");
      this.searchItems();
    },
    closeItemPicker() {
      this.$refs.itemPopup.close();
    },
    queueSearch(event) {
      this.keyword = event.detail.value;
      if (this.searchTimer) clearTimeout(this.searchTimer);
      this.searchTimer = setTimeout(() => this.searchItems(), 350);
    },
    searchItems() {
      this.itemCurrent = 1;
      this.itemOptions = [];
      this.itemLoadingStatus = "more";
      this.loadItems();
    },
    async loadItems() {
      if (this.itemLoading || this.itemLoadingStatus === "noMore") return;
      this.itemLoading = true;
      this.itemLoadingStatus = "loading";
      try {
        const res = await wx.cloud.callFunction({
          name: "item",
          data: {
            method: "getAdminListByPage",
            keyword: this.keyword,
            pageQuery: { curPage: this.itemCurrent, limit: this.itemPageSize },
          },
        });
        if (!res.result.success) throw new Error("加载商品失败");
        const { data, total } = res.result.data;
        this.itemOptions = this.itemOptions.concat(data);
        this.itemTotal = total;
        this.itemCurrent += 1;
        this.itemLoadingStatus =
          this.itemOptions.length >= total ? "noMore" : "more";
      } catch (error) {
        this.itemLoadingStatus = "more";
        uni.showToast({ title: "商品加载失败", icon: "none" });
      } finally {
        this.itemLoading = false;
      }
    },
    isSelected(id) {
      return this.itemIds.includes(id);
    },
    toggleItem(item) {
      if (this.isSelected(item._id)) {
        this.removeSelected(item._id);
        return;
      }
      this.itemIds.push(item._id);
      this.selectedItems.push(item);
    },
    removeSelected(id) {
      this.itemIds = this.itemIds.filter((itemId) => itemId !== id);
      this.selectedItems = this.selectedItems.filter((item) => item._id !== id);
    },
    async submit(isDelete) {
      if (this.saving) return;
      try {
        const data = await this.$refs.form.validate();
        this.saving = true;
        uni.showLoading({ title: "保存中" });
        const descriptionBlocks =
          await this.$refs.descriptionEditor.uploadPendingImages();
        const payload = {
          ...data,
          itemIds: this.itemIds,
          descriptionBlocks,
          description: descriptionBlocksToHtml(descriptionBlocks),
          isDelete,
          ...(this.id ? {} : { headImages: [], locationIds: [] }),
        };
        const res = await wx.cloud.callFunction({
          name: "purchase",
          data: this.id
            ? { method: "updateOne", _id: this.id, data: payload }
            : { method: "createOne", data: payload },
        });
        if (!res.result.success) throw new Error("保存失败");
        uni.showToast({ title: "保存成功" });
        setTimeout(() => uni.navigateBack(), 600);
      } catch (error) {
        if (this.saving) uni.showToast({ title: "保存失败", icon: "none" });
      } finally {
        this.saving = false;
        uni.hideLoading();
      }
    },
    handleSavePublish() {
      this.submit(false);
    },
    handleSaveHide() {
      this.submit(true);
    },
  },
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 20px 16px 100px;
  background: #f7f9fa;
}
.intro {
  color: #7c8798;
  font-size: 13px;
  margin-bottom: 20px;
}
.goods-section {
  margin-top: 12px;
  padding: 16px;
  border-radius: 14px;
  background: #fff;
}
.goods-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.goods-title {
  color: #172033;
  font-size: 16px;
  font-weight: 600;
}
.goods-help,
.picker-help {
  color: #8b95a7;
  font-size: 12px;
  margin-top: 4px;
}
.choose-button {
  width: 88px;
  height: 36px;
  line-height: 36px;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 18px;
  color: #ed5f6d;
  background: #fff0f1;
  font-size: 13px;
}
.choose-button::after,
.search-button::after,
.confirm-button::after {
  border: 0;
}
.selected-list {
  margin-top: 12px;
  border-top: 1px solid #edf0f4;
}
.selected-row {
  display: flex;
  align-items: center;
  min-height: 50px;
  border-bottom: 1px solid #edf0f4;
}
.selected-image {
  width: 34px;
  height: 34px;
  border-radius: 6px;
  margin-right: 10px;
}
.selected-name {
  flex: 1;
  min-width: 0;
  color: #303a4d;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.remove {
  color: #8b95a7;
  font-size: 12px;
  padding: 12px 0 12px 16px;
}
.more-selected {
  color: #8b95a7;
  font-size: 12px;
  padding-top: 12px;
}
.footer {
  position: fixed;
  z-index: 5;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  background: #fff;
}
.footer button {
  flex: 1;
  height: 46px;
  line-height: 46px;
  border-radius: 23px;
  font-size: 14px;
}
.primary-button {
  background: #f36f7b;
  color: #fff;
  border: 0;
}
.secondary-button {
  background: #fff0f1;
  color: #ed5f6d;
  border: 0;
}
.picker {
  height: 78vh;
  box-sizing: border-box;
  background: #fff;
  border-radius: 18px 18px 0 0;
  padding: 18px 16px 78px;
}
.picker-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.picker-title {
  color: #172033;
  font-size: 19px;
  font-weight: 700;
}
.selected-count {
  color: #ed5f6d;
  background: #fff0f1;
  border-radius: 14px;
  padding: 6px 10px;
  font-size: 12px;
}
.search-row {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}
.search-input {
  flex: 1;
  height: 42px;
  box-sizing: border-box;
  padding: 0 12px;
  border-radius: 11px;
  background: #f4f6f8;
  font-size: 13px;
}
.search-button {
  width: 64px;
  height: 42px;
  line-height: 42px;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 11px;
  background: #f36f7b;
  color: #fff;
  font-size: 13px;
}
.option-list {
  height: calc(78vh - 166px);
  margin-top: 10px;
}
.option-row {
  display: flex;
  align-items: center;
  min-height: 68px;
  border-bottom: 1px solid #edf0f4;
}
.option-row checkbox {
  transform: scale(0.8);
  margin-right: 2px;
}
.option-image {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: 8px;
  margin-right: 10px;
}
.option-main {
  flex: 1;
  min-width: 0;
}
.option-title {
  color: #303a4d;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.option-meta {
  display: flex;
  gap: 12px;
  margin-top: 7px;
  color: #7c8798;
  font-size: 11px;
}
.option-meta .off {
  color: #ed5f6d;
}
.picker-footer {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 10px 16px;
  padding-bottom: calc(10px + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1px solid #edf0f4;
}
.confirm-button {
  height: 46px;
  line-height: 46px;
  border: 0;
  border-radius: 23px;
  background: #f36f7b;
  color: #fff;
  font-size: 14px;
}
</style>
