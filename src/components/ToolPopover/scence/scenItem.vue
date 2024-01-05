<template>
  <div class="scene-list" id="sceneListId">
    <div v-for="item in sceneList" :key="(item as any).id">
      <div class="list-item-content" @click="in2TheFolder(item)" v-if="((item as any).is_document === 1)">
        <img class="list-item-img-folder" v-lazy="folderImg" alt="文件夹展示图" />
        <div class="txt-desInfos" :title="(item as any).name">{{ (item as any).name }}</div>
      </div>
      <div draggable="true" class="list-item-content list-item-content-draggable" v-else>
        <input
          @click="selectTheScene($event, item)"
          class="ck-radio-st"
          type="radio"
          :id="(item as any).id"
          name="modelSelect"
        />
        <label class="ck-radio-label" :for="(item as any).id">
          <img class="list-item-img" v-lazy="sceneImg" alt="场景展示图" />
          <input :value="(item as any).url" style="display: none" />
          <div class="txt-desInfos" :title="(item as any).name">{{ (item as any).name }}</div>
        </label>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue"
import { ElMessage } from "element-plus"
import folderImg from "@/assets/images/folder.png"
import sceneImg from "@/assets/images/scene.png"
// import { MousePutDown } from "@/utils/tool"
//udstream相关
import { loadSceneItem } from "@/udStream/udStream"

const props = defineProps({
  sceneList: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(["sendSelectSceneHandle", "reloadSceneSource"])
const selectScene = ref(null as unknown as any)
//选择操作的模型  (场景只能进行单选)
const selectTheScene = (e: any, model: any) => {
  if (e?.target?.checked) {
    //选中
    selectScene.value = model
    //将值传递给父组件
    emit("sendSelectSceneHandle", selectScene.value)
  }
}

//下钻到对应的文件夹中去
const in2TheFolder = (params: any) => {
  emit("reloadSceneSource", params)
}

//鼠标的拖拽
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
    // const dragEnterDiv = document.getElementById("canvas") //存在一个未补先知的过程
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
  // console.log(props.sceneList)
  //监听dom  加入场景的拖拽加入数据的效果
  let draggableDiv = document.getElementById("sceneListId")
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
.scene-list {
  display: grid;
  grid-template-columns: 12.5% 12.5% 12.5% 12.5% 12.5% 12.5% 12.5%;
}

.ck-radio-st {
  display: none;
}

.ck-radio-st:checked + label {
  color: #05a6ca;
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
</style>
