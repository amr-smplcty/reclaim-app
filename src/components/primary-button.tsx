import { ActivityIndicator, Pressable, StyleSheet, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { radius, space } from '@/theme/tokens';

// Button (DESIGN_SYSTEM.md §7 · Components). Variants: primary (accent fill /
// onAccent label), secondary (borderStrong outline), tertiary (text-only),
// destructive (destructive — irreversible data actions only). States: rest,
// pressed (−6% lightness via accentPressed, no scale), disabled (surfaceSunken
// fill + textDisabled), loading (inline spinner, label retained). Min height
// 50pt; padding keeps the target ≥44pt.
export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'destructive';

interface Props {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
  accessibilityLabel?: string;
  style?: ViewStyle;
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  variant = 'primary',
  accessibilityLabel,
  style,
}: Props) {
  const theme = useTheme();
  const isDisabled = !!disabled || !!loading;

  // Resolve fill / border / label color per variant + state.
  let fill = 'transparent';
  let borderColor = 'transparent';
  let borderWidth = 0;
  let labelColor = theme.onAccent;

  if (variant === 'primary') {
    fill = theme.accent;
    labelColor = theme.onAccent;
  } else if (variant === 'destructive') {
    fill = theme.destructive;
    labelColor = theme.onAccent;
  } else if (variant === 'secondary') {
    borderColor = theme.borderStrong;
    borderWidth = 1;
    labelColor = theme.textPrimary;
  } else {
    // tertiary — text only
    labelColor = theme.accent;
  }

  if (isDisabled) {
    // Disabled: surfaceSunken fill + textDisabled label (except text-only).
    if (variant === 'primary' || variant === 'destructive') {
      fill = theme.surfaceSunken;
    }
    if (variant === 'secondary') {
      borderColor = theme.border;
    }
    labelColor = theme.textDisabled;
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: !!loading }}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor:
            pressed && !isDisabled && variant === 'primary' ? theme.accentPressed : fill,
          borderColor,
          borderWidth,
          // Pressed = lightness/opacity shift only, never scale (§7).
          opacity: pressed && !isDisabled && variant !== 'primary' ? 0.85 : 1,
        },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={labelColor} style={styles.spinner} /> : null}
      <ThemedText type="subhead" style={[styles.label, { color: labelColor }]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Min height 50pt (DESIGN_SYSTEM §7).
  button: {
    minHeight: 50,
    flexDirection: 'row',
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: { marginRight: space.sm },
  label: { fontWeight: '600', textAlign: 'center' },
});
