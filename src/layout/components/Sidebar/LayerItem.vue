<template>
  <div class="card-container-div card-container-div-top-two" id="layerListCardContainerId">
    <el-card v-if="!isCollapse" shadow="never" class="card-container-layer">
      <template #header>
        <el-tag type="info">图层列表</el-tag>
      </template>
      <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
        <el-tab-pane label="3D层" name="threeLayer">
          <div class="layer-tree-left">
            <el-tree
              :data="threeLayerTreeData"
              :props="defaultProps"
              :default-expand-all="true"
              @node-click="handleNodeClick"
              @node-contextmenu="righttClick"
            >
              <template #default="{ node, data }">
                <div class="custom-tree-node" @dblclick="handleDblclick(data)">
                  <div class="icon-span">
                    <svg-icon class="udstream-tool-svg" :name="data.img" />
                  </div>
                  <div class="icon-span" :title="data.label">
                    {{ data.label }}
                  </div>
                  <!-- <div class="icon-span-txt-edit" v-show="!data.show && data.isLeaf">
                    <el-input
                      v-model="data.label"
                      :value="data.label"
                      @keyup.enter.native="enterInputLabel"
                      placeholder="请输入重命名文字"
                    />
                  </div> -->
                </div>
              </template>
            </el-tree>
          </div>
        </el-tab-pane>
        <el-tab-pane label="相机" name="camera">
          <div class="layer-tree-right">
            <el-tree
              :data="cameraTreeData"
              :props="defaultProps"
              :default-expand-all="true"
              @node-click="handleNodeClick"
              @node-contextmenu="righttClick"
            >
              <template #default="{ node, data }">
                <div class="custom-tree-node" @dblclick="handleDblclick(data)">
                  <div class="icon-span">
                    <svg-icon class="udstream-tool-svg" :name="data.img" />
                  </div>
                  <div class="icon-span">
                    {{ data.label }}
                  </div>
                </div>
              </template>
            </el-tree>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <el-card v-else class="card-container-layer">
      <template #header>
        <div class="card-header-el">
          <el-icon><Files /></el-icon>
        </div>
      </template>
      <div class="folder-div">图层列表</div>
    </el-card>

    <!-- <div class="rightMenuLayer-menu" v-show="showRightMenu">
      <el-menu
        class="el-menu-vertical-demo"
        background-color="#E4D4D4"
        text-color="#1CDB49"
        active-text-color="#DB1C1C"
        :collapse="rightMenuCollapse"
        @open="handleOpen"
        @close="handleClose"
      >
        <el-menu-item index="1">
          <div class="right-menu-item">
            <el-icon :size="12"> <Position /> </el-icon>移动至
          </div>
        </el-menu-item>
        <el-sub-menu index="2">
          <template #title>
            <div class="right-menu-item">
              <el-icon :size="12"> <ArrowRightBold /></el-icon>
              <span class="right-menu-item-span">将摄像机附着在附件</span>
            </div>
          </template>
          <el-menu-item-group>
            <template #title>
              <span>附件地址</span>
              <el-input v-model="attacthUrl" placeholder="请输入附件的地址" />
            </template>
            <el-menu-item index="1-1">
              <el-button plain :icon="Check" />
            </el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>
        <el-menu-item index="3">
          <div class="right-menu-item">
            <el-icon :size="12"> <View /></el-icon>
            <span>相机飞行轨迹穿过所有点</span>
          </div>
        </el-menu-item>
        <el-menu-item index="5">
          <div class="right-menu-item">
            <el-icon :size="12"><Delete /></el-icon>删除
          </div>
        </el-menu-item>
      </el-menu>
    </div> -->

    <div class="rightMenuLayer" v-show="showRightMenu">
      <ul>
        <li @click="move2ThePlace" v-show="rightClickData && rightClickData?.isLeaf">
          <span class="span-icon">
            <el-icon :size="12"> <Position /> </el-icon>
          </span>
          <span class="span-icon-txt"> 移动至 </span>
        </li>
        <li
          @click="cameraMoveToAllLine"
          v-show="
            rightClickData?.data?.itemtypeStr.toLowerCase() == 'poi' && rightClickData?.data?.projectNode.geomtype == 3
          "
        >
          <span class="span-icon">
            <el-icon :size="12"> <View /> </el-icon>
          </span>
          <span class="span-icon-txt"> 相机飞行轨迹穿过所有点 </span>
        </li>
        <li
          class="attatch-model-li"
          @click="attachModel2Line"
          v-show="
            rightClickData?.data?.itemtypeStr.toLowerCase() == 'poi' && rightClickData?.data?.projectNode.geomtype == 3
          "
        >
          <span class="span-icon">
            <el-icon :size="12"> <ArrowRightBold /> </el-icon>
          </span>
          <span class="span-icon-txt"> 将摄像机附着在附件 </span>
        </li>
        <li @click="delMenu">
          <span class="span-icon">
            <el-icon :size="12"><Delete /></el-icon>
          </span>
          <span class="span-icon-txt"> 删除 </span>
        </li>
        <li @click="cancleOprate">
          <span class="span-icon">
            <el-icon :size="12"><Close /></el-icon>
          </span>
          <span class="span-icon-txt"> 取消 </span>
        </li>
      </ul>
    </div>
  </div>
  <div class="line-model-fly" v-if="cameraFly2PathShow">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span class="card-header-span">相机飞行轨迹穿过所有点</span>
        </div>
      </template>
      <el-button class="detachCameraBtn" @click="detachCamera">断开</el-button>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, onBeforeMount, onMounted, watch, computed, toRaw } from "vue"
