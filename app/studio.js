const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')
const async = require('async')
const _ = require('lodash')
const dev = require('./dev')
const storage = require('./storage')
const utils = require('./utils')

let editors = new Map()
let currentEditor = null
let welcomeWindow = null
let editorIndex = 0

class Editor {
  constructor (id, savePath, web, bw) {
    this.id = id
    this.bw = bw
    this.savePath = savePath
    this.web = _.assign({
      name: null,
      pages: [],
      components: [],
      extensions: [],
      idIndex: {},
      assetFiles: []
    }, web)
    this.sideBarWidth = storage.get('sideBarWidth', 300)
    this.showSidebar = storage.get('showSidebar', true)
    this.showInspector = storage.get('showInspector', true)
    this.editTab = 'pages'
    this.previewMode = false
    this.edited = false
    this.editHistory = [this.web]
    this.editHistoryPointer = 0
    this.fullscreen = bw.fullscreen
  }

  send () {
    this.bw.webContents.send.apply(this.bw.webContents, Array.prototype.slice.call(arguments, 0))
  }

  setBoth (key, value) {
    if (key in this) {
      this[key] = value
      this.send('editor-property', key, value)
    }
  }

  undo () {
    if (this.editHistoryPointer <= 0) {
      return
    }

    const web = this.editHistory[--this.editHistoryPointer]
    if (web) {
      this.setBoth('web', web)
      this.updateMenu()
    }
  }

  redo () {
    if (this.editHistoryPointer >= this.editHistory.length - 1) {
      return
    }

    const web = this.editHistory[++this.editHistoryPointer]
    if (web) {
      this.setBoth('web', web)
      this.updateMenu()
    }
  }

  updateMenu () {
    let menu = this._menu
    if (!menu) {
      menu = this._menu = require('./menu')
    }
    menu.enable(this)
  }

  save (as) {
    const _self = this
    let savePath = this.savePath

    if (!savePath || !!as) {
      savePath = dialog.showSaveDialog(_self.bw, {
        defaultPath: savePath,
        properties: ['createDirectory'],
        filters: [
          { name: 'Web Project Document', extensions: ['web'] }
        ]
      })
      if (!savePath) {
        return
      }
    }

    openFile(
      savePath,
      'w+',
      (fd, done) => {
        let buf = Buffer.from('WS\0\0\0\0')
        buf.writeUInt32LE(_self.web.assetFiles.length, 2)
        fs.write(fd, buf, (err) => {
          done(err)
        })
      },
      // (fd, written, done) => {
      //   // todo: write asset files
      // },
      (fd, done) => {
        let buf = Buffer.from(JSON.stringify(_self.web))
        fs.write(fd, buf, (err) => {
          if (err) {
            done(err)
            return
          }

          _self.savePath = savePath
          _self.edited = false
          _self.bw.setTitle(path.basename(savePath))
          _self.send('saved', savePath)
          done()
        })
      }
    )
  }

  export () {

  }

  import () {

  }

  press () {

  }
}

// app.on('ready', () => {
//   ipcMain.on('add-web-extensions', (e, id) => {
//     const editor = editors.get(id)

//     if (!editor) {
//       e.returnValue = false
//       return
//     }

//     dialog.showOpenDialog(editor.bw, {
//       properties: ['openFile', 'multiSelections'],
//       filters: [
//         { name: 'Web Project Document', extensions: ['web'] }
//       ]
//     }, function (filePaths) {
//       console.log(filePaths)
//     })
//   })

//   ipcMain.on('app-storage', (e, key, value) => {
//     if (!utils.isNEString(key)) {
//       e.returnValue = null
//       return
//     }

//     if (!_.isUndefined(value)) {
//       storage.set(key, value)
//       e.returnValue = true
//       return
//     }

//     e.returnValue = storage.get(key)
//   })
// })

