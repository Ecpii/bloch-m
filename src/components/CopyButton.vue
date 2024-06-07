<script setup>
import CopyIcon from './icons/copy.svg'
import { ref } from 'vue'
const props = defineProps(['copyText', 'copyFunction'])
const recentlyCopied = ref(false)
const copyError = ref(null)
const timeoutId = ref(0)
const COPY_DURATION = 2000

async function handleClick() {
  clearTimeout(timeoutId.value)
  copyError.value = null
  try {
    const payload = props.copyText ?? props.copyFunction()
    await navigator.clipboard.writeText(payload)
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
    <CopyIcon />
    <template v-if="copyError">Error!</template>
    <template v-else-if="recentlyCopied"> Copied! </template>
    <template v-else><slot></slot></template>
  </button>
</template>

<style scoped>
button {
  color: var(--text);
  display: flex;
  align-items: center;
  font-size: 1rem;
  gap: 0.5rem;
  width: auto;
}
button > svg {
  width: 1rem;
  height: 1rem;
  fill: var(--primary);
}
</style>
