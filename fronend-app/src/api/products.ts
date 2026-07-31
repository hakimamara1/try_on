import client from './client';
import { ProductsResponse, CategoriesResponse, ProductQueryParams, Product } from '../types';

export const getProducts = async (params?: ProductQueryParams): Promise<ProductsResponse> => {
    try {
        const response = await client.get('/products', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
};

export const getProduct = async (id: string): Promise<{ success: boolean; data: Product }> => {
    try {
        const response = await client.get(`/products/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching product ${id}:`, error);
        throw error;
    }
};

export const getCategories = async (): Promise<CategoriesResponse> => {
    try {
        const response = await client.get('/products/categories');
        return response.data;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

export const getRelatedProducts = async (id: string): Promise<ProductsResponse> => {
    try {
        const response = await client.get(`/products/related/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching related products for ${id}:`, error);
        throw error;
    }
};
