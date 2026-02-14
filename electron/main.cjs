const { app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow() {
    const win = new BrowserWindow({
        width: 900,
        height: 700,
        minWidth: 400,
        minHeight: 500,
        title: 'Курбон',
        icon: path.join(__dirname, '../public/icon.png'),
        backgroundColor: '#0a0a1a',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
        autoHideMenuBar: true,
        frame: true,
        resizable: true,
        show: false,
    })

    // Load the built Vite app
    win.loadFile(path.join(__dirname, '../dist/index.html'))

    win.once('ready-to-show', () => {
        win.show()
    })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    app.quit()
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})
