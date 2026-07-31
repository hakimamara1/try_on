// ========== Product Types ==========
export interface Product {
    _id: string;
    name: string;
    price: number;
    image: string;
    images?: string[];
    pureImage?: string;
    description?: string;
    discount?: string;
    category?: ProductCategory;
    variants?: ProductVariant[];
    sizes?: string[];
    colors?: string[];
    rating?: number;
    originalPrice?: number;
    averageRating?: number;
    numReviews?: number;
    reviews?: number; // backend's actual review-count field name
    countInStock?: number;
    createdAt?: string;
    tags?: string[];
}

export interface ProductCategory {
    _id: string;
    name: string;
    slug: string;
}

export interface ProductVariant {
    size: string;
    color: string;
    stock: number;
}

// ========== Category Types ==========
export interface Category {
    _id: string;
    name: string;
    slug: string;
    image?: string;
}

// ========== API Response Types ==========
export interface PaginationInfo {
    next?: { page: number; limit: number };
    prev?: { page: number; limit: number };
}

export interface ProductsResponse {
    success: boolean;
    count: number;
    total: number;
    pagination: PaginationInfo;
    data: Product[];
}

export interface CategoriesResponse {
    success: boolean;
    count: number;
    data: Category[];
}

// ========== Review Types ==========
export interface Review {
    _id: string;
    rating: number;
    comment: string;
    user?: { _id: string; name?: string } | string;
    createdAt?: string;
}

export interface ReviewsResponse {
    success: boolean;
    count?: number;
    data: Review[];
}

// ========== Order Types ==========
export interface OrderItem {
    product: string;
    name: string;
    quantity: number;
    image: string;
    price: number;
    size: string;
    color: string;
}

// ========== Query Params ==========
export interface ProductQueryParams {
    search?: string;
    sort?: string;
    category?: string;
    page?: number;
    limit?: number;
    select?: string;
}
