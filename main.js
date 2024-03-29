const { app, Menu, BrowserWindow, ipcMain } = require('electron')

const path = require('path')
const url = require('url')
const fs = require('fs')
const os = require('os')
var sizeOf = require('image-size')
const originFolder = os.homedir() + '\\AppData\\Local\\Packages\\' +
    'Microsoft.Windows.ContentDeliveryManager_cw5n1h2txyewy\\LocalState\\Assets\\';
const dialog = require('electron').dialog

var tmpDirPhotos = '.tmpPhotos'
let mainWindow
var html
var nPhotos = 0

const template = [
    {
        label: 'Opcoes',
        submenu: [
            {
                label: 'Descarregar',
                accelerator: 'CmdOrCtrl+D',
                click() { downloadSelected() }
            },
            { type: 'separator' },
            {
                label: 'Selecao',
                submenu: [
                    {
                        label: 'Marcar todas',
                        accelerator: 'CmdOrCtrl+A',
                        click() { selectAll() }
                    },
                    {
                        label: 'Desmarcar todas',
                        click() { unselectAll() }
                    }
                ]
            },
            { type: 'separator' },
            { label: 'Recarregar', role: 'reload' },
            { label: 'Ecra completo', role: 'togglefullscreen' }
        ]
    },
    { label: 'Sair', role: 'quit' }
]

function downloadSelected()
{

}

function selectAll()
{

}

function unselectAll()
{

}

app.on('ready', function () {
    mainWindow = new BrowserWindow({ width: 860, height: 600 })

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }))

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)

    html = '<table><tr>'
    fs.readdir(originFolder, (err, files) => {
        files.forEach(file => {
            var dimensions = sizeOf(originFolder + '\\' + file)
            if (dimensions.width > dimensions.height)
            {
                fs.createReadStream(originFolder + '\\' + file)
                    .pipe(fs.createWriteStream(tmpDirPhotos + '\\' + file + '.jpg'))
                if (nPhotos++ % 5 == 0) {
                    html += '</tr><tr>'
                }
                html += '<td><img width="150" height="150" src="' + tmpDirPhotos +
                    '\\' + file + '.jpg" onclick="addSelected(this)" /></td>'
            }
        })
        html += '</tr></table>'
    })

    ipcMain.on('load-photos', (event, status) => {
        console.log(status)
        event.returnValue = html
    })
    ipcMain.on('download-photos', (event, status) => {
        var paths = dialog.showOpenDialog(mainWindow, {
            properties: ['openDirectory']
        })
        var i
        for (i = 0; i < status.length; i++) {
            fs.createReadStream(tmpDirPhotos + '\\' + path.basename(status[i]))
                .pipe(fs.createWriteStream(paths[0] + '\\' + path.basename(status[i])))
        }
        mainWindow.reload();
    })
    //mainWindow.webContents.openDevTools()
    mainWindow.on('closed', function () {
        mainWindow = null
    })
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        fs.readdir(tmpDirPhotos, (err, files) => {
            files.forEach(file => {
                fs.unlinkSync(tmpDirPhotos + '\\' + file)
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
