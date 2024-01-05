<template>
  <component :is="currentRole === 'admin' ? AdminDashboard : EditorDashboard" />
</template>
<script lang="ts" setup>
import { h, ref } from "vue"
import AdminDashboard from "./admin/index.vue"
import EditorDashboard from "./editor/index.vue"
import { ElNotification } from "element-plus"

// type CurrentRoleType = "admin" | "editor"

const currentRole = ref("admin")

// const userStore = useUserStore()
// const currentRole = ref<CurrentRoleType>("admin")
// if (!userStore.roles.includes("admin")) {
//   currentRole.value = "editor"
// }

ElNotification({
  title: "你好",
  message: h("span", { style: "color: teal" }, "欢迎来到优立云世界......"),
  duration: 4000,
  position: "bottom-right"
})
</script>
