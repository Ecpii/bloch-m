<script setup>
import { computed, shallowRef, triggerRef } from 'vue'
import { TresCanvas, useRenderLoop } from '@tresjs/core'
import { Line2, OrbitControls, Stats } from '@tresjs/cientos'
import { Vector3 } from 'three'
import { GATES, calculateStatevector } from './qubit'

import GateControls from './components/GateControls.vue'
import QubitDisplay from './components/QubitDisplay.vue'
import AxesLines from './components/AxesLines.vue'
import AxesLabels from './components/AxesLabels.vue'

const qubitPosition = shallowRef(new Vector3(0, 0, 1))
const sphereRef = shallowRef(null)
const currentGate = shallowRef(null)
const ANIMATION_DURATION = 0.2
const { onLoop } = useRenderLoop()

function handlePointerDown(intersection) {
  console.log('intersection.point', intersection.point)
  qubitPosition.value = intersection.point
}

function setZeroState() {
  qubitPosition.value = new Vector3(0, 0, 1)
}
function setOneState() {
  qubitPosition.value = new Vector3(0, 0, -1)
}
function handleGate(gate) {
  currentGate.value = GATES[gate]
  setTimeout(() => {
    currentGate.value = null
  }, ANIMATION_DURATION * 1000)
}

// const qubitAltitude = computed(() => {
//   return Math.asin(qubitPosition.value.z)
// })

const qubitLinePoints = computed(() => {
  return [new Vector3(0, 0, 0), qubitPosition.value]
})
const rotationAxis = computed(
  () => currentGate?.value?.axis ?? [new Vector3(0, 0, 0), new Vector3(0, 0, 0)]
)

const qubitStatevector = computed(() => calculateStatevector(qubitPosition.value))
onLoop(({ delta }) => {
  if (currentGate.value !== null) {
    const angle = (delta / ANIMATION_DURATION) * currentGate.value.rotation
    qubitPosition.value.applyAxisAngle(currentGate.value.axis[0], angle)
    triggerRef(qubitPosition)
  }
})
</script>

<template>
  <div id="tres-canvas">
    <TresCanvas :alpha="true" ref="canvasRef">
      <TresPerspectiveCamera
        :up="[0, 0, 1]"
        :position="[4, 1, 1]"
        :look-at="[0, 0, 0]"
        :near="0.1"
        :far="100"
      />
      <OrbitControls />
      <Stats />

      <TresMesh :position="[0, 0, 0]" @pointer-down="handlePointerDown" ref="sphereRef">
        <TresSphereGeometry :args="[1, 64, 32]" />
        <TresMeshBasicMaterial color="#7b97f9" :transparent="true" :opacity="0.2" />
      </TresMesh>

      <AxesLines />
      <Suspense>
        <AxesLabels />
      </Suspense>

      <Line2 :points="qubitLinePoints" :line-width="5" />
      <Line2 :points="rotationAxis" color="#cfb805" :line-width="1" />
    </TresCanvas>
    <div id="qubit-display">
      <QubitDisplay :statevector="qubitStatevector" />
    </div>
    <div id="controls-container">
      <GateControls @reset-zero="setZeroState" @reset-one="setOneState" @gate="handleGate" />
    </div>
  </div>
</template>

<style scoped>
#controls-container {
  position: absolute;
  right: 1rem;
  top: 50%;
  z-index: 10;
  transform: translateY(-50%);
}
#qubit-display {
  position: absolute;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
}
#tres-canvas {
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: 0;
}
</style>
