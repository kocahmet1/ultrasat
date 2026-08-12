#!/usr/bin/env node
/**
 * Stage 1 of the Command of Evidence refresh.
 *
 * Reads the authored items in src/*.json and emits coe-questions.json in the
 * live question-document shape — field-for-field parity with the wic-refresh-2026
 * set (scripts/data/wic-refresh-2026/words-in-context-100.json), which is the
 * contract getQuestionsBySubcategory() and SmartQuiz.jsx are built against.
 *
 *   node scripts/data/coe-refresh-2026/build-coe-questions.js
 *
 * Charts are embedded as base64 data URIs (from graph-images.json), the same
 * delivery the app already uses; SmartQuiz renders question.graphUrl directly
 * as an <img src>.
 */

const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const SRC = path.join(DIR, 'src');

const CONTENT_SET = 'coe-refresh-2026-08';
const SUBCATEGORY = 'command-of-evidence';
const SUBCATEGORY_ID = 3;
const MAIN_CATEGORY = 'Information and Ideas';
const SUBJECT_AREA = 'Reading and Writing';
const CATEGORY_PATH = `${SUBJECT_AREA}/${MAIN_CATEGORY}/Command of Evidence`;

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Render a figure table as HTML, matching the markup used in Practice Test 3. */
function tableHtml(fig) {
  const head = fig.columns.map((c) => `<th scope="col">${esc(c)}</th>`).join('');
  const body = fig.rows
    .map(
      (r) =>
        `<tr>${r
          .map((cell, i) =>
            i === 0 ? `<th scope="row">${esc(cell)}</th>` : `<td>${esc(cell)}</td>`
          )
          .join('')}</tr>`
    )
    .join('');
  return (
    `<figure class="question-table">` +
    `<figcaption>${esc(fig.title)}</figcaption>` +
    `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>` +
    `</figure>`
  );
}

/** Flat explanation: key rationale followed by each rebuttal, official register. */
function explanation(item) {
  const parts = [item.why];
  ['A', 'B', 'C', 'D'].forEach((L) => {
    if (item.rebuttals[L]) {
      const r = item.rebuttals[L].trim();
      parts.push(
        r.startsWith('Choice ')
          ? r
          : `Choice ${L} is incorrect because ${r.charAt(0).toLowerCase()}${r.slice(1)}`
      );
    }
  });
  return parts.join(' ');
}

/** skillTags mirror the WIC convention: subcategory, main category, then item-shape tags. */
function skillTags(item) {
  const tags = [SUBCATEGORY, 'information-and-ideas'];
  if (item.family === 'quant') {
    tags.push(`coe-quant-${item.subtype}`); // coe-quant-table / coe-quant-graph
    if (item.stemType) tags.push(`coe-stem-${item.stemType}`);
  } else if (item.family === 'finding') {
    tags.push('coe-finding');
  } else {
    tags.push(`coe-quote-${item.subtype}`); // coe-quote-literary / coe-quote-sourced
  }
  if (item.polarity === 'weaken') tags.push('coe-weaken');
  if (item.compound) tags.push('coe-compound-claim');
  return tags;
}

const dataUris = JSON.parse(
  fs.readFileSync(path.join(DIR, 'graph-images.json'), 'utf8')
);

const items = fs
  .readdirSync(SRC)
  .filter((f) => f.endsWith('.json'))
  .sort()
  .flatMap((f) => JSON.parse(fs.readFileSync(path.join(SRC, f), 'utf8')));

items.sort((a, b) => a.id.localeCompare(b.id));

const questions = items.map((it) => {
  const fig = it.figure;
  let passage = it.passage;
  if (fig && fig.kind === 'table') passage = tableHtml(fig) + passage;

  const isGraph = fig && fig.kind !== 'table';
  if (isGraph && !dataUris[it.id]) {
    throw new Error(`${it.id}: graph item has no rendered image — run render_graphs.py`);
  }

  return {
    authoringRef: it.id,
    source: 'ultrasat-original',
    contentSetVersion: CONTENT_SET,
    usageContext: 'general',

    subjectArea: SUBJECT_AREA,
    mainCategory: MAIN_CATEGORY,
    categoryPath: CATEGORY_PATH,
    subcategory: SUBCATEGORY,
    subCategory: SUBCATEGORY,
    subcategoryId: SUBCATEGORY_ID,
    skillTags: skillTags(it),

    passage,
    text: it.stem,
    questionType: 'multiple-choice',
    options: it.options,
    correctAnswer: it.key,
    acceptedAnswers: null,
    difficulty: it.difficulty,

    explanation: explanation(it),
    explanationStructured: {
      rule: it.remember,
      choiceRebuttals: it.rebuttals,
    },

    graphUrl: isGraph ? dataUris[it.id] : null,
    graphDescription: isGraph ? it.graphDescription || fig.title : null,
  };
});

// --- sanity gates: refuse to emit a bank that would ship a defect ---
const errors = [];
const byLetter = { A: 0, B: 0, C: 0, D: 0 };
questions.forEach((q) => {
  if (q.options.length !== 4) errors.push(`${q.authoringRef}: ${q.options.length} options`);
  if (new Set(q.options).size !== 4) errors.push(`${q.authoringRef}: duplicate options`);
  if (!(q.correctAnswer >= 0 && q.correctAnswer < 4)) errors.push(`${q.authoringRef}: bad correctAnswer`);
  if (!q.explanation || q.explanation.length < 200) errors.push(`${q.authoringRef}: thin explanation`);
  if (!['easy', 'medium', 'hard'].includes(q.difficulty)) errors.push(`${q.authoringRef}: bad difficulty`);
  if (Object.keys(q.explanationStructured.choiceRebuttals).length !== 3)
    errors.push(`${q.authoringRef}: expected 3 choiceRebuttals`);
  if (q.graphUrl && Buffer.byteLength(JSON.stringify(q)) > 900_000)
    errors.push(`${q.authoringRef}: document too close to the 1 MB Firestore limit`);
  byLetter['ABCD'[q.correctAnswer]] += 1;
});
if (questions.length !== 100) errors.push(`expected 100 questions, got ${questions.length}`);
if (errors.length) {
  console.error('Build failed:\n  ' + errors.join('\n  '));
  process.exit(1);
}

const out = path.join(DIR, 'coe-questions.json');
fs.writeFileSync(out, JSON.stringify(questions, null, 1));
console.log(`Wrote ${questions.length} questions -> ${path.relative(process.cwd(), out)}`);
console.log(`  answer key: ${Object.entries(byLetter).map(([k, v]) => `${k}=${v}`).join(' ')}`);
console.log(
  `  difficulty: ${['easy', 'medium', 'hard']
    .map((d) => `${d}=${questions.filter((q) => q.difficulty === d).length}`)
    .join(' ')}`
);
console.log(`  with charts: ${questions.filter((q) => q.graphUrl).length} (inlined data URIs)`);
