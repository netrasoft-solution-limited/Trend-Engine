/**
 * Routes the render smoke test mounts. Keep in step with `routes.tsx`.
 *
 * Split by what they need, because they can no longer be checked the same way:
 *
 *   OPS        renders from mock data, so SSR exercises it fully.
 *   PORTAL_PUBLIC  the auth screens — no session, no fetch, fully renderable.
 *   PORTAL_AUTHED  behind a real session. SSR can only prove they mount
 *                  without crashing; what they actually show is asserted
 *                  against the live API by backend/scripts/smoke-portal-api.sh.
 */
export const OPS_ROUTES = [
  '/ops',
  '/ops/signal/SIG-2041',
  '/ops/signal/SIG-2032',
  '/ops/research',
  '/ops/runs',
  '/ops/resolution',
  '/ops/sources',
  '/ops/client',
  '/ops/tenants',
  '/ops/output',
  '/ops/output?signal=SIG-2038&type=research_alert',
  '/ops/operations'
];

export const PORTAL_PUBLIC_ROUTES = [
  '/portal/login',
  '/portal/reset-password',
  '/portal/reset-password/MQ/set-token',
  '/portal/accept-invite/demo-token'
];

export const PORTAL_AUTHED_ROUTES = [
  '/portal',
  '/portal/delivery',
  '/portal/notifications',
  '/portal/team',
  '/portal/subscription'
];

export const ALL_ROUTES = [...OPS_ROUTES, ...PORTAL_PUBLIC_ROUTES, ...PORTAL_AUTHED_ROUTES];
