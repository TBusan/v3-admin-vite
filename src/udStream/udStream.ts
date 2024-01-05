// import { changeUserGuidePage } from './main'
import { udResult } from "./types/udResult"
import { LoginStatus } from "./types/LoginStatus"
import { ProjectNode } from "./types/ProjectNode"
import { ProjectLoadSource } from "./types/ProjectLoadSource"
import { ActiveTool, GizmoTool } from "./types/ToolTypes"

export type LoginServer = {
  name: string
  url: string
  iconURL: string
}

export type Branding = {
  appName: string
  copyright: string
  supportEmail: string
  supportURLLogin: string
  supportURLConverting: string
  logincolours: string[]
  loginServers: LoginServer[]
  _lastItem: string
}
let branding: Branding | undefined = undefined
export async function GetBranding() {
  if (branding != undefined) {
    return branding
  } else {
    const response = await window.fetch("assets/branding/strings.json")
    const data = await response.json()
    branding = data
    if (response.ok && branding != undefined) {
      return branding
    } else {
      const error = new Error("unknown")
      return Promise.reject(error)
    }
  }
}

let serverConfig: any = undefined
export async function GetServerConfig() {
  if (serverConfig != undefined) {
    return serverConfig
  } else {
    const [response] = await serverAPIQuery("config", "config")
    const data = JSON.parse(response)
    if (data.api) {
      serverConfig = data || {}
      return serverConfig
    } else {
      return {}
    }
  }
}

let premiumPage: string | undefined = undefined
export async function GetPremiumPage() {
  if (premiumPage != undefined) {
    return premiumPage
  } else {
    const [response] = await serverAPIQuery("config", "config")
    const data = JSON.parse(response)
    premiumPage = data.premiumpage || ""
    if (data.api && premiumPage != undefined) {
      return premiumPage
    } else {
      return ""
    }
  }
}

type ThirdPartyLicenses = {
  name: string
  license: string
}
const licenses: ThirdPartyLicenses[] = []
export function GetThirdPartyLicenses() {
  if (licenses.length == 0) {
    const licenseCount = globalThis.Module.ccall("vcJavascriptHooks_GetThirdPartyLicensesCount", "int") || 0
    const licensePtr = globalThis.Module.ccall("vcJavascriptHooks_GetThirdPartyLicenses", "int") || 0
    if (licensePtr != 0) {
      for (let i = 0; i < licenseCount; i++) {
        const namePtr = globalThis.getValue(licensePtr + 4 * 2 * i, "i32")
        const licenseTextPtr = globalThis.getValue(licensePtr + 4 * 2 * i + 4, "i32")
        const name = globalThis.UTF8ToString(namePtr)
        const license = globalThis.UTF8ToString(licenseTextPtr)
        licenses.push({ name: name, license: license })
      }
    }
  }
  return licenses
}

export type MapTile = {
  mode: string
  modeStr: string
  serverAddr: string
  copyright: string
  tileAddressUUID: string
}
let mapTiles: MapTile[] = []

/*type fillMapTileCallbackType = (pJSON: string) => void;*/
function fillMapTiles(pJSON: number) {
  const mapTilesProvidersStrJSON = globalThis.UTF8ToString(pJSON)
  mapTiles = JSON.parse(mapTilesProvidersStrJSON)
}

export async function GetMapTileProviders() {
  if (mapTiles.length != 0) {
    return mapTiles
  } else {
    return new Promise<MapTile[]>((resolve) => {
      const callback = (pJSON: number) => {
        globalThis.Module.removeFunction(callbackPtr)
        fillMapTiles(pJSON)
        resolve(mapTiles)
      }
      const callbackPtr = globalThis.Module.addFunction(callback, "vi")
      globalThis.Module.ccall("vcJavascriptHooks_GetMapTilesProviders", undefined, ["int"], [callbackPtr])
    })
  }
}

let CSVColumnsHeaders: string[] = []
function fillCSVColumnsHeaders(pJSON: number) {
  const cvsColumnsHeadersStrJSON = globalThis.UTF8ToString(pJSON)
  CSVColumnsHeaders = JSON.parse(cvsColumnsHeadersStrJSON)
}

export async function GetCSVColumnsHeaders() {
  if (CSVColumnsHeaders.length != 0) {
    return CSVColumnsHeaders
  } else {
    return new Promise<string[]>((resolve) => {
      const callback = (pJSON: number) => {
        globalThis.Module.removeFunction(callbackPtr)
        fillCSVColumnsHeaders(pJSON)
        resolve(CSVColumnsHeaders)
      }
      const callbackPtr = globalThis.Module.addFunction(callback, "vi")
      globalThis.Module.ccall("vcJavascriptHooks_GetCSVColumnsHeaders", undefined, ["int"], [callbackPtr])
    })
  }
}

let currLang = ""
type currLangCallbackType = (newLang: string) => void
let currLangCallback: currLangCallbackType | undefined = undefined
function langChangeCallback(newLangPtr: number) {
  currLang = globalThis.UTF8ToString(newLangPtr)
  if (currLangCallback) currLangCallback(currLang)
}

type openModalCallbackType = (type: number) => void
let openModalCallback: openModalCallbackType | undefined = undefined

function openModalBaseCallback(type: number) {
  // if (openModalCallback)
  //   return openModalCallback(type);
  // return 0;
  return 1
}

// function openModalBaseCallback(type: number) {
//   return 1
// }

// type userGuidePageChangeCallbackType = (page: string, forceReload: boolean) => void;
// let userGuidePageChangeCallback: userGuidePageChangeCallbackType | undefined = changeUserGuidePage;
// function userGuidePageChangeBaseCallback(pagePtr: number, forceReload: number) {
//   if (userGuidePageChangeCallback)
//     userGuidePageChangeCallback(globalThis.UTF8ToString(pagePtr), forceReload != 0);
// }

type addErrorCallbackType = (data: string, resultCode: udResult, message?: string) => void
let addErrorCallback: addErrorCallbackType | undefined = undefined
function addErrorBaseCallback(dataPtr: number, resultCode: udResult, messagePtr: number) {
  if (addErrorCallback)
    addErrorCallback(
      globalThis.UTF8ToString(dataPtr),
      resultCode,
      messagePtr == 0 ? undefined : globalThis.UTF8ToString(messagePtr)
    )
}

type getProjectSettingsCallbackType = (data: string) => void
let getProjectSettingsCallback: getProjectSettingsCallbackType | undefined = undefined
function getProjectSettingsBaseCallback(dataPtr: number) {
  if (getProjectSettingsCallback) getProjectSettingsCallback(globalThis.UTF8ToString(dataPtr))
}

let currentFeaturedProjectsJSON = ""
let currentFeaturedProjectsKey = ""
type getFeaturedProjectsCallbackType = (projectsJSON: string, key: string) => void
let getFeaturedProjectsCallback: getFeaturedProjectsCallbackType | undefined = undefined
function getFeaturedProjectsBaseCallback(projectJSONPtr: number, keyPtr: number) {
  currentFeaturedProjectsJSON = globalThis.UTF8ToString(projectJSONPtr)
  currentFeaturedProjectsKey = globalThis.UTF8ToString(keyPtr)
  if (getFeaturedProjectsCallback) getFeaturedProjectsCallback(currentFeaturedProjectsJSON, currentFeaturedProjectsKey)
}

type getWKTInfoCallbackType = (data: string) => void
let getWKTCallback: getWKTInfoCallbackType | undefined = undefined
function getWKTBaseCallback(dataPtr: number) {
  if (getWKTCallback) getWKTCallback(globalThis.UTF8ToString(dataPtr))
}

type GeneralUDSPickModelCallbackType = (nodePtr: number, x: number, y: number, z: number) => void
let generalUDSPickCallback: GeneralUDSPickModelCallbackType | undefined = undefined
function generalUDSPickBaseCallback(modelPtr: number, x: number, y: number, z: number) {
  if (generalUDSPickCallback) {
    generalUDSPickCallback(modelPtr, x, y, z)
  }
}

