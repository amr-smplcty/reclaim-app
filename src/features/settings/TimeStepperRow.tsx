import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { formatTimeOfDay, stepHour, stepMinute } from '@/features/settings/timeOfDay';
import type { TimeOfDay } from '@/features/settings/useSettingsStore';
import { Spacing, radius } from '@/theme/tokens';

interface Props {
  label: string;
  time: TimeOfDay;
  onChange: (time: TimeOfDay) => void;
}

// No native time-picker module is installed (BACKLOG #17 gap) — two
// independent hour/minute dials mirror how a native wheel picker behaves
// (each wheel wraps on its own; the minute wheel never carries into the hour).
export function TimeStepperRow({ label, time, onChange }: Props) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      <ThemedText type="default">{label}</ThemedText>
      <View style={styles.controls}>
        <Stepper
          accessibilityLabel={`${label} hour`}
          onDecrement={() => onChange(stepHour(time, -1))}
          onIncrement={() => onChange(stepHour(time, 1))}
        />
        <ThemedText type="default" style={[styles.value, { color: theme.textPrimary }]}>
          {formatTimeOfDay(time)}
        </ThemedText>
        <Stepper
          accessibilityLabel={`${label} minute`}
          onDecrement={() => onChange(stepMinute(time, -15))}
          onIncrement={() => onChange(stepMinute(time, 15))}
        />
      </View>
    </View>
  );
}

function Stepper({
  accessibilityLabel,
  onDecrement,
  onIncrement,
}: {
  accessibilityLabel: string;
  onDecrement: () => void;
  onIncrement: () => void;
}) {
  const theme = useTheme();
  return (
    <View style={styles.stepperPair}>
      <Pressable
        onPress={onDecrement}
        accessibilityRole="button"
        accessibilityLabel={`Decrease ${accessibilityLabel}`}
        hitSlop={8}
        style={[styles.stepperButton, { backgroundColor: theme.surface }]}
      >
        <Ionicons name="chevron-down" size={16} color={theme.textPrimary} />
      </Pressable>
      <Pressable
        onPress={onIncrement}
        accessibilityRole="button"
        accessibilityLabel={`Increase ${accessibilityLabel}`}
        hitSlop={8}
        style={[styles.stepperButton, { backgroundColor: theme.surface }]}
      >
        <Ionicons name="chevron-up" size={16} color={theme.textPrimary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.two },
  controls: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  value: { minWidth: 84, textAlign: 'center', fontWeight: '600' },
  stepperPair: { flexDirection: 'row', gap: Spacing.half },
  stepperButton: {
    width: 28,
    height: 28,
    borderRadius: radius.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
