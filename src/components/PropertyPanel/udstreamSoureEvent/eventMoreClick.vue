<template>
  <div>
    <div class="event-info">
      <div class="event-info-row">
        <el-icon class="event-back" @click="back2EventList"><Back /></el-icon>
        <label class="event-back-text">连续点击时</label>
      </div>
      <el-button text @click="saveTheEventInfo">保存</el-button>
    </div>
    <div class="demo-collapse">
      <div class="demo-collapse-item custom-select">
        <div>动作类型</div>
        <div class="demo-collapse-item-select">
          <el-select v-model="actionType" placeholder="选择动作类型" @change="actionTypeChangeHandle">
            <el-option v-for="kv in actionTypeList" :key="kv.value" :label="kv.name" :value="kv.value" />
          </el-select>
        </div>
      </div>

      <div class="demo-collapse-item custom-select">
        <div>控制对象</div>
        <div class="demo-collapse-item-select">
          <el-select v-model="controlObject" placeholder="选择控制对象" @change="controlObjectChangeHandle">
            <el-option v-for="kv in controlObjectList" :key="kv.id" :label="kv.label" :value="kv.value" />
          </el-select>
        </div>
      </div>

      <div class="demo-collapse-item custom-select">
        <div>循环动作</div>
        <div>
          <div v-for="item in loopActionList" :key="item.id" class="demo-collapse-item-hb">
            <el-select v-model="item.actionValue" placeholder="选择动作">
              <el-option v-for="kv in item.loopAction" :key="kv.id" :label="kv.label" :value="kv.value" />
            </el-select>
            <el-icon :size="16" class="delete-btn-class" @click="deleteTheAction(item)">
              <Delete />
            </el-icon>
          </div>
        </div>
      </div>
      <div class="demo-collapse-item-btn">
        <el-button v-if="actionType == 'modelControl'" type="primary" :icon="Plus" size="small" @click="addLoopAction"
          >添加循环动作</el-button
        >
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, reactive, PropType, toRaw, onMounted, onUnmounted, watch } from "vue"
import {
  Setting,
  DataLine,
  Back,
  CirclePlus,
  Delete,
  Plus,
  Minus,
  CloseBold,
  CircleCloseFilled
} from "@element-plus/icons-vue"
import { ElMessage, ElMessageBox } from "element-plus"

//localStrorage对象
import { usePageInfoStore } from "@/store/modules/pageInfoStore"
import { useUdStreamCameraStore } from "@/store/modules/udstreamCamera"
import { useUdstreamStore } from "@/store/modules/udstreamStore"
import { ProjectNode, ProjectNodeType, Point } from "@/udStream/types/ProjectNode"

const props = defineProps({
  optionData: {
    type: Object as PropType<ProjectNode>,
    required: true
  }
})

//emits事件
const emits = defineEmits(["back2EventList"])
//当前的节点信息
let currentUdstreamNode = props.optionData //更新节点属性全靠这个了

const udStreamCameraStore = useUdStreamCameraStore()
const pageInfoStore = usePageInfoStore()
const udstreamStore = useUdstreamStore()

const nodeTypes = new Set<string>() //节点的类型
//udstream的根节点
let UdstreamRootNode: any = null
let recursiveRootNode: any = null
//该节点的全局变量
// let temp_scenceListOptions: any = null //角色移动--场景
// let temp_viewPointListOptions: any = null //角色移动--视点
let temp_modelListOptions: any = null //模型
let temp_pathListOptions: any = null //路径
let temp_mediaListOptions: any = null //媒体

const actionType = ref("")
const actionTypeList = ref([
  { name: "控制模型动画", value: "modelControl" },
  { name: "控制路径动画", value: "pathControl" },
  { name: "控制媒体播放", value: "mediaControl" }
])

const controlObject = ref("") //控制对象
const controlObjectList = ref([]) //控制对象列表

