import { colors } from '@/theme/tokens';

// Fixed dark-first palette (CLAUDE.md rule 6) — one deliberate palette, no
// light-mode variant, so this is a plain accessor rather than something
// reactive to the system color scheme.
export function useTheme() {
  return colors;
}
