export type SafetySignal = 'crisis' | 'illegal_content' | null;

export interface SafetyPatterns {
  crisis: string[];
  illegal_content: string[];
}

function containsAny(haystack: string, needles: string[]): boolean {
  return needles.some((needle) => haystack.includes(needle));
}

// Crisis takes priority when text matches both — reaching someone in crisis
// outweighs the illegal-content flow (CLINICAL_SPEC §6).
export function detectSafetySignal(text: string, patterns: SafetyPatterns): SafetySignal {
  const normalized = text.trim().toLowerCase();
  if (!normalized) return null;

  if (containsAny(normalized, patterns.crisis)) return 'crisis';
  if (containsAny(normalized, patterns.illegal_content)) return 'illegal_content';
  return null;
}
