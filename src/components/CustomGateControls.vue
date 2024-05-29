<script setup>
import { createQubitStatevectorTex } from '@/qubit'
import KatexDisplay from './KatexDisplay.vue'

const customGateState = defineModel()
const props = defineProps(['flags'])
defineEmits(['gate-hover', 'gate-unhover', 'state-select', 'calculate', 'page-switch'])
</script>
<template>
  <div id="parameters">
    <!-- <div>Start state |α⟩</div> -->
    <!-- <div>{{ customGateState.startPosition }}</div> -->
    <KatexDisplay :tex="createQubitStatevectorTex(customGateState.startPosition, 'α')" />
    <!-- <div>End state |β⟩</div> -->
    <!-- <div>{{ customGateState.endPosition }}</div> -->
    <KatexDisplay :tex="createQubitStatevectorTex(customGateState.endPosition, 'β')" />
    <!-- <KatexDisplay
      :tex="computeSo3TexFromPoints(customGateState.startPosition, customGateState.endPosition)"
    /> -->
    <button
      @click="$emit('state-select', 'startPosition')"
      :class="{ active: customGateState.selecting === 'startPosition' }"
    >
      Set |α⟩
    </button>
    <button
      @click="$emit('state-select', 'endPosition')"
      :class="{ active: customGateState.selecting === 'endPosition' }"
    >
      Set |β⟩
    </button>
    <label for="precision">Precision - {{ customGateState.precision }}</label>
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
        id="custom-gate"
        @click.passive="$emit('calculate')"
        :disabled="props.flags.simulating || props.flags.calculating"
      >
        Calculate
      </button>
    </div>
    <div class="span-2">
      <hr />
      <button
        id="custom-gate"
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
  width: calc(4rem * 2 + 1rem); /* same width as #controls */
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
</style>
