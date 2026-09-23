import { ClaimsFlag, ExpertReview, OutputState, OutputVersion } from '../types';

/**
 * TENANT-SCOPED (L6). Everything here is pre-publication and internal.
 *
 * Nothing in this module may be read by `src/portal/`. The portal resolves
 * content exclusively through `data/publications.ts` — Arch §9.2/§9.3.
 */

/** The six output types defined by PRD §6.6, with the contents each one must carry. */
export const outputTypes = [
  {
    id: 'trend_brief',
    label: 'Trend intelligence brief',
    note: 'Ranked developments with evidence, confidence and recommended posture',
    requiresExpertReview: true,
    mustContain: [
      '3–5 things to know',
      'Ranked signals',
      'What changed',
      'Why it matters',
      'Evidence',
      'Confidence',
      'Actions',
      'Research',
      'Watch items',
      'Methodology'
    ]
  },
  {
    id: 'content_queue',
    label: 'Monthly content queue',
    note: '4 long-form plus 4–6 PDP opportunities, each with a named reviewer',
    requiresExpertReview: false,
    mustContain: [
      '4 long-form opportunities',
      '4–6 PDP opportunities',
      'Rationale per item',
      'Sources',
      'Reviewer',
      'Status'
    ]
  },
  {
    id: 'content_brief',
    label: 'Content brief / draft',
    note: 'Angle, outline and draft copy for one piece, with claim boundaries',
    requiresExpertReview: true,
    mustContain: [
      'Audience',
      'Question',
      'Evidence-backed angle',
      'Outline',
      'Approved claims',
      'Prohibited claims',
      'Sources',
      'Expert reviewer',
      'Internal links'
    ]
  },
  {
    id: 'product_memo',
    label: 'Product / opportunity memo',
    note: 'Portfolio gap, demand evidence, competitive picture and risk',
    requiresExpertReview: true,
    mustContain: [
      'Observed demand',
      'Audience / use case',
      'Assets or formulations',
      'Evidence over time',
      'Competitors',
      'Scientific state',
      'Risks',
      'Next validation'
    ]
  },
  {
    id: 'research_alert',
    label: 'Research alert',
    note: 'One study, structured for scientific sign-off',
    requiresExpertReview: true,
    mustContain: [
      'Identity',
      'Plain-language summary',
      'Study design',
      'Population',
      'Intervention',
      'Outcomes',
      'Limitations',
      'Relevance',
      'Integrity / license',
      'Review action'
    ]
  },
  {
    id: 'visibility_benchmark',
    label: 'Visibility benchmark',
    note: 'Versioned queries and model metadata with brand/competitor deltas',
    requiresExpertReview: false,
    mustContain: [
      'Versioned queries',
      'Model metadata',
      'Parsed brand observations',
      'Competitor observations',
      'Deltas',
      'Limitations',
      'Monthly report input'
    ]
  }
] as const;

export type OutputTypeId = (typeof outputTypes)[number]['id'];

export const reviewStages = [
  'Editorial fit',
  'Evidence check',
  'Scientific / legal claims',
  'Brand voice',
  'Merchandising / availability',
  'Final proof'
];

export const draftSections = [
  {
    id: 'headline',
    label: 'Working title',
    value: 'Creatine is no longer just a gym supplement — and Jarrow already sells it'
  },
  {
    id: 'thesis',
    label: 'Thesis',
    value:
      'Over the last two weeks, creatine has moved from sports-performance content into cognition and healthy-aging content aimed at women over 40. Jarrow already stocks creatine monohydrate but positions it exclusively for training. The gap is positioning and education, not product development.'
  },
  {
    id: 'evidence',
    label: 'Evidence summary',
    value:
      '38 qualifying evidence spans across 6 podcasts, 4 YouTube channels and 3 research records (14-day window; prior window: 11 spans). Research base: two small crossover RCTs reporting working-memory effects under sleep restriction, plus one inconclusive meta-analysis. Practitioner commentary makes up the majority of spans and is not clinical evidence.'
  },
  {
    id: 'angle',
    label: 'Recommended angle',
    value:
      'Lead with the mechanism (cellular energy availability in neural tissue), then the practical protocol already in market (5 g daily, no loading phase). Frame the audience shift honestly: the same molecule, a different reason to take it. Point to the existing SKU; do not imply a new formulation.'
  },
  {
    id: 'guardrails',
    label: 'Guardrails',
    value:
      'Do not mirror the host framing that creatine "rebuilds the aging brain". Do not extrapolate sleep-restricted study populations to rested general buyers. Do not compare against Jarrow cognition SKUs. DSHEA disclaimer block required.'
  }
];

