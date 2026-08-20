/**
 * AI Coach — signal-quality gates (Tier-1 hygiene).
 *
 * Not every completed sitting is evidence. A module submitted blank, a module
 * with most questions untouched, a module mashed through in under two
 * minutes, a five-question quiz "done" in forty seconds — these are actions,
 * not performance signals, and letting them into Tier-2 poisons every number
 * the coach reasons from (this is where "Linear Functions: 0% over 17
 * questions" comes from).
 *
 * The rules run ONCE, client-side, at the moment a result is written. The
 * verdict is stored on the result document (`coachSignal`) and stamped on the
 * activity events (`lowSignal`), so the server never re-derives thresholds —
 * it just renders what the write-path decided. The coach ACKNOWLEDGES
 * overlooked work ("logged, not reading it") but never cites its numbers.
 *
 * Thresholds (product decisions, 2026-08-20):
 *   - exam module: 0 answered → blank; answered < half → mostly_blank;
 *     active time < 2 min → too_fast
 *   - SmartQuiz: active time < 1 min → too_fast
 */

export const EXAM_MODULE_MIN_MS = 2 * 60 * 1000;
export const QUIZ_MIN_MS = 60 * 1000;

/** Human copy for each reason — used by result pages and coach surfaces. */
export const SIGNAL_REASON_LABEL = {
  blank: 'no questions answered',
  mostly_blank: 'more than half left unanswered',
  too_fast: 'finished too fast to be real work',
};

export const describeSignalReasons = (reasons = []) =>
  reasons.map((r) => SIGNAL_REASON_LABEL[r] || r).join(', ');

/**
 * Assess one exam module sitting.
 * @param {{questionCount:number, answeredCount:number, timeSpentMs?:number|null}} m
 *   timeSpentMs is null/undefined when timing wasn't tracked (legacy resume) —
 *   the time gate simply doesn't apply then; we never guess.
 * @returns {{ ignored:boolean, reasons:string[] }}
 */
export function assessExamModule({ questionCount, answeredCount, timeSpentMs }) {
  const reasons = [];
  if (!questionCount || questionCount <= 0) return { ignored: false, reasons };
  if (answeredCount === 0) {
    reasons.push('blank');
  } else if (answeredCount < questionCount / 2) {
    reasons.push('mostly_blank');
  }
  if (typeof timeSpentMs === 'number' && timeSpentMs >= 0 && timeSpentMs < EXAM_MODULE_MIN_MS) {
    reasons.push('too_fast');
  }
  return { ignored: reasons.length > 0, reasons };
}

/**
 * Assess a completed SmartQuiz.
 * durationMs: active time (sum of per-question timeSpent when available,
 * wall-clock startedAt→completed as fallback). Unknown duration → no gate.
 */
export function assessQuizSitting({ durationMs }) {
  const reasons = [];
  if (typeof durationMs === 'number' && durationMs >= 0 && durationMs < QUIZ_MIN_MS) {
    reasons.push('too_fast');
  }
  return { ignored: reasons.length > 0, reasons };
}

/**
 * Roll per-module assessments into the exam-level `coachSignal` doc field.
 * `modules`: [{ id, title, questionCount, answeredCount, timeSpentMs, ignored, reasons }]
 */
export function summarizeExamSignal(modules) {
  const ignored = modules.filter((m) => m.ignored);
  const valid = modules.filter((m) => !m.ignored);
  const reasons = Array.from(new Set(ignored.flatMap((m) => m.reasons)));
  return {
    v: 1,
    modules: modules.map((m) => ({
      id: m.id,
      title: m.title || null,
      questionCount: m.questionCount,
      answeredCount: m.answeredCount,
      timeSpentMs: typeof m.timeSpentMs === 'number' ? m.timeSpentMs : null,
      ignored: !!m.ignored,
      reasons: m.reasons,
    })),
    validModuleCount: valid.length,
    ignoredModuleCount: ignored.length,
    ignoredModuleIds: ignored.map((m) => m.id),
    reasons,
    // The whole sitting is low-signal when NOT ONE module survives the gates.
    lowSignal: modules.length > 0 && valid.length === 0,
  };
}
