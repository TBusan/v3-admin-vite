<template>
  <div class="model-list" id="modelListId">
    <div v-for="item in modelList" :key="(item as any).id">
      <div class="list-item-content" @click="in2TheFolder(item)" v-if="((item as any).is_document === 1)">
        <img class="list-item-img-folder" v-lazy="folderImg" alt="文件夹" />
        <div class="txt-desInfos" :title="(item as any).name">{{ (item as any).name }}</div>
      </div>
      <div class="list-item-content list-item-model-draggable" v-else>
        <input
          @click="selectTheModel($event, item)"
          :checked="(item as any).checked"
          class="ck-radio-st"
          type="checkbox"
          :id="(item as any).id"
          name="modelSelect"
        />
        <label class="ck-radio-label" :for="(item as any).id">
          <img class="list-item-img" v-lazy="modelImg" alt="展示图" />
          <input :value="(item as any).url" style="display: none" />
          <div class="txt-desInfos" :title="(item as any).name">{{ (item as any).name }}</div>
        </label>
      </div>
    </div>
  </div>
  <el-divider />
  <div>
    <div>已勾选模型</div>
    <div class="select-model-list">
      <div v-for="item in selectModelList" :key="item.value">
        <div class="list-item-content-select">
          <img class="list-item-img" v-lazy="modelImg" alt="展示图" />
          <div class="txt-desInfos" :title="(item as any).name">{{ (item as any).name }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue"
import { ElMessage } from "element-plus"
//udstream相关
import { loadSceneItem } from "@/udStream/udStream"
import folderImg from "@/assets/images/folder.png"
import modelImg from "@/assets/images/model.png"
const props = defineProps({
  modelList: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(["sendSelectModelHandle", "reloadSceneSource"])
const selectModelList = ref([] as any[])

//选择操作的模型
const selectTheModel = (e: any, model: any) => {
  const findIndex = selectModelList.value.findIndex((item) => {
    return item.id == model.id
  })
  if (e?.target?.checked) {
    //选中
    if (findIndex == -1) {
      selectModelList.value.push(model)
    }
  } else {
    //取消选中
    if (findIndex === 0 || findIndex) {
      selectModelList.value.splice(findIndex, 1)
    }
  }
  // selectModelList.value = templateModelList
  console.log("被选中的元素", selectModelList.value)
  //将值传递给父组件
  emit("sendSelectModelHandle", selectModelList.value)
}

//下钻到对应的文件夹中去
const in2TheFolder = (params: any) => {
  emit("reloadSceneSource", params)
}

//鼠标拖拽的方法
const mouseDragged = (event: MouseEvent) => {
  let targetDom = event.target
  let dragDiv = null as any
  if (targetDom && targetDom.className == "list-item-content-draggable") {
    dragDiv = targetDom
  }

  if (targetDom && targetDom.className == "ck-radio-label") {
    dragDiv = targetDom.parentNode
  }

  if (targetDom && targetDom.className == "list-item-img") {
    dragDiv = targetDom.parentNode.parentNode
  }
  if (dragDiv) {
    // console.log(dragDiv)
    let udjsonUrl = dragDiv.childNodes[1].childNodes[1].value
    dragDiv.style.cursor = "pointer"
    dragDiv.ondragstart = function () {
      ElMessage({
        message: "需加载数据，请将数据拖拽至图层列表，也可以点选确认！",
        type: "warning",
        duration: 5000
      })
    }
    const dragEnterDiv = document.getElementById("layerListCardContainerId") //存在一个未补先知的过程
    if (dragEnterDiv) {
      dragEnterDiv.ondragenter = function (e) {
        dragDiv.ondragend = function (event) {
          console.log("已经进入2")
          if (udjsonUrl) {
            ElMessage({
              message: "已经选择场景，正在加载中...",
              type: "success"
            })
            setTimeout(() => {
              const sceneUrl = globleEuleeCloudPath + udjsonUrl
              loadSceneItem(sceneUrl)
            })
          }
        }
        //todo=> 最好是关闭弹窗
      }
    }
  }
}

onMounted(() => {
  //监听dom  加入场景的拖拽加入数据的效果
  let draggableDiv = document.getElementById("modelListId")
  if (draggableDiv) {
    draggableDiv.addEventListener("mousedown", mouseDragged, true)
  }
})

//销毁相应的数据监听
onUnmounted(() => {
  let draggableDiv = document.getElementById("sceneListId")
  draggableDiv?.removeEventListener("mousedown", mouseDragged)
})
</script>
<style lang="scss" scoped>
.model-list {
  display: grid;
  grid-template-columns: 12.5% 12.5% 12.5% 12.5% 12.5% 12.5%;
}

.ck-radio-st {
  display: none;
}

.ck-radio-st:checked + label {
  color: #05a6ca;
}
.ck-radio-label-div {
  display: inline-block;
  text-align: center;
}
.ck-radio-label:hover {
  cursor: pointer;
}
.list-item-img-folder {
  width: 60px;
  height: 60px;
}

.list-item-img {
  width: 80px;
  height: 60px;
}

.txt-desInfos {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.list-item-content {
  margin: 12px;
  text-align: center;
}

.list-item-content:hover {
  cursor: pointer;
}

.list-item-content-select {
  margin: 12px;
  text-align: center;
}
.list-item-content-select:hover {
  cursor: pointer;
}

.select-model-list {
  display: grid;
  grid-template-columns: 12.5% 12.5% 12.5% 12.5% 12.5% 12.5%;
}
</style>
