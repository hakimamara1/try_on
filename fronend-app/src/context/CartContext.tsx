import React, { createContext, useContext, useState, ReactNode } from 'react';
import * as api from '../api/orders';
import { Alert } from 'react-native';

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
    date: string;
    total: number | string;
    status: string;
    items: any[];
    trackingNumber: string;
    createdAt?: string;
};

type CartContextType = {
    items: CartItem[];
    addToCart: (product: any, size: string, color: string) => void;
    removeFromCart: (itemId: string, size: string, color: string) => void;
    updateQuantity: (itemId: string, size: string, color: string, delta: number) => void;
    clearCart: () => void;
    total: number;
    count: number;
    // Orders
    orders: Order[];
    fetchOrders: () => Promise<void>;
    checkout: (shippingAddress: any, paymentMethod: string) => Promise<boolean>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);

    const addToCart = (product: any, size: string, color: string) => {
        setItems(currentItems => {
            const existingItem = currentItems.find(
                item => item.id === (product._id || product.id) && item.size === size && item.color === color
            );

            if (existingItem) {
                return currentItems.map(item =>
                    item === existingItem
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }

            return [...currentItems, {
                id: product._id || product.id,
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
            const orderItems = items.map(item => ({
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
                return true;
            }
            return false;
        } catch (error: any) {
            const msg = error.response?.data?.error || 'Checkout failed';
            Alert.alert('Error', msg);
            return false;
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
