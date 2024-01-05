import { defineStore } from "pinia"
import { PageStoreType, PageInfoType, TreeOption, PageNodeType } from "./pageInfoStore.d"
import { setLocalStorage } from "@/utils/storage"

export const usePageInfoStore = defineStore({
  id: "pageInfoStore",
  getters: {
    getSelectPageInfo(): PageInfoType {
      return this.pageInfo
    },
    getPageNodeInfo(): TreeOption[] {
      return this.pageNodeInfo
    },
    getPageList(): TreeOption[] {
      return this.pageList
    }
  },
  state: (): PageStoreType => ({
    pageInfo: { name: "", id: "" } as unknown as PageInfoType, // 被选中的页面信息
    pageNodeInfo: [] as PageNodeType[], // 页面的节点信息
    pageList: [] as PageNodeType[] //所有的页面信息
  }),
  actions: {
    setItem<T extends keyof PageStoreType, K extends PageStoreType[T]>(key: T, value: K): void {
      this.$patch((state) => {
        state[key] = value
      })
      setLocalStorage("udstreamPageInfo", this.$state)
    }
  }
})
