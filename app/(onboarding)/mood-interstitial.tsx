import { StyleSheet } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { goNextFrom } from '@/features/assessment/navigation';
import { Spacing } from '@/theme/tokens';

// Non-blocking supportive interstitial when PHQ-2/GAD-2 ≥3 (CLINICAL_SPEC §3).
// Copy is verbatim from the spec.
export default function MoodInterstitialScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        A quick note
      </ThemedText>
      <ThemedText type="default" themeColor="textSecondary">
        Stress, anxiety and low mood often drive compulsive use. This program
        helps with coping skills, but consider talking to a professional too.
      </ThemedText>
      <ThemedText type="link" themeColor="accent" style={styles.resourcesLink}>
        Find professional support resources
      </ThemedText>
      <PrimaryButton label="Continue" onPress={() => goNextFrom('mood')} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.four, justifyContent: 'center', gap: Spacing.three },
  title: { marginBottom: Spacing.two },
  resourcesLink: { marginTop: Spacing.two, marginBottom: Spacing.four },
});
