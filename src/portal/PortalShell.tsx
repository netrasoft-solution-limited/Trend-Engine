import { useMemo, useState } from 'react';
import { PortalNav } from './PortalNav';
import { PortalSession, SessionContext } from './session';
import { OrgRole } from '../types';

/**
 * TENANT PLANE — `/portal/*`.
 *
 * Deliberately not the operator shell with things hidden. Arch §5.3 and ADR #3:
 * separate cookie name (`__Host-te_portal`), separate cookie path, separate user
 * model (`OrgUser`), separate auth backend, separate WSGI process. Making the
 * two surfaces look and feel different is part of that — a client should never
 * be one misconfiguration away from an operator view.
 */
interface PortalShellProps {
  children: React.ReactNode;
  /** Starting role. Exists so the smoke test can render the Org Viewer case. */
  initialRole?: OrgRole;
}

export function PortalShell({ children, initialRole = 'Org Admin' }: PortalShellProps) {
  // Role is switchable here only so the two permission levels can be reviewed
  // side by side. In the real portal it comes from the OrgUser record and the
  // user cannot change it.
  const [role, setRole] = useState<OrgRole>(initialRole);

  const session = useMemo<PortalSession>(
    () => ({
      orgId: 'org-jarrow',
      orgName: 'Jarrow Formulas',
      userName: role === 'Org Admin' ? 'Dana Whitfield' : 'Priya Raman',
      role,
      setRole
    }),
    [role]
  );

  return (
    <SessionContext.Provider value={session}>
      <div className="min-h-full w-full bg-canvas">
        <PortalNav />
        <main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-6 sm:px-6">{children}</main>
        <footer className="mx-auto w-full max-w-5xl px-4 pb-10 sm:px-6">
          <div className="border-t border-line pt-4">
            <p className="text-2xs leading-relaxed text-ink-mute">
              Prepared by Pure Play Sports Nutrition. Everything here has been reviewed and approved before publication.
              Research summaries describe what the cited studies found and are not medical advice.
            </p>
          </div>
        </footer>
      </div>
    </SessionContext.Provider>);

}