function openProjectFile (projectPath) {
  const menu = require('./menu')

  if (!utils.isNEString(projectPath)) {
    openProject(null, {})
    return
  }

  if (!fs.existsSync(projectPath)) {
    menu.removeRecentFile(projectPath)
    warnDialog(`Path dose not exist\nThe Path '${projectPath}' does not seem to exist anymore on disk.`)
    return
  }

  openFile(
    projectPath,
    'r',
    (fd, done) => {
      fs.fstat(fd, (err, stats) => {
        if (err) {
          err = new Error('File can not be read')
        }
        done(err, stats)
      })
    },
    (fd, stats, done) => {
      fs.read(fd, Buffer.alloc(6), 0, 6, 0, (err, n, buffer) => {
        if (err) {
          err = new Error('File can not be read')
          done(err)
          return
        }

        if (n !== 6 || buffer.toString('utf8', 0, 2) !== 'WS') {
          menu.removeRecentFile(projectPath)
          done(new Error(`Invalid project document\nThe Path '${projectPath}' is not a valid Web Studio project document.`))
          return
        }

        done(null, _.assign(stats, { projectAssetNumber: buffer.readUInt32LE(2) }))
      })
    },
    (fd, stats, done) => {
      const metaDataSize = stats.size - stats.projectAssetNumber * 4 - 6

      if (metaDataSize < 2) {
        menu.removeRecentFile(projectPath)
        done(new Error(`Invalid project document\nThe Path '${projectPath}' is not a valid Web Studio project document.`))
        return
      }

      fs.read(fd, Buffer.alloc(metaDataSize), 0, metaDataSize, 6 + stats.projectAssetNumber * 4, (err, n, metaData) => {
        let meta

        if (!err) {
          try {
            meta = JSON.parse(metaData.toString())
          } catch (error) {
            err = new Error('bad project meta')
          }
        }

        if (err || n !== metaDataSize) {
          menu.removeRecentFile(projectPath)
          done(new Error(`Invalid project document\nThe Path '${projectPath}' is not a valid Web Studio project document.`))
          return
        }

        openProject(projectPath, meta)
        done()
      })
    }
  )
}

function openProject (projectPath, projectMeta) {
  const menu = require('./menu')
  const isNew = !utils.isNEString(projectPath)

  if (welcomeWindow !== null) {
    welcomeWindow.close()
    welcomeWindow = null
  }

  let editor = null

  if (!isNew) {
    editors.forEach((proj) => {
      if (proj.savePath === projectPath) {
        editor = proj
      }
    })
    if (editor !== null) {
      editor.bw.focus()
      return
    }
  }

  const id = ++editorIndex
  editor = new Editor(id, projectPath, projectMeta, createWindow({
    urlArgs: {
      editor: id
    },
    minWidth: 800,
    minHeight: 400,
    title: isNew ? 'Untitled.web' : path.basename(projectPath),
    titleBarStyle: 'hidden-inset',
    frame: process.platform === 'darwin',
    acceptFirstMouse: true,
    fullscreenable: true,
    saveState: 'editor'
  }))

  editor.bw.on('enter-full-screen', () => {
    editor.setBoth('fullscreen', true)
  })

  editor.bw.on('leave-full-screen', () => {
    editor.setBoth('fullscreen', false)
  })

  editor.updateMenu()
  editor.bw.on('focus', () => {
    currentEditor = editor
    editor.updateMenu()
  })

  editor.bw.on('closed', () => {
    editors.delete(editor.id)
    if (editors.size === 0) {
      welcome()
    }
  })

  currentEditor = editor
  editors.set(editor.id, editor)

  if (!isNew) {
    menu.addRecentFile(projectPath)
  }
}

function init (openFile) {
  ipcMain.on('editor-property', (e, id, v, noRecording) => {
    const editor = editors.get(id)

    if (!editor) {
      e.returnValue = false
      return
    }

    if (utils.isNEString(v)) {
      if (v in editor) {
        e.returnValue = editor[v]
      } else {
        e.returnValue = null
      }
    } else if (_.isArray(v)) {
      const returnValue = {}
      _.each(v, function (key) {
        if (utils.isNEString(key) && key in editor) {
          returnValue[key] = editor[key]
        }
      })
      e.returnValue = returnValue
    } else if (_.isPlainObject(v)) {
      _.each(v, (value, key) => {
        if (key in editor && typeof value === typeof editor[key] && value !== undefined) {
          editor[key] = value

          if (key === 'web') {
            if (noRecording === true) {
              editor.editHistory.splice(editor.editHistoryPointer, 1, value)
            } else {
              if (editor.editHistoryPointer < editor.editHistory.length - 1) {
                editor.editHistory.splice(editor.editHistoryPointer + 1, editor.editHistory.length - (editor.editHistoryPointer + 1))
              }
              editor.editHistory.push(value)
              editor.editHistoryPointer = editor.editHistory.length - 1
            }
            editor.edited = true
            editor.updateMenu()
          }
        }
      })
      e.returnValue = true
    } else {
      e.returnValue = false
    }
  })

  if (utils.isNEString(openFile)) {
    openProjectFile(openFile)
    return
  }

  welcome()
}

