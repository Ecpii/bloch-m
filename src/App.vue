<script setup>
import { TresCanvas } from '@tresjs/core'
import { Line2, OrbitControls, Stats } from '@tresjs/cientos'
import AxesLines from './components/AxesLines.vue'
import AxesLabels from './components/AxesLabels.vue'
import { computed, onMounted, shallowRef } from 'vue'
import { Vector3 } from 'three'
import GateControls from './components/GateControls.vue'

const qubitPosition = shallowRef(new Vector3(0, 0, 1))
const canvasRef = shallowRef(null)

function handlePointerDown(intersection) {
  qubitPosition.value = intersection.point
}

function setZeroState() {
  qubitPosition.value = new Vector3(0, 0, 1)
}
function setOneState() {
  qubitPosition.value = new Vector3(0, 0, -1)
}

const qubitLinePoints = computed(() => {
  return [[0, 0, 0], qubitPosition.value]
})

onMounted(() => {
  console.log('canvasRef.value.context', canvasRef.value.context.raycaster)
})
</script>

<template>
  <div id="tres-canvas">
    <TresCanvas :alpha="true" ref="canvasRef">
      <TresPerspectiveCamera
        :up="[0, 0, 1]"
        :position="[3, 1, 1]"
        :look-at="[0, 0, 0]"
        :near="0.1"
        :far="100"
      />
      <OrbitControls />
      <Stats />

      <TresMesh :position="[0, 0, 0]" @pointer-down="handlePointerDown">
        <TresSphereGeometry :args="[1, 64, 32]" />
        <TresMeshBasicMaterial :color="0x7b97f9" :transparent="true" :opacity="0.4" />
      </TresMesh>

      <AxesLines />
      <Suspense>
        <AxesLabels />
      </Suspense>

      <Line2 :points="qubitLinePoints" :line-width="5" />
    </TresCanvas>
    <GateControls @reset-zero="setZeroState" @reset-one="setOneState" />
  </div>
</template>

<style scoped>
#tres-canvas {
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: 0;
}
</style>
