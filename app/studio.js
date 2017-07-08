const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')
const async = require('async')
const _ = require('lodash')
const dev = require('./dev')
const storage = require('./storage')
const utils = require('./x/utils')

let projects = new Map()
let currentProject = null
let welcomeWindow = null
let projectIdIndex = 0

class Project {
  constructor (pid, savePath, meta, bw) {
    this.id = pid
    this.bw = bw
    this.savePath = savePath
    this.meta = Object.assign({
      assetFiles: [],
      layers: []
    }, meta)
    this.leftAsideWidth = storage.get('leftAsideWidth', 300)
    this.showLayers = storage.get('showLayers', true)
    this.showInspector = storage.get('showInspector', true)
    this.previewMode = false
  }

  send () {
    this.bw.webContents.send.apply(this.bw.webContents, Array.prototype.slice.call(arguments, 0))
  }

  setBoth (key, value) {
    if (key in this) {
      this.key = value
      this.send('project-property', key, value)
    }
  }

  undo () {
    this.send('undo')
  }

  redo () {
    this.send('undo')
  }

  save (as) {
    const _self = this
    let newPath = this.savePath

    if (!newPath || !!as) {
      newPath = dialog.showSaveDialog(this.bw, {
        defaultPath: this.savePath,
        filters: [
          { name: 'Web Project Document', extensions: ['web'] }
        ]
      })
      if (!newPath) {
        return
      }
    }

    openFile(
      newPath,
      'w+',
      (fd, done) => {
        let buf = Buffer.from('WS\0\0\0\0')
        buf.writeUInt32LE(_self.meta.assetFiles.length, 2)
        fs.write(fd, buf, (err) => {
          done(err)
        })
      },
      // (fd, written, done) => {
      //   // todo: write asset files
      // },
      (fd, done) => {
        let buf = Buffer.from(JSON.stringify(_self.meta))
        fs.write(fd, buf, (err) => {
          if (err) {
            done(err)
            return
          }

          _self.savePath = newPath
          _self.send('saved', path.basename(newPath))
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

        done(null, Object.assign(stats, { projectAssetNumber: buffer.readUInt32LE(2) }))
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
            err = new Error('bad meta')
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

  let project = null

  if (!isNew) {
    projects.forEach((proj) => {
      if (proj.savePath === projectPath) {
        project = proj
      }
    })
    if (project !== null) {
      project.bw.focus()
      return
    }
  }

  const pid = ++projectIdIndex
  const documentName = isNew ? 'Untitled.web' : path.basename(projectPath)
  project = new Project(pid, projectPath, projectMeta, createWindow({
    urlArgs: {
      documentName,
      project: pid
    },
    minWidth: 800,
    minHeight: 400,
    title: documentName,
    titleBarStyle: 'hidden-inset',
    frame: process.platform === 'darwin',
    acceptFirstMouse: true,
    saveState: 'editor'
  }))

  project.bw.on('closed', () => {
    projects.delete(project.id)
  })

  menu.enable(project)
  project.bw.on('focus', () => {
    currentProject = project
    menu.enable(project)
  })

  currentProject = project
  projects.set(project.id, project)

  if (!isNew) {
    menu.addRecentFile(projectPath)
  }
}

function init (openFile) {
  const menu = require('./menu')

  if (utils.isNEString(openFile)) {
    openProjectFile(openFile)
    return
  }

  if (projects.size > 0 || welcomeWindow !== null) {
    return
  }

  welcomeWindow = createWindow({
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

  const win = new BrowserWindow(options)
  const urlArgs = []
  _.each(options.urlArgs, (value, key) => {
    urlArgs.push(`${key}=${value}`)
  })
  win.loadURL((dev.addr() ? path.join(dev.addr(), 'app') : 'file://' + path.resolve(__dirname, 'index.html')) + (urlArgs.length > 0 ? '?' + urlArgs.join('&') : ''))

  if (!saveState) {
    return win
  }

  const savestate = function () {
    storage.set('bw_' + options.saveState + '_state', state)
  }

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

  if (options.fullscreenable !== false) {
    win.on('enter-full-screen', () => {
      state.fullscreen = true
      savestate()
    })

    win.on('leave-full-screen', () => {
      state.fullscreen = false
      savestate()
    })
  }

  win.on('closed', savestate)

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

function isProjectMetaObject (obj) {
  if (!_.isPlainObject(obj)) {
    return false
  }

  return true
}

app.on('ready', () => {
  ipcMain.on('app-storage', (e, key, value) => {
    if (!utils.isNEString(key)) {
      e.returnValue = null
      return
    }

    if (!_.isUndefined(value)) {
      storage.set(key, value)
      e.returnValue = true
      return
    }

    e.returnValue = storage.get(key)
  })

  ipcMain.on('project-property', (e, v) => {
    if (!currentProject) {
      e.returnValue = {}
      return
    }

    if (_.isArray(v)) {
      const returnValue = {}
      _.each(v, function (key) {
        if (utils.isNEString(key) && key in currentProject) {
          returnValue[key] = currentProject[key]
        }
      })
      e.returnValue = returnValue
      return
    }

    if (_.isPlainObject(v)) {
      _.each(v, (value, key) => {
        if (key in currentProject) {
          currentProject[key] = value
        }
      })
      e.returnValue = true
    }
  })

  ipcMain.on('project-meta', (e, pid, meta) => {
    const project = projects.get(pid)

    if (!project) {
      e.returnValue = null
      return
    }

    if (isProjectMetaObject(meta)) {
      project.meta = meta
      e.returnValue = true
      return
    }

    project.meta.savePath = project.savePath
    e.returnValue = project.meta
  })
})

module.exports = {
  init,
  config,
  open: openProjectFile,
  save (as) {
    if (currentProject) {
      currentProject.save(as)
    }
  },
  export () {
    if (currentProject) {
      currentProject.export()
    }
  },
  import () {
    if (currentProject) {
      currentProject.import()
    }
  },
  press () {
    if (currentProject) {
      currentProject.press()
    }
  },
  showLayers (ok) {
    if (currentProject) {
      currentProject.setBoth('showLayers', ok)
    }
  },
  showInspector (ok) {
    if (currentProject) {
      currentProject.setBoth('showInspector', ok)
    }
  },
  previewMode (ok) {
    if (currentProject) {
      currentProject.setBoth('previewMode', ok)
    }
  }
}
