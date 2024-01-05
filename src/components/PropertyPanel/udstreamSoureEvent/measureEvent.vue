<template>
  <el-switch
    v-model="eventComponentShow"
    class="ml-2"
    inline-prompt
    style="--el-switch-on-color: #409eff; --el-switch-off-color: #13ce66"
    active-text="关闭事件"
    inactive-text="添加事件"
    @change="switchEvent"
  />
  <div class="evnet-class">
    <div v-show="eventComponentShow">
      <div class="evnet-class-item">
        <span class="ml-3 w-35 text-gray-400 text-sm inline-flex items-center mb-2">事件</span>
        <el-select v-model="eventValue" placeholder="Select" @change="handleEventChange">
          <el-option v-for="item in eventListOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </div>
      <div class="evnet-class-item">
        <span class="ml-3 w-35 text-gray-400 text-sm inline-flex items-center mb-2">动作</span>
        <el-select v-model="actionValue" placeholder="Select" @change="handleActionChange">
          <el-option v-for="item in actionListOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </div>
      <div class="evnet-class-item" v-show="actionValue == 'sceneTransition'">
        <span class="ml-3 w-35 text-gray-400 text-sm inline-flex items-center mb-2">选择目标场景</span>
        <el-select v-model="scenValue" placeholder="选择">
          <el-option v-for="item in scenListOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </div>
      <div class="evnet-class-item" v-show="actionValue == 'sceneJump'">
        <span class="ml-3 w-35 text-gray-400 text-sm inline-flex items-center mb-2">选择目标视点</span>
        <el-select v-model="viewPointValue" placeholder="选择" @change="handleViewPointChange">
          <el-option v-for="item in viewsOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, toRaw, watch, onMounted } from "vue"
import { ProjectNode, Point } from "@/udStream/types/ProjectNode"
import { usePageInfoStore } from "@/store/modules/pageInfoStore"
import { useUdStreamCameraStore } from "@/store/modules/udstreamCamera"
import * as udStream from "@/udStream/udStream"

const props = defineProps({
  optionData: {
    type: Object as PropType<ProjectNode>,
    required: true
  }
})
const udStreamCameraStore = useUdStreamCameraStore()
const pageInfoStore = usePageInfoStore()
const eventComponentShow = ref(false)
//当前的节点信息
let currentUdstreamNode = props.optionData
const viewType = ref("选择目标场景")

let tempDeleteEventInfo = null //切换添加属性与删除属性时，存储删除的事件信息

// 事件触发的值
const eventValue = ref("roamTouch")
const actionValue = ref("sceneTransition") //动作的默认值

const eventListOptions = ref([
  {
    value: "roamTouch",
    label: "漫游触碰"
  }
])
const actionListOptions = ref([
  {
    value: "sceneTransition",
    label: "场景转场"
  },
  {
    value: "sceneJump",
    label: "当前场景跳转"
  }
])

const scenValue = ref("") //目标场景的值
const scenListOptions = ref([]) //目标场景
const viewPointValue = ref("") //目标视点的值
const viewsOptions = ref([]) //目标视点

const isShowScene = ref(true) //是否显示目标场景
const handleEventChange = (params: any) => {
  // console.log("handleEventChange")
  console.log(params)
}

const handleActionChange = () => {}

const handleViewPointChange = (value: string) => {
  console.log(value)
  if (value) {
    console.log("sceneJump")
    udStream.moveToWhenPossible(value)
  }
}

//是否添加事件信息
const deleteEventInfo = () => {
  let uuid = currentUdstreamNode.UUID
  if (uuid) {
    let currentPageId = pageInfoStore.getSelectPageInfo.id
    let udstreamPageList = localStorage.getItem("udstreamPageList")
    if (udstreamPageList) {
      let udstreamPageListObj = JSON.parse(udstreamPageList)
      let findPageItem = udstreamPageListObj.find((item: any) => {
        return item.id == currentPageId
      })
      if (findPageItem) {
        if (findPageItem.udEvent && findPageItem.udEvent.length > 0) {
          let filterItem = findPageItem.udEvent.filter((item: any) => {
            return item.uuid != uuid
          })
          tempDeleteEventInfo = findPageItem.udEvent.filter((item: any) => {
            return item.uuid == uuid
          })[0]
          if (filterItem) {
            findPageItem.udEvent = filterItem
            localStorage.setItem("udstreamPageList", JSON.stringify(udstreamPageListObj))
          }
        }
      }
    }
  }
}

//添加事件信息
const addEventInfo = () => {
  let uuid = currentUdstreamNode.UUID
  if (uuid) {
    let currentPageId = pageInfoStore.getSelectPageInfo.id
    let udstreamPageList = localStorage.getItem("udstreamPageList")
    if (udstreamPageList) {
      let udstreamPageListObj = JSON.parse(udstreamPageList)
      const findPageItem = udstreamPageListObj.find((item: any) => {
        return item.id == currentPageId
      })
      if (findPageItem) {
        if (findPageItem.udEvent && findPageItem.udEvent.length > 0) {
          const findEvent = findPageItem.udEvent.find((item: any) => {
            return item.uuid == uuid
          })
          if (findEvent) {
            return
          } else {
            findPageItem.udEvent.push(tempDeleteEventInfo)
            localStorage.setItem("udstreamPageList", JSON.stringify(udstreamPageListObj))
          }
        }
      }
    }
  }
}

