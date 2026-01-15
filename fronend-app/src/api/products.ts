import client from './client';

export const getProducts = async () => {
    try {
        const response = await client.get('/products');
        return response.data;
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
};

export const getProduct = async (id: string) => {
    try {
        const response = await client.get(`/products/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching product ${id}:`, error);
        throw error;
    }
};

export const getCategories = async () => {
    try {
        const response = await client.get('/products/categories');
        return response.data;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};
