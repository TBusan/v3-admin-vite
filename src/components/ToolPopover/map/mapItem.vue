<template>
  <div class="map-list">
    <div class="map-item-div" v-for="item in mapTypeList" :key="(item as any).id">
      <input
        @click="selectTheScene($event, item)"
        class="ck-radio-st"
        type="radio"
        :id="(item as any).id"
        name="modelSelect"
      />
      <label class="ck-radio-label" :for="(item as any).id">
        <img class="list-item-img" v-lazy="item.img" alt="文件夹" />
        <div>{{ (item as any).name }}</div>
      </label>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted } from "vue"

import openStreetMapImg from "@/assets/map/euc-osm-base.png"
import aerialMapImg from "@/assets/map/euc-az-aerial.png"
import roadsMapImg from "@/assets/map/euc-az-roads.png"
import stamenTonerMapImg from "@/assets/map/stamen-toner.png"
import stamenTerrainMapImg from "@/assets/map/stamen-terrain.png"
import esriWorldimageryMapImg from "@/assets/map/esri-worldimagery.png"
import watercolorMapImg from "@/assets/map/stamen-watercolor.png"
import customMapImg from "@/assets/map/custom.png"

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
    name: "Custom",
    img: customMapImg,
    copyright: null,
    mode: "Custom",
    modeStr: "custom",
    serverAddr: null,
    tileAddressUUID: null
  }
])

const emit = defineEmits(["sendSelectBaseMapHandle"])
const selectBaseMap = ref(null as unknown as any)
//选择操作的模型  (场景只能进行单选)
const selectTheScene = (e: any, map: any) => {
  if (e?.target?.checked) {
    //选中
    selectBaseMap.value = map
    console.log("被选中的元素", selectBaseMap.value)
    //将值传递给父组件
    emit("sendSelectBaseMapHandle", selectBaseMap.value)
  }
}

onMounted(() => {})
</script>
<style lang="scss" scoped>
.map-list {
  display: grid;
  grid-template-columns: 12.5% 12.5% 12.5% 12.5% 12.5% 12.5%;
}
.map-item-div {
  margin: 12px;
  text-align: center;
}

.ck-radio-st {
  display: none;
}

.ck-radio-st:checked + label {
  display: inline-block;
  color: #05a6ca;
  // border: 1px solid red;
}

.ck-radio-label:hover {
  cursor: pointer;
}
.list-item-img {
  width: 80px;
  height: 80px;
}
</style>
