<template>
  <div>标注配置</div>
  <el-collapse v-model="activeNamesBase">
    <el-collapse-item title="基本属性" name="1">
      <el-row>
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">标注名称</span>
        <div class="row-div">
          <el-input
            v-model="labelName"
            class="w-50 m-2"
            @keyup.enter.native="modifyInputName"
            :disabled="pointDisabled"
            placeholder="标注名称"
            @keydown.stop
          />
          <el-tooltip class="box-item" effect="dark" content="enter键结束输入" placement="top-start">
            <el-icon><Edit @click="reNameTheConfig" /></el-icon>
          </el-tooltip>
        </div>
      </el-row>
      <el-row>
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">文本颜色</span>
        <el-color-picker v-model="selectHighlightTxTColor" @change="selectLabelTxtColorHandle" show-alpha />
      </el-row>
      <el-row>
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">背景颜色</span>
        <el-color-picker v-model="selectHighlightBgColor" @change="selectLabelTxtBgColorHandle" show-alpha />
      </el-row>
      <el-row>
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">更换图标</span>
        <el-switch v-model="pinSwitchValue" @change="pinSwitchValueChange" />
      </el-row>
      <el-row v-show="pinSwitchValue">
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
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">标注可见</span>
        <el-switch v-model="optionData.isVisible" @change="switchVisible" />
      </el-row>
    </el-collapse-item>
  </el-collapse>
</template>
<script lang="ts" setup>
import { PropType, ref, computed, onMounted, watch } from "vue"
import { ProjectNode } from "@/udStream/types/ProjectNode"
import { Edit } from "@element-plus/icons-vue"
import { useUdstreamStore } from "@/store/modules/udstreamStore"
const props = defineProps({
  optionData: {
    type: Object as PropType<ProjectNode>,
    required: true
  }
})

//当前树节点
let currentUdstreamNode = props.optionData
const udstreamStore = useUdstreamStore()
const settings = computed(() => {
  return udstreamStore.getUdstreamSetting
})
const pinSwitchValue = ref(true) // 自定义图标与默认图标的切换
//选择的Pin的值
const selectPinValue = ref("")
//内置的图钉
const built_in_Pin = [
  {
    id: "pin1",
    url: "./assets/pins/airplane.png",
    label: "飞机",
    name: "airplane"
  },
  {
    id: "pin2",
    url: "./assets/pins/bus.png",
    label: "公交车",
    name: "bus"
  },
  {
    id: "pin3",
    url: "./assets/pins/ferry.png",
    label: "渡船",
    name: "ferry"
  },
  {
    id: "pin4",
    url: "./assets/pins/helicopter.png",
    label: "直升机",
    name: "helicopter"
  },
  {
    id: "pin5",
    url: "./assets/pins/map-marker.png",
    label: "地点",
    name: "map-marker"
  },
  {
    id: "pin6",
    url: "./assets/pins/map-marker-account.png",
    label: "地点集"
  },
  {
    id: "pin7",
    url: "./assets/pins/map-marker-alert.png",
    label: "警告",
    name: "map-marker-alert"
  },
  {
    id: "pin8",
    url: "./assets/pins/map-marker-check.png",
    label: "通过"
  },
  {
    id: "pin9",
    url: "./assets/pins/weather-cloudy.png",
    label: "阴天",
    name: "weather-cloudy"
  },
  {
    id: "pin10",
    url: "./assets/pins/weather-fog.png",
    label: "雾",
    name: "weather-fog"
  },
  {
    id: "pin11",
    url: "./assets/pins/weather-lightning.png",
    label: "雷",
    name: "weather-lightning"
  },
  {
    id: "pin12",
    url: "./assets/pins/weather-windy.png",
    label: "风",
    name: "weather-windy"
  },
  {
    id: "pin12",
    url: "./assets/pins/weather-sunny.png",
    label: "晴天",
    name: "weather-sunny"
  },
  {
    id: "pin13",
    url: "./assets/pins/weather-snowy-rainy.png",
    label: "雨加雪",
    name: "weather-snowy-rainy"
  },
  {
    id: "pin14",
    url: "./assets/pins/weather-rainy.png",
    label: "雨",
    name: "weather-rainy"
  },
  {
    id: "pin15",
    url: "./assets/pins/weather-night.png",
    label: "夜晚",
    name: "weather-night"
  }
]

//修改的名称
const labelName = ref(props.optionData.name)
const activeNamesBase = ref("1")
const pointDisabled = ref(true)
//高亮颜色
const selectHighlightTxTColor = ref("rgba(235, 240, 238, 1)")
const selectHighlightBgColor = ref("rgba(79, 87, 82, 0.8)")

