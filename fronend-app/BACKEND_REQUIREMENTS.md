# Backend Specification & Requirements

This document outlines the backend architecture, database schema, and API endpoints required to replace the current mock data implementation in the ZED DREAM application.

## 1. Database Schema
Recommended Database: **PostgreSQL** (for relational integrity) or **MongoDB** (for flexible product schemas). Below is a relational schema design.

### Users & Auth
**`users`**
*   `id` (UUID, PK)
*   `email` (VARCHAR, Unique)
*   `password_hash` (VARCHAR)
*   `full_name` (VARCHAR)
*   `avatar_url` (VARCHAR)
*   `points_balance` (INTEGER, Default: 0)
*   `created_at` (TIMESTAMP)

### Products & Catalogue
**`categories`**
*   `id` (UUID, PK)
*   `name` (VARCHAR)
*   `slug` (VARCHAR, Unique)

**`products`**
*   `id` (UUID, PK)
*   `category_id` (UUID, FK -> categories.id)
*   `name` (VARCHAR)
*   `description` (TEXT)
*   `price` (DECIMAL)
*   `original_price` (DECIMAL, Nullable)
*   `image_url` (VARCHAR)
*   `rating` (DECIMAL, Default: 0)
*   `review_count` (INTEGER, Default: 0)
*   `discount_label` (VARCHAR, e.g., "20% OFF")
*   `is_new` (BOOLEAN)
*   `created_at` (TIMESTAMP)

**`product_variants`** (Stock Keeping Units)
*   `id` (UUID, PK)
*   `product_id` (UUID, FK -> products.id)
*   `size` (VARCHAR, e.g., "M", "L")
*   `color` (VARCHAR, e.g., "#FF0000")
*   `stock_quantity` (INTEGER)

### Shopping Cart
**`carts`**
*   `id` (UUID, PK)
*   `user_id` (UUID, FK -> users.id, Nullable if guest)

**`cart_items`**
*   `id` (UUID, PK)
*   `cart_id` (UUID, FK -> carts.id)
*   `product_variant_id` (UUID, FK -> product_variants.id)
*   `quantity` (INTEGER)

### Orders
**`orders`**
*   `id` (UUID, PK)
*   `user_id` (UUID, FK -> users.id)
*   `total_amount` (DECIMAL)
*   `status` (ENUM: 'PREPARING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED')
*   `tracking_number` (VARCHAR)
*   `shipping_address` (JSONB)
*   `created_at` (TIMESTAMP)

**`order_items`**
*   `id` (UUID, PK)
*   `order_id` (UUID, FK -> orders.id)
*   `product_variant_id` (UUID, FK -> product_variants.id)
*   `price_at_purchase` (DECIMAL)
*   `quantity` (INTEGER)

### Virtual Try-On
**`saved_try_ons`**
*   `id` (UUID, PK)
*   `user_id` (UUID, FK -> users.id)
*   `generated_image_url` (VARCHAR)
*   `original_image_url` (VARCHAR, Nullable)
*   `created_at` (TIMESTAMP)

### Loyalty & Rewards
**`rewards`**
*   `id` (UUID, PK)
*   `title` (VARCHAR)
*   `subtitle` (VARCHAR)
*   `cost_points` (INTEGER)
*   `is_active` (BOOLEAN)

**`point_transactions`**
*   `id` (UUID, PK)
*   `user_id` (UUID, FK -> users.id)
*   `amount` (INTEGER, positive for earn, negative for spend)
*   `description` (VARCHAR, e.g., "Order #1234", "Redeemed 10% OFF")
*   `created_at` (TIMESTAMP)

---

## 2. API Endpoints (REST)

### Authentication
*   `POST /api/auth/register` - Create new user
*   `POST /api/auth/login` - Authenticate and get token
*   `GET /api/auth/me` - Get current user profile

### Products
*   `GET /api/products` - List products (Support query params: `?category=`, `?search=`, `?sort=`)
*   `GET /api/products/:id` - Get single product details
*   `GET /api/categories` - List all categories

### Cart
*   `GET /api/cart` - Get current user's cart
*   `POST /api/cart/items` - Add item to cart
    *   Body: `{ variantId, quantity }`
*   `PUT /api/cart/items/:id` - Update quantity
*   `DELETE /api/cart/items/:id` - Remove item

### Orders
*   `GET /api/orders` - List user's order history
*   `GET /api/orders/:id` - Get order details
*   `POST /api/orders` - Create new order (Checkout)

### Virtual Try-On
*   `POST /api/try-on/generate` - Trigger AI generation
    *   Body: `{ userImage, clothId }`
*   `GET /api/try-on/saved` - Get saved user looks
*   `POST /api/try-on/save` - Save a generated look
*   `DELETE /api/try-on/:id` - Delete a saved look

### Loyalty Points
*   `GET /api/loyalty/balance` - Get point balance and history
*   `GET /api/loyalty/rewards` - List available rewards
*   `POST /api/loyalty/redeem` - Redeem points for a reward

---

## 3. Implementation Steps
1.  **Set up Database**: Provision PostgreSQL instance.
2.  **API Development**: Build Node.js/Express or Python/FastAPI service.
3.  **Integrate Frontend**: Replace `Context` logic in React Native app to make API calls (using `axios` or `fetch`) instead of modifying local state arrays.
4.  **Asset Storage**: Set up S3 or similar for storing product images and user uploads.
