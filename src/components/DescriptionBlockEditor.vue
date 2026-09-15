<template>
  <div class="description-section">
    <div class="description-heading">
      <div>
        <div class="section-title">{{ title }}</div>
        <div class="section-help">{{ help }}</div>
      </div>
      <div class="block-actions">
        <button @click="addTextBlock">添加文字</button>
        <button @click="addImageBlock">添加图片</button>
      </div>
    </div>

    <div v-if="!value.length" class="blocks-empty">{{ emptyText }}</div>
    <div v-for="(block, index) in value" :key="block.key" class="content-block">
      <textarea
        v-if="block.type === 'text'"
        :value="block.content"
        class="block-textarea"
        auto-height
        :maxlength="-1"
        :placeholder="textPlaceholder"
        @input="updateText(index, $event.detail.value)"
      ></textarea>
      <image
        v-else
        class="block-image"
        :src="block.url"
        mode="widthFix"
        @click="previewBlockImage(block.url)"
      ></image>
      <div class="block-toolbar">
        <span :class="{ disabled: index === 0 }" @click="moveBlock(index, -1)">上移</span>
        <span :class="{ disabled: index === value.length - 1 }" @click="moveBlock(index, 1)">下移</span>
        <span class="danger" @click="removeBlock(index)">删除</span>
      </div>
    </div>

    <div v-if="value.length" class="description-preview">
      <div class="preview-heading">效果预览</div>
      <div class="preview-content">
        <mp-html :content="preview"></mp-html>
      </div>
    </div>
  </div>
</template>

<script>
import mpHtml from "@/uni_modules/mp-html/components/mp-html/mp-html.vue";
import {
  createDescriptionBlockKey,
  descriptionBlocksToHtml,
  serializeDescriptionBlocks,
} from "@/utils/descriptionBlocks";

export default {
  components: { mpHtml },
  props: {
    value: { type: Array, default: () => [] },
    title: { type: String, default: "内容介绍" },
    help: { type: String, default: "用文字和图片组成内容，支持调整顺序" },
    emptyText: { type: String, default: "还没有内容" },
    textPlaceholder: { type: String, default: "输入一段介绍文字" },
    imageCloudPath: { type: String, required: true },
  },
  computed: {
    preview() {
      return descriptionBlocksToHtml(this.value);
    },
  },
  methods: {
    update(nextValue) {
      this.$emit("input", nextValue);
    },
    updateText(index, content) {
      const blocks = this.value.slice();
      blocks.splice(index, 1, { ...blocks[index], content });
      this.update(blocks);
    },
    addTextBlock() {
      this.update([...this.value, { type: "text", content: "", key: createDescriptionBlockKey() }]);
    },
    addImageBlock() {
      uni.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        success: ({ tempFilePaths }) => {
          this.update([...this.value, {
            type: "image",
            url: tempFilePaths[0],
            pending: true,
            key: createDescriptionBlockKey(),
          }]);
        },
      });
    },
    moveBlock(index, direction) {
      const target = index + direction;
      if (target < 0 || target >= this.value.length) return;
      const blocks = this.value.slice();
      const moving = blocks.splice(index, 1)[0];
      blocks.splice(target, 0, moving);
      this.update(blocks);
    },
    removeBlock(index) {
      const blocks = this.value.slice();
      blocks.splice(index, 1);
      this.update(blocks);
    },
    previewBlockImage(url) {
      uni.previewImage({ urls: [url] });
    },
    async uploadPendingImages() {
      const blocks = this.value.slice();
      for (let index = 0; index < blocks.length; index += 1) {
        const block = blocks[index];
        if (block.type !== "image" || !block.pending) continue;
        const extension = block.url.split(".").pop() || "jpg";
        const result = await wx.cloud.uploadFile({
          cloudPath: `${this.imageCloudPath}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`,
          filePath: block.url,
        });
        blocks.splice(index, 1, { ...block, url: result.fileID, pending: false });
        this.update(blocks.slice());
      }
      return serializeDescriptionBlocks(blocks);
    },
  },
};
</script>

<style lang="scss" scoped>
.description-section { margin-top: 12px; padding: 16px; border-radius: 14px; background: #fff; }
.description-heading { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }
.section-title { color: #172033; font-size: 16px; font-weight: 600; }
.section-help { color: #8b95a7; font-size: 12px; margin-top: 4px; }
.block-actions { display: flex; gap: 6px; flex-shrink: 0; }
.block-actions button { height: 32px; line-height: 32px; margin: 0; padding: 0 10px; border: 0; border-radius: 16px; color: #ed5f6d; background: #fff0f1; font-size: 11px; }
.block-actions button::after { border: 0; }
.blocks-empty { padding: 28px 0 12px; text-align: center; color: #a0a8b5; font-size: 13px; }
.content-block { margin-top: 14px; padding: 10px; border-radius: 10px; background: #f7f9fa; }
.block-textarea { box-sizing: border-box; width: 100%; min-height: 92px; padding: 4px; color: #303a4d; font-size: 14px; line-height: 1.6; }
.block-image { display: block; width: 100%; max-height: 280px; border-radius: 8px; }
.block-toolbar { display: flex; justify-content: flex-end; gap: 22px; margin-top: 8px; color: #687386; font-size: 12px; }
.block-toolbar .disabled { color: #c6ccd5; }
.block-toolbar .danger { color: #ed5f6d; }
.description-preview { margin-top: 18px; padding-top: 14px; border-top: 1px solid #edf0f4; }
.preview-heading { color: #172033; font-size: 14px; font-weight: 600; margin-bottom: 10px; }
.preview-content { color: #4d586b; font-size: 13px; line-height: 1.7; }
</style>
