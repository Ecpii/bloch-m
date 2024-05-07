<script setup>
import { extend } from '@tresjs/core'
import SpriteText from 'three-spritetext'
const LABEL_OFFSET = 0.2

extend({ SpriteText })

const POSITION_LABELS = [
  { position: [0, 0, 1 + LABEL_OFFSET], text: '|0⟩', key: 'z positive' },
  { position: [0, 0, -1 - LABEL_OFFSET], text: '|1⟩', key: 'z negative' },
  { position: [0, 1 + LABEL_OFFSET, 0], text: '|R⟩', key: 'y positive' },
  { position: [0, -1 - LABEL_OFFSET, 0], text: '|L⟩', key: 'y negative' },
  { position: [1 + LABEL_OFFSET, 0, 0], text: '|+⟩', key: 'x positive' },
  { position: [-1 - LABEL_OFFSET, 0, 0], text: '|-⟩', key: 'x negative' }
]
</script>

<template>
  <TresSpriteText
    v-for="{ position, text, key } in POSITION_LABELS"
    :position
    :text
    :key
    text-height="0.1"
    color="black"
    font-face="Noto Sans Math"
  >
  </TresSpriteText>
</template>

<style scoped></style>
