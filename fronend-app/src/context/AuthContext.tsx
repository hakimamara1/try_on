import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from '../api/auth';
import { Alert } from 'react-native';

type User = {
    _id: string;
    name: string;
    email: string;
    role: string;
    inviteCode?: string;
    points?: number;
    avatar?: string;
};

type AuthContextType = {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const storedToken = await AsyncStorage.getItem('token');
            if (storedToken) {
                setToken(storedToken);
                // Define global header handled in client interceptor, but we can also fetch user here
                const res = await api.getMe();
                if (res.success) {
                    setUser(res.data);
                }
            }
        } catch (error) {
            console.log('Failed to load user', error);
            await AsyncStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const res = await api.login(email, password);
            if (res.success) {
                await AsyncStorage.setItem('token', res.token);
                setToken(res.token);
                setUser(res.user || res.data); // Adjust based on actual API response structure
                // If getMe contains more info, we might want to call it too, but login usually returns user
            }
        } catch (error: any) {
            const msg = error.response?.data?.error || 'Login failed';
            Alert.alert('Error', msg);
            throw error;
        }
    };

    const register = async (name: string, email: string, password: string) => {
        try {
            const res = await api.register(name, email, password);
            if (res.success) {
                await AsyncStorage.setItem('token', res.token);
                setToken(res.token);
                setUser(res.user || res.data);
            }
        } catch (error: any) {
            const msg = error.response?.data?.error || 'Registration failed';
            Alert.alert('Error', msg);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('token');
            setToken(null);
            setUser(null);
        } catch (error) {
            console.error('Logout error', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
