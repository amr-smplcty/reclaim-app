import AsyncStorage from '@react-native-async-storage/async-storage';

import { createEncryptedAsyncStorage } from '@/lib/storage/encryptedStorage';

jest.mock('expo-secure-store', () => {
  const store: Record<string, string> = {};
  return {
    getItemAsync: jest.fn(async (key: string) => store[key] ?? null),
    setItemAsync: jest.fn(async (key: string, value: string) => {
      store[key] = value;
    }),
  };
});

jest.mock('expo-crypto', () => ({
  getRandomBytesAsync: jest.fn(async (size: number) => {
    const bytes = new Uint8Array(size);
    for (let i = 0; i < size; i++) bytes[i] = i % 256;
    return bytes;
  }),
}));

describe('createEncryptedAsyncStorage — journal encryption at rest (PRODUCT_SPEC §5.4)', () => {
  const storage = createEncryptedAsyncStorage();

  it('round-trips a value through encryption', async () => {
    const value = JSON.stringify({ hello: 'world' });
    await storage.setItem('journal-store', value);
    expect(await storage.getItem('journal-store')).toBe(value);
  });

  it('does not store the plaintext in AsyncStorage', async () => {
    const value = JSON.stringify({ secret: 'sensitive journal text' });
    await storage.setItem('journal-store-2', value);

    const raw = await AsyncStorage.getItem('journal-store-2');
    expect(raw).not.toBeNull();
    expect(raw).not.toContain('sensitive journal text');
    expect(raw).not.toBe(value);
  });

  it('returns null for a key that was never set', async () => {
    expect(await storage.getItem('nonexistent-key')).toBeNull();
  });

  it('removes an item', async () => {
    await storage.setItem('to-remove', 'value');
    await storage.removeItem('to-remove');
    expect(await storage.getItem('to-remove')).toBeNull();
  });
});
