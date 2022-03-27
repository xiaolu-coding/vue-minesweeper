<script setup lang="ts">

import type { BlockState } from '~/types'
import { isDev } from '~/composables'

defineProps<{ block: BlockState }>()

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

function getBlockClass(block: BlockState) {
  if (block.flagged)
    return 'bg-ray-500/10'
  // 如果是没翻开的
  if (!block.revealed)
    return 'bg-gray-500/10 hover:bg-gray/30'
  // 翻开后根据是否是炸弹，给样式
  return block.mine ? 'bg-red-500/30' : numberColors[block.adjacentMines]
}
</script>

<template>
  <button
    flex="~"
    items-center
    justify-center
    min-w-10
    min-h-10
    m="0.1"
    border="1 gray-400/25"
    :class="getBlockClass(block)"
  >
    <template v-if="block.flagged">
      <div i-mdi-flag text-red />
    </template>
    <template v-else-if="block.revealed || isDev">
      <div v-if="block.mine" i-mdi-mine />
      <div v-else font-600>
        {{ block.adjacentMines }}
      </div>
    </template>
  </button>
</template>
