import { Navigate, Route, Routes } from 'react-router-dom';
import { OperatorRole, OrgRole } from './types';

import { OpsAuthProvider } from './ops/auth/OpsAuthContext';
import { RequireOpsSession } from './ops/auth/RequireOpsSession';
import { Login as OpsLogin } from './ops/pages/Login';
import { VerifyCode } from './ops/pages/VerifyCode';
import { ClientProfile } from './ops/pages/ClientProfile';
import { IngestionRuns } from './ops/pages/IngestionRuns';
import { Operations } from './ops/pages/Operations';
import { OutputBuilder } from './ops/pages/OutputBuilder';
import { ResearchInbox } from './ops/pages/ResearchInbox';
import { ResolutionQueue } from './ops/pages/ResolutionQueue';
import { SignalReview } from './ops/pages/SignalReview';
import { Sources } from './ops/pages/Sources';
import { Tenants } from './ops/pages/Tenants';
import { Triage } from './ops/pages/Triage';

import { PortalAuthProvider } from './portal/auth/PortalAuthContext';
import { RequirePortalSession } from './portal/auth/RequirePortalSession';
import { Login as PortalLogin } from './portal/pages/Login';
import { SignUp } from './portal/pages/SignUp';
import { CheckEmail } from './portal/pages/CheckEmail';
import { VerifyEmail } from './portal/pages/VerifyEmail';
import { Dashboard } from './portal/pages/Dashboard';
import { Delivery } from './portal/pages/Delivery';
import { Notifications } from './portal/pages/Notifications';
import { OutputDetail } from './portal/pages/OutputDetail';
import { Subscription } from './portal/pages/Subscription';
import { Team } from './portal/pages/Team';

/**
 * Two planes, one codebase — Arch §2.1.
 *
 *   /ops/*     operator plane  · Operator, Platform Admin · full access
 *   /portal/*  tenant plane    · Org Admin, Org Viewer    · read-only, scoped
 *
 * In production these are two WSGI processes behind Caddy, with separate
 * middleware stacks, cookie paths and user models (Arch §5.3, §11.1). Splitting
 * them here keeps the prototype honest about the boundary: no shared shell, no
 * shared navigation, and no route that crosses between them. That separation
 * now runs through auth too — `PortalAuthProvider`/`OpsAuthProvider` and their
 * services (`src/portal/auth`, `src/ops/auth`) share no module, no context and
 * no storage, so there is no code path from a session on one plane into the
 * other, only two independent "are you signed in here" checks.
 *
 * `portalRole`/`opsRole` are TEST-ONLY bypasses for `routes.manifest.ts` and
 * `scripts/check-render.mjs`, which need to render the authenticated screens
 * without driving a real login/MFA flow. Nothing else should ever pass them —
 * `App.tsx` never does, so a real visit always goes through the real gate.
 *
 * The tree lives apart from `App` so the smoke test can mount it under a
 * MemoryRouter rather than re-declaring the routes and drifting from this file.
 */
export function AppRoutes({ portalRole, opsRole }: { portalRole?: OrgRole; opsRole?: OperatorRole } = {}) {
  return (
    <Routes>
      <Route
        path="/ops/*"
        element={
        <OpsAuthProvider>
            <Routes>
              <Route path="login" element={<OpsLogin />} />
              <Route path="verify" element={<VerifyCode />} />
              <Route
              path="*"
              element={
              <RequireOpsSession testRole={opsRole}>
                  <Routes>
                    <Route path="/" element={<Triage />} />
                    <Route path="signal/:id" element={<SignalReview />} />
                    <Route path="research" element={<ResearchInbox />} />
                    <Route path="runs" element={<IngestionRuns />} />
                    <Route path="resolution" element={<ResolutionQueue />} />
                    <Route path="sources" element={<Sources />} />
                    <Route path="client" element={<ClientProfile />} />
                    <Route path="tenants" element={<Tenants />} />
                    <Route path="output" element={<OutputBuilder />} />
                    <Route path="operations" element={<Operations />} />
                    <Route path="*" element={<Navigate to="/ops" replace />} />
                  </Routes>
                </RequireOpsSession>
              } />

            </Routes>
          </OpsAuthProvider>
        } />


      <Route
        path="/portal/*"
        element={
        <PortalAuthProvider>
            <Routes>
              <Route path="login" element={<PortalLogin />} />
              <Route path="sign-up" element={<SignUp />} />
              <Route path="check-email" element={<CheckEmail />} />
              <Route path="verify-email/:token" element={<VerifyEmail />} />
              <Route
              path="*"
              element={
              <RequirePortalSession testRole={portalRole}>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="output/:id" element={<OutputDetail />} />
                    <Route path="delivery" element={<Delivery />} />
                    <Route path="notifications" element={<Notifications />} />
                    <Route path="team" element={<Team />} />
                    <Route path="subscription" element={<Subscription />} />
                    <Route path="*" element={<Navigate to="/portal" replace />} />
                  </Routes>
                </RequirePortalSession>
              } />

            </Routes>
          </PortalAuthProvider>
        } />


      <Route path="/admin" element={<Navigate to="/ops" replace />} />
      <Route path="/" element={<Navigate to="/portal" replace />} />
      <Route path="*" element={<Navigate to="/portal" replace />} />
    </Routes>);

}
