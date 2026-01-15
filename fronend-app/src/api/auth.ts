import client from './client';

export const register = async (name: string, email: string, password: string) => {
    try {
        const response = await client.post('/auth/register', { name, email, password });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const login = async (email: string, password: string) => {
    try {
        const response = await client.post('/auth/login', { email, password });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getMe = async () => {
    try {
        const response = await client.get('/auth/me');
        return response.data;
    } catch (error) {
        throw error;
    }
};
