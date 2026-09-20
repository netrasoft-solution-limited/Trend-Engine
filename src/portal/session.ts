import { createContext, useContext } from 'react';
import { OrgRole } from '../types';

/**
 * TENANT PLANE — portal session.
 *
 * Arch §5.3: the portal's tenant binding is hard-bound to the authenticated
 * session. There is deliberately no way to widen it from here — no operator
 * scope, no org switcher, no `OPERATOR_ALL`. A portal session that could choose
 * its own tenant would be the escalation path the two-realm split exists to
 * prevent.
 *
 * MODULES UNDER `src/portal/` MAY READ `data/publications.ts` AND NOTHING ELSE
 * FROM THE OUTPUT LAYER — Arch §9.3, enforced by `npm run boundary`.
 */
export interface PortalSession {
  orgId: string;
  orgName: string;
  userName: string;
  role: OrgRole;
  setRole: (role: OrgRole) => void;
}

export const SessionContext = createContext<PortalSession | null>(null);

export function usePortalSession(): PortalSession {
  const session = useContext(SessionContext);
  if (!session) {
    // Mirrors Arch §5.2: no bound tenant is a loud failure, never a silent
    // unscoped read.
    throw new Error('Portal view rendered without a bound tenant session');
  }
  return session;
}
