<template>
  <div>{{ measureTitle }}</div>
  <el-collapse v-model="activeNamesPoint">
    <el-collapse-item title="点位属性" name="1">
      <el-row>
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">名称</span>
        <div class="row-div">
          <el-input
            v-model="measureName"
            @keyup.enter.native="modifyInputName"
            :disabled="measureAble"
            class="w-50 m-2"
            placeholder="名称"
            @keydown.stop
          />
          <el-tooltip class="box-item" effect="dark" content="enter键结束输入" placement="top-start">
            <el-icon><Edit @click="reNameTheConfig" /></el-icon>
          </el-tooltip>
        </div>
      </el-row>
      <el-row>
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">已选点</span>
        <el-select v-model="selectedPoint" placeholder="Select" @change="currentPointChange">
          <el-option v-for="item in pointsLen" :key="item" :label="item" :value="item" />
        </el-select>
      </el-row>
      <el-row>
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">X坐标</span>
        <el-input v-model="currentPoint.x" class="w-50 m-2" @change="updateGeometry" placeholder="X坐标" />
      </el-row>
      <el-row>
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">Y坐标</span>
        <el-input v-model="currentPoint.y" class="w-50 m-2" @change="updateGeometry" placeholder="Y坐标" />
      </el-row>
      <el-row>
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">Z坐标</span>
        <el-input v-model="currentPoint.z" class="w-50 m-2" @change="updateGeometry" placeholder="Z坐标" />
      </el-row>
    </el-collapse-item>
  </el-collapse>
  <el-collapse v-model="activeNamesShow">
    <el-collapse-item title="显示属性" name="1">
      <el-row>
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">显示长度</span>
        <el-switch v-model="showLength" @change="setShowLength" />
      </el-row>
      <el-row>
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">显示所有长度</span>
        <el-switch v-model="showAllLengths" @change="setShowAllLengths" />
      </el-row>
      <el-row>
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">显示角度</span>
        <el-switch v-model="showAngles" @change="setShowAngles" />
      </el-row>
      <el-row>
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">显示区域</span>
        <el-switch v-model="showArea" @change="setShowArea" />
      </el-row>
      <el-row>
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">闭合多边形</span>
        <el-switch v-model="lineClosed" @change="setLineClosed" />
      </el-row>
      <el-row>
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">直线宽度</span>
        <el-slider v-model="lineWidth" @change="setLineWidth" :min="1" :max="10" :step="0.1" />
      </el-row>
      <el-row>
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">线朝向</span>
        <el-select v-model="lineMode" placeholder="Select" @change="setLineMode">
          <el-option v-for="item in lineModeItems" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-row>
      <el-row v-if="lineMode !== 'Screen Line'">
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">直线风格</span>
        <el-select v-model="lineStyle" placeholder="Select" @change="setLineStyle">
          <el-option v-for="item in lineStyleItems" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-row>
    </el-collapse-item>
  </el-collapse>
  <el-collapse v-model="activeNamesColor">
    <el-collapse-item title="颜色属性" name="1">
      <el-row>
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">直线颜色1</span>
        <el-color-picker v-model="lineColourPrimary" @change="setLineColourPrimary" show-alpha />
      </el-row>
      <el-row>
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">直线颜色2</span>
        <el-color-picker v-model="lineColourSecondary" @change="setLineColourSecondary" show-alpha />
      </el-row>
      <el-row v-if="showAreaFillColour">
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">填充颜色</span>
        <el-color-picker v-model="measurementAreaFillColour" @change="setMeasurementAreaFillColour" show-alpha />
      </el-row>
      <el-row>
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">文本颜色</span>
        <el-color-picker v-model="nameColour" @change="setNameColour" show-alpha />
      </el-row>
      <el-row>
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">背景颜色</span>
        <el-color-picker v-model="backColour" @change="setBackColour" show-alpha />
      </el-row>
    </el-collapse-item>
  </el-collapse>
  <el-collapse v-model="activeNamesColor">
    <el-collapse-item title="附加属性" name="1">
      <el-row>
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">将摄像机附着在模型</span>
        <el-switch v-model="attachModelUrlAble" @change="isSaveAttachModel" />
      </el-row>
      <el-row v-show="attachModelUrlAble">
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">附加模型地址(网络路径)</span>
        <div class="row-div">
          <el-input
            v-model="attachModelUrl"
            @keyup.enter.native="modifyAttachModelUrl"
            :disabled="!attachModelUrlAble"
            class="w-50 m-2"
            placeholder="附加模型地址"
            @keydown.stop
          />
          <el-tooltip class="box-item" effect="dark" content="enter键结束输入" placement="top-start">
            <el-icon><Edit @click="reNameTheAttachModel" /></el-icon>
          </el-tooltip>
        </div>
      </el-row>
      <el-row v-show="attachModelUrlAble">
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">附加模型速度</span>
        <el-slider v-model="attachModelSpeed" @change="setAttachModelSpeed" :min="1" :max="500" :step="0.1" />
      </el-row>
    </el-collapse-item>
  </el-collapse>
