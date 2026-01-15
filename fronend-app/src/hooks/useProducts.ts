import { useQuery } from '@tanstack/react-query';
import { getProducts, getCategories } from '../api/products';

export const useProducts = () => {
    return useQuery({
        queryKey: ['products'],
        queryFn: getProducts,
    });
};

export const useCategories = () => {
    return useQuery({
        queryKey: ['categories'],
        queryFn: getCategories,
    });
};
