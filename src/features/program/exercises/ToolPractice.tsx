import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { router, type Href } from 'expo-router';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { guardFreeText } from '@/lib/safety/guard';
import { useTheme } from '@/hooks/use-theme';
import { TOOL_LABELS, TOOL_ROUTES } from '@/features/toolkit/entitlement';
import { Spacing } from '@/theme/tokens';
import type { ToolPracticeOutput, ToolPracticePayload } from '@/types/program';

interface Props {
  payload: ToolPracticePayload;
  onSubmit: (output: ToolPracticeOutput) => void;
}

// tool_practice (Week 3, CLINICAL_SPEC §4 "practice while calm") — launches
// the named Toolkit tool in practice mode (a rehearsal, not a real urge),
// then asks the post-practice reflection once the user returns. This
// screen instance stays mounted underneath the pushed tool screen the whole
// time (same stack behavior as everywhere else in this app), so
// hasLaunched simply flips the render from "launch" to "reflect" on return
// — no focus-detection or completion signal needed from the tool itself.
export function ToolPractice({ payload, onSubmit }: Props) {
  const theme = useTheme();
  const [hasLaunched, setHasLaunched] = useState(false);
  const [reflection, setReflection] = useState('');

  const toolLabel = TOOL_LABELS[payload.tool];
  const canSubmit = reflection.trim().length > 0;

  function handleLaunch() {
    setHasLaunched(true);
    // A dynamic tool route (not a literal path) doesn't narrow enough for
    // the typed-routes {pathname, params} overload — append the query
    // string directly instead.
    router.push(`${TOOL_ROUTES[payload.tool]}?practice=true` as Href);
  }

  function handleSubmit() {
    if (!guardFreeText(reflection)) return;
    onSubmit(reflection);
  }

  if (!hasLaunched) {
    return (
      <View style={styles.container}>
        <ThemedText type="default" themeColor="textSecondary" style={styles.intro}>
          This is a practice run with {toolLabel} — there's no urge to ride right now. That's the
          point: rehearse it while it's easy, so it's already familiar when you actually need it.
        </ThemedText>
        <PrimaryButton label={`Start practice: ${toolLabel}`} onPress={handleLaunch} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <ThemedText type="subtitle" style={styles.prompt}>
        {payload.post_prompt}
      </ThemedText>
      <TextInput
        value={reflection}
        onChangeText={setReflection}
        placeholder="Your answer"
        placeholderTextColor={theme.textSecondary}
        multiline
        style={[styles.input, { color: theme.textPrimary, borderColor: theme.border }]}
        accessibilityLabel={payload.post_prompt}
      />
      <PrimaryButton label="Save" onPress={handleSubmit} disabled={!canSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', paddingBottom: Spacing.six, gap: Spacing.four },
  intro: { marginBottom: Spacing.two },
  prompt: { marginBottom: Spacing.two },
  input: { borderWidth: 1, borderRadius: 10, padding: 14, minHeight: 100, fontSize: 16, textAlignVertical: 'top' },
});
