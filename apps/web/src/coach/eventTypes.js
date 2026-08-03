/**
 * AI Coach — canonical activity event schema (Tier 1 of the student model).
 *
 * Every learning surface emits these via coach/events.js `logEvent()`.
 * Events are append-only ground truth; all derived state (Tier 2) and the
 * coach notebook (Tier 3) are rebuildable from them.
 *
 * SCHEMA VERSION: bump EVENT_SCHEMA_VERSION when payload shapes change;
 * never mutate historical events.
 */

export const EVENT_SCHEMA_VERSION = 1;

export const EVENT_TYPES = {
  QUESTION_ATTEMPT: 'question_attempt',
  QUIZ_COMPLETED: 'quiz_completed',
  EXAM_COMPLETED: 'exam_completed',
  DRILL_COMPLETED: 'drill_completed',
  LESSON_VIEWED: 'lesson_viewed',
  FLASHCARD_SESSION: 'flashcard_session',
  WORD_SAVED: 'word_saved',
  CONCEPT_SAVED: 'concept_saved',
  COACH_INTERACTION: 'coach_interaction',
  SESSION_START: 'session_start',
};

/** Sources for question_attempt.payload.source */
export const ATTEMPT_SOURCES = {
  SMARTQUIZ: 'smartquiz',
  EXAM: 'exam',
  DRILL: 'drill',
  LESSON_QUIZ: 'lesson_quiz',
  WORD_QUIZ: 'word_quiz',
};

/**
 * Payload contracts (informal; validate() below enforces the required core).
 *
 * question_attempt: {
 *   source, questionId, subcategoryId (canonical kebab), conceptIds?: string[],
 *   difficulty?: 1|2|3, correct: boolean, chosenAnswer?: string,
 *   timeSpentMs?: number, parentId?: string (quizId/examId/drillId),
 *   errorPattern?: string (added async by classifier, Phase 2)
 * }
 * quiz_completed: {
 *   quizId, kind: 'single'|'meta', subcategoryIds: string[], questionCount,
 *   correctCount, scorePct (int), level?, passed?, durationMs?
 * }
 * exam_completed: {
 *   examId, resultId, isDiagnostic, questionCount, correctCount,
 *   scores?: { readingWriting, math, total }, durationMs?
 * }
 * drill_completed: {
 *   conceptId, subcategoryId?, questionCount, correctCount, scorePct (int), difficulty?
 * }
 * lesson_viewed: { subcategoryId, dwellSeconds (int), sectionsViewed?: string[], completed?: boolean }
 * flashcard_session: { deckId, deckName?, cardsReviewed (int), knownCount?, unknownCount?, durationMs? }
 * word_saved / concept_saved: { itemId?, term, subcategoryId?, sourceQuestionId? }
 * coach_interaction: { kind, noteId?, adviceSummary?, actionOffered?, actionTaken? }
 * session_start: { entryRoute?, device?: 'desktop'|'mobile' }
 */

const REQUIRED_FIELDS = {
  [EVENT_TYPES.QUESTION_ATTEMPT]: ['source', 'questionId', 'subcategoryId', 'correct'],
  [EVENT_TYPES.QUIZ_COMPLETED]: ['quizId', 'questionCount', 'correctCount'],
  [EVENT_TYPES.EXAM_COMPLETED]: ['examId', 'questionCount', 'correctCount'],
  [EVENT_TYPES.DRILL_COMPLETED]: ['conceptId', 'questionCount', 'correctCount'],
  [EVENT_TYPES.LESSON_VIEWED]: ['subcategoryId', 'dwellSeconds'],
  [EVENT_TYPES.FLASHCARD_SESSION]: ['deckId', 'cardsReviewed'],
  [EVENT_TYPES.WORD_SAVED]: ['term'],
  [EVENT_TYPES.CONCEPT_SAVED]: ['term'],
  [EVENT_TYPES.COACH_INTERACTION]: ['kind'],
  [EVENT_TYPES.SESSION_START]: [],
};

/**
 * Validate an event payload. Returns { ok: true } or { ok: false, error }.
 * Deliberately lenient beyond required fields — events must never block a surface.
 */
export function validateEvent(type, payload) {
  if (!Object.values(EVENT_TYPES).includes(type)) {
    return { ok: false, error: `Unknown event type: ${type}` };
  }
  const required = REQUIRED_FIELDS[type] || [];
  for (const field of required) {
    if (payload === null || payload === undefined || payload[field] === undefined || payload[field] === null) {
      return { ok: false, error: `Event ${type} missing required field: ${field}` };
    }
  }
  return { ok: true };
}
