<template>
  <div>底图配置</div>
  <el-collapse v-model="activeNamesBase" @change="handleChange">
    <el-collapse-item title="底图资源" name="1">
      <div class="map-list">
        <div class="map-list-item" v-for="item in mapTypeList" :key="item.key" @click="selectMapItem(item)">
          <input
            class="map-list-radio"
            type="radio"
            :id="item.id"
            name="selectMap"
            :checked="item.key == selectMapValue"
          />
          <label class="label-item" :for="item.id">
            <img class="label-img" :src="item.img" />
            <span class="radio-label-txt">{{ item.name }}</span>
          </label>
        </div>
      </div>
      <div class="custom-map-url" v-show="selectMapValue == 'Custom'">
        <el-input
          v-model="customMapUrl"
          @keyup.enter.native="mapUrlInputName"
          :disabled="mapUrlEditAble"
          class="w-50 m-2"
          placeholder="地图服务地址"
          @keydown.stop
        />
        <el-tooltip class="box-item" effect="dark" content="enter键结束输入" placement="top-start">
          <el-icon><Edit @click="ableTheMapURl" /></el-icon>
        </el-tooltip>
      </div>
    </el-collapse-item>
  </el-collapse>
  <el-collapse v-model="activeNamesParams" @change="handleChange">
    <el-collapse-item title="属性设置" name="1">
      <el-row>
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">地图高度</span>
        <el-slider v-model="mapHeightValue" @change="changeMapHeight" :min="-1000" :max="1000" :step="1" />
      </el-row>
      <el-row>
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">不透明度</span>
        <el-slider v-model="mapTransparency" @change="changeMapTransparency" :min="0" :max="1" :step="0.1" />
      </el-row>
      <el-row>
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">最大深度</span>
        <el-select v-model="mapMostDeep" placeholder="Select" @change="handleUpdateMapDeep">
          <el-option v-for="item in mapMostDeepOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-row>
      <el-row>
        <span class="ml-3 w-35 text-gray-400 inline-flex items-center">底图可见</span>
        <el-switch v-model="optionData.isVisible" @change="switchVisible" />
      </el-row>
    </el-collapse-item>
  </el-collapse>
</template>
<script lang="ts" setup>
import { PropType, ref, onMounted, watch } from "vue"
import { ProjectNode } from "@/udStream/types/ProjectNode"
import openStreetMapImg from "@/assets/map/euc-osm-base.png"
import aerialMapImg from "@/assets/map/euc-az-aerial.png"
import roadsMapImg from "@/assets/map/euc-az-roads.png"
import stamenTonerMapImg from "@/assets/map/stamen-toner.png"
import stamenTerrainMapImg from "@/assets/map/stamen-terrain.png"
import esriWorldimageryMapImg from "@/assets/map/esri-worldimagery.png"
import watercolorMapImg from "@/assets/map/stamen-watercolor.png"
import customMapImg from "@/assets/map/custom.png"
import { Edit } from "@element-plus/icons-vue"

interface MapType {
  url: string
  id: string
  key: string
  name: string
  img: string
}

const props = defineProps({
  optionData: {
    type: Object as PropType<ProjectNode>,
    required: true
  }
})

let currentUdstreamNode = props.optionData //这个值是最重要的

const mapUrlEditAble = ref(true) //自定义地图的路径是否可以编辑
const customMapUrl = ref("") //自定义地图的url
//深度
const mapMostDeep = ref(0)
const mapMostDeepOptions = [{}]
//高度
const mapHeightValue = ref(0)
//不透明度
const mapTransparency = ref(1)

