<script setup lang="ts">
import { isDev, toggleDev } from '~/composables'
import { GamePlay } from '~/composables/logic'

const play = new GamePlay(12, 12, 12)
useStorage('vue-minesweeper', play.state)
const state = computed(() => play.board)

const mineCount = computed(() => {
  return play.blocks.reduce((a, b) => a + (b.mine ? 1 : 0), 0)
})

function newGame(difficulty: 'easy' | 'medium' | 'hard') {
  switch (difficulty) {
    case 'easy':
      play.reset(9, 9, 10)
      break
    case 'medium':
      play.reset(16, 16, 40)
      break
    case 'hard':
      play.reset(30, 16, 99)
      break
  }
}

watchEffect(() => {
  play.checkGameState()
})
</script>

<template>
  <div>
    Minesweeper
    <div flex="~ gap1" justify-center p4>
      <button btn @click="play.reset()">
        NEW GAME
      </button>
      <button btn @click="newGame('easy')">
        EASY
      </button>
      <button btn @click="newGame('medium')">
        MEDIUM
      </button>
      <button btn @click="newGame('hard')">
        HARD
      </button>
    </div>
    <div p5 w-full overflow-auto>
      <div
        v-for="(row, y) in state"
        :key="y"
        flex="~"
        items-center
        justify-center
        w-max
        ma
      >
        <MineBlock v-for="(block, x) in row" :key="x" :block="block" @click="play.onClick(block)" @contextmenu.prevent="play.onRightClick(block)" />
      </div>
    </div>

    <div>
      {{ mineCount }}
    </div>

    <div flex="~ gap-1" justify-center>
      <button btn @click="toggleDev()">
        {{ isDev ? 'DEV' : 'NORMAL' }}
      </button>
    </div>
  </div>
  <Confetti :passed="play.state.value.gameState === 'won'" />
</template>
