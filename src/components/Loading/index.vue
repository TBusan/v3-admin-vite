<template>
  <!-- svg加载图 -->
  <div class="go-loading-svg go-flex-center">
    <img src="~@/assets/images/loadingSvg.svg" alt="" />
  </div>
</template>
<style lang="scss" scoped>
.go-loading-svg {
  width: 100%;
  height: 100%;
  background-color: transparent;
  img {
    height: 50px;
  }
}

.go-flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}
</style>
