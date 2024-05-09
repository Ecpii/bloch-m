<script setup>
import { TresCanvas } from '@tresjs/core'
import { Line2, OrbitControls, Stats } from '@tresjs/cientos'
import AxesLines from './components/AxesLines.vue'
import AxesLabels from './components/AxesLabels.vue'
import { computed, onMounted, shallowRef } from 'vue'
import { Vector3 } from 'three'

const qubitPosition = shallowRef(new Vector3(0, 0, 1))
const canvasRef = shallowRef(null)

function handlePointerDown(intersection) {
  qubitPosition.value = intersection.point
}

const qubitLinePoints = computed(() => {
  return [[0, 0, 0], qubitPosition.value]
})

onMounted(() => {
  console.log('canvasRef.value.context', canvasRef.value.context.raycaster)
})
</script>

<template>
  <header>
    <h1>Bloch M</h1>
  </header>

  <main>
    <div id="tres-canvas">
      <TresCanvas :alpha="true" ref="canvasRef">
        <TresPerspectiveCamera
          :up="[0, 0, 1]"
          :position="[3, 1, 1]"
          :look-at="[0, 0, 0]"
          :near="0.1"
          :far="1000"
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
    </div>
  </main>
</template>

<style scoped>
h1 {
  font-weight: bold;
}
#tres-canvas {
  width: 1280px;
  height: 720px;
}
</style>
