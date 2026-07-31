import client from './client';

export const register = async (name: string, email: string, password: string) => {
    const response = await client.post('/auth/register', { name, email, password });
    return response.data;
};

export const login = async (email: string, password: string) => {
    const response = await client.post('/auth/login', { email, password });
    return response.data;
};

export const getMe = async () => {
    const response = await client.get('/auth/me');
    return response.data;
};

export const toggleWishlist = async (productId: string) => {
    const response = await client.put(`/auth/wishlist/${productId}`);
    return response.data;
};

export type UpdatableProfileFields = Partial<{
    name: string;
    phone: string;
    wilaya: string;
    commune: string;
}>;

export const updateDetails = async (data: UpdatableProfileFields) => {
    const response = await client.put('/auth/updatedetails', data);
    return response.data;
};
