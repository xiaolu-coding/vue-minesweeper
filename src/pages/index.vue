<script setup lang="ts">
// import { isDev, toggleDev } from '~/composables'
import { GamePlay } from '~/composables/logic'
import type { diffcult } from '~/composables/logic'

const play = new GamePlay(12, 12, 12)
useStorage('vue-minesweeper', play.state)
const state = $computed(() => play.board)

const now = $(useNow())
const timerMS = $computed(() => Math.round(((play.state.value.endMS || +now) - play.state.value.startMS) / 1000))
const mineRest = $computed(() => {
  if (!play.state.value.mineGenerated)
    return play.mines
  return play.blocks.reduce((a, b) => a + (b.mine ? 1 : 0) - (b.flagged ? 1 : 0), 0)
})

let nowDiffcult: diffcult
function newGame(difficulty: diffcult) {
  switch (difficulty || nowDiffcult) {
    case 'easy':
      nowDiffcult = 'easy'
      play.reset(9, 9, 10, nowDiffcult)
      break
    case 'medium':
      nowDiffcult = 'medium'
      play.reset(16, 16, 40, nowDiffcult)
      break
    case 'hard':
      nowDiffcult = 'hard'
      play.reset(30, 16, 99, nowDiffcult)
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
      <button btn @click="newGame(nowDiffcult)">
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
    <div flex="~ gap-10" justify-center>
      <div font-mono text-2xl flex="~ gap-1" items-center>
        <div i-carbon-timer />
        {{ timerMS }}
      </div>
      <div font-mono text-2xl flex="~ gap-1" items-center>
        <div i-mdi-mine />
        {{ mineRest }}
      </div>
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
        <MineBlock
          v-for="(block, x) in row" :key="x" :block="block"
          @click="play.onClick(block)"
          @dblclick="play.autoExpand(block)"
          @contextmenu.prevent="play.onRightClick(block)"
        />
      </div>
    </div>

    <!-- <div flex="~ gap-1" justify-center>
      <button btn @click="toggleDev()">
        {{ isDev ? 'DEV' : 'NORMAL' }}
      </button>
    </div> -->
  </div>
  <Confetti :passed="play.state.value.status === 'won'" />
</template>
