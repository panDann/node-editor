export interface IState {
    theme: string | object
    resize: number
    renderer: 'canvas' | 'svg'
    count: number
}

type ActionKind = {
    theme: 'dark' | 'light'|object
    resize: null
    count: null
    renderer: 'canvas' | 'svg'
}
export type Action = [keyof ActionKind, any]

export const reducer = (sta: IState, [type, payload]: Action): IState => {
    switch (type) {
        case 'theme':
            return { ...sta, theme: payload }
        case 'resize':
            return { ...sta, resize: ++sta.resize,count: ++sta.count  }
        case 'count':
            return { ...sta, count: ++sta.count }
        case 'renderer':
            return { ...sta, renderer: payload }
        default:
            return sta
    }
}

export const initS: IState = {
    theme: '',
    count: 0,
    resize: 0,
    renderer: 'svg'
}