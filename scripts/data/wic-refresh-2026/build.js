#!/usr/bin/env node
/**
 * Build + validate the Words-in-Context refresh question set.
 *
 *   node scripts/data/wic-refresh-2026/build.js
 *
 * Reads the authored source files in ./src, balances the answer key to an exact
 * 25/25/25/25 spread, composes the College Board-style rationale and the
 * structured explanation, validates every item against WIC_STYLE_SPEC.md, and
 * writes ./words-in-context-100.json in the app's question-import schema.
 *
 * Exits non-zero if any hard check fails.
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, 'src');
const OUT_FILE = path.join(__dirname, 'words-in-context-100.json');
const LETTERS = ['A', 'B', 'C', 'D'];

const STEM_COMPLETION = 'Which choice completes the text with the most logical and precise word or phrase?';
const stemMeaning = (word) =>
  `As used in the text, what does the word “${word}” most nearly mean?`;

// Measured word-count envelopes from the 200-item official export (see WIC_STYLE_SPEC.md §2).
const LENGTH_BOUNDS = {
  'completion:easy': [34, 62],
  'completion:medium': [40, 66],
  'completion:hard': [43, 72],
  'meaning:easy': [50, 88],
  'meaning:medium': [60, 96],
  'meaning:hard': [72, 112],
};

const TARGET_DIFFICULTY = { easy: 30, medium: 40, hard: 30 };
const TARGET_TYPE = { completion: 84, meaning: 16 };

const errors = [];
const warnings = [];
const fail = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

// ---------------------------------------------------------------- load source

const srcFiles = fs
  .readdirSync(SRC_DIR)
  .filter((f) => /^wic-\d+-.*\.json$/.test(f))
  .sort();

let items = [];
for (const f of srcFiles) {
  const parsed = JSON.parse(fs.readFileSync(path.join(SRC_DIR, f), 'utf8'));
  parsed.forEach((it) => items.push({ ...it, _file: f }));
}

const officialKeyed = new Set(
  JSON.parse(fs.readFileSync(path.join(SRC_DIR, 'official-keyed-answers.json'), 'utf8'))
    .map((s) => s.toLowerCase())
);
const officialNouns = JSON.parse(
  fs.readFileSync(path.join(SRC_DIR, 'official-proper-nouns.json'), 'utf8')
);

// ------------------------------------------------------- structural pre-check

const seenIds = new Set();
items.forEach((it, i) => {
  const at = `${it.id || `#${i}`}`;
  if (!it.id) fail(`${at}: missing id`);
  if (seenIds.has(it.id)) fail(`${at}: duplicate id`);
  seenIds.add(it.id);
  if (!['completion', 'meaning'].includes(it.type)) fail(`${at}: bad type "${it.type}"`);
  if (!['easy', 'medium', 'hard'].includes(it.difficulty)) fail(`${at}: bad difficulty`);
  if (!Array.isArray(it.options) || it.options.length !== 4) fail(`${at}: needs exactly 4 options`);
  if (new Set(it.options.map((o) => o.toLowerCase())).size !== 4) fail(`${at}: duplicate options`);
  if (typeof it.key !== 'number' || it.key < 0 || it.key > 3) fail(`${at}: bad key`);
  if (!it.passage) fail(`${at}: missing passage`);
  if (!it.why) fail(`${at}: missing why`);
  if (!it.remember) fail(`${at}: missing remember`);
  const rb = it.rebuttals || {};
  if (Object.keys(rb).length !== 3) fail(`${at}: needs exactly 3 rebuttals, has ${Object.keys(rb).length}`);
  Object.keys(rb).forEach((L) => {
    if (!LETTERS.includes(L)) fail(`${at}: rebuttal key "${L}" is not A-D`);
    if (LETTERS.indexOf(L) === it.key) fail(`${at}: rebuttal written for the keyed choice ${L}`);
  });
  if (it.type === 'completion') {
    if (!/_{4,}/.test(it.passage)) fail(`${at}: completion passage has no ______ blank`);
    if (!it.topic) fail(`${at}: completion item missing topic`);
    if (!it.keyGloss) fail(`${at}: missing keyGloss`);
  } else {
    if (!it.word) fail(`${at}: meaning item missing word`);
    else if (!it.passage.includes(`<u>${it.word}</u>`)) fail(`${at}: "${it.word}" is not marked <u>…</u> in the passage`);
  }
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
});

// -------------------------------------------------- balance the answer key 25×4

// A pool of exactly 25 of each letter, shuffled with a seeded PRNG so the build is
// reproducible, then repaired so that no letter runs three deep and — critically — the
// sequence is not periodic. An earlier greedy "always take the letter with the most
// capacity left" rule produced a perfect A,B,C,D,A,B,C,D… cycle, which lets a student
// answer the whole set without reading it. The checks below exist to catch that class of bug.
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260805);
const pool = [];
LETTERS.forEach((L) => { for (let i = 0; i < items.length / 4; i += 1) pool.push(L); });
for (let i = pool.length - 1; i > 0; i -= 1) {           // Fisher-Yates
  const j = Math.floor(rand() * (i + 1));
  [pool[i], pool[j]] = [pool[j], pool[i]];
}
// Repair runs of three by swapping the offender with a later, compatible position.
for (let i = 2; i < pool.length; i += 1) {
  if (pool[i] !== pool[i - 1] || pool[i] !== pool[i - 2]) continue;
  for (let j = i + 1; j < pool.length; j += 1) {
    const ok = pool[j] !== pool[i - 1]
      && (j < 2 || pool[i] !== pool[j - 1] || pool[i] !== pool[j - 2])
      && (j + 1 >= pool.length || pool[i] !== pool[j + 1] || pool[i] !== pool[j - 1]);
    if (ok) { [pool[i], pool[j]] = [pool[j], pool[i]]; break; }
  }
}
items.forEach((it, i) => { it._targetIndex = LETTERS.indexOf(pool[i]); });

// Rotate each item's options so the answer lands on its target index.
items.forEach((it) => {
  const shift = (it._targetIndex - it.key + 4) % 4;
  const rotated = new Array(4);
  it.options.forEach((opt, i) => { rotated[(i + shift) % 4] = opt; });
  it.options = rotated;
  it.key = it._targetIndex;
  if (it.options[it.key] !== it._answerText) {
    fail(`${it.id}: rotation lost the keyed answer`);
  }
  const rb = {};
  it.options.forEach((opt, i) => {
    if (i === it.key) return;
    const text = it._rebuttalsByText[opt];
    if (!text) fail(`${it.id}: no rebuttal for option "${opt}"`);
    rb[LETTERS[i]] = text;
  });
  it.rebuttals = rb;
});

// ------------------------------------------------------------ compose output

const q = (s) => `"${s}"`;

/**
 * Normalise quotation punctuation the way the official rationales do:
 *  - a quoted fragment that ends a sentence takes the period *inside* the closing quote
 *  - straight quotes become typographic pairs
 * Parity-aware, so an opening quote followed by a capital is never mistaken for a closing one.
 */
