import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, radius } from '@/theme/tokens';
import { compileEmergencyCardSections } from '@/features/program/emergencyCard';
import type { EmergencyCardBuilderPayload, EmergencyCardOutput, EmergencyCardSectionState } from '@/types/program';

interface Props {
  payload: EmergencyCardBuilderPayload;
  sourceOutputs: Record<string, unknown>;
  onSubmit: (output: EmergencyCardOutput) => void;
}

// Week 6 Day 5 — compiles the Emergency Card from the week's own saves,
// then lets the user reorder/hide before activating it as a real screen
// (BACKLOG #27). No drag library (BACKLOG #45's precedent): reordering is
// plain up/down buttons, same "no new gesture dependency" call.
export function EmergencyCardBuilder({ payload, sourceOutputs, onSubmit }: Props) {
  const theme = useTheme();
  const [sections, setSections] = useState<EmergencyCardSectionState[]>(() =>
    payload.sections_default_order.map((spec) => ({ source: spec.source, hidden: false }))
  );

  const compiled = compileEmergencyCardSections(payload.sections_default_order, sections, sourceOutputs);

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    setSections((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function toggleHidden(source: string) {
    setSections((prev) => prev.map((s) => (s.source === source ? { ...s, hidden: !s.hidden } : s)));
  }

  function handleSubmit() {
    onSubmit({ sections });
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
        Your Emergency Card, in the order it'll open. Reorder it for your worst moment, or hide anything that doesn't
        earn its place — you can change this any time.
      </ThemedText>
      {compiled.map((section, index) => (
        <ThemedView
          key={section.source}
          style={[styles.row, { borderColor: theme.border, opacity: section.hidden ? 0.5 : 1 }]}
        >
          <View style={styles.rowHeader}>
            <ThemedText type="subtitle" style={styles.rowTitle}>
              {section.title}
            </ThemedText>
            <View style={styles.rowControls}>
              <Pressable
                onPress={() => move(index, -1)}
                disabled={index === 0}
                accessibilityRole="button"
                accessibilityLabel={`Move ${section.title} up`}
                hitSlop={8}
                style={styles.iconButton}
              >
                <Ionicons name="chevron-up" size={18} color={index === 0 ? theme.textDisabled : theme.textPrimary} />
              </Pressable>
              <Pressable
                onPress={() => move(index, 1)}
                disabled={index === compiled.length - 1}
                accessibilityRole="button"
                accessibilityLabel={`Move ${section.title} down`}
                hitSlop={8}
                style={styles.iconButton}
              >
                <Ionicons
                  name="chevron-down"
                  size={18}
                  color={index === compiled.length - 1 ? theme.textDisabled : theme.textPrimary}
                />
              </Pressable>
              <Pressable
                onPress={() => toggleHidden(section.source)}
                accessibilityRole="button"
                accessibilityLabel={section.hidden ? `Show ${section.title}` : `Hide ${section.title}`}
                accessibilityState={{ selected: section.hidden }}
                hitSlop={8}
                style={styles.iconButton}
              >
                <Ionicons
                  name={section.hidden ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={theme.textSecondary}
                />
              </Pressable>
            </View>
          </View>
          <ThemedText type="default" themeColor="textSecondary" numberOfLines={3}>
            {section.content}
          </ThemedText>
        </ThemedView>
      ))}
      <PrimaryButton label="Activate my Emergency Card" onPress={handleSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: Spacing.six, gap: Spacing.three },
  hint: { marginBottom: Spacing.one },
  row: { borderWidth: 1, borderRadius: radius.card, padding: Spacing.three, gap: Spacing.one },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowTitle: { flex: 1 },
  rowControls: { flexDirection: 'row', gap: Spacing.two },
  iconButton: { padding: 4 },
});
