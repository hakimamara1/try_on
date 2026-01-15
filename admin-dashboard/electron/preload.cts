import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    // Placeholders for now
    ping: () => ipcRenderer.invoke('ping'),
});
