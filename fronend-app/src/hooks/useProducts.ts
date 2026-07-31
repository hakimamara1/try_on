import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getProducts, getCategories } from '../api/products';
import { ProductQueryParams } from '../types';

export const useProducts = (params?: ProductQueryParams) => {
    return useQuery({
        queryKey: ['products', params],
        queryFn: () => getProducts(params),
        // Keep showing the previous result set while a new filter/sort/search
        // is in flight, instead of flashing a full skeleton grid every time.
        placeholderData: keepPreviousData,
    });
};

export const useCategories = () => {
    return useQuery({
        queryKey: ['categories'],
        queryFn: getCategories,
    });
};
