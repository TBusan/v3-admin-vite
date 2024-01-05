<template>
  <div>
    <div class="event-list-table" v-show="overviewShow">
      <div class="eventItem">
        <div class="eventItem-row">
          <label class="event-row-label">点击元素时</label>
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
      <div class="eventItem">
        <div class="eventItem-row">
          <label class="event-row-label">漫游触碰时</label>
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

    <div v-show="!overviewShow">
      <div class="event-info">
        <div class="event-info-row">
          <el-icon class="event-back" @click="back2EventList"><Back /></el-icon>
          <el-select v-show="activeValue !== 'roam'" v-model="activeValue" class="m-2" placeholder="选择">
            <el-option v-for="item in activeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </div>
        <el-button text @click="saveTheEventInfo">保存</el-button>
      </div>
      <div class="demo-collapse">
        <el-collapse v-model="activeNames" @change="handleChange">
          <el-collapse-item name="1" v-show="activeValue !== 'roam'">
            <template #title>
              <el-icon class="custom-icon-add" @click="addEvent('move')" v-show="roleMoveControlList.length == 0"
                ><Plus
              /></el-icon>
              <el-icon
                class="custom-icon-subtract"
                @click="subtractEvent('move')"
                v-show="roleMoveControlList.length > 0"
                ><Minus
              /></el-icon>
              控制角色移动
            </template>
            <div class="custom-select">
              <div v-for="item in roleMoveControlList" :key="item.id">
                <div class="custom-select-lable">{{ item.name }}</div>
                <el-select v-model="item.sceneValue" placeholder="选择场景" @change="selectSceneChange(item)">
                  <el-option v-for="kv in item.scenceListOptions" :key="kv.value" :label="kv.label" :value="kv.value" />
                </el-select>
                <el-select v-model="item.viewPointValue" placeholder="选择视点">
                  <el-option
                    v-for="kv in item.viewPointListOptions"
                    :key="kv.value"
                    :label="kv.label"
                    :value="kv.value"
                  />
                </el-select>
              </div>
              <el-button
                type="primary"
                :icon="Plus"
                size="small"
                @click="addRoleMove"
                v-if="roleMoveControlList.length == 0"
                >添加角色移动</el-button
              >
            </div>
          </el-collapse-item>
          <el-collapse-item name="2">
            <template #title>
              <el-icon class="custom-icon-add" @click="addEvent('model')" v-show="modelControlList.length == 0"
                ><Plus
              /></el-icon>
              <el-icon class="custom-icon-subtract" @click="subtractEvent('model')" v-show="modelControlList.length > 0"
                ><Minus
              /></el-icon>
              控制模型动画
            </template>
            <div class="custom-select">
              <div v-for="item in modelControlList" :key="item.id">
                <div class="custom-select-lable">
                  <label>{{ item.name }}</label>
                  <el-icon class="custom-select-lable-close" @click="closeTheItem(item, 'model')"
                    ><CloseBold
                  /></el-icon>
                </div>
                <el-select v-model="item.modelValue" placeholder="选择模型">
                  <el-option v-for="kv in item.modelListOptions" :key="kv.value" :label="kv.label" :value="kv.value" />
                </el-select>
                <el-select v-model="item.modelActionValue" placeholder="选择模型动作">
                  <el-option
                    v-for="kv in item.modelActionListOptions"
                    :key="kv.value"
                    :label="kv.label"
                    :value="kv.value"
                  />
                </el-select>
              </div>
              <el-button type="primary" :icon="Plus" size="small" @click="addModelControl">添加控制模型</el-button>
            </div>
          </el-collapse-item>
          <el-collapse-item name="3">
            <template #title>
              <el-icon class="custom-icon-add" @click="addEvent('path')" v-show="pathControlList.length == 0"
                ><Plus
              /></el-icon>
              <el-icon class="custom-icon-subtract" @click="subtractEvent('path')" v-show="pathControlList.length > 0"
                ><Minus
              /></el-icon>
              控制路径动画
            </template>
            <div class="custom-select">
              <div v-for="item in pathControlList" :key="item.id">
                <div class="custom-select-lable">
                  <label> {{ item.name }}</label>
                  <el-icon class="custom-select-lable-close" @click="closeTheItem(item, 'path')"><CloseBold /></el-icon>
                </div>
                <el-select v-model="item.pathValue" placeholder="选择路径">
                  <el-option v-for="kv in item.pathListOptions" :key="kv.value" :label="kv.label" :value="kv.value" />
                </el-select>
                <el-select v-model="item.pathActionValue" placeholder="选择路径动作">
                  <el-option
                    v-for="kv in item.pathActionListOptions"
                    :key="kv.value"
                    :label="kv.label"
                    :value="kv.value"
                  />
                </el-select>
              </div>

              <el-button type="primary" :icon="Plus" size="small" @click="addPathControl">添加控制路径</el-button>
            </div>
          </el-collapse-item>
          <el-collapse-item name="4">
            <template #title>
              <el-icon class="custom-icon-add" @click="addEvent('media')" v-show="mediaControlList.length == 0">
                <Plus />
              </el-icon>
              <el-icon class="custom-icon-subtract" @click="subtractEvent('media')" v-show="mediaControlList.length > 0"
                ><Minus
              /></el-icon>
              控制媒体动画
            </template>
            <div class="custom-select">
              <div v-for="item in mediaControlList" :key="item.id">
                <div class="custom-select-lable">
                  <label> {{ item.name }}</label>
                  <el-icon class="custom-select-lable-close" @click="closeTheItem(item, 'media')"
                    ><CloseBold
                  /></el-icon>
                </div>
                <el-select v-model="item.mediaValue" placeholder="选择媒体">
                  <el-option v-for="kv in item.mediaListOptions" :key="kv.value" :label="kv.label" :value="kv.value" />
                </el-select>
                <el-select v-model="item.mediaActionValue" placeholder="选择媒体动作">
                  <el-option
                    v-for="kv in item.mediaActionListOptions"
                    :key="kv.value"
                    :label="kv.label"
                    :value="kv.value"
                  />
                </el-select>
              </div>
              <el-button type="primary" :icon="Plus" size="small" @click="addMediaControl">添加控制媒体</el-button>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {PropType, ref, onMounted, toRaw, computed,watch } from "vue"
