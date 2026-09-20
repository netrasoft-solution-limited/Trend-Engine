import { FallbackStep, IngestionRun, RelevanceGateStats } from '../types';

/**
 * GLOBAL (L1–L2). Acquisition is tenant-agnostic: one podcast episode collected
 * here can support every client in the vertical. This is the economic engine —
 * Arch driver #4, and the reason the L2/L5 boundary exists.
 */

export const ingestionRuns: IngestionRun[] = [
  {
    id: 'RUN-8841',
    sourceId: 'SRC-011',
    sourceName: 'Huberman Lab (RSS)',
    connector: 'Taddy Podcast API',
    startedAt: 'Today 09:40',
    duration: '3 m 12 s',
    state: 'succeeded',
    discovered: 3,
    metadataFetched: 3,
    relevancePassed: 2,
    transcriptsAcquired: 2,
    deadLettered: 0,
    cost: 1.8,
    idempotencyKey: 'SRC-011 · ep-2291 · sha256:4f1c…a07e',
    errorClass: 'none',
    note: 'Publisher transcript available — no paid transcription needed.'
  },
  {
    id: 'RUN-8840',
    sourceId: 'SRC-021',
    sourceName: 'Examine / clinician YouTube set',
    connector: 'Apify YouTube scraper',
    startedAt: 'Today 09:12',
    duration: '11 m 48 s',
    state: 'partial',
    discovered: 14,
    metadataFetched: 14,
    relevancePassed: 6,
    transcriptsAcquired: 4,
    deadLettered: 2,
    cost: 7.4,
    idempotencyKey: 'SRC-021 · yt-9KfR2 · sha256:9b22…31dd',
    errorClass: 'schema',
    note: 'Two items had captions disabled and were stored metadata-only. Shown honestly as such, never as understood content.'
  },
  {
    id: 'RUN-8839',
    sourceId: 'SRC-027',
    sourceName: 'PubMed / PMC — supplement MeSH set',
    connector: 'NCBI E-utilities',
    startedAt: 'Today 07:30',
    duration: '1 m 04 s',
    state: 'succeeded',
    discovered: 22,
    metadataFetched: 22,
    relevancePassed: 5,
    transcriptsAcquired: 0,
    deadLettered: 0,
    cost: 0,
    idempotencyKey: 'SRC-027 · pmid-40218877 · sha256:c0a5…7e14',
    errorClass: 'none',
    note: 'Abstract-level only. An abstract is not a full clinical assessment.'
  },
  {
    id: 'RUN-8838',
    sourceId: 'SRC-044',
    sourceName: 'Allowlist web crawler',
    connector: 'Apify web crawler',
    startedAt: 'Today 04:02',
    duration: '0 m 00 s',
    state: 'rejected',
    discovered: 0,
    metadataFetched: 0,
    relevancePassed: 0,
    transcriptsAcquired: 0,
    deadLettered: 0,
    cost: 0,
    idempotencyKey: '—',
    errorClass: 'policy',
    note:
      'Rejected before it started: two newly added domains have no applied policy version. Policy errors block the connector rather than retry — retrying an access violation is futile and a compliance risk.'
  },
  {
    id: 'RUN-8837',
    sourceId: 'SRC-014',
    sourceName: 'The Drive (Peter Attia)',
    connector: 'Taddy Podcast API',
    startedAt: 'Yesterday 22:15',
    duration: '18 m 31 s',
    state: 'succeeded',
    discovered: 2,
    metadataFetched: 2,
    relevancePassed: 1,
    transcriptsAcquired: 1,
    deadLettered: 0,
    cost: 4.9,
    idempotencyKey: 'SRC-014 · ep-0318 · sha256:7d90…b4c2',
    errorClass: 'none',
    note: 'Fell through to AssemblyAI — no publisher transcript for this episode.'
  },
  {
    id: 'RUN-8836',
    sourceId: 'SRC-052',
    sourceName: 'AssemblyAI — transcription queue',
    connector: 'AssemblyAI',
    startedAt: 'Yesterday 21:40',
    duration: '6 m 02 s',
    state: 'failed',
    discovered: 1,
    metadataFetched: 1,
    relevancePassed: 1,
    transcriptsAcquired: 0,
    deadLettered: 1,
    cost: 0.4,
    idempotencyKey: 'SRC-052 · audio-4417 · sha256:1ae8…09f3',
    errorClass: 'network',
    note: 'Audio fetch returned 403 after a CDN redirect. Network class — eligible for exponential backoff with jitter.'
  }
];

/**
 * Arch §6.2: "the cheap metadata-only relevance check before full transcription
 * is what makes the cost model work". It is an architectural component, not an
 * optimization — which is why it gets a panel of its own.
 */
export const relevanceGate: RelevanceGateStats = {
  window: 'Rolling 30 days',
  discovered: 65,
  passed: 26,
  rejected: 39,
  sampled: 2,
  sampledRecovered: 1,
  rejectionReasons: [
    { reason: 'Off-taxonomy topic (no domain entity matched)', count: 17 },
    { reason: 'Interview format with no product or ingredient discussion', count: 9 },
    { reason: 'Rerun or compilation of previously processed material', count: 7 },
    { reason: 'Primarily sponsored segment', count: 4 },
    { reason: 'Non-English, outside configured languages', count: 2 }
  ]
};

/** Arch §6.2: the sample is the guard against the filter calcifying around what we already know. */
export const samplingNote =
  '~5% of rejected items are put through full processing anyway. One of the two sampled this window turned out to be relevant — a fermented-foods episode whose vocabulary the current taxonomy does not yet cover. That item is now in the resolution queue as an alias candidate. Without this sample, the filter quietly narrows to the topics it already recognises.';

/** Arch §7.2: chains are declarative data, not branching code. Each step records whether it was the one that succeeded. */
export const fallbackLadder: FallbackStep[] = [
  { route: 'Podcast', step: 'publisher_transcript', outcome: 'succeeded', items: 14, note: 'Free. Always attempted first.' },
  { route: 'Podcast', step: 'taddy', outcome: 'succeeded', items: 8, note: 'Within the Pro allowance (26 of 100 this month).' },
  { route: 'Podcast', step: 'assemblyai', outcome: 'succeeded', items: 3, note: 'Paid per audio minute — the expensive rung.' },
  { route: 'Podcast', step: 'manual', outcome: 'not attempted', items: 0, note: 'Operator upload. Available but unused this window.' },
  { route: 'Podcast', step: 'metadata_only', outcome: 'fell through', items: 1, note: 'Surfaced honestly as metadata-only.' },
  { route: 'YouTube', step: 'creator_captions', outcome: 'succeeded', items: 19, note: 'Preferred route — canonical and free.' },
  { route: 'YouTube', step: 'apify_subtitles', outcome: 'succeeded', items: 6, note: 'Pinned Actor build.' },
  { route: 'YouTube', step: 'supadata', outcome: 'not attempted', items: 0, note: 'Configured but not reached this window.' },
  { route: 'YouTube', step: 'manual', outcome: 'not attempted', items: 0, note: '' },
  { route: 'YouTube', step: 'metadata_only', outcome: 'fell through', items: 2, note: 'Captions disabled by the creator.' }
];
