<template>
  <div class="app-container center" v-if="displayCanvas">
    <udstream-edit @no-webgl2="noWebGL2 = true" @loaded="loading = false" />
    <property-panel />
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, computed } from "vue"
import * as udStream from "@/udStream/udStream"
//组件
import UdstreamEdit from "./udstreamEdit.vue"
import PropertyPanel from "./PropertyPanel.vue"
import { fethProjectApiWithEulee } from "@/api/euleeSource"
import { useUdstreamStore } from "@/store/modules/udstreamStore"
import { UdstreamStoreEnums } from "@/store/modules/udstreamStore.d"
import { usePageInfoStore } from "@/store/modules/pageInfoStore"
import { PageStoreEnums } from "@/store/modules/pageInfoStore.d"
import { fetchRouteProjectId } from "@/utils/router"
import { ElMessage, ElMessageBox } from "element-plus"
const udstreamStore = useUdstreamStore()
const pageInfoStore = usePageInfoStore()
//接口

const noWebGL2 = ref(false)
const loading = ref(true)
const runtimeError = ref(false)

const displayCanvas = computed(() => {
  return !noWebGL2.value && !runtimeError.value
})

const theProjectId = fetchRouteProjectId()
//获取后台传递的JSON数据
const fetchJsonDataFromBack = (project_formData: FormData) => {
  fethProjectApiWithEulee(project_formData)
    .then((res: any) => {
      //将项目的名称保存到Pinia
      //将项目的json_content 保存到localstrorage
      if (
        res.data.json_content &&
        res.data.json_content.json_content &&
        res.data.json_content.json_content.trim() != ""
      ) {
        if (res.data.json_content.name) {
          udstreamStore.setItem(UdstreamStoreEnums.PROJECT_TITLE, res.data.json_content.name)
        }
        //重置
        localStorage.setItem("udstreamPageList", res.data.json_content.json_content)
        //以字符串的形式加载场景
        const json_content = JSON.parse(res.data.json_content.json_content)
        if (json_content[0].udjson) {
          //判读坐标系
          if (json_content[0].udjson.attributes && json_content[0].udjson.attributes.defaultcrs) {
            let msg =
              "此页面场景加载的数据是" +
              json_content[0].udjson.attributes.defaultcrs +
              "坐标，" +
              "此后加载的数据将都在此坐标下！"
            ElMessage({
              message: msg,
              type: "info",
              duration: 5000
            })
          } else if (json_content[0].udjson.attributes && json_content[0].udjson.attributes.defaultcrs == 0) {
            let msg = "此页面场景加载的数据是无地理位置的，以后加载的数据将都无地理位置！"
            ElMessage({
              message: msg,
              type: "info",
              duration: 5000
            })
          }
          setTimeout(() => {
            //udstream  根据loaded  根本无法判断啥时候初始化完成，其实很多时候，并没有初始化完成...
            udStream.loadSceneJson(JSON.stringify(json_content[0].udjson))
            if (json_content[0].cameraCenterUUID) {
              // 设置相机位置
              const cameraCenterUUID = json_content[0].cameraCenterUUID
              udStream.moveToWhenPossible(cameraCenterUUID)
            }
          }, 2000)
        }

        //页面的信息
        if (json_content[0].name) {
          pageInfoStore.setItem(PageStoreEnums.PAGE_INFO, { name: json_content[0].name, id: json_content[0].id }) //当前第一个页面的信息
        }
        //更改页面相关的设置
        if (json_content[0].udsetting && Reflect.ownKeys(json_content[0].udsetting).length > 0) {
          //将udstream的setting 存储到Pinia中
          udstreamStore.setItem(UdstreamStoreEnums.UDSTREAM_SETTING, json_content[0].udsetting) //当前第一个页面的设置
          //将该设置设置成udstream的设置
          udStream.saveSettings(json_content[0].udsetting)
        } else {
          udStream.getSettings().then((settings) => {
            settings.maptiles.demEnabled = false // 启动地形   globleUdstreamDem => config/udjson.js中的全局变量
            // settings.maptiles.DEMServerURL = globleUdstreamDem.url // 地形地址   globleUdstreamDem => config/udjson.js中的全局变量
            // settings.objectHighlighting.enable = false                         // 点击模型高亮
            // settings.mouseSnap.range = 30
            // settings.POIfadeDistance = 100
            settings.pointMode = 1 // 点=>2
            settings.tools.label.backgroundColour = [0, 0, 0, 0.5] // 背景色
            udstreamStore.setItem(UdstreamStoreEnums.UDSTREAM_SETTING, settings)
            udStream.saveSettings(settings)
          })
        }
        udstreamStore.setItem(UdstreamStoreEnums.PEGE_LISTREQUEST_END, true)
      } else if (res.data.json_content) {
        localStorage.setItem("udstreamPageList", "" as any)
        localStorage.setItem("udstreamPageInfo", "" as any)
        udstreamStore.setItem(UdstreamStoreEnums.PEGE_LISTREQUEST_END, true)
        // pageInfoStore.setItem(PageStoreEnums.PAGE_INFO, { name: json_content[0].name, id: json_content[0].id }) //当前第一个页面的信息
        //新建项目  没有东西
        // console.log("进入自定义设置....3")
        ElMessageBox.confirm("是否将该页面置为无坐标系（可以更好适配云世界APP）?", "坐标系设置", {
          confirmButtonText: "是",
          cancelButtonText: "否",
          type: "warning"
        })
          .then(() => {
            // console.log("确认了")
            udStream.createBlankScene("_balck", 0)
            udStream.getSettings().then((settings) => {
              settings.maptiles.demEnabled = false // 启动地形   globleUdstreamDem => config/udjson.js中的全局变量
              settings.pointMode = 1 // 点=>2
              settings.skybox.type = 0 //
              settings.tools.label.backgroundColour = [0, 0, 0, 0.5] // 背景色
              udstreamStore.setItem(UdstreamStoreEnums.UDSTREAM_SETTING, settings)
              udStream.saveSettings(settings)
            })
          })
          .catch(() => {
            // console.log("取消了")
            udStream.createBlankScene("_balck", 4978)
            udStream.getSettings().then((settings) => {
              settings.maptiles.demEnabled = false // 启动地形   globleUdstreamDem => config/udjson.js中的全局变量
              settings.pointMode = 1 // 点=>2
              settings.tools.label.backgroundColour = [0, 0, 0, 0.5] // 背景色
              udstreamStore.setItem(UdstreamStoreEnums.UDSTREAM_SETTING, settings)
              udStream.saveSettings(settings)
            })
          })
      } else {
        //请求的项目没有返回任何数据    应该是该项目不存在
        ElMessage({
          message: "该项目不存在！请先确定该项目是否存在，再做编辑操作。",
          type: "warning",
          duration: 6000
        })
        localStorage.setItem("udstreamPageList", "" as any)
        localStorage.setItem("udstreamPageInfo", "" as any)
        udstreamStore.setItem(UdstreamStoreEnums.PEGE_LISTREQUEST_END, true)
        udStream.getSettings().then((settings) => {
          debugger
          settings.maptiles.demEnabled = false // 启动地形   globleUdstreamDem => config/udjson.js中的全局变量
          settings.pointMode = 1 // 点=>2
          settings.tools.label.backgroundColour = [0, 0, 0, 0.5] // 背景色
          udstreamStore.setItem(UdstreamStoreEnums.UDSTREAM_SETTING, settings)
          udStream.saveSettings(settings)
        })
      }
    })
    .catch((err) => {
      udstreamStore.setItem(UdstreamStoreEnums.PEGE_LISTREQUEST_END, true) //请求结束
    })
}

