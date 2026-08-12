#!/usr/bin/env node
/**
 * Validator for the 2026 Boundaries question refresh.
 *
 *   node scripts/validateBoundariesRefresh.js          # summary + failures
 *   node scripts/validateBoundariesRefresh.js --print  # also print every reconstructed item
 *
 * Checks the authored set in scripts/data/boundaries-refresh-2026/src against the
 * measured targets in BOUNDARIES_STYLE_SPEC.md. Exits non-zero on any hard failure.
 */

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'data', 'boundaries-refresh-2026', 'src');
const FILES = [
  'bnd-01-easy-a.json',
  'bnd-02-easy-b.json',
  'bnd-03-medium-a.json',
  'bnd-04-medium-b.json',
  'bnd-05-medium-c.json',
  'bnd-06-hard-a.json',
  'bnd-07-hard-b.json',
];

const LETTERS = ['A', 'B', 'C', 'D'];
const BLANK = '______';

// Measured bands from the 211-item official export (spec §1)
const LENGTH_BAND = { easy: [26, 56], medium: [34, 66], hard: [38, 66] };
const TARGET_DIFFICULTY = { easy: 30, medium: 40, hard: 30 };

// Official "The convention being tested is ___" vocabulary (spec §6)
const CONVENTIONS = new Set([
  'punctuation use between sentences',
  'end-of-sentence punctuation',
  'the coordination of main clauses within a sentence',
  'the punctuation of a supplementary element within a sentence',
  'punctuation between a subject and a verb',
  'punctuation use between a subject and a verb',
  'punctuation use between a verb and its object',
  'punctuation use between a verb and its complement',
  'punctuation use between a preposition and its complement',
  'the use of a colon within a sentence',
  'the punctuation of elements in a complex series',
  'the punctuation of items in a series',
  'the use and punctuation of an integrated relative clause',
  'punctuation between a subordinate clause and a main clause',
  'the use of punctuation between titles and proper nouns',
  'punctuation between coordinates in a sentence',
  'the use of punctuation within a sentence',
]);

const errors = [];
const warnings = [];
const fail = (id, msg) => errors.push(`${id}: ${msg}`);
const warn = (id, msg) => warnings.push(`${id}: ${msg}`);

