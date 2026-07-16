#!/usr/bin/env node
'use strict';

// Banned-words CI lint (LEGAL_COMPLIANCE §2.1 / §9) — scans user-facing copy
// in app/ and src/ (TS/TSX) and content/ (JSON) for claims that would push
// Reclaim's regulatory positioning into medical-device/therapy territory.
//
// Scope note: legal/*.md and src/lib/legal/** (the Terms of Use / Privacy
// Policy source and their in-app display text) are excluded on purpose —
// disclaiming language ("does NOT provide... therapy... or diagnosis") is
// exactly what a legal document is for for and would otherwise make this
// lint permanently red. The banned-word policy targets product/marketing
// copy, not the legal documents that disclaim against those same terms.
//
// A small allowlist covers the two spec-mandated onboarding sentences (the
// wellness disclaimer, the results-screen footer) that legitimately use
// "diagnosis"/"therapy" in their required negated form, so this lint can
// stay a straightforward substring/regex check rather than parsing context.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SCAN_DIRS = ['app', 'src', 'content'];
const EXCLUDE_PATH_SEGMENTS = ['node_modules', path.join('src', 'lib', 'legal')];
const INCLUDE_EXTENSIONS = ['.ts', '.tsx', '.json'];

function normalize(text) {
  return text.replace(/\s+/g, ' ').trim();
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const ALLOWLISTED_PHRASES = [
  'not therapy, medical care, or a diagnosis',
  'not a diagnosis',
  // Naming the peer-reviewed technique a program element is modeled on is the
  // approved citation style (LEGAL_COMPLIANCE §2.2/§2.3: "attribute results to
  // the studied technique, never to Reclaim") — not a claim that Reclaim
  // itself is therapy. Content will keep citing these across future weeks.
  'Cognitive-behavioral therapy',
  'Acceptance and Commitment Therapy',
  // content/week6.json Day 4 — "every recovery tradition ever built, from
  // twelve-step rooms to modern therapy, converges on..." cites therapy as
  // one example among other general recovery traditions (twelve-step rooms)
  // to motivate having a trusted person, same non-claim citation category as
  // CBT/ACT above — not a claim that Reclaim itself is therapy. Kept as the
  // full surrounding phrase (not the bare word "therapy") so this stays
  // narrow to this one usage rather than allowlisting the word everywhere.
  'twelve-step rooms to modern therapy',
].map(normalize);

const BANNED_TERMS = [
  { label: 'treats/cures/heals porn addiction', pattern: /\b(treats?|cures?|heals?)\b[^.]{0,40}\bporn addiction\b/i },
  { label: 'porn addiction treatment/cure/heal', pattern: /\bporn addiction\b[^.]{0,40}\b(treatment|cure|heal)\b/i },
  { label: 'diagnose / diagnosis (about our assessment)', pattern: /\bdiagnos(e|is|ing|ed)\b/i },
  { label: 'therapy / therapeutic / clinical program', pattern: /\b(therapy|therapeutic|clinical program|digital therapeutic)\b/i },
  { label: 'clinically proven', pattern: /\bclinically proven\b/i },
  { label: 'guaranteed results', pattern: /\bguaranteed results\b/i },
  { label: 'will reduce your score', pattern: /\bwill reduce your score\b/i },
  { label: 'overcome addiction (outcome + disease claim)', pattern: /\bovercome (your |this )?addiction\b/i },
  { label: 'rewire / heal / repair your brain', pattern: /\b(rewire|repair|heal)\b[^.]{0,20}\bbrain\b/i },
  { label: 'HIPAA compliant', pattern: /\bhipaa compliant\b/i },
  { label: 'recommended by doctors/therapists', pattern: /\brecommended by (doctors|therapists)\b/i },
];

function walk(dir, files) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(ROOT, fullPath);
    if (EXCLUDE_PATH_SEGMENTS.some((seg) => relPath.split(path.sep).join('/').includes(seg.split(path.sep).join('/')))) {
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

function scanFile(file) {
  const raw = fs.readFileSync(file, 'utf8');
  let normalized = normalize(raw);
  for (const phrase of ALLOWLISTED_PHRASES) {
    normalized = normalized.replace(new RegExp(escapeRegExp(phrase), 'gi'), '');
  }

  const found = [];
  for (const { label, pattern } of BANNED_TERMS) {
    const match = normalized.match(pattern);
    if (match) {
      found.push({ label, match: match[0] });
    }
  }
  return found;
}

function main() {
  const files = [];
  for (const dir of SCAN_DIRS) {
    const dirPath = path.join(ROOT, dir);
    if (fs.existsSync(dirPath)) walk(dirPath, files);
  }

  const violations = [];
  for (const file of files) {
    for (const hit of scanFile(file)) {
      violations.push({ file: path.relative(ROOT, file), ...hit });
    }
  }

  if (violations.length > 0) {
    console.error('Banned-word lint failed (LEGAL_COMPLIANCE §2.1):\n');
    for (const v of violations) {
      console.error(`  ${v.file} — "${v.match}" (${v.label})`);
    }
    console.error(`\n${violations.length} violation(s) found across ${files.length} scanned files.`);
    process.exit(1);
  }

  console.log(`Banned-word lint passed — 0 violations across ${files.length} scanned files.`);
}

main();
