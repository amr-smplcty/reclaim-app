// Pure pieces behind UrgeValueMap.tsx (Week 4 Day 4) — tags the user's own
// recent urge logs with the value each urge was really asking for. Below
// min_logs there isn't enough real data, so the component degrades to a
// free-text worksheet instead (INC-2/INC-8 standing rule: guard on
// insufficient real data, degrade gracefully, never crash or present an
// unusable near-empty list).

import type { UrgeValueMapOutput } from '@/types/program';
import type { UrgeLogEntry } from '@/features/toolkit/useToolkitStore';

export function hasSufficientLogs(urgeLogs: UrgeLogEntry[], minLogs: number): boolean {
  return urgeLogs.length >= minLogs;
}

// Most-recent-first is more useful to review than the full history, and
// keeps the tagging list short enough to actually finish.
export function selectRecentLogs(urgeLogs: UrgeLogEntry[], max = 5): UrgeLogEntry[] {
  return urgeLogs.slice(-max);
}

export function resolveTagOptions(valuesCore: string[], extraTags: string[]): string[] {
  return [...valuesCore, ...extraTags];
}

export function allLogsTagged(logs: UrgeLogEntry[], tags: Record<string, string>): boolean {
  return logs.length > 0 && logs.every((log) => !!tags[log.id]);
}

export function buildMappedOutput(tags: Record<string, string>): UrgeValueMapOutput {
  return {
    entries: Object.entries(tags).map(([logId, tag]) => ({ logId, tag })),
    worksheetText: null,
  };
}

export function buildWorksheetOutput(text: string): UrgeValueMapOutput {
  return { entries: [], worksheetText: text };
}
