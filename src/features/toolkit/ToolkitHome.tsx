import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { NumberScale } from '@/features/program/exercises/NumberScale';
import { suggestToolForIntensity } from '@/features/toolkit/suggestion';
import { canUseTool, type ToolId } from '@/features/toolkit/entitlement';
import { useToolkitStore } from '@/features/toolkit/useToolkitStore';
import { useTheme } from '@/hooks/use-theme';
import { colors, radius, Spacing } from '@/theme/tokens';

// TODO(Epic 3, blocked on Apple Developer enrollment): replace with a real
// RevenueCat entitlement check once the paywall lands. Urge Surf and Breather
// stay free regardless (PRODUCT_SPEC §6 ethical floor) — see entitlement.ts.
const HAS_PRO_ENTITLEMENT = true;

const TOOLS: Array<{ id: ToolId; title: string; subtitle: string; route: Href }> = [
  { id: 'urge_surf', title: 'Urge Surf', subtitle: '3-minute guided wave', route: '/(toolkit)/urge-surf' as Href },
  { id: 'breather', title: '90-Second Breather', subtitle: 'Box breathing', route: '/(toolkit)/breather' as Href },
  { id: 'defusion', title: 'Defusion', subtitle: 'Unhook from the thought', route: '/(toolkit)/defusion' as Href },
  {
    id: 'shift_environment',
    title: 'Shift Environment',
    subtitle: 'A quick physical reset',
    route: '/(toolkit)/shift-environment' as Href,
  },
  {
    id: 'ten_minute_shift',
    title: '10-Minute Shift',
    subtitle: 'Delay and do something else',
    route: '/(toolkit)/ten-minute-shift' as Href,
  },
];

// Shared by the Toolkit tab and the SOS modal (CLAUDE.md: reachable in ≤2 taps
// from every screen, must load instantly, all assets bundled offline).
export function ToolkitHome() {
  const theme = useTheme();
  const startSession = useToolkitStore((s) => s.startSession);
  const [intensity, setIntensity] = useState<number | null>(null);

  const suggested = useMemo(() => (intensity !== null ? suggestToolForIntensity(intensity) : null), [intensity]);

  function openTool(route: Href) {
    if (intensity === null) return;
    startSession(intensity);
    router.push(route);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ThemedText type="title" style={styles.heading}>
        Toolkit
      </ThemedText>
      <ThemedText type="default" themeColor="textSecondary" style={styles.subheading}>
        How intense is the urge right now?
      </ThemedText>
      <NumberScale min={1} max={10} value={intensity} onChange={setIntensity} />

      <ThemedText type="small" themeColor={suggested ? 'accent' : 'textSecondary'} style={styles.suggestion}>
        {suggested
          ? `Suggested: ${suggested === 'urge_surf' ? 'Urge Surf' : '90-Second Breather'}`
          : 'Rate the urge to unlock a tool.'}
      </ThemedText>

      <View style={styles.toolList}>
        {TOOLS.map((tool) => {
          const entitled = canUseTool(tool.id, HAS_PRO_ENTITLEMENT);
          const enabled = intensity !== null && entitled;
          const isSuggested = tool.id === suggested;
          return (
            <Pressable
              key={tool.id}
              onPress={() => openTool(tool.route)}
              disabled={!enabled}
              accessibilityRole="button"
              accessibilityLabel={tool.title}
              accessibilityState={{ disabled: !enabled }}
              style={({ pressed }) => [
                styles.toolCard,
                {
                  backgroundColor: isSuggested ? theme.accent : theme.surface,
                  borderColor: theme.border,
                  opacity: enabled ? (pressed ? 0.85 : 1) : 0.4,
                },
              ]}
            >
              <View style={styles.toolText}>
                <ThemedText type="subtitle" style={isSuggested ? styles.onAccent : undefined}>
                  {tool.title}
                </ThemedText>
                <ThemedText
                  type="small"
                  themeColor={isSuggested ? undefined : 'textSecondary'}
                  style={isSuggested ? styles.onAccent : undefined}
                >
                  {tool.subtitle}
                </ThemedText>
              </View>
              {!entitled ? <Ionicons name="lock-closed-outline" size={18} color={theme.textSecondary} /> : null}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.footer}>
        <PrimaryButton label="Log the urge" onPress={() => router.push('/(toolkit)/log-urge' as Href)} />
        <Pressable
          onPress={() => router.push('/(toolkit)/lapse-debrief' as Href)}
          accessibilityRole="button"
          accessibilityLabel="It happened"
          style={styles.lapseButton}
        >
          <ThemedText type="link" themeColor="textSecondary">
            It happened
          </ThemedText>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.four, paddingBottom: Spacing.six },
  heading: { marginBottom: Spacing.two },
  subheading: { marginBottom: Spacing.three },
  suggestion: { marginBottom: Spacing.four, fontWeight: '600' },
  toolList: { marginBottom: Spacing.five },
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: radius.card,
    padding: Spacing.three,
    marginBottom: Spacing.three,
  },
  toolText: { flex: 1, gap: 2 },
  onAccent: { color: colors.bg },
  footer: { gap: Spacing.three, alignItems: 'stretch' },
  lapseButton: { alignItems: 'center', paddingVertical: Spacing.two },
});