import { ElTree, ElMessage, ElMessageBox } from "element-plus"
import type { TabsPaneContext } from "element-plus"
import { Files, Position, View, ArrowRightBold, Document, Menu as IconMenu } from "@element-plus/icons-vue"
//Pinia相关
import { useUdstreamStore } from "@/store/modules/udstreamStore"
import { UdstreamStoreEnums } from "@/store/modules/udstreamStore.d"
import { useUdStreamCameraStore } from "@/store/modules/udstreamCamera"
import { UdstreamCameraInfoStoreEnums } from "@/store/modules/udstreamCamera.d"
import { useAppStore } from "@/store/modules/app"
//udStream相关的导入
import * as udStream from "@/udStream/udStream"
import { ProjectNode, ProjectNodeType } from "@/udStream/types/ProjectNode"
import { detachCamera } from "@/udStream/udStream_new"

// let rightClickData = null //右键操作的数据
const showRightMenu = ref(false) //右键菜单显示
const rightClickData = ref(null)

const cameraFly2PathShow = ref(false) //相机绕线段飞行的显示

const attacthUrl = ref("")

const defaultProps = {
  children: "children",
  value: "value",
  img: "img",
  label: "label",
  title: "title",
  isLeaf: "isLeaf",
  show: "show",
  data: "data"
}

//右键菜单相关
const rightMenuCollapse = ref(true)
const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}

//与Pinia有关
const udstreamStore = useUdstreamStore()
const udStreamCameraStore = useUdStreamCameraStore()

let functionExecution = true

const activeName = ref("threeLayer")
interface Tree {
  label: string
  value: string
  img: string
  children?: Tree[]
  title?: string
  isLeaf?: boolean
  show?: boolean
  data?: NodeData
}

const unwatchList: any[] = [] // ref<any>([])
const nodeTypes = new Set<string>()
const appStore = useAppStore()
const isCollapse = computed(() => {
  return !appStore.sidebar.opened
})

let allTheTreeNodes = [] as any

// interface ISlTreeNodeModel<T> {
//   title: string
//   isLeaf?: boolean
//   children?: ISlTreeNodeModel<T>[]
//   isExpanded?: boolean
//   isSelected?: boolean
//   isDraggable?: boolean
//   isSelectable?: boolean
//   data?: T
// }

interface ISlTreeNodeModel<T> {
  label: string
  value: string
  img: string
  title: string
  isLeaf?: boolean
  children?: ISlTreeNodeModel<T>[]
  data?: T
}

interface NodeData {
  projectNode: ProjectNode
  projectNodePtr: number
  itemtype: ProjectNodeType
  itemtypeStr: string
  isVisible: boolean
  UUID: string
}

// 3d层与相机中的树的点击
const handleNodeClick = (data: Tree) => {
  showRightMenu.value = false //隐藏右键的dom
  //是叶子节点
  if (data.isLeaf) {
    //终止其它的操作
    udStream.clearSelection()
    udStream.setActiveTool(0)
    //激活场景中树节点对应的图层
    const nodePtr = data.data?.projectNodePtr ?? 0
    const nodePtrArr = [nodePtr]
    udStream.selectSceneNodes(nodePtrArr, true)
    udstreamStore.setItem(UdstreamStoreEnums.IS_SELECT, true) //条目已经被选中
    if (data && data.data) {
      // 这个是干嘛的呢？
      // udstreamStore.setItem()
      // console.log("99999999999999999")
      const nodeData = data.data?.projectNode as ProjectNode
      udstreamStore.setItem(UdstreamStoreEnums.SELECTED_NODE, nodeData) //设置被选中的节点信息 （媒体对象为什么会触发频繁根节点的更新？）
      // udstreamStore.setItem(UdstreamStoreEnums.SELECTED_NODE, data.data.projectNode)
    }
  }
}

