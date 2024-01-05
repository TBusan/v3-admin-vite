<template>
  <div class="udstream-tool" :class="isshowTheToolRows ? 'udstream-tool-row-show' : 'udstream-tool-row-hide'">
    <el-tooltip v-for="item in toolList" :key="item.name" class="box-item" :content="item.content" placement="bottom">
      <svg-icon class="udstream-tool-svg" :name="item.name" @click.prevent="item.handleClick" />
    </el-tooltip>
    <el-dropdown @command="measureDropDown">
      <el-button text>
        <el-tooltip content="ESC结束" placement="top">
          <el-icon class="udstream-tool-svg-yy"><svg-icon :name="'Measure'" /></el-icon>
        </el-tooltip>
        <el-icon class="el-icon--right"><arrow-down /></el-icon>
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="measure-area">面积测量</el-dropdown-item>
          <el-dropdown-item command="measure-line">长度测量</el-dropdown-item>
          <el-dropdown-item command="measure-hight">高度测量</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <el-dropdown @command="slectedDropDown">
      <el-button text>
        <el-icon class="udstream-tool-svg-yy"><svg-icon :name="'select'" /></el-icon>
        <el-icon class="el-icon--right"><arrow-down /></el-icon>
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="select-rec">矩形过滤器</el-dropdown-item>
          <el-dropdown-item command="select-circle">球形过滤器</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
  <map-popover
    title="底图"
    :hiddenFullBtn="true"
    v-if="visibleMap"
    v-model="visibleMap"
    @confirm="handleConfirmMap"
    @close="handleCloseMap"
  />
  <scence-popover
    title="场景"
    :hiddenFullBtn="true"
    v-if="visibleScene"
    v-model="visibleScene"
    @confirm="handleConfirmScene"
    @close="handleCloseScene"
  >
  </scence-popover>
  <model-popover
    title="模型"
    :hiddenFullBtn="true"
    v-if="visibleModel"
    v-model="visibleModel"
    @confirm="handleConfirmModel"
    @close="handleCloseModel"
  >
  </model-popover>
  <media-popover :dialogMediaVisible="mediaPopupShow" @sendClosePopup="closeThePopup"></media-popover>
  <point-collect
    :pointCollectPopupShow="pointCollectPopupShow"
    @sendClosePopup="closeThePointCollectPopup"
    @changePointLabelName="changePointLabels"
  >
  </point-collect>
  <ThroughPoint
    :throughPointPopupShow="throughPointPopupShow"
    @sendClosePopup="closeThePointCollectPopup"
    @changePointLabelName="changePointLabels"
  ></ThroughPoint>
</template>
<script lang="ts" setup>
import { ref, toRaw, onMounted, onUnmounted } from "vue"
//信息显示
import { ElButton, ElMessage } from "element-plus"
//弹窗组件
import ModelPopover from "@/components/ToolPopover/model/modelPopover.vue"
import ScencePopover from "@/components/ToolPopover/scence/scencePopover.vue"
import MapPopover from "@/components/ToolPopover/map/mapPopover.vue"
import MediaPopover from "@/components/ToolPopover/media/index.vue"
import PointCollect from "@/components/ToolPopover/pointCollect/index.vue"
import ThroughPoint from "@/components/ToolPopover/throughPoint/index.vue"
//hooks
import useToolDialog from "@/components/ToolPopover/dialog.hook"
//udstream相关
import * as UdStream from "@/udStream/udStream"
import { ProjectNode } from "@/udStream/types/ProjectNode"

//Pinia相关
import { useUdstreamStore } from "@/store/modules/udstreamStore"
const isshowTheToolRows = ref(true)
const udstreamStore = useUdstreamStore()
//跟打开弹窗相关的操作
const { visible: visibleModel, openDialog: openDialogModel, closeDialog: closeModel } = useToolDialog()
const { visible: visibleMap, openDialog: openDialogMap, closeDialog: closeMap } = useToolDialog()
const { visible: visibleScene, openDialog: openDialogScene, closeDialog: closeScene } = useToolDialog()

