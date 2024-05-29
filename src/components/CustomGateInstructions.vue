<script setup>
import { generateSo3Tex } from '@/solovayKitaev'
import KatexDisplay from './KatexDisplay.vue'
import { ref } from 'vue'

defineEmits(['simulate-sequence'])
const { state, sequenceIndex } = defineProps(['state', 'sequenceIndex'])
const decimalPrecision = ref(2)
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
    <template v-if="!state.results.error">
      <label for="precision">Decimal Precision - {{ decimalPrecision }} digits</label><br />
      <input id="precision" type="range" min="1" max="6" step="1" v-model="decimalPrecision" />
      <h2>Original SO(3) Matrix</h2>
      <KatexDisplay :tex="generateSo3Tex(state.results.originalSo3Matrix, decimalPrecision)" />
      <h2>Solovay–Kitaev Matrix</h2>
      <KatexDisplay :tex="generateSo3Tex(state.results.solovayKitaev.product, decimalPrecision)" />
      <h2>Approximation Gates</h2>
      <div class="gate-display">
        <div
          v-for="(gate, index) in state.results.solovayKitaev.gates"
          :key="index"
          :class="{ completed: index <= sequenceIndex }"
        >
          <template v-if="gate === 't'">T</template>
          <template v-else-if="gate === 'h'">H</template>
          <template v-else
            ><div>T<sup>†</sup></div></template
          >
        </div>
      </div>
      <button @click="$emit('simulate-sequence')">Simulate</button>
    </template>
    <template v-else>
      Error: invalid points selected. Currently, this implementation of the algorithm fails when the
      points selected are <b>perfectly</b> parallel or opposite. To get around this, move either
      point slightly and recalculate.
    </template>
  </template>
</template>

<style scoped>
.gate-display {
  overflow-x: scroll;
  white-space: nowrap;
  padding: 0.5rem;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 2.5rem;
  grid-template-rows: 2.5rem;
  column-gap: 0.5rem;
}
.gate-display > div {
  text-align: center;
  color: #fff;
  background: var(--secondary);
  /* border: 1px solid var(--text); */
  display: flex;
  align-items: center;
  justify-content: center;
}
.completed {
  background: var(--primary) !important;
}
</style>
