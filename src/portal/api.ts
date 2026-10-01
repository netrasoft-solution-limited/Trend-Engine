/**
 * The portal's only connection to the server.
 *
 * Session-cookie authentication, not tokens. The cookie is HttpOnly, so this
 * module never holds a credential and there is nothing here for an XSS to
 * steal — which is the reason not to keep a JWT in localStorage.
 *
 * The CSRF token lives in the session rather than a cookie
 * (`CSRF_USE_SESSIONS`), so it is fetched from the server and replayed on
 * unsafe requests, and re-fetched whenever Django rotates it. It is only
 * useful to a caller that also holds the session cookie, which another
 * origin cannot send.
 *
 * MODULES UNDER `src/portal/` TALK TO THE SERVER THROUGH THIS FILE AND READ NO
 * `data/*` MODULE — enforced by `npm run boundary`.
 */

const BASE = '/portal/api';

export class ApiError extends Error {
  readonly status: number;
  readonly code: string | undefined;
  readonly fields: Record<string, string[]> | undefined;

  constructor(status: number, body: unknown) {
    const payload = (body ?? {}) as Record<string, unknown>;
    super(
      typeof payload.detail === 'string' ? payload.detail : 'Something went wrong. Please try again.'
    );
    this.name = 'ApiError';
    this.status = status;
    this.code = typeof payload.code === 'string' ? payload.code : undefined;

    // DRF reports per-field validation as {field: [messages]}. Surfacing it
    // lets a form show the message next to the input that caused it.
    const fields: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(payload)) {
      if (key !== 'detail' && key !== 'code' && Array.isArray(value)) {
        fields[key] = value.map(String);
      }
    }
    this.fields = Object.keys(fields).length ? fields : undefined;
  }
}

let csrfToken: string | null = null;

/**
 * Django rotates the CSRF token whenever the session identity changes —
 * `login()` and `logout()` both call `rotate_token()`. A cached token from
 * before a login is therefore stale, and the first unsafe request after
 * signing in fails with "CSRF token incorrect". Dropping the cache at those
 * two points is the fix; `withCsrfRetry` below covers rotations we do not
 * initiate, such as a session cycled server-side.
 */
function forgetCsrf(): void {
  csrfToken = null;
}

/**
 * The csrf endpoint answers two questions at once: the token, and whether
 * self-service registration is switched on (PORTAL_ALLOW_SELF_SIGNUP). The
 * second is cached separately because it survives a token rotation — the
 * deployment's policy does not change when someone signs in.
 */
let selfSignupEnabled: boolean | null = null;

async function ensureCsrf(): Promise<string> {
  if (csrfToken) return csrfToken;
  const response = await fetch(`${BASE}/auth/csrf`, { credentials: 'include' });
  const body = await response.json();
  csrfToken = body.csrfToken as string;
  if (typeof body.selfSignupEnabled === 'boolean') {
    selfSignupEnabled = body.selfSignupEnabled;
  }
  return csrfToken;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
}

async function send<T>(path: string, { method = 'GET', body }: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };

  if (method !== 'GET') {
    headers['Content-Type'] = 'application/json';
    headers['X-CSRFToken'] = await ensureCsrf();
  }

  const response = await fetch(`${BASE}${path}`, {
    method,
    credentials: 'include',
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    // The session died — most likely it expired, or the membership was
    // revoked while the tab sat open. Drop the cached token so the next
    // request re-fetches one against the new session.
    if (response.status === 401) {
      csrfToken = null;
    }
    throw new ApiError(response.status, payload);
  }

  return payload as T;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  try {
    return await send<T>(path, options);
  } catch (error) {
    // A rotated token reads as a 403 from CsrfViewMiddleware. Retry once with
    // a fresh one; if it fails again the rejection is real and propagates.
    const csrfRejected =
      error instanceof ApiError &&
      error.status === 403 &&
      /csrf/i.test(error.message);

    if (!csrfRejected) throw error;

    forgetCsrf();
    return send<T>(path, options);
  }
}

// ─── Types, mirroring the serializers ───────────────────────────────────────

export type OrgRole = 'org_admin' | 'org_viewer';

export interface Organization {
  id: number;
  slug: string;
  name: string;
}

export interface Membership {
  id: number;
  organization: Organization;
  role: OrgRole;
  role_label: string;
}

export interface Session {
  id: number;
  email: string;
  name: string;
  /** The role in the ACTIVE organisation, decided server-side. */
  role: OrgRole;
  role_label: string;
  organization: Organization;
  memberships: Membership[];
}

