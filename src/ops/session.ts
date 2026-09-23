import { createContext, useContext } from 'react';
import { OperatorRole } from '../types';

/**
 * OPERATOR PLANE — session.
 *
 * Mirrors `src/portal/session.ts` deliberately: same shape of idea, on the
 * other plane. `OperatorShell` provides this from whatever
 * `RequireOpsSession` resolved (a real login, or a test fixture) — it never
 * builds one itself, the same discipline `PortalShell` now follows.
 */
export interface OpsSession {
  name: string;
  email: string;
  role: OperatorRole;
  logout: () => void;
}

export const OpsSessionContext = createContext<OpsSession | null>(null);

export function useOpsSession(): OpsSession {
  const session = useContext(OpsSessionContext);
  if (!session) {
    throw new Error('Operator view rendered without a bound session');
  }
  return session;
}
