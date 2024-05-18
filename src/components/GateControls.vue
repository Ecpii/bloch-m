<script setup>
import { shallowRef } from 'vue'
defineEmits(['set-state', 'gate', 'hover-gate', 'unhover-gate', 'rotation-gate'])
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
const ROTATION_GATE_BUTTONS = [
  { key: 'rx+', axis: 'x', angle: '+θ', isPositive: true },
  { key: 'rx-', axis: 'x', angle: '-θ', isPositive: false },
  { key: 'ry+', axis: 'y', angle: '+θ', isPositive: true },
  { key: 'ry-', axis: 'y', angle: '-θ', isPositive: false },
  { key: 'rz+', axis: 'z', angle: '+θ', isPositive: true },
  { key: 'rz-', axis: 'z', angle: '-θ', isPositive: false }
]
const FRACTION_VALUES = {
  'pi/2': Math.PI / 2,
  'pi/4': Math.PI / 4,
  'pi/8': Math.PI / 8,
  'pi/12': Math.PI / 12
}
const theta = shallowRef('pi/8')
function getAngle(fraction, isPositive) {
  if (isPositive) {
    return FRACTION_VALUES[fraction]
  } else {
    return -1 * FRACTION_VALUES[fraction]
  }
}
</script>
<template>
  <div id="controls" @mouseleave="$emit('unhover-gate')">
    <button class="reset" @click="$emit('set-state', '0')">|0⟩</button>
    <button class="reset" @click="$emit('set-state', '1')">|1⟩</button>
    <button
      v-for="gate in GATE_BUTTONS"
      :class="gate.class"
      :key="gate.key"
      @click="$emit('gate', gate.key)"
      @mouseover="$emit('hover-gate', gate.key)"
      v-html="gate.labelHTML"
    />
    <div id="select-theta">
      <hr />
      θ =
      <select id="theta-select" v-model="theta">
        <option value="pi/2">π/2</option>
        <option value="pi/4">π/4</option>
        <option value="pi/8">π/8</option>
        <option value="pi/12">π/12</option>
      </select>
    </div>
    <button
      v-for="gate in ROTATION_GATE_BUTTONS"
      class="rotation"
      :key="gate.key"
      @click="$emit('rotation-gate', gate.key, gate.axis, getAngle(theta, gate.isPositive))"
      @mouseover="$emit('hover-gate', gate.key)"
    >
      R{{ gate.axis }}<br />
      <span style="font-size: 1rem">{{ gate.angle }}</span>
    </button>
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
button.rotation {
  background: var(--orange);
  line-height: 1.25rem;
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
  /* grid-template-rows: repeat(9, 4rem); */
  grid-auto-rows: 4rem;
  gap: 1rem;
}
#select-theta {
  grid-column: 1 / span 2;
  font-size: 1.25rem;
  text-align: center;
  align-self: center;
}
#select-theta hr {
  margin-bottom: 1rem;
}
#select-theta select {
  font-size: inherit;
  font-family: inherit;
  border: none;
  background: inherit;
  color: var(--primary);
}
</style>
