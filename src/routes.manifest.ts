/**
 * Every route the smoke test mounts. Keep in step with `routes.tsx`.
 *
 * It lives in its own module rather than beside the route tree so that file
 * exports only components, which is what React Fast Refresh needs.
 *
 * Not included: bare `/`, `/admin` — both are pure `<Navigate>` redirects with
 * nothing else to render, so under `renderToString` (which never runs the
 * effect a real redirect needs) they produce empty output and would fail the
 * generic "rendered something" check for a reason that has nothing to do with
 * the pages themselves. `check-render.mjs` exercises them with a dedicated
 * assertion instead.
 */
export const ALL_ROUTES = [
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
  '/ops/operations',
  '/ops/login',
  '/ops/verify',
  '/portal',
  '/portal/output/PUB-0042',
  '/portal/output/PUB-0036',
  '/portal/delivery',
  '/portal/notifications',
  '/portal/team',
  '/portal/subscription',
  '/portal/login',
  '/portal/sign-up',
  '/portal/check-email',
  '/portal/verify-email/demo-valid-token',
  '/portal/verify-email/demo-expired-token',
  '/portal/verify-email/demo-used-token',
  '/portal/verify-email/not-a-real-token'
];
