#!/usr/bin/env node
/**
 * Build + validate the Rhetorical Synthesis refresh question set.
 *
 *   node scripts/data/rs-refresh-2026/build.js
 *
 * Reads the authored source files in ./src, balances the answer key to an exact
 * 25/25/25/25 spread, composes the College Board-style rationale and the
 * structured explanation, validates every item against RS_STYLE_SPEC.md, and
 * writes ./rhetorical-synthesis-100.json in the app's question-import schema.
 *
 * Exits non-zero if any hard check fails.
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, 'src');
const OUT_FILE = path.join(__dirname, 'rhetorical-synthesis-100.json');
const LETTERS = ['A', 'B', 'C', 'D'];

const LEAD_IN = 'While researching a topic, a student has taken the following notes:';
const STEM_TAIL =
  'Which choice most effectively uses relevant information from the notes to accomplish this goal?';

// ---- measured envelopes (RS_STYLE_SPEC.md §2) ------------------------------

const NOTE_WORDS = { easy: [34, 68], medium: [48, 95], hard: [58, 110] };
const NOTE_COUNT = { easy: [4, 6], medium: [3, 6], hard: [4, 7] };
const OPTION_WORDS = { easy: [9, 23], medium: [13, 28], hard: [16, 29] };
const OPTION_SPREAD_MAX = 12;

const TARGET_DIFFICULTY = { easy: 30, medium: 40, hard: 30 };
const TARGET_KEY = 25;

// goal-verb targets for the 100-item set (RS_STYLE_SPEC.md §4)
const TARGET_VERB = {
  emphasize: 28, specify: 8, present: 8, describe: 7, explain: 7, contrast: 6,
  provide: 5, indicate: 5, introduce: 5, identify: 4, make: 4, compare: 3,
  place: 2, summarize: 2, define: 1, convey: 5,
};
const VERB_TOLERANCE = 2;

const MODES = ['wrong-job', 'subordination', 'misrepresent', 'partial', 'scope', 'audience'];
const MIN_SUBORDINATION = 10;
const TARGET_AUDIENCE = 8;

// Real-world terms that are proper nouns but carry no authorial fingerprint. A collision
// with the official bank on any of these is meaningless, so they are exempt from the
// originality check in §8 of the spec.
const GENERIC_NOUNS = new Set([
  'January', 'February', 'March', 'April', 'August', 'September', 'October', 'November', 'December',
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
  'Europe', 'European', 'Africa', 'African', 'America', 'Americas', 'American', 'Asia', 'Asian',
  'Antarctica', 'Arctic', 'Atlantic', 'Pacific', 'Indian', 'Australia', 'Britain', 'British',
  'Arabic', 'Persian', 'English', 'French', 'Spanish', 'Portuguese', 'Chinese', 'Japanese',
  'Korean', 'Russian', 'German', 'Italian', 'Greek', 'Latin', 'Sanskrit', 'Indigenous',
  'Celsius', 'Fahrenheit', 'Kelvin', 'Gazette', 'Register', 'Threshold', 'Weather',
]);

const BANNED = [
  'sounds awkward', 'is less precise', 'is too vague', 'not the best choice',
  'is wordy', 'is grammatically incorrect', 'flows better', 'is redundant',
];

const errors = [];
const warnings = [];
const fail = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

// ---------------------------------------------------------------- load source

const srcFiles = fs
  .readdirSync(SRC_DIR)
  .filter((f) => /^rs-\d+-.*\.json$/.test(f))
  .sort();

if (!srcFiles.length) {
  console.error(`No source files matching rs-NN-*.json in ${SRC_DIR}`);
  process.exit(1);
}

let items = [];
for (const f of srcFiles) {
  const parsed = JSON.parse(fs.readFileSync(path.join(SRC_DIR, f), 'utf8'));
  parsed.forEach((it) => items.push({ ...it, _file: f }));
}

const officialKeyed = JSON.parse(
  fs.readFileSync(path.join(SRC_DIR, 'official-keyed-answers.json'), 'utf8')
);
const officialNouns = new Set(
  JSON.parse(fs.readFileSync(path.join(SRC_DIR, 'official-proper-nouns.json'), 'utf8'))
);

// -------------------------------------------------------------------- helpers

const wordCount = (s) => s.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

const IRREGULAR = {
  make: 'makes', specify: 'specifies', identify: 'identifies', convey: 'conveys',
  place: 'places', define: 'defines',
};

/** "make and support a generalization about X" -> "makes and supports a generalization about X" */
function conjugate(goal) {
  const third = (v) => {
    if (IRREGULAR[v]) return IRREGULAR[v];
    if (/[^aeiou]y$/.test(v)) return v.slice(0, -1) + 'ies';
    if (/(s|sh|ch|x|z|o)$/.test(v)) return v + 'es';
    return v + 's';
  };
  const m = goal.match(/^([a-z]+)(\s+and\s+)([a-z]+)\s+(.*)$/);
  if (m) return `${third(m[1])}${m[2]}${third(m[3])} ${m[4]}`;
  const n = goal.match(/^([a-z]+)\s+(.*)$/);
  if (!n) return goal;
  return `${third(n[1])} ${n[2]}`;
}

