import client from './client';
import { Review, ReviewsResponse } from '../types';

export const getReviews = async (productId: string): Promise<ReviewsResponse> => {
    const response = await client.get(`/reviews/${productId}`);
    return response.data;
};

export const addReview = async (productId: string, data: { rating: number, comment: string }): Promise<{ success: boolean; data: Review }> => {
    const response = await client.post(`/reviews/${productId}`, data);
    return response.data;
};

export const deleteReview = async (reviewId: string): Promise<{ success: boolean }> => {
    const response = await client.delete(`/reviews/${reviewId}`);
    return response.data;
};
