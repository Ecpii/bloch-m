<script setup>
import { statevectorToProbabilities } from '@/qubit'
import { computed } from 'vue'

const props = defineProps(['statevector'])
const qubit = computed(() => statevectorToProbabilities(props.statevector))

function renderKatex() {
  const phaseInPi = qubit.value.phase / Math.PI
  return katex.renderToString(
    `|\\psi\\rangle = \\sqrt{${qubit.value.zeroProbability.toFixed(2)}} |0\\rangle +
  \\sqrt{${qubit.value.oneProbability.toFixed(2)}} e^{${phaseInPi.toFixed(2)} \\pi i} |1\\rangle`,
    { displayMode: true, output: 'html' }
  )
}
</script>
<template>
  <div v-html="renderKatex()"></div>
</template>

<style scoped>
div {
  font-size: 2rem;
}
</style>
