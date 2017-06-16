const { spawn } = require('child_process')
const path = require('path')
const localNodeBinPath = path.resolve(__dirname, '../node_modules/.bin')

let wdsProcess = null
let wdsAddr = null

function start () {
  console.log('start webpack-dev-server process...')
  wdsProcess = spawn('webpack-dev-server', ['--hot'], {
    'PATH': `${localNodeBinPath}${path.delimiter}${process.env.PATH}`,
    'NODE_ENV': 'development'
  })
  let output = ''
  wdsProcess.stdout.on('data', (data) => {
    data = String(data)
    if (wdsAddr === null) {
      output += data
      output.replace(/http:\/\/[a-z0-9:/]+/i, function (m) {
        wdsAddr = m
        output = null
      })
    }

    console.log(data)
  })
  wdsProcess.stderr.on('data', (data) => {
    console.log(String(data))
  })
}

function stop () {
  if (wdsProcess !== null) {
    console.log('stop webpack-dev-server process...')
    wdsProcess.kill()
    wdsProcess = null
  }
}

module.exports = {
  addr: () => wdsAddr,
  start,
  stop
}
