# Trend Engine — interface prototype

A clickable, mock-data prototype of both Trend Engine surfaces, built to match
`../trend-engine-prd.md` and `../trend-engine-solution-architecture.md`.

**This is a design reference, not the production frontend.** ADR #9 rejects an
SPA: the real operator tool is Django templates plus HTMX, and the client portal
is a separate Django app. This prototype is what those templates get built from.
It has no API client, no `fetch`, and no backend — every screen renders from
hardcoded data under `src/data/`.

## Running it

```
npm install
npm run dev      # http://localhost:5173/ops
```

`/` redirects to `/ops`. The client portal is at `/portal`.

## Checks

```
npm run check    # typecheck · lint · boundary · gate · render
```

These are not decoration. The specs make four test classes deployment-blocking
(Arch §5.4, §9.3), and the prototype had already drifted from PRD §6.3 once
before they existed. Each script states which rule it is defending:

| Script | Defends |
|---|---|
| `npm run boundary` | The portal never imports the output layer (Arch §9.3); scoring weights match PRD §6.3; every headline score reconciles with its own components (Arch §8.2); `OutputState` carries `published`, not `exported` (PRD §6.9) |
| `npm run gate` | Approved outputs are not client-visible; published ones are; withdrawn ones disappear; tenants never see each other's records; an unscoped read raises `TenantScopeError` (Arch §5.2) |
| `npm run render` | All 19 routes render; the delivery tracker never names an internal review stage; an Org Viewer cannot reach team or billing; no internal scoring or vendor-cost language reaches the portal |

## Layout

The directory structure encodes the architecture's central boundary, so that
violating it is visible in an import statement rather than buried in prose.

```
src/
  components/   shared primitives (Panel, StateChip, ScoreBar, PageHeader)
  ops/          OPERATOR PLANE  · /ops/*    · full access
  portal/       TENANT PLANE    · /portal/* · read-only, scoped
  data/
    publications.ts   the publication gate — the only door between the two
```

Modules under `portal/` read `data/publications.ts` and never `data/outputs.ts`.
A `Publication` carries its own frozen snapshot of the version that went live,
so there is no path — direct or transitive — from a portal view to an `Output`.

## The two things most likely to be "simplified"

**Approval is not publication.** PRD §6.9 and Arch §9 make these distinct states
with distinct actions. Approving an output signs off on an exact version;
publishing makes it visible in the client portal and notifies the organisation.
Collapsing them turns accidental disclosure into a single mis-click, and with
the manual email step gone there is no human backstop left. Health and
scientific outputs additionally require a recorded expert sign-off *before*
publication — stricter than the internal approval flow.

**Scores are not scalars.** Arch §8.2: component values, the baseline, the
source and creator counts, and the model, prompt, client-profile and domain-pack
versions are all persisted at write time, because they cannot be reconstructed
later. The three scoring axes — domain signal, client rank, confidence — are
kept orthogonal on purpose; conflating importance with confidence is named as
the most common failure mode in trend systems.

## Known gaps

- Interaction state is local `useState` and resets on reload.
- `../backend/` is empty; nothing here talks to a server.
- The Resolution Queue, Ingestion Runs and Tenants screens are new in this pass
  and have had no design review.
