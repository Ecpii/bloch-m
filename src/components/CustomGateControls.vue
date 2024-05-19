<script setup>
defineEmits(['gate-hover', 'gate-unhover', 'custom-gate'])
</script>
<template>
  <div id="controls" @mouseleave="$emit('gate-unhover')">
    <div class="span-2">
      <hr />
      <button
        id="custom-gate"
        @click="$emit('custom-gate', 'deactivate')"
        @mouseover="$emit('gate-hover', 'standard')"
      >
        Standard Gates
      </button>
    </div>
  </div>
</template>

<style scoped>
@import '../assets/controls.css';
</style>