const mediaPopupShow = ref(false) //多媒体的弹窗设置
const pointCollectPopupShow = ref(false) // 点位集合弹窗的显示
const throughPointPopupShow = ref(false) //通过点的集合弹窗的显示

let drawToolInfos = {
  type: "", //绘制的类型
  nums: 0 //绘制的次数
}

let tempPoint = {
  x: 0,
  y: 0,
  z: 0
}

enum GizmoTool {
  NoGizmo,
  Translate,
  Rotate,
  Scale
}

const sceneHandle = () => {
  openDialogScene()
}

const mapHandle = () => {
  openDialogMap()
}

const modelHandle = () => {
  openDialogModel()
}

//关闭底图弹窗
const handleConfirmMap = async (params: any) => {
  let WktInfo = await UdStream.getWktInfo()
  if (WktInfo && WktInfo?.srid !== 4978) {
    ElMessage({
      message: "当前页面是没有空间坐标参考的，无法添加底图！",
      type: "warning",
      duration: 3000
    })
    closeMap()
    return
  }

  if (params.id) {
    const name = params.modeStr
    const addr = params.serverAddr
    const attribution = ""
    const customAddr = ""
    const customAttr = ""
    const height = 0
    const blendMode = 0
    const transparency = 100
    const maxDepth = 19
    UdStream.createMapTileNode(
      name,
      addr,
      attribution,
      customAddr,
      customAttr,
      height,
      blendMode,
      transparency,
      maxDepth
    )
    ElMessage({
      message: "创建底图成功",
      type: "success"
    })
  } else {
    ElMessage({
      message: "未选择相关底图",
      type: "success"
    })
  }
  closeMap()
}

const handleCloseMap = () => {
  ElMessage({
    message: "关闭底图窗口",
    type: "info",
    duration: 2000
  })
  closeMap()
}

//关闭模型弹窗
const handleConfirmModel = async (params: any) => {
  closeModel()
  //加载模型
  if (params.length > 0) {
    ElMessage({
      message: "已经选择模型，正在加载中...",
      type: "success"
    })
    for (let k = 0; k < params.length; k++) {
      const url = params[k].url
      console.log("新加载的uuid 00")
      if (url) {
        const modelUrl = globleEuleeCloudPath + url
        UdStream.loadSceneItem(modelUrl)
        // UdStream.loadSceneItem(modelUrl).then((nodePtr: number) => {
        //   console.log("新加载的uuid 22")
        //   const node: ProjectNode = new ProjectNode(nodePtr)
        //   console.log("新加载的uuid")
        //   console.log(node)
        //   if (node.UUID) {
        //     UdStream.moveToWhenPossible(node.UUID)
        //   }
        // })
      }
    }
  } else {
    ElMessage({
      message: "未选择模型！",
      type: "success"
    })
  }
}
const handleCloseModel = () => {
  ElMessage({
    message: "关闭模型选择窗口！",
    type: "info",
    duration: 2000
  })
  closeModel()
}

//关闭场景弹窗
const handleConfirmScene = (params: any) => {
  closeScene()
  const url = params.url
  if (url) {
    ElMessage({
      message: "已经选择场景，正在加载中...",
      type: "success"
    })
    setTimeout(() => {
      const sceneUrl = globleEuleeCloudPath + url
      UdStream.loadSceneItem(sceneUrl)
    })
  } else {
    ElMessage({
      message: "未选择场景！",
      type: "success"
    })
  }
}

const handleCloseScene = () => {
  ElMessage({
    message: "关闭场景窗口",
    type: "info",
    duration: 2000
  })
  closeScene()
}

//绘制点相关的操作
const pointHandle = () => {
  console.log("点击绘制点的操作！")
  // UdStream.clearSelection()
  // UdStream.setActiveTool(4)
  // return
  UdStream.clearSelection()
  UdStream.setActiveTool(21) //UDSPickGeneral
  // UdStream.setActiveTool(16)  //UDSPick
  // UdStream.setActiveTool(14)  //AddMedia
  // UdStream.deactivateKeyBindings(true)
  UdStream.registerGeneralUDSPickCallback((node: number, x: number, y: number, z: number) => {
    if (node > 0) {
      UdStream.addPoint(x, y, z, "单点")
    }
  })
}

