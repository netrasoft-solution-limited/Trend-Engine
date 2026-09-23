// Domain types for the Trend Engine prototype.
//
// Naming and shape follow the PRD data model (§8) and the Solution Architecture.
// Where a type encodes a rule rather than just data, the rule is cited inline —
// those are the places a future implementer must not "simplify".

// ─────────────────────────────────────────────────────────────────────────────
// State machines — PRD §6.5: "implement exactly, do not simplify"
// ─────────────────────────────────────────────────────────────────────────────

export type SignalState =
  | 'candidate'
  | 'in review'
  | 'approved'
  | 'rejected'
  | 'watching'
  | 'archived';

export type RecommendationState =
  | 'proposed'
  | 'operator edited'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'archived';

/**
 * PRD §6.5 / §6.9. `published` is a distinct state from `approved`:
 * approval is internal sign-off, publication is client visibility.
 * Export is an ACTION available on approved and published versions — never a state.
 */
export type OutputState =
  | 'drafting'
  | 'draft'
  | 'review ready'
  | 'approved'
  | 'published'
  | 'delivered'
  | 'archived';

export type SourceState =
  | 'draft'
  | 'validating'
  | 'active'
  | 'gated'
  | 'blocked'
  | 'paused'
  | 'archived';

/**
 * PRD §6.8: the portal shows a delivery tracker in "client-appropriate language".
 * Every internal pre-publication state collapses to a single `in preparation` —
 * the client never sees which internal review stage an output is sitting in.
 */
export type DeliveryState = 'in preparation' | 'published' | 'delivered';

export type AnyState =
  | SignalState
  | RecommendationState
  | OutputState
  | SourceState
  | DeliveryState;

// ─────────────────────────────────────────────────────────────────────────────
// Roles and tenancy — PRD §3, Arch §5
// ─────────────────────────────────────────────────────────────────────────────

/** PRD §3.2. Operator and Platform Admin are distinct roles even when one person holds both. */
export type OperatorRole = 'Operator' | 'Platform Admin';

export type OrgRole = 'Org Admin' | 'Org Viewer';

export type SubscriptionStatus = 'active' | 'past due' | 'cancelled';

/** PRD §6.8: Organization maps 1:1 to Client — additive, not a schema replacement. */
export interface Organization {
  id: string;
  name: string;
  clientId: string;
  domainPack: string;
  status: 'active' | 'onboarding' | 'fixture';
  /** PRD §2: the second-client and non-supplement fixtures are CI proofs, not live clients. */
  isFixture: boolean;
  seats: number;
  publishedOutputs: number;
  lastPortalLogin: string | null;
  note: string;
}

export interface OrgUser {
  id: string;
  orgId: string;
  name: string;
  email: string;
  role: OrgRole;
  /** PRD §6.8: invite-based provisioning only. No self-serve signup. */
  invitedBy: string;
  status: 'active' | 'invited' | 'suspended';
  lastLogin: string | null;
}

export interface Subscription {
  orgId: string;
  plan: string;
  status: SubscriptionStatus;
  amountMonthly: number;
  currentPeriod: string;
  renewsOn: string;
  /** PRD §7.5: processor token reference only. No card or bank data, ever. */
  processorRef: string;
}

