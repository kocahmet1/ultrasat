/**
 * AI Coach — Tier-2 derived student state: PERSISTENCE layer (web).
 *
 * All logic lives in coach/tier2Reducers.js (pure, dependency-free) so that
 * incremental updates here and full rebuilds (scripts/backfill-coach-events.js)
 * share one implementation and can never drift.
 *
 * Collections:
 *   users/{uid}/skillState/{subcategoryId}
 *   users/{uid}/conceptState/{conceptId}
 *   users/{uid}/habits/summary
 *   users/{uid}/vocabState/summary
 */

import { db } from '../firebase/config';
import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { EVENT_TYPES } from './eventTypes';
import {
  TIER2_VERSION,
  ET,
  emptySkillState,
  emptyConceptState,
  emptyHabits,
  emptyVocab,
  reduceSkillState,
  reduceConceptState,
  reduceHabits,
  reduceVocab,
  computeTrend,
} from './tier2Reducers';

// Re-export the pure API so existing imports (tests, future callers) keep working.
export {
  TIER2_VERSION,
  emptySkillState,
  emptyConceptState,
  emptyHabits,
  emptyVocab,
  reduceSkillState,
  reduceConceptState,
  reduceHabits,
  reduceVocab,
  computeTrend,
};

// Guard: the dependency-free reducer module duplicates event-type strings;
// assert agreement with the canonical schema at module load.
if (process.env.NODE_ENV !== 'production') {
  for (const [k, v] of Object.entries(ET)) {
    if (EVENT_TYPES[k] !== v) {
      // eslint-disable-next-line no-console
      console.error(`[coach/tier2] event-type mismatch for ${k}: reducers say "${v}", schema says "${EVENT_TYPES[k]}"`);
    }
  }
}

const skillRef = (uid, subcategoryId) => doc(db, 'users', uid, 'skillState', subcategoryId);
const conceptRef = (uid, conceptId) => doc(db, 'users', uid, 'conceptState', conceptId);
const habitsRef = (uid) => doc(db, 'users', uid, 'habits', 'summary');
const vocabRef = (uid) => doc(db, 'users', uid, 'vocabState', 'summary');

async function applyInTransaction(ref, empty, input, reducer) {
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const prev = snap.exists() ? { ...empty, ...snap.data() } : empty;
    const next = reducer(prev, input);
    tx.set(ref, { ...next, updatedAt: serverTimestamp() }, { merge: true });
  });
}

/**
 * Apply one logged event to the derived state. Called by coach/events.js.
 * Fire-and-forget from the caller's perspective; errors are logged, never thrown.
 * Routing mirrors tier2Reducers.replayEvents — keep the two in sync.
 */
export async function applyEventToDerivedState(uid, event) {
  const { type, payload = {}, clientTs } = event;
  const ts = clientTs || Date.now();
  try {
    if (type === EVENT_TYPES.QUESTION_ATTEMPT) {
      const attempt = {
        correct: !!payload.correct,
        source: payload.source,
        timeSpentMs: payload.timeSpentMs,
        errorPattern: payload.errorPattern,
        subcategoryId: payload.subcategoryId,
        ts,
      };
      if (payload.subcategoryId) {
        await applyInTransaction(
          skillRef(uid, payload.subcategoryId),
          emptySkillState(payload.subcategoryId),
          attempt,
          reduceSkillState
        );
      }
      for (const conceptId of payload.conceptIds || []) {
        await applyInTransaction(
          conceptRef(uid, conceptId),
          emptyConceptState(conceptId),
          attempt,
          reduceConceptState
        );
      }
    } else if (
      type === EVENT_TYPES.QUIZ_COMPLETED ||
      type === EVENT_TYPES.EXAM_COMPLETED ||
      type === EVENT_TYPES.DRILL_COMPLETED
    ) {
      await applyInTransaction(habitsRef(uid), emptyHabits(), { ts, minutesDelta: Math.round((payload.durationMs || 0) / 60000) }, reduceHabits);
    } else if (type === EVENT_TYPES.FLASHCARD_SESSION) {
      await applyInTransaction(vocabRef(uid), emptyVocab(), event, reduceVocab);
      await applyInTransaction(habitsRef(uid), emptyHabits(), { ts, minutesDelta: Math.round((payload.durationMs || 0) / 60000) }, reduceHabits);
    } else if (type === EVENT_TYPES.WORD_SAVED || type === EVENT_TYPES.CONCEPT_SAVED) {
      await applyInTransaction(vocabRef(uid), emptyVocab(), event, reduceVocab);
    } else if (type === EVENT_TYPES.SESSION_START) {
      await applyInTransaction(habitsRef(uid), emptyHabits(), { ts, minutesDelta: 0 }, reduceHabits);
    }
    // lesson_viewed & coach_interaction: recorded in Tier 1 now; folded into
    // Tier-2 summaries by the Phase-2 observer (no per-event state needed yet).
  } catch (err) {
    console.error('[coach/tier2] derived-state update failed (event preserved in Tier 1):', type, err);
  }
}
