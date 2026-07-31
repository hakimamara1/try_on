// Stores the admin JWT via Electron's safeStorage (OS keychain-encrypted)
// when running packaged, falling back to localStorage only when the app is
// opened directly in a browser during development (no electronAPI bridge).
export async function getToken(): Promise<string | null> {
    if (window.electronAPI?.auth) {
        return window.electronAPI.auth.getToken();
    }
    return localStorage.getItem('token');
}

export async function setToken(token: string): Promise<void> {
    if (window.electronAPI?.auth) {
        await window.electronAPI.auth.setToken(token);
        return;
    }
    localStorage.setItem('token', token);
}

export async function clearToken(): Promise<void> {
    if (window.electronAPI?.auth) {
        await window.electronAPI.auth.clearToken();
        return;
    }
    localStorage.removeItem('token');
}
