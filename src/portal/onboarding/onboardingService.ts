import { organizations } from '../../data/orgs';
import { publicationsForOrg } from '../../data/publications';
import { teamService } from '../team/teamService';
import { hasSavedSettings } from '../notifications/notificationSettingsService';

/**
 * TENANT PLANE — mock onboarding-checklist service.
 *
 * Same discipline as the other portal mocks: no fetch, no backend, no
 * storage. There is deliberately no separate "completed" flag per item —
 * every item's `done` is derived, on each call, from `teamService`,
 * `notificationSettingsService`, `data/publications.ts` and the small
 * viewed-publications record kept in this file. A real backend would compute
 * this the same way: a join, not a cached boolean that could drift from the
 * state it's supposed to describe.
 */

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
  /** `null` means "no action to offer" — either already done, or (for
   * `read_first_output`) nothing has been published yet to read. */
  href: string | null;
}

/** Shaped like a future API response. */
export interface OnboardingChecklist {
  orgId: string;
  userId: string;
  items: ChecklistItem[];
  dismissed: boolean;
  completedAt: string | null;
}

export interface OnboardingScope {
  orgId: string;
  userId: string;
}

export interface OnboardingService {
  getChecklist(scope: OnboardingScope): Promise<OnboardingChecklist>;
  dismiss(scope: OnboardingScope): Promise<OnboardingChecklist>;
  reopen(scope: OnboardingScope): Promise<OnboardingChecklist>;
}

function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function timestamp(): string {
  return `Today ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

function scopeKey(scope: OnboardingScope): string {
  return `${scope.orgId}:${scope.userId}`;
}

const ONBOARDING_WINDOW_DAYS = 30;

/** Falls back to "created just now" for an org with no `data/orgs.ts` row —
 * true of anyone who has just been through the sign-up mock, whose org id
 * (`org-signup-N`) is minted at verification time and never added to that
 * static fixture list. Treating an unknown org as brand new is the correct
 * default, not a gap: it's a new organisation. */
function orgCreatedAt(orgId: string): Date {
  const org = organizations.find((o) => o.id === orgId);
  if (org) {
    const parsed = new Date(org.orgCreatedAt);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
}

export function isOnboardingOrg(orgId: string): boolean {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - ONBOARDING_WINDOW_DAYS);
  return orgCreatedAt(orgId) >= cutoff;
}

// The one piece of state this file owns directly — everything else is
// derived by asking the other services. Scope-keyed, so one person's read
// history is never visible to, or shared with, another.
const viewedAnyOutput = new Set<string>();
const dismissedState = new Map<string, boolean>();
const completedAtMap = new Map<string, string>();

/** Not part of the interface above — called by `pages/OutputDetail.tsx` when
 * a publication is opened. */
export function recordPublicationViewed(scope: OnboardingScope): void {
  viewedAnyOutput.add(scopeKey(scope));
}

function buildItems(scope: OnboardingScope): ChecklistItem[] {
  // `currentUserEmail` only affects the `isSelf` flag on each returned row,
  // which this checklist doesn't use — the count is what matters here.
  const teamSize = teamService.listMembersSnapshot({ orgId: scope.orgId, currentUserEmail: '' }).length;
  const hasPublications = publicationsForOrg(scope.orgId).length > 0;

  return [
    { id: 'verify_email', label: 'Verify your email', done: true, href: null },
    { id: 'invite_colleague', label: 'Invite a colleague', done: teamSize > 1, href: '/portal/team' },
    {
      id: 'choose_notifications',
      label: 'Choose how you’re notified',
      done: hasSavedSettings(scope),
      href: '/portal/notifications'
    },
    {
      id: 'read_first_output',
      label: 'Read your first output',
      done: viewedAnyOutput.has(scopeKey(scope)),
      href: hasPublications ? '/portal/delivery' : null
    }
  ];
}

function buildChecklist(scope: OnboardingScope): OnboardingChecklist {
  const items = buildItems(scope);
  const allDone = items.every((i) => i.done);
  const key = scopeKey(scope);

  // Monotonic: once every derived item is true it can't become false again
  // (no "un-inviting" a colleague, no "un-reading" an output), so this is
  // recorded once and then just returned — not recomputed as "now" forever.
  if (allDone && !completedAtMap.has(key)) {
    completedAtMap.set(key, timestamp());
  }

  return {
    orgId: scope.orgId,
    userId: scope.userId,
    items,
    dismissed: dismissedState.get(key) ?? false,
    completedAt: completedAtMap.get(key) ?? null
  };
}

async function getChecklist(scope: OnboardingScope): Promise<OnboardingChecklist> {
  await delay(undefined);
  return buildChecklist(scope);
}

async function dismiss(scope: OnboardingScope): Promise<OnboardingChecklist> {
  await delay(undefined);
  dismissedState.set(scopeKey(scope), true);
  return buildChecklist(scope);
}

async function reopen(scope: OnboardingScope): Promise<OnboardingChecklist> {
  await delay(undefined);
  dismissedState.set(scopeKey(scope), false);
  return buildChecklist(scope);
}

/** Synchronous, and not part of the interface above — same reasoning as
 * `teamService.listMembersSnapshot()`. Seeds the first render with real data
 * instead of a placeholder "loading" frame. */
function getChecklistSnapshot(scope: OnboardingScope): OnboardingChecklist {
  return buildChecklist(scope);
}

export const onboardingService: OnboardingService & { getChecklistSnapshot: typeof getChecklistSnapshot } = {
  getChecklist,
  dismiss,
  reopen,
  getChecklistSnapshot
};
