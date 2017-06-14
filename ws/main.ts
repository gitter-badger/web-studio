import url from 'url'
import Vue from 'vue'
import welcome from './welcome'
import preferences from './preferences.vue'
import editor from './editor.vue'

new Vue({
  el: '#app',
  render: h => {
    const urlQuery = url.parse(window.location.href, true).query

    if ('project' in urlQuery) {
      return h(editor)
    }
    if ('preferences' in urlQuery) {
      return h(preferences)
    }
    return h(welcome)
  },
})
