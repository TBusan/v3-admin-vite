<template>
  <div :class="{ 'has-logo': showSidebarLogo }">
    <SidebarLogo v-if="showSidebarLogo" :collapse="isCollapse" />
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <split-panel
        direction="column"
        :min="20"
        :max="80"
        :triggerLength="20"
        :paneLengthPercent="paneLengthPercent"
        @updatePaneLengthPercent="updatePaneLengthPercent"
      >
        <template v-slot:one>
          <page-item/>
        </template>
        <template v-slot:two>
          <layer-item />
        </template>
      </split-panel>
    </el-scrollbar>
  </div>
</template>
<script lang="ts" setup>
import { computed, ref } from "vue"
import { storeToRefs } from "pinia"
import { useAppStore } from "@/store/modules/app"
import { useSettingsStore } from "@/store/modules/settings"

//组件
import LayerItem from "./LayerItem_new.vue"
import PageItem from "./PageItem.vue"
import SidebarLogo from "./SidebarLogo.vue"
import SplitPanel from "@/components/SplitPanel/index.vue"

const appStore = useAppStore()

const settingsStore = useSettingsStore()

const { showSidebarLogo } = storeToRefs(settingsStore)

const paneLengthPercent = ref(30)

const updatePaneLengthPercent = (params: number) => {
  console.log("dddd")
  paneLengthPercent.value = params
}

const isCollapse = computed(() => {
  return !appStore.sidebar.opened
})
</script>

<style lang="scss" scoped>
@mixin tip-line {
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 2px;
    height: 100%;
    background-color: var(--v3-sidebar-menu-tip-line-bg-color);
  }
}

.has-logo {
  .el-scrollbar {
    height: calc(100% - var(--v3-header-height));
  }
}

.el-scrollbar {
  height: 100%;
  :deep(.scrollbar-wrapper) {
    // 限制水平宽度
    overflow-x: hidden !important;
    overflow-y: hidden !important;
    .el-scrollbar__view {
      height: 100%;
      overflow-y: hidden !important;
    }
  }
  // 滚动条
  :deep(.el-scrollbar__bar) {
    &.is-horizontal {
      // 隐藏水平滚动条
      display: none;
    }
  }
}

.el-menu {
  border: none;
  height: 100%;
  width: 100% !important;
}

:deep(.el-menu-item),
:deep(.el-sub-menu__title),
:deep(.el-sub-menu .el-menu-item) {
  height: var(--v3-sidebar-menu-item-height);
  line-height: var(--v3-sidebar-menu-item-height);
  &.is-active,
  &:hover {
    background-color: var(--v3-sidebar-menu-hover-bg-color);
  }
  display: block;
  * {
    vertical-align: middle;
  }
}

:deep(.el-menu-item) {
  &.is-active {
    @include tip-line;
  }
}

.el-menu--collapse {
  :deep(.el-sub-menu) {
    &.is-active {
      .el-sub-menu__title {
        color: var(--v3-sidebar-menu-active-text-color) !important;
        @include tip-line;
      }
    }
  }
}

.box-card-top {
  // height: 40%;
}

.box-card-down {
  // height: 60%;
}
.card-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}
</style>
