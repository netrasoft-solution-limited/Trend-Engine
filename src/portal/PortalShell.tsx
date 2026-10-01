import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ApiError, Session, api } from './api';
import { PortalNav } from './PortalNav';
import { PortalSession, SessionContext, toSession } from './session';

/**
 * TENANT PLANE — `/portal/*`, authenticated routes only.
 *
 * Arch §5.3 and ADR #3: separate cookie name (`__Host-te_portal`), separate
 * user model (`OrgUser`), separate auth backend, separate WSGI process, and —
 * as amended — a separate origin from the operator plane. Making the two
 * surfaces look and feel different is part of that; a client should never be
 * one misconfiguration away from an operator view.
 *
 * This shell is the authentication gate on the client side. It is NOT the
 * control: the server refuses unauthenticated requests regardless of what this
 * component renders. What it provides is the right experience — a redirect to
 * sign in rather than six screens each failing on their own.
 */
/**
 * `testRole` exists only for `routes.manifest.ts` / `check-render.mjs`, and
 * mirrors the identical prop on `RequireOpsSession`. Server-side rendering runs
 * no effects, so without it every portal route would render the loading frame
 * and the smoke test would assert nothing about the pages themselves.
 *
 * `routes.tsx` is the only file that ever wires a value into it.
 */
const TEST_SESSIONS: Record<string, Session> = {
  'Org Admin': {
    id: 1,
    email: 'dana@jarrow.example',
    name: 'Dana Whitfield',
    role: 'org_admin',
    role_label: 'Org Admin',
    organization: { id: 1, slug: 'jarrow', name: 'Jarrow Formulas' },
    memberships: [
      {
        id: 1,
        organization: { id: 1, slug: 'jarrow', name: 'Jarrow Formulas' },
        role: 'org_admin',
        role_label: 'Org Admin'
      }
    ]
  },
  'Org Viewer': {
    id: 2,
    email: 'priya@jarrow.example',
    name: 'Priya Raman',
    role: 'org_viewer',
    role_label: 'Org Viewer',
    organization: { id: 1, slug: 'jarrow', name: 'Jarrow Formulas' },
    memberships: [
      {
        id: 2,
        organization: { id: 1, slug: 'jarrow', name: 'Jarrow Formulas' },
        role: 'org_viewer',
        role_label: 'Org Viewer'
      }
    ]
  }
};

export function PortalShell({
  children,
  testRole
}: {
  children: React.ReactNode;
  testRole?: 'Org Admin' | 'Org Viewer';
}) {
  const location = useLocation();
  const [data, setData] = useState<Session | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'anonymous' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setData(await api.session());
      setState('ready');
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        setState('anonymous');
        return;
      }
      setError(err instanceof Error ? err.message : String(err));
      setState('error');
    }
  }, []);

  useEffect(() => {
    if (testRole) return; // The fixture session stands in; never fetch.
    void load();
  }, [load, testRole]);

  const session: PortalSession | null = useMemo(() => {
    const source = testRole ? TEST_SESSIONS[testRole] : data;
    if (!source) return null;
    return toSession(source, {
      switchOrg: async (organizationId: number) => {
        setData(await api.switchOrg(organizationId));
      },
      logout: async () => {
        await api.logout();
        setData(null);
        setState('anonymous');
      },
      refresh: load
    });
  }, [data, load, testRole]);

  if (state === 'loading' && !testRole) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <p className="text-sm text-ink-mute">Loading…</p>
      </div>);

  }

  if (state === 'anonymous' && !testRole) {
    // Remember where they were headed, so a bookmarked brief survives a login.
    return <Navigate to="/portal/login" state={{ from: location.pathname }} replace />;
  }

  if (state === 'error' || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas px-5">
        <div className="max-w-md rounded-2xl border border-line bg-card p-6 text-center shadow-panel">
          <h1 className="text-lg font-semibold text-ink">We can't reach the portal right now</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
            {error ?? 'Please try again in a moment.'}
          </p>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-4 rounded-xl bg-ink px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 hover:bg-ink-soft">

            Try again
          </button>
        </div>
      </div>);

  }

  return (
    <SessionContext.Provider value={session}>
      <div className="min-h-full w-full bg-canvas">
        <PortalNav />
        <main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-6 sm:px-6">{children}</main>
        <footer className="mx-auto w-full max-w-5xl px-4 pb-10 sm:px-6">
          <div className="border-t border-line pt-4">
            <p className="text-2xs leading-relaxed text-ink-mute">
              Prepared by Pure Play Sports Nutrition. Everything here has been reviewed and approved
              before publication. Research summaries describe what the cited studies found and are
              not medical advice.
            </p>
          </div>
        </footer>
      </div>
    </SessionContext.Provider>);

}
