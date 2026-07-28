import { useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';
import { KeyboardAwareScrollView } from '@/components/keyboard-aware-scroll-view';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { SafeAreaScreen } from '@/components/safe-area-screen';
import { useTheme } from '@/hooks/use-theme';
import { getCurrentUserId } from '@/lib/supabase/auth';
import { deleteAccountAndAllData } from '@/features/settings/deleteAccount';
import { space, radius } from '@/theme/tokens';

const CONFIRMATION_PHRASE = 'DELETE';

// PRODUCT_SPEC §5.6 — launch-required, one-way, irreversible. Typed
// confirmation (not just a tap) is deliberate friction for a destructive
// action affecting every store in the app plus the user's Supabase rows.
export default function DeleteAccountScreen() {
  const theme = useTheme();
  const [confirmationText, setConfirmationText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = confirmationText === CONFIRMATION_PHRASE && !deleting;

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      const userId = await getCurrentUserId();
      await deleteAccountAndAllData(userId);
      router.replace('/');
    } catch (e) {
      console.error('[delete-account] Deletion failed:', e);
      setError('Something went wrong. Please try again.');
      setDeleting(false);
    }
  }

  return (
    <SafeAreaScreen style={styles.container} edges={['bottom']}>
      <KeyboardAwareScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Delete account and all data
        </ThemedText>
        <ThemedText type="default" themeColor="textSecondary" style={styles.body}>
          This permanently deletes your assessment history, journal entries, urge logs, lapse
          debriefs, program progress, and commitment goals. This can't be undone.
        </ThemedText>
        <ThemedText type="default" style={styles.instruction}>
          Type DELETE to confirm.
        </ThemedText>
        <TextInput
          value={confirmationText}
          onChangeText={setConfirmationText}
          autoCapitalize="characters"
          autoCorrect={false}
          placeholder="DELETE"
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.textPrimary, borderColor: theme.border }]}
          accessibilityLabel="Type DELETE to confirm"
        />
        {error ? (
          <ThemedText type="small" themeColor="destructive" style={styles.error}>
            {error}
          </ThemedText>
        ) : null}
        <Pressable
          onPress={handleDelete}
          disabled={!canDelete}
          accessibilityRole="button"
          accessibilityLabel="Permanently delete my account and data"
          accessibilityState={{ disabled: !canDelete }}
          style={[styles.deleteButton, { backgroundColor: theme.destructive, opacity: canDelete ? 1 : 0.4 }]}
        >
          <ThemedText type="link" style={[styles.deleteLabel, { color: theme.onAccent }]}>
            {deleting ? 'Deleting…' : 'Permanently delete'}
          </ThemedText>
        </Pressable>
        <ThemedText type="default" themeColor="accent" onPress={() => router.back()} style={styles.cancel}>
          Cancel
        </ThemedText>
      </KeyboardAwareScrollView>
    </SafeAreaScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: space.xl, paddingBottom: space.xxxl },
  title: { marginBottom: space.sm },
  body: { marginBottom: space.xl },
  instruction: { marginBottom: space.sm, fontWeight: '600' },
  input: { borderWidth: 1, borderRadius: 10, padding: 14, fontSize: 16, marginBottom: space.base },
  error: { marginBottom: space.base },
  deleteButton: { paddingVertical: 16, borderRadius: radius.md, alignItems: 'center', marginBottom: space.base },
  deleteLabel: { fontWeight: '700' },
  cancel: { textAlign: 'center' },
});
