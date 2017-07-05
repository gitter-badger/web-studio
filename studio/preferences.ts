import Vue, { ComponentOptions } from 'vue'
import appTitleBar from './ui/app-titleBar.vue'

const template = `
<div id="app">
    <app-title-bar :title="'Preferences'"></app-title-bar>
    <p>{{msg}}</p>
</div>
`

export default {
    name: 'ws-preferences',
    template,
    components: {
        appTitleBar,
    },
    data() {
        return {
            msg: 'preferences...',
        }
    },
} as ComponentOptions<Vue>
