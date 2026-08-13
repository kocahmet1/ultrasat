#!/usr/bin/env node
/**
 * Build + validate the Cross-Text Connections refresh question set.
 *
 *   node scripts/data/ctc-refresh-2026/build.js
 *
 * Reads the authored source files in ./src, balances the answer key to an exact
 * 15/15/15/15 spread, composes the College Board-style rationale and the
 * structured explanation, validates every item against the envelopes measured
 * from the 59-item official Cross-Text Connections export, and writes
 * ./cross-text-connections-60.json in the app's question-import schema.
 *
 * Exits non-zero if any hard check fails.
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, 'src');
const OUT_FILE = path.join(__dirname, 'cross-text-connections-60.json');
const LETTERS = ['A', 'B', 'C', 'D'];

// Measured from the 59-item official export.
//   passage words:  easy 116-153 (mean 137) | medium 123-156 (mean 140) | hard 124-172 (mean 143)
//   option words:   easy mean 14.3 | medium 18.3 | hard 19.9
const PASSAGE_BOUNDS = { easy: [112, 156], medium: [120, 160], hard: [122, 176] };
const OPTION_MEAN_BOUNDS = { easy: [7, 20], medium: [10, 26], hard: [12, 28] };

const TARGET_DIFFICULTY = { easy: 21, medium: 20, hard: 19 };
const KEYS_PER_LETTER = 15;

// Families whose choices are sentence fragments ("By arguing…", "As premature, …")
// and therefore carry no terminal period, per the official export.
const FRAGMENT_FAMILIES = new Set(['respond', 'characterize', 'regard']);
// Families whose choices are complete sentences and take a terminal period.
const SENTENCE_FAMILIES = new Set(['agree', 'difference', 'relate', 'model-apply', 'joint', 'say-about']);
const ALL_FAMILIES = new Set([...FRAGMENT_FAMILIES, ...SENTENCE_FAMILIES, 'disagree-q']);

const errors = [];
const warnings = [];
const fail = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

// ---------------------------------------------------------------- load source

const srcFiles = fs
  .readdirSync(SRC_DIR)
  .filter((f) => /^ctc-\d+-.*\.json$/.test(f))
  .sort();

const items = [];
for (const f of srcFiles) {
  JSON.parse(fs.readFileSync(path.join(SRC_DIR, f), 'utf8')).forEach((it) => items.push({ ...it, _file: f }));
}

const officialNouns = JSON.parse(fs.readFileSync(path.join(SRC_DIR, 'official-proper-nouns.json'), 'utf8'));

// ------------------------------------------------------- structural pre-check

const seenIds = new Set();
items.forEach((it, i) => {
  const at = it.id || `#${i}`;
  if (!it.id) fail(`${at}: missing id`);
  if (seenIds.has(it.id)) fail(`${at}: duplicate id`);
  seenIds.add(it.id);
  if (!['easy', 'medium', 'hard'].includes(it.difficulty)) fail(`${at}: bad difficulty "${it.difficulty}"`);
  if (!ALL_FAMILIES.has(it.family)) fail(`${at}: unknown family "${it.family}"`);
  if (!it.lane) fail(`${at}: missing lane`);
  if (!it.text1 || !it.text2) fail(`${at}: needs both text1 and text2`);
  if (!it.stem || !it.stem.trim().endsWith('?')) fail(`${at}: stem must be a question`);
  if (!Array.isArray(it.options) || it.options.length !== 4) fail(`${at}: needs exactly 4 options`);
  else if (new Set(it.options.map((o) => o.toLowerCase())).size !== 4) fail(`${at}: duplicate options`);
  if (typeof it.key !== 'number' || it.key < 0 || it.key > 3) fail(`${at}: bad key`);
  if (!it.keyWhy) fail(`${at}: missing keyWhy`);
  if (!it.remember) fail(`${at}: missing remember`);
  if (!Array.isArray(it.steps) || it.steps.length !== 3) fail(`${at}: needs exactly 3 steps`);
  const rb = it.rebuttals || {};
  if (Object.keys(rb).length !== 3) fail(`${at}: needs exactly 3 rebuttals, has ${Object.keys(rb).length}`);
  Object.keys(rb).forEach((L) => {
    if (!LETTERS.includes(L)) fail(`${at}: rebuttal key "${L}" is not A-D`);
    if (LETTERS.indexOf(L) === it.key) fail(`${at}: rebuttal written for the keyed choice ${L}`);
  });
});

if (errors.length) {
  console.error('Source structure errors:\n' + errors.map((e) => '  ✗ ' + e).join('\n'));
  process.exit(1);
}

// -------------------------------------------- re-key rebuttals by option text

items.forEach((it) => {
  const byText = {};
  Object.entries(it.rebuttals).forEach(([L, text]) => {
    byText[it.options[LETTERS.indexOf(L)]] = text;
  });
  it._rebuttalsByText = byText;
  it._answerText = it.options[it.key];
  it._authoredKeyLetter = LETTERS[it.key];
});

// ------------------------------------------------- balance the answer key 15x4

// Deterministic but pattern-free. A greedy "most remaining capacity" walk emits a
// clean ABCDABCD… cycle, which a student can learn; so instead we seed a small PRNG,
// Shuffle 5 of each letter within each canonical 20-item ID block. Keeping these
// assignments tied to E01-E20 / M01-M20 / H01-H20 (rather than to the editable
// difficulty labels) prevents a reclassification from needlessly changing answer
// positions across the live bank. Reject any draw containing a run of three or a
// repeating 4-cycle.
const SEED = 20260805;
function makeRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
function shuffle(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function hasRunOfThree(seq) {
  return seq.some((L, i) => i >= 2 && L === seq[i - 1] && L === seq[i - 2]);
}
function hasCycle(seq) {
  // four consecutive items that walk the alphabet forwards or backwards
  return seq.some((L, i) => {
    if (i < 3) return false;
    const idx = seq.slice(i - 3, i + 1).map((x) => LETTERS.indexOf(x));
    const fwd = idx.every((v, k) => k === 0 || v === (idx[k - 1] + 1) % 4);
    const bwd = idx.every((v, k) => k === 0 || v === (idx[k - 1] + 3) % 4);
    return fwd || bwd;
  });
}

const blockOf = () => LETTERS.flatMap((L) => Array(KEYS_PER_LETTER / 3).fill(L)); // 5 of each per canonical ID block
const rng = makeRng(SEED);
let assigned = null;
for (let attempt = 0; attempt < 2000 && !assigned; attempt += 1) {
  const draw = ['E', 'M', 'H'].flatMap(() => shuffle(blockOf(), rng));
  if (!hasRunOfThree(draw) && !hasCycle(draw)) assigned = draw;
}
if (!assigned) throw new Error('could not find a clean answer-key assignment');

// Sanity: source items stay in canonical ID order so the stable answer-position
// assignment above remains deterministic even when an item's difficulty changes.
items.forEach((it, i) => {
  const prefix = i < 20 ? 'E' : i < 40 ? 'M' : 'H';
  const number = String((i % 20) + 1).padStart(2, '0');
  const expectedId = `CTC-${prefix}${number}`;
  if (it.id !== expectedId) fail(`${it.id}: item ${i} must be ${expectedId} — the key balancer assumes canonical ID order`);
  it._targetIndex = LETTERS.indexOf(assigned[i]);
});
if (errors.length) {
  console.error('Ordering errors:\n' + errors.map((e) => '  ✗ ' + e).join('\n'));
  process.exit(1);
}

// Rotate each item's options so the keyed answer lands on its target index.
items.forEach((it) => {
  const shift = (it._targetIndex - it.key + 4) % 4;
  const rotated = new Array(4);
  it.options.forEach((opt, i) => {
    rotated[(i + shift) % 4] = opt;
  });
  it.options = rotated;
  it.key = it._targetIndex;
  if (it.options[it.key] !== it._answerText) fail(`${it.id}: rotation lost the keyed answer`);
  const rb = {};
  it.options.forEach((opt, i) => {
    if (i === it.key) return;
    const text = it._rebuttalsByText[opt];
    if (!text) fail(`${it.id}: no rebuttal for option "${opt}"`);
    rb[LETTERS[i]] = text;
  });
  it.rebuttals = rb;
  // Author-side step text names the pre-rotation key letter; retarget it.
  const L = LETTERS[it.key];
  const authored = it._authoredKeyLetter;
  it.steps = it.steps.map((s) => s.replace(new RegExp(`\\bChoice ${authored}\\b`, 'g'), `Choice ${L}`));
  it.steps.forEach((s) => {
    const stray = s.match(/\bChoice ([A-D])\b/g) || [];
    stray.forEach((m) => {
      if (m !== `Choice ${L}`) fail(`${it.id}: step names ${m} but the key is ${L}`);
    });
  });
  if (/\bChoice [A-D]\b/.test(it.keyWhy)) fail(`${it.id}: keyWhy must not name a choice letter`);
});

// ------------------------------------------------------------ compose output

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const html = (s) => esc(s).replace(/&lt;u&gt;/g, '<u>').replace(/&lt;\/u&gt;/g, '</u>');

function buildPassage(it) {
  const parts = [];
  if (it.intro) parts.push(`<p><em>${html(it.intro)}</em></p>`);
  parts.push(`<p><strong>Text 1</strong></p><p>${html(it.text1)}</p>`);
  parts.push(`<p><strong>Text 2</strong></p><p>${html(it.text2)}</p>`);
  return parts.join('');
}

function buildExplanation(it) {
  const L = LETTERS[it.key];
  const lead = `Choice ${L} is the best answer because ${it.keyWhy}`;
  const rebuts = LETTERS.filter((x) => x !== L)
    .map((x) => `Choice ${x} is incorrect because ${it.rebuttals[x]}`)
    .join(' ');
  return `${lead} ${rebuts}`;
}

const RULES = {
  respond:
    'The stem names one specific claim, not the whole of Text 1. The response must be something the second author’s own evidence licenses about that claim — no stronger and no weaker.',
  agree:
    'A “both would agree” answer is the premise the two texts share, not the point on which they divide. It is usually the most modest statement on the list.',
  difference:
    'Every choice makes two claims, one about each text. Both halves have to hold; most wrong choices fail on exactly one.',
  characterize:
    'The verdict and the reason attached to it are scored separately. A choice can carry the right judgment and still be wrong about why.',
  regard:
    'The verdict and the reason attached to it are scored separately. A choice can carry the right judgment and still be wrong about why.',
  'say-about':
    'Answer for the specific portion of Text 1 the stem names, using only what the second text actually establishes about it.',
  relate:
    'State in plain words what each text is doing — who claims, who qualifies, who reports — before reading the choices.',
  'model-apply':
    'Text 1 supplies a rule and Text 2 supplies a result. Run the rule on the result, and import nothing the rule does not contain.',
  'disagree-q':
    'A disagreement needs two positions. Discard any question only one text answers, and any question both answer the same way.',
  joint:
    'The answer must hold for both sets of findings at once. Anything supported by only one of them is a distractor.',
};

function buildStructured(it) {
  const L = LETTERS[it.key];
  const choiceRebuttals = {};
  LETTERS.filter((x) => x !== L).forEach((x) => {
    choiceRebuttals[x] = `Option ${x} is incorrect because ${it.rebuttals[x]}`;
  });
  return {
    rule: RULES[it.family],
    steps: it.steps,
    choiceRebuttals,
    thingsToRemember: [it.remember],
  };
}

const output = items.map((it) => ({
  passage: buildPassage(it),
  text: it.stem,
  questionType: 'multiple-choice',
  options: it.options,
  correctAnswer: it.key,
  difficulty: it.difficulty,
  subcategory: 'cross-text-connections',
  subCategory: 'cross-text-connections',
  subcategoryId: 6,
  categoryPath: 'Reading and Writing/Craft and Structure/Cross-Text Connections',
  mainCategory: 'Craft and Structure',
  subjectArea: 'Reading and Writing',
  source: 'ultrasat-original',
  usageContext: 'general',
  skillTags: [
    'cross-text-connections',
    'craft-and-structure',
    `ctc-${it.family}`,
    `ctc-lane-${it.lane}`,
  ],
  graphUrl: null,
  graphDescription: null,
  explanation: buildExplanation(it),
  explanationStructured: buildStructured(it),
  authoringRef: it.id,
  contentSetVersion: 'ctc-refresh-2026-08',
}));

// ----------------------------------------------------------------- validation

const wordCount = (s) => s.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length;

const counts = { easy: 0, medium: 0, hard: 0 };
const keyCounts = { A: 0, B: 0, C: 0, D: 0 };
const familyCounts = {};
const laneCounts = {};
const passageSeen = new Map();
let underlined = 0;
let namedPeople = 0;
let keyLongest = 0;
let keyShortest = 0;
const wcByDifficulty = { easy: [], medium: [], hard: [] };

items.forEach((it, i) => {
  const out = output[i];
  const at = it.id;
  counts[it.difficulty] += 1;
  keyCounts[LETTERS[it.key]] += 1;
  familyCounts[it.family] = (familyCounts[it.family] || 0) + 1;
  laneCounts[it.lane] = (laneCounts[it.lane] || 0) + 1;

  // passage length envelope
  const body = `${it.intro ? it.intro + ' ' : ''}${it.text1} ${it.text2}`;
  const wc = wordCount(body);
  wcByDifficulty[it.difficulty].push(wc);
  const [lo, hi] = PASSAGE_BOUNDS[it.difficulty];
  if (wc < lo || wc > hi) fail(`${at}: passage is ${wc} words, outside the ${lo}–${hi} envelope for ${it.difficulty}`);

  // each text should carry its share (official: Text 1 mean 68, Text 2 mean 69)
  const w1 = wordCount(it.text1);
  const w2 = wordCount(it.text2);
  if (w1 < 40 || w1 > 95) warn(`${at}: Text 1 is ${w1} words (official range 50–90)`);
  if (w2 < 40 || w2 > 95) warn(`${at}: Text 2 is ${w2} words (official range 51–90)`);

  // option shape
  const optWords = it.options.map((o) => wordCount(o));
  const optMean = optWords.reduce((s, x) => s + x, 0) / 4;
  const [olo, ohi] = OPTION_MEAN_BOUNDS[it.difficulty];
  if (optMean < olo || optMean > ohi) fail(`${at}: options average ${optMean.toFixed(1)} words, outside ${olo}–${ohi} for ${it.difficulty}`);
  const spread = Math.max(...optWords) - Math.min(...optWords);
  if (spread > 16) warn(`${at}: option lengths vary by ${spread} words (${optWords.join('/')})`);

  // punctuation + opener conventions measured from the official export
  const endsPeriod = it.options.map((o) => /[.]$/.test(o.trim()));
  const endsQuestion = it.options.map((o) => /\?$/.test(o.trim()));
  if (it.family === 'disagree-q') {
    if (!endsQuestion.every(Boolean)) fail(`${at}: disagree-q options must each be a question`);
  } else if (FRAGMENT_FAMILIES.has(it.family)) {
    if (endsPeriod.some(Boolean)) fail(`${at}: ${it.family} options are fragments and take no terminal period`);
  } else if (!endsPeriod.every(Boolean)) {
    fail(`${at}: ${it.family} options are full sentences and need a terminal period`);
  }
  if (it.family === 'respond') {
    const openers = it.options.map((o) => o.trim().split(/\s+/)[0]);
    if (!openers.every((w) => w === openers[0])) {
      warn(`${at}: respond options should share one opener shape (${openers.join('/')})`);
    }
  }
  if (['characterize', 'regard'].includes(it.family)) {
    if (!it.options.every((o) => /^As /.test(o.trim()))) warn(`${at}: ${it.family} options usually open "As {adjective}, because …"`);
  }

  // underlined-span integrity
  const hasU = /<u>[^<]+<\/u>/.test(it.text1) || /<u>[^<]+<\/u>/.test(it.text2);
  const stemU = /underlined/.test(it.stem);
  if (hasU) underlined += 1;
  if (hasU !== stemU) fail(`${at}: underline markup and the stem's reference to it disagree`);
  ['text1', 'text2'].forEach((k) => {
    const opens = (it[k].match(/<u>/g) || []).length;
    const closes = (it[k].match(/<\/u>/g) || []).length;
    if (opens !== closes) fail(`${at}: unbalanced <u> tags in ${k}`);
  });

  // no duplicate stimuli
  const pk = it.text1.slice(0, 50).toLowerCase();
  if (passageSeen.has(pk)) fail(`${at}: Text 1 opening duplicates ${passageSeen.get(pk)}`);
  passageSeen.set(pk, at);

  // named researcher, introduced by role, as in 67% of official items
  const ROLE = /(ologist|omist|scientist|historian|scholar|curator|analyst|planner|conservator|acoustician|folklorist|linguist|critic|geneticist|agronomist|physicist|researcher|director|teacher|trumpeter|saxophonist|chemist|engineer|poet)s?\b/i;
  const roleThenName = new RegExp(`${ROLE.source}\\s+[A-Z][\\w'’-]+\\s+[A-Z][\\w'’-]+`, 'i');
  if (roleThenName.test(body)) namedPeople += 1;
  else warn(`${at}: no "Role Firstname Lastname" introduction found (official rate ~67%)`);

  // collision with the official bank's proper nouns
  const found = body.match(/\b[A-Z][\w'’-]+(?:\s+[A-Z][\w'’-]+)*/g) || [];
  found.forEach((n) => {
    if (n.length > 5 && officialNouns.includes(n)) fail(`${at}: proper noun "${n}" also appears in the official bank`);
  });

  // quote fidelity: every quoted span in the rationale must appear verbatim in the
  // stimulus or in an option. CB never paraphrases inside quotation marks, and it is
  // easy to break this by editing a passage after the rationale is written.
  const flat = (s) =>
    s
      .replace(/<[^>]+>/g, '')
      .replace(/[’‘]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/\s+/g, ' ')
      .toLowerCase();
  const haystack = flat(`${it.intro || ''} ${it.text1} ${it.text2} ${it.options.join(' ')}`);
  const rationaleParts = [it.keyWhy, ...Object.values(it.rebuttals), ...it.steps];
  rationaleParts.forEach((part) => {
    (part.replace(/[“”]/g, '"').match(/"([^"]{6,})"/g) || []).forEach((raw) => {
      const frag = flat(raw.slice(1, -1)).replace(/^[ .,;:]+|[ .,;:]+$/g, '');
      if (!haystack.includes(frag)) fail(`${at}: rationale quotes "${frag.slice(0, 60)}…" but the passage does not contain it`);
    });
  });

  // key-length tell: track whether the keyed choice is the longest option
  if (optWords[it.key] === Math.max(...optWords) && optWords.filter((w) => w === Math.max(...optWords)).length === 1) keyLongest += 1;
  if (optWords[it.key] === Math.min(...optWords) && optWords.filter((w) => w === Math.min(...optWords)).length === 1) keyShortest += 1;

  // rendered output sanity
  if (!out.explanation.startsWith(`Choice ${LETTERS[it.key]} is the best answer because `)) fail(`${at}: explanation opener is malformed`);
  if (out.explanation.length < 700) warn(`${at}: explanation is short (${out.explanation.length} chars)`);
  ['sounds awkward', 'is less precise', 'not the best choice', 'is too vague'].forEach((banned) => {
    if (out.explanation.toLowerCase().includes(banned)) fail(`${at}: explanation uses the banned phrase "${banned}"`);
  });
  if (Object.keys(out.explanationStructured.choiceRebuttals).length !== 3) fail(`${at}: structured rebuttals must cover the 3 wrong choices`);
  if (!out.explanationStructured.rule) fail(`${at}: no rule registered for family "${it.family}"`);
  if (!/<strong>Text 1<\/strong>/.test(out.passage) || !/<strong>Text 2<\/strong>/.test(out.passage)) fail(`${at}: passage is missing a text label`);
});

