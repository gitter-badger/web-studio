import Vue, { ComponentOptions } from 'vue'

const template = `
<div id="app">
    <p>{{msg}}</p>
</div>
`
export default {
    name: 'ws-welcome',
    template,
    data() {
        return {
            msg: 'Hello, Welcome to use Web Studio!',
        }
    },
} as ComponentOptions<Vue>