//绘制点位集的操作
const pointCollectHandle = () => {
  UdStream.clearSelection()
  UdStream.addProjectNode("Places", "placeLayerDefaultName", "sceneExplorerAddPlaceLayer")
  UdStream.setActiveTool(13)
  pointCollectPopupShow.value = true //点位集弹窗
  UdStream.setPlaceLocationName("点位集标注")
}

//添加视点 （相机）
const cameraHandle = (saveSettings = true) => {
  try {
    UdStream.addProjectCamera(saveSettings)
    ElMessage({
      message: "视点添加成功，可切换到相机图层查看！",
      type: "success",
      duration: 3000
    })
  } catch (err) {
    ElMessage({
      message: "视点添加失败...",
      type: "error",
      duration: 3000
    })
  }
}

//添加通过点的操作   开启弹窗功能
const throughPointHandle = () => {
  ElMessage({
    message: "开发中，尽情期待！",
    type: "success"
  })
  return
  UdStream.clearSelection()
  UdStream.addProjectNode("FlyPath", "flythroughDefaultName", "sceneExplorerAddFlythrough")
  throughPointPopupShow.value = true
}

//添加多媒体
const mediaHandle = () => {
  UdStream.clearSelection()
  debugger
  // UdStream.setActiveTool(14)
  UdStream.setActiveTool(21) //UDSPickGeneral
  // UdStream.setActiveTool(16)  //UDSPick
  // UdStream.setActiveTool(14)  //AddMedia
  // UdStream.deactivateKeyBindings(true)
  UdStream.registerGeneralUDSPickCallback((node: number, x: number, y: number, z: number) => {
    if (node > 0) {
      mediaPopupShow.value = true
      tempPoint = {
        x: x,
        y: y,
        z: z
      }
    }
  })
  // setTimeout(() => {
  //   // UdStream.addMedia(
  //   //   "https://devmodels.oss-cn-shenzhen.aliyuncs.com/uploads/20221025/e103a357d48b5becfb00fd7403513429.png"
  //   // )
  //   // UdStream.deactivateKeyBindings(true);
  // }, 5000)
}

//移动相关的操作
const handleGizmoTools = async (tool: number, node: ProjectNode) => {
  const actions: (() => void)[] = [
    async () => await UdStream.setGizmoTool(node, GizmoTool.Translate),
    async () => await UdStream.setGizmoTool(node, GizmoTool.Rotate),
    async () => await UdStream.setGizmoTool(node, GizmoTool.Scale)
  ]

  if (tool >= 0 && tool < actions.length) {
    await actions[tool]()
  } else {
    await UdStream.setGizmoTool(node, GizmoTool.NoGizmo)
  }
}

// const gizmoAllowedControls = async (node: ProjectNode) => {
//   if (node == null) {
//     return 0
//   }

//   return await UdStream.getAllowedGizmoControls(node)
// }

//移动相关的操作
const moveHandle = async () => {
  //如果未选中模型  则提示需要选中模型
  const selectUdstreamNode = toRaw(udstreamStore.getSelectedUdstreamNode)
  if (selectUdstreamNode) {
    await UdStream.toggleGizmoTools(selectUdstreamNode, true)
    await handleGizmoTools(0, selectUdstreamNode)
  } else {
    ElMessage({
      message: "请先选择要移动的模型,可以从图层列表和场景中点击选取！",
      type: "success"
    })
  }
}

//旋转相关的操作
const rotationHandle = async () => {
  //如果未选中模型  则提示需要选中模型
  const selectUdstreamNode = toRaw(udstreamStore.getSelectedUdstreamNode)
  if (selectUdstreamNode) {
    await UdStream.toggleGizmoTools(selectUdstreamNode, true)
    await handleGizmoTools(1, selectUdstreamNode)
  } else {
    ElMessage({
      message: "请先选择要旋转的模型,可以从图层列表和场景中点击选取！",
      type: "success"
    })
  }
}

