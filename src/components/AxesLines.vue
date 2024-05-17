<script setup>
import { Line2 } from '@tresjs/cientos'
const LINE_PROPERTIES = {
  lineWidth: 1,
  color: 0x000000,
  dashed: true,
  dashScale: 30
}
</script>

<template>
  <!--X axis-->
  <Line2
    :points="[
      [-1, 0, 0],
      [1, 0, 0]
    ]"
    :="LINE_PROPERTIES"
  />
  <!--Y axis-->
  <Line2
    :points="[
      [0, -1, 0],
      [0, 1, 0]
    ]"
    :="LINE_PROPERTIES"
  />
  <!--Z axis-->
  <Line2
    :points="[
      [0, 0, -1],
      [0, 0, 1]
    ]"
    :="LINE_PROPERTIES"
  />
  <TresMesh>
    <TresTorusGeometry :args="[0.99, 0.001, 8, 64]" />
    <TresMeshBasicMaterial color="#222222" />
  </TresMesh>
  <TresMesh cast-shadow :rotation-x="Math.PI / 2">
    <TresCylinderGeometry :args="[0.99, 0.99, 0.01, 64, 1]" />
    <TresMeshBasicMaterial color="#7b97f9" :transparent="true" :opacity="0.2" />
  </TresMesh>
</template>
