#!/usr/bin/env node
'use strict';

// Token lint (CLAUDE.md rule 6) — no hardcoded hex colors anywhere outside
// src/theme/tokens.ts. Mirrors scripts/lint-banned-words.js's structure.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SCAN_DIRS = ['app', 'src'];
const EXCLUDE_PATH_SEGMENTS = ['node_modules', path.join('src', 'theme', 'tokens.ts')];
const INCLUDE_EXTENSIONS = ['.ts', '.tsx'];
const HEX_COLOR_PATTERN = /#[0-9A-Fa-f]{3,8}\b/g;

function walk(dir, files) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(ROOT, fullPath).split(path.sep).join('/');
    if (EXCLUDE_PATH_SEGMENTS.some((seg) => relPath.includes(seg.split(path.sep).join('/')))) {
      continue;
    }
    if (entry.isDirectory()) {
      walk(fullPath, files);
    } else if (INCLUDE_EXTENSIONS.includes(path.extname(entry.name)) && !entry.name.includes('.test.')) {
      files.push(fullPath);
    }
  }
  return files;
}

function findViolations() {
  const files = [];
  for (const dir of SCAN_DIRS) {
    const dirPath = path.join(ROOT, dir);
    if (fs.existsSync(dirPath)) walk(dirPath, files);
  }

  const violations = [];
  for (const file of files) {
    const raw = fs.readFileSync(file, 'utf8');
    const matches = raw.match(HEX_COLOR_PATTERN);
    if (matches) {
      violations.push({ file: path.relative(ROOT, file), matches });
    }
  }
  return violations;
}

function main() {
  const violations = findViolations();
  if (violations.length > 0) {
    console.error('Token lint failed (CLAUDE.md rule 6 — no hardcoded colors outside src/theme/tokens.ts):\n');
    for (const v of violations) {
      console.error(`  ${v.file} — ${v.matches.join(', ')}`);
    }
    console.error(`\n${violations.length} file(s) with raw hex colors found.`);
    process.exit(1);
  }
  console.log('Token lint passed — no raw hex colors outside src/theme/tokens.ts.');
}

if (require.main === module) {
  main();
}

module.exports = { findViolations };