//缩放相关的操作
const scaleToolHandle = async () => {
  //如果未选中模型  则提示需要选中模型
  const selectUdstreamNode = toRaw(udstreamStore.getSelectedUdstreamNode)
  if (selectUdstreamNode) {
    await UdStream.toggleGizmoTools(selectUdstreamNode, true)
    await handleGizmoTools(2, selectUdstreamNode)
  } else {
    ElMessage({
      message: "请先选择要缩放的模型,可以从图层列表和场景中点击选取！",
      type: "success"
    })
  }
}

//测量相关操作
const measureDropDown = (command: string | number | object) => {
  if (command) {
    UdStream.clearSelection()
    if (command == "measure-area") {
      UdStream.setActiveTool(2)
      drawToolInfos.type = "measure-area" //暂时没啥用
      drawToolInfos.nums = 0
    } else if (command == "measure-line") {
      UdStream.setActiveTool(1)
      drawToolInfos.type = "measure-line"
      drawToolInfos.nums = 0
    } else if (command == "measure-hight") {
      UdStream.setActiveTool(3)
    }
  }
}

//选择相关操作 (过滤与框选)
const slectedDropDown = (command: string | number | object) => {
  if (command && command == "select-rec") {
    //长方体过滤
    UdStream.setActiveTool(6)
  } else if (command && command == "select-circle") {
    //圆形过滤
    UdStream.setActiveTool(7)
  }
}

const toolList = [
  {
    name: "move-tool",
    content: "移动/W",
    handleClick: moveHandle
  },
  {
    name: "rotation",
    content: "旋转/E",
    handleClick: rotationHandle
  },
  {
    name: "scale-tool",
    content: "缩放/R",
    handleClick: scaleToolHandle
  },
  // {
  //   name: "Rectangle",
  //   content: "矩形",
  //   handleClick: null
  // },
  {
    name: "Map",
    content: "底图",
    handleClick: mapHandle
  },
  {
    name: "model",
    content: "模型",
    handleClick: modelHandle
  },
  {
    name: "scene",
    content: "场景",
    handleClick: sceneHandle
  },
  {
    name: "Txt",
    content: "多媒体",
    handleClick: mediaHandle
  },
  {
    name: "Vector",
    content: "单个点",
    handleClick: pointHandle
  },
  {
    name: "VectorCollect",
    content: "点集",
    handleClick: pointCollectHandle
  },
  // {
  //   name: "view",
  //   content: "视点",
  //   handleClick: null
  // },
  {
    name: "camera",
    content: "相机",
    handleClick: cameraHandle
  },
  {
    name: "throughPoint",
    content: "通过点",
    handleClick: throughPointHandle
  }
  // {
  //   name: "cameraList",
  //   content: "相机组",
  //   handleClick: null
  // }
]

//关闭多媒体的弹窗
const closeThePopup = (params: boolean | string) => {
  if (typeof params == "string" && params.constructor == String) {
    UdStream.addMedia(params, tempPoint.x, tempPoint.y, tempPoint.z)
  } else {
    UdStream.clearSelection()
    UdStream.setActiveTool(0)
  }
  mediaPopupShow.value = false
}

//关闭点位集的弹窗
const closeThePointCollectPopup = (params: boolean | string) => {
  pointCollectPopupShow.value = false
  UdStream.clearSelection()
  UdStream.setActiveTool(0)
}

//点位集名称发生变化触发的
const changePointLabels = (params: string) => {
  UdStream.setPlaceLocationName(params)
}

