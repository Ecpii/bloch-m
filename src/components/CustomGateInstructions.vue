<script setup>
import { generateSo3Tex } from '@/solovayKitaev'
import KatexDisplay from './KatexDisplay.vue'
import { ref } from 'vue'

const { state } = defineProps(['state'])
const decimalPrecision = ref(2)

function formatGates(gates) {
  let res = ''
  for (const gate of gates) {
    if (gate === 'tdg') {
      res = res.concat('T<sup>†</sup>')
    } else if (gate === 't') {
      res = res.concat('T')
    } else {
      res = res.concat('H')
    }
    res = res.concat(', ')
  }
  return res.slice(0, -2)
}
</script>
<template>
  <template v-if="!state.results">
    <h1>Custom Gate</h1>
    <p>
      Any rotation on the Bloch sphere can be approximated with just the H, T, and T<sup>†</sup>
      gates. It was proven in the
      <a href="https://en.wikipedia.org/wiki/Solovay%E2%80%93Kitaev_theorem" target="_blank"
        >Solovay–Kitaev theorem</a
      >
      that an approximation like this can be found efficiently.
    </p>
    <p>
      Using this tool, you can specify a rotation and calculate this approxiation via the
      Solovay–Kitaev algorithm. The rotation specified by the two states is the rotation from |α⟩ to
      |β⟩.
    </p>
    <ol>
      <li>Click on any point of the Bloch sphere to select |α⟩.</li>
      <li>
        Click on the button labeled "Set |β⟩" and then click on any point of the Bloch sphere to
        select |β⟩.
      </li>
      <li>Select desired recursion depth for the approximation, and click "Calculate".</li>
    </ol>
  </template>
  <template v-else>
    <h1>Custom Gate Calculation</h1>
    <label for="precision">Decimal Precision - {{ decimalPrecision }} digits</label><br />
    <input id="precision" type="range" min="1" max="6" step="1" v-model="decimalPrecision" />
    <h2>Original SO(3) Matrix</h2>
    <KatexDisplay :tex="generateSo3Tex(state.results.originalSo3Matrix, decimalPrecision)" />
    <h2>Solovay–Kitaev Matrix</h2>
    <KatexDisplay :tex="generateSo3Tex(state.results.solovayKitaev.product, decimalPrecision)" />
    <h2>Approximation Gates</h2>
    <div class="gate-display" v-html="formatGates(state.results.solovayKitaev.gates)"></div>
  </template>
</template>

<style scoped>
.gate-display {
  overflow-x: scroll;
  white-space: nowrap;
  padding: 1rem;
}
</style>
