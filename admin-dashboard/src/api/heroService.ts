import api from './axios';

export interface Hero {
    _id: string;
    title: string;
    subtitle: string;
    image: string;
    ctaText: string;
    linkType: 'product' | 'category' | 'external' | 'none';
    linkValue: string;
    order: number;
    isActive: boolean;
}

export const getHeroes = async () => {
    const response = await api.get('/heroes');
    return response.data;
};

export const createHero = async (data: Partial<Hero>) => {
    const response = await api.post('/heroes', data);
    return response.data;
};

export const updateHero = async (id: string, data: Partial<Hero>) => {
    const response = await api.put(`/heroes/${id}`, data);
    return response.data;
};

export const deleteHero = async (id: string) => {
    const response = await api.delete(`/heroes/${id}`);
    return response.data;
};
