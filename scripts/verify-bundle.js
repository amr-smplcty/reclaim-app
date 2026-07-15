#!/usr/bin/env node
'use strict';

// Authoritative guard for the testlib-leak class of bug (INCIDENTS.md):
// actually bundles the app with Metro via `expo export`, so any test-only
// dependency reachable from the app entry graph — however deeply transitive —
// fails here exactly the way Expo Go would fail at launch. typecheck/tests/
// lint:bundle-purity all pass without ever invoking Metro, which is exactly
// why the original leak went unnoticed; this is the one check that can't
// miss it. lint:bundle-purity is the fast static first pass; this is ground
// truth.

const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'expo-export-verify-'));

try {
  // --dev --no-minify --no-bytecode matches how Expo Go actually loads the
  // app (the conditions the original bug report — and this repo's "works in
  // Expo Go on iPhone" definition of done — care about), not a production build.
  const result = spawnSync(
    'npx',
    ['expo', 'export', '--platform', 'ios', '--dev', '--no-minify', '--no-bytecode', '--output-dir', outputDir],
    { stdio: 'inherit', cwd: ROOT }
  );

  if (result.status !== 0) {
    console.error('\nverify:bundle failed — the app does not bundle cleanly for iOS (see Metro output above).');
    process.exit(result.status || 1);
  }
  console.log('\nverify:bundle passed — app bundles cleanly for iOS.');
} finally {
  fs.rmSync(outputDir, { recursive: true, force: true });
}
