import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

interface Props {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function ChoiceChip({ label, selected, onPress }: Props) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? theme.accent : theme.backgroundElement,
          borderColor: selected ? theme.accent : theme.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <ThemedText type="default" style={selected && styles.selectedLabel}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, borderWidth: 1, marginBottom: 10 },
  selectedLabel: { color: '#101113', fontWeight: '700' },
});