const loopActionList: any = ref([]) //循环动作列表
//角色移动相关的参数
// const roleMoveControlList = ref([])
//模型控制相关的参数
const modelControlList = ref([])
//路径控制相关的参数
const pathControlList = ref([])
//媒体控制相关的参数
const mediaControlList = ref([])

let activeTypeValue = "continueClick" //事件的类型

//返回事件列表
const back2EventList = () => {
  emits("back2EventList", true)
}

//保存事件的详细信息
const saveTheEventInfo = () => {
  //保存之前需要做相关的验证
  let flag = false
  if (actionType.value == "") {
    flag = true
  }

  if (flag) {
    ElMessage({
      message: "请选择动作类型！",
      type: "warning",
      duration: 3000
    })
    return
  }

  flag = false

  //控制对象

  if (controlObject.value === "") {
    flag = true
  }

  if (flag) {
    ElMessage({
      message: "请选择控制对象！",
      type: "warning",
      duration: 3000
    })
    return
  }
  flag = false
  if (loopActionList.value.length > 0) {
    //循环动作
    loopActionList.value.forEach((item: any) => {
      if (item.actionValue === "") {
        flag = true
      }
    })
  }

  if (flag) {
    ElMessage({
      message: "请选择循环动作！",
      type: "warning",
      duration: 3000
    })
    return
  }

  //验证通过之后，保存数据到localstorage 是临时的  最终的保存，需要在保存项目的时候，保存到数据库
  let res = saveTempData2LocalStrorage()
  if (res) {
    ElMessage({
      message: "该对象的事件临时保存成功，如需生效，请将整个项目进行保存！",
      type: "success",
      duration: 4000
    })
  }
}

//将操作的临时数据保存到前端的数据库中
const saveTempData2LocalStrorage = () => {
  try {
    let mainBodyId = currentUdstreamNode.UUID //当前节点的uuid
    if (mainBodyId) {
      let currentPageId = pageInfoStore.getSelectPageInfo.id
      let udstreamPageList = localStorage.getItem("udstreamPageList")
      if (udstreamPageList) {
        let udstreamPageListObj = JSON.parse(udstreamPageList)
        //找到当前页的页面信息
        const findPageItem = udstreamPageListObj.find((item: any) => {
          return item.id == currentPageId
        })

        if (findPageItem) {
          //拼接actionList事件数据
          let actionList = []
          if (actionType.value == "modelControl") {
            //模型控制
            let actions = []
            for (let k = 0; k < loopActionList.value.length; k++) {
              actions.push(loopActionList.value[k].actionValue)
            }
            actionList.push({
              type: actionType.value,
              modelId: controlObject.value,
              actions: actions
            })
          } else if (actionType.value == "pathControl") {
            let actions = []
            for (let k = 0; k < loopActionList.value.length; k++) {
              actions.push(loopActionList.value[k].actionValue)
            }
            actionList.push({ 
              type: actionType.value,
              pathId: controlObject.value,
              actions: actions
            })
          } else if (actionType.value == "mediaControl") {
            let actions = []
            for (let k = 0; k < loopActionList.value.length; k++) {
              actions.push(loopActionList.value[k].actionValue)
            }
            actionList.push({
              type: actionType.value,
              mediaId: controlObject.value,
              actions: actions
            })
          }

          if (findPageItem.udEvent && findPageItem.udEvent.length > 0) {
            //需要判断当前的事件是否已经存在 （主体的id）
            let findEvent = findPageItem.udEvent.find((item: any) => {
              return item.mainBodyId == mainBodyId && item.handleType == activeTypeValue
            })

            //找到了该事件，更新
            if (findEvent) {
              findEvent.actionList = actionList
            } else {
              const pushObj = {
                mainBodyId: mainBodyId,
                handleType: activeTypeValue,
                actionList: actionList
              }
              findPageItem.udEvent.push(pushObj)
            }
          } else {
            //第一次给该主体添加事件   项目中还未有事件信息
            const pushObj = {
              mainBodyId: mainBodyId,
              handleType: activeTypeValue,
              actionList: actionList
            }
            findPageItem.udEvent = [pushObj]
          }
          localStorage.setItem("udstreamPageList", JSON.stringify(udstreamPageListObj))
        }
      }
    }
    return true
  } catch (err) {
    return false
  }
}

