<script setup>
import { statevectorToProbabilities } from '@/qubit'
import { computed } from 'vue'

const props = defineProps(['statevector'])
const qubit = computed(() => statevectorToProbabilities(props.statevector))
</script>
<template>
  √ {{ qubit.zeroProbability }} |0⟩ + √ {{ qubit.oneProbability }} e
  <sup>i * {{ qubit.phase }}</sup> |1⟩
</template>
