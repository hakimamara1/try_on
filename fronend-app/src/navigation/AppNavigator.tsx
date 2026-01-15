import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, ShoppingBag, Shirt, Package, User } from 'lucide-react-native';
import { View, Platform } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import ShopScreen from '../screens/ShopScreen';
import TryOnScreen from '../screens/TryOnScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';
import CartScreen from '../screens/CartScreen';
import SavedTryOnScreen from '../screens/SavedTryOnScreen';

import CheckoutScreen from '../screens/CheckoutScreen';
import PointsScreen from '../screens/PointsScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import { Colors } from '../constants/Styles';

import QRScannerScreen from '../screens/QRScannerScreen';
import ProductOriginScreen from '../screens/ProductOriginScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: Colors.surface,
                    borderTopColor: Colors.border,
                    height: Platform.OS === 'ios' ? 88 : 60,
                    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
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
                name="TryOn"
                component={TryOnScreen}
                options={{
                    tabBarLabel: 'Try-On',
                    tabBarIcon: ({ color, size }) => (
                        <View style={{
                            backgroundColor: Colors.secondary,
                            padding: 8,
                            borderRadius: 20,
                            marginBottom: 4,
                        }}>
                            <Shirt color={'#fff'} size={20} />
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="Orders"
                component={OrdersScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <Package color={color} size={size} />,
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
        <NavigationContainer>
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
                    options={{
                        headerShown: true,
                        headerTitle: () => null,
                        headerTintColor: Colors.text,
                    }}
                />
                <Stack.Screen
                    name="Checkout"
                    component={CheckoutScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Points"
                    component={PointsScreen}
                    options={{ headerShown: false }}
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
            </Stack.Navigator>
        </NavigationContainer>
    );
}
