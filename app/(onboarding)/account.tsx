import { useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Ionicons } from '@expo/vector-icons';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { OnboardingLayout } from '@/features/assessment/OnboardingLayout';
import { goNextFrom } from '@/features/assessment/navigation';
import { useOnboardingStore } from '@/features/assessment/useOnboardingStore';
import { generateAnonymousDisplayName, signInWithApple, signInWithEmail } from '@/lib/supabase/auth';
import { recordLegalAcceptance } from '@/lib/legal/acceptance';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

// PRODUCT_SPEC §4 step 11 — Sign in with Apple (required option) + email
// fallback, plus the required un-prechecked Terms/Privacy checkbox
// (LEGAL_COMPLIANCE §9). Apple's native flow needs a real dev-client/EAS
// build to actually complete (see CLAUDE.md risks) — email is the path
// testable in Expo Go.
export default function AccountScreen() {
  const theme = useTheme();
  const updateAnswers = useOnboardingStore((s) => s.updateAnswers);
  const [displayName] = useState(generateAnonymousDisplayName);
  const [email, setEmail] = useState('');
  const [agreedToLegal, setAgreedToLegal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = agreedToLegal && !submitting;

  function openLegalDoc(type: 'tou' | 'privacy') {
    router.push({ pathname: '/(modals)/legal-doc', params: { type } });
  }

  async function afterSignIn(userId: string | undefined) {
    const acceptedAt = new Date().toISOString();
    updateAnswers({ legalAcceptedAt: acceptedAt });
    if (userId) {
      await recordLegalAcceptance(userId, acceptedAt);
    }
    goNextFrom('account');
  }

  async function handleApple() {
    setSubmitting(true);
    setError(null);
    try {
      const data = await signInWithApple();
      await afterSignIn(data.user?.id);
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
      // signInWithOtp never returns a synchronous user id (SDK-typed as null) —
      // the session only exists once the user follows the magic link.
      await signInWithEmail(email, displayName);
      await afterSignIn(undefined);
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
          style={[styles.appleButton, !canSubmit && styles.disabled]}
          onPress={canSubmit ? handleApple : () => setError('Please agree to the Terms of Use and Privacy Policy first.')}
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

      <View style={styles.checkboxRow}>
        <Pressable
          onPress={() => setAgreedToLegal((v) => !v)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: agreedToLegal }}
          accessibilityLabel="I agree to the Terms of Use and Privacy Policy"
          hitSlop={8}
          style={[
            styles.checkboxBox,
            { borderColor: theme.border, backgroundColor: agreedToLegal ? theme.accent : 'transparent' },
          ]}
        >
          {agreedToLegal ? <Ionicons name="checkmark" size={16} color="#101113" /> : null}
        </Pressable>
        <ThemedText type="small" themeColor="textSecondary" style={styles.checkboxLabel}>
          I agree to the{' '}
          <ThemedText type="small" themeColor="accent" onPress={() => openLegalDoc('tou')}>
            Terms of Use
          </ThemedText>{' '}
          and{' '}
          <ThemedText type="small" themeColor="accent" onPress={() => openLegalDoc('privacy')}>
            Privacy Policy
          </ThemedText>
        </ThemedText>
      </View>

      {error ? (
        <ThemedText type="small" themeColor="accent" style={styles.error}>
          {error}
        </ThemedText>
      ) : null}
      <PrimaryButton
        label="Continue with email"
        onPress={handleEmail}
        disabled={!canSubmit || !email.includes('@')}
      />
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'center' },
  title: { marginBottom: Spacing.two },
  subtitle: { marginBottom: Spacing.five },
  appleButton: { height: 50, marginBottom: Spacing.four },
  disabled: { opacity: 0.4 },
  or: { textAlign: 'center', marginBottom: Spacing.three },
  input: { borderWidth: 1, borderRadius: 10, padding: 14, fontSize: 16, marginBottom: Spacing.three },
  checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two, marginBottom: Spacing.three },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxLabel: { flex: 1 },
  error: { marginBottom: Spacing.three },
});
