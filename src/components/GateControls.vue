<script setup>
import GateButton from './GateButton.vue'
import { shallowRef } from 'vue'
defineEmits(['set-state', 'gate', 'gate-hover', 'gate-unhover', 'rotation-gate', 'page-switch'])
const GATE_BUTTONS = [
  'x',
  's',
  'y',
  'sdg',
  'z',
  't',
  'h',
  'tdg'
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
  <div id="controls" @mouseleave="$emit('gate-unhover')">
    <button class="reset" @click="$emit('set-state', '0')">|0⟩</button>
    <button class="reset" @click="$emit('set-state', '1')">|1⟩</button>
    <GateButton :gate-key="gate" :key="gate" v-for="gate in GATE_BUTTONS" @gate="(arg) => $emit('gate', arg)"
      @gate-hover="(arg) => $emit('gate-hover', arg)" />
    <div class="span-2" id="select-theta">
      <hr />
      θ =
      <select id="theta-select" v-model="theta">
        <option value="pi/2">π/2</option>
        <option value="pi/4">π/4</option>
        <option value="pi/8">π/8</option>
        <option value="pi/12">π/12</option>
      </select>
    </div>
    <!-- <button v-for="gate in ROTATION_GATE_BUTTONS" class="rotation" :key="gate.key"
      @click="$emit('rotation-gate', gate.key, gate.axis, getAngle(theta, gate.isPositive))"
      @mouseover="$emit('gate-hover', gate.key)">
      <div>R{{ gate.axis }}</div>
      <span style="font-size: 1rem">{{ gate.angle }}</span>
    </button> -->
    <div class="span-2">
      <hr />
      <button class="custom-gate" @click="$emit('page-switch', 'customGate')"
        @mouseover="$emit('gate-hover', 'custom')">
        Custom Gate
      </button>
    </div>
  </div>
</template>
<style scoped>
@import '../assets/controls.css';
</style>
