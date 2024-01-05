<template>
  <div v-if="showThePanel" class="page-config">
    <!-- <div class="row-item">
      <div>启动地球</div>
      <el-switch v-model="enableEarth" />
    </div> -->
    <div class="row-item">
      <div>显示模式</div>
    </div>
    <div class="row-item-no">
      <el-select
        v-model="thisUdstreamSetting.visualization.mode"
        @change="selectVisualizationModeHandle"
        placeholder="Select"
        style="width: 100px"
      >
        <el-option v-for="item in displayModeOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
    </div>
    <div class="row-item">
      <div>像素点形状</div>
    </div>
    <div class="row-item">
      <el-select
        v-model="thisUdstreamSetting.pointMode"
        @change="selectPointModeHandle"
        placeholder="Select"
        style="width: 100px"
      >
        <el-option v-for="item in pixelPointShapeOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
    </div>
    <div class="row-item">
      <div>摄像机镜头(可视角度)</div>
    </div>
    <div class="row-item">
      <el-select
        @change="selectCameraHandle"
        v-model="thisUdstreamSetting.camera.lensId[0]"
        placeholder="Select"
        style="width: 100px"
      >
        <el-option v-for="item in angleOfViewOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
    </div>

    <div class="row-item">
      <div>天空盒模式</div>
    </div>
    <div class="row-item">
      <el-select
        v-model="thisUdstreamSetting.skybox.type"
        @change="selectSkyBoxHandle"
        placeholder="Select"
        style="width: 100px"
      >
        <el-option v-for="item in skyBoxTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
    </div>

    <div class="row-item">
      <div>抗锯齿类型</div>
    </div>
    <div class="row-item">
      <el-select
        v-model="thisUdstreamSetting.antiAliasingType"
        @change="selectAntiAliasingTypeHandle"
        placeholder="Select"
        style="width: 100px"
      >
        <el-option v-for="item in antiAliasingOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
    </div>
    <div class="row-item">
      <div>饱和度</div>
    </div>
    <div class="row-item">
      <el-slider
        v-model="thisUdstreamSetting.saturation"
        @change="selectSaturationHandle"
        :min="0"
        :max="50"
        :step="1"
      />
    </div>
    <div class="row-item">
      <div>性能/质量</div>
    </div>
    <div class="row-item">
      <el-slider
        v-model="thisUdstreamSetting.perfQualityRatio"
        @change="selectPerfQualityRatioHandle"
        :debounce="500"
        :min="0.5"
        :max="2"
        :step="0.1"
      />
    </div>
    <div class="row-item">
      <div>曝光度</div>
    </div>
    <div class="row-item">
      <el-slider
        v-model="thisUdstreamSetting.skybox.exposure"
        @change="selectExposureHandle"
        :min="0"
        :max="8"
        :step="0.1"
      />
    </div>

    <div class="row-item">
      <div>高亮选中物体</div>
      <el-switch v-model="thisUdstreamSetting.objectHighlighting.enable" @change="selectObjectHighlightingHandle" />
    </div>

    <div class="row-item">
      <div>高亮选中颜色</div>
      <el-color-picker v-model="selectHighlightColor" @change="selectObjectHighlightingColorHandle" show-alpha />
    </div>

    <div class="row-item">
      <div>高亮厚度</div>
    </div>
    <div class="row-item">
      <el-slider
        v-model="thisUdstreamSetting.objectHighlighting.thickness"
        @change="selectObjectHighlightingThicknessHandle"
        :debounce="500"
        :min="1"
        :max="2"
        :step="0.1"
      />
    </div>

    <div class="row-item">
      <div>数字高程模型</div>
      <el-switch v-model="thisUdstreamSetting.maptiles.demEnabled" @change="enableMapHight" />
    </div>
    <div class="row-item-cloum" v-show="thisUdstreamSetting.maptiles.demEnabled">
      <div class="ml-3 w-35 text-gray-400 inline-flex items-center">服务地址</div>
      <div class="row-item-cloum-item">
        <el-input
          v-model="thisUdstreamSetting.maptiles.DEMServerURL"
          @keyup.enter.native="modifyInputUrlName"
          :disabled="demEditAble"
          class="w-50 m-2"
          placeholder="服务地址"
        />
        <el-tooltip class="box-item" effect="dark" content="enter键结束输入" placement="top-start">
          <el-icon><Edit @click="editDemUrl" /></el-icon>
        </el-tooltip>
      </div>
    </div>
    <div class="row-item-cloum" v-show="thisUdstreamSetting.maptiles.demEnabled">
      <div class="ml-3 w-35 text-gray-400 inline-flex items-center">级别</div>
      <el-slider
        v-model="thisUdstreamSetting.maptiles.DEMMaxLevels"
        @change="selectMapHightLevelHandle"
        :debounce="500"
        :min="8"
        :max="21"
        :step="1"
      />
    </div>
    <el-collapse>
      <el-collapse-item title="标签距离属性" name="1">
        <div class="row-item">
          <div>最大标签距离</div>
        </div>
        <div class="row-item">
          <el-slider
            v-model="thisUdstreamSetting.POIfadeDistance"
            @change="selectMaxLabelDistanceHandle"
            :min="0"
            :max="1000000"
            :step="1"
          />
        </div>
        <div class="row-item">
          <div>图像缩放距离</div>
        </div>
        <div class="row-item">
          <el-slider
            v-model="thisUdstreamSetting.ImageRescaleDistance"
            @change="selectImageZoomDistanceHandle"
            :min="0"
            :max="1000000"
            :step="1"
          />
        </div>
        <div class="row-item">
          <div>图像加载距离</div>
        </div>
        <div class="row-item">
          <el-slider
            v-model="thisUdstreamSetting.imageLoadDistance"
            @change="selectImageLoadDistanceHandle"
            :min="0"
            :max="1000000"
            :step="1"
          />
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, toRaw, onMounted } from "vue"
import { useUdstreamStore } from "@/store/modules/udstreamStore"
import * as udStream from "@/udStream/udStream"
const showThePanel = ref(false)
const udstreamStore = useUdstreamStore()
//udstream的可视化设置
const thisUdstreamSetting = ref(toRaw(udstreamStore.getUdstreamSetting))
//是否开启地球
const enableEarth = ref(false)
//高亮颜色
const selectHighlightColor = ref("rgba(19, 206, 102, 0.1)")
//数字高程模型是否可编辑
const demEditAble = ref(true)
// const demUrl = ref("http://map.eulee.com.cn/dem/{0}/{1}/{2}")
const demUrl = ref(
  "https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer/tile/{0}/{2}/{1}"
)
//显示模式
const displayModeOptions = [
  {
    label: "默认",
    name: "settingsVisModeDefault",
    value: -1
  },
  {
    label: "颜色",
    name: "settingsVisModeColour",
    value: 0
  },
  {
    label: "强度",
    name: "settingsVisModeIntensity",
    value: 1
  },
  {
    label: "分类",
    name: "settingsVisModeClassification",
    value: 2
  },
  {
    label: "位移距离",
    name: "settingsVisModeDisplacementDistance",
    value: 3
  }
]

