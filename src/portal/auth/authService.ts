import { OrgRole } from '../../types';

/**
 * TENANT PLANE — mock auth service.
 *
 * This is a design-time stand-in for the real thing: no fetch, no backend, no
 * storage. Every account and token below lives in this module's memory and
 * resets the moment the page reloads — which is also why nothing here is
 * written to localStorage or sessionStorage. Pages talk to this interface
 * only; when a real API exists, this file is what gets replaced.
 */

export interface PortalAuthUser {
  id: string;
  name: string;
  email: string;
  role: OrgRole;
  orgId: string;
  orgName: string;
}

export type PortalAuthErrorCode = 'invalid_credentials' | 'invalid_token' | 'expired_token' | 'already_used';

export class PortalAuthError extends Error {
  code: PortalAuthErrorCode;
  /** The address the token belonged to, when known — a real backend still has
   * this on the token row after it expires or is used, and it's what lets a
   * "request a new link" recovery action target the right address. */
  email?: string;
  constructor(code: PortalAuthErrorCode, message: string, email?: string) {
    super(message);
    this.name = 'PortalAuthError';
    this.code = code;
    this.email = email;
  }
}

export interface PortalAuthService {
  signUp(input: { organizationName: string; fullName: string; email: string; password: string }): Promise<{ email: string }>;
  resendVerification(email: string): Promise<{ email: string }>;
  verifyEmail(token: string): Promise<{ user: PortalAuthUser }>;
  login(email: string, password: string): Promise<{ user: PortalAuthUser }>;
  logout(): Promise<void>;
  getSession(): Promise<{ user: PortalAuthUser | null }>;
}

function delay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/** One shared demo password. This is a mock, not a credential store. */
const DEMO_PASSWORD = 'portal-demo-2026';

const verifiedAccounts: PortalAuthUser[] = [
  { id: 'ou-1', name: 'Dana Whitfield', email: 'dana@jarrow.example', role: 'Org Admin', orgId: 'org-jarrow', orgName: 'Jarrow Formulas' },
  { id: 'ou-2', name: 'Priya Raman', email: 'priya@jarrow.example', role: 'Org Viewer', orgId: 'org-jarrow', orgName: 'Jarrow Formulas' },
  // The empty-state fixture: a freshly onboarded organisation with nothing
  // published, delivered, notified or subscribed yet. `data/publications.ts`
  // and `data/orgs.ts` have no rows for `org-newco` on purpose.
  { id: 'ou-3', name: 'Jordan Lee', email: 'jordan@newco.example', role: 'Org Admin', orgId: 'org-newco', orgName: 'Newco Wellness' }
];

const accountPasswords = new Map<string, string>(verifiedAccounts.map((u) => [u.email, DEMO_PASSWORD]));

interface PendingVerification {
  email: string;
  organizationName: string;
  fullName: string;
  password: string;
}

const pendingVerifications = new Map<string, PendingVerification>();

/** Fixture tokens that always resolve to the same state, so every state on
 * `VerifyEmail` is reachable by URL without waiting on a real email. */
const FIXTURE_VALID_TOKEN = 'demo-valid-token';
const FIXTURE_EXPIRED_TOKEN = 'demo-expired-token';
const FIXTURE_USED_TOKEN = 'demo-used-token';

let currentSession: PortalAuthUser | null = null;
let nextSuffix = 1;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function signUp(input: { organizationName: string; fullName: string; email: string; password: string }) {
  const email = normalizeEmail(input.email);
  // Never reveal whether this address already has an account. The response
  // is identical either way — only the internal bookkeeping differs.
  if (!verifiedAccounts.some((u) => u.email === email)) {
    const token = `demo-signup-${nextSuffix++}`;
    pendingVerifications.set(token, {
      email,
      organizationName: input.organizationName.trim(),
      fullName: input.fullName.trim(),
      password: input.password
    });
  }
  return delay({ email });
}

