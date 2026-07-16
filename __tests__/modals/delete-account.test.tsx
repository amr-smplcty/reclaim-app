import { fireEvent, render } from '@testing-library/react-native';

import { tick } from '../../test-utils/asyncAct';
import DeleteAccountScreen from '../../app/(modals)/delete-account';

// Wrapper closures (not direct references) are deliberate: jest.mock()
// factories run at require-time, which — because Babel hoists static
// imports above these const declarations — is BEFORE the `const mock... =
// jest.fn()` lines below execute. A direct reference would capture
// `undefined` at that point; a closure defers the lookup until the mock is
// actually called, by which point the whole file has finished evaluating.
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  router: { canGoBack: () => false, push: jest.fn(), replace: (href: string) => mockReplace(href), back: jest.fn() },
}));

const mockGetCurrentUserId = jest.fn(async () => 'user-123');
jest.mock('@/lib/supabase/auth', () => ({
  getCurrentUserId: () => mockGetCurrentUserId(),
}));

const mockDeleteAccountAndAllData = jest.fn(async (_userId: string | undefined) => undefined);
jest.mock('@/features/settings/deleteAccount', () => ({
  deleteAccountAndAllData: (userId: string | undefined) => mockDeleteAccountAndAllData(userId),
}));

// One interactive test per file (BACKLOG #38 convention) — this screen's job
// is just wiring: gate the destructive action behind an exact typed
// confirmation, then call the (separately, exhaustively tested —
// deleteAccount.test.ts) deletion pipeline and leave the screen.
describe('DeleteAccountScreen', () => {
  it('stays disabled until "DELETE" is typed exactly, then deletes and navigates to a fresh app root', async () => {
    const { getByLabelText, getByText } = await render(<DeleteAccountScreen />);

    const deleteButton = () => getByText('Permanently delete').parent as unknown as { props: { accessibilityState: { disabled: boolean } } };
    expect(deleteButton().props.accessibilityState.disabled).toBe(true);

    const input = getByLabelText('Type DELETE to confirm');
    fireEvent.changeText(input, 'delete');
    await tick();
    expect(deleteButton().props.accessibilityState.disabled).toBe(true);

    fireEvent.changeText(input, 'DELETE');
    await tick();
    expect(deleteButton().props.accessibilityState.disabled).toBe(false);

    fireEvent.press(getByText('Permanently delete'));
    await tick();

    expect(mockDeleteAccountAndAllData).toHaveBeenCalledWith('user-123');
    expect(mockReplace).toHaveBeenCalledWith('/');
  });
});
