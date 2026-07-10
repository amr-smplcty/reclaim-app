# CLINICAL_SPEC.md — Assessment, Program & Safety

> This file is the source of truth for all clinical logic and therapeutic content.
> The coding agent implements what's here; it must NOT invent clinical claims, scores,
> or therapeutic advice beyond this spec and the content JSON.

---

## 1. Clinical framing

- The app addresses **problematic pornography use (PPU)**, understood in research as a manifestation of Compulsive Sexual Behavior Disorder (CSBD), which is recognized in the WHO's ICD-11 as an impulse-control disorder. PPU is not a formal DSM-5 diagnosis.
- **Language rules for all copy:** prefer "problematic use," "compulsive use," "taking back control." Avoid diagnostic claims ("you are addicted"), disease guarantees, and sexual-shame framing. The app never moralizes about porn itself — the problem is loss of control and conflict with the user's own values.
- Intervention basis (per published trials and reviews): **CBT, Acceptance & Commitment Therapy (ACT), Motivational Interviewing (MI), and mindfulness-based techniques** — the same four pillars used in the Hands-off RCT (Bőthe et al., 2021, J Behav Addictions) and the ACT trials (Crosby & Twohig, 2016, Behavior Therapy).
- Goal framing: **values-driven behavior change**, not purity. Evidence suggests rigid abstinence/shame cycles predict relapse; lapses are treated as learning events (abstinence-violation-effect management).

## 2. Primary assessment: PPCS-6

### 2.1 Instrument
- Problematic Pornography Consumption Scale — short version (**PPCS-6**; Bőthe, Tóth-Király, Demetrovics & Orosz, 2020, Journal of Sex Research). Validated in general and treatment-seeking populations.
- 6 items, one per theoretical component of problematic use: **salience, tolerance, mood modification, conflict, withdrawal, relapse.**
- **⚠️ Implementation note:** obtain the exact item wording from the published paper / authors (the scale is available for research and clinical use with citation — verify terms and cite in-app: "Bőthe et al., 2020"). Do not ship paraphrased items; psychometric validity depends on exact wording. Store items in `content/assessments/ppcs6.json`.

### 2.2 Administration & scoring
- Response scale: 7-point ("Never" = 1 … "All the time" = 7), one item per screen, past-6-months timeframe on first administration; subsequent re-assessments use "the past 2 weeks" framing labelled clearly as a progress snapshot (note in UI that the validated timeframe is 6 months; the biweekly version is a trend indicator).
- **Total score = sum of 6 items. Range 6–42. Cutoff: ≥ 20 indicates possible problematic use.**
- Re-administer every **14 days** (push prompt; must be completable in <90 seconds).

### 2.3 Score bands & result copy (v1)
| Band | Score | Label shown | Result framing |
|---|---|---|---|
| A | 6–13 | Low indication | "Your responses don't indicate problematic use." Offer program as optional habit-shaping. Honest — no upsell inflation. |
| B | 14–19 | Emerging risk | "Some warning signs, below the clinical screening threshold. Good moment to act early." |
| C | 20–28 | Likely problematic use | "Your score crosses the validated screening threshold (≥20)." Program strongly recommended. |
| D | 29–42 | High severity | Band C copy + explicit recommendation to also consider professional support; show resources link. Non-blocking. |

### 2.4 Supplementary intake (context, not scored clinically)
Frequency, years of use, escalation, prior quit attempts, motivations (multi-select). Used for personalization tags: `{late_night, stress_coper, boredom, relationship_motivated, escalation}`.

## 3. Comorbidity screeners (onboarding, optional but default-on)

- **PHQ-2** (depression) and **GAD-2** (anxiety) — both public domain, 2 items each, 0–6 scoring, cutoff ≥ 3 on either.
- If either ≥ 3: supportive interstitial — "Stress, anxiety and low mood often drive compulsive use. This program helps with coping skills, but consider talking to a professional too" + resources link. Never blocks the flow. Rationale: mood/anxiety disorders and ADHD are highly comorbid with PPU.

## 4. The 6-week program

Structure: 6 modules × 7 days. Each day = 1 lesson (3–5 min) + 1 exercise (2–5 min) + evening check-in. Program advances on completion, not calendar. Mapped to the four evidence pillars; modeled on the Hands-off module architecture.

### Week 1 — Understand & Commit (Psychoeducation + MI)
- Lessons: what PPU/CSBD is and isn't (no pseudo-neuroscience; honest brain-reward-learning explanation); the habit loop (cue → craving → response → reward); why willpower alone fails; what the evidence says works.
- Exercises: decisional balance (MI classic — what porn use gives you / what it costs you); "your why" values snapshot; personal cost inventory; readiness ruler.
- Outcome: signed (in-app) personal commitment statement referencing user's own words.

### Week 2 — Know Your Pattern (CBT functional analysis)
- Lessons: triggers (external: time, place, device; internal: stress, boredom, loneliness, HALT); the chain of events before use; how avoidance feeds the loop.
- Exercises: trigger mapping worksheet; build "my chain" (reconstruct last 3 episodes step-by-step); environment audit (device/bedroom/late-night setup) with concrete friction changes; implementation intentions ("If it's 11pm and I'm scrolling in bed, then I…").
- App tie-in: urge logging introduced as a daily practice this week.

