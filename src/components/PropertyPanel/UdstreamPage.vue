<template>
  <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
    <el-tab-pane label="属性" name="com-info">
      <component :is="resCom.currentComponent" :optionData="udstreamStore.getSelectedUdstreamNode" />
    </el-tab-pane>
    <el-tab-pane label="事件" name="com-event">
      <component :is="resCom.currentEventComponent" :optionData="udstreamStore.getSelectedUdstreamNode" />
    </el-tab-pane>
  </el-tabs>
</template>
<script lang="ts" setup>
import { ref, onMounted, watch, computed, shallowRef, reactive, shallowReactive, markRaw } from "vue"
import { loadAsyncComponent } from "@/utils/components"
import { useUdstreamStore } from "@/store/modules/udstreamStore"
import { ProjectNode } from "@/udStream/types/ProjectNode"
const udstreamStore = useUdstreamStore()
const activeName = ref("com-info")

//当前的组件
const currentComponent = ref(null)
// let _currentComponent = null
const currentEventComponent = ref(null)
//异步加载的页面（组件属性）
const MapConfigPage = loadAsyncComponent(() => import("./udstreamSourecPanel/mapConfig.vue")) //地图底图配置
const UdsConfigPage = loadAsyncComponent(() => import("./udstreamSourecPanel/udsConfig.vue")) //UDS模型的配置
const GltfConfigPage = loadAsyncComponent(() => import("./udstreamSourecPanel/gltfConfig.vue")) //其它模型的配置
const SelectConfigPage = loadAsyncComponent(() => import("./udstreamSourecPanel/selectConfig.vue"))
const PointConfigPage = loadAsyncComponent(() => import("./udstreamSourecPanel/pointConfig.vue")) //单个点位的配置
const PointCollectConfigPage = loadAsyncComponent(() => import("./udstreamSourecPanel/pointCollectConfig.vue")) //点位集合的配置
const MeasureConfigPage = loadAsyncComponent(() => import("./udstreamSourecPanel/measureConfig.vue")) //长度与面积
const VerticalConfigPage = loadAsyncComponent(() => import("./udstreamSourecPanel/verticalConfig.vue")) //垂直测距
const MediaConfigPage = loadAsyncComponent(() => import("./udstreamSourecPanel/mediaConfig.vue")) //多媒体
const CameraConfigPage = loadAsyncComponent(() => import("./udstreamSourecPanel/cameraConfig.vue")) //相机
const FilterConfigPage = loadAsyncComponent(() => import("./udstreamSourecPanel/filterConfig.vue")) //过滤的配置
//异步加载的页面 （组件的事件）
const OtherEventPage = loadAsyncComponent(() => import("./udstreamSoureEvent/otherEvent.vue")) //其它组件的事件
const MeasureEventPage = loadAsyncComponent(() => import("./udstreamSoureEvent/measureEvent_new.vue")) //测量组件的事件
const PointEventPage = loadAsyncComponent(() => import("./udstreamSoureEvent/pointEvent_new.vue")) //单个点位的事件
const OtherModelEventPage = loadAsyncComponent(() => import("./udstreamSoureEvent/modelEvent_new.vue")) //其它模型的事件

const resCom = computed(() => {
  // console.log("udstreamStore.getSelectedUdstreamNode", udstreamStore.getSelectedUdstreamNode)
  if (udstreamStore.getSelectedUdstreamNode) {
    return renderComponentByAttribute(udstreamStore.getSelectedUdstreamNode)
  }
  return { currentComponent: null, currentEventComponent: null }
})

// const domTabIndexList = reactive({
//   tabs:['MapConfigPage','UdsConfigPage','GltfConfigPage','SelectConfigPage','PointConfigPage','PointCollectConfigPage','MeasureConfigPage','VerticalConfigPage','MediaConfigPage','CameraConfigPage','FilterConfigPage','OtherEventPage','MeasureEventPage'],
//   currentTab:'',
// })

