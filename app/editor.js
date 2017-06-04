const {BrowserWindow, dialog} = require('electron')
const path = require('path')
const fs = require('fs')
const _ = require('lodash')
const dev = require('./dev')
const storage = require('./storage')
const utils = require('./x/utils')
const Project = require('./project')

let currentProject = null
let openedProjects = []
let welcomeWindow = null

function open (projectPath) {
  const menu = require('./menu')
  const newProject = !utils.isNEString(projectPath)

  if (!newProject && !fs.existsSync(projectPath)) {
    menu.removeRecentFile(projectPath)
    dialog.showMessageBox({
      type: 'warn',
      title: 'Path dose not exist',
      message: `The Path '${projectPath}' does not seem to exist anymore on disk.`
    })
    return
  }

  if (welcomeWindow !== null) {
    welcomeWindow.close()
  }

  let project = null

  if (!newProject) {
    _.each(openedProjects, function (proj) {
      if (proj.path === projectPath) {
        project = proj
      }
    })
    if (project !== null) {
      project.bw.focus()
      return
    }
  }

  project = new Project(projectPath, createWindow({
    urlArgs: {
      project: newProject ? 'new' : encodeURIComponent(projectPath)
    },
    minWidth: 800,
    minHeight: 400,
    title: newProject ? 'untitled' : path.basename(projectPath),
    titleBarStyle: 'hidden-inset',
    frame: process.platform === 'darwin',
    acceptFirstMouse: true,
    saveState: 'editor'
  }))

  project.bw.on('focus', () => {
    currentProject = project
  })
  project.bw.on('closed', () => {
    var tmp = []
    _.each(openedProjects, function (proj) {
      if (proj.path !== project.path) {
        tmp.push(proj)
      }
    })
    openedProjects = tmp
  })
  currentProject = project
  openedProjects.push(project)
  if (!newProject) {
    menu.addRecentFile(projectPath)
  }
}

function init (openFile) {
  if (utils.isNEString(openFile)) {
    editor.open(openFile)
    return
  }

  if (openedProjects.length > 0 || welcomeWindow !== null) {
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
    fullscreenable: false
  })
  welcomeWindow.on('closed', () => {
    welcomeWindow = null
  })
}

function createWindow (options) {
  if (!_.isPlainObject(options)) {
    options = {}
  }

  let state = {}
  let saveState = utils.isNEString(options.saveState)

  if (saveState) {
    let stat = storage.get('bw_' + options.saveState + '_state')
    
    if (_.isObject(stat)) {
      _.each(stat, (value, key) => {
        state[key] = value
        options[key] = value
      })
    }
  }

  let win = new BrowserWindow(options)
  let urlArgs = []
  _.each(options.urlArgs, (value, key) => {
    urlArgs.push(`${key}=${value}`)
  })
  win.loadURL((dev.addr() ? path.join(dev.addr(), 'app') : 'file://' + path.resolve(__dirname, 'index.html')) + (urlArgs.length > 0 ? '?' + urlArgs.join('&') : ''))

  if (!saveState) {
    return win
  }

  win.on('resize', () => {
    let pos = win.getPosition()
    let size = win.getSize()

    state.x = pos[0]
    state.y = pos[1]
    state.width = size[0]
    state.height = size[1]
  })

  win.on('moved', () => {
    let pos = win.getPosition()

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
    storage.set('bw_' + options.saveState + '_state', state)
  })

  return win
}

module.exports = {
  init,
  open,
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
  }
}
