import axios, { type AxiosResponse, type AxiosInstance, type AxiosRequestConfig } from "axios"
import { ElMessage } from "element-plus"
import { get } from "lodash-es"
import { getToken } from "./cache/cookies"
import { fetchAllowList } from "@/api/axios.config"
import includes from "lodash/includes"

/** 创建请求实例 */
function createService() {
  // 创建一个 Axios 实例
  const service = axios.create()
  // 请求拦截
  service.interceptors.request.use(
    // (config: AxiosRequestConfig) => config,
    (config: AxiosRequestConfig) => {
      // 白名单校验
      if (includes(fetchAllowList, config.url)) {
        config.headers = {
          "Content-Type": "multipart/form-data" 
        }
        return config
      }
      // 获取 token
      // const info = ""
      // // 重新登录
      // if (!info) {
      //   return config
      // }
      // const userInfo = info[SystemStoreEnum.USER_INFO]
      const userToken = getToken()
      if (!userToken) {
        ElMessage.warning("用户暂时未登录！")
        return config
      }
      config.headers = {
        ...config.headers,
        "Content-Type": "multipart/form-data" ,
        token: userToken
      }
      return config
    },
    // 发送失败
    (error) => Promise.reject(error)
  )
  // 响应拦截（可根据具体业务作出相应的调整）
  service.interceptors.response.use(
    (response: AxiosResponse) => {
      // apiData 是 API 返回的数据
      const apiData = response.data as any
      // 这个 Code 是和后端约定的业务 Code
      const code = apiData.code
      // 如果没有 Code, 代表这不是项目后端开发的 API
      if (code === undefined) {
        ElMessage.error("非本系统的接口")
        return Promise.reject(new Error("非本系统的接口"))
      } else {
        switch (code) {
          case 0:
            // code === 0 代表没有错误
            return apiData
          case 1:
            return apiData
          default:
            // 不是正确的 Code
            ElMessage.error(apiData.message || "Error")
            return Promise.reject(new Error("Error"))
        }
      }
    },
    (error) => {
      // Status 是 HTTP 状态码
      const status = get(error, "response.status")
      switch (status) {
        case 400:
          error.message = "请求错误"
          break
        case 401:
          // Token 过期时，直接退出登录并强制刷新页面（会重定向到登录页）
          // useUserStoreHook().logout()
          window.open(globleEuleeCloudLogin, "_self")
          // location.reload()
          break
        case 403:
          error.message = "拒绝访问"
          break
        case 404:
          error.message = "请求地址出错"
          break
        case 408:
          error.message = "请求超时"
          break
        case 500:
          error.message = "服务器内部错误"
          break
        case 501:
          error.message = "服务未实现"
          break
        case 502:
          error.message = "网关错误"
          break
        case 503:
          error.message = "服务不可用"
          break
        case 504:
          error.message = "网关超时"
          break
        case 505:
          error.message = "HTTP 版本不受支持"
          break
        default:
          break
      }
      ElMessage.error(error.message)
      return Promise.reject(error)
    }
  )
  return service
}

/** 创建请求方法 */
function createRequestFunction(service: AxiosInstance) {
  return function (config: AxiosRequestConfig) {
    const configDefault = {
      headers: {
        // 携带 Token
        Authorization: "Bearer " + getToken(),
        "Content-Type": get(config, "headers.Content-Type", "application/json")
      },
      timeout: 5000,
      baseURL: import.meta.env.VITE_BASE_API,
      data: {}
    }
    return service(Object.assign(configDefault, config))
  }
}

/** 用于网络请求的实例 */
export const service = createService()
/** 用于网络请求的方法 */
export const request = createRequestFunction(service)
