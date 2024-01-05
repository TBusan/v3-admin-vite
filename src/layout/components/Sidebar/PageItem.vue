<template>
  <div class="card-container-div box-card-top card-container-div-top-one">
    <el-card v-show="!isCollapse" shadow="never" class="card-container">
      <template #header>
        <div class="card-header">
          <el-tag type="info">场景页面</el-tag>
          <el-tooltip class="box-item" content="新增页面" placement="top">
            <el-dropdown @command="commandsOperate">
              <el-button text>
                <el-icon class="el-icon--right"><Plus /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="no-src">无地理坐标</el-dropdown-item>
                  <el-dropdown-item command="has-src">有地理坐标</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </el-tooltip>
        </div>
      </template>
      <div class="tree-div">
        <el-tree
          ref="treeRef"
          :data="pageTreeData"
          :props="defaultProps"
          show-checkbox
          :default-expand-all="true"
          :default-checked-keys="defaultCheckedKeys"
          @node-click="handleNodeClick"
          @node-contextmenu="righttClick"
          node-key="id"
          disabled
        >
          <template #default="{ node, data }">
            <div class="custom-tree-node">
              <div class="icon-span">
                <svg-icon v-if="data.srid == 0" class="udstream-tool-svg" name="Srid-no" />
                <svg-icon v-else-if="data.srid == 4978" class="udstream-tool-svg" name="Srid-has" />
              </div>
              <div class="icon-span-txt" v-show="data.show">
                {{ data.label }}
              </div>
              <div class="icon-span-txt-edit" v-show="!data.show">
                <el-input
                  v-model="data.label"
                  :value="data.label"
                  @keyup.enter.native="enterInputLabel"
                  placeholder="请输入重命名文字"
                  @keydown.stop
                  size="small"
                />
                <el-icon @click="modifyInputLabel(data.label)"><CircleCheckFilled /></el-icon>
              </div>
            </div>
          </template>
        </el-tree>
      </div>
    </el-card>
    <el-card v-show="isCollapse" class="card-container">
      <template #header>
        <div class="card-header-el">
          <el-icon><Notebook /></el-icon>
        </div>
      </template>
      <div class="folder-div">场景页面</div>
    </el-card>
    <div class="rightMenu" v-show="showRightMenu">
      <ul>
        <li @click="renameMenu">
          <span class="span-icon">
            <el-icon :size="12"> <Edit /> </el-icon>
          </span>
          <span class="span-icon-txt"> 重命名 </span>
        </li>
        <li @click="delMenu">
          <span class="span-icon">
            <el-icon :size="12"><Delete /></el-icon>
          </span>
          <span class="span-icon-txt"> 删除 </span>
        </li>
        <li @click="exportMenu">
          <span class="span-icon">
            <el-icon :size="12"><Position /></el-icon>
          </span>
          <span class="span-icon-txt"> 导出 </span>
        </li>
        <li @click="cancleOprate">
          <span class="span-icon">
            <el-icon :size="12"><Close /></el-icon>
          </span>
          <span class="span-icon-txt"> 取消 </span>
        </li>
      </ul>
    </div>
  </div>
  <div class="sceneLoading" v-show="sceneLoadingShow">
    <div class="sceneLoadingInfo">
      <el-icon><Loading /></el-icon>
      <div class="sceneLoadingInfo-txt">场景加载中.....</div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, watch, toRaw, computed } from "vue"
import { ElTree, ElMessage, ElMessageBox } from "element-plus"
import { Notebook, Position, Delete, Edit, Close, Loading, CircleCheckFilled } from "@element-plus/icons-vue"
import { useUdstreamStore } from "@/store/modules/udstreamStore"
import { UdstreamStoreEnums } from "@/store/modules/udstreamStore.d"
import { usePageInfoStore } from "@/store/modules/pageInfoStore"
import { PageStoreEnums } from "@/store/modules/pageInfoStore.d"
import { savePrePageData2LocalStrorage } from "@/utils/tool"
import { useAppStore } from "@/store/modules/app"

import * as udStream from "@/udStream/udStream"
const udstreamStore = useUdstreamStore()
const pageInfoStore = usePageInfoStore()
const defaultProps = {
  value: "value",
  id: "id",
  label: "label",
  title: "title",
  isLeaf: "isLeaf",
  disabled: "disabled"
}

