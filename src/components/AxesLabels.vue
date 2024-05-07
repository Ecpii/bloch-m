<script setup>
import { Text3D } from '@tresjs/cientos'
import { useTresContext, vAlwaysLookAt } from '@tresjs/core'
import { computed } from 'vue'
const { camera, renderer } = useTresContext()
// const cameraPosition = computed(() => {
//   console.log('camera.position', camera.position)
//   return camera.position
// })
</script>

<template>
  <Text3D
    text="|0>"
    font="/src/assets/fonts/Satoshi-Regular.json"
    :position="[0, 0, 1]"
    :height="0.01"
    :size="0.1"
    :bevel-enabled="false"
    :center="true"
    :up="[0, 0, 1]"
    v-always-look-at="[camera.position.x, camera.position.y, camera.position.z]"
  >
    <TresAxesHelper />
    <TresMeshNormalMaterial />
  </Text3D>
  <Text3D
    text="|+>"
    font="/src/assets/fonts/Satoshi-Regular.json"
    :position="[1, 0, 0]"
    :height="0.01"
    :size="0.1"
    :bevel-enabled="false"
  >
    <TresMeshNormalMaterial />
  </Text3D>
  <Text3D
    text="|R>"
    font="/src/assets/fonts/Satoshi-Regular.json"
    :position="[0, 1, 0]"
    :height="0.01"
    :size="0.1"
    :bevel-enabled="false"
  >
    <TresMeshNormalMaterial />
  </Text3D>
</template>

<style scoped></style>
