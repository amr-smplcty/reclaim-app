import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

interface Props {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
}

export function PrimaryButton({ label, onPress, disabled, accessibilityLabel }: Props) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: theme.accent, opacity: disabled ? 0.4 : pressed ? 0.85 : 1 },
      ]}
    >
      <ThemedText type="link" style={styles.label}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  label: { color: '#101113', fontWeight: '700' },
});
