
// declare BitTreeCom {

// }

export type Posi = {
  x: number
  y: number
}

export type Rect = Posi & {
  w: number
  h: number
}
export const ActionType = {
  cover: 2,
  node: 0,
  none: -1
}
