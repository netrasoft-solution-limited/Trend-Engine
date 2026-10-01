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

/*
 * WHAT THIS FILE NO LONGER ASSERTS, AND WHERE THOSE PROPERTIES LIVE NOW
 *
 * The portal pages read the API. Server-side rendering runs no effects, so
 * their markup holds a loading frame, not rows — there is nothing here to make
 * a claim about. The content properties these checks used to cover (a withdrawn
 * publication resolving to nothing, one live version per output, a second
 * tenant's rows being unreachable) are asserted against the real database and
 * real HTTP instead:
 *
 *   backend/tests/publication/test_publication_boundary.py   pytest -m publication
 *   backend/scripts/smoke-portal-api.sh                      over real HTTP
 *
 * That is a better place for them: they were always claims about the server's
 * behaviour, and a fixture could only ever imitate it. What stays here is what
 * only the client can get wrong — which plane a session reaches, and which
 * role sees which screen.
 */

// PRD §6.8: internal review stages never surface to the client. The collapse
// happens server-side, but the client must not re-introduce the vocabulary.
assertion('the delivery tracker never names an internal review stage', () => {
  const html = rendered.get('/portal/delivery') ?? '';
  const leaked = ['review ready', 'Editorial fit', 'Evidence check', 'Brand voice', 'Final proof', 'drafting'].filter(
    (stage) => html.includes(stage)
  );
  if (leaked.length) {
    throw new Error(`internal stage(s) visible to the client: ${leaked.join(', ')}`);
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
});

// The same two screens must work for the role that owns them, or the check
// above would pass just as well on a page that is broken for everyone.
assertion('an Org Admin can reach team management and billing', () => {
  for (const route of ['/portal/team', '/portal/subscription']) {
    const html = render(route, { portalRole: 'Org Admin' });
    if (html.includes('Not available for your account')) {
      throw new Error(`${route} is blocked for an Org Admin, who should have access`);
    }
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
  // PortalShell fetches its session, and renderToString runs no effects, so a
  // signed-out render stops at the loading frame instead of the redirect. What
  // must hold either way is that no tenant content is in the markup.
  const portalHtml = render('/portal');
  if (portalHtml.includes('Published to ')) {
    throw new Error('a signed-out visit to /portal rendered tenant content');
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
  if (portalWithOpsSession.includes('Published to ')) {
    throw new Error('an operator session reached portal content at /portal');
  }
});

// The bypass above is the only thing standing between a render sweep and a
// wall of login screens, so it must exist in exactly one place.
assertion('only routes.tsx wires a testRole into a guard', () => {
  const offenders = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        walk(full);
        continue;
      }
      if (!/\.tsx?$/.test(full)) continue;
      const rel = relative(root, full);
      if (rel.endsWith('routes.tsx')) continue;
      const text = readFileSync(full, 'utf8');
      if (/testRole=\{/.test(text)) offenders.push(rel);
    }
  };
  walk(src);
  if (offenders.length) {
    throw new Error(`testRole wired outside routes.tsx: ${offenders.join(', ')}`);
  }
});

console.log(
  failed === 0
    ? `\nAll routes rendered and ${'' + ''}every plane assertion held.\n`
    : `\n${failed} check(s) failed.\n`
);
process.exit(failed === 0 ? 0 : 1);
