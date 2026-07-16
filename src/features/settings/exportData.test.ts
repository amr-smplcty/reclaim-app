import { buildDataExport } from '@/features/settings/exportData';
import { useAssessmentHistoryStore } from '@/features/assessment/useAssessmentHistoryStore';
import { useJournalStore } from '@/features/journal/useJournalStore';
import { useToolkitStore } from '@/features/toolkit/useToolkitStore';
import { useProgramStore } from '@/features/program/useProgramStore';
import { useCommitmentGoalsStore } from '@/features/progress/useCommitmentGoalsStore';

// "Export my data" (PRODUCT_SPEC §5.6 / LEGAL_COMPLIANCE §5.7 access rights)
// — buildDataExport is the pure part (no file/share-sheet I/O), so its job
// is proven here: every store's user-generated content actually makes it
// into the export, and nothing is silently dropped.
describe('buildDataExport — export content completeness', () => {
  afterEach(() => {
    useAssessmentHistoryStore.getState().reset();
    useJournalStore.getState().reset();
    useToolkitStore.getState().reset();
    useProgramStore.getState().reset();
    useCommitmentGoalsStore.getState().reset();
  });

  it('is entirely empty when every store is at its initial state', () => {
    const result = buildDataExport('2026-01-01T00:00:00.000Z');
    expect(result.assessmentHistory).toEqual([]);
    expect(result.journalCheckins).toEqual([]);
    expect(result.urgeLogs).toEqual([]);
    expect(result.toolUses).toEqual([]);
    expect(result.lapseDebriefs).toEqual([]);
    expect(result.exerciseOutputs).toEqual({});
    expect(result.lessonReflections).toEqual({});
    expect(result.commitmentGoal).toBeNull();
  });

  it('stamps the export with the given timestamp', () => {
    const result = buildDataExport('2026-03-14T12:00:00.000Z');
    expect(result.exportedAt).toBe('2026-03-14T12:00:00.000Z');
  });

  it('includes every real assessment history entry', () => {
    useAssessmentHistoryStore.getState().recordAssessment([5, 5, 5, 5, 5, 5], 'past_6_months');
    const result = buildDataExport('2026-01-01T00:00:00.000Z');
    expect(result.assessmentHistory).toHaveLength(1);
    expect(result.assessmentHistory[0].score).toBe(30);
  });

  it('includes every real journal check-in', () => {
    useJournalStore.getState().addCheckin({
      week: 1,
      day: 1,
      mood: 4,
      urgesToday: true,
      urgeCount: 2,
      promptText: 'How did today go?',
      promptResponse: 'Fine',
    });
    const result = buildDataExport('2026-01-01T00:00:00.000Z');
    expect(result.journalCheckins).toHaveLength(1);
    expect(result.journalCheckins[0].promptResponse).toBe('Fine');
  });

  it('includes real urge logs, tool uses, and lapse debriefs', () => {
    useToolkitStore.getState().logUrge({
      intensity: 7,
      trigger: 'stress',
      location: 'home',
      whatHappenedNext: 'Used the breather',
    });
    useToolkitStore.getState().logToolUse('breather', 7, 3);
    useToolkitStore.getState().logLapseDebrief({
      beforeChips: ['stress'],
      beforeFreeText: 'Rough day',
      feelingChips: ['tired'],
      whatFailed: 'tool_not_used',
      changeNextTime: 'Try the breather first',
    });

    const result = buildDataExport('2026-01-01T00:00:00.000Z');
    expect(result.urgeLogs).toHaveLength(1);
    expect(result.urgeLogs[0].trigger).toBe('stress');
    expect(result.toolUses).toHaveLength(1);
    expect(result.toolUses[0].delta).toBe(-4);
    expect(result.lapseDebriefs).toHaveLength(1);
    expect(result.lapseDebriefs[0].answers.changeNextTime).toBe('Try the breather first');
  });

  it('includes real exercise outputs and lesson reflections', () => {
    useProgramStore.getState().saveExerciseOutput('shift_list', ['walk', 'shower']);
    useProgramStore.getState().saveReflection('w1d1', { type: 'free_text', value: 'Good session' });

    const result = buildDataExport('2026-01-01T00:00:00.000Z');
    expect(result.exerciseOutputs.shift_list).toEqual(['walk', 'shower']);
    expect(result.lessonReflections.w1d1.value).toBe('Good session');
  });

  it('includes the commitment goal only when opted in', () => {
    expect(buildDataExport('2026-01-01T00:00:00.000Z').commitmentGoal).toBeNull();

    useCommitmentGoalsStore.getState().optIn('a weekend trip', 5);
    const result = buildDataExport('2026-01-01T00:00:00.000Z');
    expect(result.commitmentGoal).not.toBeNull();
    expect(result.commitmentGoal?.rewardName).toBe('a weekend trip');
    expect(result.commitmentGoal?.dailyPledgeAmount).toBe(5);
  });
});
