import { View, type ViewProps } from 'react-native';

import type { ThemeColor } from '@/theme/tokens';
import { useTheme } from '@/hooks/use-theme';

export type ThemedViewProps = ViewProps & {
  type?: ThemeColor;
};

export function ThemedView({ style, type, ...otherProps }: ThemedViewProps) {
  const theme = useTheme();

  return <View style={[{ backgroundColor: theme[type ?? 'bg'] }, style]} {...otherProps} />;
}
