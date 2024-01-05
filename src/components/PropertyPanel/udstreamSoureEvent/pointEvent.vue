<template>
  <div>
    <div class="event-list-table" v-show="eventListShow">
      <el-button @click="addEventList"
        ><el-icon><Plus /></el-icon>添加事件</el-button
      >
      <div class="eventListTable">
        <div class="eventListItemParent" v-for="(item, index) in theEventList" :key="index" @click="toEventInfo(item)">
          <div class="eventListItem">
            <div>
              <span class="ml-3 w-35 text-gray-400 text-sm inline-flex items-center mb-2">事件</span>
              <div>{{ eventListOptionsEnum[item.type] }}</div>
            </div>
            <div>
              <span class="ml-3 w-35 text-gray-400 text-sm inline-flex items-center mb-2">动作</span>
              <div>{{ actionListOptionsEnum[item.action] }}</div>
            </div>
            <!-- <div>
              <span class="ml-3 w-35 text-gray-400 text-sm inline-flex items-center mb-2">触发</span>
              <div>{{ item.responseEvent }}</div>
            </div> -->
          </div>
          <div class="delete-btn">
            <el-popover placement="bottom" :visible="deleteBtnShowValue == item.type" :width="200" trigger="click">
              <p>确定删除该事件吗？</p>
              <div style="text-align: right; margin: 0">
                <el-button size="small" text @click="deleteBtnShowValue = ''">否</el-button>
                <el-button size="small" type="primary" @click="confirmDeleteEvent(item)">是</el-button>
              </div>
              <template #reference>
                <el-button size="small" circle :icon="Delete" @click.stop="openConfirmDeleteEventPop(item)" />
              </template>
            </el-popover>
          </div>
        </div>
      </div>
    </div>
    <div class="add-event-tableParent" v-if="!eventListShow">
      <div class="back2EventClass">
        <el-button @click="back2AddEventPanel" :icon="DArrowLeft" circle />
      </div>
      <div class="add-event-table">
        <div class="evnet-class-item">
          <span class="ml-3 w-35 text-gray-400 text-sm inline-flex items-center mb-2">事件</span>
          <el-select v-model="eventValue" placeholder="Select">
            <el-option v-for="item in eventListOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </div>
        <div class="evnet-class-item">
          <span class="ml-3 w-35 text-gray-400 text-sm inline-flex items-center mb-2">动作</span>
          <el-select v-model="actionValue" placeholder="Select" @change="handleActionChange">
            <el-option v-for="item in actionListOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </div>
        <div class="evnet-class-item">
          <span class="ml-3 w-35 text-gray-400 text-sm inline-flex items-center mb-2">{{
            responseTitleAfterAction
          }}</span>
          <el-select v-model="responseEventAfterAction" placeholder="请选择">
            <el-option v-for="item in responseEventList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </div>
        <div class="evnet-class-item" v-show="actionValue == 'pathAnimation' || actionValue == 'mediaControl'">
          <span class="ml-3 w-35 text-gray-400 text-sm inline-flex items-center mb-2">目标路径动画</span>
          <el-select v-model="pathActionValue" placeholder="Select" @change="handleActionChange">
            <el-option v-for="item in pathActionList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </div>
      </div>
      <el-divider />
      <el-button type="primary" @click="submitEventList"
        ><el-icon><Upload /></el-icon>确定</el-button
      >
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, toRaw, onMounted, watch, computed, shallowRef, reactive, shallowReactive, markRaw } from "vue"
import { Check, Delete, DArrowLeft, Edit, Message, Search, Star, Plus, Upload } from "@element-plus/icons-vue"
import { usePageInfoStore } from "@/store/modules/pageInfoStore"
import { useUdStreamCameraStore } from "@/store/modules/udstreamCamera"
import { useUdstreamStore } from "@/store/modules/udstreamStore"
import { ProjectNode, ProjectNodeType, Point } from "@/udStream/types/ProjectNode"
import { ElMessage, ElMessageBox } from "element-plus"

