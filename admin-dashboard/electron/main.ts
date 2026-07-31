import { app, BrowserWindow, ipcMain, safeStorage } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tokenFilePath = () => path.join(app.getPath('userData'), 'auth.token');

// The admin JWT is encrypted at rest with the OS keychain (via safeStorage)
// instead of living in the renderer's localStorage, which is readable by any
// script that ever runs in that page (XSS, a compromised dependency, etc).
ipcMain.handle('auth:getToken', () => {
    try {
        if (!safeStorage.isEncryptionAvailable() || !fs.existsSync(tokenFilePath())) return null;
        return safeStorage.decryptString(fs.readFileSync(tokenFilePath()));
    } catch {
        return null;
    }
});

ipcMain.handle('auth:setToken', (_event, token: string) => {
    if (!safeStorage.isEncryptionAvailable()) return;
    fs.writeFileSync(tokenFilePath(), safeStorage.encryptString(token));
});

ipcMain.handle('auth:clearToken', () => {
    if (fs.existsSync(tokenFilePath())) {
        fs.unlinkSync(tokenFilePath());
    }
});

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true,
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