// run of three identical keys in emitted order
for (let i = 2; i < items.length; i += 1) {
  if (items[i].key === items[i - 1].key && items[i].key === items[i - 2].key) {
    fail(`answer key run of three at ${items[i - 2].id}/${items[i - 1].id}/${items[i].id}`);
  }
}

if (items.length !== 60) fail(`expected 60 items, got ${items.length}`);
Object.entries(TARGET_DIFFICULTY).forEach(([d, n]) => {
  if (counts[d] !== n) fail(`difficulty ${d}: expected ${n}, got ${counts[d]}`);
});
LETTERS.forEach((L) => {
  if (keyCounts[L] !== KEYS_PER_LETTER) fail(`answer key ${L}: expected ${KEYS_PER_LETTER}, got ${keyCounts[L]}`);
});
if (underlined < 10 || underlined > 20) warn(`${underlined} items use an underlined span (official rate is 25%, i.e. ~15 of 60)`);
if (namedPeople < 45) warn(`only ${namedPeople} items introduce a named figure by role (official rate ~67%)`);
if ((familyCounts.respond || 0) < 22) warn(`only ${familyCounts.respond} "respond" items (official share is ~44%)`);
// A student who notices that the longest choice is usually right can beat the set
// without reading. Chance is ~25%; anything past a third is an exploitable tell.
if (keyLongest / items.length > 0.33) fail(`answer is the single longest choice in ${keyLongest}/${items.length} items (${Math.round((keyLongest / items.length) * 100)}%) — an exploitable length tell`);
if (keyShortest / items.length > 0.33) fail(`answer is the single shortest choice in ${keyShortest}/${items.length} items — an exploitable length tell`);

