import { Navigate, Route, Routes } from 'react-router-dom';

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

import { PortalShell } from './portal/PortalShell';
import { AcceptInvite } from './portal/pages/AcceptInvite';
import { Dashboard } from './portal/pages/Dashboard';
import { Login } from './portal/pages/Login';
import { SignUp } from './portal/pages/SignUp';
import { ResetPassword } from './portal/pages/ResetPassword';
import { ResetPasswordConfirm } from './portal/pages/ResetPasswordConfirm';
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
 * shared navigation, and no route that crosses between them.
 *
 * The tree lives apart from `App` so the smoke test can mount it under a
 * MemoryRouter rather than re-declaring the routes and drifting from this file.
 */
/**
 * `portalRole` / `opsRole` are TEST-ONLY bypasses for `routes.manifest.ts` and
 * `scripts/check-render.mjs`. Server-side rendering runs no effects, so without
 * them every authenticated route renders its loading frame and the smoke test
 * asserts nothing about the pages. `App.tsx` never passes them, so production
 * always goes through the real guards.
 */
export function AppRoutes({
  portalRole,
  opsRole
}: { portalRole?: 'Org Admin' | 'Org Viewer'; opsRole?: 'Operator' | 'Platform Admin' } = {}) {
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


      {/*
        Public portal routes. These render before a session exists, so they
        must sit OUTSIDE PortalShell — that shell's job is to require a
        session and redirect when there isn't one.
      */}
      <Route path="/portal/login" element={<Login />} />
      {/* Self-service registration — a recorded deviation from PRD §4.2's
          invite-only provisioning, and 404 at the endpoint unless
          PORTAL_ALLOW_SELF_SIGNUP is set. */}
      <Route path="/portal/sign-up" element={<SignUp />} />
      <Route path="/portal/reset-password" element={<ResetPassword />} />
      <Route path="/portal/reset-password/:uid/:token" element={<ResetPasswordConfirm />} />
      <Route path="/portal/accept-invite/:token" element={<AcceptInvite />} />

      <Route
        path="/portal/*"
        element={
        <PortalShell testRole={portalRole}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="output/:id" element={<OutputDetail />} />
              <Route path="delivery" element={<Delivery />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="team" element={<Team />} />
              <Route path="subscription" element={<Subscription />} />
              <Route path="*" element={<Navigate to="/portal" replace />} />
            </Routes>
          </PortalShell>
        } />


      <Route path="*" element={<Navigate to="/ops" replace />} />
    </Routes>);

}