const props = defineProps({
  optionData: {
    type: Object as PropType<ProjectNode>,
    required: true
  }
})

//当前的节点信息
let currentUdstreamNode = props.optionData //更新节点属性全靠这个了

const eventListShow = ref(true) //事件列表是否显示
const nodeTypes = new Set<string>() //节点的类型

const udStreamCameraStore = useUdStreamCameraStore()
const pageInfoStore = usePageInfoStore()
const udstreamStore = useUdstreamStore()

//udstream的根节点
let UdstreamRootNode: any = null
let recursiveRootNode: any = null

const deleteBtnShowValue = ref("") //删除按钮是否显示
const theEventList = ref([]) //事件的列表

// 事件触发的值
const eventValue = ref("roamTouch")
const actionValue = ref("sceneTransition") //动作的默认值
const responseEventAfterAction = ref("") //动作后的响应事件
const responseTitleAfterAction = ref("目标场景") //动作后的响应事件的标题

//事件的列表的枚举值
const eventListOptionsEnum = {
  roamTouch: "漫游触碰",
  click: "单击"
}

const actionListOptionsEnum = {
  sceneTransition: "触发场景瞬移",
  sceneJump: "触发当前场景瞬移",
  roleNavigation: "触发角色导航",
  modelAnimation: "触发模型动画",
  pathAnimation: "触发路径动画",
  mediaControl: "触发媒体控制"
}

const eventListOptions = ref([
  {
    value: "roamTouch",
    label: "漫游触碰"
  },
  {
    value: "click",
    label: "单击"
  }
])

const actionListOptions = ref([
  {
    value: "sceneTransition",
    label: "触发场景瞬移"
  },
  {
    value: "sceneJump",
    label: "触发当前场景瞬移"
  },
  {
    value: "roleNavigation",
    label: "触发角色导航"
  },
  {
    value: "modelAnimation",
    label: "触发模型动画"
  },
  {
    value: "pathAnimation",
    label: "触发路径动画"
  },
  {
    value: "mediaControl",
    label: "触发媒体控制"
  }
])

//该值只有当 触发路径动画  触发媒体控制 时候才会有
const pathActionValue = ref("")
const pathActionList = [
  {
    value: "start",
    label: "开始"
  },
  {
    value: "pause",
    label: "暂停"
  },
  {
    value: "continue",
    label: "继续"
  },
  {
    value: "stop",
    label: "停止"
  }
]

//根据动作的不同，响应事件的列表也不同
const responseEventList = ref([])

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
      tempObj.pathList.push(item.data)
      if (item.children.length > 0) {
        tempObj.pathList = tempObj.pathList.concat(getTreeData2Array(item.children))
      }
    } else if (item?.data?.itemtypeStr.toLowerCase() == "media") {
      //多媒体
      tempObj.mediaList.push(item.data)
      if (item.children.length > 0) {
        tempObj.mediaList = tempObj.mediaList.concat(getTreeData2Array(item.children))
      }
    } else if (item?.data.itemtype == 10) {
      //模型动画
      tempObj.modelAnimationList.push(item.data)
      if (item.children.length > 0) {
        tempObj.modelAnimationList = tempObj.modelAnimationList.concat(getTreeData2Array(item.children))
      }
    } else if (item?.data?.itemtypeStr.toLowerCase() == "camera") {
      //路径动画   已经绑定模型的路径
      tempObj.pathAnimationList.push(item.data)
      if (item.children.length > 0) {
        tempObj.pathAnimationList = tempObj.pathAnimationList.concat(getTreeData2Array(item.children))
      }
    }
  })
  return tempObj
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

//获取当前页面的所有的视点
const getAllViewPoint = () => {
  let tempList: any[] = []
  const cameraList = udStreamCameraStore.getUdstreamCameraInfo
  cameraList.map((item: any) => {
    tempList.push({
      value: item.data.UUID,
      label: item.label
    })
  })
  return tempList
}

