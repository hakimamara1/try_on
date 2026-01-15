import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { saveLook, getSavedLooks, deleteSavedLook } from '../api/try-on';
import { Alert } from 'react-native';

export type SavedItem = {
    _id: string;
    id?: string;
    generatedImage: string;
    originalImage: string;
    productImage: string;
    createdAt?: string;
    date?: string; // fallback
    image?: string; // fallback for UI compatibility
};

type SavedTryOnContextType = {
    savedItems: SavedItem[];
    removeSavedItem: (id: string) => Promise<void>;
    saveItem: (data: any) => Promise<void>;
    loading: boolean;
};

const SavedTryOnContext = createContext<SavedTryOnContextType | undefined>(undefined);

export function SavedTryOnProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            fetchItems();
        } else {
            setSavedItems([]);
        }
    }, [user]);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await getSavedLooks();
            if (res.success) {
                // Map backend data to match UI expectations where needed
                const items = res.data.map((item: any) => ({
                    ...item,
                    id: item._id, // Map _id to id
                    image: item.generatedImage, // UI uses 'image'
                    date: item.createdAt
                }));
                setSavedItems(items);
            }
        } catch (error) {
            console.error('Failed to fetch saved looks', error);
        } finally {
            setLoading(false);
        }
    };

    const removeSavedItem = async (id: string) => {
        try {
            await deleteSavedLook(id);
            setSavedItems(current => current.filter(item => item._id !== id && item.id !== id));
        } catch (error) {
            console.error('Failed to delete look', error);
            Alert.alert('Error', 'Failed to delete saved look');
        }
    };

    const saveItem = async (lookData: any) => {
        try {
            const res = await saveLook(lookData);
            if (res.success) {
                fetchItems(); // Refresh list
                Alert.alert('Success', 'Look saved to your collection!');
            }
        } catch (error: any) {
            console.error('Failed to save look', error);
            Alert.alert('Error', error.response?.data?.error || 'Failed to save look');
        }
    };

    return (
        <SavedTryOnContext.Provider value={{ savedItems, removeSavedItem, saveItem, loading }}>
            {children}
        </SavedTryOnContext.Provider>
    );
}

export function useSavedTryOn() {
    const context = useContext(SavedTryOnContext);
    if (context === undefined) {
        throw new Error('useSavedTryOn must be used within a SavedTryOnProvider');
    }
    return context;
}
