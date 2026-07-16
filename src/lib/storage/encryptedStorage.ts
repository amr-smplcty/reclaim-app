import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import CryptoJS from 'crypto-js';
import type { StateStorage } from 'zustand/middleware';

const KEY_STORAGE_NAME = 'reclaim_journal_encryption_key';

async function getOrCreateEncryptionKey(): Promise<string> {
  const existing = await SecureStore.getItemAsync(KEY_STORAGE_NAME);
  if (existing) return existing;

  const randomBytes = await Crypto.getRandomBytesAsync(32);
  const key = Array.from(randomBytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
  await SecureStore.setItemAsync(KEY_STORAGE_NAME, key);
  return key;
}

// Journal entries encrypted at rest (PRODUCT_SPEC §5.4) — AES (crypto-js,
// pure JS, no native dependency beyond the two Expo modules already used
// elsewhere) over the persisted JSON blob. The key is generated once via
// expo-crypto's CSPRNG and held only in the iOS Keychain (expo-secure-store)
// — never in the encrypted blob, never in analytics, never leaves the device.
// Delete-account flow (PRODUCT_SPEC §5.6): removing the Keychain key makes
// any residual encrypted blob permanently undecryptable, which is as good as
// erased — a fresh key is generated the next time anything encrypted is
// written. Exported so deleteAccount.ts can wipe it as part of "all data."
export async function deleteEncryptionKey(): Promise<void> {
  await SecureStore.deleteItemAsync(KEY_STORAGE_NAME);
}

export function createEncryptedAsyncStorage(): StateStorage {
  return {
    getItem: async (name: string) => {
      const raw = await AsyncStorage.getItem(name);
      if (!raw) return null;
      try {
        const key = await getOrCreateEncryptionKey();
        const decrypted = CryptoJS.AES.decrypt(raw, key).toString(CryptoJS.enc.Utf8);
        return decrypted || null;
      } catch {
        return null;
      }
    },
    setItem: async (name: string, value: string) => {
      const key = await getOrCreateEncryptionKey();
      const encrypted = CryptoJS.AES.encrypt(value, key).toString();
      await AsyncStorage.setItem(name, encrypted);
    },
    removeItem: async (name: string) => {
      await AsyncStorage.removeItem(name);
    },
  };
}
