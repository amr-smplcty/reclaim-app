const { findViolations } = require('./lint-bundle-purity');

describe('bundle-purity lint — no test-only code reachable from app/ (INCIDENTS.md: testlib-leak)', () => {
  it('finds no violations across the current app/ tree', () => {
    expect(findViolations()).toEqual([]);
  });
});
