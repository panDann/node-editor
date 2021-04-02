import {
    Posi,
    Rect,
    MoveType
} from './types'

import {
    calcRec,
    pointInRect,
    rectCross,
    rectInRect,
    drawPath,
    drawRect,
    radius,
    color
} from './tool'
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
    // right: BitNode<T> | null = null

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
            // n.height = this['left'].height + 1
        }
        this[direction] = n
        // this.uHeight(this)
    }
    insertAtright(dt: T) {
        const n = new BitNode(dt)
        this.right = n
        // n.parent = this.parent
        // this.uHeight(this)
    }
    // uHeight(bn: BitNode<T>) {
    //     let tem = bn.parent

    //     //@ts-ignore
    //     let curH = Math.max(bn.left?.height, bn.right?.height) + 1
    //     if (bn.height === curH) return
    //     bn.height = curH
    //     while (tem) {
    //         tem.height += 1
    //         tem = tem.parent
    //     }
    // }
}
type BitTreeOption = {

}
const _ass = Object.assign

const clickPos = { x: 0, y: 0 }
export class BitTree<T extends Rect> {

    constructor(root: BitNode<T>) {
        this.root = root
    }
    root: BitNode<T> | null = null
    moveType = 2
    // canvasEL: HTMLCanvasElement | null = null
    coverPoint = { x: 0, y: 0, h: 0, w: 0 }
    moveNode: BitNode<T> | null = null
    moveNodeChildren: BitNode<T>[] = []
    moveOffsetTop = 0
    moveOffsetLeft = 0
    offsetTop = 0
    offsetLeft = 0
    ctx: CanvasRenderingContext2D | null = null
    isEmpty() {
        return this.root === null
    }
    collectRight(n: BitNode<T> | null, S: (BitNode<T> | null)[]) {
        let r = n
        while (r) {
            S.push(r.right)
            r = r.left
        }
    }
    traverse(visit: (target: BitNode<T>) => boolean, tree = this.root): BitNode<T> | number {
        let bitNodeS = [], temNode = null
        bitNodeS.push(tree)
        while (bitNodeS.length) {
            temNode = bitNodeS.pop()
            // @ts-ignore
            if (visit(temNode)) return temNode
            if (temNode?.right) bitNodeS.push(temNode.right)
            if (temNode?.left) bitNodeS.push(temNode.left)
        }
        return -1
    }
    insertLeftAt(origin: BitNode<T>, target: T) {
        origin.insertAt('left', target)
    }
    insertRightAt(origin: BitNode<T>, target: T) {
        origin.insertAt('right', target)
    }
    init(canvasEL: HTMLCanvasElement) {
        const { width, height, x, y } = canvasEL.getBoundingClientRect()
        this.offsetLeft = x
        this.offsetTop = y
        this.ctx = canvasEL.getContext('2d')
        _ass(this.root?.data, { w: width, h: height, })
    }
    isRoot(t: BitNode<T>) {
        return t.parent == null
    }
    isPointInCanvas(x: number, y: number) {
        // @ts-ignore
        return pointInRect(this.root?.data, x, y)
    }
    getClickPosi(x: number, y: number, whichBtn: number) {
        // @ts-ignore
        x = x - this.offsetLeft
        // @ts-ignore
        y = y - this.offsetTop

        _ass(clickPos, { x, y })
        this.moveType = whichBtn
        // @ts-ignore
        let clickNode = null,
            // @ts-ignore
            rectArea = this.root.data.w * this.root.data?.h
        if (this.moveType == MoveType.node) {
            this.traverse(t => {
                // @ts-ignore
                let temArea = t.data.w * t.data?.h
                // @ts-ignore
                if (pointInRect(t.data, x, y) && rectArea >= temArea) {
                    rectArea = temArea
                    clickNode = t
                }
                return false
            })
            // @ts-ignore
            if (clickNode && clickNode.i !== this.root.i) {
                this.moveNode = clickNode
                this.traverse((t) => {
                    // @ts-ignore
                    if (rectInRect(t.data, clickNode?.data))
                        this.moveNodeChildren.push(t)
                    return false
                })
                // @ts-ignore
                this.moveOffsetLeft = x - clickNode.data.x
                // @ts-ignore
                this.moveOffsetTop = y - clickNode.data.y
            }
        }
    }
    // 获取移动坐标
    getMovePosi(x: number, y: number) {
        // @ts-ignore
        x = x - this.offsetLeft
        // @ts-ignore
        y = y - this.offsetTop
        if (this.moveType == MoveType.cover) {
            this.coverPoint = calcRec(clickPos, { x, y })
            this.drawCover()
        } else
            if (this.moveNode) {
                // @ts-ignore
                this.coverPoint = _ass({}, { ...this.moveNode.data, x: x - this.moveOffsetLeft, y: y - this.moveOffsetTop })
                this.drawDragCover()
            }
    }
    checkMoveOverstep({ x, y, w, h }: Rect) {
        // @ts-ignore
        return !rectInRect({ x, y, w, h }, this.root?.data)
    }
    draw(treeRoot = this.root, clearRect = this.root?.data) {
        this.clearRect(clearRect)
        // @ts-ignore
        this.traverse(({ data: { x, y, w, h }, parent }: BitNode<Rect>) => {
            if (parent == null) return false
            drawPath(this.ctx as CanvasRenderingContext2D, { x, y, w, h })
        }, treeRoot)
    }
    // @ts-ignore
    clearRect({ x, y, h, w } = this.root?.data) {
        this.ctx?.clearRect(x, y, w, h)
    }
    drawCover() {
        this.draw()
        drawPath(this.ctx as CanvasRenderingContext2D, this.coverPoint, this.isValidCoverRect(this.coverPoint) ? color.primary : color.warning)
    }
    drawDragCover() {
        // window.requestAnimationFrame(this.drawDragCover)
        this.draw()
        drawRect(this.ctx as CanvasRenderingContext2D, this.coverPoint, this.isValidDrag(this.coverPoint) ? color.dragPrimary : color.dragWarning)
    }
    freezeCover(x: number, y: number) {
        if (this.coverPoint.x == x && this.coverPoint.y == y) return //防止无意义点击

        if (this.isPointInCanvas(x, y)) {
            if (this.moveType == MoveType.cover && this.isValidCoverRect(this.coverPoint)) {
                // @ts-ignore
                this.insertRightAt(this.root, { ...this.coverPoint })
                return
            }
            if (this.moveType == MoveType.node && this.moveNode !== null && this.isValidDrag(this.coverPoint)) {
                for (const el of this.moveNodeChildren) {
                    // @ts-ignore
                    const oLeft = el.data.x - this.moveNode?.data.x
                    // @ts-ignore
                    const oTop = el.data.y - this.moveNode?.data.y
                    _ass(el.data, { x: this.coverPoint.x + oLeft, y: this.coverPoint.y + oTop })
                }
                _ass(this.moveNode.data, { ...this.coverPoint })
            }
        }
        this.moveNode = null
        this.moveNodeChildren = []
        this.draw()
    }
    // 删除某个节点匹配到的子树（只删除当前节点与左侧子树）
    deleteSubTree(i: string): (BitNode<T> | number) {
        let sub: any = -1
        this.traverse(t => {
            return false
        })
        return sub
    }
    isValidDrag(target: Rect) {
        if (this.checkMoveOverstep(target)) return false
        let res = true
        this.traverse((t) => {
            // @ts-ignore
            if (t.i == this.moveNode.i) return false//剔除拖动时与自身相交
            // @ts-ignore
            if (this.moveNodeChildren.includes(t)) return false//剔除拖动时与自身相交
            // @ts-ignore
            if (rectCross(t?.data, this.coverPoint, radius)) {
                res = false
                return true
            }
            return false
        })
        return res
    }
    // 判断coverRect是否与已经存在的节点相交
    isValidCoverRect(target: Rect) {
        let res = false
        // @ts-ignore
        this.traverse(({ i, data: { x, y, w, h } }: BitNode<Rect>) => {
            // @ts-ignore
            if (i == this.root.i) return false
            res = rectCross(target, { x, y, w, h })
            return res
        })
        return !res
    }
}