/** Bigram Dice coefficient, used for near-duplicate detection against the official bank. */
function dice(a, b) {
  const grams = (s) => {
    const w = norm(s).split(' ');
    const g = new Set();
    for (let i = 0; i < w.length - 1; i += 1) g.add(w[i] + ' ' + w[i + 1]);
    return g;
  };
  const A = grams(a);
  const B = grams(b);
  if (!A.size || !B.size) return 0;
  let hit = 0;
  A.forEach((g) => { if (B.has(g)) hit += 1; });
  return (2 * hit) / (A.size + B.size);
}

// ------------------------------------------------------- structural pre-check

const seenIds = new Set();
items.forEach((it, i) => {
  const at = it.id || `#${i} in ${it._file}`;
  if (!it.id) fail(`${at}: missing id`);
  if (seenIds.has(it.id)) fail(`${at}: duplicate id`);
  seenIds.add(it.id);

  if (!['easy', 'medium', 'hard'].includes(it.difficulty)) fail(`${at}: bad difficulty "${it.difficulty}"`);
  if (!it.lane) fail(`${at}: missing lane`);
  if (!Array.isArray(it.notes) || it.notes.length < 3) fail(`${at}: needs at least 3 notes`);
  if (!Array.isArray(it.options) || it.options.length !== 4) fail(`${at}: needs exactly 4 options`);
  else if (new Set(it.options.map(norm)).size !== 4) fail(`${at}: duplicate options`);
  if (typeof it.key !== 'number' || it.key < 0 || it.key > 3) fail(`${at}: bad key`);
  if (!it.goal) fail(`${at}: missing goal`);
  if (!it.keyWhy) fail(`${at}: missing keyWhy`);
  if (!it.evidence) fail(`${at}: missing evidence`);
  if (!it.remember) fail(`${at}: missing remember`);
  if (!Array.isArray(it.payloadNotes) || !it.payloadNotes.length) fail(`${at}: missing payloadNotes`);

  const rb = it.rebuttals || {};
  const md = it.modes || {};
  if (Object.keys(rb).length !== 3) fail(`${at}: needs exactly 3 rebuttals, has ${Object.keys(rb).length}`);
  if (Object.keys(md).length !== 3) fail(`${at}: needs exactly 3 modes, has ${Object.keys(md).length}`);
  Object.keys(rb).forEach((L) => {
    if (!LETTERS.includes(L)) fail(`${at}: rebuttal key "${L}" is not A-D`);
    if (LETTERS.indexOf(L) === it.key) fail(`${at}: rebuttal written for the keyed choice ${L}`);
    if (!md[L]) fail(`${at}: rebuttal ${L} has no matching mode`);
  });
  Object.values(md).forEach((m) => {
    if (!MODES.includes(m)) fail(`${at}: unknown mode "${m}"`);
  });
});

if (errors.length) {
  console.error('Source structure errors:\n' + errors.map((e) => '  ✗ ' + e).join('\n'));
  process.exit(1);
}

// -------------------------------------------- re-key rebuttals by option text

