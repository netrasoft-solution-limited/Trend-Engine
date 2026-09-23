#!/usr/bin/env node
/**
 * Render smoke test.
 *
 * Renders every route to a string and fails on a thrown error or an empty
 * document. It does not assert on appearance — it catches the class of mistake
 * a typecheck cannot: data that is shaped correctly but missing at runtime.
 *
 * It also asserts the properties the tenant plane must hold in the markup
 * itself, since those are the ones a well-meaning refactor is most likely to
 * break quietly — and, since both planes now gate on a real (mocked) session,
 * the properties the auth boundary between them must hold too.
 *
 * Run with `npm run render`, or `npm run check` for the full set.
 */
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import { mkdirSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const src = join(root, 'src');
const cacheDir = join(root, 'node_modules', '.cache');
const outfile = join(cacheDir, 'render-smoke.cjs');

mkdirSync(cacheDir, { recursive: true });

// CommonJS, not ESM: react-dom/server is CJS, and bundling it into an ESM
// module leaves dynamic `require` calls that Node cannot resolve.
await build({
  stdin: {
    contents: `
      const { createElement } = require('react');
      const { renderToString } = require('react-dom/server');
      const { MemoryRouter } = require('react-router-dom');
      const { AppRoutes } = require('./src/routes');
      const { ALL_ROUTES } = require('./src/routes.manifest');

      module.exports.ALL_ROUTES = ALL_ROUTES;
      module.exports.render = (route, options) =>
        renderToString(
          createElement(
            MemoryRouter,
            { initialEntries: [route] },
            createElement(AppRoutes, options || {})
          )
        );
    `,
    resolveDir: root,
    loader: 'tsx'
  },
  bundle: true,
  outfile,
  format: 'cjs',
  platform: 'node',
  jsx: 'automatic',
  logLevel: 'silent'
});

const { render, ALL_ROUTES } = createRequire(import.meta.url)(outfile);
process.on('exit', () => rmSync(outfile, { force: true }));

// react-router's Link/NavLink call useLayoutEffect, which React warns about on
// the server. Expected here and unrelated to what this script checks.
const consoleError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('useLayoutEffect does nothing on the server')) return;
  consoleError(...args);
};

let failed = 0;
const rendered = new Map();

// Every content route is authenticated now, on both planes. This is the
// bypass every ALL_ROUTES sweep renders with, so the smoke test still
// exercises real pages — Triage, Dashboard, Sources, and so on — rather than
// a login screen at every URL. `routes.tsx` is the only file that ever wires
// a `testRole` value into a guard; everything below only ever supplies the
// role, never touches the prop itself.
const AUTHENTICATED = { portalRole: 'Org Admin', opsRole: 'Platform Admin' };

console.log('\nRoutes\n');

for (const route of ALL_ROUTES) {
  try {
    const html = render(route, AUTHENTICATED);
    if (html.trim().length < 200) {
      throw new Error(`rendered only ${html.trim().length} characters — the route is probably empty`);
    }
    rendered.set(route, html);
    console.log(`  ok   ${route}`);
  } catch (error) {
    console.log(`  FAIL ${route}\n       ${error.message}`);
    failed++;
  }
}

console.log('\nTenant-plane assertions\n');

function assertion(name, fn) {
  try {
    fn();
    console.log(`  ok   ${name}`);
  } catch (error) {
    console.log(`  FAIL ${name}\n       ${error.message}`);
    failed++;
  }
}

// PRD §6.8: internal review stages never surface to the client.
assertion('the delivery tracker never names an internal review stage', () => {
  const html = rendered.get('/portal/delivery') ?? '';
  const leaked = ['review ready', 'Editorial fit', 'Evidence check', 'Brand voice', 'Final proof', 'drafting'].filter(
    (stage) => html.includes(stage)
  );
  if (leaked.length) {
    throw new Error(`internal stage(s) visible to the client: ${leaked.join(', ')}`);
  }
  if (!html.includes('In preparation')) {
    throw new Error('the collapsed "in preparation" state is missing');
  }
});

// PRD §6.9: a withdrawn publication resolves to nothing, not to an older version.
assertion('a withdrawn publication is not readable', () => {
  const html = rendered.get('/portal/output/PUB-0036') ?? '';
  if (!html.includes('isn’t available')) {
    throw new Error('the withdrawn record rendered content instead of an unavailable notice');
  }
});

