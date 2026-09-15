<template>
  <div class="page">
    <div class="form">
      <div class="image-section" @click="chooseImage">
        <image v-if="formData.defaultImg" class="product-image" :src="formData.defaultImg" mode="aspectFill"></image>
        <div v-else class="image-action">选择商品图片</div>
        <div class="change-image">{{ formData.defaultImg ? "更换图片" : "支持相册或拍照" }}</div>
      </div>

      <label class="field">
        <span>商品标题</span>
        <input v-model="formData.title" placeholder="例如：新西兰牛腩" />
      </label>
      <label class="field">
        <span>内部名称</span>
        <input v-model="formData.name" placeholder="用于后台识别" />
      </label>
      <label class="field">
        <span>副标题</span>
        <input v-model="formData.subTitle" placeholder="一句话介绍商品" />
      </label>
      <div class="two-columns">
        <label class="field">
          <span>价格</span>
          <input v-model="formData.price" type="digit" placeholder="0.00" />
        </label>
        <label class="field">
          <span>当前库存</span>
          <input v-model="formData.stock" type="number" placeholder="0" />
        </label>
      </div>
      <div class="two-columns">
        <label class="field">
          <span>默认库存</span>
          <input v-model="formData.defaultStock" type="number" placeholder="0" />
        </label>
        <label class="field">
          <span>展示顺序</span>
          <input v-model="formData.displayOrder" type="number" placeholder="数字越小越靠前" />
        </label>
      </div>
      <description-block-editor
        ref="descriptionEditor"
        v-model="descriptionBlocks"
        class="item-description"
        title="商品说明"
        help="用文字和图片组成说明，支持调整顺序"
        empty-text="还没有商品说明"
        text-placeholder="输入一段商品说明"
        :image-cloud-path="`admin/items/${id || 'new'}/description`"
      />
      <div class="switch-row">
        <div><strong>推荐商品</strong><small>在接龙中优先展示</small></div>
        <switch :checked="formData.recommend" color="#f36f7b" @change="formData.recommend = $event.detail.value" />
      </div>
    </div>

    <div class="bottom-bar">
      <button class="save" :loading="saving" @click="submit">保存商品</button>
    </div>
  </div>
</template>

<script>
import DescriptionBlockEditor from "@/components/DescriptionBlockEditor.vue";
import {
  descriptionBlocksToHtml,
  legacyHtmlToDescriptionBlocks,
  normalizeDescriptionBlocks,
} from "@/utils/descriptionBlocks";

export default {
  components: { DescriptionBlockEditor },
  data() {
    return {
      id: "",
      saving: false,
      formData: {
        title: "",
        name: "",
        subTitle: "",
        defaultImg: "",
        price: "",
        stock: "",
        defaultStock: "",
        displayOrder: "",
        recommend: false,
      },
      descriptionBlocks: [],
    };
  },
  onLoad(options) {
    this.id = options.id || "";
    if (this.id) this.load();
  },
  methods: {
    async load() {
      const res = await wx.cloud.callFunction({ name: "item", data: { method: "getOne", _id: this.id } });
      if (res.result.success) {
        const item = res.result.data;
        this.formData = {
          title: item.title || "",
          name: item.name || "",
          subTitle: item.subTitle || "",
          defaultImg: item.defaultImg || "",
          price: item.price,
          stock: item.stock,
          defaultStock: item.defaultStock || item.stock,
          displayOrder: item.displayOrder || "",
          recommend: Boolean(item.recommend),
        };
        this.descriptionBlocks = Array.isArray(item.descriptionBlocks) && item.descriptionBlocks.length
          ? normalizeDescriptionBlocks(item.descriptionBlocks)
          : legacyHtmlToDescriptionBlocks(item.description || "");
      }
    },
    chooseImage() {
      uni.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        success: async ({ tempFilePaths }) => {
          uni.showLoading({ title: "上传中" });
          try {
            const path = tempFilePaths[0];
            const extension = path.split(".").pop() || "jpg";
            const result = await wx.cloud.uploadFile({
              cloudPath: `admin/items/${Date.now()}.${extension}`,
              filePath: path,
            });
            this.formData.defaultImg = result.fileID;
          } finally {
            uni.hideLoading();
          }
        },
      });
    },
    async submit() {
      if (this.saving) return;
      if (!this.formData.title.trim() || Number(this.formData.price) < 0 || Number(this.formData.stock) < 0) {
        uni.showToast({ title: "请填写正确的标题、价格和库存", icon: "none" });
        return;
      }
      this.saving = true;
      uni.showLoading({ title: "保存中" });
      try {
        const descriptionBlocks = await this.$refs.descriptionEditor.uploadPendingImages();
        const payload = {
          ...this.formData,
          name: this.formData.name.trim() || this.formData.title.trim(),
          title: this.formData.title.trim(),
          price: Number(this.formData.price),
          stock: Number(this.formData.stock),
          defaultStock: Number(this.formData.defaultStock || this.formData.stock),
          displayOrder: Number(this.formData.displayOrder || 0),
          descriptionBlocks,
          description: descriptionBlocksToHtml(descriptionBlocks),
        };
        const res = await wx.cloud.callFunction({
          name: "item",
          data: this.id
            ? { method: "updateOne", _id: this.id, data: payload }
            : { method: "createOne", data: payload },
        });
        if (!res.result.success) throw new Error("保存失败");
        uni.showToast({ title: "保存成功" });
        setTimeout(() => uni.navigateBack(), 600);
      } catch (error) {
        uni.showToast({ title: "保存失败", icon: "none" });
      } finally {
        uni.hideLoading();
        this.saving = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: #f7f9fa; padding-bottom: 92px; color: #172033; }
.form { background: #fff; padding: 18px 16px; }
.image-section { text-align: center; margin-bottom: 22px; }
.product-image { width: 128px; height: 128px; border-radius: 16px; }
.image-action { width: 128px; height: 128px; line-height: 128px; margin: 0 auto; border-radius: 16px; background: #fff0f1; color: #ed5f6d; font-size: 13px; }
.change-image { margin-top: 8px; color: #8b95a7; font-size: 12px; }
.field { display: block; margin-bottom: 18px; }
.field > span { display: block; margin-bottom: 8px; color: #4d586b; font-size: 13px; }
.field input, .field textarea { box-sizing: border-box; width: 100%; border-radius: 10px; background: #f4f6f8; padding: 11px 12px; font-size: 14px; }
.field input { height: 44px; }
.field textarea { height: 100px; }
.two-columns { display: flex; gap: 12px; }
.two-columns .field { flex: 1; min-width: 0; }
.item-description { margin: 4px 0 18px; padding: 4px 0 0; border-radius: 0; }
.switch-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0 12px; }
.switch-row strong, .switch-row small { display: block; }
.switch-row strong { font-size: 14px; }
.switch-row small { color: #8b95a7; font-size: 12px; margin-top: 4px; }
.bottom-bar { position: fixed; bottom: 0; left: 0; right: 0; background: #fff; padding: 12px 16px; padding-bottom: calc(12px + env(safe-area-inset-bottom)); }
.save { height: 48px; line-height: 48px; border-radius: 24px; border: 0; background: #f36f7b; color: #fff; font-size: 16px; }
.save::after { border: 0; }
</style>
