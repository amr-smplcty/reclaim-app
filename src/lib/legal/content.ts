// In-app display text for the legal docs — kept in sync with legal/tou.md and
// legal/privacy.md by hand (Metro doesn't load .md as text without extra
// config, see CLAUDE.md open risks). Update both together on any change.
import { PRIVACY_VERSION, TOU_VERSION } from '@/lib/legal/versions';

export interface LegalSection {
  heading: string;
  body: string;
}

export const TOU_INTRO =
  'DRAFT — PENDING ATTORNEY REVIEW. This document was prepared without a lawyer and must not be treated as legally binding until a licensed attorney has reviewed it.';

export const TOU_SECTIONS: LegalSection[] = [
  {
    heading: '1. Acceptance & Eligibility',
    body: 'This Agreement is formed when you create an account. You must be 18 years of age or older to use Reclaim. The Service is void where prohibited by law.',
  },
  {
    heading: '2. Nature of Service',
    body: "Reclaim is an educational, self-help wellness product. It provides information, self-assessment questionnaires, and skill-building exercises based on published research. Reclaim is NOT a healthcare provider; does NOT provide medical care, mental health treatment, therapy, counseling, or diagnosis; and is NOT a substitute for professional advice. No clinician–patient or therapist–client relationship is created by use of the app. Screening scores are informational only and do not constitute a diagnosis of any condition. Always seek the advice of a qualified professional with any questions regarding a medical or mental-health condition. Never disregard professional advice or delay seeking it because of something you read in Reclaim.",
  },
  {
    heading: '3. Emergency Disclaimer',
    body: 'Reclaim is not an emergency service. If you are in crisis or considering harming yourself or others, call or text 988 (US), your local emergency number, or go to the nearest emergency room.',
  },
  {
    heading: '4. Assumption of Risk & Individual Results',
    body: 'You acknowledge that results vary between individuals. Research cited within the app describes studied techniques and group-level findings, not guaranteed individual outcomes.',
  },
  {
    heading: '5. Subscriptions',
    body: 'Subscriptions are billed through Apple and auto-renew until cancelled in your device settings. Refunds are handled by Apple per its policies. Free-trial terms are disclosed at the point of purchase.',
  },
  {
    heading: '6. User Content & License',
    body: 'You own the journal entries and other content you create in Reclaim. You grant us a limited license to process that content solely to operate the Service.',
  },
  {
    heading: '7. Acceptable Use',
    body: 'You agree not to reverse engineer or scrape the Service, upload unlawful content, or use the Service if you are a minor.',
  },
  {
    heading: '8. Disclaimer of Warranties',
    body: 'The Service is provided "AS IS" and "AS AVAILABLE," to the maximum extent permitted by law, without warranties of any kind.',
  },
  {
    heading: '9. Limitation of Liability',
    body: 'To the maximum extent permitted by law, our aggregate liability is capped at the greater of (a) the amounts you paid in the 12 months preceding the claim, or (b) $100. We are not liable for indirect or consequential damages.',
  },
  {
    heading: '10. Indemnification',
    body: 'You agree to indemnify us against claims arising from your breach of this Agreement or misuse of the Service.',
  },
  {
    heading: '11. Dispute Resolution',
    body: 'Disputes are resolved through binding individual arbitration, with a class-action waiver, subject to small-claims-court and opt-out carve-outs.',
  },
  {
    heading: '12. Governing Law, Changes & Termination',
    body: 'This Agreement is governed by the laws of [entity\'s state]. We may update these Terms with notice. We may terminate or suspend your access as described in this Agreement.',
  },
  {
    heading: '13. Contracting Entity',
    body: 'The contracting party for this Agreement is Simplifico LLC (operating as Smplcty Analytics), never any individual founder personally. All legal documents, the App Store seller of record, and payment accounts reference Simplifico LLC.',
  },
];

export const PRIVACY_INTRO = TOU_INTRO;

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    heading: '1. We Never Share Data With Advertising Platforms',
    body: 'We do not use Meta, TikTok, Google, or any other advertising SDKs or pixels in the app or on the logged-in web experience. Marketing attribution uses privacy-preserving methods only (SKAdNetwork). We never build custom audiences from user emails.',
  },
  {
    heading: '2. We Never Sell Personal Data',
    body: 'We do not sell your personal data. Full stop.',
  },
  {
    heading: '3. Analytics',
    body: 'Analytics are first-party-controlled (PostHog) and pseudonymous. Event payloads never include journal text, assessment free-text, or notification content.',
  },
  {
    heading: '4. Data We Collect & Why',
    body: 'Account information (email, auth ID); assessment scores; program progress; journal entries (encrypted at rest; never used for marketing or model training); device and diagnostic data; subscription status (via RevenueCat); analytics events.',
  },
  {
    heading: '5. Processors',
    body: 'We share data with the following processors, each governed by their own terms: Supabase (hosting/auth), RevenueCat (subscriptions), Apple (payments), PostHog (analytics).',
  },
  {
    heading: '6. Retention & Deletion',
    body: 'Deleting your account erases your personal data within 30 days (and from backups within 90 days). An in-app one-tap deletion flow is always available.',
  },
  {
    heading: '7. Your Rights',
    body: 'Regardless of where you live, you may access, export, correct, or delete your data. We apply GDPR/UK GDPR/CCPA-grade rights globally rather than geo-fencing them. Processing for EU users is consent-based.',
  },
  {
    heading: '8. No HIPAA Claims',
    body: 'We are not a HIPAA-covered entity and do not claim to be. We treat all user data as sensitive health-adjacent data.',
  },
  {
    heading: '9. State Health-Privacy Laws',
    body: 'Certain state consumer-health-privacy statutes (e.g., Washington\'s My Health My Data Act) grant additional rights around "consumer health data." Our no-sharing, consent-first, delete-on-request approach is designed to meet the strictest of these.',
  },
  {
    heading: '10. Breach Response',
    body: 'We maintain an incident-response plan consistent with the FTC Health Breach Notification Rule, including notifying affected users and the FTC within statutory windows.',
  },
];

export const LEGAL_DOCS = {
  tou: { title: 'Terms of Use', version: TOU_VERSION, intro: TOU_INTRO, sections: TOU_SECTIONS },
  privacy: { title: 'Privacy Policy', version: PRIVACY_VERSION, intro: PRIVACY_INTRO, sections: PRIVACY_SECTIONS },
} as const;