type getProjectInfoCallbackType = (name: string, markdown: string) => void
let getProjectInfoCallback: getProjectInfoCallbackType | undefined = undefined
function getProjectInfoBaseCallback(namePtr: number, markdownPtr: number) {
  if (getProjectInfoCallback)
    getProjectInfoCallback(globalThis.UTF8ToString(namePtr), globalThis.UTF8ToString(markdownPtr))
}

type getSessionInfoCallbackType = (sessionInfo: object) => void
let getSessionInfoCallback: getSessionInfoCallbackType | undefined = undefined
function getSessionInfoBaseCallback(dataPtr: number) {
  if (getSessionInfoCallback) getSessionInfoCallback(dataPtr != 0 ? JSON.parse(globalThis.UTF8ToString(dataPtr)) : null)
}

type getAnnotationsLoadingInfoCallbackType = (loadingInfo: object) => void
let getAnnotationsLoadingInfoCallback: getAnnotationsLoadingInfoCallbackType | undefined = undefined
function getAnnotationsLoadingInfoBaseCallback(dataPtr: number) {
  if (getAnnotationsLoadingInfoCallback) getAnnotationsLoadingInfoCallback(JSON.parse(globalThis.UTF8ToString(dataPtr)))
}

type getProcessingItemsCountCallbackType = (itemsCount: number) => void
let getProcessingItemsCountCallback: getProcessingItemsCountCallbackType | undefined = undefined
function getProcessingItemsCountBaseCallback(itemsCount: number) {
  if (getProcessingItemsCountCallback) getProcessingItemsCountCallback(itemsCount)
}

type getActiveProjectRootNodeCallbackType = (rootNodePtr: number) => void
let getActiveProjectRootNodeCallback: getActiveProjectRootNodeCallbackType | undefined = undefined
function getActiveProjectRootNodeBaseCallback(rootNodePtr: number) {
  if (getActiveProjectRootNodeCallback) getActiveProjectRootNodeCallback(rootNodePtr)
}

type getUpdateProjectNodesCallbackType = () => void
let getUpdateProjectNodesCallback: getUpdateProjectNodesCallbackType | undefined = undefined
function getUpdateProjectNodesBaseCallback() {
  if (getUpdateProjectNodesCallback) getUpdateProjectNodesCallback()
}

type getScreenshotDataCallbackType = (data: string) => void
let getScreenshotDataCallback: getScreenshotDataCallbackType | undefined = undefined
function getScreenshotDataBaseCallback(dataPtr: number) {
  if (getScreenshotDataCallback) {
    getScreenshotDataCallback(globalThis.UTF8ToString(dataPtr))
  }
}

type getClickedItemCallbackType = (uuid: string, isMultiSelect: boolean) => void
let getClickedItemCallback: getClickedItemCallbackType | undefined = undefined
function getClickedItemBaseCallback(uuidPtr: number, isMultiSelect: number) {
  if (getClickedItemCallback) {
    getClickedItemCallback(globalThis.UTF8ToString(uuidPtr), isMultiSelect !== 0)
  }
}

type setActiveToolCallbackType = (activeTool: ActiveTool) => void
let setActiveToolCallback: setActiveToolCallbackType | undefined = undefined
function setActiveToolBaseCallback(activeTool: ActiveTool) {
  if (setActiveToolCallback) {
    setActiveToolCallback(activeTool)
  }
}

type getPlaybackTimePositionCallbackType = (timePosition: number) => void
let getPlaybackTimePositionCallback: getPlaybackTimePositionCallbackType | undefined = undefined
function getPlaybackTimePositionBaseCallback(timePosition: number) {
  if (getPlaybackTimePositionCallback) {
    getPlaybackTimePositionCallback(timePosition)
  }
}

type getUDSPickModelCallbackType = (node: ProjectNode | undefined) => void
let getUDSPickModelCallback: getUDSPickModelCallbackType | undefined = undefined
function getUDSPickModelBaseCallback(modelPtr: number) {
  if (getUDSPickModelCallback) {
    getUDSPickModelCallback(modelPtr != 0 ? new ProjectNode(modelPtr) : undefined)
  }
}

let registered = false
export function registerCallbacks() {
  if (!registered) {
    let callbackPtr = globalThis.Module.addFunction(langChangeCallback, "vi")
    globalThis.Module.ccall("vcJavascriptHooks_RegisterLangChangeCallback", undefined, ["number"], [callbackPtr])

    callbackPtr = globalThis.Module.addFunction(openModalBaseCallback, "ii")
    globalThis.Module.ccall("vcJavascriptHooks_RegisterModalOpenCallback", undefined, ["number"], [callbackPtr])

    //callbackPtr = globalThis.Module.addFunction(userGuidePageChangeBaseCallback, 'vii');
    //globalThis.Module.ccall('vcJavascriptHooks_RegisterUserGuidePageChangeCallback', undefined, ['number'], [callbackPtr]);

    callbackPtr = globalThis.Module.addFunction(addErrorBaseCallback, "viii")
    globalThis.Module.ccall("vcJavascriptHooks_RegisterAddErrorCallback", undefined, ["number"], [callbackPtr])

    callbackPtr = globalThis.Module.addFunction(getProjectSettingsBaseCallback, "vi")
    globalThis.Module.ccall(
      "vcJavascriptHooks_RegisterGetProjectSettingsCallback",
      undefined,
      ["number"],
      [callbackPtr]
    )

    callbackPtr = globalThis.Module.addFunction(getFeaturedProjectsBaseCallback, "vii")
    globalThis.Module.ccall(
      "vcJavascriptHooks_RegisterGetFeaturedProjectsCallback",
      undefined,
      ["number"],
      [callbackPtr]
    )

    callbackPtr = globalThis.Module.addFunction(getWKTBaseCallback, "vi")
    globalThis.Module.ccall("vcJavascriptHooks_RegisterGetWKTInfoCallback", undefined, ["number"], [callbackPtr])

    callbackPtr = globalThis.Module.addFunction(getProjectInfoBaseCallback, "vii")
    globalThis.Module.ccall("vcJavascriptHooks_RegisterGetProjectInfoCallback", undefined, ["number"], [callbackPtr])

    callbackPtr = globalThis.Module.addFunction(getSessionInfoBaseCallback, "vi")
    globalThis.Module.ccall("vcJavascriptHooks_RegisterGetSessionInfoCallback", undefined, ["number"], [callbackPtr])

    callbackPtr = globalThis.Module.addFunction(getAnnotationsLoadingInfoBaseCallback, "vi")
    globalThis.Module.ccall(
      "vcJavascriptHooks_RegisterGetAnnotationsLoadingInfoCallback",
      undefined,
      ["number"],
      [callbackPtr]
    )

    callbackPtr = globalThis.Module.addFunction(getProcessingItemsCountBaseCallback, "vi")
    globalThis.Module.ccall(
      "vcJavascriptHooks_RegisterGetProcessingItemsCountCallback",
      undefined,
      ["number"],
      [callbackPtr]
    )

    callbackPtr = globalThis.Module.addFunction(getActiveProjectRootNodeBaseCallback, "vi")
    globalThis.Module.ccall(
      "vcJavascriptHooks_RegisterGetActiveProjectRootNodeCallback",
      undefined,
      ["number"],
      [callbackPtr]
    )

    callbackPtr = globalThis.Module.addFunction(getUpdateProjectNodesBaseCallback, "v")
    globalThis.Module.ccall(
      "vcJavascriptHooks_RegisterUpdateProjectNodesCallback",
      undefined,
      ["number"],
      [callbackPtr]
    )

    callbackPtr = globalThis.Module.addFunction(getScreenshotDataBaseCallback, "vi")
    globalThis.Module.ccall("vcJavascriptHooks_RegisterGetScreenshotDataCallback", undefined, ["number"], [callbackPtr])

    callbackPtr = globalThis.Module.addFunction(getClickedItemBaseCallback, "vii")
    globalThis.Module.ccall("vcJavascriptHooks_RegisterGetClickedItemCallback", undefined, ["number"], [callbackPtr])

    callbackPtr = globalThis.Module.addFunction(setActiveToolBaseCallback, "vi")
    globalThis.Module.ccall("vcJavascriptHooks_RegisterSetActiveToolCallback", undefined, ["number"], [callbackPtr])

    callbackPtr = globalThis.Module.addFunction(getPlaybackTimePositionBaseCallback, "vf")
    globalThis.Module.ccall(
      "vcJavascriptHooks_RegisterGetPlaybackTimePositionCallback",
      undefined,
      ["number"],
      [callbackPtr]
    )

    callbackPtr = globalThis.Module.addFunction(getUDSPickModelBaseCallback, "vi")
    globalThis.Module.ccall("vcJavascriptHooks_RegisterGetUDSPickModelCallback", undefined, ["number"], [callbackPtr])

    callbackPtr = globalThis.Module.addFunction(generalUDSPickBaseCallback, "vifff")
    globalThis.Module.ccall("vcJavascriptHooks_RegisterGeneralUDSPickCallback", undefined, ["int"], [callbackPtr])

    //test zoutao
    // callbackPtr = globalThis.Module.addFunction(getUDSPickModelBaseCallback, 'vi');
    // globalThis.Module.ccall('vcJavascriptHooks_RegisterGetUDSPickModelCallback', undefined, ['number'], [callbackPtr]);
    // registerTouchEventCallback
    registered = true
  }
}

