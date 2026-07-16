// Mirrors src/lib/storage/encryptedStorage.test.ts's mocks exactly, so
// useJournalStore/useAssessmentHistoryStore's real encrypted persist
// middleware can round-trip without hitting the real (unavailable in Jest)
// native modules — plus a deleteItemAsync spy to prove the Keychain key
// actually gets wiped.
const mockSecureStore: Record<string, string> = {};
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async (key: string) => mockSecureStore[key] ?? null),
  setItemAsync: jest.fn(async (key: string, value: string) => {
    mockSecureStore[key] = value;
  }),
  deleteItemAsync: jest.fn(async (key: string) => {
    delete mockSecureStore[key];
  }),
}));

jest.mock('expo-crypto', () => ({
  getRandomBytesAsync: jest.fn(async (size: number) => {
    const bytes = new Uint8Array(size);
    for (let i = 0; i < size; i++) bytes[i] = i % 256;
    return bytes;
  }),
}));

import * as SecureStore from 'expo-secure-store';
import { deleteAllLocalData } from '@/features/settings/deleteAccount';
import { useAppStore } from '@/stores/useAppStore';
import { useOnboardingStore } from '@/features/assessment/useOnboardingStore';
import { useAssessmentHistoryStore } from '@/features/assessment/useAssessmentHistoryStore';
import { useJournalStore } from '@/features/journal/useJournalStore';
import { useToolkitStore } from '@/features/toolkit/useToolkitStore';
import { useProgramStore } from '@/features/program/useProgramStore';
import { useCommitmentGoalsStore } from '@/features/progress/useCommitmentGoalsStore';
import { useSettingsStore } from '@/features/settings/useSettingsStore';

// Delete account + all data (PRODUCT_SPEC §5.6, launch-required) — the whole
// point of this test is an exhaustive enumeration: every store that holds
// user data must be listed here AND actually emptied by deleteAllLocalData.
// A store added later that's forgotten in deleteAccount.ts would otherwise
// survive a "delete everything" request silently.
describe('deleteAllLocalData — deletion completeness', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    useAppStore.getState().setHasOnboarded(true);

    useOnboardingStore.getState().updateAnswers({ dobIso: '2000-01-01', motivations: ['relationships'] });
    useOnboardingStore.getState().goToStep('ppcs6');
    useOnboardingStore.getState().setIsMinor(false);

    useAssessmentHistoryStore.getState().recordAssessment([5, 5, 5, 5, 5, 5], 'past_6_months');

    useJournalStore.getState().addCheckin({
      week: 1,
      day: 1,
      mood: 4,
      urgesToday: true,
      urgeCount: 1,
      promptText: 'x',
      promptResponse: 'y',
    });

    useToolkitStore.getState().logUrge({ intensity: 5, trigger: 'stress', location: 'home', whatHappenedNext: 'x' });
    useToolkitStore.getState().logToolUse('breather', 5, 2);
    useToolkitStore.getState().logLapseDebrief({
      beforeChips: ['stress'],
      beforeFreeText: 'x',
      feelingChips: ['tired'],
      whatFailed: 'tool_not_used',
      changeNextTime: 'x',
    });

    useProgramStore.getState().saveExerciseOutput('some_key', 'some_value');
    useProgramStore.getState().completeLesson(1, 1);
    useProgramStore.getState().saveReflection('w1d1', { type: 'free_text', value: 'x' });

    useCommitmentGoalsStore.getState().optIn('trip', 5);

    useSettingsStore.getState().setAppLockEnabled(true);
    useSettingsStore.getState().setDailyLessonTime({ hour: 6, minute: 0 });
  });

  it('every seeded store actually holds non-default data before deletion (sanity check)', () => {
    expect(useAppStore.getState().hasOnboarded).toBe(true);
    expect(useOnboardingStore.getState().currentStep).not.toBe('welcome');
    expect(useAssessmentHistoryStore.getState().entries).not.toEqual([]);
    expect(useJournalStore.getState().checkins).not.toEqual([]);
    expect(useToolkitStore.getState().urgeLogs).not.toEqual([]);
    expect(useProgramStore.getState().exerciseOutputs).not.toEqual({});
    expect(useCommitmentGoalsStore.getState().optedIn).toBe(true);
    expect(useSettingsStore.getState().appLockEnabled).toBe(true);
  });

  it('resets every store to its documented initial state', async () => {
    await deleteAllLocalData();

    expect(useAppStore.getState().hasOnboarded).toBe(false);

    const onboarding = useOnboardingStore.getState();
    expect(onboarding.currentStep).toBe('welcome');
    expect(onboarding.isMinor).toBe(false);
    expect(onboarding.answers.dobIso).toBeNull();
    expect(onboarding.answers.motivations).toEqual([]);

    expect(useAssessmentHistoryStore.getState().entries).toEqual([]);

    const journal = useJournalStore.getState();
    expect(journal.checkins).toEqual([]);
    expect(journal.hasMigratedLegacyCheckins).toBe(false);

    const toolkit = useToolkitStore.getState();
    expect(toolkit.activeSession).toBeNull();
    expect(toolkit.urgeLogs).toEqual([]);
    expect(toolkit.toolUses).toEqual([]);
    expect(toolkit.lapseDebriefs).toEqual([]);
    expect(toolkit.relapsePreventionNotes).toEqual([]);

    const program = useProgramStore.getState();
    expect(program.position).toEqual({ week: 1, day: 1 });
    expect(program.completions).toEqual({});
    expect(program.exerciseOutputs).toEqual({});
    expect(program.reflections).toEqual({});
    expect(program.commitmentFollowups).toEqual({});

    const goals = useCommitmentGoalsStore.getState();
    expect(goals.optedIn).toBe(false);
    expect(goals.rewardName).toBe('');
    expect(goals.dailyPledgeAmount).toBe(0);
    expect(goals.goal).toBeNull();
    expect(goals.lastCreditedDateKey).toBeNull();

    const settings = useSettingsStore.getState();
    expect(settings.appLockEnabled).toBe(false);
    expect(settings.dailyLessonTime).toEqual({ hour: 8, minute: 0 });
    expect(settings.eveningCheckinTime).toEqual({ hour: 21, minute: 30 });
  });

  it('deletes the journal/assessment-history encryption key from the Keychain', async () => {
    await deleteAllLocalData();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledTimes(1);
  });
});