const sceneLoadingShow = ref(false)
const showRightMenu = ref(false) //右键菜单显示
const renameInputShow = ref(false) //重命名的显示
const renameValue = ref("") //重命名的文字
const newPageVisible = ref(false) //新建页面确认框的显示
let rightClickData: any //右键操作的数据
const appStore = useAppStore()
const isCollapse = computed(() => {
  return !appStore.sidebar.opened
})

interface Tree {
  label: string
  value: string
  id: string
  title?: string
  isLeaf?: boolean
  disabled: boolean
}

let pageMaxNumber = 0
let currentPageIndex = 1
let isFirstNewPage = true
const treeRef = ref<InstanceType<typeof ElTree>>()

const srcValue = ref("0")

const defaultCheckedKeys = ref([])
const tempPageTreeId = Math.random().toString()
const pageTreeData: Tree[] = ref([
  {
    label: "页面一",
    value: tempPageTreeId,
    title: "页面一",
    id: tempPageTreeId,
    disabled: true,
    srid: 0,
    show: true
  }
])

//重命名菜单
const renameMenu = () => {
  showRightMenu.value = false
  if (rightClickData) {
    let deleteId = rightClickData.id
    pageTreeData.value.map((item: any) => {
      if (item.id == deleteId) {
        item.show = false
      }
    })
  }
}

const enterInputLabel = (params: any) => {
  let keyTargetLabel = params.target.value
  if (rightClickData) {
    let deleteId = rightClickData.id
    //改变树的值
    pageTreeData.value.map((item: any) => {
      if (item.id == deleteId) {
        item.show = true
        item.label = keyTargetLabel
      }
    })
    //改变Pinia中的值
    pageInfoStore.setItem(PageStoreEnums.PAGE_INFO, { name: keyTargetLabel, id: deleteId })
    pageInfoStore.setItem(PageStoreEnums.PAGE_LIST, pageTreeData.value)
    //改变localStrorage的值
    let localStorageStr = localStorage.getItem("udstreamPageList")
    if (localStorageStr) {
      let localStorageObj = JSON.parse(localStorageStr)
      if (localStorageObj && localStorageObj.length > 0) {
        localStorageObj.map((item: any) => {
          if (item.id == deleteId) {
            item.name = keyTargetLabel
          }
        })
        localStorage.setItem("udstreamPageList", JSON.stringify(localStorageObj))
      }
    }
  }
}

const modifyInputLabel = (params: string) => {
  let keyTargetLabel = params
  if (rightClickData) {
    let deleteId = rightClickData.id
    //改变树的值
    pageTreeData.value.map((item: any) => {
      if (item.id == deleteId) {
        item.show = true
        item.label = keyTargetLabel
      }
    })
    //改变Pinia中的值
    pageInfoStore.setItem(PageStoreEnums.PAGE_INFO, { name: keyTargetLabel, id: deleteId })
    pageInfoStore.setItem(PageStoreEnums.PAGE_LIST, pageTreeData.value)
    //改变localStrorage的值
    let localStorageStr = localStorage.getItem("udstreamPageList")
    if (localStorageStr) {
      let localStorageObj = JSON.parse(localStorageStr)
      if (localStorageObj && localStorageObj.length > 0) {
        localStorageObj.map((item: any) => {
          if (item.id == deleteId) {
            item.name = keyTargetLabel
          }
        })
        localStorage.setItem("udstreamPageList", JSON.stringify(localStorageObj))
      }
    }
  }
}

//取消右键
const cancleOprate = () => {
  showRightMenu.value = false
}

