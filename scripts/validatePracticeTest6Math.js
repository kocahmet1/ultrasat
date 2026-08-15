/**
 * Validate scripts/data/practiceTest6Math.json — the two Math replacement
 * modules (moduleNumber 3 and 4) for Exam 6 — against the production schema,
 * the College Board math style contract (docs/CB_Math_Style_Spec.md), and the
 * app's rendering constraints.
 *
 * Checks per module: metadata (section/timeLimit/count), SPR positions,
 * difficulty curve shape, key-letter balance. Checks per question: schema
 * types, subcategory/id resolution, plain-text options (no HTML), ascending
 * numeric option order, SPR acceptedAnswers character rules, rationale
 * opener liturgy, DOMPurify survival of passage/text/explanation HTML,
 * figure asset existence + well-formedness + graphDescription pairing.
 *
 * Usage: node scripts/validatePracticeTest6Math.js
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

const data = require(path.resolve(__dirname, 'data/practiceTest6Math.json'));
const ASSETS_DIR = path.resolve(__dirname, 'data/practiceTest6Math-assets');

const MATH_SECTION = 'Math';
const EXPECTED = {
  moduleNumbers: [3, 4],
  questionsPerModule: 22,
  timeLimit: 2100,
  sprPositions: [5, 6, 12, 13, 19, 22],
  difficultyMix: { 3: { easy: 9, medium: 7, hard: 6 }, 4: { easy: 9, medium: 7, hard: 6 } },
};

const errors = [];
const warnings = [];

if (!DOMPurify) {
  errors.push(`DOMPurify/jsdom are required for publication validation (${domPurifyLoadError?.message || 'load failed'})`);
}

const letters = ['A', 'B', 'C', 'D'];

function stripTags(s) {
  return String(s || '').replace(/<[^>]+>/g, ' ');
}

function isNumericString(s) {
  return /^-?[\d,]+(\.\d+)?$/.test(String(s).trim().replace(/,/g, m => m));
}

function numericValue(s) {
  return parseFloat(String(s).replace(/,/g, ''));
}

function checkSanitizerSurvival(qLabel, field, html) {
  if (!html || !DOMPurify) return;
  const clean = DOMPurify.sanitize(html);
  const before = stripTags(html).replace(/\s+/g, ' ').trim();
  const after = stripTags(clean).replace(/\s+/g, ' ').trim();
  if (before !== after) {
    errors.push(`${qLabel}: ${field} loses content under DOMPurify sanitization`);
  }
  if (/<(script|iframe|object|embed|link|meta)\b/i.test(html)) {
    errors.push(`${qLabel}: ${field} contains a forbidden tag`);
  }
}

if (!Array.isArray(data.modules) || data.modules.length !== 2) {
  errors.push(`Expected exactly 2 modules, found ${data.modules?.length}`);
}

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

  (mod.questions || []).forEach((q, idx) => {
    const n = q.originalQuestionNumber;
    const qLabel = `${mLabel} Q${n}`;

    if (n !== idx + 1) errors.push(`${qLabel}: originalQuestionNumber out of order (position ${idx + 1})`);
    if (seen.has(n)) errors.push(`${qLabel}: duplicate question number`);
    seen.add(n);

    // subcategory resolution
    const sub = resolveSubcategory(q.subcategory);
    if (!sub) errors.push(`${qLabel}: unresolvable subcategory "${q.subcategory}"`);
    else {
      if (sub.id !== q.subcategoryId) errors.push(`${qLabel}: subcategoryId ${q.subcategoryId} != canonical ${sub.id}`);
      if (sub.section !== MATH_SECTION) errors.push(`${qLabel}: subcategory "${q.subcategory}" is not a Math skill`);
    }

    if (!['easy', 'medium', 'hard'].includes(q.difficulty)) errors.push(`${qLabel}: bad difficulty "${q.difficulty}"`);
    else diffCount[q.difficulty] += 1;

    if (!q.text || !String(q.text).trim()) errors.push(`${qLabel}: empty text`);
    if (!q.explanation || String(q.explanation).trim().length < 60) errors.push(`${qLabel}: explanation missing/too short`);

    // format-specific checks
    if (q.questionType === 'multiple-choice') {
      if (!Array.isArray(q.options) || q.options.length !== 4) errors.push(`${qLabel}: MC must have exactly 4 options`);
      if (!Number.isInteger(q.correctAnswer) || q.correctAnswer < 0 || q.correctAnswer > 3) {
        errors.push(`${qLabel}: MC correctAnswer must be an index 0-3`);
      } else keyCount[letters[q.correctAnswer]] += 1;
      if (q.acceptedAnswers !== null && q.acceptedAnswers !== undefined) {
        errors.push(`${qLabel}: MC acceptedAnswers must be null`);
      }
      for (const [i, opt] of (q.options || []).entries()) {
        // Options render as plain React text: bare relational "x < 5" is fine,
        // but anything shaped like an HTML tag ("<" directly followed by a
        // letter or "/") or an entity would display literally.
        if (/<[a-zA-Z/]/.test(String(opt))) errors.push(`${qLabel}: option ${letters[i]} contains an HTML tag (options render as plain text)`);
        if (/&[a-z]+;/.test(String(opt))) errors.push(`${qLabel}: option ${letters[i]} contains an HTML entity (options render as plain text)`);
        if (/\$/.test(String(opt))
          && !/^\$?[\d,.]+$/.test(String(opt).trim())
          && !/\$[\d,.]+/.test(String(opt))) {
          warnings.push(`${qLabel}: option ${letters[i]} contains "$" — confirm it is money, not LaTeX`);
        }
        if (/[−–—]/.test(String(opt))) errors.push(`${qLabel}: option ${letters[i]} uses a non-ASCII minus/dash`);
      }
      // ascending numeric order
      const opts = (q.options || []).map(String);
      if (opts.length === 4 && opts.every(isNumericString)) {
        const vals = opts.map(numericValue);
        const asc = vals.every((v, i) => i === 0 || v > vals[i - 1]);
        const desc = vals.every((v, i) => i === 0 || v < vals[i - 1]);
        if (!asc && !desc) errors.push(`${qLabel}: numeric options are not monotonically ordered`);
        else if (desc) warnings.push(`${qLabel}: numeric options are descending (allowed for radical/geometry sets — confirm intentional)`);
      }
      if (!/^Choice [ABCD] is correct\./.test(stripTags(q.explanation).trim())) {
        warnings.push(`${qLabel}: MC explanation does not open with "Choice X is correct."`);
      } else {
        const opener = stripTags(q.explanation).trim().slice(7, 8);
        if (opener !== letters[q.correctAnswer]) {
          errors.push(`${qLabel}: explanation opener letter "${opener}" does not match key "${letters[q.correctAnswer]}"`);
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
        for (const a of q.acceptedAnswers) {
          const s = String(a);
          const limit = s.startsWith('-') ? 6 : 5;
          if (s.length > limit) errors.push(`${qLabel}: accepted entry "${s}" exceeds the ${limit}-character limit`);
          if (!/^-?(\d+(\.\d*)?|\.\d+|\d+\/\d+)$/.test(s)) errors.push(`${qLabel}: accepted entry "${s}" is not a legal grid entry`);
        }
      }
      sprAt.push(n);
      if (!/^The correct answer is /.test(stripTags(q.explanation).trim())) {
        warnings.push(`${qLabel}: SPR explanation does not open with "The correct answer is …"`);
      }
    } else {
      errors.push(`${qLabel}: unknown questionType "${q.questionType}"`);
    }

    // figures
    if (q.graphAsset) {
      const f = path.join(ASSETS_DIR, q.graphAsset);
      if (!fs.existsSync(f)) errors.push(`${qLabel}: missing figure asset ${q.graphAsset}`);
      else {
        const svg = fs.readFileSync(f, 'utf8');
        if (!/^<svg[\s>]/.test(svg.trim())) errors.push(`${qLabel}: ${q.graphAsset} does not start with <svg`);
        if (/<script\b/i.test(svg)) errors.push(`${qLabel}: ${q.graphAsset} contains a script tag`);
      }
      if (!q.graphDescription || !String(q.graphDescription).trim()) {
        errors.push(`${qLabel}: figure item missing graphDescription (alt text)`);
      }
    } else if (q.graphDescription) {
      warnings.push(`${qLabel}: graphDescription present without graphAsset`);
    }

    checkSanitizerSurvival(qLabel, 'passage', q.passage);
    checkSanitizerSurvival(qLabel, 'text', q.text);
    checkSanitizerSurvival(qLabel, 'explanation', q.explanation);
  });

  // module-level distribution checks
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
  const spread = Math.max(...Object.values(keyCount)) - Math.min(...Object.values(keyCount));
  if (spread > 2) warnings.push(`${mLabel}: key-letter balance off (${JSON.stringify(keyCount)})`);
  console.log(`${mLabel}: ${mod.questions.length} questions | SPR at [${sprAt}] | difficulty E${diffCount.easy}/M${diffCount.medium}/H${diffCount.hard} | keys ${letters.map(l => `${l}${keyCount[l]}`).join(' ')}`);
}

console.log('');
for (const w of warnings) console.log(`WARN  ${w}`);
for (const e of errors) console.log(`ERROR ${e}`);
console.log(`\n${errors.length} error(s), ${warnings.length} warning(s).`);
process.exit(errors.length ? 1 : 0);
