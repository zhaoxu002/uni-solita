<template>
  <div class="container">
    <uni-icons type="back" size="30"></uni-icons>
  </div>
</template>

<script>
import uniIcons from './uni-icons/uni-icons.vue'
export default {
  components: { uniIcons },

}
</script>

<style scoped>
.container {
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
  color: #ddd;
}
</style>