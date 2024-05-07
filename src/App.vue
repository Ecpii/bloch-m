<script setup>
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import AxesLines from './components/AxesLines.vue'
import AxesLabels from './components/AxesLabels.vue'
</script>

<template>
  <header>
    <h1>Bloch M</h1>
  </header>

  <main>
    <div id="tres-canvas">
      <TresCanvas :alpha="true">
        <TresPerspectiveCamera :up="[0, 0, 1]" :position="[3, 1, 1]" :look-at="[0, 0, 0]" />
        <OrbitControls />
        <TresMesh>
          <TresSphereGeometry :args="[1]" />
          <TresMeshBasicMaterial :color="0x7b97f9" :transparent="true" :opacity="0.4" />
        </TresMesh>

        <AxesLines />

        <Suspense>
          <AxesLabels />
        </Suspense>
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
