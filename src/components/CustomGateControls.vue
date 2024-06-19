<script setup>
import { createQubitStatevectorTex } from '@/qubit'
import KatexDisplay from './KatexDisplay.vue'
import { ref } from 'vue'

const customGateState = defineModel()
const props = defineProps(['flags', 'sequenceIndex', 'result'])
const simulateHovered = ref(false)
const emit = defineEmits([
  'gate-hover',
  'gate-unhover',
  'state-select',
  'calculate',
  'page-switch',
  'simulate-sequence',
  'show-rotation',
  'skip-simulation'
])

function handleSimulateClick() {
  if (props.flags.simulating) {
    emit('skip-simulation')
  } else {
    emit('simulate-sequence')
  }
}
</script>
<template>
  <div id="parameters">
    <KatexDisplay :tex="createQubitStatevectorTex(customGateState.startPosition, 'α')" />
    <KatexDisplay :tex="createQubitStatevectorTex(customGateState.endPosition, 'β')" />
    <button
      @click="$emit('state-select', 'startPosition')"
      :class="{ start: true, startActive: customGateState.selecting === 'startPosition' }"
    >
      Set |α⟩
    </button>
    <button
      @click="$emit('state-select', 'endPosition')"
      :class="{ end: true, endActive: customGateState.selecting === 'endPosition' }"
    >
      Set |β⟩
    </button>
    <label for="precision">Recursion Depth - {{ customGateState.precision }}</label>
    <input
      id="precision"
      type="range"
      min="0"
      max="6"
      step="1"
      v-model="customGateState.precision"
    />
  </div>
  <div id="controls" @mouseleave="$emit('gate-unhover')">
    <div class="span-2">
      <hr />
      <button
        class="custom-gate"
        @click.passive="$emit('calculate')"
        :disabled="props.flags.simulating || props.flags.calculating"
      >
        Calculate
      </button>
    </div>
    <div class="span-2">
      <button
        class="custom-gate"
        @click.passive="$emit('show-rotation')"
        :disabled="props.flags.simulating || props.flags.calculating"
      >
        Show Rotation
        <!-- todo: disable when gate -->
      </button>
    </div>
    <div
      class="span-2"
      v-if="props.result?.solovayKitaev"
      @mouseover="() => (simulateHovered = true)"
      @mouseleave="() => (simulateHovered = false)"
    >
      <button
        @click="handleSimulateClick"
        class="custom-gate"
        :class="{
          simulating: props.flags.simulating,
          danger: props.flags.simulating && simulateHovered
        }"
      >
        <template v-if="!props.flags.simulating"> Simulate </template>
        <template v-else-if="!simulateHovered">
          Simulating<br />({{ props.sequenceIndex }} /
          {{ props.result.solovayKitaev.gates.length }})
        </template>
        <template v-else> Fast-Forward Simulation </template>
      </button>
    </div>
    <div class="span-2">
      <hr />
      <button
        class="custom-gate"
        @click="$emit('page-switch', 'standard')"
        @mouseover="$emit('gate-hover', 'standard')"
      >
        Basic Gates
      </button>
    </div>
  </div>
</template>

<style scoped>
@import '../assets/controls.css';
#parameters {
  display: flex;
  flex-direction: column;
  width: calc(4rem * 2 + 1rem); /* same width as controls */
  gap: 0.5rem;
  margin-bottom: 1rem;
}
button {
  color: var(--primary);
  background: inherit;
  font-size: 1rem;
  padding: 0.5rem;
}
button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
button.active {
  color: var(--background);
  background: var(--primary);
}
/* button.start {
  color: var(--secondary);
} */
button.startActive {
  color: var(--background);
  background: var(--secondary);
}
/* button.end {
  color: var(--purple);
} */
button.endActive {
  color: var(--background);
  background: var(--purple);
}
.danger:hover:enabled {
  background: var(--orange);
  color: var(--background);
}
</style>
