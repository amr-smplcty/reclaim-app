import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { SafeAreaScreen } from '@/components/safe-area-screen';
import { useTheme } from '@/hooks/use-theme';
import { space } from '@/theme/tokens';
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
    // Onboarding screens have no native header (headerShown: false), so they
    // must inset the status bar / home indicator themselves — otherwise the
    // system clock overlaps the section header (fix-device-qa-1 / INC-18).
    // KeyboardAvoidingView keeps free-text steps (age, motivation "other",
    // account email) and their Next/CTA visible above the keyboard.
    <SafeAreaScreen edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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
                  <View style={[styles.track, { backgroundColor: theme.surfaceRaised }]}>
                    <View style={[styles.fill, { backgroundColor: theme.accent, width: `${fill * 100}%` }]} />
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}
      </View>
        <View style={[styles.content, contentStyle]}>{children}</View>
      </KeyboardAvoidingView>
    </SafeAreaScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.xl,
    paddingTop: space.xl,
    gap: space.base,
  },
  backSpacer: { width: 24 },
  sections: { flex: 1, flexDirection: 'row', gap: space.base },
  sectionItem: { flex: 1, gap: space.xs },
  track: { height: 4, borderRadius: 2, overflow: 'hidden' },
  fill: { height: 4, borderRadius: 2 },
  content: { flex: 1, padding: space.xl },
});
