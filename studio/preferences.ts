import Vue, { ComponentOptions } from 'vue'
import appTitleBar from './ui/app-titleBar.vue'

const template = `
<div id="ws-app">
    <app-title-bar :title="'Preferences'"></app-title-bar>
    <p>{{msg}}</p>
</div>
`

export default new Vue({
    el: '#app',
    name: 'web-studio-preferences',
    template,
    components: {
        appTitleBar,
    },
    data() {
        return {
            msg: 'preferences...',
        }
    },
})
