import { ipcRenderer } from 'electron'
import url from 'url'
import _ from 'lodash'
import Vue, { ComponentOptions } from 'vue'
import editorTitleBar from './ui/editor-titleBar.vue'
import editorCanvas from './ui/editor-canvas.vue'
import editorLayers from './ui/editor-layers.vue'
import editorInspector from './ui/editor-inspector.vue'
import editorInsert from './ui/editor-insert.vue'

const template = `
<div id="app">
    <editor-title-bar :documentTitle="documentTitle" :edited="edited" :page="page" @selection="selected"></editor-title-bar>
    <editor-layers :extends="web.extends" :pages="web.pages" @selection="selected" v-if="showLayers"></editor-layers>
    <editor-canvas :page="page" @selection="selected"></editor-canvas>
    <editor-inspector :selection="selection" v-if="showInspector"></editor-inspector>
    <editor-insert @insert="insert" v-if="!previewMode"></editor-insert>
</div>
`

interface EditorComponent extends Vue {
    pid: number
    documentTitle: string
    web: Web
    page: WebPage
    selection: WebPage | WebLayer
    edited: boolean
    insert(type: string): void
    undo(): void
    redo(): void
    selected(indexs: number[][]): void
}

let initialWeb: Web

export default {
    name: 'editor-editor',
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
            pid: NaN,
            documentTitle: null,
            meta: null,
            page: null,
            selection: null,
            edited: false,
        }
    },
    methods: {
        insert(type: string) {
            console.log(type)
        },
        align(direction: string) {
            console.log(direction)
        },
        distribute(direction: string) {
            console.log(direction)
        },
        undo() {
            console.log('undo')
        },
        redo() {
            console.log('redo')
        },
        selected(indexs: number[][]) {
            console.log(indexs)
        },
    },
    created() {
        const vm = this
        const query = url.parse(location.href, true).query
        const pid = parseInt(query.project, 10)

        initialWeb = ipcRenderer.sendSync('project-meta', pid) as Web
        if (!initialWeb.pages) {
            initialWeb.pages = []
        }

        vm.pid = pid
        vm.documentTitle = query.documentTitle
        vm.web = _.cloneDeep(initialWeb)
        vm.$watch('meta', (newMeta: Web, oldMeta: Web) => {
            vm.edited = true
            ipcRenderer.send('project-meta', pid, newMeta)
            console.log(newMeta, oldMeta) // todo: log meta change
        }, { deep: true })
        ipcRenderer.on('saved', (documentTitle: string) => {
            vm.edited = false
            vm.documentTitle = documentTitle
        })
        ipcRenderer.on('undo', () => {
            vm.undo()
        })
        ipcRenderer.on('redo', () => {
            vm.redo()
        })
    },
} as ComponentOptions<EditorComponent>
