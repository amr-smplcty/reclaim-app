import { act } from '@testing-library/react-native';

// In this project's test environment (React 19 + react-test-renderer),
// state updates from fireEvent.press don't reliably flush synchronously when
// several interactions fire in a tight loop — confirmed with a minimal,
// component-independent repro. Awaiting a real event-loop tick (wrapped in
// act so React flushes pending work) between interactions makes them land.
// Use after fireEvent.press whenever the next interaction or assertion
// depends on the resulting re-render. Test-only — never imported by app code
// (INCIDENTS.md INC-9: test utilities stay outside the app import graph).
export async function tick(): Promise<void> {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}