export function registerLanguageChangeCallback(callback: currLangCallbackType) {
  if (currLangCallback != callback) {
    currLangCallback = callback
    if (currLangCallback) currLangCallback(currLang)
  }
}

export function registerOpenModalCallback(callback: openModalCallbackType) {
  if (openModalCallback != callback) {
    openModalCallback = callback
  }
}

// export function registerUserGuidePageChangeCallback(callback: userGuidePageChangeCallbackType) {
//   if (userGuidePageChangeCallback != callback) {
//     userGuidePageChangeCallback = callback;
//   }
// }

export function registerAddErrorCallback(callback: addErrorCallbackType) {
  if (addErrorCallback != callback) {
    addErrorCallback = callback
  }
}

export function registerGetProjectSettingsCallback(callback: getProjectSettingsCallbackType) {
  if (getProjectSettingsCallback != callback) {
    getProjectSettingsCallback = callback
  }
}

export function registerGetWKTInfoCallback(callback: editWKTCallbackType) {
  if (getWKTCallback != callback) {
    getWKTCallback = callback
  }
}

export function registerGetAnnotationsLoadingInfoCallback(callback: getAnnotationsLoadingInfoCallbackType) {
  if (getAnnotationsLoadingInfoCallback != callback) {
    getAnnotationsLoadingInfoCallback = callback
  }
}

export function registerGetProcessingItemsCountCallback(callback: getProcessingItemsCountCallbackType) {
  if (getProcessingItemsCountCallback != callback) {
    getProcessingItemsCountCallback = callback
  }
}

export function registerGetActiveProjectRootNodeCallback(callback: getActiveProjectRootNodeCallbackType) {
  if (getActiveProjectRootNodeCallback != callback) {
    getActiveProjectRootNodeCallback = callback
  }
}

export function registerUpdateProjectNodesCallback(callback: getUpdateProjectNodesCallbackType) {
  if (getUpdateProjectNodesCallback != callback) {
    getUpdateProjectNodesCallback = callback
  }
}

type setProjectSettingsCallbackType = () => void
export function setProjectSettings(data: object, callback?: setProjectSettingsCallbackType) {
  let callbackPtr = 0
  if (callback) callbackPtr = globalThis.Module.addFunction(callback, "v")

  globalThis.Module.ccall(
    "vcJavascriptHooks_SetProjectSettings",
    undefined,
    ["string", "int"],
    [JSON.stringify(data), callbackPtr]
  )
}

export function registerGetFeaturedProjectsCallback(callback: getFeaturedProjectsCallbackType) {
  if (getFeaturedProjectsCallback != callback) {
    getFeaturedProjectsCallback = callback
    if (getFeaturedProjectsCallback)
      getFeaturedProjectsCallback(currentFeaturedProjectsJSON, currentFeaturedProjectsKey)
  }
}

export function registerGetProjectInfoCallback(callback: getProjectInfoCallbackType) {
  if (getProjectInfoCallback != callback) {
    getProjectInfoCallback = callback
  }
}

export function registerGetSessionInfoCallback(callback: getSessionInfoCallbackType) {
  if (getSessionInfoCallback != callback) {
    getSessionInfoCallback = callback
  }
}

export function registerGetScreenshotDataCallback(callback: getScreenshotDataCallbackType) {
  if (getScreenshotDataCallback != callback) {
    getScreenshotDataCallback = callback
  }
}

export function registerGetClickedItemCallback(callback: getClickedItemCallbackType) {
  if (getClickedItemCallback != callback) {
    getClickedItemCallback = callback
  }
}

export function registerSetActiveToolCallback(callback: setActiveToolCallbackType) {
  if (setActiveToolCallback != callback) {
    setActiveToolCallback = callback
  }
}

export function registerGetTimePositionCallback(callback: getPlaybackTimePositionCallbackType) {
  if (getPlaybackTimePositionCallback != callback) {
    getPlaybackTimePositionCallback = callback
  }
}

export function registerGetUDSPickModelCallback(callback: getUDSPickModelCallbackType) {
  if (getUDSPickModelCallback != callback) {
    getUDSPickModelCallback = callback
  }
}

export function loadProjectServer(projectID: string, groupID: string) {
  globalThis.Module.ccall("vcJavascriptHooks_LoadProjectServer", undefined, ["string", "string"], [projectID, groupID])
}

export function loadProjectSharecode(sharecode: string) {
  globalThis.Module.ccall("vcJavascriptHooks_LoadProjectSharecode", undefined, ["string"], [sharecode])
}

export function selectServer(url: string) {
  globalThis.Module.ccall("vcJavascriptHooks_SelectServer", undefined, ["string"], [url])
}

// export function addMedia(url: string) {
//   globalThis.Module.ccall("vcJavascriptHooks_AddMedia", undefined, ["string"], [url])
// }

export function addMedia(url: string, x: number, y: number, z: number) {
  globalThis.Module.ccall(
    "vcJavascriptHooks_AddMedia",
    undefined,
    ["string", "number", "number", "number"],
    [url, x, y, z]
  )
}

export function moveToWhenPossible(uuid: string) {
  globalThis.Module.ccall("vcJavascriptHooks_MoveToWhenPossible", undefined, ["string"], [uuid])
}

export function tweenToPickLocation() {
  globalThis.Module.ccall("vcJavascriptHooks_TweenToPickLocation", undefined, ["string"], [])
}

export function serverAPIQuery(v1API: string, v2API: string, json?: string) {
  return new Promise<any>((resolve, reject) => {
    const callback = (responsePtr: number, resultCode: udResult, apiVersion: number) => {
      globalThis.Module.removeFunction(callbackPtr)
      if (resultCode != udResult.Success) reject(resultCode)
      else resolve([globalThis.UTF8ToString(responsePtr), apiVersion])
    }
    const callbackPtr = globalThis.Module.addFunction(callback, "viii")
    globalThis.Module.ccall(
      "vcJavascriptHooks_ServerAPIQuery",
      undefined,
      ["string", "string", "string", "number"],
      [v1API, v2API, json, callbackPtr]
    )
  })
}

export function createServerScene(name: string, groupID: string, srid: number) {
  return new Promise<udResult>((resolve) => {
    const callback = (resultCode: udResult) => {
      globalThis.Module.removeFunction(callbackPtr)
      resolve(resultCode)
    }
    const callbackPtr = globalThis.Module.addFunction(callback, "vi")
    globalThis.Module.ccall(
      "vcJavascriptHooks_CreateServerScene",
      undefined,
      ["string", "string", "number", "number"],
      [name, groupID, srid, callbackPtr]
    )
  })
}

export function createBlankScene(name: string, srid: number) {
  return new Promise<boolean>((resolve) => {
    const callback = (success: number) => {
      globalThis.Module.removeFunction(callbackPtr)
      resolve(success != 0)
    }
    const callbackPtr = globalThis.Module.addFunction(callback, "vi")
    globalThis.Module.ccall(
      "vcJavascriptHooks_CreateBlankScene",
      undefined,
      ["string", "number", "number"],
      [name, srid, callbackPtr]
    )
  })
}

