import type { Ref } from 'vue'
import type { BlockState } from '~/types'

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

interface GameState {
  board: BlockState[][]
  mineGenerated: boolean
  gameState: 'play' | 'won' | 'lose'
}

export class GamePlay {
  state = ref() as Ref<GameState>
  mineGenerated = false
  gameState = ref<'play' | 'won' | 'lose'>('play')
  constructor(public width: number, public height: number, public mines: number) {
    this.reset()
  }

  get board() {
    return this.state.value?.board
  }

  get blocks() {
    return this.state.value?.board.flat()
  }

  // 重置
  reset(width = this.width, height = this.height, mines = this.mines) {
    this.width = width
    this.height = height
    this.mines = mines
    this.state.value = {
      mineGenerated: false,
      gameState: 'play',
      board: Array.from({ length: this.height }, (_, y) =>
        Array.from(
          { length: this.width },
          (_, x): BlockState => ({ x, y, adjacentMines: 0, revealed: false }))),
    }
  }

  random(min: number, max: number) {
    return Math.random() * (max - min) + min
  }

  randomInt(min: number, max: number) {
    return Math.round(this.random(min, max))
  }

  generateMines(state: BlockState[][], initial: BlockState) {
    const placeRandom = () => {
      const x = this.randomInt(0, this.width - 1)
      const y = this.randomInt(0, this.height - 1)
      const block = state[y][x]
      // 点下去的周围不会有炸弹
      if (Math.abs(initial.x - block.x) <= 1)
        return false
      if (Math.abs(initial.y - block.y) <= 1)
        return false
      if (block.mine)
        return false
      block.mine = true
      return true
    }
    Array.from({ length: this.mines }, () => null)
      .forEach(() => {
        let placed = false
        while (!placed) {
          // 如果周围有炸弹，或者这个位置已经生成了炸弹，那么再次执行
          placed = placeRandom()
        }
      })
    this.updateNumbers(state)
  }

  // 计算周围有几个炸弹
  updateNumbers(state: BlockState[][]) {
    state.forEach((raw) => {
      raw.forEach((block) => {
        if (block.mine)
          return

        this.getSiblings(block)
          .forEach((b) => {
            if (b.mine)
              block.adjacentMines += 1
          })
      })
    })
  }

  // 当遇到0的时候把旁边炸开
  expendZero(block: BlockState) {
  // 如果周围炸弹数不是0 或者已经被翻开，就不管
    if (block.adjacentMines)
      return
    // 如果周围炸弹数量是0 递归去炸
    this.getSiblings(block).forEach((s) => {
    // 如果没翻开，就去翻开，然后去炸开旁边的为0的
      if (!s.revealed) {
        s.revealed = true
        this.expendZero(s)
      }
    })
  }

  // 取周围的，得到炸弹数量
  getSiblings(block: BlockState) {
    return directions.map(([dx, dy]) => {
      const x2 = block.x + dx
      const y2 = block.y + dy
      // 如果超出边界
      if (x2 < 0 || x2 >= this.width || y2 < 0 || y2 >= this.height)
        return undefined

      return this.board[y2][x2]
    }).filter(Boolean) as BlockState[]
  }

  onRightClick(block: BlockState) {
    if (this.state.value.gameState !== 'play')
      return
    // 如果已经打开了，没必要插旗子
    if (block.revealed)
      return
    block.flagged = !block.flagged
    // this.checkGameState()
  }

  onClick(block: BlockState) {
    if (this.state.value.gameState !== 'play')
      return
    if (!this.state.value.mineGenerated) {
      this.generateMines(this.board, block)
      this.state.value.mineGenerated = true
    }
    block.revealed = true
    if (block.mine) {
      this.state.value.gameState = 'lose'
      this.showAllMines()
      return
    }

    this.expendZero(block)
    // this.checkGameState()
  }

  checkGameState() {
    if (!this.state.value.mineGenerated) // 如果没有生成炸弹
      return
    const blocks = this.board.flat()

    if (blocks.every(block => block.revealed || block.flagged)) {
      if (blocks.some(block => block.flagged && !block.mine)) {
        this.state.value.gameState = 'lose'
        this.showAllMines()
      }
      else {
        this.state.value.gameState = 'won'
      }
    }
  }

  // 显示所有炸弹
  showAllMines() {
    this.board.flat().forEach((block) => {
      if (block.mine)
        block.revealed = true
    })
  }
}