// ---------------------------------------------------------------- report/write

console.log(`\nCross-Text Connections refresh — ${items.length} items from ${srcFiles.length} source files\n`);
console.log('  difficulty   ', JSON.stringify(counts));
console.log('  answer key   ', JSON.stringify(keyCounts));
console.log('  stem families', JSON.stringify(familyCounts));
console.log('  topic lanes  ', JSON.stringify(laneCounts));
console.log(`  underlined spans: ${underlined}/60   named figures: ${namedPeople}/60`);
console.log(`  key is longest choice: ${keyLongest}/60 (${Math.round((keyLongest / 60) * 100)}%)   shortest: ${keyShortest}/60 (${Math.round((keyShortest / 60) * 100)}%)   [chance ~25%]`);
Object.keys(wcByDifficulty).forEach((d) => {
  const a = wcByDifficulty[d].slice().sort((x, y) => x - y);
  const mean = (a.reduce((s, x) => s + x, 0) / a.length).toFixed(1);
  console.log(`  passage words ${d.padEnd(7)} n=${a.length} mean=${mean} min=${a[0]} max=${a[a.length - 1]}   (official body mean: easy 133 / medium 136 / hard 139)`);
});

if (warnings.length) console.log('\nWarnings:\n' + warnings.map((w) => '  ! ' + w).join('\n'));
if (errors.length) {
  console.error('\nErrors:\n' + errors.map((e) => '  ✗ ' + e).join('\n'));
  process.exit(1);
}

fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2) + '\n', 'utf8');
console.log(`\n✓ all checks passed — wrote ${path.relative(process.cwd(), OUT_FILE)}\n`);
