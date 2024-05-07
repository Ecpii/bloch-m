<script setup>
import { Line2 } from '@tresjs/cientos'
</script>

<template>
  <!-- <TresAxesHelper /> -->
  <Line2
    :points="[
      [-1, 0, 0],
      [1, 0, 0]
    ]"
    :line-width="10"
    color="#ff0000"
  />
  <Line2
    :points="[
      [0, -1, 0],
      [0, 1, 0]
    ]"
    :line-width="10"
    color="#00ff00"
  />
  <Line2
    :points="[
      [0, 0, -1],
      [0, 0, 1]
    ]"
    :line-width="10"
    color="#0000ff"
  />
</template>
