export {};

declare global {
    interface Window {
        electronAPI?: {
            ping: () => Promise<unknown>;
            auth: {
                getToken: () => Promise<string | null>;
                setToken: (token: string) => Promise<void>;
                clearToken: () => Promise<void>;
            };
        };
    }
}
