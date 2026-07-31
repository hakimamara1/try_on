import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartProvider, useCart } from '../CartContext';
import { Product } from '../../types';

jest.mock('../../api/orders', () => ({
    getMyOrders: jest.fn().mockResolvedValue({ success: true, data: [] }),
    createOrder: jest.fn(),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <CartProvider>{children}</CartProvider>
);

const productA: Product = { _id: 'product-a', name: 'Dress A', price: 20, image: 'a.jpg' };
const productB: Product = { _id: 'product-b', name: 'Dress B', price: 15, image: 'b.jpg' };

describe('CartContext', () => {
    beforeEach(async () => {
        await AsyncStorage.clear();
    });

    it('merges quantity for the same product/size/color instead of duplicating', async () => {
        const { result } = await renderHook(() => useCart(), { wrapper });

        await act(async () => {
            result.current.addToCart(productA, 'M', 'red');
        });
        await act(async () => {
            result.current.addToCart(productA, 'M', 'red');
        });

        expect(result.current.items).toHaveLength(1);
        expect(result.current.items[0].quantity).toBe(2);
    });

    it('treats different size/color combos as separate line items', async () => {
        const { result } = await renderHook(() => useCart(), { wrapper });

        await act(async () => {
            result.current.addToCart(productA, 'M', 'red');
        });
        await act(async () => {
            result.current.addToCart(productA, 'L', 'red');
        });
        await act(async () => {
            result.current.addToCart(productB, 'M', 'red');
        });

        expect(result.current.items).toHaveLength(3);
    });

    it('floors quantity at 1 when decrementing below it', async () => {
        const { result } = await renderHook(() => useCart(), { wrapper });

        await act(async () => {
            result.current.addToCart(productA, 'M', 'red');
        });
        await act(async () => {
            result.current.updateQuantity('product-a', 'M', 'red', -5);
        });

        expect(result.current.items[0].quantity).toBe(1);
    });

    it('removes the matching size/color line item only', async () => {
        const { result } = await renderHook(() => useCart(), { wrapper });

        await act(async () => {
            result.current.addToCart(productA, 'M', 'red');
        });
        await act(async () => {
            result.current.addToCart(productA, 'L', 'red');
        });
        await act(async () => {
            result.current.removeFromCart('product-a', 'M', 'red');
        });

        expect(result.current.items).toHaveLength(1);
        expect(result.current.items[0].size).toBe('L');
    });

    it('persists the cart to AsyncStorage and rehydrates it on next mount', async () => {
        const { result, unmount } = await renderHook(() => useCart(), { wrapper });

        await act(async () => {
            result.current.addToCart(productA, 'M', 'red');
        });

        await waitFor(async () => {
            const stored = await AsyncStorage.getItem('@cart_v1');
            expect(stored).not.toBeNull();
        });

        unmount();

        const { result: result2 } = await renderHook(() => useCart(), { wrapper });

        await waitFor(() => {
            expect(result2.current.items).toHaveLength(1);
        });
        expect(result2.current.items[0].id).toBe('product-a');
    });
});