//添加控制模型
const addModelControl = () => {
  // if (!temp_modelListOptions) {
  //   temp_modelListOptions = getAllModelAnimation()
  // }
  controlObjectList.value = []
  temp_modelListOptions = getAllModelAnimation()
  Object.assign(controlObjectList.value, temp_modelListOptions)
}

//添加路径控制
const addPathControl = () => {
  controlObjectList.value = []
  temp_pathListOptions = getAllPathAnimation()
  Object.assign(controlObjectList.value, temp_pathListOptions)
}

//添加媒体控制
const addMediaControl = () => {
  console.log("addMediaControl")
  // if (!temp_mediaListOptions) {
  //   temp_mediaListOptions = getAllMedia()
  // }
  controlObjectList.value = []
  temp_mediaListOptions = getAllMedia() //每次都需要重新获取  因为不确定是否有新的数据被添加
  Object.assign(controlObjectList.value, temp_mediaListOptions)
}

//跟场景交互----------------------------------------------
//将树的根节点数据转换为一维数组数据
const getTreeData2Array = (treeData: any) => {
  let tempObj: any = {
    pathList: [],
    modelAnimationList: [],
    pathAnimationList: [],
    mediaList: []
  }
  treeData.forEach((item: any) => {
    if (
      (item?.data?.itemtypeStr.toLowerCase() == "poi" &&
        (item?.data?.projectNode.geomtype == "3" || item?.data?.projectNode.geomtype == "5")) ||
      item?.data.itemtypeStr.toLowerCase() == "mheight"
    ) {
      //测量相关  长度测量  面积测量  垂直测量
      const pathInfoItem = {
        label: item.data.projectNode.name,
        value: item.data.projectNode.UUID,
        itemtype: item.data.projectNode.itemtype,
        itemtypeStr: item.data.projectNode.itemtypeStr,
        id: item.data.projectNode.UUID
      }
      tempObj.pathList.push(pathInfoItem)

      const attachUrl = item.data.projectNode.GetMetadataString("attachmentURI", "")
      if (attachUrl) {
        const pathActionItem = {
          label: item.data.projectNode.name,
          value: item.data.projectNode.UUID,
          itemtype: item.data.projectNode.itemtype,
          itemtypeStr: item.data.projectNode.itemtypeStr,
          id: item.data.projectNode.UUID
        }
        tempObj.pathAnimationList.push(pathActionItem)
      }

      if (item.children.length > 0) {
        tempObj.pathList = tempObj.pathList.concat(getTreeData2Array(item.children))
      }
    } else if (item?.data?.itemtypeStr.toLowerCase() == "media") {
      //多媒体
      const mediaInfoItem = {
        label: item.data.projectNode.name,
        value: item.data.projectNode.UUID,
        itemtype: item.data.projectNode.itemtype,
        itemtypeStr: item.data.projectNode.itemtypeStr,
        id: item.data.projectNode.UUID
      }
      tempObj.mediaList.push(mediaInfoItem)
      if (item.children.length > 0) {
        tempObj.mediaList = tempObj.mediaList.concat(getTreeData2Array(item.children))
      }
    } else if (item?.data.itemtype == 10) {
      //模型动画
      const modelInfoItem = {
        label: item.data.projectNode.name,
        value: item.data.projectNode.UUID,
        itemtype: item.data.projectNode.itemtype,
        itemtypeStr: item.data.projectNode.itemtypeStr,
        id: item.data.projectNode.UUID
      }
      tempObj.modelAnimationList.push(modelInfoItem)
      if (item.children.length > 0) {
        tempObj.modelAnimationList = tempObj.modelAnimationList.concat(getTreeData2Array(item.children))
      }
    } else if (item?.data?.itemtypeStr.toLowerCase() == "camera") {
      console.log("do nothing!")
    }
  })
  return tempObj
}

