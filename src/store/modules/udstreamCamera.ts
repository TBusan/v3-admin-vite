import { defineStore } from "pinia"
import { UdstreamCameraStoreType, udtreamCameraCenterInfoType } from "./udstreamCamera.d"
// import { setLocalStorage } from "@/utils/storage"

export const useUdStreamCameraStore = defineStore({
  id: "udstreamCameraStore",
  getters: {
    getUdstreamCameraInfo(): any {
      return this.udstreamCameraInfo
    },
    getUdtreamCenterLonLatInfo(): udtreamCameraCenterInfoType {
      return this.cameraCenterLonLat
    }
  },
  state: (): UdstreamCameraStoreType => ({
    udstreamCameraInfo: { name: "", id: "" } as unknown as any, // 被选中的页面信息
    cameraCenterLonLat: null as unknown as udtreamCameraCenterInfoType //相机的中点
  }),
  actions: {
    setItem<T extends keyof UdstreamCameraStoreType, K extends UdstreamCameraStoreType[T]>(key: T, value: K): void {
      this.$patch((state) => {
        state[key] = value
      })
    }
  }
})