//3d层与相机中的双击
const handleDblclick = (data: Tree) => {
  // if (data?.data?.itemtype != ProjectNodeType.Custom && data.data.itemtype != ProjectNodeType.Folder) {
  //   udStream.moveToWhenPossible(data?.data?.UUID)
  // }
  if (data?.data?.itemtype != ProjectNodeType.Custom && data.isLeaf) {
    console.log(data?.data?.UUID)
    udStream.moveToWhenPossible(data?.data?.UUID)
  }
}

const cameraTreeData: ISlTreeNodeModel<NodeData>[] = ref([
  {
    label: "相机",
    show: true,
    isLeaf: false,
    value: "camera",
    title: "相机",
    img: "layer-camera",
    children: []
  }
])

const threeLayerTreeData: ISlTreeNodeModel<NodeData>[] = ref([
  {
    label: "底图",
    show: true,
    isLeaf: false,
    value: "map",
    title: "底图",
    img: "layer-map",
    children: []
  },
  {
    label: "模型",
    show: true,
    isLeaf: false,
    title: "模型",
    value: "model",
    img: "layer-model",
    children: []
  },
  {
    label: "其它模型",
    show: true,
    isLeaf: false,
    title: "其它模型",
    value: "other",
    img: "layer-other",
    children: []
  },
  {
    label: "标记",
    show: true,
    title: "标记",
    value: "location",
    img: "layer-location",
    children: []
  },
  {
    label: "标记集",
    show: true,
    title: "标记集",
    value: "locationCollection",
    img: "VectorCollect",
    children: []
  },
  {
    label: "多媒体",
    show: true,
    isLeaf: false,
    title: "多媒体",
    value: "media",
    img: "layer-media",
    children: []
  },
  {
    label: "测量",
    show: true,
    isLeaf: false,
    title: "测量",
    value: "measure",
    img: "layer-measure",
    children: []
  },
  {
    label: "垂直测距",
    show: true,
    isLeaf: false,
    title: "垂直测距",
    value: "vertical",
    img: "layer-vertical",
    children: []
  },
  {
    label: "选区",
    show: true,
    isLeaf: false,
    title: "选区",
    value: "select",
    img: "layer-select",
    children: []
  }
])

const handleClick = (tab: TabsPaneContext, event: Event) => {
  console.log(tab, event)
}

const updateNodeData = (node: ProjectNode) => {
  console.log("do nothing !")
}

