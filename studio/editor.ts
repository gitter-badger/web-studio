import { ipcRenderer } from 'electron'
import path from 'path'
import _ from 'lodash'
import Vue, { ComponentOptions } from 'vue'
import editorTitleBar from './ui/editor-titleBar.vue'
import editorCanvas from './ui/editor-canvas.vue'
import editorSideBar from './ui/editor-sideBar.vue'
import editorInspector from './ui/editor-inspector.vue'
import editorInsert from './ui/editor-insert.vue'
import './assets/elements.less'

interface EditorState extends Vue, EditorScope { }

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
    extensions: [],
}

function init(ediorId: number) {
    const ediorState: any = {
        savePath: undefined,
        web: undefined,
        currentWebObject: null,
        selections: null,
        edited: undefined,
        showSidebar: undefined,
        showInspector: undefined,
        previewMode: undefined,
        showLayers: undefined,
        sideBarWidth: undefined,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        fullscreen: undefined,
        isMac: process.platform === 'darwin',
    }
    const editorProperties = []
    const $state = new Vue({
        data: ediorState,
    }) as EditorState
    const stateGetter: any = {
        documentName: (): string => {
            if (!_.isString($state.savePath) || $state.savePath === '') {
                return 'Untitled.web'
            }
            return path.basename($state.savePath)
        },
    }
    let webWatcher: any = null

    for (let key in ediorState) {
        if (ediorState[key] === undefined) {
            editorProperties.push(key)
        }
        stateGetter[key] = () => {
            return $state[key]
        }
    }

    _.assign($state, ipcRenderer.sendSync('editor-property', ediorId, editorProperties))

    Vue.mixin({
        computed: stateGetter,
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
                    ipcRenderer.send('editor-property', ediorId, { showLayers: type })
                }
            },
            $alterSideBarWidth(n: number): void {
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
                $state.edited = true
                ipcRenderer.send('editor-property', ediorId, { web: $state.web }, true)
                watchWeb()
            },
        },
    })

    window.addEventListener('resize', () => {
        $state.windowWidth = window.innerWidth
        $state.windowHeight = window.innerHeight
    })

    ipcRenderer.on('editor-property', (e: Event, key: string, value: any) => {
        switch (key) {
            case 'showSidebar':
            case 'showInspector':
            case 'previewMode':
            case 'fullscreen':
                $state[key] = value as boolean
                break
            case 'web':
                unWatchWeb()
                $state.web = _.assign({}, defaultWeb, value) as Web
                watchWeb()
                break
            default:
        }
    })

    ipcRenderer.on('saved', (savePath: string) => {
        $state.savePath = savePath
        $state.edited = false
    })

    watchWeb()

    function watchWeb() {
        webWatcher = $state.$watch('web', (web: Web) => {
            $state.edited = true
            ipcRenderer.send('editor-property', ediorId, { web })
        }, { deep: true })
    }

    function unWatchWeb() {
        if (webWatcher !== null) {
            webWatcher()
            webWatcher = null
        }
    }
}

export default (editorId: number): Vue => {
    init(editorId)

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
