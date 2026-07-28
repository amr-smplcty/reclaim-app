import { getPalette, type ColorScheme, type Theme } from '@/theme/tokens';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Resolves the active Driftwood palette from the system appearance
// (DESIGN_SYSTEM.md §2). Dark is the designed-first mode: a null/unknown
// scheme resolves to dark (see resolveScheme in tokens.ts). Epic 15 introduced
// light mode; before that the app was dark-only.
export function useTheme(): Theme {
  const scheme = useColorScheme();
  return getPalette(scheme);
}

// The resolved 'light' | 'dark' string, for the rare consumer that needs to
// branch on mode itself (e.g. status-bar style, elevation vs. border depth)
// rather than just read a color.
export function useColorSchemeResolved(): ColorScheme {
  const scheme = useColorScheme();
  return scheme === 'light' ? 'light' : 'dark';
}
