<template>
  <div>标记集配置</div>
  <el-collapse v-model="activeNamesPoint">
    <el-collapse-item title="点位属性" name="1">
      <el-row>
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">名称</span>
        <div class="row-div">
          <el-input
            v-model="labelCollectName"
            @keyup.enter.native="modifyInputName"
            :disabled="labelCollectAble"
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
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">点标注</span>
        <div class="row-div">
          <el-input
            v-model="currentPointName"
            @keyup.enter.native="modifyInputSignalName"
            :disabled="currentLabelAble"
            class="w-50 m-2"
            placeholder="名称"
            @keydown.stop
          />
          <el-tooltip class="box-item" effect="dark" content="enter键结束输入" placement="top-start">
            <el-icon><Edit @click="reNameTheSingalConfig" /></el-icon>
          </el-tooltip>
        </div>
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
      <el-row>
        <el-button type="primary" @click="move2CurrentPoint">移到位置{{ selectPointIndex }}</el-button>
        <el-popconfirm
          confirm-button-text="确定"
          cancel-button-text="取消"
          icon-color="#626AEF"
          title="确认删除此单个标注吗?"
          @confirm="deleteTheCurrentPoint"
        >
          <template #reference>
            <el-button type="danger" plain>删除该标注</el-button>
          </template>
        </el-popconfirm>
      </el-row>
    </el-collapse-item>
  </el-collapse>
  <el-collapse v-model="activeSymbolShow">
    <el-collapse-item title="图钉属性" name="1">
      <el-switch v-model="pinSwitchValue" active-text="自定义图标" inactive-text="内置图标" />
      <el-row v-show="pinSwitchValue">
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">图钉图片URL</span>
        <div class="row-div">
          <el-input
            v-model="pinUrlValue"
            @keyup.enter.native="modifyPinUrlInputName"
            :disabled="pinAble"
            class="w-50 m-2"
            placeholder="自定义图标"
          />
          <el-tooltip class="box-item" effect="dark" content="enter键结束输入" placement="top-start">
            <el-icon><Edit @click="modifyPinAble" /></el-icon>
          </el-tooltip>
        </div>
      </el-row>
      <el-row v-show="!pinSwitchValue">
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">图钉内置图标</span>
        <div class="map-list">
          <div class="map-list-item" v-for="item in built_in_Pin" :key="item.url" @click="selectPinItem(item)">
            <input
              class="map-list-radio"
              type="radio"
              :id="item.id"
              name="selectMap"
              :checked="item.url == selectPinValue"
            />
            <label class="label-item" :for="item.id">
              <img class="label-img" :src="item.url" />
              <span class="radio-label-txt">{{ item.label }}</span>
            </label>
          </div>
        </div>
      </el-row>
      <el-row>
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">图钉显示距离</span>
        <el-slider v-model="pinHeight" @change="setPinHeight" :min="0" :max="1000000" :step="1" />
      </el-row>
    </el-collapse-item>
  </el-collapse>

  <el-collapse v-model="activeModelShow">
    <el-collapse-item title="模型属性" name="1">
      <el-row>
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">模型URL</span>
        <div class="row-div">
          <el-input
            v-model="attachModelUrl"
            @keyup.enter.native="modifyModelUrlInputName"
            :disabled="attachModelAble"
            class="w-50 m-2"
            placeholder="模型URL"
          />
          <el-tooltip class="box-item" effect="dark" content="enter键结束输入" placement="top-start">
            <el-icon><Edit @click="modifyModelUrlAble" /></el-icon>
          </el-tooltip>
        </div>
      </el-row>
      <span class="ml-3 w-35 text-gray-400 inline-flex items-center">模型位置</span>
      <el-row>
        <span class="ml-3 w-2 text-gray-400 inline-flex items-center">X</span>
        <el-input-number
          v-model="modelTransform.offset.x"
          @change="setModelOffset('X')"
          class="w-50 m-2"
          placeholder="X坐标"
        />
      </el-row>
      <el-row>
        <span class="ml-3 w-2 text-gray-400 inline-flex items-center">Y</span>
        <el-input-number
          v-model="modelTransform.offset.y"
          @change="setModelOffset('Y')"
          class="w-50 m-2"
          placeholder="Y坐标"
        />
      </el-row>
      <el-row>
        <span class="ml-3 w-2 text-gray-400 inline-flex items-center">Z</span>
        <el-input-number
          v-model="modelTransform.offset.z"
          @change="setModelOffset('Z')"
          class="w-50 m-2"
          placeholder="Z坐标"
        />
      </el-row>
      <el-divider />
      <span class="ml-3 w-35 text-gray-400 inline-flex items-center">模型旋转</span>
      <el-row>
        <span class="ml-3 w-2 text-gray-400 inline-flex items-center">X</span>
        <el-input-number
          v-model="modelTransform.rotation.x"
          @change="setModelRotation('X')"
          class="w-50 m-2"
          placeholder="Y旋转"
        />
      </el-row>
      <el-row>
        <span class="ml-3 w-2 text-gray-400 inline-flex items-center">Y</span>
        <el-input-number
          v-model="modelTransform.rotation.y"
          @change="setModelRotation('Y')"
          class="w-50 m-2"
          placeholder="P旋转"
        />
      </el-row>
      <el-divider />
      <span class="ml-3 w-35 text-gray-400 inline-flex items-center">模型规模</span>
      <el-row>
        <span class="ml-3 w-2 text-gray-400 inline-flex items-center">X</span>
        <el-input-number
          v-model="modelTransform.scale.x"
          @change="setModelScale('X')"
          class="w-50 m-2"
          placeholder="Y旋转"
        />
      </el-row>
      <el-row>
        <span class="ml-3 w-2 text-gray-400 inline-flex items-center">Y</span>
        <el-input-number
          v-model="modelTransform.scale.y"
          @change="setModelScale('Y')"
          class="w-50 m-2"
          placeholder="P旋转"
        />
      </el-row>
      <el-row>
        <span class="ml-3 w-2 text-gray-400 inline-flex items-center">Z</span>
        <el-input-number
          v-model="modelTransform.scale.z"
          @change="setModelScale('Z')"
          class="w-50 m-2"
          placeholder="R旋转"
        />
      </el-row>
    </el-collapse-item>
  </el-collapse>
  <el-collapse v-model="activeNamesShow">
    <el-collapse-item title="可视属性" name="1">
      <el-row>
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">显示标签</span>
        <el-switch v-model="showLabels" @change="setLabelsShow" />
      </el-row>
      <el-row>
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">显示线</span>
        <el-switch v-model="showLines" @change="setLinesShow" />
      </el-row>
      <el-row>
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">标签高度</span>
        <el-slider v-model="labelHeight" @change="setLineWidth" :min="0" :max="2000" :step="1" />
      </el-row>
    </el-collapse-item>
  </el-collapse>
  <el-collapse v-model="activeNamesColor">
    <el-collapse-item title="颜色属性" name="1">
      <el-row>
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">背景颜色</span>
        <el-color-picker v-model="backColour" @change="setBackColour" show-alpha />
      </el-row>
      <el-row>
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">文本颜色</span>
        <el-color-picker v-model="nameColour" @change="setNameColour" show-alpha />
      </el-row>
      <el-row>
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">线条颜色</span>
        <el-color-picker v-model="lineColourSecondary" @change="setLineColourSecondary" show-alpha />
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