import { Setting, DataLine, Back, CirclePlus, Plus, Minus, CloseBold, CircleCloseFilled } from "@element-plus/icons-vue"
import { ElMessage, ElMessageBox } from "element-plus"
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

//概览面板的显示
const overviewShow = ref(true)

const clickActionList = ref([]) //点击事件的列表
const roamActionList = ref([]) //漫游事件的列表

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
let temp_scenceListOptions: any = null //角色移动--场景
let temp_viewPointListOptions: any = null //角色移动--视点
let temp_modelListOptions: any = null //模型
let temp_pathListOptions: any = null //路径
let temp_mediaListOptions: any = null //媒体

const activeValue = ref("singleClick")
const activeOptions = [
  {
    value: "singleClick",
    label: "单击一次"
  },
  {
    value: "continueClick",
    label: "连续点击"
  }
]

//角色移动相关的参数
const roleMoveControlList = ref([])
//模型控制相关的参数
const modelControlList = ref([])
//路径控制相关的参数
const pathControlList = ref([])
//媒体控制相关的参数
const mediaControlList = ref([])

//点击设置点击时候的事件
const setClickAction = () => {
  overviewShow.value = false
  updateAttribute("click") //更新数据  从localstroage中获取的
}

//点击设置漫游时候的事件
const setRoamAction = () => {
  overviewShow.value = false
  activeValue.value = "roam"
  updateAttribute("roam") //更新数据  从localstroage中获取的
}

const back2EventList = () => {
  overviewShow.value = true
  //清空事件
  roleMoveControlList.value = []
  modelControlList.value = []
  pathControlList.value = []
  mediaControlList.value = []
}

const activeNames = ref(["1"])
const handleChange = (val: string[]) => {
  console.log(val)
}

