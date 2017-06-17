import { ipcRenderer } from 'electron'
import url from 'url'
import _ from 'lodash'
import Vue, { ComponentOptions } from 'vue'

const template = `
<div id="ws-editor">

</div>
`

interface EditorComponent extends Vue {
    pid: number,
    meta: any,
    showLayers: boolean,
    showInspector: boolean,
}

export default {
    name: 'ws-editor',
    template,
    data() {
        return {
            pid: null,
            meta: null,
            showLayers: true,
            showInspector: true,
        }
    },
    created() {
        const vm = this
        const query = url.parse(location.href, true).query

        vm.pid = parseInt(query.project, 10)
        vm.meta = ipcRenderer.sendSync('project-meta', vm.pid)
    },
} as ComponentOptions<EditorComponent>
