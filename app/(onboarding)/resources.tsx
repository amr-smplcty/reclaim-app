import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/theme/tokens';

// Terminal screen for under-18 users (PRODUCT_SPEC §4, CLINICAL_SPEC §6) — exits
// the program flow entirely, no path back in, per "do not deliver the program
// to minors in v1."
export default function ResourcesScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Thanks for being honest.
      </ThemedText>
      <ThemedText type="default" themeColor="textSecondary">
        This program is built for adults, so we can't offer it to you right now. If
        you're struggling, please talk to a trusted adult — a parent, school
        counselor, or doctor. They can help.
      </ThemedText>
      <ThemedText type="default" themeColor="textSecondary" style={styles.spacing}>
        If you're in crisis, the 988 Suicide & Crisis Lifeline (call or text 988 in
        the US) is available any time.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.four, justifyContent: 'center', gap: Spacing.three },
  title: { marginBottom: Spacing.two },
  spacing: { marginTop: Spacing.three },
});
