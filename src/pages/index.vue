<script setup lang="ts">
import { reactive } from '@vue/runtime-dom'

// 格子状态
interface BlockState {
  x: number
  y: number
  revealed?: boolean
  mine?: boolean // 是否是炸弹
  flagged?: boolean
  adjacentMines: number // 周围炸弹数量
}

const WIDTH = 10
const HEIGHT = 10
// 生成10x10的格子
const state = reactive(
  Array.from({ length: HEIGHT }, (_, y) =>
    Array.from({ length: WIDTH }, (_, x): BlockState => ({ x, y, adjacentMines: 0 }))))

function generateMines() {
  for (const row of state) {
    for (const block of row)
      // 0.1概率生成炸弹
      block.mine = Math.random() < 0.2
  }
}

const directions = [
  [1, 0], // 右
  [0, 1], // 上
  [0, -1], // 下
  [-1, 0], // 左
  [-1, -1], // 左上
  [-1, 1], // 左下
  [1, -1], // 右上
  [1, 1], // 右下
]

// 计算周围有几个炸弹
function updateNumbers() {
  state.forEach((raw, y) => {
    raw.forEach((block, x) => {
      if (block.mine)
        // 如果是炸弹就跳过
        return
      directions.forEach(([dx, dy]) => {
        const x2 = x + dx
        const y2 = y + dy
        // 如果超出边界
        if (x2 < 0 || x2 >= WIDTH || y2 < 0 || y2 >= HEIGHT)
          return
        if (state[x2][y2].mine)
          block.adjacentMines++
      })
    })
  })
}

function onClick(x: number, y: number) {}

function getBlockClass(block: BlockState) {
  return block.mine ? 'text-red' : 'text-gray'
}

generateMines()
updateNumbers()
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
        :class="getBlockClass(item)"
        @click="onClick(x, y)"
      >
        {{ item.mine ? 'X' : item.adjacentMines }}
      </button>
    </div>
  </div>
</template>
