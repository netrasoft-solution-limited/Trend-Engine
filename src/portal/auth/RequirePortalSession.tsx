import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrgRole } from '../../types';
import { PortalShell } from '../PortalShell';
import { PortalSession } from '../session';
import { usePortalAuth } from './PortalAuthContext';
import { Login } from '../pages/Login';

/** Test-only bypass sessions — see `testRole` below. Never reachable from a real login. */
const TEST_SESSIONS: Record<OrgRole, PortalSession> = {
  'Org Admin': { orgId: 'org-jarrow', orgName: 'Jarrow Formulas', userName: 'Dana Whitfield', email: 'dana@jarrow.example', role: 'Org Admin', logout: () => undefined },
  'Org Viewer': { orgId: 'org-jarrow', orgName: 'Jarrow Formulas', userName: 'Priya Raman', email: 'priya@jarrow.example', role: 'Org Viewer', logout: () => undefined }
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
export function RequirePortalSession({ children, testRole }: { children: React.ReactNode; testRole?: OrgRole }) {
  const auth = usePortalAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!testRole && auth.status === 'signed-out') {
      navigate('/portal/login', { replace: true });
    }
  }, [testRole, auth.status, navigate]);

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
