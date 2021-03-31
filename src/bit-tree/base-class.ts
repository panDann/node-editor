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
    // parent: BitNode<T> | null = null
    sibling: BitNode<T> | null = null

    status: 'single' | 'link' = 'single'
    data: T | undefined = undefined
    innerText = 'node'
    children?: BitNode<T>[] = []
    insertAt(direction: 'left' | 'right', dt?: T) {
        const n = new BitNode(dt)
        // n.parent = this
        if (this[direction]) {
            //@ts-ignore
            // this[direction].parent = n
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
        warning: '#FF6666'
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
    private _coverPoint = { x: 0, y: 0, h: 0, w: 0 }
    get coverPoint(): Rect {
        return this._coverPoint
    }
    set coverPoint(val: Rect) {
        this._coverPoint = val
        this.drawCover()
    }
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

    init(canvasEL: HTMLCanvasElement) {
        const { width, height, x, y } = canvasEL.getBoundingClientRect()
        this.ctx = canvasEL.getContext('2d')
        _ass(this.root?.data, { w: width, h: height })
    }
    isPointPath(x: number, y: number) {
        return this.ctx?.isPointInPath(x, y)
    }
    getClickPosi(x: number, y: number) {

        _ass(clickPos, { x, y })
        let clickNode = null
        if (this.moveType == MoveType.node) {
            this.traverse(t => {
                // @ts-ignore
                if (this.pointInRect(t.data, x, y)) clickNode = t
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

        if (this.moveType == MoveType.cover)
            this.coverPoint = calcRec(clickPos, { x, y })
        else
            if (this.moveNode) {
                const moveRect = _ass({}, { ...this.moveNode.data, x: x - this.moveOffsetLeft, y: y - this.moveOffsetTop })
                // @ts-ignore
                if (this.checkMoveOverstep(moveRect)) return
                // @ts-ignore
                const childOffsetL = moveRect.x - this.moveNode.data.x
                // @ts-ignore
                const childOffsetT = moveRect.y - this.moveNode.data.y
                _ass(this.moveNode.data, moveRect)
                this.traverse(t => {
                    // @ts-ignore
                    if (t.i == this.moveNode.i) return false
                    // @ts-ignore
                    _ass(t.data, { x: t.data.x + childOffsetL, y: t.data.y + childOffsetT })
                    return false
                }, this.moveNode)
                this.clearFull()
                this.draw()
            }

    }
    checkMoveOverstep({ x, y, w, h }: Rect) {

        // @ts-ignore
        return !rectInRect({ x, y, w, h }, this.root?.data)
    }
    draw() {
        // @ts-ignore
        this.traverse(({ data: { x, y, w, h } }: BitNode<Rect>) => this.drawRect(this.ctx as CanvasRenderingContext2D, { x, y, w, h }))
    }
    clearFull() {
        // @ts-ignore
        this.ctx?.clearRect(0, 0, this.root?.data.w, this.root?.data.h)
    }
    drawCover() {
        this.clearFull()
        this.draw()
        const coverColor = this.isValidCoverRect(this.coverPoint) ? color.primary : color.warning
        this.drawRect(this.ctx as CanvasRenderingContext2D, this.coverPoint, coverColor)
    }
    freezeCover(x: number, y: number) {
        // this.checkMoveOverstep(moveRect)
        if (this.moveType == MoveType.cover)
            if (this.isPointPath(x, y) && this.isValidCoverRect(this.coverPoint)) {
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
            } else {
                this.clearFull()
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

    // 判断coverRect是否与已经存在的节点相交
    isValidCoverRect(target: Rect) {
        let rectangle = [false, false, false, false],
            reverseRect = [false, false, false, false],
            res = false
        // @ts-ignore
        this.traverse(({ data: { x, y, w, h } }: BitNode<Rect>) => {
            if (x === 0 && y === 0) return false
            const { x: tX, y: tY, w: tW, h: tH } = target
            rectangle = [
                this.pointInRect(target, x, y),
                this.pointInRect(target, x + w, y),
                this.pointInRect(target, x + w, y + h),
                this.pointInRect(target, x, y + h),
            ]
            reverseRect = [
                this.pointInRect({ x, y, w, h }, tX, tY),
                this.pointInRect({ x, y, w, h }, tX + tW, tY),
                this.pointInRect({ x, y, w, h }, tX + tW, tY + tH),
                this.pointInRect({ x, y, w, h }, tX, tY + tH),
            ]
            res = (rectangle.some(el => el === false) && rectangle.some(el => el === true))
                || (reverseRect.some(el => el === false) && reverseRect.some(el => el === true))
            // res = tX < x + w && tX + tW > x && tY > y + h && tY + tH < y
            return res
        })
        return !res
    }
    pointInRect({ x, y, w, h }: Rect, pX: number, pY: number,) {
        return pX > x && pX < x + w && pY > y && pY < y + h
    }

    drawRect = (ctx: CanvasRenderingContext2D, { x, y, w, h }: Rect, reColor?: string) => {
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