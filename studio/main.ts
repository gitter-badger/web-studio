import url from 'url'
import Vue from 'vue'
import { ipcRenderer } from 'electron'
import editor from './editor'
import welcome from './welcome'
import preferences from './preferences'
import './assets/style/ui.less'
import './assets/style/elements.less'

interface AppState extends Vue {
  windowWidth: number,
  windowHeight: number,
  leftAsideWidth: number,
  showLayers: boolean,
  showInspector: boolean,
  previewMode: boolean,
}

const syncState = ipcRenderer.sendSync('project-property', ['showLayers', 'showInspector', 'previewMode']) as AppState
const $state = new Vue({
  data: {
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    leftAsideWidth: 300,
    showLayers: syncState.showLayers,
    showInspector: syncState.showInspector,
    previewMode: syncState.previewMode,
  },
}) as AppState

ipcRenderer.on('project-property', (e: Event, key: string, value: any) => {
  switch (key) {
    case 'showLayers':
    case 'showInspector':
    case 'previewMode':
      $state[key] = value as boolean
    default:
  }
})

window.addEventListener('resize', () => {
  $state.windowWidth = window.innerWidth
  $state.windowHeight = window.innerHeight
})

Vue.mixin({
  computed: {
    windowWidth: () => $state.windowWidth,
    windowHeight: () => $state.windowHeight,
    leftAsideWidth: () => $state.leftAsideWidth,
    showLayers: () => $state.showLayers,
    showInspector: () => $state.showInspector,
    previewMode: () => $state.previewMode,
  },
  methods: {
    $alterLeftAsideWidth: (n: number) => {
      let width = $state.leftAsideWidth + n

      if (width < 150) {
        width = 150
      } else if (width > $state.windowWidth / 2) {
        width = $state.windowWidth / 2
      }
      $state.leftAsideWidth = width
    },
  },
})

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
