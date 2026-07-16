import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput } from 'react-native';

import { ChoiceChip } from '@/components/choice-chip';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { guardFreeText } from '@/lib/safety/guard';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, radius } from '@/theme/tokens';
import type { RiskWindowPlannerOutput, RiskWindowPlannerPayload } from '@/types/program';
import { allWindowsPlanted, buildPlannedOutput, buildWorksheetOutput } from '@/features/program/riskWindowPlanner';

interface Props {
  payload: RiskWindowPlannerPayload;
  windows: string[];
  plantOptions: string[];
  onSubmit: (output: RiskWindowPlannerOutput) => void;
}

// Dual-mode (Week 5 Day 6 notes_for_engineering): with no derivable risk
// windows (Week 2 Days 1/3 skipped), there's nothing to plant into, so this
// degrades to the content's own documented fallback — a free-text
// worksheet — instead of an empty planner. Each window's plant is a single
// shared value: a chip picks it, or the free-text field overrides it
// directly, whichever the user reaches for.
export function RiskWindowPlanner({ payload, windows, plantOptions, onSubmit }: Props) {
  const theme = useTheme();
  const [plants, setPlants] = useState<Record<string, string>>({});
  const [worksheetText, setWorksheetText] = useState('');

  if (windows.length === 0) {
    function handleWorksheetSubmit() {
      if (!guardFreeText(worksheetText)) return;
      onSubmit(buildWorksheetOutput(worksheetText));
    }

    return (
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <ThemedText type="default" themeColor="textSecondary" style={styles.notice}>
          Your risk windows come from Week 2's trigger map and chain — once those are saved, they'll list here to
          plant. For now, describe your risky windows and what you'd plant in them.
        </ThemedText>
        <TextInput
          value={worksheetText}
          onChangeText={setWorksheetText}
          placeholder="My risk windows, and what I'd plant in them"
          placeholderTextColor={theme.textSecondary}
          multiline
          style={[styles.input, { color: theme.textPrimary, borderColor: theme.border }]}
          accessibilityLabel="My risk windows, and what I'd plant in them"
        />
        <PrimaryButton label="Save" onPress={handleWorksheetSubmit} disabled={worksheetText.trim().length === 0} />
      </ScrollView>
    );
  }

  const canSubmit = allWindowsPlanted(windows, plants);

  function handlePlantedSubmit() {
    onSubmit(buildPlannedOutput(windows, plants));
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <ThemedText type="small" themeColor="textSecondary" style={styles.notice}>
        Plant one thing in each of your risk windows.
      </ThemedText>
      {windows.map((window) => (
        <ThemedView key={window} style={[styles.windowCard, { borderColor: theme.border }]}>
          <ThemedText type="subtitle" themeColor="accent" style={styles.windowLabel}>
            {window}
          </ThemedText>
          {plantOptions.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
              {plantOptions.map((option) => (
                <ChoiceChip
                  key={option}
                  label={option}
                  selected={plants[window] === option}
                  onPress={() => setPlants((prev) => ({ ...prev, [window]: option }))}
                />
              ))}
            </ScrollView>
          ) : null}
          {payload.allow_free_text ? (
            <TextInput
              value={plants[window] ?? ''}
              onChangeText={(text) => setPlants((prev) => ({ ...prev, [window]: text }))}
              placeholder="Or write your own"
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { color: theme.textPrimary, borderColor: theme.border }]}
              accessibilityLabel={`What to plant in ${window}`}
            />
          ) : null}
        </ThemedView>
      ))}
      <PrimaryButton label="Save" onPress={handlePlantedSubmit} disabled={!canSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: { paddingBottom: Spacing.six },
  notice: { marginBottom: Spacing.three },
  windowCard: { borderWidth: 1, borderRadius: radius.card, padding: Spacing.three, marginBottom: Spacing.three, gap: Spacing.two },
  windowLabel: { marginBottom: Spacing.one },
  chipRow: { flexDirection: 'row' },
  input: { borderWidth: 1, borderRadius: 10, padding: 10, fontSize: 16 },
});