const labelCollectName = ref(props.optionData.name)
const labelCollectAble = ref(true)

const pinSwitchValue = ref(true) // 自定义图标与默认图标的切换

const pinAble = ref(true) //图钉URL是否可以编辑
const pinUrlValue = ref("") //图钉URL的地址

const attachModelUrl = ref("") //模型的地址 用于显示
const attachModelAble = ref(true) //模型的地址是否可以编辑
const selectPointIndex = ref(1)

//模型的矩阵  包括了  位置   旋转  缩放
const modelTransform = ref({
  offset: {
    x: 0,
    y: 0,
    z: 0
  },
  rotation: {
    x: 0,
    y: 0
  },
  scale: {
    x: 0,
    y: 0,
    z: 0
  }
})

const labelSingleName = ref("")
const labelSingleAble = ref(true)

const udstreamStore = useUdstreamStore()

const settings = computed(() => {
  return udstreamStore.getUdstreamSetting
})

//图钉的可显示的高度
const pinHeight = ref(5000)
//选择的Pin的值
const selectPinValue = ref("")
//内置的图钉
const built_in_Pin = [
  {
    id: "pin1",
    url: "./assets/pins/airplane.png",
    label: "飞机"
  },
  {
    id: "pin2",
    url: "./assets/pins/bus.png",
    label: "公交车"
  },
  {
    id: "pin3",
    url: "./assets/pins/ferry.png",
    label: "渡船"
  },
  {
    id: "pin4",
    url: "./assets/pins/helicopter.png",
    label: "直升机"
  },
  {
    id: "pin5",
    url: "./assets/pins/map-marker.png",
    label: "地点"
  },
  {
    id: "pin6",
    url: "./assets/pins/map-marker-account.png",
    label: "地点集"
  },
  {
    id: "pin7",
    url: "./assets/pins/map-marker-alert.png",
    label: "警告"
  },
  {
    id: "pin8",
    url: "./assets/pins/map-marker-check.png",
    label: "通过"
  },
  {
    id: "pin9",
    url: "./assets/pins/weather-cloudy.png",
    label: "阴天"
  },
  {
    id: "pin10",
    url: "./assets/pins/weather-fog.png",
    label: "雾"
  },
  {
    id: "pin11",
    url: "./assets/pins/weather-lightning.png",
    label: "雷"
  },
  {
    id: "pin12",
    url: "./assets/pins/weather-windy.png",
    label: "风"
  },
  {
    id: "pin12",
    url: "./assets/pins/weather-sunny.png",
    label: "晴天"
  },
  {
    id: "pin13",
    url: "./assets/pins/weather-snowy-rainy.png",
    label: "雨加雪"
  },
  {
    id: "pin14",
    url: "./assets/pins/weather-rainy.png",
    label: "雨"
  },
  {
    id: "pin15",
    url: "./assets/pins/weather-night.png",
    label: "夜晚"
  }
]

