declare module '*.vue' {
    import Vue from 'vue'
    export default Vue
}

declare interface EditorScope {
    documentName: string
    web: Web
    currentWebObject: Web | WebPage | WebComponent
    selections: WebLayer[]
    edited: boolean
    showSidebar: boolean
    showInspector: boolean
    previewMode: boolean
    showLayers: string
    sideBarWidth: number
    windowWidth: number
    windowHeight: number
    fullscreen: boolean
    isMac: boolean
    $press(): void
    $insert(type: string): void
    $align(direction: string): void
    $distribute(direction: string): void
    $setSelections(sel: WebLayer | WebLayer[]): void
    $appendSelections(sel: WebLayer | WebLayer[]): void
    $showLayers(type: string): void
    $alterSiderBarWidth(n: number): void
}

declare interface ElementPosition {
    top: number
    bottom: number
    left: number
    right: number
}

declare interface ElementColor {
    r: number
    g: number
    b: number
    a: number
}

declare interface ElementBorder {
    style: string
    tickness: number
    color: ElementColor
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
    bgColor: ElementColor
    rotate: number
}

declare interface Web {
    title: string
    documentName: string
    pages: WebPage[]
    components: WebComponent[]
    extends: Web[]
    assetFiles: WebAssetFile[]
    meta: any
}

declare interface WebPage {
    title: string
    routeExp: string
    layers: WebLayer[]
    meta: any
}

declare interface WebComponent extends WebLayer {
    input: any
}

declare interface WebLayer extends WebElement {
    title: string
    type: string
    locked: boolean
    hidden: boolean
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