async function resendVerification(email: string) {
  // Same enumeration-safety property as signUp: identical response whether
  // or not a pending verification exists for this address.
  return delay({ email: normalizeEmail(email) });
}

async function verifyEmail(token: string): Promise<{ user: PortalAuthUser }> {
  await delay(undefined);

  if (token === FIXTURE_EXPIRED_TOKEN) {
    throw new PortalAuthError('expired_token', 'That verification link has expired.', 'demo-expired@newco.example');
  }
  if (token === FIXTURE_USED_TOKEN) {
    throw new PortalAuthError('already_used', 'That verification link has already been used.', 'demo-used@newco.example');
  }
  if (token === FIXTURE_VALID_TOKEN) {
    const user = verifiedAccounts.find((u) => u.email === 'jordan@newco.example')!;
    currentSession = user;
    return { user };
  }

  const pending = pendingVerifications.get(token);
  if (!pending) {
    throw new PortalAuthError('invalid_token', "That verification link isn't valid.");
  }

  pendingVerifications.delete(token);
  const orgId = `org-signup-${nextSuffix++}`;
  const user: PortalAuthUser = {
    id: `ou-${verifiedAccounts.length + 1}`,
    name: pending.fullName,
    email: pending.email,
    role: 'Org Admin',
    orgId,
    orgName: pending.organizationName
  };
  verifiedAccounts.push(user);
  accountPasswords.set(user.email, pending.password);
  currentSession = user;
  return { user };
}

async function login(email: string, password: string): Promise<{ user: PortalAuthUser }> {
  const normalized = normalizeEmail(email);
  const user = verifiedAccounts.find((u) => u.email === normalized);
  await delay(undefined);
  // One message for "no such account" and "wrong password" — telling them
  // apart is an account-enumeration oracle.
  if (!user || accountPasswords.get(user.email) !== password) {
    throw new PortalAuthError('invalid_credentials', 'That email and password do not match.');
  }
  currentSession = user;
  return { user };
}

async function logout(): Promise<void> {
  currentSession = null;
  return delay(undefined, 150);
}

async function getSession(): Promise<{ user: PortalAuthUser | null }> {
  return delay({ user: currentSession }, 150);
}

/**
 * Synchronous, and not part of the interface above. Used only to seed the
 * first render with a determinate result instead of a placeholder "checking"
 * frame — there is nothing to wait on, since this mock never persists
 * anything outside this module's memory and a fresh load is always signed
 * out regardless of how long `getSession()` takes to resolve.
 */
function getSessionSnapshot(): PortalAuthUser | null {
  return currentSession;
}

/**
 * Not part of the interface above either — this exists for
 * `team/teamService.ts` to call when an Org Admin removes a member. A
 * removed person must not be able to sign back in, mirroring what
 * deactivating the real `OrgMembership` row would do server-side.
 */
export function revokeAccount(email: string): void {
  const normalized = normalizeEmail(email);
  accountPasswords.delete(normalized);
  const index = verifiedAccounts.findIndex((u) => u.email === normalized);
  if (index !== -1) verifiedAccounts.splice(index, 1);
  if (currentSession?.email === normalized) {
    currentSession = null;
  }
}

export const portalAuthService: PortalAuthService & { getSessionSnapshot: typeof getSessionSnapshot } = {
  signUp,
  resendVerification,
  verifyEmail,
  login,
  logout,
  getSession,
  getSessionSnapshot
};

export const PORTAL_DEMO_CREDENTIALS = {
  orgAdmin: { email: 'dana@jarrow.example', password: DEMO_PASSWORD },
  orgViewer: { email: 'priya@jarrow.example', password: DEMO_PASSWORD },
  emptyOrgAdmin: { email: 'jordan@newco.example', password: DEMO_PASSWORD }
};

export const PORTAL_DEMO_TOKENS = {
  valid: FIXTURE_VALID_TOKEN,
  expired: FIXTURE_EXPIRED_TOKEN,
  used: FIXTURE_USED_TOKEN
};
