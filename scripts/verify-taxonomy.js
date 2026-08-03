#!/usr/bin/env node
/**
 * Verifies the canonical subcategory taxonomy:
 *  1. apps/web/src/data/subcategoryTaxonomy.json (source of truth) and
 *     apps/api/data/subcategoryTaxonomy.json (synced copy) are identical.
 *  2. Structural sanity: 29 unique kebab ids, 29 unique numericIds (1..29),
 *     every domain reference resolves, no duplicate aliases across records.
 *
 * Usage:
 *   node scripts/verify-taxonomy.js          # check (exit 1 on failure)
 *   node scripts/verify-taxonomy.js --fix    # copy web -> api, then check
 */

const fs = require('fs');
const path = require('path');

const WEB = path.join(__dirname, '..', 'apps', 'web', 'src', 'data', 'subcategoryTaxonomy.json');
const API = path.join(__dirname, '..', 'apps', 'api', 'data', 'subcategoryTaxonomy.json');

let failed = false;
const fail = (msg) => { console.error('  ✗ ' + msg); failed = true; };
const ok = (msg) => console.log('  ✓ ' + msg);

if (process.argv.includes('--fix')) {
  fs.mkdirSync(path.dirname(API), { recursive: true });
  fs.copyFileSync(WEB, API);
  console.log('Copied web taxonomy -> apps/api/data/');
}

console.log('Taxonomy drift check:');
const webRaw = fs.readFileSync(WEB, 'utf8');
const apiRaw = fs.existsSync(API) ? fs.readFileSync(API, 'utf8') : null;
if (apiRaw === null) fail('apps/api/data/subcategoryTaxonomy.json missing — run with --fix');
else if (webRaw !== apiRaw) fail('web and api taxonomy files differ — run with --fix');
else ok('web and api copies identical');

console.log('Structural sanity:');
const t = JSON.parse(webRaw);
const subs = t.subcategories || [];
if (subs.length !== 29) fail(`expected 29 subcategories, found ${subs.length}`); else ok('29 subcategories');

const ids = subs.map((s) => s.id);
if (new Set(ids).size !== ids.length) fail('duplicate kebab ids'); else ok('kebab ids unique');

const nums = subs.map((s) => s.numericId).sort((a, b) => a - b);
const expectNums = Array.from({ length: 29 }, (_, i) => i + 1);
if (JSON.stringify(nums) !== JSON.stringify(expectNums)) fail('numericIds are not exactly 1..29'); else ok('numericIds are 1..29');

for (const s of subs) {
  if (!t.domains[s.domain]) fail(`subcategory ${s.id} references unknown domain ${s.domain}`);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(s.id)) fail(`id not kebab-case: ${s.id}`);
}
ok('domain references + kebab format checked');

const aliasOwner = {};
for (const s of subs) {
  for (const a of (s.aliases || []).map((x) => x.toLowerCase())) {
    if (aliasOwner[a] && aliasOwner[a] !== s.id) fail(`alias "${a}" claimed by both ${aliasOwner[a]} and ${s.id}`);
    aliasOwner[a] = s.id;
  }
}
ok('aliases unambiguous');

// Spot-check the historically-conflicted numeric ids (authoring intent = subcategoryConstants ordering)
const expect = { 7: 'rhetorical-synthesis', 8: 'transitions', 9: 'boundaries', 10: 'form-structure-sense', 11: 'linear-equations-one-variable', 12: 'linear-functions', 16: 'nonlinear-functions', 17: 'nonlinear-equations', 18: 'equivalent-expressions' };
for (const [num, id] of Object.entries(expect)) {
  const found = subs.find((s) => s.numericId === parseInt(num, 10));
  if (!found || found.id !== id) fail(`numericId ${num} must map to ${id} (authoring intent), got ${found && found.id}`);
}
ok('historically-conflicted ids (7-12, 16-18) match authoring intent');

if (failed) { console.error('\nTAXONOMY CHECK FAILED'); process.exit(1); }
console.log('\nAll taxonomy checks passed.');
