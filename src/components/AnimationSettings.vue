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
      <input id="arc" type="checkbox" v-model="config.showRotationArc" />
    </div>
    <div class="checkbox-container">
      <label for="axes-helpers">Show axes during rotation</label>
      <input id="axes-helpers" type="checkbox" v-model="config.showAxesHelpers" />
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
#container {
  display: flex;
  flex-direction: column;
}
.checkbox-container {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
/* from https://range-input-css.netlify.app/ */
/*********** Baseline, reset styles ***********/
input[type='range'] {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  cursor: pointer;
  width: min(20rem, calc(100% - 1rem));
}

/* Removes default focus */
input[type='range']:focus {
  outline: none;
}

input[type='range']:disabled {
  opacity: 0.5;
}

/******** Chrome, Safari, Opera and Edge Chromium styles ********/
/* slider track */
input[type='range']::-webkit-slider-runnable-track {
  background-color: #c9d9fd;
  border-radius: 0rem;
  height: 0.5rem;
}

/* slider thumb */
input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none; /* Override default look */
  appearance: none;
  margin-top: -4px; /* Centers thumb on the track */
  background-color: #7995f9;
  border-radius: 0rem;
  height: 1rem;
  width: 1rem;
}

input[type='range']:focus::-webkit-slider-thumb {
  outline: 3px solid #7995f9;
  outline-offset: 0.125rem;
}

/*********** Firefox styles ***********/
/* slider track */
input[type='range']::-moz-range-track {
  background-color: #c9d9fd;
  border-radius: 0rem;
  height: 0.5rem;
}

/* slider thumb */
input[type='range']::-moz-range-thumb {
  background-color: #7995f9;
  border: none; /*Removes extra border that FF applies*/
  border-radius: 0rem;
  height: 1rem;
  width: 1rem;
}

input[type='range']:focus::-moz-range-thumb {
  outline: 3px solid #7995f9;
  outline-offset: 0.125rem;
}
</style>
