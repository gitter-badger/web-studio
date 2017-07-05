const {app} = require('electron')
const path = require('path')
const fs = require('fs')
const utils = require('./x/utils')
const storageSavePath = path.join(app.getPath('userData'), 'storage.json')

let storage = {}
let delaySaveTimer = null

function read () {
  try {
    let data = JSON.parse(fs.readFileSync(storageSavePath).toString())
    for (let key in data) {
      storage[key] = data[key]
    }
  } catch (e) {}
}

function save () {
  try {
    fs.writeFileSync(storageSavePath, JSON.stringify(storage, null, '\t'))
  } catch (e) {}
}

function delaySave () {
  if (delaySaveTimer !== null) {
    clearTimeout(delaySaveTimer)
  }
  delaySaveTimer = setTimeout(() => {
    delaySaveTimer = null
    save()
  }, 1000)
}

module.exports = {
  get: (key, def) => {
    if (!utils.isNEString(key)) {
      return undefined
    }

    if (key in storage) {
      return storage[key]
    }

    return def
  },
  set: (key, value) => {
    if (!utils.isNEString(key) || value === undefined) {
      return
    }

    storage[key] = value
    delaySave()
  },
  delete: (key) => {
    if (!utils.isNEString(key)) {
      return
    }

    delete storage[key]
    delaySave()
  },
  read,
  save
}
