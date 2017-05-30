const {app, BrowserWindow, ipcMain, Menu, shell} = require('electron')
const path = require('path')
const fs = require('fs')
const dev = require('./dev')
const menuList = require('./menu')
const htmlpdf = require('./htmlpdf')

global.env = {
  isDev: process.defaultApp || /[\\/]electron-prebuilt[\\/]/.test(process.execPath) || /[\\/]electron[\\/]/.test(process.execPath)
}

let mainWindow = null

app.on('ready', () => {
  Menu.setApplicationMenu(Menu.buildFromTemplate(menuList))

  ipcMain.on('create-pdf', (e, filepath, html, css) => {
    htmlpdf.create(filepath, html, css + '\n.page-break{page-break-before: always!important;}', () => {
      shell.openExternal(filepath)
    })
  })

  if (env.isDev) {
    dev.start()
    ipcMain.on('dev-server-status', (e) => {
      e.sender.send('dev-server-addr', dev.addr())
    })
  }

  createMainWindow()
})

// On macOS it's common to re-create a window in the app when the dock icon is clicked and there are no other windows open.
app.on('activate', () => {
  if (mainWindow === null) {
    createMainWindow()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', function () {
  dev.stop()
})

app.on('open-file', (e, path) => {

})

function createMainWindow () {
  mainWindow = createWindow(`file://${path.resolve(__dirname, (env.isDev ? 'dev' : 'index') + '.html')}`, {
    minWidth: 800,
    minHeight: 400,
    titleBarStyle: 'hidden-inset',
    frame: process.platform === 'darwin',
    transparent: process.platform === 'darwin',
    backgroundColor: '#fff',
    acceptFirstMouse: true,
    saveState: 'main'
  })
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function createWindow (url, options) {
  if (typeof options !== 'object' || options === null) {
    options = {}
  }

  let state = {}
  let stateSavePath = null

  if (options.saveState) {
    stateSavePath = path.join(app.getPath('userData'), 'bw_' + options.saveState + '_state.json')

    try {
      state = JSON.parse(fs.readFileSync(stateSavePath).toString())
      for (let key in state) {
        options[key] = state[key]
      }
    } catch (e) {}
  }

  if (typeof options.minWidth === 'number' && options.width < options.minWidth) {
    options.width = options.minWidth
  }
  if (typeof options.minHeight === 'number' && options.height < options.minHeight) {
    options.height = options.minHeight
  }

  let win = new BrowserWindow(options)
  win.loadURL(url)

  if (stateSavePath === null) {
    return win
  }

  win.on('resize', () => {
    var size = win.getSize()

    state.width = size[0]
    state.height = size[1]
  })

  win.on('moved', () => {
    var pos = win.getPosition()

    state.x = pos[0]
    state.y = pos[1]
  })

  win.on('maximize', () => {
    state.maximize = true
  })

  win.on('unmaximize', () => {
    state.maximize = false
  })

  win.on('enter-full-screen', () => {
    state.fullscreen = true
  })

  win.on('leave-full-screen', () => {
    state.fullscreen = false
  })

  win.on('closed', () => {
    try {
      fs.writeFileSync(stateSavePath, JSON.stringify(state))
    } catch (e) {}
  })

  return win
}
