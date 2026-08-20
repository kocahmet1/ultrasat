/**
 * AI Coach — context assembler.
 *
 * Builds the grounded context the coach model sees: student profile, Tier-2
 * derived state (skillState / conceptState / habits / vocabState), recent
 * activity, AUTHORITATIVE practice-exam history, and — when a surface provides
 * it — full detail of the quiz (or exam) that just finished.
 *
 * GROUNDING RULE: everything in the context text comes from real documents.
 * The prompt instructs the model to reference ONLY this data; the assembler is
 * therefore the single place to audit what the coach can possibly "know".
 *
 * EXAM DATA COMES FROM THE AUTHORITATIVE STORE. Scaled exam scores are read
 * from users/{uid}/practiceExams — the same documents the results pages
 * render — never reconstructed from the activityEvents copy. The event stream
 * remains the source for chronology and Tier-2 folds, but for "what did this
 * student score", the assembler and the UI now read the same record, so the
 * coach can never disagree with the page the student is looking at.
 */

const { getDisplayName } = require('../subcategoryTaxonomy');

const fmtDate = (ms) => {
  if (!ms) return 'unknown';
  const d = new Date(ms);
  return d.toISOString().slice(0, 10);
};

const daysAgo = (ms) => (ms ? Math.round((Date.now() - ms) / 86400000) : null);

