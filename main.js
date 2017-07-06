const { app, BrowserWindow, ipcMain } = require('electron')

const path = require('path')
const url = require('url')
const fs = require('fs')
const os = require('os')
const testFolder = os.homedir() + '\\AppData\\Local\\Packages\\Microsoft.Windows.ContentDeliveryManager_cw5n1h2txyewy\\LocalState\\Assets\\';

var tmpDirPhotos = '.tmpPhotos'
let mainWindow

app.on('ready', function () {
    mainWindow = new BrowserWindow({ width: 800, height: 600 })

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }))

    ipcMain.on('online-status-changed', (event, status) => {
        console.log(status)
        event.returnValue = 'hello'
    })

    mainWindow.webContents.openDevTools()

    fs.readdir(testFolder, (err, files) => {
        files.forEach(file => {
            fs.createReadStream(testFolder + '\\' + file)
                .pipe(fs.createWriteStream(tmpDirPhotos + '\\' + file + '.jpg'))
        })
    })

    mainWindow.on('closed', function () {
        mainWindow = null
    })
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        fs.readdir(testFolder, (err, files) => {
            files.forEach(file => {
                fs.unlinkSync(tmpDirPhotos + '\\' + file + '.jpg')
            })
            fs.rmdirSync(tmpDirPhotos)
        })
        app.quit()
    }
})

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow()
    }
})

app.on('ready', () => {
    if (!fs.existsSync(tmpDirPhotos)) {
        fs.mkdirSync(tmpDirPhotos)
    }
})
