import { StyleSheet, View } from 'react-native';

import { ChoiceChip } from '@/components/choice-chip';

interface Props {
  min: number;
  max: number;
  value: number | null;
  onChange: (value: number) => void;
}

// Discrete number-chip row — used as a slider stand-in (rated_inventory,
// dual_slider_write) without adding a native slider dependency.
export function NumberScale({ min, max, value, onChange }: Props) {
  const values = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <View style={styles.row}>
      {values.map((n) => (
        <ChoiceChip key={n} label={String(n)} selected={value === n} onPress={() => onChange(n)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
});