//像素点形状
const pixelPointShapeOptions = [
  {
    label: "矩形",
    name: "settingsAppearanceRectangles",
    value: 0
  },
  {
    label: "立方体",
    name: "settingsAppearanceCubes",
    value: 1
  },
  {
    label: "点（费性能）",
    name: "settingsAppearancePoints",
    value: 2
  }
]

//摄像机镜头  可视角度
const angleOfViewOptions = [
  // {
  //   label: "自定义",
  //   name: "settingsViewportCameraLensCustom",
  //   value: 0
  // },
  {
    label: "15mm",
    name: "settingsViewportCameraLens15mm",
    value: 1
  },
  {
    label: "24mm",
    name: "settingsViewportCameraLens24mm",
    value: 2
  },
  {
    label: "30mm",
    name: "settingsViewportCameraLens30mm",
    value: 3
  },
  {
    label: "50mm",
    name: "settingsViewportCameraLens50mm",
    value: 4
  },
  {
    label: "70mm",
    name: "settingsViewportCameraLens70mm",
    value: 5
  },
  {
    label: "100mm",
    name: "settingsViewportCameraLens100mm",
    value: 6
  }
]

//天空盒类型
const skyBoxTypeOptions = [
  {
    label: "无",
    name: "settingsAppearanceSkyboxTypeNone",
    value: 0
  },
  {
    label: "颜色",
    name: "settingsAppearanceSkyboxTypeColour",
    value: 1
  },
  {
    label: "简单",
    name: "settingsAppearanceSkyboxTypeSimple",
    value: 2
  },
  {
    label: "大气",
    name: "settingsAppearanceSkyboxTypeAtmosphere",
    value: 3
  }
]

//抗锯齿类型
const antiAliasingOptions = [
  {
    label: "无",
    name: "settingsAppearanceAntiAliasingNone",
    value: 0
  },
  {
    label: "快速近似",
    name: "settingsAppearanceAntiAliasingFXAA",
    value: 1
  },
  {
    label: "暂时性（实验）",
    name: "settingsAppearanceAntiAliasingTAA",
    value: 2
  }
]

//显示模式的更改
const selectVisualizationModeHandle = async (value: number) => {
  thisUdstreamSetting.value.visualization.mode = value
  await udStream.saveSettings(udstreamStore.getUdstreamSetting)
}

//像素点形状发生改变
const selectPointModeHandle = async (value: number) => {
  thisUdstreamSetting.value.pointMode = value
  await udStream.saveSettings(udstreamStore.getUdstreamSetting)
}

//摄像机镜头的调整
const selectCameraHandle = async (value: number) => {
  thisUdstreamSetting.value.camera.lensId[0] = value
  await udStream.saveSettings(udstreamStore.getUdstreamSetting)
}

//天空盒子发生改变
const selectSkyBoxHandle = async (value: number) => {
  thisUdstreamSetting.value.skybox.type = value
  await udStream.saveSettings(udstreamStore.getUdstreamSetting)
}

