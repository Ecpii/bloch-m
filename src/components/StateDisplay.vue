<script setup>
import { statevectorToProbabilities } from '@/qubit'
import { computed } from 'vue'
import KatexDisplay from './KatexDisplay.vue'

const props = defineProps(['statevector'])
const qubit = computed(() => statevectorToProbabilities(props.statevector))

const computedTex = computed(() => {
  const phaseInPi = qubit.value.phase / Math.PI
  return `|\\psi\\rangle = \\sqrt{${qubit.value.zeroProbability.toFixed(2)}} |0\\rangle +
  \\sqrt{${qubit.value.oneProbability.toFixed(2)}} e^{${phaseInPi.toFixed(2)} \\pi i} |1\\rangle`
})
</script>
<template>
  <KatexDisplay :tex="computedTex" />
</template>

<style scoped>
div {
  font-size: 2rem;
}
@media (width < 600px) {
  div {
    font-size: 1.5rem;
  }
}
</style>
