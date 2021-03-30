import { EChartOption as EO, EChartTitleOption, } from 'echarts';
import { Dispatch, } from 'react'
import { IState, Action } from './store'


type EchartSinglePro = {
    title: EChartTitleOption
    dataset: EO.Dataset
    legend: EO.Legend
    tooltip: EO.Tooltip
    grid: EO.Grid
    xAxis: EO.XAxis
    yAxis: EO.YAxis
    dataZoom: EO.DataZoom
    series: EO.Series
}
type EchartPro = {
    dataZoom: EO.DataZoom
    series: EO.Series
}

type ExtraValue = {
    theme: string | object
    renderer: 'svg' | 'canvas'
}

const _assign = Object.assign
const createTimer = (operate: Function) => {
    let timer: ReturnType<typeof setTimeout>
    return () => {
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => {
            operate()
        }, 0);
    }
}
export class EOption {

    constructor(customOptions: EO) {
        _assign(this.option, customOptions)
    }
    private option: EO = {}
    private extra: ExtraValue = {
        theme: 'light',
        renderer: 'svg'
    }
    private chart: any = null
    private _trigger: Dispatch<Action> & any = null
    private trigger = createTimer(() => this._trigger && this._trigger())

    private triggerOption = createTimer(() => this.chart && this.chart.setOption(this.option))

    now = () => this.option
    extraMsg = () => this.extra
    notify = (dispatch: Dispatch<Action>, chart?: any) => (this._trigger = dispatch, this.chart = chart)

    setExtra<T extends keyof ExtraValue>(key: T, value: ExtraValue[T]) {
        _assign(this.extra, { [key]: value })
        this.trigger()  
    } 
    resize = () => {
        this.chart && this.chart.resize()
    }
    assign<T extends keyof EchartSinglePro>(key: T, prop: EchartSinglePro[T]) {
        this.option[key] = _assign(this.option[key], prop); 
        this.triggerOption()
    }
    assigns<T extends keyof EchartPro>(key: T, props: EchartPro[T][]) {
        (this.option[key] as EchartPro[T][]).forEach((el, index) => _assign(el, props[index]))
        this.triggerOption()
    }
    add = <T extends keyof EchartSinglePro>(key: T, val: EO[T]) => this.option[key] = val
    delete(key: keyof EchartSinglePro) {
        delete this.option[key];
    }
}


export const useOption = (customOptions: EO) => new EOption(customOptions)