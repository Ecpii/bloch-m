<script setup>
import { Text3D } from '@tresjs/cientos'
import { useTresContext, vAlwaysLookAt } from '@tresjs/core'
import { computed } from 'vue'
const { camera, renderer } = useTresContext()
// const cameraPosition = computed(() => {
//   console.log('camera.position', camera.position)
//   return camera.position
// })
const TEXT_PROPERTIES = {
  font: '/src/assets/fonts/NotoSansMath_Regular.json',
  height: 0.01,
  size: 0.1,
  bevelEnabled: false,
  center: true,
  up: [0, 0, 1]
}

const LABEL_OFFSET = 0.2
</script>

<template>
  <Text3D
    text="|0⟩"
    :position="[0, 0, 1 + LABEL_OFFSET]"
    :="TEXT_PROPERTIES"
    v-always-look-at="camera.position.clone()"
  >
    <TresMeshNormalMaterial />
  </Text3D>
  <Text3D
    text="|+⟩"
    :position="[1 + LABEL_OFFSET, 0, 0]"
    :="TEXT_PROPERTIES"
    v-always-look-at="camera.position.clone()"
  >
    <TresMeshNormalMaterial />
  </Text3D>
  <Text3D
    text="|R⟩"
    :position="[0, 1 + LABEL_OFFSET, 0]"
    :="TEXT_PROPERTIES"
    v-always-look-at="camera.position.clone()"
  >
    <TresMeshNormalMaterial />
  </Text3D>
  <Text3D
    text="|1⟩"
    :position="[0, 0, -1 - LABEL_OFFSET]"
    :="TEXT_PROPERTIES"
    v-always-look-at="camera.position.clone()"
  >
    <TresMeshNormalMaterial />
  </Text3D>
  <Text3D
    text="|-⟩"
    :position="[-1 - LABEL_OFFSET, 0, 0]"
    :="TEXT_PROPERTIES"
    v-always-look-at="camera.position.clone()"
  >
    <TresMeshNormalMaterial />
  </Text3D>
  <Text3D
    text="|L⟩"
    :position="[0, -1 - LABEL_OFFSET, 0]"
    :="TEXT_PROPERTIES"
    v-always-look-at="camera.position.clone()"
  >
    <TresMeshNormalMaterial />
  </Text3D>
</template>

<style scoped></style>
