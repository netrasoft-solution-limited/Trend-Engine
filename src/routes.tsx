import { Navigate, Route, Routes } from 'react-router-dom';
import { OrgRole } from './types';

import { OperatorShell } from './ops/OperatorShell';
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
 * shared navigation, and no route that crosses between them.
 *
 * The tree lives apart from `App` so the smoke test can mount it under a
 * MemoryRouter rather than re-declaring the routes and drifting from this file.
 */
export function AppRoutes({ portalRole }: { portalRole?: OrgRole } = {}) {
  return (
    <Routes>
      <Route
        path="/ops/*"
        element={
        <OperatorShell>
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
          </OperatorShell>
        } />


      <Route
        path="/portal/*"
        element={
        <PortalShell initialRole={portalRole}>
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
