import { Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/hooks/use-theme';

// Today header's settings entry point (PRODUCT_SPEC §3/§5.1/§5.6).
export function SettingsButton() {
  const theme = useTheme();

  return (
    <Pressable
      onPress={() => router.push('/(modals)/settings')}
      accessibilityRole="button"
      accessibilityLabel="Open settings"
      hitSlop={8}
      style={({ pressed }) => [styles.button, { opacity: pressed ? 0.7 : 1 }]}
    >
      <Ionicons name="settings-outline" size={22} color={theme.textPrimary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    marginLeft: 16,
    padding: 4,
  },
});
