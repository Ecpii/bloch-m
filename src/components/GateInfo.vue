<script setup>
import KatexDisplay from './KatexDisplay.vue'
import KatexInline from './KatexInline.vue'
import { shallowRef } from 'vue'

const emit = defineEmits(['gate-unselect'])
const { gate } = defineProps(['gate'])
const isReturnHovered = shallowRef(false)
function handleReturnClick() {
  emit('gate-unselect')
  unsetHovered();
}
function handleReturnHover() {
  isReturnHovered.value = true
}
function unsetHovered() {
  isReturnHovered.value = false
}

</script>
<template>
  <template v-if="!gate">
    <h1>Bloch M</h1>
    A Bloch sphere visualization tool to help illustrate how single-qubit gates work. <br />
    <i>Hover over any gate to see more information here.</i>
    <br />
    <a href="https://github.com/Ecpii/bloch-m" target="_blank">GitHub</a> |
    <a href="https://javafxpert.github.io/grok-bloch/" target="_blank">Inspiration</a>
  </template>
  <template v-else>
    <a @click="handleReturnClick" @mouseover="handleReturnHover" @mouseleave="unsetHovered">
      {{ isReturnHovered ? "< About" : "Viewing:" }} </a>
        <h1>{{ gate.name }}</h1>
        {{ gate.description }}
        <template v-if="gate.matrixTex">
          <h2>Matrix</h2>
          <KatexDisplay :tex="gate.matrixTex" />
        </template>
        <template v-if="gate.eigenstates && gate.eigenstates?.len !== 0">
          <h2>Eigenstates</h2>
          <ul>
            <li v-for="({ state, value }, index) in gate.eigenstates" :key="index">
              <KatexInline :tex="state" /> with eigenvalue
              <KatexInline :tex="value" />
            </li>
          </ul>
        </template>
  </template>
</template>
<style scoped>
i {
  opacity: 0.6;
}
</style>
