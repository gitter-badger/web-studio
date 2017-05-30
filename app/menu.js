const {app, shell} = require('electron')
const path = require('path')
const appVersion = app.getVersion()

let menuList = [
  {
    label: 'File',
    submenu: [
    ]
  },
  {
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
  },
  {
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
  },
  {
    role: 'window',
    submenu: [
      {
        role: 'minimize'
      },
      {
        role: 'close'
      }
    ]
  },
  {
    role: 'help',
    submenu: [
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

-

Web Studio ${appVersion}
Electron ${process.versions.electron}
${process.platform} ${process.arch} ${os.release()}`

          shell.openExternal(`https://github.com/ije/web-studio/issues/new?body=${encodeURIComponent(body)}`)
        }
      }
    ]
  }
]

if (process.platform === 'darwin') {
  menuList.unshift({
    label: 'Web Studio',
    submenu: [
      {
        role: 'about',
        label: 'About Web Studio'
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
        role: 'hide',
        label: 'Hide Web Studio'
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
        role: 'quit',
        label: 'Quit Web Studio'
      }
    ]
  })
  menuList[3].submenu = [
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
} else {
  menuList[0].submenu.push({
    role: 'quit'
  })

  menuList[4].submenu.push({
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

module.exports = menuList