//折叠栏被激活的栏目
const activeNamesBase = ref("1")
const activeNamesParams = ref("1")
//被选中的地图
const selectMapInfo = ref({
  url: "",
  id: "",
  key: "",
  name: "",
  img: null,
  copyright: "",
  mode: "",
  modeStr: "",
  serverAddr: "",
  tileAddressUUID: ""
})
const selectMapValue = ref("")
const mapTypeList = ref([
  {
    url: "",
    id: "openStreetMaps",
    key: "Open Street Maps",
    name: "Open Street Maps",
    img: openStreetMapImg,
    copyright: "© OpenStreetMap contributors",
    mode: "Open Street Maps",
    modeStr: "euc-osm-base",
    serverAddr: "https://a.tile.openstreetmap.org/{0}/{1}/{2}.png",
    tileAddressUUID: "https://slippy.vault.euclideon.com"
  },
  {
    url: "",
    id: "esriWorldImagery",
    key: "Esri WorldImagery",
    name: "Esri WorldImagery",
    img: esriWorldimageryMapImg,
    copyright:
      "Tiles © Esri - Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
    mode: "Esri WorldImagery",
    modeStr: "esri-worldimagery",
    serverAddr: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{0}/{2}/{1}",
    tileAddressUUID: null
  },
  {
    url: "",
    id: "azureAerial",
    key: "Azure Aerial",
    name: "Azure Aerial",
    img: aerialMapImg,
    copyright: "© 1992 - 2020 TomTom",
    mode: "Azure Aerial",
    modeStr: "euc-az-aerial",
    serverAddr:
      "https://atlas.microsoft.com/map/tile?subscription-key=1JId2WktwcPRcrzINnyI5UkevloxpF-4GvS0ElCEe0k&api-version=2.0&tilesetId=microsoft.imagery&zoom={0}&x={1}&y={2}",
    tileAddressUUID: "https://slippy.vault.euclideon.com/aerial"
  },
  {
    url: "",
    id: "azureRoads",
    key: "Azure Roads",
    name: "Azure Roads",
    img: roadsMapImg,
    copyright: "© 1992 - 2020 TomTom",
    mode: "Azure Roads",
    modeStr: "euc-az-roads",
    serverAddr:
      "https://atlas.microsoft.com/map/tile?subscription-key=1JId2WktwcPRcrzINnyI5UkevloxpF-4GvS0ElCEe0k&api-version=2.0&tilesetId=microsoft.base.road&zoom={0}&x={1}&y={2}",
    tileAddressUUID: "https://slippy.vault.euclideon.com/roads"
  },
  {
    url: "",
    id: "stamenToner",
    key: "Stamen Toner",
    name: "Stamen Toner",
    img: stamenTonerMapImg,
    copyright: "Map tiles by Stamen Design, under CC BY 3.0. Data by OpenStreetMap, under ODbL",
    mode: "Stamen Toner",
    modeStr: "stamen-toner",
    serverAddr: "https://stamen-tiles.a.ssl.fastly.net/toner/{0}/{1}/{2}.png",
    tileAddressUUID: null
  },
  {
    url: "",
    id: "stamenTerrain",
    key: "Stamen Terrain",
    name: "Stamen Terrain",
    img: stamenTerrainMapImg,
    copyright: "Map tiles by Stamen Design, under CC BY 3.0. Data by OpenStreetMap, under ODbL",
    mode: "Stamen Terrain",
    modeStr: "stamen-terrain",
    serverAddr: "https://stamen-tiles.a.ssl.fastly.net/terrain/{0}/{1}/{2}.png",
    tileAddressUUID: null
  },
  {
    url: "",
    id: "stamenWatercolor",
    key: "Stamen Watercolor",
    name: "Stamen Watercolor",
    img: watercolorMapImg,
    copyright: "Map tiles by Stamen Design, under CC BY 3.0. Data by OpenStreetMap, under CC BY SA",
    mode: "Stamen Watercolor",
    modeStr: "stamen-watercolor",
    serverAddr: "https://stamen-tiles.a.ssl.fastly.net/watercolor/{0}/{1}/{2}.png",
    tileAddressUUID: null
  },
  {
    url: "",
    id: "custom",
    key: "Custom",
    name: "自定义",
    img: customMapImg,
    copyright: null,
    mode: "Custom",
    modeStr: "custom",
    serverAddr: null,
    tileAddressUUID: null
  }
])

