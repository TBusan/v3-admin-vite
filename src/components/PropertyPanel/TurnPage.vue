<template>
  <div class="udstream-camera">
    <el-radio-group v-model="turnRadio" @change="changeTheRadio">
      <el-radio v-for="item in radioOptions" :label="item.key" :key="item.key">
        <div class="viewPoint-class">
          <div>{{ item.label }}</div>
          <el-tooltip class="box-item" effect="dark" content="设置转场视点" placement="top">
            <el-icon><Edit @click="saveCurrentViewPoint(item)" /></el-icon>
          </el-tooltip>
        </div>
      </el-radio>
    </el-radio-group>
  </div>
</template>
<script lang="ts" setup>
import { ref, watch, onMounted } from "vue"

import * as udStream from "@/udStream/udStream"
import { usePageInfoStore } from "@/store/modules/pageInfoStore"
import { useUdStreamCameraStore } from "@/store/modules/udstreamCamera"
import { Edit } from "@element-plus/icons-vue"
import { ElMessage } from "element-plus"
import { UdstreamCameraInfoStoreEnums } from "@/store/modules/udstreamCamera.d"
import { ProjectNode, ProjectNodeType } from "@/udStream/types/ProjectNode"
// 与Pinian有关
const pageInfoStore = usePageInfoStore()
const udStreamCameraStore = useUdStreamCameraStore()
const turnRadio = ref(1)
// const radioOptions = ref([
//   {
//     label: "默认",
//     key: 1,
//     isLeaf: true,
//     title: "默认",
//     value: "默认",
//     data: null
//   }
// ])
const radioOptions = ref([])

//保存当前的中心点位信息 到localstrorage
const saveSelectCameraCenter2LocalStrorage = (type: string, cameraUUID = null) => {
  try {
    if (type == "default") {
      const udStreamPageListStr = localStorage.getItem("udstreamPageList")
      if (udStreamPageListStr && udStreamPageListStr.trim()) {
        const pageId = pageInfoStore.getSelectPageInfo?.id //当前页面的ID
        const udStreamPageListJson = JSON.parse(udStreamPageListStr)
        const findItem = udStreamPageListJson.find((item: any) => {
          return item.id == pageId
        })
        findItem.cameraCenterUUID = cameraUUID //默认的情况就设置为null
        localStorage.setItem("udstreamPageList", JSON.stringify(udStreamPageListJson))
        ElMessage({
          message: "设置转场视点成功,需要保存项目才会生效！",
          type: "success",
          duration: 2000
        })
      } else {
        ElMessage({
          message: "请先保存项目！",
          type: "warning",
          duration: 3000
        })
      }
    } else if (type == "turn") {
      // 其它的视点   场景定位到其它的视点
      // const position = await udStream.getCameraInfo()
      // const heading = position.camera.heading
      // const pitch = position.camera.pitch
      // const alt = position.camera.alt
      // const cameraInfo = {
      //   lon: position.camera.lon,
      //   lat: position.camera.lat,
      //   alt: alt,
      //   heading: heading,
      //   pitch: pitch
      // }
      //从localStrorage中获取信息
      const udStreamPageListStr = localStorage.getItem("udstreamPageList")
      if (udStreamPageListStr && udStreamPageListStr.trim()) {
        //当前页面的ID
        const pageId = pageInfoStore.getSelectPageInfo?.id
        const udStreamPageListJson = JSON.parse(udStreamPageListStr)
        // const findItem = udStreamPageListJson.find((item: any) => {
        //   return item.id == pageId
        // })
        // findItem.cameraCenterUUID = cameraUUID
        udStreamPageListJson.map((item: any) => {
          if (item.id == pageId) {
            item.cameraCenterUUID = cameraUUID
            return
          }
        })
        localStorage.setItem("udstreamPageList", JSON.stringify(udStreamPageListJson))
        ElMessage({
          message: "设置转场视点成功,需要保存项目才会生效！",
          type: "success",
          duration: 2000
        })
      } else {
        ElMessage({
          message: "请先保存项目！",
          type: "warning",
          duration: 3000
        })
      }
    }
  } catch (err) {
    ElMessage({
      message: "设置转场视点失败！",
      type: "error",
      duration: 2000
    })
  }
}

// //更改radio的设置
// const changeTheRadio = async (params: any) => {
//   // 默认设置的话  就是当前的位置
//   if (params == 1) {
//     //不需要保存  做下记录就ok  告诉其它组件当前选择的是  默认的转场
//     saveSelectCameraCenter2LocalStrorage("default")
//   } else {
//     const find_item = radioOptions.value.find((item: any) => {
//       return item.key == params
//     })
//     //其它的节点信息
//     if (find_item?.data?.itemtype != ProjectNodeType.Custom) {
//       //移动到当前节点
//       udStream.moveToWhenPossible(find_item?.data?.UUID)
//       //保存
//       saveSelectCameraCenter2LocalStrorage("turn", find_item?.data?.UUID)
//     }
//   }
// }

//设置默认转场设置
const changeTheRadio = async (params: any) => {
  const find_item = radioOptions.value.find((item: any) => {
    return item.key == params
  })
  //其它的节点信息
  if (find_item && find_item?.data?.itemtype != ProjectNodeType.Custom) {
    //移动到当前节点
    udStream.moveToWhenPossible(find_item?.data?.UUID)
  }
}

//设置当前的视点
const saveCurrentViewPoint = (params: any) => {
  if (params && params?.data?.UUID) {
    //保存
    console.log(params?.data?.UUID)
    saveSelectCameraCenter2LocalStrorage("turn", params?.data?.UUID)
  }
}

onMounted(() => {
  const cameraInfoList = udStreamCameraStore.getUdstreamCameraInfo
  if (cameraInfoList && cameraInfoList.length > 0) {
    // const temp_arr = [
    //   {
    //     label: "默认",
    //     key: 1,
    //     isLeaf: true,
    //     title: "默认",
    //     value: "默认",
    //     data: null
    //   }
    // ]
    const temp_arr = []
    for (let k = 0; k < cameraInfoList.length; k++) {
      // cameraInfoList[k].key = k + 2
      cameraInfoList[k].key = k
      temp_arr.push(cameraInfoList[k])
    }
    radioOptions.value = temp_arr
  }
})

watch(
  () => udStreamCameraStore.getUdstreamCameraInfo,
  (nv, ol) => {
    if (nv) {
      if (nv && nv.length > 0) {
        // const temp_arr = [
        //   {
        //     label: "默认",
        //     key: 1,
        //     isLeaf: true,
        //     title: "默认",
        //     value: "默认",
        //     data: null
        //   }
        // ]
        const temp_arr = []
        for (let k = 0; k < nv.length; k++) {
          nv[k].key = k
          temp_arr.push(nv[k])
        }
        radioOptions.value = temp_arr
      }else{
        radioOptions.value =[]
      }
    }
  },
  {
    deep: true
  }
)
</script>
<style scoped>
.udstream-camera {
  margin: 12px;
}
.udstream-camera :deep(.el-radio-group) {
  /* display: block; */
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  justify-items: center;
}
.udstream-camera :deep(.el-radio) {
  margin-right: 0;
  width: 100%;
}
.udstream-camera :deep(.el-radio__inner) {
  display: none;
}
.udstream-camera :deep(.el-radio__label) {
  width: 100%;
}
.viewPoint-class {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin: 8px 0;
}
</style>
