<template>
  <div class="uds-config">
    <div>UDS模型配置</div>
    <el-collapse v-model="activeNamesBase" @change="handleChange">
      <el-collapse-item title="基本属性" name="1">
        <el-row>
          <span class="ml-3 w-35 text-gray-400 inline-flex items-center">模型名称</span>
          <div class="row-div">
            <el-input
              v-model="udsName"
              @keyup.enter.native="modifyInputName"
              :disabled="udsEditAble"
              class="w-50 m-2"
              placeholder="模型名称"
              @keydown.stop
            />
            <el-tooltip class="box-item" effect="dark" content="enter键结束输入" placement="top-start">
              <el-icon><Edit @click="reNameTheConfig" /></el-icon>
            </el-tooltip>
          </div>
        </el-row>
        <el-row>
          <span class="ml-3 w-35 text-gray-400 inline-flex items-center">模型地址</span>
          <el-input :disabled="true" v-model="optionData.uri" class="w-50 m-2" placeholder="模型名称" />
        </el-row>
        <el-row>
          <span class="ml-3 w-35 text-gray-400 inline-flex items-center">模型可见</span>
          <el-switch v-model="optionData.isVisible" @change="switchVisible" />
        </el-row>
      </el-collapse-item>
    </el-collapse>
    <el-collapse v-model="activeNamesPosition" @change="handleChange">
      <el-collapse-item title="模型位置" name="1">
        <el-row>
          <span class="ml-3 w-35 text-gray-400 inline-flex items-center">X坐标</span>
          <el-input-number v-model="position.x" @change="setPosition" class="w-50 m-2" placeholder="X坐标" />
        </el-row>
        <el-row>
          <span class="ml-3 w-35 text-gray-400 inline-flex items-center">Y坐标</span>
          <el-input-number v-model="position.y" @change="setPosition" class="w-50 m-2" placeholder="Y坐标" />
        </el-row>
        <el-row>
          <span class="ml-3 w-35 text-gray-400 inline-flex items-center">Z坐标</span>
          <el-input-number v-model="position.z" @change="setPosition" class="w-50 m-2" placeholder="Z坐标" />
        </el-row>
        <el-row>
          <span class="ml-3 w-35 text-gray-400 inline-flex items-center">绕Y旋转</span>
          <el-input-number v-model="rotation.y" @change="setRotation('Y')" class="w-50 m-2" placeholder="绕Y旋转" />
        </el-row>
        <el-row>
          <span class="ml-3 w-35 text-gray-400 inline-flex items-center">绕P旋转</span>
          <el-input-number v-model="rotation.p" @change="setRotation('P')" class="w-50 m-2" placeholder="绕P旋转" />
        </el-row>
        <el-row>
          <span class="ml-3 w-35 text-gray-400 inline-flex items-center">绕R旋转</span>
          <el-input-number v-model="rotation.r" @change="setRotation('R')" class="w-50 m-2" placeholder="绕R旋转" />
        </el-row>
        <el-row>
          <span class="ml-3 w-35 text-gray-400 inline-flex items-center">模型缩放</span>
          <el-input-number v-model="scale" :min="1" class="w-50 m-2" @change="setScale" placeholder="模型缩放" />
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

const udsName = ref(props.optionData.name)
const udsEditAble = ref(true) // uds名称默认不让编辑
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

const scale = ref(0)
let currentUdstreamNode = props.optionData
//更新参数值
const updateAttribute = () => {
  currentUdstreamNode = props.optionData
  udsName.value = props.optionData.name
  udsEditAble.value = true
  currentUdstreamNode.FetchNodeGeometryAsCartesian().then((geom: Point[]) => {
    position.value = geom[0]
  })
  rotation.value.y = currentUdstreamNode.GetMetadataDouble("transform.rotation.y", 0)
  rotation.value.p = currentUdstreamNode.GetMetadataDouble("transform.rotation.p", 0)
  rotation.value.r = currentUdstreamNode.GetMetadataDouble("transform.rotation.r", 0)
  scale.value = currentUdstreamNode.GetMetadataDouble("transform.scale", 0)
}

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

//缩放
const setScale = (val: number) => {
  currentUdstreamNode.SetMetadataDouble("transform.scale", val)
}

//设置可见性
const switchVisible = (val: boolean) => {
  currentUdstreamNode.isVisible = val
}

//基本属性  配置的样式
const activeNamesBase = ref("1")
const activeNamesPosition = ref("1")
const handleChange = () => {
  console.log("模型发生改变")
}

const reNameTheConfig = () => {
  udsEditAble.value = false
}

//enter键输入
const modifyInputName = (eve: KeyboardEvent) => {
  if (eve.target) {
    let targetName = eve.target.value
    props.optionData.name = targetName
    udsName.value = targetName
  }
  udsEditAble.value = true
}

const stopKeyDownEvent = (event: KeyboardEvent) => {}

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