//键盘的监听事件
const keyborderEvent = (e: KeyboardEvent) => {
  //对整个页面监听
  let keyNum = window.event ? e.keyCode : e.which //获取被按下的键值
  //判断如果用户按下了ESC键(keycode=27)，
  if (keyNum == 27) {
    console.log("按下了空格")
    console.log(drawToolInfos.nums)
    if (drawToolInfos.type == "measure-line") {
      if (drawToolInfos.nums < 2) {
        console.log("线不能完成绘制")
      } else {
        UdStream.setActiveTool(0)
        drawToolInfos.nums = 0
        drawToolInfos.type = ""
      }
    } else if (drawToolInfos.type == "measure-area") {
      if (drawToolInfos.nums < 3) {
        console.log("面不能完成绘制")
      } else {
        UdStream.setActiveTool(0)
        drawToolInfos.nums = 0
        drawToolInfos.type = ""
      }
    }
    UdStream.setActiveTool(0)
  }

  //判断如果用户按下了Shift键(keycode=32)和回车键（keycody=13） // && e.shiftKey
  if (keyNum == 87) {
    //平移
    console.log("w")
    moveHandle()
  }

  if (keyNum == 69) {
    //旋转
    console.log("e")
    rotationHandle()
  }

  if (keyNum == 82) {
    //缩放
    console.log("r")
    scaleToolHandle()
  }
}

onMounted(() => {
  // 监听打开的弹窗
  // console.log('..............打印打开弹窗和的监听',value)
  // UdStream.registerOpenModalCallback(function (type) {
  //   // let name = "modal" + ModalType[type]
  //   let name = type
  //   console.log("..............打印打开弹窗和的监听", type)
  //   // let modal = self.$refs[name]
  //   if (name !== undefined) {
  //     // self.openModal(type)
  //     return 1
  //   }
  //   return 0
  // })

  // document?.addEventListener(
  //   "click",
  //   function (e) {
  //     console.log(".......地图中的点击.......")
  //     if(e.target?.nodeName.toLowerCase == "canvas"){
  //       drawToolInfos.nums++
  //     }
  //   },
  //   false
  // )
  document.onkeydown = keyborderEvent
})

onUnmounted(() => {
  //清除监听事件
  // document.removeEventListener("onkeyup", keyborderEvent)
})

// watch(
//   () => udstreamStore.getSelectedUdstreamNode,
//   (nv, ov) => {
//     let hb = toRaw(nv)
//     console.log("打印相关的节点信息...")
//     console.log(hb)
//     if (hb && hb?.itemtypeStr == "POI") {
//       mediaPopupShow.value = true
//     } else if (hb && hb.itemtypeStr == "POI") {
//       console.log("nnnn")
//     }
//   }
// )

const ck = {
  click: {
    type: "continue", //单机
    eventList: [
      {
        name: "roalMove",       //roalMove:角色移动   modelAction:模型d动作   pathAction:路径动作  mediaPlay:模型播放
        mainBodyId: "xxxxxxx",  //主体的ID
        pointId: "xxxxxxxxxxxx" //视点的ID
      },
      {
        name: "modelAction",   //roalMove:角色移动   modelAction:模型d动作   pathAction:路径动作  mediaPlay:模型播放
        mainBodyId: "xxxxxxx", //主体的ID
        actionName: "招手"     //
      },
      {
        name: "pathAction",    //roalMove:角色移动   modelAction:模型d动作   pathAction:路径动作  mediaPlay:模型播放
        mainBodyId: "xxxxxxx", //主体的ID
        actionName: "播放"     //
      },
      {
        name: "mediaPlay",     //roalMove:角色移动   modelAction:模型d动作   pathAction:路径动作  mediaPlay:模型播放
        mainBodyId: "xxxxxxx", //主体的ID
        actionName: "暂停" //
      }
    ]
  }
}

const rm = {
  roam: {
    type: "in" // in 漫游进入   out 漫游退出
  }
}
</script>
<style scoped>
.udstream-tool {
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: #2e3237;
  margin-left: 8px;
  padding: 8px;
}
.udstream-tool-row {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  top: 50%;
}

.box-item {
  /* vertical-align: middle; */
}

.udstream-tool-svg {
  display: inline-block;
  margin: 0 10px;
  font-size: 24px;
}
.udstream-tool-svg-yy {
  font-size: 24px;
}
.udstream-tool-row-show {
  /* display: block; */
}
.udstream-tool-row-hide {
  display: none;
}
.media-st {
  position: absolute;
  z-index: 60;
  left: 50%;
  top: 50%;
  background: red;
  transform: translate(-50%, -50%);
}
</style>
