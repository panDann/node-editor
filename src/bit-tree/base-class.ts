import {
    Posi,
    Rect,
    MoveType
} from './types'
export class BitNode<T extends Rect>  {
    constructor(data?: T) {
        this.data = data
    }
    i = Date.now() + ''
    height = 0
    left: BitNode<T> | null = null
    right: BitNode<T> | null = null
    parent: BitNode<T> | null = null
    sibling: BitNode<T> | null = null

    status: 'single' | 'link' = 'single'
    data: T | undefined = undefined
    innerText = 'node'
    children?: BitNode<T>[] = []
    insertAt(direction: 'left' | 'right', dt?: T) {
        const n = new BitNode(dt)
        n.parent = this
        if (this[direction]) {
            //@ts-ignore
            this[direction].parent = n
            n[direction] = this[direction]
            //@ts-ignore
            n.height = this[direction].height + 1
        }
        this[direction] = n
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
const minGap = 10,
    color = {
        primary: '#99CC66',
        warning: '#FF6666',
        dragPrimary: '#99cc6666',
        dragWarning: '#d60f0f5c'
    },
    radius = 4,
    fontSize = 20,
    lineWidth = 2
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
    moveOffsetTop = 0
    moveOffsetLeft = 0
    ctx: CanvasRenderingContext2D | null = null
    isEmpty() {
        return this.root === null
    }
    size() {

    }
    height() {
        if (this.root)
            //@ts-ignore
            return this.root.height
        return -1
    }
    traverse(visit: (target: BitNode<T>) => boolean, tree = this.root): BitNode<T> | number {
        let bitNodeS = [], temNode = null
        bitNodeS.push(tree)
        while (bitNodeS.length) {
            temNode = bitNodeS.pop()
            // @ts-ignore
            if (visit(temNode)) return temNode
            if (temNode?.sibling) bitNodeS.push(temNode.sibling)
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
    insertSiblingAt(origin: BitNode<T>, target: T) {
        const n = new BitNode(target)
        n.sibling = origin.sibling
        origin.sibling = n
    }
    isRoot() {
        return
    }
    init(canvasEL: HTMLCanvasElement) {
        const { width, height, x, y } = canvasEL.getBoundingClientRect()
        this.ctx = canvasEL.getContext('2d')
        _ass(this.root?.data, { w: width, h: height })
    }
    isPointInCanvas(x: number, y: number) {
        // @ts-ignore
        return pointInRect(this.root?.data, x, y)
    }
    getClickPosi(x: number, y: number) {

        _ass(clickPos, { x, y })
        let clickNode = null
        if (this.moveType == MoveType.node) {
            this.traverse(t => {
                // @ts-ignore
                if (pointInRect(t.data, x, y)) clickNode = t
                return false
            })
            // @ts-ignore
            if (clickNode && clickNode.data.x != 0 && clickNode.data.y != 0) {
                this.moveNode = clickNode
                // @ts-ignore
                this.moveOffsetLeft = x - clickNode.data.x
                // @ts-ignore
                this.moveOffsetTop = y - clickNode.data.y
            }
        }

    }
    // 获取移动坐标
    getMovePosi(x: number, y: number) {

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
    draw() {
        this.clearFull()
        // @ts-ignore
        this.traverse(({ data: { x, y, w, h } }: BitNode<Rect>) => drawPath(this.ctx as CanvasRenderingContext2D, { x, y, w, h }))
    }
    clearFull() {
        // @ts-ignore
        this.ctx?.clearRect(0, 0, this.root?.data.w, this.root?.data.h)
    }
    drawCover() {
        this.draw()
        drawPath(this.ctx as CanvasRenderingContext2D, this.coverPoint, this.isValidCoverRect(this.coverPoint) ? color.primary : color.warning)
    }
    drawDragCover() {
        this.draw()
        drawRect(this.ctx as CanvasRenderingContext2D, this.coverPoint, this.isValidDrag(this.coverPoint) ? color.dragPrimary : color.dragWarning)
    }
    freezeCover(x: number, y: number) {
        // this.checkMoveOverstep(moveRect)
        if (this.isPointInCanvas(x, y)) {
            if (this.moveType == MoveType.cover && this.isValidCoverRect(this.coverPoint)) {
                let coverPar: BitNode<T> | null = null,
                    coverChildren: BitNode<T>[] = []
                // @ts-ignore
                this.traverse((t) => {
                    // @ts-ignore
                    if (rectInRect(t.data, this.coverPoint))
                        coverChildren.push(t)
                    // @ts-ignore
                    if (rectInRect(this.coverPoint, t.data))
                        coverPar = t
                    return false
                })
                const coverNode = new BitNode({ ...this.coverPoint })
                // 处理包含了子节点情况
                coverChildren.forEach((el, index) => {
                    let tem = this.deleteSubTree(el.i)
                    if (tem !== -1) {
                        // @ts-ignore
                        nodeShouldPlace(coverNode, tem)
                    }
                })
                // @ts-ignore
                nodeShouldPlace(coverPar, coverNode)
                return
            }

            if (this.moveType == MoveType.node && this.moveNode !== null && this.isValidDrag(this.coverPoint)) {

                //    更新子节点位置
                this.traverse(t => {
                    // @ts-ignore
                    if (t.i == this.moveNode?.i) return false
                    // @ts-ignore
                    const oLeft = t.data.x - this.moveNode?.data.x
                    // @ts-ignore
                    const oTop = t.data.y - this.moveNode?.data.y
                    _ass(t.data, { x: this.coverPoint.x + oLeft, y: this.coverPoint.y + oTop })
                    return false
                }, this.moveNode)

                // 更新拖动之后的节点位置
                let coverPar: BitNode<T> | null = null
                // @ts-ignore 查找直系父元素
                this.traverse((t) => {
                    // @ts-ignore
                    if (rectInRect(this.coverPoint, t.data))
                        coverPar = t
                    return false
                })
                // @ts-ignore
                _ass(this.moveNode.data, { ...this.coverPoint })
            }
            // 移除当前移动节点
            this.moveNode = null
            this.draw()
        }


    }

    // 删除某个节点匹配到的子树（只删除纵向）
    deleteSubTree(i: string): (BitNode<T> | number) {
        let sub: any = -1
        this.traverse(t => {
            if (t.left !== null && t.left.i == i) {
                sub = t.left
                t.left = null
                return true
            }
            if (t.right !== null && t.right.i == i) {
                sub = t.right
                if (t.right.sibling) {
                    t.right = t.right.sibling
                } else {
                    t.right = null
                }
                return true
            }
            if (t.sibling !== null && t.sibling.i == i) {
                sub = t.sibling
                t.sibling = t.sibling.sibling
                return true
            }
            return false
        })
        return sub
    }
    isValidDrag(target: Rect) {
        if (this.checkMoveOverstep(target)) return false
        let bitNodeS = [], temNode = null
        bitNodeS.push(this.root)
        while (bitNodeS.length) {
            temNode = bitNodeS.pop()
            // // @ts-ignore
            if (temNode?.sibling) bitNodeS.push(temNode.sibling)
            // @ts-ignore
            if (temNode.i == this.moveNode.i)//剔除拖动时与自身相交
                continue
            else {
                // @ts-ignore
                if (rectCross(temNode?.data, this.coverPoint)) return false
            }

            if (temNode?.right) bitNodeS.push(temNode.right)
            if (temNode?.left) bitNodeS.push(temNode.left)
        }
        return true
    }
    // 判断coverRect是否与已经存在的节点相交
    isValidCoverRect(target: Rect) {
        let res = false
        // @ts-ignore
        this.traverse(({ data: { x, y, w, h } }: BitNode<Rect>) => {
            if (x === 0 && y === 0) return false
            res = rectCross(target, { x, y, w, h })
            // res = tX < x + w && tX + tW > x && tY > y + h && tY + tH < y
            return rectCross(target, { x, y, w, h })
        })
        return !res
    }


}
const pointInRect = ({ x, y, w, h }: Rect, pX: number, pY: number,) => {
    return pX > x && pX < x + w && pY > y && pY < y + h
}
const calcRec = (start: Posi, end: Posi): Rect => {
    const h = Math.abs(start.y - end.y)
    const w = Math.abs(start.x - end.x)
    if (end.x < start.x && end.y < start.y) return _ass(end, { h, w })
    if (end.x > start.x && end.y > start.y) return _ass(start, { h, w })
    if (end.x < start.x && end.y > start.y) return { h, w, x: end.x, y: start.y }
    if (end.x > start.x && end.y < start.y) return { h, w, x: start.x, y: end.y }
    return { x: 0, y: 0, w: 0, h: 0 }
}
const rectInRect = ({ x, y, w, h }: Rect, { x: tX, y: tY, w: tW, h: tH }: Rect,) => {
    return x > tX && x + w < tX + tW && y > tY && y + h < tY + tH
}

const rectCross = ({ x, y, w, h }: Rect, target: Rect) => {
    let rectangle = [false, false, false, false],
        reverseRect = [false, false, false, false]
    const { x: tX, y: tY, w: tW, h: tH } = target
    rectangle = [
        pointInRect(target, x, y),
        pointInRect(target, x + w, y),
        pointInRect(target, x + w, y + h),
        pointInRect(target, x, y + h),
    ]
    reverseRect = [
        pointInRect({ x, y, w, h }, tX, tY),
        pointInRect({ x, y, w, h }, tX + tW, tY),
        pointInRect({ x, y, w, h }, tX + tW, tY + tH),
        pointInRect({ x, y, w, h }, tX, tY + tH),
    ]
    return (rectangle.some(el => el === false) && rectangle.some(el => el === true))
        || (reverseRect.some(el => el === false) && reverseRect.some(el => el === true))
}

const nodeShouldPlace = (parent: BitNode<any>, target: BitNode<any>) => {
    if (!parent.left) {
        parent.left = target
        return
    }
    if (!parent.right) {
        parent.right = target
        return
    }
    target.sibling = parent.right.sibling
    parent.right.sibling = target
}

const drawPath = (ctx: CanvasRenderingContext2D, { x, y, w, h }: Rect, reColor?: string) => {
    ctx.beginPath()
    ctx.moveTo(x, y)
    // ctx.arc(x+radius/2,y+radius/2,radius/2,0,Math.PI)
    ctx.lineTo(x + w, y)
    ctx.lineTo(x + w, y + h)
    ctx.lineTo(x, y + h)
    ctx.closePath()
    ctx.strokeStyle = reColor || color.primary
    ctx.lineWidth = lineWidth
    ctx.lineJoin = 'round'
    ctx.stroke()
    return false
}
const drawRect = (ctx: CanvasRenderingContext2D, { x, y, w, h }: Rect, reColor?: string) => {
    ctx.fillStyle = reColor || color.primary
    ctx.fillRect(x, y, w, h)

}