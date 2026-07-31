import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProduct, getRelatedProducts } from '../api/products';
import { getReviews, addReview, deleteReview } from '../api/reviews';
import { Product, Review } from '../types';

// `initialData` covers the fast-path where a full product is already passed
// via route.params (from a product list) — no loading flash, and React
// Query still keys/caches it by id like any other product fetch.
export const useProduct = (id?: string, initialData?: Product) => {
    return useQuery<Product>({
        queryKey: ['product', id],
        queryFn: async () => {
            const res = await getProduct(id!);
            return res.data;
        },
        enabled: !!id,
        initialData,
    });
};

export const useRelatedProducts = (id?: string) => {
    return useQuery<Product[]>({
        queryKey: ['relatedProducts', id],
        queryFn: async () => {
            const res = await getRelatedProducts(id!);
            return res.data ?? [];
        },
        enabled: !!id,
    });
};

export const useReviews = (productId?: string) => {
    return useQuery<Review[]>({
        queryKey: ['reviews', productId],
        queryFn: async () => {
            const res = await getReviews(productId!);
            return res.data ?? [];
        },
        enabled: !!productId,
    });
};

export const useAddReview = (productId?: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { rating: number; comment: string }) => addReview(productId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
        },
    });
};

export const useDeleteReview = (productId?: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (reviewId: string) => deleteReview(reviewId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
        },
    });
};
