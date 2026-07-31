import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    // Placeholders for now
    ping: () => ipcRenderer.invoke('ping'),
    auth: {
        getToken: (): Promise<string | null> => ipcRenderer.invoke('auth:getToken'),
        setToken: (token: string): Promise<void> => ipcRenderer.invoke('auth:setToken', token),
        clearToken: (): Promise<void> => ipcRenderer.invoke('auth:clearToken'),
    },
});
