/**
 * Every route the smoke test mounts. Keep in step with `routes.tsx`.
 *
 * It lives in its own module rather than beside the route tree so that file
 * exports only components, which is what React Fast Refresh needs.
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
  '/portal',
  '/portal/output/PUB-0042',
  '/portal/output/PUB-0036',
  '/portal/delivery',
  '/portal/notifications',
  '/portal/team',
  '/portal/subscription'
];
