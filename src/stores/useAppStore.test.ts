import { useAppStore } from '@/stores/useAppStore';

describe('useAppStore', () => {
  afterEach(() => {
    useAppStore.setState({ hasOnboarded: false });
  });

  it('defaults to not onboarded', () => {
    expect(useAppStore.getState().hasOnboarded).toBe(false);
  });

  it('flips hasOnboarded via setHasOnboarded', () => {
    useAppStore.getState().setHasOnboarded(true);
    expect(useAppStore.getState().hasOnboarded).toBe(true);
  });
});
