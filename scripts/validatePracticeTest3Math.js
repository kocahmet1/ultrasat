/**
 * Validate scripts/data/practiceTest3Math.json — the two Math replacement
 * modules (moduleNumber 3 and 4) for Exam 3 — against the production schema,
 * the College Board math style contract (docs/CB_Math_Style_Spec.md), the PT3
 * blueprint (docs/analysis/PT3_math_blueprint.md), and the app's rendering
 * constraints.
 *
 * Supersedes validatePracticeTest5Math.js: every check that script performed is
 * kept, and these form-level checks are added, because they are the ones the PT4
 * and PT5 critique rounds had to catch by hand —
 *   - domain and per-skill quotas,
 *   - visual count per module + "hard geometry is figure-less",
 *   - probability confined to Module 4, >= 1 circles item per module,
 *   - SPR census (integers / fractions / decimals / negatives),
 *   - stem prose-length caps and the forbidden-move list (LaTeX, "you",
 *     imperatives, multiple question marks),
 *   - rationale length bands by difficulty,
 *   - context/number collision against the shipped PT4 and PT5 item banks.
 *
 * Usage: node scripts/validatePracticeTest3Math.js
 */

const fs = require('fs');
const path = require('path');
const { resolveSubcategory } = require('./lib/subcategoryMap');

let DOMPurify = null;
let domPurifyLoadError = null;
try {
  const createDOMPurify = require('dompurify');
  const { JSDOM } = require('jsdom');
  DOMPurify = createDOMPurify(new JSDOM('').window);
} catch (e) {
  domPurifyLoadError = e;
}

const data = require(path.resolve(__dirname, 'data/practiceTest3Math.json'));
const ASSETS_DIR = path.resolve(__dirname, 'data/practiceTest3Math-assets');

const MATH_SECTION = 'Math';

// ---------------------------------------------------------------------------
// PT3 blueprint (docs/analysis/PT3_math_blueprint.md) — binding
// ---------------------------------------------------------------------------
const EXPECTED = {
  moduleNumbers: [3, 4],
  questionsPerModule: 22,
  timeLimit: 2100,
  sprPositions: [5, 6, 12, 13, 19, 22],
  sprDifficulty: { 5: 'easy', 6: 'easy', 12: 'medium', 13: 'medium', 19: 'hard', 22: 'hard' },
  difficultyMix: { 3: { easy: 9, medium: 7, hard: 6 }, 4: { easy: 8, medium: 8, hard: 6 } },
  visualsPerModule: 4,
  domainQuota: { Algebra: 14, 'Advanced Math': 15, 'Problem-Solving and Data Analysis': 8, 'Geometry and Trigonometry': 7 },
  skillQuota: {
    'linear-equations-one-variable': 3, 'linear-functions': 4, 'linear-equations-two-variables': 2,
    'systems-linear-equations': 3, 'linear-inequalities': 2, 'nonlinear-functions': 7,
    'nonlinear-equations': 5, 'equivalent-expressions': 3, 'ratios-rates-proportions': 2,
    'percentages': 2, 'one-variable-data': 1, 'two-variable-data': 1, 'probability': 1,
    'inference-statistics': 1, 'area-volume': 2, 'lines-angles-triangles': 2,
    'right-triangles-trigonometry': 1, 'circles': 2,
  },
  sprCensus: { integer: 8, fraction: 3, decimal: 1, negative: 1 },
  stemWordCaps: { 'equivalent-expressions': 15, abstract: 35, applied: 55, statistical: 75 },
};

// Measured median stem lengths (addendum section 5): inference 64, probability 55,
// two-variable 35, one-variable 32 prose words. These skills get the long cap.
const STATISTICAL_SKILLS = new Set(['inference-statistics', 'evaluating-statistical-claims',
  'one-variable-data', 'two-variable-data', 'probability']);

const errors = [];
const warnings = [];

