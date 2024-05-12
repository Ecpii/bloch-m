<script setup>
defineEmits(['reset-zero', 'reset-one', 'gate', 'hover-gate', 'unhover-gate'])
const GATE_BUTTONS = [
  { key: 'x', class: 'pauli', labelHTML: 'X' },
  { key: 's', class: 's', labelHTML: 'S' },
  { key: 'y', class: 'pauli', labelHTML: 'Y' },
  { key: 'sdg', class: 's', labelHTML: 'S<sup>†</sup>' },
  { key: 'z', class: 'pauli', labelHTML: 'Z' },
  { key: 't', class: 't', labelHTML: 'T' },
  { key: 'h', class: 'h', labelHTML: 'H' },
  { key: 'tdg', class: 't', labelHTML: 'T<sup>†</sup>' }
]
</script>
<template>
  <div id="controls">
    <button class="reset" @click="$emit('reset-zero')">|0⟩</button>
    <button class="reset" @click="$emit('reset-one')">|1⟩</button>
    <button
      v-for="gate in GATE_BUTTONS"
      :class="gate.class"
      :key="gate.key"
      @click="$emit('gate', gate.key)"
      @mouseover="$emit('hover-gate', gate.key)"
      @mouseout="$emit('unhover-gate', gate.key)"
      v-html="gate.labelHTML"
    />
  </div>
</template>

<style scoped>
button {
  border-radius: 0;
  border: 0;
  padding: 0;
  cursor: pointer;
  font-family: inherit;
  color: var(--background);
  font-size: 1.5rem;
  transition: all 0.2s linear;
}
button.reset {
  background: transparent;
  color: var(--primary);
}
button.pauli {
  background: var(--primary);
}
button.h {
  background: var(--accent);
}
button.s {
  background: var(--purple);
}
button.t {
  background: var(--green);
}
button:hover {
  opacity: 0.6;
}
button.reset:hover {
  opacity: 1;
  background: var(--secondary);
}
#controls {
  display: grid;
  grid-template-columns: 4rem 4rem;
  grid-template-rows: repeat(5, 4rem);
  gap: 1rem;
}
</style>
