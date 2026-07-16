import { resolveChecklistFollowup } from '@/features/program/checklistFollowup';
import { getProgramModules } from '@/lib/content/week';

// Real program content has exactly two checklist_commit exercises with
// followup_next_day: true — content/week2.json Day 4 (save_to:
// environment_changes) and content/week5.json Day 2 (save_to:
// winddown_protocol). This proves the Epic 5b generalization (today.tsx's
// "look at yesterday" scan) genuinely handles a second instance, not just
// coincidentally works for the first.
describe('resolveChecklistFollowup — real content, two coexisting instances', () => {
  const modules = getProgramModules();

  it('resolves Week 2 Day 4s follow-up when sitting on Week 2 Day 5', () => {
    const result = resolveChecklistFollowup(
      { week: 2, day: 5 },
      modules,
      { environment_changes: { audit: {}, commitments: ['Charger outside bedroom'] } },
      {}
    );
    expect(result.key).toBe('2-4');
    expect(result.shouldShow).toBe(true);
    expect(result.output?.commitments).toEqual(['Charger outside bedroom']);
  });

  it('resolves Week 5 Day 2s follow-up when sitting on Week 5 Day 3 — a second, independent instance', () => {
    const result = resolveChecklistFollowup(
      { week: 5, day: 3 },
      modules,
      { winddown_protocol: { audit: {}, commitments: ['Phone charges in the kitchen'] } },
      {}
    );
    expect(result.key).toBe('5-2');
    expect(result.shouldShow).toBe(true);
    expect(result.output?.commitments).toEqual(['Phone charges in the kitchen']);
  });

  it('answering Week 2s follow-up does not mark Week 5s as already answered (independent keys)', () => {
    const commitmentFollowups = { '2-4': 'yes' as const };
    const week5Result = resolveChecklistFollowup(
      { week: 5, day: 3 },
      modules,
      { winddown_protocol: { audit: {}, commitments: ['Phone charges in the kitchen'] } },
      commitmentFollowups
    );
    expect(week5Result.shouldShow).toBe(true);
  });

  it('answering Week 5s follow-up does not mark Week 2s as already answered (independent keys)', () => {
    const commitmentFollowups = { '5-2': 'yes' as const };
    const week2Result = resolveChecklistFollowup(
      { week: 2, day: 5 },
      modules,
      { environment_changes: { audit: {}, commitments: ['Charger outside bedroom'] } },
      commitmentFollowups
    );
    expect(week2Result.shouldShow).toBe(true);
  });

  it('stops showing once that specific instance is answered', () => {
    const result = resolveChecklistFollowup(
      { week: 2, day: 5 },
      modules,
      { environment_changes: { audit: {}, commitments: ['Charger outside bedroom'] } },
      { '2-4': 'partly' }
    );
    expect(result.shouldShow).toBe(false);
  });

  it('does not show when the previous day is not a checklist_commit at all', () => {
    // Week 2 Day 2 -> previous is Day 1, a multi_select_write, not checklist_commit.
    const result = resolveChecklistFollowup({ week: 2, day: 2 }, modules, {}, {});
    expect(result.shouldShow).toBe(false);
    expect(result.payload).toBeUndefined();
  });

  it('does not show when the previous days exercise output has not been saved yet', () => {
    const result = resolveChecklistFollowup({ week: 2, day: 5 }, modules, {}, {});
    expect(result.shouldShow).toBe(false);
  });

  it('does not show at the very first day of the program (no previous position)', () => {
    const result = resolveChecklistFollowup({ week: 1, day: 1 }, modules, {}, {});
    expect(result.key).toBeNull();
    expect(result.shouldShow).toBe(false);
  });
});
