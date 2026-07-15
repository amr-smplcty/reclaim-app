import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { CompletionBadge } from '@/components/completion-badge';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PostToolRating } from '@/features/toolkit/PostToolRating';
import { useToolkitStore } from '@/features/toolkit/useToolkitStore';
import { describeDelta } from '@/features/toolkit/suggestion';
import { trackUrgeToolUsed } from '@/lib/analytics/events';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/theme/tokens';

// PRODUCT_SPEC §5.3's exact checklist: stand up, leave room, phone in
// another room, cold water.
const CHECKLIST_ITEMS = ['Stand up', 'Leave the room', 'Put your phone in another room', 'Splash cold water on your face'];

export default function ShiftEnvironmentScreen() {
  const theme = useTheme();
  const activeSession = useToolkitStore((s) => s.activeSession);
  const logToolUse = useToolkitStore((s) => s.logToolUse);
  const clearSession = useToolkitStore((s) => s.clearSession);

  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [rating, setRating] = useState(false);
  const [result, setResult] = useState<{ pre: number; post: number } | null>(null);

  function toggle(item: string) {
    setChecked((prev) => ({ ...prev, [item]: !prev[item] }));
  }

  function handleRate(postIntensity: number) {
    const preIntensity = activeSession?.preIntensity ?? postIntensity;
    logToolUse('shift_environment', preIntensity, postIntensity);
    trackUrgeToolUsed('shift_environment', preIntensity, postIntensity - preIntensity);
    clearSession();
    setResult({ pre: preIntensity, post: postIntensity });
  }

  if (result) {
    return (
      <ThemedView style={styles.completeContainer}>
        <CompletionBadge label={`The urge is ${describeDelta(result.pre, result.post)}.`} />
        <PrimaryButton label="Done" onPress={() => router.back()} />
      </ThemedView>
    );
  }

  if (rating) {
    return (
      <ThemedView style={styles.container}>
        <PostToolRating onSubmit={handleRate} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Shift your environment
      </ThemedText>
      <View style={styles.list}>
        {CHECKLIST_ITEMS.map((item) => (
          <Pressable
            key={item}
            onPress={() => toggle(item)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: !!checked[item] }}
            accessibilityLabel={item}
            style={[styles.item, { borderColor: theme.border }]}
          >
            <Ionicons
              name={checked[item] ? 'checkbox' : 'square-outline'}
              size={22}
              color={checked[item] ? theme.accent : theme.textSecondary}
            />
            <ThemedText type="default" style={styles.itemLabel}>
              {item}
            </ThemedText>
          </Pressable>
        ))}
      </View>
      <PrimaryButton label="Done" onPress={() => setRating(true)} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.four, justifyContent: 'center', gap: Spacing.five },
  title: { marginBottom: Spacing.two },
  list: { gap: Spacing.three },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderBottomWidth: 1,
    paddingVertical: Spacing.three,
  },
  itemLabel: { flex: 1 },
  completeContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.five, padding: Spacing.four },
});
