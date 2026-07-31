import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, ShoppingBag, User, CreditCard, Heart } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from '../screens/HomeScreen';
import ShopScreen from '../screens/ShopScreen';

import OrdersScreen from '../screens/OrdersScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';
import CartScreen from '../screens/CartScreen';
import SavedTryOnScreen from '../screens/SavedTryOnScreen';
import TryOnScreen from '../screens/TryOnScreen';
import WishlistScreen from '../screens/WishlistScreen';

import CheckoutScreen from '../screens/CheckoutScreen';
import PointsScreen from '../screens/PointsScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import { Colors } from '../constants/Styles';

import QRScannerScreen from '../screens/QRScannerScreen';
import ProductOriginScreen from '../screens/ProductOriginScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import OrderConfirmationScreen from '../screens/OrderConfirmationScreen';
import { navigationRef } from './navigationRef';


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Base content height for the tab bar (icon + label), excluding whatever the
// device reserves for its own home indicator / gesture nav bar below it.
const TAB_BAR_CONTENT_HEIGHT = 54;
const TAB_BAR_MIN_BOTTOM_PADDING = 8;

function MainTabs() {
    // Hardcoded per-platform height/padding here used to clip or overlap the
    // tab bar against the system home indicator / gesture nav on devices
    // whose safe-area inset didn't match whatever value was hardcoded.
    // Reading the real inset makes this correct on every device.
    const insets = useSafeAreaInsets();
    const bottomInset = Math.max(insets.bottom, TAB_BAR_MIN_BOTTOM_PADDING);

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: Colors.surface,
                    borderTopColor: Colors.border,
                    height: TAB_BAR_CONTENT_HEIGHT + bottomInset,
                    paddingBottom: bottomInset,
                    paddingTop: 8,
                },
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.textLight,
                tabBarShowLabel: true,
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                }
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="Shop"
                component={ShopScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <ShoppingBag color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="Wishlist"
                component={WishlistScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <Heart color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="Checkout"
                component={CheckoutScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <CreditCard color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
                }}
            />
        </Tab.Navigator>
    );
}

export default function AppNavigator() {
    return (
        <NavigationContainer ref={navigationRef}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="MainTabs" component={MainTabs} />
                <Stack.Screen
                    name="ProductDetails"
                    component={ProductDetailsScreen}
                    options={{
                        headerShown: true,
                        headerTitle: () => null,
                        headerTransparent: true,
                        headerTintColor: Colors.text,
                    }}
                />
                <Stack.Screen
                    name="Cart"
                    component={CartScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Points"
                    component={PointsScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="EditProfile"
                    component={EditProfileScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="OrderConfirmation"
                    component={OrderConfirmationScreen}
                    options={{ headerShown: false, gestureEnabled: false }}
                />
                <Stack.Screen
                    name="SavedTryOn"
                    component={SavedTryOnScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="ScanQR"
                    component={QRScannerScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="ProductOrigin"
                    component={ProductOriginScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Register"
                    component={RegisterScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Orders"
                    component={OrdersScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="TryOn"
                    component={TryOnScreen}
                    options={{ headerShown: false }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