export const claimsFlags: ClaimsFlag[] = [
  {
    id: 'CF-1',
    kind: 'Product claim',
    excerpt: '"…Jarrow already sells it"',
    guidance:
      'Product mention is fine; any adjacent benefit statement must map to the substantiation index entry for creatine monohydrate.',
    severity: 'review'
  },
  {
    id: 'CF-2',
    kind: 'Research extrapolation',
    excerpt: '"…reporting working-memory effects under sleep restriction"',
    guidance:
      'Population is sleep-restricted adults. Keep the qualifier attached in every restatement — removing it creates an unsupported general claim.',
    severity: 'blocking'
  },
  {
    id: 'CF-3',
    kind: 'Comparative language',
    excerpt: '"…the same molecule, a different reason to take it"',
    guidance: 'Acceptable as written. Do not extend into cross-SKU or cross-brand efficacy comparison.',
    severity: 'note'
  },
  {
    id: 'CF-4',
    kind: 'Safety statement',
    excerpt: '"5 g daily, no loading phase"',
    guidance:
      'Dosage guidance present. Requires scientific/legal sign-off and a "consult your healthcare provider" line for the 40+ audience.',
    severity: 'review'
  },
  {
    id: 'CF-5',
    kind: 'Required disclaimer',
    excerpt: 'Document level',
    guidance:
      'DSHEA structure/function disclaimer block is not yet present in the draft. Blocking until inserted.',
    severity: 'blocking'
  }
];

/** PRD §6.6: these checks are a hard gate, not a style pass. */
export const citationChecks = [
  { check: 'Every scientific identifier resolves and matches title, year, authors, source URL', state: 'passed' as const, detail: '3 of 3 identifiers resolved (PMID ×2, DOI ×1)' },
  { check: 'Every factual medical/scientific statement maps to approved evidence', state: 'attention' as const, detail: '1 statement unmapped — see CF-2' },
  { check: 'Quoted and paraphrased source claims map to stored evidence spans', state: 'passed' as const, detail: '11 of 11 quotes resolve to segment IDs' },
  { check: 'Licensing, excerpt, attribution and retention rules satisfied', state: 'passed' as const, detail: 'All four routes within their recorded policy version' },
  { check: 'Correction / retraction status checked', state: 'passed' as const, detail: 'No corrections or retractions on cited records as of today' }
];

export const internalOnlyFields = [
  'Vendor record IDs (Taddy / Apify / AssemblyAI)',
  'Per-run and per-item cost figures',
  'Raw model prompts and scoring weights',
  'Source rights-basis notes and policy versions',
  'Operator rejection reasons and audit actor names',
  'Version history — only the published version is client-visible'
];

/** Version history is internal. PRD §6.9: only one published version is visible to a tenant at a time. */
export const outputVersions: OutputVersion[] = [
  { id: 'OV-3120-3', version: 3, createdAt: 'Today 10:42', author: 'abubakar', summary: 'Tightened the guardrails section; added the population qualifier', state: 'draft', approvedBy: null, approvedAt: null },
  { id: 'OV-3120-2', version: 2, createdAt: 'Yesterday 16:11', author: 'abubakar', summary: 'Rewrote the angle after the evidence check', state: 'archived', approvedBy: null, approvedAt: null },
  { id: 'OV-3120-1', version: 1, createdAt: 'Sep 18 09:30', author: 'system', summary: 'Generated from SIG-2041', state: 'archived', approvedBy: null, approvedAt: null }
];

/** PRD §6.9: the operator approves an exact version — never a hardcoded "current" literal. */
export function latestVersion(versions: OutputVersion[]): number {
  return versions.reduce((max, v) => Math.max(max, v.version), 0);
}

/**
 * Arch §9.2: health/scientific outputs require recorded expert sign-off BEFORE
 * publication — stricter than the internal approval flow.
 */
export const expertReviews: ExpertReview[] = [
  {
    outputId: 'OUT-3120',
    reviewer: 'M. Reyes',
    discipline: 'Scientific / legal claims',
    signedOffAt: null,
    note: 'Awaiting review of the dosage line and the sleep-restriction qualifier.'
  },
  {
    outputId: 'OUT-3114',
    reviewer: 'M. Reyes',
    discipline: 'Scientific / legal claims',
    signedOffAt: 'Today 07:58',
    note: 'Signed off. Limitations section reflects the crossover design accurately.'
  },
  {
    outputId: 'OUT-3109',
    reviewer: 'M. Reyes',
    discipline: 'Scientific / legal claims',
    signedOffAt: 'Yesterday 11:37',
    note: 'Signed off with the interaction warning retained verbatim.'
  }
];

export const recentOutputs: { id: string; type: string; title: string; state: OutputState; updated: string; org: string }[] = [
  { id: 'OUT-3120', type: 'Content brief / draft', title: 'Creatine for cognition — buyer education', state: 'draft', updated: 'Today 10:42', org: 'Jarrow Formulas' },
  { id: 'OUT-3118', type: 'Trend intelligence brief', title: 'Week of Sep 14 — four ranked developments', state: 'review ready', updated: 'Today 08:55', org: 'Jarrow Formulas' },
  { id: 'OUT-3114', type: 'Research alert', title: 'Creatine + working memory crossover RCT', state: 'published', updated: 'Today 08:15', org: 'Jarrow Formulas' },
  { id: 'OUT-3109', type: 'Product / opportunity memo', title: 'Berberine: portfolio gap and safety exposure', state: 'approved', updated: 'Yesterday 11:37', org: 'Jarrow Formulas' },
  { id: 'OUT-3104', type: 'Monthly content queue', title: 'September content queue — 4 long-form, 5 PDP', state: 'published', updated: 'Sep 05', org: 'Jarrow Formulas' },
  { id: 'OUT-3101', type: 'Visibility benchmark', title: 'August brand visibility vs. four competitors', state: 'delivered', updated: 'Sep 02', org: 'Jarrow Formulas' }
];
