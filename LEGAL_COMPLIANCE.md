# LEGAL_COMPLIANCE.md — Positioning, Claims, Terms & Privacy

> Fourth pillar of the spec set. Governs ALL user-facing language (app, App Store listing,
> website, ads, social content) and the legal documents. The coding agent must treat this as
> authoritative for any copy it touches. **This document was prepared without a lawyer and must
> be reviewed by a licensed attorney before public launch** (budget: $500–1,500 for review of
> ToS + Privacy Policy + claims audit; find via app-focused firms or platforms like Priori/Axiom).

---

## 1. Regulatory positioning (the strategy in one paragraph)

Reclaim is positioned as a **general wellness / educational self-help product**: it teaches
skills and techniques studied in published research, provides validated *screening* (not
diagnosis), and supports habit change and stress management. It is NOT marketed or designed as a
medical device, therapy, treatment, or a substitute for professional care. Rationale: under the
FDA's General Wellness guidance and Mobile Medical Applications policy, low-risk products that
promote a general state of health (e.g., stress management) and avoid disease-treatment claims
fall outside active FDA regulation; the classification hinges on **intended use and claims —
including implied claims**. One sloppy sentence ("treats porn addiction") anywhere in our
marketing can change our regulatory status. Additionally, FTC Section 5 requires that health
benefit claims be truthful, non-misleading, and substantiated by competent and reliable
scientific evidence — we satisfy this by attributing evidence to the *techniques* (which have
published trials) rather than to the *app* (which does not, yet).

## 2. Language rules: the claims table

### 2.1 BANNED words/claims (never appear anywhere — app, store listing, site, ads, notifications)
| Banned | Why |
|---|---|
| "treats / cures / heals porn addiction" | Disease-treatment claim → medical device territory + unsubstantiated |
| "diagnose / diagnosis" (about our assessment) | We screen, we never diagnose |
| "therapy," "therapeutic," "clinical program," "digital therapeutic" | Implies regulated treatment. **Exception:** the proper names of studied techniques — "Cognitive-Behavioral Therapy (CBT)," "Acceptance and Commitment Therapy (ACT)" — are permitted in §2.3 citation style when describing the research a lesson draws on; never when describing what Reclaim itself is or provides. The CI lint allowlists these exact proper nouns (case-insensitive). |
| "clinically proven / guaranteed results / will reduce your score" | Unsubstantiated efficacy claim about OUR product |
| "overcome addiction in X days/weeks" | Outcome promise + disease claim |
| "rewire / heal / repair your brain" | Pseudo-neuroscience + implied treatment claim |
| "HIPAA compliant" | We are not a HIPAA-covered entity; claiming it is itself deceptive (see BetterHelp) |
| "recommended by doctors/therapists" (without documented substantiation) | Deceptive endorsement |

### 2.2 APPROVED framings (assertive, confident, defensible)
| Instead of… | Say… |
|---|---|
| "Treat your porn addiction" | "Take back control of your porn use" |
| "Clinically proven program" | "A structured program built on techniques from peer-reviewed research — CBT, ACT, motivational interviewing, and mindfulness" |
| "Diagnose your addiction level" | "See where you stand with a screening tool from published research (PPCS-6, Bőthe et al., 2020)" |
| "This app will lower your score" | "Track your score over time — a validated way to see your own progress" |
| "Therapy in your pocket" | "Science-based self-help, ten minutes a day" |
| "Cure compulsive behavior" | "Build the skills that published studies associate with lasting behavior change" |

### 2.3 Using statistics and citations (required style)
1. **Attribute results to the studied technique, never to Reclaim.** ✅ "In a randomized
   controlled trial, an ACT-based intervention significantly reduced problematic pornography
   viewing (Crosby & Twohig, 2016, *Behavior Therapy*)." ❌ "Our ACT method reduces use by X%."
2. **Cite primary academic sources only** (journal articles, ICD-11, instrument validation
   papers). Standing reference list lives in-app under "The research" and on the website:
   Bőthe et al. (2020) *J Sex Research* (PPCS-6, cutoff ≥20, accuracy 89%); Bőthe et al. (2021)
   *J Behavioral Addictions* (Hands-off RCT); Crosby & Twohig (2016) *Behavior Therapy* (ACT RCT);
   Kroenke et al. (2003) (PHQ-2); Kroenke et al. (2007) (GAD-2); WHO ICD-11 (CSBD, 6C72);
   Bowen & Marlatt urge-surfing literature; Halpern et al. (2015) *NEJM* (deposit contracts —
   v2 only).
