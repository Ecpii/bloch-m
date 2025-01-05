<script setup>
import { computed } from 'vue';

const props = defineProps(['gateKey'])
defineEmits(['gate', 'gate-hover'])
const GATE_BUTTONS = {
  'x': { key: 'x', class: 'pauli', labelHTML: 'X' },
  's': { key: 's', class: 's', labelHTML: 'S' },
  'y': { key: 'y', class: 'pauli', labelHTML: 'Y' },
  'sdg': { key: 'sdg', class: 's', labelHTML: 'S<sup>†</sup>' },
  'z': { key: 'z', class: 'pauli', labelHTML: 'Z' },
  't': { key: 't', class: 't', labelHTML: 'T' },
  'h': { key: 'h', class: 'h', labelHTML: 'H' },
  'tdg': { key: 'tdg', class: 't', labelHTML: 'T<sup>†</sup>' }
}
const ROTATION_GATE_BUTTONS = {
  'rx+': { key: 'rx+', axis: 'x', angle: '+θ', isPositive: true },
  'rx-': { key: 'rx-', axis: 'x', angle: '-θ', isPositive: false },
  'ry+': { key: 'ry+', axis: 'y', angle: '+θ', isPositive: true },
  'ry-': { key: 'ry-', axis: 'y', angle: '-θ', isPositive: false },
  'rz+': { key: 'rz+', axis: 'z', angle: '+θ', isPositive: true },
  'rz-': { key: 'rz-', axis: 'z', angle: '-θ', isPositive: false }
}

const gate = computed(() => GATE_BUTTONS[props.gateKey])
</script>

<template>
  <button :class="gate.class" v-html="gate.labelHTML" @click="$emit('gate', props.gateKey)"
    @mouseover="$emit('gate-hover', props.gateKey)" />
</template>

<style scoped>
@import '../assets/controls.css';

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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
