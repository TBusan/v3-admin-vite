<template>
  <div class="sidebar-logo-container" :class="{ collapse: props.collapse }">
    <transition name="sidebar-logo-fade">
      <div v-if="props.collapse" key="collapse" class="logo-icon" @click="toEuleeCloud">
        <img src="@/assets/layout/logo.png" class="sidebar-logo" />
      </div>
      <div v-else key="expand" class="logo-icon" @click="toEuleeCloud">
        <img src="@/assets/layout/logo-text-1.png" class="sidebar-logo-text" />
      </div>
    </transition>
  </div>
</template>
<script lang="ts" setup>
const props = defineProps({
  collapse: {
    type: Boolean,
    default: true
  }
})

//跳转到优立云世界
const toEuleeCloud = () => {
  window.open("https://cloud.eulee.cn/#/UdAssets/Project", "_blank")
}
</script>

<style lang="scss" scoped>
.sidebar-logo-container {
  position: relative;
  width: 100%;
  height: var(--v3-header-height);
  line-height: var(--v3-header-height);
  background-color: var(--v3-sidebarlogo-bg-color);
  text-align: center;
  overflow: hidden;
  .sidebar-logo {
    display: none;
  }
  .sidebar-logo-text {
    width: 100%;
    height: auto;
    vertical-align: middle;
  }
}

.collapse {
  .sidebar-logo {
    width: 32px;
    height: 32px;
    vertical-align: middle;
    display: inline-block;
  }
  .sidebar-logo-text {
    display: none;
  }
}

.logo-icon:hover {
  cursor: pointer;
}
</style>