3. **Include variability language** near any outcome statistic: "individual results vary" /
   "research findings describe group averages, not guarantees."
4. **Numbers must match the source exactly** (e.g., PPCS-6 cutoff = 20 of 42; screening
   accuracy 89% per the validation paper). No rounding up, no "studies show" without a named study.
5. App Store listing may say: "science-based," "grounded in published research,"
   "validated screening instrument" — all substantiated by the citation list.

## 3. Required legal documents & where they surface

1. **Terms of Use** (§4 draft) — accepted via checkbox at account creation (onboarding step 10);
   link in Settings. Record acceptance timestamp + version in DB.
2. **Privacy Policy** (§5 requirements) — same acceptance point; also linked on App Store listing
   (required) and website footer.
3. **Medical / wellness disclaimer** (§6) — shown as a dedicated onboarding interstitial before
   the assessment, summarized on the results screen, full text in Settings.
4. **Subscription terms** — price, renewal, cancellation path (Apple), shown on paywall per
   App Store Review Guideline 3.1.2.
5. **Crisis resources page** — reachable without subscription, without login (Settings + safety flows).

## 4. Terms of Use — working draft (attorney review required)

Key clauses, drafted for adaptation:

1. **Acceptance & eligibility.** Agreement formed by account creation. Must be 18+. Service
   void where prohibited.
2. **Nature of service (the load-bearing clause).** "Reclaim is an educational, self-help
   wellness product. It provides information, self-assessment questionnaires, and skill-building
   exercises based on published research. Reclaim is NOT a healthcare provider; does NOT provide
   medical care, mental health treatment, therapy, counseling, or diagnosis; and is NOT a
   substitute for professional advice. No clinician–patient or therapist–client relationship is
   created by use of the app. Screening scores are informational only and do not constitute a
   diagnosis of any condition. Always seek the advice of a qualified professional with any
   questions regarding a medical or mental-health condition. Never disregard professional advice
   or delay seeking it because of something you read in Reclaim."
3. **Emergency disclaimer.** "Reclaim is not an emergency service. If you are in crisis or
   considering harming yourself or others, call or text 988 (US), your local emergency number,
   or go to the nearest emergency room."
4. **Assumption of risk & individual results.** User acknowledges results vary; research cited
   describes studied techniques and group-level findings, not guaranteed individual outcomes.
5. **Subscriptions.** Billed via Apple; auto-renews until cancelled in device settings; refunds
   handled by Apple per its policies; free-trial terms disclosed at purchase.
6. **User content & license.** User owns journal entries; grants us a limited license to process
   them solely to operate the service.
7. **Acceptable use.** No reverse engineering, scraping, uploading unlawful content, or use by minors.
8. **Disclaimer of warranties.** Service provided "AS IS" and "AS AVAILABLE," to the maximum
   extent permitted by law.
9. **Limitation of liability.** To the maximum extent permitted by law, aggregate liability
   capped at the greater of (a) amounts paid in the 12 months preceding the claim or (b) $100;
   no indirect/consequential damages. (Some jurisdictions limit these limits — attorney to tailor.)
10. **Indemnification** for user's breach or misuse.
11. **Dispute resolution.** Binding individual arbitration + class-action waiver, with small-claims
    and opt-out carve-outs. (Enforceability varies by jurisdiction — attorney must tailor; EU/UK
    users need different treatment.)
