const {app, ipcMain, shell} = require('electron')
const dev = require('./dev')
const menu = require('./menu')
const storage = require('./storage')
const studio = require('./studio')
const htmlpdf = require('./x/htmlpdf')
const { default: installExtension, VUEJS_DEVTOOLS } = require('electron-devtools-installer')

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

  if (global.env.isDev) {
    console.log(`Installing devtools extensions...`)
    installExtension(VUEJS_DEVTOOLS).then((name) => {
      console.log(`Added extension:  ${name}`)
      startDev()
    }).catch((err) => {
      console.log(err)
      startDev()
    })
  } else {
    studio.init(openFile)
  }

  function startDev () {
    dev.start()
    let checkDevAddrInterval = setInterval(() => {
      if (dev.addr() !== null) {
        clearInterval(checkDevAddrInterval)
        studio.init(openFile)
      }
    }, 100)
  }
})

// On macOS it's common to re-create a window in the app
// when the dock icon is clicked and there are no other windows open.
app.on('activate', () => {
  studio.init()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  storage.save()
  if (global.env.isDev) {
    dev.stop()
  }
})
