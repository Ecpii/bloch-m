<script setup>
const { tex } = defineProps(['tex'])
function renderInlineKatex(tex) {
  return katex.renderToString(tex, { displayMode: false, output: 'html' })
}
</script>
<template>
  <span v-html="renderInlineKatex(tex)"></span>
</template>
