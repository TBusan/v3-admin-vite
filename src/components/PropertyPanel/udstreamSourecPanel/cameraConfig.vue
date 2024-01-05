<template>
  <div>视点配置</div>
  <el-collapse v-model="activeNamesBase">
    <el-collapse-item title="基本属性" name="1">
      <el-row>
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">媒体名称</span>
        <div class="row-div">
          <el-input
            v-model="cameraName"
            @keyup.enter.native="modifyInputName"
            :disabled="cameraNameEditAble"
            class="w-50 m-2"
            placeholder="媒体名称"
            @keydown.stop
          />
          <el-tooltip class="box-item" effect="dark" content="enter键结束输入" placement="top-start">
            <el-icon><Edit @click="reNameTheConfig" /></el-icon>
          </el-tooltip>
        </div>
      </el-row>
    </el-collapse-item>
  </el-collapse>
  <el-collapse v-model="activeNamesBase">
    <el-collapse-item title="位置属性" name="1">
      <el-row>
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">X坐标</span>
        <el-input-number
          v-model="position.x"
          @change="setPosition($event, position.y, position.z)"
          class="w-50 m-2"
          :step="1"
          placeholder="X坐标"
        />
      </el-row>
      <el-row>
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">Y坐标</span>
        <el-input-number
          v-model="position.y"
          @change="setPosition(position.x, $event, position.z)"
          class="w-50 m-2"
          :step="1"
          placeholder="Y坐标"
        />
      </el-row>
      <el-row>
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">Z坐标</span>
        <el-input-number
          v-model="position.z"
          @change="setPosition(position.x, position.y, $event)"
          class="w-50 m-2"
          :step="1"
          placeholder="Z坐标"
        />
      </el-row>
      <el-row>
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">H轴旋转</span>
        <el-input-number
          v-model="rotation.h"
          @change="setRotation($event, null)"
          class="w-50 m-2"
          :step="1"
          placeholder="H轴旋转"
        />
      </el-row>
      <el-row>
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">P轴旋转</span>
        <el-input-number
          v-model="rotation.p"
          @change="setRotation($event, null)"
          class="w-50 m-2"
          :step="1"
          placeholder="H轴旋转"
        />
      </el-row>
    </el-collapse-item>
  </el-collapse>
  <el-collapse v-model="activeNamesLight">
    <el-collapse-item title="屏幕空间环境光遮蔽" name="1">
      <el-row>
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">启用SSAO</span>
        <el-switch v-model="showSSAO" @change="switchSSAOShow" />
      </el-row>
      <el-row v-show="showSSAO">
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">步长</span>
        <el-slider v-model="ssaoStep" @change="changeSsaoStep" :min="0" :max="10" :step="0.01" />
      </el-row>
      <el-row v-show="showSSAO">
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">颜色</span>
        <el-color-picker v-model="ssaoColor" @change="setSsaoColorPrimary" show-alpha />
      </el-row>
    </el-collapse-item>
  </el-collapse>
  <el-collapse v-model="activeNamesView">
    <el-collapse-item title="可视区域" name="1">
      <el-row>
        <el-button @click="setViewPointToCamera(false)">将视点设置为当前相机</el-button>
      </el-row>
    </el-collapse-item>
  </el-collapse>
</template>
<script lang="ts" setup>
import { PropType, ref, onMounted, watch, computed } from "vue"
import { Edit } from "@element-plus/icons-vue"
import { ProjectNode, Point } from "@/udStream/types/ProjectNode"
import { useUdstreamStore } from "@/store/modules/udstreamStore"
import { ElMessage } from "element-plus"
import * as udMath from "@/udStream/udMath"
import * as udStream from "@/udStream/udStream"

const activeNamesBase = ref("1")
const activeNamesView = ref("1")
const activeNamesLight = ref("1")
const ssaoColor = ref("rgba(104, 50, 104, 1)")
const ssaoStep = ref(1)
const udstreamStore = useUdstreamStore()
const settings = computed(() => {
  return udstreamStore.getUdstreamSetting
})

const props = defineProps({
  optionData: {
    type: Object as PropType<ProjectNode>,
    required: true
  }
})

const showSSAO = ref(false)
const cameraName = ref(props.optionData.name)
const cameraNameEditAble = ref(true)
let currentUdstreamNode = props.optionData
const position = ref({
  x: 0,
  y: 0,
  z: 0
})

const rotation = ref({
  h: 0,
  p: 0
})

const setPosition = (x: string, y: string, z: string) => {
  currentUdstreamNode.UpdateNodeGeometryFromCartesian([{ x: parseFloat(x), y: parseFloat(y), z: parseFloat(z) }])
}

const setRotation = (h: string, p: string) => {
  if (h != null) {
    currentUdstreamNode.SetMetadataDouble("transform.heading", udMath.DegreesToRadians(parseFloat(h)))
  }
  if (p != null) {
    currentUdstreamNode.SetMetadataDouble("transform.pitch", udMath.DegreesToRadians(parseFloat(p)))
  }
}