function tidy(s) {
  let out = '';
  let open = true;
  for (let i = 0; i < s.length; i += 1) {
    const ch = s[i];
    if (ch !== '"') { out += ch; continue; }
    if (open) { out += '“'; open = false; continue; }
    const rest = s.slice(i + 1);
    if (/^\.(\s|$)/.test(rest)) {          // period sitting outside → move it in
      out += /[.!?]$/.test(out) ? '”' : '.”';
      i += 1;
    } else if (/^\s+["“]?[A-Z]/.test(rest) && !/[.!?,;:—]$/.test(out)) {
      out += '.”';                          // next sentence starts, so close this one
    } else {
      out += '”';
    }
    open = true;
  }
  return out.replace(/\.\.”/g, '.”').replace(/\s{2,}/g, ' ').trim();
}

function buildExplanation(it) {
  const L = LETTERS[it.key];
  const ans = it.options[it.key];
  const lead =
    it.type === 'completion'
      ? `Choice ${L} is the best answer because it most logically completes the text's discussion of ${it.topic}. In this context, ${q(ans.toLowerCase() === ans ? ans : ans)} means ${it.keyGloss}.`
      : `Choice ${L} is the best answer because as used in the text, ${q(it.word)} most nearly means ${it.keyGloss}.`;
  const body = it.why;
  const rebuts = LETTERS
    .filter((x) => x !== L)
    .map((x) => `Choice ${x} is incorrect because ${it.rebuttals[x].replace(/^([A-Z])/, (m) => m.toLowerCase())}`)
    .join(' ');
  return tidy(`${lead} ${body} ${rebuts}`);
}

function buildStructured(it) {
  const L = LETTERS[it.key];
  const ans = it.options[it.key];
  const rule =
    it.type === 'completion'
      ? 'The blank must be forced by a specific span of the text. Locate that span first, then test each choice against it.'
      : 'Every choice is a real meaning of the word. Only the sentence the word actually appears in decides which meaning applies.';
  const steps =
    it.type === 'completion'
      ? [
          `Step 1: Find the hinge — the part of the text that constrains the blank: ${q(it.hingeQuote)}.`,
          `Step 2: ${it.evidence}`,
          `Step 3: The text therefore calls for a word meaning ${it.keyGloss} — Choice ${L}, ${q(ans)}.`,
        ]
      : [
          `Step 1: Read the sentence containing ${q(it.word)} and note what it is doing there, ignoring the word's most familiar meaning.`,
          `Step 2: ${it.why.split('. ').slice(0, 2).join('. ')}.`,
          `Step 3: The sense the context requires is ${it.keyGloss} — Choice ${L}, ${q(ans)}.`,
        ];
  const choiceRebuttals = {};
  LETTERS.filter((x) => x !== L).forEach((x) => {
    choiceRebuttals[x] = tidy(`Option ${x} is incorrect because ${it.rebuttals[x].replace(/^([A-Z])/, (m) => m.toLowerCase())}`);
  });
  return {
    rule,
    steps: steps.map(tidy),
    choiceRebuttals,
    thingsToRemember: [tidy(it.remember)],
  };
}

const output = items.map((it) => ({
  passage: it.passage,
  text: it.type === 'completion' ? STEM_COMPLETION : stemMeaning(it.word),
  questionType: 'multiple-choice',
  options: it.options,
  correctAnswer: it.key,
  difficulty: it.difficulty,
  subcategory: 'words-in-context',
  subCategory: 'words-in-context',
  subcategoryId: 4,
  categoryPath: 'Reading and Writing/Craft and Structure/Words in Context',
  mainCategory: 'Craft and Structure',
  subjectArea: 'Reading and Writing',
  source: 'ultrasat-original',
  usageContext: 'general',
  skillTags: [
    'words-in-context',
    'craft-and-structure',
    it.type === 'completion' ? 'wic-completion' : 'wic-word-meaning',
    `wic-hinge-${it.hinge || 'sense-disambiguation'}`,
  ],
  graphUrl: null,
  graphDescription: null,
  explanation: buildExplanation(it),
  explanationStructured: buildStructured(it),
  authoringRef: it.id,
  contentSetVersion: 'wic-refresh-2026-08',
}));

// ----------------------------------------------------------------- validation

const wordCount = (s) =>
  s.replace(/<[^>]+>/g, ' ').replace(/_{4,}/g, ' blank ').trim().split(/\s+/).filter(Boolean).length;

const counts = { easy: 0, medium: 0, hard: 0 };
const typeCounts = { completion: 0, meaning: 0 };
const keyCounts = { A: 0, B: 0, C: 0, D: 0 };
const passageSeen = new Map();
const answerSeen = new Map();
let blankInFirstHard = 0;
let hardCompletion = 0;
let prepItems = 0;

items.forEach((it, i) => {
  const out = output[i];
  const at = it.id;
  counts[it.difficulty] += 1;
  typeCounts[it.type] += 1;
  keyCounts[LETTERS[it.key]] += 1;

  const wc = wordCount(it.passage);
  const [lo, hi] = LENGTH_BOUNDS[`${it.type}:${it.difficulty}`];
  if (wc < lo || wc > hi) fail(`${at}: passage is ${wc} words, outside the ${lo}–${hi} envelope for ${it.type}/${it.difficulty}`);

  // one answer text used only once across the whole set
  const ansKey = it.options[it.key].toLowerCase();
  if (answerSeen.has(ansKey)) fail(`${at}: keyed answer "${ansKey}" already used by ${answerSeen.get(ansKey)}`);
  answerSeen.set(ansKey, at);

  // no collision with the official bank's keyed answers
  if (officialKeyed.has(ansKey)) fail(`${at}: keyed answer "${ansKey}" collides with the official bank`);

  // duplicate passages
  const pk = it.passage.slice(0, 60).toLowerCase();
  if (passageSeen.has(pk)) fail(`${at}: passage opening duplicates ${passageSeen.get(pk)}`);
  passageSeen.set(pk, at);

  // option shape consistency: prepositional phrases must be all-or-nothing
  const PREPS = new Set(['to', 'of', 'from', 'with', 'in', 'on', 'among', 'by', 'for', 'at', 'than', 'into', 'over', 'against', 'toward', 'about']);
  const endsPrep = it.options.map((o) => PREPS.has(o.trim().split(/\s+/).pop().toLowerCase()));
  if (endsPrep.some(Boolean)) {
    prepItems += 1;
    if (!endsPrep.every(Boolean)) fail(`${at}: mixes prepositional and bare options — ${JSON.stringify(it.options)}`);
    const preps = it.options.map((o) => o.trim().split(/\s+/).pop().toLowerCase());
    // The official bank repeats prepositions freely (e.g. "insensible to / manifest in /
    // scrutinized by / complicated by"), so only a single preposition across all four is flagged.
    if (new Set(preps).size < 2) warn(`${at}: all four options end in the same preposition (${preps[0]})`);
  }

  // meaning-item options are capitalized; completion options are not
  if (it.type === 'meaning' && !it.options.every((o) => /^[A-Z]/.test(o))) fail(`${at}: meaning options must be capitalized`);
  if (it.type === 'completion' && it.options.some((o) => /^[A-Z]/.test(o))) fail(`${at}: completion options must be lowercase`);

  // hard completion items should mostly open with the blank
  if (it.type === 'completion' && it.difficulty === 'hard') {
    hardCompletion += 1;
    const first = it.passage.split(/(?<=[.!?])\s+/)[0];
    if (/_{4,}/.test(first)) blankInFirstHard += 1;
  }

  // Proper-noun collisions with the official bank. Only capitalised tokens that are NOT
  // sentence-initial count, so ordinary sentence openers ("Instead", "Drivers") are ignored.
  const plain = it.passage.replace(/<[^>]+>/g, ' ');
  const nouns = new Set();
  const NOUN_RE = /([.!?]\s+|^|\s)([A-Z][a-zA-ZÀ-ÿ'’-]+(?:\s+[A-Z][a-zA-ZÀ-ÿ'’-]+)*)/g;
  let m;
  while ((m = NOUN_RE.exec(plain)) !== null) {
    const sentenceInitial = m[1] !== ' ';
    const words = m[2].split(/\s+/);
    if (words.length > 1) nouns.add(m[2]);                     // multi-word names always count
    if (!sentenceInitial) words.forEach((w) => nouns.add(w));  // mid-sentence capitals count
  }
  // Ordinary words that happen to be capitalised inside a title or a date are not "names".
  const NOT_A_NAME = new Set([
    'January', 'February', 'March', 'April', 'June', 'July', 'August', 'September', 'October',
    'November', 'December', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
    'Sunday', 'First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth',
    'Ninth', 'Tenth', 'North', 'South', 'East', 'West', 'Winter', 'Spring', 'Summer', 'Autumn',
    'Chair', 'Field', 'Room', 'House', 'Season', 'Office', 'Daughter', 'Long', 'Late', 'Copper',
  ]);
  nouns.forEach((n) => {
    if (NOT_A_NAME.has(n)) return;
    if (n.length > 4 && officialNouns.includes(n)) fail(`${at}: proper noun "${n}" also appears in the official bank`);
  });

  // rendered output sanity
  if (!out.explanation.startsWith(`Choice ${LETTERS[it.key]}`)) fail(`${at}: explanation must open with "Choice ${LETTERS[it.key]}"`);
  if (out.explanation.length < 500) warn(`${at}: explanation is short (${out.explanation.length} chars)`);
  ['sounds awkward', 'is less precise', 'not the best choice'].forEach((banned) => {
    if (out.explanation.toLowerCase().includes(banned)) fail(`${at}: explanation uses the banned phrase "${banned}"`);
  });
  if (Object.keys(out.explanationStructured.choiceRebuttals).length !== 3) fail(`${at}: structured rebuttals must cover the 3 wrong choices`);
});

