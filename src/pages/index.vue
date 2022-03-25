<script setup lang="ts">
import { reactive } from '@vue/runtime-dom'

// 格子状态
interface BlockState {
  x: number
  y: number
  revealed: boolean // 是否翻开
  mine?: boolean // 是否是炸弹
  flagged?: boolean
  adjacentMines: number // 周围炸弹数量
}

const WIDTH = 10
const HEIGHT = 10
// 生成10x10的格子
const state = reactive(
  Array.from({ length: HEIGHT }, (_, y) =>
    Array.from(
      { length: WIDTH },
      (_, x): BlockState => ({ x, y, adjacentMines: 0, revealed: false }))))

function generateMines() {
  for (const row of state) {
    // 0.1概率生成炸弹
    for (const block of row) block.mine = Math.random() < 0.4
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

const numberColors = [
  'text-transparent',
  'text-blue-500',
  'text-green-500',
  'text-yellow-500',
  'text-orange-500',
  'text-red-500',
  'text-purple-500',
  'text-pink-500',
  'text-teal-500',
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
        if (x2 < 0 || x2 >= WIDTH || y2 < 0 || y2 >= HEIGHT) return
        if (state[x2][y2].mine) block.adjacentMines++
      })
    })
  })
}

function onClick(block: BlockState) {
  block.revealed = true
}

function getBlockClass(block: BlockState) {
  // 如果是没翻开的
  if (!block.revealed)
    return ''
  // 翻开后根据是否是炸弹，给样式
  return block.mine ? 'bg-red-500/30' : numberColors[block.adjacentMines]
}

generateMines()
updateNumbers()
</script>

<template>
  <div>
    Minesweeper
    <div p5>
      <div
        v-for="(row, y) in state"
        :key="y"
        flex="~"
        items-center
        justify-center
      >
        <button
          v-for="(block, x) in row"
          :key="x"
          flex="~"
          items-center
          justify-center
          w-10
          h-10
          border="1 gray-400/25"
          hover="bg-gray/30"
          :class="getBlockClass(block)"
          @click="onClick(block)"
        >
          <template v-if="block.revealed">
            <div v-if="block.mine" i-mdi-mine></div>
            <div v-else>
              {{ block.adjacentMines }}
            </div>
          </template>
        </button>
      </div>
    </div>
  </div>
</template>
