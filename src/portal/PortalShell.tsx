import { useEffect, useState } from 'react';
import { PortalHeader } from './PortalHeader';
import { PortalNav } from './PortalNav';
import { PortalProfilePanel } from './PortalProfilePanel';
import { PortalSession, SessionContext } from './session';

/**
 * TENANT PLANE — `/portal/*`.
 *
 * Deliberately not the operator shell with things hidden. Arch §5.3 and ADR #3:
 * separate cookie name (`__Host-te_portal`), separate cookie path, separate user
 * model (`OrgUser`), separate auth backend, separate WSGI process. Making the
 * two surfaces look and feel different is part of that — a client should never
 * be one misconfiguration away from an operator view.
 *
 * Pure chrome-and-context: it takes an already-resolved `session` rather than
 * building one, because the resolving is `RequirePortalSession`'s job (real
 * login) or a test fixture's (the render smoke test) — never this component's.
 */
interface PortalShellProps {
  children: React.ReactNode;
  session: PortalSession;
}

export function PortalShell({ children, session }: PortalShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    if (!drawerOpen && !profileOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDrawerOpen(false);
        setProfileOpen(false);
      }
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [drawerOpen, profileOpen]);

  return (
    <SessionContext.Provider value={session}>
      <div className="min-h-full w-full bg-canvas p-3 lg:p-5">
        <div className="mx-auto flex h-[calc(100vh-1.5rem)] w-full max-w-[1680px] flex-col overflow-hidden rounded-4xl border border-line bg-card lg:h-[calc(100vh-2.5rem)]">
          <PortalHeader
            onMenuOpen={() => {
              setProfileOpen(false);
              setDrawerOpen(true);
            }}
            onProfileOpen={() => {
              setDrawerOpen(false);
              setProfileOpen(true);
            }}
            profileOpen={profileOpen} />
          <div className="relative flex min-h-0 flex-1">
            {(drawerOpen || profileOpen) &&
            <button
              type="button"
              aria-label="Close panel"
              onClick={() => {
                setDrawerOpen(false);
                setProfileOpen(false);
              }}
              className={`absolute inset-0 z-20 bg-ink/20 ${profileOpen ? '' : 'lg:hidden'}`} />
            }
            <PortalNav isDrawerOpen={drawerOpen} onNavigate={() => setDrawerOpen(false)} />
            <div className="min-w-0 flex-1 overflow-y-auto px-4 sm:px-6 lg:border-l lg:border-line">
              <main className="pb-16 pt-6">{children}</main>
              <footer className="pb-10">
                <div className="border-t border-line pt-4">
                  <p className="text-2xs leading-relaxed text-ink-mute">
                    Prepared by Pure Play Sports Nutrition. Everything here has been reviewed and approved before publication.
                    Research summaries describe what the cited studies found and are not medical advice.
                  </p>
                </div>
              </footer>
            </div>
            <PortalProfilePanel open={profileOpen} onClose={() => setProfileOpen(false)} />
          </div>
        </div>
      </div>
    </SessionContext.Provider>);

}
