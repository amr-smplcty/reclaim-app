import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ChoiceChip } from '@/components/choice-chip';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { guardAllFreeText } from '@/lib/safety/guard';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import type { ChainBuilderOutput, ChainBuilderPayload } from '@/types/program';

interface Props {
  payload: ChainBuilderPayload;
  onSubmit: (output: ChainBuilderOutput) => void;
}

type Step = 'links' | 'weakest';

// Rebuild the chain backwards (CLINICAL_SPEC Week 2 Day 3) — an ordered list
// of links, then a single weakest-link pick from among them.
export function ChainBuilder({ payload, onSubmit }: Props) {
  const theme = useTheme();
  const [links, setLinks] = useState<string[]>([]);
  const [draft, setDraft] = useState('');
  const [step, setStep] = useState<Step>('links');
  const [weakestLink, setWeakestLink] = useState<string | null>(null);

  function addLink() {
    const trimmed = draft.trim();
    if (!trimmed || links.length >= payload.max_links) return;
    setLinks((prev) => [...prev, trimmed]);
    setDraft('');
  }

  function removeLink(index: number) {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  }

  function handleContinue() {
    if (!guardAllFreeText(links)) return;
    setStep('weakest');
  }

  function handleSubmit() {
    if (!weakestLink) return;
    onSubmit({ links, weakest_link: weakestLink });
  }

  if (step === 'weakest') {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <ThemedText type="subtitle" style={styles.prompt}>
          {payload.weakest_link_prompt}
        </ThemedText>
        <View>
          {links.map((link, index) => (
            <ChoiceChip
              key={`${index}-${link}`}
              label={link}
              selected={weakestLink === link}
              onPress={() => setWeakestLink(link)}
            />
          ))}
        </View>
        <PrimaryButton label="Save" onPress={handleSubmit} disabled={!weakestLink} />
      </ScrollView>
    );
  }

  const canContinue = links.length >= payload.min_links;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
        {links.length === 0 ? 'Start with the episode itself.' : payload.link_prompt} ({links.length}/
        {payload.max_links})
      </ThemedText>
      {links.map((link, index) => (
        <View key={`${index}-${link}`} style={[styles.linkRow, { borderColor: theme.border }]}>
          <ThemedText type="default" style={styles.linkText}>
            {index + 1}. {link}
          </ThemedText>
          <ThemedText type="link" themeColor="accent" onPress={() => removeLink(index)}>
            Remove
          </ThemedText>
        </View>
      ))}
      {links.length < payload.max_links ? (
        <View style={styles.addRow}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="What happened?"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
            onSubmitEditing={addLink}
            accessibilityLabel="Add a link to the chain"
          />
          <PrimaryButton label="Add link" onPress={addLink} disabled={draft.trim().length === 0} />
        </View>
      ) : null}
      <PrimaryButton label="Continue" onPress={handleContinue} disabled={!canContinue} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: Spacing.six },
  hint: { marginBottom: Spacing.three },
  linkRow: {
    borderBottomWidth: 1,
    paddingVertical: Spacing.two,
    marginBottom: Spacing.one,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  linkText: { flex: 1 },
  addRow: { gap: Spacing.two, marginBottom: Spacing.four },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 16 },
  prompt: { marginBottom: Spacing.three },
});
