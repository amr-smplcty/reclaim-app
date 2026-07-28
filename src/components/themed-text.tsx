import { StyleSheet, Text, type TextProps } from 'react-native';

import { type ThemeColor, typography } from '@/theme/tokens';
import { useTheme } from '@/hooks/use-theme';

// Typographic variants (DESIGN_SYSTEM.md §3). New Driftwood step names are
// canonical; the legacy names (default/title/subtitle/small/link) are kept as
// back-compat aliases mapped onto the sans steps so existing screens keep
// "sans for operating" — serif is opt-in via `body`/`display` for lesson
// reading and ceremony only. Never mix serif and sans within one paragraph.
export type ThemedTextType =
  // Driftwood scale
  | 'display' // ceremony, week complete — serif
  | 'title1' // screen titles — SF
  | 'title2' // section headers — SF
  | 'title3' // card titles — SF
  | 'body' // lesson reading — serif
  | 'callout' // secondary body — SF
  | 'subhead' // labels, list rows — SF
  | 'footnote' // meta, timestamps — SF
  | 'caption' // micro-labels — SF
  // Legacy aliases (pre-Driftwood) → sans steps
  | 'default'
  | 'title'
  | 'subtitle'
  | 'small'
  | 'link';

export type ThemedTextProps = TextProps & {
  type?: ThemedTextType;
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      // Dynamic Type to 200% — allow scaling, no fixed-height containers.
      allowFontScaling
      style={[{ color: theme[themeColor ?? 'textPrimary'] }, styles[type], style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  // Driftwood steps
  display: typography.display,
  title1: typography.title1,
  title2: typography.title2,
  title3: typography.title3,
  body: typography.body,
  callout: typography.callout,
  subhead: typography.subhead,
  footnote: typography.footnote,
  caption: typography.caption,
  // Legacy aliases → sans, closest step
  default: typography.callout,
  title: typography.title1,
  subtitle: typography.title3,
  small: typography.footnote,
  link: { ...typography.callout, fontWeight: '600' },
});