//获取所有的路径   (线，面，垂直测量)
const getAllPath = () => {
  if (!UdstreamRootNode) {
    UdstreamRootNode = udstreamStore.getUdstreamRootNode
    const recursiveNode = getNodesRecursive(UdstreamRootNode)
    recursiveRootNode = getTreeData2Array(recursiveNode)
  }

  // console.log("递归的根节点list", recursiveRootNode.pathList)
  recursiveRootNode.pathList.map((item: any) => {
    item.label = item.projectNode.name
    item.value = item.projectNode.UUID
  })

  return recursiveRootNode.pathList
}

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

//动作的事件发生了改变
const handleActionChange = (value: string, from: string) => {
  console.log("动作的事件发生了改变", value)
  //responseEventAfterAction  置为 空
  //更改响应事件的列表
  if (from !== "info") {
    responseEventAfterAction.value = ""
  }
  switch (value) {
    case "sceneTransition":
      responseTitleAfterAction.value = "目标场景"
      responseEventList.value = getAllPage()
      break
    case "sceneJump":
      responseTitleAfterAction.value = "目标视点"
      responseEventList.value = getAllViewPoint()
      break
    case "roleNavigation":
      responseTitleAfterAction.value = "目标场景导航"
      responseEventList.value = getAllPath()
      break
    case "modelAnimation":
      responseTitleAfterAction.value = "目标模型动画"
      responseEventList.value = getAllModelAnimation()
      break
    case "pathAnimation":
      responseTitleAfterAction.value = "目标路径(已绑定模型)"
      const allThePath = getAllPath()
      const filtersPath = allThePath.filter((item: any) => {
        const attachUrl = item.projectNode.GetMetadataString("attachmentURI", "")
        if (attachUrl) {
          return item
        }
      })
      responseEventList.value = filtersPath
      console.log("目标路径----", responseEventList.value)
      break
    case "mediaControl":
      responseTitleAfterAction.value = "目标媒体"
      responseEventList.value = getAllMedia()
      console.log("媒体的列表----", responseEventList.value)
      break
  }
}

//添加事件列表
const addEventList = () => {
  eventListShow.value = false
}

//验证添加的事件中数据是否添加完整
const validateEventList = () => {
  if (eventValue.value == "") {
    ElMessage({
      message: "请选择事件类型！",
      type: "warning",
      duration: 3000
    })
    return false
  }
  if (actionValue.value == "") {
    ElMessage({
      message: "请选择动作类型！",
      type: "warning",
      duration: 3000
    })
    return false
  }
  if (responseEventAfterAction.value == "") {
    ElMessage({
      message: "请选择动作对应的具体参数！",
      type: "warning",
      duration: 3000
    })
    return false
  }
  return true
}

//确定添加事件列表
const submitEventList = () => {
  if (validateEventList()) {
    eventListShow.value = true
    // 判断是否有重复的事件  单击  漫游触碰  双击  这些type有且只能有一个
    let isExistFile = theEventList.value.find((item: any) => {
      return item.type == eventValue.value
    })
    if (isExistFile) {
      //表示已经存在了，需要修改
      theEventList.value.forEach((item: any) => {
        if (item.type == eventValue.value) {
          item.action = actionValue.value
          item.responseEvent = responseEventAfterAction.value
          if (pathActionValue.value) {
            item.pathActionValue = pathActionValue.value
          }
        }
      })
      ElMessage({
        message: "事件更新成功！",
        type: "success",
        duration: 3000
      })
    } else {
      //将该添加的事件添加到列表中 (先得判断同类事件是否已经添加过了，如果已经添加了，则表示是修改，否则是添加)
      let addItem = {
        type: eventValue.value,
        action: actionValue.value,
        responseEvent: responseEventAfterAction.value
      }
      if (pathActionValue.value) {
        addItem.pathActionValue = pathActionValue.value
      }
      theEventList.value.push(addItem)
      ElMessage({
        message: "事件添加成功！",
        type: "success",
        duration: 3000
      })
    }
    //将该属性设置到udstream node的节点属性中
    if (theEventList.value.length > 0) {
      let eventStr = ""
      theEventList.value.forEach((item: any) => {
        if (item.pathActionValue) {
          eventStr += item.type + "/" + item.action + "/" + item.responseEvent + "/" + item.pathActionValue + ","
        } else {
          eventStr += item.type + "/" + item.action + "/" + item.responseEvent + ","
        }
      })
      eventStr = eventStr.substring(0, eventStr.length - 1)
      currentUdstreamNode.SetMetadataString("customEvent", eventStr)
    }
  }
}