export function exportScene(name: string, groupID: string, saveType: string) {
  return new Promise<udResult>((resolve) => {
    const callback = (resultCode: udResult) => {
      globalThis.Module.removeFunction(callbackPtr)
      resolve(resultCode)
    }
    const callbackPtr = globalThis.Module.addFunction(callback, "vi")
    globalThis.Module.ccall(
      "vcJavascriptHooks_ExportScene",
      undefined,
      ["string", "string", "string", "number"],
      [name, groupID, saveType, callbackPtr]
    )
  })
}

type setProjectSaveCallbackType = (saved: number) => void
export function setProjectSave(callback: setProjectSaveCallbackType) {
  let callbackPtr = 0
  if (callback) callbackPtr = globalThis.Module.addFunction(callback, "vi")

  globalThis.Module.ccall("vcJavascriptHooks_SetProjectSave", undefined, ["int"], [callbackPtr])
}

export function loadGTFSFeed(url: string) {
  return new Promise<udResult>((resolve) => {
    const callback = (result: udResult) => {
      globalThis.Module.removeFunction(callbackPtr)
      resolve(result)
    }
    const callbackPtr = globalThis.Module.addFunction(callback, "vi")
    globalThis.Module.ccall("vcJavascriptHooks_LoadGTFSFeed", undefined, ["string", "number"], [url, callbackPtr])
  })
}

export function loadSceneItem(uri: string) {
  return new Promise<number>((resolve) => {
    let callback = (nodePtr: number) => {
      globalThis.Module.removeFunction(callbackPtr)
      resolve(nodePtr)
    }
    let callbackPtr = globalThis.Module.addFunction(callback, "vi")
    globalThis.Module.ccall("vcJavascriptHooks_LoadSceneItem", undefined, ["string", "int"], [uri, callbackPtr])
  })
  // globalThis.Module.ccall("vcJavascriptHooks_LoadSceneItem", undefined, ["string"], [uri])
}

//从json对象中读取场景
export function loadSceneJson(data: any) {
  globalThis.Module.ccall("vcJavascriptHooks_LoadSceneFromMemory", undefined, ["string"], [data])
}

//从场景中读取udjson对象
export function exportSceneToMemory() {
  return new Promise<any>((resolve) => {
    const callback = (strPtr: number) => {
      globalThis.Module.removeFunction(callbackPtr)
      const str = globalThis.UTF8ToString(strPtr)
      resolve(str)
    }
    const callbackPtr = globalThis.Module.addFunction(callback, "vi")
    globalThis.Module.ccall("vcJavascriptHooks_ExportSceneToMemory", undefined, ["int"], [callbackPtr])
  })
}

// export function exportSceneToMemory() {
//   return new Promise<any>((resolve) => {
//     let callback = (strPtr: number) => {
//       globalThis.Module.removeFunction(callbackPtr);
//       let str = globalThis.UTF8ToString(strPtr);
//       resolve(str);
//     };
//     let callbackPtr = globalThis.Module.addFunction(callback, "vi");
//     globalThis.Module.ccall(
//       "udScene_SaveToMemory",
//       undefined,
//       [
//         "int"
//       ],
//       [
//         callbackPtr,
//       ]
//     );
//   });
// }

type editWKTCallbackType = () => void
export function editWKT(data: object, callback?: editWKTCallbackType) {
  let callbackPtr = 0
  if (callback) callbackPtr = globalThis.Module.addFunction(callback, "v")

  globalThis.Module.ccall(
    "vcJavascriptHooks_EditWKT",
    undefined,
    ["string", "int"],
    [JSON.stringify(data), callbackPtr]
  )
}

export function getInputInfo() {
  return new Promise<any>((resolve) => {
    const callback = (dataPtr: number) => {
      globalThis.Module.removeFunction(callbackPtr)
      resolve(JSON.parse(globalThis.UTF8ToString(dataPtr)))
    }
    const callbackPtr = globalThis.Module.addFunction(callback, "vi")
    globalThis.Module.ccall("vcJavascriptHooks_GetInputInfo", undefined, ["int"], [callbackPtr])
  })
}

export function setInputInfo(data: object) {
  globalThis.Module.ccall("vcJavascriptHooks_SetInputInfo", undefined, ["string"], [JSON.stringify(data)])
}

export function createMapTileNode(
  mode: string,
  addr: string,
  attribution: string,
  customAddr: string,
  customAttr: string,
  height: number,
  blendMode: number,
  transparency: number,
  maxDepth: number
) {
  globalThis.Module.ccall(
    "vcJavascriptHooks_CreateMapTileNode",
    undefined,
    ["string", "string", "string", "string", "string", "number", "number", "number", "number"],
    [mode, addr, attribution, customAddr, customAttr, height, blendMode, transparency, maxDepth]
  )
}

export function getSettings() {
  return new Promise<any>((resolve) => {
    const callback = (dataPtr: number) => {
      globalThis.Module.removeFunction(callbackPtr)
      resolve(JSON.parse(globalThis.UTF8ToString(dataPtr)))
    }
    const callbackPtr = globalThis.Module.addFunction(callback, "vi")
    globalThis.Module.ccall("vcJavascriptHooks_GetSettings", undefined, ["int"], [callbackPtr])
  })
}

export function saveSettings(data: object) {
  return new Promise<boolean>((resolve) => {
    const callback = (success: number) => {
      globalThis.Module.removeFunction(callbackPtr)
      resolve(success != 0)
    }
    const callbackPtr = globalThis.Module.addFunction(callback, "vi")
    globalThis.Module.ccall(
      "vcJavascriptHooks_SaveSettings",
      undefined,
      ["string", "int"],
      [JSON.stringify(data), callbackPtr]
    )
  })
}

export function changeLanguage(languageCode: string) {
  globalThis.Module.ccall("vcJavascriptHooks_ChangeLanguage", undefined, ["string"], [languageCode])
}

export function setAnnotationSettings(data: object) {
  return new Promise<any>((resolve) => {
    const callback = (dataPtr: number) => {
      globalThis.Module.removeFunction(callbackPtr)
      resolve(JSON.parse(globalThis.UTF8ToString(dataPtr)))
    }
    const callbackPtr = globalThis.Module.addFunction(callback, "vi")
    globalThis.Module.ccall(
      "vcJavascriptHooks_SetImportAnnotationsSettings",
      undefined,
      ["string", "int"],
      [JSON.stringify(data), callbackPtr]
    )
  })
}

export function importAnnotations(data: object) {
  return new Promise<any>((resolve) => {
    const callback = (dataPtr: number) => {
      globalThis.Module.removeFunction(callbackPtr)
      resolve(JSON.parse(globalThis.UTF8ToString(dataPtr)))
    }
    const callbackPtr = globalThis.Module.addFunction(callback, "vi")
    globalThis.Module.ccall(
      "vcJavascriptHooks_ImportAnnotations",
      undefined,
      ["string", "int"],
      [JSON.stringify(data), callbackPtr]
    )
  })
}

export function cancelImportAnnotations() {
  globalThis.Module.ccall("vcJavascriptHooks_CancelImportAnnotations", undefined, ["string"], [])
}

export function testProxy(proxyURL: string) {
  return new Promise<udResult>((resolve) => {
    const callback = (result: udResult) => {
      globalThis.Module.removeFunction(callbackPtr)
      resolve(result)
    }
    const callbackPtr = globalThis.Module.addFunction(callback, "vi")
    globalThis.Module.ccall("vcJavascriptHooks_TestProxy", undefined, ["string", "int"], [proxyURL, callbackPtr])
  })
}

type loginV1CallbackType = (loginStatus: LoginStatus) => void
export function Loginv1(email: string, password: string, callback: loginV1CallbackType) {
  let callbackPtr = 0
  if (callback) callbackPtr = globalThis.Module.addFunction(callback, "vi")

  globalThis.Module.ccall(
    "vcJavascriptHooks_Loginv1",
    undefined,
    ["string", "string", "int"],
    [email, password, callbackPtr]
  )
}

