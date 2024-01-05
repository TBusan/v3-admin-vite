<template>
  <div class="uds-config">
    <div>其它模型配置</div>
    <el-collapse v-model="activeNamesBase" @change="handleChange">
      <el-collapse-item title="基本属性" name="1">
        <el-row :gutter="20">
          <span class="ml-3 w-35 text-gray-400 inline-flex items-center">模型名称</span>
          <div class="row-div">
            <el-input
              v-model="gltfName"
              @keyup.enter.native="modifyInputName"
              :disabled="gltfEditAble"
              class="w-50 m-2"
              placeholder="模型名称"
              @keydown.stop
            />
            <el-tooltip class="box-item" effect="dark" content="enter键结束输入" placement="top-start">
              <el-icon><Edit @click="reNameTheConfig" /></el-icon>
            </el-tooltip>
          </div>
        </el-row>
        <el-row :gutter="20">
          <span class="ml-3 w-35 text-gray-400 inline-flex items-center">模型地址</span>
          <el-input :disabled="true" v-model="optionData.uri" class="w-50 m-2" placeholder="模型名称" />
        </el-row>
        <el-row :gutter="20">
          <span class="ml-3 w-35 text-gray-400 inline-flex items-center">模型可见</span>
          <el-switch v-model="optionData.isVisible" @change="switchVisible" />
        </el-row>
      </el-collapse-item>
    </el-collapse>
    <el-collapse v-model="activeNamesPosition" @change="handleChange">
      <el-collapse-item title="位置属性" name="1">
        <el-row :gutter="20">
          <span class="ml-3 w-35 text-gray-400 inline-flex items-center">X坐标</span>
          <el-input-number v-model="position.x" @change="setPosition" class="w-50 m-2" placeholder="X坐标" />
        </el-row>
        <el-row :gutter="20">
          <span class="ml-3 w-35 text-gray-400 inline-flex items-center">Y坐标</span>
          <el-input-number v-model="position.y" @change="setPosition" class="w-50 m-2" placeholder="Y坐标" />
        </el-row>
        <el-row :gutter="20">
          <span class="ml-3 w-35 text-gray-400 inline-flex items-center">Z坐标</span>
          <el-input-number v-model="position.z" @change="setPosition" class="w-50 m-2" placeholder="Z坐标" />
        </el-row>
        <el-row :gutter="20">
          <span class="ml-3 w-35 text-gray-400 inline-flex items-center">绕Y旋转</span>
          <el-input-number v-model="rotation.y" @change="setRotation('Y')" class="w-50 m-2" placeholder="绕Y旋转" />
        </el-row>
        <el-row :gutter="20">
          <span class="ml-3 w-35 text-gray-400 inline-flex items-center">绕P旋转</span>
          <el-input-number v-model="rotation.p" @change="setRotation('P')" class="w-50 m-2" placeholder="绕P旋转" />
        </el-row>
        <el-row :gutter="20">
          <span class="ml-3 w-35 text-gray-400 inline-flex items-center">绕R旋转</span>
          <el-input-number v-model="rotation.r" @change="setRotation('R')" class="w-50 m-2" placeholder="绕R旋转" />
        </el-row>
        <el-row :gutter="20">
          <span class="ml-3 w-35 text-gray-400 inline-flex items-center">X缩放</span>
          <el-input-number v-model="scale.x" :min="1" class="w-50 m-2" @change="setScale('X')" placeholder="模型缩放" />
        </el-row>
        <el-row :gutter="20">
          <span class="ml-3 w-35 text-gray-400 inline-flex items-center">Y缩放</span>
          <el-input-number v-model="scale.y" :min="1" class="w-50 m-2" @change="setScale('Y')" placeholder="模型缩放" />
        </el-row>
        <el-row :gutter="20">
          <span class="ml-3 w-35 text-gray-400 inline-flex items-center">Z缩放</span>
          <el-input-number v-model="scale.z" :min="1" class="w-50 m-2" @change="setScale('Z')" placeholder="模型缩放" />
        </el-row>
      </el-collapse-item>
    </el-collapse>
    <el-collapse v-model="activeNamesColor">
      <el-collapse-item title="可视属性" name="1">
        <el-row :gutter="20">
          <span class="ml-3 w-35 text-gray-400 inline-flex items-center">着色</span>
          <el-color-picker v-model="gltfColour" @change="setGltfColour" show-alpha />
        </el-row>
        <el-row :gutter="20">
          <span class="ml-3 w-35 text-gray-400 inline-flex items-center">面剔除</span>
          <el-select v-model="faceTypeValue" placeholder="Select" @change="handleFaceCulling">
            <el-option v-for="item in facesTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-row>
        <el-row :gutter="20">
          <span class="ml-3 w-35 text-gray-400 inline-flex items-center">Y朝上</span>
          <el-switch v-model="yUpValue" @change="switchYup" />
        </el-row>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>
<script lang="ts" setup>
import { PropType, ref, onMounted, watch } from "vue"
import { ProjectNode, Point } from "@/udStream/types/ProjectNode"
import { Edit } from "@element-plus/icons-vue"
const props = defineProps({
  optionData: {
    type: Object as PropType<ProjectNode>,
    required: true
  }
})

