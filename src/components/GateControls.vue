<script setup>
defineEmits(['reset-zero', 'reset-one', 'x', 'y', 'z', 'h', 's', 'sdg', 't', 'tdg'])
</script>
<template>
  <div id="controls">
    <button class="reset" @click="$emit('reset-zero')">|0⟩</button>
    <button class="reset" @click="$emit('reset-one')">|1⟩</button>
    <button class="pauli" @click="$emit('x')">X</button>
    <button class="s" @click="$emit('s')">S</button>
    <button class="pauli" @click="$emit('y')">Y</button>
    <button class="s" @click="$emit('sdg')">S<sup>†</sup></button>
    <button class="pauli" @click="$emit('z')">Z</button>
    <button class="t" @click="$emit('t')">T</button>
    <button class="h" @click="$emit('h')">H</button>
    <button class="t" @click="$emit('tdg')">T<sup>†</sup></button>
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
