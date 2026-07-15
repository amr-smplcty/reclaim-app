import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/theme/tokens';
import { type OnboardingStepId } from '@/features/assessment/useOnboardingStore';
import { SECTION_LABEL, SECTION_ORDER, sectionProgressFor } from '@/features/assessment/onboardingSections';

interface Props {
  step: OnboardingStepId;
  children: React.ReactNode;
  showBack?: boolean;
  contentStyle?: ViewStyle;
}

// Persistent header on every onboarding screen (PRODUCT_SPEC §4): back chevron
// plus a three-section progress indicator ("About you → The screening → Your
// results"). The pre-section "welcome" contract screen renders no indicator.
export function OnboardingLayout({ step, children, showBack = true, contentStyle }: Props) {
  const theme = useTheme();
  const progress = sectionProgressFor(step);
  const canGoBack = showBack && step !== 'welcome' && router.canGoBack();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerRow}>
        {canGoBack ? (
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
          >
            <Ionicons name="chevron-back" size={24} color={theme.textPrimary} />
          </Pressable>
        ) : (
          <View style={styles.backSpacer} />
        )}
        {progress ? (
          <View style={styles.sections}>
            {SECTION_ORDER.map((section) => {
              const isCurrent = section === progress.section;
              const isComplete = SECTION_ORDER.indexOf(section) < SECTION_ORDER.indexOf(progress.section);
              const fill = isComplete ? 1 : isCurrent ? progress.fill : 0;

              return (
                <View key={section} style={styles.sectionItem}>
                  <ThemedText
                    type="small"
                    themeColor={isCurrent ? 'textPrimary' : 'textSecondary'}
                    numberOfLines={1}
                  >
                    {SECTION_LABEL[section]}
                  </ThemedText>
                  <View style={[styles.track, { backgroundColor: theme.surface }]}>
                    <View style={[styles.fill, { backgroundColor: theme.accent, width: `${fill * 100}%` }]} />
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}
      </View>
      <View style={[styles.content, contentStyle]}>{children}</View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    gap: Spacing.three,
  },
  backSpacer: { width: 24 },
  sections: { flex: 1, flexDirection: 'row', gap: Spacing.three },
  sectionItem: { flex: 1, gap: Spacing.one },
  track: { height: 4, borderRadius: 2, overflow: 'hidden' },
  fill: { height: 4, borderRadius: 2 },
  content: { flex: 1, padding: Spacing.four },
});
