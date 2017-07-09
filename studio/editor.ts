import { ipcRenderer } from 'electron'
import url from 'url'
import path from 'path'
import _ from 'lodash'
import Vue, { ComponentOptions } from 'vue'
import editorTitleBar from './ui/editor-titleBar.vue'
import editorCanvas from './ui/editor-canvas.vue'
import editorLayers from './ui/editor-layers.vue'
import editorInspector from './ui/editor-inspector.vue'
import editorInsert from './ui/editor-insert.vue'

const template = `
<div id="ws-app">
    <editor-layers :documentName="documentName" :web="web" @selected="selected" @press="press" v-show="showLayers && !previewMode"></editor-layers>
    <editor-title-bar :edit-object="editObject"></editor-title-bar>
    <editor-canvas :edit-object="editObject" :selections="selections" @selected="selected" v-if="selections !== null"></editor-canvas>
    <editor-inspector :selections="selections" v-show="showInspector && !previewMode && selections !== null"></editor-inspector>
    <editor-insert @insert="insert" v-show="!previewMode" v-if="selections !== null"></editor-insert>
</div>
`

const defaultWeb = {
    pages: [],
    components: [],
    extends: [],
    pagesCollapsed: false,
    componentsCollapsed: true,
    extendsCollapsed: true,
}

interface Editor extends Vue {
    web: Web
    editObject: Web | WebPage | WebComponent
    selections: WebPage[] | WebLayer[]
    watchWeb(): void
    unWatchWeb(): void
    _webWatcher(): void
    press(): void
    insert(type: string): void
    undo(): void
    redo(): void
    selected(indexs: number[][]): void
}

interface EditorState extends Vue {
    meta: Web,
    savePath: string
    documentName: string
    isMac: boolean,
    windowWidth: number,
    windowHeight: number,
    leftAsideWidth: number,
    edited: boolean,
    showLayers: boolean,
    showInspector: boolean,
    previewMode: boolean,
}

const pid = parseInt(url.parse(location.href, true).query.project, 10)
const projectRawProperty = ipcRenderer.sendSync('project-property', pid, ['meta', 'edited', 'savePath', 'leftAsideWidth', 'showLayers', 'showInspector', 'previewMode']) as EditorState
const $state = new Vue({
    data: {
        documentName: parseDocumentName(projectRawProperty.savePath),
        edited: projectRawProperty.edited,
        isMac: process.platform === 'darwin',
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        leftAsideWidth: projectRawProperty.leftAsideWidth,
        showLayers: projectRawProperty.showLayers,
        showInspector: projectRawProperty.showInspector,
        previewMode: projectRawProperty.previewMode,
    },
}) as EditorState

let editorVM: Editor

window.addEventListener('resize', () => {
    $state.windowWidth = window.innerWidth
    $state.windowHeight = window.innerHeight
})

Vue.mixin({
    computed: {
        documentName: () => $state.documentName,
        edited: () => $state.edited,
        isMac: () => $state.isMac,
        windowWidth: () => $state.windowWidth,
        windowHeight: () => $state.windowHeight,
        leftAsideWidth: () => $state.leftAsideWidth,
        showLayers: () => $state.showLayers,
        showInspector: () => $state.showInspector,
        previewMode: () => $state.previewMode,
    },
    methods: {
        $alterLeftAsideWidth(n: number) {
            let width = $state.leftAsideWidth + n

            if (width < 180) {
                width = 180
            } else if (width > $state.windowWidth / 2) {
                width = $state.windowWidth / 2
            }

            ipcRenderer.send('app-storage', 'leftAsideWidth', width)
            $state.leftAsideWidth = width
        },
        $noRecordUpdateWeb(container: any, key: string, value: any) {
            editorVM.unWatchWeb()
            Vue.set(container, key, value)
            ipcRenderer.send('project-property', pid, { meta: editorVM.web }, true)
            $state.edited = true
            editorVM.watchWeb()
        },
    },
})

function parseDocumentName(savePath: string): string {
    if (!_.isString(savePath) || savePath === '') {
        return 'Untitled.web'
    }
    return path.basename(savePath)
}

export default {
    name: 'ws-editor',
    template,
    components: {
        editorTitleBar,
        editorCanvas,
        editorLayers,
        editorInspector,
        editorInsert,
    },
    data() {
        return {
            web: _.assign({}, projectRawProperty.meta, defaultWeb),
            editObject: null,
            selections: null,
        }
    },
    methods: {
        press() {
            console.log('press')
        },
        insert(type: string) {
            console.log(type)
        },
        align(direction: string) {
            console.log(direction)
        },
        distribute(direction: string) {
            console.log(direction)
        },
        selected(indexs: number[][]) {
            console.log(indexs)
        },
        watchWeb() {
            this._webWatcher = this.$watch('web', (web: Web) => {
                if ('fromMainProcess' in web) {
                    this.$delete(web, 'fromMainProcess')
                } else {
                    ipcRenderer.send('project-property', pid, { meta: web })
                }

                $state.edited = true
            }, { deep: true })
        },
        unWatchWeb() {
            if (_.isFunction(this._webWatcher)) {
                this._webWatcher()
                delete this._webWatcher
            }
        },
    },
    created() {
        const vm = this
        editorVM = vm
        ipcRenderer.on('project-property', (e: Event, key: string, value: any) => {
            switch (key) {
                case 'showLayers':
                case 'showInspector':
                case 'previewMode':
                    $state[key] = value as boolean
                case 'meta':
                    vm.web = _.assign({}, value, defaultWeb, { fromMainProcess: true }) as Web
                    break
                default:
            }
        })
        vm.watchWeb()
        ipcRenderer.on('saved', (savePath: string) => {
            $state.documentName = parseDocumentName(savePath)
            $state.edited = false
        })
    },
} as ComponentOptions<Editor>