// PRD §3.2: an Org Viewer never reaches user management or billing.
assertion('an Org Viewer cannot reach team management or billing', () => {
  for (const route of ['/portal/team', '/portal/subscription']) {
    const html = render(route, { portalRole: 'Org Viewer' });
    if (!html.includes('Not available for your account')) {
      throw new Error(`${route} rendered content for an Org Viewer`);
    }
  }
  // …and the same routes do work for an Org Admin, so the guard is not just
  // refusing everything.
  for (const route of ['/portal/team', '/portal/subscription']) {
    const html = render(route, { portalRole: 'Org Admin' });
    if (html.includes('Not available for your account')) {
      throw new Error(`${route} is blocked for an Org Admin, who should have access`);
    }
  }
});

// PRD §6.8: an Org Admin can act on the team, not just view it.
assertion('the Team page renders for an Org Admin with member actions available', () => {
  const html = rendered.get('/portal/team') ?? '';
  if (html.includes('Not available for your account')) {
    throw new Error('Team was blocked for an Org Admin, who should have access');
  }
  const missing = ['Actions for', 'Remove access', 'Invite someone'].filter((marker) => !html.includes(marker));
  if (missing.length) {
    throw new Error(`Team is missing expected member actions: ${missing.join(', ')}`);
  }
});

// PRD §3.2: tenant onboarding is a Platform Admin capability, not an Operator one.
assertion('an Operator cannot reach Tenants', () => {
  const html = render('/ops/tenants', { opsRole: 'Operator' });
  if (!html.includes('Not available for your role')) {
    throw new Error('Tenants rendered content for an Operator');
  }
  const adminHtml = render('/ops/tenants', { opsRole: 'Platform Admin' });
  if (adminHtml.includes('Not available for your role')) {
    throw new Error('Tenants is blocked for a Platform Admin, who should have access');
  }
});

// PRD §3.1: two separate authentication realms — a signed-out visitor gets a
// login screen, never the content behind it, on either plane.
assertion('signed-out visitors cannot reach /portal or /ops pages', () => {
  const portalHtml = render('/portal');
  if (!portalHtml.includes('Client portal') || portalHtml.includes('Welcome back,')) {
    throw new Error('a signed-out visit to /portal did not render the login screen');
  }
  const opsHtml = render('/ops');
  if (!opsHtml.includes('Operator sign-in') || opsHtml.includes('Triage · home')) {
    throw new Error('a signed-out visit to /ops did not render the login screen');
  }
});

// Arch §5.3: the two planes share no session artifact. A portal session
// supplies nothing `/ops` accepts, and an operator session supplies nothing
// `/portal` accepts — each still falls through to its own real login.
assertion('a portal session cannot reach /ops, and an operator session cannot reach /portal', () => {
  const opsWithPortalSession = render('/ops', { portalRole: 'Org Admin' });
  if (!opsWithPortalSession.includes('Operator sign-in') || opsWithPortalSession.includes('Triage · home')) {
    throw new Error('a portal session reached ops content at /ops');
  }
  const portalWithOpsSession = render('/portal', { opsRole: 'Platform Admin' });
  if (!portalWithOpsSession.includes('Client portal') || portalWithOpsSession.includes('Welcome back,')) {
    throw new Error('an operator session reached portal content at /portal');
  }
});

// The bypass exists for this script alone. If a page or component starts
// passing `testRole` itself, that page has quietly turned its own auth gate
// off for everyone, not just the test runner.
assertion('no file outside routes.tsx passes the testRole prop', () => {
  function walk(dir) {
    return readdirSync(dir).flatMap((entry) => {
      const full = join(dir, entry);
      return statSync(full).isDirectory() ? walk(full) : [full];
    });
  }

  const offenders = walk(src)
    .filter((file) => /\.tsx?$/.test(file))
    .filter((file) => relative(root, file) !== join('src', 'routes.tsx'))
    .filter((file) => /testRole=/.test(readFileSync(file, 'utf8')))
    .map((file) => relative(root, file));

  if (offenders.length) {
    throw new Error(`testRole must only ever be passed from src/routes.tsx:\n       - ${offenders.join('\n       - ')}`);
  }
});

// PRD §3.2 / §6.8: no internal scoring or cost data on the tenant plane.
assertion('no internal scoring or vendor-cost language reaches the portal', () => {
  const forbidden = ['Vendor spend', 'OPERATOR_ALL', 'domainScore', 'Confidence', 'Momentum', 'claims flag'];
  for (const route of ALL_ROUTES.filter((r) => r.startsWith('/portal'))) {
    const html = rendered.get(route) ?? '';
    const leaked = forbidden.filter((term) => html.includes(term));
    if (leaked.length) {
      throw new Error(`${route} exposes: ${leaked.join(', ')}`);
    }
  }
});

if (failed) {
  console.error(`\n${failed} check(s) failed.\n`);
  process.exit(1);
}

console.log(`\nAll ${ALL_ROUTES.length} routes render.\n`);
