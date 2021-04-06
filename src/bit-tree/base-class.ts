import {
    Posi,
    Rect,
    LinkNodeMsg,
    ActionType,
    BitNode
} from './types'

import {
    calcRec, swap,
    pointInRect,
    pointInCircle,
    rectCross,
    rectInRect,
    drawPath, drawLink,
    drawRect,
    drawCircle,
    radius,
    color
} from './tool'
import { time } from 'echarts/core'

let linkNodeStack: BitNode<any>[] = []
const _ass = Object.assign
const clickPos = { x: 0, y: 0 }
export class BitTree<T extends Rect> {
    constructor(root: BitNode<T>) {
        this.root = root
    }
    root: BitNode<T> | null = null
    actionType = -1
    // canvasEL: HTMLCanvasElement | null = null
    coverPoint = { x: 0, y: 0, h: 0, w: 0 }
    move = {
        moveNode: {} as BitNode<T> | null,
        moveNodeChildren: [] as BitNode<T>[],
        moveOffsetTop: 0,
        moveOffsetLeft: 0,
    }

    linkNodeMsg: LinkNodeMsg<T>[] = []
    offsetTop = 0//画布顶点偏移量
    offsetLeft = 0
    ctx: CanvasRenderingContext2D | null = null
    isEmpty() {
        return this.root === null
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
    fixOffset({ x, y }: Posi) {
        return {
            x: x - this.offsetLeft,
            y: y - this.offsetTop
        }
    }
    getClickPosi(posi: Posi, whichBtn: number) {
        const { x, y } = this.fixOffset(posi)
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
                        linkNodeStack.push(t)
                        return true
                    }
                    if (pointInCircle({ x, y }, { x: tX + w, y: tY + h / 2 })) {
                        _ass(isClickEdgePoint, { x: tX + w, y: tY + h / 2 })
                        linkNodeStack.push(t)
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

                if (isClickEdgePoint.x !== -1) {
                    this.setAction('edgePoint')
                    drawCircle(this.ctx as CanvasRenderingContext2D, isClickEdgePoint, radius, color.warning)
                    return
                }
                // @ts-ignore
                if (clickNode !== null && clickNode.i !== this.root.i) {
                    this.move.moveNode = clickNode
                    this.setAction('node')
                    this.traverse((t) => {
                        // @ts-ignore
                        rectInRect(t.data, clickNode.data) && this.move.moveNodeChildren.push(t)
                        return false
                    })
                    this.move.moveOffsetLeft = x - clickNode.data.x
                    this.move.moveOffsetTop = y - clickNode.data.y
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
    getMovePosi(posi: Posi,) {
        const { x, y } = this.fixOffset(posi)
        if (this.actionType == ActionType.cover) {
            this.coverPoint = calcRec(clickPos, { x, y })
            this.drawCover()
        }
        if (this.actionType == ActionType.node)
            if (this.move.moveNode) {
                const { w, h } = this.move.moveNode.data as Rect
                this.coverPoint = _ass({}, { w, h, x: x - this.move.moveOffsetLeft, y: y - this.move.moveOffsetTop })
                this.drawDragCover()
            }
    }
    freezeCover(posi: Posi,) {
        const { x, y } = this.fixOffset(posi)
        if (!this.isPointInCanvas(x, y)) return

        switch (this.actionType) {
            case ActionType.cover:
                if (clickPos.x == x && clickPos.y == y) return //防止无意义点击
                // @ts-ignore
                this.isValidCoverRect(this.coverPoint) && this.insertRightAt(this.root, { ...this.coverPoint })
                this.reset()
                break;
            case ActionType.node:
                if (clickPos.x == x && clickPos.y == y) return //防止无意义点击

                if (this.isValidDrag(this.coverPoint)) {
                    for (const el of this.move.moveNodeChildren) {
                        // @ts-ignore
                        const oLeft = el.data.x - this.move.moveNode.data.x
                        // @ts-ignore
                        const oTop = el.data.y - this.move.moveNode.data.y
                        _ass(el.data, { x: this.coverPoint.x + oLeft, y: this.coverPoint.y + oTop })
                    }
                    // @ts-ignore
                    _ass(this.move.moveNode.data, { ...this.coverPoint })
                }
                this.reset()
                break;
            case ActionType.edgePoint:
                if (linkNodeStack.length === 2) {
                    const [targetNode, destNode] = linkNodeStack
                    if (targetNode.data.x > destNode.data.x) {
                        swap(targetNode, destNode)
                    }
                    this.linkNodeMsg.push({
                        targetNode,
                        destNode,
                        status: 'left'
                    })
                    this.reset()
                }
                break
            default:
                break;
        }
    }
    reset() {
        this.move.moveNode = null
        this.move.moveNodeChildren = []
        linkNodeStack = []
        this.resetAction()
        this.draw()
    }
    checkMoveOverstep({ x, y, w, h }: Rect) {
        // @ts-ignore
        return !rectInRect({ x, y, w, h }, this.root?.data)
    }
    draw() {
        this.clearRect()
        const linkNodeArr = []
        // @ts-ignore
        this.root?.right && this.traverse(({ data: { x, y, w, h }, parent }: BitNode<Rect>) => {
            drawPath(this.ctx as CanvasRenderingContext2D, { x, y, w, h })
        }, this.root?.right)
        this.drawLinkMsg()
    }
    drawLinkMsg() {
        this.linkNodeMsg.forEach(t => {
            // @ts-ignore
            const { targetNode: { data: { x: tX, y: tY, w: tW, h: tH } }, destNode: { data: { x: dX, y: dY, w: dW, h: dH } }, status } = t
            const moveTo = { x: tX + tW + radius, y: tY + tH / 2 }
            const final = { x: dX - radius, y: dY + dH / 2 }
            const offset = Math.min(100, Math.abs(moveTo.y - final.y))
            // @ts-ignore
            drawLink(this.ctx, {
                moveTo,
                m1: { x: moveTo.x + offset, y: moveTo.y },
                m2: { x: final.x - offset, y: final.y },
                final,
            }, color.primary)
        })
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
    isValidDrag(target: Rect) {
        if (this.checkMoveOverstep(target)) return false
        let res = true
        this.traverse((t) => {
            // @ts-ignore
            if (t.i == this.move.moveNode.i) return false//剔除拖动时与自身相交
            if (this.move.moveNodeChildren.includes(t)) return false//剔除拖动时与自身相交
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
