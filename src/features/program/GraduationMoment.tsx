import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, motion } from '@/theme/tokens';

interface Props {
  // Always the program's own authored copy (Week 6 Day 7's last exercise
  // step) — never written here. CLAUDE.md: never invent/paraphrase clinical
  // content; content/week6.json's notes_for_engineering flags all of it as
  // clinician-review-pending.
  closingLine: string;
  onContinue: () => void;
}

// The calm completion moment after Week 6 Day 7's letter (CLINICAL_SPEC §4,
// "the graduation flow must feel like an ending") — deliberately not a
// celebration screen: one subtle fade at the standard motion duration
// (CLAUDE.md rule 6: no confetti, no bounce, no gradients), then straight
// into Today's maintenance shape.
export function GraduationMoment({ closingLine, onContinue }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: motion.duration, useNativeDriver: true }).start();
  }, [opacity]);

  return (
    <ThemedView style={styles.container}>
      <Animated.View style={[styles.content, { opacity }]}>
        <ThemedText type="title" style={styles.heading}>
          Program complete.
        </ThemedText>
        <ThemedText type="default" themeColor="textSecondary" style={styles.body}>
          {closingLine}
        </ThemedText>
        <PrimaryButton label="Continue" onPress={onContinue} />
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.five },
  content: { alignItems: 'center', gap: Spacing.four },
  heading: { textAlign: 'center' },
  body: { textAlign: 'center' },
});
