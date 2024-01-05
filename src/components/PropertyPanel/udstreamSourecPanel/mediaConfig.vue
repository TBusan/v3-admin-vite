<template>
  <div class="media-class">
    <div>多媒体配置</div>
    <el-collapse v-model="activeNamesBase">
      <el-collapse-item title="基本属性" name="1">
        <el-row>
          <span class="ml-3 w-35 text-gray-400 inline-flex items-center">媒体名称</span>
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
        <el-row>
          <span class="ml-3 w-35 text-gray-400 inline-flex items-center">媒体地址</span>
          <div class="row-div">
            <el-input
              v-model="mediaUrl"
              @keyup.enter.native="modifyInputUrl"
              :disabled="mediaUrlEditAble"
              class="w-50 m-2"
              placeholder="媒体地址"
            />
            <!-- <el-tooltip class="box-item" effect="dark" content="enter键结束输入" placement="top-start">
          <el-icon><Edit @click="reUrlTheConfig" /></el-icon>
        </el-tooltip> -->
          </div>
        </el-row>
      </el-collapse-item>
    </el-collapse>
    <el-collapse v-model="activeNamesPosition">
      <el-collapse-item title="位置变换" name="1">
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
        <el-row v-show="imageTypeValue !== 'standard'">
          <span class="ml-3 w-35 text-gray-400 inline-flex items-center">Y旋转</span>
          <el-input-number v-model="rotation.y" @change="setRotation('Y')" class="w-50 m-2" placeholder="Y旋转" />
        </el-row>
        <el-row v-show="imageTypeValue !== 'standard'">
          <span class="ml-3 w-35 text-gray-400 inline-flex items-center">P旋转</span>
          <el-input-number v-model="rotation.p" @change="setRotation('P')" class="w-50 m-2" placeholder="P旋转" />
        </el-row>
        <el-row v-show="imageTypeValue !== 'standard'">
          <span class="ml-3 w-35 text-gray-400 inline-flex items-center">R旋转</span>
          <el-input-number v-model="rotation.r" @change="setRotation('R')" class="w-50 m-2" placeholder="R旋转" />
        </el-row>
        <el-row v-show="imageTypeValue !== 'standard'">
          <span class="ml-3 w-35 text-gray-400 inline-flex items-center">缩放</span>
          <el-input-number v-model="mediaScale" @change="setScale" class="w-50 m-2" placeholder="缩放" />
        </el-row>
      </el-collapse-item>
    </el-collapse>
    <el-collapse v-model="activeNamesBase">
      <el-collapse-item title="媒体" name="1">
        <el-row>
          <span class="ml-3 w-35 text-gray-400 inline-flex items-center">图像类型</span>
          <el-select v-model="imageTypeValue" placeholder="Select" @change="handleUpdateImageType">
            <el-option v-for="item in imageTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-row>
        <el-row>
          <span class="ml-3 w-35 text-gray-400 inline-flex items-center">预览寸尺</span>
          <el-select v-model="imageSizeValue" placeholder="Select" @change="handleUpdateImageSize">
            <el-option v-for="item in imageSizeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-row>
        <el-row>
          <span class="ml-3 w-35 text-gray-400 inline-flex items-center">媒体可见</span>
          <el-switch v-model="optionData.isVisible" @change="switchVisible" />
        </el-row>
      </el-collapse-item>
    </el-collapse>
  </div>
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
const mediaUrl = ref(props.optionData.uri)
const mediaNameEditAble = ref(true)
const mediaUrlEditAble = ref(true)

//当前的节点信息
let currentUdstreamNode = props.optionData

const activeNamesBase = ref("1")
const activeNamesPosition = ref("1")
const imageTypeValue = ref("")
//屏幕图像的类型
const imageTypeOptions = [
  {
    label: "屏幕图像",
    value: "screen"
  },
  {
    label: "标准",
    value: "standard"
  },
  {
    label: "定向图像",
    value: "oriented"
  },
  {
    label: "全景",
    value: "panorama"
  },
  {
    label: "光球",
    value: "photosphere"
  }
]

const imageSizeValue = ref("")
//图像尺寸的类型
const imageSizeOptions = [
  {
    label: "原始尺寸",
    value: "native"
  },
  {
    label: "大",
    value: "large"
  },
  {
    label: "小",
    value: "small"
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

//媒体的缩放
const mediaScale = ref(1)

//设置可见性
const switchVisible = (val: boolean) => {
  currentUdstreamNode.isVisible = val
}
//设置图片的类型
const handleUpdateImageType = (value: string) => {
  currentUdstreamNode.SetMetadataString("imagetype", value)
}
//设置图片的大小
const handleUpdateImageSize = (value: string) => {
  currentUdstreamNode.SetMetadataString("imagesize", value)
}
//更新参数值
const updateAttribute = () => {
  currentUdstreamNode = props.optionData
  mediaName.value = props.optionData.name
  mediaUrl.value = props.optionData.uri
  mediaNameEditAble.value = true
  currentUdstreamNode.FetchNodeGeometryAsCartesian().then((geom: Point[]) => {
    position.value = geom[0]
  })
  mediaScale.value = currentUdstreamNode.SetMetadataDouble("transform.scale", 1)
  rotation.value.y = udMath.RadiansToDegrees(currentUdstreamNode.GetMetadataDouble("transform.rotation.y", 0))
  rotation.value.p = udMath.RadiansToDegrees(currentUdstreamNode.GetMetadataDouble("transform.rotation.p", 0))
  rotation.value.r = udMath.RadiansToDegrees(currentUdstreamNode.GetMetadataDouble("transform.rotation.r", 0))

  imageTypeValue.value = currentUdstreamNode.GetMetadataString("imagetype", "standard")
  imageSizeValue.value = currentUdstreamNode.GetMetadataString("imagesize", "native")
  // if (!imageSizeValue.value || imageSizeValue.value == "") {
  //   //为什么是设置的这两个？
  // }else {
  //   //从当前的节点获取
  // }
  // if (!imageTypeValue.value || imageTypeValue.value == "") {
  //   imageTypeValue.value = currentUdstreamNode.GetMetadataString("imagetype", "standard") //为什么是设置的这两个？
  // } else {
  //   //从当前的节点获取
  // }
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

//设置缩放
const setScale = () => {
  if (mediaScale.value) {
    currentUdstreamNode.SetMetadataDouble("transform.scale", mediaScale.value)
  }
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

//允许媒体地址的更改
const reUrlTheConfig = () => {
  mediaUrlEditAble.value = false
}

//enter  更改媒体地址
const modifyInputUrl = (eve: KeyboardEvent) => {
  if (eve.target) {
    let targetUrl = eve.target.value
    // console.log('---------',targetUrl)
    // props.optionData.uri = targetUrl
    mediaUrl.value = targetUrl
  }
  mediaUrlEditAble.value = true
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
  }
)
</script>
<style scoped>
.media-class :deep(.el-input-number) {
  width: 230px;
}
.row-div {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
</style>