type loginV2CallbackType = (loginStatus: LoginStatus) => void
export function Loginv2(callback: loginV2CallbackType) {
  let callbackPtr = 0
  if (callback) callbackPtr = globalThis.Module.addFunction(callback, "vi")

  globalThis.Module.ccall("vcJavascriptHooks_Loginv2", undefined, ["int"], [callbackPtr])
}

export function CancelLogin() {
  globalThis.Module.ccall("vcJavascriptHooks_CancelLogin", undefined, [], [])
}

export function Logout() {
  globalThis.Module.ccall("vcJavascriptHooks_Logout", undefined, [], [])
}

export function getKeyNames() {
  return new Promise<any>((resolve) => {
    const callback = (dataPtr: number) => {
      globalThis.Module.removeFunction(callbackPtr)
      resolve(JSON.parse(globalThis.UTF8ToString(dataPtr)))
    }
    const callbackPtr = globalThis.Module.addFunction(callback, "vi")
    globalThis.Module.ccall("vcJavascriptHooks_GetKeyNames", undefined, ["int"], [callbackPtr])
  })
}

export function decodeKeyString(keyName: string) {
  return new Promise<number>((resolve) => {
    const callback = (scancode: number) => {
      globalThis.Module.removeFunction(callbackPtr)
      resolve(scancode)
    }
    const callbackPtr = globalThis.Module.addFunction(callback, "vi")
    globalThis.Module.ccall("vcJavascriptHooks_DecodeKeyString", undefined, ["string", "int"], [keyName, callbackPtr])
  })
}

export function getBindingKeyString(e: KeyboardEvent) {
  if (e.key === "Shift" || e.key === "Ctrl" || e.key === "Alt") return

  let key = e.key
  if (key?.length === 1) key = key.toUpperCase()

  let modifiers = ""
  if (e.shiftKey) modifiers += "Shift + "
  else if (e.ctrlKey) modifiers += "Ctrl + "
  else if (e.altKey) modifiers += "Alt + "

  return modifiers + key
}

export function exportAnnotations() {
  return new Promise<any>((resolve) => {
    const callback = (result: udResult, pFilename: number, pOutput: number) => {
      globalThis.Module.removeFunction(callbackPtr)
      resolve({
        result: result,
        filename: globalThis.UTF8ToString(pFilename),
        output: globalThis.UTF8ToString(pOutput)
      })
    }
    const callbackPtr = globalThis.Module.addFunction(callback, "viii")
    globalThis.Module.ccall("vcJavascriptHooks_ExportAnnotations", undefined, ["int"], [callbackPtr])
  })
}

export function removeProjectNode(node: ProjectNode) {
  globalThis.Module.ccall("vcJavascriptHooks_RemoveProjectNode", undefined, ["int"], [node.projectNodePtr])
}

export function addProjectNode(type: string, defaultName: string, errorSrc: string) {
  globalThis.Module.ccall(
    "vcJavascriptHooks_AddProjectNode",
    undefined,
    ["string", "string", "string"],
    [type, defaultName, errorSrc]
  )
}

export function selectSceneNodes(nodePtrArr: number[], clearSelected?: boolean) {
  globalThis.Module.ccall(
    "vcJavascriptHooks_SelectSceneNodes",
    undefined,
    ["string", "int"],
    [JSON.stringify(nodePtrArr), clearSelected ? 1 : 0]
  )
}

export function moveSceneNodes(nodePtrArr: number[], newParentPtr: number, insertBeforeChildPtr?: number) {
  globalThis.Module.ccall(
    "vcJavascriptHooks_MoveSceneNodes",
    undefined,
    ["string", "int", "int"],
    [JSON.stringify(nodePtrArr), newParentPtr, insertBeforeChildPtr]
  )
}

export function addProjectCamera(saveSettings: boolean) {
  globalThis.Module.ccall("vcJavascriptHooks_AddProjectCamera", undefined, ["int"], [saveSettings ? 1 : 0])
}

export function getProjectLoadSource() {
  return new Promise<ProjectLoadSource>((resolve) => {
    const callback = (loadSource: ProjectLoadSource) => {
      globalThis.Module.removeFunction(callbackPtr)
      resolve(loadSource)
    }
    const callbackPtr = globalThis.Module.addFunction(callback, "vi")
    globalThis.Module.ccall("vcJavascriptHooks_GetProjectLoadSource", undefined, ["int"], [callbackPtr])
  })
}

export function setActiveTool(tool: ActiveTool, clearSelection = true) {
  globalThis.Module.ccall("vcJavascriptHooks_SetActiveTool", undefined, ["int", "int"], [tool, clearSelection ? 1 : 0])
}

export function deactivateKeyBindings(deactivateKeyBindings = true) {
  return new Promise<void>((resolve) => {
    const callback = () => {
      globalThis.Module.removeFunction(callbackPtr)
      resolve()
    }
    const callbackPtr = globalThis.Module.addFunction(callback, "vi")
    globalThis.Module.ccall(
      "vcJavascriptHooks_DeactivateKeyBindings",
      undefined,
      ["int", "int"],
      [callbackPtr, deactivateKeyBindings ? 1 : 0]
    )
  })
}

export function activateScreenSpaceCompare() {
  return new Promise<number>((resolve) => {
    const callback = (active: number) => {
      globalThis.Module.removeFunction(callbackPtr)
      resolve(active)
    }
    const callbackPtr = globalThis.Module.addFunction(callback, "vi")
    globalThis.Module.ccall("vcJavascriptHooks_ActivateScreenSpaceCompare", undefined, ["int"], [callbackPtr])
  })
}

export function toggleViewport(enabled: boolean) {
  return new Promise<void>((resolve) => {
    const callback = () => {
      globalThis.Module.removeFunction(callbackPtr)
      resolve()
    }
    const callbackPtr = globalThis.Module.addFunction(callback, "vi")
    globalThis.Module.ccall(
      "vcJavascriptHooks_ToggleViewport",
      undefined,
      ["int", "int"],
      [callbackPtr, enabled ? 1 : 0]
    )
  })
}

export function getProjectUUID() {
  return new Promise<string>((resolve) => {
    const callback = (uuidPtr: number) => {
      globalThis.Module.removeFunction(callbackPtr)
      resolve(uuidPtr !== 0 ? globalThis.UTF8ToString(uuidPtr) : "")
    }
    const callbackPtr = globalThis.Module.addFunction(callback, "vi")
    globalThis.Module.ccall("vcJavascriptHooks_GetProjectUUID", undefined, ["int"], [callbackPtr])
  })
}

export function getProjectName() {
  return new Promise<string>((resolve) => {
    const callback = (namePtr: number) => {
      globalThis.Module.removeFunction(callbackPtr)
      resolve(globalThis.UTF8ToString(namePtr))
    }
    const callbackPtr = globalThis.Module.addFunction(callback, "vi")
    globalThis.Module.ccall("vcJavascriptHooks_GetProjectName", undefined, ["int"], [callbackPtr])
  })
}

export function setSceneShared(shared: boolean) {
  return new Promise<udResult>((resolve) => {
    const callback = (result: udResult) => {
      globalThis.Module.removeFunction(callbackPtr)
      resolve(result)
    }
    const callbackPtr = globalThis.Module.addFunction(callback, "vi")
    globalThis.Module.ccall(
      "vcJavascriptHooks_SetSceneShared",
      undefined,
      ["int", "int"],
      [callbackPtr, shared ? 1 : 0]
    )
  })
}

export function takeScreenshot() {
  globalThis.Module.ccall("vcJavascriptHooks_TakeScreenshot", undefined, [], [])
}

export function returnCameraToProjectStart() {
  globalThis.Module.ccall("vcJavascriptHooks_ReturnCameraToProjectStart", undefined, [], [])
}

export function setNodeSelected(uuid: string) {
  globalThis.Module.ccall("vcJavascriptHooks_SetNodeSelected", undefined, ["string"], [uuid])
}

