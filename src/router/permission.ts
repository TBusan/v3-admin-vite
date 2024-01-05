import router from "@/router"
// import { useUserStoreHook } from "@/store/modules/user"
// import { usePermissionStoreHook } from "@/store/modules/permission"
// import { ElMessage } from "element-plus"
import { whiteList } from "@/config/white-list"
import { getToken, setToken } from "@/utils/cache/cookies"
// import asyncRouteSettings from "@/config/async-route"
import { setTokenInfo, isFirstLoad } from "@/utils/tool"

import NProgress from "nprogress"
import "nprogress/nprogress.css"

NProgress.configure({ showSpinner: false })

router.beforeEach((to, _from, next) => {
  NProgress.start()
  // 判断页面是否是第一次加载
  const isfirstLoadWindow: boolean = isFirstLoad() //判断是否是一次加载
  debugger
  if (!isfirstLoadWindow) {
    // 判断该用户是否登录
    if (getToken()) {
      if (to.name === "Dashboard" || to.name === "Preview") {
        // 如果已经登录，并准备进入
        next()
        NProgress.done()
      }
    }
  } else {
    // 如果没有 Token 根据路由进行设置
    setTokenInfo()
    if (getToken()) {
      next()
    } else {
      if (whiteList.indexOf(to.path) !== -1) {
        // 如果在免登录的白名单中，则直接进入
        next()
      } else {
        // 其他没有访问权限的页面将被重定向到登录页面
        // window.open(globleEuleeCloudLogin, "_blank")
        NProgress.done()
        window.open(globleEuleeCloudLogin + "?target=" + window.location.href, "_self")
      }
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
