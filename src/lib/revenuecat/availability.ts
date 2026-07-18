import { NativeModules } from 'react-native';

// INC-2: react-native-purchases is a native module absent inside Expo Go —
// checking for its native binding before calling any Purchases API is how
// every consumer degrades gracefully instead of hitting a raw error/red box.
export function isRevenueCatAvailable(): boolean {
  return NativeModules.RNPurchases != null;
}
