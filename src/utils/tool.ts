import { fetchUserTokenApiWithEulee } from "@/api/euleeLogin"
import { saveProjectApiWithEulee } from "@/api/euleeSource"
import { fetchRouteParamsLocation } from "@/utils/router" //从路由获取信息
import Image_404 from "@/assets/images/404.svg"
import * as udStream from "@/udStream/udStream"
import { ElMessage } from "element-plus"

// //Pinia相关
// import { useUdstreamStore } from "@/store/modules/udstreamStore"
// const udstreamStore = useUdstreamStore()
/**
 * * 获取错误处理图片，默认 404 图
 * @returns url
 */
export const requireErrorImg = () => {
  return Image_404
}

//将原先的cookies换成了localstrorage
// export const setTokenInfo = () => {
//   /** 路由信息 */
//   const routeParamsLocation = fetchRouteParamsLocation()
//   // 根据路由信息获取用户的token
//   if (routeParamsLocation) {
//     const splitParas = routeParamsLocation.split("&")
//     const tokenStr = splitParas[0].split("=")[1]
//     if (splitParas.length > 1) {
//       const organizationStr = splitParas[1].split("=")[1]
//       //如果传入了组织机构
//       localStorage.setItem("elueeOrganization", organizationStr)
//     }
//     if (tokenStr) {
//       const sendParams = new FormData()
//       sendParams.append("secret", tokenStr)
//       return fetchUserTokenApiWithEulee(sendParams)
//     }
//   }
//   return new Promise((resolv, reject) => {
//     resolv({ code: 404, data: null })
//   })
// }

export const setTokenInfo = () => {
  /** 路由信息 */
  const routeParamsLocation = fetchRouteParamsLocation()
  // 根据路由信息获取用户的token
  if (routeParamsLocation) {
    const splitParas = routeParamsLocation.split("=")
    if (splitParas.length > 1) {
      //说明有组织
      const organizationStr = splitParas[1]
      //如果传入了组织机构
      localStorage.setItem("elueeOrganization", organizationStr)
    }
  }
}

