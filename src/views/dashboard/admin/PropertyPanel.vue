<template>
  <div class="property-panel" v-if="!udstreamStore.getIsSelected">
    <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
      <el-tab-pane v-for="item in globalTabList" :key="item.key" :label="item.title" :name="item.key">
        <component :is="item.render" />
      </el-tab-pane>
    </el-tabs>
  </div>
  <div class="property-panel" v-if="udstreamStore.getIsSelected">
    <div>
      <udstream-page />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue"
import type { TabsPaneContext } from "element-plus"
import { loadAsyncComponent } from "@/utils/components"
// =>todo udstream的Pinia相关的
import { useUdstreamStore } from "@/store/modules/udstreamStore"
const udstreamStore = useUdstreamStore()

const activeName = ref("page-config")
//异步加载的页面
const ConfigPage = loadAsyncComponent(() => import("@/components/PropertyPanel/ConfigPage.vue"))
const TurnPage = loadAsyncComponent(() => import("@/components/PropertyPanel/TurnPage.vue"))
const UdstreamPage = loadAsyncComponent(() => import("@/components/PropertyPanel/UdstreamPage.vue"))

const handleClick = (tab: TabsPaneContext, event: Event) => {
  console.log(tab, event)
}

// 页面配置
const globalTabList = [
  {
    key: "page-config",
    title: "页面配置",
    icon: "",
    render: ConfigPage
  },
  {
    key: "page-turn",
    title: "转场",
    icon: "",
    render: TurnPage
  }
]
</script>
<style scoped>
.property-panel {
  width: 240px;
  margin: 0 6px;
  height: 100%;
  overflow-y: auto;
}
</style>
