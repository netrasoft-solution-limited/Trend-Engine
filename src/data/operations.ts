import { AuditEntry, Connector, DeadLetterItem, QueueHealth, VendorSpend } from '../types';

/**
 * Cross-cutting. Arch §13: the Operations plane answers one question —
 * is this system trustworthy right now?
 */

export const connectors: Connector[] = [
  { source: 'Taddy — podcast RSS', lastSuccess: '18 min ago', failures: 0, coverage: 100, latency: '1.2 s', state: 'active' },
  { source: 'Apify — YouTube', lastSuccess: '52 min ago', failures: 2, coverage: 82, latency: '14.6 s', state: 'active' },
  { source: 'AssemblyAI — transcription', lastSuccess: '24 min ago', failures: 1, coverage: 94, latency: '48 s', state: 'active' },
  { source: 'NCBI E-utilities', lastSuccess: '2 h ago', failures: 0, coverage: 100, latency: '0.8 s', state: 'active' },
  { source: 'ClinicalTrials.gov', lastSuccess: '3 h ago', failures: 0, coverage: 100, latency: '1.1 s', state: 'active' },
  { source: 'Allowlist web crawler', lastSuccess: '6 h ago', failures: 4, coverage: 61, latency: '6.4 s', state: 'validating' },
  { source: 'LLM — scoring & drafting', lastSuccess: '9 min ago', failures: 0, coverage: 100, latency: '3.7 s', state: 'active' },
  { source: 'Social connectors', lastSuccess: '—', failures: 0, coverage: 0, latency: '—', state: 'gated' }
];

/**
 * Arch §11.1: three queues deliberately. Mixing them is the classic failure —
 * a batch of transcriptions starves a user-facing export.
 */
export const queues: QueueHealth[] = [
  { name: 'ingest', purpose: 'Acquisition and I/O — tolerant of slow external APIs', depth: 12, latency: '4 s', concurrency: 'high (8)', state: 'healthy' },
  { name: 'enrich', purpose: 'LLM and embeddings — rate-limit aware and cost-capped', depth: 34, latency: '2 m 40 s', concurrency: 'low (2)', state: 'backed up' },
  { name: 'default', purpose: 'Exports and email — short tasks that must never queue behind transcription', depth: 0, latency: '0.4 s', concurrency: 'medium (4)', state: 'healthy' }
];

/** Arch §13: metadata-only items are tracked, not hidden. */
export const transcriptCoverage = {
  fullTranscript: 231,
  metadataOnly: 17,
  get total() {
    return this.fullTranscript + this.metadataOnly;
  },
  get pct() {
    return Math.round((this.fullTranscript / (this.fullTranscript + this.metadataOnly)) * 100);
  },
  note: 'Metadata-only items are excluded from claim extraction and are labelled as such wherever they appear.'
};

export const vendorSpend: VendorSpend[] = [
  { vendor: 'Taddy', line: 'Podcast metadata + transcripts', spend: 80.5, cap: 120 },
  { vendor: 'Apify', line: 'YouTube extraction actors', spend: 96.8, cap: 140 },
  { vendor: 'AssemblyAI', line: 'Audio transcription minutes', spend: 172.4, cap: 200 },
  { vendor: 'LLM (scoring + drafting)', line: 'Inference tokens', spend: 318.9, cap: 350 },
  { vendor: 'Infrastructure', line: 'Hosting, storage, backups', spend: 61.0, cap: 90 }
];

/**
 * Arch §10.2: hard caps are enforced BEFORE a run starts, not reconciled after.
 * A runaway Actor or an LLM retry storm cannot silently consume a month's margin.
 */
export const circuitBreakers = [
  { threshold: 'Below 80% of monthly cap', action: 'Normal operation', tone: 'ok' as const },
  { threshold: 'At or above 80%', action: 'Operator warning raised', tone: 'warn' as const },
  { threshold: 'At or above 100% (hard cap)', action: 'Connector auto-paused, alert raised', tone: 'bad' as const },
  { threshold: 'Per-run charge above the configured maximum', action: 'Run rejected before it starts', tone: 'bad' as const }
];

