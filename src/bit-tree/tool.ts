
import { Rect, Posi } from './types'
import { BitNode } from './base-class'
const minGap = 5,
    color = {
        primary: '#99CC66',
        warning: '#FF6666',
        dragPrimary: '#99cc6666',
        dragWarning: '#d60f0f5c'
    },
    radius = 6,
    fontSize = 20,
    lineWidth = 2
export const _ass = Object.assign

export const pointInRect = ({ x, y, w, h }: Rect, pX: number, pY: number,) => {
    return pX > x && pX < x + w && pY > y && pY < y + h
}
export const calcRec = (start: Posi, end: Posi): Rect => {
    const h = Math.abs(start.y - end.y)
    const w = Math.abs(start.x - end.x)
    if (end.x < start.x && end.y < start.y) return _ass(end, { h, w })
    if (end.x > start.x && end.y > start.y) return _ass(start, { h, w })
    if (end.x < start.x && end.y > start.y) return { h, w, x: end.x, y: start.y }
    if (end.x > start.x && end.y < start.y) return { h, w, x: start.x, y: end.y }
    return { x: 0, y: 0, w: 0, h: 0 }
}
export const rectInRect = ({ x, y, w, h }: Rect, { x: tX, y: tY, w: tW, h: tH }: Rect,) => {

    return x > tX && x + w < tX + tW && y > tY && y + h < tY + tH
}

export const rectCross = ({ x, y, w, h }: Rect, target: Rect, offset = 0) => {
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

export const nodeShouldPlace = (parent: BitNode<any>, target: BitNode<any>) => {

    if (parent.left) {
        target.right = parent.left.right
        parent.left.right = target
        target.parent = parent
    } else {
        parent.left = target
        target.parent = parent
    }
}

export const drawPath = (ctx: CanvasRenderingContext2D, { x, y, w, h }: Rect, reColor?: string) => {
    const pi = Math.PI
    ctx.beginPath()

    ctx.arc(x + minGap, y + minGap, minGap, pi, 3 * pi / 2)
    ctx.moveTo(x + minGap, y)
    ctx.lineTo(x + w - minGap, y)

    ctx.arc(x + w - minGap, y + minGap, minGap, 3 * pi / 2, 0)

    ctx.moveTo(x + w, y + minGap)
    ctx.lineTo(x + w, y + h / 2 - radius)
    ctx.arc(x + w, y + h / 2, radius, -pi / 2, 3 * pi / 2)//画关联节点
    ctx.moveTo(x + w, y + h / 2 + radius) //移动到节点下方
    ctx.lineTo(x + w, y + h - minGap)

    ctx.arc(x + w - minGap, y + h - minGap, minGap, 0, pi / 2)
    ctx.moveTo(x + w - minGap, y + h)
    ctx.lineTo(x + minGap, y + h)

    ctx.arc(x + minGap, y + h - minGap, minGap, pi / 2, pi)
    ctx.moveTo(x, y + h - minGap)
    ctx.lineTo(x, y + h / 2 + radius)
    ctx.arc(x, y + h / 2, radius, pi / 2, 5 * pi / 2)//画关联节点
    ctx.moveTo(x, y + h / 2 - radius) //移动到节点下方
    ctx.lineTo(x, y + minGap)

    ctx.strokeStyle = reColor || color.primary
    ctx.lineWidth = lineWidth
    // ctx.lineJoin = 'round'
    ctx.stroke()
    return false
}
export const drawRect = (ctx: CanvasRenderingContext2D, { x, y, w, h }: Rect, reColor?: string) => {
    ctx.fillStyle = reColor || color.primary
    ctx.fillRect(x, y, w, h)
}