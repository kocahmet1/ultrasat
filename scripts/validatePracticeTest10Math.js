/**
 * Validate scripts/data/practiceTest10Math.json — the two Math replacement
 * modules (moduleNumber 3 and 4) for Exam 10 — against the production schema,
 * the College Board math style contract (docs/CB_Math_Style_Spec.md), and the
 * PT10 blueprint (docs/analysis/PT10_math_blueprint.md).
 *
 * Checks per module: metadata (section/timeLimit/count), SPR positions,
 * difficulty curve shape, key-letter balance. Checks per question: schema
 * types, subcategory/id resolution, plain-text options (no HTML), ascending
 * numeric option order, SPR acceptedAnswers character rules AND numeric
 * equality with the canonical answer, rationale opener liturgy, DOMPurify
 * survival of passage/text/explanation HTML, figure asset existence +
 * well-formedness + graphDescription pairing.
 *
 * Checks per FORM (new in PT10): domain quotas, skill quotas, visual quota,
 * SPR answer census (integers / fractions / negatives), and duplicate-context
 * detection across all 44 items.
 *
 * Usage: node scripts/validatePracticeTest2Math.js
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

const data = require(path.resolve(__dirname, 'data/practiceTest10Math.json'));
const ASSETS_DIR = path.resolve(__dirname, 'data/practiceTest10Math-assets');

const MATH_SECTION = 'Math';
const EXPECTED = {
  moduleNumbers: [3, 4],
  questionsPerModule: 22,
  timeLimit: 2100,
  sprPositions: [5, 6, 12, 13, 19, 22],
  // PT10 blueprint: PT4's arrangement, the closest of the three legal ones to the pooled mix.
  difficultyMix: { 3: { easy: 9, medium: 7, hard: 6 }, 4: { easy: 8, medium: 8, hard: 6 } },
  visualsPerModule: 4,
  // Form-level quotas from docs/analysis/PT10_math_blueprint.md
  domainQuota: { Algebra: 14, 'Advanced Math': 13, 'Problem-Solving and Data Analysis': 8, 'Geometry and Trigonometry': 9 },
  skillQuota: {
    'linear-equations-one-variable': 3, 'linear-functions': 4, 'linear-equations-two-variables': 3,
    'systems-linear-equations': 2, 'linear-inequalities': 2, 'nonlinear-functions': 6,
    'nonlinear-equations': 4, 'equivalent-expressions': 3, 'ratios-rates-proportions': 2,
    'percentages': 2, 'one-variable-data': 1, 'two-variable-data': 1, 'probability': 1,
    'inference-statistics': 1, 'evaluating-statistical-claims': 0, 'area-volume': 3,
    'lines-angles-triangles': 2, 'right-triangles-trigonometry': 2, 'circles': 2,
  },
  sprCensus: { integers: 8, fractions: 3, decimals: 1, negatives: 1 },
};

const errors = [];
const warnings = [];

if (!DOMPurify) {
  errors.push(`DOMPurify/jsdom are required for publication validation (${domPurifyLoadError?.message || 'load failed'})`);
}

const letters = ['A', 'B', 'C', 'D'];
const ALLOWED_TAGS = new Set(['div', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'sup', 'sub', 'i', 'b', 'br', 'p', 'span', 'em', 'strong']);

function stripTags(s) {
  return String(s || '').replace(/<[^>]+>/g, ' ');
}

function proseWords(s) {
  return stripTags(s).replace(/\s+/g, ' ').trim().split(' ').filter(Boolean).length;
}

function isNumericString(s) {
  return /^-?\$?[\d,]+(\.\d+)?%?$/.test(String(s).trim());
}

function numericValue(s) {
  return parseFloat(String(s).replace(/[$,%\s]/g, ''));
}

/** Exact rational value of a grid entry, or null if it is not a plain number/fraction. */
function entryValue(s) {
  const t = String(s).trim();
  let m = t.match(/^(-?)(\d+)\/(\d+)$/);
  if (m) return (m[1] ? -1 : 1) * (Number(m[2]) / Number(m[3]));
  if (/^-?(\d+(\.\d*)?|\.\d+)$/.test(t)) return Number(t);
  return null;
}

