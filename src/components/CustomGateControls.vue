<script setup>
const customGateState = defineModel()
defineEmits(['gate-hover', 'gate-unhover', 'custom-gate'])
</script>
<template>
  <div id="parameters">
    <div>Start state |α⟩</div>
    <div>{{ customGateState.startPosition }}</div>
    <button
      @click="customGateState.selecting = 'start'"
      :class="{ active: customGateState.selecting === 'start' }"
    >
      Set |α⟩
    </button>
    <div>End state |β⟩</div>
    <div>{{ customGateState.endPosition }}</div>
    <button
      @click="customGateState.selecting = 'end'"
      :class="{ active: customGateState.selecting === 'end' }"
    >
      Set |β⟩
    </button>
    <label for="precision">Precision - {{ customGateState.precision }}</label>
    <input
      id="precision"
      type="range"
      min="1"
      max="10"
      step="1"
      v-model="customGateState.precision"
    />
  </div>
  <div id="controls" @mouseleave="$emit('gate-unhover')">
    <div class="span-2">
      <hr />
      <button
        id="custom-gate"
        @click="$emit('custom-gate', 'deactivate')"
        @mouseover="$emit('gate-hover', 'standard')"
      >
        Standard
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
button.active {
  color: var(--background);
  background: var(--primary);
}
</style>
