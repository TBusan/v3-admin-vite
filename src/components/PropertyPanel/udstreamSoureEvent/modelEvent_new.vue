<template>
  <div>
    <div class="event-list-table" v-show="tabActiveType == 'none'">
      <div class="eventItem" :class="disableSingleClick ? 'disableSingleClick' : ''">
        <div class="eventItem-row">
          <label class="event-row-label">单击一次</label>
          <el-icon @click="setClickAction"><Setting /></el-icon>
        </div>
        <div class="eventItem-row-second">
          <el-icon><DataLine /></el-icon>
          <label class="event-row-label_has" v-if="clickActionList.length > 0"
            >已有{{ clickActionList.length }}个动作</label
          >
          <label class="event-row-label" v-else>暂无动作</label>
        </div>
      </div>
      <div class="eventItem" :class="disableContinuousClick ? 'disableContinuousClick' : ''">
        <div class="eventItem-row">
          <label class="event-row-label">连续点击</label>
          <el-icon @click="setContinuousClick"><Setting /></el-icon>
        </div>
        <div class="eventItem-row-second">
          <el-icon><DataLine /></el-icon>
          <label class="event-row-label_has" v-if="continuousClick.length > 0"
            >已有{{ continuousClick.length }}个动作</label
          >
          <label class="event-row-label" v-else>暂无动作</label>
        </div>
      </div>
      <div class="eventItem">
        <div class="eventItem-row">
          <label class="event-row-label">漫游触碰</label>
          <el-icon @click="setRoamAction"><Setting /></el-icon>
        </div>
        <div class="eventItem-row-second">
          <el-icon><DataLine /></el-icon>
          <label class="event-row-label_has" v-if="roamActionList.length > 0"
            >已有{{ roamActionList.length }}个动作</label
          >
          <label class="event-row-label" v-else>暂无动作</label>
        </div>
      </div>
    </div>
    <EventClick
      v-if="tabActiveType == 'singleClick'"
      :optionData="currentUdstreamNode"
      @back2EventList="back2EventListFromChild"
    ></EventClick>
    <EventMoreClick
      v-else-if="tabActiveType == 'continueClick'"
      :optionData="currentUdstreamNode"
      @back2EventList="back2EventListFromChild"
    ></EventMoreClick>
    <EventRoam
      v-else-if="tabActiveType == 'roam'"
      :optionData="currentUdstreamNode"
      @back2EventList="back2EventListFromChild"
    ></EventRoam>
  </div>
</template>
<script lang="ts" setup>
import { PropType, ref, onMounted, toRaw, watch, computed } from "vue"
import { Setting, DataLine, Back, CirclePlus, Plus, Minus, CloseBold, CircleCloseFilled } from "@element-plus/icons-vue"
import { ElMessage, ElMessageBox } from "element-plus"
import { usePageInfoStore } from "@/store/modules/pageInfoStore"
import { useUdStreamCameraStore } from "@/store/modules/udstreamCamera"
import { useUdstreamStore } from "@/store/modules/udstreamStore"
import { ProjectNode, ProjectNodeType, Point } from "@/udStream/types/ProjectNode"
//引入组件
import EventClick from "./eventClick.vue"
import EventMoreClick from "./eventMoreClick.vue"
import EventRoam from "./eventRoam.vue"

const props = defineProps({
  optionData: {
    type: Object as PropType<ProjectNode>,
    required: true
  }
})

const tabActiveType = ref("none") //当前的tab页

// //概览面板的显示
// const overviewShow = ref(true)
const clickActionList = ref([]) //点击事件的列表
const continuousClick = ref([]) //连续点击事件的列表
const roamActionList = ref([]) //漫游事件的列表

//单击的样式
const disableSingleClick = computed(() => {
  return continuousClick.value.length > 0
})

//连续的样式
const disableContinuousClick = computed(() => {
  return clickActionList.value.length > 0
})

//当前的节点信息
let currentUdstreamNode = props.optionData //更新节点属性全靠这个了
const pageInfoStore = usePageInfoStore()
//点击设置点击时候的事件
const setClickAction = () => {
  if (continuousClick.value.length > 0) {
    ElMessage({
      message: "已经设置连续点击事件，单击事件不可再设置！",
      type: "warning"
    })
    return
  }
  tabActiveType.value = "singleClick"
}

//设置连续点击的事件
const setContinuousClick = () => {
  if (clickActionList.value.length > 0) {
    ElMessage({
      message: "已经设置单击事件，连续点击事件不可再设置！",
      type: "warning"
    })
    return
  }
  tabActiveType.value = "continueClick"
}

//点击设置漫游时候的事件
const setRoamAction = () => {
  tabActiveType.value = "roam"
}

//判断 点击元素  连续点击元素   漫游元素是否有动作
const queryAllActionList = () => {
  currentUdstreamNode = props.optionData
  const currentPageId = pageInfoStore.getSelectPageInfo.id
  console.log("currentPageId", currentPageId)
  let udstreamPageList = localStorage.getItem("udstreamPageList")
  if (udstreamPageList) {
    let udstreamPageListObj = JSON.parse(udstreamPageList)
    const findItemPage = udstreamPageListObj.find((item: any) => {
      return item.id == currentPageId
    })
    if (findItemPage) {
      const currentUdstreamNodeUUID = currentUdstreamNode.UUID
      if (findItemPage.udEvent && findItemPage.udEvent.length > 0) {
        let findItemEventList = findItemPage.udEvent.filter((item: any) => {
          return item.mainBodyId == currentUdstreamNodeUUID
        })
        if (findItemEventList && findItemEventList.length > 0) {
          for (let k = 0; k < findItemEventList.length; k++) {
            if (findItemEventList[k].handleType == "singleClick") {
              clickActionList.value = findItemEventList[k].actionList
            } else if (findItemEventList[k].handleType == "continueClick") {
              continuousClick.value = findItemEventList[k].actionList
            } else if (findItemEventList[k].handleType == "roam") {
              roamActionList.value = findItemEventList[k].actionList
            }
          }
        } else {
          clickActionList.value = [] //点击
          continuousClick.value = [] //连续点击
          roamActionList.value = [] //漫游
        }
      }
    }
  }
}

//退回到事件列表
const back2EventListFromChild = () => {
  tabActiveType.value = "none"
  //更新list里面的数据列表
  queryAllActionList()
}

onMounted(() => {
  queryAllActionList()
})

watch(
  () => props.optionData,
  (nv, ov) => {
    if (nv) {
      tabActiveType.value = "none"
      queryAllActionList()
    }
  },
  {
    deep: true
  }
)
</script>

<style scoped>
.event-list-table {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 10px;
  box-sizing: border-box;
  border-radius: 5px;
}
.eventItem {
  width: 100%;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  height: 80px;
  padding: 10px;
}
.eventItem:hover {
  cursor: pointer;
  border: 1px solid #3f9eff;
}
.eventItem-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
.eventItem-row-second {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 12px;
  justify-items: center;
}
.event-row-label {
  color: #fff;
  font-size: 14px;
  margin-left: 10px;
}
.event-row-label_has {
  color: #3f9eff;
  font-size: 14px;
  margin-left: 10px;
}
.disableSingleClick {
  border: 1px solid #666;
}
.disableContinuousClick {
  border: 1px solid #666;
}
.disableSingleClick:hover {
  border: 1px solid #666;
  cursor: auto;
}
.disableContinuousClick:hover {
  border: 1px solid #666;
  cursor: auto;
}
</style>