//抗锯齿相应的设置
const selectAntiAliasingTypeHandle = async (value: number) => {
  thisUdstreamSetting.value.antiAliasingType = value
  await udStream.saveSettings(udstreamStore.getUdstreamSetting)
}

//是否高亮选中物体
const selectObjectHighlightingHandle = async (value: boolean) => {
  thisUdstreamSetting.value.objectHighlighting.enable = value
  await udStream.saveSettings(udstreamStore.getUdstreamSetting)
}

//更改饱和度的设置
const selectSaturationHandle = async (value: number) => {
  thisUdstreamSetting.value.saturation = value
  await udStream.saveSettings(udstreamStore.getUdstreamSetting)
}

//性能质量发生改变的方法
const selectPerfQualityRatioHandle = async (value: number) => {
  thisUdstreamSetting.value.perfQualityRatio = value
  await udStream.saveSettings(udstreamStore.getUdstreamSetting)
}

//更改曝光度的操作
const selectExposureHandle = async (value: number) => {
  thisUdstreamSetting.value.skybox.exposure = value
  await udStream.saveSettings(udstreamStore.getUdstreamSetting)
}

//设置标签最大距离
const selectMaxLabelDistanceHandle = async (value: number) => {
  thisUdstreamSetting.value.POIfadeDistance = value
  await udStream.saveSettings(udstreamStore.getUdstreamSetting)
}

//更改图像的缩放距离
const selectImageZoomDistanceHandle = async (value: number) => {
  thisUdstreamSetting.value.ImageRescaleDistance = value
  await udStream.saveSettings(udstreamStore.getUdstreamSetting)
}

//更改图像的加载距离
const selectImageLoadDistanceHandle = async (value: number) => {
  thisUdstreamSetting.value.imageLoadDistance = value
  await udStream.saveSettings(udstreamStore.getUdstreamSetting)
}

//高亮的厚度
const selectObjectHighlightingThicknessHandle = async (value: number) => {
  thisUdstreamSetting.value.objectHighlighting.thickness = value
  await udStream.saveSettings(udstreamStore.getUdstreamSetting)
}

//高亮的颜色
const selectObjectHighlightingColorHandle = async (value: string) => {
  //将sting  转为数组
  if (value) {
    const matchRGBA = value.match(/(\d(\.\d+)?)+/g)
    if (matchRGBA) {
      const arr = [
        parseFloat(matchRGBA[0]) / 255,
        parseFloat(matchRGBA[1]) / 255,
        parseFloat(matchRGBA[2]) / 255,
        parseFloat(matchRGBA[2])
      ]
      thisUdstreamSetting.value.objectHighlighting.colour = arr
      await udStream.saveSettings(thisUdstreamSetting.value)
    }
  }
}

//开启或关闭地形
const enableMapHight = async (value: boolean) => {
  demEditAble.value = value
  thisUdstreamSetting.value.maptiles.demEnabled = value
  await udStream.saveSettings(udstreamStore.getUdstreamSetting)
}

//将dem的地址修改
const editDemUrl = async () => {
  demEditAble.value = false
  // thisUdstreamSetting.value.maptiles.DEMServerURL = url
  // await udStream.saveSettings(udstreamStore.getUdstreamSetting)
}



//地形的地址修改
const modifyInputUrlName = async (e: Event) => {
  thisUdstreamSetting.value.maptiles.DEMServerURL = e.target.value ? e.target.value : ''
  await udStream.saveSettings(udstreamStore.getUdstreamSetting)
  demEditAble.value = true
}


//设置数字高程的层级
const selectMapHightLevelHandle = async (maxLevel: number) => {
  thisUdstreamSetting.value.maptiles.DEMMaxLevels = maxLevel
  await udStream.saveSettings(udstreamStore.getUdstreamSetting)
}

onMounted(() => {
  thisUdstreamSetting.value = toRaw(udstreamStore.getUdstreamSetting)
  if (thisUdstreamSetting.value?.visualization) {
    showThePanel.value = true
  }
})

watch(
  () => udstreamStore.getUdstreamSetting,
  (nv, ov) => {
    if (nv) {
      thisUdstreamSetting.value = toRaw(nv)
      if (Object.keys(thisUdstreamSetting.value).length > 0) {
        showThePanel.value = true
      }
    }
  }
)
</script>
<style scoped>
.page-config {
  width: 90%;
  margin: 0 auto;
}
.row-item {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin: 12px auto;
}

.row-item-cloum {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.row-item-cloum-item {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin: 12px auto;
}
.row-item-no {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin: 0px auto;
}
.row-item-txt {
  width: 100px;
  text-align: left;
  margin-left: 10px;
}
.row-item :deep(.el-slider__input) {
  width: 100px;
}
.row-item :deep(.el-input__wrapper) {
  box-shadow: none;
}
.row-item-no :deep(.el-slider__input) {
  width: 100px;
}
.row-item-no :deep(.el-input__wrapper) {
  box-shadow: none;
}
</style>
