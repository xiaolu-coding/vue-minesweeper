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

export class GamePlay {
  state = ref<BlockState[][]>([])
  mineGenerated = false
  constructor(public width: number, public height: number) {
    this.reset()
  }

  // 重置
  reset() {
    this.mineGenerated = false
    this.state.value = Array.from({ length: this.height }, (_, y) =>
      Array.from(
        { length: this.width },
        (_, x): BlockState => ({ x, y, adjacentMines: 0, revealed: false })))
  }

  generateMines(state: BlockState[][], initial: BlockState) {
    for (const row of state) {
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

      return this.state.value[y2][x2]
    }).filter(Boolean) as BlockState[]
  }

  onRightClick(block: BlockState) {
  // 如果已经打开了，没必要插旗子
    if (block.revealed)
      return
    block.flagged = !block.flagged
    this.checkGameState()
  }

  onClick(block: BlockState) {
    if (!this.mineGenerated) {
      this.generateMines(this.state.value, block)
      this.mineGenerated = true
    }
    block.revealed = true
    if (block.mine)
      // eslint-disable-next-line no-alert
      alert('booooooooooom!!!')

    this.expendZero(block)
    this.checkGameState()
  }

  checkGameState() {
    if (!this.mineGenerated) // 如果没有生成炸弹
      return
    const blocks = this.state.value.flat()

    if (blocks.every(block => block.revealed || block.flagged)) {
      if (blocks.every(block => block.flagged && !block.mine))
        // eslint-disable-next-line no-alert
        alert('you cheat!')
      else
        // eslint-disable-next-line no-alert
        alert('you win!')
    }
  }
}