12. **Governing law** [entity's state]; **changes to terms** with notice; **termination** rights;
    **contact** email.
13. **Entity.** Contracting party is **Simplifico LLC** (operating as Smplcty Analytics), never the founder personally. All legal documents, the App Store seller of record, and payment accounts should reference Simplifico LLC.

## 5. Privacy Policy — binding commitments (build the product to match, not vice versa)

The BetterHelp order teaches: your practices must match your promises, and in a health-adjacent
service *everything* is health data — even an email address identifies its owner as someone
seeking help with porn use. Therefore, hard product commitments (also enforced in code review):

1. **We never share user data with advertising platforms.** No Meta/TikTok/Google ads SDKs or
   pixels in the app or on the logged-in web experience. Marketing attribution uses
   privacy-preserving methods only (SKAdNetwork). No custom audiences built from user emails. Ever.
2. **We never sell personal data.** State it plainly.
3. **Analytics are first-party-controlled** (PostHog), pseudonymous, with no journal text, no
   assessment free-text, and no notification content in event payloads (already in PRODUCT_SPEC §8).
4. **Data collected & purposes, enumerated:** account (email, auth id), assessment scores,
   program progress, journal entries (encrypted at rest; never used for marketing or model
   training), device/diagnostic data, subscription status (via RevenueCat), analytics events.
5. **Processors disclosed:** Supabase (hosting/auth), RevenueCat (subscriptions), Apple (payments),
   PostHog (analytics) — with links to their terms.
6. **Retention & deletion:** account deletion erases personal data within 30 days (backups within
   90); in-app one-tap deletion flow (already required by PRODUCT_SPEC §5.6 and Apple).
7. **User rights:** access/export/correct/delete honored globally (GDPR/UK GDPR/CCPA-grade rights
   for everyone — simpler and safer than geo-fencing rights). Consent-based processing for EU users.
8. **No HIPAA claims anywhere** — we are not a covered entity; invoking HIPAA is itself a
   deception risk. Say instead: "We treat all user data as sensitive health-adjacent data."
9. **State health-privacy laws** (e.g., Washington My Health My Data and similar consumer-health
   statutes) grant private rights of action around "consumer health data" — our no-sharing,
   consent-first, delete-on-request architecture is designed to satisfy the strictest of these.
   Attorney to confirm state-specific notices at review.
10. **Breach response:** FTC Health Breach Notification Rule applies to non-HIPAA health apps —
    document an incident-response plan (notify users + FTC within statutory windows).

## 6. In-app disclaimer texts (final copy, pending attorney sign-off)

**Onboarding interstitial (before assessment):**
"A quick, important note. Reclaim is a self-guided educational program built on published
research. It is not therapy, medical care, or a diagnosis, and it's not a substitute for a
licensed professional. The questionnaire you're about to take is a research-validated *screening*
tool — it shows where you stand, not a diagnosis. If you're ever in crisis, call or text 988
(US) or your local emergency number. [I understand →]"

**Results screen footer:**
"Screening result, not a diagnosis. Based on the PPCS-6 (Bőthe et al., 2020). If your struggles
feel bigger than an app, a licensed professional is the right next step — and that's a strong
move, not a defeat."

**Settings → full disclaimer:** ToU §4.2 + §4.3 text verbatim.

## 7. App Store positioning notes

- Category: Health & Fitness; age rating 17+. Listing copy follows §2 tables.
- Guideline 5.1.1/5.1.2 (data use disclosure + privacy nutrition labels) must exactly match §5.
- Do not use the word "treatment" or condition names in the App Store subtitle/keywords;
  "quit porn," "porn blocker," "habit," "self-control" are behavior words, not disease claims.
- In review notes, describe the app as an educational wellness program with validated screening
  and cite the instrument papers — reviewers respond well to documented legitimacy.

## 8. Corporate & operational shields (founder checklist)

1. **Entity: Simplifico LLC** (already formed — operating as Smplcty Analytics). App published
   under Simplifico LLC's Apple Developer account with Simplifico LLC as App Store seller of
   record. Personal ↔ business finances separated. If "Reclaim" or "Smplcty Analytics" will
   appear as the public-facing brand, confirm with the attorney whether a DBA/trade-name
   registration is needed in the LLC's state.
2. **General liability / tech E&O insurance** once revenue justifies (~post-launch; get quotes
   at $1–5k/yr range; ask broker about media liability rider for content claims).
3. **Clinician review sign-off** (CLINICAL_SPEC §8) documented in writing — substantiation file.
4. **Substantiation folder:** keep PDFs of every cited study + a claims-to-source mapping
   spreadsheet. If the FTC ever asks "what's behind this claim," the answer is one folder away.
5. **Version every legal doc**; store user acceptance (doc version + timestamp) in DB.
6. **Marketing reviews:** every ad, TikTok script, or influencer brief passes the §2 banned-words
   check before publication. Influencers get a one-page do/don't sheet (no cure/treatment claims
   on our behalf — their claims are attributable to us under FTC endorsement rules; include
   #ad disclosure requirement).

## 9. Engineering enforcement (for CLAUDE.md)

- A `legal/` directory in-repo holds tou.md, privacy.md, disclaimer strings (versioned).
- Onboarding step 10 requires affirmative checkbox ("I agree to the Terms of Use and Privacy
  Policy") — not pre-checked; store {user_id, doc_version, accepted_at}.
- CI lint: user-facing string files scanned for §2.1 banned terms (simple wordlist check);
  build fails on match.
- Crisis resources route must be reachable logged-out and unsubscribed.