</template>
<script lang="ts" setup>
import { PropType, ref, onMounted, watch, computed } from "vue"
import * as udStream from "@/udStream/udStream"
import { ProjectNode, NodeGeometryType, Point } from "@/udStream/types/ProjectNode"
import { Edit } from "@element-plus/icons-vue"
import { useUdstreamStore } from "@/store/modules/udstreamStore"

const props = defineProps({
  optionData: {
    type: Object as PropType<ProjectNode>,
    required: true
  }
})

const measureName = ref(props.optionData.name)
const measureAble = ref(true)

const udstreamStore = useUdstreamStore()

const settings = computed(() => {
  return udstreamStore.getUdstreamSetting
})

const activeNamesPoint = ref("1")
const activeNamesShow = ref("1")
const activeNamesColor = ref("1")
const measureTitle = ref("测量配置")
const showAreaFillColour = ref(false)
const showLength = ref(false) //显示长度
const showAllLengths = ref(false) //显示所有长度
const showAngles = ref(false) //显示角度
const showArea = ref(false) //显示区域
const lineClosed = ref(false) //闭合多边形
const lineWidth = ref(1) //直线宽度
const lineMode = ref("Screen Line") //线朝向

const attachModelSpeed = ref(0)
const attachModelUrl = ref("")
const attachModelUrlAble = ref(true) //是否可以编辑状态

const lineModeItems = [
  {
    label: "屏幕线",
    value: "Screen Line"
  },
  {
    label: "垂直/栅栏",
    value: "Fence"
  },
  {
    label: "水平/路径",
    value: "Flat"
  }
]
const lineStyle = ref("Glow")
const lineStyleItems = [
  {
    label: "箭头",
    value: "Arrow"
  },
  {
    label: "发光",
    value: "Glow"
  },
  {
    label: "实线",
    value: "Solid"
  },
  {
    label: "对角线",
    value: "Diagonal"
  }
]

const lineColourPrimary = ref("rgba(255, 255, 0, 1)") //直线颜色1
const lineColourSecondary = ref("rgba(255, 255, 255, 1)") //直线颜色2
const measurementAreaFillColour = ref("rgba(104, 50, 104, 1)") //填充颜色
const nameColour = ref("rgba(255, 255, 255, 1)") //文本颜色
const backColour = ref("rgba(27, 27, 27, 0.7)") //背景颜色
// const lineModeItems = ref(null)

const selectedPoint = ref(1)
const pointList = ref([])
const pointsLen = ref(0)
const currentPoint = ref({
  x: 0,
  y: 0,
  z: 0
})

//当前的节点信息
let currentUdstreamNode = props.optionData

const setShowLength = (value: boolean) => {
  currentUdstreamNode.SetMetadataBool("showLength", value)
}

const setShowAllLengths = (value: boolean) => {
  currentUdstreamNode.SetMetadataBool("showAllLengths", value)
}

const setShowAngles = (value: boolean) => {
  currentUdstreamNode.SetMetadataBool("showAngles", value)
}

const setShowArea = (value: boolean) => {
  currentUdstreamNode.SetMetadataBool("showArea", value)
}

const setLineClosed = (value: boolean) => {
  currentUdstreamNode.UpdateNodeGeometryFromCartesian(
    pointList.value,
    value ? NodeGeometryType.Polygon : NodeGeometryType.LineString
  )
}

const setLineWidth = (width: number) => {
  currentUdstreamNode.SetMetadataDouble("lineWidth", width)
}

//改变线朝向
const setLineMode = (mode: string) => {
  currentUdstreamNode.SetMetadataString("lineMode", mode)
}

//改变线风格
const setLineStyle = (style: string) => {
  currentUdstreamNode.SetMetadataString("lineStyle", style)
}

