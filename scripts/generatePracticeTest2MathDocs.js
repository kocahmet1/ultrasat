/**
 * Render the human-readable Practice Test 2 math documents from
 * scripts/data/practiceTest2Math.json:
 *
 *   practice-test-2/SAT-Practice-Test-2-Math-Module-1.md        (moduleNumber 3)
 *   practice-test-2/SAT-Practice-Test-2-Math-Module-2.md        (moduleNumber 4)
 *   practice-test-2/SAT-Practice-Test-2-Math-Answer-Key-and-Rationales.md
 *
 * Output shape matches practice-test-4/ and practice-test-5/ exactly.
 *
 * Usage: node scripts/generatePracticeTest2MathDocs.js
 */

const fs = require('fs');
const path = require('path');

const data = require(path.resolve(__dirname, 'data/practiceTest2Math.json'));
const OUT_DIR = path.resolve(__dirname, '..', 'practice-test-2');
const LETTERS = ['A', 'B', 'C', 'D'];

/**
 * Passage HTML -> markdown-ish body. Displayed-equation divs become bare
 * centered lines; tables are passed through as raw HTML (the .md files are
 * read in editors and previewers that render inline HTML).
 */
/** Decode the entities the HTML fields legitimately carry (strict inequalities). */
function decodeEntities(s) {
  return String(s)
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function renderPassage(html) {
  if (!html) return '';
  if (/<table\b/i.test(html)) return html.trim();
  return decodeEntities(html)
    .replace(/<div[^>]*>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<sup>([^<]*)<\/sup>/gi, '^$1')
    .replace(/<sub>([^<]*)<\/sub>/gi, '_$1')
    .replace(/<\/?[a-z][^>]*>/gi, '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .join('\n\n');
}

function renderQuestion(q) {
  const lines = [];
  lines.push(`### Question ${q.originalQuestionNumber}  `);
  lines.push(`*${q.difficulty} · ${q.subcategory}*`);
  lines.push('');
  lines.push('');

  if (q.graphAsset) {
    lines.push(`> **[Figure: ${q.graphAsset}]** ${q.graphDescription}`);
    lines.push('');
  }

  const body = renderPassage(q.passage);
  if (body) {
    lines.push('');
    lines.push(body);
    lines.push('');
  }

  lines.push('');
  lines.push(decodeEntities(q.text).replace(/<sup>([^<]*)<\/sup>/gi, '^$1').replace(/<\/?[a-z][^>]*>/gi, ''));
  lines.push('');

  if (q.questionType === 'multiple-choice') {
    lines.push('');
    q.options.forEach((opt, i) => {
      lines.push(`${LETTERS[i]}) ${opt}`);
      lines.push('');
    });
  } else {
    lines.push('_Student-produced response_');
    lines.push('');
  }

  lines.push('');
  lines.push('');
  lines.push('---');
  lines.push('');
  return lines.join('\n');
}

function renderModule(mod, moduleLabel) {
  const head = [
    `# SAT Practice Test 2 — Math Module ${moduleLabel} (moduleNumber ${mod.moduleNumber})`,
    '',
    `_${mod.questions.length} questions · ${Math.round(mod.timeLimit / 60)} minutes · calculator allowed_`,
    '',
    '',
    '---',
    '',
    '',
  ].join('\n');
  return head + mod.questions.map(renderQuestion).join('\n');
}

function renderKey() {
  const out = ['# SAT Practice Test 2 — Math: Answer Key and Rationales', '', ''];
  data.modules.forEach((mod, mi) => {
    out.push(`## Module ${mi + 1} (moduleNumber ${mod.moduleNumber})`);
    out.push('');
    out.push('');
    for (const q of mod.questions) {
      const key = q.questionType === 'multiple-choice'
        ? LETTERS[q.correctAnswer]
        : q.correctAnswer;
      const accepts = q.questionType === 'user-input'
        ? `, accepts: ${q.acceptedAnswers.join(', ')}`
        : '';
      out.push(`**Q${q.originalQuestionNumber}.** \`${key}\`  (${q.difficulty}, ${q.subcategory}${accepts})`);
      out.push('');
      out.push(decodeEntities(q.explanation));
      out.push('');
      out.push('');
    }
  });
  return out.join('\n');
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const m3 = data.modules.find((m) => m.moduleNumber === 3);
const m4 = data.modules.find((m) => m.moduleNumber === 4);

const files = [
  ['SAT-Practice-Test-2-Math-Module-1.md', renderModule(m3, 1)],
  ['SAT-Practice-Test-2-Math-Module-2.md', renderModule(m4, 2)],
  ['SAT-Practice-Test-2-Math-Answer-Key-and-Rationales.md', renderKey()],
];

for (const [name, body] of files) {
  const p = path.join(OUT_DIR, name);
  fs.writeFileSync(p, body, 'utf8');
  console.log(`wrote ${path.relative(path.resolve(__dirname, '..'), p)} (${body.length} bytes)`);
}
