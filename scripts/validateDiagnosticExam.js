/**
 * Validate scripts/data/diagnosticExamV1.json against the production question
 * schema and College Board-style consistency rules.
 *
 * Usage: node scripts/validateDiagnosticExam.js
 */

const path = require('path');
const { resolveSubcategory } = require('./lib/subcategoryMap');

const data = require(path.resolve(__dirname, 'data/diagnosticExamV1.json'));

const SPR_PATTERN = /^-?(?:\d+\/\d+|\d+(?:\.\d*)?|\.\d+)$/;
const RW_STEMS = [
  'Which choice completes the text with the most logical and precise word or phrase?',
  'Which choice best describes the overall structure of the text?',
  'Which choice best states the main idea of the text?',
  'Which choice completes the text so that it conforms to the conventions of Standard English?',
  'Which choice completes the text with the most logical transition?',
  'Which choice most logically completes the text?',
];

const errors = [];
const warnings = [];

const letters = ['A', 'B', 'C', 'D'];

for (const mod of data.modules) {
  const isRW = mod.moduleNumber <= 2;
  const answerLetters = [];
  const diffCount = { easy: 0, medium: 0, hard: 0 };
  const subcatCount = {};

  mod.questions.forEach((q, i) => {
    const tag = `M${mod.moduleNumber} Q${q.originalQuestionNumber}`;

    // --- Schema basics ---
    if (!q.text || !q.text.trim()) errors.push(`${tag}: empty text`);
    if (!q.explanation || q.explanation.length < 80) errors.push(`${tag}: explanation missing/too short`);
    if (!['easy', 'medium', 'hard'].includes(q.difficulty)) errors.push(`${tag}: bad difficulty "${q.difficulty}"`);
    diffCount[q.difficulty] = (diffCount[q.difficulty] || 0) + 1;
    subcatCount[q.subcategory] = (subcatCount[q.subcategory] || 0) + 1;

    // --- Subcategory resolution ---
    const sub = resolveSubcategory(q.subcategory);
    if (!sub) errors.push(`${tag}: subcategory "${q.subcategory}" does not resolve`);
    else {
      if (sub.id !== q.subcategoryId) errors.push(`${tag}: subcategoryId ${q.subcategoryId} != canonical ${sub.id}`);
      const expectedSection = isRW ? 'Reading and Writing' : 'Math';
      if (sub.section !== expectedSection) errors.push(`${tag}: subcategory section "${sub.section}" wrong for module`);
    }

    // --- Type-specific rules ---
    if (q.questionType === 'multiple-choice') {
      if (!Array.isArray(q.options) || q.options.length !== 4) {
        errors.push(`${tag}: expected exactly 4 options, got ${q.options?.length}`);
        return;
      }
      const seen = new Set();
      q.options.forEach((opt, oi) => {
        if (typeof opt !== 'string' || !opt.trim()) errors.push(`${tag}: option ${letters[oi]} empty`);
        if (/^[A-D][).]\s/.test(opt)) errors.push(`${tag}: option ${letters[oi]} has letter prefix (UI adds its own letters)`);
        if (/<[a-z]+/i.test(opt)) errors.push(`${tag}: option ${letters[oi]} contains HTML (options render as plain text)`);
        const key = opt.trim().toLowerCase();
        if (seen.has(key)) errors.push(`${tag}: duplicate option text "${opt}"`);
        seen.add(key);
      });
      if (!Number.isInteger(q.correctAnswer) || q.correctAnswer < 0 || q.correctAnswer > 3) {
        errors.push(`${tag}: correctAnswer must be integer index 0-3, got ${JSON.stringify(q.correctAnswer)}`);
      } else {
        answerLetters.push(letters[q.correctAnswer]);
      }
      if (q.acceptedAnswers !== null) errors.push(`${tag}: MC question should have acceptedAnswers: null`);
    } else if (q.questionType === 'user-input') {
      if (q.options.length !== 0) errors.push(`${tag}: SPR question must have empty options`);
      if (typeof q.correctAnswer !== 'string') errors.push(`${tag}: SPR correctAnswer must be a string`);
      if (!Array.isArray(q.acceptedAnswers) || q.acceptedAnswers.length === 0) {
        errors.push(`${tag}: SPR needs non-empty acceptedAnswers`);
      } else {
        for (const a of [q.correctAnswer, ...q.acceptedAnswers]) {
          const maxLen = String(a).startsWith('-') ? 6 : 5;
          if (!SPR_PATTERN.test(String(a))) errors.push(`${tag}: answer "${a}" not a valid SAT student response`);
          if (String(a).length > maxLen) errors.push(`${tag}: answer "${a}" exceeds SAT entry length`);
        }
      }
    } else {
      errors.push(`${tag}: unknown questionType "${q.questionType}"`);
    }

    // --- Section-specific rules ---
    if (isRW) {
      if (!q.passage || !q.passage.trim()) errors.push(`${tag}: R&W question missing passage`);
      const stemKnown = RW_STEMS.some((s) => q.text.includes(s)) || /most effectively uses relevant information from the notes|how would|best describes the narrator|would most directly support/.test(q.text);
      if (!stemKnown) warnings.push(`${tag}: stem not in College Board stem set: "${q.text.slice(0, 70)}..."`);
      if (q.subcategory === 'words-in-context' && !q.passage.includes('______')) errors.push(`${tag}: WiC passage missing blank`);
    } else if (q.passage) {
      warnings.push(`${tag}: math question has a passage (unusual)`);
    }
  });

  // --- Module-level checks ---
  const seq = answerLetters.join('');
  if (/AAA|BBB|CCC|DDD/.test(seq)) warnings.push(`M${mod.moduleNumber}: 3+ consecutive identical answer letters (${seq})`);
  const dist = {};
  answerLetters.forEach((l) => { dist[l] = (dist[l] || 0) + 1; });

  console.log(`\nModule ${mod.moduleNumber} (${mod.title}): ${mod.questions.length} questions, timeLimit ${mod.timeLimit}s`);
  console.log(`  difficulty: ${JSON.stringify(diffCount)}`);
  console.log(`  MC answer positions: ${JSON.stringify(dist)}  sequence: ${seq}`);
  console.log(`  subcategories: ${JSON.stringify(subcatCount)}`);
}

