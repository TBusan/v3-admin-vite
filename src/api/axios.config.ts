// 模块 Path 前缀分类
export enum ModuleTypeEnum {
  SYSTEM = "sys",
  PROJECT = "project",
  UDCLOUD = "ucloud" //优立相关的接口数据
}

// 接口白名单（免登录）
export const fetchAllowList = [
  // 登录
  `${ModuleTypeEnum.SYSTEM}/login`,
  // 获取 OSS 接口
  `${ModuleTypeEnum.SYSTEM}/getOssInfo`,
  // 预览获取数据
  `${ModuleTypeEnum.PROJECT}/getData`,
  //获取token前的token加密串
  `${ModuleTypeEnum.UDCLOUD}/token_secret`,
  //获取用户的token数据
  `${ModuleTypeEnum.UDCLOUD}/get_token`
]
// 接口黑名单
export const fetchBlockList = []
