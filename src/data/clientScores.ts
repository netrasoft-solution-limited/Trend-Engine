import { ClientSignalScore } from '../types';

/**
 * TENANT-SCOPED (L5). A ClientSignalScore is the client-rank view of a shared
 * `Signal` (see `data/signals.ts`) for exactly one organisation. Every score
 * here belongs to exactly one client profile version and one domain-pack
 * version — Arch §8.2.
 *
 * `SIG-2041` carries two entries below, for `org-jarrow` and for the
 * `org-fixture-second` architecture-proof tenant, and they score differently —
 * the fixture exists to prove that one public signal is not one public score.
 */
export const CLIENT_WEIGHTS = {
  'Domain signal': 0.6,
  'Asset / offer relevance': 0.2,
  'Audience fit': 0.1,
  'Strategic priority': 0.1
} as const;

export const clientSignalScores: ClientSignalScore[] = [
  {
    signalId: 'SIG-2041',
    orgId: 'org-jarrow',
    clientFit: 82,
    clientBreakdown: [
      { label: 'Domain signal', value: 82, weight: 0.6, note: 'Category-level score, shared across tenants' },
      { label: 'Asset / offer relevance', value: 88, weight: 0.2, note: 'Creatine Monohydrate Powder in catalogue; adjacent cognition SKUs give a cross-sell path' },
      { label: 'Audience fit', value: 94, weight: 0.1, note: 'Women 40+ healthy aging is Jarrow’s primary, highest-LTV audience' },
      { label: 'Strategic priority', value: 55, weight: 0.1, note: 'Sports & recovery is a Tier 3 category — the cognition framing is what raises it' }
    ],
    clientConnection:
      'Jarrow carries Creatine Monohydrate Powder (SKU 1 of 1 in category) with no cognition-oriented positioning, education, or bundle. Adjacent portfolio: Citicoline (Cognizin), Neuro Optimizer, MagMind — all already positioned around cognition, giving a credible internal narrative and cross-sell path.',
    clientProfileVersion: 'jarrow@2026-09-16'
  },
  {
    signalId: 'SIG-2041',
    orgId: 'org-fixture-second',
    clientFit: 59,
    clientBreakdown: [
      { label: 'Domain signal', value: 82, weight: 0.6, note: 'Category-level score, shared across tenants — identical to Jarrow' },
      { label: 'Asset / offer relevance', value: 15, weight: 0.2, note: 'Fixture catalogue carries no creatine or cognition-adjacent SKU' },
      { label: 'Audience fit', value: 40, weight: 0.1, note: 'Fixture’s primary audience does not overlap the healthy-aging cognition segment' },
      { label: 'Strategic priority', value: 25, weight: 0.1, note: 'Not a priority category for this tenant' }
    ],
    clientConnection:
      'PRD §2 architecture proof. This fixture tenant’s catalogue has nothing comparable to Jarrow’s creatine line, so the same public signal registers as a category-level watch item only, not a cross-sell opportunity — this is the divergence the second-tenant fixture exists to demonstrate.',
    clientProfileVersion: 'fixture-second@2026-09-01'
  },
  {
    signalId: 'SIG-2038',
    orgId: 'org-jarrow',
    clientFit: 82,
    clientBreakdown: [
      { label: 'Domain signal', value: 74, weight: 0.6, note: 'Category-level score, shared across tenants' },
      { label: 'Asset / offer relevance', value: 96, weight: 0.2, note: 'MagMind and Magnesium Optimizer sit on opposite sides of exactly this comparison' },
      { label: 'Audience fit', value: 92, weight: 0.1, note: 'Sleep and cognition framing lands on the primary 40+ audience' },
      { label: 'Strategic priority', value: 95, weight: 0.1, note: 'Magnesium is a Tier 1 category' }
    ],
    clientConnection:
      'Direct hit on Jarrow’s magnesium shelf: MagMind (magnesium L-threonate) and Magnesium Optimizer sit on opposite sides of exactly the comparison buyers are making. This is an education-gap opportunity, not a new-product opportunity.',
    clientProfileVersion: 'jarrow@2026-09-16'
  },
  {
    signalId: 'SIG-2035',
    orgId: 'org-jarrow',
    clientFit: 73,
    clientBreakdown: [
      { label: 'Domain signal', value: 63, weight: 0.6, note: 'Category-level score, shared across tenants' },
      { label: 'Asset / offer relevance', value: 90, weight: 0.2, note: 'Jarro-Dophilus family, S. boulardii, Fem-Dophilus — 14 SKUs exposed' },
      { label: 'Audience fit', value: 78, weight: 0.1, note: 'Gut-health first-timers are a secondary audience' },
      { label: 'Strategic priority', value: 92, weight: 0.1, note: 'Probiotics is Jarrow’s largest Tier 1 category' }
    ],
    clientConnection:
      'Touches Jarrow’s largest category — Jarro-Dophilus family, Saccharomyces boulardii, Fem-Dophilus. Current packaging leads with CFU counts, which this trend actively devalues. Watch rather than act: a reposition here is expensive.',
    clientProfileVersion: 'jarrow@2026-09-16'
  },
  {
    signalId: 'SIG-2032',
    orgId: 'org-jarrow',
    clientFit: 55,
    clientBreakdown: [
      { label: 'Domain signal', value: 74, weight: 0.6, note: 'Category-level score, shared across tenants' },
      { label: 'Asset / offer relevance', value: 12, weight: 0.2, note: 'No berberine SKU in the Jarrow catalogue' },
      { label: 'Audience fit', value: 45, weight: 0.1, note: 'Weight-management framing sits outside the primary audiences' },
      { label: 'Strategic priority', value: 40, weight: 0.1, note: 'Defensive education value only — not a priority category' }
    ],
    clientConnection:
      'Jarrow has no berberine SKU. This is a product-opportunity or defensive-education question, not a content-brief question.',
    clientProfileVersion: 'jarrow@2026-09-16'
  },
  {
    signalId: 'SIG-2029',
    orgId: 'org-jarrow',
    clientFit: 45,
    clientBreakdown: [
      { label: 'Domain signal', value: 64, weight: 0.6, note: 'Category-level score, shared across tenants' },
      { label: 'Asset / offer relevance', value: 8, weight: 0.2, note: 'Jarrow is not a protein-powder brand — nothing to point at' },
      { label: 'Audience fit', value: 30, weight: 0.1, note: 'Performance / recovery is a tertiary audience, explicitly not to be over-indexed' },
      { label: 'Strategic priority', value: 20, weight: 0.1, note: 'Spends a content slot on a category Jarrow does not serve' }
    ],
    clientConnection:
      'Weak fit — Jarrow is not a protein-powder brand. Candidate should likely merge into SIG-2041 (healthy-aging / sarcopenia narrative) rather than stand alone.',
    clientProfileVersion: 'jarrow@2026-09-16'
  },
  {
    signalId: 'SIG-2026',
    orgId: 'org-jarrow',
    clientFit: 69,
    clientBreakdown: [
      { label: 'Domain signal', value: 61, weight: 0.6, note: 'Category-level score, shared across tenants' },
      { label: 'Asset / offer relevance', value: 93, weight: 0.2, note: 'Vitamin D3 + K2 combination SKU already in market' },
      { label: 'Audience fit', value: 74, weight: 0.1, note: 'Bone and immunity framing reaches the 40+ primary audience' },
      { label: 'Strategic priority', value: 66, weight: 0.1, note: 'Vitamins & minerals is a Tier 2 category' }
    ],
    clientConnection:
      'Jarrow already sells a D3 + K2 combination SKU. This is a straightforward seasonal education opportunity with an existing product to point at.',
    clientProfileVersion: 'jarrow@2026-09-16'
  }
];

export function clientScoreFor(signalId: string, orgId: string): ClientSignalScore | undefined {
  return clientSignalScores.find((c) => c.signalId === signalId && c.orgId === orgId);
}
