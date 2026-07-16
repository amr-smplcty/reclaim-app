import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';

import { ChoiceChip } from '@/components/choice-chip';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/theme/tokens';
import type { MaintenancePlanOutput, MaintenanceSetupPayload } from '@/types/program';

interface Props {
  payload: MaintenanceSetupPayload;
  onSubmit: (output: MaintenancePlanOutput) => void;
}

// Week 6 Day 6 — the whole ask from here: check-in cadence, the 14-day
// re-assessment reminder (default on — "the trend is the truth"), and the
// weekly booster (default on). Saved to maintenance_plan and mirrored into
// useSettingsStore alongside the Epic 9 notification preferences, for the
// future notifications epic to read.
export function MaintenanceSetup({ payload, onSubmit }: Props) {
  const theme = useTheme();
  const [cadence, setCadence] = useState<string | null>(null);
  const [reassessmentReminderEnabled, setReassessmentReminderEnabled] = useState(payload.reassessment_reminder.default);
  const [weeklyBoosterEnabled, setWeeklyBoosterEnabled] = useState(payload.weekly_booster.default);

  const canSubmit = cadence !== null;

  function handleSubmit() {
    if (!cadence) return;
    onSubmit({ cadence, reassessmentReminderEnabled, weeklyBoosterEnabled });
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText type="subtitle" style={styles.prompt}>
        How often do you want to check in?
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
        Three evenings a week sustained beats seven abandoned.
      </ThemedText>
      <View>
        {payload.checkin_cadence_options.map((option) => (
          <ChoiceChip key={option} label={option} selected={cadence === option} onPress={() => setCadence(option)} />
        ))}
      </View>

      <View style={styles.toggleRow}>
        <View style={styles.toggleLabel}>
          <ThemedText type="default">Re-assessment reminder</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Every {payload.reassessment_reminder.interval_days} days — the trend is the truth.
          </ThemedText>
        </View>
        <Switch
          value={reassessmentReminderEnabled}
          onValueChange={setReassessmentReminderEnabled}
          accessibilityLabel="Re-assessment reminder"
          trackColor={{ true: theme.accent, false: theme.border }}
        />
      </View>

      <View style={styles.toggleRow}>
        <View style={styles.toggleLabel}>
          <ThemedText type="default">Weekly booster</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            One rotating two-minute sharpening lesson a week.
          </ThemedText>
        </View>
        <Switch
          value={weeklyBoosterEnabled}
          onValueChange={setWeeklyBoosterEnabled}
          accessibilityLabel="Weekly booster"
          trackColor={{ true: theme.accent, false: theme.border }}
        />
      </View>

      <PrimaryButton label="Save my maintenance plan" onPress={handleSubmit} disabled={!canSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: Spacing.six, gap: Spacing.four },
  prompt: { marginBottom: Spacing.one },
  hint: { marginBottom: Spacing.two },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.three },
  toggleLabel: { flex: 1, gap: 2 },
});
