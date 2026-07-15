import { findViolations } from '../../scripts/lint-tokens';

describe('token lint — no raw hex colors outside src/theme/tokens.ts (CLAUDE.md rule 6)', () => {
  it('finds no violations across the current app/src tree', () => {
    expect(findViolations()).toEqual([]);
  });
});