//递归查找节点信息
const getNodesRecursive = (node: ProjectNode) => {
  const treeNodes: ISlTreeNodeModel<NodeData>[] = []
  node.forEachChild((child) => {
    treeNodes.push({
      label: child.name ?? "",
      value: child.name ?? "",
      title: child.name ?? "",
      img: "",
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
    //  todo=> 不晓得是干嘛的  先注释了
    // unwatchList.push(
    //   watch(
    //     () => child.lastUpdate,
    //     () => updateNodeData(child)
    //   )
    // )
    // => 暂时没弄清楚在干嘛...
    nodeTypes.add(child.itemtypeStr)
  })

  return treeNodes.length > 0 ? treeNodes : undefined
}
//拼接树的节点数据
const assembleTheTreeNode = (rootNode: ProjectNode) => {
  if (rootNode) {
    return getNodesRecursive(rootNode)
  }
  return []
}

//对场景中的treeNode  进行分类  (该方法会被执行多次   最好是让他只执行一次  现在这种写法  执行多次也是可以的 因为每次都会重置children 为 [])
const reclassificationTreeList = (nodes: ISlTreeNodeModel<NodeData>[] | undefined) => {
  // functionExecution = false
  if (nodes && nodes.length > 0) {
    const maptileChildren: ISlTreeNodeModel<NodeData>[] = []
    const udsChildren: ISlTreeNodeModel<NodeData>[] = []
    const mediaChildren: ISlTreeNodeModel<NodeData>[] = []
    const poiChildren: ISlTreeNodeModel<NodeData>[] = []
    const measureChildren: ISlTreeNodeModel<NodeData>[] = []
    const verticalMeasure: ISlTreeNodeModel<NodeData>[] = []
    const cameraChildren: ISlTreeNodeModel<NodeData>[] = []
    const otherModelChildren: ISlTreeNodeModel<NodeData>[] = []
    const poiCollectionChildren: ISlTreeNodeModel<NodeData>[] = []
    for (let k = 0; k < nodes.length; k++) {
      if (nodes[k]?.data?.itemtypeStr.toLowerCase() == "maptile") {
        //底图
        nodes[k].img = "layer-map-item"
        maptileChildren.push(nodes[k])
      } else if (nodes[k]?.data?.itemtypeStr.toLowerCase() == "uds") {
        //uds
        nodes[k].img = "layer-model-item"
        udsChildren.push(nodes[k])
      } else if (nodes[k]?.data?.itemtype == 10) {
        //其它模型  obj  gltf
        nodes[k].img = "layer-other-model"
        otherModelChildren.push(nodes[k])
      } else if (nodes[k]?.data?.itemtypeStr.toLowerCase() == "media") {
        //多媒体
        nodes[k].img = "layer-media-pic"
        mediaChildren.push(nodes[k])
      } else if (nodes[k]?.data?.itemtypeStr.toLowerCase() == "poi" && nodes[k]?.data?.projectNode.geomtype == 1) {
        //点
        nodes[k].img = "layer-location-item"
        poiChildren.push(nodes[k])
      } else if (nodes[k]?.data?.itemtypeStr.toLowerCase() == "poi" && nodes[k]?.data?.projectNode.geomtype == 5) {
        // 面积测量
        nodes[k].img = "layer-measure-area"
        measureChildren.push(nodes[k])
      } else if (nodes[k]?.data?.itemtypeStr.toLowerCase() == "poi" && nodes[k]?.data?.projectNode.geomtype == 3) {
        // 长度测量
        nodes[k].img = "layer-measure-line"
        measureChildren.push(nodes[k])
      } else if (nodes[k]?.data?.itemtypeStr.toLowerCase() == "mheight") {
        // 垂直测量
        nodes[k].img = "layer-measure-vertical"
        verticalMeasure.push(nodes[k])
      } else if (nodes[k]?.data?.itemtypeStr.toLowerCase() == "camera") {
        //相机
        nodes[k].img = "layer-camera"
        cameraChildren.push(nodes[k])
      } else if (nodes[k]?.data?.itemtypeStr.toLowerCase() == "places") {
        //标注集
        nodes[k].img = "VectorCollect"
        poiCollectionChildren.push(nodes[k])
      }
      nodes[k].isLeaf = true //右键添加的属性
      nodes[k].show = true //右键添加的属性
    }

    //底图
    const treeMapItem = threeLayerTreeData.value.find((item: any) => {
      return item.value == "map"
    })
    if (treeMapItem && treeMapItem.children) {
      treeMapItem.children = maptileChildren
    }
    //uds模型
    const treeUdsItem = threeLayerTreeData.value.find((item: any) => {
      return item.value == "model"
    })

    if (treeUdsItem && treeUdsItem.children) {
      treeUdsItem.children = udsChildren
    }

    //其它模型
    const treeOtherModelItem = threeLayerTreeData.value.find((item: any) => {
      return item.value == "other"
    })

    if (treeOtherModelItem && treeOtherModelItem.children) {
      treeOtherModelItem.children = otherModelChildren
    }

    //多媒体
    const treeMediaItem = threeLayerTreeData.value.find((item: any) => {
      return item.value == "media"
    })
    if (treeMediaItem && treeMediaItem.children) {
      treeMediaItem.children = mediaChildren
    }

    //点标记
    const treePointItem = threeLayerTreeData.value.find((item: any) => {
      return item.value == "location"
    })
    if (treePointItem && treePointItem.children) {
      treePointItem.children = poiChildren
    }

    //标记集合
    const treePointCollectItem = threeLayerTreeData.value.find((item: any) => {
      return item.value == "locationCollection"
    })
    if (treePointCollectItem && treePointCollectItem.children) {
      treePointCollectItem.children = poiCollectionChildren
    }
    //测量
    const treeMeasureItem = threeLayerTreeData.value.find((item: any) => {
      return item.value == "measure"
    })
    if (treeMeasureItem && treeMeasureItem.children) {
      treeMeasureItem.children = measureChildren
    }

    //垂直测量
    const treeVerticalItem = threeLayerTreeData.value.find((item: any) => {
      return item.value == "vertical"
    })
    if (treeVerticalItem && treeVerticalItem.children) {
      treeVerticalItem.children = verticalMeasure
    }

    //相机  另外一个树
    const treeCameraItem = cameraTreeData.value.find((item: any) => {
      return item.value == "camera"
    })
    if (treeCameraItem && treeCameraItem.children) {
      treeCameraItem.children = cameraChildren
      udStreamCameraStore.setItem(UdstreamCameraInfoStoreEnums.UDSTREAM_CAMERA_INFO, cameraChildren)
    }
  }
}

const cancelRightMenuClick = (e) => {
  console.log("cancel right menu click")
  showRightMenu.value = false
  //释放掉click事件
  let pDom = document.querySelector(".card-container-div-top-two")
  pDom?.removeEventListener("click", cancelRightMenuClick)
}

//模型URL dom的事件的添加   将gtlf模型附加到线段上的一段代码
let attachUrlDom, attachUrlDomUrl, attachUrlDomBtn, setTimeoutUrlIndex
const modelUrlAddEvent = () => {
  if (setTimeoutUrlIndex) {
    clearTimeout(setTimeoutUrlIndex)
  }
}
//模型URL dom的事件的移除
const modelUrlRemoveEvent = () => {
  if (attachUrlDom) {
    attachUrlDom.style.display = "none"
  }
}
const removeAttacthElement = (event: MouseEvent) => {
  attachUrlDom = document.querySelector(".attach-modelUrl")
  setTimeoutUrlIndex = setTimeout(() => {
    attachUrlDom.style.display = "none"
  }, 300)
  if (attachUrlDom) {
    //移除事件
    attachUrlDom.removeEventListener("mouseenter", modelUrlAddEvent)
    attachUrlDom.removeEventListener("mouseleave", modelUrlRemoveEvent)
    //添加事件
    attachUrlDom.addEventListener("mouseenter", modelUrlAddEvent)
    attachUrlDom.addEventListener("mouseleave", modelUrlRemoveEvent)
  }
}

const attachUrlDomBtnClickEvent = (event: MouseEvent) => {
  let modelUrl = attachUrlDomUrl.value
  if (modelUrl) {
    let rightClickNode = rightClickData.value?.data?.projectNode
    if (rightClickNode) {
      // "https://devmodels.oss-cn-shenzhen.aliyuncs.com/uploads/20221228/97258bce93847ffaa647a827df282d9b.glb"
      rightClickNode.SetMetadataString("attachmentURI", modelUrl)
      //移除事件
      attachUrlDom.removeEventListener("mouseenter", modelUrlAddEvent)
      attachUrlDom.removeEventListener("mouseleave", modelUrlRemoveEvent)
      attachUrlDom.style.display = "none"
    }
  } else {
    //提示信息的显示  要输入有效的gltf模型地址
    ElMessage({
      type: "warning",
      message: `请输入有效的gltf模型地址！`
    })
  }
}

const createAttacthElement = (event: MouseEvent) => {
  //这个点击需要解除click事件
  let pDom = document.querySelector(".card-container-div-top-two")
  pDom?.removeEventListener("click", cancelRightMenuClick)
  const targetDom = event.target
  const clientX = event.clientX
  const clientY = event.clientY
  console.log(targetDom)
  console.log("attachModel2Line")
  let attachDom = null
  attachDom = document.querySelector(".attach-modelUrl")
  if (attachDom) {
    attachDom.style.display = "block"
    attachDom.style.top = clientY + "px"
    attachDom.style.left = clientX + "px"
  } else {
    attachDom = document.createElement("div")
    attachDom.innerHTML = `
     <div class='attach-modelUrl-div'>
        <input class='attach-input-url'  name='attacth' value='' />
        <div class='attach-input-btn' id="addModelAttatchMent2Url">确定</div>
      </div>
    `
    attachDom.className = "attach-modelUrl"
    attachDom.style.top = clientY + "px"
    attachDom.style.left = clientX + 10 + "px"
    document.body.appendChild(attachDom)
  }

  attachUrlDomUrl = document.querySelector(".attach-input-url")
  attachUrlDomBtn = document.querySelector(".attach-input-btn")
  attachUrlDomBtn?.removeEventListener("click", attachUrlDomBtnClickEvent)
  attachUrlDomBtn?.addEventListener("click", attachUrlDomBtnClickEvent)
}

//右键点击
const righttClick = (event, data, node, o) => {
  //如果节点是叶子节点才会有反应
  if (node.isLeaf) {
    rightClickData.value = data
    console.log(rightClickData.value)
    let pDom = document.querySelector(".card-container-div-top-two")
    //先释放掉click事件
    let pDomoffsetTop = pDom.offsetParent.offsetTop
    showRightMenu.value = false
    let menu = document.querySelector(".rightMenuLayer")
    if (menu) {
      if (event.clientX > 130) {
        menu.style.left = 130 + "px"
      } else {
        menu.style.left = event.clientX + "px"
      }
      menu.style.top = event.clientY - pDomoffsetTop + "px"
    }
    showRightMenu.value = true
    //注册一个click事件
    pDom?.addEventListener("click", cancelRightMenuClick)
    //注册一个鼠标移动进入对应DOM的事件
    let attacthMentDom = document.querySelector(".attatch-model-li")
    if (attacthMentDom) {
      //先删除掉以前的事件
      attacthMentDom.removeEventListener("mouseenter", createAttacthElement)
      attacthMentDom.removeEventListener("mouseleave", removeAttacthElement)
      //再添加的事件的监听
      attacthMentDom.addEventListener("mouseenter", createAttacthElement)
      attacthMentDom.addEventListener("mouseleave", removeAttacthElement)
    }
  }
}

//移动到该位置
const move2ThePlace = () => {
  console.log(rightClickData.value)
  if (rightClickData.value?.data?.itemtype != ProjectNodeType.Custom && rightClickData.value?.isLeaf) {
    console.log(rightClickData.value?.data?.UUID)
    udStream.moveToWhenPossible(rightClickData.value?.data?.UUID)
  }
}

//相机飞行轨迹穿过所有点
const cameraMoveToAllLine = async () => {
  //显示停止的弹窗
  cameraFly2PathShow.value = true
  let rightClickNode = rightClickData.value?.data?.projectNode
  if (rightClickNode) {
    await udStream.performFlythrough(rightClickNode)
  }
}

const attachModel2Line = (event: MouseEvent) => {
  //这个点击需要解除click事件
  let pDom = document.querySelector(".card-container-div-top-two")
  pDom?.removeEventListener("click", cancelRightMenuClick)
  const targetDom = event.target
  const clientX = event.clientX
  const clientY = event.clientY
  console.log(targetDom)
  console.log("attachModel2Line")

  let attachDom = null
  attachDom = document.querySelector(".attach-modelUrl")
  if (attachDom) {
    attachDom.style.top = clientY + "px"
    attachDom.style.left = clientX + "px"
  } else {
    attachDom = document.createElement("div")
    attachDom.innerHTML = `
     <div class='attach-modelUrl-div'>
        <input class='attach-input-url'  name='attacth' value='' />
        <div class='attach-input-btn'>确定</div>
      </div>
    `
    attachDom.className = "attach-modelUrl"
    attachDom.style.top = clientY + "px"
    attachDom.style.left = clientX + "px"
    document.body.appendChild(attachDom)
  }
}

//重命名菜单
const renameMenu = () => {
  showRightMenu.value = false
  if (rightClickData.value?.isLeaf && rightClickData.value?.data.UUID) {
    let deleteId = rightClickData.value?.data.UUID
    threeLayerTreeData.value.map((item: any) => {
      for (let k = 0; k < item.children.length; k++) {
        if (item.children[k]?.data.UUID == deleteId) {
          item.show = false
        }
      }
    })
  }
}

//重命名 enter键输入的那一刻
const enterInputLabel = (params: string) => {}

//执行图层的删除操作
const excuteLayerDelete = () => {
  if (rightClickData.value?.isLeaf && rightClickData.value?.data.UUID) {
    let deleteId = rightClickData.value?.data.UUID
    //删除tree里面的值
    let toRawData = toRaw(threeLayerTreeData.value)
    let filterPages = toRawData.reduce((pre: any, cur: any, index: number) => {
      if (cur.children && cur.children.length > 0) {
        let filterArr = cur.children.filter((ch: any) => {
          return ch.data.UUID !== deleteId
        })
        cur.children = filterArr
        pre.push(cur)
      }
      return pre
    }, [])
    threeLayerTreeData.value = filterPages
    //删除场景中的节点信息
    let rightClickNode = rightClickData.value?.data.projectNode
    udStream.removeProjectNode(rightClickNode)
    return true
  }

  return false
}

//执行删除视点的操作
const excuteViewPointDelete = () => {
  if (rightClickData.value?.isLeaf && rightClickData.value?.data.UUID) {
    let deleteId = rightClickData.value?.data.UUID
    //删除tree里面的值
    let toRawData = toRaw(cameraTreeData.value)
    let filterPages = toRawData.reduce((pre: any, cur: any, index: number) => {
      if (cur.children && cur.children.length > 0) {
        let filterArr = cur.children.filter((ch: any) => {
          return ch.data.UUID !== deleteId
        })
        cur.children = filterArr
        pre.push(cur)
      }
      return pre
    }, [])
    cameraTreeData.value = filterPages
    //删除场景中的节点信息
    let rightClickNode = rightClickData.value?.data.projectNode
    udStream.removeProjectNode(rightClickNode)
    return true
  }

  return false
}

//删除该节点信息
const delMenu = () => {
  //删除树节点信息
  showRightMenu.value = false
  if (activeName.value == "threeLayer") {
    ElMessageBox.confirm("确认删除此地图图层吗？", "删除地图图层", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning"
    })
      .then(() => {
        let res = excuteViewPointDelete()
        if (res) {
          ElMessage({
            type: "success",
            message: `删除地图图层成功！`
          })
        } else {
          ElMessage({
            type: "error",
            message: `删除地图图层失败！`
          })
        }
      })
      .catch(() => {
        ElMessage({
          type: "info",
          message: `取消删除！`
        })
      })
  } else {
    ElMessageBox.confirm("确认删除此视点吗？", "删除地图图层", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning"
    })
      .then(() => {
        let res = excuteLayerDelete()
        if (res) {
          ElMessage({
            type: "success",
            message: `删除视点成功！`
          })
        } else {
          ElMessage({
            type: "error",
            message: `删除视点失败！`
          })
        }
      })
      .catch(() => {
        ElMessage({
          type: "info",
          message: `取消删除！`
        })
      })
  }
}