if (!DOMPurify) {
  errors.push(`DOMPurify/jsdom are required for publication validation (${domPurifyLoadError?.message || 'load failed'})`);
}

const letters = ['A', 'B', 'C', 'D'];

function stripTags(s) {
  return String(s || '').replace(/<[^>]+>/g, ' ');
}

// DOMPurify re-encodes bare "<" and ">" as entities; that is a rendering-identical
// rewrite, not a content loss, so normalize before comparing.
function decodeEntities(s) {
  return String(s || '')
    .replace(/&gt;/g, '>').replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ')
    .replace(/&le;/g, '\u2264').replace(/&ge;/g, '\u2265');
}

function isNumericString(s) {
  return /^-?[\d,]+(\.\d+)?$/.test(String(s).trim());
}

function numericValue(s) {
  return parseFloat(String(s).replace(/,/g, ''));
}

// Spec section 2b caps PROSE words. A centered displayed equation is a stimulus, not
// prose, so it is removed before counting (otherwise "5x + 3y = 8" scores 5 words).
function proseOnly(s) {
  return String(s || '')
    .replace(/<div[^>]*text-align:\s*center[^>]*>[\s\S]*?<\/div>/gi, ' ')
    .replace(/<table[\s\S]*?<\/table>/gi, ' ');
}

function wordCount(s) {
  return stripTags(proseOnly(s)).replace(/\s+/g, ' ').trim().split(' ').filter(Boolean).length;
}

function checkSanitizerSurvival(qLabel, field, html) {
  if (!html || !DOMPurify) return;
  const clean = DOMPurify.sanitize(html);
  const before = decodeEntities(stripTags(html)).replace(/\s+/g, ' ').trim();
  const after = decodeEntities(stripTags(clean)).replace(/\s+/g, ' ').trim();
  if (before !== after) errors.push(`${qLabel}: ${field} loses content under DOMPurify sanitization`);
  if (/<(script|iframe|object|embed|link|meta)\b/i.test(html)) errors.push(`${qLabel}: ${field} contains a forbidden tag`);
}

// ---------------------------------------------------------------------------
// Prior-form corpus, for collision checking
// ---------------------------------------------------------------------------
function loadPriorCorpus() {
  const out = [];
  for (const f of ['practiceTest4Math.json', 'practiceTest5Math.json']) {
    const p = path.resolve(__dirname, 'data', f);
    if (!fs.existsSync(p)) continue;
    const d = JSON.parse(fs.readFileSync(p, 'utf8'));
    for (const m of d.modules || []) {
      for (const q of m.questions || []) {
        out.push({
          form: f.replace('practiceTest', 'PT').replace('Math.json', ''),
          n: `M${m.moduleNumber}Q${q.originalQuestionNumber}`,
          text: `${stripTags(q.passage || '')} ${stripTags(q.text || '')}`.replace(/\s+/g, ' ').trim(),
        });
      }
    }
  }
  return out;
}

const PRIOR = loadPriorCorpus();
// The collision check hunts reused CONTEXTS, not shared mathematical vocabulary: two
// abstract circle items necessarily both say "circle", "radius" and "central angle"
// without echoing each other. Domain terms are therefore stopped.
const STOP = new Set(('a an the of in on at to for and or is are was were be been what which value given equation function graph shown following each per what is the of a in x y f t n number' +
  ' constants constant xy plane expression' +
  ' circle radius diameter central angle sector arc circumference triangle triangles congruent similar' +
  ' measure degrees square rectangle prism cube cylinder side length width height area volume perimeter' +
  ' surface slope intercept line lines parallel perpendicular point points coordinate ordered pair' +
  ' solution solutions solve real integer integers positive negative possible distinct exactly least' +
  ' greatest maximum minimum values table shows show gives corresponding three four five' +
  ' inequality system systems variable variables term terms coefficient exponent power product quotient' +
  ' sum difference equivalent defined represents represent situation model estimated total').split(/\s+/));

function contentWords(s) {
  return [...new Set(stripTags(s).toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter((w) => w.length > 3 && !STOP.has(w)))];
}

