import { useProgramStore } from '@/features/program/useProgramStore';

describe('useProgramStore — completion-based progression', () => {
  afterEach(() => {
    useProgramStore.getState().reset();
  });

  it('starts at week 1, day 1', () => {
    const { position } = useProgramStore.getState();
    expect(position).toEqual({ week: 1, day: 1 });
  });

  it('does not advance until both lesson and exercise are complete', () => {
    useProgramStore.getState().completeLesson(1, 1);
    expect(useProgramStore.getState().position).toEqual({ week: 1, day: 1 });

    useProgramStore.getState().completeExercise(1, 1);
    expect(useProgramStore.getState().position).toEqual({ week: 1, day: 2 });
  });

  it('advances regardless of completion order', () => {
    useProgramStore.getState().completeExercise(1, 1);
    expect(useProgramStore.getState().position).toEqual({ week: 1, day: 1 });

    useProgramStore.getState().completeLesson(1, 1);
    expect(useProgramStore.getState().position).toEqual({ week: 1, day: 2 });
  });

  it('checkin completion never gates or triggers advance', () => {
    useProgramStore.getState().completeCheckin(1, 1);
    expect(useProgramStore.getState().position).toEqual({ week: 1, day: 1 });
    expect(useProgramStore.getState().completions['1-1'].checkinComplete).toBe(true);

    useProgramStore.getState().completeLesson(1, 1);
    useProgramStore.getState().completeExercise(1, 1);
    expect(useProgramStore.getState().position).toEqual({ week: 1, day: 2 });
  });

  it('rolls from day 7 into week 2, day 1', () => {
    for (let day = 1; day <= 7; day++) {
      useProgramStore.getState().completeLesson(1, day);
      useProgramStore.getState().completeExercise(1, day);
    }
    expect(useProgramStore.getState().position).toEqual({ week: 2, day: 1 });
  });

  it('never changes position on its own — no calendar/date-based rollforward exists', () => {
    useProgramStore.getState().completeLesson(1, 3);
    const before = useProgramStore.getState().position;
    // Simulate "time passing" — there is no action to call, which is the point:
    // position only ever changes via explicit completion, never automatically.
    const after = useProgramStore.getState().position;
    expect(after).toEqual(before);
    expect(after).toEqual({ week: 1, day: 1 });
  });

  it('persists a completion record independent of the current position', () => {
    useProgramStore.getState().completeLesson(1, 4);
    useProgramStore.getState().completeExercise(1, 4);
    // Position never touched day 4 directly (it started at day 1), but the
    // record for day 4 is still tracked — completion isn't tied to "today."
    expect(useProgramStore.getState().completions['1-4']).toEqual({
      lessonComplete: true,
      exerciseComplete: true,
      checkinComplete: false,
    });
  });
});

describe('useProgramStore — exercise outputs and reflections', () => {
  afterEach(() => {
    useProgramStore.getState().reset();
  });

  it('saves and retrieves a named exercise output', () => {
    useProgramStore.getState().saveExerciseOutput('anchor_why', { selected: ['My time'], write: 'Something different.' });
    expect(useProgramStore.getState().getExerciseOutput('anchor_why')).toEqual({
      selected: ['My time'],
      write: 'Something different.',
    });
  });

  it('returns undefined for an output that was never saved', () => {
    expect(useProgramStore.getState().getExerciseOutput('nonexistent')).toBeUndefined();
  });

  it('saves a lesson reflection by lesson id, stamped with a timestamp', () => {
    useProgramStore.getState().saveReflection('w1d1_lesson', { type: 'single_choice', value: 'Something else' });
    expect(useProgramStore.getState().reflections.w1d1_lesson).toMatchObject({
      type: 'single_choice',
      value: 'Something else',
    });
    expect(typeof useProgramStore.getState().reflections.w1d1_lesson.timestamp).toBe('string');
  });
});

describe('useProgramStore — checklist_commit next-day follow-up', () => {
  afterEach(() => {
    useProgramStore.getState().reset();
  });

  it('records a followup answer keyed by the original day', () => {
    useProgramStore.getState().recordCommitmentFollowup('2-4', 'partly');
    expect(useProgramStore.getState().commitmentFollowups['2-4']).toBe('partly');
  });

  it('accepts any of yes/partly/no with no special-casing', () => {
    useProgramStore.getState().recordCommitmentFollowup('2-4', 'no');
    expect(useProgramStore.getState().commitmentFollowups['2-4']).toBe('no');
  });
});
