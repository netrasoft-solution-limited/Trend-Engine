import { DeliveryState, PortalNotification, Publication } from '../types';

/**
 * THE PUBLICATION GATE — PRD §6.9, Arch §9.
 *
 * This module is the ONLY door between the operator plane and the tenant plane.
 * Everything `src/portal/` renders comes from here.
 *
 * Two properties are deliberate and must survive any refactor:
 *
 *   1. This module does not import `data/outputs.ts`. A Publication carries its
 *      own frozen snapshot of the version that went live, so there is no query
 *      path from a portal view to an Output or an OutputVersion — Arch §9.2.
 *
 *   2. Reads go through `publicationsForOrg()`, which refuses to return anything
 *      without a bound tenant. That mirrors the default-deny manager in
 *      Arch §5.2: unscoped access is a loud failure, never a silent full scan.
 *
 * Approval does not put anything here. Only an explicit publish action does.
 */

/** Prototype stand-in for Arch §5.2's `TenantScopeError`. */
export class TenantScopeError extends Error {
  constructor(what: string) {
    super(`${what} accessed without tenant scope`);
    this.name = 'TenantScopeError';
  }
}

/**
 * PRD §6.6's six output types, as the portal is allowed to know them: a label
 * (matches `Publication.type` exactly) and a URL-friendly slug for filter
 * query strings. This is the only "type list" the portal has — it is not
 * `outputTypes` from `data/outputs.ts`, which the portal must never import.
 */
export const PUBLICATION_TYPES: { slug: string; label: string }[] = [
  { slug: 'trend_brief', label: 'Trend intelligence brief' },
  { slug: 'content_queue', label: 'Monthly content queue' },
  { slug: 'content_brief', label: 'Content brief / draft' },
  { slug: 'product_memo', label: 'Product / opportunity memo' },
  { slug: 'research_alert', label: 'Research alert' },
  { slug: 'visibility_benchmark', label: 'Visibility benchmark' }
];

export function typeSlugToLabel(slug: string): string | undefined {
  return PUBLICATION_TYPES.find((t) => t.slug === slug)?.label;
}

export function typeLabelToSlug(label: string): string | undefined {
  return PUBLICATION_TYPES.find((t) => t.label === label)?.slug;
}

