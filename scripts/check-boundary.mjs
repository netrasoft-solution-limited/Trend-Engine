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

// ── PRD §6.3 ────────────────────────────────────────────────────────────────
// The weights drifted from the PRD once already. Assert them so it is a build
// failure rather than something a reader has to notice.
const EXPECTED_DOMAIN_WEIGHTS = {
  Momentum: 0.25,
  Acceleration: 0.2,
  'Source diversity': 0.15,
  'Evidence quality': 0.15,
  Engagement: 0.1,
  Novelty: 0.1,
  Recency: 0.05
};

const EXPECTED_CLIENT_WEIGHTS = {
  'Domain signal': 0.6,
  'Asset / offer relevance': 0.2,
  'Audience fit': 0.1,
  'Strategic priority': 0.1
};

const signalsSource = readFileSync(join(src, 'data', 'signals.ts'), 'utf8');

function componentWeights(source) {
  const found = new Map();
  const pattern = /\{\s*label:\s*'([^']+)',\s*value:\s*(\d+),\s*weight:\s*([\d.]+)/g;
  let match;
  while ((match = pattern.exec(source)) !== null) {
    const [, label, , weight] = match;
    if (!found.has(label)) found.set(label, new Set());
    found.get(label).add(Number(weight));
  }
  return found;
}

check('domain and client weights match PRD §6.3', () => {
  const found = componentWeights(signalsSource);
  const expected = { ...EXPECTED_DOMAIN_WEIGHTS, ...EXPECTED_CLIENT_WEIGHTS };
  const wrong = [];

  for (const [label, weights] of found) {
    if (!(label in expected)) {
      wrong.push(`unknown component "${label}"`);
      continue;
    }
    for (const weight of weights) {
      if (weight !== expected[label]) {
        wrong.push(`${label}: found ${weight}, expected ${expected[label]}`);
      }
    }
  }

  for (const label of Object.keys(expected)) {
    if (!found.has(label)) wrong.push(`missing component "${label}"`);
  }

  if (wrong.length) {
    throw new Error(wrong.join('\n       '));
  }
});

check('every signal headline matches its own weighted components', () => {
  // Each signal block: domainScore, then its breakdown array.
  const blocks = signalsSource.split(/\n  \{\n    id: 'SIG-/).slice(1);
  const wrong = [];

  for (const block of blocks) {
    const id = `SIG-${block.slice(0, 4)}`;
    const headline = Number(/domainScore:\s*(\d+)/.exec(block)?.[1]);
    const breakdown = block.slice(
      block.indexOf('breakdown: ['),
      block.indexOf('clientBreakdown: [')
    );

    let total = 0;
    const pattern = /value:\s*(\d+),\s*weight:\s*([\d.]+)/g;
    let match;
    while ((match = pattern.exec(breakdown)) !== null) {
      total += Number(match[1]) * Number(match[2]);
    }

    if (Math.round(total) !== headline) {
      wrong.push(`${id}: headline ${headline}, components sum to ${Math.round(total)}`);
    }
  }

  if (wrong.length) {
    throw new Error(
      'Arch §8.2 — a headline score that cannot be reconstructed from its own ' +
        'components is not explainable.\n       ' +
        wrong.join('\n       ')
    );
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
