import { defineStore } from "pinia"
// import { StorageEnum } from "@/enums/storageEnum"
import { UdstreamStoreType, UdstreamSettingType } from "./udstreamStore.d"
import { setLocalStorage } from "@/utils/storage"
import { ProjectNode } from "@/udStream/types/ProjectNode"
// import { type } from "os"
// import { Unknown } from "@vicons/carbon"
// const { GO_SYSTEM_UDTREAM_STORE } = StorageEnum
// const storageUdstream: UdstreamStoreType = getLocalStorage(GO_SYSTEM_UDTREAM_STORE)

export const useUdstreamStore = defineStore({
  id: "udstreamStore",
  getters: {
    getSessionInfo(): Object {
      return this.sessionInfo
    },
    getLoggedin(): boolean {
      return this.loggedin
    },
    getUdstreamCanvasLoaded(): boolean {
      return this.udstreamCanvasLoaded
    },
    getUdstreamScenceSaved(): boolean {
      return this.udstreamScenceSaved
    },
    getUdstreamScenceAutoSaved(): boolean {
      return this.udstreamScenceAutoSaved
    },
    getUdstreamSetting(): UdstreamSettingType {
      return this.udstreamSetting
    },
    getIsSelected(): boolean {
      return this.isSelected
    },
    getSelectedUdstreamNode(): ProjectNode {
      return this.selectedNode
    },
    getUdstreamRootNode(): ProjectNode {
      return this.udstreamRootNode
    },
    getProjectTitle(): string {
      return this.projectTitle
    },
    getPageListRequestEnd(): boolean {
      return this.pageListRequestEnd
    }
  },
  state: (): UdstreamStoreType => ({
    sessionInfo: "",
    loggedin: false,
    udstreamCanvasLoaded: false, // udstream的画布已经被加载
    udstreamScenceSaved: false, // 页面的保存
    udstreamScenceAutoSaved: false, // 页面的自动保存
    udstreamSetting: null as unknown as UdstreamSettingType, // udstream的页面设置
    isSelected: false, // udstream节点被选中
    selectedNode: null as unknown as any,      // 被选中的udstream节点
    udstreamRootNode:  null as unknown as any,  // new ProjectNode(0),  // udstream的根节点
    projectTitle: "", // 项目名称
    pageListRequestEnd: false // 是否请求结束
  }),
  actions: {
    setItem<T extends keyof UdstreamStoreType, K extends UdstreamStoreType[T]>(key: T, value: K): void {
      this.$patch((state) => {
        state[key] = value
      })
      setLocalStorage("SYSTEM_UDTREAM_STORE", this.$state)
    }
  }
})
