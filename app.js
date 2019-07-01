const upload = require('./services/upload');
const { app, BrowserWindow, ipcMain } = require('electron')

let win;

function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        width: 1000,
        height: 700,
        resizable: false,
        show: false,
        frame: false,
        webPreferences: {
            nodeIntegration: true
        }
    })
    win.setMenuBarVisibility(false)
    win.loadFile('app/index.html')
    win.once('ready-to-show', () => {
        setTimeout(() => {
            win.show()
        }, 500);
    })
}

app.on('ready', createWindow);

ipcMain.on('upload', async(event, arg) => {
    let dir = arg['dir'],
        name = arg['name'];

    try {
        let res = await upload(dir, name);
        event.returnValue = res;
    } catch (error) {
        event.returnValue = false;
    }
})

ipcMain.on('main', async(event, arg) => {
    win.setResizable(true);
    win.setFullScreen(true);
});

ipcMain.on('login', async(event, arg) => {
    win.setResizable(false);
    win.setFullScreen(false);
    win.setSize(1000, 700);
    win.center();
});