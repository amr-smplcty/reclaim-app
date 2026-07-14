# BACKLOG.md — Deferred items (fine as-is now, must be addressed later)

> Running list maintained across epics. Items get a status, a source, and a "due before" gate.
> Gates: **E3** = during Epic 3 · **TF** = before TestFlight · **L** = before public launch · **P** = post-launch polish.

## 🔴 Launch-critical (hard blockers at their gate)

| # | Item | Source | Gate |
|---|------|--------|------|
| 1 | Replace hardcoded `HAS_PRO_ENTITLEMENT = true` with real RevenueCat entitlement check — must not survive into any build that reaches other humans | Epic 5 report | E3 / TF |
| 2 | Attorney review of legal/tou.md + legal/privacy.md (both marked DRAFT); tailor arbitration + state notices; confirm DBA/trade-name need for "Reclaim"/"Smplcty Analytics" under Simplifico LLC | Epic 2b / LEGAL_COMPLIANCE §4–8 | L |
| 3 | Clinician review batch (CLINICAL_SPEC §8): Weeks 1–6 lesson/exercise copy, Urge Surf script, lapse-debrief emotion chips, urge trigger chips, onboarding intake options, crisis_patterns.json expansion | Epics 2/4/5 reports | L |
| 4 | Record (or TTS-generate) the Urge Surf guided audio from the authored narration script (content/week2.json `toolkit_scripts.urge_surf.narration_script`); wire into toolkit.urge_surf.audio_url | Epic 5 TODO(content) / Week 2 pack | L |
| 5 | Bundle ID + app icon are placeholders — confirm com.smplctyanalytics.reclaim (or change) and add real icon/splash before any EAS build | Epic 1 report | TF |
| 6 | Apple Developer organization enrollment as Simplifico LLC (pending D-U-N-S) → unblocks Epic 3, TestFlight | Business track | E3 |

## 🟡 Engineering debt (correct behavior exists; wiring or robustness pending)

| # | Item | Source | Gate |
|---|------|--------|------|
| 7 | Email/OTP sign-in path: legal acceptance stored locally but not remote-synced until session exists — close when real session/deep-link handling is built | Epic 2b report | TF |
| 8 | legal/*.md and src/lib/legal/content.ts are hand-duplicated — automate sync or add a CI check that they match (critical once attorney edits land) | Epic 2b report | L |
| 9 | Supabase project credentials in .env (if not yet created) + first real auth/sync test end-to-end | Setup step | TF |
| 10 | Content currently bundled at build time; move to Supabase-served content packs + offline cache (MMKV) once hot-updating matters | Epic 4 report | P |
| 12 | Decisional-balance "hardest line" (emergency_card_line) still saved as a plain string, not restructured — Journal's data model (checkins/urge logs/lapse debriefs/reflections) never touches exercise outputs like this one, so Epic 6 gave no natural occasion to revisit it. Still only worth structuring if a future feature (e.g. Emergency Card, #27) needs provenance | Epic 4 report / Epic 6 review | Epic 7 or Emergency Card epic |
| 13 | 10-Minute Shift: add dev-build-only fast-timer toggle (15s) for manual testing of full flow incl. escalation; impossible to trigger in production | Epic 5 review | TF |
| 15 | Native modules (MMKV, RevenueCat, Skia/victory-native) installed but unwired — require EAS dev client from Epic 3 onward | Epic 1 report | E3 |
| 16 | End-of-content messaging: Today shows "more content coming soon" past latest week — update as Weeks 3–6 land; final state = maintenance mode per CLINICAL_SPEC §4 | Epic 4 report | L |
| 26 | Checklist_commit next-day follow-up only checks the position immediately before current — if a user completes multiple days without opening Today in between, an eligible follow-up (e.g. W2D4's) can be skipped entirely. Should scan all unanswered eligible follow-ups, not just the last one | Epic 5b report | Epic 7 |
| 27 | Emergency Card UI doesn't exist yet — pattern_profile (and future emergency_card_line-style data) is persisted and surface_in-tagged, ready to feed it, but there's no dedicated screen. CLINICAL_SPEC introduces the Emergency Card properly in Week 6 ("auto-compiled from their own data") | Epic 5b report | Week 6 content epic |
| 28 | Journal encryption-at-rest (AES via crypto-js, key in expo-secure-store) covers only the new check-in store (useJournalStore). Urge logs and lapse debriefs (toolkit store) and lesson reflections (program store) — all of which the Journal timeline displays — remain on plain unencrypted AsyncStorage. Consider extending the same encrypted-storage adapter to those stores in a hardening pass | Epic 6 report | TF |
| 29 | Legacy check-in migration (useJournalStore.migrateLegacyCheckins) runs on Journal tab mount, not on app launch — if a user never opens Journal, any pre-Epic-6 check-in data sits unmigrated (harmless, just not yet visible in the timeline). Fine given no real users exist yet; revisit if that's no longer true | Epic 6 report | TF |

## 🟢 UX polish (works, but rough)

| # | Item | Source | Gate |
|---|------|--------|------|
| 17 | Age input is plain DD/MM/YYYY text fields — replace with native date picker when a dev client exists | Epic 2 report | TF/P |
| 18 | Manually run the real 10-minute Shift timer to completion once on device (founder QA) | Epic 5 review | TF |
| 19 | Full manual QA pass of Week 1 content threading on device (D2/D3 → D4; D1/D4/D6 → D7 commitment; crisis guard; relaunch-resume) | Epic 4 review | ongoing |

## 🔵 Business track (not code)

| # | Item | Source | Gate |
|---|------|--------|------|
| 20 | RevenueCat account creation (company email) + project setup, so Epic 3 starts instantly when Apple clears | Wait-time plan | E3 |
| 21 | Name check: App Store search for "Reclaim" in health/wellness, domain availability, USPTO trademark search — before brand hardens | Wait-time plan | L |
| 22 | Clinician recruitment (licensed, behavioral-addiction familiar, $300–500 review) — lead time now, review after Week 6 content exists | Wait-time plan | L |
| 23 | Attorney shortlist (2–3 app/health-tech lawyers) — engage when legal drafts final | Wait-time plan | L |
| 24 | Substantiation folder: PDFs of every cited study + claims-to-source mapping sheet | LEGAL_COMPLIANCE §8 | L |
| 25 | Tech E&O / general liability insurance quotes | LEGAL_COMPLIANCE §8 | post-revenue |

## ✅ Resolved (kept for the record)

| Item | Resolved by |
|------|-------------|
| Supabase client crashed at import with no .env | Fixed in Epic 2b run |
| Banned-words lint false positive on CBT/ACT proper nouns | Lint allowlist + LEGAL_COMPLIANCE §2.1 exception codified |
| PPCS-6 component tags mismatched item order | Remapped in PPCS-6 fill task |
| #14 10-Minute Shift shift-list reconciliation with Week 2 Day 6 | Epic 5b: both now read/write the program store's `exerciseOutputs.shift_list`; the toolkit store's separate copy was removed |
| #11 Evening check-in was lightweight (rotating prompt + free text only) | Epic 6: full mood (5-pt) + urges y/n+count + rotating prompt model in useJournalStore, one system only; old `useProgramStore.checkinResponses` migrated via a one-time, idempotent `migrateLegacyCheckins()` (honest neutral defaults for fields the old model never captured) |
