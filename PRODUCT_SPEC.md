# PRODUCT_SPEC.md — "Reclaim" (working title)

> Evidence-based recovery app for problematic pornography use.
> Positioning: **the clinically legitimate one.** Validated assessment, measurable outcomes,
> ACT/CBT-based program. No shame, no streak-worship, no bro-culture.

---

## 1. Target user & positioning

- **Primary:** Adults 18–40 self-identifying as having a problem with porn use. Skews male but the tone must be gender-neutral and secular (underserved segments: women, couples, people put off by NoFap culture).
- **Job to be done:** "Help me understand how bad this actually is, give me a credible plan, and support me in the moment an urge hits."
- **Differentiation vs. QUITTR/Brainbuddy/Fortify:** validated clinical assessment (PPCS-6) with progress measured as a falling clinical score, not just streak days; acceptance-based (lapses are data, not failure); calm adult tone.
- **Age gate:** 17+ App Store rating. Onboarding asks age; under-18 users are shown supportive resources and directed to talk to a trusted adult / professional. Do not deliver the program to minors in v1.

## 2. Platform & stack (summary — details in CLAUDE.md)

- iOS first via **React Native + Expo (managed workflow, EAS builds)**.
- Backend: **Supabase** (auth, Postgres, row-level security). Subscriptions: **RevenueCat**.
- Analytics: **PostHog**. Content delivered as versioned JSON from Supabase (see CLINICAL_SPEC §7).
- v1 excludes: content blocker, community, AI chat (roadmap §10).

## 3. Information architecture

Bottom tab bar (4 tabs), post-onboarding:

1. **Today** (home) — daily lesson/exercise, check-in, streak-free progress framing
2. **Toolkit** — urge-management tools, always 2 taps from anywhere (persistent "SOS" button in header on every screen)
3. **Journal** — check-ins, trigger logs, reflections
4. **Progress** — clinical score trend, patterns, milestones

Settings accessible from Today header (account, notifications, privacy, subscription, delete data).

## 4. Onboarding flow (first launch → paywall)

Design intent: build investment and personalization before the paywall (proven category pattern), but keep it honest — no fake "calculating…" theatrics, no fear-mongering pseudoscience.

Steps (one screen each, progress bar on top, all answers persisted locally then synced after account creation):

1. **Welcome** — one-line value prop: "A science-based program to take back control." CTA: "Start assessment."
2. **Age confirmation** (date of birth or age bracket; gate under-18 → resources screen, exit flow).
3. **Motivation** (multi-select): relationships, focus/energy, values/self-respect, sexual function, time lost, other.
4. **Context questions** (3–4 screens): years of use, frequency now, escalation (yes/no/unsure), prior quit attempts.
5. **Wellness disclaimer interstitial** — exact text from LEGAL_COMPLIANCE.md §6, single "I understand" CTA.
6. **Clinical assessment** — PPCS-6, one item per screen, 7-point scale (see CLINICAL_SPEC §2). Frame as: "These 6 questions come from a validated clinical screening instrument."
7. **Mood screen** — PHQ-2 + GAD-2 (see CLINICAL_SPEC §3). If elevated, show supportive interstitial recommending professional support alongside the app (non-blocking).
8. **Results screen** — score band (see CLINICAL_SPEC §2.3), plain-language explanation, what the program will do about it, and the "screening result, not a diagnosis" footer from LEGAL_COMPLIANCE.md §6. This screen must feel like the moment of clarity. Chart placeholder: "We'll re-measure every 2 weeks — this number going down is your real progress."
9. **Personalization summary** — "Your plan: 6 weeks, ~10 min/day, focused on [top motivations]."
10. **Notification permission** primer → OS prompt (frame: "so we can check in daily, and be there at your risky times").
11. **Account creation** — Sign in with Apple (required option), email fallback. Anonymous display name auto-generated. Required un-prechecked checkbox: "I agree to the Terms of Use and Privacy Policy" (links open in-app); store {doc_version, accepted_at} per LEGAL_COMPLIANCE.md §9.
12. **Paywall** (§6).

