import * as LocalAuthentication from 'expo-local-authentication';

// Availability check (INC-2 standing rule: any native-module UI must detect
// availability and degrade gracefully). Face ID / Touch ID authentication is
// one of the modules that does work inside Expo Go (unlike Apple sign-in),
// but a simulator/device without any biometrics *enrolled* still needs this
// guard, and `authenticateAsync` falls back to the device passcode
// automatically when biometrics fail or aren't set up — so no separate
// passcode UI is needed here.
export async function isAppLockAvailable(): Promise<boolean> {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && isEnrolled;
  } catch {
    return false;
  }
}

export async function authenticateForUnlock(): Promise<boolean> {
  try {
    const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Unlock Reclaim' });
    return result.success;
  } catch {
    return false;
  }
}
