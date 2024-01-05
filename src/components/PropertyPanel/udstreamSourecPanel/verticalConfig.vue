<template>
  <div>{{ measureTitle }}</div>
  <el-collapse v-model="activeNamesPoint">
    <el-collapse-item title="点位属性" name="1">
      <el-row>
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">名称</span>
        <div class="row-div" id="uuuuuuuuuu" >
          <el-input
            v-model="verticalName"
            @keyup.enter.native="modifyInputName"
            :disabled="verticalAble"
            class="w-50 m-2"
            placeholder="名称"
            ref="verticalNameRef"
            @keydown.stop
          />
          <el-tooltip class="box-item" effect="dark" content="enter键结束输入" placement="top-start">
            <el-icon><Edit @click="reNameTheConfig" /></el-icon>
          </el-tooltip>
        </div>
      </el-row>
      <div class="position-class">
        <div>位置1</div>
        <div>
          <el-row>
            <span class="ml-3 w-35 text-gray-400 inline-flex items-center">X坐标</span>
            <el-input v-model.number="pointList[0].x" class="w-50 m-2" @change="updateGeometry" placeholder="X坐标" />
          </el-row>
          <el-row>
            <span class="ml-3 w-35 text-gray-400 inline-flex items-center">Y坐标</span>
            <el-input v-model.number="pointList[0].y" class="w-50 m-2" @change="updateGeometry" placeholder="Y坐标" />
          </el-row>
          <el-row>
            <span class="ml-3 w-35 text-gray-400 inline-flex items-center">Z坐标</span>
            <el-input v-model.number="pointList[0].z" class="w-50 m-2" @change="updateGeometry" placeholder="Z坐标" />
          </el-row>
        </div>
      </div>
      <div class="position-class">
        <div>位置2</div>
        <div>
          <el-row>
            <span class="ml-3 w-35 text-gray-400 inline-flex items-center">X坐标</span>
            <el-input v-model.number="pointList[1].x" class="w-50 m-2" @change="updateGeometry" placeholder="X坐标" />
          </el-row>
          <el-row>
            <span class="ml-3 w-35 text-gray-400 inline-flex items-center">Y坐标</span>
            <el-input v-model.number="pointList[1].y" class="w-50 m-2" @change="updateGeometry" placeholder="Y坐标" />
          </el-row>
          <el-row>
            <span class="ml-3 w-35 text-gray-400 inline-flex items-center">Z坐标</span>
            <el-input v-model.number="pointList[1].z" class="w-50 m-2" @change="updateGeometry" placeholder="Z坐标" />
          </el-row>
        </div>
      </div>
    </el-collapse-item>
  </el-collapse>
  <el-collapse v-model="activeNamesShow">
    <el-collapse-item title="显示属性" name="1">
      <el-row>
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">显示所有距离</span>
        <el-switch v-model="showAllDistances" @change="setShowAllDistances" />
      </el-row>
      <el-row>
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">直线宽度</span>
        <el-slider v-model="lineWidth" @change="setLineWidth" :min="1" :max="10" :step="0.1" />
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
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">文本颜色</span>
        <el-color-picker v-model="nameColour" @change="setNameColour" show-alpha />
      </el-row>
      <el-row>
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">背景颜色</span>
        <el-color-picker v-model="backColour" @change="setBackColour" show-alpha />
      </el-row>
    </el-collapse-item>
  </el-collapse>
</template>
<script lang="ts" setup>
import { PropType, ref, onMounted, watch, computed } from "vue"
import * as udStream from "@/udStream/udStream"
import { ProjectNode, NodeGeometryType, Point } from "@/udStream/types/ProjectNode"
import { useUdstreamStore } from "@/store/modules/udstreamStore"
import { Edit } from "@element-plus/icons-vue"
const props = defineProps({
  optionData: {
    type: Object as PropType<ProjectNode>,
    required: true
  }
})

const verticalName = ref(props.optionData.name)
const verticalAble = ref(true)

const verticalNameRef = ref(null)

//当前的节点信息
let currentUdstreamNode = props.optionData

const udstreamStore = useUdstreamStore()
const settings = computed(() => {
  return udstreamStore.getUdstreamSetting
})

const pointList = ref([
  { x: 0, y: 0, z: 0 },
  { x: 0, y: 0, z: 0 }
]) //点位列表信息
const activeNamesPoint = ref("1")
const activeNamesShow = ref("1")
const activeNamesColor = ref("1")
const showAllDistances = ref(false)
const measureTitle = ref("垂直测距配置")
const lineWidth = ref(1) //直线宽度
const lineColourPrimary = ref("rgba(255, 255, 0, 1)") //直线颜色1
const nameColour = ref("rgba(255, 255, 255, 1)") //文本颜色
const backColour = ref("rgba(27, 27, 27, 0.7)") //背景颜色
const selectedPoint = ref(1)

const setLineWidth = (width: number) => {
  currentUdstreamNode.SetMetadataDouble("lineWidth", width)
}

//设置所有距离显示
const setShowAllDistances = (showAllDistances: boolean) => {
  currentUdstreamNode.SetMetadataBool("showAllDistances", showAllDistances)
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
      currentUdstreamNode.SetMetadataUint("lineColour", colour)
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
  verticalName.value = props.optionData.name
  verticalAble.value = true
  currentUdstreamNode.FetchNodeGeometryAsCartesian().then((points: Point[]) => {
    pointList.value = points
  })
  showAllDistances.value = currentUdstreamNode.GetMetadataBool("showAllDistances", false)
  lineWidth.value = currentUdstreamNode.GetMetadataDouble("lineWidth", settings.value.tools.line.width)

  nameColour.value = RGBA2RGBASTRING(settings.value.tools.label.textColour)
  backColour.value = RGBA2RGBASTRING(settings.value.tools.label.backgroundColour)
  lineColourPrimary.value = RGBA2RGBASTRING(settings.value.tools.line.colour)

  // lineColourPrimary.value = currentUdstreamNode.GetMetadataUint(
  //   "lineColour",
  //   BRGAToU32(settings.value.tools.line.colour)
  // )
  // nameColour.value = currentUdstreamNode.GetMetadataUint("nameColour", BRGAToU32(settings.value.tools.label.textColour))
  // backColour.value = currentUdstreamNode.GetMetadataUint(
  //   "backColour",
  //   BRGAToU32(settings.value.tools.label.backgroundColour)
  // )
}

//修改标注的名称
const reNameTheConfig = () => {
  verticalAble.value = false
}

//enter键修改
const modifyInputName = (eve: KeyboardEvent) => {
  if (eve.target) {
    let targetName = eve.target.value
    props.optionData.name = targetName
    verticalName.value = targetName
  }
  verticalAble.value = true
}

const stopKeyDownEvent = (event: KeyboardEvent) => {
  //如果是删除键，阻止默认事件
  //键入的w 87 e 69 r 82
  let keyNum = window.event ? event.keyCode : event.which
  if (event.key === 'Delete' || event.key === 'Del' || keyNum === 87 || keyNum === 69 || keyNum === 69 ) {
    event.stopPropagation()
  }
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
</style>