const labelHeight = ref(1) //标注的高度
const showLabels = ref(true) //是否显示标注
const showLines = ref(true) //是否显示线
const activeNamesPoint = ref("1")
const activeNamesShow = ref("1")
const activeNamesColor = ref("1")
const activeSymbolShow = ref("1")
const activeModelShow = ref("2")

const lineColourSecondary = ref("rgba(255, 255, 255, 1)") //直线颜色2
const nameColour = ref("rgba(255, 255, 255, 1)") //文本颜色
const backColour = ref("rgba(27, 27, 27, 0.7)") //背景颜色

const selectedPoint = ref(1)
const pointList = ref([])
const pointsLen = ref(0)
const currentPoint = ref({
  x: 0,
  y: 0,
  z: 0
})

const currentPointName = ref("")
const currentLabelAble = ref(true)

//位置参数
const modelPosition = ref({
  x: 0,
  y: 0,
  z: 0
})

//旋转参数
const modelRotation = ref({
  y: 0,
  p: 0,
  r: 0
})

//当前的节点信息
let currentUdstreamNode = props.optionData

const setLabelsShow = (value: boolean) => {
  currentUdstreamNode.SetMetadataBool("labelShown", value)
}

const setLinesShow = (value: boolean) => {
  currentUdstreamNode.SetMetadataBool("linesShown", value)
}

const setLineWidth = (height: number) => {
  currentUdstreamNode.SetMetadataDouble("labelHeight", height)
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
      currentUdstreamNode.SetMetadataUint("lineColour", colour)
    }
  }
}

