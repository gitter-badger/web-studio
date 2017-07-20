import { dialog, ipcRenderer, remote } from 'electron'
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
    name: null,
    pages: [],
    components: [],
    extensions: [],
    assetFiles: []
}

function init(ediorId: number) {
    const ediorState: any = {
        savePath: undefined,
        web: undefined,
        currentWebObject: null,
        selections: null,
        saving: undefined,
        edited: undefined,
        showSidebar: undefined,
        showInspector: undefined,
        previewMode: undefined,
        editTab: undefined,
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
    let idIndex = 0
    let webWatcher: any = null

    for (const key in ediorState) {
        if (ediorState[key] === undefined) {
            editorProperties.push(key)
        }
        stateGetter[key] = () => ($state as any)[key]
    }

    _.assign($state, defaultWeb, ipcRenderer.sendSync('editor-property', ediorId, editorProperties))

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
            $setSelections(sel: any, root: any): void {
                console.log(sel)
            },
            $appendSelections(sel: any, root: any): void {
                console.log(sel)
            },
            $setEditTab(tab: string): void {
                if ($state.editTab !== tab) {
                    $state.editTab = tab
                    ipcRenderer.send('editor-property', ediorId, { editTab: tab })
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
            $addWebObject(): void {
                let root = ($state.web as any)[$state.editTab]
                if (!_.isArray(root)) {
                    root = []
                    Vue.set($state.web, $state.editTab, root)
                }

                switch ($state.editTab) {
                    case 'pages':
                        $state.web.pages.unshift(_.assign({ layers: [], routeExp: '', meta: {} }, newIdWithName('Page', root)))
                        break
                    case 'components':
                        $state.web.components.unshift(_.assign({ layers: [], input: null }, newIdWithName('Component', root)))
                        break
                    case 'extensions':
                        ipcRenderer.send('add-web-extensions', ediorId)
                        break
                }
            },
            $removeWebObject(obj: any): void {
                const layers = ($state.web as any)[$state.editTab]
                if (!_.isArray(layers)) {
                    return
                }

                let deleteIndex = -1

                _.each(layers, (item: any, i: number): any => {
                    if (item === obj) {
                        deleteIndex = i
                        return false
                    }
                })

                if (confirm('Delete ' + obj.name + '?')) {
                    layers.splice(deleteIndex, 1)
                }
            },
            $setQuietly(obj: any, key: string, value: any): void {
                unWatchWeb()
                Vue.set(obj, key, value)
                watchWeb()
                $state.edited = true
                ipcRenderer.send('editor-property', ediorId, { web: $state.web }, true)
            },
            $showPopupMenu(items: any[]): void {
                if (!_.isArray(items) || items.length === 0) {
                    return
                }

                const vm = this as any
                const menu = new remote.Menu()

                _.each(items, (item: any) => {
                    item.click = () => {
                        let callback: any
                        let args: any[]

                        if (_.isFunction(item.callback)) {
                            callback = item.callback
                        } else if (_.isString(item.callback) && item.callback in vm && _.isFunction(vm[item.callback])) {
                            callback = vm[item.callback]
                        }

                        if (_.isArray(item.arguments)) {
                            args = item.arguments
                        } else {
                            args = [item.arguments]
                        }

                        if (callback) {
                            callback.apply(vm, args)
                        }
                    }
                })

                remote.Menu.buildFromTemplate(items as any).popup(remote.getCurrentWindow())
            }
        }
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
                $state.web = value
                // todo: parse $state.web and value to improve performance
                watchWeb()
                break
            default:
        }
    })

    ipcRenderer.on('saved', (e: Event, savePath: string) => {
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

    function newIdWithName(prefix: string, container: any[], index: number = 1): any {
        const name = prefix + ' ' + index

        if (_.findIndex(container, (o) => o && o.name === name) >= 0) {
            return newIdWithName(prefix, container, index + 1)
        }

        const id = prefix.toLocaleLowerCase() + '-' + (++idIndex)
        if (_.findIndex(container, (o) => o && o.id === id) >= 0) {
            return newIdWithName(prefix, container, index)
        }

        return { id, name }
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
        }
    })
}
