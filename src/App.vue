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
import {
  computeSo3FromPoints,
  solovayKitaevFromPoints,
  checkPoints,
  createGateFromPoints
} from '@/solovayKitaev'
import COLORS from './colors'

import GateControls from './components/GateControls.vue'
import CustomGateControls from './components/CustomGateControls.vue'
import GateInfo from './components/GateInfo.vue'
import CustomGateInfo from './components/CustomGateInfo.vue'
import StateDisplay from './components/StateDisplay.vue'
import AxesLines from './components/AxesLines.vue'
import AxesLabels from './components/AxesLabels.vue'
import AnimationSettings from './components/AnimationSettings.vue'
Object3D.DEFAULT_UP = new Vector3(0, 0, 1) // change to z-up system since threejs is default y-up

const MODE = import.meta.env.MODE
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
  startPosition: new Vector3(0, 1, 0),
  endPosition: new Vector3(1, 0, 0),
  selecting: 'startPosition',
  precision: 2
})
const customGateResult = ref()

const sequenceIndex = ref(0)
const axesGuideRef = shallowRef(null) // ref to the TresGroup that shows a copy of the axes on every rotation
const sphereRef = shallowRef(null) // ref to the bloch sphere
const pointRef = shallowRef(null) // point on end of the qubit line
const arcPoints = ref([])
const flags = ref({
  simulating: false,
  calculating: false,
  stopGates: false
})
const { onLoop } = useRenderLoop()

