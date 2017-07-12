import url from 'url'
import editor from './editor'
import welcome from './welcome'
import preferences from './preferences'
import './assets/ui.less'

const urlQuery = url.parse(window.location.href, true).query

if ('project' in urlQuery && /^\d+$/.test(urlQuery.project)) {
  editor()
} else if ('preferences' in urlQuery) {
  preferences()
} else {
  welcome()
}