//保存事件的详细信息
const saveTheEventInfo = () => {
  //保存之前需要做相关的验证
  if (roleMoveControlList.value.length > 0) {
    //有角色移动
    roleMoveControlList.value.forEach((item: any) => {
      if (item.sceneValue === "" || item.viewPointValue === "") {
        ElMessage({
          message: "请选择角色移动中的场景和视点，如不需要可以删除！",
          type: "warning",
          duration: 3000
        })
        return
      }
    })
  }
  if (modelControlList.value.length > 0) {
    //有模型控制
    modelControlList.value.forEach((item: any) => {
      if (item.modelValue === "" || item.modelActionValue === "") {
        ElMessage({
          message: "请选择模型控制中的模型和动作，如不需要可以删除！",
          type: "warning",
          duration: 3000
        })
        return
      }
    })
  }
  if (pathControlList.value.length > 0) {
    //有路径控制
    pathControlList.value.forEach((item: any) => {
      if (item.pathValue === "" || item.pathActionValue === "") {
        ElMessage({
          message: "请选择路径控制中的路径和动作，如不需要可以删除！",
          type: "warning",
          duration: 3000
        })
        return
      }
    })
  }
  if (mediaControlList.value.length > 0) {
    //有媒体控制
    mediaControlList.value.forEach((item: any) => {
      if (item.mediaValue === "" || item.mediaActionValue === "") {
        ElMessage({
          message: "请选择媒体控制中的媒体和动作，如不需要可以删除！",
          type: "warning",
          duration: 3000
        })
        return
      }
    })
  }
  //验证通过之后，保存数据到localstorage 是临时的  最终的保存，需要在保存项目的时候，保存到数据库
  let mainBodyId = currentUdstreamNode.UUID //当前节点的uuid
  if (mainBodyId) {
    const clickHanleList = ["singleClick", "continueClick"]
    let currentPageId = pageInfoStore.getSelectPageInfo.id
    let udstreamPageList = localStorage.getItem("udstreamPageList")
    if (udstreamPageList) {
      let udstreamPageListObj = JSON.parse(udstreamPageList)
      //找到当前页的页面信息
      const findPageItem = udstreamPageListObj.find((item: any) => {
        return item.id == currentPageId
      })

      if (findPageItem) {
        if (findPageItem.udEvent && findPageItem.udEvent.length > 0) {
          //需要判断当前的事件是否已经存在 （主体的id）
          let findEvent = null
          if (activeValue.value == "roam") {
            findEvent = findPageItem.udEvent.find((item: any) => {
              return item.mainBodyId == mainBodyId && item.handleType == activeValue.value
            })
          } else {
            findEvent = findPageItem.udEvent.find((item: any) => {
              return (
                (item.mainBodyId == mainBodyId && item.handleType == activeValue.value) ||
                (item.mainBodyId == mainBodyId && clickHanleList.includes(item.handleType))
              )
            })
          }
          //找到了该事件，更新
          let actionList = []
          //角色移动
          if (roleMoveControlList.value.length > 0) {
            for (let k = 0; k < roleMoveControlList.value.length; k++) {
              actionList.push({
                type: "roleMove",
                pageId: roleMoveControlList.value[k].sceneValue,
                viewPointId: roleMoveControlList.value[k].viewPointValue
              })
            }
          }
          //模型控制
          if (modelControlList.value.length > 0) {
            for (let k = 0; k < modelControlList.value.length; k++) {
              actionList.push({
                type: "modelControl",
                modelId: modelControlList.value[k].modelValue,
                action: modelControlList.value[k].modelActionValue
              })
            }
          }

          //路径控制
          if (pathControlList.value.length > 0) {
            for (let k = 0; k < pathControlList.value.length; k++) {
              actionList.push({
                type: "pathControl",
                pathId: pathControlList.value[k].pathValue,
                action: pathControlList.value[k].pathActionValue
              })
            }
          }
          //媒体控制
          if (mediaControlList.value.length > 0) {
            for (let k = 0; k < mediaControlList.value.length; k++) {
              actionList.push({
                type: "mediaControl",
                mediaId: mediaControlList.value[k].mediaValue,
                action: mediaControlList.value[k].mediaActionValue
              })
            }
          }
          //更新
          if (findEvent) {
            findEvent.actionList = actionList
            localStorage.setItem("udstreamPageList", JSON.stringify(udstreamPageListObj))
          } else {
            const pushObj = {
              mainBodyId: mainBodyId,
              handleType: activeValue.value, //事件类型
              actionList: actionList
            }
            findPageItem.udEvent.push(pushObj)
            localStorage.setItem("udstreamPageList", JSON.stringify(udstreamPageListObj))
          }

          ElMessage({
            message: "该对象的事件保存成功，如需生效，请将整个项目进行保存！",
            type: "success",
            duration: 4000
          })
        }
      }
    }
  }
}

