import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProductDetailsScreen from '../ProductDetailsScreen';

jest.mock('../../api/products', () => ({
    getProduct: jest.fn(),
    getRelatedProducts: jest.fn().mockResolvedValue({ data: [] }),
}));

jest.mock('../../api/reviews', () => ({
    getReviews: jest.fn().mockResolvedValue({ data: [] }),
    addReview: jest.fn(),
    deleteReview: jest.fn(),
}));

const mockToggleWishlist = jest.fn();
const mockGetMe = jest.fn();
jest.mock('../../api/auth', () => ({
    toggleWishlist: (...args: unknown[]) => mockToggleWishlist(...args),
    getMe: (...args: unknown[]) => mockGetMe(...args),
}));

jest.mock('../../context/CartContext', () => ({
    useCart: () => ({ addToCart: jest.fn() }),
}));

jest.mock('../../context/AuthContext', () => ({
    useAuth: () => ({ user: { _id: 'user-1', wishlist: [] } }),
}));

const mockProduct = {
    _id: 'product-1',
    name: 'Test Dress',
    price: 42,
    image: 'https://example.com/image.jpg',
    images: [],
    colors: [],
    sizes: [],
    rating: 4,
};

const isSelected = () => screen.getByTestId('wishlist-toggle-button').props.accessibilityState.selected;

const renderScreen = async () => {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    return render(
        <QueryClientProvider client={queryClient}>
            <ProductDetailsScreen
                route={{ params: { product: mockProduct } }}
                navigation={{ navigate: jest.fn(), push: jest.fn() }}
            />
        </QueryClientProvider>
    );
};

describe('ProductDetailsScreen wishlist toggle', () => {
    beforeEach(() => {
        mockToggleWishlist.mockReset();
        // Matches AuthContext's seeded user by default; the "settles" flow
        // (onSettled -> invalidateQueries) refetches through this, so it
        // needs to reflect the real server-side result of each test's toggle,
        // same as the actual backend would after a successful/failed call.
        mockGetMe.mockResolvedValue({ success: true, data: { _id: 'user-1', wishlist: [] } });
    });

    it('reverts the optimistic update when the API call fails', async () => {
        mockToggleWishlist.mockRejectedValue(new Error('network error'));

        await renderScreen();

        // Starts un-wishlisted (user.wishlist is empty)
        expect(isSelected()).toBe(false);

        await fireEvent.press(screen.getByTestId('wishlist-toggle-button'));

        // Once the rejected call settles, it must revert to the real previous state
        await waitFor(() => {
            expect(isSelected()).toBe(false);
        });
        expect(mockToggleWishlist).toHaveBeenCalledWith('product-1');
    });

    it('keeps the optimistic update when the API call succeeds', async () => {
        mockToggleWishlist.mockResolvedValue({ success: true });
        // The onSettled invalidation refetches ['user', 'me'] — simulate the
        // backend now reporting the product as wishlisted, same as it would
        // for real after toggleWishlist actually persisted the change.
        mockGetMe.mockResolvedValue({ success: true, data: { _id: 'user-1', wishlist: [mockProduct] } });

        await renderScreen();

        await fireEvent.press(screen.getByTestId('wishlist-toggle-button'));

        await waitFor(() => {
            expect(mockToggleWishlist).toHaveBeenCalledWith('product-1');
        });
        await waitFor(() => {
            expect(isSelected()).toBe(true);
        });
    });
});
