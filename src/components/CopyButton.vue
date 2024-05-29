<script setup>
import { ref } from 'vue'
const props = defineProps(['displayText', 'copyText'])
const recentlyCopied = ref(false)
const copyError = ref(null)
const timeoutId = ref(0)
const COPY_DURATION = 2000

async function handleClick() {
  clearTimeout(timeoutId.value)
  copyError.value = null
  try {
    await navigator.clipboard.writeText(props.copyText)
    recentlyCopied.value = true
    timeoutId.value = setTimeout(() => {
      recentlyCopied.value = false
    }, COPY_DURATION)
  } catch (err) {
    copyError.value = err
    timeoutId.value = setTimeout(() => {
      copyError.value = null
    }, COPY_DURATION)
  }
}
</script>

<template>
  <button @click="handleClick">
    <template v-if="copyError">Error!</template>
    <template v-else-if="recentlyCopied"> Copied! </template>
    <template v-else>
      {{ props.displayText }}
    </template>
  </button>
</template>

<style scoped>
button {
  color: var(--text);
}
</style>