//设置直线颜色1
const setLineColourPrimary = (value: string) => {
  lineColourPrimary.value = value
  if (value) {
    const matchRGBA = value.match(/(\d(\.\d+)?)+/g)
    if (matchRGBA) {
      const arr = [
        parseFloat(matchRGBA[0]) / 255,
        parseFloat(matchRGBA[1]) / 255,
        parseFloat(matchRGBA[2]) / 255,
        parseFloat(matchRGBA[2])
      ]
      const colour = BRGAToU32(arr)
      currentUdstreamNode.SetMetadataUint("lineColourPrimary", colour)
    }
  }
}
//设置直线颜色2
const setLineColourSecondary = (value: string) => {
  lineColourSecondary.value = value
  if (value) {
    const matchRGBA = value.match(/(\d(\.\d+)?)+/g)
    if (matchRGBA) {
      const arr = [
        parseFloat(matchRGBA[0]) / 255,
        parseFloat(matchRGBA[1]) / 255,
        parseFloat(matchRGBA[2]) / 255,
        parseFloat(matchRGBA[2])
      ]
      const colour = BRGAToU32(arr)
      currentUdstreamNode.SetMetadataUint("lineColourSecondary", colour)
    }
  }
}

//设置填充颜色
const setMeasurementAreaFillColour = (value: string) => {
  measurementAreaFillColour.value = value
  if (value) {
    const matchRGBA = value.match(/(\d(\.\d+)?)+/g)
    if (matchRGBA) {
      const arr = [
        parseFloat(matchRGBA[0]) / 255,
        parseFloat(matchRGBA[1]) / 255,
        parseFloat(matchRGBA[2]) / 255,
        parseFloat(matchRGBA[2])
      ]
      const colour = BRGAToU32(arr)
      currentUdstreamNode.SetMetadataUint("measurementAreaFillColour", colour)
    }
  }
}

//设置文本颜色
const setNameColour = (value: string) => {
  nameColour.value = value
  if (value) {
    const matchRGBA = value.match(/(\d(\.\d+)?)+/g)
    if (matchRGBA) {
      const arr = [
        parseFloat(matchRGBA[0]) / 255,
        parseFloat(matchRGBA[1]) / 255,
        parseFloat(matchRGBA[2]) / 255,
        parseFloat(matchRGBA[2])
      ]
      const colour = BRGAToU32(arr)
      currentUdstreamNode.SetMetadataUint("nameColour", colour)
    }
  }
}

//设置背景颜色
const setBackColour = (value: string) => {
  backColour.value = value
  if (value) {
    const matchRGBA = value.match(/(\d(\.\d+)?)+/g)
    if (matchRGBA) {
      const arr = [
        parseFloat(matchRGBA[0]) / 255,
        parseFloat(matchRGBA[1]) / 255,
        parseFloat(matchRGBA[2]) / 255,
        parseFloat(matchRGBA[2])
      ]
      const colour = BRGAToU32(arr)
      currentUdstreamNode.SetMetadataUint("backColour", colour)
    }
  }
}

//设置附加模型的速度（如果有附加模型的话）
const setAttachModelSpeed = (value: number) => {
  currentUdstreamNode.SetMetadataDouble("attachmentSpeed", value)
}

//当前的坐标点发生改变
const currentPointChange = (index: number) => {
  currentPoint.value = pointList.value[index - 1]
}

//设置当前的坐标点位
const setFrame = async () => {
  await udStream.setSceneItemSubItem(currentUdstreamNode, selectedPoint.value)
}

const BRGAToU32 = (bgra: number[]) => {
  let i = 0
  i |= (bgra[2] * 255) << 0
  i |= (bgra[1] * 255) << 8
  i |= (bgra[0] * 255) << 16
  i |= (bgra[3] * 255) << 24
  return i
}

const RGBA2RGBASTRING = (rgba: number[]) => {
  if (rgba.length === 4) {
    const R = rgba[0] * 255
    const G = rgba[1] * 255
    const B = rgba[2] * 255
    const A = rgba[3]
    return `rgba(${R}, ${G}, ${B}, ${A})`
  }
  return "rgba(255, 255, 255, 1)"
}

//更新点位
const updateGeometry = () => {
  currentUdstreamNode.UpdateNodeGeometryFromCartesian(pointList.value)
}