Edge cases:
- Kill/relaunch mid-onboarding → resume at last completed step.
- Score below clinical cutoff → honest messaging: "Your responses don't indicate problematic use. If it still bothers you, the program can help you build the relationship with porn you actually want." (Do NOT inflate scores to sell. Credibility is the moat.)
- Crisis language typed anywhere (see CLINICAL_SPEC §6): show crisis resources immediately.

## 5. Core screens (v1)

### 5.1 Today (home)
- Header: day of program ("Week 2 · Day 3"), SOS button, settings icon.
- **Daily card stack:** (a) today's lesson (3–5 min read/listen), (b) today's exercise (interactive, 2–5 min), (c) evening check-in prompt.
- Completion states persist; missed days roll forward — the program advances on completion, not calendar (no guilt for missed days; gentle nudge copy).
- Small progress module: days engaged (not "days clean"), next re-assessment date.

### 5.2 Lesson player
- Markdown-rendered content from JSON, estimated read time, optional TTS audio.
- Ends with 1-question reflection or quiz (stored to journal).
- "Mark complete" → returns to Today with subtle positive animation (no confetti-shame dynamics; calm design language).

### 5.3 Toolkit (urge management) — the most important screen in the app
Opened via tab or SOS. Must load instantly (all assets bundled offline).
- **Urge Surf** — guided 3-min audio + animation (wave visual), based on mindfulness urge-surfing protocol.
- **90-second breather** — box-breathing animation.
- **Defusion exercise** — ACT thought-labeling interactive ("I'm having the thought that…").
- **Shift environment** — checklist prompt (stand up, leave room, phone in other room, cold water).
- **10-Minute Shift** — evidence-based delay+substitute protocol: user picks one activity from their personal "shift list" (built in Week 2; e.g., walk, shower, call someone, 20 pushups), a 10-minute countdown runs with a calm progress ring, then the app re-rates the urge and displays the delta ("Urge: 8 → 4"). Rationale shown in-tool: urges crest and fall on their own, typically within 10–30 minutes, when not fed.
- **Log the urge** — 30-second structured log: intensity (1–10), trigger (chips: stress/boredom/loneliness/late night/saw trigger/other), location, what happened next. Feeds Progress patterns.
- After any tool: "How's the urge now?" (better/same/worse) → logged.
- **Lapse flow:** "It happened" button — non-judgmental. Structured 4-question lapse debrief (CLINICAL_SPEC §5.4), reframe copy ("A lapse is a data point, not a verdict"), program continues (no streak reset drama; the metric that matters is the clinical score trend).

### 5.4 Journal
- Timeline of check-ins, urge logs, lapse debriefs, lesson reflections.
- Daily evening check-in: mood (5-point), urges today (y/n + count), 1 free-text prompt rotating from question bank.
- All entries encrypted at rest (Supabase RLS + field encryption; see CLAUDE.md security).

