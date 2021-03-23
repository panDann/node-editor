import { useEffect, useRef, createElement, CSSProperties, useReducer, useLayoutEffect } from 'react'
import * as echarts from "echarts/core";
import {
    TitleComponent,
    TooltipComponent,
    GridComponent,
    LegendComponent,
    DatasetComponent
} from 'echarts/components';
import {
    CanvasRenderer, SVGRenderer
} from 'echarts/renderers';

import { EOption } from './option'
import {  initS, reducer } from './store'
interface IProp {
    style?: CSSProperties
    className?: string
    option: EOption
    watch?: boolean
}

export type UseDep = Parameters<typeof echarts.use>[0]
const baseCom: UseDep = [
    DatasetComponent,
    TitleComponent, TooltipComponent, GridComponent,
    LegendComponent, CanvasRenderer, SVGRenderer
]

export class EBase {
    constructor(extra: UseDep) {
        echarts.use((baseCom as any).concat(extra))
    }
    Chart({ className, option, watch = true, ...rest }: IProp) {
        option||console.error("option don't allow to set empty,it must be an instance of EOption");
        
        const echartRef = useRef<HTMLDivElement | null>(null)
        const chart = useRef<any>(null)
        const [sta, dispatch] = useReducer(reducer, initS)
        // 注册监听器
        watch && option.notify(dispatch)

        // 处理首次与特殊渲染（主题，引擎）
        useLayoutEffect(() => {
            chart.current = echarts.init(echartRef.current as any, sta.theme, { renderer: sta.renderer })
            chart.current.setOption(option.now())
            return () => echarts.dispose(chart.current)
        }, [sta.theme, sta.renderer])

        // 处理（resize...）
        useEffect(() => {
            chart.current.resize()
        }, [sta.resize])

        // 处理option触发的更新（）
        useEffect(() => {
            sta.count > 0 && chart.current.setOption(option.now())
        }, [sta.count])

        return createElement('div', { className, style: { height: '100%', width: '100%', ...rest.style }, ref: echartRef })
    }
}

export const useBase = (extra: UseDep)=>new EBase(extra).Chart
