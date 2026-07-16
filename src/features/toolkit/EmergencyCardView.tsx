import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, radius } from '@/theme/tokens';
import { TOOL_LABELS, TOOL_ROUTES } from '@/features/toolkit/entitlement';
import type { EmergencyCardCompiledSection } from '@/features/program/emergencyCard';

interface Props {
  sections: EmergencyCardCompiledSection[];
}

// Shared renderer for the real Emergency Card screen — one tap away, built
// in calm daylight, for the hardest minute (Week 6 Day 5 / BACKLOG #27).
// Plain sections just read; action_buttons opens the named tool directly
// (same standalone TOOL_ROUTES navigation as tool_practice); contact_action
// gets accent emphasis since reaching out is often the hardest move; collapsed
// starts closed so the card doesn't open on "if it happened" by default.
export function EmergencyCardView({ sections }: Props) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggleExpanded(source: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(source)) next.delete(source);
      else next.add(source);
      return next;
    });
  }

  return (
    <View style={styles.container}>
      {sections.map((section) => {
        if (section.render === 'collapsed') {
          const isOpen = expanded.has(section.source);
          return (
            <ThemedView key={section.source} style={[styles.section, { borderColor: theme.border }]}>
              <Pressable
                onPress={() => toggleExpanded(section.source)}
                accessibilityRole="button"
                accessibilityLabel={section.title}
                accessibilityState={{ expanded: isOpen }}
                style={styles.collapsedHeader}
              >
                <ThemedText type="subtitle">{section.title}</ThemedText>
                <ThemedText type="small" themeColor="accent">
                  {isOpen ? 'Hide' : 'Show'}
                </ThemedText>
              </Pressable>
              {isOpen ? (
                <ThemedText type="default" themeColor="textSecondary" style={styles.sectionBody}>
                  {section.content}
                </ThemedText>
              ) : null}
            </ThemedView>
          );
        }

        if (section.render === 'action_buttons') {
          return (
            <ThemedView key={section.source} style={[styles.section, { borderColor: theme.border }]}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                {section.title}
              </ThemedText>
              {section.toolIds && section.toolIds.length > 0 ? (
                <View style={styles.toolRow}>
                  {section.toolIds.map((toolId) => (
                    <Pressable
                      key={toolId}
                      onPress={() => router.push(TOOL_ROUTES[toolId])}
                      accessibilityRole="button"
                      accessibilityLabel={TOOL_LABELS[toolId]}
                      style={[styles.toolButton, { backgroundColor: theme.accent }]}
                    >
                      <ThemedText type="default" style={{ color: theme.bg, fontWeight: '700' }}>
                        {TOOL_LABELS[toolId]}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>
              ) : (
                <ThemedText type="default" themeColor="textSecondary">
                  {section.content}
                </ThemedText>
              )}
            </ThemedView>
          );
        }

        if (section.render === 'contact_action') {
          return (
            <ThemedView
              key={section.source}
              style={[styles.section, styles.contactSection, { borderColor: theme.accent, backgroundColor: theme.accentTint }]}
            >
              <ThemedText type="subtitle" themeColor="accent" style={styles.sectionTitle}>
                {section.title}
              </ThemedText>
              <ThemedText type="default">{section.content}</ThemedText>
            </ThemedView>
          );
        }

        return (
          <ThemedView key={section.source} style={[styles.section, { borderColor: theme.border }]}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {section.title}
            </ThemedText>
            <ThemedText type="default" themeColor="textSecondary">
              {section.content}
            </ThemedText>
          </ThemedView>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.three },
  section: { borderWidth: 1, borderRadius: radius.card, padding: Spacing.three, gap: Spacing.two },
  contactSection: { borderWidth: 1.5 },
  sectionTitle: {},
  sectionBody: { marginTop: Spacing.one },
  collapsedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  toolRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  toolButton: { borderRadius: radius.button, paddingVertical: 12, paddingHorizontal: 16 },
});
