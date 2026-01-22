import client from './client';

export const getReviews = async (productId: string) => {
    try {
        const response = await client.get(`/reviews/${productId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const addReview = async (productId: string, data: { rating: number, comment: string }) => {
    try {
        const response = await client.post(`/reviews/${productId}`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};
