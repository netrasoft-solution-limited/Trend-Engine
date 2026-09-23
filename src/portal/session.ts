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
 * `role` comes from the account that signed in (`auth/authService.ts`) and is
 * not switchable from here — an earlier version of this prototype let a
 * viewer pick their own role from a dropdown, which is exactly the kind of
 * client-side control PRD §3.2 requires to be server-decided instead.
 *
 * MODULES UNDER `src/portal/` MAY READ `data/publications.ts` AND NOTHING ELSE
 * FROM THE OUTPUT LAYER — Arch §9.3, enforced by `npm run boundary`.
 */
export interface PortalSession {
  orgId: string;
  orgName: string;
  userId: string;
  userName: string;
  email: string;
  role: OrgRole;
  logout: () => void;
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