//将视点设置为当前相机
const setViewPointToCamera = async (withVisSettings: boolean) => {
  try {
    //设置成功
    udStream.setViewpointToCamera(currentUdstreamNode, withVisSettings)
    //获取当前相机的信息
    let cameraInfo = await udStream.getCameraInfo()
    //根据相机信息进行更改
    if (cameraInfo?.cameraPosition) {
      currentUdstreamNode.UpdateNodeGeometryFromCartesian([
        { x: cameraInfo.cameraPosition.x, y: cameraInfo.cameraPosition.y, z: cameraInfo.cameraPosition.z }
      ])
    }
    if (cameraInfo?.camera) {
      currentUdstreamNode.SetMetadataDouble("transform.heading", cameraInfo?.camera?.heading)
      currentUdstreamNode.SetMetadataDouble("transform.pitch", cameraInfo?.camera?.pitch)
    }
    // currentUdstreamNode.SetMetadataDouble("transform.alt", cameraInfo?.camera?.alt)
    // rotation.value.h = udMath.RadiansToDegrees(currentUdstreamNode.GetMetadataDouble("transform.heading", 0))
    // rotation.value.p = udMath.RadiansToDegrees(currentUdstreamNode.GetMetadataDouble("transform.pitch", 0))
    ElMessage({
      message: "将视点设置为当前相机成功！",
      type: "success",
      duration: 2000
    })
  } catch (err) {
    ElMessage({
      message: "将视点设置为当前相机失败！",
      type: "error",
      duration: 2000
    })
    //设置失败
  }
}

//启动SSAO
const switchSSAOShow = (params: boolean) => {
  currentUdstreamNode.SetMetadataBool("visualisation.ssao.enable", params)
  // settings.value.postVisualization.ssao.enable = params;
}

//改变ssao的步长
const changeSsaoStep = (transparency: number) => {
  currentUdstreamNode.SetMetadataDouble("visualisation.ssao.stepSize", transparency)
  // this.settings.postVisualization.ssao.stepSize = stepSize;
}

const BRGAToU32 = (bgra: number[]) => {
  let i = 0
  i |= (bgra[2] * 255) << 0
  i |= (bgra[1] * 255) << 8
  i |= (bgra[0] * 255) << 16
  i |= (bgra[3] * 255) << 24
  return i
}

//更改ssao的颜色
const setSsaoColorPrimary = (value: string) => {
  ssaoColor.value = value
  if (value) {
    const matchRGBA = value.match(/(\d(\.\d+)?)+/g)
    if (matchRGBA) {
      const arr = [
        parseFloat(matchRGBA[0]) / 255,
        parseFloat(matchRGBA[1]) / 255,
        parseFloat(matchRGBA[2]) / 255,
        parseFloat(matchRGBA[2])
      ]

      for (let i = 0; i < arr.length; i++) {
        currentUdstreamNode.SetMetadataDouble(`visualisation.ssao.colour[${i}]`, arr[i])
        // this.settings.postVisualization.ssao.colour[i] = parseFloat(this.ssaoColour[i]);
      }
      // const colour = BRGAToU32(arr)
      // currentUdstreamNode.SetMetadataUint("lineColourPrimary", colour)
    }
  }
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

const update = () => {
  currentUdstreamNode = props.optionData
  cameraName.value = props.optionData.name
  cameraNameEditAble.value = true
  currentUdstreamNode.FetchNodeGeometryAsCartesian().then((geom: Point[]) => {
    if (geom) {
      position.value = geom[0]
    }
  })

  rotation.value.h = udMath.RadiansToDegrees(currentUdstreamNode.GetMetadataDouble("transform.heading", 0))
  rotation.value.p = udMath.RadiansToDegrees(currentUdstreamNode.GetMetadataDouble("transform.pitch", 0))

  //空间的环境光遮蔽
  // showSSAO.value = currentUdstreamNode.GetMetadataBool(
  //   "visualisation.ssao.enable",
  //   settings.value.postVisualization.ssao.enable
  // )
  // ssaoStep.value = currentUdstreamNode.GetMetadataDouble(
  //   "visualisation.ssao.stepSize",
  //   settings.value.postVisualization.ssao.stepSize
  // )

  // let ssaoColour = []
  // for (let i = 0; i < settings.value.postVisualization.ssao.colour.length; i++) {
  //   ssaoColour.push(
  //     currentUdstreamNode.GetMetadataDouble(
  //       `visualisation.ssao.colour[${i}]`,
  //       settings.value.postVisualization.ssao.colour[i]
  //     )
  //   )
  // }
  // if (ssaoColour.length > 0) {
  //   ssaoColor.value = RGBA2RGBASTRING(ssaoColour)
  // }
}

//允许名称的编辑
const reNameTheConfig = () => {
  cameraNameEditAble.value = false
}

//enter  更改名称
const modifyInputName = (eve: KeyboardEvent) => {
  if (eve.target) {
    let targetName = eve.target.value
    props.optionData.name = targetName
    cameraName.value = targetName
  }
  cameraNameEditAble.value = true
}

const stopKeyDownEvent = (event: KeyboardEvent) => {
  //如果是删除键，阻止默认事件
  //键入的w 87 e 69 r 82
  let keyNum = window.event ? event.keyCode : event.which
  if (event.key === "Delete" || event.key === "Del" || keyNum === 87 || keyNum === 69 || keyNum === 69) {
    event.stopPropagation()
  }
}

onMounted(() => {
  update()
})

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