### Week 3 — Ride the Urge (Mindfulness + ACT defusion)
- Lessons: what an urge is physiologically (rises, peaks ~15–30 min, passes); urge surfing; thoughts are not commands (defusion); the drop-the-rope metaphor (stop fighting, step out of the tug-of-war).
- Exercises: daily 3-min urge-surf audio practice (practice while calm so it's available under load); defusion drills ("I'm having the thought that…"); 90-second breather training; write your personal "urge script."
- App tie-in: Toolkit mastery — each tool practiced once this week.

### Week 4 — Live Your Values (ACT core)
- Lessons: values vs. goals; psychological flexibility (act on values even when urges/feelings show up); willingness vs. white-knuckling; self-compassion as a performance tool, not softness.
- Exercises: values card-sort (pick top 5 → top 2); committed-action planner (one small values-based action daily); "the person I'm becoming" letter; connect urges to values moments ("what did the urge try to replace?").

### Week 5 — Rebuild the Life (Behavioral activation + relapse prevention I)
- Lessons: replacement is stronger than restriction (dopamine honesty — real activities compete with supernormal stimuli only if scheduled); sleep, exercise, connection as relapse-prevention infrastructure; loneliness and intimacy (porn as substitute for connection).
- Exercises: weekly schedule rebuild (plant replacement activities into identified risk windows); social reconnection micro-task; sleep wind-down protocol for late-night users; boredom plan.

### Week 6 — Stay Free (Relapse prevention II + maintenance)
- Lessons: lapse vs. relapse (abstinence violation effect — the shame spiral is the real enemy); high-risk situation forecasting; how progress is measured from here (score trend, not perfection); the long game.
- Exercises: personal relapse-prevention plan (triggers → early warnings → tools → people); "emergency card" (auto-compiled from their own data: top triggers, best tools, their why); maintenance schedule choice (weekly check-ins + biweekly re-assessment); graduation reflection.

### Post-program maintenance mode
Today tab switches to: weekly themed booster (rotating micro-lessons), continued check-ins, biweekly re-assessment, Toolkit unchanged. If score rises ≥ 6 points across two re-assessments → offer targeted "refresher week" (auto-assembled from Weeks 2–3 content).

## 5. In-the-moment protocols

### 5.1 Urge protocol (Toolkit entry)
Ask intensity (1–10) → offer tool (default: Urge Surf if ≥ 6, Breather if < 6) → post-tool re-rate → log. Copy is coaching-toned, present-tense, second person, ≤ 20 words per screen.

### 5.2 Urge-surf script requirements
3-minute audio: notice location of urge in body → describe sensation neutrally → breathe into it → visualize as wave rising/cresting/passing → reaffirm one value → choose next 10-minute action. No shame language anywhere.

### 5.3 Defusion drill
User types the thought → app reframes display: "You are having the thought that: [thought]" → then "You are noticing that you're having the thought that…" → brief prompt: "Carry it with you and do the next right thing anyway."

### 5.4 Lapse debrief (4 questions, structured)
1. What was happening in the hour before? (chips + free text)
2. What did you feel right before? (emotion chips)
3. What did you skip or what failed? (tool not used / used but overwhelmed / didn't want to stop)
4. What's one thing to change for next time? (free text → appended to relapse-prevention plan)
Close copy: "A lapse is a data point, not a verdict. Your plan just got smarter." Clinical score trend remains the progress metric; no streak-reset punishment mechanics.

## 6. Safety & escalation (hard requirements)

- **Crisis detection:** if free-text input matches self-harm/suicide indicators (maintain keyword+pattern list in `safety/crisis_patterns.json`), immediately show full-screen supportive resource card: encouragement to reach out now + local crisis line lookup (988 in US; international directory link) + "talk to someone you trust." Never gate this behind subscription. Log event class only (no text) to analytics.
- **Minor detection:** any indication user is under 18 → exit program flow to resources (see PRODUCT_SPEC §4).
- **Scope disclaimers:** onboarding + settings: educational self-help program based on published research; not therapy, diagnosis, or a medical device; not a substitute for professional care.
- **Illegal content mention:** if user discloses illegal material use in free text → resource card directing to professional help (e.g., Stop It Now helpline) without storing the disclosure in analytics.
- **Future AI companion (roadmap):** must inherit all rules above; system prompt grounded exclusively in this spec + content JSON; refuses medical/diagnostic claims; escalates crisis language identically.

## 7. Content JSON schema (contract between content and app)

```json
{
  "content_version": "1.0.0",
  "modules": [{
    "week": 1, "title": "Understand & Commit",
    "days": [{
      "day": 1,
      "lesson": {"id":"w1d1_lesson","title":"","body_md":"","read_minutes":4,"audio_url":null,
                  "reflection":{"type":"single_choice|free_text","prompt":"","options":[]}},
      "exercise": {"id":"w1d1_ex","type":"decisional_balance|worksheet|audio_practice|planner|card_sort",
                   "title":"","steps":[],"payload":{}}
    }]
  }],
  "assessments": {"ppcs6":{"items":[],"scale_labels":[],"cutoff":20},
                   "phq2":{}, "gad2":{}},
  "toolkit": {"urge_surf":{"audio_url":"","duration_s":180},"breather":{},"defusion":{},"environment_shift":{}},
  "checkin_prompts": ["..."],
  "booster_lessons": ["..."]
}
```

Content authored separately (by product owner + Claude, clinician-reviewed), versioned, hot-updatable from Supabase without app release.

## 8. Review & governance

- One licensed clinician (psychologist/therapist familiar with CSBD/behavioral addiction) reviews: assessment implementation, all Week 1–6 lesson copy, safety flows — before public launch. Budget $300–500 freelance.
- Cite sources in-app ("Based on published research" → expandable reference list: Bőthe et al. 2020/2021; Crosby & Twohig 2016; ICD-11 CSBD).
- Re-review content on any claim-level change.