async function loadCollection(db, path) {
  const snap = await db.collection(path).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// How many authoritative exam results the coach sees.
const EXAM_HISTORY_WINDOW = 5;

/**
 * Authoritative exam history: users/{uid}/practiceExams, newest first.
 *
 * orderBy(completedAt) on a subcollection uses the automatic single-field
 * index — no composite index required, so unlike the activityEvents query
 * there is no silent fallback path that can go stale. Results the student hid
 * from the coach (`excludedFromCoach` on the result doc — the flag AllExamResults
 * toggles) are dropped after the fetch, over-fetching so exclusions do not
 * shrink the window.
 */
async function loadExamHistory(db, uid) {
  try {
    const snap = await db
      .collection(`users/${uid}/practiceExams`)
      .orderBy('completedAt', 'desc')
      .limit(EXAM_HISTORY_WINDOW * 2)
      .get();
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((e) => e.excludedFromCoach !== true)
      .slice(0, EXAM_HISTORY_WINDOW);
  } catch (err) {
    console.error('[coach/context] exam history load failed:', err.message);
    return [];
  }
}

/** Millisecond timestamp of a practiceExams doc (Timestamp or legacy ISO string). */
function examCompletedMs(e) {
  if (e.completedAt && typeof e.completedAt.toMillis === 'function') return e.completedAt.toMillis();
  if (e.examDate) {
    const ms = Date.parse(e.examDate);
    if (!Number.isNaN(ms)) return ms;
  }
  return null;
}

/**
 * One-line description of an authoritative exam result. A partial sitting is
 * labelled loudly and never given a composite total — "did half the exam" and
 * "scored X on a practice test" are different claims, and the model is told to
 * reason only from this text.
 */
const SIGNAL_REASON_TEXT = {
  blank: 'no questions answered',
  mostly_blank: 'more than half left unanswered',
  too_fast: 'finished too fast to be real work',
};
const signalReasons = (reasons = []) => reasons.map((r) => SIGNAL_REASON_TEXT[r] || r).join(', ');

function describeExamResult(e) {
  const rw = Number.isFinite(e.scores?.readingWriting) ? e.scores.readingWriting : null;
  const math = Number.isFinite(e.scores?.math) ? e.scores.math : null;
  const total = Number.isFinite(e.scores?.total) ? e.scores.total : rw !== null && math !== null ? rw + math : null;

  const label = e.isDiagnostic ? 'Diagnostic' : 'Practice exam';
  const title = e.examTitle ? ` "${String(e.examTitle).slice(0, 60)}"` : '';

  // Signal-quality verdict, stamped at save time (coach/signalQuality.js).
  // A low-signal sitting is COMPLETED BUT OVERLOOKED: acknowledge it, never
  // cite its numbers — they measure clicking, not skill.
  if (e.coachSignal?.lowSignal) {
    return `${fmtDate(examCompletedMs(e))}: ${label}${title} — COMPLETED BUT OVERLOOKED (${signalReasons(
      e.coachSignal.reasons
    )}). Excluded from analysis: acknowledge the sitting if relevant, but NEVER cite its numbers or treat it as evidence of ability.`;
  }
  const partialSignal =
    e.coachSignal && e.coachSignal.ignoredModuleCount > 0
      ? ` — NOTE: ${e.coachSignal.ignoredModuleCount} of ${e.coachSignal.modules?.length ?? '?'} module(s) OVERLOOKED (${signalReasons(
          e.coachSignal.reasons
        )}); skill analysis uses only the valid modules, so treat the composite with caution`
      : '';

  let scorePart;
  if (total !== null && !e.isPartial) {
    scorePart = `total ${total} (RW ${rw ?? 'n/a'} · Math ${math ?? 'n/a'})`;
  } else if (!e.scores) {
    // Legacy result saved before scaled scores were stored on the doc — the
    // sections WERE sat; we just have no scaled numbers to cite.
    scorePart = 'no scaled scores stored (older result)';
  } else {
    scorePart = `RW ${rw === null ? 'not attempted' : rw} · Math ${math === null ? 'not attempted' : math}`;
  }

  const counts =
    Number.isFinite(e.correctAnswers) && Number.isFinite(e.totalQuestions)
      ? `, ${e.correctAnswers}/${e.totalQuestions} correct`
      : '';

  const partial = e.isPartial
    ? ` — PARTIAL SITTING: only ${e.attemptedModuleCount ?? 'some'} of ${
        e.totalModuleCount ?? 'the'
      } modules were attempted; treat as module practice, not a full practice-test score`
    : '';

  return `${fmtDate(examCompletedMs(e))}: ${label}${title} — ${scorePart}${counts}${partial}${partialSignal}`;
}

/**
 * Assemble the student context.
 * @param {FirebaseFirestore.Firestore} db
 * @param {string} uid
 * @param {{ quizId?: string, route?: string }} surface
 * @returns {{ contextText: string, data: object }}
 */
async function assembleStudentContext(db, uid, surface = {}) {
  const [userSnap, habitsSnap, vocabSnap, skillStates, conceptStates, examHistory] = await Promise.all([
    db.doc(`users/${uid}`).get(),
    db.doc(`users/${uid}/habits/summary`).get(),
    db.doc(`users/${uid}/vocabState/summary`).get(),
    loadCollection(db, `users/${uid}/skillState`),
    loadCollection(db, `users/${uid}/conceptState`),
    loadExamHistory(db, uid),
  ]);

  const user = userSnap.exists ? userSnap.data() : {};
  const habits = habitsSnap.exists ? habitsSnap.data() : null;
  const vocab = vocabSnap.exists ? vocabSnap.data() : null;

  // Recent completions from the event stream.
  //
  // Events belonging to a result the student excluded from coaching (or that is
  // mid-delete) carry `coachExcluded` and must be invisible here — the coach has
  // to behave as though that sitting never happened.
  //
  // The window is selected FROM COMPLETION EVENTS, not from raw events: a full
  // exam writes ~98 question_attempt events plus ONE exam_completed in a single
  // same-millisecond batch, so any raw-event window is flushed clean of history
  // (and often of the completion itself — same-ms ties order by random doc id)
  // the moment an exam finishes. Over-fetch enough raw events to hold a whole
  // exam batch plus surrounding history, then keep the newest completions.
  const RECENT_EVENT_WINDOW = 20;
  const RAW_EVENT_FETCH = 200;
  const COMPLETION_TYPES = ['quiz_completed', 'exam_completed', 'drill_completed', 'flashcard_session', 'lesson_viewed'];
  const isCoachVisible = (e) => e && e.coachExcluded !== true;
  let rawEvents = [];
  try {
    const evSnap = await db
      .collection('activityEvents')
      .where('userId', '==', uid)
      .orderBy('clientTs', 'desc')
      .limit(RAW_EVENT_FETCH)
      .get();
    rawEvents = evSnap.docs.map((d) => d.data()).filter(isCoachVisible);
  } catch (e) {
    // The ordered query needs the (userId ASC, clientTs DESC) composite index
    // (declared in firestore.indexes.json — deploy with
    // `firebase deploy --only firestore:indexes`). Without it this fallback
    // serves an UNORDERED sample: Firestore returns docs by id, so once the
    // user has more events than the limit, recency is not guaranteed and the
    // coach's view of recent activity goes stale. Loudly say so.
    console.warn(
      '[coach/context] ordered activityEvents query failed — composite index (userId ASC, clientTs DESC) probably missing; serving UNORDERED fallback sample, recent activity may be stale:',
      e.message
    );
    const evSnap = await db.collection('activityEvents').where('userId', '==', uid).limit(RAW_EVENT_FETCH).get();
    rawEvents = evSnap.docs
      .map((d) => d.data())
      .filter(isCoachVisible)
      .sort((a, b) => (b.clientTs || 0) - (a.clientTs || 0));
  }
  const recentCompletions = rawEvents
    .filter((e) => COMPLETION_TYPES.includes(e.type))
    .slice(0, RECENT_EVENT_WINDOW);

  // Optional: full detail of a specific quiz (for debriefs / in-context chat).
  let quizDetail = null;
  if (surface.quizId) {
    const quizSnap = await db.doc(`smartQuizzes/${surface.quizId}`).get();
    if (quizSnap.exists && quizSnap.data().userId === uid) {
      const quiz = quizSnap.data();
      const questionIds = quiz.questionIds || [];
      let questions = [];
      if (questionIds.length) {
        const refs = questionIds.slice(0, 30).map((qid) => db.collection('questions').doc(qid));
        const docs = await db.getAll(...refs);
        questions = docs.map((d) => (d.exists ? { id: d.id, ...d.data() } : { id: d.id }));
      }
      quizDetail = { id: surface.quizId, quiz, questions };
    }
  }

  // Optional: the authoritative result of a specific exam (observer's
  // exam_completed boundary passes the practiceExams doc id as refId). Read
  // directly from the store the results page just rendered — by the time that
  // page exists, this document exists, so there is no race against the
  // fire-and-forget event batch. The path is scoped under the uid, so no
  // ownership check is needed beyond it.
  let examDetail = null;
  if (surface.examResultId) {
    try {
      const examSnap = await db.doc(`users/${uid}/practiceExams/${surface.examResultId}`).get();
      if (examSnap.exists) {
        const exam = { id: examSnap.id, ...examSnap.data() };
        if (exam.excludedFromCoach !== true) examDetail = exam;
      }
    } catch (err) {
      console.error('[coach/context] exam detail load failed:', err.message);
    }
  }

  // ---- Render the context text ----
  const lines = [];

  lines.push(`## Student`);
  lines.push(
    `Name: ${user.displayName || 'the student'} · Target score: ${user.targetScore || 'not set'} · Exam date: ${
      user.examDate || 'not set'
    }`
  );
  if (habits) {
    lines.push(
      `Study streak: ${habits.streakDays || 0} day(s) · Active days (last 14): ${(habits.activeDays14 || []).length} · Total tracked minutes: ${habits.totalMinutes || 0}`
    );
  }
  if (vocab && (vocab.wordsSaved || vocab.sessions)) {
    lines.push(`Vocabulary: ${vocab.wordsSaved || 0} words saved, ${vocab.sessions || 0} flashcard sessions.`);
  }

  const withData = skillStates.filter((s) => s.attempts > 0);
  if (withData.length) {
    lines.push(`\n## Skill state (per subcategory — REAL data, cite freely)`);
    withData
      .sort((a, b) => (a.accuracyLast10 ?? 101) - (b.accuracyLast10 ?? 101))
      .forEach((s) => {
        lines.push(
          `- ${getDisplayName(s.subcategoryId) || s.subcategoryId}: last10 ${
            s.accuracyLast10 === null ? 'n/a' : s.accuracyLast10 + '%'
          }, lifetime ${s.accuracy}% over ${s.attempts} questions, trend ${s.trend}, last practiced ${
            daysAgo(s.lastPracticedTs) === null ? 'unknown' : daysAgo(s.lastPracticedTs) + 'd ago'
          }`
        );
      });
  } else {
    lines.push(`\n## Skill state\nNo tracked practice yet (new or pre-tracking account).`);
  }

  const flagged = conceptStates.filter((c) => c.regressionFlag || c.missStreak >= 2);
  if (flagged.length) {
    lines.push(`\n## Concept alerts (mechanically detected — these are the coach's cues)`);
    flagged.slice(0, 10).forEach((c) => {
      const patterns = Object.entries(c.errorPatterns || {}).sort((a, b) => b[1] - a[1]);
      lines.push(
        `- ${c.conceptId}${c.subcategoryId ? ` (${getDisplayName(c.subcategoryId) || c.subcategoryId})` : ''}: ${
          c.regressionFlag
            ? `REGRESSION — was recovered on ${fmtDate(c.recoveredTs)}, now missing again (last missed ${fmtDate(c.lastMissedTs)})`
            : `miss streak ${c.missStreak}`
        }${patterns.length ? ` · dominant error: ${patterns[0][0]}` : ''}`
      );
    });
  }

  if (examDetail) {
    lines.push(`\n## The exam that just finished (subject of this note — authoritative result)`);
    lines.push(`- ${describeExamResult(examDetail)}`);
  }

  if (examHistory.length) {
    lines.push(
      `\n## Practice-exam history (authoritative — the same scores the student's results pages show; if an exam line under Recent activity disagrees, THESE numbers win)`
    );
    examHistory.forEach((e) => {
      lines.push(`- ${describeExamResult(e)}`);
    });
  }

  if (recentCompletions.length) {
    lines.push(`\n## Recent activity (newest first)`);
    recentCompletions.slice(0, 8).forEach((e) => {
      const p = e.payload || {};
      if (e.type === 'quiz_completed') {
        if (p.lowSignal) {
          // Overlooked sitting: the completion is real, the numbers are not.
          const secs = Number.isFinite(p.durationMs) ? `${Math.round(p.durationMs / 1000)}s` : 'moments';
          lines.push(
            `- ${fmtDate(e.clientTs)}: SmartQuiz (${(p.subcategoryIds || []).map((s) => getDisplayName(s) || s).join(', ')}) — COMPLETED BUT OVERLOOKED (${p.questionCount} questions in ${secs}: ${signalReasons(
              p.lowSignalReasons
            )}). Acknowledge only; do not cite its score or count it as practice.`
          );
        } else {
          lines.push(`- ${fmtDate(e.clientTs)}: SmartQuiz (${(p.subcategoryIds || []).map((s) => getDisplayName(s) || s).join(', ')}) — ${p.correctCount}/${p.questionCount}${p.passed ? ', passed' : ''}`);
        }
      }
      else if (e.type === 'exam_completed' && p.lowSignal) {
        lines.push(
          `- ${fmtDate(e.clientTs)}: ${p.isDiagnostic ? 'Diagnostic' : 'Practice exam'} — COMPLETED BUT OVERLOOKED (${signalReasons(
            p.lowSignalReasons
          )}). Acknowledge only; never cite its numbers.`
        );
      }
      else if (e.type === 'exam_completed') {
        // A partial sitting is NOT a practice-test score. Say so explicitly:
        // the model is told to reason only from this text, so an unqualified
        // "scaled ~410" from a single module would be read as a real result.
        const partial = p.isPartial
          ? ` — PARTIAL SITTING: only ${p.attemptedModuleCount ?? 'some'} of ${
              p.totalModuleCount ?? 'the'
            } modules were attempted; treat this as module practice, not a full practice test`
          : '';
        // Render the section scores the payload has always carried, and derive
        // the composite when an older event predates the scores.total fix —
        // but never synthesize a composite for a partial sitting.
        const rw = Number.isFinite(p.scores?.readingWriting) ? p.scores.readingWriting : null;
        const math = Number.isFinite(p.scores?.math) ? p.scores.math : null;
        const total = Number.isFinite(p.scores?.total) ? p.scores.total : rw !== null && math !== null ? rw + math : null;
        const scaled =
          total !== null && !p.isPartial
            ? `, scaled ${total} (RW ${rw ?? 'n/a'} · Math ${math ?? 'n/a'})`
            : rw !== null || math !== null
              ? `, RW ${rw === null ? 'not attempted' : rw} · Math ${math === null ? 'not attempted' : math}`
              : '';
        lines.push(
          `- ${fmtDate(e.clientTs)}: ${p.isDiagnostic ? 'Diagnostic' : 'Practice exam'} — ${p.correctCount}/${p.questionCount}${scaled}${partial}`
        );
      }
      else if (e.type === 'drill_completed')
        lines.push(`- ${fmtDate(e.clientTs)}: Concept drill (${p.conceptId}) — ${p.correctCount}/${p.questionCount}`);
      else if (e.type === 'flashcard_session')
        lines.push(`- ${fmtDate(e.clientTs)}: Flashcards — ${p.cardsReviewed} cards`);
      else if (e.type === 'lesson_viewed')
        lines.push(`- ${fmtDate(e.clientTs)}: Lesson ${getDisplayName(p.subcategoryId) || p.subcategoryId} — ${Math.round((p.dwellSeconds || 0) / 60)} min`);
    });
  }

  if (quizDetail) {
    const { quiz, questions } = quizDetail;
    lines.push(`\n## The quiz that just finished (subject of this conversation)`);
    lines.push(
      `Subcategory: ${getDisplayName(quiz.subcategoryId) || quiz.subcategoryId || 'mixed'} · Level ${quiz.level || '?'} · Score ${quiz.score}% (${quiz.passed ? 'passed' : 'not passed'})`
    );
    (quiz.questionIds || []).forEach((qid, i) => {
      const ans = (quiz.userAnswers || {})[qid] || {};
      const q = questions.find((x) => x.id === qid) || {};
      const snippet = (q.text || q.questionText || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 140);
      lines.push(`- Q${i + 1} [${ans.isCorrect ? 'CORRECT' : 'MISSED'}] ${snippet ? `"${snippet}…"` : `(question ${qid})`}`);
    });
  }

  return {
    contextText: lines.join('\n'),
    data: {
      user,
      habits,
      vocab,
      skillStates: withData,
      flaggedConcepts: flagged,
      recentCompletions,
      quizDetail,
      examHistory,
      examDetail,
    },
  };
}

module.exports = { assembleStudentContext };