function collisionCheck(qLabel, text) {
  const mine = contentWords(text);
  if (mine.length < 4) return;
  for (const p of PRIOR) {
    const theirs = new Set(contentWords(p.text));
    const shared = mine.filter((w) => theirs.has(w));
    const j = shared.length / Math.max(6, Math.min(mine.length, theirs.size));
    if (j >= 0.6 && shared.length >= 5) {
      errors.push(`${qLabel}: context collides with ${p.form} ${p.n} (shared: ${shared.slice(0, 8).join(', ')})`);
    } else if (j >= 0.45 && shared.length >= 4) {
      warnings.push(`${qLabel}: possible context echo of ${p.form} ${p.n} (shared: ${shared.slice(0, 8).join(', ')})`);
    }
  }
}

// ---------------------------------------------------------------------------
if (!Array.isArray(data.modules) || data.modules.length !== 2) {
  errors.push(`Expected exactly 2 modules, found ${data.modules?.length}`);
}

const formDomains = {};
const formSkills = {};
const sprAnswers = [];

for (const mod of data.modules || []) {
  const mLabel = `Module ${mod.moduleNumber}`;

  if (!EXPECTED.moduleNumbers.includes(mod.moduleNumber)) errors.push(`${mLabel}: unexpected moduleNumber`);
  if (mod.section !== MATH_SECTION) errors.push(`${mLabel}: section must be "${MATH_SECTION}"`);
  if (mod.timeLimit !== EXPECTED.timeLimit) errors.push(`${mLabel}: timeLimit must be ${EXPECTED.timeLimit}`);
  if (mod.calculatorAllowed !== true) errors.push(`${mLabel}: calculatorAllowed must be true`);
  if ((mod.questions || []).length !== EXPECTED.questionsPerModule) {
    errors.push(`${mLabel}: expected ${EXPECTED.questionsPerModule} questions, found ${mod.questions?.length}`);
  }

  const sprAt = [];
  const diffCount = { easy: 0, medium: 0, hard: 0 };
  const keyCount = { A: 0, B: 0, C: 0, D: 0 };
  const seen = new Set();
  let visuals = 0;
  let circles = 0;

  (mod.questions || []).forEach((q, idx) => {
    const n = q.originalQuestionNumber;
    const qLabel = `${mLabel} Q${n}`;

    if (n !== idx + 1) errors.push(`${qLabel}: originalQuestionNumber out of order (position ${idx + 1})`);
    if (seen.has(n)) errors.push(`${qLabel}: duplicate question number`);
    seen.add(n);

    const sub = resolveSubcategory(q.subcategory);
    if (!sub) errors.push(`${qLabel}: unresolvable subcategory "${q.subcategory}"`);
    else {
      if (sub.id !== q.subcategoryId) errors.push(`${qLabel}: subcategoryId ${q.subcategoryId} != canonical ${sub.id}`);
      if (sub.section !== MATH_SECTION) errors.push(`${qLabel}: subcategory "${q.subcategory}" is not a Math skill`);
      formDomains[sub.mainCategory] = (formDomains[sub.mainCategory] || 0) + 1;
      formSkills[sub.kebab] = (formSkills[sub.kebab] || 0) + 1;
    }
    if (q.subcategory === 'probability' && mod.moduleNumber !== 4) {
      errors.push(`${qLabel}: probability items appear in Module 4 only (measured invariant)`);
    }
    if (q.subcategory === 'evaluating-statistical-claims') {
      errors.push(`${qLabel}: evaluating-statistical-claims is absent from every measured form`);
    }
    if (q.subcategory === 'circles') circles += 1;

    if (!['easy', 'medium', 'hard'].includes(q.difficulty)) errors.push(`${qLabel}: bad difficulty "${q.difficulty}"`);
    else diffCount[q.difficulty] += 1;

    if (!q.text || !String(q.text).trim()) errors.push(`${qLabel}: empty text`);
    if (!q.explanation || String(q.explanation).trim().length < 60) errors.push(`${qLabel}: explanation missing/too short`);

    // ---- stem voice + length -------------------------------------------------
    const stem = `${stripTags(proseOnly(q.passage || ''))} ${stripTags(q.text || '')}`.replace(/\s+/g, ' ').trim();
    const words = wordCount(stem);
    let cap = EXPECTED.stemWordCaps.abstract;
    // The 15-word cap governs the "Which expression is equivalent to ...?" surface only;
    // an identity-with-unknown-constants item in the same skill legitimately runs longer.
    if (q.subcategory === 'equivalent-expressions' && /^Which expression is equivalent/.test(stripTags(q.text).trim())) {
      cap = EXPECTED.stemWordCaps['equivalent-expressions'];
    }
    else if (STATISTICAL_SKILLS.has(q.subcategory)) cap = EXPECTED.stemWordCaps.statistical;
    else if ((/<p[\s>]/.test(q.passage || '')
              && stripTags((q.passage.match(/<p[^>]*>[\s\S]*?<\/p>/i) || [''])[0]).trim().split(/\s+/).filter(Boolean).length >= 8)
             || /\.\s+[A-Z]/.test(stripTags(q.text).trim())) {
      // Contextualized item: either the passage opens with a prose <p>, or the context
      // sentences live inside `text` (more than one sentence). The bare-solve shape a
      // long stem would really betray is a single-sentence `text` over a displayed
      // equation, and that keeps the 35-word cap.
      cap = EXPECTED.stemWordCaps.applied;
    }
    if (words > cap) warnings.push(`${qLabel}: stem is ${words} prose words (cap ${cap} for this item class) — going long is the #1 tell of a fake item`);
    // "you" is forbidden in the stem, with one attested exception: CB's own answer-format
    // parenthetical, "(Express your answer as a decimal or fraction, not as a percent.)".
    const stemNoParen = stem.replace(/\(Express your answer[^)]*\)/gi, ' ');
    if (/\byou\b|\byour\b/i.test(stemNoParen)) errors.push(`${qLabel}: stem addresses the reader ("you") — forbidden`);
    if (/^\s*(Find|Solve|Determine|Calculate|Compute)\b/i.test(stripTags(q.text))) errors.push(`${qLabel}: stem uses an imperative — CB items ask, never command`);
    if ((stripTags(q.text).match(/\?/g) || []).length > 1) errors.push(`${qLabel}: stem asks more than one question`);
    if (/\\frac|\\sqrt|\\left|\$\$|\\\(/.test(`${q.passage || ''}${q.text || ''}`)) errors.push(`${qLabel}: LaTeX in passage/text (KaTeX is not loaded in the player)`);
    if (/!/.test(stripTags(q.text))) warnings.push(`${qLabel}: exclamation point in the stem`);
    collisionCheck(qLabel, stem);

    // ---- format-specific -----------------------------------------------------
    if (q.questionType === 'multiple-choice') {
      if (!Array.isArray(q.options) || q.options.length !== 4) errors.push(`${qLabel}: MC must have exactly 4 options`);
      if (!Number.isInteger(q.correctAnswer) || q.correctAnswer < 0 || q.correctAnswer > 3) {
        errors.push(`${qLabel}: MC correctAnswer must be an index 0-3`);
      } else keyCount[letters[q.correctAnswer]] += 1;
      if (q.acceptedAnswers !== null && q.acceptedAnswers !== undefined) errors.push(`${qLabel}: MC acceptedAnswers must be null`);
      if (new Set((q.options || []).map(String)).size !== (q.options || []).length) errors.push(`${qLabel}: duplicate options`);
      for (const [i, opt] of (q.options || []).entries()) {
        if (/<[a-zA-Z/]/.test(String(opt))) errors.push(`${qLabel}: option ${letters[i]} contains an HTML tag (options render as plain text)`);
        if (/&[a-z]+;/.test(String(opt))) errors.push(`${qLabel}: option ${letters[i]} contains an HTML entity (options render as plain text)`);
        if (/\\frac|\\sqrt/.test(String(opt))) errors.push(`${qLabel}: option ${letters[i]} contains LaTeX`);
        if (/\$/.test(String(opt)) && !/^\$?[\d,.]+$/.test(String(opt).trim()) && !/\$[\d,.]+/.test(String(opt))) {
          warnings.push(`${qLabel}: option ${letters[i]} contains "$" — confirm it is money, not LaTeX`);
        }
        // U+2212/2013/2014 are forbidden in options (they must be an ASCII hyphen), but
        // U+207B SUPERSCRIPT MINUS is legitimate inside a superscript exponent and is the
        // only way to write (5)^(x-1) in plain text; scripts/lib/examNormalizer.js does not
        // rewrite it, and its sibling U+207A already ships in PT5's option strings.
        if (/[−–—]/.test(String(opt))) errors.push(`${qLabel}: option ${letters[i]} uses a non-ASCII minus/dash`);
      }
      const opts = (q.options || []).map(String);
      if (opts.length === 4 && opts.every(isNumericString)) {
        const vals = opts.map(numericValue);
        const asc = vals.every((v, i) => i === 0 || v > vals[i - 1]);
        const desc = vals.every((v, i) => i === 0 || v < vals[i - 1]);
        if (!asc && !desc) errors.push(`${qLabel}: numeric options are not monotonically ordered`);
        else if (desc) warnings.push(`${qLabel}: numeric options are descending (allowed for radical/geometry sets — confirm intentional)`);
      }
      const expl = stripTags(q.explanation).trim();
      if (!/^Choice [ABCD] is correct\./.test(expl)) {
        warnings.push(`${qLabel}: MC explanation does not open with "Choice X is correct."`);
      } else if (expl.slice(7, 8) !== letters[q.correctAnswer]) {
        errors.push(`${qLabel}: explanation opener letter "${expl.slice(7, 8)}" does not match key "${letters[q.correctAnswer]}"`);
      }
      // Every wrong letter must be dismissed, individually or inside a grouped dismissal
      // ("Choices A, B, and C are incorrect …"), which the official rationales use
      // 5-17 times per 100 items — see the addendum, section 6.
      const grouped = [...expl.matchAll(/Choices ((?:[ABCD](?:,)?\s*(?:and\s*)?)+)are incorrect/g)]
        .flatMap((m) => m[1].match(/[ABCD]/g) || []);
      for (const L of letters) {
        if (L === letters[q.correctAnswer]) continue;
        if (!new RegExp(`Choice ${L} is incorrect`).test(expl) && !grouped.includes(L)) {
          errors.push(`${qLabel}: explanation never dismisses choice ${L}`);
        }
      }
      const ew = wordCount(q.explanation);
      const band = { easy: [70, 190], medium: [90, 230], hard: [110, 300] }[q.difficulty] || [70, 300];
      if (ew < band[0] || ew > band[1]) warnings.push(`${qLabel}: rationale is ${ew} words (${q.difficulty} band ${band[0]}-${band[1]})`);
    } else if (q.questionType === 'user-input') {
      if (!Array.isArray(q.options) || q.options.length !== 0) errors.push(`${qLabel}: SPR options must be []`);
      if (typeof q.correctAnswer !== 'string' || !q.correctAnswer.trim()) errors.push(`${qLabel}: SPR correctAnswer must be a non-empty string`);
      if (!Array.isArray(q.acceptedAnswers) || q.acceptedAnswers.length === 0) {
        errors.push(`${qLabel}: SPR acceptedAnswers must be a non-empty array`);
      } else {
        if (q.acceptedAnswers[0] !== String(q.correctAnswer)) warnings.push(`${qLabel}: canonical answer is not first in acceptedAnswers`);
        if (new Set(q.acceptedAnswers).size !== q.acceptedAnswers.length) errors.push(`${qLabel}: duplicate entries in acceptedAnswers`);
        for (const a of q.acceptedAnswers) {
          const s = String(a);
          const limit = s.startsWith('-') ? 6 : 5;
          if (s.length > limit) errors.push(`${qLabel}: accepted entry "${s}" exceeds the ${limit}-character limit`);
          if (!/^-?(\d+(\.\d*)?|\.\d+|\d+\/\d+)$/.test(s)) errors.push(`${qLabel}: accepted entry "${s}" is not a legal grid entry`);
        }
      }
      sprAt.push(n);
      sprAnswers.push({ mod: mod.moduleNumber, n, value: String(q.correctAnswer) });
      if (!/^The correct answer is /.test(stripTags(q.explanation).trim())) {
        warnings.push(`${qLabel}: SPR explanation does not open with "The correct answer is …"`);
      }
      if (/Choice [ABCD] is incorrect/.test(stripTags(q.explanation))) errors.push(`${qLabel}: SPR rationale carries MC dismissals`);
      // The entry-forms note is triggered by MULTIPLE legal entry surfaces, not by
      // non-integrality: an official SPR keyed 4.44 (one legal form) carries no note,
      // while 0.5 | 1/2 does. See docs/analysis/CB_Math_C_texture_addendum.md section 7.
      const isFraction = String(q.correctAnswer).includes('/');
      const isDecimal = /\./.test(String(q.correctAnswer));
      const hasNote = /examples of ways to enter a correct answer/.test(stripTags(q.explanation));
      if (isFraction && !hasNote) errors.push(`${qLabel}: a fraction SPR must end with the entry-forms note`);
      if (isDecimal && !hasNote) warnings.push(`${qLabel}: decimal SPR carries no entry-forms note — correct only if there is exactly one legal entry surface`);
      if (!isFraction && !isDecimal && hasNote) warnings.push(`${qLabel}: integer SPR carries the entry-forms note`);
      if (EXPECTED.sprDifficulty[n] && q.difficulty !== EXPECTED.sprDifficulty[n]) {
        errors.push(`${qLabel}: SPR at position ${n} must be ${EXPECTED.sprDifficulty[n]}, found ${q.difficulty}`);
      }
    } else {
      errors.push(`${qLabel}: unknown questionType "${q.questionType}"`);
    }

    // ---- figures -------------------------------------------------------------
    if (q.graphAsset) {
      visuals += 1;
      const f = path.join(ASSETS_DIR, q.graphAsset);
      if (!fs.existsSync(f)) errors.push(`${qLabel}: missing figure asset ${q.graphAsset}`);
      else {
        const svg = fs.readFileSync(f, 'utf8');
        if (!/^<svg[\s>]/.test(svg.trim())) errors.push(`${qLabel}: ${q.graphAsset} does not start with <svg`);
        if (/<script\b/i.test(svg)) errors.push(`${qLabel}: ${q.graphAsset} contains a script tag`);
        if (/<image\b|xlink:href/i.test(svg)) errors.push(`${qLabel}: ${q.graphAsset} embeds a raster/external reference`);
        const geometrySkill = ['lines-angles-triangles', 'right-triangles-trigonometry', 'area-volume'].includes(q.subcategory);
        const hasNote = /Note: Figure not drawn to scale\./.test(svg);
        if (geometrySkill && !hasNote) errors.push(`${qLabel}: geometry figure is missing "Note: Figure not drawn to scale."`);
        if (!geometrySkill && hasNote) warnings.push(`${qLabel}: non-geometry figure carries the scale note (coordinate grids never do)`);
        if (geometrySkill && q.difficulty === 'hard') errors.push(`${qLabel}: hard geometry is deliberately figure-less`);
      }
      if (!q.graphDescription || !String(q.graphDescription).trim()) errors.push(`${qLabel}: figure item missing graphDescription (alt text)`);
    } else if (q.graphDescription) {
      warnings.push(`${qLabel}: graphDescription present without graphAsset`);
    }
    if (q.subcategory === 'two-variable-data' && !q.graphAsset && !/<table/i.test(q.passage || '')) {
      warnings.push(`${qLabel}: two-variable-data items carry a graph in 9/9 measured items`);
    }
    if (/<table/i.test(q.passage || '')) visuals += q.graphAsset ? 0 : 1;

    checkSanitizerSurvival(qLabel, 'passage', q.passage);
    checkSanitizerSurvival(qLabel, 'text', q.text);
    checkSanitizerSurvival(qLabel, 'explanation', q.explanation);
  });

  // ---- module-level ----------------------------------------------------------
  const expectedSpr = EXPECTED.sprPositions.join(',');
  if (sprAt.join(',') !== expectedSpr) errors.push(`${mLabel}: SPR positions [${sprAt}] != expected [${expectedSpr}]`);
  const expMix = EXPECTED.difficultyMix[mod.moduleNumber];
  if (expMix) {
    for (const d of Object.keys(expMix)) {
      if (diffCount[d] !== expMix[d]) errors.push(`${mLabel}: ${d} count ${diffCount[d]} != blueprint ${expMix[d]}`);
    }
  }
  if (visuals !== EXPECTED.visualsPerModule) errors.push(`${mLabel}: ${visuals} visual-stimulus items != blueprint ${EXPECTED.visualsPerModule}`);
  if (circles < 1) errors.push(`${mLabel}: every measured module carries at least one circles item`);
  const spread = Math.max(...Object.values(keyCount)) - Math.min(...Object.values(keyCount));
  if (spread > 2) warnings.push(`${mLabel}: key-letter balance off (${JSON.stringify(keyCount)})`);
  console.log(`${mLabel}: ${mod.questions.length} questions | SPR at [${sprAt}] | difficulty E${diffCount.easy}/M${diffCount.medium}/H${diffCount.hard} | visuals ${visuals} | keys ${letters.map((l) => `${l}${keyCount[l]}`).join(' ')}`);
}