// run of three identical keys
for (let i = 2; i < items.length; i += 1) {
  if (items[i].key === items[i - 1].key && items[i].key === items[i - 2].key) {
    fail(`answer key run of three at ${items[i - 2].id}/${items[i - 1].id}/${items[i].id}`);
  }
}

// Periodicity guard. If the key sequence follows any fixed period (a strict ABCD rotation
// being the worst case) a student can score the set without reading a single passage.
for (let period = 1; period <= 8; period += 1) {
  let matches = 0;
  for (let i = period; i < items.length; i += 1) {
    if (items[i].key === items[i - period].key) matches += 1;
  }
  const rate = matches / (items.length - period);
  const expected = period === 4 ? 0.25 : 0.25;
  if (rate > expected + 0.22) {
    fail(`answer key is periodic at period ${period}: ${(rate * 100).toFixed(0)}% of items repeat the key ${period} positions earlier (chance is 25%)`);
  }
}

// Distractor recycling: a wrong option reused across many items becomes a giveaway.
const distractorUse = new Map();
items.forEach((it) => {
  it.options.forEach((o, i) => {
    if (i === it.key) return;
    const k = o.toLowerCase();
    distractorUse.set(k, (distractorUse.get(k) || []).concat(it.id));
  });
});
[...distractorUse.entries()]
  .filter(([, ids]) => ids.length > 2)
  .forEach(([o, ids]) => warn(`distractor "${o}" reused ${ids.length}× (${ids.join(', ')})`));

