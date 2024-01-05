import { type App } from "vue"
import { permission } from "./permission"
import VueLazyLoad from "vue3-lazyload"
import { requireErrorImg } from "@/utils/tool"

/** 挂载自定义指令 */
export function loadDirectives(app: App) {
  app.directive("permission", permission)
}

/**
 * 注册全局自定义指令
 * @param app
 */
export function setupDirectives(app: App) {
  // 图片懒加载
  app.use(VueLazyLoad, {
    error: requireErrorImg()
  })
  // app.directive('x', x);
}
