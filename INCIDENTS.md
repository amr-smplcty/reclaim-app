# INCIDENTS.md — Error log & prevention rules

> Every real error gets an entry: symptom → root cause → fix → prevention rule.
> The prevention rules are the payload: they get baked into future epic prompts and CI.
> Maintained by both the founder (via Claude.ai reviews) and Claude Code (append when fixing bugs).

## Incident log

### INC-1 · Expo Go version mismatch
- **Symptom:** "The project you requested requires a newer version of Expo Go."
- **Root cause:** Expo Go app on phone older than project's SDK 57.
- **Fix:** Update Expo Go from App Store; simulator route (`npx expo start` → `i`) auto-installs the matching version.
- **Prevention:** When testing on a new device, check Expo Go version first; simulator sidesteps entirely.

### INC-2 · Native module renders as red error box in Expo Go
- **Symptom:** "Unimplemented component: ViewManagerAdapter_ExpoAppleAuthentication" red box on account screen.
- **Root cause:** Sign in with Apple is a native module unavailable inside Expo Go; UI rendered it unconditionally.
- **Fix:** Availability check (`isAvailableAsync`) with graceful fallback note. (Epic 2c)
- **Prevention rule:** **Any native-module UI must detect availability and degrade gracefully — no raw error boxes ever.** Known Expo-Go-unavailable set: Apple auth, MMKV, RevenueCat, Skia. Anything using them needs a dev build (Epic 3+).

### INC-3 · Supabase "fetch failed: hostname could not be found"
- **Symptom:** Inline error on account creation.
- **Root cause:** No real `.env` credentials (placeholder/missing Supabase URL).
- **Fix:** Create Supabase project, fill `.env`, restart with `npx expo start -c`. Friendlier error copy added (Epic 2c).
- **Prevention:** `.env` changes require a `-c` (cache-cleared) restart. Related: INC-4.

### INC-4 · Supabase client crashed at import time with no .env
- **Symptom:** Cold launch broke on any machine without credentials.
- **Root cause:** Client constructed eagerly at module import.
- **Fix:** Graceful handling (Epic 2b, found incidentally).
- **Prevention rule:** **No module may crash at import time due to missing config; fail lazily with a readable error.**

### INC-5 · Banned-words lint false positive on clinical proper nouns
- **Symptom:** Lint flagged "Cognitive-Behavioral Therapy"/"Acceptance and Commitment Therapy" in authored content.
- **Root cause:** Ban on "therapy" (product claims) collided with proper names of studied techniques (approved citation style).
- **Fix:** Case-insensitive allowlist for the exact proper nouns; exception codified in LEGAL_COMPLIANCE §2.1.
- **Prevention rule:** **Lint rules on language must encode the spec's exceptions; content files are never edited to satisfy a lint.**

