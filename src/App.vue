<script setup>
import { computed, shallowRef, triggerRef } from 'vue'
import { TresCanvas, useRenderLoop } from '@tresjs/core'
import { Line2, OrbitControls, Sphere } from '@tresjs/cientos'
import { Vector3, BufferGeometry, Line, LineBasicMaterial, Object3D, Euler } from 'three'
import {
  GATES,
  calculateStatevector,
  applyGate,
  calculateCoordinates,
  generateRotationMatrix
} from './qubit'

import GateControls from './components/GateControls.vue'
import GateInfo from './components/GateInfo.vue'
import StateDisplay from './components/StateDisplay.vue'
import AxesLines from './components/AxesLines.vue'
import AxesLabels from './components/AxesLabels.vue'
import AnimationSettings from './components/AnimationSettings.vue'
Object3D.DEFAULT_UP = new Vector3(0, 0, 1) // change to z-up system

const qubitPosition = shallowRef(new Vector3(0, 0, 1))
const currentGate = shallowRef(null)
const hoveredGate = shallowRef(null)
const animationDuration = shallowRef(1) // in seconds
const lineRef = shallowRef(null)
const sphereRef = shallowRef(null)
const { onLoop } = useRenderLoop()

function handlePointerDown(intersection) {
  qubitPosition.value = intersection.point
}
function setZeroState() {
  qubitPosition.value = new Vector3(0, 0, 1)
}
function setOneState() {
  qubitPosition.value = new Vector3(0, 0, -1)
}
function handleHoverGate(gateName) {
  hoveredGate.value = GATES[gateName]
}
function handleUnhoverGate() {
  hoveredGate.value = null
}
function handleGate(gateName) {
  if (currentGate.value !== null) {
    return
  }
  fireGate(GATES[gateName])
}
function handleRotationGate(key, axis, angle) {
  if (currentGate.value !== null) {
    return
  }
  const newGate = GATES[key]
  newGate.matrix = generateRotationMatrix(axis, angle)
  newGate.rotation = angle
  fireGate(newGate)
}

function createAxisCopies() {
  // console.log('lineRef.value.rotation', lineRef.value.rotation)
  // const material = new LineBasicMaterial({ color: 0x7b97f9 })
  // const xAxisPoints = [new Vector3(-1, 0, 0), new Vector3(1, 0, 0)]
  // const yAxisPoints = [new Vector3(0, -1, 0), new Vector3(0, 1, 0)]
  // const zAxisPoints = [new Vector3(0, 0, -1), new Vector3(0, 0, 1)]
  // const xAxisGeometry = new BufferGeometry().setFromPoints(xAxisPoints)
  // const yAxisGeometry = new BufferGeometry().setFromPoints(yAxisPoints)
  // const zAxisGeometry = new BufferGeometry().setFromPoints(zAxisPoints)
  // lineRef.value.add(new Line(xAxisGeometry, material))
  // lineRef.value.add(new Line(yAxisGeometry, material))
  // lineRef.value.add(new Line(zAxisGeometry, material))
  lineRef.value.visible = true
}

function removeAxisCopies() {
  lineRef.value.visible = false
  // lineRef.value.clear()
  lineRef.value.setRotationFromEuler(new Euler())
}

function fireGate(gate) {
  const originalStatevector = qubitStatevector.value
  const endStatevector = applyGate(originalStatevector, gate)
  createAxisCopies()
  currentGate.value = gate
  setTimeout(() => {
    currentGate.value = null
    setQubitStatevector(endStatevector)
    setTimeout(removeAxisCopies, 500)
  }, animationDuration.value * 1000)
}
function setQubitStatevector(newStatevector) {
  qubitPosition.value = calculateCoordinates(newStatevector)
}