const gltfName = ref(props.optionData.name)
const gltfEditAble = ref(true) // uds名称默认不让编辑
const position = ref({
  x: 0,
  y: 0,
  z: 0
})

const rotation = ref({
  y: 0,
  p: 0,
  r: 0
})

const scale = ref({
  x: 1,
  y: 1,
  z: 1
})

//gltf的着色
const gltfColour = ref("rgba(27, 27, 27, 0.7)") //背景颜色
//面剔除的相关参数
const faceTypeValue = ref("")
//面剔除的配置参数
const facesTypeOptions = [
  {
    label: "背面",
    value: "back"
  },
  {
    label: "标准",
    value: "front"
  },
  {
    label: "无",
    value: "none"
  }
]

const yUpValue = ref(false)

let currentUdstreamNode = props.optionData

//设置模型位置
const setPosition = () => {
  currentUdstreamNode.UpdateNodeGeometryFromCartesian([
    { x: position.value.x, y: position.value.y, z: position.value.z }
  ])
}

//旋转
const setRotation = (params: string) => {
  if (params == "Y") {
    currentUdstreamNode.SetMetadataDouble("transform.rotation.y", rotation.value.y)
  } else if (params == "P") {
    currentUdstreamNode.SetMetadataDouble("transform.rotation.p", rotation.value.p)
  } else if (params == "R") {
    currentUdstreamNode.SetMetadataDouble("transform.rotation.r", rotation.value.r)
  }
}

//缩放 X  Y  Z
const setScale = (val: string) => {
  if (val == "Y") {
    currentUdstreamNode.SetMetadataDouble("transform.scale.y", scale.value.y)
  } else if (val == "Z") {
    currentUdstreamNode.SetMetadataDouble("transform.scale.z", scale.value.z)
  } else if (val == "X") {
    currentUdstreamNode.SetMetadataDouble("transform.scale.x", scale.value.x)
  }
}

//设置可见性
const switchVisible = (val: boolean) => {
  currentUdstreamNode.isVisible = val
}

//设置Y向上
const switchYup = (yUp: boolean) => {
  console.log(yUp)
  currentUdstreamNode.SetMetadataBool("yUp", yUp)
  let rotationAngel = yUp ? 90 : 0
  currentUdstreamNode.SetMetadataDouble("transform.rotation.p", rotationAngel)
}

//设置面剔除
const handleFaceCulling = (params: any) => {
  // console.log(params)
  currentUdstreamNode.SetMetadataString("culling", params)
}

const BRGAToU32 = (bgra: number[]) => {
  let i = 0
  i |= (bgra[2] * 255) << 0
  i |= (bgra[1] * 255) << 8
  i |= (bgra[0] * 255) << 16
  i |= (bgra[3] * 255) << 24
  return i
}

//设置背景颜色
const setGltfColour = (value: string) => {
  gltfColour.value = value
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
      currentUdstreamNode.SetMetadataUint("tint", colour)
    }
  }
}

//基本属性  配置的样式
const activeNamesBase = ref("1")
const activeNamesPosition = ref("1")
const activeNamesColor = ref("1")
const handleChange = () => {
  console.log("模型发生改变")
}

const reNameTheConfig = () => {
  gltfEditAble.value = false
}

//enter键输入
const modifyInputName = (eve: KeyboardEvent) => {
  if (eve.target) {
    let targetName = eve.target.value
    props.optionData.name = targetName
    gltfName.value = targetName
  }
  gltfEditAble.value = true
}

const stopKeyDownEvent = (event: KeyboardEvent) => {}

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
  gltfName.value = props.optionData.name
  gltfEditAble.value = true
  currentUdstreamNode.FetchNodeGeometryAsCartesian().then((geom: Point[]) => {
    position.value = geom[0]
  })
  //位置
  rotation.value.y = currentUdstreamNode.GetMetadataDouble("transform.rotation.y", 0)
  rotation.value.p = currentUdstreamNode.GetMetadataDouble("transform.rotation.p", 0)
  rotation.value.r = currentUdstreamNode.GetMetadataDouble("transform.rotation.r", 0)
  scale.value.x = currentUdstreamNode.GetMetadataDouble("transform.scale.x", 1)
  scale.value.y = currentUdstreamNode.GetMetadataDouble("transform.scale.y", 1)
  scale.value.z = currentUdstreamNode.GetMetadataDouble("transform.scale.z", 1)
  //面剔除
  faceTypeValue.value = currentUdstreamNode.GetMetadataString("culling", "back")
  //面朝上
  yUpValue.value = currentUdstreamNode.GetMetadataBool("yUp", false)
  //着色
  let intColor = currentUdstreamNode.GetMetadataUint("tint", 0xffffffff)
  gltfColour.value = six2RGBA(intColor)
  // gltfColour.value = RGBA2RGBASTRING(settings.value.tools.label.backgroundColour)
}

onMounted(() => {
  if (props.optionData) {
    updateAttribute()
  }
})
//监听节点的ID  节点ID发生变化   就更新一下属性
watch(
  () => props.optionData,
  (nv, ov) => {
    if (nv) {
      console.log("watch the node change!")
      updateAttribute()
    }
  },
  {
    deep: true
  }
)
</script>
<style scoped>
.uds-config :deep(.el-input-number) {
  width: 230px;
}
.row-div {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
</style>
