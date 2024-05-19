<script setup>
const config = defineModel()
const { disabled } = defineProps(['disabled'])
function formatDuration(duration) {
  let durationMs = parseFloat(duration)
  if (durationMs < 1) {
    return `${durationMs * 1000} ms`
  } else {
    return `${durationMs} s`
  }
}
</script>
<template>
  <div id="container">
    <div class="checkbox-container">
      <label for="arc">Show qubit arc</label>
      <input id="arc" type="checkbox" v-model="config.showRotationArc" :disabled />
    </div>
    <div class="checkbox-container">
      <label for="axes-helpers">Show axes during rotation</label>
      <input id="axes-helpers" type="checkbox" v-model="config.showAxesHelpers" :disabled />
    </div>
    <div>
      <label for="duration"
        >Animation Duration - {{ formatDuration(config.animationDuration) }}</label
      >
      <br />
      <input
        id="duration"
        name="duration"
        type="range"
        min="0.1"
        max="2"
        step="0.1"
        v-model="config.animationDuration"
        :disabled
      />
    </div>
  </div>
</template>
<style scoped>
input[type='range'] {
  width: min(20rem, calc(100% - 1rem));
}
#container {
  display: flex;
  flex-direction: column;
}
.checkbox-container {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
</style>
