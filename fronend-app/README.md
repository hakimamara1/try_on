# ZED DREAM - Fashion Store App

## Overview
ZED DREAM is a premium mobile e-commerce application built with React Native and Expo. It focuses on women's modest fashion, offering a seamless shopping experience with advanced features like **Virtual Try-On** and a comprehensive **Loyalty Points System**.

## Key Features

### 🛍️ Shopping Experience
*   **Home Screen**: Features a dynamic hero carousel showcasing collections (e.g., "Elegant Modesty", "Summer Breeze"), category quick-links, and a curated product grid.
*   **Shop Screen**: Full product catalog with:
    *   **Search**: Real-time filtering by product name.
    *   **Filters**: Category selection (Dresses, Hijabs, Abayas, etc.) and sort options (Newest, Price: Low-High, etc.).
    *   **Product Details**: High-quality images, discount badges, and "Try On" integration.
*   **Cart Management**: Fully functional shopping cart with quantity controls, size/color variant support, and total calculation.

### ✨ Virtual Try-On
*   **AI-Powered Experience**: Users can visualize how clothes look on them (or a model) using the "Try On" feature.
*   **Modes**:
    *   **Overlay Mode**: Overlays the clothing item on the user's photo.
    *   **Split Mode**: Side-by-side comparison.
*   **Camera Integration**: Upload a new photo or use existing ones.
*   **Saved Try-Ons**: Users can save their favorite generated looks to a dedicated gallery for later reference.

### 🏆 Loyalty & Rewards
*   **Points System**: Users earn points for various actions (e.g., placing orders, trying on products, inviting friends).
*   **Missions**: Interactive tasks to earn bonus points (e.g., "Invite a friend +50pts").
*   **Rewards Redemption**: Points can be redeemed for discounts (e.g., 10% OFF, Free Shipping).
*   **History**: A log of earned and spent points.

### 👤 User Profile
*   **Dashboard**: Access to Orders, Points, Saved Try-Ons, and Address Book.
*   **Social Sharing**: Integrated "Invite Friends" feature using the native share sheet.

## Technical Stack
*   **Framework**: React Native (Expo SDK 50+)
*   **Language**: TypeScript
*   **Navigation**: React Navigation (Stack + Bottom Tabs)
*   **State Management**: Context API (`CartContext`, `SavedTryOnContext`)
*   **UI Components**: Custom styled components with `lucide-react-native` icons.
*   **Styling**: `StyleSheet` with a centralized Design System (`src/constants/Styles.ts`).

## Project Structure
```
src/
├── components/      # Reusable UI components
├── constants/       # Mock Data, Colors, Styles
├── context/         # Global state (Cart, SavedTryOn)
├── navigation/      # AppNavigator (Tabs + Stack)
├── screens/         # Application Screens
│   ├── HomeScreen.tsx
│   ├── ShopScreen.tsx
│   ├── ProductDetailsScreen.tsx
│   ├── TryOnScreen.tsx
│   ├── SavedTryOnScreen.tsx
│   ├── CartScreen.tsx
│   ├── CheckoutScreen.tsx
│   ├── PointsScreen.tsx
│   ├── OrdersScreen.tsx
│   └── ProfileScreen.tsx
```

## Getting Started

1.  **Install dependencies**:
    ```bash
    npm install
    # or
    yarn install
    ```

2.  **Start the app**:
    ```bash
    npx expo start
    ```

3.  **Run on device/simulator**:
    *   Press `i` for iOS Simulator.
    *   Press `a` for Android Emulator.
    *   Scan the QR code with Expo Go on your physical device.