//允许地图服务地址可以编辑
const ableTheMapURl = () => {
  mapUrlEditAble.value = false
}

//点击某个底图资源之后的操作
const selectMapItem = (params: MapType) => {
  selectMapValue.value = params.key
  // selectMapInfo.value = params as any
  //触发底图的改变
  const mapModeStr = mapTypeList.value.find((item) => {
    return item.key == params.key
  })
  if (mapModeStr?.modeStr) {
    currentUdstreamNode.SetMetadataString("type", mapModeStr.modeStr)
  }
}

const handleChange = () => {}

//设置可见性
const switchVisible = (val: boolean) => {
  currentUdstreamNode.isVisible = val
}
//更改底图的深度
const handleUpdateMapDeep = (depth: number) => {
  currentUdstreamNode.SetMetadataInt("maxDepth", depth)
}

//更改底图的高度
const changeMapHeight = (height: number) => {
  currentUdstreamNode.SetMetadataDouble("mapHeight", height)
}

//更改底图的透明度
const changeMapTransparency = (transparency: number) => {
  currentUdstreamNode.SetMetadataDouble("transparency", transparency)
}

const updateAttribute = async () => {
  currentUdstreamNode = props.optionData //这个值是最重要的
  // let maps = await udStream.GetMapTileProviders()
  let mapType = currentUdstreamNode.GetMetadataString("type", "euc-az-aerial")
  console.log("mapType - esri-worldimagery")
  console.log(mapType)
  if (mapType == "esri-worldimagery") {
    selectMapValue.value = "Esri WorldImagery"
  } else if (mapType == "custom") {
    selectMapValue.value = "Custom"
    customMapUrl.value = currentUdstreamNode.GetMetadataString("customServerURL", "")
  } else if (mapType == "euc-osm-base") {
    selectMapValue.value = "Open Street Maps"
  } else if (mapType == "euc-az-aerial") {
    selectMapValue.value = "Azure Aerial"
  } else if (mapType == "euc-az-roads") {
    selectMapValue.value = "Azure Roads"
  } else if (mapType == "stamen-toner") {
    selectMapValue.value = "Stamen Toner"
  } else if (mapType == "stamen-terrain") {
    selectMapValue.value = "Stamen Terrain"
  } else if (mapType == "stamen-watercolor") {
    selectMapValue.value = "Stamen Watercolor"
  }
  // this.selectedMapIndex = this.maps.findIndex((map: udStream.MapTile) => map.modeStr === this.mapType);
  // this.customServerURL = currentUdstreamNode.GetMetadataString('customServerURL', '');
  // this.customAttribution = currentUdstreamNode.GetMetadataString('customAttribution', '');
  mapHeightValue.value = currentUdstreamNode.GetMetadataDouble("mapHeight", 0)
  mapTransparency.value = currentUdstreamNode.GetMetadataDouble("transparency", 1)
  mapMostDeep.value = currentUdstreamNode.GetMetadataInt("maxDepth", 19)
}

//enter 输入地图地址
const mapUrlInputName = () => {
  // console.log(customMapUrl.value)
  if (customMapUrl.value) {
    currentUdstreamNode.SetMetadataString("serverURL", customMapUrl.value)
    currentUdstreamNode.SetMetadataString("customServerURL", customMapUrl.value)
  }
  mapUrlEditAble.value = true
}

const stopKeyDownEvent = (event: KeyboardEvent) => {}

onMounted(async () => {
  updateAttribute()
})

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
.map-list {
  display: grid;
  grid-template-columns: 50% 50%;
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
  width: 80px;
  height: 80px;
}
.radio-label-txt {
  display: block;
}
.custom-map-url {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
</style>
