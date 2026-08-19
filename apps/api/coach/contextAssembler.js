/**
 * AI Coach — context assembler.
 *
 * Builds the grounded context the coach model sees: student profile, Tier-2
 * derived state (skillState / conceptState / habits / vocabState), recent
 * activity, and — when a surface provides it — full detail of the quiz that
 * just finished.
 *
 * GROUNDING RULE: everything in the context text comes from real documents.
 * The prompt instructs the model to reference ONLY this data; the assembler is
 * therefore the single place to audit what the coach can possibly "know".
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

/**
 * Assemble the student context.
 * @param {FirebaseFirestore.Firestore} db
 * @param {string} uid
 * @param {{ quizId?: string, route?: string }} surface
 * @returns {{ contextText: string, data: object }}
 */
async function assembleStudentContext(db, uid, surface = {}) {
  const [userSnap, habitsSnap, vocabSnap, skillStates, conceptStates] = await Promise.all([
    db.doc(`users/${uid}`).get(),
    db.doc(`users/${uid}/habits/summary`).get(),
    db.doc(`users/${uid}/vocabState/summary`).get(),
    loadCollection(db, `users/${uid}/skillState`),
    loadCollection(db, `users/${uid}/conceptState`),
  ]);

  const user = userSnap.exists ? userSnap.data() : {};
  const habits = habitsSnap.exists ? habitsSnap.data() : null;
  const vocab = vocabSnap.exists ? vocabSnap.data() : null;

  // Recent completions from the event stream (single-field index on userId).
  //
  // Events belonging to a result the student excluded from coaching (or that is
  // mid-delete) carry `coachExcluded` and must be invisible here — the coach has
  // to behave as though that sitting never happened. We over-fetch and then trim
  // back to RECENT_EVENT_WINDOW so exclusions do not silently shrink the window.
  const RECENT_EVENT_WINDOW = 20;
  const isCoachVisible = (e) => e && e.coachExcluded !== true;
  let recentEvents = [];
  try {
    const evSnap = await db
      .collection('activityEvents')
      .where('userId', '==', uid)
      .orderBy('clientTs', 'desc')
      .limit(RECENT_EVENT_WINDOW * 3)
      .get();
    recentEvents = evSnap.docs.map((d) => d.data()).filter(isCoachVisible).slice(0, RECENT_EVENT_WINDOW);
  } catch (e) {
    // Composite index may not exist yet — fall back to unordered fetch.
    const evSnap = await db.collection('activityEvents').where('userId', '==', uid).limit(180).get();
    recentEvents = evSnap.docs
      .map((d) => d.data())
      .filter(isCoachVisible)
      .sort((a, b) => (b.clientTs || 0) - (a.clientTs || 0))
      .slice(0, RECENT_EVENT_WINDOW);
  }
  const recentCompletions = recentEvents.filter((e) =>
    ['quiz_completed', 'exam_completed', 'drill_completed', 'flashcard_session', 'lesson_viewed'].includes(e.type)
  );

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

  if (recentCompletions.length) {
    lines.push(`\n## Recent activity (newest first)`);
    recentCompletions.slice(0, 8).forEach((e) => {
      const p = e.payload || {};
      if (e.type === 'quiz_completed')
        lines.push(`- ${fmtDate(e.clientTs)}: SmartQuiz (${(p.subcategoryIds || []).map((s) => getDisplayName(s) || s).join(', ')}) — ${p.correctCount}/${p.questionCount}${p.passed ? ', passed' : ''}`);
      else if (e.type === 'exam_completed') {
        // A partial sitting is NOT a practice-test score. Say so explicitly:
        // the model is told to reason only from this text, so an unqualified
        // "scaled ~410" from a single module would be read as a real result.
        const partial = p.isPartial
          ? ` — PARTIAL SITTING: only ${p.attemptedModuleCount ?? 'some'} of ${
              p.totalModuleCount ?? 'the'
            } modules were attempted; treat this as module practice, not a full practice test`
          : '';
        lines.push(
          `- ${fmtDate(e.clientTs)}: ${p.isDiagnostic ? 'Diagnostic' : 'Practice exam'} — ${p.correctCount}/${p.questionCount}${
            p.scores?.total ? `, scaled ~${p.scores.total}` : ''
          }${partial}`
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
    data: { user, habits, vocab, skillStates: withData, flaggedConcepts: flagged, recentCompletions, quizDetail },
  };
}

module.exports = { assembleStudentContext };