//执行页面的删除操作
const excutePageDelete = () => {
  //先判断是否只有一个页面，如果只有一个  则不让删除
  if (pageTreeData.value.length == 1) {
    ElMessage({
      type: "warning",
      message: `当前只有一个页面，无法进行删除操作！`
    })
    return
  }

  if (rightClickData?.label && rightClickData?.id) {
    let deleteId = rightClickData.id
    //删除tree里面的值
    let toRawData = toRaw(pageTreeData.value)
    let filterPages = toRawData.filter((item: any) => {
      return item.id !== deleteId
    })
    pageTreeData.value = filterPages
    pageInfoStore.setItem(PageStoreEnums.PAGE_LIST, pageTreeData.value)
    //删除localStrorage中的值
    let localStorageStr = localStorage.getItem("udstreamPageList")
    if (localStorageStr) {
      let localStorageObj = JSON.parse(localStorageStr)
      if (localStorageObj && localStorageObj.length > 0) {
        let filterPages = localStorageObj.filter((item: any) => {
          return item.id != deleteId
        })
        localStorage.setItem("udstreamPageList", JSON.stringify(filterPages))
      }
    }

    //设置第一个节点被选中
    setTimeout(() => {
      const nodeCk = [pageTreeData.value[0]]
      treeRef.value!.setCheckedNodes(nodeCk as any, false)
    })
    return true
  }

  return false
}
//删除菜单
const delMenu = () => {
  showRightMenu.value = false
  ElMessageBox.confirm("确认删除此页面吗？", "删除页面", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      let res = excutePageDelete()
      if (res) {
        ElMessage({
          type: "success",
          message: `删除成功！`
        })
      } else {
        ElMessage({
          type: "error",
          message: `删除失败！`
        })
      }
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: `取消删除！`
      })
    })
}

//导出至工作台菜单
const exportMenu = () => {
  showRightMenu.value = false
  ElMessage({
    type: "success",
    message: `开发中，敬请期待！`
  })
}

const changePage = async (pageId: string) => {
  const udStreamPageListStr = localStorage.getItem("udstreamPageList")
  if (udStreamPageListStr && udStreamPageListStr.trim() != "") {
    const udstreamPageJson = JSON.parse(udStreamPageListStr)
    if (udstreamPageJson && udstreamPageJson.length > 0) {
      const findJson = udstreamPageJson.find((item: any) => {
        return item.id == pageId
      })
      if (findJson?.udjson && Object.keys(findJson.udjson).length > 0) {
        if (findJson.srid == 4978) {
          udStream.createBlankScene("_balck", 4978) //不知道  对性能有好的影响   还是不好的影响
        } else {
          udStream.createBlankScene("_balck", 0) //不知道  对性能有好的影响   还是不好的影响
          udStream.getSettings().then((settings) => {
            settings.skybox.type = 0 //
            udStream.saveSettings(settings)
          })
        }
        //加载udjson
        udStream.loadSceneJson(JSON.stringify(findJson.udjson))
        if (findJson.cameraCenterUUID) {
          //如果设置了 默认的点位
          udStream.moveToWhenPossible(findJson.cameraCenterUUID)
        }
      } else {
        let defaultcrs = 0
        let projectcrs = 0
        if (findJson?.srid == 0) {
          defaultcrs = 0
          projectcrs = 0
        } else if (findJson?.srid == 4978) {
          defaultcrs = 4978
          projectcrs = 84
        }
        // console.log('pppppppppppppppp')
        // udStream.createBlankScene("_balck", 4978) //不知道  对性能有好的影响   还是不好的影响
        // 新加载一个空的udjson
        const newUdJson = `{
          "type": "FeatureCollection",
          "vault": {
            "type": "Folder"
          },
          "name": "Empty Project",
          "features": [],
          "attributes": {
            "defaultcrs": ${defaultcrs},
            "projectcrs": ${projectcrs}
          }
        }`

        udStream.loadSceneJson(newUdJson)
        udStream.getSettings().then((settings) => {
          settings.skybox.type = 0 //
          udstreamStore.setItem(UdstreamStoreEnums.UDSTREAM_SETTING, settings)
          udStream.saveSettings(settings)
        })
      }
      if (findJson?.udsetting && Object.keys(findJson.udsetting).length > 0) {
        //加载setting
        udStream.saveSettings(findJson.udsetting)
        udstreamStore.setItem(UdstreamStoreEnums.UDSTREAM_SETTING, findJson.udsetting)
      } else {
        //加载默认的设置
        console.log("do nothing!")
      }
    }
  }
}

//将pagedata中show改为true了的值，重新改为false
const resetPageNameInEdit = () => {
  const pageList = pageTreeData.value
  if (pageList && pageList.length > 0) {
    const hasFalse = pageList.findIndex((item: any) => {
      return item.show == false
    })

    if (hasFalse != -1) {
      return true
    }
  }
  return false
}

const cancelRightMenuClick = (e) => {
  console.log("cancel right menu click")
  showRightMenu.value = false
  //释放掉click事件
  let pDom = document.querySelector(".card-container-div-top-one")
  pDom?.removeEventListener("click", cancelRightMenuClick)
}

