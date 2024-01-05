export type UdstreamCameraInfo = {
  name: string
  id: string
}

export type udtreamCameraCenterInfoType = {
  lon : number
  lat : number
  alt : number
  heading: number
  pitch : number
}


export enum UdstreamCameraInfoStoreEnums {
  UDSTREAM_CAMERA_INFO = 'udstreamCameraInfo',
  CAMERA_CENTER_LONLAT = 'cameraCenterLonLat'
}

export interface UdstreamCameraStoreType {
  [UdstreamCameraInfoStoreEnums.UDSTREAM_CAMERA_INFO]: any,
  [UdstreamCameraInfoStoreEnums.CAMERA_CENTER_LONLAT]: udtreamCameraCenterInfoType,
}