const update = () => {
  currentUdstreamNode = props.optionData
  measureName.value = props.optionData.name
  measureAble.value = true
  if (currentUdstreamNode.geomtype == 5) {
    showAreaFillColour.value = true
    measureTitle.value = "面积测量配置"
  }
  currentUdstreamNode.FetchNodeGeometryAsCartesian().then((points: Point[]) => {
    pointsLen.value = points.length
    pointList.value = points as any
    currentPoint.value = points[0]
  })
  lineClosed.value = currentUdstreamNode.geomtype == NodeGeometryType.Polygon
  showLength.value = currentUdstreamNode.GetMetadataBool("showLength", false)
  showAllLengths.value = currentUdstreamNode.GetMetadataBool("showAllLengths", false)
  showAngles.value = currentUdstreamNode.GetMetadataBool("showAngles", false)
  showArea.value = currentUdstreamNode.GetMetadataBool("showArea", false)
  // showFill.value = currentUdstreamNode.GetMetadataBool("showFill", false)
  // extrusion.value = currentUdstreamNode.GetMetadataDouble("extrusion", 0)
  lineWidth.value = currentUdstreamNode.GetMetadataDouble("lineWidth", settings.value.tools.line.width)
  // lineMode.value = currentUdstreamNode.GetMetadataString(
  //   "lineMode",
  //   lineModeItems[settings.value.tools.line.fenceMode].value
  // )

  lineMode.value = currentUdstreamNode.GetMetadataString(
    "lineMode",
    lineModeItems[settings.value.tools.line.fenceMode].value
  )
  // lineStyle.value = currentUdstreamNode.GetMetadataString("lineStyle", this.lineStyleItems[this.settings.tools.line.style].value)

  // nameColour.value = currentUdstreamNode.GetMetadataUint("nameColour", BRGAToU32(settings.value.tools.label.textColour))
  // backColour.value = currentUdstreamNode.GetMetadataUint(
  //   "backColour",
  //   BRGAToU32(settings.value.tools.label.backgroundColour)
  // )
  // lineColourPrimary.value = currentUdstreamNode.GetMetadataUint(
  //   "lineColourPrimary",
  //   BRGAToU32(settings.value.tools.line.colour)
  // )
  // lineColourSecondary.value = currentUdstreamNode.GetMetadataUint("lineColourSecondary", 0xffffffff)

  nameColour.value = RGBA2RGBASTRING(settings.value.tools.label.textColour)
  backColour.value = RGBA2RGBASTRING(settings.value.tools.label.backgroundColour)
  lineColourPrimary.value = RGBA2RGBASTRING(settings.value.tools.line.colour)
  lineColourSecondary.value = RGBA2RGBASTRING([1, 1, 1, 1])

  //获取附加模型的速度
  const attachUrl = currentUdstreamNode.GetMetadataString("attachmentURI", "")
  attachModelUrl.value = attachUrl
  if (attachUrl) {
    attachModelUrlAble.value = true
  } else {
    attachModelUrlAble.value = false
  }

  attachModelSpeed.value = currentUdstreamNode.GetMetadataDouble("attachmentSpeed", 0)

  // measurementAreaFillColour.value = currentUdstreamNode.GetMetadataUint(
  //   "measurementAreaFillColour",
  //   BRGAToU32(settings.value.tools.fill.colour)
  // )
  // viewportMask.value = currentUdstreamNode.GetMetadataInt("visibility.viewportMask", 0xffffffff)
  // description.value = currentUdstreamNode.GetMetadataString("description", "")
}

//修改标注的名称
const reNameTheConfig = () => {
  measureAble.value = false
}

//enter键修改
const modifyInputName = (eve: KeyboardEvent) => {
  if (eve.target) {
    let targetName = eve.target.value
    props.optionData.name = targetName
    measureName.value = targetName
  }
  measureAble.value = true
}

const stopKeyDownEvent = (event: KeyboardEvent) => {}

//是否保存附加模型
const isSaveAttachModel = (isSave: boolean) => {
  if (!isSave) {
    currentUdstreamNode.SetMetadataString("attachmentURI", "") //将模型地址置为空
  }
}

//是否可以修改附加模型的地址
const reNameTheAttachModel = () => {
  attachModelUrlAble.value = true
}

//修改附加模型的地址
const modifyAttachModelUrl = (eve: KeyboardEvent) => {
  if (eve.target) {
    let targetName = eve.target.value
    currentUdstreamNode.SetMetadataString("attachmentURI", targetName)
  }
  attachModelUrlAble.value = false
}

onMounted(() => {
  update()
})

//监听
watch(
  () => selectedPoint,
  (nv, ov) => {
    if (nv) {
      setFrame()
    }
  }
)

watch(
  () => props.optionData,
  (nv, ov) => {
    if (nv) {
      update()
    }
  },
  {
    deep: true
  }
)

// watch(
//   () => currentUdstreamNode.lastUpdate,
//   (nv, ov) => {
//     if (nv) {
//       update()
//     }
//   }
// )
</script>
<style scoped>
.row-div {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
</style>
