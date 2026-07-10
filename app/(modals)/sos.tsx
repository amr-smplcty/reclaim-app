import { Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

const TOOLS = ['Urge Surf', '90-second breather', 'Defusion exercise', 'Shift environment', 'Log the urge'];

// Placeholder SOS entry point (PRODUCT_SPEC §5.3) — interactive tools (audio,
// breathing animation, defusion drill, urge logging) ship in Epic 5.
export default function SosScreen() {
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">SOS</ThemedText>
      {TOOLS.map((tool) => (
        <ThemedText key={tool} type="default">
          {tool}
        </ThemedText>
      ))}
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Close SOS tools"
        style={({ pressed }) => [
          styles.close,
          { backgroundColor: theme.backgroundElement, opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <ThemedText type="link">Close</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.four, gap: Spacing.three, justifyContent: 'center' },
  close: { marginTop: Spacing.four, paddingVertical: Spacing.three, borderRadius: 12, alignItems: 'center' },
});
