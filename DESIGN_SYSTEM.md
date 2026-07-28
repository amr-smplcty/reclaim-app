# Reclaim — Design System

Handoff spec for the Reclaim app (educational self-help for compulsive-behaviour change). Target platform: iOS-first React Native.

Source files (open in the browser, they are the visual truth):

| File | Contents |
|---|---|
| `Reclaim Foundations.dc.html` | Palette exploration + committed token ramps, type scale, spacing, radius, elevation, motion, icon/illustration rules |
| `Reclaim Components.dc.html` | Every component with all states, light + dark |
| `Reclaim Screens.dc.html` | 33 annotated screens in 5 batches |

If this doc and the files disagree, **the files win** — they carry measured contrast values.

---

## 1. Non-negotiable guardrails

These are product decisions encoded in the tokens. Do not "improve" past them.

1. **No streak mechanics.** No day counters, chains, flames, or reset-to-zero. Progress is a form that *accretes* (the growth sprig) and is counted in *activities completed*, never consecutive days.
2. **No error-red for user behaviour.** A lapse renders in `caution` or neutral and is framed as data. `destructive` is reserved for irreversible **data** actions (delete account, delete journal) — never for a person's behaviour.
3. **Forward-only progress visual.** The sprig gains elements and never loses them. A lapse adds a quiet marker; it subtracts nothing.
4. **No clinical language or imagery.** No medical crosses, stethoscopes, lab glyphs, charts-as-diagnosis. Educational, dignified, adult.
5. **Dark mode is first-class**, designed for the 2am state — not a filter over light mode. Several screens are specified dark-first.
6. **Crisis path is one tap** from anywhere. Oversized targets, minimal text, no decisions to make.
7. **Ambient privacy.** Nothing on screen embarrasses if seen over a shoulder. No explicit words, no provocative art, no identifying notification copy.
8. **Assessment produces bands, not scores.** No number a user can rank themselves by.

---

## 2. Color — "Driftwood"

Warm sand paper for a private, journal-like body; a low-chroma dusk blue for growth and actions (sidesteps green's clean/dirty valence and amber's 2am glow). Caution is a separate warm ochre so a lapse marker never blends into normal UI.

Contrast ratios below are measured against that mode's `surface`; text tokens also clear AA on `surfaceRaised`.

### Light

| Token | Hex | Use | Contrast |
|---|---|---|---|
| `surface` | `#F7F4EF` | app background | — |
| `surfaceRaised` | `#FFFDFA` | cards, sheets | — |
| `surfaceSunken` | `#F1EEE8` | wells, disabled fills | — |
| `textPrimary` | `#282420` | primary text | 14.0:1 |
| `textSecondary` | `#65605A` | secondary text | 5.7:1 |
| `textPlaceholder` | `#6F6A60` | placeholder, micro-labels | 4.9:1 |
| `textDisabled` | `#7C766B` | disabled labels | 4.1:1 |
| `accent` | `#3F5480` | growth, actions | 6.9:1 |
| `accentMuted` | `#DEE2EC` | fills, tracks | — |
| `accentSubtle` | `#EDF0F6` | selected-card tint | — |
| `success` | `#4F6E5A` | completion | 5.2:1 |
| `caution` | `#9A6A34` | icons + large labels only | 4.3:1 |
| `cautionSubtle` | `#F5EAD9` | advisory panel tint | — |
| `cautionText` | `#7A5326` | text on `cautionSubtle` | 6.2:1 |
| `destructive` | `#A6462F` | irreversible data only | 5.4:1 |
| `border` | `#E7E0D6` | hairlines | — |
| `borderStrong` | `#CFC8BC` | control outlines | — |
| `overlay` | `#14120C` @ 45% | scrim | — |
| `onAccent` | `#FFFFFF` | text/icon on `accent` | — |

### Dark