### INC-6 · Metro can't import .md files → legal text duplicated by hand
- **Symptom:** legal/*.md and src/lib/legal/content.ts maintained in parallel.
- **Root cause:** Metro doesn't load .md as text without config.
- **Fix:** Accepted duplication, tracked as BACKLOG #8 (sync check pending).
- **Prevention:** Any attorney edit must update both copies until #8 closes.

### INC-7 · Jest transform gap broke first test importing expo-router transitively
- **Symptom:** Test suite failure on a new test file.
- **Root cause:** `transformIgnorePatterns` didn't allow an expo-router dependency through.
- **Fix:** jest.config.js fix (Epic 6, incidental).
- **Prevention:** Config-level test failures are fixed at config level, not by restructuring innocent imports.

### INC-8 · PPCS-6 scoring crash after paywall continue ("items must be on the 1-7 scale")
- **Symptom:** Red render error crash post-paywall.
- **Root cause (two-part):** onboarding screens all stay mounted (router.push, never replace) while subscribed to the shared store; paywall's Continue reset that store *before* navigating, so the still-mounted ResultsScreen re-rendered with nulls and the (correctly) strict scorer threw. Bonus find: `hasOnboarded` was never persisted (relaunch would re-run onboarding).
- **Fix:** Navigate before reset; validity guards (`assessmentValidity.ts`) at every consumer; graceful "pick up where you left off" path; `hasOnboarded` persisted. Regression tests verified by temporarily reverting the fix.
- **Prevention rules:** **(a) Never reset a shared store before navigation completes while subscribers may be mounted. (b) Strict validators stay strict, but no user-facing render may crash on invalid state — consumers guard first, degrade gracefully. (c) Regression tests must be proven to fail against the reverted fix.** Pattern-level cleanup tracked as BACKLOG #32.

### INC-9 · Test library leaked into runtime bundle
- **Symptom:** App won't boot in Expo Go: "Unable to resolve module console from @testing-library/react-native/.../logger.js".
- **Root cause:** expo-router's `require.context` (`node_modules/expo-router/_ctx.js`) bundles every `.ts/.tsx/.js/.jsx` file under `app/` except `+api`/`+html` routes — in dev *and* production alike. INC-8's fix added `app/(onboarding)/results.test.tsx` and `paywall.test.tsx` (importing `@testing-library/react-native`) directly inside `app/(onboarding)/`, the routes directory, so Metro's require.context pulled the whole test-library dependency tree — down to its use of Node's `console` module, which Metro can't resolve — straight into the runtime bundle. Confirmed via the actual import stack from `expo export --platform ios`: `app/(onboarding)/paywall.test.tsx` → `"@testing-library/react-native"` → `app (require.context)`.
- **Fix:** Moved both test files to `__tests__/onboarding/` (outside `app/`, picked up by Jest's default `__tests__` convention, no config changes needed), importing the screens via relative path back into `app/(onboarding)/`.
- **Investigation note (corrects this entry's original hypothesis):** it was *not* a dev-only import path — `expo export --platform ios` (plain, no `--dev`) failed with the identical error before the fix and passed identically after. The real reason the "expo export --platform ios" verification didn't catch this is simpler: it was never actually run as part of the previous session's verification (only typecheck/jest/lint were) — this class of bug only shows up once you actually invoke Metro.
- **Prevention rules:** **(a) Test utilities live outside the app import graph — only `*.test.*` files and jest config may import them; enforced by `scripts/lint-bundle-purity.js` (`npm run lint:bundle-purity`), which mirrors expo-router's own require.context ignore pattern. (b) Verification must include an actual Metro bundle, not just typecheck/tests/lint — `scripts/verify-bundle.js` (`npm run verify:bundle`) runs a real `expo export --platform ios --dev --no-minify --no-bytecode` (Expo Go's actual conditions) and fails on any bundling error.**

### INC-10 · `urge_script` exercise output typed as string, actually an object (caught pre-ship)
- **Symptom:** none in production — found during Epic 8 reconciliation's "confirm wired end to end" verification of Week 3 Day 7's `urge_script` commitment-builder output, before any user reached it. Would have been "Objects are not valid as a React child" the first time a real user hit Week 3 Day 7.
- **Root cause:** `CommitmentBuilder`'s `onSubmit` always saves `{statement, signature, signed_at}` regardless of whether the `signature_required` variant is active, but both `app/(tabs)/progress.tsx` and `app/(toolkit)/urge-surf.tsx` called `getExerciseOutput<string>('urge_script')` and (in urge-surf.tsx) rendered the result directly as text.
- **Fix:** Both consumers retyped to `getExerciseOutput<CommitmentBuilderOutput>('urge_script')`; urge-surf.tsx renders `.statement` specifically; progress.tsx only used the value as a boolean presence check, so it was inert either way but corrected for type accuracy.
- **Prevention rule:** **A payload's declared output type (`XOutput` in `src/types/program.ts`) is the only source of truth for what `getExerciseOutput<T>` should be typed as at each call site — grep every consumer of an exercise's `save_to` key when that exercise's output shape changes or is reused by a new payload kind, don't assume the old call sites still match.**

## Standing prevention rules (the distilled list for prompt-writing)

1. Native-module UI: availability-check + graceful fallback, always (INC-2).
2. Nothing crashes at import time on missing config (INC-4).
3. Never reset shared state before navigation completes (INC-8a).
4. Validators strict; consumers guard; user-facing renders never throw (INC-8b).
5. Regression tests proven against the reverted fix (INC-8c).
6. Test code never enters the app import graph; verify dev bundle boots, not just export (INC-9).
7. Language lints encode spec exceptions; never edit content to satisfy a lint (INC-5).
8. `.env`/config changes → cache-cleared restart before debugging "mystery" errors (INC-3).
9. When an exercise output's shape changes or is reused by a new payload kind, grep every `getExerciseOutput<T>` call site for that `save_to` key — don't assume old consumers still match (INC-10).
