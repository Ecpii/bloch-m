<script setup>
import { generateSo3Tex } from '@/solovayKitaev'
import { ref, watchEffect } from 'vue'
import CopyButton from './CopyButton.vue'
import KatexDisplay from './KatexDisplay.vue'

const props = defineProps(['state', 'sequenceIndex', 'flags'])
const decimalPrecision = ref(2)
const gateDisplay = ref(null)

function generateQasm() {
  const gateCommands = props.state.results.solovayKitaev.gates.map((gate) => `${gate} q;`)
  let result = `OPENQASM 3.1;

include "stdgates.inc";

qubit q;
${gateCommands.join('\n')}`
  return result
}

watchEffect(() => {
  if (
    gateDisplay?.value?.children &&
    props.flags.simulating &&
    props.sequenceIndex < gateDisplay.value.children.length
  ) {
    gateDisplay.value.children[props.sequenceIndex].scrollIntoView({
      behavior: 'smooth',
      inline: 'start'
    })
  }
})
</script>
<template>
  <template v-if="!props.state.results">
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
    <template v-if="!props.state.results.error">
      <label for="precision">Decimal Precision - {{ decimalPrecision }} digits</label><br />
      <input id="precision" type="range" min="1" max="6" step="1" v-model="decimalPrecision" />
      <h2>Original SO(3) Matrix</h2>
      <KatexDisplay
        :tex="generateSo3Tex(props.state.results.originalSo3Matrix, decimalPrecision)"
      />
      <h2>Solovay–Kitaev Matrix</h2>
      <KatexDisplay
        :tex="generateSo3Tex(props.state.results.solovayKitaev.product, decimalPrecision)"
      />
      <div class="flex">
        <h2>Approximation Gates</h2>
        <CopyButton :copy-function="generateQasm">Copy QASM</CopyButton>
      </div>
      <div class="gate-display" ref="gateDisplay">
        <div
          v-for="(gate, index) in props.state.results.solovayKitaev.gates"
          :key="index"
          :class="{
            completed: props.flags.simulating && index <= props.sequenceIndex
          }"
        >
          <template v-if="gate === 't'">T</template>
          <template v-else-if="gate === 'h'">H</template>
          <template v-else
            ><div>T<sup>†</sup></div></template
          >
        </div>
      </div>
    </template>
    <template v-else>
      Error: invalid points selected. Currently, this implementation of the algorithm fails when the
      points selected are <b>perfectly</b> parallel or opposite. To get around this, move either
      point slightly and recalculate.
    </template>
  </template>
</template>

<style scoped>
.flex {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}
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
button {
  border-radius: 0;
  border: 0;
  padding: 0;
  cursor: pointer;
  font-family: inherit;
  color: var(--primary);
  background: transparent;
  padding: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s linear;
}
button:hover {
  background: var(--secondary);
}
button.simulating {
  background: var(--primary);
  color: var(--background);
}
</style>
