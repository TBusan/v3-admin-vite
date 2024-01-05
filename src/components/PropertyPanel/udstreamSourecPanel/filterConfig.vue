<template>
  <div>{{ filterType }}</div>
  <el-collapse v-model="activeNamesBase">
    <el-collapse-item title="基本属性" name="1">
      <el-row :gutter="20">
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">过滤器名称</span>
        <div class="row-div">
          <el-input
            v-model="mediaName"
            @keyup.enter.native="modifyInputName"
            :disabled="mediaNameEditAble"
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
  <el-collapse v-model="activeNamesPosition">
    <el-collapse-item title="位置变换" name="1">
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
      <el-row :gutter="20" v-if="shapeType != 'polygon' && shapeType != 'sphere'">
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">Y旋转</span>
        <el-input-number v-model="rotation.y" @change="setRotation('Y')" class="w-50 m-2" placeholder="Y旋转" />
      </el-row>
      <el-row :gutter="20" v-if="shapeType != 'polygon' && shapeType != 'sphere'">
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">P旋转</span>
        <el-input-number v-model="rotation.p" @change="setRotation('P')" class="w-50 m-2" placeholder="P旋转" />
      </el-row>
      <el-row :gutter="20" v-if="shapeType != 'polygon' && shapeType != 'sphere'">
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">R旋转</span>
        <el-input-number v-model="rotation.r" @change="setRotation('R')" class="w-50 m-2" placeholder="R旋转" />
      </el-row>
      <el-row :gutter="20">
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">X大小</span>
        <el-input-number v-model="size.x" @change="setSize" class="w-50 m-2" placeholder="X大小" />
      </el-row>
      <el-row :gutter="20">
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">Y大小</span>
        <el-input-number v-model="size.y" @change="setSize" class="w-50 m-2" placeholder="Y大小" />
      </el-row>
      <el-row :gutter="20">
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">Z大小</span>
        <el-input-number v-model="size.z" @change="setSize" class="w-50 m-2" placeholder="Z大小" />
      </el-row>
    </el-collapse-item>
  </el-collapse>
  <el-collapse v-model="activeNamesBase">
    <el-collapse-item title="几何体过滤器" name="1">
      <el-row :gutter="20">
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">几何体布尔运算选项</span>
        <el-select v-model="mergeMode" placeholder="Select" @change="setMergeMode">
          <el-option v-for="item in boolsOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-row>
      <el-row :gutter="20">
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">反选</span>
        <el-switch v-model="invertFilter" @change="setInvertFilter" />
      </el-row>
      <el-row :gutter="20">
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">过滤器可见</span>
        <el-switch v-model="optionData.isVisible" @change="switchVisible" />
      </el-row>
    </el-collapse-item>
  </el-collapse>
</template>
<script lang="ts" setup>
import { PropType, ref, onMounted, watch } from "vue"
import { ProjectNode, Point } from "@/udStream/types/ProjectNode"
import { Edit } from "@element-plus/icons-vue"
import * as udMath from "@/udStream/udMath"

const props = defineProps({
  optionData: {
    type: Object as PropType<ProjectNode>,
    required: true
  }
})

const mediaName = ref(props.optionData.name)
const mediaNameEditAble = ref(true)
const filterType = ref("长方体过滤器")
const shapeType = ref("")

const invertFilter = ref(false)
const mergeMode = ref("") //布尔运算选项
//当前的节点信息
let currentUdstreamNode = props.optionData

const activeNamesBase = ref("1")
const activeNamesPosition = ref("1")

//过滤布尔值的类型
const boolsOptions = [
  {
    label: "替代（忽略前置过滤器）",
    value: "replace"
  },
  {
    label: "交集（同时匹配本过滤器和前置过滤器）",
    value: "and"
  },
  {
    label: "并集（匹配本过滤器或者前置过滤器）",
    value: "or"
  }
]

//位置参数
const position = ref({
  x: 0,
  y: 0,
  z: 0
})

//旋转参数
const rotation = ref({
  y: 0,
  p: 0,
  r: 0
})

//大小
const size = ref({
  x: 0,
  y: 0,
  z: 0
})

//设置可见性
const switchVisible = (val: boolean) => {
  currentUdstreamNode.isVisible = val
}

//更新参数值
const updateAttribute = () => {
  currentUdstreamNode = props.optionData
  mediaName.value = props.optionData.name
  mediaNameEditAble.value = true
  currentUdstreamNode.FetchNodeGeometryAsCartesian().then((geom: Point[]) => {
    position.value = geom[0]
  })

  shapeType.value = currentUdstreamNode.GetMetadataString("shape", "box")
  console.log(shapeType.value)

  filterType.value =
    shapeType.value == "box" ? "长方体过滤器" : shapeType.value == "sphere" ? "球体过滤器" : "多边形过滤器"
  //旋转
  rotation.value.y = udMath.RadiansToDegrees(currentUdstreamNode.GetMetadataDouble("transform.rotation.y", 0))
  rotation.value.p = udMath.RadiansToDegrees(currentUdstreamNode.GetMetadataDouble("transform.rotation.p", 0))
  rotation.value.r = udMath.RadiansToDegrees(currentUdstreamNode.GetMetadataDouble("transform.rotation.r", 0))

  //大小
  size.value.x = currentUdstreamNode.GetMetadataDouble("size.x", 1)
  size.value.y = currentUdstreamNode.GetMetadataDouble("size.y", 1)
  size.value.z = currentUdstreamNode.GetMetadataDouble("size.z", 1)

  mergeMode.value = currentUdstreamNode.GetMetadataString("mergemode", "or") //布尔策略
  invertFilter.value = currentUdstreamNode.GetMetadataBool("inverted", false) //反选
}

//设置模型位置
const setPosition = () => {
  currentUdstreamNode.UpdateNodeGeometryFromCartesian([
    { x: position.value.x, y: position.value.y, z: position.value.z }
  ])
}

//设置模型的旋转
const setRotation = (params: string) => {
  if (params == "Y") {
    currentUdstreamNode.SetMetadataDouble("transform.rotation.y", udMath.DegreesToRadians(rotation.value.y))
  } else if (params == "P") {
    currentUdstreamNode.SetMetadataDouble("transform.rotation.p", udMath.DegreesToRadians(rotation.value.p))
  } else if (params == "R") {
    currentUdstreamNode.SetMetadataDouble("transform.rotation.r", udMath.DegreesToRadians(rotation.value.r))
  }
}

//设置模型的大小
const setSize = function (x: string, y: string, z: string) {
  if (x != null) {
    currentUdstreamNode.SetMetadataDouble("size.x", parseFloat(x))
  }
  if (y != null) {
    currentUdstreamNode.SetMetadataDouble("size.y", parseFloat(y))
  }
  if (z != null) {
    currentUdstreamNode.SetMetadataDouble("size.z", parseFloat(z))
  }
}

//过滤器反选
const setInvertFilter = function (invert: boolean) {
  currentUdstreamNode.SetMetadataBool("inverted", invert)
}

//设置过滤去的布尔运算
const setMergeMode = function (mode: string) {
  currentUdstreamNode.SetMetadataString("mergemode", mode)
}

//允许名称的编辑
const reNameTheConfig = () => {
  mediaNameEditAble.value = false
}

//enter  更改名称
const modifyInputName = (eve: KeyboardEvent) => {
  if (eve.target) {
    let targetName = eve.target.value
    props.optionData.name = targetName
    mediaName.value = targetName
  }
  mediaNameEditAble.value = true
}

const stopKeyDownEvent = (event: KeyboardEvent) => {}

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
