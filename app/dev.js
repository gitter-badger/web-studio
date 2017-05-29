const {spawn} = require('child_process')
const path = require('path')
const pathListSeparator = process.platform === 'win32' ? ';' : ':'
const localNodeBinPath = path.resolve(__dirname, '../node_modules/.bin')

let wdsProcess = null
let wdsAddr = null

function start () {
  let output = ''
  wdsProcess = spawn('webpack-dev-server', ['--hot'], {
    'PATH': `${localNodeBinPath}${pathListSeparator}${process.env.PATH}`,
    'NODE_ENV': 'development'
  })
  wdsProcess.stdout.on('data', (data) => {
    if (wdsAddr === null) {
      output += data
      output.replace(/http\:\/\/[a-z0-9\:\/]+/i, function (m) {
        wdsAddr = m
      })
    }

    console.log(String(data))
  })
  wdsProcess.stderr.on('data', (data) => {
    console.log(String(data))
  })
}

function stop () {
  if (wdsProcess !== null) {
    wdsProcess.kill()
    wdsProcess = null
  }
}

module.exports = {
  addr: () => { return wdsAddr },
  start,
  stop
}
