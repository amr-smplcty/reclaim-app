import { Component, useState, type ReactNode } from 'react';
import { Platform, StyleSheet, TextInput, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { buildDateFromParts } from '@/features/assessment/dobInput';
import { useTheme } from '@/hooks/use-theme';
import { space } from '@/theme/tokens';

interface Props {
  value: Date | null;
  onChange: (date: Date | null) => void;
}

// INC-2 graceful degradation for the native date picker: it's a native
// module absent in Expo Go. Rather than probe an unreliable view-manager
// registry (unreliable under the New Architecture), we attempt to render the
// native picker and catch its "Unimplemented component" render error, falling
// back to the manual DD/MM/YYYY fields — no raw red error box ever reaches
// the user.
class NativePickerBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    // Swallow — the fallback UI is already what we render. Availability, not a bug.
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

// A neutral wheel starting point near the age gate, so the picker doesn't open
// on today's date (which would be an invalid DOB for an adult app anyway).
function defaultPickerDate(): Date {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 25);
  return d;
}

// Date-of-birth input (PRODUCT_SPEC §4 step 2). Native picker where available,
// manual DD/MM/YYYY fields as the INC-2 fallback. Emits a validated Date (or
// null when incomplete/invalid); the age-gate decision (calculateAge/isMinor
// in age.tsx) is unchanged and consumes that Date exactly as before.
export function DateOfBirthField({ value, onChange }: Props) {
  const fallback = <ManualDobFields onChange={onChange} />;

  if (Platform.OS === 'web') return fallback;

  return (
    <NativePickerBoundary fallback={fallback}>
      <DateTimePicker
        value={value ?? defaultPickerDate()}
        mode="date"
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        maximumDate={new Date()}
        onChange={(_event, date) => {
          if (date) onChange(date);
        }}
        accessibilityLabel="Date of birth"
      />
    </NativePickerBoundary>
  );
}

function ManualDobFields({ onChange }: { onChange: (date: Date | null) => void }) {
  const theme = useTheme();
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  function update(nextDay: string, nextMonth: string, nextYear: string) {
    setDay(nextDay);
    setMonth(nextMonth);
    setYear(nextYear);
    onChange(buildDateFromParts(nextDay, nextMonth, nextYear));
  }

  return (
    <View style={styles.row}>
      <TextInput
        value={day}
        onChangeText={(t) => update(t, month, year)}
        placeholder="DD"
        placeholderTextColor={theme.textSecondary}
        keyboardType="number-pad"
        maxLength={2}
        style={[styles.input, { color: theme.textPrimary, borderColor: theme.border }]}
        accessibilityLabel="Day of birth"
      />
      <TextInput
        value={month}
        onChangeText={(t) => update(day, t, year)}
        placeholder="MM"
        placeholderTextColor={theme.textSecondary}
        keyboardType="number-pad"
        maxLength={2}
        style={[styles.input, { color: theme.textPrimary, borderColor: theme.border }]}
        accessibilityLabel="Month of birth"
      />
      <TextInput
        value={year}
        onChangeText={(t) => update(day, month, t)}
        placeholder="YYYY"
        placeholderTextColor={theme.textSecondary}
        keyboardType="number-pad"
        maxLength={4}
        style={[styles.input, styles.yearInput, { color: theme.textPrimary, borderColor: theme.border }]}
        accessibilityLabel="Year of birth"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.sm },
  input: { borderWidth: 1, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 14, width: 64, fontSize: 16 },
  yearInput: { width: 90 },
});