if (items.length !== 100) fail(`expected 100 items, got ${items.length}`);
Object.entries(TARGET_DIFFICULTY).forEach(([d, n]) => {
  if (counts[d] !== n) fail(`difficulty ${d}: expected ${n}, got ${counts[d]}`);
});
Object.entries(TARGET_TYPE).forEach(([t, n]) => {
  if (typeCounts[t] !== n) fail(`type ${t}: expected ${n}, got ${typeCounts[t]}`);
});
LETTERS.forEach((L) => {
  if (keyCounts[L] !== 25) fail(`answer key ${L}: expected 25, got ${keyCounts[L]}`);
});
if (blankInFirstHard / hardCompletion < 0.6) {
  warn(`only ${blankInFirstHard}/${hardCompletion} hard completion items open with the blank (spec wants ≥60%)`);
}
if (prepItems < 14) warn(`only ${prepItems} items use prepositional-phrase options (spec wants ≥14)`);

// ---------------------------------------------------------------- report/write

const lanes = {};
const hinges = {};
items.forEach((it) => {
  lanes[it.lane] = (lanes[it.lane] || 0) + 1;
  if (it.hinge) hinges[it.hinge] = (hinges[it.hinge] || 0) + 1;
});

console.log(`\nWords in Context refresh — ${items.length} items from ${srcFiles.length} source files\n`);
console.log('  difficulty   ', JSON.stringify(counts));
console.log('  type         ', JSON.stringify(typeCounts));
console.log('  answer key   ', JSON.stringify(keyCounts));
console.log('  topic lanes  ', JSON.stringify(lanes));
console.log('  hinges       ', JSON.stringify(hinges));
console.log(`  blank-first  ${blankInFirstHard}/${hardCompletion} hard completion items`);
console.log(`  prepositional option sets: ${prepItems}`);
const wcByBucket = {};
items.forEach((it) => {
  const k = `${it.type}:${it.difficulty}`;
  (wcByBucket[k] = wcByBucket[k] || []).push(wordCount(it.passage));
});
Object.keys(wcByBucket).sort().forEach((k) => {
  const a = wcByBucket[k].sort((x, y) => x - y);
  const mean = (a.reduce((s, x) => s + x, 0) / a.length).toFixed(1);
  console.log(`  words ${k.padEnd(18)} n=${String(a.length).padStart(3)} mean=${mean} min=${a[0]} max=${a[a.length - 1]}`);
});

if (warnings.length) console.log('\nWarnings:\n' + warnings.map((w) => '  ! ' + w).join('\n'));
if (errors.length) {
  console.error('\nErrors:\n' + errors.map((e) => '  ✗ ' + e).join('\n'));
  process.exit(1);
}

fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2) + '\n', 'utf8');
console.log(`\n✓ all checks passed — wrote ${path.relative(process.cwd(), OUT_FILE)}\n`);
