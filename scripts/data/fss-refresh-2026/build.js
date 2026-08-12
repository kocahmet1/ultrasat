#!/usr/bin/env node
/**
 * Build + validate the Form, Structure, and Sense refresh question set.
 *
 *   node scripts/data/fss-refresh-2026/build.js
 *
 * Reads the authored source files in ./src, rotates each item's options so the
 * answer key lands on an exact 25/25/25/25 spread, composes the College Board-style
 * rationale and the structured explanation, validates every item against
 * FSS_STYLE_SPEC.md, and writes ./form-structure-sense-100.json in the app's
 * question-import schema.
 *
 * Rebuttals in the source files are keyed by OPTION TEXT, not by letter, precisely
 * so that rotation is safe.
 *
 * Exits non-zero if any hard check fails.
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, 'src');
const OUT_FILE = path.join(__dirname, 'form-structure-sense-100.json');
const CORPUS_FILE = path.join(__dirname, 'fss_corpus.json');
const LETTERS = ['A', 'B', 'C', 'D'];

// The single official stem — 206/206 items in the export use this exact wording.
const STEM = 'Which choice completes the text so that it conforms to the conventions of Standard English?';

// Measured word-count envelopes from the 206-item official export (FSS_STYLE_SPEC.md §2.3).
const LENGTH_BOUNDS = { easy: [26, 56], medium: [28, 58], hard: [26, 66] };

const TARGET_DIFFICULTY = { easy: 30, medium: 40, hard: 30 };
const TARGET_CONVENTION = {
  'subject-verb': { easy: 6, medium: 13, hard: 8 },
  'verb-form': { easy: 9, medium: 6, hard: 10 },
  // Zero hard tense items, matching the official corpus exactly (0 of 61 hard items test
  // tense). The hard slot originally budgeted here moved to verb-form.
  tense: { easy: 9, medium: 5, hard: 0 },
  modifier: { easy: 0, medium: 7, hard: 8 },
  'noun-possessive': { easy: 3, medium: 7, hard: 3 },
  pronoun: { easy: 3, medium: 2, hard: 1 },
};

const CONVENTION_LABELS = new Set([
  'subject-verb agreement',
  'subject-modifier placement',
  'pronoun-antecedent agreement',
  'the use of verb forms within a sentence',
  'finite and nonfinite verb forms within a sentence',
  'the use of verbs to express tense in a sentence',
  'the use of plural and possessive nouns',
  'the use of possessive nouns',
  'the use of possessive determiners',
]);

// Style critiques College Board never makes. Note "unclear" is deliberately absent:
// the official rationales use the fixed idiom "the resulting sentence leaves unclear
// what …" for indefinite/ambiguous pronouns (see official items 1448f43f, 908a76b8),
// so a bare ban would reject correct College Board phrasing. Bare "unclear" outside
// that idiom is caught separately below.
const BANNED_PHRASES = [
  'awkward', 'wordy', 'less concise', 'sounds better', 'reads better',
  'is less precise', 'not the best choice', 'flows better', 'too vague',
  'is redundant', 'more natural',
];
const BARE_UNCLEAR = /(?<!leaves\s)\bunclear\b/i;

const errors = [];
const warnings = [];
const fail = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

const tidy = (s) => s.replace(/\s+/g, ' ').replace(/\s+([.,;:])/g, '$1').trim();
const q = (s) => `“${s}”`;
const wordCount = (s) => s.replace(/_{4,}/g, 'blank').trim().split(/\s+/).filter(Boolean).length;
const sentenceCount = (s) => s.split(/(?<=[.!?])\s+(?=[A-Z“"])/).filter(Boolean).length;

// ---------------------------------------------------------------- load source

const srcFiles = fs.readdirSync(SRC_DIR).filter((f) => /^fss-\d+-.*\.json$/.test(f)).sort();
if (!srcFiles.length) {
  console.error(`No source files found in ${SRC_DIR}`);
  process.exit(1);
}

let items = [];
for (const f of srcFiles) {
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(path.join(SRC_DIR, f), 'utf8'));
  } catch (e) {
    console.error(`${f}: ${e.message}`);
    process.exit(1);
  }
  parsed.forEach((it) => items.push({ ...it, _file: f }));
}

// Official corpus, for originality checks.
let corpus = [];
if (fs.existsSync(CORPUS_FILE)) {
  corpus = JSON.parse(fs.readFileSync(CORPUS_FILE, 'utf8'));
} else {
  warn('fss_corpus.json not found — originality checks against the official bank were skipped');
}

// ------------------------------------------------------- structural pre-check

const seenIds = new Set();
items.forEach((it, i) => {
  const at = it.id || `${it._file}#${i}`;
  if (!it.id) fail(`${at}: missing id`);
  if (seenIds.has(it.id)) fail(`${at}: duplicate id`);
  seenIds.add(it.id);
  if (!Object.keys(TARGET_CONVENTION).includes(it.convention)) fail(`${at}: bad convention "${it.convention}"`);
  if (!['easy', 'medium', 'hard'].includes(it.difficulty)) fail(`${at}: bad difficulty "${it.difficulty}"`);
  if (!it.passage) fail(`${at}: missing passage`);
  if (!Array.isArray(it.options) || it.options.length !== 4) fail(`${at}: needs exactly 4 options`);
  if (new Set((it.options || []).map((o) => o.trim().toLowerCase())).size !== 4) fail(`${at}: duplicate options`);
  if (typeof it.key !== 'number' || it.key < 0 || it.key > 3) fail(`${at}: bad key`);
  if (!it.conventionLabel) fail(`${at}: missing conventionLabel`);
  else if (!CONVENTION_LABELS.has(it.conventionLabel)) fail(`${at}: conventionLabel "${it.conventionLabel}" is not College Board wording`);
  if (!it.why) fail(`${at}: missing why`);
  if (!it.wrong || typeof it.wrong !== 'object') fail(`${at}: missing wrong`);
  if (!Array.isArray(it.remember) || it.remember.length < 2) fail(`${at}: remember needs at least 2 entries`);

  // rebuttals must be keyed by the exact three non-key option strings
  if (it.options && it.wrong && typeof it.key === 'number') {
    const expected = it.options.filter((_, n) => n !== it.key);
    const got = Object.keys(it.wrong);
    if (got.length !== 3) fail(`${at}: wrong has ${got.length} keys, needs 3`);
    expected.forEach((o) => {
      if (!(o in it.wrong)) fail(`${at}: wrong is missing a rebuttal for option "${o}"`);
    });
    got.forEach((k) => {
      if (!expected.includes(k)) fail(`${at}: wrong has a rebuttal for "${k}", which is not a non-key option`);
    });
  }
});

if (errors.length) {
  console.error('Structural errors — aborting before rotation:');
  errors.forEach((e) => console.error(`  ✗ ${e}`));
  process.exit(1);
}

// ------------------------------------------------- rotate to balance the key
//
// Rotating an item's options by r moves the key from k to (k + r) % 4 and preserves
// option order cyclically. We choose r per item so the final key spread is exactly
// 25/25/25/25 with no run of three identical letters and no fixed period.

function rotate(arr, r) {
  const n = arr.length;
  return arr.map((_, i) => arr[(i - r + n * 2) % n]);
}

function assignRotations(list) {
  const quota = [25, 25, 25, 25];
  const used = [0, 0, 0, 0];
  const result = new Array(list.length).fill(null);

  // Deterministic pseudo-shuffle of the target sequence, then greedy repair for
  // the run-of-three and periodicity constraints.
  const order = [];
  for (let i = 0; i < list.length; i += 1) order.push(i);

  // Build a target key sequence that satisfies the constraints, then fit items to it.
  const target = [];
  let seed = 20260805;
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  for (let i = 0; i < list.length; i += 1) {
    const candidates = [0, 1, 2, 3]
      .filter((k) => used[k] < quota[k])
      .filter((k) => !(i >= 2 && target[i - 1] === k && target[i - 2] === k));
    if (!candidates.length) {
      // dead end: fall back to any under-quota letter, then repair below
      const any = [0, 1, 2, 3].filter((k) => used[k] < quota[k]);
      const pick = any[Math.floor(rnd() * any.length)];
      target.push(pick);
      used[pick] += 1;
      continue;
    }
    const pick = candidates[Math.floor(rnd() * candidates.length)];
    target.push(pick);
    used[pick] += 1;
  }

  // Repair pass. The greedy fill can dead-end near the tail and emit a run of three.
  // Swapping two positions preserves the 25/25/25/25 quota exactly, so we look for a
  // partner swap that clears the run without creating a new one.
  const runAt = (seq, i) => i >= 2 && seq[i] === seq[i - 1] && seq[i] === seq[i - 2];
  const hasRunNear = (seq, i) => [i - 2, i - 1, i, i + 1, i + 2].some((j) => j >= 2 && j < seq.length && runAt(seq, j));
  for (let pass = 0; pass < 8; pass += 1) {
    let clean = true;
    for (let i = 2; i < target.length; i += 1) {
      if (!runAt(target, i)) continue;
      clean = false;
      let fixed = false;
      for (let j = 0; j < target.length && !fixed; j += 1) {
        if (target[j] === target[i]) continue;
        const trial = target.slice();
        [trial[i], trial[j]] = [trial[j], trial[i]];
        if (!hasRunNear(trial, i) && !hasRunNear(trial, j)) {
          target[i] = trial[i];
          target[j] = trial[j];
          fixed = true;
        }
      }
      if (!fixed) warn(`could not repair an answer-key run of three at position ${i}`);
    }
    if (clean) break;
  }
  order.forEach((i) => {
    result[i] = (target[i] - list[i].key + 4) % 4;
  });
  return { rotations: result, target };
}

const { rotations } = assignRotations(items);
items = items.map((it, i) => {
  const r = rotations[i];
  const options = rotate(it.options, r);
  const key = (it.key + r) % 4;
  if (options[key] !== it.options[it.key]) {
    fail(`${it.id}: rotation broke the key (expected "${it.options[it.key]}", got "${options[key]}")`);
  }
  return { ...it, options, key };
});

// ------------------------------------------------------------ compose output

function buildExplanation(it) {
  const L = LETTERS[it.key];
  const lead = `Choice ${L} is the best answer. The convention being tested is ${it.conventionLabel}.`;
  const body = it.why;
  const rebuts = LETTERS.filter((x) => x !== L)
    .map((x) => {
      const opt = it.options[LETTERS.indexOf(x)];
      const reason = it.wrong[opt].replace(/^([A-Z])/, (m) => m.toLowerCase());
      return `Choice ${x} is incorrect because ${reason}`;
    })
    .join(' ');
  return tidy(`${lead} ${body} ${rebuts}`);
}

const RULE_BY_CONVENTION = {
  'subject-verb': 'A verb agrees with the head noun of its subject, never with the noun that happens to sit closest to it.',
  'verb-form': 'A main clause needs exactly one finite (tensed) verb — no more and no fewer. Find the clause’s main verb before deciding what the blank can be.',
  tense: 'Tense is fixed by evidence in the text — a date, a duration, or the tense of the verbs around it — not by what sounds natural.',
  modifier: 'A modifying phrase at the start of a sentence describes whatever noun comes immediately after the comma. Put the right noun there.',
  'noun-possessive': 'Decide two things separately for each noun: is it plural, and does it own the noun that follows?',
  pronoun: 'A pronoun matches the number of the noun it stands in for, which is not always the nearest noun.',
};

function buildStructured(it) {
  const L = LETTERS[it.key];
  const ans = it.options[it.key];
  const choiceRebuttals = {};
  LETTERS.filter((x) => x !== L).forEach((x) => {
    const opt = it.options[LETTERS.indexOf(x)];
    choiceRebuttals[x] = tidy(`Option ${x} is incorrect because ${it.wrong[opt].replace(/^([A-Z])/, (m) => m.toLowerCase())}`);
  });
  return {
    rule: RULE_BY_CONVENTION[it.convention],
    steps: [
      `Step 1: Identify the convention in play — this item turns on ${it.conventionLabel}.`,
      `Step 2: ${tidy(it.why)}`,
      `Step 3: Only Choice ${L}, ${q(ans)}, satisfies that requirement; the other three fail it.`,
    ].map(tidy),
    choiceRebuttals,
    thingsToRemember: it.remember.map(tidy),
  };
}

const output = items.map((it) => ({
  text: `${it.passage}\n\n${STEM}`,
  passage: null,
  questionType: 'multiple-choice',
  options: it.options,
  correctAnswer: it.key,
  difficulty: it.difficulty,
  subcategory: 'form-structure-sense',
  subCategory: 'form-structure-sense',
  subcategoryId: 10,
  categoryPath: 'Reading and Writing/Standard English Conventions/Form, Structure, and Sense',
  mainCategory: 'Standard English Conventions',
  subjectArea: 'Reading and Writing',
  source: 'ultrasat-original',
  usageContext: 'general',
  skillTags: [
    'form-structure-sense',
    'standard-english-conventions',
    `fss-${it.convention}`,
  ],
  graphUrl: null,
  graphDescription: null,
  hasImage: false,
  explanation: buildExplanation(it),
  explanationStructured: buildStructured(it),
  authoringRef: it.id,
  contentSetVersion: 'fss-refresh-2026-08',
}));

// ----------------------------------------------------------------- validation

const counts = { easy: 0, medium: 0, hard: 0 };
const convCounts = {};
const keyCounts = { A: 0, B: 0, C: 0, D: 0 };
const passageSeen = new Map();

// 5-gram index over the official corpus
const ngramIndex = new Map();
const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
const fiveGrams = (s) => {
  const w = normalize(s).split(' ').filter(Boolean);
  const out = [];
  for (let i = 0; i + 5 <= w.length; i += 1) out.push(w.slice(i, i + 5).join(' '));
  return out;
};
corpus.forEach((c) => fiveGrams(c.stim || '').forEach((g) => ngramIndex.set(g, c.qid)));

// proper nouns in the official corpus
const NOT_A_NAME = new Set([
  'January', 'February', 'March', 'April', 'June', 'July', 'August', 'September', 'October',
  'November', 'December', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
  'Sunday', 'North', 'South', 'East', 'West', 'Winter', 'Spring', 'Summer', 'Autumn',
  'English', 'American', 'European', 'African', 'Asian', 'French', 'Spanish', 'German',
  'Earth', 'University', 'Museum', 'Institute', 'Press', 'Empire', 'Valley', 'World',
  'Black', 'Indigenous', 'Standard', 'Also', 'Although', 'Because', 'Before', 'Despite',
  'During', 'Even', 'Every', 'From', 'Having', 'However', 'Instead', 'More', 'Most',
  'Only', 'Rather', 'Since', 'Such', 'That', 'These', 'This', 'Those', 'Though', 'Today',
  'Unlike', 'Using', 'What', 'When', 'While', 'With', 'Within', 'Without',
]);
// A shared country, language, or demonym is not a topic collision — the official bank and
// ours can both mention India without overlapping in subject matter. Person names, work
// titles, institutions, and species names are still hard failures.
const SHARED_GEO_LANG_OK = new Set([
  'India', 'China', 'Japan', 'Korea', 'Brazil', 'Mexico', 'Egypt', 'Kenya', 'Nigeria', 'Ghana',
  'Italy', 'Greece', 'Turkey', 'Russia', 'Canada', 'Australia', 'Portugal', 'Poland', 'Sweden',
  'Norway', 'Iceland', 'Ireland', 'Scotland', 'Wales', 'Chile', 'Peru', 'Bolivia', 'Ecuador',
  'Vietnam', 'Thailand', 'Indonesia', 'Nepal', 'Iran', 'Israel', 'Morocco', 'Ethiopia', 'Senegal',
  'Tanzania', 'Uganda', 'Ukraine', 'Finland', 'Denmark', 'Belgium', 'Austria', 'Switzerland',
  'France', 'Spain', 'Germany', 'Britain', 'England', 'Argentina', 'Colombia', 'Malaysia',
  'Philippines', 'Pakistan', 'Bangladesh', 'Cambodia', 'Mongolia', 'Iceland', 'Estonia',
  'Arabic', 'Chinese', 'Japanese', 'Korean', 'Hindi', 'Swahili', 'Latin', 'Greek', 'Persian',
  'Turkish', 'Russian', 'Italian', 'Portuguese', 'Dutch', 'Danish', 'Swedish', 'Norwegian',
  'Polish', 'Mandarin', 'Cantonese', 'Bengali', 'Tamil', 'Yoruba', 'Quechua', 'Nahuatl',
  'Brazilian', 'Mexican', 'Egyptian', 'Kenyan', 'Nigerian', 'Indian', 'Chilean', 'Peruvian',
  'Atlantic', 'Pacific', 'Arctic', 'Antarctic', 'Mediterranean', 'Caribbean', 'Himalayan',
  'Celsius', 'Fahrenheit', 'Renaissance', 'Holocene', 'Pleistocene', 'Jurassic', 'Cretaceous',
]);
const properNouns = (text) => {
  const out = new Set();
  const RE = /([.!?]\s+|^|\s)([A-Z][a-zA-ZÀ-ÿ'’-]+(?:\s+[A-Z][a-zA-ZÀ-ÿ'’-]+)*)/g;
  let m;
  while ((m = RE.exec(text)) !== null) {
    const sentenceInitial = m[1] !== ' ';
    const words = m[2].split(/\s+/);
    if (words.length > 1 && !sentenceInitial) out.add(m[2]);
    if (!sentenceInitial) words.forEach((w) => out.add(w));
  }
  return out;
};
const officialNouns = new Set();
corpus.forEach((c) => properNouns(c.stim || '').forEach((n) => { if (!NOT_A_NAME.has(n) && n.length > 4) officialNouns.add(n); }));

items.forEach((it, i) => {
  const out = output[i];
  const at = it.id;
  counts[it.difficulty] += 1;
  convCounts[it.convention] = convCounts[it.convention] || { easy: 0, medium: 0, hard: 0 };
  convCounts[it.convention][it.difficulty] += 1;
  keyCounts[LETTERS[it.key]] += 1;

  // 1. exactly one blank
  const blanks = (it.passage.match(/_{4,}/g) || []).length;
  if (blanks !== 1) fail(`${at}: passage has ${blanks} blanks, needs exactly 1`);
  if (!/______/.test(it.passage)) fail(`${at}: blank must be six underscores`);

  // 2. the stem must not be embedded in the passage
  if (it.passage.includes('Which choice')) fail(`${at}: passage contains the stem prompt — the build appends it`);

  // 3. length envelope
  const wc = wordCount(it.passage);
  const [lo, hi] = LENGTH_BOUNDS[it.difficulty];
  if (wc < lo || wc > hi) fail(`${at}: passage is ${wc} words, outside the ${lo}–${hi} envelope for ${it.difficulty}`);
  const sc = sentenceCount(it.passage);
  if (sc > 4) fail(`${at}: passage has ${sc} sentences, max 4`);

  // 4. option shape consistency — short inflection sets or full clauses, never mixed
  const lens = it.options.map((o) => o.trim().split(/\s+/).length);
  const short = lens.every((n) => n <= 5);
  const clausal = lens.every((n) => n >= 6);
  if (!short && !clausal) fail(`${at}: option set mixes short and clausal shapes — ${JSON.stringify(lens)}`);
  if (clausal && it.convention !== 'modifier') warn(`${at}: clausal options on a non-modifier item`);

  // 5. duplicate passage openings
  const pk = normalize(it.passage).slice(0, 60);
  if (passageSeen.has(pk)) fail(`${at}: passage opening duplicates ${passageSeen.get(pk)}`);
  passageSeen.set(pk, at);

  // 6. originality — no 5-gram shared with the official bank
  fiveGrams(it.passage).forEach((g) => {
    if (ngramIndex.has(g)) fail(`${at}: shares the 5-gram "${g}" with official item ${ngramIndex.get(g)}`);
  });

  // 7. originality — no proper noun shared with the official bank
  properNouns(it.passage).forEach((n) => {
    if (NOT_A_NAME.has(n) || n.length <= 4) return;
    if (!officialNouns.has(n)) return;
    if (SHARED_GEO_LANG_OK.has(n)) {
      warn(`${at}: shares the geographic/language term "${n}" with the official bank (allowed)`);
      return;
    }
    fail(`${at}: proper noun "${n}" also appears in the official bank`);
  });

  // 8. rationale quality
  if (!out.explanation.startsWith(`Choice ${LETTERS[it.key]} is the best answer.`)) {
    fail(`${at}: explanation must open with "Choice ${LETTERS[it.key]} is the best answer."`);
  }
  LETTERS.filter((x) => x !== LETTERS[it.key]).forEach((x) => {
    if (!out.explanation.includes(`Choice ${x} is incorrect because`)) fail(`${at}: explanation does not rebut Choice ${x}`);
  });
  if (!/[“"]/.test(it.why)) fail(`${at}: why does not quote a span from the passage`);
  Object.entries(it.wrong).forEach(([opt, reason]) => {
    if (!/[“"]/.test(reason)) fail(`${at}: rebuttal for "${opt}" does not quote a span`);
  });
  BANNED_PHRASES.forEach((b) => {
    if (out.explanation.toLowerCase().includes(b)) fail(`${at}: explanation uses the banned word/phrase "${b}"`);
  });
  if (BARE_UNCLEAR.test(out.explanation)) {
    fail(`${at}: explanation uses "unclear" outside College Board's "leaves unclear what …" idiom`);
  }
  if (Object.keys(out.explanationStructured.choiceRebuttals).length !== 3) fail(`${at}: structured rebuttals must cover 3 wrong choices`);

  // 9. banned constructions as the keyed trigger
  if (it.convention === 'subject-verb') {
    const pre = it.passage.split('______')[0];
    if (/\bnone of the\b/i.test(pre)) fail(`${at}: "none of the" is a contested agreement trigger`);
    if (/\bneither\b[^.]{0,60}\bnor\b/i.test(pre)) fail(`${at}: "neither…nor" proximity agreement is banned`);
  }

  // 10. difficulty-lever heuristics (warnings only)
  if (it.difficulty === 'hard' && it.convention === 'subject-verb') {
    const pre = it.passage.split('______')[0];
    const interrupter = /,[^,]{5,},\s*$/.test(pre);
    if (!interrupter) warn(`${at}: hard subject-verb item has no ", … ," interrupter immediately before the blank`);
  }
  if (it.difficulty === 'hard' && it.convention === 'verb-form') {
    const post = it.passage.split('______')[1] || '';
    if (!post.trim()) warn(`${at}: hard verb-form item has nothing after the blank`);
  }
  if (it.difficulty === 'easy' && it.convention === 'modifier') fail(`${at}: modifier items are never easy (spec §2.1)`);
  if (it.difficulty === 'hard' && it.convention === 'tense') {
    fail(`${at}: tense items are never hard — 0 of the 61 official hard items test tense (spec §4.3)`);
  }
});

// aggregate checks
Object.entries(TARGET_DIFFICULTY).forEach(([d, n]) => {
  if (counts[d] !== n) fail(`difficulty mix: ${d} is ${counts[d]}, target ${n}`);
});
Object.entries(TARGET_CONVENTION).forEach(([c, grid]) => {
  const got = convCounts[c] || { easy: 0, medium: 0, hard: 0 };
  Object.entries(grid).forEach(([d, n]) => {
    if (got[d] !== n) fail(`convention mix: ${c}/${d} is ${got[d]}, target ${n}`);
  });
});
LETTERS.forEach((L) => {
  if (keyCounts[L] !== 25) fail(`answer key spread: ${L} is ${keyCounts[L]}, target 25`);
});
for (let i = 2; i < items.length; i += 1) {
  if (items[i].key === items[i - 1].key && items[i].key === items[i - 2].key) {
    fail(`answer key run of three at ${items[i - 2].id}/${items[i - 1].id}/${items[i].id}`);
  }
}
// periodicity guard — a fixed-period key sequence is scoreable without reading
for (let period = 1; period <= 8; period += 1) {
  let matches = 0;
  for (let i = period; i < items.length; i += 1) if (items[i].key === items[i - period].key) matches += 1;
  const rate = matches / (items.length - period);
  if (rate > 0.6) fail(`answer key is periodic at period ${period} (${(rate * 100).toFixed(0)}% self-match)`);
}
// cross-item duplicate answer strings within a convention (a set of 27 "is" keys would be a tell)
const keyByConv = {};
items.forEach((it) => {
  const k = `${it.convention}:${it.options[it.key].toLowerCase()}`;
  keyByConv[k] = (keyByConv[k] || 0) + 1;
});
Object.entries(keyByConv).forEach(([k, n]) => {
  if (n > 4) warn(`keyed answer "${k.split(':')[1]}" is used ${n} times within ${k.split(':')[0]}`);
});

// ---------------------------------------------------------------------- emit

console.log(`Source files : ${srcFiles.join(', ')}`);
console.log(`Items        : ${items.length}`);
console.log(`Difficulty   : ${JSON.stringify(counts)}`);
console.log(`Convention   : ${JSON.stringify(convCounts)}`);
console.log(`Answer key   : ${JSON.stringify(keyCounts)}`);

if (warnings.length) {
  console.log(`\nWarnings (${warnings.length}):`);
  warnings.forEach((w) => console.log(`  ! ${w}`));
}
if (errors.length) {
  console.error(`\nErrors (${errors.length}):`);
  errors.forEach((e) => console.error(`  ✗ ${e}`));
  process.exit(1);
}

fs.writeFileSync(OUT_FILE, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(`\n✓ wrote ${OUT_FILE} (${output.length} questions)`);
