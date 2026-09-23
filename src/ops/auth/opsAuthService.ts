import { OperatorRole } from '../../types';

/**
 * OPERATOR PLANE — mock auth service.
 *
 * PRD §3.2: Operator and Platform Admin are distinct roles even where one
 * person holds both. This mock models that literally — two separate fixture
 * accounts, not one account with two hats — so a UI restriction keyed on role
 * has something real to disagree with.
 *
 * No fetch, no backend, no storage: everything here is in-memory and resets
 * on reload. There is no self-serve sign-up path and none should ever be
 * added — operator accounts are provisioned by an existing Platform Admin.
 */

export interface OpsUser {
  id: string;
  name: string;
  email: string;
  role: OperatorRole;
}

export type OpsAuthErrorCode = 'invalid_credentials' | 'invalid_code' | 'expired_code' | 'no_pending_login';

export class OpsAuthError extends Error {
  code: OpsAuthErrorCode;
  constructor(code: OpsAuthErrorCode, message: string) {
    super(message);
    this.name = 'OpsAuthError';
    this.code = code;
  }
}

export interface OpsAuthService {
  login(email: string, password: string): Promise<{ mfaRequired: true }>;
  verifyCode(code: string): Promise<{ user: OpsUser }>;
  logout(): Promise<void>;
  getSession(): Promise<{ user: OpsUser | null }>;
}

function delay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

const DEMO_PASSWORD = 'ops-demo-2026';
const DEMO_CODE = '123456';
/** Fixture code that always reports as expired, so that state is reachable without waiting on a real one. */
const FIXTURE_EXPIRED_CODE = '999999';

const OPS_USERS: OpsUser[] = [
  { id: 'op-1', name: 'Abubakar', email: 'abubakar@pureplay.example', role: 'Operator' },
  { id: 'op-2', name: 'Mark', email: 'mark@pureplay.example', role: 'Platform Admin' }
];

let currentSession: OpsUser | null = null;
/** Set after a correct password, cleared on a completed or expired code check. Nothing here is ever persisted. */
let pendingLoginEmail: string | null = null;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function login(email: string, password: string): Promise<{ mfaRequired: true }> {
  const normalized = normalizeEmail(email);
  const user = OPS_USERS.find((u) => u.email === normalized);
  await delay(undefined);
  // One message for "no such account" and "wrong password" — same reasoning
  // as the portal side: telling them apart is an account-enumeration oracle.
  if (!user || password !== DEMO_PASSWORD) {
    throw new OpsAuthError('invalid_credentials', 'That email and password do not match.');
  }
  pendingLoginEmail = user.email;
  return { mfaRequired: true };
}

async function verifyCode(code: string): Promise<{ user: OpsUser }> {
  await delay(undefined);

  if (!pendingLoginEmail) {
    throw new OpsAuthError('no_pending_login', 'Sign in with your email and password first.');
  }
  if (code === FIXTURE_EXPIRED_CODE) {
    pendingLoginEmail = null;
    throw new OpsAuthError('expired_code', 'That code has expired. Sign in again for a new one.');
  }
  if (code !== DEMO_CODE) {
    throw new OpsAuthError('invalid_code', "That code doesn't match.");
  }

  const user = OPS_USERS.find((u) => u.email === pendingLoginEmail)!;
  pendingLoginEmail = null;
  currentSession = user;
  return { user };
}

async function logout(): Promise<void> {
  currentSession = null;
  pendingLoginEmail = null;
  return delay(undefined, 150);
}

async function getSession(): Promise<{ user: OpsUser | null }> {
  return delay({ user: currentSession }, 150);
}

/** Synchronous — seeds the first render deterministically. See the parallel note in `portal/auth/authService.ts`. */
function getSessionSnapshot(): OpsUser | null {
  return currentSession;
}

function hasPendingLogin(): boolean {
  return pendingLoginEmail !== null;
}

export const opsAuthService: OpsAuthService & {
  getSessionSnapshot: typeof getSessionSnapshot;
  hasPendingLogin: typeof hasPendingLogin;
} = {
  login,
  verifyCode,
  logout,
  getSession,
  getSessionSnapshot,
  hasPendingLogin
};

export const OPS_DEMO_CREDENTIALS = {
  operator: { email: 'abubakar@pureplay.example', password: DEMO_PASSWORD },
  platformAdmin: { email: 'mark@pureplay.example', password: DEMO_PASSWORD }
};

export const OPS_DEMO_CODE = { valid: DEMO_CODE, expired: FIXTURE_EXPIRED_CODE };
