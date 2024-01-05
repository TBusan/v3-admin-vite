/** 统一处理 Cookie */

import CacheKey from "@/constants/cacheKey"
// import Cookies from "js-cookie"
import VueCookies from "vue-cookies"

export const getToken = () => {
  // return Cookies.get(CacheKey.TOKEN)
  // return localStorage.getItem(CacheKey.TOKEN)
  // if (!VueCookies.get("token")) {
  //   VueCookies.set("token", "3e1b503c-5f59-468f-a24a-7109bbdebb11")
  // }
  // return  'a1ccc664-4d83-4fff-a2b9-b9c016250671'  // 'c18f2ecf-c123-4a62-88f0-b632025289be'  // 
  return VueCookies.get("token")
}
export const setToken = (token: string) => {
  // Cookies.set(CacheKey.TOKEN, token)
  // localStorage.setItem(CacheKey.TOKEN, token)
  VueCookies.set("token", token)
}
export const removeToken = () => {
  // Cookies.remove(CacheKey.TOKEN)
  // localStorage.removeItem(CacheKey.TOKEN)
  VueCookies.remove("token")
}