// ---- form-level --------------------------------------------------------------
console.log(`\nForm domains: ${JSON.stringify(formDomains)}`);
for (const [d, want] of Object.entries(EXPECTED.domainQuota)) {
  const got = formDomains[d] || 0;
  if (got !== want) errors.push(`Form: domain "${d}" has ${got} items, blueprint says ${want}`);
}
for (const [s, want] of Object.entries(EXPECTED.skillQuota)) {
  const got = formSkills[s] || 0;
  if (got !== want) errors.push(`Form: skill "${s}" has ${got} items, blueprint says ${want}`);
}
for (const s of Object.keys(formSkills)) {
  if (!(s in EXPECTED.skillQuota)) errors.push(`Form: skill "${s}" is not in the blueprint quota`);
}

const census = { integer: 0, fraction: 0, decimal: 0, negative: 0 };
for (const a of sprAnswers) {
  if (a.value.startsWith('-')) census.negative += 1;
  if (a.value.includes('/')) census.fraction += 1;
  else if (a.value.includes('.')) census.decimal += 1;
  else census.integer += 1;
}
console.log(`SPR census: ${JSON.stringify(census)} | answers ${sprAnswers.map((a) => `${a.mod}.${a.n}=${a.value}`).join(' ')}`);
for (const [k, want] of Object.entries(EXPECTED.sprCensus)) {
  if (census[k] !== want) errors.push(`Form: SPR census ${k} = ${census[k]}, blueprint says ${want}`);
}
if (sprAnswers.length !== 12) errors.push(`Form: expected 12 SPR items, found ${sprAnswers.length}`);

console.log('');
for (const w of warnings) console.log(`WARN  ${w}`);
for (const e of errors) console.log(`ERROR ${e}`);
console.log(`\n${errors.length} error(s), ${warnings.length} warning(s).`);
process.exit(errors.length ? 1 : 0);