//取消右键
const cancleOprate = () => {
  showRightMenu.value = false
}

onBeforeMount(() => {
  udStream.registerGetActiveProjectRootNodeCallback((rootNodePtr) => {
    // console.log("udstream根节点信息发生改变......registerGetActiveProjectRootNodeCallback-----1")
    try {
      udstreamStore.setItem(UdstreamStoreEnums.UDSTREAM_ROOT_NODE, new ProjectNode(rootNodePtr))
    } catch (error) {
      console.log(error)
    }
  })
  udStream.registerUpdateProjectNodesCallback(() => {
    // console.log('udstream根节点信息发生改变......registerUpdateProjectNodesCallback----2')
    try {
      udstreamStore.getUdstreamRootNode.checkUpdates()
    } catch (error) {
      console.log(error)
    }
    // 这里还需要做其他的操作  不然节点不会变化............
  })
  udStream.registerGetClickedItemCallback((uuid, isMultiSelect) => {
    //照理要对目录树进行反选
    if (uuid) {
      //有被点中模型
      //找到场景中对应的uudd
      const findUdstreamNode = allTheTreeNodes.find((item: any) => {
        return item.data.UUID == uuid
      })
      if (findUdstreamNode) {
        udstreamStore.setItem(UdstreamStoreEnums.IS_SELECT, true) //被选中
        udstreamStore.setItem(UdstreamStoreEnums.SELECTED_NODE, findUdstreamNode.data.projectNode)
      }
    } else {
      udstreamStore.setItem(UdstreamStoreEnums.IS_SELECT, false) //没有被选中  控制属性面板的显隐
      udstreamStore.setItem(UdstreamStoreEnums.SELECTED_NODE, null as any) //设置被选中的节点信息
      // udstreamStore.setItem(UdstreamStoreEnums.UDSTREAM_SETTING)
    }
  })
  // udStream.registerGeneralUDSPickCallback((node: number, x: number, y: number, z: number) => {
  //   console.log("打印坐标的值", x, y, z)
  // })
})

