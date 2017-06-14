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
      click () {
        studio.open()
      }
    },
    {
      label: 'Open...',
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
      click () {
        studio.save()
      }
    },
    {
      label: 'Save As...',
      click () {
        studio.save(true)
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Export...',
      click () {
        studio.export()
      }
    },
    {
      label: 'Import...',
      click () {
        studio.import()
      }
    },
    {
      label: 'Press...',
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
      role: 'undo'
    },
    {
      role: 'redo'
    },
    {
      type: 'separator'
    },
    {
      role: 'cut'
    },
    {
      role: 'copy'
    },
    {
      role: 'paste'
    },
    {
      role: 'pasteandmatchstyle'
    },
    {
      role: 'delete'
    },
    {
      role: 'selectall'
    }
  ]
}

let viewMenu = {
  label: 'View',
  submenu: [
    {
      role: 'reload'
    },
    {
      role: 'toggledevtools'
    },
    {
      type: 'separator'
    },
    {
      role: 'resetzoom'
    },
    {
      role: 'zoomin'
    },
    {
      role: 'zoomout'
    },
    {
      type: 'separator'
    },
    {
      role: 'togglefullscreen'
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

function install () {
  updateRecentFilesMenu()
  Menu.setApplicationMenu(Menu.buildFromTemplate(appMenuList))
}

// function update (handle) {
//   if (typeof handle === 'function') {
//     handle(appMenuList)
//   }
//   install()
// }

function addRecentFile (path) {
  let tmp = [path]
  _.each(recentFiles, (fp) => {
    if (fp !== path) {
      tmp.push(fp)
    }
  })
  recentFiles = tmp
  storage.set('recentFiles', recentFiles)
  install()
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
  install()
}

function clearRecentFiles () {
  recentFiles = []
  storage.set('recentFiles', recentFiles)
  install()
}

function updateRecentFilesMenu () {
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
}

module.exports = {
  install: () => {
    _.each(storage.get('recentFiles'), (value) => {
      if (utils.isNEString(value)) {
        recentFiles.push(value)
      }
    })
    install()
  },
  addRecentFile,
  removeRecentFile,
  clearRecentFiles
}
