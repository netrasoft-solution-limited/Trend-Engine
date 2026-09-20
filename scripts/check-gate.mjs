#!/usr/bin/env node
/**
 * Publication-gate behaviour checks.
 *
 * Arch §9 calls the publication gate "the most safety-critical component in the
 * system, and the one most likely to be 'simplified' by someone who doesn't see
 * why it exists". These assertions state what it is for, so a change that
 * collapses approval into publication fails here rather than shipping quietly.
 *
 * Unlike `check-boundary.mjs`, which reads source text, this actually executes
 * the data layer. It bundles the TypeScript with esbuild (already present as a
 * Vite dependency) so it needs no extra tooling.
 *
 * Run with `npm run gate`, or `npm run check` for the full set.
 */
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

const bundle = await build({
  stdin: {
    contents: `
      export { publicationsForOrg, publicationHistoryForOrg, TenantScopeError }
        from './src/data/publications';
      export { recentOutputs } from './src/data/outputs';
    `,
    // fileURLToPath, not .pathname — the project path may contain spaces.
    resolveDir: fileURLToPath(new URL('..', import.meta.url)),
    loader: 'ts'
  },
  bundle: true,
  write: false,
  format: 'esm',
  platform: 'node',
  logLevel: 'silent'
});

const { publicationsForOrg, publicationHistoryForOrg, TenantScopeError, recentOutputs } = await import(
  `data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`
);

let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ok   ${name}`);
  } catch (error) {
    console.log(`  FAIL ${name}\n       ${error.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const jarrow = publicationsForOrg('org-jarrow');

console.log('\nPublication gate\n');

// PRD §6.9: "Approved ... does not make the output visible to the client."
test('approved-but-unpublished outputs are NOT client-visible', () => {
  const approved = recentOutputs.filter((o) => o.state === 'approved');
  assert(approved.length > 0, 'no approved output in the fixture to test with');
  for (const output of approved) {
    assert(
      !jarrow.some((p) => p.outputId === output.id),
      `${output.id} is only approved, but it is reachable in the portal`
    );
  }
});

test('published outputs ARE client-visible', () => {
  const published = recentOutputs.filter((o) => o.state === 'published');
  assert(published.length > 0, 'no published output in the fixture');
  assert(
    published.some((o) => jarrow.some((p) => p.outputId === o.id)),
    'no published output resolves to a Publication record'
  );
});

// PRD §6.9: publication must be reversible.
test('withdrawn publications are excluded', () => {
  const withdrawn = publicationHistoryForOrg('org-jarrow').filter((p) => p.unpublishedAt);
  assert(withdrawn.length > 0, 'no withdrawn record in the fixture');
  for (const record of withdrawn) {
    assert(!jarrow.some((p) => p.id === record.id), `${record.id} was withdrawn but is still visible`);
  }
});

// PRD §7.4 / Arch §5.4: scope-leakage.
test("another tenant's publications never appear", () => {
  assert(
    jarrow.every((p) => p.orgId === 'org-jarrow'),
    'a publication belonging to another organisation leaked into the Jarrow list'
  );
  const other = publicationsForOrg('org-fixture-second');
  assert(other.length > 0, 'the fixture tenant has no publications to cross-check against');
  assert(!other.some((p) => jarrow.some((j) => j.id === p.id)), 'overlap between two tenants');
});

// Arch §5.2: unscoped access is a loud failure, never a silent full-table scan.
test('unscoped access raises TenantScopeError', () => {
  let raised = false;
  try {
    publicationsForOrg(null);
  } catch (error) {
    raised = error instanceof TenantScopeError;
  }
  assert(raised, 'an unscoped read returned rows instead of failing loudly');
});

if (failed) {
  console.error(`\n${failed} check(s) failed.\n`);
  process.exit(1);
}

console.log('\nThe gate behaves as specified.\n');
