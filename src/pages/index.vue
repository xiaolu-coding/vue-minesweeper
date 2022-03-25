<script setup lang="ts">
import { reactive } from '@vue/runtime-dom'

const WIDTH = 10
const HEIGHT = 10
// 生成10x10的格子
const state = reactive(
  Array.from({ length: HEIGHT }, (_, y) =>
    Array.from({ length: WIDTH }, (_, x) => y * 10 + x + 1)))

function onClick(x: number, y: number) {}
</script>

<template>
  <div>
    Minesweeper
    <div v-for="(row, y) in state" :key="y">
      <button
        v-for="(item, x) in row"
        :key="x"
        w-10
        h-10
        border="~"
        hover:bg-gray
        @click="onClick(x, y)"
      >
        {{ item }}
      </button>
    </div>
  </div>
</template>
