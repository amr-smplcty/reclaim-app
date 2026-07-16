import { act } from '@testing-library/react-native';

// In this project's test environment (React 19 + react-test-renderer),
// state updates from fireEvent.press don't reliably flush synchronously when
// several interactions fire in a tight loop — confirmed with a minimal,
// component-independent repro. Awaiting a real event-loop tick (wrapped in
// act so React flushes pending work) between interactions makes them land.
// Use after fireEvent.press whenever the next interaction or assertion
// depends on the resulting re-render. Test-only — never imported by app code
// (INCIDENTS.md INC-9: test utilities stay outside the app import graph).
//
// This is a FIXED delay, not a guarantee — under full-suite worker
// contention it has been observed to be insufficient even when doubled up
// (see src/features/program/exercises/MultiSelectWriteUnlimited.test.tsx,
// found integrating Week 5). If a test using tick() is intermittently
// flaky specifically under `npm test` (not standalone), prefer
// @testing-library/react-native's `waitFor(() => expect(...))` instead —
// it polls until the assertion passes rather than guessing a delay.
export async function tick(): Promise<void> {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}
