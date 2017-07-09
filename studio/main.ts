import url from 'url'
import Vue from 'vue'
import editor from './editor'
import welcome from './welcome'
import preferences from './preferences'
import './assets/ui.less'
import './assets/elements.less'

let appRoot = new Vue({
  el: '#app',
  render: h => {
    const urlQuery = url.parse(window.location.href, true).query

    if ('project' in urlQuery && /^\d+$/.test(urlQuery.project)) {
      return h(editor)
    }

    if ('preferences' in urlQuery) {
      return h(preferences)
    }

    return h(welcome)
  },
})
