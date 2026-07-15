import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { guardAllFreeText } from '@/lib/safety/guard';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/theme/tokens';
import { assembleProfileSections } from '@/features/program/exerciseHelpers';
import type { ProfileBuilderOutput, ProfileBuilderPayload } from '@/types/program';

interface Props {
  payload: ProfileBuilderPayload;
  sourceOutputs: Record<string, unknown>;
  onSubmit: (output: ProfileBuilderOutput) => void;
}

// Assembles the Pattern Profile (CLINICAL_SPEC Week 2 Day 7) from this
// week's saves — editable before signing off, surfaces in Progress + feeds
// the Emergency Card data (PRODUCT_SPEC §5.5 / CLINICAL_SPEC Week 6).
export function ProfileBuilder({ payload, sourceOutputs, onSubmit }: Props) {
  const theme = useTheme();
  const [sections, setSections] = useState(() => assembleProfileSections(payload.sections, sourceOutputs));

  function updateSection(index: number, content: string) {
    setSections((prev) => prev.map((s, i) => (i === index ? { ...s, content } : s)));
  }

  function handleSubmit() {
    if (!guardAllFreeText(sections.map((s) => s.content))) return;
    onSubmit({ sections });
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
        Compiled from your week. Edit anything that reads wrong — this is a working document, not a diploma.
      </ThemedText>
      {sections.map((section, index) => (
        <View key={section.title} style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            {section.title}
          </ThemedText>
          <TextInput
            value={section.content}
            onChangeText={(text) => updateSection(index, text)}
            multiline
            style={[styles.input, { color: theme.textPrimary, borderColor: theme.border }]}
            accessibilityLabel={section.title}
          />
        </View>
      ))}
      <PrimaryButton label="Save profile" onPress={handleSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: Spacing.six },
  hint: { marginBottom: Spacing.four },
  section: { marginBottom: Spacing.four },
  sectionTitle: { marginBottom: Spacing.two },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, minHeight: 70, fontSize: 16, textAlignVertical: 'top' },
});
