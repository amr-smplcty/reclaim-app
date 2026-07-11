import { useState } from 'react';
import { Platform, StyleSheet, TextInput } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { OnboardingLayout } from '@/features/assessment/OnboardingLayout';
import { goNextFrom } from '@/features/assessment/navigation';
import { generateAnonymousDisplayName, signInWithApple, signInWithEmail } from '@/lib/supabase/auth';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

// PRODUCT_SPEC §4 step 10 — Sign in with Apple (required option) + email
// fallback. Apple's native flow needs a real dev-client/EAS build to actually
// complete (see CLAUDE.md risks) — email is the path testable in Expo Go.
export default function AccountScreen() {
  const theme = useTheme();
  const [displayName] = useState(generateAnonymousDisplayName);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleApple() {
    setSubmitting(true);
    setError(null);
    try {
      await signInWithApple();
      goNextFrom('account');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign in with Apple failed. Try email instead.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEmail() {
    setSubmitting(true);
    setError(null);
    try {
      await signInWithEmail(email, displayName);
      goNextFrom('account');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not sign in. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <OnboardingLayout step="account" contentStyle={styles.content}>
      <ThemedText type="title" style={styles.title}>
        Create your account
      </ThemedText>
      <ThemedText type="default" themeColor="textSecondary" style={styles.subtitle}>
        You'll appear as "{displayName}" — no real names needed.
      </ThemedText>

      {Platform.OS === 'ios' ? (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
          cornerRadius={12}
          style={styles.appleButton}
          onPress={handleApple}
        />
      ) : null}

      <ThemedText type="small" themeColor="textSecondary" style={styles.or}>
        or continue with email
      </ThemedText>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        placeholderTextColor={theme.textSecondary}
        keyboardType="email-address"
        autoCapitalize="none"
        style={[styles.input, { color: theme.text, borderColor: theme.border }]}
        accessibilityLabel="Email address"
      />
      {error ? (
        <ThemedText type="small" themeColor="accent" style={styles.error}>
          {error}
        </ThemedText>
      ) : null}
      <PrimaryButton
        label="Continue with email"
        onPress={handleEmail}
        disabled={submitting || !email.includes('@')}
      />
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'center' },
  title: { marginBottom: Spacing.two },
  subtitle: { marginBottom: Spacing.five },
  appleButton: { height: 50, marginBottom: Spacing.four },
  or: { textAlign: 'center', marginBottom: Spacing.three },
  input: { borderWidth: 1, borderRadius: 10, padding: 14, fontSize: 16, marginBottom: Spacing.two },
  error: { marginBottom: Spacing.three },
});
