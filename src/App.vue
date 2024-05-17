<script setup>
import { computed, ref, shallowRef, triggerRef } from 'vue'
import { TresCanvas, useRenderLoop } from '@tresjs/core'
import { Line2, OrbitControls, Sphere, Stats, Sparkles } from '@tresjs/cientos'
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
const axesGuideRef = shallowRef(null) // ref to the TresGroup that shows a copy of the axes on every rotation
const sphereRef = shallowRef(null) // ref to the bloch sphere
const pointRef = shallowRef(null) // point on end of the qubit line
const lightRef = shallowRef(null) // directional light
const cameraRef = shallowRef(null)
let arcPoints = shallowRef([])
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
  axesGuideRef.value.visible = true
}

function removeAxisCopies() {
  axesGuideRef.value.visible = false
  axesGuideRef.value.setRotationFromEuler(new Euler()) // reset rotation
}

function fireGate(gate) {
  const originalStatevector = qubitStatevector.value
  const endStatevector = applyGate(originalStatevector, gate)
  createAxisCopies()
  arcPoints.value = []
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
const rotationArc = computed(() => {
  const material = new LineBasicMaterial({ color: 0xcfb805, linewidth: 3 })
  if (!arcPoints.value.length) {
    return new Line(
      new BufferGeometry().setFromPoints([new Vector3(0, 0, 0), new Vector3(0, 0, 0)])
    )
  }
  const geometry = new BufferGeometry().setFromPoints(arcPoints.value)
  return new Line(geometry, material)
})
onLoop(({ delta }) => {
  if (currentGate.value !== null) {
    const angle = (delta / animationDuration.value) * currentGate.value.rotation
    qubitPosition.value.applyAxisAngle(currentGate.value.axis[0], angle)
    axesGuideRef.value.rotateOnWorldAxis(currentGate.value.axis[0], angle)
    sphereRef.value.rotateOnWorldAxis(currentGate.value.axis[0], angle)
    pointRef.value.position.copy(qubitPosition.value)
    arcPoints.value.push(qubitPosition.value.clone())
    console.log('arcPoints.value', arcPoints.value)
    // without this triggerRef the qubitPosition line will not animate
    triggerRef(qubitPosition)
    triggerRef(arcPoints)
  }
})
</script>

<template>
  <div id="tres-canvas">
    <TresCanvas :alpha="true" shadows>
      <TresPerspectiveCamera
        :up="[0, 0, 1]"
        :position="[4, 1, 1]"
        :look-at="[0, 0, 0]"
        :near="0.1"
        :far="10"
        ref="cameraRef"
      />
      <TresAmbientLight color="#fff" :intensity="1" />
      <TresDirectionalLight cast-shadow :position="[0, 0, 2]" :intensity="20" ref="lightRef" />
      <Stats />

      <OrbitControls :enable-zoom="false" />

      <AxesLines />
      <AxesLabels />

      <TresGroup ref="axesGuideRef" :up="[0, 0, 1]" :visible="false">
        <!-- <TresAxesHelper /> -->
        <Line2
          :points="[
            [0, 0, -1],
            [0, 0, 1]
          ]"
          color="#7b97f9"
          :line-width="3"
        />
        <Line2
          :points="[
            [0, -1, 0],
            [0, 1, 0]
          ]"
          color="#7b97f9"
          :line-width="3"
        />
        <Line2
          :points="[
            [-1, 0, 0],
            [1, 0, 0]
          ]"
          color="#7b97f9"
          :line-width="3"
        />
      </TresGroup>

      <primitive :object="rotationArc" />

      <TresMesh
        receive-shadow
        :position="[0, 0, 0]"
        @pointer-down="handlePointerDown"
        ref="sphereRef"
      >
        <TresSphereGeometry :args="[1, 64, 64]" />
        <TresMeshPhongMaterial
          color="#7995f9"
          :transparent="true"
          :opacity="0.3"
          :premultiplied-alpha="true"
        />
      </TresMesh>

      <TresMesh :position="qubitPosition" ref="pointRef">
        <TresSphereGeometry :args="[0.015]" />
        <TresMeshBasicMaterial color="#cfb805" />
      </TresMesh>
      <Line2 :points="qubitLinePoints" color="#062184" :line-width="5" />
      <Line2 receive-shadow :points="rotationAxis" color="#cfb805" :line-width="3" />
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
