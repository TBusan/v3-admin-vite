<template>
  <div class="navigation-bar">
    <Hamburger :is-active="sidebar.opened" class="hamburger" @toggle-click="toggleSidebar" />
    <Breadcrumb class="breadcrumb" />
    <div class="project-name">
      <div :title="pageTitle">{{ pageTitle }}</div>
    </div>
    <div class="right-menu">
      <el-switch v-model="openSaveAuto" active-text="自动保存" />
      <el-tooltip class="box-item" content="一分钟保存一次" placement="bottom">
        <el-tag class="auto-save" v-show="!saveAutoBntShow"> 等待自动保存</el-tag>
      </el-tooltip>
      <svg-icon v-show="saveAutoBntShow" class="udstream-tool-svg udstream-tool-svg-loading" :name="'loadingAuto'" />
      <el-tooltip class="box-item" content="保存" placement="bottom">
        <div>
          <svg-icon v-show="saveBntShow" class="udstream-tool-svg udstream-tool-svg-loading" :name="'loading'" />
          <svg-icon v-show="!saveBntShow" class="udstream-tool-svg" :name="'save-button'" @click="saveProjectHandle" />
        </div>
      </el-tooltip>
      <Screenfull v-if="showScreenfull" class="right-menu-item" />
      <ThemeSwitch v-if="showThemeSwitch" class="right-menu-item" />
      <el-dropdown class="right-menu-item">
        <div class="right-menu-avatar">
          <!-- <el-avatar :icon="UserFilled" :size="30" /> -->
          <img class="avator-img" :src="avatorImg" />
          <!-- <span>{{ userStore.username || "admin" }}</span> -->
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item divided @click="logout">
              <span style="display: block">退出登录</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed, ref, watch } from "vue"
import { useAppStore } from "@/store/modules/app"
import { useSettingsStore } from "@/store/modules/settings"
import { useUserStore } from "@/store/modules/user"
import { UserFilled } from "@element-plus/icons-vue"
import Breadcrumb from "../Breadcrumb/index.vue"
import Hamburger from "../Hamburger/index.vue"
import ThemeSwitch from "@/components/ThemeSwitch/index.vue"
import Screenfull from "@/components/Screenfull/index.vue"
//信息显示
import { ElMessage } from "element-plus"
//Pinia相关
import { useUdstreamStore } from "@/store/modules/udstreamStore"
import { UdstreamStoreEnums } from "@/store/modules/udstreamStore.d"
import { usePageInfoStore } from "@/store/modules/pageInfoStore"

import { savaProject2Back } from "@/utils/tool"
//图像
import avatorImg from "@/assets/avator/avator.png"
const appStore = useAppStore()
const settingsStore = useSettingsStore()
const userStore = useUserStore()

const udstreamStore = useUdstreamStore()
const pageInfoStore = usePageInfoStore()

const saveBntShow = ref(udstreamStore.getUdstreamScenceSaved)
const saveAutoBntShow = ref(udstreamStore.getUdstreamScenceAutoSaved)

const openSaveAuto = ref(false) //开启自动保存   false:不开启   true:开启

const pageTitle = ref("")

const sidebar = computed(() => {
  return appStore.sidebar
})

const showThemeSwitch = computed(() => {
  return settingsStore.showThemeSwitch
})
const showScreenfull = computed(() => {
  return settingsStore.showScreenfull
})

// 同步状态枚举
enum SyncEnum {
  // 等待
  PENDING,
  // 开始
  START,
  // 成功
  SUCCESS,
  // 失败
  FAILURE
}
const statusDesc = ref("")
const descType = ref("")
const statusDescObj = {
  [SyncEnum.PENDING]: {
    text: "等待自动同步",
    type: ""
  },
  [SyncEnum.START]: {
    text: "正在同步中",
    type: "success"
  },
  [SyncEnum.SUCCESS]: {
    text: "同步成功！",
    type: "success"
  },
  [SyncEnum.FAILURE]: {
    text: "同步失败!",
    type: "error"
  }
}