//保存项目相关的操作
export const savaProject2Back = async (params: FormData, udstreamStore: any, pageInfoStore: any, cb: Function) => {
  try {
    //获取场景中的
    const pageJson = {
      udjson: {},
      udsetting: {},
      udEvent: [],
      name: "",
      id: "",
      cameraCenterUUID: null,
      srid: 0 //默认为0
    }
    const udSetting = udstreamStore.getUdstreamSetting || {} //当前被激活页面的udsetting
    const pageName = pageInfoStore.pageInfo?.name
    const pageId = pageInfoStore.pageInfo?.id
    let parseUdJson = null
    try {
      const udJsonStr = (await udStream.exportSceneToMemory()) || null //与udstream加载的资源相关的json  //当前被激活页面的udJson
      parseUdJson = JSON.parse(udJsonStr)
    } catch (error) {
      // parseUdJson = null
      console.log("exportSceneToMemory转换JSON出错...")
      // ElMessage.error("获取场景列表失败，将沿用保存之前的场景数据！")
      ElMessage({
        // showClose: true,
        message: "获取当前场景内容列表失败，将沿用保存之前的场景数据！",
        type: "error",
        duration: 5000
      })
    }
    // const udJsonStr = (await udStream.exportSceneToMemory()) || null //与udstream加载的资源相关的json  //当前被激活页面的udJson
    // parseUdJson = JSON.parse(udJsonStr)
    // console.log("打印保存的udjson数据..............")
    // console.log(parseUdJson)
    if (parseUdJson && parseUdJson.constructor === Object) {
      pageJson.udjson = parseUdJson
    }
    if (udSetting.constructor === Object) {
      pageJson.udsetting = udSetting
    }
    if (pageName) {
      pageJson.name = pageName
    }
    if (pageId) {
      pageJson.id = pageId
    }
    //从localstrorage中找出相关对应页面的数据
    const udStreamPageList = localStorage.getItem("udstreamPageList")
    if (udStreamPageList) {
      const udstreamPageListJson = JSON.parse(udStreamPageList)
      if (udstreamPageListJson.length > 0) {
        const findJsonIndex = udstreamPageListJson.findIndex((item: any) => {
          return item.id == pageInfoStore.pageInfo?.id
        })
        if (findJsonIndex !== -1) {
          const find_item = udstreamPageListJson[findJsonIndex]
          //新增相机
          if (find_item.cameraCenterUUID) {
            //选择的其它可视点
            pageJson.cameraCenterUUID = find_item.cameraCenterUUID
          } else {
            //选择的默认的可视点
            pageJson.cameraCenterUUID = null
          }

          if (find_item.srid) {
            //投影坐标系
            pageJson.srid = find_item.srid
          }

          if (find_item.udEvent) {
            //事件  只用 管4978  因为默认为0
            pageJson.udEvent = find_item.udEvent
          }

          if (!parseUdJson && find_item.udjson) {
            pageJson.udjson = find_item.udjson
            // console.log("findJsonIndex333333")
            // console.log(find_item.udjson)
          } else if (!parseUdJson && !find_item.udjson) {
            pageJson.udjson = null as any
          }
          //找到了对应的数据
          udstreamPageListJson.splice(findJsonIndex, 1, pageJson)
          // console.log('udstreamPageListJson444444444444')
          // console.log(udstreamPageListJson[0].udjson)
          //重新设置localstrorage
          localStorage.setItem("udstreamPageList", JSON.stringify(udstreamPageListJson))
          //拼接参数数据
          params.append("json_content", JSON.stringify(udstreamPageListJson || []))
        } else {
          //没有找到
          if (!parseUdJson) {
            pageJson.udjson = null as any
          }
          return
        }
      }
    } else {
      //新建的项目  localstrorage里面没有东西
      pageJson.name = pageName
      pageJson.id = pageId
      const pageJsonList = [pageJson]
      //重新设置localstrorage
      localStorage.setItem("udstreamPageList", JSON.stringify(pageJsonList))
      //拼接参数数据
      params.append("json_content", JSON.stringify(pageJsonList || []))
    }
    saveProjectApiWithEulee(params)
      .then((res) => {
        // setTimeout(() => {
        //   udstreamStore.setItem(UdstreamStoreEnums.UDSTREAM_SCENCE_SAVED, false)
        // }, 800)
        cb()
        ElMessage.success("项目保存成功！")
      })
      .catch(() => {
        // setTimeout(() => {
        //   udstreamStore.setItem(UdstreamStoreEnums.UDSTREAM_SCENCE_SAVED, false)
        // }, 800)
        cb()
        ElMessage.error("项目保存失败！")
      })
  } catch (error) {
    // setTimeout(() => {
    //   udstreamStore.setItem(UdstreamStoreEnums.UDSTREAM_SCENCE_SAVED, false)
    // }, 800)
    cb()
    ElMessage.error("项目保存失败！")
    console.log(error)
  }
}

//将当前页面的数据保存到localStrorage
type PageInfoType = {
  label: string
  id: string
}