const publications: Publication[] = [
  {
    id: 'PUB-0042',
    outputId: 'OUT-3114',
    versionId: 'OV-3114-2',
    version: 2,
    orgId: 'org-jarrow',
    type: 'Research alert',
    title: 'Creatine + working memory: what the new crossover RCT does and does not show',
    summary:
      'A small crossover trial reports working-memory improvement under sleep restriction. Useful context for cognition content — not a general claim.',
    body: [
      {
        heading: 'In plain language',
        text: 'A crossover trial gave creatine to sleep-restricted adults and measured working memory. Scores improved against placebo within the same participants. The effect was measured under sleep restriction, which is the condition the study was designed around.'
      },
      {
        heading: 'Study design',
        text: 'Randomised crossover, n=24, each participant serving as their own control. Crossover designs reduce between-person variation but cannot rule out carry-over between arms.'
      },
      {
        heading: 'Population',
        text: 'Adults under experimental sleep restriction. This is not a rested general population, and the distinction should stay attached to any restatement of the result.'
      },
      {
        heading: 'Limitations',
        text: 'Small sample. Single site. Short duration. No pre-registered primary endpoint stated in the abstract. One related meta-analysis remains inconclusive.'
      },
      {
        heading: 'Why this reached you',
        text: 'It supports the cognition framing appearing across podcasts and clinician channels this month, and it bounds what can be said about it.'
      }
    ],
    publishedBy: 'abubakar',
    publishedAt: 'Today 08:15',
    unpublishedAt: null,
    notifiedAt: 'Today 08:15'
  },
  {
    id: 'PUB-0041',
    outputId: 'OUT-3104',
    versionId: 'OV-3104-1',
    version: 1,
    orgId: 'org-jarrow',
    type: 'Monthly content queue',
    title: 'September content queue — 4 long-form, 5 PDP opportunities',
    summary: 'Nine ranked opportunities with rationale, sources and a named reviewer for each.',
    body: [
      {
        heading: 'Long-form',
        text: 'Magnesium form comparison for sleep · Creatine beyond training · What postbiotic actually means · Vitamin D and K2 taken together.'
      },
      {
        heading: 'PDP opportunities',
        text: 'MagMind · Magnesium Optimizer · Creatine Monohydrate Powder · Jarro-Dophilus EPS · Vitamin D3 + K2.'
      },
      {
        heading: 'How these were chosen',
        text: 'Each item traces to a ranked development in the category with recorded evidence behind it, weighted toward products already on your shelf.'
      }
    ],
    publishedBy: 'abubakar',
    publishedAt: 'Sep 05 09:10',
    unpublishedAt: null,
    notifiedAt: 'Sep 05 09:10'
  },
  {
    id: 'PUB-0039',
    outputId: 'OUT-3088',
    versionId: 'OV-3088-4',
    version: 4,
    orgId: 'org-jarrow',
    type: 'Trend intelligence brief',
    title: 'Week of Sep 7 — three ranked developments',
    summary: 'Magnesium form comparison leads the week. Berberine resurfaces with a safety backlash attached.',
    body: [
      {
        heading: 'Three things to know',
        text: 'Buyers are asking which magnesium form to pick, not whether to take magnesium. Berberine is back, but the reach is coming from the backlash. Postbiotic vocabulary is displacing CFU-count language without a matching demand shift yet.'
      },
      {
        heading: 'What changed',
        text: 'The magnesium conversation moved from category-level to form-level over two consecutive windows. That is the shift worth acting on.'
      },
      {
        heading: 'Recommended actions',
        text: 'Commission the form-comparison explainer. Hold on postbiotic repositioning. Treat berberine as a defensive-education question, not a product question.'
      },
      {
        heading: 'Methodology',
        text: 'Evidence collected from podcast, video, research and permitted web sources over a 14-day window, scored on momentum, acceleration, source diversity, evidence quality, engagement, novelty and recency, then ranked against your catalogue and audiences.'
      }
    ],
    publishedBy: 'abubakar',
    publishedAt: 'Sep 08 08:00',
    unpublishedAt: null,
    notifiedAt: 'Sep 08 08:00'
  },
  {
    id: 'PUB-0046',
    outputId: 'OUT-2810',
    versionId: 'OV-2810-1',
    version: 1,
    orgId: 'org-jarrow',
    type: 'Trend intelligence brief',
    title: 'Week of Sep 21 — three ranked developments',
    summary: 'Magnesium form comparison continues to lead. A new co-dosing question is opening up around vitamin D and K2.',
    body: [
      {
        heading: 'Three things to know',
        text: 'Buyers are still comparing magnesium forms rather than asking whether to take it at all. A parallel question is opening up around vitamin D and K2 co-dosing. Berberine’s safety conversation has cooled since last week.'
      },
      {
        heading: 'Recommended actions',
        text: 'Keep the magnesium form-comparison content in production. Hold on a co-dosing explainer until the research alert on vitamin D and K2 has been reviewed.'
      }
    ],
    publishedBy: 'abubakar',
    publishedAt: 'Sep 20 08:00',
    unpublishedAt: null,
    notifiedAt: 'Sep 20 08:00'
  },
  {
    id: 'PUB-0044',
    outputId: 'OUT-2809',
    versionId: 'OV-2809-1',
    version: 1,
    orgId: 'org-jarrow',
    type: 'Research alert',
    title: 'Vitamin D and K2 co-dosing: what the ratio question is actually asking',
    summary: 'Buyers are asking whether taking vitamin D and K2 together needs a specific ratio. The literature supports co-administration but not one settled ratio.',
    body: [
      {
        heading: 'In plain language',
        text: 'Buyers are asking whether vitamin D and K2 need to be taken in a specific ratio. The literature supports taking them together, but it does not establish one optimal ratio for general use.'
      },
      {
        heading: 'Limitations',
        text: 'No head-to-head trial defines a single best ratio. Treat any specific number as a starting point, not a settled answer.'
      }
    ],
    publishedBy: 'abubakar',
    publishedAt: 'Sep 17 10:30',
    unpublishedAt: null,
    notifiedAt: 'Sep 17 10:30'
  },
  {
    id: 'PUB-0043',
    outputId: 'OUT-2808',
    versionId: 'OV-2808-1',
    version: 1,
    orgId: 'org-jarrow',
    type: 'Product / opportunity memo',
    title: 'Berberine: portfolio gap and safety exposure',
    summary: 'Renewed berberine interest is paired with a visible safety conversation about drug interactions.',
    body: [
      {
        heading: 'Observed demand',
        text: 'Renewed interest in berberine is showing up across buyer questions, paired with a visible safety conversation about interactions.'
      },
      {
        heading: 'Risks',
        text: 'The framing driving attention compares berberine to a prescription medication class. That comparison is not one we can use in consumer-facing content.'
      }
    ],
    publishedBy: 'abubakar',
    publishedAt: 'Sep 10 14:00',
    unpublishedAt: null,
    notifiedAt: 'Sep 10 14:00'
  },
  {
    id: 'PUB-0038',
    outputId: 'OUT-2807',
    versionId: 'OV-2807-2',
    version: 2,
    orgId: 'org-jarrow',
    type: 'Visibility benchmark',
    title: 'August brand visibility vs. four competitors',
    summary: 'Your brand’s presence in category-level answers held steady month over month against the four competitors we track.',
    body: [
      {
        heading: 'What changed',
        text: 'Your brand’s presence in category-level answers held steady month over month against the four competitors we track.'
      },
      {
        heading: 'Limitations',
        text: 'This is a snapshot of parsed answers, not a market-share measurement.'
      }
    ],
    publishedBy: 'abubakar',
    publishedAt: 'Aug 28 09:00',
    unpublishedAt: null,
    notifiedAt: 'Aug 28 09:00'
  },
  {
    id: 'PUB-0035',
    outputId: 'OUT-2806',
    versionId: 'OV-2806-1',
    version: 1,
    orgId: 'org-jarrow',
    type: 'Content brief / draft',
    title: 'Creatine for cognition — buyer education',
    summary: 'Creatine is reaching cognition and healthy-aging buyers, not just performance buyers. The brief leads with the existing product.',
    body: [
      {
        heading: 'Angle',
        text: 'The audience shift is real: creatine is reaching cognition and healthy-aging buyers, not just performance buyers. The content leads with the existing product, not a new one.'
      },
      {
        heading: 'Guardrails',
        text: 'Do not extrapolate sleep-restricted study populations to a general, rested audience.'
      }
    ],
    publishedBy: 'abubakar',
    publishedAt: 'Aug 10 11:00',
    unpublishedAt: null,
    notifiedAt: null
  },
  {
    id: 'PUB-0033',
    outputId: 'OUT-2805',
    versionId: 'OV-2805-1',
    version: 1,
    orgId: 'org-jarrow',
    type: 'Monthly content queue',
    title: 'August content queue — 3 long-form, 4 PDP opportunities',
    summary: 'Seven ranked opportunities with rationale, sources and a named reviewer for each.',
    body: [
      {
        heading: 'Long-form',
        text: 'Postbiotic vocabulary explainer · Magnesium for sleep, revisited · Vitamin D and K2 taken together.'
      },
      {
        heading: 'PDP opportunities',
        text: 'Jarro-Dophilus EPS · MagMind · Vitamin D3 + K2.'
      }
    ],
    publishedBy: 'abubakar',
    publishedAt: 'Jul 20 09:00',
    unpublishedAt: null,
    notifiedAt: null
  },
  {
    id: 'PUB-0028',
    outputId: 'OUT-2803',
    versionId: 'OV-2803-1',
    version: 1,
    orgId: 'org-jarrow',
    type: 'Trend intelligence brief',
    title: 'Week of May 28 — early signals archive',
    summary: 'An early look at the postbiotic vocabulary shift, months before it became a recurring theme in later briefs.',
    body: [
      {
        heading: 'Three things to know',
        text: 'An early look at the postbiotic vocabulary shift, months before it became a recurring theme in later briefs.'
      }
    ],
    publishedBy: 'abubakar',
    publishedAt: 'Jun 01 08:00',
    unpublishedAt: null,
    notifiedAt: null
  },
  {
    id: 'PUB-0025',
    outputId: 'OUT-2802',
    versionId: 'OV-2802-1',
    version: 1,
    orgId: 'org-jarrow',
    type: 'Research alert',
    title: 'Postbiotic heat-killed Lactobacillus preparations and metabolic markers',
    summary: 'A systematic review reports objective metabolic markers rather than symptom self-report, across a range of postbiotic preparations.',
    body: [
      {
        heading: 'In plain language',
        text: 'A systematic review of postbiotic preparations reports objective metabolic markers rather than symptom self-report, across a range of preparations.'
      },
      {
        heading: 'Limitations',
        text: 'Included studies define “postbiotic” inconsistently, which limits how far the pooled result can be generalised.'
      }
    ],
    publishedBy: 'abubakar',
    publishedAt: 'May 05 08:00',
    unpublishedAt: null,
    notifiedAt: null
  },
  {
    id: 'PUB-0036',
    outputId: 'OUT-3071',
    versionId: 'OV-3071-2',
    version: 2,
    orgId: 'org-jarrow',
    type: 'Trend intelligence brief',
    title: 'Week of Aug 31 — superseded',
    summary: 'Withdrawn after a citation error was found in the research section.',
    body: [
      {
        heading: 'Withdrawn',
        text: 'This brief was unpublished on Sep 02 after a citation error was identified in the research section. A corrected version was issued as part of the Sep 7 brief.'
      }
    ],
    publishedBy: 'abubakar',
    publishedAt: 'Sep 01 08:00',
    /** PRD §6.9: publication is reversible, and the reversal is audited. */
    unpublishedAt: 'Sep 02 14:26',
    notifiedAt: 'Sep 01 08:00'
  },
  {
    id: 'PUB-0012',
    outputId: 'OUT-2904',
    versionId: 'OV-2904-1',
    version: 1,
    orgId: 'org-fixture-second',
    type: 'Trend intelligence brief',
    title: 'Fixture tenant brief — must never appear under Jarrow',
    summary: 'Belongs to the second-client CI fixture. Its presence here is what makes the isolation check meaningful.',
    body: [{ heading: 'Fixture', text: 'PRD §2 architecture proof. Not a live client.' }],
    publishedBy: 'abubakar',
    publishedAt: 'Sep 10 12:00',
    unpublishedAt: null,
    notifiedAt: null
  }
];