//增加事件
const addEvent = (params: string) => {
  if (params === "move") {
    if (!temp_scenceListOptions) {
      temp_scenceListOptions = getAllPage()
    }
    if (!temp_viewPointListOptions) {
      temp_viewPointListOptions = getAllViewPoint() //是当前页面的视点   不合适
    }
    const item = {
      id: 1,
      name: "移动位置",
      sceneValue: "",
      scenceListOptions: temp_scenceListOptions || [],
      viewPointValue: "",
      viewPointListOptions: temp_viewPointListOptions || []
    }
    roleMoveControlList.value.push(item)
  } else if (params === "model") {
    if (!temp_modelListOptions) {
      temp_modelListOptions = getAllModelAnimation()
    }
    const item = {
      id: 1,
      name: "模型控制",
      modelValue: "",
      modelListOptions: temp_modelListOptions || [],
      modelActionValue: "",
      modelActionListOptions: []
    }
    modelControlList.value.push(item)
  } else if (params === "path") {
    if (!temp_pathListOptions) {
      temp_pathListOptions = getAllPathAnimation()
    }
    const item = {
      id: 1,
      name: "路径控制",
      pathValue: "",
      pathListOptions: temp_pathListOptions || [],
      pathActionValue: "",
      pathActionListOptions: [
        {
          value: "play",
          label: "播放"
        },
        {
          value: "pause",
          label: "暂停"
        },
        {
          value: "rePlay",
          label: "重播"
        },
        {
          value: "stop",
          label: "停止"
        }
      ]
    }
    pathControlList.value.push(item)
  } else if (params === "media") {
    if (!temp_mediaListOptions) {
      temp_mediaListOptions = getAllMedia()
    }
    const item = {
      id: 1,
      name: "媒体控制",
      mediaValue: "",
      mediaListOptions: temp_mediaListOptions || [],
      mediaActionValue: "",
      mediaActionListOptions: [
        {
          value: "play",
          label: "播放"
        },
        {
          value: "pause",
          label: "暂停"
        },
        {
          value: "rePlay",
          label: "重播"
        },
        {
          value: "stop",
          label: "停止"
        }
      ]
    }
    mediaControlList.value.push(item)
  }
}

//减去事件
const subtractEvent = (params: string) => {
  ElMessageBox.confirm("该操作将会删除列表下的全部事件，是否继续?", "删除事件", {
    confirmButtonText: "继续",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      if (params === "move") {
        roleMoveControlList.value = []
      } else if (params === "model") {
        modelControlList.value = []
      } else if (params === "path") {
        pathControlList.value = []
      } else if (params === "media") {
        mediaControlList.value = []
      }
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "取消"
      })
    })
}

//添加角色移动
const addRoleMove = () => {
  if (!temp_scenceListOptions) {
    temp_scenceListOptions = getAllPage()
  }
  if (!temp_viewPointListOptions) {
    temp_viewPointListOptions = getAllViewPoint() //是当前页面的视点   不合适
  }
  const item = {
    id: 1,
    name: "移动位置",
    sceneValue: "",
    scenceListOptions: temp_scenceListOptions || [],
    viewPointValue: "",
    viewPointListOptions: temp_viewPointListOptions || []
  }
  roleMoveControlList.value.push(item)
}

//添加控制模型
const addModelControl = () => {
  if (!temp_modelListOptions) {
    temp_modelListOptions = getAllModelAnimation()
  }
  const addItem = {
    id: modelControlList.value.length + 1,
    name: "模型控制",
    modelValue: "",
    modelListOptions: temp_modelListOptions || [],
    modelActionValue: "",
    modelActionListOptions: []
  }
  modelControlList.value.push(addItem)
}

//添加路径控制
const addPathControl = () => {
  console.log("addPathControl")
  if (!temp_pathListOptions) {
    temp_pathListOptions = getAllPathAnimation()
  }
  debugger
  const addItem = {
    id: pathControlList.value.length + 1,
    name: "路径控制",
    pathValue: "",
    pathListOptions: temp_pathListOptions || [],
    pathActionValue: "",
    pathActionListOptions: [
      {
        value: "play",
        label: "播放"
      },
      {
        value: "pause",
        label: "暂停"
      },
      {
        value: "rePlay",
        label: "重播"
      },
      {
        value: "stop",
        label: "停止"
      }
    ]
  }
  pathControlList.value.push(addItem)
}