export function getGeozoneInfo() {
  return new Promise<any>((resolve) => {
    const callback = (dataPtr: number) => {
      globalThis.Module.removeFunction(callbackPtr)
      resolve(JSON.parse(globalThis.UTF8ToString(dataPtr)))
    }
    const callbackPtr = globalThis.Module.addFunction(callback, "vi")
    globalThis.Module.ccall("vcJavascriptHooks_GetGeozoneInfo", undefined, ["int"], [callbackPtr])
  })
}

export function getCameraInfo() {
  return new Promise<any>((resolve) => {
    const callback = (dataPtr: number) => {
      globalThis.Module.removeFunction(callbackPtr)
      resolve(JSON.parse(globalThis.UTF8ToString(dataPtr)))
    }
    const callbackPtr = globalThis.Module.addFunction(callback, "vi")
    globalThis.Module.ccall("vcJavascriptHooks_GetCameraInfo", undefined, ["int"], [callbackPtr])
  })
}

export function setCameraMoveSpeed(moveSpeed: any) {
  globalThis.Module.ccall("vcJavascriptHooks_SetCameraMoveSpeed", undefined, ["string"], [JSON.stringify(moveSpeed)])
}

export function setCameraRotation(rotation: any) {
  globalThis.Module.ccall(
    "vcJavascriptHooks_SetCameraRotation",
    undefined,
    ["number", "number"],
    [rotation.heading, rotation.pitch]
  )
}

export function setCameraPosition(position: any) {
  globalThis.Module.ccall(
    "vcJavascriptHooks_SetCameraPosition",
    undefined,
    ["number", "number", "number"],
    [position.x, position.y, position.z]
  )
}

export function setCameraPositionGIS(positionGIS: any) {
  globalThis.Module.ccall(
    "vcJavascriptHooks_SetCameraPositionGIS",
    undefined,
    ["number", "number", "number"],
    [positionGIS.lat, positionGIS.lon, positionGIS.alt]
  )
}

// =>todo??
export function getDiagnosticInfo() {
  return new Promise<any>((resolve) => {
    const callback = (dataPtr: number) => {
      globalThis.Module.removeFunction(callbackPtr)
      resolve(JSON.parse(globalThis.UTF8ToString(dataPtr)))
    }
    const callbackPtr = globalThis.Module.addFunction(callback, "vi")
    globalThis.Module.ccall("vcJavascriptHooks_GetDiagnosticInfo", undefined, ["int"], [callbackPtr])
  })
}

export function getWktInfo() {
  return new Promise<any>((resolve) => {
    const callback = (dataPtr: number) => {
      globalThis.Module.removeFunction(callbackPtr)
      resolve(JSON.parse(globalThis.UTF8ToString(dataPtr)))
    }
    const callbackPtr = globalThis.Module.addFunction(callback, "vi")
    globalThis.Module.ccall("vcJavascriptHooks_GetWktInfo", undefined, ["int"], [callbackPtr])
  })
}

export function clearSelection() {
  globalThis.Module.ccall("vcJavascriptHooks_ClearSelection", undefined, [], [])
}

export function getTotalLength(node: ProjectNode) {
  return new Promise<number>((resolve) => {
    const callback = (totalLength: number) => {
      globalThis.Module.removeFunction(callbackPtr)
      resolve(totalLength)
    }
    const callbackPtr = globalThis.Module.addFunction(callback, "vf")
    globalThis.Module.ccall(
      "vcJavascriptHooks_GetTotalLength",
      undefined,
      ["int", "int"],
      [callbackPtr, node.projectNodePtr]
    )
  })
}

export function getPOIArea(node: ProjectNode) {
  return new Promise<number>((resolve) => {
    const callback = (totalArea: number) => {
      globalThis.Module.removeFunction(callbackPtr)
      resolve(totalArea)
    }
    const callbackPtr = globalThis.Module.addFunction(callback, "vf")
    globalThis.Module.ccall(
      "vcJavascriptHooks_GetPOIArea",
      undefined,
      ["int", "int"],
      [callbackPtr, node.projectNodePtr]
    )
  })
}

export function getVerticalMeasurementDistances(node: ProjectNode) {
  return new Promise<any>((resolve) => {
    const callback = (straightDist: number, horizontalDist: number, verticalDist: number) => {
      globalThis.Module.removeFunction(callbackPtr)
      resolve({
        straightDist: straightDist,
        horizontalDist: horizontalDist,
        verticalDist: verticalDist
      })
    }
    const callbackPtr = globalThis.Module.addFunction(callback, "vfff")
    globalThis.Module.ccall(
      "vcJavascriptHooks_GetVerticalMeasurementDistances",
      undefined,
      ["int", "int"],
      [callbackPtr, node.projectNodePtr]
    )
  })
}

// export function toggleGizmoTools(node: ProjectNode, enabled: boolean) {
//   return new Promise<void>((resolve) => {
//     const callback = () => {
//       globalThis.Module.removeFunction(callbackPtr)
//       resolve()
//     }
//     const callbackPtr = globalThis.Module.addFunction(callback, "vi")
//     globalThis.Module.ccall(
//       "vcJavascriptHooks_ToggleGizmoTools",
//       undefined,
//       ["int", "int", "int"],
//       [callbackPtr, node.projectNodePtr, enabled ? 1 : 0]
//     )
//   })
// }

export function toggleGizmoTools(node: ProjectNode, enabled: boolean) {
  return new Promise<void>((resolve) => {
    let callback = () => {
      globalThis.Module.removeFunction(callbackPtr)
      resolve()
    }
    let callbackPtr = globalThis.Module.addFunction(callback, "v")
    globalThis.Module.ccall(
      "vcJavascriptHooks_ToggleGizmoTools",
      undefined,
      ["int", "int", "int"],
      [callbackPtr, node.projectNodePtr, enabled ? 1 : 0]
    )
  })
}

// export function setGizmoTool(node: ProjectNode, tool: GizmoTool) {
//   return new Promise<void>((resolve) => {
//     const callback = () => {
//       globalThis.Module.removeFunction(callbackPtr)
//       resolve()
//     }
//     const callbackPtr = globalThis.Module.addFunction(callback, "vi")
//     globalThis.Module.ccall(
//       "vcJavascriptHooks_SetGizmoTool",
//       undefined,
//       ["int", "int", "int"],
//       [callbackPtr, node.projectNodePtr, tool]
//     )
//   })
// }

export function setGizmoTool(node: ProjectNode, tool: GizmoTool) {
  return new Promise<void>((resolve) => {
    let callback = () => {
      globalThis.Module.removeFunction(callbackPtr)
      resolve()
    }
    let callbackPtr = globalThis.Module.addFunction(callback, "v")
    globalThis.Module.ccall(
      "vcJavascriptHooks_SetGizmoTool",
      undefined,
      ["int", "int", "int"],
      [callbackPtr, node.projectNodePtr, tool]
    )
  })
}

export function getAllowedGizmoControls(node: ProjectNode) {
  return new Promise<number>((resolve) => {
    const callback = (allowedControls: number) => {
      globalThis.Module.removeFunction(callbackPtr)
      resolve(allowedControls)
    }
    const callbackPtr = globalThis.Module.addFunction(callback, "vi")
    globalThis.Module.ccall(
      "vcJavascriptHooks_GetAllowedGizmoControls",
      undefined,
      ["int", "int"],
      [callbackPtr, node.projectNodePtr]
    )
  })
}

export function setGizmoSpace(node: ProjectNode, mode: number) {
  return new Promise<void>((resolve) => {
    const callback = () => {
      globalThis.Module.removeFunction(callbackPtr)
      resolve()
    }
    const callbackPtr = globalThis.Module.addFunction(callback, "vi")
    globalThis.Module.ccall(
      "vcJavascriptHooks_SetGizmoSpaceMode",
      undefined,
      ["int", "int", "int"],
      [callbackPtr, node.projectNodePtr, mode]
    )
  })
}

export function setClickedItem(node: ProjectNode) {
  globalThis.Module.ccall("vcJavascriptHooks_SetClickedItem", undefined, ["int"], [node.projectNodePtr])
}

