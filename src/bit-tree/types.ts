

export type Posi = {
  x: number
  y: number
}

export type Rect = Posi & {
  w: number
  h: number
}
// & {
//   left?: string
//   right?: string
//   linkType?: keyof typeof LinkStatus
// }

const LinkStatus = {
  left: 'left',
  right: 'right',
  join: 'join',
}
export type LinkNodeMsg<T extends Rect> = {
  targetNode: BitNode<T>
  destNode: BitNode<T>
  status: keyof typeof LinkStatus
}
export const ActionType = {
  cover: 2,
  node: 0,
  edgePoint: 3,
  none: -1
}
type CommonBitNode<T extends Rect> = BitNode<T> | null

export class BitNode<T extends Rect>  {
  constructor(data?: T) {
    this.data = data
  }
  i = performance.now() + ''
  height = 0
  left: CommonBitNode<T> = null
  right: CommonBitNode<T> = null
  parent: CommonBitNode<T> = null
  status: 'single' | 'link' = 'single'
  data: T | undefined = undefined
  innerText = 'node'
  children?: BitNode<T>[] = []
  insertAt(direction: 'left' | 'right', dt: T) {
    const n = new BitNode(dt)
    n.parent = this
    if (this[direction]) {
      //@ts-ignore
      this[direction].parent = n
      n[direction] = this[direction]
    }
    this[direction] = n
  }
}