export interface Invoice {
  id: string;
  orgId: string;
  period: string;
  amount: number;
  status: 'paid' | 'open' | 'void';
  issued: string;
  /** PRD §6.8: manual invoicing at launch; automated collection is out of scope. */
  method: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Scoring — PRD §6.3, Arch §8
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Arch §8.2: scores are never stored as scalars. Component values, the baseline
 * they were measured against, and the model/pack versions are persisted at write
 * time, "because they cannot be reconstructed later".
 */
export interface ScoreComponent {
  label: string;
  value: number;
  weight: number;
  note: string;
}

export interface EvidenceRow {
  route: string;
  samples: number;
  pattern: string;
  caveat: string;
}

/**
 * Arch §8.2: the provenance pair that makes multi-domain auditable.
 *
 * Domain-level only — a Signal is shared (Arch's L4, no tenant column), so
 * nothing tenant-scoped belongs here. The per-tenant equivalent
 * (`clientProfileVersion`) lives on `ClientSignalScore` instead.
 */
export interface ScoreProvenance {
  modelVersion: string;
  promptVersion: string;
  domainPackVersion: string;
  baseline: string;
  sourceCount: number;
  creatorCount: number;
}

export type SuggestedAction = 'approve deep dive' | 'watch' | 'validate' | 'merge';

/**
 * Arch's L4: shared, no tenant. A Signal exists once regardless of how many
 * organisations it is scored for — see `ClientSignalScore` for the per-tenant
 * view of the same signal.
 */
export interface Signal {
  id: string;
  title: string;
  detail: string;
  state: SignalState;
  /** Axis 1 — is this moving in the category? Shared by all tenants. */
  domainScore: number;
  /**
   * Axis 3 — how much should we trust this?
   * Arch §8.1: kept orthogonal to importance on purpose. Conflating the two is
   * "the most common failure mode in trend systems".
   */
  confidence: number;
  suggestedAction: SuggestedAction;
  firstSeen: string;
  routes: string[];
  breakdown: ScoreComponent[];
  /** Arch §8.2: confidence is a score like any other — persisted components, not a bare number. */
  confidenceBreakdown: ScoreComponent[];
  provenance: ScoreProvenance;
  evidence: EvidenceRow[];
  /** PRD §6.3: contradictions are retained, never discarded. */
  contradictions: string[];
  claimsFlags: string[];
}

/**
 * Arch's L5: tenant-scoped. The client-rank view of one Signal for exactly one
 * organisation — Axis 2, "does this matter to THIS client?" (60/20/10/10 per
 * PRD §6.3). The same signal can, and for the second-tenant architecture-proof
 * fixture must, carry a different `ClientSignalScore` per organisation.
 */
export interface ClientSignalScore {
  signalId: string;
  orgId: string;
  clientFit: number;
  clientBreakdown: ScoreComponent[];
  clientConnection: string;
  clientProfileVersion: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Acquisition — PRD §6.1/§6.2, Arch §7
// ─────────────────────────────────────────────────────────────────────────────

export type SourceType = 'podcast' | 'youtube' | 'research' | 'web' | 'social';

/**
 * Arch §7.1. A source that can supply metadata but not transcripts must surface
 * metadata-only items honestly rather than presenting them as fully understood
 * content — the capability model is what makes that structural.
 */
export type Capability =
  | 'DISCOVERY'
  | 'METADATA'
  | 'TRANSCRIPT'
  | 'ENGAGEMENT'
  | 'COMMENTS'
  | 'DELETION_POLL';

export interface Source {
  id: string;
  name: string;
  type: SourceType;
  state: SourceState;
  lastSuccess: string;
  policy: string;
  monthlyCost: number;
  note: string;
  connector: string;
  inputs: string;
  runCap: number;
  monthCap: number;
  retry: string;
  capabilities: Capability[];
  /** Arch §7.2: declarative config, not branching code. */
  fallbackChain: string[];
  /**
   * Arch §12: a source in `gated` state cannot reach `active` without a recorded
   * approved access basis. Enforced in the state machine, not left to discipline.
   */
  accessBasis: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Ingestion runs — Arch §6
// ─────────────────────────────────────────────────────────────────────────────

export type RunState = 'succeeded' | 'partial' | 'running' | 'failed' | 'rejected';

/** Arch §6.3: auth/policy errors block the connector — retrying them is futile and a compliance risk. */
export type ErrorClass = 'none' | 'network' | 'rate limit' | 'schema' | 'auth' | 'policy';

export interface IngestionRun {
  id: string;
  sourceId: string;
  sourceName: string;
  connector: string;
  startedAt: string;
  duration: string;
  state: RunState;
  discovered: number;
  metadataFetched: number;
  relevancePassed: number;
  transcriptsAcquired: number;
  deadLettered: number;
  cost: number;
  /** Arch §6.3: `(source_id, external_item_id, content_hash)`. Re-running never duplicates. */
  idempotencyKey: string;
  errorClass: ErrorClass;
  note: string;
}

/**
 * Arch §6.2: the metadata-only relevance gate is "an architectural component,
 * not an optimization" — it is what makes the transcript budget work.
 */
export interface RelevanceGateStats {
  window: string;
  discovered: number;
  passed: number;
  rejected: number;
  /** Arch §6.2: ~5% of rejections are processed anyway so the filter cannot calcify. */
  sampled: number;
  sampledRecovered: number;
  rejectionReasons: { reason: string; count: number }[];
}

export interface FallbackStep {
  route: string;
  step: string;
  outcome: 'succeeded' | 'fell through' | 'not attempted';
  items: number;
  note: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Resolution queue — PRD §6.3 pre-scoring normalization
// ─────────────────────────────────────────────────────────────────────────────

export type ResolutionKind =
  | 'syndication'
  | 'cross-post'
  | 'alias'
  | 'creator cap'
  | 'sponsored'
  | 'metadata-only';

export interface ResolutionItem {
  id: string;
  kind: ResolutionKind;
  title: string;
  detail: string;
  members: string[];
  suggested: string;
  /** Effect on scoring if the suggestion is accepted. */
  effect: string;
  confidence: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Research — PRD §6.3 separate scientific track
// ─────────────────────────────────────────────────────────────────────────────

export interface ReviewLensRow {
  dimension: 'Design' | 'Measures' | 'Population + context';
  positive: string;
  concern: string;
}

export interface Paper {
  id: string;
  title: string;
  publication: string;
  design: string;
  population: string;
  identifiers: string;
  relevance: number;
  intervention: string;
  portfolio: string;
  lens: ReviewLensRow[];
  routed: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Outputs, versions and the publication gate — PRD §6.6/§6.9, Arch §9
// ─────────────────────────────────────────────────────────────────────────────

export interface ClaimsFlag {
  id: string;
  kind:
    | 'Product claim'
    | 'Comparative language'
    | 'Research extrapolation'
    | 'Safety statement'
    | 'Required disclaimer';
  excerpt: string;
  guidance: string;
  severity: 'blocking' | 'review' | 'note';
}

/** Version history is internal. PRD §6.9: only one published version is visible to a tenant at a time. */
export interface OutputVersion {
  id: string;
  version: number;
  createdAt: string;
  author: string;
  summary: string;
  state: OutputState;
  /** PRD §6.9: approval signs off on this exact version — recorded here, not inferred from `state` alone. */
  approvedBy: string | null;
  approvedAt: string | null;
}

/**
 * Arch §9.2: health/scientific outputs require recorded expert sign-off BEFORE
 * publication — a stricter gate than the internal approval flow.
 */
export interface ExpertReview {
  outputId: string;
  reviewer: string;
  discipline: string;
  signedOffAt: string | null;
  note: string;
}

/**
 * PRD §6.9, Arch §9.2. The portal resolves content EXCLUSIVELY through this record.
 * There is no query path from portal views to Output or OutputVersion.
 */
export interface Publication {
  id: string;
  outputId: string;
  versionId: string;
  version: number;
  orgId: string;
  type: string;
  title: string;
  summary: string;
  body: { heading: string; text: string }[];
  publishedBy: string;
  publishedAt: string;
  /** PRD §6.9: publication is reversible, and the reversal is audited. */
  unpublishedAt: string | null;
  notifiedAt: string | null;
}

export interface PortalNotification {
  id: string;
  orgId: string;
  publicationId: string | null;
  subject: string;
  sentAt: string;
  channel: 'email' | 'in-app';
  read: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Operations — Arch §10, §11.1, §13
// ─────────────────────────────────────────────────────────────────────────────

export interface Connector {
  source: string;
  lastSuccess: string;
  failures: number;
  coverage: number;
  latency: string;
  state: SourceState;
}

export interface VendorSpend {
  vendor: string;
  line: string;
  spend: number;
  cap: number;
}

export interface DeadLetterItem {
  id: string;
  source: string;
  error: string;
  attempts: number;
  queuedAt: string;
  errorClass: ErrorClass;
}

/** Arch §11.1: three queues deliberately — a 40-minute transcription must not starve an export. */
export interface QueueHealth {
  name: 'ingest' | 'enrich' | 'default';
  purpose: string;
  depth: number;
  latency: string;
  concurrency: string;
  state: 'healthy' | 'backed up' | 'paused';
}

export interface AuditEntry {
  id: string;
  at: string;
  actor: string;
  /** PRD §7.1: config, review, approval, publication and export events are all audited. */
  kind: 'config' | 'review' | 'approval' | 'publication' | 'export' | 'system';
  message: string;
}
