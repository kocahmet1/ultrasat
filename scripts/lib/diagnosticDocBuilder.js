/**
 * Build Firestore documents for the diagnostic exam from
 * scripts/data/diagnosticExamV1.json.
 *
 * Pure functions, no Firebase dependency — shared by the seeder and any
 * verification tooling. Field set mirrors scripts/lib/examNormalizer.js so
 * diagnostic questions are schema-identical to ingested official questions.
 */

const { resolveSubcategory } = require('./subcategoryMap');

/**
 * Build a complete `questions` collection document (without timestamps).
 */
function buildQuestionDoc(q, moduleNumber, examSlug) {
  const sub = resolveSubcategory(q.subcategory);
  if (!sub) throw new Error(`Unresolvable subcategory "${q.subcategory}" (Q${q.originalQuestionNumber})`);
  if (sub.id !== q.subcategoryId) {
    throw new Error(`subcategoryId mismatch for Q${q.originalQuestionNumber}: ${q.subcategoryId} != ${sub.id}`);
  }

  const isUserInput = q.questionType === 'user-input';
  let inputType = 'number';
  if (isUserInput && String(q.correctAnswer).includes('/')) inputType = 'fraction';

  return {
    text: q.text.trim(),
    questionType: q.questionType,
    options: q.options || [],
    correctAnswer: q.correctAnswer,
    acceptedAnswers: isUserInput ? (q.acceptedAnswers || [String(q.correctAnswer)]) : null,
    inputType,
    answerFormat: null,
    explanation: q.explanation || '',
    difficulty: q.difficulty,
    subcategory: sub.kebab,
    subCategory: sub.kebab, // backward compatibility
    subcategoryId: sub.id,
    categoryPath: `${sub.section}/${sub.mainCategory}/${sub.name}`,
    mainCategory: sub.mainCategory,
    subjectArea: sub.section,
    source: 'ultrasat-original',
    usageContext: 'exam',
    originalExam: examSlug,
    originalQuestionNumber: q.originalQuestionNumber,
    originalModuleNumber: moduleNumber,
    hasImage: false,
    graphUrl: null,
    graphDescription: null,
    passage: q.passage || null,
    skillTags: [],
  };
}

/**
 * Build an `examModules` collection document (without timestamps).
 */
function buildModuleDoc(mod, questionIds, examSlug) {
  return {
    title: mod.title,
    description: mod.description,
    questionIds,
    moduleNumber: mod.moduleNumber,
    calculatorAllowed: mod.calculatorAllowed,
    timeLimit: mod.timeLimit,
    questionCount: questionIds.length,
    isOfficial: false,
    originalExam: examSlug,
  };
}

/**
 * Build the `practiceExams` collection document (without timestamps).
 */
function buildExamDoc(data, moduleIds) {
  return {
    title: data.examTitle,
    description: data.examDescription,
    moduleIds,
    isPublic: true,
    isDiagnostic: true,
    isOfficial: false,
    originalExam: data.examSlug,
    qualityControl: null, // diagnostics are exempt from full-length exam QC
  };
}

module.exports = { buildQuestionDoc, buildModuleDoc, buildExamDoc };
