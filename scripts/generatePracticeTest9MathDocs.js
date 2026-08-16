/** Generate reviewable Markdown artifacts from the canonical PT9 Math JSON. */

'use strict';

const fs = require('fs');
const path = require('path');

const data = require(path.resolve(__dirname, 'data/practiceTest9Math.json'));
const OUTPUT_DIR = path.resolve(__dirname, '..', 'practice-test-9');
const ASSET_PREFIX = '../scripts/data/practiceTest9Math-assets';
const LETTERS = ['A', 'B', 'C', 'D'];

function decodeEntities(value) {
  return String(value || '')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/&le;/g, '≤').replace(/&ge;/g, '≥').replace(/&nbsp;/g, ' ');
}

function renderInline(value) {
  return decodeEntities(value)
    .replace(/<sup>([^<]*)<\/sup>/gi, '^$1')
    .replace(/<sub>([^<]*)<\/sub>/gi, '_$1')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<div[^>]*>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/?(?:strong|em)[^>]*>/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function renderPassage(value) {
  if (!value) return '';
  if (/<table\b/i.test(value)) return decodeEntities(value).trim();
  return renderInline(value);
}

function renderQuestion(question) {
  const lines = [
    `### ${question.originalQuestionNumber}`,
    '',
    `_${question.difficulty} · ${question.subcategory}_`,
    '',
  ];
  const passage = renderPassage(question.passage);
  if (passage) lines.push(passage, '');
  if (question.graphAsset) {
    lines.push(`![${question.graphDescription}](${ASSET_PREFIX}/${question.graphAsset})`, '');
  }
  lines.push(renderInline(question.text), '');
  if (question.questionType === 'multiple-choice') {
    question.options.forEach((option, index) => lines.push(`${LETTERS[index]}. ${renderInline(option)}`, ''));
  } else {
    lines.push('_Student-produced response_', '');
  }
  lines.push('---', '');
  return lines.join('\n');
}

function renderModule(module, displayNumber) {
  const header = [
    `# SAT Practice Test 9 — Math Module ${displayNumber}`,
    '',
    `${module.questions.length} questions · ${module.timeLimit / 60} minutes · calculator allowed`,
    '',
    'For student-produced response questions, enter a single numeric answer. Figures are drawn to scale unless otherwise indicated.',
    '',
    '---',
    '',
  ];
  return header.join('\n') + module.questions.map(renderQuestion).join('\n');
}

function renderAnswerKey() {
  const lines = ['# SAT Practice Test 9 — Math Answer Key and Rationales', ''];
  data.modules.forEach((module, index) => {
    lines.push(`## Math Module ${index + 1}`, '');
    for (const question of module.questions) {
      const answer = question.questionType === 'multiple-choice'
        ? LETTERS[question.correctAnswer]
        : question.correctAnswer;
      const alternatives = question.questionType === 'user-input' && question.acceptedAnswers.length > 1
        ? `; accepted entries: ${question.acceptedAnswers.join(', ')}`
        : '';
      lines.push(
        `### ${question.originalQuestionNumber}. ${answer}`,
        '',
        `_${question.difficulty} · ${question.subcategory}${alternatives}_`,
        '',
        renderInline(question.explanation),
        '',
      );
    }
  });
  return lines.join('\n');
}

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
const module3 = data.modules.find((module) => module.moduleNumber === 3);
const module4 = data.modules.find((module) => module.moduleNumber === 4);
const outputs = [
  ['SAT-Practice-Test-9-Math-Module-1.md', renderModule(module3, 1)],
  ['SAT-Practice-Test-9-Math-Module-2.md', renderModule(module4, 2)],
  ['SAT-Practice-Test-9-Math-Answer-Key-and-Rationales.md', renderAnswerKey()],
];
for (const [filename, content] of outputs) {
  const output = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(output, content, 'utf8');
  console.log(`wrote ${path.relative(path.resolve(__dirname, '..'), output)} (${content.length} bytes)`);
}
