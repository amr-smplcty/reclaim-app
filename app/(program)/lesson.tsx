import { useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

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
import { splitLessonIntoCards } from '@/features/program/lessonCards';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/theme/tokens';

// Lesson player (PRODUCT_SPEC §5.2) — swipeable cards, one thought per card
// (split from body_md at paragraph breaks), thin progress bar on top, the
// reflection as the final card. Listen mode: a play button only appears
// once a lesson actually has an audio_url — every lesson's is still null
// today (TTS generation is a content-pipeline task, TODO(content); no
// playback wiring needed until a real URL exists).
export default function LessonScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const position = useProgramStore((s) => s.position);
  const completions = useProgramStore((s) => s.completions);
  const completeLesson = useProgramStore((s) => s.completeLesson);
  const saveReflection = useProgramStore((s) => s.saveReflection);

  const day = useMemo(() => findProgramDay(getProgramModules(), position), [position]);
  const cards = useMemo(() => splitLessonIntoCards(day?.lesson.body_md), [day]);

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [freeText, setFreeText] = useState('');
  const [justCompleted, setJustCompleted] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

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
  const totalSteps = cards.length + 1; // + the reflection card

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

  function goToCard(index: number) {
    setCardIndex(index);
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
  }

  function handleScrollEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
    setCardIndex(Math.round(event.nativeEvent.contentOffset.x / width));
  }

  return (
    <ThemedView style={styles.screen}>
      <View style={styles.header}>
        <View style={[styles.progressTrack, { backgroundColor: theme.surface }]}>
          <View
            style={[
              styles.progressFill,
              { backgroundColor: theme.accent, width: `${((cardIndex + 1) / totalSteps) * 100}%` },
            ]}
          />
        </View>
        {lesson.audio_url ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Listen to this lesson" hitSlop={8}>
            <Ionicons name="play-circle-outline" size={28} color={theme.accent} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        style={styles.pager}
      >
        {cards.map((card, index) => (
          <View key={index} style={[styles.card, { width }]}>
            <ScrollView contentContainerStyle={styles.cardContent}>
              {index === 0 ? (
                <>
                  <ThemedText type="title" style={styles.title}>
                    {lesson.title}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary" style={styles.readTime}>
                    {lesson.read_minutes} min read
                  </ThemedText>
                </>
              ) : null}
              <MarkdownBody>{card}</MarkdownBody>
            </ScrollView>
            <View style={styles.footer}>
              <PrimaryButton label="Next" onPress={() => goToCard(index + 1)} />
            </View>
          </View>
        ))}

        <View style={[styles.card, { width }]}>
          <ScrollView contentContainerStyle={styles.cardContent}>
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
                style={[styles.input, { color: theme.textPrimary, borderColor: theme.border }]}
                accessibilityLabel="Reflection"
              />
            )}
          </ScrollView>
          <View style={styles.footer}>
            <PrimaryButton label="Mark complete" onPress={handleComplete} disabled={!canSubmit} />
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.four },
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
  },
  progressTrack: { flex: 1, height: 4, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: 4, borderRadius: 2 },
  pager: { flex: 1 },
  card: { flex: 1, justifyContent: 'space-between' },
  cardContent: { flexGrow: 1, padding: Spacing.four },
  title: { marginBottom: Spacing.one },
  readTime: { marginBottom: Spacing.four },
  reflectionPrompt: { marginBottom: Spacing.three },
  footer: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.four },
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
