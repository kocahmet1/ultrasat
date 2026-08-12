#!/usr/bin/env node
/**
 * Build + validate the Transitions refresh question set.
 *
 *   node scripts/data/trn-refresh-2026/build.js
 *
 * Reads the authored source files in ./src, balances the answer key to an exact
 * 25/25/25/25 spread, composes the College Board-style rationale and the
 * structured explanation, validates every item against TRANSITIONS_STYLE_SPEC.md,
 * and writes ./transitions-100.json in the app's question-import schema.
 *
 * Exits non-zero if any hard check fails.
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, 'src');
const OUT_FILE = path.join(__dirname, 'transitions-100.json');
const LETTERS = ['A', 'B', 'C', 'D'];

const STEM = 'Which choice completes the text with the most logical transition?';

// Measured word-count envelopes from the 194-item official export (TRANSITIONS_STYLE_SPEC.md §1).
const LENGTH_BOUNDS = {
  easy: [38, 62],
  medium: [42, 70],
  hard: [46, 78],
};

const TARGET_DIFFICULTY = { easy: 30, medium: 40, hard: 30 };

// Transitions that are NEVER the key in the official 194-item bank. Using one as an
// answer is the single clearest tell of a non-College-Board item.
const NEVER_KEYED = new Set([
  'regardless', 'in conclusion', 'furthermore', 'secondly', 'firstly', 'lastly',
  'in sum', 'rather', 'subsequently', 'soon', 'to conclude', 'first of all',
]);

// Interchangeable consequence markers — at most one may appear in a single option set.
const SYNONYM_GROUPS = [
  ['thus', 'therefore', 'consequently', 'as a result', 'hence', 'accordingly', 'for this reason', 'as such'],
  ['for example', 'for instance'],
  ['similarly', 'likewise', 'in the same way'],
  ['moreover', 'furthermore', 'additionally', 'in addition', "what's more"],
  ['in other words', 'that is'],
  ['however', 'nevertheless', 'nonetheless', 'even so'],
  ['by contrast', 'in contrast', 'conversely', 'on the other hand', 'on the contrary'],
];

// Logical families, for the distractor-spread check.
const FAMILY_OF = {};
const FAMILIES = {
  contrast: ['however', 'by contrast', 'in contrast', 'conversely', 'on the other hand', 'nevertheless',
    'nonetheless', 'still', 'instead', 'rather', 'on the contrary', 'alternatively', 'regardless',
    'even so', 'that said', 'though', 'in truth', 'actually', 'complicating this account,',
    'casting doubt on this account,'],
  cause: ['as a result', 'therefore', 'thus', 'consequently', 'hence', 'accordingly', 'for this reason',
    'as such', 'to that end', 'to this end', 'in response', 'in turn'],
  example: ['for example', 'for instance', 'specifically', 'to be exact', 'namely', 'in particular',
    'notably', 'illustrating this process,'],
  addition: ['additionally', 'in addition', 'moreover', 'furthermore', 'also', 'likewise', 'similarly',
    "what's more", 'besides', 'in the same way', 'second', 'secondly', 'extending this analysis,',
    'following this precedent,', 'supporting this model,', 'confirming this reading,',
    'anticipating this result,'],
  emphasis: ['in fact', 'indeed', 'of course', 'certainly', 'admittedly', 'granted', 'to be sure',
    'fittingly', 'naturally', 'notably', 'in truth'],
  sequence: ['then', 'next', 'finally', 'ultimately', 'later', 'meanwhile', 'previously', 'subsequently',
    'first', 'firstly', 'afterward', 'currently', 'eventually', 'earlier', 'in the end', 'beforehand',
    'lastly', 'today', 'soon'],
  restate: ['in other words', 'that is', 'put differently', 'simply put'],
  conclude: ['in conclusion', 'in short', 'to conclude', 'overall', 'in sum'],
  generalize: ['in general', 'generally', 'typically', 'often', 'more often', 'usually', 'in many cases',
    'sometimes', 'in some cases', 'in most cases', 'at times', 'for the most part'],
  comparison: ['in comparison', 'by comparison'],
};
Object.entries(FAMILIES).forEach(([fam, list]) => list.forEach((w) => { if (!FAMILY_OF[w]) FAMILY_OF[w] = fam; }));

const errors = [];
const warnings = [];
const fail = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

const normalize = (o) => o.trim().replace(/[,.]$/, '').toLowerCase();
const familyOf = (o) => FAMILY_OF[normalize(o)] || FAMILY_OF[o.trim().toLowerCase()] || 'other';

// ---------------------------------------------------------------- load source

const srcFiles = fs.readdirSync(SRC_DIR).filter((f) => /^trn-\d+-.*\.json$/.test(f)).sort();
if (!srcFiles.length) { console.error(`No source files in ${SRC_DIR}`); process.exit(1); }

let items = [];
for (const f of srcFiles) {
  const parsed = JSON.parse(fs.readFileSync(path.join(SRC_DIR, f), 'utf8'));
  parsed.forEach((it) => items.push({ ...it, _file: f }));
}

const officialNouns = JSON.parse(fs.readFileSync(path.join(SRC_DIR, 'official-proper-nouns.json'), 'utf8'));
const officialCorpus = JSON.parse(fs.readFileSync(path.join(SRC_DIR, '_official-corpus-194.json'), 'utf8'));
const officialPassageOpenings = new Set(
  officialCorpus.map((r) => r.passage.slice(0, 45).toLowerCase().replace(/\s+/g, ' '))
);

// ------------------------------------------------------- structural pre-check

const seenIds = new Set();
items.forEach((it, i) => {
  const at = it.id || `#${i}`;
  if (!it.id) fail(`${at}: missing id`);
  if (seenIds.has(it.id)) fail(`${at}: duplicate id`);
  seenIds.add(it.id);
  if (!['easy', 'medium', 'hard'].includes(it.difficulty)) fail(`${at}: bad difficulty "${it.difficulty}"`);
  if (!Array.isArray(it.options) || it.options.length !== 4) fail(`${at}: needs exactly 4 options`);
  else if (new Set(it.options.map((o) => o.toLowerCase())).size !== 4) fail(`${at}: duplicate options`);
  if (typeof it.key !== 'number' || it.key < 0 || it.key > 3) fail(`${at}: bad key`);
  ['passage', 'gist', 'relation', 'instead', 'remember', 'hingeQuote', 'lane', 'family', 'mechanism']
    .forEach((f) => { if (!it[f]) fail(`${at}: missing ${f}`); });
  const rb = it.rebuttals || {};
  if (Object.keys(rb).length !== 3) fail(`${at}: needs exactly 3 rebuttals, has ${Object.keys(rb).length}`);
  Object.keys(rb).forEach((L) => {
    if (!LETTERS.includes(L)) fail(`${at}: rebuttal key "${L}" is not A-D`);
    if (LETTERS.indexOf(L) === it.key) fail(`${at}: rebuttal written for the keyed choice ${L}`);
  });
  if (!/_{4,}/.test(it.passage || '')) fail(`${at}: passage has no ______ blank`);
  if ((it.passage.match(/_{4,}/g) || []).length > 1) fail(`${at}: passage has more than one blank`);
});

if (errors.length) {
  console.error('Source structure errors:\n' + errors.map((e) => '  ✗ ' + e).join('\n'));
  process.exit(1);
}

// -------------------------------------------- re-key rebuttals by option text

items.forEach((it) => {
  const byText = {};
  Object.entries(it.rebuttals).forEach(([L, text]) => { byText[it.options[LETTERS.indexOf(L)]] = text; });
  it._rebuttalsByText = byText;
  it._answerText = it.options[it.key];
});

// -------------------------------------------------- balance the answer key 25x4

const capacity = { A: 25, B: 25, C: 25, D: 25 };
const assigned = [];
items.forEach((it) => {
  const prev1 = assigned[assigned.length - 1];
  const prev2 = assigned[assigned.length - 2];
  const banned = prev1 && prev1 === prev2 ? prev1 : null;
  const pick = LETTERS
    .filter((L) => capacity[L] > 0 && L !== banned)
    .sort((a, b) => capacity[b] - capacity[a] || LETTERS.indexOf(a) - LETTERS.indexOf(b))[0];
  if (!pick) throw new Error(`No letter available for ${it.id}`);
  capacity[pick] -= 1;
  assigned.push(pick);
  it._targetIndex = LETTERS.indexOf(pick);
});

items.forEach((it) => {
  const shift = (it._targetIndex - it.key + 4) % 4;
  const rotated = new Array(4);
  it.options.forEach((opt, i) => { rotated[(i + shift) % 4] = opt; });
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
});

// ------------------------------------------------------------ compose output

/** Render an option the way the official rationales quote it: bare, no trailing comma. */
const bare = (o) => o.trim().replace(/,$/, '');
const q = (s) => `“${s}”`;