| Token | Hex | Use | Contrast |
|---|---|---|---|
| `surface` | `#16150F` | app background | — |
| `surfaceRaised` | `#211F18` | cards, sheets | — |
| `surfaceSunken` | `#1B1A13` | wells, disabled fills | — |
| `textPrimary` | `#F0ECE3` | primary text | 15.5:1 |
| `textSecondary` | `#ABA598` | secondary text | 7.5:1 |
| `textPlaceholder` | `#948F84` | placeholder, micro-labels | 5.7:1 |
| `textDisabled` | `#5E6058` | disabled labels | 2.9:1 |
| `accent` | `#93A6CE` | growth, actions | 7.5:1 |
| `accentMuted` | `#2A3040` | fills, tracks | — |
| `accentSubtle` | `#222839` | selected-card tint | — |
| `success` | `#84A78E` | completion | 6.9:1 |
| `caution` | `#C79A5E` | icons + large labels only | 7.2:1 |
| `cautionSubtle` | `#2E2517` | advisory panel tint | — |
| `cautionText` | `#EBC894` | text on `cautionSubtle` | 11.5:1 |
| `destructive` | `#D07B62` | irreversible data only | 5.8:1 |
| `border` | `#2C2A22` | hairlines | — |
| `borderStrong` | `#4A4840` | control outlines | — |
| `overlay` | `#000000` @ 60% | scrim | — |
| `onAccent` | `#16150F` | text/icon on `accent` | — |

### Color rules

- `caution` is **never body text** and **never text on `cautionSubtle`** (3.9:1, fails) — use `cautionText` there.
- `accentSubtle` / `cautionSubtle` are **background-only**, never text.
- `textDisabled` is exempt under WCAG 1.4.3 (inactive controls) but kept as legible as possible; do not use it for active content.
- Decorative-only greys (e.g. `#5B564C` chevron strokes) must never carry text.
- Never state meaning by color alone — pair with label, icon fill, or position (tab bar, completion states).

---

## 3. Typography

**UI:** SF Pro (iOS system) — the app should never announce a font.
**Long-form lesson body + ceremony moments:** New York (iOS serif) for the journal feel. In the HTML files, Newsreader stands in for New York.
Dynamic Type to 200%; every step scales. No fixed-height text containers.

| Step | Size / Line / Tracking | Weight | Family | Use |
|---|---|---|---|---|
| Display | 34 / 40 / −0.4 | Bold | serif | ceremony, week complete |
| Title 1 | 28 / 34 / −0.3 | Bold | SF | screen titles |
| Title 2 | 22 / 28 / −0.2 | Semibold | SF | section headers |
| Title 3 | 20 / 25 / −0.2 | Semibold | SF | card titles |
| Body | 17 / 26 / 0 | Regular | **serif** | lesson reading |
| Callout | 16 / 22 / 0 | Regular | SF | secondary body |
| Subhead | 15 / 20 / 0 | Medium | SF | labels, list rows |
| Footnote | 13 / 18 / +0.1 | Regular | SF | meta, timestamps |
| Caption | 12 / 16 / +0.2 | Medium | SF | micro-labels |

Serif is for *reading*, sans for *operating*. Never mix within one paragraph.

---

## 4. Spacing, radius, elevation

**Spacing — 4pt base:** `space-1` 2 · `space-xs` 4 · `space-sm` 8 · `space-md` 12 · `space` 16 · `space-lg` 20 · `space-xl` 24 · `space-2xl` 32 · `space-3xl` 48.
Screen gutter is `space` (16). Card interior padding `space-lg` (20). Section separation `space-2xl` (32).

**Radius:** `r-xs` 6 · `r-sm` 10 · `r-md` 14 · `r-lg` 20 · `r-xl` 28 · `r-full` 999.
Buttons `r-md`, cards `r-lg`, sheets `r-xl` (top corners only), pills/avatars `r-full`.

**Elevation** — soft, low-contrast only. In dark mode shadows are near-invisible: depth comes from `surfaceRaised` lightness + `border`.

