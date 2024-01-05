<template>
  <el-dialog v-model="popupVisible" title="多媒体弹窗" @close="cancelOprerate">
    <el-form :model="form">
      <el-form-item label="媒体地址" :label-width="formLabelWidth">
        <el-input v-model="form.url" autocomplete="off" placeholder="输入媒体地址，合法的http/https" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancelOprerate">取消</el-button>
        <el-button type="primary" @click="confirmOprerate"> 确认 </el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script lang="ts" setup>
import { reactive, ref, watch } from "vue"
import { ElMessage } from "element-plus"

const popupVisible = ref(false)
// const dialogFormVisible = ref(false)

const props = defineProps({
  dialogMediaVisible: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(["sendClosePopup"])

const formLabelWidth = "140px"

const form = reactive({
  url: ""
})

const cancelOprerate = () => {
  emit("sendClosePopup")
}

const confirmOprerate = () => {
  if (!form.url) {
    ElMessage.warning("媒体路径不能为空！")
    return
  }
  const httpOrrtmp = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/ // https的验证
  const httpExp = new RegExp(httpOrrtmp)
  const rtspRegex = /^(rtsp|rtmp):\/\//;
  if (httpExp.test(form.url) || rtspRegex.test(form.url)) {
    emit("sendClosePopup", form.url)
  } else {
    ElMessage.warning("请输入合法的媒体地址，比如 http://xxx.com/xxx.png或rtsp://xxxxx/xxx")
    return
  }
}

watch(
  () => props.dialogMediaVisible,
  (nv, ov) => {
    console.log("多媒体的弹窗...")
    console.log(nv, ov)
    popupVisible.value = nv
  }
)
</script>
<style scoped>
.el-button--text {
  margin-right: 15px;
}
.el-select {
  width: 300px;
}
.el-input {
  width: 300px;
}
.dialog-footer button:first-child {
  margin-right: 10px;
}
</style>
