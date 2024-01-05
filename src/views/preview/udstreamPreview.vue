<template>
  <div class="udstream-container-vertical" id="canvas-parent">
    <canvas class="udstream-canvas-preview" id="canvas" @dblclick="onDbClick" oncontextmenu="return false;" />
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from "vue"
import * as udStream from "@/udStream/udStream"

const hasSupport = ref(false)
const loaded = ref(false)

const emit = defineEmits(["no-webgl2", "loaded"])
// 是否支持webgl2
function SupportsWebGL2() {
  const canvas = document.createElement("canvas")
  try {
    const ctx = canvas.getContext("webgl2")
    hasSupport.value = ctx != null
  } catch (e) {
    console.log(e)
  }
  return hasSupport.value
}

function onDbClick() {
  udStream.tweenToPickLocation()
}

onMounted(() => {
  hasSupport.value = SupportsWebGL2()
  if (!hasSupport.value) {
    emit("no-webgl2", true)
  }
  window.onkeydown = function (e: { keyCode: number; preventDefault: () => void }) {
    if (
      e.keyCode === 114 || // F3
      e.keyCode === 117 || // F6
      e.keyCode === 121 // F10
    ) {
      e.preventDefault()
    }
  }
  const searchParams = new URLSearchParams(window.location.search)
  const arg = searchParams.get("f")
  const domain = searchParams.get("domain") != null ? "--domain" : undefined
  const ui = searchParams.get("ui") != null ? `--ui=${searchParams.get("ui")}` : undefined
  const args = [arg, domain, ui].filter((item): item is string => !!item)
  globalThis.Module = {
    // arguments: args, // 要登录
    arguments: arg !== null ? ["--domain", arg] : ["--domain"], // 免登陆
    // canvas: document.getElementById('canvas') ?? undefined,
    canvas: document.getElementById("canvas") ?? undefined,
    noInitialRun: !hasSupport.value,
    mainScriptUrlOrBlob: "udStream.js",
    preRun: [
      function () {
        globalThis.FS.mkdir("/libsdl")
        globalThis.FS.mount(globalThis.IDBFS, {}, "/libsdl")
      }
    ],
    setStatusLast: {
      text: ""
    },
    setStatus: function (text: string) {
      if (text === globalThis.Module.setStatusLast.text) return

      const m = text.match(/([^(]+)\((\d+(\.\d+)?)\/(\d+)\)/)

      globalThis.Module.setStatusLast.text = text
      if (m) {
        text = m[1]
      }

      console.log(text)
    },
    onRegisterUICallbacks: function () {
      udStream.registerCallbacks()
    },
    onMainLoopStart: function () {
      if (!loaded.value) {
        emit("loaded")
        loaded.value = true
      }
    },
    ccall(ident: string, returnType?: string, argTypes?: string[], args?: any[]): number | void {
      return
    },
    addFunction(callback, signature: string): number {
      return 0
    },
    removeFunction(callbackPtr: number): void {
      return
    },
    _malloc(size: number): number {
      return 0
    },
    _free(ptr: number): void {
      return
    }
  }

  globalThis.Module.setStatus("Downloading...")
  const script = document.createElement("script")
  script.src = "./udStream.js"
  document.body.appendChild(script)
})
</script>

<style lang="scss" scoped>
.udstream-container-vertical {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
}

.udstream-canvas-preview {
  left: 0px;
  right: 0px;
  width: 100%;
  height: 100%;
}
</style>