| Token | Use | Shadow |
|---|---|---|
| `e0` | flat + border | none |
| `e1` | card | `0 1px 2px rgba(0,0,0,.04), 0 2px 8px rgba(0,0,0,.04)` |
| `e2` | sheet / raised | `0 4px 12px rgba(0,0,0,.06), 0 12px 28px rgba(0,0,0,.08)` |
| `e3` | modal | `0 8px 20px rgba(0,0,0,.10), 0 24px 48px rgba(0,0,0,.14)` |

---

## 5. Motion

| Token | Duration | Easing | Note |
|---|---|---|---|
| Screen transition | 350ms | `cubic-bezier(0.2, 0, 0, 1)` | iOS push / cross-fade |
| Card enter | 300ms | `cubic-bezier(0.16, 1, 0.3, 1)` | 8px rise + fade; lists stagger 40ms |
| Breathing | 4000ms in / 6000ms out | ease-in-out, alternate loop | scale 1.0↔1.35, opacity 0.6↔1.0 — the only slow motion |
| Celebration | 700ms | `cubic-bezier(0.34, 1.4, 0.64, 1)` | one gentle settle; no confetti, no repeat, no sound by default |

All motion honors `prefers-reduced-motion` → crossfade fallback. Nothing flashes, bounces hard, or demands attention. Breathing and celebration are the only expressive curves.

---

## 6. Iconography & illustration

**Icons:** line, **1.75pt stroke**, rounded caps and joins, 24pt grid. SF Symbols as the base set where a fitting glyph exists; custom SVG for growth, urge-surf, defusion. Optional two-tone: `accent` line over low-opacity `accentMuted` fill. Tab-bar icons are stroke-only at rest, filled when active, **always with a text label**.

Never: medical crosses, stethoscopes, lab/chart glyphs, fire/flame, chain links, calendar-with-X.

**Illustration:** single-weight line + soft flat fills, `react-native-svg`. No photos, no faces, no gradients on text. Organic/botanical metaphor of a form that accretes. Monochromatic — `accent` for new growth, `accentMuted` for established growth.

**The growth sprig** is the one progress visual: driven by count of completed activities, forward-only, adds a quiet neutral marker on a lapse.

---

## 7. Components

Full state matrices are in `Reclaim Components.dc.html`. Each group below lists the states that must ship.

**Buttons** — Primary (`accent` fill / `onAccent` label), Secondary (`borderStrong` outline), Tertiary (text-only), Destructive (`destructive`, data actions only). States: rest, pressed (−6% lightness, no scale), disabled (`surfaceSunken` fill + `textDisabled`), loading (inline spinner, label retained). Min height 50pt, min target 44pt.

**Inputs** — single-line and multi-line. States: rest, focused (`accent` 2pt ring), filled, error (`destructive` hairline + footnote message), disabled. Placeholders use `textPlaceholder` in italic so they read as absent-not-entered.

**Selection controls** — radio list rows, checkbox, segmented control, toggle, slider, and the assessment answer card (selected = `accentSubtle` fill + `accent` border + check, never color alone).

**Progress (non-streak)** — lesson progress bar (`accentMuted` track / `accent` fill), week-dot row (completed = filled, current = ring, upcoming = hairline), activity count, and the growth sprig. No streak component exists; do not add one.

**Card & list row** — card (`surfaceRaised`, `e1`, `r-lg`), list row with optional leading icon, trailing chevron, and subtitle. Rows are 56pt minimum.

**Overlays** — bottom sheet (`r-xl` top, drag handle, `e2`), modal (`e3`, centered, max 2 actions), toast (bottom, 3s, single line, no action needed to dismiss).

**Navigation** — nav header (large title collapsing to inline on scroll, back = chevron + no text) and 4-tab bar: Today · Toolkit · Journal · You. Toolkit is always reachable; the crisis entry is pinned in the Toolkit tab **and** a persistent header affordance.

**Empty · loading · error** — empty states state what will appear and offer one action; skeletons use `surfaceSunken` blocks with a 1200ms shimmer; errors are plain, blame the app not the user, and always offer retry.

