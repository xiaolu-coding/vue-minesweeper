<script setup lang="ts">
import { reactive } from '@vue/runtime-dom'

// 格子状态
interface BlockState {
  x: number
  y: number
  revealed?: boolean
  mine?: boolean // 是否是炸弹
  flagged?: boolean
  adjacentMines?: number
}

const WIDTH = 10
const HEIGHT = 10
// 生成10x10的格子
const state = reactive(
  Array.from({ length: HEIGHT }, (_, y) =>
    Array.from({ length: WIDTH }, (_, x): BlockState => ({ x, y }))))

function generateMines() {
  for (const row of state) {
    for (const block of row)
      // 0.1概率生成炸弹
      block.mine = Math.random() < 0.2
  }
}

function onClick(x: number, y: number) {}

generateMines()
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
        {{ item.mine ? 'O' : item.adjacentMines || '.' }}
      </button>
    </div>
  </div>
</template>