const detachCamera = async () => {
  cameraFly2PathShow.value = false
  await udStream.detachCamera()
}

onMounted(() => {
  // fetchRouteParamsLocation()
})

//监听节点信息
watch(
  () => udstreamStore.getUdstreamRootNode,
  (nv, ol) => {
    console.log("udstreamStore.getUdstreamRootNode.UUID")
    allTheTreeNodes = assembleTheTreeNode(nv)
    if (allTheTreeNodes) {
      // 重分类节点数据
      // console.log("root node")
      reclassificationTreeList(allTheTreeNodes)
      // if (functionExecution) {
      //   console.log("function execution")
      //   reclassificationTreeList(allTheTreeNodes)
      //   setTimeout(() => {
      //     functionExecution = true
      //   }, 1000)
      // }
    } else {
      //恢复图层的节点信息
      threeLayerTreeData.value.map((item: any) => {
        item.children = []
      })
    }
  },
  {
    deep: true
  }
)
</script>
<style scoped>
.card-container-div {
  height: 100%;
}

.card-container-div :deep(.el-card__header) {
  padding: 6px;
}
.card-container-layer {
  height: 100%;
}

.card-container-div :deep(.el-card__body) {
  padding: 6px auto;
}

.layer-tree-left {
  font-size: 16px;
}
.layer-tree-left :deep(.el-tree) {
  overflow-y: auto;
  margin-left: -10px;
  /* height: 41vh; */
}