function checkSanitizerSurvival(qLabel, field, html) {
  if (!html || !DOMPurify) return;
  const clean = DOMPurify.sanitize(html);
  const before = stripTags(html).replace(/\s+/g, ' ').trim();
  const after = stripTags(clean).replace(/\s+/g, ' ').trim();
  if (before !== after) {
    errors.push(`${qLabel}: ${field} loses content under DOMPurify sanitization`);
  }
  if (/<(script|iframe|object|embed|link|meta|style)\b/i.test(html)) {
    errors.push(`${qLabel}: ${field} contains a forbidden tag`);
  }
  for (const tag of String(html).match(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b/g) || []) {
    const name = tag.replace(/[<\/]/g, '').toLowerCase();
    if (!ALLOWED_TAGS.has(name)) errors.push(`${qLabel}: ${field} uses unsupported tag <${name}>`);
  }
}

if (!Array.isArray(data.modules) || data.modules.length !== 2) {
  errors.push(`Expected exactly 2 modules, found ${data.modules?.length}`);
}

const formDomains = {};
const formSkills = {};
const sprAnswers = [];
const contextFingerprints = new Map();

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

    if (!['easy', 'medium', 'hard'].includes(q.difficulty)) errors.push(`${qLabel}: bad difficulty "${q.difficulty}"`);
    else diffCount[q.difficulty] += 1;

    if (!q.text || !String(q.text).trim()) errors.push(`${qLabel}: empty text`);
    if (!q.explanation || String(q.explanation).trim().length < 60) errors.push(`${qLabel}: explanation missing/too short`);

    // Stem length: passage prose + text prose, minus displayed-equation lines.
    const stemWords = proseWords(q.passage) + proseWords(q.text);
    const cap = q.subcategory === 'equivalent-expressions' ? 45 : 90;
    if (stemWords > cap) warnings.push(`${qLabel}: stem runs ${stemWords} words (soft cap ${cap}) — check §2b`);

    // Voice fingerprint
    const stemText = `${stripTags(q.passage)} ${stripTags(q.text)}`;
    if (/\byou\b|\byour\b/i.test(stemText)) errors.push(`${qLabel}: stem addresses the reader ("you")`);
    if (/!/.test(stemText)) errors.push(`${qLabel}: stem contains an exclamation point`);
    if (/\\\(|\\frac|\$\$|\\left|\\begin\{/.test(`${q.passage || ''}${q.text || ''}${q.explanation || ''}`)) {
      errors.push(`${qLabel}: LaTeX markup present (KaTeX is not loaded in the player)`);
    }
    const qMarks = (stripTags(q.text).match(/\?/g) || []).length;
    if (q.questionType === 'multiple-choice' && qMarks !== 1) {
      warnings.push(`${qLabel}: text contains ${qMarks} question marks (expected exactly 1)`);
    }

    if (q.questionType === 'multiple-choice') {
      if (!Array.isArray(q.options) || q.options.length !== 4) errors.push(`${qLabel}: MC must have exactly 4 options`);
      if (!Number.isInteger(q.correctAnswer) || q.correctAnswer < 0 || q.correctAnswer > 3) {
        errors.push(`${qLabel}: MC correctAnswer must be an index 0-3`);
      } else keyCount[letters[q.correctAnswer]] += 1;
      if (q.acceptedAnswers !== null && q.acceptedAnswers !== undefined) {
        errors.push(`${qLabel}: MC acceptedAnswers must be null`);
      }
      const optSet = new Set((q.options || []).map(o => String(o).trim()));
      if (optSet.size !== (q.options || []).length) errors.push(`${qLabel}: duplicate option text`);
      for (const [i, opt] of (q.options || []).entries()) {
        if (/<[a-zA-Z/]/.test(String(opt))) errors.push(`${qLabel}: option ${letters[i]} contains an HTML tag (options render as plain text)`);
        if (/&[a-z]+;/.test(String(opt))) errors.push(`${qLabel}: option ${letters[i]} contains an HTML entity (options render as plain text)`);
        if (/[−–—]/.test(String(opt))) errors.push(`${qLabel}: option ${letters[i]} uses a non-ASCII minus/dash`);
        if (!String(opt).trim()) errors.push(`${qLabel}: option ${letters[i]} is empty`);
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
      for (const [i, L] of letters.entries()) {
        if (i === q.correctAnswer) continue;
        if (!new RegExp(`Choice ${L} is incorrect`).test(expl)) {
          warnings.push(`${qLabel}: explanation has no dismissal for choice ${L}`);
        }
      }
    } else if (q.questionType === 'user-input') {
      if (!Array.isArray(q.options) || q.options.length !== 0) errors.push(`${qLabel}: SPR options must be []`);
      if (typeof q.correctAnswer !== 'string' || !q.correctAnswer.trim()) errors.push(`${qLabel}: SPR correctAnswer must be a non-empty string`);
      if (!Array.isArray(q.acceptedAnswers) || q.acceptedAnswers.length === 0) {
        errors.push(`${qLabel}: SPR acceptedAnswers must be a non-empty array`);
      } else {
        if (q.acceptedAnswers[0] !== String(q.correctAnswer)) {
          warnings.push(`${qLabel}: canonical answer is not first in acceptedAnswers`);
        }
        const canonical = entryValue(q.correctAnswer);
        for (const a of q.acceptedAnswers) {
          const s = String(a);
          const limit = s.startsWith('-') ? 6 : 5;
          if (s.length > limit) errors.push(`${qLabel}: accepted entry "${s}" exceeds the ${limit}-character limit`);
          if (!/^-?(\d+(\.\d*)?|\.\d+|\d+\/\d+)$/.test(s)) errors.push(`${qLabel}: accepted entry "${s}" is not a legal grid entry`);
          const v = entryValue(s);
          if (canonical !== null && v !== null && Math.abs(v - canonical) > 0.005) {
            errors.push(`${qLabel}: accepted entry "${s}" (${v}) is not equal to the canonical answer ${q.correctAnswer}`);
          }
        }
        sprAnswers.push({ label: qLabel, value: String(q.correctAnswer) });
      }
      sprAt.push(n);
      if (!/^The correct answer is /.test(stripTags(q.explanation).trim())) {
        warnings.push(`${qLabel}: SPR explanation does not open with "The correct answer is …"`);
      }
      if (/Choice [ABCD] is (correct|incorrect)/.test(q.explanation || '')) {
        errors.push(`${qLabel}: SPR explanation contains choice dismissals`);
      }
      if (!/^-?\d+$/.test(String(q.correctAnswer)) && !/examples of ways to enter a correct answer/.test(q.explanation || '')) {
        warnings.push(`${qLabel}: non-integer SPR is missing the entry-forms note`);
      }
    } else {
      errors.push(`${qLabel}: unknown questionType "${q.questionType}"`);
    }

    if (q.graphAsset) {
      visuals += 1;
      const f = path.join(ASSETS_DIR, q.graphAsset);
      if (!fs.existsSync(f)) errors.push(`${qLabel}: missing figure asset ${q.graphAsset}`);
      else {
        const svg = fs.readFileSync(f, 'utf8');
        if (!/^<svg[\s>]/.test(svg.trim())) errors.push(`${qLabel}: ${q.graphAsset} does not start with <svg`);
        if (/<script\b/i.test(svg)) errors.push(`${qLabel}: ${q.graphAsset} contains a script tag`);
        if (/<foreignObject\b/i.test(svg)) errors.push(`${qLabel}: ${q.graphAsset} uses foreignObject`);
      }
      if (!q.graphDescription || !String(q.graphDescription).trim()) {
        errors.push(`${qLabel}: figure item missing graphDescription (alt text)`);
      }
    } else {
      if (q.graphDescription) warnings.push(`${qLabel}: graphDescription present without graphAsset`);
      if (/<table\b/i.test(q.passage || '')) visuals += 1; // HTML-table stimulus counts as a visual
    }

    checkSanitizerSurvival(qLabel, 'passage', q.passage);
    checkSanitizerSurvival(qLabel, 'text', q.text);
    checkSanitizerSurvival(qLabel, 'explanation', q.explanation);

    // Cross-item context collision: fingerprint the distinctive nouns of the stem.
    const words = stemText.toLowerCase().match(/[a-z]{6,}/g) || [];
    // Only real-world CONTEXT nouns should trip this check, so every word that is
    // part of the test's own mathematical or stem vocabulary is excluded.
    const STOP = new Set([
      // mathematical objects and operations
      'following', 'equation', 'equations', 'function', 'functions', 'expression',
      'expressions', 'variable', 'variables', 'constant', 'constants', 'solution',
      'solutions', 'inequality', 'inequalities', 'system', 'systems', 'graph', 'graphs',
      'graphed', 'defined', 'equivalent', 'coordinate', 'coordinates', 'ordered',
      'intercept', 'vertex', 'circle', 'circles', 'triangle', 'triangles', 'radius',
      'diameter', 'angle', 'angles', 'parallel', 'perpendicular', 'similar', 'linear',
      'quadratic', 'exponential', 'slope', 'measure', 'measures', 'length', 'height',
      'width', 'square', 'volume', 'probability', 'percent', 'percentage', 'median',
      'average', 'random', 'sample', 'estimate', 'estimated', 'interval', 'margin',
      // stem furniture
      'represents', 'represent', 'shown', 'values', 'value', 'number', 'numbers',
      'greatest', 'greater', 'smallest', 'possible', 'increases', 'decreases',
      'interpretation', 'context', 'positive', 'negative', 'certain', 'situation',
      'contains', 'contain', 'selected', 'attended', 'according', 'respectively',
      'corresponds', 'correspond', 'exactly', 'infinitely', 'without', 'between',
      'produced', 'summarizes', 'total', 'totals', 'figure', 'through', 'passes', 'intercepts',
      'circular', 'counted', 'recorded', 'standard', 'deviation', 'diagonal', 'rectangle', 'hypotenuse',
      // units (repeat freely on a real form)
      'inches', 'centimeters', 'meters', 'kilometers', 'minutes', 'seconds', 'hours',
      'ounces', 'pounds', 'grams', 'dollars', 'degrees', 'gallons', 'liters', 'bushels',
      'copies', 'cells', 'feet', 'miles', 'years', 'months',
    ]);
    for (const w of new Set(words.filter(w => !STOP.has(w)))) {
      if (!contextFingerprints.has(w)) contextFingerprints.set(w, []);
      contextFingerprints.get(w).push(qLabel);
    }
  });

  const expectedSpr = EXPECTED.sprPositions.join(',');
  if (sprAt.join(',') !== expectedSpr) {
    errors.push(`${mLabel}: SPR positions [${sprAt}] != expected [${expectedSpr}]`);
  }
  const expMix = EXPECTED.difficultyMix[mod.moduleNumber];
  if (expMix) {
    for (const d of Object.keys(expMix)) {
      if (diffCount[d] !== expMix[d]) errors.push(`${mLabel}: ${d} count ${diffCount[d]} != blueprint ${expMix[d]}`);
    }
  }
  if (visuals !== EXPECTED.visualsPerModule) {
    errors.push(`${mLabel}: ${visuals} stimulus visuals != blueprint ${EXPECTED.visualsPerModule}`);
  }
  const spread = Math.max(...Object.values(keyCount)) - Math.min(...Object.values(keyCount));
  if (spread > 2) warnings.push(`${mLabel}: key-letter balance off (${JSON.stringify(keyCount)})`);
  console.log(`${mLabel}: ${mod.questions.length} questions | SPR at [${sprAt}] | difficulty E${diffCount.easy}/M${diffCount.medium}/H${diffCount.hard} | visuals ${visuals} | keys ${letters.map(l => `${l}${keyCount[l]}`).join(' ')}`);
}