// --- Math answer verification (recompute independently) ---
const m = data.modules.find((x) => x.moduleNumber === 3).questions;
const mathChecks = [
  ['M3 Q1', m[0].options[m[0].correctAnswer] === String(36 / 3)],
  ['M3 Q2', m[1].options[m[1].correctAnswer] === String((240 / 15) * 4)],
  ['M3 Q4', Number(m[3].correctAnswer) * 0.8 === 84],
  ['M3 Q5 (3x)', m[4].options[m[4].correctAnswer] === String(((16 + 8) / 2))],
  ['M3 Q6 (mean>median)', (58 / 7 > 5) && m[5].correctAnswer === 1],
  ['M3 Q8 (vertex x)', m[7].options[m[7].correctAnswer] === String((6 + -2) / 2)],
  ['M3 Q10 (discriminant)', 36 - 4 * Number(m[9].correctAnswer) === 0],
  ['M3 Q12 (circle)', (Number(m[11].correctAnswer) + 2) ** 2 === 25 && Number(m[11].correctAnswer) > 0],
];
console.log('\nMath answer recomputation:');
for (const [name, ok] of mathChecks) {
  console.log(`  ${ok ? 'PASS' : 'FAIL'} ${name}`);
  if (!ok) errors.push(`${name}: recomputed answer does not match`);
}

console.log(`\n${'='.repeat(50)}`);
console.log(`Errors: ${errors.length}`);
errors.forEach((e) => console.log('  ERROR: ' + e));
console.log(`Warnings: ${warnings.length}`);
warnings.forEach((w) => console.log('  WARN: ' + w));
process.exit(errors.length > 0 ? 1 : 0);
