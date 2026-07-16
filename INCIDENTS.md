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

### INC-11 · `jest.mock()` factory silently captured `undefined` from an outer const
- **Symptom:** Epic 9's delete-account screen test threw `TypeError: getCurrentUserId is not a function` at runtime, even though the mock module and the const it referenced were both declared correctly and TypeScript found nothing wrong.
- **Root cause:** Babel hoists both `jest.mock()` calls and (via the CJS transform) static `import` statements to the top of the file, ahead of any `const` declaration written below them in source order. A mock factory like `jest.mock('@/lib/x', () => ({ fn: mockFn }))` that references `mockFn` **directly** captures whatever `mockFn` evaluates to *at require-time* — which, because the test file's own imports (including the module under test, which transitively requires the mocked module) run before the `const mockFn = jest.fn()` line below them executes, is `undefined`. It was introduced while "fixing" a TypeScript spread-argument error by replacing a working arrow-function wrapper with a direct reference to the mock variable — the direct reference is what broke it.
- **Fix:** Reverted to a wrapper closure (`fn: (arg) => mockFn(arg)`) instead of a direct reference. The closure defers the read of `mockFn` until the mock is actually *called* (inside the test body, by which point the whole file has finished evaluating), rather than reading it once at require-time.
- **Prevention rule:** **A `jest.mock()` factory must never reference an outer `const mock*` variable directly — always wrap it in a closure (`(arg) => mockVar(arg)`), even though direct references typecheck fine and even pass on some hoisting orderings. This is this project's first test to mock a `@/`-aliased local module rather than only third-party/native modules, so the hazard hadn't come up before.**

### INC-12 · `select_count: 0` silently made two Week 2 exercises impossible to complete
- **Symptom:** none reported (no real users yet) — found while integrating Week 5's `risk_window_planner`, which needs real `trigger_map_external` data to derive risk windows from, and that data turned out to always be empty. Manually driving `MultiSelectWrite` with `select_count: 0` (content/week2.json Day 1's `trigger_map_external` and Day 2's `trigger_map_internal`, both "select every one that applies") confirmed no option could ever be selected at all — the first two real exercises in Week 2 have been silently unfinishable since whichever epic first shipped them.
- **Root cause:** `toggle()`'s cap check was `if (prev.length >= payload.select_count) return prev;` — for `select_count: 0` this is `0 >= 0`, true on the very first press, so every press after the first was rejected as "at cap." `canSubmit` had the matching bug (`selected.length === payload.select_count`, i.e. `=== 0`, satisfied only by selecting nothing at all). No test ever drove this component through a real press interaction against a real `select_count: 0` payload — the only coverage was content-schema validation (which doesn't care about UI behavior) and Week 1/3/4's fixed-count payloads (which never hit this path).
- **Fix:** Added an `isUnlimited = payload.select_count === 0` branch: the cap check is skipped entirely when unlimited, and `canSubmit` requires `selected.length > 0` instead of an exact match. Hint text updated to "Select every one that applies" instead of "Pick exactly 0."
- **Prevention rule:** **A numeric content-JSON field used as both an upper *and* effectively a lower bound (`select_count` doubling as "exact count required") needs its zero/sentinel case tested explicitly with a real interaction, not just schema validation — a value of 0 is a common "no limit" convention in hand-authored content but reads as "limit of zero" to naive comparison code.**

