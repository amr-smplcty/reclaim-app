import { detectSafetySignal } from '@/lib/safety/detect';

const patterns = {
  crisis: ['suicide', 'kill myself', 'want to die', 'end my life', "can't go on"],
  illegal_content: ['child porn', 'underage'],
};

describe('detectSafetySignal — CLINICAL_SPEC §6', () => {
  it('returns null for ordinary text', () => {
    expect(detectSafetySignal('I want to quit watching so much', patterns)).toBeNull();
  });

  it('detects crisis language case-insensitively', () => {
    expect(detectSafetySignal('sometimes I think about suicide', patterns)).toBe('crisis');
    expect(detectSafetySignal('I want to KILL MYSELF', patterns)).toBe('crisis');
    expect(detectSafetySignal("I just can't go on anymore", patterns)).toBe('crisis');
  });

  it('detects illegal-content disclosures', () => {
    expect(detectSafetySignal('I saw child porn once', patterns)).toBe('illegal_content');
  });

  it('prioritizes crisis over illegal-content when both match', () => {
    expect(detectSafetySignal('child porn made me want to end my life', patterns)).toBe('crisis');
  });

  it('is null on empty or whitespace-only text', () => {
    expect(detectSafetySignal('', patterns)).toBeNull();
    expect(detectSafetySignal('   ', patterns)).toBeNull();
  });
});
