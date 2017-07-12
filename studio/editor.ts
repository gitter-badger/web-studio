import { ipcRenderer } from 'electron'
import url from 'url'
import path from 'path'
import _ from 'lodash'
import Vue, { ComponentOptions } from 'vue'
import editorTitleBar from './ui/editor-titleBar.vue'
import editorCanvas from './ui/editor-canvas.vue'
import editorSideBar from './ui/editor-sideBar.vue'
import editorInspector from './ui/editor-inspector.vue'
import editorInsert from './ui/editor-insert.vue'
import './assets/elements.less'

const pid = parseInt(url.parse(location.href, true).query.project, 10)

const template = `
<div id="ws-app">
    <editor-side-bar :documentName="documentName" v-show="showSidebar && !previewMode"></editor-side-bar>
    <editor-title-bar v-if="!fullscreen"></editor-title-bar>
    <editor-canvas v-if="currentWebObject !== null"></editor-canvas>
    <editor-inspector v-show="showInspector && !previewMode" v-if="selections !== null"></editor-inspector>
    <editor-insert @insert="insert" v-show="!previewMode" v-if="currentWebObject !== null"></editor-insert>
</div>
`

const defaultWeb = {
    title: null,
    pages: [],
    components: [],
    extends: [],
}

interface EditorState extends Vue, EditorScope { }

function init() {
    const projectRawProperty = ipcRenderer.sendSync('project-property', pid, ['meta', 'savePath', 'sideBarWidth', 'showSidebar', 'showInspector', 'previewMode', 'showLayers', 'edited', 'fullscreen'])
    const $state = new Vue({
        data: {
            documentName: parseDocumentName(projectRawProperty.savePath),
            web: _.assign({}, projectRawProperty.meta, defaultWeb),
            currentWebObject: null,
            selections: null,
            edited: projectRawProperty.edited,
            showSidebar: projectRawProperty.showSidebar,
            showInspector: projectRawProperty.showInspector,
            previewMode: projectRawProperty.previewMode,
            showLayers: projectRawProperty.showLayers,
            sideBarWidth: projectRawProperty.sideBarWidth,
            windowWidth: window.innerWidth,
            windowHeight: window.innerHeight,
            fullscreen: projectRawProperty.fullscreen,
            isMac: process.platform === 'darwin',
        },
    }) as EditorState
    let webWatcher: any = null

    watchWeb()

    window.addEventListener('resize', () => {
        $state.windowWidth = window.innerWidth
        $state.windowHeight = window.innerHeight
    })

    ipcRenderer.on('project-property', (e: Event, key: string, value: any) => {
        switch (key) {
            case 'showSidebar':
            case 'showInspector':
            case 'previewMode':
            case 'fullscreen':
                $state[key] = value as boolean
                break
            case 'meta':
                unWatchWeb()
                $state.web = _.assign({}, value, defaultWeb) as Web
                watchWeb()
                break
            default:
        }
    })

    ipcRenderer.on('saved', (savePath: string) => {
        $state.documentName = parseDocumentName(savePath)
        $state.edited = false
    })

    Vue.mixin({
        computed: {
            documentName: () => $state.documentName,
            web: () => $state.web,
            currentWebObject: () => $state.currentWebObject,
            selections: () => $state.selections,
            edited: () => $state.edited,
            showSidebar: () => $state.showSidebar,
            showInspector: () => $state.showInspector,
            previewMode: () => $state.previewMode,
            showLayers: () => $state.showLayers,
            sideBarWidth: () => $state.sideBarWidth,
            windowWidth: () => $state.windowWidth,
            windowHeight: () => $state.windowHeight,
            fullscreen: () => $state.fullscreen,
            isMac: () => $state.isMac,
        },
        methods: {
            $press(): void {
                console.log('press')
            },
            $insert(type: string): void {
                console.log(type)
            },
            $align(direction: string): void {
                console.log(direction)
            },
            $distribute(direction: string): void {
                console.log(direction)
            },
            $setSelections(sel: WebLayer | WebLayer[]): void {
                console.log(sel)
            },
            $appendSelections(sel: WebLayer | WebLayer[]): void {
                console.log(sel)
            },
            $showLayers(type: string): void {
                if ($state.showLayers !== type) {
                    $state.showLayers = type
                    ipcRenderer.send('project-property', pid, { showLayers: type })
                }
            },
            $alterSiderBarWidth(n: number): void {
                let width = $state.sideBarWidth + n

                if (width < 180) {
                    width = 180
                } else if (width > $state.windowWidth / 2) {
                    width = $state.windowWidth / 2
                }

                ipcRenderer.send('app-storage', 'sideBarWidth', width)
                $state.sideBarWidth = width
            },
            $noRecordUpdateWeb(object: any, key: string, value: any): void {
                unWatchWeb()
                Vue.set(object, key, value)
                ipcRenderer.send('project-property', pid, { meta: $state.web }, true)
                $state.edited = true
                watchWeb()
            },
        },
    })

    function watchWeb() {
        webWatcher = $state.$watch('web', (web: Web) => {
            ipcRenderer.send('project-property', pid, { meta: web })
            $state.edited = true
        }, { deep: true })
    }

    function unWatchWeb() {
        if (webWatcher !== null) {
            webWatcher()
            webWatcher = null
        }
    }

    function parseDocumentName(savePath: string): string {
        if (!_.isString(savePath) || savePath === '') {
            return 'Untitled.web'
        }
        return path.basename(savePath)
    }
}

export default (): Vue => {
    init()

    return new Vue({
        el: '#app',
        name: 'web-studio-editor',
        template,
        components: {
            editorTitleBar,
            editorCanvas,
            editorSideBar,
            editorInspector,
            editorInsert,
        },
    })
}
