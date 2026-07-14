import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';

import { ChoiceChip } from '@/components/choice-chip';
import { CompletionBadge } from '@/components/completion-badge';
import { MarkdownBody } from '@/components/markdown-body';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getProgramModules } from '@/lib/content/week';
import { guardFreeText } from '@/lib/safety/guard';
import { useProgramStore } from '@/features/program/useProgramStore';
import { dayKey, findProgramDay } from '@/features/program/progression';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

// Lesson player (PRODUCT_SPEC §5.2) — markdown body, read time, end-of-lesson
// reflection, calm "Mark complete" state (no confetti).
export default function LessonScreen() {
  const theme = useTheme();
  const position = useProgramStore((s) => s.position);
  const completions = useProgramStore((s) => s.completions);
  const completeLesson = useProgramStore((s) => s.completeLesson);
  const saveReflection = useProgramStore((s) => s.saveReflection);

  const day = useMemo(() => findProgramDay(getProgramModules(), position), [position]);

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [freeText, setFreeText] = useState('');
  const [justCompleted, setJustCompleted] = useState(false);

  if (!day) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title">More content coming soon</ThemedText>
        <ThemedText type="default" themeColor="textSecondary">
          Week {position.week} isn't written yet — check back soon.
        </ThemedText>
      </ThemedView>
    );
  }

  const { lesson } = day;
  const alreadyComplete = completions[dayKey(position)]?.lessonComplete ?? false;
  const canSubmit = lesson.reflection.type === 'single_choice' ? !!selectedOption : freeText.trim().length > 0;

  function handleComplete() {
    if (lesson.reflection.type === 'free_text') {
      if (!guardFreeText(freeText)) return;
      saveReflection(lesson.id, { type: 'free_text', value: freeText });
    } else {
      saveReflection(lesson.id, { type: 'single_choice', value: selectedOption as string });
    }
    completeLesson(position.week, position.day);
    setJustCompleted(true);
  }

  if (justCompleted || alreadyComplete) {
    return (
      <ThemedView style={styles.completeContainer}>
        <CompletionBadge label="Lesson complete." />
        <PrimaryButton label="Back to Today" onPress={() => router.back()} />
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ThemedText type="title" style={styles.title}>
        {lesson.title}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.readTime}>
        {lesson.read_minutes} min read
      </ThemedText>
      <MarkdownBody>{lesson.body_md}</MarkdownBody>

      <ThemedText type="subtitle" style={styles.reflectionPrompt}>
        {lesson.reflection.prompt}
      </ThemedText>
      {lesson.reflection.type === 'single_choice' ? (
        <View>
          {(lesson.reflection.options ?? []).map((option) => (
            <ChoiceChip
              key={option}
              label={option}
              selected={selectedOption === option}
              onPress={() => setSelectedOption(option)}
            />
          ))}
        </View>
      ) : (
        <TextInput
          value={freeText}
          onChangeText={setFreeText}
          placeholder="Type your reflection"
          placeholderTextColor={theme.textSecondary}
          multiline
          style={[styles.input, { color: theme.text, borderColor: theme.border }]}
          accessibilityLabel="Reflection"
        />
      )}
      <PrimaryButton label="Mark complete" onPress={handleComplete} disabled={!canSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.four },
  content: { paddingBottom: Spacing.six },
  title: { marginBottom: Spacing.one },
  readTime: { marginBottom: Spacing.four },
  reflectionPrompt: { marginTop: Spacing.two, marginBottom: Spacing.three },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    minHeight: 100,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: Spacing.four,
  },
  completeContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.five, padding: Spacing.four },
});
