import Vue, { ComponentOptions } from 'vue'

const template = `
<div id="ws-app">
    <p>{{msg}}</p>
</div>
`

export default (): Vue => {
    return new Vue({
        el: '#app',
        name: 'web-studio-welcome',
        template,
        data() {
            return {
                msg: 'Hello, Welcome to use Web Studio!',
            }
        },
    })
}
