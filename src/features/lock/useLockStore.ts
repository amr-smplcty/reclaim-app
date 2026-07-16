import { create } from 'zustand';

import { shouldLockOnForeground } from '@/features/lock/lockPolicy';

interface LockState {
  // Deliberately not persisted: this store's module-load initial state IS
  // the cold-start behavior (locked, per PRODUCT_SPEC §5.6) — persisting it
  // would let a killed-and-relaunched app resume unlocked.
  isLocked: boolean;
  backgroundedAt: number | null;
  unlock: () => void;
  recordBackgrounded: (at: number) => void;
  handleForeground: (now: number) => void;
}

export const useLockStore = create<LockState>()((set, get) => ({
  isLocked: true,
  backgroundedAt: null,

  unlock: () => set({ isLocked: false }),

  recordBackgrounded: (at) => set({ backgroundedAt: at }),

  handleForeground: (now) => {
    const { backgroundedAt } = get();
    set({
      isLocked: shouldLockOnForeground(backgroundedAt, now) || get().isLocked,
      backgroundedAt: null,
    });
  },
}));