items.forEach((it) => {
  const byText = {};
  const modeByText = {};
  Object.entries(it.rebuttals).forEach(([L, text]) => {
    byText[it.options[LETTERS.indexOf(L)]] = text;
    modeByText[it.options[LETTERS.indexOf(L)]] = it.modes[L];
  });
  it._rebuttalsByText = byText;
  it._modesByText = modeByText;
  it._answerText = it.options[it.key];
});

// -------------------------------------------------- balance the answer key 25x4

/**
 * Deterministic PRNG (mulberry32). The letter assignment has to be reproducible across
 * builds, but it must NOT be predictable to a student. An earlier version of this script
 * used a greedy "pick the letter with the most remaining capacity, ties alphabetically"
 * rule; because the four capacities re-equalize every fourth item, that produced a perfect
 * A,B,C,D,A,B,C,D cycle across all 100 items while still passing the 25/25/25/25 check and
 * the no-run-of-three guard. Seeded shuffling is the fix.
 */
function mulberry32(a) {
  return function rng() {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SEED = 20260805;

function shuffled(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** A balanced letter sequence with no run of three and no lock-step with the item index. */
function assignLetters(n) {
  const per = n / 4;
  const pool = [];
  LETTERS.forEach((L) => { for (let i = 0; i < per; i += 1) pool.push(L); });
  for (let attempt = 0; attempt < 500; attempt += 1) {
    const seq = shuffled(pool, mulberry32(SEED + attempt));
    let runs = 0;
    let cyclic = 0;
    for (let i = 0; i < seq.length; i += 1) {
      if (i >= 2 && seq[i] === seq[i - 1] && seq[i] === seq[i - 2]) runs += 1;
      if (seq[i] === LETTERS[i % 4]) cyclic += 1;
    }
    if (runs === 0 && cyclic / seq.length < 0.35) return seq;
  }
  throw new Error('Could not find a balanced answer-key sequence');
}

const assigned = assignLetters(items.length);
items.forEach((it, i) => { it._targetIndex = LETTERS.indexOf(assigned[i]); });

// Place the key at its target index and shuffle the three distractors into the remaining
// slots. A cyclic rotation would preserve the authored option order in every item, which is
// itself a pattern; a real permutation removes it.
items.forEach((it, i) => {
  const rng = mulberry32(SEED * 31 + i);
  const distractors = shuffled(it.options.filter((o) => o !== it._answerText), rng);
  const placed = new Array(4);
  placed[it._targetIndex] = it._answerText;
  let d = 0;
  for (let s = 0; s < 4; s += 1) if (s !== it._targetIndex) placed[s] = distractors[d++];
  it.options = placed;
  it.key = it._targetIndex;
  if (it.options[it.key] !== it._answerText) fail(`${it.id}: permutation lost the keyed answer`);
  const rb = {};
  const md = {};
  it.options.forEach((opt, j) => {
    if (j === it.key) return;
    if (!it._rebuttalsByText[opt]) fail(`${it.id}: no rebuttal for option "${opt.slice(0, 40)}…"`);
    rb[LETTERS[j]] = it._rebuttalsByText[opt];
    md[LETTERS[j]] = it._modesByText[opt];
  });
  it.rebuttals = rb;
  it.modes = md;
});

// ------------------------------------------------------------ compose output

const bullet = (notes) => notes.map((n) => `• ${n}`).join('\n');

function buildPassage(it) {
  return `${LEAD_IN}\n\n${bullet(it.notes)}`;
}

function buildStem(it) {
  return `The student wants to ${it.goal}. ${STEM_TAIL}`;
}

function buildExplanation(it) {
  const L = LETTERS[it.key];
  const g3 = it.goal3 || conjugate(it.goal);
  const lead = `Choice ${L} is the best answer. The sentence ${g3}, ${it.keyWhy}.`;
  const rebuts = LETTERS
    .filter((x) => x !== L)
    .map((x) => `Choice ${x} is incorrect. ${it.rebuttals[x]}`)
    .join(' ');
  return `${lead} ${rebuts}`;
}

function buildStructured(it) {
  const L = LETTERS[it.key];
  const g3 = it.goal3 || conjugate(it.goal);
  return {
    rule:
      'Every choice is consistent with the notes and every choice is well written. Only the goal sentence decides which one is correct, so read the goal before you read the choices.',
    steps: [
      `Step 1: Fix the goal in mind: the sentence must ${it.goal}.`,
      `Step 2: ${it.evidence}`,
      `Step 3: Only Choice ${L} ${g3}, ${it.keyWhy}.`,
    ],
    choiceRebuttals: LETTERS.filter((x) => x !== L).reduce((acc, x) => {
      acc[x] = `Option ${x} is incorrect. ${it.rebuttals[x]}`;
      return acc;
    }, {}),
    thingsToRemember: [it.remember],
  };
}

const output = items.map((it) => ({
  passage: buildPassage(it),
  text: buildStem(it),
  questionType: 'multiple-choice',
  options: it.options,
  correctAnswer: it.key,
  difficulty: it.difficulty,
  subcategory: 'rhetorical-synthesis',
  subCategory: 'rhetorical-synthesis',
  subcategoryId: 7,
  categoryPath: 'Reading and Writing/Expression of Ideas/Rhetorical Synthesis',
  mainCategory: 'Expression of Ideas',
  subjectArea: 'Reading and Writing',
  source: 'ultrasat-original',
  usageContext: 'general',
  skillTags: [
    'rhetorical-synthesis',
    'expression-of-ideas',
    `rs-goal-${it.goalVerb || it.goal.split(' ')[0]}`,
    `rs-lane-${it.lane}`,
    ...(it.audience ? [`rs-audience-${it.audience}`] : []),
  ],
  graphUrl: null,
  graphDescription: null,
  explanation: buildExplanation(it),
  explanationStructured: buildStructured(it),
  authoringRef: it.id,
  contentSetVersion: 'rs-refresh-2026-08',
}));

// ----------------------------------------------------------------- validation

const counts = { easy: 0, medium: 0, hard: 0 };
const keyCounts = { A: 0, B: 0, C: 0, D: 0 };
const verbCounts = {};
const laneCounts = {};
const modeCounts = {};
const openingSeen = new Map();
const goalSeen = new Map();
let audienceItems = 0;
let subordinationItems = 0;
let keyIsLongest = 0;

items.forEach((it, i) => {
  const out = output[i];
  const at = it.id;
  counts[it.difficulty] += 1;
  keyCounts[LETTERS[it.key]] += 1;
  const verb = it.goalVerb || it.goal.split(' ')[0];
  verbCounts[verb] = (verbCounts[verb] || 0) + 1;
  laneCounts[it.lane] = (laneCounts[it.lane] || 0) + 1;
  Object.values(it.modes).forEach((m) => { modeCounts[m] = (modeCounts[m] || 0) + 1; });
  if (Object.values(it.modes).includes('subordination')) subordinationItems += 1;
  if (it.audience) audienceItems += 1;

  // --- note block
  const [nlo, nhi] = NOTE_COUNT[it.difficulty];
  if (it.notes.length < nlo || it.notes.length > nhi) {
    fail(`${at}: ${it.notes.length} notes, outside ${nlo}–${nhi} for ${it.difficulty}`);
  }
  const nw = it.notes.reduce((s, n) => s + wordCount(n), 0);
  const [wlo, whi] = NOTE_WORDS[it.difficulty];
  if (nw < wlo || nw > whi) fail(`${at}: note block is ${nw} words, outside ${wlo}–${whi} for ${it.difficulty}`);
  it.notes.forEach((n, j) => {
    if (!/[.!?]["”)]?$/.test(n.trim())) fail(`${at}: note ${j + 1} does not end in terminal punctuation`);
    if (!/^["“(]?[A-Z0-9À-Ü]/.test(n.trim())) fail(`${at}: note ${j + 1} does not start with a capital`);
    if (wordCount(n) > 25) fail(`${at}: note ${j + 1} is ${wordCount(n)} words (max 25)`);
    if (wordCount(n) < 5) fail(`${at}: note ${j + 1} is only ${wordCount(n)} words (min 5)`);
  });
  // payload must live in the last two notes
  const tail = [it.notes.length - 1, it.notes.length];
  if (!it.payloadNotes.some((p) => tail.includes(p))) {
    warn(`${at}: payloadNotes ${JSON.stringify(it.payloadNotes)} do not reach the last two notes`);
  }
  if (it.difficulty === 'easy' && it.payloadNotes.length > 2) {
    warn(`${at}: easy item fuses ${it.payloadNotes.length} notes (spec: 1, occasionally 2)`);
  }
  if (it.difficulty === 'hard' && it.payloadNotes.length < 2) {
    fail(`${at}: hard item must fuse at least 2 notes, has ${it.payloadNotes.length}`);
  }

  // --- goal
  if (!/^[a-z]/.test(it.goal)) fail(`${at}: goal must start lowercase (it follows "The student wants to ")`);
  if (/[.?]$/.test(it.goal)) fail(`${at}: goal must not carry its own terminal punctuation`);
  if (wordCount(it.goal) > 20) fail(`${at}: goal is ${wordCount(it.goal)} words (max 20)`);
  if (wordCount(it.goal) < 4) fail(`${at}: goal is only ${wordCount(it.goal)} words`);
  const gk = norm(it.goal);
  if (goalSeen.has(gk)) fail(`${at}: goal duplicates ${goalSeen.get(gk)}`);
  goalSeen.set(gk, at);
  const g3 = it.goal3 || conjugate(it.goal);
  if (g3 === it.goal) fail(`${at}: could not conjugate goal "${it.goal}" — supply goal3`);
  if (Boolean(it.audience) !== /audience/.test(it.goal)) {
    fail(`${at}: audience flag (${it.audience || 'none'}) disagrees with the goal text`);
  }

  // --- options
  const ow = it.options.map(wordCount);
  const mean = ow.reduce((s, x) => s + x, 0) / 4;
  const [olo, ohi] = OPTION_WORDS[it.difficulty];
  if (mean < olo || mean > ohi) fail(`${at}: mean option length ${mean.toFixed(1)} outside ${olo}–${ohi} for ${it.difficulty}`);
  const spread = Math.max(...ow) - Math.min(...ow);
  if (spread > OPTION_SPREAD_MAX) fail(`${at}: option length spread is ${spread} words (max ${OPTION_SPREAD_MAX})`);
  if (ow[it.key] === Math.max(...ow) && ow.filter((x) => x === Math.max(...ow)).length === 1) keyIsLongest += 1;
  it.options.forEach((o, j) => {
    if (!/^["“(]?[A-Z0-9À-Ü]/.test(o.trim())) fail(`${at}: option ${LETTERS[j]} does not start with a capital`);
    if (!/[.!?]["”)]?$/.test(o.trim())) fail(`${at}: option ${LETTERS[j]} does not end in a period`);
  });

  // --- originality
  const ansKey = it.options[it.key];
  officialKeyed.forEach((k) => {
    if (dice(ansKey, k) > 0.5) fail(`${at}: keyed answer is a near-duplicate of an official keyed answer (dice ${dice(ansKey, k).toFixed(2)})`);
  });
  const opening = norm(it.notes[0]).split(' ').slice(0, 8).join(' ');
  if (openingSeen.has(opening)) fail(`${at}: note block opening duplicates ${openingSeen.get(opening)}`);
  openingSeen.set(opening, at);

  // Proper-noun collision with the official bank. Sentence-initial words and generic
  // real-world terms (months, continents, languages, units) are not distinctive entities,
  // so colliding on them says nothing about originality.
  const haystack = `${it.notes.join(' ')} ${it.options.join(' ')} ${it.goal}`;
  const NOUN_RE = /\b[A-ZÀ-ÖØ-Þ][\wÀ-ÿ'’-]+(?:\s+[A-ZÀ-ÖØ-Þ][\wÀ-ÿ'’-]+)*/g;
  let m;
  while ((m = NOUN_RE.exec(haystack)) !== null) {
    const n = m[0];
    if (n.length <= 5 || !officialNouns.has(n)) continue;
    const before = haystack.slice(0, m.index).replace(/\s+$/, '');
    const sentenceInitial = before === '' || /["“(]$/.test(before) || /[.!?;:]$/.test(before);
    if (sentenceInitial && !n.includes(' ')) continue;
    if (GENERIC_NOUNS.has(n)) continue;
    fail(`${at}: proper noun "${n}" also appears in the official bank`);
  }

  // --- difficulty-specific distractor mix
  const modes = Object.values(it.modes);
  if (it.difficulty === 'hard') {
    const hardModes = modes.filter((m) => ['misrepresent', 'partial', 'scope'].includes(m)).length;
    if (hardModes < 2) fail(`${at}: hard item needs ≥ 2 misrepresent/partial/scope distractors, has ${hardModes} (${modes.join(', ')})`);
  }
  if (it.difficulty === 'easy') {
    if (modes.filter((m) => m === 'wrong-job').length < 2) {
      warn(`${at}: easy item should lean on plain wrong-job distractors (${modes.join(', ')})`);
    }
    if (modes.includes('scope')) warn(`${at}: 'scope' distractor at easy difficulty`);
  }
  if (it.audience && !modes.includes('audience')) {
    warn(`${at}: audience goal but no audience-mismatch distractor`);
  }

  // --- rendered output sanity
  if (!out.explanation.startsWith(`Choice ${LETTERS[it.key]} is the best answer.`)) {
    fail(`${at}: explanation must open with "Choice ${LETTERS[it.key]} is the best answer."`);
  }
  if (wordCount(out.explanation) < 70) warn(`${at}: rationale is short (${wordCount(out.explanation)} words)`);
  if (wordCount(out.explanation) > 230) warn(`${at}: rationale is long (${wordCount(out.explanation)} words)`);
  BANNED.forEach((b) => {
    if (out.explanation.toLowerCase().includes(b)) fail(`${at}: rationale uses the banned phrase "${b}"`);
  });
  if (/\byou\b|\byour\b/i.test(out.explanation)) fail(`${at}: rationale addresses the reader as "you"`);
  LETTERS.filter((x) => x !== LETTERS[it.key]).forEach((x) => {
    if (!out.explanation.includes(`Choice ${x} is incorrect.`)) fail(`${at}: rationale is missing the segment for Choice ${x}`);
  });
  if (Object.keys(out.explanationStructured.choiceRebuttals).length !== 3) {
    fail(`${at}: structured rebuttals must cover the 3 wrong choices`);
  }
  if (!out.passage.startsWith(LEAD_IN)) fail(`${at}: passage does not use the verbatim lead-in`);
  if (!out.text.endsWith(STEM_TAIL)) fail(`${at}: stem does not use the verbatim question tail`);
});

// run of three identical keys
for (let i = 2; i < items.length; i += 1) {
  if (items[i].key === items[i - 1].key && items[i].key === items[i - 2].key) {
    fail(`answer key run of three at ${items[i - 2].id}/${items[i - 1].id}/${items[i].id}`);
  }
}

// ------------------------------------------------- surface-cue leakage checks
//
// An external audit of the first build found that a goal-blind, notes-blind heuristic could
// pick the key 54% of the time (chance 25%; the official bank scores 33%) purely from
// surface features of the option text. The checks below fail the build when any single
// typographic or syntactic feature is concentrated in the keys or in the distractors.

function cueBalance(test) {
  let keyHits = 0;
  let distractorHits = 0;
  items.forEach((it) => {
    it.options.forEach((o, i) => {
      if (!test(o)) return;
      if (i === it.key) keyHits += 1; else distractorHits += 1;
    });
  });
  // 1 key : 3 distractors is the neutral ratio, so normalize the distractor count.
  return { keyHits, distractorHits, normalized: distractorHits / 3 };
}

const CUES = [
  { name: 'semicolon or colon', test: (o) => /[;:]/.test(o) },
  { name: '", which" clause', test: (o) => /,\s+which\b/.test(o) },
  { name: 'contrastive conjunction', test: (o) => /\b(whereas|while|but|although|though)\b/i.test(o) },
  { name: 'em dash', test: (o) => /—/.test(o) },
];

CUES.forEach(({ name, test }) => {
  const { keyHits, normalized } = cueBalance(test);
  const total = keyHits + normalized;
  if (total < 6) return; // too rare to carry signal
  const share = keyHits / total;
  if (share > 0.72) fail(`surface cue "${name}" favors the key (${keyHits} keys vs ${(normalized * 3).toFixed(0)} distractors) — it identifies the answer without reading the goal`);
  if (share < 0.14) fail(`surface cue "${name}" favors the distractors (${keyHits} keys vs ${(normalized * 3).toFixed(0)} distractors) — it eliminates wrong answers without reading the goal`);
});

// set-level totals — skipped with --partial so a single authored file can be linted
const PARTIAL = process.argv.includes('--partial');
if (!PARTIAL) {
  if (items.length !== 100) fail(`expected 100 items, got ${items.length}`);
  Object.entries(TARGET_DIFFICULTY).forEach(([d, n]) => {
    if (counts[d] !== n) fail(`difficulty ${d}: expected ${n}, got ${counts[d]}`);
  });
  LETTERS.forEach((L) => {
    if (keyCounts[L] !== TARGET_KEY) fail(`answer key ${L}: expected ${TARGET_KEY}, got ${keyCounts[L]}`);
  });
  if (subordinationItems < MIN_SUBORDINATION) {
    fail(`only ${subordinationItems} items use the subordination distractor (spec wants ≥ ${MIN_SUBORDINATION})`);
  }
  if (Math.abs(audienceItems - TARGET_AUDIENCE) > 2) {
    warn(`${audienceItems} audience-clause items (spec target ${TARGET_AUDIENCE})`);
  }
  if (keyIsLongest / items.length > 0.3) {
    fail(`the keyed answer is the single longest option in ${keyIsLongest}/${items.length} items (max 30%) — length is cueing the key`);
  }

  // The answer key must not track the item index. See assignLetters().
  const cyclic = items.filter((it, i) => it.key === i % 4).length;
  if (cyclic / items.length > 0.4) {
    fail(`the answer key follows the item index in ${cyclic}/${items.length} items — the letter sequence is predictable`);
  }

  // Note-count monotony. Official items run 3–7 notes with real variation inside each band;
  // an earlier build had all 40 medium items sitting at exactly 5.
  ['easy', 'medium', 'hard'].forEach((d) => {
    const band = items.filter((it) => it.difficulty === d);
    const dist = {};
    band.forEach((it) => { dist[it.notes.length] = (dist[it.notes.length] || 0) + 1; });
    const top = Math.max(...Object.values(dist));
    if (top / band.length > 0.7) {
      fail(`${d}: ${top}/${band.length} items have the same note count (${JSON.stringify(dist)}) — max 70%`);
    }
  });

  // Note-coverage leakage. A solver who ignores the goal but reads the notes can beat chance
  // if the key is reliably the option that draws on the most notes — the "pull of
  // completeness" from §0 of the spec, pointing the wrong way. In the official bank a
  // distractor matches or beats the key on note coverage in roughly half of medium items.
  const STOP = new Set(['the', 'and', 'that', 'this', 'with', 'from', 'were', 'was', 'been', 'have', 'has', 'had', 'their', 'they', 'them', 'which', 'when', 'what', 'than', 'then', 'into', 'over', 'under', 'about', 'after', 'before', 'more', 'most', 'less', 'some', 'each', 'both', 'other', 'also', 'only', 'because', 'while', 'whereas', 'although', 'though', 'would', 'could', 'there', 'these', 'those', 'such', 'used', 'using']);
  const contentWords = (s) => new Set(
    s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length >= 4 && !STOP.has(w))
  );
  const notesTouched = (option, notes) => {
    const ow = contentWords(option);
    return notes.filter((n) => {
      const nw = [...contentWords(n)];
      if (!nw.length) return false;
      return nw.filter((w) => ow.has(w)).length / nw.length >= 0.4;
    }).length;
  };

  ['easy', 'medium', 'hard'].forEach((d) => {
    const band = items.filter((it) => it.difficulty === d);
    const contested = band.filter((it) => {
      const cov = it.options.map((o) => notesTouched(o, it.notes));
      return it.options.some((_, i) => i !== it.key && cov[i] >= cov[it.key]);
    }).length;
    const rate = contested / band.length;
    if (rate < 0.3) {
      const msg = `${d}: the key draws on strictly more notes than every distractor in ${band.length - contested}/${band.length} items — completeness cues the answer (official bank: a distractor matches or beats the key in ~48% of medium items)`;
      if (d === 'medium') fail(msg); else warn(msg);
    }
  });

  // Medium items should not lean on factual contradiction the way hard items may. Measured
  // official rate for a misrepresent-style distractor at medium is ~11%.
  const med = items.filter((it) => it.difficulty === 'medium');
  const medMisrep = med.filter((it) => Object.values(it.modes).includes('misrepresent')).length;
  if (medMisrep / med.length > 0.25) {
    fail(`${medMisrep}/${med.length} medium items contain a misrepresent distractor (max 25%; official ~11%) — medium should turn on rhetorical job, not fact-checking`);
  }

  // Hard items must not all turn on a factual contradiction. Measured against the official
  // bank, 41% of Hard items contain an option that misstates the notes; the rest are decided
  // on rhetorical function alone, which is the harder discrimination.
  const hard = items.filter((it) => it.difficulty === 'hard');
  const withMisrep = hard.filter((it) => Object.values(it.modes).includes('misrepresent')).length;
  if (withMisrep / hard.length > 0.6) {
    fail(`${withMisrep}/${hard.length} hard items contain a misrepresent distractor (max 60%) — hard items should more often turn on rhetorical function alone`);
  }
  if (withMisrep / hard.length < 0.25) {
    warn(`only ${withMisrep}/${hard.length} hard items contain a misrepresent distractor (official rate ~41%)`);
  }
  Object.entries(TARGET_VERB).forEach(([v, n]) => {
    const got = verbCounts[v] || 0;
    if (Math.abs(got - n) > VERB_TOLERANCE) warn(`goal verb "${v}": expected ~${n}, got ${got}`);
  });
  Object.keys(verbCounts).forEach((v) => {
    if (!(v in TARGET_VERB)) warn(`unplanned goal verb "${v}" (${verbCounts[v]} items)`);
  });
}

// ---------------------------------------------------------------- report/write

const line = (label, obj) => console.log(`  ${label.padEnd(14)}`, JSON.stringify(obj));
console.log(`\nRhetorical Synthesis refresh — ${items.length} items from ${srcFiles.length} source files\n`);
line('difficulty', counts);
line('answer key', keyCounts);
line('goal verbs', verbCounts);
line('lanes', laneCounts);
line('distractors', modeCounts);
console.log(`  ${'audience'.padEnd(14)} ${audienceItems} items`);
console.log(`  ${'subordination'.padEnd(14)} ${subordinationItems} items`);
console.log(`  ${'key-longest'.padEnd(14)} ${keyIsLongest}/${items.length} (${((100 * keyIsLongest) / items.length).toFixed(0)}%)`);

const byBucket = {};
items.forEach((it) => {
  const nw = it.notes.reduce((s, n) => s + wordCount(n), 0);
  (byBucket[it.difficulty] = byBucket[it.difficulty] || []).push(nw);
});
['easy', 'medium', 'hard'].forEach((d) => {
  const a = (byBucket[d] || []).slice().sort((x, y) => x - y);
  if (!a.length) return;
  const mean = (a.reduce((s, x) => s + x, 0) / a.length).toFixed(1);
  console.log(`  note words ${d.padEnd(7)} n=${String(a.length).padStart(3)} mean=${mean} min=${a[0]} max=${a[a.length - 1]}`);
});

if (warnings.length) console.log('\nWarnings:\n' + warnings.map((w) => '  ! ' + w).join('\n'));
if (errors.length) {
  console.error('\nErrors:\n' + errors.map((e) => '  ✗ ' + e).join('\n'));
  process.exit(1);
}
if (PARTIAL) {
  console.log('\n✓ --partial: per-item checks passed (set-level totals not checked)\n');
  process.exit(0);
}

fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2) + '\n', 'utf8');
console.log(`\n✓ all checks passed — wrote ${path.relative(process.cwd(), OUT_FILE)}\n`);