### 5.5 Progress
- **Primary chart:** PPCS-6 score over time (re-administered every 2 weeks, push-prompted).
- Secondary: urge frequency/intensity trend (from logs), engagement calendar, pattern insights (rule-based v1: e.g., "70% of your urges logged between 10pm–1am" → suggests toolkit + wind-down routine).
- Milestones framed on behavior and score, not abstinence purity: "First re-assessment: −6 points," "10 urges surfed."
- **Commitment Goals (opt-in module):** graduated goal ladder (7-day goal ×3 completions → 14 → 30 → 90) with a self-funded **Reward Jar**: user names a personal reward, pledges a daily amount, app tracks committed savings toward it (no real money custody — it's a tracked pledge the user honors themselves). Goal completion = "unlock" celebration + prompt to claim the reward. Goals are **process-weighted** (daily lesson + check-in + clean day; a lapse with a completed debrief still counts partial credit). A lapse **delays** the unlock date and triggers the lapse debrief — it never zeroes the jar or the ladder tier. Design rules in CLINICAL_SPEC §9.

### 5.6 Settings
- Subscription management (RevenueCat), notification times (daily check-in time, risky-hours reminder), FaceID app lock (privacy is a feature — many users hide this app), discreet app icon option, export data, **delete account + all data** (one flow, required).

## 6. Monetization

- **Hard paywall after results screen** (category-proven). 
- Pricing: **$12.99/mo, $49.99/yr (default-highlighted, "save 68%"), 7-day free trial on annual only.**
- Paywall copy: personal and confident without outcome promises, referencing their own assessment result ("Your score: 27. The 6-week program teaches the skills — from published research — to work on exactly that. Re-measure every two weeks and watch your own trend."). All paywall language follows LEGAL_COMPLIANCE.md §2. No countdown timers, no dark patterns — trust is the brand.
- RevenueCat entitlement: `pro`. All program content behind it; Toolkit's Urge Surf + breather remain free forever (ethical floor: never paywall someone mid-crisis; also drives retention/word-of-mouth).
- Restore purchases, family-sharing off, promo codes enabled for influencer/clinician seeding.

## 7. Notifications (local + push)

- Daily lesson reminder (user-chosen time, default 8:00am).
- Evening check-in (default 9:30pm).
- **Risky-window reminder:** after ≥5 urge logs, if a time cluster exists, offer opt-in supportive ping 30 min before the modal hour ("Late nights are your pattern — plan the next hour on purpose?").
- Re-assessment prompt every 14 days.
- Copy rules: never mention porn/explicit words in notification text (lock-screen privacy). Use neutral phrasing: "Your daily session is ready," "Quick check-in?"

## 8. Analytics events (PostHog)

`onboarding_step_completed {step}`, `assessment_completed {score, band}`, `paywall_viewed`, `trial_started`, `subscription_started {plan}`, `lesson_completed {week, day}`, `exercise_completed {type}`, `urge_tool_used {tool, pre_intensity, post_delta}`, `urge_logged {trigger, intensity}`, `lapse_logged`, `checkin_completed`, `reassessment_completed {score, delta}`, `churn_survey {reason}`.
Funnel to watch weekly: install → assessment complete → paywall → trial → paid → W1 retention → first re-assessment.
No PII in event payloads. Journal free-text is never sent to analytics.

## 9. Non-functional requirements

- Toolkit usable offline; content pack cached on first launch.
- Cold start < 2s on iPhone 11.
- All clinical/therapeutic copy sourced from CLINICAL_SPEC or content JSON — never improvised by the coding agent. ALL user-facing copy must comply with LEGAL_COMPLIANCE.md §2 (banned/approved claim language); a CI wordlist lint enforces the banned list.
- No advertising SDKs or tracking pixels, ever (LEGAL_COMPLIANCE.md §5.1). Crisis resources reachable logged-out and unsubscribed.
- Accessibility: Dynamic Type, VoiceOver labels on all interactive elements.
- App Store: category Health & Fitness, 17+ rating, medical disclaimer in onboarding + settings ("educational program, not therapy or a medical device; not a substitute for professional care").

## 10. Roadmap (post-v1, in order)

1. AI companion (Claude API) — check-in coach grounded in program content, strict guardrails (CLINICAL_SPEC §6 escalation rules).
2. Content blocker via iOS Screen Time / DNS profile.
3. Android release (same codebase).
4. Accountability-partner lite (share progress chart with one trusted person).
4b. Real-money deposit contracts (opt-in): stake via external web payment flow, forfeiture to charity on failed **process** goals (never self-reported abstinence). Requires legal + App Store compliance review first; evidence supports ~2x effectiveness among opt-ins but expect low uptake (~10–14%).
5. Social-media-addiction vertical: same engine, swap assessment (e.g., BSMAS) + content pack.
