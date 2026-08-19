/**
 * Matching a stored exam response back to its question (Score Details page).
 *
 * Responses have been saved in several historical formats, so matching has to
 * tolerate: exact question ids, ids on the embedded question snapshot, legacy
 * `practice-<moduleId>-q-<index>` ids, a recorded in-module index, and — for
 * the very oldest id-less data — the question text itself.
 *
 * Why this file exists (the "tinctoria but" bug): the old matcher evaluated
 * ALL of those heuristics inside a single Array.find, so the weakest signal
 * (identical question text) could claim a response before a later response
 * with an exact questionId match was even considered. Two facts made that
 * fatal in practice:
 *
 *   1. Firestore returns the `responses` subcollection in document-id order,
 *      which is effectively random relative to question order.
 *   2. SAT Reading & Writing stems repeat verbatim across questions —
 *      "Which choice completes the text so that it conforms to the
 *      conventions of Standard English?" appears ~15 times per test, and the
 *      Words-in-Context / transitions stems repeat similarly.
 *
 * Result: one answered grammar question's response (userAnswer "tinctoria
 * but", isCorrect false) was displayed as the answer for EVERY same-stem
 * question in the module — including omitted ones — corrupting the Your
 * Answer column, the correct/incorrect/omitted tiles, and the Knowledge &
 * Skills domain stats.
 *
 * The fix: evaluate matchers in strict priority order. Each matcher scans the
 * WHOLE response list before the next (weaker) matcher runs, so an exact id
 * match anywhere always beats a text match anywhere. Question text is only
 * trusted as an absolute last resort, and only when it is unambiguous on both
 * sides (unique among the module's questions AND among its responses) —
 * shared stems can therefore never cross-match again.
 */

const normalizeText = (value) =>
  value === undefined || value === null ? null : String(value);

/**
 * Find the response belonging to `question` (at `questionIndex` within
 * `module.questions`) among `module.responses`, tolerating every historical
 * id format. Returns undefined when no response can be safely attributed —
 * the caller treats that as an omitted question, which is always better than
 * showing another question's answer.
 */
export const findResponseForQuestion = (module, question, questionIndex) => {
  const responses = Array.isArray(module?.responses) ? module.responses : [];
  if (responses.length === 0 || !question) return undefined;

  // 1. Exact question id (the current save format writes questionId: question.id).
  const questionId = question.id ?? null;
  if (questionId !== null) {
    const byId = responses.find((resp) => resp.questionId === questionId);
    if (byId) return byId;

    // 2. Id carried on the embedded question snapshot.
    const bySnapshotId = responses.find(
      (resp) => resp.question && resp.question.id === questionId
    );
    if (bySnapshotId) return bySnapshotId;
  }

  // 3. Legacy index-based id.
  const indexBasedId = `practice-${module.id}-q-${questionIndex}`;
  const byIndexId = responses.find((resp) => resp.questionId === indexBasedId);
  if (byIndexId) return byIndexId;

  // 4. Recorded position within the module (one response per index at most).
  const byModuleIndex = responses.find(
    (resp) => typeof resp.moduleIndex === 'number' && resp.moduleIndex === questionIndex
  );
  if (byModuleIndex) return byModuleIndex;

  // 5. Last resort for id-less legacy data: identical question text — but
  // only when that text is unique among BOTH the module's questions and its
  // responses. R&W stems repeat verbatim across questions, so an ambiguous
  // text match is treated as no match at all.
  const text = normalizeText(question.text);
  if (text !== null && text !== '') {
    const questionsSharingText = (module.questions || []).filter(
      (q) => normalizeText(q?.text) === text
    );
    if (questionsSharingText.length === 1) {
      const textMatches = responses.filter(
        (resp) => resp.question && normalizeText(resp.question.text) === text
      );
      if (textMatches.length === 1) return textMatches[0];
    }
  }

  return undefined;
};

/**
 * Sort a module's responses back into question order (Firestore returns the
 * subcollection in document-id order). Responses without a numeric
 * moduleIndex keep their relative order at the end. Returns the array it was
 * given, sorted in place.
 */
export const sortResponsesIntoQuestionOrder = (responses) => {
  if (!Array.isArray(responses)) return responses;
  return responses.sort((a, b) => {
    const ai = typeof a?.moduleIndex === 'number' ? a.moduleIndex : Number.MAX_SAFE_INTEGER;
    const bi = typeof b?.moduleIndex === 'number' ? b.moduleIndex : Number.MAX_SAFE_INTEGER;
    return ai - bi;
  });
};