//将十六进制的颜色换成rgba
const six2RGBA = (hexColor: string) => {
  const r = (hexColor >> 16) & 0xff
  const g = (hexColor >> 8) & 0xff
  const b = hexColor & 0xff
  const alpha = 1.0 // 透明度为1，即完全不透明
  const rgbaColor = `rgba(${r}, ${g}, ${b}, ${alpha})`
  return rgbaColor
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
      currentUdstreamNode.SetMetadataUint("textColour", colour)
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

//当前的坐标点发生改变
const currentPointChange = (index: number) => {
  selectPointIndex.value = index
  currentPoint.value = pointList.value[index - 1]
  currentPointName.value = currentUdstreamNode.GetMetadataString(`places[${index - 1}].name`, "")
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

//移动到该单个点
const move2CurrentPoint = () => {
  udStream.placeLayerMoveToLocation(currentUdstreamNode, selectPointIndex.value - 1)
}

//删除该单个标注
const deleteTheCurrentPoint = () => {
  udStream.placeLayerRemoveLocation(currentUdstreamNode, selectPointIndex.value - 1)
}

//取消删除
const cancelDeleteEvent = () => {}

//更新点位
const updateGeometry = () => {
  currentUdstreamNode.UpdateNodeGeometryFromCartesian(pointList.value)
}

//设置模型位置
const setPosition = () => {
  currentUdstreamNode.UpdateNodeGeometryFromCartesian([
    { x: position.value.x, y: position.value.y, z: position.value.z }
  ])
}

//设置模型的旋转
const setModelOffset = (params: string) => {
  console.log(params)
  console.log(modelTransform.value)

  // if (params == "X") {
  //   currentUdstreamNode.SetMetadataDouble("modelTransform.offset.x", modelTransform.value.offset.x)
  // } else if (params == "Y") {
  //   currentUdstreamNode.SetMetadataDouble("modelTransform.offset.y", modelTransform.value.offset.y)
  // } else if (params == "Z") {
  //   currentUdstreamNode.SetMetadataDouble("modelTransform.offset.z", modelTransform.value.offset.z)
  // }

  currentUdstreamNode.SetMetadataDouble("modelTransform.offset.x", modelTransform.value.offset.x)
  currentUdstreamNode.SetMetadataDouble("modelTransform.offset.y", modelTransform.value.offset.y)
  currentUdstreamNode.SetMetadataDouble("modelTransform.offset.z", modelTransform.value.offset.z)
}

const setModelRotation = (params: string) => {
  if (params == "X") {
    currentUdstreamNode.SetMetadataDouble("modelTransform.rotation.x", modelTransform.value.rotation.x)
  } else if (params == "Y") {
    currentUdstreamNode.SetMetadataDouble("modelTransform.rotation.y", modelTransform.value.rotation.y)
  }
}

const setModelScale = (params: string) => {
  if (params == "X") {
    currentUdstreamNode.SetMetadataDouble("modelTransform.scale.x", modelTransform.value.scale.x)
  } else if (params == "Y") {
    currentUdstreamNode.SetMetadataDouble("modelTransform.scale.y", modelTransform.value.scale.y)
  } else if (params == "Z") {
    currentUdstreamNode.SetMetadataDouble("modelTransform.scale.z", modelTransform.value.scale.z)
  }
}

const update = () => {
  currentUdstreamNode = props.optionData
  labelCollectName.value = props.optionData.name //标注集合名称
  labelCollectAble.value = true //标注集合是否可编辑

  currentUdstreamNode.FetchNodeGeometryAsCartesian().then((points: Point[]) => {
    if (points && points?.length) {
      pointsLen.value = points.length
      pointList.value = points as any
      currentPoint.value = points[0]
    }
  })

  currentPointName.value = currentUdstreamNode.GetMetadataString(`places[0].name`, "")
  showLabels.value = currentUdstreamNode.GetMetadataBool("labelShown", true) //是否显示标注
  showLines.value = currentUdstreamNode.GetMetadataBool("linesShown", true) //是否显示线段
  labelHeight.value = currentUdstreamNode.GetMetadataDouble("labelHeight", 200.0)
  const backColourValue = currentUdstreamNode.GetMetadataUint("backColour", 0xff000000) // ARGB
  backColour.value = six2RGBA(backColourValue)
  const nameColourValue = currentUdstreamNode.GetMetadataUint("textColour", 0xffffffff)
  nameColour.value = six2RGBA(nameColourValue)
  const lineColourSecondaryValue = currentUdstreamNode.GetMetadataUint("lineColour", 0xffffffff)
  lineColourSecondary.value = six2RGBA(lineColourSecondaryValue)
  //如果有附带的图标与模型
  pinUrlValue.value = currentUdstreamNode.GetMetadataString("pin", "")
  if (pinUrlValue.value) {
    pinSwitchValue.value = true
  } else {
    pinSwitchValue.value = false
  }
  pinHeight.value = currentUdstreamNode.GetMetadataDouble("pinDistance", 6000000.0) //图钉的可显示高度
  attachModelUrl.value = currentUdstreamNode.GetMetadataString("modelURL", "")
  modelTransform.value = {
    offset: {
      x: currentUdstreamNode.GetMetadataDouble("modelTransform.offset.x", 0.0),
      y: currentUdstreamNode.GetMetadataDouble("modelTransform.offset.y", 0.0),
      z: currentUdstreamNode.GetMetadataDouble("modelTransform.offset.z", 0.0)
    },
    rotation: {
      x: currentUdstreamNode.GetMetadataDouble("modelTransform.rotation.x", 0.0),
      y: currentUdstreamNode.GetMetadataDouble("modelTransform.rotation.y", 0.0)
    },
    scale: {
      x: currentUdstreamNode.GetMetadataDouble("modelTransform.scale.x", 1.0),
      y: currentUdstreamNode.GetMetadataDouble("modelTransform.scale.y", 1.0),
      z: currentUdstreamNode.GetMetadataDouble("modelTransform.scale.z", 1.0)
    }
  }
}

//修改标注的名称
const reNameTheConfig = () => {
  labelCollectAble.value = false
}

//enter键修改
const modifyInputName = (eve: KeyboardEvent) => {
  if (eve.target) {
    let targetName = eve.target.value
    props.optionData.name = targetName
    labelCollectName.value = targetName
  }
  labelCollectAble.value = true
}

const stopKeyDownEvent = (event: KeyboardEvent) => {}

//修改图钉的可编辑状态
const modifyPinAble = () => {
  pinAble.value = !pinAble.value
}

//enter键修改图钉的URL地址
const modifyPinUrlInputName = (eve: KeyboardEvent) => {
  if (eve.target) {
    let targetName = eve.target.value
    currentUdstreamNode.SetMetadataString("pin", targetName)
  }
  pinAble.value = true
}

//设置图钉
const selectPinItem = (params: any) => {
  let targetUrl = params.url
  if (targetUrl) {
    currentUdstreamNode.SetMetadataString("pin", targetUrl)
  }
}

//设置图钉的显示距离
const setPinHeight = (distance: number) => {
  console.log(distance)
  currentUdstreamNode.SetMetadataDouble("pinDistance", distance)
}

//模型地址进入可编辑状态
const modifyModelUrlAble = () => {
  attachModelAble.value = !attachModelAble.value
}

//enter键开始修改模型
const modifyModelUrlInputName = (eve: KeyboardEvent) => {
  if (eve.target) {
    let targetName = eve.target.value
    console.log(targetName)
    currentUdstreamNode.SetMetadataString("modelURL", targetName)
  }
  attachModelAble.value = true
}

//修改单个的标注
const modifyInputSignalName = (eve: KeyboardEvent) => {
  if (eve.target) {
    let targetName = eve.target.value
    currentUdstreamNode.SetMetadataString(`places[${selectPointIndex.value - 1}].name`, targetName)
    currentPointName.value = targetName
  }
  currentLabelAble.value = true
}

const reNameTheSingalConfig = () => {
  currentLabelAble.value = false
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
</script>
<style scoped>
.row-div {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.map-list {
  width: 100%;
  display: grid;
  grid-template-columns: 25% 25% 25% 25%;
}
.map-list-item {
  text-align: center;
}
.map-list-radio {
  display: none;
}

.map-list-radio + label {
  display: inline-block;
}

.map-list-radio + label :hover {
  cursor: pointer;
}

.map-list-radio:checked + label {
  color: #05a6ca;
}
.label-item {
  display: inline-block;
}
.label-img {
  /* width: 80px;
  height: 80px; */
}
.radio-label-txt {
  display: block;
}
</style>