export function getVoxelAttributes() {
  return new Promise<any>((resolve) => {
    const callback = (dataPtr: number) => {
      globalThis.Module.removeFunction(callbackPtr)
      resolve(JSON.parse(globalThis.UTF8ToString(dataPtr)))
    }
    const callbackPtr = globalThis.Module.addFunction(callback, "vi")
    globalThis.Module.ccall("vcJavascriptHooks_GetVoxelAttributes", undefined, ["int"], [callbackPtr])
  })
}

export function getLiveFeedInfo(node: ProjectNode) {
  return new Promise<any>((resolve) => {
    const callback = (dataPtr: number) => {
      globalThis.Module.removeFunction(callbackPtr)
      resolve(JSON.parse(globalThis.UTF8ToString(dataPtr)))
    }
    const callbackPtr = globalThis.Module.addFunction(callback, "vi")
    globalThis.Module.ccall(
      "vcJavascriptHooks_GetLiveFeedInfo",
      undefined,
      ["int", "int"],
      [callbackPtr, node.projectNodePtr]
    )
  })
}

export function setLiveFeedAddress(node: ProjectNode, address: string) {
  globalThis.Module.ccall(
    "vcJavascriptHooks_SetLiveFeedAddress",
    undefined,
    ["int", "string"],
    [node.projectNodePtr, address]
  )
}

export function getFlyThroughInfo(node: ProjectNode) {
  return new Promise<any>((resolve) => {
    const callback = (dataPtr: number) => {
      globalThis.Module.removeFunction(callbackPtr)
      resolve(JSON.parse(globalThis.UTF8ToString(dataPtr)))
    }
    const callbackPtr = globalThis.Module.addFunction(callback, "vi")
    globalThis.Module.ccall(
      "vcJavascriptHooks_GetFlyThroughInfo",
      undefined,
      ["int", "int"],
      [callbackPtr, node.projectNodePtr]
    )
  })
}

export function startRecordFlyThrough(node: ProjectNode) {
  globalThis.Module.ccall("vcJavascriptHooks_StartRecordFlyThrough", undefined, ["int"], [node.projectNodePtr])
}

export function stopRecordFlyThrough(node: ProjectNode) {
  globalThis.Module.ccall("vcJavascriptHooks_StopRecordFlyThrough", undefined, ["int"], [node.projectNodePtr])
}

export function playFlyThroughRecording(node: ProjectNode, timePosition: number) {
  globalThis.Module.ccall(
    "vcJavascriptHooks_PlayFlyThroughRecording",
    undefined,
    ["int", "number"],
    [node.projectNodePtr, timePosition]
  )
}

export function stopPlayFlyThrough(node: ProjectNode) {
  globalThis.Module.ccall("vcJavascriptHooks_StopPlayFlyThrough", undefined, ["int"], [node.projectNodePtr])
}

export function setPlaybackTime(node: ProjectNode, timePosition: number) {
  globalThis.Module.ccall(
    "vcJavascriptHooks_SetPlaybackTimePosition",
    undefined,
    ["int", "number"],
    [node.projectNodePtr, timePosition]
  )
}

export function setViewpointToCamera(node: ProjectNode, withVisSettings: boolean) {
  globalThis.Module.ccall(
    "vcJavascriptHooks_SetViewpointToCamera",
    undefined,
    ["int", "int"],
    [node.projectNodePtr, withVisSettings ? 1 : 0]
  )
}

export function enableVRPN() {
  globalThis.Module.ccall("vcJavascriptHooks_EnableVRPN", undefined, [], [])
}

export function disableVRPN() {
  globalThis.Module.ccall("vcJavascriptHooks_DisableVRPN", undefined, [], [])
}

export function restore3DTrackingDefault() {
  globalThis.Module.ccall("vcJavascriptHooks_Restore3DTrackingDefault", undefined, [], [])
}

export function reset3DTrackingOrigin() {
  return new Promise<void>((resolve) => {
    const callback = () => {
      globalThis.Module.removeFunction(callbackPtr)
      resolve()
    }
    const callbackPtr = globalThis.Module.addFunction(callback, "vi")
    globalThis.Module.ccall("vcJavascriptHooks_Restore3DTrackingOrigin", undefined, ["int"], [callbackPtr])
  })
}

export function reset3DTrackingPrevConfig() {
  return new Promise<void>((resolve) => {
    const callback = () => {
      globalThis.Module.removeFunction(callbackPtr)
      resolve()
    }
    const callbackPtr = globalThis.Module.addFunction(callback, "vi")
    globalThis.Module.ccall("vcJavascriptHooks_Restore3DTrackingPrevConfig", undefined, ["int"], [callbackPtr])
  })
}

export function getTrackingDeviceList() {
  return new Promise<any>((resolve) => {
    const callback = (dataPtr: number) => {
      globalThis.Module.removeFunction(callbackPtr)
      resolve(JSON.parse(globalThis.UTF8ToString(dataPtr)))
    }
    const callbackPtr = globalThis.Module.addFunction(callback, "vi")
    globalThis.Module.ccall("vcJavascriptHooks_GetTrackingDeviceList", undefined, ["int"], [callbackPtr])
  })
}

export function addNewDevice(data: object) {
  return new Promise<boolean>((resolve) => {
    const callback = (success: number) => {
      globalThis.Module.removeFunction(callbackPtr)
      resolve(success != 0)
    }
    const callbackPtr = globalThis.Module.addFunction(callback, "vi")
    globalThis.Module.ccall(
      "vcJavascriptHooks_AddTrackingDevice",
      undefined,
      ["string", "int"],
      [JSON.stringify(data), callbackPtr]
    )
  })
}

export function setFlyThroughInfo(node: ProjectNode, data: object) {
  return new Promise<void>((resolve) => {
    const callback = () => {
      globalThis.Module.removeFunction(callbackPtr)
      resolve()
    }
    const callbackPtr = globalThis.Module.addFunction(callback, "vi")
    globalThis.Module.ccall(
      "vcJavascriptHooks_SetFlyThroughInfo",
      undefined,
      ["string", "int", "int"],
      [JSON.stringify(data), node.projectNodePtr, callbackPtr]
    )
  })
}

export function setSceneItemSubItem(node: ProjectNode, data: number) {
  return new Promise<void>((resolve) => {
    const callback = () => {
      globalThis.Module.removeFunction(callbackPtr)
      resolve()
    }
    const callbackPtr = globalThis.Module.addFunction(callback, "vi")
    globalThis.Module.ccall(
      "vcJavascriptHooks_SetSceneItemSubItem",
      undefined,
      ["int", "int", "int"],
      [callbackPtr, node.projectNodePtr, data]
    )
  })
}

export function smoothFlyThrough(node: ProjectNode) {
  return new Promise<void>((resolve) => {
    const callback = () => {
      globalThis.Module.removeFunction(callbackPtr)
      resolve()
    }
    const callbackPtr = globalThis.Module.addFunction(callback, "vi")
    globalThis.Module.ccall(
      "vcJavascriptHooks_SmoothFlyThrough",
      undefined,
      ["int", "int"],
      [callbackPtr, node.projectNodePtr]
    )
  })
}

export function copyCurrPosition(node: ProjectNode, frame: number) {
  return new Promise<void>((resolve) => {
    const callback = () => {
      globalThis.Module.removeFunction(callbackPtr)
      resolve()
    }
    const callbackPtr = globalThis.Module.addFunction(callback, "vi")
    globalThis.Module.ccall(
      "vcJavascriptHooks_CopyCurrPosition",
      undefined,
      ["int", "int", "int"],
      [callbackPtr, node.projectNodePtr, frame]
    )
  })
}

export function addNewAfterCurrFrame(node: ProjectNode, frame: number) {
  return new Promise<void>((resolve) => {
    const callback = () => {
      globalThis.Module.removeFunction(callbackPtr)
      resolve()
    }
    const callbackPtr = globalThis.Module.addFunction(callback, "vi")
    globalThis.Module.ccall(
      "vcJavascriptHooks_AddNewAfterCurrFrame",
      undefined,
      ["int", "int", "int"],
      [callbackPtr, node.projectNodePtr, frame]
    )
  })
}

