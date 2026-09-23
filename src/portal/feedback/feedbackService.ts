import { Publication } from '../../types';
import { publicationsForOrg } from '../../data/publications';

/**
 * TENANT PLANE — mock feedback service.
 *
 * Same discipline as `auth/authService.ts` and `team/teamService.ts`: no
 * fetch, no backend, no storage. Everything lives in this module's memory
 * and resets on reload. Page code talks only to this interface.
 *
 * Feedback is keyed by publication id and scoped by organisation — it reads
 * `data/publications.ts` (the gate) for titles in `getFeedbackSummary`, and
 * nothing here ever touches `data/outputs.ts`. Feedback never writes back to
 * a Publication; the frozen snapshot Arch §9.2 requires is untouched by
 * anything in this file.
 */

export type FeedbackRating = 'useful' | 'not_relevant';

/** Shaped like a future API response, so a real backend can replace this file
 * without the rest of the portal changing shape. */
export interface Feedback {
  id: string;
  publicationId: string;
  orgId: string;
  userId: string;
  rating: FeedbackRating;
  note: string;
  createdAt: string;
  updatedAt: string;
}

/** `listFeedback`'s shape — Org Admin only, so "who" is safe to include here
 * and nowhere else. */
export interface FeedbackWithAuthor extends Feedback {
  userName: string;
}

export interface FeedbackSummaryRow {
  publicationId: string;
  publicationTitle: string;
  useful: number;
  notRelevant: number;
}

/**
 * Every call is scoped this way rather than reading a session itself — the
 * same explicit-scoping discipline `teamService.ts` uses, and for the same
 * reason: a mock that trusted an ambient "current session" would be exactly
 * the kind of thing a real backend must never do (Arch §5.2).
 */
export interface FeedbackScope {
  orgId: string;
  userId: string;
}

