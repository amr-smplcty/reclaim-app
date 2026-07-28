import { ScrollView, StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { MarkdownBody } from '@/components/markdown-body';
import { getWeeklyIntro } from '@/lib/content/journey';
import { space } from '@/theme/tokens';

interface Props {
  week: number;
  onDismiss: () => void;
}

// Weekly kickoff interstitial (PRODUCT_SPEC §5.7) — one card the first time a
// week's Day 1 session opens (weeks 2–6). Dismissing (the authored CTA) marks
// it seen; it stays re-readable from the journey map. All copy from
// content/journey_experience.json. Renders nothing if there's no intro for the
// week (e.g. Week 1, whose intro is the beginning sequence) — a safety guard;
// the caller gates on shouldShowWeeklyIntro.
export function WeeklyKickoff({ week, onDismiss }: Props) {
  const intro = getWeeklyIntro(week);
  if (!intro) return null;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title" style={styles.title}>
          {intro.title}
        </ThemedText>
        <MarkdownBody>{intro.body}</MarkdownBody>
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton label={intro.cta} onPress={onDismiss} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: space.xl, gap: space.sm, paddingBottom: space.xxl },
  title: { marginBottom: space.xs },
  footer: { padding: space.xl, paddingTop: space.sm },
});
