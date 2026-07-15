import * as AppleAuthentication from 'expo-apple-authentication';

import { supabase } from '@/lib/supabase/client';

const ADJECTIVES = ['Quiet', 'Steady', 'Calm', 'Bright', 'Clear', 'Grounded', 'Patient', 'Resolute'];

// Anonymous display name (PRODUCT_SPEC §4 step 10) — never the user's real name,
// so we deliberately don't request Apple's FULL_NAME scope below either.
export function generateAnonymousDisplayName(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const number = Math.floor(100 + Math.random() * 900);
  return `${adjective}${number}`;
}

// Native Sign in with Apple only works from a custom dev client / EAS build —
// Expo Go's bundle identifier doesn't carry this app's entitlement.
export async function signInWithApple() {
  const credential = await AppleAuthentication.signInAsync({});

  if (!credential.identityToken) {
    throw new Error('Apple sign-in did not return an identity token');
  }

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: credential.identityToken,
  });
  if (error) throw error;
  return data;
}

export async function signInWithEmail(email: string, displayName: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: { data: { display_name: displayName } },
  });
  if (error) throw error;
  return data;
}

// Current session's user id, if any — used by post-onboarding flows (e.g.
// re-assessment) that want to opportunistically sync to Supabase only when
// a session already exists, without forcing a sign-in of their own.
export async function getCurrentUserId(): Promise<string | undefined> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id;
}

// Dev-only escape hatch (BACKLOG — remove or re-verify before TestFlight):
// lets a developer clear both Apple sign-in (needs a real dev-client/EAS
// build) and a configured Supabase project to keep testing the rest of
// onboarding. Never touches Supabase, so there is no real account or
// server-side session behind it — purely a local, device-only stand-in.
export function continueWithoutAccountDev(): { user: { id: undefined } } {
  if (!__DEV__) {
    throw new Error('continueWithoutAccountDev is not available outside development builds');
  }
  console.warn('[DEV] Continuing without a real account — this session is local-only, not backed by Supabase.');
  return { user: { id: undefined } };
}
