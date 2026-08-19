/**
 * Publication gate for the original Practice Test 10 Math modules.
 *
 * This validator binds the payload to the measured blueprint, checks the app's
 * rendering/storage schema, proves SPR answer-form equivalence exactly, audits
 * every rationale/key pairing, and compares wording against shipped Tests
 * 1-6 and 9.
 *
 * Usage: node scripts/validatePracticeTest10Math.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { resolveSubcategory } = require('./lib/subcategoryMap');

let DOMPurify = null;
let purifierError = null;
let JSDOMImpl = null;
try {
  const createDOMPurify = require('dompurify');
  const { JSDOM } = require('jsdom');
  JSDOMImpl = JSDOM;
  DOMPurify = createDOMPurify(new JSDOM('').window);
} catch (error) {
  purifierError = error;
}

const DATA_FILE = path.resolve(__dirname, 'data/practiceTest10Math.json');
const ASSETS_DIR = path.resolve(__dirname, 'data/practiceTest10Math-assets');
const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
const LETTERS = ['A', 'B', 'C', 'D'];

const EXPECTED = {
  examSlug: 'exam10-math-v1',
  title: 'Exam 10',
  moduleNumbers: [3, 4],
  questionsPerModule: 22,
  timeLimit: 2100,
  sprPositions: [5, 6, 12, 13, 19, 22],
  difficultyByPosition: {
    1: 'easy', 2: 'easy', 3: 'easy', 4: 'easy', 5: 'easy', 6: 'easy',
    7: 'easy', 8: 'easy', 9: 'easy', 10: 'medium', 11: 'medium',
    12: 'medium', 13: 'medium', 14: 'medium', 15: 'medium', 16: 'medium',
    17: 'hard', 18: 'hard', 19: 'hard', 20: 'hard', 21: 'hard', 22: 'hard',
  },
  difficultyMix: { 3: { easy: 9, medium: 7, hard: 6 }, 4: { easy: 9, medium: 7, hard: 6 } },
  visuals: { 3: 4, 4: 5 },
  graphAssets: { 3: 4, 4: 4 },
  visualSurfaces: {
    3: { table: [], svg: [3, 7, 13, 15] },
    4: { table: [8], svg: [7, 11, 14, 20] },
  },
  moduleDomains: {
    3: { Algebra: 7, 'Advanced Math': 7, 'Problem-Solving and Data Analysis': 5, 'Geometry and Trigonometry': 3 },
    4: { Algebra: 7, 'Advanced Math': 7, 'Problem-Solving and Data Analysis': 4, 'Geometry and Trigonometry': 4 },
  },
  domainQuota: { Algebra: 14, 'Advanced Math': 14, 'Problem-Solving and Data Analysis': 9, 'Geometry and Trigonometry': 7 },
  skillQuota: {
    'linear-equations-one-variable': 3,
    'linear-functions': 3,
    'linear-equations-two-variables': 3,
    'systems-linear-equations': 3,
    'linear-inequalities': 2,
    'nonlinear-functions': 7,
    'nonlinear-equations': 4,
    'equivalent-expressions': 3,
    'ratios-rates-proportions': 2,
    percentages: 1,
    'one-variable-data': 2,
    'two-variable-data': 2,
    probability: 1,
    'inference-statistics': 1,
    'area-volume': 2,
    'lines-angles-triangles': 2,
    'right-triangles-trigonometry': 1,
    circles: 2,
  },
  sprCensus: { integer: 8, fraction: 3, decimal: 1, negative: 1 },
  appliedPositions: { 3: [3, 5, 9, 11, 13, 18], 4: [1, 2, 6, 7, 9, 10, 15, 16] },
};

const REQUIRED_QUESTION_KEYS = [
  'originalQuestionNumber', 'passage', 'text', 'questionType', 'options',
  'correctAnswer', 'acceptedAnswers', 'difficulty', 'subcategory',
  'subcategoryId', 'explanation', 'graphAsset', 'graphDescription',
];
const STATISTICAL = new Set([
  'one-variable-data', 'two-variable-data', 'probability',
  'inference-statistics', 'evaluating-statistical-claims',
]);
const GEOMETRY_FIGURE_SKILLS = new Set([
  'area-volume', 'lines-angles-triangles', 'right-triangles-trigonometry',
]);
const ALLOWED_HTML_TAGS = new Set(['p', 'div', 'table', 'caption', 'thead', 'tbody', 'tr', 'th', 'td', 'sup', 'sub', 'strong', 'em', 'br']);
const errors = [];
const warnings = [];

function fail(message) { errors.push(message); }
function warn(message) { warnings.push(message); }
function stripTags(value) { return String(value || '').replace(/<[^>]+>/g, ' '); }
function normalizeSpace(value) { return String(value || '').replace(/\s+/g, ' ').trim(); }
function decodeEntities(value) {
  return String(value || '')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ').replace(/&le;/g, '≤').replace(/&ge;/g, '≥');
}
function proseOnly(value) {
  return String(value || '')
    .replace(/<div[^>]*text-align:\s*center[^>]*>[\s\S]*?<\/div>/gi, ' ')
    .replace(/<table[\s\S]*?<\/table>/gi, ' ');
}
function wordCount(value) {
  const text = normalizeSpace(stripTags(proseOnly(value)));
  return text ? text.split(' ').length : 0;
}
function gcd(a, b) {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b) [a, b] = [b, a % b];
  return a;
}
function parseRational(raw) {
  const s = String(raw).trim();
  let n;
  let d;
  if (/^-?\d+\/\d+$/.test(s)) {
    const parts = s.split('/');
    n = BigInt(parts[0]);
    d = BigInt(parts[1]);
    if (d === 0n) throw new Error('zero denominator');
  } else if (/^-?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s)) {
    const negative = s.startsWith('-');
    const unsigned = negative ? s.slice(1) : s;
    const [whole = '0', fraction = ''] = unsigned.split('.');
    d = 10n ** BigInt(fraction.length);
    n = BigInt((whole || '0') + fraction);
    if (negative) n = -n;
  } else {
    throw new Error('not a legal numeric entry');
  }
  if (d < 0n) { n = -n; d = -d; }
  const factor = gcd(n, d) || 1n;
  return { n: n / factor, d: d / factor };
}
function equalRational(a, b) {
  const x = parseRational(a);
  const y = parseRational(b);
  return x.n === y.n && x.d === y.d;
}
function acceptedSurfaceMatches(value, canonical) {
  if (equalRational(value, canonical)) return true;
  if (!String(canonical).includes('/') || !String(value).includes('.')) return false;
  const exact = parseRational(canonical);
  const decimal = String(value);
  const places = (decimal.split('.')[1] || '').length;
  const factor = 10 ** places;
  const number = Number(exact.n) / Number(exact.d);
  const truncated = Math.trunc(number * factor) / factor;
  const rounded = Math.round(number * factor) / factor;
  const entered = Number(decimal);
  return entered === truncated || entered === rounded;
}
function plainNumeric(value) {
  return /^-?[\d,]+(?:\.\d+)?$/.test(String(value).trim());
}
function numericValue(value) { return Number(String(value).replace(/,/g, '')); }
function choiceNumericValue(value) {
  const raw = String(value).trim().replace(/,/g, '');
  const percent = raw.endsWith('%');
  const body = percent ? raw.slice(0, -1) : raw;
  let number;
  if (/^-?\d+\/\d+$/.test(body)) {
    const [n, d] = body.split('/').map(Number);
    number = d ? n / d : NaN;
  } else if (/^-?(?:\d+(?:\.\d*)?|\.\d+)$/.test(body)) {
    number = Number(body);
  } else {
    return null;
  }
  return percent ? number / 100 : number;
}

function checkHtml(label, field, html) {
  if (!html) return;
  const tags = [...String(html).matchAll(/<\/?\s*([a-zA-Z0-9-]+)/g)].map((m) => m[1].toLowerCase());
  for (const tag of tags) {
    if (!ALLOWED_HTML_TAGS.has(tag)) fail(`${label}: ${field} contains unsupported <${tag}> markup`);
  }
  if (/<(?:script|iframe|object|embed|img|link|meta)\b/i.test(html)) fail(`${label}: ${field} contains forbidden active/external markup`);
  if (/\son\w+\s*=|javascript:/i.test(html)) fail(`${label}: ${field} contains an event handler or javascript URL`);
  if (DOMPurify) {
    const clean = DOMPurify.sanitize(html, { ALLOWED_TAGS: [...ALLOWED_HTML_TAGS] });
    const before = normalizeSpace(decodeEntities(stripTags(html)));
    const after = normalizeSpace(decodeEntities(stripTags(clean)));
    if (before !== after) fail(`${label}: ${field} loses visible content under DOMPurify`);
    if (/<table\b/i.test(html)) {
      for (const tag of ['table', 'caption', 'tr', 'th', 'td']) {
        const beforeCount = (String(html).match(new RegExp(`<${tag}\\b`, 'gi')) || []).length;
        const afterCount = (String(clean).match(new RegExp(`<${tag}\\b`, 'gi')) || []).length;
        if (beforeCount !== afterCount) fail(`${label}: ${field} loses <${tag}> structure under DOMPurify`);
      }
    }
  }
}

const STOP_WORDS = new Set(normalizeSpace(`
  a an and are as at be by each equation equations for from function given graph has have
  in is it its line lines of on one or point points shown that the this to value values what
  where which with x y number numbers constant constants real integer integers solution solutions
  circle radius triangle side length area volume table model data measure find represents
`).split(' '));
function contentWords(value) {
  return new Set(stripTags(value).toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/)
    .filter((word) => word.length >= 4 && !STOP_WORDS.has(word)));
}
function similarity(a, b) {
  const aa = contentWords(a);
  const bb = contentWords(b);
  if (!aa.size || !bb.size) return 0;
  let intersection = 0;
  for (const word of aa) if (bb.has(word)) intersection += 1;
  return intersection / (aa.size + bb.size - intersection);
}
function loadPriorCorpus() {
  const corpus = [];
  for (const test of [1, 2, 3, 4, 5, 6, 9]) {
    const file = path.resolve(__dirname, 'data', `practiceTest${test}Math.json`);
    if (!fs.existsSync(file)) continue;
    const prior = JSON.parse(fs.readFileSync(file, 'utf8'));
    for (const module of prior.modules || []) {
      for (const q of module.questions || []) {
        corpus.push({
          label: `PT${test} M${module.moduleNumber}Q${q.originalQuestionNumber}`,
          stem: normalizeSpace(`${stripTags(q.passage)} ${stripTags(q.text)}`),
          contextual: /<p\b/i.test(q.passage || '') || /\.\s+[A-Z(]/.test(stripTags(q.text || '')),
          exactStem: normalizeSpace(`${stripTags(q.passage)} ${stripTags(q.text)}`).toLowerCase(),
        });
      }
    }
  }
  return corpus;
}

if (!DOMPurify) fail(`DOMPurify/jsdom unavailable: ${purifierError?.message || 'unknown error'}`);
if (data.examSlug !== EXPECTED.examSlug) fail(`examSlug must be ${EXPECTED.examSlug}`);
if (data.targetExamTitle !== EXPECTED.title) fail(`targetExamTitle must be ${EXPECTED.title}`);
if (!Array.isArray(data.modules) || data.modules.length !== 2) fail('Payload must contain exactly two modules');

const priorCorpus = loadPriorCorpus();
const currentStems = [];
const formDomains = {};
const formSkills = {};
const sprAnswers = [];
const seenAssets = new Set();
const seenModuleNumbers = new Set();

for (const module of data.modules || []) {
  const m = module.moduleNumber;
  const mLabel = `M${m}`;
  if (!EXPECTED.moduleNumbers.includes(m)) fail(`${mLabel}: unexpected moduleNumber`);
  if (seenModuleNumbers.has(m)) fail(`${mLabel}: duplicate moduleNumber`);
  seenModuleNumbers.add(m);
  if (module.title !== `Exam 10, Module ${m}`) fail(`${mLabel}: title does not follow Exam 10 module convention`);
  if (module.description !== `Practice Test 10 - Math, Module ${m - 2} (22 questions)`) fail(`${mLabel}: description does not match module metadata contract`);
  if (module.section !== 'Math') fail(`${mLabel}: section must be Math`);
  if (module.calculatorAllowed !== true) fail(`${mLabel}: calculatorAllowed must be true`);
  if (module.timeLimit !== EXPECTED.timeLimit) fail(`${mLabel}: timeLimit must be ${EXPECTED.timeLimit}`);
  if (!Array.isArray(module.questions) || module.questions.length !== EXPECTED.questionsPerModule) {
    fail(`${mLabel}: expected ${EXPECTED.questionsPerModule} questions, found ${module.questions?.length}`);
    continue;
  }

  const sprAt = [];
  const difficulties = { easy: 0, medium: 0, hard: 0 };
  const keys = { A: 0, B: 0, C: 0, D: 0 };
  const moduleDomains = {};
  let visuals = 0;
  let graphAssets = 0;
  let circleCount = 0;
  let mcCount = 0;
  let sprCount = 0;
  const keySequence = [];

  module.questions.forEach((q, index) => {
    const n = q.originalQuestionNumber;
    const label = `${mLabel}Q${n}`;
    const missing = REQUIRED_QUESTION_KEYS.filter((key) => !(key in q));
    if (missing.length) fail(`${label}: missing keys ${missing.join(', ')}`);
    if (n !== index + 1) fail(`${label}: question number is out of sequence at position ${index + 1}`);
    if (!['easy', 'medium', 'hard'].includes(q.difficulty)) fail(`${label}: invalid difficulty ${q.difficulty}`);
    else difficulties[q.difficulty] += 1;
    if (q.difficulty !== EXPECTED.difficultyByPosition[n]) {
      fail(`${label}: difficulty ${q.difficulty} breaks the bound ramp (${EXPECTED.difficultyByPosition[n]} expected)`);
    }
    if (!normalizeSpace(q.text)) fail(`${label}: empty question text`);
    if (!normalizeSpace(q.explanation) || stripTags(q.explanation).length < 60) fail(`${label}: explanation is missing or too short`);

    const sub = resolveSubcategory(q.subcategory);
    if (!sub) fail(`${label}: unknown subcategory ${q.subcategory}`);
    else {
      if (sub.id !== q.subcategoryId) fail(`${label}: subcategoryId ${q.subcategoryId} does not match ${sub.id}`);
      if (sub.section !== 'Math') fail(`${label}: subcategory is not Math`);
      formDomains[sub.mainCategory] = (formDomains[sub.mainCategory] || 0) + 1;
      moduleDomains[sub.mainCategory] = (moduleDomains[sub.mainCategory] || 0) + 1;
      formSkills[sub.kebab] = (formSkills[sub.kebab] || 0) + 1;
    }
    if (q.subcategory === 'circles') circleCount += 1;
    if (q.subcategory === 'probability' && m !== 4) fail(`${label}: probability is reserved for Module 4`);
    if (q.subcategory === 'linear-inequalities' && q.questionType !== 'multiple-choice') {
      fail(`${label}: all supplied inequality exemplars are MC; Test 10 binds this skill to MC`);
    }

    const isApplied = EXPECTED.appliedPositions[m].includes(n);
    const stem = normalizeSpace(`${stripTags(q.passage)} ${stripTags(q.text)}`);
    const exactStem = stem.toLowerCase();
    const contextual = isApplied || STATISTICAL.has(q.subcategory);
    const duplicate = currentStems.find((entry) => entry.exactStem === exactStem);
    if (duplicate) fail(`${label}: exact stem duplicate of ${duplicate.label} within Test 10`);
    if (contextual) {
      const contextualDuplicate = currentStems.find((entry) => entry.contextual && similarity(stem, entry.stem) >= 0.78 && contentWords(stem).size >= 5);
      if (contextualDuplicate) fail(`${label}: near-duplicate context of ${contextualDuplicate.label} within Test 10`);
    }
    currentStems.push({ label, stem, exactStem, contextual });
    for (const prior of priorCorpus) {
      if (exactStem === prior.exactStem) fail(`${label}: exact passage/stem duplicate of ${prior.label}`);
    }
    if (contextual && contentWords(stem).size >= 5) {
      for (const prior of priorCorpus) {
        if (!prior.contextual) continue;
        const score = similarity(stem, prior.stem);
        if (score >= 0.72) fail(`${label}: wording/context collision with ${prior.label} (Jaccard ${score.toFixed(2)})`);
        else if (score >= 0.55) warn(`${label}: possible echo of ${prior.label} (Jaccard ${score.toFixed(2)})`);
      }
    }

    const proseWords = wordCount(`${q.passage || ''} ${q.text || ''}`);
    let cap = isApplied ? 55 : 35;
    if (STATISTICAL.has(q.subcategory)) cap = 75;
    if (q.subcategory === 'equivalent-expressions' && /^Which expression is equivalent/.test(stripTags(q.text))) cap = 18;
    if (proseWords > cap) warn(`${label}: ${proseWords} prose words exceeds the ${cap}-word texture target`);
    const proseSetup = /<p\b/i.test(q.passage || '') || /\.\s+[A-Z(]/.test(stripTags(q.text || ''));
    if (isApplied && !proseSetup) fail(`${label}: blueprint marks this applied, but it has no contextual setup`);
    const stemWithoutOfficialNote = stem.replace(/\(Express your answer[^)]*\)/gi, '');
    if (/\b(?:you|your)\b/i.test(stemWithoutOfficialNote)) fail(`${label}: stem addresses the test taker`);
    if (/^(?:Find|Solve|Determine|Calculate|Compute)\b/i.test(stripTags(q.text).trim())) fail(`${label}: imperative stem`);
    if ((stripTags(q.text).match(/\?/g) || []).length !== 1) fail(`${label}: text must contain exactly one question mark`);
    if (/\\frac|\\sqrt|\\left|\$\$|\\\(/.test(`${q.passage || ''}${q.text || ''}${q.options || ''}`)) fail(`${label}: LaTeX will not render in the player`);
    if (/!/.test(stem)) warn(`${label}: exclamation point is uncharacteristic`);

    checkHtml(label, 'passage', q.passage);
    checkHtml(label, 'text', q.text);
    checkHtml(label, 'explanation', q.explanation);

    if (q.questionType === 'multiple-choice') {
      mcCount += 1;
      if (!Array.isArray(q.options) || q.options.length !== 4) fail(`${label}: MC must have four options`);
      if (!Number.isInteger(q.correctAnswer) || q.correctAnswer < 0 || q.correctAnswer > 3) fail(`${label}: MC key must be index 0-3`);
      else {
        keys[LETTERS[q.correctAnswer]] += 1;
        keySequence.push(LETTERS[q.correctAnswer]);
      }
      if (q.acceptedAnswers !== null) fail(`${label}: MC acceptedAnswers must be null`);
      if ((q.options || []).some((option) => typeof option !== 'string' || !option.trim())) fail(`${label}: every MC option must be a nonempty string`);
      const normalizedOptions = (q.options || []).map((option) => normalizeSpace(option).toLowerCase());
      if (new Set(normalizedOptions).size !== normalizedOptions.length) fail(`${label}: duplicate options after normalization`);
      for (const [optionIndex, option] of (q.options || []).entries()) {
        if (/<[^>]+>/.test(String(option))) fail(`${label}: option ${LETTERS[optionIndex]} contains HTML`);
        if (/&[a-z]+;/i.test(String(option))) fail(`${label}: option ${LETTERS[optionIndex]} contains an HTML entity`);
        if (/[−–—]/.test(String(option))) fail(`${label}: option ${LETTERS[optionIndex]} uses a non-ASCII minus/dash`);
        if (/\r|\n/.test(String(option))) fail(`${label}: option ${LETTERS[optionIndex]} contains a raw newline`);
      }
      const choiceValues = (q.options || []).map(choiceNumericValue);
      if (choiceValues.length === 4 && choiceValues.every((value) => value !== null && Number.isFinite(value))) {
        const values = choiceValues;
        const ascending = values.every((value, i) => i === 0 || value > values[i - 1]);
        const descending = values.every((value, i) => i === 0 || value < values[i - 1]);
        if (!ascending && !descending) fail(`${label}: numeric choices must be monotone (either direction)`);
      }

      const explanation = normalizeSpace(stripTags(q.explanation));
      const keyLetter = LETTERS[q.correctAnswer];
      if (!explanation.startsWith(`Choice ${keyLetter} is correct.`)) fail(`${label}: rationale opener does not match key ${keyLetter}`);
      for (const letter of LETTERS) {
        if (letter === keyLetter) continue;
        const individually = new RegExp(`Choice ${letter} is incorrect`, 'i').test(explanation);
        const diagnosedSentence = explanation.split(/(?<=\.)\s+/).some((sentence) =>
          /incorrect/i.test(sentence) && new RegExp(`\\b${letter}\\b`).test(sentence));
        const groupedDiagnosis = explanation.split(/(?<=\.)\s+/).some((sentence) =>
          /^Choices\b/.test(sentence) && new RegExp(`\\b${letter}\\b`).test(sentence));
        const labeledGraph = new RegExp(`Graph ${letter}\\b`).test(explanation);
        const labeledChoice = new RegExp(`Choice ${letter}\\b`).test(explanation);
        if (!individually && !diagnosedSentence && !groupedDiagnosis && !labeledGraph && !labeledChoice) fail(`${label}: rationale does not diagnose choice ${letter}`);
      }
    } else if (q.questionType === 'user-input') {
      sprCount += 1;
      sprAt.push(n);
      if (!Array.isArray(q.options) || q.options.length) fail(`${label}: SPR options must be []`);
      if (typeof q.correctAnswer !== 'string' || !q.correctAnswer.trim()) fail(`${label}: SPR canonical answer must be a string`);
      if (!Array.isArray(q.acceptedAnswers) || !q.acceptedAnswers.length) fail(`${label}: SPR requires acceptedAnswers`);
      else {
        if (q.acceptedAnswers[0] !== q.correctAnswer) fail(`${label}: canonical answer must be first`);
        if (new Set(q.acceptedAnswers.map(String)).size !== q.acceptedAnswers.length) fail(`${label}: duplicate accepted answer`);
        for (const answer of q.acceptedAnswers) {
          const value = String(answer);
          const limit = value.startsWith('-') ? 6 : 5;
          if (value.length > limit) fail(`${label}: entry ${value} exceeds the ${limit}-character grid limit`);
          try {
            if (!acceptedSurfaceMatches(value, q.correctAnswer)) fail(`${label}: accepted entry ${value} is neither exact nor a valid rounded/truncated surface for ${q.correctAnswer}`);
          } catch (error) {
            fail(`${label}: invalid entry ${value} (${error.message})`);
          }
        }
      }
      sprAnswers.push({ label, answer: q.correctAnswer });
      const explanation = normalizeSpace(stripTags(q.explanation));
      if (!explanation.startsWith(`The correct answer is ${q.correctAnswer}.`)) fail(`${label}: SPR rationale opener must state the canonical answer`);
      const multipleSurfaces = (q.acceptedAnswers || []).length > 1;
      const hasEntryNote = /examples of ways to enter a correct answer/i.test(explanation);
      if (multipleSurfaces !== hasEntryNote) fail(`${label}: answer-entry note does not match accepted-answer multiplicity`);
    } else {
      fail(`${label}: unsupported questionType ${q.questionType}`);
    }

    const rationaleWords = wordCount(q.explanation);
    const minimum = { easy: 40, medium: 45, hard: 60 }[q.difficulty] || 40;
    if (rationaleWords < minimum) warn(`${label}: rationale has ${rationaleWords} words; inspect official-style completeness`);
    if (rationaleWords > 300) warn(`${label}: rationale has ${rationaleWords} words; likely overexplained`);

    const tableVisual = /<table\b/i.test(q.passage || '');
    const tableExpected = EXPECTED.visualSurfaces[m].table.includes(n);
    const svgExpected = EXPECTED.visualSurfaces[m].svg.includes(n);
    if (tableVisual !== tableExpected) fail(`${label}: table presence does not match the bound visual blueprint`);
    if (Boolean(q.graphAsset) !== svgExpected) fail(`${label}: SVG presence does not match the bound visual blueprint`);
    if (q.graphAsset || tableVisual) visuals += 1;
    if (q.graphAsset) {
      graphAssets += 1;
      if (seenAssets.has(q.graphAsset)) fail(`${label}: graphAsset is reused within the form`);
      seenAssets.add(q.graphAsset);
      if (path.basename(q.graphAsset) !== q.graphAsset || !/^PT10-M[34]-Q\d{2}\.svg$/.test(q.graphAsset)) fail(`${label}: unsafe or nonconforming graphAsset name`);
      const expectedAssetName = `PT10-M${m}-Q${String(n).padStart(2, '0')}.svg`;
      if (q.graphAsset !== expectedAssetName) fail(`${label}: graphAsset must be ${expectedAssetName}`);
      const assetPath = path.join(ASSETS_DIR, q.graphAsset);
      if (!fs.existsSync(assetPath)) fail(`${label}: missing ${q.graphAsset}`);
      else {
        const svg = fs.readFileSync(assetPath, 'utf8');
        if (Buffer.byteLength(svg, 'utf8') > 50_000) fail(`${label}: SVG exceeds the 50 KB publication limit`);
        if (!/^\s*<svg\b/.test(svg)) fail(`${label}: asset is not SVG`);
        if (!/\bviewBox=/.test(svg)) fail(`${label}: SVG has no viewBox`);
        if (/<(?:script|image|foreignObject|style|a)\b|(?:href|xlink:href)\s*=\s*["'](?!#)|\son\w+\s*=|javascript:|url\s*\(\s*(?!#)/i.test(svg)) fail(`${label}: SVG embeds active/external content`);
        if (JSDOMImpl) {
          try {
            const parsed = new JSDOMImpl(svg, { contentType: 'image/svg+xml' });
            if (parsed.window.document.documentElement.localName !== 'svg') fail(`${label}: XML root is not svg`);
          } catch (error) {
            fail(`${label}: SVG is not well-formed XML (${error.message})`);
          }
        }
        const scaleNote = /Note: Figure not drawn to scale\./.test(svg);
        if (GEOMETRY_FIGURE_SKILLS.has(q.subcategory) && !scaleNote) fail(`${label}: geometry figure lacks the not-to-scale note`);
        if (!GEOMETRY_FIGURE_SKILLS.has(q.subcategory) && scaleNote) warn(`${label}: non-geometry visual has a not-to-scale note`);
      }
      if (wordCount(q.graphDescription) < 12) fail(`${label}: graphDescription is not data-complete enough`);
      if (/<[^>]+>|&[a-z]+;/i.test(q.graphDescription)) fail(`${label}: graphDescription must be plain text`);
    } else if (q.graphDescription) {
      fail(`${label}: graphDescription exists without graphAsset`);
    }
    if (q.subcategory === 'two-variable-data' && !q.graphAsset) fail(`${label}: measured two-variable-data archetypes require a graph`);
  });

  if (sprAt.join(',') !== EXPECTED.sprPositions.join(',')) fail(`${mLabel}: SPR positions [${sprAt}] do not match [${EXPECTED.sprPositions}]`);
  if (mcCount !== 16 || sprCount !== 6) fail(`${mLabel}: expected 16 MC and 6 SPR, found ${mcCount} MC and ${sprCount} SPR`);
  for (const [difficulty, expected] of Object.entries(EXPECTED.difficultyMix[m])) {
    if (difficulties[difficulty] !== expected) fail(`${mLabel}: ${difficulty} count ${difficulties[difficulty]} != ${expected}`);
  }
  if (visuals !== EXPECTED.visuals[m]) fail(`${mLabel}: visual count ${visuals} != ${EXPECTED.visuals[m]}`);
  if (graphAssets !== EXPECTED.graphAssets[m]) fail(`${mLabel}: SVG count ${graphAssets} != ${EXPECTED.graphAssets[m]}`);
  if (circleCount !== 1) fail(`${mLabel}: expected exactly one circles item`);
  for (const [domain, expected] of Object.entries(EXPECTED.moduleDomains[m])) {
    if ((moduleDomains[domain] || 0) !== expected) fail(`${mLabel}: ${domain} count ${moduleDomains[domain] || 0} != ${expected}`);
  }
  for (const letter of LETTERS) if (keys[letter] !== 4) fail(`${mLabel}: key ${letter} count ${keys[letter]} != 4`);
  let longestStreak = 1;
  let currentStreak = 1;
  for (let index = 1; index < keySequence.length; index += 1) {
    currentStreak = keySequence[index] === keySequence[index - 1] ? currentStreak + 1 : 1;
    longestStreak = Math.max(longestStreak, currentStreak);
  }
  if (longestStreak > 2) fail(`${mLabel}: MC answer-letter streak of ${longestStreak} exceeds the bound maximum of 2`);
  console.log(`${mLabel}: 22 questions | E${difficulties.easy}/M${difficulties.medium}/H${difficulties.hard} | SPR ${sprAt.join(',')} | visuals ${visuals} | ${LETTERS.map((letter) => `${letter}${keys[letter]}`).join(' ')}`);
}

if ([...seenModuleNumbers].sort().join(',') !== EXPECTED.moduleNumbers.join(',')) {
  fail(`Module-number set [${[...seenModuleNumbers].sort()}] must be [${EXPECTED.moduleNumbers}]`);
}
const assetFiles = fs.existsSync(ASSETS_DIR)
  ? fs.readdirSync(ASSETS_DIR).filter((name) => name.toLowerCase().endsWith('.svg')).sort()
  : [];
const referencedAssetFiles = [...seenAssets].sort();
for (const file of assetFiles) if (!seenAssets.has(file)) fail(`Unreferenced SVG asset: ${file}`);
for (const file of referencedAssetFiles) if (!assetFiles.includes(file)) fail(`Referenced SVG absent from asset directory: ${file}`);

for (const [domain, expected] of Object.entries(EXPECTED.domainQuota)) {
  if ((formDomains[domain] || 0) !== expected) fail(`Form: ${domain} count ${formDomains[domain] || 0} != ${expected}`);
}
for (const [skill, expected] of Object.entries(EXPECTED.skillQuota)) {
  if ((formSkills[skill] || 0) !== expected) fail(`Form: ${skill} count ${formSkills[skill] || 0} != ${expected}`);
}
for (const skill of Object.keys(formSkills)) {
  if (!(skill in EXPECTED.skillQuota)) fail(`Form: skill ${skill} is absent from the blueprint`);
}

const census = { integer: 0, fraction: 0, decimal: 0, negative: 0 };
for (const { answer } of sprAnswers) {
  if (answer.startsWith('-')) census.negative += 1;
  if (answer.includes('/')) census.fraction += 1;
  else if (answer.includes('.')) census.decimal += 1;
  else census.integer += 1;
}
if (sprAnswers.length !== 12) fail(`Form: expected 12 SPR items, found ${sprAnswers.length}`);
for (const [kind, expected] of Object.entries(EXPECTED.sprCensus)) {
  if (census[kind] !== expected) fail(`Form: SPR ${kind} count ${census[kind]} != ${expected}`);
}
if ((formSkills.probability || 0) !== 1) fail('Form: exactly one probability item is required');
if ((formSkills['inference-statistics'] || 0) !== 1) fail('Form: exactly one inference-statistics item is required');
if ((formSkills['evaluating-statistical-claims'] || 0) !== 0) fail('Form: inference replaces evaluating claims; both may not appear');

console.log(`Form domains: ${JSON.stringify(formDomains)}`);
console.log(`Form skills: ${JSON.stringify(formSkills)}`);
console.log(`SPR census: ${JSON.stringify(census)} | ${sprAnswers.map(({ label, answer }) => `${label}=${answer}`).join(' ')}`);
console.log('');
for (const message of warnings) console.log(`WARN  ${message}`);
for (const message of errors) console.log(`ERROR ${message}`);
console.log(`\n${errors.length} error(s), ${warnings.length} warning(s).`);
process.exit(errors.length ? 1 : 0);