export interface FeedbackService {
  getMyFeedback(publicationId: string, scope: FeedbackScope): Promise<Feedback | null>;
  submitFeedback(publicationId: string, input: { rating: FeedbackRating; note: string }, scope: FeedbackScope): Promise<Feedback>;
  removeFeedback(publicationId: string, scope: FeedbackScope): Promise<void>;
  /** Org Admin only — enforced by the caller not showing this to anyone else, same as `AdminOnly`. */
  listFeedback(publicationId: string, scope: FeedbackScope): Promise<FeedbackWithAuthor[]>;
  /** Org Admin only, same discipline. */
  getFeedbackSummary(scope: FeedbackScope): Promise<FeedbackSummaryRow[]>;
}

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function timestamp(): string {
  return `Today ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

/** Display names for the fixture accounts in `auth/authService.ts`. Not part
 * of the stored record (item 7's shape has no name on it) — resolved at read
 * time, the way a real API would join it, or fall back gracefully if the
 * person has since been removed from the team. */
const USER_DIRECTORY: Record<string, string> = {
  'ou-1': 'Dana Whitfield',
  'ou-2': 'Priya Raman',
  'ou-3': 'Jordan Lee'
};

function resolveUserName(userId: string): string {
  return USER_DIRECTORY[userId] ?? 'Former team member';
}

let feedback: Feedback[] = [
  {
    id: 'FB-1',
    publicationId: 'PUB-0042',
    orgId: 'org-jarrow',
    userId: 'ou-1',
    rating: 'useful',
    note: 'Great context for the cognition angle we’re planning — sending this to the content team.',
    createdAt: 'Today 08:40',
    updatedAt: 'Today 08:40'
  },
  {
    id: 'FB-2',
    publicationId: 'PUB-0042',
    orgId: 'org-jarrow',
    userId: 'ou-2',
    rating: 'useful',
    note: '',
    createdAt: 'Today 09:15',
    updatedAt: 'Today 09:15'
  },
  {
    id: 'FB-3',
    publicationId: 'PUB-0041',
    orgId: 'org-jarrow',
    userId: 'ou-1',
    rating: 'useful',
    note: 'Already forwarded to the content team for scheduling.',
    createdAt: 'Sep 05 11:20',
    updatedAt: 'Sep 05 11:20'
  },
  {
    id: 'FB-4',
    publicationId: 'PUB-0039',
    orgId: 'org-jarrow',
    userId: 'ou-2',
    rating: 'not_relevant',
    note: 'We don’t carry berberine, so this one doesn’t apply to us.',
    createdAt: 'Sep 08 13:05',
    updatedAt: 'Sep 08 13:05'
  },
  {
    id: 'FB-5',
    publicationId: 'PUB-0044',
    orgId: 'org-jarrow',
    userId: 'ou-1',
    rating: 'useful',
    note: '',
    createdAt: 'Sep 17 15:00',
    updatedAt: 'Sep 17 15:00'
  },
  {
    id: 'FB-6',
    publicationId: 'PUB-0038',
    orgId: 'org-jarrow',
    userId: 'ou-2',
    rating: 'useful',
    note: 'Good to see we’re holding steady here.',
    createdAt: 'Aug 28 10:30',
    updatedAt: 'Aug 28 10:30'
  }
];

let nextId = feedback.length + 1;

function findFeedback(publicationId: string, scope: FeedbackScope): Feedback | undefined {
  return feedback.find((f) => f.publicationId === publicationId && f.orgId === scope.orgId && f.userId === scope.userId);
}

async function getMyFeedback(publicationId: string, scope: FeedbackScope): Promise<Feedback | null> {
  await delay(undefined);
  const found = findFeedback(publicationId, scope);
  return found ? { ...found } : null;
}

async function submitFeedback(
  publicationId: string,
  input: { rating: FeedbackRating; note: string },
  scope: FeedbackScope
): Promise<Feedback> {
  await delay(undefined);
  const note = input.note.trim().slice(0, 500);
  const existing = findFeedback(publicationId, scope);
  if (existing) {
    existing.rating = input.rating;
    existing.note = note;
    existing.updatedAt = timestamp();
    return { ...existing };
  }
  const now = timestamp();
  const created: Feedback = {
    id: `FB-${nextId++}`,
    publicationId,
    orgId: scope.orgId,
    userId: scope.userId,
    rating: input.rating,
    note,
    createdAt: now,
    updatedAt: now
  };
  feedback = [...feedback, created];
  return { ...created };
}

async function removeFeedback(publicationId: string, scope: FeedbackScope): Promise<void> {
  await delay(undefined);
  feedback = feedback.filter((f) => !(f.publicationId === publicationId && f.orgId === scope.orgId && f.userId === scope.userId));
}

async function listFeedback(publicationId: string, scope: FeedbackScope): Promise<FeedbackWithAuthor[]> {
  await delay(undefined);
  return feedback
    .filter((f) => f.publicationId === publicationId && f.orgId === scope.orgId)
    .map((f) => ({ ...f, userName: resolveUserName(f.userId) }));
}

function summaryRows(orgId: string): FeedbackSummaryRow[] {
  const published: Publication[] = publicationsForOrg(orgId);
  return published.map((p) => {
    const rows = feedback.filter((f) => f.publicationId === p.id && f.orgId === orgId);
    return {
      publicationId: p.id,
      publicationTitle: p.title,
      useful: rows.filter((r) => r.rating === 'useful').length,
      notRelevant: rows.filter((r) => r.rating === 'not_relevant').length
    };
  });
}

async function getFeedbackSummary(scope: FeedbackScope): Promise<FeedbackSummaryRow[]> {
  await delay(undefined);
  return summaryRows(scope.orgId);
}

/**
 * Synchronous, and not part of the interface above — same reasoning as
 * `teamService.listMembersSnapshot()`. Seeds the first render with real data
 * instead of a placeholder "loading" frame; the async methods above are what
 * a retry after a failed load actually calls.
 */
function getMyFeedbackSnapshot(publicationId: string, scope: FeedbackScope): Feedback | null {
  const found = findFeedback(publicationId, scope);
  return found ? { ...found } : null;
}

function listFeedbackSnapshot(publicationId: string, scope: FeedbackScope): FeedbackWithAuthor[] {
  return feedback
    .filter((f) => f.publicationId === publicationId && f.orgId === scope.orgId)
    .map((f) => ({ ...f, userName: resolveUserName(f.userId) }));
}

function getFeedbackSummarySnapshot(scope: FeedbackScope): FeedbackSummaryRow[] {
  return summaryRows(scope.orgId);
}

export const feedbackService: FeedbackService & {
  getMyFeedbackSnapshot: typeof getMyFeedbackSnapshot;
  listFeedbackSnapshot: typeof listFeedbackSnapshot;
  getFeedbackSummarySnapshot: typeof getFeedbackSummarySnapshot;
} = {
  getMyFeedback,
  submitFeedback,
  removeFeedback,
  listFeedback,
  getFeedbackSummary,
  getMyFeedbackSnapshot,
  listFeedbackSnapshot,
  getFeedbackSummarySnapshot
};
