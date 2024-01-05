import { ProjectNode } from '@/udStream/types/ProjectNode'

// import { type } from 'os'

export type displayAvatarsType = {
  displayAvatars: boolean
}

export type betaFeaturesType = {
  aoiextrude: boolean
  collaboration: boolean
  gpurenderer: boolean
  lassoselection: boolean
  panoviewing: boolean
  querytool: boolean
  screencomparison: boolean
  udspolygonfilter: boolean
}

export type cameraType = {
  cameraMouseBindings: Array<number>
  fieldOfView: Array<number>
  invertControllerX: boolean
  invertControllerY: boolean
  invertMouseX: boolean
  invertMouseY: boolean
  lensId: Array<number>
  moveMode: number
  moveSpeed: Array<number>
  scrollwheelBinding: number
}

export type convertType = {
  author: string
  comment: string
  copyright: string
  license: string
  tempDirectory: string
}

export type gpuRendererType = {
  pointCount: number
  threshold: number
  voxelsize: number
}

export type keysType = {
  AddBoxFilter: number
  AddCapsuleFilter: number
  AddCrossSection: number
  AddMapTiles: number
  AddMedia: number
  AddPolygonFilter: number
  AddSimpleCrossSection: number
  AddSphereFilter: number
  AddUDS: number
  AddViewShed: number
  BindingsInterface: number
  CameraBackward: number
  CameraDown: number
  CameraForward: number
  CameraLeft: number
  CameraRight: number
  CameraUp: number
  Cancel: number
  DecreaseCameraSpeed: number
  Fullscreen: number
  GizmoLocalSpace: number
  GizmoRotate: number
  GizmoScale: number
  GizmoTranslate: number
  IncreaseCameraSpeed: number
  LockAltitude: number
  OpenSettingsMenu: number
  Remove: number
  RenameSceneItem: number
  TakeScreenshot: number
  ToggleAnnotateTool: number
  ToggleInspectionTool: number
  ToggleMeasureAreaTool: number
  ToggleMeasureHeightTool: number
  ToggleMeasureLineTool: number
  ToggleSceneExplorer: number
  ToggleSelectTool: number
}

export type loginType = {
  ignoreCertificateErrors: boolean
  proxy: string
  proxyRequiresAuth: boolean
  rememberProxyUsername: boolean
  serverURL: string
  useragent: string
  username: string
}

export type maptilesType = {
  DEMMaxLevels: number
  DEMServerURL: string
  demEnabled: boolean
  keepAboveSurface: boolean
  mapOptions: number
  mapQuality: number
}

export type mouseSnapType = {
  enable: boolean
  range: number
}


export type objectHighlightingType = {
  colour: Array<number>
  enable: boolean
  thickness: number
}

export type colourByDepthType = {
  colour: Array<number>
  enabled: boolean
  endDepth: number
  startDepth: number
}

export type colourByHeightType = {
  enabled: boolean
  endHeight: number
}

export type contoursType = {
  bandHeight: number
  colour: Array<number>
  distances: number
  enabled: boolean
  rainbowIntensity: boolean
  rainbowRepeat: boolean
}

export type edgeOutlinesType = {
  colour: Array<number>
  enabled: boolean
  threshold: number
  width: number
}

export type ssaoType = {
  colour: Array<number>
  enable:boolean
  stepSize:number
}

export type postVisualizationType = {
  colourByDepth: colourByDepthType
  colourByHeight: colourByHeightType
  contours: contoursType
  edgeOutlines: edgeOutlinesType
  ssao:ssaoType
}

export type projectsHistoryType = {
  group: Array<string>
  isServerProject: Array<boolean>
  name: Array<string>
  path: Array<string>
}

export type resolutionType = {
  height: number
  width: number
}

export type screenshotType = {
  outputPath: string
  resolution: resolutionType
  viewOnceTaken: boolean
}

export type sectionViewType = {
  colour: number
  showGrid: boolean
  windowHeight: number
}

export type skyboxType = {
  colour: Array<number>
  exposure: number
  keepSameTime: boolean
  month: number
  timeOfDay: number
  type: number
  uselivetime: boolean
}

export type stereoscopicType = {
  eyeDistance: number
  headInputSmoothing: number
  mode: number
  screenBottomLeftL: Array<number>
  screenBottomRight: Array<number>
  screenTopLeft: Array<number>
  spaceTransform: Array<number>
  swapEyes: boolean
  wandInputSmoothing: number
}

export type fillType = {
  colour: Array<number>
}

export type labelType = {
  backgroundColour: Array<number>
  textColour: Array<number>
  textSize: number
}

export type lineType = {
  colour: Array<number>
  fenceMode: number
  style: number
  width: number
}


export type toolsType = {
  fill: fillType
  label: labelType
  line: lineType
}

export type areaUnitItemType = {
  unit: number
  upperLimit: number
}

export type distanceUnitItemType = {
  unit: number
  upperLimit: number
}

export type unitConversionType = {
  areaSigFigs: number
  areaUnit: Array<areaUnitItemType>
  distanceSigFigs: number
  distanceUnit: Array<distanceUnitItemType>
  speedSigFigs: number
  speedUnit: number
  temperatureSigFigs: number
  temperatureUnit: number
  timeReference: number
  timeSigFigs: number
  volumeSigFigs: number
  volumeUnit: Array<distanceUnitItemType>
}

export type viewportItemType = {
  height: number
  width: number
}

