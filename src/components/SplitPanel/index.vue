<template>
  <div ref="splitPane" class="split-pane" :class="direction" :style="{ flexDirection: direction }">
    <div class="pane pane-one" :style="lengthType + ':' + paneLengthValue">
      <slot name="one"></slot>
    </div>
    <div class="pane-trigger" :style="lengthType + ':' + triggerLengthValue" @mousedown="handleMouseDown"></div>
    <div class="pane pane-two">
      <slot name="two"></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue"
const triggerLeftOffset = ref(0)

const emit = defineEmits(["updatePaneLengthPercent"])
const splitPane = ref(null)

const props = defineProps({
  direction: {
    type: String,
    default: "row"
  },
  min: {
    type: Number,
    default: 10
  },
  max: {
    type: Number,
    default: 90
  },

  paneLengthPercent: {
    type: Number,
    default: 50
  },

  triggerLength: {
    type: Number,
    default: 10
  }
})

const lengthType = computed(() => (props.direction === "row" ? "width" : "height"))
const paneLengthValue = computed(() => `calc(${props.paneLengthPercent}% - ${props.triggerLength / 2 + "px"})`)
const triggerLengthValue = computed(() => props.triggerLength + "px")

// 按下滑动器后移动鼠标
const handleMouseMove = (e) => {
  if (splitPane) {
    const clientRect = splitPane?.value.getBoundingClientRect()
    let paneLengthPercent = 0

    if (props.direction === "row") {
      const offset = e.pageX - clientRect.left - triggerLeftOffset.value + props.triggerLength / 2
      paneLengthPercent = (offset / clientRect.width) * 100
    } else {
      const offset = e.pageY - clientRect.top - triggerLeftOffset.value + props.triggerLength / 2
      paneLengthPercent = (offset / clientRect.height) * 100
    }

    if (paneLengthPercent < props.min) {
      paneLengthPercent = props.min
    }
    if (paneLengthPercent > props.max) {
      paneLengthPercent = props.max
    }
    emit("updatePaneLengthPercent", paneLengthPercent)
    // console.log("update:paneLengthPercent")
  }
}

// 松开滑动器
const handleMouseUp = () => {
  document.removeEventListener("mousemove", handleMouseMove)
}

// 按下滑动器
const handleMouseDown = (e) => {
  console.log("松开...")
  document.addEventListener("mousemove", handleMouseMove)
  document.addEventListener("mouseup", handleMouseUp)

  if (props.direction === "row") {
    triggerLeftOffset.value = e.pageX - e.srcElement.getBoundingClientRect().left
  } else {
    triggerLeftOffset.value = e.pageY - e.srcElement.getBoundingClientRect().top
  }
}
</script>

<style scoped lang="scss">
.split-pane {
  // background: palegreen;
  height: 100%;
  display: flex;
  &.row {
    .pane {
      height: 100%;
    }
    .pane-trigger {
      height: 100%;
      cursor: col-resize;
    }
  }
  &.column {
    .pane {
      width: 100%;
    }
    .pane-trigger {
      width: 100%;
      cursor: row-resize;
    }
  }
  .pane-one {
    // background: palevioletred;
  }
  .pane-trigger {
    user-select: none;
    background: #2e3238;
  }
  .pane-two {
    flex: 1;
    // background: turquoise;
  }
}
</style>
