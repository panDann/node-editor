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
    resize: boolean,
    theme: string | object
    renderer: 'svg' | 'canvas'
}

const _assign = Object.assign
let timer: ReturnType<typeof setTimeout>
let timerOption: ReturnType<typeof setTimeout>
export class EOption {

    constructor(customOptions: EO) {
        this.option = { ...customOptions };
    }
    private option: EO = {}
    theme: string | object = 'light'
    renderer: 'svg' | 'canvas' = 'svg'
    private chart: any = null
    private _trigger: Dispatch<Action> & any = null
    private trigger() {
        // 异步赋值
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => {
            this._trigger && this._trigger()
        }, 0);
    }

    private triggerOption() {
        // 异步赋值
        if (this.chart) {
            if (timerOption) clearTimeout(timerOption)
            timerOption = setTimeout(() => {
                this.chart.setOption(this.option)
            }, 0);
        }
    }
    now = () => this.option
    notify = (dispatch: Dispatch<Action>, chart?: any) => (this._trigger = dispatch, this.chart = chart)

    setExtra<T extends keyof ExtraValue>(key: T, value: ExtraValue[T]) {
        _assign(this, { [key]: value })
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