### INC-13 · `summarizeExerciseOutput` silently blanked or garbled three real exercise output shapes
- **Symptom:** none reported — found while wiring Week 5 Day 7's `foundations_profile` (a `profile_builder` reuse), whose sections pull from `life_audit` (rated_inventory), `movement_plan` (committed_action_planner), and `weekly_architecture` (risk_window_planner, new this epic). The first two had existed since earlier epics but had never been fed through `summarizeExerciseOutput` by any real `profile_builder` section before Week 5.
- **Root cause:** the function's object/array shape-sniffing only had branches for the shapes prior weeks' `profile_builder` sections had actually needed (`selected`, `links`, `commitments`, `items`, `if_text`/`then_text` pairs). A `rated_inventory` output (`{ratings, notes}`) matched none of them and fell through to `''` — a section that would render completely blank. A `committed_action_planner` output (`CommittedAction[]`) matched the generic `Array.isArray` fallback and got `.join(', ')`'d, stringifying each object as `"[object Object]"`.
- **Fix:** Added explicit branches for both shapes (rated_inventory: `"area: rating — note"` joined per area; committed_action_planner: `"action (days)"` joined per action), plus a third for the new risk_window_planner output introduced in this same epic.
- **Prevention rule:** **`summarizeExerciseOutput` is a de facto registry of every exercise output shape the app can render generically — when a new payload kind's output is introduced (or an old one is reused by a `profile_builder`/`if_then_builder` reference for the first time), add its branch and a real-shaped test in the same change, don't wait for a `profile_builder` section to exercise it first (see BACKLOG #47 for the one-time audit this incident prompted).**

### INC-14 · `tick()`'s fixed delay proved insufficient under full-suite worker contention
- **Symptom:** a new interactive RNTL test (`MultiSelectWriteUnlimited.test.tsx`) passed reliably standalone but failed intermittently — sometimes on a totally different assertion each run — only when run as part of the full `npm test` suite (61+ files sharing a handful of Jest workers).
- **Root cause:** `test-utils/asyncAct.ts`'s `tick()` awaits a single `setTimeout(resolve, 0)` inside `act()`. That's normally enough to flush a `fireEvent.press`-triggered state update, but under CPU contention from other test files running in the same or sibling workers, a 0ms timeout doesn't guarantee the update actually lands before the next assertion reads it. Doubling the delay (two sequential `tick()` calls) reduced but did not eliminate the flakiness.
- **Fix:** Replaced fixed-delay `tick()` calls with `@testing-library/react-native`'s `waitFor(() => expect(...))` in the flaky test, which polls the assertion until it passes (or times out) instead of guessing a delay. Six consecutive full-suite runs afterward were clean.
- **Prevention rule:** **`tick()` remains fine for the common case (its existing widespread use across the suite is not suspect), but if a test using it is flaky specifically under `npm test` and not standalone, that is the signal to switch that test to `waitFor()` rather than adding more `tick()` calls — a fixed delay can never be proven sufficient under variable worker load, only a poll can.**

### INC-15 · Bash tool's non-interactive shell lacked Homebrew's PATH, prompting bad command habits
- **Symptom:** mid-Epic-11, every `npx`/`npm`/`node` invocation in the coding agent's Bash tool failed with "command not found," even though the same commands work fine in the user's interactive terminal.
- **Root cause:** Homebrew's PATH setup (`/opt/homebrew/bin`) is added via `.zprofile` (through `brew shellenv`), which only non-interactive login shells source. The Bash tool's shell doesn't source it, so `node`/`npm`/`npx` were never on `PATH` there — a pure environment gap, nothing to do with the repo. Working around it by prefixing every command with `export PATH=...` or by calling absolute binary paths (`/opt/homebrew/bin/node ...`) got commands running again, but both habits defeat the harness's static permission analysis (variable-bearing or unrecognized-path commands can't be pre-approved), causing a manual-approval prompt on every single command.
- **Fix:** Added `.claude/settings.json` with `{"env": {"PATH": "/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"}}` — the harness applies this to the Bash tool's shell environment, so plain `npm`/`npx`/`node` resolve correctly with no per-command workaround needed.
- **Prevention rule:** **If a standard binary is "not found" in the Bash tool, fix the environment (`.claude/settings.json`'s `env.PATH`, or ask the user to) — never paper over it with an `export PATH=` prefix or an absolute-path substitute on every command. Both defeat permission pre-approval and are themselves the problem, not a workaround for it.**

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
10. `jest.mock()` factories reference outer `mock*` variables only through a closure, never directly (INC-11).
11. A content-JSON numeric field that doubles as "no limit" via 0 needs its zero case driven by a real interaction test, not just schema validation (INC-12).
12. Add `summarizeExerciseOutput`'s branch (+ a real-shaped test) the moment a new output shape exists — don't wait for a `profile_builder` section to expose the gap (INC-13).
13. A `tick()`-based test that's flaky only under full-suite `npm test`, not standalone, gets switched to `waitFor()` — never just more `tick()` calls (INC-14).
14. A "command not found" binary gets fixed via `.claude/settings.json`'s `env.PATH`, never via an `export PATH=` prefix or absolute-path substitution on every command (INC-15).
