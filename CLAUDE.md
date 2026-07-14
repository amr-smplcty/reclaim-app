# CLAUDE.md — Agent operating manual for this repo

You are building "Reclaim," an iOS-first recovery app. **PRODUCT_SPEC.md** defines what to build.
**CLINICAL_SPEC.md** defines all clinical logic and is authoritative — never invent, alter, or
paraphrase clinical content, scores, cutoffs, or therapeutic copy. If content is missing, insert
`TODO(content)` placeholders and list them at the end of your session summary.
**LEGAL_COMPLIANCE.md** governs all user-facing language and legal surfaces: follow its §2
banned/approved claims tables in every string you write, implement its §9 engineering rules
(versioned legal docs in `legal/`, un-prechecked ToS acceptance checkbox with stored
{doc_version, accepted_at}, banned-words CI lint on user-facing strings, crisis resources
reachable logged-out), and never add advertising SDKs, pixels, or ad-platform data sharing.

## Stack (fixed — do not substitute)

- React Native + **Expo SDK (managed workflow)**, TypeScript strict mode
- **expo-router** for navigation (tabs per PRODUCT_SPEC §3)
- State: **Zustand** (app state) + **TanStack Query** (server state)
- Backend: **Supabase** (auth incl. Sign in with Apple, Postgres with RLS on every table)
- Payments: **RevenueCat** (`react-native-purchases`), entitlement id: `pro`
- Analytics: **PostHog React Native** — events exactly as named in PRODUCT_SPEC §8
- Local storage: expo-secure-store (tokens), MMKV (cache); content pack cached for offline Toolkit
- Audio: expo-av. Charts: victory-native. Testing: Jest + React Native Testing Library; Maestro for E2E flows

## Project structure

```
app/            # expo-router routes (onboarding)/(tabs)/(modals)
src/components  src/features/{assessment,program,toolkit,journal,progress,paywall}
src/lib/{supabase,revenuecat,analytics,content}   src/stores   src/types
content/        # JSON content pack per CLINICAL_SPEC §7 (seed with placeholders)
supabase/       # migrations, RLS policies
e2e/            # maestro flows
```

## Working rules

1. **TDD loop:** for each feature, write tests first (scoring logic, band assignment, program-advance
   logic, lapse flow state), then implement until green. Run `npm run typecheck && npm test` before
   declaring any task done.
2. **One epic per session.** Epics, in order: (1) scaffold+navigation, (2) onboarding+assessment,
   (3) paywall/RevenueCat, (4) program engine + lesson player, (5) Toolkit, (6) journal+check-ins,
   (7) progress+re-assessment+commitment goals (CLINICAL_SPEC §9), (8) settings+privacy, (9) notifications, (10) polish+E2E.
3. **Scoring is sacred:** PPCS-6 sum 6–42, cutoff ≥20; PHQ-2/GAD-2 cutoff ≥3. Unit-test the band
   table from CLINICAL_SPEC §2.3 exhaustively.
4. **Privacy defaults:** RLS on all tables keyed to `auth.uid()`; journal free-text never in analytics
   payloads; no explicit words in any notification string; FaceID lock and full data-deletion flow
   are required features, not nice-to-haves.
5. **Toolkit is offline-first** and reachable in ≤2 taps from every screen (persistent SOS header button).
6. **Design language:** calm, adult, low-stimulation. Dark-mode-first palette, generous whitespace,
   no gamified confetti. System font (SF Pro), Dynamic Type support, VoiceOver labels everywhere.
7. **Never hardcode content:** all lesson/exercise/assessment text loads from `content/*.json`.
8. **Commits:** conventional commits, one feature branch per epic, PR description = what/why/test evidence.
9. End every session with: summary of done, TODO(content) list, open risks, suggested next epic.

## Environment / secrets

`.env` (never commit): SUPABASE_URL, SUPABASE_ANON_KEY, REVENUECAT_IOS_KEY, POSTHOG_KEY.
EAS build profiles: `development`, `preview` (TestFlight), `production`.

## Definition of done (per epic)

Typecheck clean · tests green · works in Expo Go on iPhone · analytics events fire ·
no clinical copy invented · accessibility labels present · matches spec section cited in PR.
