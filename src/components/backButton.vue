<template>
  <div class="backButton" @click="handleBack">
    <uni-icons type="back" size="16"></uni-icons>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isPageStackNull: false
    }
  },
  onLoad() {
    if (getCurrentPages().length === 1) {
      this.isPageStackNull = true
    }
  },
  methods: {
    handleBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.backButton {
  position: fixed;
  top: 50px;
  left: 6px;
}
.button {
  width: 32px;
  height: 32px;
  border-radius: 16px;
  border: 1rpx solid #ddd;
  text-align: center;
  line-height: 32px;
  font-size: 16px;
  color: #333;
}
</style>