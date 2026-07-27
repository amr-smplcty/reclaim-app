import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { MarkdownBody } from '@/components/markdown-body';
import { SafeAreaScreen } from '@/components/safe-area-screen';
import { JourneyMap } from '@/features/journey/JourneyMapView';
import { useJourneyStore } from '@/features/journey/useJourneyStore';
import { getJourneyContent } from '@/lib/content/journey';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/theme/tokens';

// Beginning sequence (PRODUCT_SPEC §5.7) — 4 ceremonial screens, shown once
// after the first successful paywall continuation, before W1D1. Tap-through
// via each screen's authored CTA; thin progress dots; no Skip on screen 1,
// a subtle Skip from screen 2 that jumps to the final screen; screen 4 embeds
// the journey map in preview state. Calm transitions, no confetti (CLAUDE.md).
// All copy from content/journey_experience.json — never inlined.
export default function BeginningScreen() {
  const theme = useTheme();
  const screens = getJourneyContent().beginning_sequence;
  const markSeen = useJourneyStore((s) => s.markBeginningSequenceSeen);
  const [index, setIndex] = useState(0);

  const screen = screens[index];
  const isLast = index === screens.length - 1;

  function advance() {
    if (isLast) {
      markSeen();
      router.replace('/(tabs)/today');
      return;
    }
    setIndex((i) => i + 1);
  }

  function skipToEnd() {
    setIndex(screens.length - 1);
  }

  return (
    <SafeAreaScreen edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View style={styles.dots}>
          {screens.map((s, i) => (
            <View
              key={s.id}
              style={[styles.dot, { backgroundColor: i === index ? theme.accent : theme.surface }]}
            />
          ))}
        </View>
        {index >= 1 && !isLast ? (
          <Pressable onPress={skipToEnd} accessibilityRole="button" accessibilityLabel="Skip" hitSlop={8}>
            <ThemedText type="small" themeColor="textSecondary">
              Skip
            </ThemedText>
          </Pressable>
        ) : (
          <View style={styles.skipSpacer} />
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ThemedText type="title" style={styles.title}>
          {screen.title}
        </ThemedText>
        <MarkdownBody>{screen.body}</MarkdownBody>
        {screen.shows_journey_map ? (
          <View style={styles.mapPreview}>
            <JourneyMap preview />
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton label={screen.cta} onPress={advance} />
      </View>
    </SafeAreaScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  dots: { flexDirection: 'row', gap: Spacing.one },
  dot: { width: 8, height: 8, borderRadius: 4 },
  skipSpacer: { width: 32 },
  content: { padding: Spacing.four, gap: Spacing.two, paddingBottom: Spacing.five },
  title: { marginBottom: Spacing.one },
  mapPreview: { marginTop: Spacing.three },
  footer: { padding: Spacing.four, paddingTop: Spacing.two },
});
