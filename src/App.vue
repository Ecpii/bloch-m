<script setup>
import { computed, ref, shallowRef, triggerRef } from 'vue'
import { TresCanvas, useRenderLoop } from '@tresjs/core'
import { Line2, OrbitControls, Stats } from '@tresjs/cientos'
import { Vector3, BufferGeometry, Line, LineBasicMaterial, Object3D, Euler } from 'three'
import {
  GATES,
  calculateStatevector,
  applyGate,
  calculateCoordinates,
  generateRotationMatrix
} from './qubit'
import { computeSo3FromPoints, solovayKitaevFromPoints, checkPoints } from '@/solovayKitaev'

import GateControls from './components/GateControls.vue'
import CustomGateControls from './components/CustomGateControls.vue'
import GateInfo from './components/GateInfo.vue'
import CustomGateInstructions from './components/CustomGateInstructions.vue'
import StateDisplay from './components/StateDisplay.vue'
import AxesLines from './components/AxesLines.vue'
import AxesLabels from './components/AxesLabels.vue'
import AnimationSettings from './components/AnimationSettings.vue'
Object3D.DEFAULT_UP = new Vector3(0, 0, 1) // change to z-up system since threejs is default y-up

const qubitPosition = shallowRef(new Vector3(0, 0, 1))
const currentGate = shallowRef(null)
const hoveredGate = shallowRef(null)
const config = ref({
  animationDuration: 1,
  showAxesHelpers: false,
  showRotationArc: true
})
const page = shallowRef('standard')
const customGateState = ref({
  startPosition: new Vector3(0, 0, 1),
  endPosition: new Vector3(1, 0, 0),
  selecting: 'startPosition',
  precision: 2
})

const axesGuideRef = shallowRef(null) // ref to the TresGroup that shows a copy of the axes on every rotation
const sphereRef = shallowRef(null) // ref to the bloch sphere
const pointRef = shallowRef(null) // point on end of the qubit line
const arcPoints = ref([])
const { onLoop } = useRenderLoop()