// ---------------------------------------------------------------- load
let items = [];
for (const f of FILES) {
  const p = path.join(SRC, f);
  if (!fs.existsSync(p)) { errors.push(`MISSING FILE ${f}`); continue; }
  let parsed;
  try { parsed = JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch (e) { errors.push(`${f}: invalid JSON — ${e.message}`); continue; }
  if (!Array.isArray(parsed)) { errors.push(`${f}: expected an array`); continue; }
  parsed.forEach((it) => items.push({ ...it, _file: f }));
}

// ---------------------------------------------------------------- helpers
const words = (s) => s.replace(BLANK, 'x').trim().split(/\s+/).filter(Boolean).length;
const marksOf = (opt) => {
  const m = opt.match(/[,;:.?—-]/g);
  return m ? Array.from(new Set(m)) : [];
};
const markClass = (opt) => {
  const m = marksOf(opt).filter((c) => c !== '-');
  if (!m.length) return 'none';
  if (m.includes('?')) return 'question mark';
  if (m.includes(':')) return 'colon';
  if (m.includes(';')) return 'semicolon';
  if (m.includes('.')) return 'period';
  if (m.includes('—')) return 'dash';
  if (m.includes(',')) return 'comma';
  return 'none';
};
const reconstruct = (it) => it.passage.replace(BLANK, it.options[it.key]);

// ---------------------------------------------------------------- per-item
const seenIds = new Set();
items.forEach((it) => {
  const id = it.id || '(no id)';
  if (seenIds.has(id)) fail(id, 'duplicate id');
  seenIds.add(id);

  ['difficulty', 'family', 'convention', 'keyMark', 'lane', 'passage', 'options', 'why', 'rebuttals', 'remember']
    .forEach((k) => { if (it[k] === undefined) fail(id, `missing field "${k}"`); });

  if (!Array.isArray(it.options) || it.options.length !== 4) fail(id, 'must have exactly 4 options');
  if (!(it.key >= 0 && it.key <= 3)) fail(id, `key out of range (${it.key})`);
  if (new Set(it.options).size !== 4) fail(id, 'duplicate option strings');
  it.options.forEach((o, i) => { if (!o || !o.trim()) fail(id, `option ${LETTERS[i]} is empty`); });

  const blanks = (it.passage.match(/______/g) || []).length;
  if (blanks !== 1) fail(id, `passage must contain exactly one blank (found ${blanks})`);

  // rebuttals cover exactly the three non-key letters
  const keyLetter = LETTERS[it.key];
  const expect = LETTERS.filter((l) => l !== keyLetter).sort().join('');
  const got = Object.keys(it.rebuttals || {}).sort().join('');
  if (expect !== got) fail(id, `rebuttals should be {${expect}}, got {${got}}`);
  Object.entries(it.rebuttals || {}).forEach(([l, r]) => {
    if (/^\s*(Choice|It is|This)/.test(r)) warn(id, `rebuttal ${l} should be the clause that follows "Choice X is incorrect because"`);
    if (/sounds|flow|awkward|pause|breath/i.test(r)) fail(id, `rebuttal ${l} uses a prohibited ear-based justification`);
  });

  // affirmative rationale voice
  if (!new RegExp(`^Choice ${keyLetter} is the best answer\\. The convention being tested is `).test(it.why || '')) {
    fail(id, 'why must open "Choice {L} is the best answer. The convention being tested is …"');
  }
  if (!(it.why || '').includes(it.convention)) fail(id, 'why does not name the declared convention');
  if (!CONVENTIONS.has(it.convention)) fail(id, `convention "${it.convention}" is not in the official vocabulary`);

  // declared keyMark agrees with the key option
  const actual = markClass(it.options[it.key]);
  const declared = it.keyMark === 'question mark' ? 'question mark' : it.keyMark;
  if (actual !== declared) fail(id, `keyMark declared "${declared}" but key option "${it.options[it.key]}" reads as "${actual}"`);

  // passage length band
  const band = LENGTH_BAND[it.difficulty];
  const w = words(it.passage);
  if (band && (w < band[0] || w > band[1])) fail(id, `passage is ${w} words, outside the ${it.difficulty} band ${band[0]}–${band[1]}`);

  // spec §5.9 rule 1 — no clause-joining period and semicolon in the same option set
  const classes = it.options.map(markClass);
  const hasPeriod = classes.includes('period');
  const hasSemi = classes.includes('semicolon');
  const exempt = it.family === 'series' || it.family === 'colon' || it.family === 'interrogative';
  if (hasPeriod && hasSemi && !exempt) {
    fail(id, 'option set offers both a period and a semicolon at a clause boundary — two defensible answers');
  }

  // every option must produce a well-formed sentence stream: a period inside the
  // reconstructed passage must be followed by a capital. Catches boundary-menu
  // items whose period option leaves the next sentence starting lowercase.
  it.options.forEach((o, i) => {
    const full = it.passage.replace(BLANK, o);
    const m = full.match(/[.?]\s+([a-z])/);
    if (m) fail(id, `option ${LETTERS[i]} ("${o}") yields a sentence starting lowercase: "…${m[0].trim()}…"`);
  });

  // hard items should carry comma camouflage
  const commaNoise = (it.passage.match(/,/g) || []).length;
  it._commaNoise = commaNoise;
  if (it.difficulty === 'easy' && commaNoise > 3) warn(id, `easy item carries ${commaNoise} commas (spec says ≤2, tolerate 3)`);
});

// ---------------------------------------------------------------- set-level
const count = (arr, f) => arr.reduce((m, x) => { const k = f(x); m[k] = (m[k] || 0) + 1; return m; }, {});

const byDiff = count(items, (i) => i.difficulty);
Object.entries(TARGET_DIFFICULTY).forEach(([d, n]) => {
  if ((byDiff[d] || 0) !== n) errors.push(`difficulty ${d}: expected ${n}, got ${byDiff[d] || 0}`);
});
if (items.length !== 100) errors.push(`expected 100 items, got ${items.length}`);

const byLetter = count(items, (i) => LETTERS[i.key]);
LETTERS.forEach((l) => { if (byLetter[l] !== 25) errors.push(`answer key ${l}: expected 25, got ${byLetter[l] || 0}`); });

for (let i = 2; i < items.length; i++) {
  if (items[i].key === items[i - 1].key && items[i].key === items[i - 2].key) {
    errors.push(`three consecutive ${LETTERS[items[i].key]} keys at ${items[i - 2].id}–${items[i].id}`);
  }
}

// no reuse of official proper nouns
const nounPath = path.join(SRC, 'official-proper-nouns.json');
if (fs.existsSync(nounPath)) {
  const official = JSON.parse(fs.readFileSync(nounPath, 'utf8'))
    .filter((n) => n.length > 4 && n.includes(' '));   // multiword names only; single words are too noisy
  const blob = items.map((i) => i.passage).join(' ');
  official.forEach((n) => { if (blob.includes(n)) errors.push(`reuses official proper noun "${n}"`); });
}

// no shared 8-gram with any official passage
const idxPath = path.join(SRC, 'official-passages-index.json');
if (fs.existsSync(idxPath)) {
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean);
  const grams = new Set();
  JSON.parse(fs.readFileSync(idxPath, 'utf8')).forEach((o) => {
    const t = norm(o.passage);
    for (let i = 0; i + 8 <= t.length; i++) grams.add(t.slice(i, i + 8).join(' '));
  });
  items.forEach((it) => {
    const t = norm(it.passage);
    for (let i = 0; i + 8 <= t.length; i++) {
      const g = t.slice(i, i + 8).join(' ');
      if (grams.has(g)) fail(it.id, `shares an 8-gram with an official item: "${g}"`);
    }
  });
}

