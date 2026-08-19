/**
 * AI Coach — server-side Tier-2 rebuild.
 *
 * Tier-2 derived state (skillState / conceptState / habits / vocabState) is a
 * fold over the Tier-1 activityEvents stream. The web app folds each event in
 * incrementally as it happens; this module recomputes the whole fold from
 * scratch, which is the only correct way to *remove* something, because several
 * Tier-2 fields (lastResults windows, EWMA rollingAccuracy, streaks) are
 * path-dependent and cannot be decremented.
 *
 * Used when a student deletes an exam result or excludes one from coaching.
 *
 * The pure reducers live in apps/web/src/coach/tier2Reducers.mjs and are shared
 * verbatim with the web app and scripts/backfill-coach-events.js — there is one
 * implementation of this logic and it must stay that way. The file is .mjs so
 * this CommonJS module can dynamic-import it (same pattern as the backfill).
 */

const path = require('path');
const { pathToFileURL } = require('url');

const REDUCERS_PATH = path.join(
  __dirname, '..', '..', 'web', 'src', 'coach', 'tier2Reducers.mjs'
);

const BATCH_LIMIT = 400; // Firestore caps a batch at 500 writes.

let reducersPromise = null;

/** Lazily import (and cache) the shared ESM reducers. */
function loadReducers() {
  if (!reducersPromise) {
    reducersPromise = import(pathToFileURL(REDUCERS_PATH).href).catch((err) => {
      reducersPromise = null; // allow a retry on the next call
      throw err;
    });
  }
  return reducersPromise;
}

/**
 * Every Tier-1 event for a user, oldest first.
 *
 * Single-field index on userId only — no composite index required. Events
 * flagged `coachExcluded` are dropped here, which is what makes "exclude from
 * coach" behave exactly like a delete as far as derived state is concerned,
 * while leaving the events themselves intact so it can be undone.
 */
async function loadReplayableEvents(db, uid) {
  const snap = await db.collection('activityEvents').where('userId', '==', uid).get();
  return snap.docs
    .map((d) => d.data())
    .filter((e) => e && e.coachExcluded !== true)
    .sort((a, b) => (a.clientTs || 0) - (b.clientTs || 0));
}

async function existingDocIds(db, collectionPath) {
  const snap = await db.collection(collectionPath).select().get();
  return snap.docs.map((d) => d.id);
}

/**
 * Recompute and persist all Tier-2 state for one user.
 *
 * Docs whose subcategory/concept no longer appears in the event stream are
 * DELETED rather than left behind — otherwise deleting a student's only exam
 * for a skill would leave a stale skillState doc that the coach still reads.
 *
 * @param {FirebaseFirestore.Firestore} db
 * @param {string} uid
 * @param {{ reason?: string }} [options]
 * @returns {Promise<{events:number, skills:number, concepts:number, removed:number}>}
 */
async function rebuildTier2(db, uid, { reason = 'rebuild' } = {}) {
  const { replayEvents } = await loadReducers();

  const events = await loadReplayableEvents(db, uid);
  const state = replayEvents(events);

  const [priorSkills, priorConcepts] = await Promise.all([
    existingDocIds(db, `users/${uid}/skillState`),
    existingDocIds(db, `users/${uid}/conceptState`),
  ]);

  const nextSkills = new Set(Object.keys(state.skillState));
  const nextConcepts = new Set(Object.keys(state.conceptState));
  const stale = [
    ...priorSkills.filter((id) => !nextSkills.has(id)).map((id) => `users/${uid}/skillState/${id}`),
    ...priorConcepts.filter((id) => !nextConcepts.has(id)).map((id) => `users/${uid}/conceptState/${id}`),
  ];

  // A plain Date, the way the rest of the coach backend stamps documents
  // (coach/notebook.js, coach/observer.js, coach/coachRoutes.js). Firestore
  // stores it as a Timestamp, and it keeps this module free of any dependency
  // on which namespace shape the server SDK happens to expose.
  const now = new Date();
  const stamp = { updatedAt: now, rebuiltBy: reason, rebuiltAt: now };

  let batch = db.batch();
  let ops = 0;
  const flushIfFull = async () => {
    if (ops >= BATCH_LIMIT) {
      await batch.commit();
      batch = db.batch();
      ops = 0;
    }
  };

  for (const [subcategoryId, skill] of Object.entries(state.skillState)) {
    batch.set(db.doc(`users/${uid}/skillState/${subcategoryId}`), { ...skill, ...stamp });
    ops += 1;
    await flushIfFull();
  }
  for (const [conceptId, concept] of Object.entries(state.conceptState)) {
    batch.set(db.doc(`users/${uid}/conceptState/${conceptId}`), { ...concept, ...stamp });
    ops += 1;
    await flushIfFull();
  }
  for (const docPath of stale) {
    batch.delete(db.doc(docPath));
    ops += 1;
    await flushIfFull();
  }

  // habits/vocab are single summary docs and are always rewritten: an empty
  // replay must reset them to zero, not leave yesterday's streak standing.
  batch.set(db.doc(`users/${uid}/habits/summary`), { ...state.habits, ...stamp });
  batch.set(db.doc(`users/${uid}/vocabState/summary`), { ...state.vocab, ...stamp });
  ops += 2;
  await batch.commit();

  return {
    events: events.length,
    skills: nextSkills.size,
    concepts: nextConcepts.size,
    removed: stale.length,
  };
}

module.exports = { rebuildTier2, loadReplayableEvents, REDUCERS_PATH };