//添加媒体控制
const addMediaControl = () => {
  console.log("addMediaControl")
  if (!temp_mediaListOptions) {
    temp_mediaListOptions = getAllMedia()
  }
  debugger
  const addItem = {
    id: mediaControlList.value.length + 1,
    name: "媒体控制",
    mediaValue: "",
    mediaListOptions: temp_mediaListOptions || [],
    mediaActionValue: "",
    mediaActionListOptions: [
      {
        value: "play",
        label: "播放"
      },
      {
        value: "pause",
        label: "暂停"
      },
      {
        value: "rePlay",
        label: "重播"
      },
      {
        value: "stop",
        label: "停止"
      }
    ]
  }
  mediaControlList.value.push(addItem)
}

//删除对应的控制模型
const closeTheItem = (item: any, type: string) => {
  if (type === "model") {
    if (modelControlList.value.length === 1) {
      ElMessage({
        message: "只剩一个对象，无法删除！",
        type: "warning",
        duration: 3000
      })
      return
    }
    const index = modelControlList.value.findIndex((value: any) => value.id === item.id)
    modelControlList.value.splice(index, 1)
  } else if (type === "path") {
    if (pathControlList.value.length === 1) {
      ElMessage({
        message: "只剩一个对象，无法删除！",
        type: "warning",
        duration: 3000
      })
      return
    }
    const index = pathControlList.value.findIndex((value: any) => value.id === item.id)
    pathControlList.value.splice(index, 1)
  } else if (type === "media") {
    if (mediaControlList.value.length === 1) {
      ElMessage({
        message: "只剩一个对象，无法删除！",
        type: "warning",
        duration: 3000
      })
      return
    }
    const index = mediaControlList.value.findIndex((value: any) => value.id === item.id)
    mediaControlList.value.splice(index, 1)
  }
}

