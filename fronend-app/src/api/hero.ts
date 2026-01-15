import client from './client';

export interface Hero {
    _id: string;
    title: string;
    subtitle: string;
    image: string;
    ctaText: string;
    linkType: 'product' | 'category' | 'external' | 'none';
    linkValue: string;
    order: number;
}

export interface HeroResponse {
    success: boolean;
    count: number;
    data: Hero[];
}

export const getHeroes = async (): Promise<Hero[]> => {
    try {
        const response = await client.get<HeroResponse>('/heroes');
        return response.data.data;
    } catch (error) {
        console.error('Error fetching heroes:', error);
        throw error;
    }
};