//树节点的右键点击
const righttClick = (event: any, data: any, node: any, o: any) => {
  // 判断是否有页面处于重命名状态
  const isInEdit = resetPageNameInEdit()
  if (isInEdit) {
    ElMessage({
      type: "warning",
      message: `页面正在重命名中，请先完成页面的重名！`
    })
    return
  }
  rightClickData = data
  let pDom = document.querySelector(".card-container-div-top-one") as any
  //先释放掉click事件
  let pDomoffsetTop = pDom.offsetParent.offsetTop
  showRightMenu.value = false
  let menu = document.querySelector(".rightMenu") as any
  if (menu) {
    if (event.clientX > 130) {
      menu.style.left = 130 + "px"
    } else {
      menu.style.left = event.clientX + "px"
    }
    menu.style.top = event.clientY - pDomoffsetTop + "px"
  }
  showRightMenu.value = true
  //注册一个click事件
  pDom?.addEventListener("click", cancelRightMenuClick)
}

//树节点的点击  进行页面的切换
const handleNodeClick = async (tree: Tree) => {
  // 判断是否有页面处于重命名状态
  // const isInEdit = resetPageNameInEdit()
  // if (isInEdit) {
  //   ElMessage({
  //     type: "warning",
  //     message: `页面正在重命名中，请先完成页面的重名！`
  //   })
  //   return
  // }
  // 如果是重命名造成的点击  则不进行页面的切换
  // console.log("handleNodeClick-----------", tree)
  // if(tree && !tree?.show){
  //   return
  // }
  // console.log("加载场景")
  // let randomIndex = Math.round(Math.random() * 5)
  // console.log("随机数", randomIndex)
  // let urls = [
  //   "https://devmodels.oss-cn-shenzhen.aliyuncs.com/uploads/20230317/f2a6f82b3dd634915dcbcb81dac3b05d.udjson",
  //   "https://devmodels.oss-cn-shenzhen.aliyuncs.com/uploads/20230203/312044d1cba4723faf330800a74ca86c.udjson",
  //   "https://devmodels.oss-cn-shenzhen.aliyuncs.com/uploads/20221212/1f8814e1eccd8a9700a9fbe6bfa0c90d.udjson",
  //   "https://devmodels.oss-cn-shenzhen.aliyuncs.com/uploads/20230104/c6240db592d754d81ebb7cecc9c6d972.udjson",
  //   "https://devmodels.oss-cn-shenzhen.aliyuncs.com/uploads/20220909/b796062d14819af4e353f39bf16a3b49.udjson",
  //   "https://devmodels.oss-cn-shenzhen.aliyuncs.com/uploads/20230208/07d07da9a64ac2613daa0838d7ed65f9.udjson"
  // ]
  // udStream.loadSceneItem(urls[randomIndex])
  //被点击节点前的一个信息
  const prePageNodeInfoId = pageInfoStore.getSelectPageInfo.id
  const prePageNodeInfoLabel = pageInfoStore.getSelectPageInfo.name
  const prePageNodeInfo = {
    id: prePageNodeInfoId,
    label: prePageNodeInfoLabel
  }
  if (prePageNodeInfoId == tree.id) {
    return
  }

  sceneLoadingShow.value = true
  setTimeout(() => {
    sceneLoadingShow.value = false
  }, 2000)

  //将图层列表中被选中的节点设置为false  这样让页面的config回置
  udstreamStore.setItem(UdstreamStoreEnums.IS_SELECT, false) //没有被选中
  //点击某个树节点  设置pageInfoStore
  pageInfoStore.setItem(PageStoreEnums.PAGE_INFO, { name: tree.label, id: tree.id })
  //将该树节点设置为checked
  const nodeCk = [toRaw(tree)]
  treeRef.value!.setCheckedNodes(nodeCk as any, false)
  try {
    // 保存点击之前的页面 先判断该页面是否还存在  不存在则不保存了
    let findIndex = pageTreeData.value.findIndex((item: any) => {
      return item.id == prePageNodeInfoId
    })

    if (findIndex !== -1) {
      // 只保存到localStrorage中  不进行后台的存储
      await savePrePageData2LocalStrorage(prePageNodeInfo as any)
    }
  } catch (error) {
    console.log("切换页面之前，保存数据到localstrorage失败！")
  }

  try {
    //如果点击的不是同一个页面 则进行页面切换的工作
    //虽然用了  async  await  但是还是用一个setTimeOut
    const pageId = tree.id
    changePage(pageId)
  } catch (error) {
    console.log("切换页面更改页面内容失败！")
  }
}

