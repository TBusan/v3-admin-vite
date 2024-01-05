import { useRoute } from "vue-router"
/**
 * * 通过硬解析获取当前路由下的参数
 * @returns object
 */
export const fetchRouteParamsLocation = () => {
  try {
    return document.location.hash.split("?").pop() || ""
  } catch (error) {
    // window["$message"].warning("查询路由信息失败，请联系管理员！")
    console.log("查询路由信息失败，请联系管理员！")
    return ""
  }
}

/**
 * * 获取当前路由下的参数
 * @returns object
 */
export const fetchRouteParams = () => {
  try {
    const route = useRoute()
    return route.params
  } catch (error) {
    // window["$message"].warning("查询路由信息失败，请联系管理员！")
    console.log("查询路由信息失败，请联系管理员！")
  }
}

/**
 * * 获取当前路由下的项目ID
 * @returns object
 */
export const fetchRouteProjectId = () => {
  try {
    const urls = document.location.hash.split("/").pop()?.split(",").shift()
    if (urls) {
      return urls.split("?").shift()
    }
    return ""
  } catch (error) {
    console.log("查询路由信息失败，请联系管理员！")
    return ""
  }
}
