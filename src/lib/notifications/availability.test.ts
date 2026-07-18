const mockGetPermissionsAsync = jest.fn();
const mockRequestPermissionsAsync = jest.fn();

// INC-11: reference outer mock* variables only through a closure, never directly.
jest.mock('expo-notifications', () => ({
  getPermissionsAsync: (...args: unknown[]) => mockGetPermissionsAsync(...args),
  requestPermissionsAsync: (...args: unknown[]) => mockRequestPermissionsAsync(...args),
}));

import { getNotificationPermissionStatus, requestNotificationPermission } from '@/lib/notifications/availability';

describe('getNotificationPermissionStatus (INC-2: availability-check + graceful fallback)', () => {
  afterEach(() => {
    mockGetPermissionsAsync.mockReset();
    mockRequestPermissionsAsync.mockReset();
  });

  it('returns the real status when the native module resolves normally', async () => {
    mockGetPermissionsAsync.mockResolvedValue({ status: 'granted' });
    await expect(getNotificationPermissionStatus()).resolves.toBe('granted');
  });

  it('degrades to "unavailable" instead of throwing when the native module errors', async () => {
    mockGetPermissionsAsync.mockRejectedValue(new Error('native module unavailable'));
    await expect(getNotificationPermissionStatus()).resolves.toBe('unavailable');
  });
});

describe('requestNotificationPermission', () => {
  afterEach(() => {
    mockGetPermissionsAsync.mockReset();
    mockRequestPermissionsAsync.mockReset();
  });

  it('resolves true only when the user grants the permission', async () => {
    mockRequestPermissionsAsync.mockResolvedValue({ status: 'granted' });
    await expect(requestNotificationPermission()).resolves.toBe(true);
  });

  it('resolves false (never throws) when the user denies', async () => {
    mockRequestPermissionsAsync.mockResolvedValue({ status: 'denied' });
    await expect(requestNotificationPermission()).resolves.toBe(false);
  });

  it('resolves false (never throws) when the native module errors', async () => {
    mockRequestPermissionsAsync.mockRejectedValue(new Error('native module unavailable'));
    await expect(requestNotificationPermission()).resolves.toBe(false);
  });
});