@media screen and (max-width: 1550px) {
  .layer-tree-left :deep(.el-tree) {
    max-height: 800px;
  }
}

@media screen and (max-width: 1920px) {
  .layer-tree-left :deep(.el-tree) {
    max-height: 1000px;
  }
}

.custom-tree-node {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.icon-span {
  display: inline-block;
  vertical-align: middle;
  margin: 8px;
}
.udstream-tool-svg {
  display: inline-block;
  vertical-align: middle;
}
.card-header-el {
  font-size: 16px;
  text-align: center;
}
.folder-div {
  font-size: 16px;
}

.rightMenuLayer {
  position: absolute;
  z-index: 60;
  cursor: pointer;
  border: 1px solid #eee;
  box-shadow: 0 0.5em 1em 2px rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  color: #1a1a1a;
  font-size: 12px;
}
.rightMenuLayer ul {
  list-style: none;
  margin: 0;
  padding: 0;
  border-radius: 6px;
}
.rightMenuLayer ul li {
  padding: 6px 10px;
  background: #fff;
  border-bottom: 1px solid #000;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-around;
}
.rightMenuLayer ul li:last-child {
  border: none;
}
.rightMenuLayer ul li:hover {
  transition: all 1s;
  background: #92c9f6;
}
.icon-span-txt-edit {
  display: inline-block;
  vertical-align: middle;
  margin-left: 8px;
}
.rename-input {
  position: absolute;
  z-index: 60;
}
.span-icon {
  display: inline-block;
  width: 20px;
  text-align: left;
}
.span-icon-txt {
  display: inline-block;
  width: 80px;
  text-align: left;
}

.rightMenuLayer-menu {
  position: absolute;
  border: 1px solid #333;
  box-shadow: 0 0.5em 1em 2px rgba(0, 0, 0, 0.1);
}

.right-menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  /* word-wrap:break-word;
  white-space:normal; */
}