//递归查找节点信息
const getNodesRecursive = (node: ProjectNode) => {
  const treeNodes: any[] = []
  node.forEachChild((child) => {
    treeNodes.push({
      label: child.name ?? "",
      value: child.name ?? "",
      title: child.name ?? "",
      isLeaf: child.itemtype !== ProjectNodeType.Folder && child.itemtype !== ProjectNodeType.QueryGroup,
      children: getNodesRecursive(child),
      data: {
        projectNode: child,
        projectNodePtr: child.projectNodePtr,
        isVisible: child.isVisible,
        itemtype: child.itemtype ?? 0,
        itemtypeStr: child.itemtypeStr ?? "",
        UUID: child.UUID ?? ""
      }
    })
    nodeTypes.add(child.itemtypeStr)
  })
  return treeNodes.length > 0 ? treeNodes : []
}

//获取所有的页面列表
const getAllPage = () => {
  let tempList: any[] = []
  const pageInfoList = toRaw(pageInfoStore.getPageList)
  pageInfoList.map((item) => {
    tempList.push({
      value: item.id,
      label: item.label
    })
  })
  return tempList
}

// //获取当前页面的所有的视点
// const getAllViewPoint = () => {
//   let tempList: any[] = []
//   //表示是当前激活的页面
//   const cameraList = udStreamCameraStore.getUdstreamCameraInfo
//   cameraList.map((item: any) => {
//     tempList.push({
//       value: item.data.UUID,
//       label: item.label
//     })
//   })

//   return tempList
// }

//获取所有的模型动画
const getAllModelAnimation = () => {
  if (!UdstreamRootNode) {
    UdstreamRootNode = udstreamStore.getUdstreamRootNode
    const recursiveNode = getNodesRecursive(UdstreamRootNode)
    recursiveRootNode = getTreeData2Array(recursiveNode)
  }
  return recursiveRootNode.modelAnimationList
}

//获取所有的路径动画
const getAllPathAnimation = () => {
  if (!UdstreamRootNode) {
    UdstreamRootNode = udstreamStore.getUdstreamRootNode
    const recursiveNode = getNodesRecursive(UdstreamRootNode)
    recursiveRootNode = getTreeData2Array(recursiveNode)
  }
  return recursiveRootNode.pathAnimationList
}
//获取所有的媒体
const getAllMedia = () => {
  if (!UdstreamRootNode) {
    UdstreamRootNode = udstreamStore.getUdstreamRootNode
    const recursiveNode = getNodesRecursive(UdstreamRootNode)
    recursiveRootNode = getTreeData2Array(recursiveNode)
  }
  return recursiveRootNode.mediaList
}

//从服务器获取的数据   更新列表数据---------------------------------------------
const updateAttribute = () => {
  console.log("更新列表数据，从服务器获取的数据")
  //当前主体的id
  currentUdstreamNode = props.optionData
  const currentPageId = pageInfoStore.getSelectPageInfo.id
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
          let findItemEvenInfo = findItemEventList.find((item: any) => {
            return item.handleType == activeTypeValue
          })
          if (findItemEvenInfo && findItemEvenInfo?.actionList && findItemEvenInfo.actionList.length > 0) {
            // findItemEvenInfo.actionList.length的值目前只会有一个
            // for (let k = 0; k < findItemEvenInfo.actionList.length; k++) {
            console.log("findItemEvenInfo.actionList[0].type", "----------------")
            actionType.value = findItemEvenInfo.actionList[0].type
            if (actionType.value == "modelControl") {
              if (!temp_modelListOptions) {
                temp_modelListOptions = getAllModelAnimation()
              }
              Object.assign(controlObjectList.value, temp_modelListOptions)
            } else if (actionType.value == "pathControl") {
              if (!temp_pathListOptions) {
                temp_pathListOptions = getAllPathAnimation()
              }
              Object.assign(controlObjectList.value, temp_pathListOptions)
            } else if (actionType.value == "mediaControl") {
              if (!temp_mediaListOptions) {
                temp_mediaListOptions = getAllMedia()
              }
              Object.assign(controlObjectList.value, temp_mediaListOptions)
            }
          }
        }
      }
    }
  }
}

