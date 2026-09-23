import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrgRole } from '../../types';
import { PortalShell } from '../PortalShell';
import { PortalSession } from '../session';
import { usePortalAuth } from './PortalAuthContext';
import { Login } from '../pages/Login';

/** Test-only bypass sessions — see `testRole` below. Never reachable from a real login. */
const TEST_SESSIONS: Record<OrgRole, PortalSession> = {
  'Org Admin': { orgId: 'org-jarrow', orgName: 'Jarrow Formulas', userId: 'ou-1', userName: 'Dana Whitfield', email: 'dana@jarrow.example', role: 'Org Admin', logout: () => undefined },
  'Org Viewer': { orgId: 'org-jarrow', orgName: 'Jarrow Formulas', userId: 'ou-2', userName: 'Priya Raman', email: 'priya@jarrow.example', role: 'Org Viewer', logout: () => undefined }
};

/** Same idea as `TEST_SESSIONS`, for the one organisation with nothing
 * published yet — the render smoke test has no other way to reach the
 * empty-organisation state, since `org-newco` isn't one of the two roles
 * `testRole` selects between. */
const EMPTY_ORG_TEST_SESSION: PortalSession = {
  orgId: 'org-newco',
  orgName: 'Newco Wellness',
  userId: 'ou-3',
  userName: 'Jordan Lee',
  email: 'jordan@newco.example',
  role: 'Org Admin',
  logout: () => undefined
};

/**
 * TENANT PLANE gate. Arch §5.3: a portal session is hard-bound to one
 * organisation and shares no artifact with the operator plane — this
 * component and `RequireOpsSession` never read the same context, so there is
 * no code path from one plane's session into the other.
 *
 * `testRole` exists only for `routes.manifest.ts` / `check-render.mjs`, which
 * need to render the authenticated screens without going through a real
 * login. Production (`App.tsx`) never passes it, so a real, signed-out visit
 * always hits the branch below that renders `Login` in place.
 */
export function RequirePortalSession({
  children,
  testRole,
  testEmptyOrg
}: {
  children: React.ReactNode;
  testRole?: OrgRole;
  /** Test-only, like `testRole` — renders as the empty-organisation fixture instead. */
  testEmptyOrg?: boolean;
}) {
  const auth = usePortalAuth();
  const navigate = useNavigate();
  const bypassed = testRole || testEmptyOrg;

  useEffect(() => {
    if (!bypassed && auth.status === 'signed-out') {
      navigate('/portal/login', { replace: true });
    }
  }, [bypassed, auth.status, navigate]);

  if (testEmptyOrg) {
    return <PortalShell session={EMPTY_ORG_TEST_SESSION}>{children}</PortalShell>;
  }

  if (testRole) {
    return <PortalShell session={TEST_SESSIONS[testRole]}>{children}</PortalShell>;
  }

  if (auth.status === 'signed-out' || !auth.user) {
    // Rendered here, not only via the redirect above, so a server-rendered
    // page (and the render smoke test) sees the real login screen instead of
    // a blank frame while the effect above catches up to it.
    return <Login />;
  }

  const session: PortalSession = {
    orgId: auth.user.orgId,
    orgName: auth.user.orgName,
    userId: auth.user.id,
    userName: auth.user.name,
    email: auth.user.email,
    role: auth.user.role,
    logout: () => {
      void auth.logout();
      navigate('/portal/login', { replace: true });
    }
  };

  return <PortalShell session={session}>{children}</PortalShell>;
}
