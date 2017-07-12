const { spawn } = require('child_process')
const path = require('path')
const localNodeBinPath = path.resolve(__dirname, '../node_modules/.bin')

let wdsProcess = null
let wdsAddr = null

function start () {
  console.log('Start webpack-dev-server process...')
  wdsProcess = spawn('webpack-dev-server', ['--hot'], {
    'PATH': `${localNodeBinPath}${path.delimiter}${process.env.PATH}`,
    'NODE_ENV': 'development'
  })
  let output = ''
  wdsProcess.stdout.on('data', (data) => {
    if (wdsAddr === null) {
      output += String(data)
      output.replace(/http:\/\/(localhost|127\.0\.0\.1):\d+/i, function (m) {
        wdsAddr = m
        output = null
      })
    }
    process.stdout.write(data)
  })
  wdsProcess.stderr.on('data', (data) => {
    process.stdout.write(data)
  })
}

function stop () {
  if (wdsProcess !== null) {
    console.log('Stop webpack-dev-server process...')
    wdsProcess.kill()
    wdsProcess = null
  }
}

module.exports = {
  addr: () => wdsAddr,
  start,
  stop
}
