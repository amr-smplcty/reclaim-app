#!/usr/bin/env node
'use strict';

// Bundle-purity lint (INCIDENTS.md — testlib-leak). expo-router's
// require.context (node_modules/expo-router/_ctx.js) bundles every
// .ts/.tsx/.js/.jsx file under app/ except +api/+html routes, regardless of
// dev vs. production. A *.test.*/*.spec.* file, or any file importing
// test-only tooling, placed anywhere under app/ ships straight into the
// runtime bundle and crashes Metro resolution (e.g.
// @testing-library/react-native pulling in Node's "console" module, which
// Metro can't resolve). This is a fast static first pass; scripts/verify-bundle.js
// (an actual `expo export`) is the authoritative check for anything transitive
// this doesn't parse.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const APP_DIR = path.join(ROOT, 'app');
const INCLUDE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

// Mirrors node_modules/expo-router/_ctx.js's require.context ignore pattern —
// only +api/+html routes are excluded from the app entry graph.
const EXCLUDED_ROUTE_PATTERN = /\+(?:api|html)\.[tj]sx?$/;
const TEST_FILE_PATTERN = /\.(?:test|spec)\.[tj]sx?$/;
const IMPORT_SPECIFIER_PATTERN = /(?:\bfrom\s*|\brequire\s*\(\s*|^\s*import\s*)['"]([^'"]+)['"]/gm;

function walk(dir, files) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
    } else if (INCLUDE_EXTENSIONS.includes(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

function isForbiddenSpecifier(spec) {
  if (spec === 'jest' || spec.startsWith('jest/') || spec.startsWith('jest-') || spec.startsWith('@jest/')) return true;
  if (spec === '@testing-library/react-native' || spec.startsWith('@testing-library/')) return true;
  if (TEST_FILE_PATTERN.test(spec)) return true; // relative import of a *.test.*/*.spec.* module
  return false;
}

function findViolations() {
  if (!fs.existsSync(APP_DIR)) return [];

  const files = walk(APP_DIR, []);
  const violations = [];

  for (const file of files) {
    const relPath = path.relative(ROOT, file).split(path.sep).join('/');
    if (EXCLUDED_ROUTE_PATTERN.test(relPath)) continue; // Never reaches the app bundle.

    if (TEST_FILE_PATTERN.test(file)) {
      violations.push({
        file: relPath,
        reason: 'test file lives inside app/ — expo-router bundles every file here (except +api/+html) in dev and production alike',
      });
      continue;
    }

    const source = fs.readFileSync(file, 'utf8');
    IMPORT_SPECIFIER_PATTERN.lastIndex = 0;
    let match;
    while ((match = IMPORT_SPECIFIER_PATTERN.exec(source))) {
      const spec = match[1];
      if (isForbiddenSpecifier(spec)) {
        violations.push({ file: relPath, reason: `imports test-only module "${spec}"` });
      }
    }
  }

  return violations;
}

function main() {
  const violations = findViolations();
  if (violations.length > 0) {
    console.error('Bundle-purity lint failed — test-only code is reachable from the app entry graph (app/):\n');
    for (const v of violations) {
      console.error(`  ${v.file} — ${v.reason}`);
    }
    console.error(`\n${violations.length} violation(s) found. Move test files/utilities outside app/ (e.g. __tests__/).`);
    process.exit(1);
  }
  console.log('Bundle-purity lint passed — no test-only code reachable from app/.');
}

if (require.main === module) {
  main();
}

module.exports = { findViolations };