//获取到当前目录树节点中最大number的那个name的最后一个数字，如果最后一个都不是数字
const acquirePageTreeNodesNumber = () => {
  const pageNumberList = [] as any[]
  const pageList = pageTreeData.value
  if (pageList && pageList.length > 0) {
    pageList.map((item: any) => {
      const labelNum = item.label.substr(-1)
      if (Number(labelNum).toString() !== "NaN") {
        pageNumberList.push(parseFloat(labelNum))
      }
    })
    if (pageNumberList.length > 0) {
      return Math.max(...pageNumberList)
    }
    return 0
  }
  return 0
}

const commandsOperate = (params: string) => {
  //判断是否有页面处于重命名状态
  const isInEdit = resetPageNameInEdit()
  if (isInEdit) {
    ElMessage({
      type: "warning",
      message: `页面正在重命名中，请先完成重命名！`
    })
    return
  }
  if (params == "no-src") {
    srcValue.value = "0"
  } else if (params == "has-src") {
    srcValue.value = "4978"
  }
  console.log("srcValue", srcValue.value)
  //如果有页面在重命名中，没有进行确认,则将编辑状态置为true
  // resetPageTreeDataShow()
  //添加页面
  addPage()
}

//显示新建页面
const showNewPage = () => {
  newPageVisible.value = true
}

//取消页面的新建
const cancleAddPage = () => {
  newPageVisible.value = false
}

const addPage = () => {
  let newPageIndex = 1
  if (isFirstNewPage) {
    isFirstNewPage = false
    //第一次添加
    if (pageMaxNumber == 0) {
      newPageIndex = currentPageIndex
    } else {
      //树节点中有后缀为数字的字符
      newPageIndex = pageMaxNumber + 1
      currentPageIndex = pageMaxNumber + 1
    }
  } else {
    //其它次数的添加
    currentPageIndex++
    newPageIndex = currentPageIndex
  }
  const tempId = Math.random().toString()
  const pageItem = {
    label: "新建页面" + newPageIndex,
    value: tempId,
    title: "新建页面" + newPageIndex,
    id: tempId,
    disabled: true,
    show: true,
    srid: parseInt(srcValue.value)
  }
  pageTreeData.value.push(pageItem) //树的节点的添加
  pageInfoStore.setItem(PageStoreEnums.PAGE_LIST, pageTreeData.value)
  //localstrorage中的添加新增的页面信息
  const localStoragePageList = localStorage.getItem("udstreamPageList")
  if (localStoragePageList) {
    //百分百会有  所以不会进入else
    const pageListJson = JSON.parse(localStoragePageList)
    const newPageJson = {
      udjson: {},
      udsetting: {},
      name: pageItem.label,
      id: pageItem.id,
      cameraCenterUUID: null,
      srid: pageItem.srid
    }
    pageListJson.push(newPageJson)
    localStorage.setItem("udstreamPageList", JSON.stringify(pageListJson))
  } else {
    //直接存储该数据
    const newPageJson = [
      {
        udjson: {},
        udsetting: {},
        name: pageItem.label,
        id: pageItem.id,
        cameraCenterUUID: null,
        srid: pageItem.srid
      }
    ]
    localStorage.setItem("udstreamPageList", JSON.stringify(newPageJson))
  }
}

