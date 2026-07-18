import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppLockGate } from '@/features/lock/AppLockGate';
import { useNotificationScheduler } from '@/features/notifications/useNotificationScheduler';
import { configureRevenueCat } from '@/lib/revenuecat/client';
import { useSubscriptionStore } from '@/features/paywall/useSubscriptionStore';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  useNotificationScheduler();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    // Both are INC-2 availability-checked and never throw: configureRevenueCat
    // no-ops when the native module is absent (Expo Go), and
    // refreshEntitlement degrades to status "unavailable" rather than
    // crashing. This keeps a returning subscriber's entitlement (Toolkit
    // gating, Settings status) current outside of onboarding too, not just
    // right after a fresh purchase.
    const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
    if (apiKey) configureRevenueCat(apiKey);
    useSubscriptionStore.getState().refreshEntitlement();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'light' ? DefaultTheme : DarkTheme}>
        <AppLockGate>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(onboarding)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(program)" />
            <Stack.Screen name="(toolkit)" />
            <Stack.Screen name="(modals)" options={{ presentation: 'modal' }} />
          </Stack>
        </AppLockGate>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