function handleTresPointerDown(intersection) {
  qubitPosition.value = intersection.point
  if (page.value === 'customGate') {
    customGateState.value[customGateState.value.selecting] = intersection.point
  }
}
function setState(stateName) {
  if (stateName === '0') {
    qubitPosition.value = new Vector3(0, 0, 1)
  } else if (stateName === '1') {
    qubitPosition.value = new Vector3(0, 0, -1)
  }
}
function handleGateHover(gateName) {
  hoveredGate.value = GATES[gateName]
}
function handleGateUnhover() {
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
function handlePageSwitch(newPage) {
  page.value = newPage
  if (newPage === 'customGate') {
    qubitPosition.value = customGateState.value[customGateState.value.selecting]
  }
}
function handleCustomStateSelect(newSelection) {
  customGateState.value.selecting = newSelection
  qubitPosition.value = customGateState.value[newSelection]
}
function handleCustomGateCalculate() {
  // current implementation fails when points are perfectly parallel or opposite
  // todo: somehow fix this
  // todo: loading state on calculate button
  const invalidPoints = checkPoints(
    customGateState.value.startPosition,
    customGateState.value.endPosition
  )
  if (invalidPoints) {
    customGateState.value.results = {
      error: 'invalidPoints'
    }
    return
  }

  const so3Matrix = computeSo3FromPoints(
    customGateState.value.startPosition,
    customGateState.value.endPosition
  )
  const solovayKitaev = solovayKitaevFromPoints(
    customGateState.value.startPosition,
    customGateState.value.endPosition,
    customGateState.value.precision
  )

  customGateState.value.results = {
    originalSo3Matrix: so3Matrix,
    solovayKitaev
  }
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
  if (config.value.showAxesHelpers) {
    createAxisCopies()
  }
  arcPoints.value = []
  currentGate.value = gate
  return new Promise((resolve) =>
    setTimeout(() => {
      setQubitStatevector(endStatevector)
      currentGate.value = null
      setTimeout(() => {
        if (currentGate.value === null) {
          removeAxisCopies()
        }
        resolve()
      }, 500)
    }, config.value.animationDuration * 1000)
  )
}
function setQubitStatevector(newStatevector) {
  qubitPosition.value = calculateCoordinates(newStatevector)
}
function handleCustomGateSequence() {
  const sequenceGates = customGateState.value.results.solovayKitaev.gates.map(
    (gateName) => GATES[gateName]
  )
  executeSequence(sequenceGates)
}
function executeSequence(sequence) {
  fireGateInSequence(sequence, 0)
}
function fireGateInSequence(sequence, index) {
  if (index >= sequence.length) {
    return
  }
  fireGate(sequence[index]).then(() => fireGateInSequence(sequence, index + 1))
}

const qubitStatevector = computed(() => calculateStatevector(qubitPosition.value))
const qubitLinePoints = computed(() => [new Vector3(0, 0, 0), qubitPosition.value])
const rotationAxis = computed(
  () =>
    currentGate?.value?.axis ??
    hoveredGate?.value?.axis ?? [new Vector3(0, 0, 0), new Vector3(0, 0, 0)]
  // changing the coordinates of the line from the origin to whatever points are needed
  // seems kinda hacky, but conditionally rendering the Line2 seems to cause issues
)
const rotationArc = computed(() => {
  if (!config.value.showRotationArc || !arcPoints.value.length) {
    return new Line()
  }
  const material = new LineBasicMaterial({ color: 0xcfb805, linewidth: 3 })
  const geometry = new BufferGeometry().setFromPoints(arcPoints.value)
  return new Line(geometry, material)
})
// for creating custom gates, highlights the qubit that is not currently being set
const secondaryQubitLinePoints = computed(() => {
  if (page.value !== 'customGate') {
    return [new Vector3(0, 0, 0), new Vector3(0, 0, 0)]
  }
  return customGateState.value.selecting === 'startPosition'
    ? [new Vector3(0, 0, 0), customGateState.value.endPosition]
    : [new Vector3(0, 0, 0), customGateState.value.startPosition]
})

onLoop(({ delta }) => {
  if (currentGate.value !== null) {
    const angle = (delta / config.value.animationDuration) * currentGate.value.rotation
    qubitPosition.value.applyAxisAngle(currentGate.value.axis[0], angle)
    sphereRef.value.rotateOnWorldAxis(currentGate.value.axis[0], angle)
    // for some reason the point will not update its own position without this line
    pointRef.value.position.copy(qubitPosition.value)

    if (config.value.showAxesHelpers) {
      axesGuideRef.value.rotateOnWorldAxis(currentGate.value.axis[0], angle)
    }
    if (config.value.showRotationArc) {
      // store points we've traced on this rotation
      arcPoints.value.push(qubitPosition.value.clone())
    }
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
        ref="cameraRef"
      />
      <Stats />

      <OrbitControls :enable-pan="false" />

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
      <!-- i dont know why neither of these below solutions work and i have to use a primitive -->
      <!-- <Line2 :points="arcPoints" color="#cfb805" :line-width="3" v-if="arcPoints.length !== 0" /> -->
      <!-- <TresLine>
        <TresBufferGeometry :set-from-points="[arcPoints]" />
        <TresLineBasicMaterial color="#cfb805" />
      </TresLine> -->

      <TresMesh :position="[0, 0, 0]" @pointer-down="handleTresPointerDown" ref="sphereRef">
        <TresSphereGeometry :args="[1, 64, 64]" />
        <TresMeshBasicMaterial color="#7995f9" :transparent="true" :opacity="0.25" />
      </TresMesh>

      <TresMesh :position="qubitPosition" ref="pointRef">
        <TresSphereGeometry :args="[0.015]" />
        <TresMeshBasicMaterial color="#cfb805" />
      </TresMesh>
      <Line2 :points="secondaryQubitLinePoints" color="#7b97f9" :line-width="5" />
      <Line2 :points="qubitLinePoints" color="#062184" :line-width="5" />
      <Line2 :points="rotationAxis" color="#cfb805" :line-width="3" />
    </TresCanvas>
  </div>
  <div id="state-display-container">
    <StateDisplay :statevector="qubitStatevector" />
  </div>
  <div id="controls-container">
    <GateControls
      v-if="page === 'standard'"
      @set-state="setState"
      @gate="handleGate"
      @rotation-gate="handleRotationGate"
      @gate-hover="handleGateHover"
      @gate-unhover="handleGateUnhover"
      @page-switch="handlePageSwitch"
    />
    <CustomGateControls
      v-else
      v-model="customGateState"
      @gate-hover="handleGateHover"
      @gate-unhover="handleGateUnhover"
      @page-switch="handlePageSwitch"
      @state-select="handleCustomStateSelect"
      @calculate="handleCustomGateCalculate"
    />
  </div>
  <div id="gate-info-container">
    <GateInfo :gate="hoveredGate" v-if="page === 'standard'" />
    <CustomGateInstructions
      :state="customGateState"
      v-else
      @simulate-sequence="handleCustomGateSequence"
    />
  </div>
  <div id="animation-settings">
    <AnimationSettings :disabled="currentGate !== null" v-model="config" />
  </div>
</template>

<style scoped>
#animation-settings {
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
#state-display-container {
  position: absolute;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
}
#tres-canvas {
  width: 100%;
  height: 100vh;
  z-index: 0;
}
@media (width < 1100px) {
  #tres-canvas {
    height: max(calc(650px + 2 * 2rem), 50vh);
  }
  #controls-container {
    position: static;
    float: inline-end;
    transform: none;
  }
  #gate-info-container {
    position: static;
    transform: none;
    width: calc(100% - 2rem);
    padding: 1rem;
  }
  #animation-settings {
    position: static;
    width: calc(100% - 2rem);
    padding: 1rem;
  }
}
</style>
