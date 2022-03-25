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

function generateMines(initial: BlockState) {
  for (const row of state) {
    // 0.1概率生成炸弹
    for (const block of row) {
      // 当点下之后，周围不会有炸弹
      if (Math.abs(initial.x - block.x) <= 1)
        continue
      if (Math.abs(initial.y - block.y) <= 1)
        continue
      block.mine = Math.random() < 0.4
    }
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
        return

      getSiblings(block)
        .forEach((b) => {
          if (b.mine)
            block.adjacentMines += 1
        })
    })
  })
}

// 当遇到0的时候把旁边炸开
function expendZero(block: BlockState) {
  // 如果周围炸弹数不是0 或者已经被翻开，就不管
  if (block.adjacentMines)
    return
  // 如果周围炸弹数量是0 递归去炸
  getSiblings(block).forEach((s) => {
    // 如果没翻开，就去翻开，然后去炸开旁边的为0的
    if (!s.revealed) {
      s.revealed = true
      expendZero(s)
    }
  })
}

// 取周围的，得到炸弹数量
function getSiblings(block: BlockState) {
  return directions.map(([dx, dy]) => {
    const x2 = block.x + dx
    const y2 = block.y + dy
    // 如果超出边界
    if (x2 < 0 || x2 >= WIDTH || y2 < 0 || y2 >= HEIGHT)
      return undefined

    return state[y2][x2]
  }).filter(Boolean) as BlockState[]
}

let mineGenerated = false
const dev = true

function onClick(block: BlockState) {
  if (!mineGenerated) {
    generateMines(block)
    updateNumbers()
    mineGenerated = true
  }
  block.revealed = true
  if (block.mine)
    alert('booooooooooom!!!')

  expendZero(block)
}

function getBlockClass(block: BlockState) {
  // 如果是没翻开的
  if (!block.revealed)
    return 'bg-gray-500/10'
  // 翻开后根据是否是炸弹，给样式
  return block.mine ? 'bg-red-500/30' : numberColors[block.adjacentMines]
}

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
          m="0.1"
          border="1 gray-400/25"
          hover="bg-gray/30"
          :class="getBlockClass(block)"
          @click="onClick(block)"
        >
          <template v-if="block.revealed || dev">
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