/**
 * Rebuttals are spliced after "…illogically signals that ", so their first letter is
 * lowercased — unless the first word is a proper noun. A word counts as a proper noun when
 * it appears capitalized somewhere in the passage at a position that is not sentence-initial
 * (e.g. "Macrocystis", "Vermeulen's", "Bryaninops").
 */
function properNounsIn(passage) {
  const set = new Set();
  // A capitalized word counts as a name when it is NOT sentence-initial. The blank itself
  // stands in for the sentence's opening word, so a capital immediately after ______ is a
  // name too ("______ Macrocystis fastens to loose cobble").
  const RE = /([.!?][”’"')\]]?\s+|^|_{4,}\s*|\s)([A-Z][a-zA-ZÀ-ſ'’-]*)/g;
  let m;
  while ((m = RE.exec(passage)) !== null) {
    if (m[1] === ' ' || /^_{4,}/.test(m[1])) set.add(m[2].replace(/['’]s$/, ''));
  }
  return set;
}
const lower = (s, passage) => {
  const first = (s.match(/^([A-Za-zÀ-ſ'’-]+)/) || [])[1] || '';
  if (passage && properNounsIn(passage).has(first.replace(/['’]s$/, ''))) return s;
  return s.replace(/^([A-Z])(?![A-Z])/, (m) => m.toLowerCase());
};

/**
 * The official rationale template, measured across all 194 items:
 *
 *   Choice {L} is the best answer. "{ans}" logically signals that the information in
 *   this sentence — {gist} — {relation}. Choice {X} is incorrect because "{opt}"
 *   illogically signals that {rebuttal}. Instead, {instead}. [x3]
 *
 * 169/194 official rationales use "logically signals" / "illogically signals" verbatim,
 * and 176/194 use the repeated "Instead," clause.
 */
function buildExplanation(it) {
  const L = LETTERS[it.key];
  const lead = `Choice ${L} is the best answer. ${q(bare(it.options[it.key]))} logically signals that the information in this sentence — ${it.gist} — ${it.relation}.`;
  const rebuts = LETTERS.filter((x) => x !== L).map((x) =>
    `Choice ${x} is incorrect because ${q(bare(it.options[LETTERS.indexOf(x)]))} illogically signals that ${lower(it.rebuttals[x], it.passage)}. Instead, ${lower(it.instead, it.passage)}.`
  );
  return [lead, ...rebuts].join(' ');
}

function buildStructured(it) {
  const L = LETTERS[it.key];
  const choiceRebuttals = {};
  LETTERS.filter((x) => x !== L).forEach((x) => {
    choiceRebuttals[x] = `Option ${x}, ${q(bare(it.options[LETTERS.indexOf(x)]))}, is incorrect because it signals that ${lower(it.rebuttals[x], it.passage)}. Instead, ${lower(it.instead, it.passage)}.`;
  });
  // On concession items the hinge is the sentence that ANSWERS the concession, which sits
  // after the blank. Step 1 must send the student there, not backward.
  // Hinges often contain quoted matter lifted from the passage. Nest it properly: the inner
  // pair becomes single quotes, and a hinge that is itself a full quotation is not re-wrapped.
  let hinge = it.hingeQuote;
  if (/^[“"]/.test(hinge)) {
    hinge = hinge.replace(/,”$/, '.”');
  } else {
    hinge = q(hinge.replace(/“/g, '‘').replace(/”/g, '’'));
  }
  const tail = /[.!?][”’]{0,2}$/.test(hinge) ? '' : '.';
  const step1 = it.hingeAfter
    ? `Step 1: Look past the blank. The sentence that follows it — ${hinge} — answers the blank's sentence, which means the blank is opening a point the text is about to take back.`
    : `Step 1: Read the sentence before the blank and find the hinge — the part the blank has to answer to: ${hinge}${tail}`;
  return {
    rule: 'Cover the choices. Say in your own words what job the sentence with the blank does relative to the sentence before it — adds, reverses, explains, narrows, concedes, or continues. Only then look at the options; exactly one names that job.',
    steps: [
      step1,
      `Step 2: Name the job the new sentence does. Here it ${it.relation}.`,
      `Step 3: Match that job to a choice. ${q(bare(it.options[it.key]))} names it — Choice ${L}.`,
    ],
    choiceRebuttals,
    thingsToRemember: [it.remember],
  };
}

const output = items.map((it) => ({
  passage: it.passage,
  text: STEM,
  questionType: 'multiple-choice',
  options: it.options,
  correctAnswer: it.key,
  acceptedAnswers: null,
  difficulty: it.difficulty,
  subcategory: 'transitions',
  subCategory: 'transitions',
  subcategoryId: 8,
  categoryPath: 'Reading and Writing/Expression of Ideas/Transitions',
  mainCategory: 'Expression of Ideas',
  subjectArea: 'Reading and Writing',
  source: 'ultrasat-original',
  usageContext: 'general',
  skillTags: ['transitions', 'expression-of-ideas', `trn-${it.family}`, `trn-mech-${it.mechanism.toLowerCase()}`],
  graphUrl: null,
  graphDescription: null,
  hasImage: false,
  explanation: buildExplanation(it),
  explanationStructured: buildStructured(it),
  authoringRef: it.id,
  contentSetVersion: 'trn-refresh-2026-08',
}));

// ----------------------------------------------------------------- validation

const wordCount = (s) => s.replace(/_{4,}/g, 'blank').trim().split(/\s+/).filter(Boolean).length;
const sentences = (s) => s.split(/(?<=[.!?][”’"')\]]?)\s+/).filter((x) => x.trim());
// Independent clause units: the official bank joins clauses with semicolons and colons, so a
// "one sentence" item can still carry two full propositions (e.g. the Kármán line item).
const clauseUnits = (s) => s.split(/(?<=[.!?;:][”’"')\]]?)\s+/).filter((x) => x.trim());

// Words that are capitalized but are not names: demonyms, institutional nouns, sentence openers.
const NOT_A_NAME = new Set([
  'January', 'February', 'March', 'April', 'June', 'July', 'August', 'September', 'October',
  'November', 'December', 'North', 'South', 'East', 'West', 'Winter', 'Spring', 'Summer',
  'Autumn', 'First', 'Second', 'Third', 'Field', 'House', 'Long', 'Late', 'Still', 'Instead',
  'Cities', 'Studies', 'Later', 'Early', 'Modern', 'Only', 'Reading', 'Small', 'Large',
  'University', 'College', 'Museum', 'Institute', 'Library', 'Company', 'Society', 'School',
  'Restoration', 'Analyses', 'Surveys', 'Historians', 'Scientists', 'Researchers', 'Engineers',
  'Officials', 'Scholars', 'Watchmakers', 'Ecologists', 'Botanist', 'Freshwater', 'Coastal',
  'Bridge', 'Radio', 'Guild', 'Municipal', 'Accounts', 'Oral', 'Nineteenth-century',
  // demonyms and language/region adjectives
  'African', 'American', 'North American', 'South American', 'European', 'Asian', 'Mexican',
  'Spanish', 'English', 'French', 'German', 'Italian', 'Latin', 'Arabic', 'Chinese', 'Japanese',
  'Indian', 'British', 'Irish', 'Dutch', 'Danish', 'Swedish', 'Norwegian', 'Icelandic',
  'Portuguese', 'Brazilian', 'Argentine', 'Chilean', 'Cuban', 'Bolivian', 'Uruguayan',
  'Ghanaian', 'Nigerian', 'Senegalese', 'Ugandan', 'Kenyan', 'Egyptian', 'Turkish', 'Ottoman',
  'Russian', 'Polish', 'Czech', 'Hungarian', 'Greek', 'Roman', 'Persian', 'Korean', 'Thai',
  'Vietnamese', 'Filipino', 'Malay', 'Indonesian', 'Australian', 'Canadian', 'Scottish',
  'Welsh', 'Catalan', 'Basque', 'Lithuanian', 'Latvian', 'Estonian', 'Finnish', 'Georgian',
  'Armenian', 'Iraqi', 'Iranian', 'Israeli', 'Moroccan', 'Berber', 'Bengali', 'Tamil',
  'Trinidadian', 'Jamaican', 'Haitian', 'Peruvian', 'Colombian', 'Venezuelan', 'Ecuadorian',
]);

const counts = { easy: 0, medium: 0, hard: 0 };
const keyCounts = { A: 0, B: 0, C: 0, D: 0 };
const keyedTransitions = {};
const passageSeen = new Map();
const laneCounts = {};
const mechCounts = {};
const famByDiff = { easy: {}, medium: {}, hard: {} };
let midBlank = 0;
let neverKeyedAsDistractor = 0;

items.forEach((it, i) => {
  const out = output[i];
  const at = it.id;
  counts[it.difficulty] += 1;
  keyCounts[LETTERS[it.key]] += 1;
  laneCounts[it.lane] = (laneCounts[it.lane] || 0) + 1;
  mechCounts[it.mechanism] = (mechCounts[it.mechanism] || 0) + 1;
  famByDiff[it.difficulty][it.family] = (famByDiff[it.difficulty][it.family] || 0) + 1;

  // --- length envelope
  const wc = wordCount(it.passage);
  const [lo, hi] = LENGTH_BOUNDS[it.difficulty];
  if (wc < lo || wc > hi) fail(`${at}: passage is ${wc} words, outside the ${lo}-${hi} envelope for ${it.difficulty}`);

  // --- sentence / clause-unit count
  const sc = sentences(it.passage).length;
  const cu = clauseUnits(it.passage).length;
  if (sc > 4) fail(`${at}: ${sc} sentences (official maximum is 4)`);
  if (cu < 2) fail(`${at}: only ${cu} clause unit(s); every official item carries at least two propositions`);

  // --- the keyed transition must not be one CB never keys
  const ansNorm = normalize(it.options[it.key]);
  if (NEVER_KEYED.has(ansNorm)) fail(`${at}: keyed "${ansNorm}", which is never the answer in the official 194-item bank`);
  keyedTransitions[ansNorm] = (keyedTransitions[ansNorm] || 0) + 1;

  // --- distractor spread: >=3 distinct logical families among the four options
  const fams = it.options.map(familyOf);
  const distinct = new Set(fams).size;
  const keyFam = fams[it.key];
  const sharing = fams.filter((f, j) => f === keyFam && j !== it.key).length;
  const participial = /^H9-/.test(it.mechanism);
  if (!participial) {
    if (distinct < 3) fail(`${at}: only ${distinct} distinct logical families among options ${JSON.stringify(it.options)} (${fams.join('/')})`);
    if (sharing > 1) fail(`${at}: ${sharing} distractors share the key's family "${keyFam}"`);
  } else if (new Set(it.options.map((o) => o.trim().toLowerCase())).size !== 4) {
    fail(`${at}: participial option set must offer four distinct epistemic stances`);
  }

  // --- no two interchangeable synonyms in one option set
  SYNONYM_GROUPS.forEach((group) => {
    const hits = it.options.filter((o) => group.includes(normalize(o)));
    if (hits.length > 1) fail(`${at}: interchangeable options in one set: ${JSON.stringify(hits)}`);
  });

  // --- casing and punctuation must match blank placement.
  // Only a blank that opens a true sentence takes a capital. After a semicolon or colon the
  // official bank lowercases the option ("…mark these jets as outliers; ______ the majority…"
  // → "nevertheless, / consequently, / indeed, / in addition,").
  const isMid = !/(?:^|[.!?][”’"')\]]?\s+)_{4,}/.test(it.passage);
  if (isMid) midBlank += 1;
  it.options.forEach((o) => {
    if (!/,$/.test(o.trim())) fail(`${at}: option "${o}" must end in a comma`);
    const startsUpper = /^[A-Z]/.test(o.trim());
    if (isMid && startsUpper) fail(`${at}: mid-sentence blank requires lowercase options, got "${o}"`);
    if (!isMid && !startsUpper) fail(`${at}: sentence-initial blank requires capitalized options, got "${o}"`);
  });

  // --- blank followed by lowercase continuation when sentence-initial
  if (!isMid) {
    const after = it.passage.split(/_{4,}\s*/)[1] || '';
    if (/^[A-Z]/.test(after) && !/^[A-Z][a-z]*['’]?[a-z]*\s/.test(after.slice(0, 40))) {
      // allow proper nouns; only flag an obvious sentence-style capital
    }
  }

  // --- hinge quote must actually appear in the passage (allowing an ellipsis join)
  const flat = it.passage.replace(/\s+/g, ' ');
  const parts = it.hingeQuote.split(/\s*…\s*/).map((p) => p.trim()).filter(Boolean);
  parts.forEach((p) => {
    if (!flat.includes(p)) fail(`${at}: hingeQuote fragment not found in passage: "${p}"`);
  });

  // --- duplicate passages within the set, and against the official bank
  const pk = it.passage.slice(0, 50).toLowerCase();
  if (passageSeen.has(pk)) fail(`${at}: passage opening duplicates ${passageSeen.get(pk)}`);
  passageSeen.set(pk, at);
  const open45 = it.passage.slice(0, 45).toLowerCase().replace(/\s+/g, ' ');
  if (officialPassageOpenings.has(open45)) fail(`${at}: passage opening matches an official bank item`);

  // --- proper-noun collision with the official bank
  const nouns = new Set();
  const NOUN_RE = /([.!?]\s+|^|\s)([A-Z][a-zA-ZÀ-ſ'’-]+(?:\s+[A-Z][a-zA-ZÀ-ſ'’-]+)*)/g;
  let m;
  while ((m = NOUN_RE.exec(it.passage)) !== null) {
    const sentenceInitial = m[1] !== ' ';
    const wordsIn = m[2].split(/\s+/);
    if (wordsIn.length > 1) nouns.add(m[2]);
    if (!sentenceInitial) wordsIn.forEach((w) => nouns.add(w));
  }
  nouns.forEach((nm) => {
    if (NOT_A_NAME.has(nm)) return;
    if (nm.length > 4 && officialNouns.includes(nm)) fail(`${at}: proper noun "${nm}" also appears in the official bank`);
  });

  // --- rendered output sanity
  if (!out.explanation.startsWith(`Choice ${LETTERS[it.key]} is the best answer.`)) {
    fail(`${at}: explanation must open with "Choice ${LETTERS[it.key]} is the best answer."`);
  }
  if ((out.explanation.match(/is incorrect because/g) || []).length !== 3) {
    fail(`${at}: explanation must refute exactly 3 choices`);
  }
  if (out.explanation.length < 550) warn(`${at}: explanation is short (${out.explanation.length} chars)`);
  ['sounds awkward', 'is less precise', 'not the best choice', 'does not flow', "doesn't flow"]
    .forEach((banned) => {
      if (out.explanation.toLowerCase().includes(banned)) fail(`${at}: explanation uses banned phrase "${banned}"`);
    });
  if (Object.keys(out.explanationStructured.choiceRebuttals).length !== 3) {
    fail(`${at}: structured rebuttals must cover the 3 wrong choices`);
  }

  // count how many items use a never-keyed word as a distractor (CB does this constantly)
  if (it.options.some((o, j) => j !== it.key && NEVER_KEYED.has(normalize(o)))) neverKeyedAsDistractor += 1;
});

// --- no keyed transition may dominate the set
Object.entries(keyedTransitions).forEach(([w, n]) => {
  if (n > 6) fail(`keyed transition "${w}" used ${n} times (max 6)`);
});

// --- answer key runs
for (let i = 2; i < items.length; i += 1) {
  if (items[i].key === items[i - 1].key && items[i].key === items[i - 2].key) {
    fail(`answer key run of three at ${items[i - 2].id}/${items[i - 1].id}/${items[i].id}`);
  }
}

if (items.length !== 100) fail(`expected 100 items, got ${items.length}`);
Object.entries(TARGET_DIFFICULTY).forEach(([d, n]) => {
  if (counts[d] !== n) fail(`difficulty ${d}: expected ${n}, got ${counts[d]}`);
});
LETTERS.forEach((L) => { if (keyCounts[L] !== 25) fail(`answer key ${L}: expected 25, got ${keyCounts[L]}`); });

// --- soft spec targets
const midPct = (100 * midBlank) / items.length;
if (midPct < 8 || midPct > 22) warn(`mid-sentence blanks at ${midPct.toFixed(0)}% (official bank is 9-17%)`);
if (neverKeyedAsDistractor < 15) warn(`only ${neverKeyedAsDistractor} items use a never-keyed word as a distractor (official bank does this heavily)`);
const hardContrast = (famByDiff.hard.contrast || 0) / counts.hard;
if (hardContrast < 0.22) warn(`hard contrast share is ${(100 * hardContrast).toFixed(0)}% (official is 32%)`);

// ---------------------------------------------------------------- report/write

const wcBy = { easy: [], medium: [], hard: [] };
const scBy = { easy: [], medium: [], hard: [] };
items.forEach((it) => { wcBy[it.difficulty].push(wordCount(it.passage)); scBy[it.difficulty].push(sentences(it.passage).length); });

console.log(`\nTransitions refresh — ${items.length} items from ${srcFiles.length} source files\n`);
console.log('  difficulty   ', JSON.stringify(counts));
console.log('  answer key   ', JSON.stringify(keyCounts));
console.log('  topic lanes  ', JSON.stringify(laneCounts));
console.log('  mid-sentence blanks:', `${midBlank}/${items.length} (${midPct.toFixed(0)}%)`);
console.log('  never-keyed words used as distractors:', `${neverKeyedAsDistractor}/${items.length}`);
console.log('\n  passage length (official mean E49.4 / M55.2 / H59.7):');
['easy', 'medium', 'hard'].forEach((d) => {
  const a = wcBy[d].slice().sort((x, y) => x - y);
  const mean = (a.reduce((s, x) => s + x, 0) / a.length).toFixed(1);
  const sMean = (scBy[d].reduce((s, x) => s + x, 0) / scBy[d].length).toFixed(2);
  console.log(`    ${d.padEnd(7)} mean ${mean}  median ${a[Math.floor(a.length / 2)]}  range ${a[0]}-${a[a.length - 1]}   sentences ${sMean}`);
});
console.log('\n  key family by difficulty (official: E seq29/cause21/contrast19, M contrast26/cause18/example16, H contrast32/cause17/emphasis17):');
['easy', 'medium', 'hard'].forEach((d) => {
  const entries = Object.entries(famByDiff[d]).sort((a, b) => b[1] - a[1])
    .map(([f, n]) => `${f} ${Math.round((100 * n) / counts[d])}%`);
  console.log(`    ${d.padEnd(7)} ${entries.join(' · ')}`);
});
console.log('\n  hard mechanisms:', Object.entries(mechCounts).filter(([k]) => k.startsWith('H')).map(([k, v]) => `${k}:${v}`).join(' '));
const topKeys = Object.entries(keyedTransitions).sort((a, b) => b[1] - a[1]).slice(0, 12);
console.log('\n  most-used keyed transitions:', topKeys.map(([w, n]) => `${w}(${n})`).join(', '));

if (warnings.length) console.log('\n' + warnings.map((w) => '  ! ' + w).join('\n'));
if (errors.length) {
  console.error('\nFAILED:\n' + errors.map((e) => '  ✗ ' + e).join('\n'));
  console.error(`\n${errors.length} error(s). Nothing written.`);
  process.exit(1);
}

fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2) + '\n');
console.log(`\n✓ wrote ${output.length} items to ${path.relative(process.cwd(), OUT_FILE)}\n`);
