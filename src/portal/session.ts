import { createContext, useContext } from 'react';
import { Membership, OrgRole, Organization, Session } from './api';

/**
 * TENANT PLANE — portal session.
 *
 * The session now comes from the server. Three things that used to be here are
 * gone on purpose:
 *
 *   · `setRole`. While it existed, any component could promote itself, and the
 *     nav shipped a dropdown that let the viewer do exactly that. The role now
 *     arrives from the active membership and is read-only to the client.
 *   · The hardcoded `orgId`. The active organisation is whatever the server
 *     verified a membership for on this request.
 *   · Invented user details. `name` and `email` are the real account's.
 *
 * `switchOrg` IS here, and is a different thing from the old role switcher: it
 * is bounded by the memberships the user actually holds, and the server
 * re-checks that on the switch AND on every subsequent request.
 */
export interface PortalSession {
  user: { id: number; email: string; name: string };
  organization: Organization;
  memberships: Membership[];
  /** Role in the ACTIVE organisation. Server-decided; the client cannot set it. */
  role: OrgRole;
  roleLabel: string;
  switchOrg: (organizationId: number) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
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

export function toSession(
  data: Session,
  actions: Pick<PortalSession, 'switchOrg' | 'logout' | 'refresh'>
): PortalSession {
  return {
    user: { id: data.id, email: data.email, name: data.name },
    organization: data.organization,
    memberships: data.memberships,
    role: data.role,
    roleLabel: data.role_label,
    ...actions
  };
}

export const isOrgAdmin = (session: PortalSession): boolean => session.role === 'org_admin';