function handleTresPointerDown(intersection) {
  // if (currentGate.value) {
  //   return;
  // }
  qubitPosition.value = intersection.point
  if (page.value === 'customGate') {
    customGateState.value[customGateState.value.selecting] = intersection.point
  }
  interruptGates()
}
function setQubitPosition(stateName) {
  if (stateName === '0') {
    qubitPosition.value = new Vector3(0, 0, 1)
  } else if (stateName === '1') {
    qubitPosition.value = new Vector3(0, 0, -1)
  }
  interruptGates()
}
function handleGateHover(gateName) {
  hoveredGate.value = GATES[gateName]
}
function handleGateUnhover() {
  hoveredGate.value = null
}
function handleStandardGate(gateName) {
  if (currentGate.value !== null) {
    return
  }
  fireGateWithMatrix(GATES[gateName])
}
function handleRotationGate(key, axis, angle) {
  if (currentGate.value !== null) {
    return
  }
  const newGate = GATES[key]
  newGate.matrix = generateRotationMatrix(axis, angle)
  newGate.rotation = angle
  fireGateWithMatrix(newGate)
}
function handlePageSwitch(newPage) {
  page.value = newPage
  if (newPage === 'customGate') {
    if (customGateState.value.selecting === 'endPosition') {
      qubitPosition.value = customGateState.value.endPosition.clone()
    } else {
      qubitPosition.value = customGateState.value.startPosition.clone()
    }
  }
}
function setCustomStateSelection(newSelection) {
  customGateState.value.selecting = newSelection
  qubitPosition.value = customGateState.value[newSelection]
}
async function calculateCustomGate() {
  // current implementation fails when points are perfectly parallel or opposite
  // todo: somehow fix this
  // todo: make this function truly async, still stalls page
  const startPosition = customGateState.value.startPosition
  const endPosition = customGateState.value.endPosition
  const invalidPoints = checkPoints(startPosition, endPosition)
  if (invalidPoints) {
    customGateResult.value = {
      error: 'invalidPoints'
    }
    return
  }

  flags.value.calculating = true
  const so3Matrix = computeSo3FromPoints(startPosition, endPosition)
  const solovayKitaev = solovayKitaevFromPoints(
    startPosition,
    endPosition,
    customGateState.value.precision
  )
  const expectedEndPosition = solovayKitaev.apply(startPosition)
  customGateResult.value = {
    startPosition,
    originalSo3Matrix: so3Matrix,
    solovayKitaev,
    expectedEndPosition
  }
  flags.value.calculating = false
}
function createAxisCopies() {
  axesGuideRef.value.visible = true
}
function removeAxisCopies() {
  axesGuideRef.value.visible = false
  axesGuideRef.value.setRotationFromEuler(new Euler()) // reset rotation
}
function clearArcPoints() {
  arcPoints.value = []
}
function fireGateWithMatrix(gate) {
  const originalStatevector = qubitStatevector.value
  const endStatevector = applyGate(originalStatevector, gate)
  return fireGate(gate, () => {
    setQubitStatevector(endStatevector)
  })
}
function previewCustomGate() {
  if (currentGate.value !== null) {
    return
  }
  const gate = createGateFromPoints(
    customGateState.value.startPosition,
    customGateState.value.endPosition
  )
  const expectedEndPosition = customGateState.value.endPosition.clone()
  // without this next line the line for alpha disappears - it "changes" qubitPosition to be not equal to startPosition
  qubitPosition.value = customGateState.value.startPosition.clone()
  fireGate(gate, () => {
    qubitPosition.value = expectedEndPosition
  })
}
function fireGate(gate, onFinished = () => { }) {
  flags.value.stopGates = false
  if (config.value.showAxesHelpers) {
    createAxisCopies()
  }
  clearArcPoints()
  currentGate.value = gate
  return new Promise((resolve) =>
    setTimeout(() => {
      if (flags.value.stopGates) {
        resolve()
        return
      }

      currentGate.value = null
      onFinished()
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
function startCustomGateSequence() {
  flags.value.simulating = true
  flags.value.stopGates = false
  qubitPosition.value = customGateResult.value.startPosition.clone()

  const sequenceGates = customGateResult.value.solovayKitaev.gates.map(
    (gateName) => GATES[gateName]
  )

  executeGateSequence(sequenceGates, () => {
    flags.value.simulating = false
    qubitPosition.value = customGateResult.value.expectedEndPosition.clone()
  })
}
async function executeGateSequence(sequence, onFinished) {
  for (sequenceIndex.value = 0; sequenceIndex.value < sequence.length; sequenceIndex.value++) {
    if (flags.value.stopGates) {
      break
    }
    await fireGateWithMatrix(sequence[sequenceIndex.value])
  }
  onFinished()
}
function fastForwardSequenceExecution() {
  interruptGates()
  flags.value.simulating = false
  qubitPosition.value = customGateResult.value.expectedEndPosition.clone()
}
function interruptGates() {
  currentGate.value = null
  flags.value.stopGates = true
  clearArcPoints()
  removeAxisCopies()
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
  const material = new LineBasicMaterial({ color: COLORS.accent, linewidth: 3 })
  const geometry = new BufferGeometry().setFromPoints(arcPoints.value)
  return new Line(geometry, material)
})
const customGateStartLinePoints = computed(() => {
  const startPosition = customGateState.value.startPosition
  if (page.value === 'customGate' && !qubitPosition.value.equals(startPosition)) {
    return [new Vector3(0, 0, 0), startPosition]
  }
  return [new Vector3(0, 0, 0), new Vector3(0, 0, 0)]
})
const customGateEndLinePoints = computed(() => {
  const endPosition = customGateState.value.endPosition
  if (page.value === 'customGate' && !qubitPosition.value.equals(endPosition)) {
    return [new Vector3(0, 0, 0), endPosition]
  }

  return [new Vector3(0, 0, 0), new Vector3(0, 0, 0)]
})
const qubitLineColor = computed(() => {
  if (page.value !== 'customGate' || currentGate.value !== null || flags.value.simulating) {
    return COLORS.primary
  }

  if (
    customGateState.value.selecting === 'startPosition' &&
    customGateState.value.startPosition.equals(qubitPosition.value)
  ) {
    return COLORS.secondary
  }
  if (
    customGateState.value.selecting === 'endPosition' &&
    customGateState.value.endPosition.equals(qubitPosition.value)
  ) {
    return COLORS.purple
  }
  return COLORS.primary
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
      <TresPerspectiveCamera :up="[0, 0, 1]" :position="[4, 1, 1]" :look-at="[0, 0, 0]" :near="0.1" :far="100"
        ref="cameraRef" />
      <Stats v-if="MODE === 'development'" />

      <OrbitControls :enable-pan="false" :enable-zoom="false" />

      <AxesLines />
      <AxesLabels />

      <TresGroup ref="axesGuideRef" :up="[0, 0, 1]" :visible="false">
        <!-- <TresAxesHelper /> -->
        <Line2 :points="[
          [0, 0, -1],
          [0, 0, 1]
        ]" :color="COLORS.secondary" :line-width="3" />
        <Line2 :points="[
          [0, -1, 0],
          [0, 1, 0]
        ]" :color="COLORS.secondary" :line-width="3" />
        <Line2 :points="[
          [-1, 0, 0],
          [1, 0, 0]
        ]" :color="COLORS.secondary" :line-width="3" />
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
        <TresMeshBasicMaterial color="#7995f9" :transparent="true" :opacity="0.2" />
      </TresMesh>

      <TresMesh :position="qubitPosition" ref="pointRef">
        <TresSphereGeometry :args="[0.015]" />
        <TresMeshBasicMaterial :color="COLORS.accent" />
      </TresMesh>
      <Line2 :points="customGateStartLinePoints" :color="COLORS.secondary" :line-width="5" />
      <Line2 :points="customGateEndLinePoints" :color="COLORS.purple" :line-width="5" />
      <Line2 :points="qubitLinePoints" :color="qubitLineColor" :line-width="5" />
      <Line2 :points="rotationAxis" :color="COLORS.accent" :line-width="3" />
    </TresCanvas>
  </div>
  <div id="state-display-container">
    <StateDisplay :statevector="qubitStatevector" />
  </div>
  <div id="controls-container">
    <GateControls v-if="page === 'standard'" @set-state="setQubitPosition" @gate="handleStandardGate"
      @rotation-gate="handleRotationGate" @gate-hover="handleGateHover" @gate-unhover="handleGateUnhover"
      @page-switch="handlePageSwitch" />
    <CustomGateControls v-else v-model="customGateState" :flags :sequence-index="sequenceIndex"
      :result="customGateResult" @gate-hover="handleGateHover" @gate-unhover="handleGateUnhover"
      @page-switch="handlePageSwitch" @state-select="setCustomStateSelection" @calculate="calculateCustomGate"
      @simulate-sequence="startCustomGateSequence" @show-rotation="previewCustomGate"
      @skip-simulation="fastForwardSequenceExecution" />
  </div>
  <div id="gate-info-container">
    <GateInfo :gate="hoveredGate" v-if="page === 'standard'" />
    <CustomGateInfo :result="customGateResult" :sequence-index="sequenceIndex" :flags v-else />
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
  width: calc((100vw - 800px) / 2);
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
