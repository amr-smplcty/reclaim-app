import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Ionicons } from '@expo/vector-icons';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { OnboardingLayout } from '@/features/assessment/OnboardingLayout';
import { goNextFrom } from '@/features/assessment/navigation';
import { useOnboardingStore } from '@/features/assessment/useOnboardingStore';
import {
  continueWithoutAccountDev,
  generateAnonymousDisplayName,
  signInWithApple,
  signInWithEmail,
} from '@/lib/supabase/auth';
import { shouldOfferAppleSignIn } from '@/lib/supabase/appleSignIn';
import { recordLegalAcceptance } from '@/lib/legal/acceptance';
import { recordAssessmentRemotely } from '@/lib/assessment/sync';
import { useAssessmentHistoryStore } from '@/features/assessment/useAssessmentHistoryStore';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/theme/tokens';

const CONNECTION_ERROR_MESSAGE = "Can't reach the server right now. Check your connection and try again.";

// PRODUCT_SPEC §4 step 11 — Sign in with Apple (required option) + email
// fallback, plus the required un-prechecked Terms/Privacy checkbox
// (LEGAL_COMPLIANCE §9). Apple's native flow needs a real dev-client/EAS
// build to actually complete (see CLAUDE.md risks) — email is the path
// testable in Expo Go. The Apple button itself renders as a red
// "Unimplemented component" box in Expo Go (its native view manager isn't
// present there), so availability is detected before rendering it at all.
export default function AccountScreen() {
  const theme = useTheme();
  const updateAnswers = useOnboardingStore((s) => s.updateAnswers);
  const [displayName] = useState(generateAnonymousDisplayName);
  const [email, setEmail] = useState('');
  const [agreedToLegal, setAgreedToLegal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [appleAvailable, setAppleAvailable] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    AppleAuthentication.isAvailableAsync()
      .then(setAppleAvailable)
      .catch(() => setAppleAvailable(false));
  }, []);

  const canSubmit = agreedToLegal && !submitting;

  function openLegalDoc(type: 'tou' | 'privacy') {
    router.push({ pathname: '/(modals)/legal-doc', params: { type } });
  }

  async function afterSignIn(userId: string | undefined) {
    const acceptedAt = new Date().toISOString();
    updateAnswers({ legalAcceptedAt: acceptedAt });
    if (userId) {
      await recordLegalAcceptance(userId, acceptedAt);
      // Onboarding's PPCS-6 score was recorded before a session existed —
      // sync the baseline entry now that one does (same best-effort pattern
      // as legal acceptance; the local, encrypted store is the record of
      // truth either way).
      const latestAssessment = useAssessmentHistoryStore.getState().entries.at(-1);
      if (latestAssessment) await recordAssessmentRemotely(userId, latestAssessment);
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
      console.error('[account] Apple sign-in failed:', e);
      setError(CONNECTION_ERROR_MESSAGE);
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
      console.error('[account] Email sign-in failed:', e);
      setError(CONNECTION_ERROR_MESSAGE);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDevBypass() {
    setSubmitting(true);
    setError(null);
    try {
      const data = continueWithoutAccountDev();
      await afterSignIn(data.user.id);
    } catch (e) {
      console.error('[account] Dev bypass failed:', e);
      setError(CONNECTION_ERROR_MESSAGE);
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

      {shouldOfferAppleSignIn(Platform.OS, appleAvailable) ? (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
          cornerRadius={12}
          style={[styles.appleButton, !canSubmit && styles.disabled]}
          onPress={canSubmit ? handleApple : () => setError('Please agree to the Terms of Use and Privacy Policy first.')}
        />
      ) : (
        <ThemedText type="small" themeColor="textSecondary" style={styles.appleUnavailable}>
          Sign in with Apple available in the full app.
        </ThemedText>
      )}

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
        style={[styles.input, { color: theme.textPrimary, borderColor: theme.border }]}
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
          {agreedToLegal ? <Ionicons name="checkmark" size={16} color={theme.bg} /> : null}
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
      {__DEV__ ? (
        <Pressable onPress={handleDevBypass} disabled={!canSubmit} hitSlop={8} style={styles.devBypass}>
          <ThemedText type="small" themeColor="textSecondary" style={!canSubmit && styles.disabled}>
            Continue without account (dev)
          </ThemedText>
        </Pressable>
      ) : null}
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'center' },
  title: { marginBottom: Spacing.two },
  subtitle: { marginBottom: Spacing.five },
  appleButton: { height: 50, marginBottom: Spacing.four },
  appleUnavailable: { textAlign: 'center', marginBottom: Spacing.four },
  devBypass: { alignItems: 'center', marginTop: Spacing.three },
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