//动作类型改变
const actionTypeChangeHandle = (params: string) => {
  console.log("params", params)
  if (params == "modelControl") {
    //模型控制
    addModelControl()
  } else if (params == "pathControl") {
    //路径控制
    addPathControl()
  } else if (params == "mediaControl") {
    //媒体控制
    addMediaControl()
  }
}

//控制对象改变
const controlObjectChangeHandle = (params: any) => {
  loopActionList.value = [
    {
      id: 1,
      actionValue: "",
      loopAction: [
        {
          id: 1,
          label: "开始/暂停",
          value: "playOrPause"
        }
      ]
    }
  ]
}

//添加循环动作
const addLoopAction = () => {
  //如果动作类型是路径动画  媒体控制  那么只能添加一个动作
  // if (actionType.value != "modelControl") {
  //   ElMessage({
  //     message: "只能添加一个动作！",
  //     type: "warning",
  //     duration: 3000
  //   })
  //   return
  // }
  let pushItem = {
    id: loopActionList.value.length + 1,
    actionValue: "",
    loopAction: [
      {
        id: loopActionList.value.length + 1,
        label: "开始/暂停",
        value: "playOrPause"
      }
    ]
  }
  loopActionList.value.push(pushItem)
}

const deleteTheAction = (item: any) => {
  console.log("deleteTheAction")
  if (loopActionList.value.length == 1) {
    ElMessage({
      message: "只剩一个对象，无法删除！",
      type: "warning",
      duration: 3000
    })
    return
  }
  const index = loopActionList.value.findIndex((value: any) => value.id === item.id)
  loopActionList.value.splice(index, 1)
  //进行临时数据的保存
  saveTempData2LocalStrorage()
}

//onMounted事件
onMounted(() => {
  updateAttribute()
})
</script>
<style scoped>
.event-info {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
.event-info-row {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.event-back {
  margin-right: 10px;
  cursor: pointer;
}
.event-back-text {
  font-size: 14px;
}
.event-info-row :deep(.el-input__wrapper) {
  box-shadow: none;
}

.event-info-row :deep(.el-input.is-focus .el-input__wrapper) {
  box-shadow: none;
}

.custom-select :deep(.el-input__wrapper) {
  box-shadow: none;
}
.custom-select-lable {
  width: 100%;
  background-color: #999;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  border-radius: 4px;
  font-weight: bold;
}
.custom-select-lable-close:hover {
  cursor: pointer;
}
.custom-select-lable-close:active {
  transform: scale(1.3);
}

.custom-select :deep(.el-select .el-input.is-focus .el-input__wrapper) {
  box-shadow: none;
}
.custom-select :deep(.el-button--small) {
  width: 100%;
}
.custom-icon-add {
  display: inline-block;
  margin-right: 12px;
  color: #3f9eff;
}
.custom-icon-subtract {
  display: inline-block;
  margin-right: 12px;
  color: red;
}

.demo-collapse {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
}
.demo-collapse-item {
  margin-top: 18px;
  font-size: 14px;
}

.demo-collapse-item-btn {
  width: 99%;
  margin-top: 12px;
}
.demo-collapse-item-hb {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}
.delete-btn-class {
  margin-left: 3px;
}
.delete-btn-class:hover {
  cursor: pointer;
  color: rgb(22, 142, 223);
}
.delete-btn-class:active {
  transform: scale(1.1);
}
.demo-collapse-item-select :deep(.el-select) {
  width: 90%;
}
.demo-collapse-item-hb:deep(.el-select) {
  width: 90%;
}
.demo-collapse-item-btn :deep(.el-button--small) {
  width: 100%;
}
</style>
