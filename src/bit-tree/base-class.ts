import {
    Posi,
    Rect,
    ActionType
} from './types'

import {
    calcRec,
    pointInRect,
    pointInCircle,
    rectCross,
    rectInRect,
    drawPath,
    drawRect,
    drawCircle,
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
type BitTreeOption = {

}
const _ass = Object.assign

const clickPos = { x: 0, y: 0 }
export class BitTree<T extends Rect> {
    constructor(root: BitNode<T>) {
        this.root = root
    }
    root: BitNode<T> | null = null
    actionType = 2
    // canvasEL: HTMLCanvasElement | null = null
    coverPoint = { x: 0, y: 0, h: 0, w: 0 }
    moveNode: BitNode<T> | null = null
    moveNodeChildren: BitNode<T>[] = []
    moveOffsetTop = 0
    moveOffsetLeft = 0
    offsetTop = 0//画布顶点偏移量
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
    setAction(action: keyof typeof ActionType) {
        this.actionType = ActionType[action]
    }
    resetAction() {
        this.actionType = ActionType.none
    }
    // fixOffset() {

    // }
    getClickPosi(x: number, y: number, whichBtn: number) {
        x = x - this.offsetLeft
        y = y - this.offsetTop
        _ass(clickPos, { x, y })
        switch (whichBtn) {
            case ActionType.node:
                let clickNode: any = null,
                    isClickEdgePoint: Posi = { x: -1, y: -1 },
                    // @ts-ignore
                    rectArea = this.root.data.w * this.root.data?.h

                // if clicking edge's point

                this.traverse(t => {

                    // @ts-ignore
                    const { x: tX, y: tY, w, h } = t.data
                    if (pointInCircle({ x, y }, { x: tX, y: tY + h / 2 })) {
                        _ass(isClickEdgePoint, { x: tX, y: tY + h / 2 })
                        return true
                    }
                    if (pointInCircle({ x, y }, { x: tX + w, y: tY + h / 2 })) {
                        _ass(isClickEdgePoint, { x: tX + w, y: tY + h / 2 })
                        return true
                    }

                    // @ts-ignore
                    let temArea = w * h
                    // @ts-ignore
                    if (pointInRect(t.data, x, y) && rectArea >= temArea) {
                        rectArea = temArea
                        clickNode = t
                    }
                    return false
                })

                console.log(isClickEdgePoint);

                if (isClickEdgePoint.x !== -1) {
                    this.setAction('edgePoint')
                    // @ts-ignore
                    drawCircle(this.ctx, isClickEdgePoint, radius, color.warning)
                    return
                }
                // @ts-ignore
                if (clickNode !== null && clickNode.i !== this.root.i) {
                    this.moveNode = clickNode
                    this.setAction('node')
                    this.traverse((t) => {
                        // @ts-ignore
                        if (rectInRect(t.data, clickNode.data))
                            this.moveNodeChildren.push(t)
                        return false
                    })
                    this.moveOffsetLeft = x - clickNode.data.x
                    this.moveOffsetTop = y - clickNode.data.y
                }
                break;
            case ActionType.cover:
                this.setAction('cover')
                break;
            default:
                this.resetAction()
                break;
        }
    }
    // 获取移动坐标
    getMovePosi(x: number, y: number) {
        // @ts-ignore
        x = x - this.offsetLeft
        // @ts-ignore
        y = y - this.offsetTop
        if (this.actionType == ActionType.cover) {
            this.coverPoint = calcRec(clickPos, { x, y })
            this.drawCover()
        }
        if (this.actionType == ActionType.node)
            if (this.moveNode) {
                const { w, h } = this.moveNode.data as Rect
                this.coverPoint = _ass({}, { w, h, x: x - this.moveOffsetLeft, y: y - this.moveOffsetTop })
                this.drawDragCover()
            }
    }
    freezeCover(x: number, y: number) {
        if (this.coverPoint.x == x && this.coverPoint.y == y) return //防止无意义点击
        if (!this.isPointInCanvas(x, y)) return

        switch (this.actionType) {
            case ActionType.cover:
                // @ts-ignore
                this.isValidCoverRect(this.coverPoint) && this.insertRightAt(this.root, { ...this.coverPoint })
                this.reset()
                break;
            case ActionType.node:

                if (this.isValidDrag(this.coverPoint)) {
                    for (const el of this.moveNodeChildren) {
                        // @ts-ignore
                        const oLeft = el.data.x - this.moveNode?.data.x
                        // @ts-ignore
                        const oTop = el.data.y - this.moveNode?.data.y
                        _ass(el.data, { x: this.coverPoint.x + oLeft, y: this.coverPoint.y + oTop })
                    }
                    // @ts-ignore
                    _ass(this.moveNode.data, { ...this.coverPoint })
                }
                this.reset()
                break;
            case ActionType.edgePoint:
                break
            default:
                break;
        }

    }
    reset() {
        this.moveNode = null
        this.moveNodeChildren = []
        this.resetAction()
        this.draw()
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
