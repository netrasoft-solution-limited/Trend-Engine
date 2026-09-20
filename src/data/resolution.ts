import { ResolutionItem } from '../types';

/**
 * GLOBAL (L2). Pre-scoring normalization — PRD §6.3.
 *
 * Everything resolved here happens BEFORE any tenant sees a score, because these
 * corrections change the score itself: a syndicated episode counted three times
 * inflates momentum, and one prolific creator counted unchecked manufactures
 * source diversity that is not there.
 */

export const resolutionQueue: ResolutionItem[] = [
  {
    id: 'RES-320',
    kind: 'syndication',
    title: 'Same episode ingested from three feeds',
    detail:
      'One interview was published to the host feed, a network feed and a YouTube upload. Counted separately it reads as three independent confirmations of the creatine cognition framing.',
    members: ['podcast:hubermanlab/ep-2291', 'podcast:scicomm-network/ep-884', 'youtube:UC9x…/v-7Kd2'],
    suggested: 'Merge into one content item, retain all three canonical URLs',
    effect: 'Source diversity on SIG-2041 drops 79 → 74; momentum drops 91 → 86',
    confidence: 96
  },
  {
    id: 'RES-318',
    kind: 'alias',
    title: '"Creatine monohydrate" vs "creatine" vs "CrM"',
    detail:
      'Three surface forms resolving to one entity. Left unnormalized, mention counts split across variants and the cluster fragments.',
    members: ['creatine monohydrate', 'creatine', 'CrM'],
    suggested: 'Normalize to entity ENT-0441 (creatine monohydrate)',
    effect: 'Consolidates 38 spans that currently sit in two clusters',
    confidence: 99
  },
  {
    id: 'RES-317',
    kind: 'alias',
    title: 'New vocabulary from a sampled rejection — "fermentate"',
    detail:
      'Surfaced by the ~5% rejection sample on RUN-8836. The term is not in the current domain pack taxonomy, which is exactly the blind spot the sampling exists to catch.',
    members: ['fermentate', 'postbiotic', 'paraprobiotic'],
    suggested: 'Add as an alias of postbiotic and propose a domain-pack taxonomy update',
    effect: 'Would raise SIG-2035 novelty; requires a domain-pack version bump',
    confidence: 71
  },
  {
    id: 'RES-315',
    kind: 'creator cap',
    title: 'One creator accounts for 6 of 15 berberine spans',
    detail:
      'A single high-output channel is driving 40% of the evidence behind SIG-2032. Uncapped, one person reads as a category-wide movement.',
    members: ['youtube:UC4m…/channel', '6 videos in 14 days'],
    suggested: 'Apply the repeated-creator cap — count as 2 weighted spans, not 6',
    effect: 'Source diversity on SIG-2032 drops 68 → 55; confidence drops 81 → 72',
    confidence: 88
  },
  {
    id: 'RES-312',
    kind: 'sponsored',
    title: 'Sponsored segment inside an otherwise organic episode',
    detail:
      'A competitor-sponsored read sits inside an episode that also discusses magnesium organically. Treating the whole episode as organic evidence overstates genuine interest.',
    members: ['podcast:sleep-lab/ep-0177 · 12:40–14:05'],
    suggested: 'Mark the segment sponsored; retain the organic remainder',
    effect: 'Removes 1 span from SIG-2038; engagement unchanged',
    confidence: 93
  },
  {
    id: 'RES-309',
    kind: 'metadata-only',
    title: 'Two YouTube items have no transcript',
    detail:
      'Captions are disabled and no fallback route succeeded. These items can contribute metadata signal but must never be presented as understood content.',
    members: ['youtube:UC9x…/v-3Bq8', 'youtube:UC9x…/v-3Bq9'],
    suggested: 'Retain as metadata-only, excluded from claim extraction',
    effect: 'No score change — flagged in the evidence table on SIG-2041',
    confidence: 100
  },
  {
    id: 'RES-304',
    kind: 'cross-post',
    title: 'Research record indexed from both PubMed and Crossref',
    detail: 'Same DOI arriving through two providers on the same day.',
    members: ['pmid:40218877', 'doi:10.1016/j.nutres.2026.04.011'],
    suggested: 'Merge on DOI, keep PMID as a secondary identifier',
    effect: 'Prevents double-counting in the research track on SIG-2041',
    confidence: 100
  }
];

/**
 * PRD §6.3: contradictions are retained, not discarded. They are a product of
 * the evidence, and hiding them would make the outputs read more confident than
 * the underlying material supports.
 */
export const retainedContradictions = [
  {
    signal: 'SIG-2041',
    statement: 'One covering podcast host overstates effect size relative to the cited meta-analysis.',
    disposition: 'Retained — surfaced as a guardrail in every downstream output.'
  },
  {
    signal: 'SIG-2038',
    statement: 'No head-to-head trial supports a ranked "best form" narrative for sleep.',
    disposition: 'Retained — blocks comparative claim language at the claims gate.'
  },
  {
    signal: 'SIG-2032',
    statement: 'Reach is driven by the backlash, not by demand. Sentiment is split.',
    disposition: 'Retained — the reason this signal routes to validate rather than approve.'
  },
  {
    signal: 'SIG-2035',
    statement: 'Momentum has not accelerated for two consecutive windows — possibly vocabulary, not demand.',
    disposition: 'Retained — the reason this signal is watching rather than candidate.'
  }
];

export const normalizationRules = [
  { rule: 'Deduplicate syndicated and cross-posted content', state: 'active' as const, note: '3 clusters open' },
  { rule: 'Cap repeated creator influence', state: 'active' as const, note: 'Cap: 2 weighted spans per creator per window' },
  { rule: 'Separate sponsored content where identifiable', state: 'active' as const, note: 'Segment-level, not episode-level' },
  { rule: 'Normalize aliases to domain entities', state: 'active' as const, note: '2 candidates awaiting review' },
  { rule: 'Account for source cadence', state: 'active' as const, note: 'A daily show and a monthly show are not weighted alike' },
  { rule: 'Retain contradictions', state: 'active' as const, note: 'Never discarded — 4 currently attached to live signals' }
];
