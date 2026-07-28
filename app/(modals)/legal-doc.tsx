import { ScrollView, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SafeAreaScreen } from '@/components/safe-area-screen';
import { LEGAL_DOCS } from '@/lib/legal/content';
import { space } from '@/theme/tokens';

export default function LegalDocScreen() {
  const { type } = useLocalSearchParams<{ type: 'tou' | 'privacy' }>();
  const doc = LEGAL_DOCS[type === 'privacy' ? 'privacy' : 'tou'];

  return (
    <SafeAreaScreen style={styles.container} edges={['bottom']}>
      <ThemedText type="title" style={styles.title}>
        {doc.title}
      </ThemedText>
      <ThemedText type="small" themeColor="accent" style={styles.draftBanner}>
        {doc.intro}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.version}>
        Version {doc.version}
      </ThemedText>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        {doc.sections.map((section) => (
          <ThemedView key={section.heading} style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionHeading}>
              {section.heading}
            </ThemedText>
            <ThemedText type="default" themeColor="textSecondary">
              {section.body}
            </ThemedText>
          </ThemedView>
        ))}
      </ScrollView>
      <PrimaryButton label="Close" onPress={() => router.back()} />
    </SafeAreaScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: space.xl },
  title: { marginBottom: space.sm },
  draftBanner: { fontWeight: '700', marginBottom: space.xs },
  version: { marginBottom: space.base },
  scroll: { flex: 1, marginBottom: space.base },
  section: { marginBottom: space.xl },
  sectionHeading: { marginBottom: space.xs },
});
