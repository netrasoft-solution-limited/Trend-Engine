import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OperatorRole } from '../../types';
import { OperatorShell } from '../OperatorShell';
import { OpsSession } from '../session';
import { useOpsAuth } from './OpsAuthContext';
import { Login } from '../pages/Login';

/** Test-only bypass sessions — see `testRole` below. Never reachable from a real login. */
const TEST_SESSIONS: Record<OperatorRole, OpsSession> = {
  Operator: { name: 'Abubakar', email: 'abubakar@pureplay.example', role: 'Operator', logout: () => undefined },
  'Platform Admin': { name: 'Mark', email: 'mark@pureplay.example', role: 'Platform Admin', logout: () => undefined }
};

/**
 * OPERATOR PLANE gate. Shares no context, no module state and no import with
 * `RequirePortalSession` — a signed-in operator has nothing here that could
 * grant portal access, and vice versa, because there is no code path between
 * the two at all, not just a permission check that could be misconfigured.
 *
 * `testRole` exists only for `routes.manifest.ts` / `check-render.mjs` — see
 * the identical note on `RequirePortalSession`.
 */
export function RequireOpsSession({ children, testRole }: { children: React.ReactNode; testRole?: OperatorRole }) {
  const auth = useOpsAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!testRole && auth.status === 'signed-out') {
      navigate('/ops/login', { replace: true });
    }
  }, [testRole, auth.status, navigate]);

  if (testRole) {
    return <OperatorShell session={TEST_SESSIONS[testRole]}>{children}</OperatorShell>;
  }

  if (auth.status === 'signed-out' || !auth.user) {
    return <Login />;
  }

  const session: OpsSession = {
    name: auth.user.name,
    email: auth.user.email,
    role: auth.user.role,
    logout: () => {
      void auth.logout();
      navigate('/ops/login', { replace: true });
    }
  };

  return <OperatorShell session={session}>{children}</OperatorShell>;
}