const toggleSidebar = () => {
  appStore.toggleSidebar(false)
  window.dispatchEvent(new Event('resize'))  //主动触发浏览器的resize事件  让画布自适应
}
const logout = () => {
  ElMessage({
    message: "研发中...",
    type: "success"
  })
}

//节流函数
function throttle(func, wait, options = null) {
  var timeout, context, args
  var previous = 0
  if (!options) options = {}

  var later = function () {
    previous = options.leading === false ? 0 : new Date().getTime()
    timeout = null
    func.apply(context, args)
    if (!timeout) context = args = null
  }

  var throttled = function () {
    var now = new Date().getTime()
    if (!previous && options.leading === false) {
      previous = now
    }
    var remaining = wait - (now - previous)
    context = this
    args = arguments
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      previous = now
      func.apply(context, args)
      if (!timeout) context = args = null
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining)
    }
  }
  return throttled
}

//保存项目的相关操作
const saveProjectHandle = async () => {
  udstreamStore.setItem(UdstreamStoreEnums.UDSTREAM_SCENCE_SAVED, true)
  const params = new FormData()
  //从路由中获取项目的ID
  let routerParams = document.location.hash.split("/").pop() || ""
  let projectId = ""
  if (routerParams) {
    projectId = routerParams.split("?")[0]
  }
  params.append("project_id", projectId)
  //从路由获取groupId
  const windowUrl = document.location.hash.split("?").pop() || ""
  if (windowUrl) {
    const splitParas = windowUrl.split("&")
    if (splitParas.length > 1) {
      const organizationStr = splitParas[1].split("=")[1]
      //如果传入了组织机构
      params.append("group_id", organizationStr) //这个groupId  应该从项目里面获取到才对
    } else {
      params.append("group_id", "0") //这个groupId  应该从项目里面获取到才对
    }
  } else {
    params.append("group_id", "0") //这个groupId  应该从项目里面获取到才对
  }
  const cb = () => {
    setTimeout(() => {
      udstreamStore.setItem(UdstreamStoreEnums.UDSTREAM_SCENCE_SAVED, false)
    }, 800)
  }
  savaProject2Back(params, udstreamStore, pageInfoStore, cb)
}

//保存项目的相关操作
const autoSaveProjectHandle = async () => {
  udstreamStore.setItem(UdstreamStoreEnums.UDSTREAM_SCENCE_AUTO_SAVED, true)
  const params = new FormData()
  //从路由中获取项目的ID
  let routerParams = document.location.hash.split("/").pop() || ""
  let projectId = ""
  if (routerParams) {
    projectId = routerParams.split("?")[0]
  }
  //获取所有的页面
  //获取udjson的内容
  //获取udsetting的内容

  params.append("project_id", projectId)
  //从路由获取groupId
  const windowUrl = document.location.hash.split("?").pop() || ""
  if (windowUrl) {
    const splitParas = windowUrl.split("&")
    if (splitParas.length > 1) {
      const organizationStr = splitParas[1].split("=")[1]
      //如果传入了组织机构
      params.append("group_id", organizationStr) //这个groupId  应该从项目里面获取到才对
    } else {
      params.append("group_id", "0") //这个groupId  应该从项目里面获取到才对
    }
  } else {
    params.append("group_id", "0") //这个groupId  应该从项目里面获取到才对
  }

  const cb = () => {
    setTimeout(() => {
      udstreamStore.setItem(UdstreamStoreEnums.UDSTREAM_SCENCE_AUTO_SAVED, false)
    }, 800)
  }
  savaProject2Back(params, udstreamStore, pageInfoStore, cb)
}

//监听保存
watch(
  () => udstreamStore.getUdstreamScenceSaved,
  (nv, ov) => {
    saveBntShow.value = nv
  }
)

