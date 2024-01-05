<template>
  <div v-show="throughPointPopupShow" class="point-collect">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>通过点操作</span>
          <el-button class="button" text @click="cancelOprerate"> × </el-button>
        </div>
      </template>
      <el-input
        v-model="pointLabelName"
        @change="changeName"
        autocomplete="off"
        placeholder="点击点位集标注前，请输入标注的名称！"
      />
    </el-card>
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue"

// const popupVisible = ref(false)
const emit = defineEmits(["sendClosePopup", "changePointLabelName"])
const pointLabelName = ref("点位集标注")

const props = defineProps({
  throughPointPopupShow: {
    type: Boolean,
    required: true
  }
})

const cancelOprerate = () => {
  emit("sendClosePopup", false)
}

//改变点位集名称
const changeName = (params: string) => {
  emit("changePointLabelName", params)
}
</script>
<style scoped>
.point-collect {
  position: fixed;
  width: 250px;
  height: 180px;
  z-index: 999;
  right: 20%;
  top: 10%;
  font-size: 14px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.text {
  font-size: 14px;
}

.item {
  margin-bottom: 18px;
}
</style>
