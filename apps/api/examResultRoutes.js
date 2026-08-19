/**
 * Practice-exam result management — student-owned destructive operations.
 *
 *   DELETE /api/exam-results/:resultId                  -> purge a result everywhere
 *   POST   /api/exam-results/:resultId/coach-exclusion  -> { excluded: bool }
 *
 * WHY THIS IS SERVER-SIDE
 * A student can delete their own result document from the client, but the
 * derived records that actually feed the AI coach are deliberately immutable to
 * clients (firestore.rules): activityEvents and questionAttempts are
 * append-only, Tier-2 state is admin-delete-only, and the coach* collections
 * are server-only. So "delete this result and un-teach the coach" can only be
 * done with the Admin SDK, here.
 *
 * WHAT A RESULT LEAVES BEHIND (all of it is handled below)
 *   users/{uid}/practiceExams/{resultId}            the result itself
 *   users/{uid}/practiceExams/{resultId}/responses  one doc per question
 *   questionAttempts   where examId == resultId     attempts mirror
 *   activityEvents     payload.parentId == resultId question_attempt events
 *   activityEvents     payload.resultId == resultId the exam_completed event
 *   coachNotes/{uid}/notes where refId == resultId  the coach's written read
 *   users/{uid}/skillState|conceptState|habits      folded-in derived state
 *
 * The last one cannot be subtracted (rolling windows and EWMA accuracy are
 * path-dependent), so both operations finish by replaying the remaining event
 * stream through the shared reducers — see coach/rebuildTier2.js.
 *
 * DELETE removes the events; exclusion only flags them (`coachExcluded`), which
 * produces an identical rebuild while keeping the operation reversible.
 *
 * NOT touched, by design: users/{uid}/progress (legacy per-subcategory mastery,
 * which has no per-attempt provenance to unwind and is not read by the coach),
 * and coachThreads messages (free-text chat history).
 */

const express = require('express');
const rateLimit = require('express-rate-limit');
const admin = require('firebase-admin');
const { requireAuth } = require('./middleware/auth');
const { rebuildTier2 } = require('./coach/rebuildTier2');

const router = express.Router();

router.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

const verifyAuth = requireAuth();

const BATCH_LIMIT = 400;

const getDb = (req) => req.db || (req.admin && req.admin.firestore()) || admin.firestore();

/** Delete an arbitrary number of document references in bounded batches. */
async function deleteRefs(db, refs) {
  for (let i = 0; i < refs.length; i += BATCH_LIMIT) {
    const batch = db.batch();
    refs.slice(i, i + BATCH_LIMIT).forEach((ref) => batch.delete(ref));
    await batch.commit();
  }
  return refs.length;
}

/** Set the same field patch on an arbitrary number of documents. */
async function updateRefs(db, refs, patch) {
  for (let i = 0; i < refs.length; i += BATCH_LIMIT) {
    const batch = db.batch();
    refs.slice(i, i + BATCH_LIMIT).forEach((ref) => batch.set(ref, patch, { merge: true }));
    await batch.commit();
  }
  return refs.length;
}

/**
 * Every activityEvent belonging to one exam result.
 *
 * Queried by userId alone (a single-field index that already exists) and
 * filtered in memory, so no composite index has to be created before this
 * feature works. A student's event stream is small enough for one read.
 */
async function findResultEvents(db, uid, resultId) {
  const snap = await db.collection('activityEvents').where('userId', '==', uid).get();
  return snap.docs.filter((d) => {
    const payload = (d.data() || {}).payload || {};
    return payload.parentId === resultId || payload.resultId === resultId;
  });
}

/** questionAttempts mirror rows. examId holds the RESULT id, not the catalog id. */
async function findResultAttempts(db, uid, resultId) {
  const snap = await db.collection('questionAttempts').where('examId', '==', resultId).get();
  // resultId is a Firestore auto-id so a cross-user match is not realistically
  // possible, but never delete another account's row on the strength of that.
  return snap.docs.filter((d) => (d.data() || {}).userId === uid);
}