watch(loading, async (value) => {
  if (parseFloat(theProjectId).toString() == "NaN") {
    ElMessage.warning("路径中不含有项目ID,请返回优立云查看跳转路径！")
    return
  }

  udstreamStore.setItem(UdstreamStoreEnums.UDSTREAM_CANVAS_LOADED, true) //udstream已经加载完成
  //请求接口数据  获取json
  const project_formData = new FormData()
  project_formData.append("project_id", parseFloat(theProjectId).toString())

  const windowUrl = document.location.hash.split("?").pop() || ""
  if (windowUrl) {
    const splitParas = windowUrl.split("=")
    if (splitParas.length > 1) {
      const organizationStr = splitParas[1]
      //如果传入了组织机构
      project_formData.append("group_id", organizationStr) //这个groupId  应该从项目里面获取到才对
    } else {
      project_formData.append("group_id", "0") //这个groupId  应该从项目里面获取到才对
    }
  } else {
    project_formData.append("group_id", "0") //这个groupId  应该从项目里面获取到才对
  }
  // const elueeOrganization = localStorage.getItem("elueeOrganization")
  // if (elueeOrganization) {
  //   project_formData.append("group_id", elueeOrganization)
  // } else {
  //   project_formData.append("group_id", "0")
  // }
  // 获取数据   顺便重置了 localstrorage
  // udStream.createBlankScene("_balck", 0) //先置为无坐标系的空间
  fetchJsonDataFromBack(project_formData)
})

onMounted(() => {
  window.onerror = function () {
    loading.value = false
    if (globalThis.Module) {
      globalThis.Module.setStatus("Exception thrown, see JavaScript console")
      globalThis.Module.setStatus = function (text) {
        if (text) {
          console.error("[post-exception status] " + text)
          ElMessage({
            message: "udstream引擎报错，请刷新页面继续，或关闭页面后重新打开！",
            type: "error",
            duration: 0
          })
          runtimeError.value = true
        }
      }
    }
  }
})
</script>

<style lang="scss" scoped>
.center {
  height: 100%;
  display: flex;
  justify-content: center;
}
.canvas-container {
  width: 100%;
  height: 100%;
}
</style>