.right-menu-item-span {
  display: inline-block;
  width: 80px;
  /* word-wrap:break-word;
  white-space:normal; */
}

.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: auto;
  min-height: 200px;
}
.el-sub-menu {
  /* width: 200px; */
}
.el-menu-item {
  /* width: 200px; */
}

.dark .app-wrapper .sidebar-container .el-menu .el-menu-item {
  background-color: #fff !important;
  width: 100px;
  border-bottom: 1px solid red;
}
</style>
<style>
.dark .app-wrapper .sidebar-container .el-sub-menu__title {
  background-color: #fff !important;
  border-bottom: 1px solid red;
  width: 100px;
}
.attach-modelUrl {
  position: absolute;
  width: 200px;
  height: 80px;
  background-color: #fff;
  box-shadow: 0 0.5em 1em 2px rgba(0, 0, 0, 0.1);
  border-radius: 5px;
  z-index: 1003;
}
.attach-modelUrl-div {
  padding: 6px;
  width: 100%;
}
.attach-input-url {
  width: 100%;
}
.attach-input-btn {
  float: right;
  width: 40px;
  height: 30px;
  font-size: 14px;
  color: #fff;
  background: #1d1e1f;
  text-align: center;
  line-height: 30px;
  margin-top: 6px;
  border-radius: 4px;
}

.attach-input-btn:hover {
  cursor: pointer;
}

.line-model-fly {
  position: fixed;
  width: 200px;
  height: 100px;
  top: 10%;
  right: 20%;
  z-index: 999;
}

.detachCameraBtn {
  float: right;
}
.card-header-span {
  font-size: 14px;
  color: #ffff;
}
</style>
