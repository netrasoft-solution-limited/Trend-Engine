#!/usr/bin/env node
/**
 * Architecture checks for the prototype.
 *
 * The real system enforces these in CI with import-linter and a Django test
 * suite (Arch §5.4, §9.3) — both deployment-blocking. This script is the
 * prototype's equivalent: it fails the build for the same reasons, so the
 * boundary cannot erode quietly while the design is still being drawn.
 *
 * Run with `npm run boundary`, or `npm run check` for the full set.
 */
import { build } from 'esbuild';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const src = join(root, 'src');

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const failures = [];
const checks = [];

function check(name, fn) {
  try {
    fn();
    checks.push(`  ok   ${name}`);
  } catch (error) {
    checks.push(`  FAIL ${name}`);
    failures.push(`${name}\n       ${error.message}`);
  }
}

// ── Arch §9.3 ───────────────────────────────────────────────────────────────
// "A CI test asserts that no module under portal/ imports from outputs/ except
//  via publication/. Architecturally, the gate is the only door."
check('portal/ does not import the output layer', () => {
  const offenders = walk(join(src, 'portal'))
    .filter((file) => /\.tsx?$/.test(file))
    .filter((file) => /from\s+['"][^'"]*data\/outputs['"]/.test(readFileSync(file, 'utf8')))
    .map((file) => relative(root, file));

  if (offenders.length) {
    throw new Error(
      `The portal must resolve content only through data/publications.ts.\n` +
        `       Offending files:\n       - ${offenders.join('\n       - ')}`
    );
  }
});

// The Publication record carries its own snapshot of the published version, so
// there is no transitive path from a portal view to an Output either.
check('publications.ts does not import the output layer', () => {
  const source = readFileSync(join(src, 'data', 'publications.ts'), 'utf8');
  if (/from\s+['"][^'"]*outputs['"]/.test(source)) {
    throw new Error(
      'A Publication must carry its own frozen snapshot of the version that went live.'
    );
  }
});

// ── PRD §6.3 / Arch §8.2 ────────────────────────────────────────────────────
// Executed, not text-scanned: `signals.ts` and `clientScores.ts` are bundled
// and imported for real, so these checks read the same objects the UI does
// and cannot drift out of sync with either file's formatting.
const EXPECTED_DOMAIN_WEIGHTS = {
  Momentum: 0.25,
  Acceleration: 0.2,
  'Source diversity': 0.15,
  'Evidence quality': 0.15,
  Engagement: 0.1,
  Novelty: 0.1,
  Recency: 0.05
};

// PRD §6.3: confidence's own components — evidence quantity, independent
// sources, extraction certainty, transcript completeness, authority,
// contradiction ratio, and stability across runs.
const EXPECTED_CONFIDENCE_WEIGHTS = {
  'Evidence quantity': 0.2,
  'Independent sources': 0.2,
  'Extraction certainty': 0.15,
  'Transcript completeness': 0.15,
  Authority: 0.15,
  'Contradiction ratio': 0.1,
  'Stability across runs': 0.05
};

const EXPECTED_CLIENT_WEIGHTS = {
  'Domain signal': 0.6,
  'Asset / offer relevance': 0.2,
  'Audience fit': 0.1,
  'Strategic priority': 0.1
};

const bundle = await build({
  stdin: {
    contents: `
      export { signals } from './src/data/signals';
      export { clientSignalScores } from './src/data/clientScores';
    `,
    // fileURLToPath, not .pathname — the project path may contain spaces.
    resolveDir: root,
    loader: 'ts'
  },
  bundle: true,
  write: false,
  format: 'esm',
  platform: 'node',
  logLevel: 'silent'
});

const { signals, clientSignalScores } = await import(
  `data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`
);

/** Checks every component in `items[].[componentsKey]` against `expected`, by label. */
function checkWeights(items, componentsKey, expected, idOf) {
  const wrong = [];
  for (const item of items) {
    const found = new Set(item[componentsKey].map((c) => c.label));
    for (const component of item[componentsKey]) {
      if (!(component.label in expected)) {
        wrong.push(`${idOf(item)}: unknown component "${component.label}"`);
      } else if (component.weight !== expected[component.label]) {
        wrong.push(`${idOf(item)}: ${component.label} weight ${component.weight}, expected ${expected[component.label]}`);
      }
    }
    for (const label of Object.keys(expected)) {
      if (!found.has(label)) wrong.push(`${idOf(item)}: missing component "${label}"`);
    }
  }
  if (wrong.length) throw new Error(wrong.join('\n       '));
}

