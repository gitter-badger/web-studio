const {app, ipcMain, shell} = require('electron')
const dev = require('./dev')
const menu = require('./menu')
const storage = require('./storage')
const editor = require('./editor')
const htmlpdf = require('./x/htmlpdf')

global.env = {
  isDev: process.defaultApp || /[\\/]electron-prebuilt[\\/]/.test(process.execPath) || /[\\/]electron[\\/]/.test(process.execPath)
}

let openFile = null

if (process.platform === 'darwin') {
  app.on('open-file', (e, path) => {
    e.preventDefault()
    openFile = path
  })
} else {
  // todo: parse process.argv (in the main process) to get the open file.
}

app.on('ready', () => {
  storage.read()
  menu.install()

  ipcMain.on('create-pdf', (e, filepath, html, css) => {
    htmlpdf.create(filepath, html, css + '\n.page-break{page-break-before: always!important;}', () => {
      shell.openExternal(filepath)
    })
  })

  if (env.isDev) {
    dev.start()
    let checkDevAddrInterval = setInterval(() => {
      if (dev.addr() !== null) {
        clearInterval(checkDevAddrInterval)
        editor.init(openFile)
      }
    }, 100)
  } else {
    editor.init(openFile)
  }
})

// On macOS it's common to re-create a window in the app when the dock icon is clicked and there are no other windows open.
app.on('activate', () => {
  editor.init()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  storage.save()
  if (env.isDev) {
    dev.stop()
  }
})
