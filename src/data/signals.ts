import { ScoreComponent, Signal } from '../types';

/**
 * TENANT-SCOPED (L5). Every score here belongs to exactly one client profile
 * version and one domain pack version — see `provenance` on each signal.
 *
 * Weights are fixed by PRD §6.3 and must sum to 1.00. They are exported so the
 * UI can assert against them rather than restating them in prose.
 */
export const DOMAIN_WEIGHTS = {
  Momentum: 0.25,
  Acceleration: 0.2,
  'Source diversity': 0.15,
  'Evidence quality': 0.15,
  Engagement: 0.1,
  Novelty: 0.1,
  Recency: 0.05
} as const;

/** PRD §6.3: client rank = 60% domain signal + 20% asset relevance + 10% audience fit + 10% strategic priority. */
export const CLIENT_WEIGHTS = {
  'Domain signal': 0.6,
  'Asset / offer relevance': 0.2,
  'Audience fit': 0.1,
  'Strategic priority': 0.1
} as const;

/** Arch §8.1: three axes, deliberately never collapsed into one number. */
export const SCORE_AXES = [
  {
    key: 'domain' as const,
    label: 'Domain signal',
    question: 'Is this moving in the category?',
    scope: 'Shared by all tenants — computed once per domain pack'
  },
  {
    key: 'client' as const,
    label: 'Client rank',
    question: 'Does this matter to this client?',
    scope: 'Tenant-scoped — recomputed per client profile version'
  },
  {
    key: 'confidence' as const,
    label: 'Confidence',
    question: 'How much should we trust this?',
    scope: 'Tracked separately from importance, on purpose'
  }
];

export const weightedTotal = (components: ScoreComponent[]): number =>
  Math.round(components.reduce((sum, c) => sum + c.value * c.weight, 0));

export const digest = {
  newCandidates: 12,
  reviewReady: 4,
  researchAlerts: 1,
  blockingFailures: 0,
  window: 'Sep 13 – Sep 20, 2026'
};

