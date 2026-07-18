import * as Notifications from 'expo-notifications';

export type NotificationPermissionStatus = 'granted' | 'denied' | 'undetermined' | 'unavailable';

// INC-2 pattern: availability-check + graceful fallback, never a raw error
// screen. expo-notifications' *local* scheduling (all this epic uses) works
// inside Expo Go; only remote push tokens are Expo-Go-unavailable. The
// try/catch is the guard — any environment where the native module is
// missing or throws (web without web-push support, an odd simulator config)
// degrades to 'unavailable'/false instead of crashing.
export async function getNotificationPermissionStatus(): Promise<NotificationPermissionStatus> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status as NotificationPermissionStatus;
  } catch {
    return 'unavailable';
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}
