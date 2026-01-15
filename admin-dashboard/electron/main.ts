import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            nodeIntegration: false,
            contextIsolation: true,
        },
        icon: path.join(__dirname, 'icon.png'),
    });

    // In dev, load valid URL. In prod, load index.html
    const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';

    if (!app.isPackaged) {
        win.loadURL(devUrl);
        win.webContents.openDevTools(); // Open manually with Ctrl+Shift+I to see logs
    } else {
        win.loadFile(path.join(__dirname, '../dist/index.html'));
    }
}

// Remove aggressive switches that cause GPU crashes
// The Autofill warnings are harmless internal Electron logs when DevTools is open.


app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
