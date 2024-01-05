import { request } from "@/utils/service"

export interface IModelParams {
  page: string
  pagesize: string
  parent_id: string
  ftype: string
  group_id?: string
}

export interface ISceneParams {
  page: string
  pagesize: string
  parent_id: string
  ftype: string
  group_id?: string
}

/** 获取用户的组织  （个人空间   优立空间） */
export function queryOrganizationListApiWithEulee() {
  return request({
    url: "ucloud/my_groups",
    method: "post"
  })
}

/** 查询模型数据 */
export function queryModelListApiWithEuleeOld(data: FormData) {
  return request({
    url: "ucloud/my_models",
    method: "post",
    data
  })
}

/**  获取场景 */
export function fetchSceneApiWithEuleeOld(data: FormData) {
  return request({
    url: "ucloud/my_models",
    method: "post",
    data
  })
}

/**  查询模型数据   新版*/
export function queryModelListApiWithEulee(data: FormData) {
  return request({
    url: "ucloud_v1/my_file_list",
    method: "post",
    data
  })
}

/**  获取场景   新版*/
export function fetchSceneApiWithEulee(data: FormData) {
  return request({
    url: "ucloud_v1/my_file_list",
    method: "post",
    data
  })
}


// * 获取项目的数据  自定义后台数据
export const fethProjectApiWithEulee = async (data: FormData) => {
  return request({
    url: "ucloud/get_project_json",
    method: "post",
    data
  })
}

// * 保存项目 用eulee的接口保存
export const saveProjectApiWithEulee = async (data: FormData) => {
  return request({
    url: "ucloud/update_project_json",
    method: "post",
    data
  })
}

