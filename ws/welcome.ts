import Vue, { ComponentOptions } from 'vue'

const template = `
<div id="ws-welcome">
  <h1>{{msg}}</h1>
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
  print(a: any) {
    console.log(a)
  },
} as ComponentOptions<Vue>
