import { Source } from '../types';

/**
 * GLOBAL (L1). Sources are tenant-agnostic — one registry serves every client
 * in the vertical.
 *
 * Two rules from the architecture are encoded in this data rather than left to
 * operator discipline:
 *
 *   · No connector runs without a recorded provider policy and access basis
 *     (PRD §7.2, Arch §7.1). "No policy, no run."
 *   · A source in `gated` state cannot reach `active` without an approved
 *     access basis (Arch §12). `accessBasis: null` is what blocks it.
 */

export const sources: Source[] = [
  {
    id: 'SRC-011',
    name: 'Huberman Lab (RSS)',
    type: 'podcast',
    state: 'active',
    lastSuccess: '18 min ago',
    policy: 'RSS public feed · v2.1',
    monthlyCost: 42.1,
    note: 'Full transcript coverage',
    connector: 'Taddy Podcast API',
    inputs: 'feed: hubermanlab.com/feed',
    runCap: 5,
    monthCap: 60,
    retry: 'exp. backoff ×3',
    capabilities: ['DISCOVERY', 'METADATA', 'TRANSCRIPT'],
    fallbackChain: ['publisher_transcript', 'taddy', 'assemblyai', 'manual', 'metadata_only'],
    accessBasis: 'Public RSS enclosure, publisher-provided transcript'
  },
  {
    id: 'SRC-014',
    name: 'The Drive (Peter Attia)',
    type: 'podcast',
    state: 'active',
    lastSuccess: '41 min ago',
    policy: 'RSS public feed · v2.1',
    monthlyCost: 38.4,
    note: 'Paywalled segments excluded',
    connector: 'Taddy Podcast API',
    inputs: 'feed: peterattiamd.com/podcast/feed',
    runCap: 5,
    monthCap: 60,
    retry: 'exp. backoff ×3',
    capabilities: ['DISCOVERY', 'METADATA', 'TRANSCRIPT'],
    fallbackChain: ['publisher_transcript', 'taddy', 'assemblyai', 'manual', 'metadata_only'],
    accessBasis: 'Public RSS enclosure; paywalled member segments excluded by policy'
  },
  {
    id: 'SRC-021',
    name: 'Examine / clinician YouTube set',
    type: 'youtube',
    state: 'active',
    lastSuccess: '52 min ago',
    policy: 'Metadata + transcript, fair use · v1.4',
    monthlyCost: 96.8,
    note: 'Two metadata-only items last run',
    connector: 'Apify YouTube scraper',
    inputs: '9 channel IDs · 4 saved queries',
    runCap: 12,
    monthCap: 140,
    retry: 'exp. backoff ×2',
    capabilities: ['DISCOVERY', 'METADATA', 'TRANSCRIPT', 'ENGAGEMENT', 'COMMENTS'],
    fallbackChain: ['creator_captions', 'apify_subtitles', 'supadata', 'manual', 'metadata_only'],
    accessBasis: 'YouTube Data API for canonical metadata; pinned Apify Actor build for subtitles'
  },
  {
    id: 'SRC-027',
    name: 'PubMed / PMC — supplement MeSH set',
    type: 'research',
    state: 'active',
    lastSuccess: '2 h ago',
    policy: 'NLM E-utilities terms · v3.0',
    monthlyCost: 0,
    note: 'Abstract-level only; no full text',
    connector: 'NCBI E-utilities',
    inputs: '14 MeSH queries · daily delta',
    runCap: 0,
    monthCap: 0,
    retry: 'linear ×5',
    capabilities: ['DISCOVERY', 'METADATA'],
    fallbackChain: ['ncbi_eutils', 'crossref', 'manual'],
    accessBasis: 'NLM E-utilities terms of service; eligible PMC content only'
  },
  {
    id: 'SRC-031',
    name: 'ClinicalTrials.gov — nutraceutical filter',
    type: 'research',
    state: 'active',
    lastSuccess: '3 h ago',
    policy: 'Public API · v3.0',
    monthlyCost: 0,
    note: 'Nominal',
    connector: 'CTG API v2',
    inputs: 'condition + intervention filters',
    runCap: 0,
    monthCap: 0,
    retry: 'linear ×5',
    capabilities: ['DISCOVERY', 'METADATA', 'DELETION_POLL'],
    fallbackChain: ['ctg_api', 'manual'],
    accessBasis: 'Public US government API, no restriction on derived analysis'
  },
  {
    id: 'SRC-038',
    name: 'Retail & trade press allowlist',
    type: 'web',
    state: 'validating',
    lastSuccess: '6 h ago',
    policy: 'Link + short quote only · pending v1.6',
    monthlyCost: 11.2,
    note: 'Two new domains awaiting policy sign-off',
    connector: 'Allowlist crawler',
    inputs: '23 domains · robots respected',
    runCap: 2,
    monthCap: 30,
    retry: 'exp. backoff ×2',
    capabilities: ['DISCOVERY', 'METADATA'],
    fallbackChain: ['allowlist_crawler', 'manual', 'metadata_only'],
    accessBasis: 'Link-and-quote basis on 21 of 23 domains; 2 pending v1.6 sign-off'
  },
  {
    id: 'SRC-044',
    name: 'Competitor brand blogs',
    type: 'web',
    state: 'paused',
    lastSuccess: '9 days ago',
    policy: 'Link + short quote only · v1.5',
    monthlyCost: 0,
    note: 'Paused by operator — low signal yield',
    connector: 'Allowlist crawler',
    inputs: '7 domains',
    runCap: 2,
    monthCap: 20,
    retry: 'exp. backoff ×2',
    capabilities: ['DISCOVERY', 'METADATA'],
    fallbackChain: ['allowlist_crawler', 'manual', 'metadata_only'],
    accessBasis: 'Link-and-quote basis, publicly accessible pages only'
  },
  {
    id: 'SRC-051',
    name: 'Reddit — r/supplements, r/nutrition',
    type: 'social',
    state: 'gated',
    lastSuccess: '—',
    policy: 'Rights basis unresolved',
    monthlyCost: 0,
    note: 'Requires a commercial agreement or a licensed listening provider. No unofficial production scraper, ever.',
    connector: '—',
    inputs: '—',
    runCap: 0,
    monthCap: 0,
    retry: '—',
    capabilities: [],
    fallbackChain: ['manual'],
    accessBasis: null
  },
  {
    id: 'SRC-052',
    name: 'TikTok — creator watchlist',
    type: 'social',
    state: 'gated',
    lastSuccess: '—',
    policy: 'Rights basis unresolved',
    monthlyCost: 0,
    note: 'Post-MVP pilot via a maintained Apify Actor. Needs its own access basis, cost line and approval.',
    connector: '—',
    inputs: '—',
    runCap: 0,
    monthCap: 0,
    retry: '—',
    capabilities: [],
    fallbackChain: ['manual'],
    accessBasis: null
  },
  {
    id: 'SRC-053',
    name: 'Instagram — practitioner accounts',
    type: 'social',
    state: 'gated',
    lastSuccess: '—',
    policy: 'Rights basis unresolved',
    monthlyCost: 0,
    note: 'Post-MVP pilot via a maintained or verified Apify Actor.',
    connector: '—',
    inputs: '—',
    runCap: 0,
    monthCap: 0,
    retry: '—',
    capabilities: [],
    fallbackChain: ['manual'],
    accessBasis: null
  },
  {
    id: 'SRC-054',
    name: 'X / Twitter — health commentary list',
    type: 'social',
    state: 'blocked',
    lastSuccess: '—',
    policy: 'API tier unavailable',
    monthlyCost: 0,
    note: 'Blocked — official API tier not subscribed and no monthly cap approved.',
    connector: '—',
    inputs: '—',
    runCap: 0,
    monthCap: 0,
    retry: '—',
    capabilities: [],
    fallbackChain: ['manual'],
    accessBasis: null
  },
  {
    id: 'SRC-057',
    name: 'Nutrition trade newsletters',
    type: 'web',
    state: 'draft',
    lastSuccess: '—',
    policy: 'Not set',
    monthlyCost: 0,
    note: 'Config incomplete — never run',
    connector: 'Email ingest',
    inputs: '—',
    runCap: 1,
    monthCap: 10,
    retry: 'linear ×3',
    capabilities: ['DISCOVERY', 'METADATA'],
    fallbackChain: ['email_ingest', 'manual'],
    accessBasis: null
  }
];

/** Arch §7.1: what each flag lets a connector claim about the evidence it produces. */
export const CAPABILITY_NOTES: Record<string, string> = {
  DISCOVERY: 'Can find new items on its own',
  METADATA: 'Can fetch titles, descriptions, show notes',
  TRANSCRIPT: 'Can supply full text — without this, items stay metadata-only',
  ENGAGEMENT: 'Can report legitimate platform metrics',
  COMMENTS: 'Can retrieve audience comments',
  DELETION_POLL: 'Can detect upstream deletions and honour tombstones'
};

/** Arch §12 + PRD §7.2. A gated source cannot be activated until each of these is recorded. */
export const activationRequirements = [
  'A recorded provider policy version',
  'An approved access basis naming the legal route to the data',
  'A per-run maximum charge and a monthly hard cap',
  'A schema smoke test against the pinned Actor or API version',
  'A retention and deletion rule for anything stored'
];
