import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { ONBOARDING_STEPS, type OnboardingStepId } from '@/features/assessment/useOnboardingStore';

interface Props {
  step: OnboardingStepId;
  children: React.ReactNode;
  showBack?: boolean;
  contentStyle?: ViewStyle;
}

// Persistent progress bar + back chevron on every onboarding screen (PRODUCT_SPEC §4).
export function OnboardingLayout({ step, children, showBack = true, contentStyle }: Props) {
  const theme = useTheme();
  const index = ONBOARDING_STEPS.indexOf(step);
  const progress = (index + 1) / ONBOARDING_STEPS.length;

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerRow}>
        {showBack && index > 0 && router.canGoBack() ? (
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
          >
            <Ionicons name="chevron-back" size={24} color={theme.text} />
          </Pressable>
        ) : (
          <View style={styles.backSpacer} />
        )}
        <View style={[styles.track, { backgroundColor: theme.backgroundElement }]}>
          <View style={[styles.fill, { backgroundColor: theme.accent, width: `${progress * 100}%` }]} />
        </View>
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
  track: { flex: 1, height: 4, borderRadius: 2, overflow: 'hidden' },
  fill: { height: 4, borderRadius: 2 },
  content: { flex: 1, padding: Spacing.four },
});