export type viewportsType = {
  activeCount: number
  viewport: Array<viewportItemType>
}

export type positionType = {
  x: number
  y: number
}

export type windowType = {
  height: number
  language: string
  maximized: boolean
  onScreenControls: boolean
  position: positionType
  showNativeUI: boolean
  touchscreenFriendly: boolean
  width: number
}

export type GPSTimeType = {
  inputFormat: number
  maxTime: number
  minTime: number
}

export type displacementType = {
  errColour: number
  maxBound: number
  maxColour: number
  midColour: number
  minBound: number
  minColour: number
}

export type pointSourceIDType = {
  defaultColour: number
}

export type scanAngleType = {
  maxAngle: number
  minAngle: number
}

export type screenspaceChangeType = {
  filterNegative: boolean
  filterNull: boolean
  filterPositive: boolean
  negColour: Array<number>
  nullColour: Array<number>
  posColour: Array<number>
  threshold: number
  upperThreshold: number
}

export type visualizationType = {
  GPSTime: GPSTimeType
  classificationColours: Array<number>
  defaultVoxelColour: Array<number>
  displacement: displacementType
  flatColour: Array<number>
  maxIntensity: number
  minIntensity: number
  mode: number
  numberOfReturnsColours: Array<number>
  pointSourceID: pointSourceIDType
  returnNumberColours: Array<number>
  scanAngle: scanAngleType
  screenspaceChange: screenspaceChangeType

}


export type UdstreamSettingType = {
  ImageRescaleDistance: number
  POIfadeDistance: number
  alwaysDismissInputModal: boolean
  antiAliasingType: number                 //抗锯齿模式
  avatar: displayAvatarsType
  betaFeatures: betaFeaturesType
  camera: cameraType
  convert: convertType
  convertLeftPanelPercentage: number
  farPlane: number
  gpuRenderer: gpuRendererType
  hideUpdateAvailableOnLogin: number
  imageLoadDistance: number
  keys: keysType
  layout: number
  layoutSceneExplorerSize: number
  limitFPSInBackground: boolean
  login: loginType
  mapModeViewType: number
  mapModeViewport: number
  maptiles: maptilesType                           //DDEM相关的设置
  mouseSnap: mouseSnapType
  nearPlane: number
  objectHighlighting: objectHighlightingType       //选中模型高亮相关的操作
  perfQualityRatio: number                        //质量类型
  pointMode: number                               //uds的显示模式  点 矩形
  postVisualization: postVisualizationType
  projectsHistory: projectsHistoryType
  saturation: number
  sceneExplorerCollapsed: boolean
  screenshot: screenshotType
  sectionView: sectionViewType
  showCameraFrustumInMapMode: boolean
  showCameraInfo: boolean                          //是否显示摄像机信息
  showDiagnosticInfo: boolean
  showEuclideonLogo: boolean
  showGISInfo: boolean                              //显示地理信息
  showSelectionTools: boolean
  showUdstreamTools: boolean
  showViewcube: boolean
  skybox: skyboxType                                //天空盒相关的设置
  stereoscopic: stereoscopicType
  tools: toolsType
  uiLevel: number
  uiScale: number
  unitConversion: unitConversionType
  viewportMode: Array<number>
  viewports: viewportsType
  visualization: visualizationType                  //符号化相关的设置
  window: windowType
}
export enum UdstreamStoreEnums {
  // 拖拽页面左侧表单分类只有一项的时候是否隐藏
  SESSION_INFO = 'sessionInfo',                        //暂时不明确
  LOGGED_IN = 'loggedin',                              //udstream是否已经登录成功
  UDSTREAM_CANVAS_LOADED = 'udstreamCanvasLoaded',     //udstream 的画布是否被加载
  UDSTREAM_SCENCE_SAVED = 'udstreamScenceSaved',
  UDSTREAM_SCENCE_AUTO_SAVED = 'udstreamScenceAutoSaved',
  UDSTREAM_ROOT_NODE = 'udstreamRootNode',             //udstream的节点信息
  IS_SELECT = 'isSelected',                            //udstream是否有被选中的节点
  SELECTED_NODE = 'selectedNode',                      //被选中的节点 
  UDSTREAM_SETTING = 'udstreamSetting',                 //udstream页面的设置
  PROJECT_TITLE = 'projectTitle',                      //项目的名称
  PEGE_LISTREQUEST_END= 'pageListRequestEnd',          //是否请求结束
}

export interface UdstreamStoreType {
  [UdstreamStoreEnums.SESSION_INFO]: Object,
  [UdstreamStoreEnums.LOGGED_IN]: boolean,
  [UdstreamStoreEnums.UDSTREAM_CANVAS_LOADED]: boolean,
  [UdstreamStoreEnums.UDSTREAM_SCENCE_SAVED]: boolean,
  [UdstreamStoreEnums.UDSTREAM_SCENCE_AUTO_SAVED]: boolean,
  [UdstreamStoreEnums.IS_SELECT]: boolean,
  [UdstreamStoreEnums.SELECTED_NODE]: ProjectNode,
  [UdstreamStoreEnums.UDSTREAM_ROOT_NODE]: ProjectNode,
  [UdstreamStoreEnums.UDSTREAM_SETTING]: UdstreamSettingType,
  [UdstreamStoreEnums.PROJECT_TITLE]: string,
  [UdstreamStoreEnums.PEGE_LISTREQUEST_END]: boolean
}
