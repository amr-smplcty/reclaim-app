# Privacy Policy

**DRAFT — PENDING ATTORNEY REVIEW.** This document was prepared without a lawyer
and must not be treated as legally binding until a licensed attorney has
reviewed it (see LEGAL_COMPLIANCE.md).

**Version:** 0.1.0-draft (must match `PRIVACY_VERSION` in `src/lib/legal/versions.ts`)

Reclaim is operated by **Simplifico LLC** (operating as Smplcty Analytics). We
treat all user data as sensitive health-adjacent data.

## 1. We Never Share Data With Advertising Platforms

We do not use Meta, TikTok, Google, or any other advertising SDKs or pixels
in the app or on the logged-in web experience. Marketing attribution uses
privacy-preserving methods only (SKAdNetwork). We never build custom
audiences from user emails.

## 2. We Never Sell Personal Data

We do not sell your personal data. Full stop.

## 3. Analytics

Analytics are first-party-controlled (PostHog) and pseudonymous. Event
payloads never include journal text, assessment free-text, or notification
content.

## 4. Data We Collect & Why

- Account information (email, auth ID)
- Assessment scores
- Program progress
- Journal entries (encrypted at rest; never used for marketing or model training)
- Device and diagnostic data
- Subscription status (via RevenueCat)
- Analytics events

## 5. Processors

We share data with the following processors, each governed by their own
terms:

- Supabase (hosting/auth)
- RevenueCat (subscriptions)
- Apple (payments)
- PostHog (analytics)

## 6. Retention & Deletion

Deleting your account erases your personal data within 30 days (and from
backups within 90 days). An in-app one-tap deletion flow is always
available.

## 7. Your Rights

Regardless of where you live, you may access, export, correct, or delete
your data. We apply GDPR/UK GDPR/CCPA-grade rights globally rather than
geo-fencing them. Processing for EU users is consent-based.

## 8. No HIPAA Claims

We are not a HIPAA-covered entity and do not claim to be. We treat all user
data as sensitive health-adjacent data.

## 9. State Health-Privacy Laws

Certain state consumer-health-privacy statutes (e.g., Washington's My Health
My Data Act) grant additional rights around "consumer health data." Our
no-sharing, consent-first, delete-on-request approach is designed to meet
the strictest of these. **[TODO: attorney to confirm state-specific notices
at review.]**

## 10. Breach Response

We maintain an incident-response plan consistent with the FTC Health Breach
Notification Rule, including notifying affected users and the FTC within
statutory windows.
