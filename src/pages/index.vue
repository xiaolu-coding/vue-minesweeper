<script setup lang="ts">
import { ref } from '@vue/runtime-dom'
import type { BlockState } from '~/types'
import { isDev, toggleDev } from '~/composables'

const WIDTH = 5
const HEIGHT = 5
// 生成10x10的格子
const state = ref(
  Array.from({ length: HEIGHT }, (_, y) =>
    Array.from(
      { length: WIDTH },
      (_, x): BlockState => ({ x, y, adjacentMines: 0, revealed: false }))))

function generateMines(initial: BlockState) {
  for (const row of state.value) {
    // 0.1概率生成炸弹
    for (const block of row) {
      // 当点下之后，周围不会有炸弹
      if (Math.abs(initial.x - block.x) <= 1)
        continue
      if (Math.abs(initial.y - block.y) <= 1)
        continue
      block.mine = Math.random() < 0.2
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

// 计算周围有几个炸弹
function updateNumbers() {
  state.value.forEach((raw, y) => {
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

    return state.value[y2][x2]
  }).filter(Boolean) as BlockState[]
}

let mineGenerated = false

function onRightClick(block: BlockState) {
  // 如果已经打开了，没必要插旗子
  if (block.revealed)
    return
  block.flagged = !block.flagged
  checkGameState()
}

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
  checkGameState()
}

// watchEffect(checkGameState)

function checkGameState() {
  if (!mineGenerated) // 如果没有生成炸弹
    return
  const blocks = state.value.flat()

  if (blocks.every(block => block.revealed || block.flagged)) {
    if (blocks.every(block => block.flagged && !block.mine))
      alert('you cheat!')
    else
      alert('you win!')
  }
}

</script>

<template>
  <div>
    Minesweeper
    <button @click="toggleDev">
      {{ isDev }}
    </button>
    <div p5>
      <div
        v-for="(row, y) in state"
        :key="y"
        flex="~"
        items-center
        justify-center
      >
        <MineBlock v-for="(block, x) in row" :key="x" :block="block" @click="onClick(block)" @contextmenu.prevent="onRightClick(block)" />
      </div>
    </div>
  </div>
</template>
