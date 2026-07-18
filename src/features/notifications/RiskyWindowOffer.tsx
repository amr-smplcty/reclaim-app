import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useSettingsStore } from '@/features/settings/useSettingsStore';
import { useToolkitStore } from '@/features/toolkit/useToolkitStore';
import { evaluateRiskyWindowEligibility, riskyWindowReminderCopy } from '@/lib/notifications/riskyWindow';
import { Spacing } from '@/theme/tokens';

// PRODUCT_SPEC §7 — "offer opt-in supportive ping 30 min before the modal
// hour" once a real time cluster exists (>=5 real urge events). A gentle,
// dismissible offer — never a default-on notification. Shows at most once:
// riskyWindowOfferDecided flips true the moment the user answers either way.
export function RiskyWindowOffer() {
  const theme = useTheme();
  const urgeLogs = useToolkitStore((s) => s.urgeLogs);
  const toolUses = useToolkitStore((s) => s.toolUses);
  const offerDecided = useSettingsStore((s) => s.riskyWindowOfferDecided);
  const decideRiskyWindowReminder = useSettingsStore((s) => s.decideRiskyWindowReminder);

  if (offerDecided) return null;

  const eligibility = evaluateRiskyWindowEligibility(
    urgeLogs.map((u) => u.timestamp),
    toolUses
  );
  if (!eligibility.eligible || !eligibility.window) return null;

  const copy = riskyWindowReminderCopy(eligibility.window);

  return (
    <ThemedView style={[styles.card, { borderColor: theme.accent, backgroundColor: theme.accentTint }]}>
      <ThemedText type="default" style={styles.title}>
        {copy.title}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
        Want a gentle reminder like this, once a day?
      </ThemedText>
      <View style={styles.row}>
        <Pressable
          onPress={() => decideRiskyWindowReminder(true)}
          accessibilityRole="button"
          accessibilityLabel="Yes, remind me"
          hitSlop={8}
        >
          <ThemedText type="default" themeColor="accent">
            Yes, remind me
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={() => decideRiskyWindowReminder(false)}
          accessibilityRole="button"
          accessibilityLabel="No thanks"
          hitSlop={8}
        >
          <ThemedText type="default" themeColor="textSecondary">
            No thanks
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 12, padding: Spacing.three, marginBottom: Spacing.four, gap: Spacing.two },
  title: { fontWeight: '600' },
  subtitle: {},
  row: { flexDirection: 'row', gap: Spacing.four, marginTop: Spacing.one },
});