function welcome () {
  if (editors.size > 0 || welcomeWindow !== null) {
    return
  }

  const menu = require('./menu')

  welcomeWindow = createWindow({
    urlArgs: {
      welcome: true
    },
    width: 800,
    height: 400,
    frame: false,
    acceptFirstMouse: true,
    minimizable: false,
    maximizable: false,
    resizable: false,
    fullscreenable: false,
    saveState: 'welcome'
  })

  menu.disable()
  welcomeWindow.on('focus', () => {
    menu.disable()
  })

  welcomeWindow.on('closed', () => {
    welcomeWindow = null
  })
}

function config () {
  const menu = require('./menu')

  let preferencesWindow = createWindow({
    urlArgs: {
      preferences: true
    },
    width: 800,
    height: 400,
    title: 'Preferences',
    titleBarStyle: 'hidden-inset',
    frame: process.platform === 'darwin',
    acceptFirstMouse: true,
    minimizable: false,
    maximizable: false,
    resizable: false,
    fullscreenable: false,
    useContentSize: true,
    saveState: 'preferences'
  })

  menu.disable()
  preferencesWindow.on('focus', () => {
    menu.disable()
  })
}

function createWindow (options) {
  if (!_.isPlainObject(options)) {
    options = {}
  }

  const state = {}
  const saveState = utils.isNEString(options.saveState)

  if (saveState) {
    const stat = storage.get('bw_' + options.saveState + '_state')

    if (_.isObject(stat)) {
      _.each(stat, (value, key) => {
        state[key] = value
        options[key] = value
      })
    }
  }

  const urlArgs = []
  _.each(options.urlArgs, (value, key) => {
    urlArgs.push(`${key}=${value}`)
  })
  let url = global.env.isDev ? path.join(dev.addr(), 'app/index.html') : 'file://' + path.resolve(__dirname, 'index.html')
  if (urlArgs.length > 0) {
    url += '?' + urlArgs.join('&')
  }

  const win = new BrowserWindow(options)
  win.loadURL(url)

  if (!saveState) {
    return win
  }

  const savestate = () => storage.set('bw_' + options.saveState + '_state', state)

  win.on('moved', () => {
    const pos = win.getPosition()

    state.x = pos[0]
    state.y = pos[1]
    savestate()
  })

  if (options.resizable !== false) {
    win.on('resize', () => {
      const pos = win.getPosition()
      const size = win.getSize()

      state.x = pos[0]
      state.y = pos[1]
      state.width = size[0]
      state.height = size[1]
      savestate()
    })
  }

  if (options.maximizable !== false) {
    win.on('maximize', () => {
      state.maximize = true
      savestate()
    })

    win.on('unmaximize', () => {
      state.maximize = false
      savestate()
    })
  }

  return win
}

function warnDialog (message) {
  const msg = message.split('\n', 2)

  dialog.showMessageBox({
    type: 'info',
    buttons: ['OK'],
    message: msg[0],
    detail: msg[1]
  })
}

function openFile (path, flags) {
  const callbacks = Array.prototype.slice.call(arguments, 2)
  const n = callbacks.length
  if (n === 0) {
    return
  }

  fs.open(path, flags, (err, fd) => {
    if (err) {
      warnDialog(`File can not be open\nThe Path '${path}' can not be open.`)
      return
    }

    let i = 0
    let ret = null

    async.whilst(
      () => {
        return i < n
      },
      (done) => {
        let cb = callbacks[i]
        if (typeof cb === 'function') {
          let args = [fd]
          if (ret !== null && ret !== undefined) {
            args.push(ret)
          }
          args.push(function (err, newRet) {
            ret = newRet
            done(err)
          })
          cb.apply(null, args)
        } else {
          done()
        }
        i++
      },
      (err) => {
        if (err) {
          warnDialog(err.message)
        }
        fs.closeSync(fd)
      }
    )
  })
}

module.exports = {
  init,
  welcome,
  config,
  open: openProjectFile,
  save (as) {
    if (currentEditor) {
      currentEditor.save(as)
    }
  },
  export () {
    if (currentEditor) {
      currentEditor.export()
    }
  },
  import () {
    if (currentEditor) {
      currentEditor.import()
    }
  },
  press () {
    if (currentEditor) {
      currentEditor.press()
    }
  },
  undo () {
    if (currentEditor) {
      currentEditor.undo()
    }
  },
  redo () {
    if (currentEditor) {
      currentEditor.redo()
    }
  },
  showSidebar (ok) {
    if (currentEditor) {
      currentEditor.setBoth('showSidebar', ok)
    }
  },
  showInspector (ok) {
    if (currentEditor) {
      currentEditor.setBoth('showInspector', ok)
    }
  },
  previewMode (ok) {
    if (currentEditor) {
      currentEditor.setBoth('previewMode', ok)
    }
  }
}