export const deadLetter: DeadLetterItem[] = [
  {
    id: 'DLQ-441',
    source: 'Apify — YouTube',
    error: 'Transcript unavailable (captions disabled) — item stored metadata-only',
    attempts: 3,
    queuedAt: 'Today 09:14',
    errorClass: 'schema'
  },
  {
    id: 'DLQ-440',
    source: 'Apify — YouTube',
    error: 'Transcript unavailable (captions disabled) — item stored metadata-only',
    attempts: 3,
    queuedAt: 'Today 09:14',
    errorClass: 'schema'
  },
  {
    id: 'DLQ-437',
    source: 'Allowlist web crawler',
    error: 'robots.txt disallow on newly added domain — policy version not applied',
    attempts: 0,
    queuedAt: 'Yesterday 21:40',
    errorClass: 'policy'
  },
  {
    id: 'DLQ-433',
    source: 'AssemblyAI',
    error: 'Audio fetch 403 from CDN after redirect',
    attempts: 4,
    queuedAt: 'Sep 18 06:02',
    errorClass: 'network'
  }
];

/**
 * Arch §13: any TenantScopeError in production is a P1. Arch §5.4 makes these
 * three test classes deployment-blocking.
 */
export const tenancyStatus = {
  scopeErrorsInProduction: 0,
  lastCiRun: 'Today 06:12 · commit 4f1c9a0',
  suites: [
    { name: 'Scope leakage', detail: 'Every tenant-scoped model, every exposed route: Org A never returns Org B rows', state: 'passing' as const, count: 148 },
    { name: 'Unscoped access', detail: 'Touching a tenant model with no bound tenant raises TenantScopeError', state: 'passing' as const, count: 31 },
    { name: 'Cross-plane escalation', detail: 'A valid portal session cannot reach /ops/* or set operator scope', state: 'passing' as const, count: 22 },
    { name: 'Publication boundary', detail: 'No module under portal/ imports from outputs/ except via publication/', state: 'passing' as const, count: 1 }
  ]
};

/** Arch §13: uptime is client-visible for the first time now that the portal exists (PRD §7.7). */
export const portalHealth = {
  loginsSucceeded: 14,
  loginsFailed: 1,
  publicationEvents: 3,
  unpublishEvents: 0,
  activeSessions: 2,
  note: 'One failed login on an expired invite token. No lockouts.'
};

export const backupStatus = {
  lastBackup: 'Today 03:00 · 1.4 GB · verified checksum',
  lastRestoreTest: 'Sep 14, 2026 · full restore to staging · passed in 11 m 20 s',
  retention: '30 daily · 12 monthly',
  nextScheduled: 'Tomorrow 03:00'
};

export const auditLog: AuditEntry[] = [
  { id: 'A-9915', at: 'Today 10:51', actor: 'abubakar', kind: 'publication', message: 'Published OUT-3114 v2 → Jarrow Formulas (PUB-0042); notification sent' },
  { id: 'A-9914', at: 'Today 10:44', actor: 'm.reyes', kind: 'review', message: 'Expert sign-off recorded on OUT-3114 (scientific / legal claims)' },
  { id: 'A-9911', at: 'Today 10:42', actor: 'abubakar', kind: 'approval', message: 'Approved SIG-2038 → generated Content brief OUT-3120' },
  { id: 'A-9910', at: 'Today 10:31', actor: 'abubakar', kind: 'config', message: 'Raised Apify monthly cap 120 → 140 USD' },
  { id: 'A-9909', at: 'Today 09:58', actor: 'system', kind: 'system', message: '2 items routed to dead-letter queue (captions disabled)' },
  { id: 'A-9908', at: 'Today 08:15', actor: 'abubakar', kind: 'export', message: 'Exported OUT-3114 (Research alert) as PDF — internal fields stripped' },
  { id: 'A-9907', at: 'Yesterday 17:20', actor: 'abubakar', kind: 'approval', message: 'Rejected SIG-2031 — reason: duplicate topic' },
  { id: 'A-9906', at: 'Yesterday 16:04', actor: 'abubakar', kind: 'config', message: 'Paused source SRC-044 (Competitor brand blogs)' },
  { id: 'A-9905', at: 'Yesterday 11:37', actor: 'm.reyes', kind: 'review', message: 'Scientific/legal claims review passed on OUT-3109' },
  { id: 'A-9903', at: 'Sep 02 14:26', actor: 'abubakar', kind: 'publication', message: 'Unpublished OUT-3071 v2 from Jarrow Formulas — citation error in research section' },
  { id: 'A-9904', at: 'Sep 18 14:22', actor: 'abubakar', kind: 'config', message: 'Added 2 domains to web allowlist — policy v1.6 pending' }
];
