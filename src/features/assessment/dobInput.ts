// Pure DOB-from-parts builder for the manual DD/MM/YYYY fallback fields
// (used when the native date picker is unavailable, e.g. Expo Go). Kept
// free of any native imports so it's unit-testable on its own — the age-gate
// decision logic (calculateAge/isMinor in scoring.ts) is unchanged and still
// consumes the resulting Date exactly as before.
export function buildDateFromParts(day: string, month: string, year: string): Date | null {
  if (day.length === 0 || month.length === 0 || year.length !== 4) return null;

  const d = Number(day);
  const m = Number(month);
  const y = Number(year);
  if (!Number.isInteger(d) || !Number.isInteger(m) || !Number.isInteger(y)) return null;

  const date = new Date(y, m - 1, d);
  // Reject rollovers (e.g. 31 Feb → 2/3 Mar) and future dates.
  const validDayOfMonth = date.getDate() === d && date.getMonth() === m - 1 && date.getFullYear() === y;
  if (Number.isNaN(date.getTime()) || !validDayOfMonth || date > new Date()) return null;

  return date;
}
