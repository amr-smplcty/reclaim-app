import Markdown from 'react-native-markdown-display';

import { useTheme } from '@/hooks/use-theme';

interface Props {
  children: string;
}

export function MarkdownBody({ children }: Props) {
  const theme = useTheme();

  return (
    <Markdown
      style={{
        body: { color: theme.textPrimary, fontSize: 16, lineHeight: 24 },
        heading1: { color: theme.textPrimary, fontWeight: '700', fontSize: 22, marginBottom: 8 },
        heading2: { color: theme.textPrimary, fontWeight: '700', fontSize: 19, marginBottom: 6 },
        strong: { color: theme.textPrimary, fontWeight: '700' },
        em: { fontStyle: 'italic' },
        paragraph: { marginTop: 0, marginBottom: 16 },
        bullet_list: { marginBottom: 12 },
        ordered_list: { marginBottom: 12 },
        link: { color: theme.accent },
      }}
    >
      {children}
    </Markdown>
  );
}
