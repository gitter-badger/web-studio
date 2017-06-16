const {app, BrowserWindow} = require('electron')
const path = require('path')
const fs = require('fs')
const tmpDir = app.getPath('temp')

function createPDF (filepath, html, css, done) {
  let tmpHtml = path.join(tmpDir, path.basename(filepath) + '.html')

  fs.writeFile(tmpHtml, `<!DOCTYPE html><html><head><style>${css}</style></head><body>${html}</body></html>`, (error) => {
    if (error) {
      throw error
    }

    let vm = new BrowserWindow({
      show: true,
      webPreferences: {
        offscreen: true
      }
    })

    vm.loadURL('file://' + tmpHtml)
    vm.webContents.on('did-finish-load', () => {
      vm.webContents.printToPDF({}, (error, data) => {
        setTimeout(function () {
          this.close()
        }.bind(vm), 50)

        if (error) {
          throw error
        }

        fs.writeFile(filepath, data, (error) => {
          if (error) {
            throw error
          }

          if (typeof done === 'function') {
            done()
          }
        })
      })
    })
  })
}

exports.create = createPDF