// ---------------------------------------------------------------- report
const table = (title, obj) => {
  console.log(`\n${title}`);
  Object.entries(obj).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  ${String(v).padStart(4)}  ${k}`));
};

console.log(`Boundaries refresh — ${items.length} items from ${FILES.length} files`);
table('Difficulty', byDiff);
table('Answer key', byLetter);
table('Family', count(items, (i) => i.family));
table('Keyed mark', count(items, (i) => `${i.keyMark}`));
table('Option menu', count(items, (i) => i.menu || '(none)'));
table('Topic lane', count(items, (i) => i.lane));

['easy', 'medium', 'hard'].forEach((d) => {
  const set = items.filter((i) => i.difficulty === d);
  const w = set.map((i) => words(i.passage));
  const c = set.map((i) => i._commaNoise);
  const mean = (a) => (a.reduce((x, y) => x + y, 0) / a.length).toFixed(1);
  console.log(`\n${d}: n=${set.length}  words mean=${mean(w)} min=${Math.min(...w)} max=${Math.max(...w)}   commas mean=${mean(c)}`);
  console.log(`  keyed marks: ${JSON.stringify(count(set, (i) => i.keyMark))}`);
});

if (process.argv.includes('--print')) {
  console.log('\n================ RECONSTRUCTED ITEMS ================');
  items.forEach((it) => {
    console.log(`\n--- ${it.id} [${it.difficulty}/${it.family}/key ${LETTERS[it.key]} = ${it.keyMark}]`);
    console.log(reconstruct(it));
    console.log(`   ${it.options.map((o, i) => `${LETTERS[i]}. ${o}`).join('   ')}`);
  });
}

console.log('\n----------------------------------------------------');
if (warnings.length) { console.log(`\n${warnings.length} warning(s):`); warnings.forEach((w) => console.log('  ⚠ ' + w)); }
if (errors.length) {
  console.log(`\n${errors.length} ERROR(S):`);
  errors.forEach((e) => console.log('  ✗ ' + e));
  process.exit(1);
}
console.log('\n✓ All checks passed.');