async function findResultCoachNotes(db, uid, resultId) {
  const snap = await db
    .collection('coachNotes')
    .doc(uid)
    .collection('notes')
    .where('refId', '==', resultId)
    .get();
  return snap.docs;
}

/** Load the result and confirm the caller owns it. */
async function loadOwnedResult(db, uid, resultId) {
  const ref = db.doc(`users/${uid}/practiceExams/${resultId}`);
  const snap = await ref.get();
  if (!snap.exists) return null;
  return { ref, snap };
}

// ---------------------------------------------------------------------------
// DELETE /api/exam-results/:resultId
// ---------------------------------------------------------------------------
router.delete('/:resultId', verifyAuth, async (req, res) => {
  const uid = req.userId;
  const { resultId } = req.params;

  if (!uid) return res.status(401).json({ error: 'Unauthorized' });
  if (!resultId) return res.status(400).json({ error: 'resultId required' });

  const db = getDb(req);

  try {
    const owned = await loadOwnedResult(db, uid, resultId);
    if (!owned) return res.status(404).json({ error: 'Exam result not found' });

    const [responsesSnap, attemptDocs, eventDocs, noteDocs] = await Promise.all([
      owned.ref.collection('responses').select().get(),
      findResultAttempts(db, uid, resultId),
      findResultEvents(db, uid, resultId),
      findResultCoachNotes(db, uid, resultId),
    ]);

    const deleted = {
      responses: await deleteRefs(db, responsesSnap.docs.map((d) => d.ref)),
      questionAttempts: await deleteRefs(db, attemptDocs.map((d) => d.ref)),
      activityEvents: await deleteRefs(db, eventDocs.map((d) => d.ref)),
      coachNotes: await deleteRefs(db, noteDocs.map((d) => d.ref)),
    };

    // The result doc goes last: while it exists the operation is resumable, and
    // a half-purged result is better than an orphaned derived trail.
    await owned.ref.delete();
    deleted.result = 1;

    const rebuild = await rebuildTier2(db, uid, { reason: 'exam-result-delete' });

    console.log(`[exam-results] deleted ${resultId} for ${uid}`, deleted, rebuild);
    return res.json({ ok: true, resultId, deleted, rebuild });
  } catch (error) {
    console.error('[exam-results] delete failed:', error);
    return res.status(500).json({ error: 'Failed to delete exam result' });
  }
});

// ---------------------------------------------------------------------------
// POST /api/exam-results/:resultId/coach-exclusion   { excluded: boolean }
// ---------------------------------------------------------------------------
router.post('/:resultId/coach-exclusion', verifyAuth, async (req, res) => {
  const uid = req.userId;
  const { resultId } = req.params;
  const excluded = req.body && req.body.excluded === true;

  if (!uid) return res.status(401).json({ error: 'Unauthorized' });
  if (!resultId) return res.status(400).json({ error: 'resultId required' });

  const db = getDb(req);

  try {
    const owned = await loadOwnedResult(db, uid, resultId);
    if (!owned) return res.status(404).json({ error: 'Exam result not found' });

    const eventDocs = await findResultEvents(db, uid, resultId);

    await updateRefs(db, eventDocs.map((d) => d.ref), { coachExcluded: excluded });

    await owned.ref.set(
      {
        excludedFromCoach: excluded,
        // A plain Date, as everywhere else in the coach backend.
        coachExclusionUpdatedAt: new Date(),
      },
      { merge: true }
    );

    const rebuild = await rebuildTier2(db, uid, {
      reason: excluded ? 'exam-result-exclude' : 'exam-result-include',
    });

    console.log(
      `[exam-results] ${excluded ? 'excluded' : 'restored'} ${resultId} for ${uid} (${eventDocs.length} events)`,
      rebuild
    );
    return res.json({ ok: true, resultId, excluded, events: eventDocs.length, rebuild });
  } catch (error) {
    console.error('[exam-results] coach-exclusion failed:', error);
    return res.status(500).json({ error: 'Failed to update coach exclusion' });
  }
});

module.exports = router;