check('domain weights match PRD §6.3', () => {
  checkWeights(signals, 'breakdown', EXPECTED_DOMAIN_WEIGHTS, (s) => s.id);
});

check('confidence weights match PRD §6.3', () => {
  checkWeights(signals, 'confidenceBreakdown', EXPECTED_CONFIDENCE_WEIGHTS, (s) => s.id);
});

check('client weights match PRD §6.3', () => {
  checkWeights(clientSignalScores, 'clientBreakdown', EXPECTED_CLIENT_WEIGHTS, (c) => `${c.signalId}/${c.orgId}`);
});

/** Arch §8.2: a headline score that cannot be reconstructed from its own persisted components is not explainable. */
function checkReconciliation(items, componentsKey, headlineKey, idOf) {
  const wrong = [];
  for (const item of items) {
    const total = Math.round(item[componentsKey].reduce((sum, c) => sum + c.value * c.weight, 0));
    if (total !== item[headlineKey]) {
      wrong.push(`${idOf(item)}: headline ${item[headlineKey]}, components sum to ${total}`);
    }
  }
  if (wrong.length) {
    throw new Error(
      'Arch §8.2 — a headline score that cannot be reconstructed from its own ' +
        'components is not explainable.\n       ' +
        wrong.join('\n       ')
    );
  }
}

check('every signal domain score matches its own weighted components', () => {
  checkReconciliation(signals, 'breakdown', 'domainScore', (s) => s.id);
});

check('every signal confidence matches its own weighted components', () => {
  checkReconciliation(signals, 'confidenceBreakdown', 'confidence', (s) => s.id);
});

check('every client score matches its own weighted components', () => {
  checkReconciliation(clientSignalScores, 'clientBreakdown', 'clientFit', (c) => `${c.signalId}/${c.orgId}`);
});

// PRD §14: "one public signal receives different scores for Jarrow and the
// second-client fixture" — the architecture proof this fixture exists for.
check('the second-tenant fixture scores at least one shared signal differently than Jarrow', () => {
  const shared = signals.filter((s) =>
    clientSignalScores.some((c) => c.signalId === s.id && c.orgId === 'org-jarrow') &&
    clientSignalScores.some((c) => c.signalId === s.id && c.orgId === 'org-fixture-second')
  );
  if (shared.length === 0) {
    throw new Error('No signal has both an org-jarrow and an org-fixture-second ClientSignalScore to compare.');
  }
  const identical = shared.filter((s) => {
    const jarrow = clientSignalScores.find((c) => c.signalId === s.id && c.orgId === 'org-jarrow');
    const fixture = clientSignalScores.find((c) => c.signalId === s.id && c.orgId === 'org-fixture-second');
    return jarrow.clientFit === fixture.clientFit;
  });
  if (identical.length === shared.length) {
    throw new Error(`${identical.map((s) => s.id).join(', ')}: identical clientFit for both tenants — tenancy scoring proves nothing if the numbers match.`);
  }
});

// ── PRD §6.5 / §6.9 ─────────────────────────────────────────────────────────
check('OutputState carries `published` and not `exported`', () => {
  const types = readFileSync(join(src, 'types', 'index.ts'), 'utf8');
  const machine = types.slice(types.indexOf('export type OutputState'));
  const body = machine.slice(0, machine.indexOf(';'));

  if (!body.includes("'published'")) {
    throw new Error('Publication is a distinct state from approval — PRD §6.9.');
  }
  if (body.includes("'exported'")) {
    throw new Error('Export is an action on an approved version, not a state.');
  }
});

console.log('\nArchitecture checks\n');
console.log(checks.join('\n'));

if (failures.length) {
  console.error(`\n${failures.length} check(s) failed:\n`);
  for (const failure of failures) console.error(`  ✗  ${failure}\n`);
  process.exit(1);
}

console.log('\nAll checks passed.\n');
