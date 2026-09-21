# Frontend gap analysis

Date: 2026-09-20  
Scope: frontend only; no code was changed other than creating this analysis document.

## Evidence and audit boundary

The PRD and solution architecture were supplied outside this repository. The repository itself contains a React 18/Vite/Tailwind prototype, not a Django application: there are no `templates/`, `static/`, Django apps, URL configurations, forms, views, HTMX endpoints, context processors, or Django frontend tests. `README.md` explicitly calls it a clickable, mock-data design reference and says the production UI is to be Django templates plus HTMX.

Accordingly, a screen marked **PARTIAL** below means its intended UI has a prototype representation; it is not an implemented production frontend. No server-side permission, tenant, validation, audit, or persistence behavior can be evidenced in this repository.

Status key: **DONE** = implemented and matches in the production frontend; **PARTIAL** = prototype or incomplete implementation; **MISSING** = no evidence; **DIVERGENT** = implementation approach conflicts with the documents.

## Frontend checklist extracted from the documents

### Cross-cutting requirements

- Django templates plus HTMX partial requests only; no SPA (Architecture §1, ADR #9).
- Separate `/ops/*` and `/portal/*` base templates, routes, static bundles, session cookies, user models, auth backends, and middleware. The portal must never load operator templates/routes/assets.
- Operator authentication is private/identity-aware and uses MFA. Portal authentication is invite-only and session-bound to one organization.
- Role-specific UI and server-side enforcement: Operator, Platform Admin, Org Admin, Org Viewer.
- Tenant selector for operator access (`OPERATOR_ALL` narrowed by UI selection); portal has no organization switcher.
- Accessible, responsive pages, with loading, empty, and error states; HTMX partials should preserve those states.
- No client-private content in browser logs, client-side error tracking, or inappropriate requests.

### Operator requirements

- **Source registry:** source type/configuration, capabilities, provider policy/access basis, fallback chain, cost caps, lifecycle actions limited by the Source state machine.
- **Ingestion runs:** run status/failures, relevance gate and sampling, fallback route, idempotency, cost; per-item transcript source, method, quality/status, cost, and rights basis; metadata-only status must be explicit.
- **Resolution queue:** deduplication, aliases, cross-posts, creator caps, sponsored/metadata-only handling; accept/dismiss decisions and retained contradictions.
- **Signal review:** component scores and baseline; confidence separate from importance; source/creator counts; model, prompt, domain-pack and client-profile versions; evidence spans and caveats; contradictions; state-machine-driven actions.
- **Research inbox:** research-specific assessment (design, measures, population/context), integrity/citation considerations, routing.
- **Client profile:** client assets/categories/audiences/priorities/competitors/voice/compliance/reviewers/cadence; version context.
- **Output builder:** all output types; draft/edit; claims and citation validation; unresolved claims in reviewer packet; expert sign-off for health/scientific content; state-controlled approve, publish with confirmation, unpublish; Markdown/DOCX/PDF/HTML/CSV exports; auditable events.
- **Operations:** connector freshness, run health, DLQ, transcript coverage, queues, vendor spend/caps with 80% warning, backups/restore, tenancy errors, immutable audit activity.
- **Platform Admin:** tenant onboarding and subscription status.

### Client requirements — pending Mark approval

- Login, invite acceptance, and password reset.
- Published-output dashboard, filterable by type/date; detail resolves only the published `Publication` snapshot.
- Delivery tracker exposes `in preparation`, never internal workflow states.
- Notification history and saved preferences.
- Org Admin user management and subscription/invoice status; Org Viewer does not receive either capability.
- Read-only client content: no raw evidence, internal scores, vendor costs, other organizations, drafts, version history, or approval/pre-publication states.

## Screen status — operator portal

| Screen | Status | Evidence | Gap / required next implementation |
|---|---|---|---|
| Source registry | PARTIAL | `src/ops/pages/Sources.tsx`; `src/data/sources.ts` | Prototype shows source state, capabilities, policy, access basis, fallback, cost and a local edit/test view. It has no Django form, server validation, actual state transition enforcement, source-detail/item transcript records, or HTMX updates. |
| Ingestion runs | PARTIAL | `src/ops/pages/IngestionRuns.tsx`; `src/data/runs.ts` | Prototype shows run counts, errors, costs, relevance gate and fallback ladder. It does not show the required per-item transcript source/method/quality/cost/rights data; no server-backed run detail, retry, DLQ drill-down, loading/error state, or partial endpoint exists. |
| Resolution queue | PARTIAL | `src/ops/pages/ResolutionQueue.tsx`; `src/data/resolution.ts` | Prototype shows kinds, explanations, proposed effects, local accept/dismiss, normalization rules and retained contradictions. Decisions are component state only, with no audited/validated workflow. |
| Signal review | PARTIAL | `src/ops/pages/SignalReview.tsx`; `src/data/signals.ts` | Strong prototype coverage: component scores, weighted total, baseline/provenance, separate confidence/client axes, source/creator counts, evidence/caveats and contradictions. Buttons directly alter local state and are not limited to valid transitions (for example, Approve is shown regardless of current state); no persistence, authorization, tenant selection, audit, or HTMX workflow. |
| Research inbox | PARTIAL | `src/ops/pages/ResearchInbox.tsx`; `src/data/research.ts` | Prototype covers research queue, relevance, study lenses and local routing. No server-side integrity status, citation/retraction workflow, form submission, error/loading state, or persisted routing. |
| Client profile | PARTIAL | `src/ops/pages/ClientProfile.tsx`; `src/data/client.ts` | Displays the required profile domains, assets, audiences, priorities, compliance, voice, competitors, reviewers and cadence. It is read-only fixture content; no tenant selector, edit/version workflow, form or authorization evidence. |
| Output builder | PARTIAL | `src/ops/pages/OutputBuilder.tsx`; `src/data/outputs.ts` | The prototype intentionally separates approval and publication, gates publication on expert sign-off, presents a confirmation step, supports unpublish and renders a local gate log. It also renders claims/citation and export controls. All effects are `useState`; no exact-version server transaction, reviewer packet, audit write, export endpoint, permission check, or state-machine enforcement exists. |
| Operations | PARTIAL | `src/ops/pages/Operations.tsx`; `src/data/operations.ts` | Prototype covers connector freshness, vendor spend/caps, queues, DLQ, backups, tenancy/portal health and audit data. No live monitoring data, 80%-threshold enforcement evidence, authenticated admin view, server error state or endpoint exists. |
| Tenant onboarding/subscriptions | PARTIAL | `src/ops/pages/Tenants.tsx`; `src/data/orgs.ts` | Prototype presents onboarding order, organization fixtures, users, retention and subscription/invoice status. No Platform Admin authorization, creation/invite forms, tenant selection, or server enforcement exists. |
| Operator login/MFA | MISSING | No corresponding source files/routes | `/ops/*` is mounted by the SPA router without any authentication or MFA interface. |

## Screen status — client portal (all pending approval)

| Screen | Status | Evidence | Gap / required next implementation |
|---|---|---|---|
| Login | MISSING — pending approval | No portal auth route/component | The displayed portal session is hardcoded in `src/portal/PortalShell.tsx`; no login, cookie, or separate auth realm exists. |
| Invite acceptance | MISSING — pending approval | No route/component | Team UI describes an invitation but does not create or accept one. |
| Password reset | MISSING — pending approval | No route/component | No reset request/confirm flow exists. |
| Published dashboard | PARTIAL — pending approval | `src/portal/pages/Dashboard.tsx`; `src/data/publications.ts` | Correct prototype filtering and tenant-scoped published data only. Date filtering, server query scoping, loading/error states and production auth are absent. |
| Published-output detail | PARTIAL — pending approval | `src/portal/pages/OutputDetail.tsx`; `src/data/publications.ts` | Correct prototype lookup uses `publicationById()` and returns unavailable for withdrawn content. It needs a Django publication-only view/query, server-side ownership enforcement and HTTP error handling. |
| Delivery tracker | PARTIAL — pending approval | `src/portal/pages/Delivery.tsx`; `src/data/publications.ts` | Correctly collapses all internal states to `in preparation`. It is fixture data and does not have a server-side delivery projection. |
| Notifications | PARTIAL — pending approval | `src/portal/pages/Notifications.tsx`; `src/data/publications.ts` | History and preference UI are represented, but preference changes are browser-only local state. Needs scoped form/HTMX endpoint, CSRF, validation, persistence and error feedback. |
| Org Admin user management | PARTIAL — pending approval | `src/portal/pages/Team.tsx`; `src/portal/AdminOnly.tsx`; `src/data/orgs.ts` | Member list and invite form are represented. The invite send action does nothing, and role protection is a browser-only `AdminOnly` component. Needs server enforcement and invitation lifecycle. |
| Subscription/invoices | PARTIAL — pending approval | `src/portal/pages/Subscription.tsx`; `src/portal/AdminOnly.tsx`; `src/data/orgs.ts` | Correctly avoids card data and visually limits access to Org Admin. Data/authorization are client-side fixtures; needs scoped server view and server-side role guard. |

## Non-negotiable compliance check

| Requirement | Result | Evidence / risk |
|---|---|---|
| Django templates + HTMX only | DIVERGENT | `package.json`, `src/index.tsx`, `src/App.tsx`, and `src/routes.tsx` implement a React SPA with React Router. This is expressly rejected by Architecture §1/ADR #9. |
| No shared base/static/routes between planes | DIVERGENT | One `BrowserRouter` (`src/App.tsx`), one route tree (`src/routes.tsx`) and shared `src/index.css`/Tailwind bundle serve both planes. Separate shell components do not meet separate Django base templates/static bundles/routes. |
| Portal does not reference Output/OutputVersion | PARTIAL | Portal pages import `data/publications.ts`, not `data/outputs.ts`; `scripts/check-boundary.mjs` checks this direct boundary. This is sound prototype evidence, but not a Django query/import-linter guarantee. |
| Portal displays client-safe pre-publication state | PARTIAL | `src/portal/pages/Delivery.tsx` maps to `in preparation`; `scripts/check-render.mjs` asserts internal labels do not appear. Browser fixture data cannot prove production data shaping. |
| Portal read-only/no self-serve signup | PARTIAL | No self-serve signup or content editing UI exists. Notification toggles and the invite panel are local-only UI, so neither proves nor violates server behavior; production must provide only the permitted Org Admin actions. |
| Approve and Publish separate; publish confirmed; Unpublish audited | PARTIAL | `OutputBuilder.tsx` has separate state/actions and a local confirmation/log. There is no durable audit event, exact-version lock, transaction or authorization. |
| No client exposure of scores/costs/raw evidence/other tenant/pre-publication content | PARTIAL | The portal uses published fixtures and render check forbids selected internal terms. `PortalShell.tsx` hardcodes Jarrow, and `data/publications.ts` throws on a null scope. Neither establishes session-derived query scoping or route-level authorization. |
| Role controls hidden/disabled and server-enforced | DIVERGENT | `PortalNav.tsx` hides Admin links and `AdminOnly.tsx` blocks in React using a switchable client-side role. There is no server layer; this is UI-only permission control. Operator/Platform Admin roles have no implementation. |
| Empty/error/loading/accessibility/responsive behavior | PARTIAL | Several pages have empty/unavailable states; Tailwind layouts are responsive and buttons/labels include some semantics. No loading/network/error states, HTMX swap behavior, form error summaries, focus management after swaps, or accessibility tests exist. |

## Backend dependencies that block specific screens

| Dependency | Blocks |
|---|---|
| Separate Django apps, URLconfs, base templates, static bundles and middleware for `/ops` and `/portal` | Every production screen; required before porting the SPA prototype. |
| Operator auth/MFA and Portal `OrgUser` auth with separate cookies/backends | Operator login and every protected screen. |
| Tenant context/default-deny ORM managers and Publication-only portal query service | All portal reads; all tenant profile/output/subscription screens. |
| State-machine command services plus audit events | Source actions, signal/recommendation review, output approval/publish/unpublish. |
| Output/version/claims/citation/expert-review/export services | Output builder and downloadable outputs. |
| Run/evidence/transcript detail projections | Ingestion screens and required transcript provenance. |
| Notification, invitation and password-reset services | Portal notifications/preferences, Team, invite acceptance, reset. |
| Organization/subscription/invoice read model | Tenant onboarding, operator tenant admin, portal subscription screen. |
| Operations/monitoring read model | Operations dashboard. |

## Document conflicts and open decisions affecting frontend

1. **Portal scope is unapproved.** PRD §§10 and 16 require Mark to approve SaaS scope, timeline, budget and commercial model. Per the requested precedence rule, every portal backlog item remains pending approval; do not promote it ahead of operator work without that decision.
2. **Technical approach is not a conflict:** the PRD §9 and architecture both require Django templates + HTMX; the code conflicts with both. The architecture wins for implementation detail.
3. **Scope conflict with the earlier internal-only plan:** the PRD says that plan is superseded only pending approval. The decision affects whether portal work is an additive/re-sequenced/separate phase, not the need to keep the data model tenancy-aware from the first migration.
4. **Processor, email provider, retention agreement and review workflow remain open.** They shape subscription wording, invitation/reset flows, notification preferences, retention/account deletion UI and publication review states.

## Deviations and risks (worst first)

1. **Architecture violation:** the entire frontend is an SPA, despite the explicit no-SPA decision. Shipping it as the product would violate the architecture and make the desired two-realm/static separation unprovable.
2. **No real authorization or tenant boundary:** roles and Jarrow tenant identity live in browser state/data. `AdminOnly.tsx` is demonstrably UI-only. A production portal must deny unauthorized requests in Django before rendering/querying.
3. **Publication controls are not durable:** publish/unpublish, approval, expert sign-off and audit activity reset on reload and do not act on an immutable `OutputVersion`/`Publication` record.
4. **Required portal authentication lifecycle is absent:** no login, invitation acceptance, reset, cookies, CSRF or session binding exists. Portal remains pending approval, but it cannot be called implemented.
5. **Transcript provenance gap:** aggregate ingestion data exists, but the mandated per-item source/method/quality/cost/rights representation is absent.
6. **State-machine rules are prose/local controls, not authoritative commands:** actions may be offered outside valid states and cannot be trusted.
7. **Verification gap:** `scripts/check-boundary.mjs`, `check-gate.mjs` and `check-render.mjs` are useful prototype checks, but no Django/HTMX/route/auth/tenant integration tests exist. Dependencies were not installed in this checkout, so `npm.cmd run check` stopped before TypeScript due to missing `tsc`.

## Build next — dependency order

1. **Create the two Django frontend foundations** — **L**  
   Build `ops` and `portal` URLconfs, separate base templates, separate static entry points, middleware/auth integration points, and a shared design-token stylesheet only if it can be separately compiled and served. Replace no product behavior yet. This precedes every screen because it resolves the SPA divergence and establishes the structural plane boundary. Acceptance moved: private operator portal / scoped portal architecture; cross-plane isolation.

2. **Implement the operator auth, role, tenant-selection and page-shell layer** — **M**  
   Touch operator base template, login/MFA views, permission mixins/decorators, operator session middleware and a tenant selector partial backed by the explicit operator scope. Build the triage shell/nav around it. This precedes data-changing screens because all controls need a trusted actor and selected tenant. Acceptance moved: operator login and Platform Admin/Operator separation.

3. **Port the operator review backbone as Django templates plus HTMX** — **L**  
   Start with triage, Signal review and Client profile; add server-rendered table/detail partials, filters, empty/loading/error fragments, and state-machine command forms. Touch new `templates/ops/`, views/forms and narrowly scoped read models. This is the first value-bearing operator workflow and supplies the signal/client context required by output production. Acceptance moved: explainable Jarrow-relevant signal review.

4. **Build the durable Output Builder/publication command UI** — **L**  
   Implement draft/edit, claims/citation/reviewer packet, expert sign-off, exports, Approve, Publish confirmation and Unpublish as POST forms/HTMX fragments. Each command must be server-authorized, exact-version-aware, state-transition-checked and audit-writing. Touch `outputs`/`publication` template/view/form boundaries and export download views. This comes before a client portal because it creates the only legitimate source for client-visible content. Acceptance moved: Outputs and Publication gate.

5. **Port source/runs/resolution/research/operations read and action screens** — **L**  
   Add the remaining operator templates/partials and prioritized data projections, especially individual transcript provenance and Operations health/cap warning states. These screens depend on their backend read models but are independent of the unapproved portal. Acceptance moved: acquisition, transcripts, evidence and operations acceptance criteria.

### Deferred pending Mark approval: client portal phase

After approval, build portal auth/invite/reset first, then a separate portal base/static bundle and Publication-only dashboard/detail/delivery views, then notifications, team and subscription. Each portal view must bind the organization from the session, never accept an organization selector, and query only publication/read models scoped by the ORM layer.

## Frontend behavior not specified by the documents

- Exact navigation information architecture, mobile breakpoints, pagination/search/filter behavior, and design system/token ownership.
- HTMX request/response conventions (fragment naming, event handling, target/swap strategy, optimistic behavior and progressive enhancement policy).
- Form validation presentation, unsaved-edit warnings, conflict/version handling and post-action focus/announcement behavior.
- Portal output rendering formats, printable/downloadable presentation, date/time/timezone conventions and notification preference granularity.
- Accessibility acceptance standard (for example WCAG target), keyboard flows and assistive-technology test plan.
- Portal and operator error copy, support paths and availability/outage communication UX.
