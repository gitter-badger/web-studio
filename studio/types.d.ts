declare module '*.vue' {
    import Vue from 'vue'
    export default Vue
}

declare interface ElementPosition {
    top: number
    bottom: number
    left: number
    right: number
}

declare interface ElementRGBA {
    r: number
    g: number
    b: number
    a: number
}

declare interface ElementBorder {
    style: string
    tickness: number
    color: ElementRGBA
}

declare interface WebElement extends ElementPosition {
    position: string
    width: number
    height: number
    float: string
    margin: ElementPosition
    padding: ElementPosition
    border: ElementBorder
    opacity: number
    bgColor: ElementRGBA
    rotate: number
}

declare interface WebMeta {
    title: string
    extends: WebMeta[]
    pages: WebPage[]
    components: WebLayer[]
    assetFiles: WebAssetFile[]
}

declare interface WebPage {
    routeExp: string
    title: string
    extraHeadTag: string[]
    layers: WebLayer[]
}

declare interface WebLayer extends WebElement {
    type: string
    input: any
    locked: boolean
    show: boolean
    collapsed: boolean
    children: WebLayer[]
}

declare interface WebAssetFile {
    name: string
    type: string
    size: number
    tempPath: string
    meta: WebImageFile | WebAudioFile | WebVideoFile
}

declare interface WebImageFile {
    width: number
    height: number
}

declare interface WebAudioFile {
    duration: number
    bitrate: number
}

declare interface WebVideoFile {
    width: number
    height: number
    duration: number
    fps: number
    bitrate: number
}