export function deleteCurrFrame(node: ProjectNode, frame: number) {
  return new Promise<void>((resolve) => {
    const callback = () => {
      globalThis.Module.removeFunction(callbackPtr)
      resolve()
    }
    const callbackPtr = globalThis.Module.addFunction(callback, "vi")
    globalThis.Module.ccall(
      "vcJavascriptHooks_DeleteCurrFrame",
      undefined,
      ["int", "int", "int"],
      [callbackPtr, node.projectNodePtr, frame]
    )
  })
}

export function getUDSModelMetadata(node: ProjectNode) {
  return new Promise<any>((resolve) => {
    const callback = (dataPtr: number) => {
      globalThis.Module.removeFunction(callbackPtr)
      resolve(JSON.parse(globalThis.UTF8ToString(dataPtr)))
    }
    const callbackPtr = globalThis.Module.addFunction(callback, "vi")
    globalThis.Module.ccall(
      "vcJavascriptHooks_GetUDSModelMetadata",
      undefined,
      ["int", "int"],
      [callbackPtr, node.projectNodePtr]
    )
  })
}

export function reloadUDSModel(node: ProjectNode) {
  return new Promise<void>((resolve) => {
    const callback = () => {
      globalThis.Module.removeFunction(callbackPtr)
      resolve()
    }
    const callbackPtr = globalThis.Module.addFunction(callback, "vi")
    globalThis.Module.ccall(
      "vcJavascriptHooks_ReloadUDSModel",
      undefined,
      ["int", "int"],
      [callbackPtr, node.projectNodePtr]
    )
  })
}

export function getMousePosition() {
  return new Promise<any>((resolve) => {
    const callback = (x: number, y: number, z: number) => {
      globalThis.Module.removeFunction(callbackPtr)
      resolve({
        x: x,
        y: y,
        z: z
      })
    }
    const callbackPtr = globalThis.Module.addFunction(callback, "vfff")
    globalThis.Module.ccall("vcJavascriptHooks_GetMousePosition", undefined, ["int"], [callbackPtr])
  })
}

export function setPlaceLocationName(name: string) {
  globalThis.Module.ccall("vcJavascriptHooks_SetPlaceLocationName", undefined, ["string"], [name])
}

export function setRandomizeHeading(randHeading: boolean) {
  globalThis.Module.ccall("vcJavascriptHooks_SetRandomizeHeading", undefined, ["int"], [randHeading ? 1 : 0])
}

// export function placeLayerMoveToLocation(node: ProjectNode, index: number) {
//   return new Promise<void>((resolve) => {
//     const callback = () => {
//       globalThis.Module.removeFunction(callbackPtr)
//       resolve()
//     }
//     const callbackPtr = globalThis.Module.addFunction(callback, "vi")
//     globalThis.Module.ccall(
//       "vcJavascriptHooks_PlaceLayerMoveToLocation",
//       undefined,
//       ["int", "int", "int"],
//       [callbackPtr, node.projectNodePtr, index]
//     )
//   })
// }

export function placeLayerMoveToLocation(node: ProjectNode, index: number) {
  return new Promise<void>((resolve) => {
    let callback = () => {
      globalThis.Module.removeFunction(callbackPtr)
      resolve()
    }
    let callbackPtr = globalThis.Module.addFunction(callback, "v")
    globalThis.Module.ccall(
      "vcJavascriptHooks_PlaceLayerMoveToLocation",
      undefined,
      ["int", "int", "int"],
      [callbackPtr, node.projectNodePtr, index]
    )
  })
}

// export function placeLayerRemoveLocation(node: ProjectNode, index: number) {
//   return new Promise<void>((resolve) => {
//     const callback = () => {
//       globalThis.Module.removeFunction(callbackPtr)
//       resolve()
//     }
//     const callbackPtr = globalThis.Module.addFunction(callback, "vi")
//     globalThis.Module.ccall(
//       "vcJavascriptHooks_PlaceLayerRemoveLocation",
//       undefined,
//       ["int", "int", "int"],
//       [callbackPtr, node.projectNodePtr, index]
//     )
//   })
// }

export function placeLayerRemoveLocation(node: ProjectNode, index: number) {
  return new Promise<void>((resolve) => {
    let callback = () => {
      globalThis.Module.removeFunction(callbackPtr)
      resolve()
    }
    let callbackPtr = globalThis.Module.addFunction(callback, "v")
    globalThis.Module.ccall(
      "vcJavascriptHooks_PlaceLayerRemoveLocation",
      undefined,
      ["int", "int", "int"],
      [callbackPtr, node.projectNodePtr, index]
    )
  })
}

export function resetUDSPick() {
  return new Promise<void>((resolve) => {
    const callback = () => {
      globalThis.Module.removeFunction(callbackPtr)
      resolve()
    }
    const callbackPtr = globalThis.Module.addFunction(callback, "vi")
    globalThis.Module.ccall("vcJavascriptHooks_ResetScreenCompareUDSPick", undefined, ["int"], [callbackPtr])
  })
}

export function mergeScenes(pathURL: string) {
  globalThis.Module.ccall("vcJavascriptHooks_MergeScenes", undefined, ["string"], [pathURL])
}

export function moveCamera(x: number, y: number, z: number) {
  globalThis.Module.ccall("vcJavascriptHooks_MoveCamera", undefined, ["number", "number", "number"], [x, y, z])
}

export function getFirstSelectedNode() {
  return new Promise<any>((resolve) => {
    const callback = (nodePtr: number) => {
      globalThis.Module.removeFunction(callbackPtr)
      resolve(nodePtr)
    }
    const callbackPtr = globalThis.Module.addFunction(callback, "vi")
    globalThis.Module.ccall("vcJavascriptHooks_GetFirstSelectedNode", undefined, ["int"], [callbackPtr])
  })
}

// export function registerGeneralUDSPickCallback(callback: GeneralUDSPickModelCallbackType) {
//   if (generalUDSPickCallback != callback) {
//     generalUDSPickCallback = callback
//   }
// }

// by zxm
/**
 * 
 * @param callback 点击UDS节点时，返回节点指针值
 */
export function registerGeneralUDSPickCallback(callback: GeneralUDSPickModelCallbackType) {
  if (generalUDSPickCallback != callback) {
    generalUDSPickCallback = callback;
  }
}

// export function performFlythrough(node: ProjectNode) {
//   return new Promise<void>((resolve) => {
//     let callback = () => {
//       globalThis.Module.removeFunction(callbackPtr)
//       resolve()
//     }
//     let callbackPtr = globalThis.Module.addFunction(callback, "v")
//     globalThis.Module.ccall(
//       "vcJavascriptHooks_PerformFlythrough",
//       undefined,
//       ["int", "int"],
//       [callbackPtr, node.projectNodePtr]
//     )
//   })
// }

export function performFlythrough(node: ProjectNode) {
  return new Promise<void>((resolve) => {
    let callback = () => {
      globalThis.Module.removeFunction(callbackPtr)
      resolve()
    }
    let callbackPtr = globalThis.Module.addFunction(callback, "v")
    globalThis.Module.ccall(
      "vcJavascriptHooks_PerformFlythrough",
      undefined,
      ["int", "int"],
      [callbackPtr, node.projectNodePtr]
    )
  })
}

export function detachCamera() {
  return new Promise<void>((resolve) => {
    let callback = () => {
      globalThis.Module.removeFunction(callbackPtr)
      resolve()
    }
    let callbackPtr = globalThis.Module.addFunction(callback, "v")
    globalThis.Module.ccall("vcJavascriptHooks_DetachCamera", undefined, ["int"], [callbackPtr])
  })
}


/**
 * 
 * @param x 项目投影下的x坐标
 * @param y 项目投影下的y坐标
 * @param z 项目投影下的z坐标
 * @param name 点名字
 * @returns 创建的点的指针
 */
export function addPoint(x: number, y: number, z: number, name: string) {
  return new Promise<any>((resolve) => {
    const callback = (nodePtr: number) => {
      resolve(nodePtr);
    };
    const callbackPtr = globalThis.Module.addFunction(callback, 'vi');
    globalThis.Module.ccall('vcJavascriptHooks_AddPoint', undefined, ['number', 'number', 'number', 'string', 'int'], [x, y, z, name, callbackPtr]);
  })
}