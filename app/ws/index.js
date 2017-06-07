import Vue from 'vue'
import url from 'url'
import welcome from './welcome.vue'
import editor from './editor.vue'
import preferences from './preferences.vue'

new Vue({
  el: '#app',
  render: h => {
  	const urlQuery = url.parse(location.href, true).query

  	if ('project' in urlQuery) {
  		return h(editor)
  	}
  	if ('preferences' in urlQuery) {
  		return h(preferences)
  	}
  	return h(welcome)
  }
})
