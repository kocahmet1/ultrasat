/**
 * Convert a Central Ideas and Details authoring record (the shape produced in
 * scripts/data/cid-refresh-2026/) into a production Firestore `questions` document.
 *
 * The authoring shape is deliberately different from the Firestore shape: it carries
 * review metadata (hinge, evidence, trapTypes, stemType, genre, topic) that is useful
 * for QC but does not belong in the served document.
 *
 * Field names here are load-bearing. See scripts/data/cid-refresh-2026/README.md:
 *   - `correctAnswer` MUST be a NUMBER. SmartQuiz.jsx scores with a strict `===`
 *     against the raw field, so a string answer silently marks every attempt wrong.
 *   - `explanationStructured` (noun first), NOT `structuredExplanation`.
 *   - `usageContext: 'general'` is what makes a question visible to smart quizzes.
 *   - Both `subcategory` and `subCategory` are written because the fetcher in
 *     questionBankServices.js queries them as separate fallbacks.
 */

const SUBCATEGORY = 'central-ideas-details';
const SUBCATEGORY_ID = 1;
const MAIN_CATEGORY = 'Information and Ideas';
const SUBJECT_AREA = 'Reading and Writing';
const CATEGORY_PATH = 'Reading and Writing/Information and Ideas/Central Ideas and Details';

const LETTERS = ['A', 'B', 'C', 'D'];

/**
 * Render the flat `explanation` string that older surfaces still read.
 */
function buildFlatExplanation(item) {
  const keyLetter = LETTERS[item.key];
  const parts = [];
  parts.push(`Choice ${keyLetter} is the best answer. ${(item.steps || []).join(' ')}`.trim());
  for (const letter of LETTERS) {
    if (letter === keyLetter) continue;
    const r = (item.rebuttals || {})[letter];
    if (r) parts.push(`Choice ${letter} is incorrect because ${r.replace(/^Choice [A-D] is incorrect because /i, '')}`);
  }
  return parts.join(' ');
}

/**
 * @param {object} item   authoring record
 * @param {object} admin  initialized firebase-admin (for serverTimestamp)
 * @returns {object} Firestore question document
 */
function buildCidQuestionDoc(item, admin) {
  if (!Array.isArray(item.options) || item.options.length !== 4) {
    throw new Error(`${item.id}: expected exactly 4 options, got ${item.options && item.options.length}`);
  }
  if (typeof item.key !== 'number' || item.key < 0 || item.key > 3) {
    throw new Error(`${item.id}: key must be an integer 0-3, got ${JSON.stringify(item.key)}`);
  }
  if (!['easy', 'medium', 'hard'].includes(item.difficulty)) {
    throw new Error(`${item.id}: difficulty must be easy|medium|hard, got ${item.difficulty}`);
  }
  if (!item.passage || !item.text) {
    throw new Error(`${item.id}: passage and text are both required`);
  }

  const keyLetter = LETTERS[item.key];
  const choiceRebuttals = {};
  for (const letter of LETTERS) {
    if (letter === keyLetter) continue;
    if ((item.rebuttals || {})[letter]) choiceRebuttals[letter] = item.rebuttals[letter];
  }

  const ts = admin ? admin.firestore.FieldValue.serverTimestamp() : new Date();

  return {
    // content
    text: item.text,
    passage: item.passage,
    questionType: 'multiple-choice',
    options: item.options,
    correctAnswer: item.key, // NUMBER — see header note
    acceptedAnswers: null,
    inputType: 'number',
    answerFormat: null,

    // explanation
    explanation: buildFlatExplanation(item),
    explanationStructured: {
      rule: item.rule || '',
      steps: item.steps || [],
      choiceRebuttals,
      thingsToRemember: item.remember || [],
    },

    // classification
    difficulty: item.difficulty,
    subcategory: SUBCATEGORY,
    subCategory: SUBCATEGORY,
    subcategoryId: SUBCATEGORY_ID,
    categoryPath: CATEGORY_PATH,
    mainCategory: MAIN_CATEGORY,
    subjectArea: SUBJECT_AREA,
    skillTags: [SUBCATEGORY],

    // provenance / gating
    source: 'ultrasat-original',
    usageContext: 'general', // <- what makes it selectable by smart quizzes
    authoringId: item.id, // lets us re-find / re-patch this batch later
    authoringBatch: 'cid-refresh-2026',

    // media
    hasImage: false,
    graphUrl: null,
    graphDescription: null,

    // timestamps
    createdAt: ts,
    updatedAt: ts,
  };
}

module.exports = {
  buildCidQuestionDoc,
  buildFlatExplanation,
  SUBCATEGORY,
  SUBCATEGORY_ID,
  LETTERS,
};
