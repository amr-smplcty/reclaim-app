import { render } from '@testing-library/react-native';

import { ThemedView } from '@/components/themed-view';
import { darkColors, lightColors } from '@/theme/tokens';

// Control the system appearance the hook reads.
let mockScheme: 'light' | 'dark' | null = 'dark';
jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: () => mockScheme,
}));

function bgOf(node: Awaited<ReturnType<typeof render>>) {
  const view = node.getByTestId('themed');
  const style = Array.isArray(view.props.style)
    ? Object.assign({}, ...view.props.style.flat())
    : view.props.style;
  return style.backgroundColor;
}

describe('useTheme — system-appearance-driven light/dark resolution', () => {
  it('renders the light surface under a light system appearance', async () => {
    mockScheme = 'light';
    const node = await render(<ThemedView testID="themed" />);
    expect(bgOf(node)).toBe(lightColors.surface);
  });

  it('renders the dark surface under a dark system appearance', async () => {
    mockScheme = 'dark';
    const node = await render(<ThemedView testID="themed" />);
    expect(bgOf(node)).toBe(darkColors.surface);
  });

  it('falls back to dark (designed-first) when the appearance is unset', async () => {
    mockScheme = null;
    const node = await render(<ThemedView testID="themed" />);
    expect(bgOf(node)).toBe(darkColors.surface);
  });
});