//跳转到页面详情的内容
const toEventInfo = (item: any) => {
  eventListShow.value = false
  eventValue.value = item.type
  actionValue.value = item.action
  responseEventAfterAction.value = item.responseEvent
  if (item.pathActionValue) {
    pathActionValue.value = item.pathActionValue
  }
  //根据type的类型  查询不同的数据
  handleActionChange(item.action, "info")
}

//打开确认删除的弹窗
const confirmDeleteEvent = (item: any) => {
  //隐层弹窗
  deleteBtnShowValue.value = ""
  //删除theEventList中的数据
  theEventList.value.forEach((item2: any, index: number) => {
    if (item2.type == item.type) {
      theEventList.value.splice(index, 1)
    }
  })
  //删除udstream node中的数据
  if (theEventList.value.length > 0) {
    let eventStr = ""
    theEventList.value.forEach((item: any) => {
      eventStr += item.type + "/" + item.action + "/" + item.responseEvent + ","
    })
    eventStr = eventStr.substring(0, eventStr.length - 1)
    currentUdstreamNode.SetMetadataString("customEvent", eventStr)
  } else {
    currentUdstreamNode.SetMetadataString("customEvent", "")
  }

  ElMessage({
    message: "事件删除成功！",
    type: "success",
    duration: 3000
  })
}

//确认删除事件
const openConfirmDeleteEventPop = (item: any) => {
  deleteBtnShowValue.value = item.type
  //删除theEventList中的数据
  //删除udstream node中的数据
  //   currentUdstreamNode.SetMetadataString("customEvent", "")
}

//返回到添加事件的页面
const back2AddEventPanel = () => {
  eventListShow.value = true
}

//更新属性
const updateAttribute = () => {
  //   获取事件的列表
  const eventList = currentUdstreamNode.GetMetadataString("customEvent", "")
  if (eventList) {
    const eventListArr = eventList.split(",")
    if (eventListArr.length > 0) {
      eventListArr.forEach((item: any) => {
        let eventListArr2 = item.split("/")
        if (eventListArr2.length == 3) {
          let itemStr = {
            type: eventListArr2[0],
            action: eventListArr2[1],
            responseEvent: eventListArr2[2]
          }
          theEventList.value.push(itemStr)
        } else if (eventListArr2.length == 4) {
          let itemStr = {
            type: eventListArr2[0],
            action: eventListArr2[1],
            responseEvent: eventListArr2[2],
            pathActionValue: eventListArr2[3]
          }
          theEventList.value.push(itemStr)
        }
      })
    }
  }
}

onMounted(() => {
  updateAttribute()
})
</script>

<style scoped>
.event-list-table {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.eventListTable {
  width: 100%;
}
.eventListItemParent {
  box-shadow: inset 0 0 0 2px #333;
  border-radius: 5px;
  padding: 12px;
  margin-top: 8px;
  position: relative;
}
.eventListItem {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}
.eventListItem:hover {
  cursor: pointer;
}

.add-event-tableParent {
  position: relative;
}
.back2EventClass {
  position: absolute;
  top: 0;
  right: 8px;
}
.add-event-table {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.evnet-class-item {
  margin: 8px;
}

.evnet-class-item :deep(.el-input__wrapper) {
  box-shadow: none;
}
.delete-btn {
  position: absolute;
  top: 8px;
  right: 8px;
}
.add-event-tableParent :deep(.el-divider--horizontal) {
  margin: 8px 0;
}
.add-event-tableParent :deep(.el-button--primary) {
  width: 100%;
}
</style>
