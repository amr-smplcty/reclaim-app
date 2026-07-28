import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { radius, space } from '@/theme/tokens';

interface Props {
  label: string;
  selected: boolean;
  onPress: () => void;
}

// Selection control (DESIGN_SYSTEM.md §7). Selected = accentSubtle fill +
// accent border + check — never color alone (§10). Min target ≥44pt.
export function ChoiceChip({ label, selected, onPress }: Props) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ selected, checked: selected }}
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? theme.accentSubtle : theme.surfaceRaised,
          borderColor: selected ? theme.accent : theme.border,
          borderWidth: selected ? 2 : 1,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <ThemedText type="subhead" style={styles.label}>
        {label}
      </ThemedText>
      {/* Check shape carries the selected state independently of color (§10). */}
      {selected ? (
        <View style={styles.checkWrap} accessibilityElementsHidden importantForAccessibility="no">
          <ThemedText type="subhead" themeColor="accent" style={styles.check}>
            ✓
          </ThemedText>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 44,
    paddingVertical: space.md,
    paddingHorizontal: space.base,
    borderRadius: radius.sm,
    marginBottom: space.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: { flexShrink: 1 },
  checkWrap: { marginLeft: space.sm },
  check: { fontWeight: '700' },
});