---

## 8. Screens

33 screens, 5 batches, in `Reclaim Screens.dc.html`. Each is numbered and annotated in-file with the reasoning behind its layout.

**Batch 1 · Onboarding (01–11)** Splash · Welcome · Privacy · Disclaimer · Assessment intro · Assessment question · Results · Commitment · Notifications · Paywall · Ceremony.
Rules: privacy and the not-medical-treatment disclaimer come *before* any question. Results are **bands** with plain-language meaning, no score. Commitment is written by the user, in their words, and is quoted back later. Paywall states the price plainly with no countdown or fake scarcity.

**Batch 2 · Daily core (12–15)** Home (light + dark) · Lesson player (light + dark) · Lesson complete · Week complete.
Rules: Home leads with today's single next action — one primary thing, never a dashboard. The **late-night Home variant** (after ~11pm) demotes the lesson and promotes the toolkit. Lesson body is serif at Body; player chrome disappears while reading. Week complete is a ceremony moment (Display serif, celebration curve, one settle).

**Batch 3 · Toolkit (16–21)** Toolkit hub · Urge surf · Breathing · Unhook (defusion) · 10-minute shift · Lapse debrief. Designed dark-first — these are the 2am screens.
Rules: every tool is usable in under 10 seconds with no reading. Breathing uses the breathing curve and nothing else moves. **Lapse debrief is deliberately not `caution`-colored and permissive** — neutral surfaces, curious questions, no scolding, no reset, and it ends by returning the user to the program unchanged.

**Batch 4 · Support & reflection (22–27)** Journal list · Journal composer (dark) · Values reminder (dark) · Emergency card (dark) · Weekly reflection · Patterns.
Rules: the journal is **gap-free** — no calendar with missing days, no implied obligation; it's a list of what exists. Values is the only screen that quotes the user's own commitment back at them. Emergency card is a single tap from the header: oversized targets, no scroll, no choices beyond "call" and "breathe". Patterns shows time-of-day and trigger tendencies as observation, never as a grade.

**Batch 5 · Ongoing & system (28–33)** Course complete · Maintenance home · Settings · Notifications · Empty + offline · Delete confirm (dark).
Rules: the journey map **disappears post-course** — maintenance home is a different, quieter screen, not the same home with a full bar. Notifications settings carry a **live lock-screen preview** so the user can verify nothing identifying appears. Delete confirm is the only place `destructive` appears at full weight; it names exactly what is erased and requires a typed confirmation.

---

## 9. Annotation conventions (in the HTML files)

- Each screen sits in a wrapper with a **mono numeric badge** (`01`, `12`, `13b`) and a short title; refer to screens by that badge in review.
- Batch headers are `<!-- ===== BATCH n · NAME ===== -->`; individual screens are `<!-- nn NAME MODE -->`.
- Light/dark pairs share the number with a mode suffix in the comment (`12 HOME LIGHT` / `12 HOME DARK`).
- Rationale notes sit directly under the frame in `textSecondary` at Footnote size — they are spec, not decoration; port the reasoning, not the text.
- Foundations uses option ids (`1a`/`1b`/`1c` explorations, `2a` committed) — only `2a` "Driftwood" is live; the others are kept for provenance.

---

## 10. Accessibility checklist for implementation

- All text pairs ≥4.5:1; large text and icons ≥3:1. Ratios above are measured, not estimated — re-verify if any hex changes.
- Dynamic Type to 200% without truncation or overlap; no fixed-height text rows.
- Touch targets ≥44pt in all states; toolkit and crisis targets are deliberately larger.
- Never color alone: completion, selection, and lapse markers all carry a shape, fill, or label change.
- `prefers-reduced-motion` disables breathing scale and celebration; both fall back to crossfade.
- VoiceOver: growth sprig is announced as "N activities completed", never as a streak or a score.
- Notification copy contains no identifying words — verify against the live lock-screen preview on screen 31.
