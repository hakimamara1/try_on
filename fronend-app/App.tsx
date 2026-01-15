import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { queryClient, asyncStoragePersister } from './src/api/queryClient';
import AppNavigator from './src/navigation/AppNavigator';

import { CartProvider } from './src/context/CartContext';
import { SavedTryOnProvider } from './src/context/SavedTryOnContext';
import { AuthProvider } from './src/context/AuthContext';

export default function App() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister }}
    >
      <SafeAreaProvider>
        <AuthProvider>
          <CartProvider>
            <SavedTryOnProvider>
              <AppNavigator />
              <StatusBar style="auto" />
            </SavedTryOnProvider>
          </CartProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </PersistQueryClientProvider>
  );
}
