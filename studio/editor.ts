import { ipcRenderer } from 'electron'
import url from 'url'
import _ from 'lodash'
import Vue, { ComponentOptions } from 'vue'
import wsHeader from './ui/header.vue'
import wsCanvas from './ui/canvas.vue'
import wsLayers from './ui/layers.vue'
import wsInspector from './ui/inspector.vue'
import './elements/elements.less'

const template = `
<div id="ws-editor">
    <ws-header :title="documentTitle" :edited="edited"></ws-header>
    <ws-canvas :page="page" @selection="selected"></ws-canvas>
    <ws-layers :extends="meta.extends" :pages="meta.pages" @selection="selected" v-if="showLayers"></ws-layers>
    <ws-inspector :selection="selection" v-if="showInspector"></ws-inspector>
</div>
`

interface EditorComponent extends Vue {
    pid: number
    documentTitle: string
    meta: WebMeta
    page: WebPage
    selection: WebPage | WebLayer
    edited: boolean
    showLayers: boolean
    showInspector: boolean
    undo(): void
    redo(): void
    selected(indexs: number[][]): void
}

let initialMeta: WebMeta

export default {
    name: 'ws-editor',
    template,
    components: {
        wsHeader,
        wsCanvas,
        wsLayers,
        wsInspector,
    },
    data() {
        return {
            pid: NaN,
            documentTitle: null,
            meta: null,
            page: null,
            selection: null,
            edited: false,
            showLayers: true,
            showInspector: true,
        }
    },
    methods: {
        insert(layer: WebLayer | WebPage) {
            console.log(layer)
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

        initialMeta = ipcRenderer.sendSync('project-meta', pid) as WebMeta
        if (!initialMeta.pages) {
            initialMeta.pages = []
        }

        vm.pid = pid
        vm.documentTitle = query.documentTitle
        vm.meta = _.cloneDeep(initialMeta)
        vm.$watch('meta', (newMeta: WebMeta, oldMeta: WebMeta) => {
            vm.edited = true
            ipcRenderer.send('project-meta', pid, newMeta)
            console.log(newMeta, oldMeta) // todo: log meta change
        }, { deep: true })
        ipcRenderer.on('saved', (documentTitle: string) => {
            vm.documentTitle = documentTitle
            vm.edited = false
        })
        ipcRenderer.on('undo', () => {
            vm.undo()
        })
        ipcRenderer.on('redo', () => {
            vm.redo()
        })
    },
} as ComponentOptions<EditorComponent>
