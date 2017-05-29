const {app, BrowserWindow, ipcMain, Menu, shell} = require('electron')
const path = require('path')
const fs = require('fs')
const htmlpdf = require('./htmlpdf')
const menuList = require('./menu')
const dev = require('./dev')

global.mainWindow = null
global.isDev = process.defaultApp || /[\\/]electron-prebuilt[\\/]/.test(process.execPath) || /[\\/]electron[\\/]/.test(process.execPath)

app.on('ready', () => {
  Menu.setApplicationMenu(Menu.buildFromTemplate(menuList))

  ipcMain.on('create-pdf', (e, filepath, html, css) => {
    htmlpdf.create(filepath, html, css + '\n.page-break{page-break-before: always!important;}', () => {
      shell.openExternal(filepath)
    })
  })

  if (isDev) {
    dev.start()
    ipcMain.on('dev-server-status', (e) => {
      e.sender.send('dev-server-addr', dev.addr())
    })
  }

  createMainWindow()
})

// On macOS it's common to re-create a window in the app when the dock icon is clicked and there are no other windows open.
app.on('activate', () => {
  createMainWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', function () {
  dev.stop()
})

function createMainWindow () {
  global.mainWindow = createWindow({
    saveState: 'main',
    // titleBarStyle: 'hidden-inset',
    // frame: process.platform === 'darwin',
    url: `file://${path.resolve(__dirname, isDev ? 'dev' : 'index')}.html` 
  })
}

function createWindow (options) {
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

  let win = new BrowserWindow(options)
  win.loadURL(options.url)

  if (stateSavePath === null) {
    return win
  }

  win.on('closed', () => {
    try {
      fs.writeFileSync(stateSavePath, JSON.stringify(state))
    } catch (e) {}
  })

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

  return win
}
