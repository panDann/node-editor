import { useLayoutEffect, useRef, MouseEvent, createElement } from "react";

import { BitTree } from './base-class'
interface IProps {
  height?: number
  width?: number
  bitTree: BitTree<any>
  onChange?: () => {}
}

// const appendCoverEl = () => {
//   const el = document.createElement('div')
//   el.id = 'ge-cover-tip'
//   el.style.cssText = `
//       position:fixed;
//       border: ${lineWidth + 'px ' + color} solid;
//       border-radius: ${radius + 'px '} ;
//       width:0;
//       display:none;
//       margin:5px;
//       height:0;
//     `
//   el.addEventListener('contextmenu', (e) => e.preventDefault())
//   el.addEventListener('mouseup', (e) => _ass(clickPos, { x: 0, y: 0 }))
//   document.body.appendChild(el)
//   return el
// }

export default function BitTreeCom(props: IProps) {

  const ref = useRef<HTMLCanvasElement | null>(null)
  useLayoutEffect(() => {
    const { bitTree } = props
    // ctx = canEl?.getContext('2d') as CanvasRenderingContext2D
    bitTree.init(ref.current as HTMLCanvasElement)
    bitTree.draw()
    // @ts-ignore
    document.addEventListener('mouseup', onMoveUp)
    return () => {
      // @ts-ignore
      document?.removeEventListener('mouseup', onMoveUp)
    }
  }, [])

  const onDown = ({ target, clientX, clientY, button, ...rest }: MouseEvent<HTMLCanvasElement>) => {
    props.bitTree.moveType = button
      props.bitTree.getClickPosi(clientX,clientY)
    // @ts-ignore
      ref.current.addEventListener('mousemove', onMove)
  }
  const onMove = (e: MouseEvent) => {
    props.bitTree.getMovePosi(e.clientX,e.clientY)
  }
  const onMoveUp = ({ clientX: x, clientY: y }: MouseEvent) => {
    // @ts-ignore
    ref.current.removeEventListener('mousemove', onMove)
    props.bitTree.freezeCover(x,y)
  }
  return (
    <div className='bit-tree-container' >
      <canvas ref={ref} height={500}
        onContextMenu={(e) => e.preventDefault()}
        onMouseDownCapture={onDown}
        width={1000} style={{ background: '#efe7e7' }} />
    </div>
  );
}


// let timer: any = 0
// const drawCover = (sty: CSSStyleDeclaration, { x, y, w, h }: Rect) => {
//   const unit = 'px'
//   timer = setTimeout(() => {
//     if (timer) clearTimeout(timer)
//     _ass(sty, { top: y + unit, left: x + unit, width: w + unit, height: h + unit })
//   }, 100);
// }