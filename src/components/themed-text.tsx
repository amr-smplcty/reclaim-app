import { StyleSheet, Text, type TextProps } from 'react-native';

import { type ThemeColor, typography } from '@/theme/tokens';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'subtitle' | 'small' | 'link';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'textPrimary'] },
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'subtitle' && styles.subtitle,
        type === 'small' && styles.small,
        type === 'link' && styles.link,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: { ...typography.body },
  title: { ...typography.title },
  subtitle: { fontSize: 20, lineHeight: 26, fontWeight: '600' },
  small: { ...typography.caption },
  link: { ...typography.body, fontWeight: '500' },
});