//存储之前的页面信息 只存储到localstrorage中
export const savePrePageData2LocalStrorage = async (prePage: PageInfoType) => {
  try {
    //获取场景中的
    const pageJson = {
      udjson: {},
      udsetting: {},
      udEvent: [],
      name: "",
      id: "",
      cameraCenterUUID: null,
      srid: 0
    }
    const udSetting = (await udStream.getSettings()) || {} //当前被激活页面的udsetting
    const pageName = prePage?.label
    const pageId = prePage?.id
    let parseUdJson = null
    try {
      const udJsonStr = (await udStream.exportSceneToMemory()) || null //与udstream加载的资源相关的json  //当前被激活页面的udJson
      parseUdJson = JSON.parse(udJsonStr)
    } catch (error) {
      // parseUdJson = {}
      console.log("exportSceneToMemory转换JSON出错...")
      ElMessage({
        // showClose: true,
        message: "获取前一场景内容列表失败，将沿用前一场景保存之前的场景数据！",
        type: "warning",
        duration: 5000
      })
    }

    if (parseUdJson && parseUdJson.constructor === Object) {
      pageJson.udjson = parseUdJson
    }
    if (udSetting && udSetting.constructor === Object) {
      pageJson.udsetting = udSetting
    }
    if (pageName) {
      pageJson.name = pageName
    }
    if (pageId) {
      pageJson.id = pageId
    }
    //从localstrorage中找出相关对应页面的数据
    const udStreamPageList = localStorage.getItem("udstreamPageList")
    if (udStreamPageList) {
      const udstreamPageListJson = JSON.parse(udStreamPageList)
      if (udstreamPageListJson.length > 0) {
        const findJsonIndex = udstreamPageListJson.findIndex((item: any) => {
          return item.id == prePage?.id
        })
        if (findJsonIndex !== -1) {
          //在localstrorage中找到了对应的数据
          const find_item = udstreamPageListJson[findJsonIndex]
          if (find_item.cameraCenterUUID) {
            pageJson.cameraCenterUUID = find_item.cameraCenterUUID
          }

          if (find_item.srid) {
            //投影坐标系
            pageJson.srid = find_item.srid
          }

          if (find_item.udEvent) {
            //事件相关的数据
            pageJson.udEvent = find_item.udEvent
          }

          if (!parseUdJson && find_item.udjson) {
            pageJson.udjson = find_item.udjson
          } else if (!parseUdJson && !find_item.udjson) {
            pageJson.udjson = null as any
          }
          //找到了对应的数据
          udstreamPageListJson.splice(findJsonIndex, 1, pageJson)
          //重新设置localstrorage
          localStorage.setItem("udstreamPageList", JSON.stringify(udstreamPageListJson))
        } else {
          if (!parseUdJson) {
            pageJson.udjson = null as any
          } else {
            //新增的一个页面   也是需要存到localStorage中去的
            if (pageJson.id && pageJson.name) {
              udstreamPageListJson.push(pageJson)
              //重新设置localstrorage
              localStorage.setItem("udstreamPageList", JSON.stringify(udstreamPageListJson))
            }
          }
          //没有找到
          return
        }
      }
    } else {
      //新建的项目  localstrorage里面没有东西
      pageJson.name = prePage?.label
      pageJson.id = prePage?.id
      const pageJsonList = [pageJson]
      //重新设置localstrorage
      localStorage.setItem("udstreamPageList", JSON.stringify(pageJsonList))
    }
  } catch (error) {
    ElMessage.error("项目保存到localStrorage失败！")
    console.log(error)
  }
}

//拖拽的方法
export const MousePutDown = function (event: MouseEvent, dragDiv: HTMLElement) {
  dragDiv.style.cursor = "pointer"
  let offsetX = parseInt(dragDiv.style.left) // 获取当前的x轴距离
  let offsetY = parseInt(dragDiv.style.top) // 获取当前的y轴距离
  let innerX = event.clientX - offsetX // 获取鼠标在方块内的x轴距
  let innerY = event.clientY - offsetY // 获取鼠标在方块内的y轴距
  // 按住鼠标时为div添加一个border
  dragDiv.style.borderStyle = "solid"
  dragDiv.style.borderColor = "red"
  dragDiv.style.borderWidth = "3px"
  // 鼠标移动的时候不停的修改div的left和top值
  document.onmousemove = function (event) {
    dragDiv.style.left = event.clientX - innerX + "px"
    dragDiv.style.top = event.clientY - innerY + "px"
    // 边界判断
    if (parseInt(dragDiv.style.left) <= 0) {
      dragDiv.style.left = "0px"
    }
    if (parseInt(dragDiv.style.top) <= 0) {
      dragDiv.style.top = "0px"
    }
    if (parseInt(dragDiv.style.left) >= window.innerWidth - parseInt(dragDiv.style.width)) {
      dragDiv.style.left = window.innerWidth - parseInt(dragDiv.style.width) + "px"
    }
    if (parseInt(dragDiv.style.top) >= window.innerHeight - parseInt(dragDiv.style.height)) {
      dragDiv.style.top = window.innerHeight - parseInt(dragDiv.style.height) + "px"
    }
  }
  // 鼠标抬起时，清除绑定在文档上的mousemove和mouseup事件
  // 否则鼠标抬起后还可以继续拖拽方块
  document.onmouseup = function () {
    document.onmousemove = null
    document.onmouseup = null
    // 清除border
    dragDiv.style.borderStyle = ""
    dragDiv.style.borderColor = ""
    dragDiv.style.borderWidth = ""
  }
}

// export const isFirstLoad: () => boolean = function {
//   if (sessionStorage.getItem("isReload")) {
//     console.log("页面被刷新1")
//     return false
//   } else {
//     console.log("首次被加载1")
//     sessionStorage.setItem("isReload", "isReload")
//     return true
//   }
// }

export function isFirstLoad(): boolean {
  if (sessionStorage.getItem("isReload")) {
    // console.log("页面被刷新1")
    return false
  } else {
    // console.log("首次被加载1")
    sessionStorage.setItem("isReload", "isReload")
    return true
  }
}