/**
 * Arch §5.2: default-deny. No bound tenant, no rows.
 *
 * The portal binds this from the session and has no way to widen it — there is
 * deliberately no `OPERATOR_ALL` escape hatch in this module.
 */
export function publicationsForOrg(orgId: string | null): Publication[] {
  if (!orgId) {
    throw new TenantScopeError('Publication');
  }
  return publications.filter((p) => p.orgId === orgId && p.unpublishedAt === null);
}

/** Includes withdrawn records. Operator-side history view only. */
export function publicationHistoryForOrg(orgId: string | null): Publication[] {
  if (!orgId) {
    throw new TenantScopeError('Publication');
  }
  return publications.filter((p) => p.orgId === orgId);
}

export function publicationById(orgId: string | null, publicationId: string): Publication | undefined {
  return publicationsForOrg(orgId).find((p) => p.id === publicationId);
}

/**
 * PRD §6.8: the client-facing delivery tracker. Every internal pre-publication
 * state collapses to a single "in preparation" — the client never learns which
 * internal review stage something is sitting in.
 */
export interface DeliveryRow {
  id: string;
  type: string;
  title: string;
  state: DeliveryState;
  expected: string;
  note: string;
}

const deliveries: Record<string, DeliveryRow[]> = {
  'org-jarrow': [
    { id: 'DEL-91', type: 'Research alert', title: 'Creatine + working memory crossover RCT', state: 'published', expected: 'Delivered today', note: 'Available to read now.' },
    { id: 'DEL-90', type: 'Trend intelligence brief', title: 'Week of Sep 14', state: 'in preparation', expected: 'Expected Mon 22 Sep', note: 'With the Pure Play team.' },
    { id: 'DEL-89', type: 'Content brief / draft', title: 'Creatine for cognition — buyer education', state: 'in preparation', expected: 'Expected Wed 24 Sep', note: 'With the Pure Play team.' },
    { id: 'DEL-88', type: 'Monthly content queue', title: 'September content queue', state: 'delivered', expected: 'Delivered Sep 05', note: 'Acknowledged by your team.' },
    { id: 'DEL-86', type: 'Visibility benchmark', title: 'August brand visibility', state: 'delivered', expected: 'Delivered Sep 02', note: 'Acknowledged by your team.' }
  ]
};

