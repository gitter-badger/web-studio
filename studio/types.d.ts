declare module '*.vue' {
    import Vue from 'vue'
    export default Vue
}

declare interface EditorScope {
    documentName: string
    savePath: string
    web: Web
    currentWebObject: WebPage | WebComponent
    selections: WebLayer[]
    edited: boolean
    showSidebar: boolean
    showInspector: boolean
    previewMode: boolean
    editTab: string
    sideBarWidth: number
    windowWidth: number
    windowHeight: number
    fullscreen: boolean
    isMac: boolean
    $press(): void
    $insert(type: string): void
    $align(direction: string): void
    $distribute(direction: string): void
    $setSelections(sel: any, root: any): void
    $appendSelections(sel: any, root: any): void
    $setEditTab(type: string): void
    $alterSideBarWidth(n: number): void
    $addWebObject(): void
    $removeWebObject(obj: any): void
    $showPopupMenu(items: any[]): void
    $setQuietly(object: any, key: string, value: any): void
}

declare interface Web {
    name: string
    documentName: string
    pages: WebPage[]
    components: WebComponent[]
    extensions: Web[]
    assetFiles: WebAssetFile[]
    meta: any
}

declare interface WebPage {
    id: string
    name: string
    layers: WebLayer[]
    routeExp: string
    meta: any
}

declare interface WebComponent {
    id: string
    name: string
    layers: WebLayer[]
    input: any
}

declare interface WebLayer  {
    name: string
    type: string
    locked: boolean
    hidden: boolean
    style: any
    collapsed?: boolean
    layers?: WebLayer[]
}

declare interface WebAssetFile {
    name: string
    type: string
    size: number
    tempPath: string
    meta: WebImageMeta | WebAudioMeta | WebVideoMeta
}

declare interface WebImageMeta {
    width: number
    height: number
}

declare interface WebAudioMeta {
    duration: number
    bitrate: number
}

declare interface WebVideoMeta {
    width: number
    height: number
    duration: number
    fps: number
    bitrate: number
}
