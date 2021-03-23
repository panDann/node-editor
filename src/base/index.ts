import { Component, createElement, CSSProperties, createRef } from 'react'
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
import { initS, reducer, Action } from './store'
interface IProp {
    style?: CSSProperties
    className?: string
    option: EOption
    watch?: boolean
}
interface IState {
    count: number
}

type ChangablePro = 'option' | 'resize' | 'init'


export type UseDep = Parameters<typeof echarts.use>[0]
const baseCom: UseDep = [
    DatasetComponent,
    TitleComponent, TooltipComponent, GridComponent,
    LegendComponent, CanvasRenderer, SVGRenderer
]
echarts.use(baseCom)

export class Chart extends Component<IProp, IState> {
    constructor(props: IProp) {
        super(props)
        this.state = {
            count: 0
        }
    }
    ref = createRef<HTMLDivElement>()
    chart: any = null

    dispatch() {
        this.setState({ count: this.state.count + 1 })
    }
    render() {
        return createElement('div', { className: this.props.className, ref: this.ref, style: { height: '100%', width: '100%', ...this.props.style }, })
    }
    componentDidUpdate(prop: IProp, preS: IState) {
        if (preS.count !== this.state.count) {
            this.reInit()
        }
    }
    reInit() {

        const { option } = this.props
        this.chart && echarts.dispose(this.chart)
        this.chart = echarts.init(this.ref.current as HTMLDivElement, option.theme, { renderer: option.renderer })
        this.chart.setOption(option.now())
        option.notify(this.dispatch = this.dispatch.bind(this), this.chart)
    }
    componentDidMount() {
        this.reInit()
    }
    // Chart({ className, option, watch = true, ...rest }: IProp) {
    //     option || console.error("option don't allow to set empty,it must be an instance of EOption");

    //     const echartRef = useRef<HTMLDivElement | null>(null)
    //     const chart = useRef<any>(null)
    //     const [sta, dispatch] = useReducer(reducer, initS)
    //     // 注册监听器
    //     watch && option.notify(dispatch)

    //     // 处理首次与特殊渲染（主题，引擎）
    //     useLayoutEffect(() => {
    //         chart.current = echarts.init(echartRef.current, sta.theme, { renderer: sta.renderer })
    //         chart.current.setOption(option.now())
    //         return () => echarts.dispose(chart.current)
    //     }, [sta.theme, sta.renderer])

    //     // 处理（resize...）
    //     useEffect(() => {
    //         chart.current.resize()
    //     }, [sta.resize])

    //     // 处理option触发的更新（）
    //     useEffect(() => {
    //         sta.count > 0 && chart.current.setOption(option.now())
    //     }, [sta.count])

    //     return createElement('div', { className, style: { height: '100%', width: '100%', ...rest.style }, ref: echartRef })
    // }
}

export default function EBase(prop: IProp) {
    return createElement(Chart, prop)
}
EBase.use = (extra: UseDep) => {
    echarts.use(extra)
}