const qubitStatevector = computed(() => calculateStatevector(qubitPosition.value))
const qubitLinePoints = computed(() => {
  return [new Vector3(0, 0, 0), qubitPosition.value]
})
const rotationAxis = computed(
  () =>
    currentGate?.value?.axis ??
    hoveredGate?.value?.axis ?? [new Vector3(0, 0, 0), new Vector3(0, 0, 0)]
  // changing the coordinates of the line from the origin to whatever points are needed
  // seems kinda hacky, but conditionally rendering the Line2 seems to cause issues
)
onLoop(({ delta }) => {
  if (currentGate.value !== null) {
    const angle = (delta / animationDuration.value) * currentGate.value.rotation
    qubitPosition.value.applyAxisAngle(currentGate.value.axis[0], angle)
    lineRef.value.rotateOnWorldAxis(currentGate.value.axis[0], angle)
    sphereRef.value.rotateOnWorldAxis(currentGate.value.axis[0], angle)
    // without this triggerRef the qubitPosition line will not animate
    triggerRef(qubitPosition)
  }
})
</script>

<template>
  <div id="tres-canvas">
    <TresCanvas :alpha="true">
      <TresPerspectiveCamera
        :up="[0, 0, 1]"
        :position="[4, 1, 1]"
        :look-at="[0, 0, 0]"
        :near="0.1"
        :far="100"
      />
      <!-- <TresAmbientLight :intensity="1" />
      <TresDirectionalLight cast-shadow :position="[1, 1, 1]" :intensity="10" /> -->

      <OrbitControls :enable-zoom="false" />

      <AxesLines />
      <AxesLabels />

      <TresGroup ref="lineRef" :up="[0, 0, 1]" :visible="false">
        <Line2
          :points="[
            [0, 0, -1],
            [0, 0, 1]
          ]"
          color="#7b97f9"
        />
        <Line2
          :points="[
            [0, -1, 0],
            [0, 1, 0]
          ]"
          color="#7b97f9"
        />
        <Line2
          :points="[
            [-1, 0, 0],
            [1, 0, 0]
          ]"
          color="#7b97f9"
        />
      </TresGroup>

      <TresMesh :position="[0, 0, 0]" @pointer-down="handlePointerDown" ref="sphereRef">
        <TresSphereGeometry :args="[1, 64, 32]" />
        <TresMeshStandardMaterial color="#7b97f9" :transparent="true" :opacity="0.2" />
      </TresMesh>

      <Sphere :args="[0.015]" :position="qubitPosition" color="#cfb805" />
      <Line2 :points="qubitLinePoints" color="#062184" :line-width="5" />
      <Line2 :points="rotationAxis" color="#cfb805" :line-width="3" />
    </TresCanvas>
  </div>
  <div id="state-display-container">
    <StateDisplay :statevector="qubitStatevector" />
  </div>
  <div id="gate-info-container">
    <GateInfo :gate="hoveredGate" />
  </div>
  <div id="controls-container">
    <GateControls
      @reset-zero="setZeroState"
      @reset-one="setOneState"
      @gate="handleGate"
      @rotation-gate="handleRotationGate"
      @hover-gate="handleHoverGate"
      @unhover-gate="handleUnhoverGate"
    />
  </div>
  <div id="speed-controls">
    <AnimationSettings :disabled="currentGate !== null" v-model="animationDuration" />
  </div>
</template>

<style scoped>
#speed-controls {
  position: absolute;
  left: 1rem;
  bottom: 1rem;
  z-index: 10;
}
#controls-container {
  position: absolute;
  right: 1rem;
  top: 50%;
  z-index: 10;
  transform: translateY(-50%);
}
#gate-info-container {
  width: calc((100vw - 650px) / 2);
  position: absolute;
  left: 1rem;
  top: 50%;
  z-index: 10;
  transform: translateY(-50%);
}
@media (width < 1100px) {
  #controls-container,
  #gate-info-container {
    top: 100vh;
  }
  #gate-info-container {
    width: calc(100vw - 200px);
  }
}
#state-display-container {
  position: absolute;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
}
#tres-canvas {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 0;
}
</style>
