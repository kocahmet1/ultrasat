#!/usr/bin/env node
/**
 * Build the Text Structure and Purpose refresh set.
 *
 * Reads the nine authoring files in ./src, converts each item into the shape the
 * `questions` collection uses, and writes ./text-structure-purpose-100.json.
 *
 *   node scripts/data/tsp-refresh-2026/build.js
 *
 * Authoring shape (src/*.json) -> question doc:
 *   stem        -> text
 *   passage     -> passage            (keeps [UNDERLINED]...[/UNDERLINED] markup)
 *   options     -> options
 *   key         -> correctAnswer      (0-3)
 *   why         -> explanation.steps
 *   rebuttals   -> explanation.choiceRebuttals
 *   remember    -> explanation.thingsToRemember
 *
 * Run validate.js before this; build.js assumes the source is already sound.
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, 'src');
const OUT_FILE = path.join(__dirname, 'text-structure-purpose-100.json');

const SUBCATEGORY = 'text-structure-purpose';
const SUBCATEGORY_ID = 5;
const CONTENT_SET = 'tsp-refresh-2026-08';
const LETTERS = ['A', 'B', 'C', 'D'];

const RULE = {
  function:
    'A function question asks what job a span of text performs for the passage as a whole, not what the span says. The correct choice names a rhetorical move; a choice that merely restates the content is wrong even when it is accurate.',
  purpose:
    'A main purpose question asks why the whole text was written. The correct choice covers every part of the text, including any limit or qualification the last sentence adds, and adds nothing the text does not do.',
  structure:
    'An overall structure question asks for the sequence of moves the text makes. Score each beat separately and in order; a choice that gets two beats right and one wrong is still wrong.',
};

const SKILL_TAGS = {
  function: ['text-structure-purpose', 'function-of-a-portion', 'rhetorical-move'],
  purpose: ['text-structure-purpose', 'main-purpose', 'whole-text-reading'],
  structure: ['text-structure-purpose', 'overall-structure', 'sequence-of-moves'],
};

/** Split a rationale paragraph into sentences without breaking on abbreviations or decimals. */
function sentences(text) {
  return String(text)
    .replace(/\s+/g, ' ')
    .trim()
    .split(/(?<=[.!?])\s+(?=[A-Z“"(])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function buildSteps(item) {
  const steps = [];
  if (Array.isArray(item.moves) && item.moves.length) {
    steps.push(`Step 1: Map the text's moves in order — ${item.moves.join('; then ')}.`);
  } else if (Array.isArray(item.beats) && item.beats.length) {
    steps.push(`Step 1: Break the text into its beats — ${item.beats.join('; then ')}.`);
  }
  sentences(item.why).forEach((s) => {
    steps.push(`Step ${steps.length + 1}: ${s}`);
  });
  return steps;
}

function toQuestionDoc(item) {
  const keyLetter = LETTERS[item.key];
  const rebuttals = {};
  Object.keys(item.rebuttals || {}).forEach((letter) => {
    const L = letter.trim().toUpperCase();
    if (L === keyLetter) return; // never emit a rebuttal against the key
    rebuttals[L] = `Choice ${L} is incorrect because ${lowerFirst(item.rebuttals[letter])}`;
  });

  return {
    sourceId: item.id,
    text: item.stem,
    passage: item.passage,
    graphDescription: null,
    options: item.options,
    correctAnswer: item.key,
    difficulty: item.difficulty,
    subcategory: SUBCATEGORY,
    subcategoryId: SUBCATEGORY_ID,
    questionType: 'multiple-choice',
    usageContext: 'general',
    contentSetVersion: CONTENT_SET,
    skillTags: SKILL_TAGS[item.subtype],
    metadata: {
      subtype: item.subtype,
      genre: item.genre,
      lane: item.lane,
      underlined: item.underlined || null,
      moves: item.moves || item.beats || null,
      distractorFamilies: item.families || null,
    },
    explanation: {
      rule: RULE[item.subtype],
      steps: buildSteps(item),
      choiceRebuttals: rebuttals,
      thingsToRemember: [item.remember].filter(Boolean),
    },
  };
}

/** "The text never..." -> "the text never..." so it reads after "Choice B is incorrect because". */
function lowerFirst(s) {
  const t = String(s).trim();
  if (!t) return t;
  // Leave proper nouns, quotation marks and acronyms alone.
  if (/^["“'(]/.test(t)) return t;
  const first = t.split(/\s+/)[0].replace(/[^\w'’-]/g, '');
  const isProper = first.length > 1 && first[0] === first[0].toUpperCase() && first.slice(1) !== first.slice(1).toLowerCase();
  const COMMON = new Set(['The', 'This', 'That', 'These', 'Those', 'Nothing', 'No', 'Only', 'Both', 'Weighting', 'Selection', 'Pride', 'Resettlement', 'Random', 'Training', 'Cost', 'Dating', 'Hoping', 'Her', 'His', 'What', 'Whether', 'Five']);
  if (isProper && !COMMON.has(first)) return t;
  return t[0].toLowerCase() + t.slice(1);
}

function main() {
  const files = fs
    .readdirSync(SRC_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort();

  const items = [];
  files.forEach((f) => {
    const parsed = JSON.parse(fs.readFileSync(path.join(SRC_DIR, f), 'utf8'));
    if (!Array.isArray(parsed)) throw new Error(`${f} is not an array`);
    parsed.forEach((it) => items.push(it));
    console.log(`  ${f.padEnd(34)} ${String(parsed.length).padStart(3)} items`);
  });

  const docs = items.map(toQuestionDoc);
  fs.writeFileSync(OUT_FILE, JSON.stringify(docs, null, 2));

  const byDiff = docs.reduce((a, d) => ((a[d.difficulty] = (a[d.difficulty] || 0) + 1), a), {});
  const bySub = docs.reduce((a, d) => ((a[d.metadata.subtype] = (a[d.metadata.subtype] || 0) + 1), a), {});
  const byKey = docs.reduce((a, d) => ((a[LETTERS[d.correctAnswer]] = (a[LETTERS[d.correctAnswer]] || 0) + 1), a), {});

  console.log(`\nWrote ${docs.length} questions to ${path.relative(process.cwd(), OUT_FILE)}`);
  console.log('  difficulty', JSON.stringify(byDiff));
  console.log('  subtype   ', JSON.stringify(bySub));
  console.log('  answer key', JSON.stringify(byKey));
}

main();
