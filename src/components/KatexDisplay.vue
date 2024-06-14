<script setup>
const { tex } = defineProps(['tex'])
function renderDisplayKatex(tex) {
  return katex.renderToString(tex, { displayMode: true, output: 'html' })
}
</script>
<template>
  <div v-html="renderDisplayKatex(tex)"></div>
</template>
