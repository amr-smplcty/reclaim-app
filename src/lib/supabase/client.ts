import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const envUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const envAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!envUrl || !envAnonKey) {
  console.warn('Supabase env vars missing — set EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY in .env');
}

// createClient throws synchronously on an empty/invalid URL, which would crash
// the app at import time before .env is configured — fall back to a
// syntactically valid placeholder so the module loads; real calls still fail
// (and are caught) until real credentials are set.
const supabaseUrl = envUrl || 'https://placeholder.supabase.co';
const supabaseAnonKey = envAnonKey || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
