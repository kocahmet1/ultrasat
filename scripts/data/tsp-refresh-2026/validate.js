#!/usr/bin/env node
/**
 * Validate the Text Structure and Purpose refresh set against TSP_STYLE_SPEC.md.
 *
 *   node scripts/data/tsp-refresh-2026/validate.js
 *   node scripts/data/tsp-refresh-2026/validate.js --verbose
 *
 * Every threshold here is one of the measured numbers in the spec. Errors block the build;
 * warnings are for review.
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, 'src');
const OFFICIAL_NOUNS = path.join(__dirname, 'official_proper_nouns.json');
const LETTERS = ['A', 'B', 'C', 'D'];
const VERBOSE = process.argv.includes('--verbose');

const errors = [];
const warnings = [];
const err = (id, msg) => errors.push(`${id}: ${msg}`);
const warn = (id, msg) => warnings.push(`${id}: ${msg}`);

const words = (s) => String(s).replace(/\[\/?UNDERLINED\]/g, ' ').match(/[\w’'-]+/g)?.length || 0;

// --- targets from the spec ------------------------------------------------------------

const TARGET_DIFFICULTY = { easy: 30, medium: 40, hard: 30 };
const TARGET_SUBTYPE = { function: 44, purpose: 36, structure: 20 };
const TARGET_GENRE = { expository: 66, literature: 23, poetry: 8, 'historical-excerpt': 3 };
const TARGET_KEY = { A: 25, B: 25, C: 25, D: 25 };

// Passage word bands, [min, max]. Genre matters more than subtype here: measured across the
// 149 official items, expository passages run 60–126 words, prose excerpts 45–146, and poetry
// 48–101. Applying one band to all three is what produced spurious flags on verse.
const PASSAGE_BAND_EXPOSITORY = {
  'function|easy': [45, 110], 'function|medium': [60, 105], 'function|hard': [75, 132],
  'purpose|easy': [48, 127], 'purpose|medium': [60, 145], 'purpose|hard': [76, 122],
  'structure|easy': [66, 106], 'structure|medium': [60, 146], 'structure|hard': [78, 115],
};
const PASSAGE_BAND_BY_GENRE = {
  literature: { easy: [45, 127], medium: [70, 146], hard: [76, 140] },
  'historical-excerpt': { easy: [45, 127], medium: [60, 146], hard: [76, 140] },
  poetry: { easy: [40, 101], medium: [40, 101], hard: [40, 101] },
};

// Mean option length bands, [min, max] — the measured per-item min and max in each bucket.
const OPTION_BAND = {
  'function|easy': [6, 20], 'function|medium': [9, 23], 'function|hard': [12, 33],
  'purpose|easy': [6, 18], 'purpose|medium': [8, 23], 'purpose|hard': [10, 27],
  'structure|easy': [11, 24], 'structure|medium': [11, 30], 'structure|hard': [22, 39],
};

const OPTION_OPENERS = {
  function: [/^It /, /^They /, /^To /],
  purpose: [/^To /, /^It /],
  structure: [/^It /, /^The text /, /^The speaker /],
};

// Proper nouns from the official export that are ordinary English and safe to reuse.
const NOUN_ALLOWLIST = new Set([
  'Black', 'United States', 'Indigenous', 'Europe', 'European', 'American', 'Americans',
  'North', 'South', 'East', 'West', 'Earth', 'Arctic', 'Antarctic', 'Antarctica',
  'English', 'Spanish', 'French', 'Chinese', 'Japanese', 'Indian', 'Great', 'World War',
  'Pacific', 'Atlantic', 'Northwest', 'Southeast Asia', 'Canada', 'Mexico', 'France',
  'London', 'Rome', 'Texas', 'California', 'Israel', 'Arabic', 'Day', 'There', 'Where',
  'Just', 'Oh', 'My', 'We', 'He', 'She', 'Mr', 'Mrs', 'Generally', 'Typically',
]);

// --- load -----------------------------------------------------------------------------

const files = fs.readdirSync(SRC_DIR).filter((f) => f.endsWith('.json')).sort();
const items = [];
files.forEach((f) => {
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(path.join(SRC_DIR, f), 'utf8'));
  } catch (e) {
    errors.push(`${f}: invalid JSON — ${e.message}`);
    return;
  }
  parsed.forEach((it) => items.push({ ...it, _file: f }));
});

if (!items.length) {
  console.error('No items found.');
  process.exit(1);
}

// --- per-item checks ------------------------------------------------------------------

const ids = new Set();
items.forEach((it) => {
  const id = it.id || '(no id)';

  ['id', 'subtype', 'difficulty', 'genre', 'stem', 'passage', 'options', 'key', 'why', 'rebuttals', 'remember']
    .forEach((f) => { if (it[f] === undefined) err(id, `missing field "${f}"`); });

  if (ids.has(it.id)) err(id, 'duplicate id');
  ids.add(it.id);

  if (!Array.isArray(it.options) || it.options.length !== 4) { err(id, 'needs exactly 4 options'); return; }
  if (!Number.isInteger(it.key) || it.key < 0 || it.key > 3) { err(id, `bad key ${it.key}`); return; }
  if (new Set(it.options).size !== 4) err(id, 'duplicate option text');

  const keyLetter = LETTERS[it.key];
  const wrongLetters = LETTERS.filter((L) => L !== keyLetter);

  // rebuttals must address exactly the three wrong choices
  const rk = Object.keys(it.rebuttals || {}).map((k) => k.trim().toUpperCase()).sort();
  if (rk.join('') !== wrongLetters.slice().sort().join('')) {
    err(id, `rebuttal letters [${rk}] do not match the three wrong choices [${wrongLetters}] (key is ${keyLetter})`);
  }
  Object.entries(it.rebuttals || {}).forEach(([L, txt]) => {
    if (!txt || String(txt).trim().length < 40) err(id, `rebuttal ${L} is too short to name a mechanism`);
    if (/less precise|too broad|not the best|doesn't fit as well|does not fit as well/i.test(txt)) {
      err(id, `rebuttal ${L} uses a banned non-mechanism ("less precise" / "too broad" / "not the best")`);
    }
  });

  // families keys must be wrong letters only
  Object.keys(it.families || {}).forEach((L) => {
    const U = L.trim().toUpperCase();
    if (U === keyLetter) err(id, `families lists the key letter ${U}`);
    else if (!wrongLetters.includes(U)) err(id, `families lists unknown letter ${U}`);
  });

  // stem / subtype agreement
  const s = it.stem || '';
  const inferred = /underlined|first sentence|second sentence|third sentence/i.test(s) ? 'function'
    : /structure/i.test(s) ? 'structure' : 'purpose';
  if (inferred !== it.subtype) err(id, `stem implies subtype "${inferred}" but item says "${it.subtype}"`);
  if (!/\?$/.test(s.trim())) err(id, 'stem must end in a question mark');

  // banned stem shapes
  if (/\bNOT\b|\bEXCEPT\b/.test(s)) err(id, 'NOT/EXCEPT stems are prohibited');
  it.options.forEach((o, i) => {
    if (/^[A-D][.)]\s/.test(o)) err(id, `option ${LETTERS[i]} carries a letter prefix`);
    if (/all of the above|none of the above/i.test(o)) err(id, `option ${LETTERS[i]} uses all/none of the above`);
  });

  // option syntax parallelism
  const openers = OPTION_OPENERS[it.subtype] || [];
  const matched = it.options.map((o) => openers.findIndex((re) => re.test(o)));
  if (matched.some((m) => m === -1)) {
    err(id, `option openings are not in the allowed set for ${it.subtype}: ${JSON.stringify(it.options.map((o) => o.split(' ').slice(0, 2).join(' ')))}`);
  } else if (new Set(matched).size > 1) {
    err(id, 'options mix subjects (e.g. "It …" with "To …"); all four must share one');
  }

  // lengths
  const genreBands = PASSAGE_BAND_BY_GENRE[it.genre];
  const band = genreBands ? genreBands[it.difficulty] : PASSAGE_BAND_EXPOSITORY[`${it.subtype}|${it.difficulty}`];
  const label = genreBands ? `${it.genre}/${it.difficulty}` : `${it.subtype}/${it.difficulty}`;
  const pw = words(it.passage);
  if (band && (pw < band[0] || pw > band[1])) {
    warn(id, `passage is ${pw} words, outside the ${label} band ${band[0]}–${band[1]}`);
  }

  const ow = it.options.map(words);
  const mean = ow.reduce((a, b) => a + b, 0) / 4;
  const oband = OPTION_BAND[`${it.subtype}|${it.difficulty}`];
  if (oband && (mean < oband[0] || mean > oband[1])) {
    warn(id, `mean option length ${mean.toFixed(1)} words, outside the ${it.subtype}/${it.difficulty} band ${oband[0]}–${oband[1]}`);
  }
  if (Math.max(...ow) / Math.min(...ow) > 1.6) {
    warn(id, `option lengths uneven: ${ow.join('/')} words — the longest is a tell`);
  }

  // underline integrity
  const hasMarkup = /\[UNDERLINED\]/.test(it.passage);
  if (it.subtype === 'function') {
    if (!hasMarkup) err(id, 'function item has no [UNDERLINED] span in the passage');
    const opens = (it.passage.match(/\[UNDERLINED\]/g) || []).length;
    const closes = (it.passage.match(/\[\/UNDERLINED\]/g) || []).length;
    if (opens !== closes) err(id, `unbalanced underline markup (${opens} open, ${closes} close)`);
    const spans = [...it.passage.matchAll(/\[UNDERLINED\]([\s\S]*?)\[\/UNDERLINED\]/g)].map((m) => m[1]);
    const declared = Array.isArray(it.underlined) ? it.underlined : [it.underlined];
    if (spans.length !== declared.length) {
      err(id, `passage has ${spans.length} underlined span(s) but "underlined" declares ${declared.length}`);
    } else {
      spans.forEach((sp, i) => {
        if (sp.trim() !== String(declared[i]).trim()) err(id, `underlined span ${i + 1} does not match the passage text`);
      });
    }
    const uw = spans.reduce((a, sp) => a + words(sp), 0);
    if (uw < 4 || uw > 42) warn(id, `underlined span is ${uw} words, outside the measured 4–42 range`);
    // the multi-span stem is the only place three spans belong
    if (spans.length > 1 && !/Taken together/.test(s)) {
      err(id, `${spans.length} underlined spans but the stem is not the "Taken together" variant`);
    }
  } else if (hasMarkup) {
    err(id, `${it.subtype} item must not contain underline markup`);
  }

  // literary / poetic / historical items need the attribution line
  if (['literature', 'poetry', 'historical-excerpt'].includes(it.genre)) {
    if (!/^The following text is (from|adapted from)/.test(it.passage.trim())) {
      err(id, `${it.genre} item must open with "The following text is from/adapted from …"`);
    }
  } else if (/^The following text is/.test(it.passage.trim())) {
    err(id, 'expository item must not use the excerpt attribution line');
  }

  // rationale substance
  if (words(it.why) < 45) warn(id, `rationale is only ${words(it.why)} words; official mean is 200–272`);
  if (!/["“]/.test(it.why) && it.subtype === 'function') {
    warn(id, 'function rationale does not quote the passage');
  }
});

// --- set-level checks -----------------------------------------------------------------

const tally = (fn) => items.reduce((a, it) => ((a[fn(it)] = (a[fn(it)] || 0) + 1), a), {});

function expect(label, actual, target) {
  Object.keys(target).forEach((k) => {
    if ((actual[k] || 0) !== target[k]) errors.push(`SET: ${label} ${k} = ${actual[k] || 0}, expected ${target[k]}`);
  });
  Object.keys(actual).forEach((k) => {
    if (target[k] === undefined) errors.push(`SET: ${label} has unexpected value "${k}" (${actual[k]})`);
  });
}

const diffTally = tally((it) => it.difficulty);
const subTally = tally((it) => it.subtype);
const genreTally = tally((it) => it.genre);
const keyTally = tally((it) => LETTERS[it.key]);

expect('difficulty', diffTally, TARGET_DIFFICULTY);
expect('subtype', subTally, TARGET_SUBTYPE);
expect('genre', genreTally, TARGET_GENRE);
expect('answer key', keyTally, TARGET_KEY);

if (items.length !== 100) errors.push(`SET: ${items.length} items, expected 100`);

// no three consecutive identical key letters in emitted order
let run = 1;
for (let i = 1; i < items.length; i++) {
  if (items[i].key === items[i - 1].key) {
    run += 1;
    if (run >= 3) errors.push(`SET: three consecutive items with key ${LETTERS[items[i].key]} at ${items[i - 2].id}–${items[i].id}`);
  } else run = 1;
}

// distractor family coverage
const famCount = (name) => items.filter((it) =>
  Object.values(it.families || {}).some((v) => String(v).includes(name))).length;
const evaluative = famCount('unlicensed evaluative load');
const wrongJob = famCount('right content, wrong job');
if (evaluative < 25) errors.push(`SET: only ${evaluative} items carry an "unlicensed evaluative load" distractor; spec requires ≥25`);
if (wrongJob < 30) errors.push(`SET: only ${wrongJob} items carry a "right content, wrong job" distractor; spec requires ≥30`);

// hard structure items must all be three-beat with four parallel options
items.filter((it) => it.subtype === 'structure' && it.difficulty === 'hard').forEach((it) => {
  const beats = it.options.map((o) => (o.match(/,\s*(?:and\s+)?then\s+|,\s+and\s+|,\s+/g) || []).length + 1);
  if (beats.some((b) => b < 3)) err(it.id, `hard structure options must all carry three beats; got ${beats.join('/')}`);
});

// >=60% of hard function items should use a buried referent
const hardFn = items.filter((it) => it.subtype === 'function' && it.difficulty === 'hard');
const buried = hardFn.filter((it) => {
  const spans = [...it.passage.matchAll(/\[UNDERLINED\]([\s\S]*?)\[\/UNDERLINED\]/g)].map((m) => m[1]);
  const body = it.passage.replace(/^The following text[^\n]*\n+/, '');
  const first = spans[0] || '';
  const idx = body.indexOf(first);
  const after = body.slice(idx + first.length).replace(/\[\/?UNDERLINED\]/g, '').trim();
  return words(after) >= 20; // the span resolves against text that follows it
});
if (buried.length / hardFn.length < 0.6) {
  errors.push(`SET: ${buried.length}/${hardFn.length} hard function items resolve against later text; spec requires ≥60%`);
}

// stem frequency
const stemTally = tally((it) => it.stem);

// collisions with the official bank
let officialNouns = [];
if (fs.existsSync(OFFICIAL_NOUNS)) officialNouns = JSON.parse(fs.readFileSync(OFFICIAL_NOUNS, 'utf8'));
// Sentence-initial capitals and ordinary nouns leak into the extracted list; only distinctive
// names, places and terms are worth flagging.
const SENTENCE_INITIAL = /^(Whether|Within|Without|Because|Although|Rather|Instead|During|Before|After|Since|Unlike|Despite|Studying|Using|Taken|Given|Every|Under|Among|While|Where|Their|These|Those|Which|About|Later|Early|Today|Often|Since|First|Second|Third|Small|Large|Comfort|Historians|Scientists|Researchers|Library|Theater|Museum|Daughter|Father|Mother|Winter|Spring|Summer|Autumn|January|February|March|April|May|June|July|August|September|October|November|December)$/;
const distinctive = officialNouns.filter(
  (n) => n.length >= 5 && !NOUN_ALLOWLIST.has(n) && !SENTENCE_INITIAL.test(n)
);
items.forEach((it) => {
  const hay = `${it.passage} ${it.options.join(' ')}`;
  distinctive.forEach((n) => {
    if (new RegExp(`\\b${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(hay)) {
      warn(it.id, `contains "${n}", which also appears in the official bank export — check it is not the same topic`);
    }
  });
});

// --- report ---------------------------------------------------------------------------

console.log(`\nText Structure and Purpose refresh — ${items.length} items from ${files.length} files\n`);
console.log('  difficulty ', JSON.stringify(diffTally));
console.log('  subtype    ', JSON.stringify(subTally));
console.log('  genre      ', JSON.stringify(genreTally));
console.log('  answer key ', JSON.stringify(keyTally));
console.log(`  distractor families: unlicensed-evaluative ${evaluative}, right-content-wrong-job ${wrongJob}`);
console.log(`  hard function items resolving against later text: ${buried.length}/${hardFn.length}`);

if (VERBOSE) {
  console.log('\n  stems:');
  Object.entries(stemTally).sort((a, b) => b[1] - a[1]).forEach(([s, n]) => console.log(`    ${String(n).padStart(2)}  ${s}`));
}

if (warnings.length) {
  console.log(`\n${warnings.length} warning(s):`);
  warnings.forEach((w) => console.log('  ! ' + w));
}

if (errors.length) {
  console.log(`\n${errors.length} error(s):`);
  errors.forEach((e) => console.log('  ✗ ' + e));
  console.log('');
  process.exit(1);
}

console.log('\nAll checks passed.\n');