//获取页面的列表信息
const queryProjectListInfo = async () => {
  //给tree重新赋值
  const pageListStr = localStorage.getItem("udstreamPageList") //读取localstrorage信息
  if (pageListStr && pageListStr.trim() !== "") {
    const pageListJson = JSON.parse(pageListStr)
    if (pageListJson.length > 0) {
      const tempPageList = [] as any[]
      pageListJson.map((item: any) => {
        const tempId = Math.random().toString() //多此一举？
        const pageItem = {
          label: item.name,
          value: item.id || tempId,
          title: item.name,
          id: item.id || tempId,
          srid: item.srid || srcValue.value,
          disabled: true,
          show: true
        }
        tempPageList.push(pageItem)
      })
      pageTreeData.value = tempPageList
      pageInfoStore.setItem(PageStoreEnums.PAGE_LIST, pageTreeData.value)
      //将第一个节点设置为被选中
      setTimeout(() => {
        const nodeCk = [tempPageList[0]]
        treeRef.value!.setCheckedNodes(nodeCk as any, false)
      })

      //  点击某个树节点  设置pageInfoStore  有localstrorage的情况是不需要设置的
      //  获取树的最大的索引 （比如页面1  页面2  页面3 返回3）
      pageMaxNumber = acquirePageTreeNodesNumber()
    }
  } else {
    let WktInfo = await udStream.getWktInfo() //根据坐标系判断该页面是否有投影设置
    if (WktInfo?.srid == 4978) {
      srcValue.value = "4978"
    } else {
      srcValue.value = "0"
    }
    pageTreeData.value = [
      {
        label: "页面一",
        value: tempPageTreeId,
        title: "页面一",
        id: tempPageTreeId,
        disabled: true,
        srid: srcValue.value,
        show: true
      }
    ]
    //设置Pinia中默认被选中的节点
    pageInfoStore.setItem(PageStoreEnums.PAGE_INFO, {
      name: pageTreeData.value[0].label,
      id: pageTreeData.value[0].id
    })
    //将第一个节点设置为被选中
    setTimeout(() => {
      const nodeCk = [pageTreeData.value[0]]
      treeRef.value!.setCheckedNodes(nodeCk as any, false)
    })
  }
}

//监听相关
watch(
  () => udstreamStore.getUdstreamCanvasLoaded,
  (nv, ov) => {
    if (nv) {
      let pageListRequestEnd: boolean = udstreamStore.getPageListRequestEnd
      if (pageListRequestEnd) {
        queryProjectListInfo()
      } else {
        let setIntervalPageList = setInterval(() => {
          pageListRequestEnd = udstreamStore.getPageListRequestEnd
          if (pageListRequestEnd) {
            clearInterval(setIntervalPageList)
            queryProjectListInfo()
          }
        }, 1000)
      }
    }
  },
  { deep: true }
)
</script>
<style scoped>
.card-container-div {
  position: relative;
  height: 100%;
}
.card-container {
  height: 100%;
}

.card-container-div :deep(.el-card__header) {
  padding: 6px;
}
.page-container {
  /* background-color: #151515; */
}
.card-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}
.custom-tree-node {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.icon-span-txt {
  display: inline-block;
  vertical-align: middle;
}
.icon-span-txt-edit {
  display: inline-block;
  vertical-align: middle;
  margin-left: 8px;
}
.icon-span-txt-edit :deep(.el-input--small) {
  width: 110px;
  margin-right: 8px;
}

.icon-span-icon {
  vertical-align: middle;
}
.icon-span-icon :deep(.el-icon) {
  display: inline-block;
  vertical-align: middle;
}
.tree-div :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: none;
  background: none;
  border: none;
  border-color: none;
}
.tree-div :deep(.el-checkbox__inner::after) {
  border-color: #4a9be5;
}
.card-header-el {
  font-size: 16px;
  text-align: center;
}
.folder-div {
  font-size: 16px;
}

.rightMenu {
  position: absolute;
  z-index: 60;
  cursor: pointer;
  border: 1px solid #eee;
  box-shadow: 0 0.5em 1em 2px rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  color: #1a1a1a;
  font-size: 12px;
}
.rightMenu ul {
  list-style: none;
  margin: 0;
  padding: 0;
  border-radius: 6px;
}
.rightMenu ul li {
  padding: 6px 10px;
  background: #fff;
  border-bottom: 1px solid #000;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-around;
}
.rightMenu ul li:last-child {
  border: none;
}
.rightMenu ul li:hover {
  transition: all 1s;
  background: #92c9f6;
}

.rename-input {
  position: absolute;
  z-index: 60;
}
.span-icon {
  display: inline-block;
  width: 20px;
  text-align: left;
}
.span-icon-txt {
  display: inline-block;
  width: 40px;
  text-align: left;
}
.sceneLoading {
  position: fixed;
  z-index: 999;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  font-size: 20px;
  text-align: center;
}
.sceneLoadingInfo {
  display: flex;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  align-items: center;
}
.sceneLoadingInfo-txt {
  margin-left: 20px;
}
.sceneLoading :deep(.el-icon) {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.new-page-diolog-conten {
  padding: 12px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}
.new-page-diolog {
  float: right;
}
.icon-span {
  display: inline-block;
  vertical-align: middle;
  margin: 8px;
}
.udstream-tool-svg {
  display: inline-block;
  vertical-align: middle;
}
</style>