//是否添加事件信息
const switchEvent = (value: boolean) => {
  console.log(value)
  if (value) {
    if (tempDeleteEventInfo) {
      addEventInfo()
    }
  } else {
    deleteEventInfo()
  }
}

//将事件信息存储到localstorage中
const saveEventInfo2Localstrorage = () => {
  let uuid = currentUdstreamNode.UUID
  if (uuid) {
    let viewPointOrSceneValue = ""
    if (actionValue.value == "sceneJump") {
      viewPointOrSceneValue = viewPointValue.value
    } else if (actionValue.value == "sceneTransition") {
      viewPointOrSceneValue = scenValue.value
    }

    let currentPageId = pageInfoStore.getSelectPageInfo.id
    let udstreamPageList = localStorage.getItem("udstreamPageList")
    if (udstreamPageList) {
      let udstreamPageListObj = JSON.parse(udstreamPageList)
      const findPageItem = udstreamPageListObj.find((item: any) => {
        return item.id == currentPageId
      })

      if (findPageItem) {
        if (findPageItem.udEvent && findPageItem.udEvent.length > 0) {
          const findEvent = findPageItem.udEvent.find((item: any) => {
            return item.uuid == uuid
          })

          if (findEvent) {
            findEvent.customEvent = eventValue.value
            findEvent.action = actionValue.value
            findEvent.viewPoint = viewPointOrSceneValue
          } else {
            findPageItem.udEvent.push({
              uuid: uuid,
              customEvent: eventValue.value,
              action: actionValue.value,
              viewPoint: viewPointOrSceneValue
            })
          }
        } else {
          findPageItem.udEvent = []
          findPageItem.udEvent.push({
            uuid: uuid,
            customEvent: eventValue.value,
            action: actionValue.value,
            viewPoint: viewPointOrSceneValue
          })
        }
      }
      localStorage.setItem("udstreamPageList", JSON.stringify(udstreamPageListObj))
    }
  }
}

//根据事件action的类型  更新不同的数据
const updateDataByAction = (type: string) => {
  let tempList = [] as any
  if (type == "sceneTransition") {
    const pageInfoList = toRaw(pageInfoStore.getPageList)
    pageInfoList.map((item) => {
      tempList.push({
        value: item.id,
        label: item.label
      })
    })
    scenListOptions.value = tempList
    if (!scenValue.value) {
      scenValue.value = tempList[0].value
    }
    // scenValue.value = tempList[0].value
  } else if (type == "sceneJump") {
    const cameraList = udStreamCameraStore.getUdstreamCameraInfo
    cameraList.map((item: any) => {
      tempList.push({
        value: item.data.UUID,
        label: item.label
      })
    })

    viewsOptions.value = tempList
    if (!viewPointValue.value) {
      viewPointValue.value = tempList[0].value
    }
    //
  }
}

//更新节点的属性信息
const updateAttribute = () => {
  currentUdstreamNode = props.optionData
  const currentPageId = pageInfoStore.getSelectPageInfo.id
  let udstreamPageList = localStorage.getItem("udstreamPageList")
  if (udstreamPageList) {
    let udstreamPageListObj = JSON.parse(udstreamPageList)
    const findItemPage = udstreamPageListObj.find((item: any) => {
      return item.id == currentPageId
    })
    if (findItemPage) {
      if (findItemPage.udEvent && findItemPage.udEvent.length > 0) {
        let findIitemEvent = findItemPage.udEvent.find((item: any) => {
          return item.uuid == currentUdstreamNode.UUID
        })
        if (findIitemEvent) {
          eventComponentShow.value = true
          actionValue.value = findIitemEvent.action
          updateDataByAction(actionValue.value)
          if (actionValue.value == "sceneJump") {
            viewPointValue.value = findIitemEvent.viewPoint
            scenValue.value = ""
          } else if (actionValue.value == "sceneTransition") {
            scenValue.value = findIitemEvent.viewPoint
            viewPointValue.value = ""
          }
        } else {
          eventComponentShow.value = false
          eventValue.value = "roamTouch"
          actionValue.value = "sceneTransition" //写的默认值
          const pageInfoList = toRaw(pageInfoStore.getPageList) //默认的值
          let tempList = [] as any
          pageInfoList.map((item) => {
            tempList.push({
              value: item.id,
              label: item.label
            })
          })
          scenListOptions.value = tempList
          scenValue.value = ""
          viewPointValue.value = ""
        }
      }
    }
  }
}

onMounted(() => {
  updateAttribute()
})

//监听action的变化
watch(
  () => actionValue.value,
  (newVal, oldVal) => {
    if (newVal) {
      updateDataByAction(newVal)
      saveEventInfo2Localstrorage()
    }
  }
)

watch(
  () => scenValue.value,
  (newVal, oldVal) => {
    if (newVal) {
      saveEventInfo2Localstrorage()
    }
  }
)

watch(
  () => viewPointValue.value,
  (newVal, oldVal) => {
    if (newVal) {
      saveEventInfo2Localstrorage()
    }
  }
)

//监听节点的ID  节点ID发生变化   就更新一下属性
watch(
  () => props.optionData,
  (nv, ov) => {
    if (nv) {
      updateAttribute()
    }
  },
  {
    deep: true
  }
)
</script>

<style scoped>
.evnet-class {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.evnet-class-item {
  margin: 8px;
}
</style>
