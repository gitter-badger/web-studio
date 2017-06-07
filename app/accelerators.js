const isMac = process.platform === 'darwin'
const prefix = isMac ? 'Cmd' : 'Ctrl'

const applicationMenu = {
  preferences: ',',
  quit: isMac ? 'Q' : '',

  // Shell/File menu
  newWindow: 'N',
  newTab: 'T',
  splitVertically: isMac ? 'D' : 'Shift+E',
  splitHorizontally: isMac ? 'Shift+D' : 'Shift+O',
  closeSession: 'W',
  closeWindow: 'Shift+W',

  // Edit menu
  undo: 'Z',
  redo: 'Shift+Z',
  cut: 'X',
  copy: isMac ? 'C' : 'Shift+C',
  paste: 'V',
  selectAll: 'A',
  clear: 'K',
  emojis: isMac ? 'Ctrl+Cmd+Space' : '',

  // View menu
  reload: 'R',
  fullReload: 'Shift+R',
  toggleDevTools: isMac ? 'Alt+I' : 'Shift+I',
  resetZoom: '0',
  zoomIn: 'plus',
  zoomOut: '-',

  // Plugins menu
  updatePlugins: 'Shift+U',

  // Window menu
  minimize: 'M',
  showPreviousTab: 'Alt+Left',
  showNextTab: 'Alt+Right',
  selectNextPane: 'Ctrl+Alt+Tab',
  selectPreviousPane: 'Ctrl+Shift+Alt+Tab',
  enterFullScreen: isMac ? 'Ctrl+Cmd+F' : 'F11'
}

const wsFunctions = {

}

const allAccelerators = Object.assign({}, applicationMenu, wsFunctions)
const cache = [] // we store the shortcuts so we don't need to look into the `allAccelerators` everytime

for (const key in allAccelerators) {
  if ({}.hasOwnProperty.call(allAccelerators, key)) {
    let value = allAccelerators[key]
    if (value) {
      if (value.startsWith('+')) {
        // we don't need to add the prefix to accelerators starting with `+`
        value = value.slice(1)
      } else if (!value.startsWith('Ctrl')) { // nor to the ones starting with `Ctrl`
        value = `${prefix}+${value}`
      }
      cache.push(value.toLowerCase())
      allAccelerators[key] = value
    }
  }
}

// decides if a keybard event is a Hyper Accelerator
function isAccelerator (e) {
  let keys = []
  if (!e.ctrlKey && !e.metaKey && !e.altKey) {
    // all accelerators needs Ctrl or Cmd or Alt
    return false
  }

  if (e.ctrlKey) {
    keys.push('ctrl')
  }
  if (e.metaKey && isMac) {
    keys.push('cmd')
  }
  if (e.shiftKey) {
    keys.push('shift')
  }
  if (e.altKey) {
    keys.push('alt')
  }

  if (e.key === ' ') {
    keys.push('space')
  } else {
    // we need `toLowerCase` for when the shortcut has `shift`
    // we need to replace `arrow` when the shortcut uses the arrow keys
    keys.push(e.key.toLowerCase().replace('arrow', ''))
  }

  keys = keys.join('+')
  return cache.includes(keys)
}

module.exports = {
  accelerators: allAccelerators,
  isAccelerator
}
