const {app, BrowserWindow} = require('electron')
const path = require('path')
const fs = require('fs')
const tmpDir = app.getPath('temp')

function createPDF (filepath, html, css, done) {
  let tmpHtml = path.join(tmpDir, path.basename(filepath) + '.html')

  fs.writeFile(tmpHtml, `<!DOCTYPE html><html><head><style>${css}</style></head><body>${html}</body></html>`, function (error) {
    if (error) {
      throw err
    }

    let vwin = new BrowserWindow({
      show: true,
      webPreferences: {
        offscreen: true
      }
    })

    vwin.loadURL('file://' + tmpHtml)
    vwin.webContents.on('did-finish-load', () => {
      vwin.webContents.printToPDF({}, (error, data) => {
        setTimeout(function () {
          this.close()
        }.bind(vwin), 50)

        if (error) {
          throw err
        }

        fs.writeFile(filepath, data, (error) => {
          if (error) {
            throw err
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
