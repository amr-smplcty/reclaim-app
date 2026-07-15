import { StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/theme/tokens';

// Full-screen safety interrupt (CLINICAL_SPEC §6) — never gated behind
// subscription, shown immediately wherever crisis/illegal-content language is typed.
export default function SafetyResourcesScreen() {
  const { type } = useLocalSearchParams<{ type: 'crisis' | 'illegal_content' }>();
  const isCrisis = type !== 'illegal_content';

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        {isCrisis ? "You're not alone" : 'Get help'}
      </ThemedText>
      {isCrisis ? (
        <>
          <ThemedText type="default" themeColor="textSecondary">
            If you're struggling right now, please reach out — you deserve support.
          </ThemedText>
          <ThemedText type="default" style={styles.resource}>
            US: call or text 988 (Suicide & Crisis Lifeline), available any time.
          </ThemedText>
          <ThemedText type="default" themeColor="textSecondary">
            Outside the US, find a local crisis line at findahelpline.com.
          </ThemedText>
          <ThemedText type="default" themeColor="textSecondary" style={styles.spacing}>
            And if there's someone you trust — a friend, family member, or doctor —
            talking to them can help too.
          </ThemedText>
        </>
      ) : (
        <ThemedText type="default" themeColor="textSecondary">
          If you've encountered content involving a minor, please contact Stop It
          Now (1-888-773-8368) — they offer confidential, judgment-free support and
          guidance.
        </ThemedText>
      )}
      <PrimaryButton label="Continue" onPress={() => router.back()} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.four, justifyContent: 'center', gap: Spacing.three },
  title: { marginBottom: Spacing.two },
  resource: { fontWeight: '700' },
  spacing: { marginTop: Spacing.two },
});
