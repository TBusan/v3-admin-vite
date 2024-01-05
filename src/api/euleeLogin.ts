import { request } from "@/utils/service"

// export interface IToeknParams {
//   secret: string
// }

/**  获取用户token */
export async function fetchUserTokenApiWithEulee(data: FormData) {
  return request({
    url: "ucloud/get_token",
    method: "post",
    data
  })
}
