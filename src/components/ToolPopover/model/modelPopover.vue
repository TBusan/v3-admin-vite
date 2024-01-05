<template>
  <div>
    <el-dialog
      v-bind="attrs"
      :model-value="props.modelValue"
      :show-close="false"
      :fullscreen="attrs?.fullscreen ?? isFullscreen"
      :before-close="handleClose"
    >
      <template #header>
        <div>
          <span class="dialog-title">{{ props.title }}</span>
        </div>
        <div class="btns">
          <el-icon v-if="isFullScreenBtn" @click="handleFullscreen"><FullScreen /></el-icon>
          <el-icon @click="handleClose"><Close /></el-icon>
        </div>
      </template>
      <div class="content" v-loading="props.loading">
        <el-select @change="govSelectChange" v-model="spaceValue" placeholder="Select">
          <el-option
            v-for="item in spaceOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <div class="card-header">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item v-for="item in breadcrumbList" :key="item.id">
              <el-button text @click="breadItemHandle(item)"> {{ item.label }}</el-button>
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <model-item
          v-show="euleeModelList.length > 0"
          :modelList="euleeModelList"
          @sendSelectModelHandle="obtainModelsFromCh"
          @reloadSceneSource="reloadSceneSource"
        />
      </div>
      <template #footer>
        <span v-if="!slots.footer" class="dialog-footer">
          <el-button type="primary" @click="handleConfirm">{{ props.confirmText }}</el-button>
          <el-button @click="handleClose">{{ props.cancelText }}</el-button>
        </span>
        <slot v-else name="footer" />
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, ref, useAttrs, useSlots } from "vue"
import { FullScreen, Close } from "@element-plus/icons-vue"
import ModelItem from "./modelItem.vue"
//接口相关
import { queryModelListApiWithEulee, queryOrganizationListApiWithEulee } from "@/api/euleeSource"
const attrs = useAttrs()
const slots = useSlots()
const isFullscreen = ref(false)
const euleeModelList = ref([])
//组织的选择
const spaceValue = ref("个人空间")
const spaceOptions = ref([
  {
    label: "个人空间",
    value: "个人空间", //personalSpace
    group_id: ""
  }
])

let group_id = "" //组织的ID
// 子组件中被选择的模型
let selectModelList: any[] = []

const breadcrumbList = ref([
  {
    label: "首页",
    id: 0
  }
])

const isFullScreenBtn = computed(() => {
  if (props.hiddenFullBtn) return false
  if (attrs?.fullscreen) return false
  return true
})

interface PropsType {
  title?: string
  isDraggable?: boolean
  modelValue?: boolean
  hiddenFullBtn?: boolean
  loading?: boolean
  confirmText?: string
  cancelText?: string
}

const props = withDefaults(defineProps<PropsType>(), {
  title: "",
  isDraggable: false,
  modelValue: false,
  hiddenFullBtn: false,
  loading: false,
  confirmText: "确认",
  cancelText: "关闭"
})

const emits = defineEmits<{
  (e: "update:modelValue"): void
  (e: "confirm", value: any[]): void
  (e: "close"): void
}>()

const handleFullscreen = () => {
  if (attrs?.fullscreen) return
  isFullscreen.value = !isFullscreen.value
}

//获取子组件传递过来的被选中的模型
const obtainModelsFromCh = (selectModel: any) => {
  selectModelList = selectModel
}

//从子组件中获取重新查询资源的参数 (自组件  文件夹下钻)
const reloadSceneSource = (params: any) => {
  //重新构造面包屑
  const breadItem = {
    label: params.name,
    id: params.id
  }
  breadcrumbList.value.push(breadItem)
  //重新查询数据
  const formData = new FormData()
  const parent_id = params.id
  formData.append("page", "1")
  formData.append("pagesize", "2000")
  formData.append("parent_id", parent_id)
  formData.append("ftype", "0")
  // formData.append("ftype_cata1", "1")
  if (group_id && group_id != "") {
    formData.append("group_id", group_id)
  }
  queryModelListApiWithEulee(formData).then((res) => {
    euleeModelList.value = res.data.list
  })
}

//组织变化的事件
const govSelectChange = (option: string) => {
  //更改查询的值
  const formData = new FormData()
  formData.append("page", "1")
  formData.append("pagesize", "2000")
  formData.append("parent_id", "0")
  formData.append("ftype", "0")
  // formData.append("ftype_cata1", "1")
  //找到对应的group_id
  let findIndex = spaceOptions.value.findIndex((item) => {
    return item.value == option
  })
  if (findIndex != -1 && option ) {
    group_id = spaceOptions.value[findIndex].group_id.toString()
    formData.append("group_id", group_id)
  } else {
    group_id = ""
  }
  queryModelListApiWithEulee(formData).then((res) => {
    euleeModelList.value = res.data.list
  })

  //将面包屑复位
  breadcrumbList.value = [
    {
      label: "首页",
      id: 0
    }
  ]
}

const handleClose = () => {
  if (Reflect.has(attrs, "before-close") && typeof attrs["before-close"] === "function") {
    attrs["before-close"]()
  }
  emits("close")
}
const handleConfirm = () => {
  emits("confirm", selectModelList)
}

const breadItemHandle = (params: any) => {
  const parent_id = params.id
  //重新构建面包屑
  const breadcrumbListLen = breadcrumbList.value.length
  const findIndex = breadcrumbList.value.findIndex((item) => {
    return item.id == parent_id
  })

  if (findIndex === breadcrumbListLen - 1) {
    //点击的是最后一个面包屑  不需要做任何操作
    return
  }

  breadcrumbList.value.splice(findIndex + 1, breadcrumbListLen - findIndex - 1)
  //重新查询数据
  const formData = new FormData()
  formData.append("page", "1")
  formData.append("pagesize", "2000")
  formData.append("parent_id", parent_id)
  formData.append("ftype", "0")
  // formData.append("ftype_cata1", "1")
  if (group_id && group_id != "") {
    formData.append("group_id", group_id)
  }
  queryModelListApiWithEulee(formData).then((res) => {
    euleeModelList.value = res.data.list
  })
}

defineExpose({
  isVisible: props.modelValue
})

onMounted(() => {
  //获取组织的数据
  queryOrganizationListApiWithEulee().then((res) => {
    if (res.data && res.data.my_gropus && res.data.my_gropus.length > 0) {
      res.data.my_gropus.forEach((em: any) => {
        const item = {
          label: em.name,
          value: em.name, //personalSpace
          group_id: em.group_id
        }
        spaceOptions.value.push(item)
      })
    }
  })
  //获取模型数据
  const formData = new FormData()
  formData.append("page", "1")
  formData.append("pagesize", "2000")
  formData.append("parent_id", "0")
  formData.append("ftype", "0")
  // formData.append("ftype_cata1", "1")
  if (group_id && group_id != "") {
    formData.append("group_id", group_id)
  }
  queryModelListApiWithEulee(formData).then((res: any) => {
    euleeModelList.value = res.data.list
  })
})
</script>

<style lang="scss" scoped>
:deep(.el-dialog__header) {
  border-bottom: 1px solid #eee;
  display: flex;
  padding: 12px 16px;
  align-items: center;
  justify-content: space-between;
  margin: 0;
}
.dialog-title {
  line-height: 24px;
  font-size: 18px;
}
.btns {
  display: flex;
  align-items: center;
  i {
    margin-right: 8px;

    font-size: 16px;
    cursor: pointer;
  }
  i:last-child {
    margin-right: 0;
  }
}
</style>