export interface PublicationCard {
  id: number;
  type: string;
  type_label: string;
  title: string;
  summary: string;
  published_at: string;
  body?: { heading: string; text: string }[];
}

export interface DeliveryRow {
  id: number;
  type: string;
  title: string;
  state: 'in preparation' | 'published' | 'delivered';
  updated_at: string;
}

export interface Notification {
  id: number;
  subject: string;
  body: string;
  channel: string;
  sent_at: string;
  read: boolean;
  publication_id: number | null;
}

export interface Preference {
  key: string;
  label: string;
  detail: string;
  locked: boolean;
  enabled: boolean;
}

export interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: OrgRole;
  role_label: string;
  status: string;
  last_login: string | null;
}

export interface PendingInvite {
  id: number;
  email: string;
  role: OrgRole;
  role_label: string;
  expires_at: string;
  created_at: string;
}

export interface SubscriptionPayload {
  subscription: {
    plan: string;
    status: string;
    amount_monthly: string;
    currency: string;
    current_period: string;
    renews_on: string | null;
    processor_ref: string;
  } | null;
  invoices: {
    id: number;
    number: string;
    period: string;
    amount: string;
    currency: string;
    status: string;
    issued_on: string;
    method: string;
  }[];
}

// ─── Endpoints ──────────────────────────────────────────────────────────────

export const api = {
  session: () => request<Session>('/auth/session'),
  login: async (email: string, password: string) => {
    const session = await request<Session>('/auth/login', {
      method: 'POST',
      body: { email, password }
    });
    forgetCsrf(); // Django rotated the token on login.
    return session;
  },
  logout: async () => {
    await request<void>('/auth/logout', { method: 'POST', body: {} });
    forgetCsrf();
  },
  switchOrg: (organizationId: number) =>
    request<Session>('/auth/org', { method: 'POST', body: { organization_id: organizationId } }),

  requestPasswordReset: (email: string) =>
    request<{ detail: string }>('/auth/password-reset', { method: 'POST', body: { email } }),
  confirmPasswordReset: (uid: string, token: string, password: string) =>
    request<{ detail: string }>('/auth/password-reset/confirm', {
      method: 'POST',
      body: { uid, token, password }
    }),
  acceptInvite: (token: string, password: string, name: string) =>
    request<{ detail: string; organization: string }>('/invites/accept', {
      method: 'POST',
      body: { token, password, name }
    }),

  publications: () => request<PublicationCard[]>('/publications'),
  publication: (id: string | number) => request<PublicationCard>(`/publications/${id}`),
  deliveries: () => request<DeliveryRow[]>('/deliveries'),

  notifications: () => request<Notification[]>('/notifications'),
  markNotificationsRead: () => request<void>('/notifications', { method: 'POST', body: {} }),
  preferences: () => request<Preference[]>('/notifications/preferences'),
  setPreference: (key: string, enabled: boolean) =>
    request<{ key: string; enabled: boolean }>('/notifications/preferences', {
      method: 'PATCH',
      body: { key, enabled }
    }),

  team: () => request<{ members: TeamMember[]; invites: PendingInvite[] }>('/team'),
  invite: (email: string, role: OrgRole) =>
    request<PendingInvite>('/team', { method: 'POST', body: { email, role } }),
  removeMember: (membershipId: number) =>
    request<void>(`/team/${membershipId}`, { method: 'DELETE' }),

  subscription: () => request<SubscriptionPayload>('/subscription'),

  /**
   * Self-service registration. A recorded deviation from PRD §4.2 and off
   * unless PORTAL_ALLOW_SELF_SIGNUP is set, in which case the endpoint 404s —
   * so `selfSignup()` reports what the deployment allows and the screen asks
   * before it offers.
   */
  selfSignup: async (): Promise<boolean> => {
    await ensureCsrf();
    return selfSignupEnabled ?? false;
  },
  /**
   * Field names mirror `RegisterSerializer`, and the response is a full
   * session: `RegisterView` creates the organisation, makes the registrant its
   * admin and SIGNS THEM IN, answering 201 with the same payload as a login.
   *
   * There is no email-verification step. The endpoints for one were removed
   * from the backend, and `test_registration.py` asserts they 404 — so a
   * screen that sends someone to check their inbox is sending them nowhere.
   */
  register: async (organizationName: string, name: string, email: string, password: string) => {
    const session = await request<Session>('/auth/register', {
      method: 'POST',
      body: { organization_name: organizationName, name, email, password }
    });
    forgetCsrf(); // Registration starts a session, so Django rotated the token.
    return session;
  }
};