//切换场景后，更改视点的值列表
const selectSceneChange = (item: any) => {
  console.log("---change---", item)
  const pageId = item.sceneValue //切换页面的id
  let viewPointListOptions: any[] = []
  if (pageId == pageInfoStore.getSelectPageInfo.id) {
    //当前页面
    viewPointListOptions = getAllViewPoint()
  } else {
    viewPointListOptions = getAllViewPointFromOtherPage(pageId)
  }
  roleMoveControlList.value.forEach((item: any) => {
    item.viewPointValue = ""
    item.viewPointListOptions = viewPointListOptions
  })
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

//获取当前页面的所有的视点
const getAllViewPoint = () => {
  let tempList: any[] = []
  //表示是当前激活的页面
  const cameraList = udStreamCameraStore.getUdstreamCameraInfo
  cameraList.map((item: any) => {
    tempList.push({
      value: item.data.UUID,
      label: item.label
    })
  })

  return tempList
}

//获取其它页面的视点
const getAllViewPointFromOtherPage = (pageId: string) => {
  let tempList: any[] = []
  //其它的页面  从localstorage中获取
  let udstreamPageList = localStorage.getItem("udstreamPageList")
  debugger
  if (udstreamPageList) {
    let udstreamPageListObj = JSON.parse(udstreamPageList)
    const findPageItem = udstreamPageListObj.find((item: any) => item.id == pageId)
    if (findPageItem) {
      const allFeatureList = findPageItem?.udjson?.features
      if (allFeatureList && allFeatureList.length > 0) {
        allFeatureList.map((item: any) => {
          if (item?.vault?.type.toLowerCase() == "camera") {
            tempList.push({
              value: item?.id,
              label: item?.name
            })
          }
        })
      }
    }
  }
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

//从服务器获取的数据   更新列表数据---------------------------------------------
const updateAttribute = (type: string) => {
  console.log("更新列表数据，从服务器获取的数据")
  //当前页面的id
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
          let findItemEvenInfo = null
          if (type == "click") {
            findItemEvenInfo = findItemEventList.find((item: any) => {
              return item.handleType == "singleClick" || item.handleType == "continueClick"
            })
          } else if (type == "roam") {
            findItemEvenInfo = findItemEventList.find((item: any) => {
              return item.handleType == "roam"
            })
          }

          if (findItemEvenInfo && findItemEvenInfo?.actionList && findItemEvenInfo.actionList.length > 0) {
            activeValue.value = findItemEvenInfo.handleType //激活的值
            for (let k = 0; k < findItemEvenInfo.actionList.length; k++) {
              if (findItemEvenInfo.actionList[k].type == "roleMove") {
                if (!temp_scenceListOptions) {
                  temp_scenceListOptions = getAllPage()
                }
                if (!temp_viewPointListOptions) {
                  temp_viewPointListOptions = getAllViewPoint() //是当前页面的视点   不合适
                }
                const item = {
                  id: k + 1,
                  name: "移动位置",
                  sceneValue: findItemEvenInfo.actionList[k].pageId,
                  scenceListOptions: temp_scenceListOptions || [],
                  viewPointValue: findItemEvenInfo.actionList[k].viewPointId,
                  viewPointListOptions: temp_viewPointListOptions || []
                }
                roleMoveControlList.value.push(item)
              } else if (findItemEvenInfo.actionList[k].type == "modelControl") {
                if (!temp_modelListOptions) {
                  temp_modelListOptions = getAllModelAnimation()
                }
                const item = {
                  id: k + 1,
                  name: "模型控制",
                  modelValue: findItemEvenInfo.actionList[k].modelId || "",
                  modelListOptions: temp_modelListOptions || [],
                  modelActionValue: findItemEvenInfo.actionList[k].action || "",
                  modelActionListOptions: []
                }
                modelControlList.value.push(item)
              } else if (findItemEvenInfo.actionList[k].type == "pathControl") {
                if (!temp_pathListOptions) {
                  temp_pathListOptions = getAllPathAnimation()
                }
                const item = {
                  id: k + 1,
                  name: "路径控制",
                  pathValue: findItemEvenInfo.actionList[k].pathId || "",
                  pathListOptions: temp_pathListOptions || [],
                  pathActionValue: findItemEvenInfo.actionList[k].action || "",
                  pathActionListOptions: [
                    {
                      value: "play",
                      label: "播放"
                    },
                    {
                      value: "pause",
                      label: "暂停"
                    },
                    {
                      value: "rePlay",
                      label: "重播"
                    },
                    {
                      value: "stop",
                      label: "停止"
                    }
                  ]
                }
                pathControlList.value.push(item)
              } else if (findItemEvenInfo.actionList[k].type == "mediaControl") {
                if (!temp_mediaListOptions) {
                  temp_mediaListOptions = getAllMedia()
                }
                const item = {
                  id: k + 1,
                  name: "媒体控制",
                  mediaValue: findItemEvenInfo.actionList[k].mediaId || "",
                  mediaListOptions: temp_mediaListOptions || [],
                  mediaActionValue: findItemEvenInfo.actionList[k].action || "",
                  mediaActionListOptions: [
                    {
                      value: "play",
                      label: "播放"
                    },
                    {
                      value: "pause",
                      label: "暂停"
                    },
                    {
                      value: "rePlay",
                      label: "重播"
                    },
                    {
                      value: "stop",
                      label: "停止"
                    }
                  ]
                }
                mediaControlList.value.push(item)
              }
            }
          }
        }
      }
    }
  }
}

//判断点击元素与漫游元素是否有动作
const getClickOrRoamActionList = () => {
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
          for (let k = 0; k < findItemEventList.length; k++) {
            if (
              findItemEventList[k].handleType == "singleClick" ||
              findItemEventList[k].handleType == "continueClick"
            ) {
              clickActionList.value = findItemEventList[k].actionList
            } else if (findItemEventList[k].handleType == "roam") {
              roamActionList.value = findItemEventList[k].actionList
            }
          }
        }else{
          clickActionList.value = []
          roamActionList.value = []
        }
      }
    }
  }
}

onMounted(() => {
  getClickOrRoamActionList()
})
watch(
  () => props.optionData,
  (nv, ov) => {
    if (nv) {
      overviewShow.value = true
      getClickOrRoamActionList()
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
</style>
