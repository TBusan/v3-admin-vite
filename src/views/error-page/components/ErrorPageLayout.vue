<template>
  <div class="error-page">
    <div class="error-page-svg">
      <slot />
    </div>
    <el-button type="primary" @click="backToPage">回到优立云世界</el-button>
  </div>
</template>
<script lang="ts" setup>
const backToPage = () => {
  window.open("https://cloud.eulee.cn/#/UdAssets/Project", "_self")
}
</script>

<style lang="scss" scoped>
.error-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  &-svg {
    width: 400px;
    margin-bottom: 50px;
  }
}
</style>
