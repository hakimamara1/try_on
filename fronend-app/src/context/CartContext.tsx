import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from '../api/orders';
import { Alert } from 'react-native';
import { Product, OrderItem } from '../types';

const CART_STORAGE_KEY = '@cart_v1';
const CART_PERSIST_DEBOUNCE_MS = 400;

export type CartItem = {
    id: string;
    name: string;
    price: number;
    image: string;
    size: string;
    color: string;
    quantity: number;
    product_id?: string; // Original product ID
};

export type Order = {
    _id: string; // Backend uses _id
    id?: string; // For frontend compatibility
    date?: string;
    totalPrice: number; // matches backend's Order schema field name
    status: string;
    orderItems?: OrderItem[];
    trackingNumber?: string;
    createdAt?: string;
};

type CartContextType = {
    items: CartItem[];
    addToCart: (product: Product, size: string, color: string) => void;
    removeFromCart: (itemId: string, size: string, color: string) => void;
    updateQuantity: (itemId: string, size: string, color: string, delta: number) => void;
    clearCart: () => void;
    total: number;
    count: number;
    // Orders
    orders: Order[];
    fetchOrders: () => Promise<void>;
    checkout: (shippingAddress: any, paymentMethod: string) => Promise<Order | null>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isHydrated, setIsHydrated] = useState(false);

    // Rehydrate the cart from disk once on mount. Corrupt/missing data just
    // means an empty cart, same defensive pattern AuthContext uses for its
    // own AsyncStorage read.
    useEffect(() => {
        (async () => {
            try {
                const stored = await AsyncStorage.getItem(CART_STORAGE_KEY);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed?.items)) {
                        setItems(parsed.items);
                    }
                }
            } catch (error) {
                console.error('Failed to load cart from storage', error);
            } finally {
                setIsHydrated(true);
            }
        })();
    }, []);

    // Persist on every change, debounced so rapid quantity taps don't cause
    // a write storm. Skipped until hydration completes so we don't clobber
    // stored data with the initial empty state.
    useEffect(() => {
        if (!isHydrated) return;
        const timer = setTimeout(() => {
            AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ items })).catch(error => {
                console.error('Failed to persist cart', error);
            });
        }, CART_PERSIST_DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [items, isHydrated]);

    const addToCart = (product: Product, size: string, color: string) => {
        setItems(currentItems => {
            const existingItem = currentItems.find(
                item => item.id === product._id && item.size === size && item.color === color
            );

            if (existingItem) {
                return currentItems.map(item =>
                    item === existingItem
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }

            return [...currentItems, {
                id: product._id,
                name: product.name,
                price: product.price,
                image: product.image,
                size,
                color,
                quantity: 1,
            }];
        });
    };

    const removeFromCart = (itemId: string, size: string, color: string) => {
        setItems(current => current.filter(
            item => !(item.id === itemId && item.size === size && item.color === color)
        ));
    };

    const updateQuantity = (itemId: string, size: string, color: string, delta: number) => {
        setItems(current => current.map(item => {
            if (item.id === itemId && item.size === size && item.color === color) {
                const newQuantity = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQuantity };
            }
            return item;
        }));
    };

    const clearCart = () => setItems([]);

    const fetchOrders = async () => {
        try {
            const res = await api.getMyOrders();
            if (res.success) {
                setOrders(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch orders', error);
        }
    };

    const checkout = async (shippingAddress: any, paymentMethod: string) => {
        try {
            const orderItems: OrderItem[] = items.map(item => ({
                product: item.id, // backend expects 'product' ID
                name: item.name,
                quantity: item.quantity,
                image: item.image,
                price: item.price,
                size: item.size,
                color: item.color
            }));

            const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            const orderData = {
                orderItems,
                shippingAddress,
                paymentMethod,
                totalPrice
            };

            const res = await api.createOrder(orderData);

            if (res.success) {
                // Fetch updated orders and clear cart
                fetchOrders();
                clearCart();
                return res.data;
            }
            return null;
        } catch (error: any) {
            const msg = error.response?.data?.error || 'Checkout failed';
            Alert.alert('Error', msg);
            return null;
        }
    };

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const count = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            items, addToCart, removeFromCart, updateQuantity, clearCart, total, count,
            orders, fetchOrders, checkout
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
