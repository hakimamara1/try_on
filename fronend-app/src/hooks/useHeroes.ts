import { useQuery } from '@tanstack/react-query';
import { getHeroes } from '../api/hero';

export const useHeroes = () => {
    return useQuery({
        queryKey: ['heroes'],
        queryFn: getHeroes,
    });
};
