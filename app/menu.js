const {app, Menu, shell, dialog} = require('electron')
const os = require('os')
const path = require('path')
const _ = require('lodash')
const storage = require('./storage')
const {accelerators} = require('./accelerators')
const studio = require('./studio')
const utils = require('./x/utils')
const appVersion = app.getVersion()

let recentFiles = []
let recentFilesMenu = {
  label: 'Open Recent',
  submenu: null
}

let fileMenu = {
  label: 'File',
  submenu: [
    {
      label: 'New',
      accelerator: accelerators.new,
      click () {
        studio.open()
      }
    },
    {
      label: 'Open...',
      accelerator: accelerators.open,
      click () {
        dialog.showOpenDialog({
          multiSelections: false,
          filters: [
            {name: 'Web Project Document', extensions: ['web']},
            {name: 'All Files', extensions: ['*']}
          ]
        }, function (filePaths) {
          if (utils.isNEArray(filePaths)) {
            studio.open(filePaths[0])
          }
        })
      }
    },
    recentFilesMenu,
    {
      label: 'Save',
      accelerator: accelerators.save,
      enabled: false,
      click () {
        studio.save()
      }
    },
    {
      label: 'Save As...',
      accelerator: accelerators.saveAs,
      enabled: false,
      click () {
        studio.save(true)
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Import...',
      enabled: false,
      click () {
        studio.import()
      }
    },
    {
      label: 'Export...',
      enabled: false,
      click () {
        studio.export()
      }
    },
    {
      label: 'Press...',
      enabled: false,
      click () {
        studio.press()
      }
    }
  ]
}

let editMenu = {
  label: 'Edit',
  submenu: [
    {
      label: 'Undo',
      accelerator: accelerators.undo,
      check (editor) {
        return editor.editHistory.length > 0 && editor.editHistoryPointer > 0
      },
      click () {
        studio.undo()
      },
      enabled: false
    },
    {
      label: 'Redo',
      accelerator: accelerators.redo,
      check (editor) {
        return editor.editHistory.length > 0 && editor.editHistoryPointer < editor.editHistory.length - 1
      },
      click () {
        studio.redo()
      },
      enabled: false
    },
    {
      type: 'separator'
    }
  ]
}

let viewMenu = {
  label: 'View',
  submenu: [
    {
      role: 'resetzoom',
      enabled: false
    },
    {
      role: 'zoomin',
      enabled: false
    },
    {
      role: 'zoomout',
      enabled: false
    },
    {
      type: 'separator'
    },
    {
      label: 'Show Side Bar',
      type: 'checkbox',
      checkEditorProperty: 'showSidebar',
      click (menuItem) {
        storage.set('showSidebar', menuItem.checked)
        studio.showSidebar(menuItem.checked)
      },
      enabled: false,
      checked: false
    },
    {
      label: 'Show Inspector',
      type: 'checkbox',
      checkEditorProperty: 'showInspector',
      click (menuItem) {
        storage.set('showInspector', menuItem.checked)
        studio.showInspector(menuItem.checked)
      },
      enabled: false,
      checked: false
    },
    {
      label: 'Preview Mode',
      type: 'checkbox',
      checkEditorProperty: 'previewMode',
      click (menuItem) {
        studio.previewMode(menuItem.checked)
      },
      enabled: false,
      checked: false
    },
    {
      type: 'separator'
    },
    {
      role: 'togglefullscreen',
      enabled: false
    }
  ]
}

let windowMenu = {
  role: 'window',
  submenu: [
    {
      role: 'minimize'
    },
    {
      role: 'close'
    }
  ]
}

let helpMenu = {
  role: 'help',
  submenu: [
    {
      label: 'Web Studio Website',
      click () {
        shell.openExternal('http://ws.x-stud.io')
      }
    },
    {
      label: 'Created by studio X',
      click () {
        shell.openExternal('http://x-stud.io')
      }
    },
    {
      label: 'Report an Issue...',
      click () {
        const body = `
<!-- Please succinctly describe your issue and steps to reproduce it. -->


--
Web Studio ${appVersion} with Electron ${process.versions.electron}
System ${process.platform} ${process.arch} ${os.release()}`

        shell.openExternal(`https://github.com/ije/web-studio/issues/new?body=${encodeURIComponent(body)}`)
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Reload Studio',
      role: 'reload'
    },
    {
      role: 'toggledevtools'
    }
  ]
}

let macAppMenu = {
  label: 'Web Studio',
  submenu: [
    {
      role: 'about'
    },
    {
      type: 'separator'
    },
    {
      label: 'Preferences...',
      accelerator: accelerators.preferences,
      click () {
        studio.config()
      }
    },
    {
      type: 'separator'
    },
    {
      role: 'services',
      submenu: []
    },
    {
      type: 'separator'
    },
    {
      role: 'hide'
    },
    {
      role: 'hideothers'
    },
    {
      role: 'unhide'
    },
    {
      type: 'separator'
    },
    {
      role: 'quit'
    }
  ]
}

let appMenuList = [
  fileMenu,
  editMenu,
  viewMenu,
  windowMenu,
  helpMenu
]

if (process.platform === 'darwin') {
  windowMenu.submenu = [
    {
      role: 'close'
    },
    {
      role: 'minimize'
    },
    {
      role: 'zoom'
    },
    {
      type: 'separator'
    },
    {
      role: 'front'
    }
  ]

  appMenuList.unshift(macAppMenu)
} else {
  fileMenu.submenu.push({
    role: 'quit'
  })

  editMenu.submenu.push(
    {type: 'separator'},
    {
      label: 'Preferences...',
      accelerator: accelerators.preferences,
      click () {
        studio.config()
      }
    }
  )

  helpMenu.submenu.push({
    role: 'about',
    click () {
      dialog.showMessageBox({
        title: `About Web Studio`,
        message: `Web Studio ${appVersion}`,
        detail: 'Created by studio X',
        icon: path.join(__dirname, 'static/icon.png'),
        buttons: []
      })
    }
  })
}

function setMenu () {
  Menu.setApplicationMenu(Menu.buildFromTemplate(appMenuList))
}

function updateMenu () {
  let submenu = []
  _.each(recentFiles, (fp) => {
    submenu.push({
      label: path.basename(fp),
      path: fp,
      click (item) {
        studio.open(item.path)
      }
    })
  })

  if (submenu.length === 0) {
    recentFilesMenu.enabled = false
    recentFilesMenu.submenu = null
    setMenu()
    return
  }

  submenu.push({
    type: 'separator'
  })
  submenu.push({
    label: 'Clear Recent',
    click () {
      clearRecentFiles()
    }
  })
  recentFilesMenu.enabled = true
  recentFilesMenu.submenu = submenu
  setMenu()
}

function addRecentFile (path) {
  let tmp = [path]
  _.each(recentFiles, (fp) => {
    if (fp !== path) {
      tmp.push(fp)
    }
  })
  recentFiles = tmp
  storage.set('recentFiles', recentFiles)
  updateMenu()
}

function removeRecentFile (path) {
  let tmp = []
  _.each(recentFiles, (fp) => {
    if (fp !== path) {
      tmp.push(fp)
    }
  })
  recentFiles = tmp
  storage.set('recentFiles', recentFiles)
  updateMenu()
}

function clearRecentFiles () {
  recentFiles = []
  storage.set('recentFiles', recentFiles)
  updateMenu()
}

function update (editor) {
  _.each(appMenuList, (menu) => {
    _.each(menu.submenu, (item) => {
      if ('enabled' in item) {
        if (item.type === 'checkbox' && utils.isNEString(item.checkEditorProperty) && item.checkEditorProperty in editor) {
          item.checked = editor[item.checkEditorProperty]
          item.enabled = true
        } else if (_.isFunction(item.check)) {
          item.enabled = item.check(editor) === true
        } else {
          item.enabled = true
        }
      }
    })
  })
  setMenu()
}

function disable () {
  _.each(appMenuList, (menu) => {
    _.each(menu.submenu, (item) => {
      if ('enabled' in item) {
        item.enabled = false
        if (item.type === 'checkbox') {
          item.checked = false
        }
      }
    })
  })
  setMenu()
}

module.exports = {
  install: () => {
    _.each(storage.get('recentFiles'), (value) => {
      if (utils.isNEString(value)) {
        recentFiles.push(value)
      }
    })
    updateMenu()
  },
  addRecentFile,
  removeRecentFile,
  clearRecentFiles,
  update,
  disable
}