// ---- form-level blueprint conformance ----
console.log('');
for (const [dom, want] of Object.entries(EXPECTED.domainQuota)) {
  const got = formDomains[dom] || 0;
  if (got !== want) errors.push(`FORM: domain "${dom}" count ${got} != blueprint ${want}`);
}
for (const [skill, want] of Object.entries(EXPECTED.skillQuota)) {
  const got = formSkills[skill] || 0;
  if (got !== want) errors.push(`FORM: skill "${skill}" count ${got} != blueprint ${want}`);
}
console.log('Domains: ' + Object.entries(formDomains).map(([k, v]) => `${k} ${v}`).join(' · '));

const census = { integers: 0, fractions: 0, decimals: 0, negatives: 0 };
for (const a of sprAnswers) {
  if (a.value.startsWith('-')) census.negatives += 1;
  if (/^-?\d+$/.test(a.value)) census.integers += 1;
  else if (/\//.test(a.value)) census.fractions += 1;
  else census.decimals += 1;
}
for (const k of Object.keys(EXPECTED.sprCensus)) {
  if (census[k] !== EXPECTED.sprCensus[k]) {
    errors.push(`FORM: SPR census ${k} = ${census[k]} != blueprint ${EXPECTED.sprCensus[k]}`);
  }
}
console.log(`SPR answers (${sprAnswers.length}): ${sprAnswers.map(a => a.value).join(' · ')}`);
console.log(`SPR census: ${census.integers} int / ${census.fractions} frac / ${census.decimals} dec (${census.negatives} negative)`);

// Distinctive-noun collisions across the 44 items (contexts must not repeat).
const collisions = [];
for (const [word, labels] of contextFingerprints) {
  const uniq = [...new Set(labels)];
  if (uniq.length > 1) collisions.push(`"${word}" in ${uniq.join(', ')}`);
}
if (collisions.length) {
  for (const c of collisions) warnings.push(`FORM: repeated distinctive noun — ${c}`);
}

console.log('');
for (const w of warnings) console.log(`WARN  ${w}`);
for (const e of errors) console.log(`ERROR ${e}`);
console.log(`\n${errors.length} error(s), ${warnings.length} warning(s).`);
process.exit(errors.length ? 1 : 0);
