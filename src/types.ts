// 格子状态
export interface BlockState {
  x: number
  y: number
  revealed: boolean // 是否翻开
  mine?: boolean // 是否是炸弹
  flagged?: boolean
  adjacentMines: number // 周围炸弹数量
}