const HexToU32 = function (hex: string) {
  if (hex.startsWith("#")) hex = hex.slice(1)
  const c = hex.match(/.{1,2}/g)
  let i = 0
  if (c != null) {
    i |= parseInt(c[2], 16) << 0
    i |= parseInt(c[1], 16) << 8
    i |= parseInt(c[0], 16) << 16
    i |= parseInt(c[3], 16) << 24
  }
  return i
}

const RGBAToHex = function (array: number[]) {
  return (
    "#" +
    array
      .map((x) =>
        Math.round(x * 255)
          .toString(16)
          .padStart(2, "0")
      )
      .join("")
      .toUpperCase()
  )
}

//文本颜色
const selectLabelTxtColorHandle = (value: string) => {
  if (value) {
    const matchRGBA = value.match(/(\d(\.\d+)?)+/g)
    if (matchRGBA) {
      const arr = [
        parseFloat(matchRGBA[0]) / 255,
        parseFloat(matchRGBA[1]) / 255,
        parseFloat(matchRGBA[2]) / 255,
        parseFloat(matchRGBA[2])
      ]
      const hexData = RGBAToHex(arr)
      const u32Data = HexToU32(hexData)
      currentUdstreamNode.SetMetadataUint("nameColour", u32Data)
    }
  }
}

//文本的背景颜色
const selectLabelTxtBgColorHandle = (value: string) => {
  if (value) {
    const matchRGBA = value.match(/(\d(\.\d+)?)+/g)
    if (matchRGBA) {
      const arr = [
        parseFloat(matchRGBA[0]) / 255,
        parseFloat(matchRGBA[1]) / 255,
        parseFloat(matchRGBA[2]) / 255,
        parseFloat(matchRGBA[2])
      ]
      const hexData = RGBAToHex(arr)
      const u32Data = HexToU32(hexData)
      currentUdstreamNode.SetMetadataUint("backColour", u32Data)
    }
  }
}

const BRGAToU32 = (bgra: number[]) => {
  let i = 0
  i |= (bgra[2] * 255) << 0
  i |= (bgra[1] * 255) << 8
  i |= (bgra[0] * 255) << 16
  i |= (bgra[3] * 255) << 24
  return i
}

// const RGBA2RGBASTRING = (rgba: number[]) => {
//   if (rgba.length === 4) {
//     const R = rgba[0] * 255
//     const G = rgba[1] * 255
//     const B = rgba[2] * 255
//     const A = rgba[3]
//     return `rgba(${R}, ${G}, ${B}, ${A})`
//   }
//   return "rgba(255, 255, 255, 1)"
// }

//将十六进制的颜色换成rgba
const six2RGBA = (hexColor: string) => {
  const r = (hexColor >> 16) & 0xff
  const g = (hexColor >> 8) & 0xff
  const b = hexColor & 0xff
  const alpha = 1.0 // 透明度为1，即完全不透明
  const rgbaColor = `rgba(${r}, ${g}, ${b}, ${alpha})`
  return rgbaColor
}

//更新参数值
const updateAttribute = () => {
  currentUdstreamNode = props.optionData
  labelName.value = props.optionData.name
  pointDisabled.value = true
  //相关的颜色属性
  // console.log('444444444',settings.value.tools.label.textColour)
  // console.log('666666666',settings.value.tools.label.backgroundColour)
  const nameColor = currentUdstreamNode.GetMetadataUint("nameColour", BRGAToU32(settings.value.tools.label.textColour))
  const bgColor = currentUdstreamNode.GetMetadataUint(
    "backColour",
    BRGAToU32(settings.value.tools.label.backgroundColour)
  )
  //是否使用引脚
  selectHighlightTxTColor.value = six2RGBA(nameColor)
  selectHighlightBgColor.value = six2RGBA(bgColor)
  pinSwitchValue.value = currentUdstreamNode.GetMetadataBool("usePin", false)
  selectPinValue.value = currentUdstreamNode.GetMetadataString("pin", "")
  // labelTxtColor.value = "rgba(236,141,76,1)"
  // labelTxtBgColor.value = "rgba(236,141,76,1)"
}

//设置可见性
const switchVisible = (val: boolean) => {
  currentUdstreamNode.isVisible = val
}

//修改标注的名称
const reNameTheConfig = () => {
  pointDisabled.value = false
}

//
const modifyInputName = (eve: KeyboardEvent) => {
  if (eve.target) {
    let targetName = eve.target.value
    props.optionData.name = targetName
    labelName.value = targetName
  }
  pointDisabled.value = true
}

const stopKeyDownEvent = (event: KeyboardEvent) => {}

//是否使用图标
const pinSwitchValueChange = (isShow: boolean) => {
  console.log(isShow)
  currentUdstreamNode.SetMetadataBool("usePin", isShow)
}

//设置图钉
const selectPinItem = (params: any) => {
  let targetUrl = params.name
  if (targetUrl) {
    console.log(params)
    currentUdstreamNode.SetMetadataString("pin", targetUrl)
  }
}

onMounted(() => {
  updateAttribute()
})

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