// const domTab =shallowReactive({
//   MapConfigPage,UdsConfigPage,GltfConfigPage,SelectConfigPage,PointConfigPage,PointCollectConfigPage,MeasureConfigPage,VerticalConfigPage,MediaConfigPage,CameraConfigPage,FilterConfigPage,OtherEventPage,MeasureEventPage
// })
//根据getSelectedUdstreamNode中的值  获取属性  以及对应要渲染的组件
const renderComponentByAttribute = (udstreamNode: ProjectNode) => {
  let info_com = null
  let event_com = null
  if (udstreamNode.itemtypeStr.toLowerCase() == "uds") {
    // currentComponent.value = UdsConfigPage
    // currentEventComponent.value = OtherEventPage
    info_com = UdsConfigPage
    event_com = OtherEventPage
  } else if (udstreamNode.itemtypeStr.toLowerCase() == "maptile") {
    // currentComponent.value = MapConfigPage
    // currentEventComponent.value = OtherEventPage
    info_com = MapConfigPage
    event_com = OtherEventPage
  } else if (udstreamNode?.itemtype == 10) {
    //其它模型
    info_com = GltfConfigPage
    event_com = OtherModelEventPage
  } else if (udstreamNode.itemtypeStr.toLowerCase() == "media") {
    // currentComponent.value = MediaConfigPage
    // currentEventComponent.value = OtherEventPage
    info_com = MediaConfigPage
    event_com = OtherEventPage
  } else if (
    udstreamNode.itemtypeStr.toLowerCase() == "poi" &&
    (udstreamNode.geomtype == 3 || udstreamNode.geomtype == 5)
  ) {
    //测量
    // currentComponent.value = MeasureConfigPage
    // currentEventComponent.value = MeasureEventPage
    info_com = MeasureConfigPage
    event_com = MeasureEventPage
  } else if (udstreamNode.itemtypeStr.toLowerCase() == "poi" && udstreamNode.geomtype == 1) {
    //单个标注
    // currentComponent.value = PointConfigPage
    // currentEventComponent.value = OtherEventPage
    info_com = PointConfigPage
    event_com = PointEventPage
  } else if (udstreamNode.itemtypeStr.toLowerCase() == "places") {
    //标注集合
    // currentComponent.value = PointCollectConfigPage
    // currentEventComponent.value = OtherEventPage
    info_com = PointCollectConfigPage
    event_com = OtherEventPage
  } else if (udstreamNode.itemtypeStr.toLowerCase() == "poi" && udstreamNode.geomtype == 22) {
    //选取
    // currentComponent.value = SelectConfigPage
    // currentEventComponent.value = OtherEventPage
    info_com = SelectConfigPage
    event_com = OtherEventPage
  } else if (udstreamNode.itemtypeStr.toLowerCase() == "camera") {
    //相机
    // currentComponent.value = CameraConfigPage
    // currentEventComponent.value = OtherEventPage
    info_com = CameraConfigPage
    event_com = OtherEventPage
  } else if (udstreamNode.itemtypeStr.toLowerCase() == "mheight") {
    //垂直测距
    // currentComponent.value = VerticalConfigPage
    // currentEventComponent.value = OtherEventPage
    info_com = VerticalConfigPage
    event_com = OtherEventPage
  } else if (udstreamNode.itemtypeStr.toLowerCase() == "qfilter") {
    //过滤的配置
    // currentComponent.value = FilterConfigPage
    // currentEventComponent.value = OtherEventPage
    info_com = FilterConfigPage
    event_com = OtherEventPage
  }
  // shallowRef(currentComponent.value)
  // shallowRef(currentEventComponent.value)
  // info_com = currentComponent.value
  // event_com = currentEventComponent.value
  return { currentComponent: info_com, currentEventComponent: event_com }
}

//切换属性与事件列表
const handleClick = () => {}

onMounted(() => {
  // renderComponentByAttribute(udstreamStore.getSelectedUdstreamNode)
})

watch(
  () => udstreamStore.getSelectedUdstreamNode?.UUID,
  (nw, ol) => {
    if (nw) {
      console.log("udstream page watch")
      // renderComponentByAttribute(udstreamStore.getSelectedUdstreamNode)
    }
  }
)
</script>

<style scoped></style>