export const signals: Signal[] = [
  {
    id: 'SIG-2041',
    title: 'Creatine reframed as a cognition / healthy-aging supplement',
    detail:
      'Long-form podcast hosts and clinical YouTube channels are moving creatine out of the sports-performance lane and into cognition, mood and healthy-aging conversations, largely for women over 40.',
    state: 'candidate',
    domainScore: 82,
    clientFit: 82,
    confidence: 74,
    suggestedAction: 'approve deep dive',
    firstSeen: '11 days ago',
    routes: ['Podcasts', 'YouTube', 'Research'],
    breakdown: [
      { label: 'Momentum', value: 91, weight: 0.25, note: '38 qualifying mentions in 14 days vs 11 in prior 14' },
      { label: 'Acceleration', value: 84, weight: 0.2, note: 'Week-over-week mention growth +46%, second consecutive rise' },
      { label: 'Source diversity', value: 79, weight: 0.15, note: '6 distinct shows, 4 channels, 2 journals — no single dominant source' },
      { label: 'Evidence quality', value: 71, weight: 0.15, note: '2 RCTs (small n), 1 meta-analysis, remainder practitioner commentary' },
      { label: 'Engagement', value: 88, weight: 0.1, note: 'Median 2.4x channel-normal comment volume on covering episodes' },
      { label: 'Novelty', value: 66, weight: 0.1, note: 'Topic is known; the audience reframing is what is new' },
      { label: 'Recency', value: 94, weight: 0.05, note: 'Most recent qualifying evidence span: 2 days ago' }
    ],
    clientBreakdown: [
      { label: 'Domain signal', value: 82, weight: 0.6, note: 'Category-level score, shared across tenants' },
      { label: 'Asset / offer relevance', value: 88, weight: 0.2, note: 'Creatine Monohydrate Powder in catalogue; adjacent cognition SKUs give a cross-sell path' },
      { label: 'Audience fit', value: 94, weight: 0.1, note: 'Women 40+ healthy aging is Jarrow’s primary, highest-LTV audience' },
      { label: 'Strategic priority', value: 55, weight: 0.1, note: 'Sports & recovery is a Tier 3 category — the cognition framing is what raises it' }
    ],
    provenance: {
      modelVersion: 'extract-v4.2',
      promptVersion: 'signal-scoring/2026-08-30',
      domainPackVersion: 'supplements@3.4.0',
      clientProfileVersion: 'jarrow@2026-09-16',
      baseline: '28-day trailing category mean, creatine cluster',
      sourceCount: 12,
      creatorCount: 10
    },
    evidence: [
      {
        route: 'Podcasts',
        samples: 14,
        pattern: 'Hosts describe creatine as a "brain supplement first" when speaking to peri/post-menopausal listeners.',
        caveat: 'Commentary is not clinical evidence — 9 of 14 spans cite no study.'
      },
      {
        route: 'YouTube',
        samples: 11,
        pattern: 'Clinician channels publish dosing explainers (5g daily, no loading phase) aimed at women 40+.',
        caveat: 'Transcript coverage is 82%; 2 items are metadata-only.'
      },
      {
        route: 'Research',
        samples: 3,
        pattern: 'Two small RCTs report working-memory improvement under sleep deprivation; one meta-analysis is inconclusive.',
        caveat: 'Abstract-level extraction only. No full-text scientific assessment yet.'
      },
      {
        route: 'Social',
        samples: 0,
        pattern: 'No data — gated connectors are post-MVP and not active.',
        caveat: 'Absence of social evidence is not evidence of absence.'
      }
    ],
    clientConnection:
      'Jarrow carries Creatine Monohydrate Powder (SKU 1 of 1 in category) with no cognition-oriented positioning, education, or bundle. Adjacent portfolio: Citicoline (Cognizin), Neuro Optimizer, MagMind — all already positioned around cognition, giving a credible internal narrative and cross-sell path.',
    contradictions: [
      'The strongest cognition findings come from sleep-deprived or vegetarian populations and may not generalize to Jarrow’s buyer base.',
      'One covering podcast host overstates effect size relative to the cited meta-analysis; do not mirror that framing.',
      'Category is price-commoditized — a cognition claim without a differentiated form could invite competitor undercutting.'
    ],
    claimsFlags: ['Product claim', 'Research extrapolation']
  },
  {
    id: 'SIG-2038',
    title: 'Magnesium form comparison (glycinate vs. threonate) dominating sleep talk',
    detail:
      'Sleep-focused content is shifting from "take magnesium" to explicit form-vs-form comparisons, with buyers asking which form to pick.',
    state: 'in review',
    domainScore: 74,
    clientFit: 82,
    confidence: 69,
    suggestedAction: 'approve deep dive',
    firstSeen: '8 days ago',
    routes: ['Podcasts', 'YouTube', 'Web'],
    breakdown: [
      { label: 'Momentum', value: 78, weight: 0.25, note: '26 qualifying mentions in 14 days' },
      { label: 'Acceleration', value: 72, weight: 0.2, note: '+21% week over week' },
      { label: 'Source diversity', value: 86, weight: 0.15, note: '9 distinct sources across three routes' },
      { label: 'Evidence quality', value: 58, weight: 0.15, note: 'Mostly practitioner opinion; comparative trial data is thin' },
      { label: 'Engagement', value: 83, weight: 0.1, note: 'High comment-question density ("which form should I buy")' },
      { label: 'Novelty', value: 54, weight: 0.1, note: 'Recurring seasonal theme, not a new topic' },
      { label: 'Recency', value: 90, weight: 0.05, note: 'Latest span: 3 days ago' }
    ],
    clientBreakdown: [
      { label: 'Domain signal', value: 74, weight: 0.6, note: 'Category-level score, shared across tenants' },
      { label: 'Asset / offer relevance', value: 96, weight: 0.2, note: 'MagMind and Magnesium Optimizer sit on opposite sides of exactly this comparison' },
      { label: 'Audience fit', value: 92, weight: 0.1, note: 'Sleep and cognition framing lands on the primary 40+ audience' },
      { label: 'Strategic priority', value: 95, weight: 0.1, note: 'Magnesium is a Tier 1 category' }
    ],
    provenance: {
      modelVersion: 'extract-v4.2',
      promptVersion: 'signal-scoring/2026-08-30',
      domainPackVersion: 'supplements@3.4.0',
      clientProfileVersion: 'jarrow@2026-09-16',
      baseline: '28-day trailing category mean, magnesium cluster',
      sourceCount: 9,
      creatorCount: 9
    },
    evidence: [
      {
        route: 'Podcasts',
        samples: 9,
        pattern: 'Hosts field listener questions asking which magnesium form to buy, and answer inconsistently.',
        caveat: 'Conflicting advice across shows — do not present a consensus that does not exist.'
      },
      {
        route: 'YouTube',
        samples: 12,
        pattern: 'Explainer videos rank forms by bioavailability; threonate framed as premium.',
        caveat: 'Several creators have affiliate relationships with competing brands.'
      },
      {
        route: 'Web',
        samples: 5,
        pattern: 'Retail comparison articles and forum threads centered on form selection.',
        caveat: 'Rights basis for two domains is link-and-quote only.'
      }
    ],
    clientConnection:
      'Direct hit on Jarrow’s magnesium shelf: MagMind (magnesium L-threonate) and Magnesium Optimizer sit on opposite sides of exactly the comparison buyers are making. This is an education-gap opportunity, not a new-product opportunity.',
    contradictions: [
      'No head-to-head trial supports a ranked "best form" narrative for sleep.',
      'Positioning one Jarrow SKU above another risks cannibalizing the cheaper line.'
    ],
    claimsFlags: ['Comparative language', 'Product claim']
  },
  {
    id: 'SIG-2035',
    title: 'Fermented / postbiotic framing replacing "probiotic CFU count" talk',
    detail:
      'Gut-health conversation is drifting from CFU-count marketing toward postbiotic and fermented-food framing.',
    state: 'watching',
    domainScore: 63,
    clientFit: 73,
    confidence: 55,
    suggestedAction: 'watch',
    firstSeen: '19 days ago',
    routes: ['Podcasts', 'Research'],
    breakdown: [
      { label: 'Momentum', value: 61, weight: 0.25, note: '17 qualifying mentions in 14 days' },
      { label: 'Acceleration', value: 44, weight: 0.2, note: 'Flat week over week' },
      { label: 'Source diversity', value: 72, weight: 0.15, note: '5 sources, 2 routes' },
      { label: 'Evidence quality', value: 74, weight: 0.15, note: 'Reasonable trial base, mostly non-US populations' },
      { label: 'Engagement', value: 52, weight: 0.1, note: 'Below channel-normal engagement' },
      { label: 'Novelty', value: 81, weight: 0.1, note: 'Terminology is new to the mainstream buyer' },
      { label: 'Recency', value: 70, weight: 0.05, note: 'Latest span: 6 days ago' }
    ],
    clientBreakdown: [
      { label: 'Domain signal', value: 63, weight: 0.6, note: 'Category-level score, shared across tenants' },
      { label: 'Asset / offer relevance', value: 90, weight: 0.2, note: 'Jarro-Dophilus family, S. boulardii, Fem-Dophilus — 14 SKUs exposed' },
      { label: 'Audience fit', value: 78, weight: 0.1, note: 'Gut-health first-timers are a secondary audience' },
      { label: 'Strategic priority', value: 92, weight: 0.1, note: 'Probiotics is Jarrow’s largest Tier 1 category' }
    ],
    provenance: {
      modelVersion: 'extract-v4.2',
      promptVersion: 'signal-scoring/2026-08-30',
      domainPackVersion: 'supplements@3.4.0',
      clientProfileVersion: 'jarrow@2026-09-16',
      baseline: '28-day trailing category mean, gut-health cluster',
      sourceCount: 5,
      creatorCount: 5
    },
    evidence: [
      {
        route: 'Podcasts',
        samples: 11,
        pattern: 'Hosts describe CFU counts as a marketing artifact and point to metabolites instead.',
        caveat: 'Commentary is not clinical evidence.'
      },
      {
        route: 'Research',
        samples: 6,
        pattern: 'Postbiotic trials on metabolic and immune endpoints; heterogeneous interventions.',
        caveat: 'Definitions of "postbiotic" are inconsistent between papers.'
      }
    ],
    clientConnection:
      'Touches Jarrow’s largest category — Jarro-Dophilus family, Saccharomyces boulardii, Fem-Dophilus. Current packaging leads with CFU counts, which this trend actively devalues. Watch rather than act: a reposition here is expensive.',
    contradictions: [
      'Momentum has not accelerated for two consecutive windows — may be a vocabulary shift, not a demand shift.',
      'Devaluing CFU counts undercuts existing Jarrow packaging claims already in market.'
    ],
    claimsFlags: ['Product claim']
  },
  {
    id: 'SIG-2032',
    title: 'Berberine "nature\'s Ozempic" framing resurging with a safety backlash',
    detail:
      'Renewed berberine interest paired with a visible practitioner backlash on interaction and liver-safety grounds.',
    state: 'candidate',
    domainScore: 74,
    clientFit: 55,
    confidence: 81,
    suggestedAction: 'validate',
    firstSeen: '6 days ago',
    routes: ['YouTube', 'Web', 'Research'],
    breakdown: [
      { label: 'Momentum', value: 84, weight: 0.25, note: '31 qualifying mentions in 14 days' },
      { label: 'Acceleration', value: 79, weight: 0.2, note: '+33% week over week' },
      { label: 'Source diversity', value: 68, weight: 0.15, note: 'Concentrated in 3 large channels' },
      { label: 'Evidence quality', value: 62, weight: 0.15, note: 'Trial data exists but is older and small-n' },
      { label: 'Engagement', value: 92, weight: 0.1, note: 'Very high — driven by the backlash, not the endorsement' },
      { label: 'Novelty', value: 38, weight: 0.1, note: 'Recycled 2023 narrative' },
      { label: 'Recency', value: 96, weight: 0.05, note: 'Latest span: 1 day ago' }
    ],
    clientBreakdown: [
      { label: 'Domain signal', value: 74, weight: 0.6, note: 'Category-level score, shared across tenants' },
      { label: 'Asset / offer relevance', value: 12, weight: 0.2, note: 'No berberine SKU in the Jarrow catalogue' },
      { label: 'Audience fit', value: 45, weight: 0.1, note: 'Weight-management framing sits outside the primary audiences' },
      { label: 'Strategic priority', value: 40, weight: 0.1, note: 'Defensive education value only — not a priority category' }
    ],
    provenance: {
      modelVersion: 'extract-v4.2',
      promptVersion: 'signal-scoring/2026-08-30',
      domainPackVersion: 'supplements@3.4.0',
      clientProfileVersion: 'jarrow@2026-09-16',
      baseline: '28-day trailing category mean, metabolic cluster',
      sourceCount: 8,
      creatorCount: 6
    },
    evidence: [
      {
        route: 'YouTube',
        samples: 15,
        pattern: 'High-reach videos both promote and debunk the GLP-1 comparison.',
        caveat: 'Sentiment is split — treating this as positive demand would misread it.'
      },
      {
        route: 'Web',
        samples: 9,
        pattern: 'Consumer press coverage citing drug-interaction concerns.',
        caveat: 'Two domains are quote-only under their rights basis.'
      },
      {
        route: 'Research',
        samples: 4,
        pattern: 'Glycemic-endpoint trials; none support weight-loss equivalence to GLP-1 agonists.',
        caveat: 'Abstract-level only; requires scientific review before any claim language.'
      }
    ],
    clientConnection:
      'Jarrow has no berberine SKU. This is a product-opportunity or defensive-education question, not a content-brief question.',
    contradictions: [
      'The framing that is driving reach ("nature’s Ozempic") is exactly the framing Jarrow cannot legally or ethically use.',
      'Drug-interaction profile makes this a safety-review item before any consumer-facing output.'
    ],
    claimsFlags: ['Safety statement', 'Comparative language', 'Required disclaimer']
  },
  {
    id: 'SIG-2029',
    title: 'Protein target inflation (1g per lb) reaching non-athlete audiences',
    detail:
      'General-wellness audiences are adopting athlete-level protein targets, pulling attention toward convenience formats.',
    state: 'candidate',
    domainScore: 64,
    clientFit: 45,
    confidence: 66,
    suggestedAction: 'merge',
    firstSeen: '13 days ago',
    routes: ['Podcasts', 'YouTube'],
    breakdown: [
      { label: 'Momentum', value: 74, weight: 0.25, note: '23 qualifying mentions in 14 days' },
      { label: 'Acceleration', value: 58, weight: 0.2, note: '+9% week over week' },
      { label: 'Source diversity', value: 64, weight: 0.15, note: '4 shows, 3 channels' },
      { label: 'Evidence quality', value: 66, weight: 0.15, note: 'Reasonable evidence for higher intake in older adults' },
      { label: 'Engagement', value: 77, weight: 0.1, note: 'Above channel normal' },
      { label: 'Novelty', value: 31, weight: 0.1, note: 'Well-covered theme' },
      { label: 'Recency', value: 80, weight: 0.05, note: 'Latest span: 4 days ago' }
    ],
    clientBreakdown: [
      { label: 'Domain signal', value: 64, weight: 0.6, note: 'Category-level score, shared across tenants' },
      { label: 'Asset / offer relevance', value: 8, weight: 0.2, note: 'Jarrow is not a protein-powder brand — nothing to point at' },
      { label: 'Audience fit', value: 30, weight: 0.1, note: 'Performance / recovery is a tertiary audience, explicitly not to be over-indexed' },
      { label: 'Strategic priority', value: 20, weight: 0.1, note: 'Spends a content slot on a category Jarrow does not serve' }
    ],
    provenance: {
      modelVersion: 'extract-v4.2',
      promptVersion: 'signal-scoring/2026-08-30',
      domainPackVersion: 'supplements@3.4.0',
      clientProfileVersion: 'jarrow@2026-09-16',
      baseline: '28-day trailing category mean, protein cluster',
      sourceCount: 7,
      creatorCount: 7
    },
    evidence: [
      {
        route: 'Podcasts',
        samples: 13,
        pattern: 'Hosts recommend 1g/lb bodyweight to general audiences without qualifying activity level.',
        caveat: 'Advice exceeds most cited guidelines; do not restate uncritically.'
      },
      {
        route: 'YouTube',
        samples: 10,
        pattern: 'Meal-prep and convenience-format content attached to the target.',
        caveat: 'Creator incentives skew toward protein-product sponsorship.'
      }
    ],
    clientConnection:
      'Weak fit — Jarrow is not a protein-powder brand. Candidate should likely merge into SIG-2041 (healthy-aging / sarcopenia narrative) rather than stand alone.',
    contradictions: [
      'Duplicate territory with an existing approved signal.',
      'Low portfolio relevance; pursuing it spends a content slot on a category Jarrow does not serve.'
    ],
    claimsFlags: []
  },
  {
    id: 'SIG-2026',
    title: 'Vitamin D + K2 co-dosing questions spiking in Q4 immunity content',
    detail:
      'Seasonal immunity content is generating specific co-dosing and ratio questions rather than generic vitamin D advice.',
    state: 'candidate',
    domainScore: 61,
    clientFit: 69,
    confidence: 62,
    suggestedAction: 'watch',
    firstSeen: '4 days ago',
    routes: ['Podcasts', 'Web'],
    breakdown: [
      { label: 'Momentum', value: 62, weight: 0.25, note: '18 qualifying mentions in 14 days' },
      { label: 'Acceleration', value: 71, weight: 0.2, note: '+18% week over week, seasonally expected' },
      { label: 'Source diversity', value: 59, weight: 0.15, note: '4 sources, 2 routes' },
      { label: 'Evidence quality', value: 61, weight: 0.15, note: 'Established literature, weak on optimal ratio' },
      { label: 'Engagement', value: 58, weight: 0.1, note: 'Channel normal' },
      { label: 'Novelty', value: 27, weight: 0.1, note: 'Annual recurrence' },
      { label: 'Recency', value: 92, weight: 0.05, note: 'Latest span: 2 days ago' }
    ],
    clientBreakdown: [
      { label: 'Domain signal', value: 61, weight: 0.6, note: 'Category-level score, shared across tenants' },
      { label: 'Asset / offer relevance', value: 93, weight: 0.2, note: 'Vitamin D3 + K2 combination SKU already in market' },
      { label: 'Audience fit', value: 74, weight: 0.1, note: 'Bone and immunity framing reaches the 40+ primary audience' },
      { label: 'Strategic priority', value: 66, weight: 0.1, note: 'Vitamins & minerals is a Tier 2 category' }
    ],
    provenance: {
      modelVersion: 'extract-v4.2',
      promptVersion: 'signal-scoring/2026-08-30',
      domainPackVersion: 'supplements@3.4.0',
      clientProfileVersion: 'jarrow@2026-09-16',
      baseline: '28-day trailing category mean, micronutrient cluster',
      sourceCount: 4,
      creatorCount: 4
    },
    evidence: [
      {
        route: 'Podcasts',
        samples: 10,
        pattern: 'Listener questions about taking D3 and K2 together and in what ratio.',
        caveat: 'Commentary is not clinical evidence.'
      },
      {
        route: 'Web',
        samples: 8,
        pattern: 'Retail FAQ and forum content repeating the ratio question.',
        caveat: 'Low-authority sources dominate this route.'
      }
    ],
    clientConnection:
      'Jarrow already sells a D3 + K2 combination SKU. This is a straightforward seasonal education opportunity with an existing product to point at.',
    contradictions: [
      'Seasonally recurring — momentum may be calendar-driven rather than a genuine trend.',
      'Optimal-ratio evidence is weak; avoid a precise-sounding recommendation.'
    ],
    claimsFlags: ['Product claim', 'Required disclaimer']
  }
];

export const sourceHealthSnapshot = [
  { route: 'Podcast RSS (Taddy)', state: 'active' as const, lastSuccess: '18 min ago', note: 'Nominal' },
  { route: 'YouTube + Apify', state: 'active' as const, lastSuccess: '52 min ago', note: 'Two metadata-only episodes' },
  { route: 'PubMed / PMC', state: 'active' as const, lastSuccess: '2 h ago', note: 'Nominal' },
  { route: 'Web crawl (allowlist)', state: 'validating' as const, lastSuccess: '6 h ago', note: 'Two new domains awaiting policy version' },
  { route: 'AssemblyAI transcription', state: 'active' as const, lastSuccess: '24 min ago', note: 'Queue depth 3' },
  { route: 'Social connectors', state: 'gated' as const, lastSuccess: '—', note: 'Post-MVP — no access basis recorded' }
];