export function deliveriesForOrg(orgId: string | null): DeliveryRow[] {
  if (!orgId) {
    throw new TenantScopeError('Delivery');
  }
  return deliveries[orgId] ?? [];
}

const notifications: PortalNotification[] = [
  { id: 'N-511', orgId: 'org-jarrow', publicationId: 'PUB-0042', subject: 'New research alert: creatine and working memory', sentAt: 'Today 08:15', channel: 'email', read: false },
  { id: 'N-520', orgId: 'org-jarrow', publicationId: 'PUB-0046', subject: 'Trend brief — week of Sep 21', sentAt: 'Sep 20 08:00', channel: 'email', read: false },
  { id: 'N-518', orgId: 'org-jarrow', publicationId: 'PUB-0044', subject: 'New research alert: vitamin D and K2 co-dosing', sentAt: 'Sep 17 10:30', channel: 'email', read: true },
  { id: 'N-516', orgId: 'org-jarrow', publicationId: 'PUB-0043', subject: 'New product memo: berberine portfolio gap', sentAt: 'Sep 10 14:00', channel: 'email', read: false },
  { id: 'N-509', orgId: 'org-jarrow', publicationId: 'PUB-0041', subject: 'Your September content queue is ready', sentAt: 'Sep 05 09:10', channel: 'email', read: true },
  { id: 'N-507', orgId: 'org-jarrow', publicationId: 'PUB-0039', subject: 'Trend brief — week of Sep 7', sentAt: 'Sep 08 08:00', channel: 'email', read: true },
  { id: 'N-505', orgId: 'org-jarrow', publicationId: null, subject: 'A previously issued brief was withdrawn and reissued', sentAt: 'Sep 02 14:30', channel: 'email', read: true },
  { id: 'N-503', orgId: 'org-jarrow', publicationId: 'PUB-0038', subject: 'Visibility benchmark — August', sentAt: 'Aug 28 09:00', channel: 'email', read: true }
];

export function notificationsForOrg(orgId: string | null): PortalNotification[] {
  if (!orgId) {
    throw new TenantScopeError('PortalNotification');
  }
  return notifications.filter((n) => n.orgId === orgId);
}