//监听自动保存
watch(
  () => udstreamStore.getUdstreamScenceAutoSaved,
  (nv, ov) => {
    saveAutoBntShow.value = nv
  }
)

//监听项目名称的变化
watch(
  () => udstreamStore.getProjectTitle,
  (nv, ov) => {
    pageTitle.value = nv
  }
)

watch(
  () => udstreamStore.udstreamCanvasLoaded,
  (nv, ov) => {
    if (nv) {
      //执行自动保存操作
      setInterval(() => {
        if (openSaveAuto.value) {
          autoSaveProjectHandle()
        }
      }, 60000)
    }
  }
)
</script>

<style lang="scss" scoped>
.navigation-bar {
  height: var(--v3-navigationbar-height);
  position: relative;
  overflow: hidden;
  background: #fff;
  .hamburger {
    display: flex;
    align-items: center;
    height: 100%;
    float: left;
    padding: 0 15px;
    cursor: pointer;
  }
  .breadcrumb {
    float: left;
    // 参考 Bootstrap 的响应式设计 WIDTH = 576
    @media screen and (max-width: 576px) {
      display: none;
    }
  }
  .right-menu {
    float: right;
    margin-right: 10px;
    height: 100%;
    display: flex;
    align-items: center;
    color: #606266;
    .right-menu-item {
      padding: 0 10px;
      cursor: pointer;
      .right-menu-avatar {
        display: flex;
        align-items: center;
        .el-avatar {
          margin-right: 10px;
        }
        span {
          font-size: 16px;
        }
      }
    }
  }
}
.udstream-tool {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: row;
  align-items: center;
}
.udstream-tool-row {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  top: 50%;
}
.udstream-tool-svg {
  display: inline-block;
  margin: 0px 8px;
  font-size: 24px;
  cursor: pointer;
}
.udstream-tool-svg-loading {
  animation: turn 3s linear infinite;
}
.udstream-tool-svg:active {
  transform: scale(1.1);
}
.udstream-tool-row-show {
  display: block;
}
.udstream-tool-row-hide {
  display: none;
}
@keyframes turn {
  0% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(90deg);
  }
  50% {
    transform: rotate(180deg);
  }
  75% {
    transform: rotate(270deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.auto-save:hover {
  // cursor: pointer;
}

.project-name {
  height: 100%;
  max-width: 350px;
  display: flex;
  align-items: center;
  position: absolute;
  left: 40%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 18px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  -o-text-overflow: ellipsis;
  -webkit-text-overflow: ellipsis;
  -moz-text-overflow: ellipsis;
  white-space: nowrap;
}
.project-name:hover {
  cursor: pointer;
}
.avator-img {
  --s: 38px; /* image size */
  --b: 1px; /* border thickness */
  --c: #6ab2c1; /* border color */
  --cb: #e9ecef; /* background color */
  --f: 0.8; /* initial scale */
  width: var(--s);
  padding-top: calc(var(--s) / 5);
  cursor: pointer;
  border-radius: 0 0 999px 999px;
  --_g: 50% / calc(100% / var(--f)) 100% no-repeat content-box;
  --_o: calc((1 / var(--f) - 1) * var(--s) / 2 - var(--b));
  outline: var(--b) solid var(--c);
  outline-offset: var(--_o);
  background: radial-gradient(
      circle closest-side,
      var(--cb) calc(99% - var(--b)),
      var(--c) calc(100% - var(--b)) 99%,
      #0000
    )
    var(--_g);
  -webkit-mask: linear-gradient(#000 0 0) no-repeat 50% calc(1px - var(--_o)) /
      calc(100% / var(--f) - 2 * var(--b) - 2px) 50%,
    radial-gradient(circle closest-side, #000 99%, #0000) var(--_g);
  transform: scale(var(--f));
  transition: 0.5s;
}
.avator-img:hover {
  --f: 1.4;
}
</style>
