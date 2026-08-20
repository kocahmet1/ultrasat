/**
 * AI Coach — activity event SDK (Tier 1 writer).
 *
 * The ONE way learning surfaces record what a student did.
 *
 *   import { logEvent, logQuestionAttempts } from '../coach/events';
 *   logEvent(EVENT_TYPES.QUIZ_COMPLETED, { quizId, ... });
 *
 * Guarantees:
 *  - never throws into the calling surface (best-effort, logged failures)
 *  - normalizes every subcategory to the canonical kebab id at the boundary
 *  - append-only writes to top-level `activityEvents` (rules forbid update/delete)
 *  - triggers Tier-2 derived-state updates through the same pure reducers a
 *    full rebuild uses
 */

import { db, auth } from '../firebase/config';
import {
  collection,
  doc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { EVENT_TYPES, EVENT_SCHEMA_VERSION, validateEvent } from './eventTypes';
import { toCanonicalSubcategoryId } from '../utils/subcategoryTaxonomy';
import { applyEventToDerivedState } from './tier2';

export { EVENT_TYPES, ATTEMPT_SOURCES } from './eventTypes';

const eventsCol = () => collection(db, 'activityEvents');

/**
 * Broadcast a just-logged event on window so live UI (the coach's mission
 * ticks on the Home briefing, for one) can react without polling Firestore.
 * Best-effort: a listener throwing must never reach the logging surface.
 */
function broadcastEvent(eventDoc) {
  try {
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(
        new CustomEvent('ultrasat:activity', { detail: { type: eventDoc.type, payload: eventDoc.payload } })
      );
    }
  } catch (err) {
    // never let a UI listener break event logging
  }
}

/** Normalize any subcategory fields in a payload to canonical kebab ids. */
function normalizePayload(payload) {
  const p = { ...payload };
  if (p.subcategoryId !== undefined) {
    p.subcategoryId = toCanonicalSubcategoryId(p.subcategoryId) || p.subcategoryId || null;
  }
  if (Array.isArray(p.subcategoryIds)) {
    p.subcategoryIds = p.subcategoryIds
      .map((s) => toCanonicalSubcategoryId(s) || s)
      .filter(Boolean);
  }
  // Firestore rejects undefined values — strip them.
  for (const k of Object.keys(p)) {
    if (p[k] === undefined) delete p[k];
  }
  return p;
}

function buildEventDoc(userId, type, payload) {
  return {
    v: EVENT_SCHEMA_VERSION,
    userId,
    type,
    payload: normalizePayload(payload || {}),
    clientTs: Date.now(),
    ts: serverTimestamp(),
  };
}

/**
 * Log one activity event. Fire-and-forget safe (returns a promise you may ignore).
 * @returns {Promise<{ok: boolean, id?: string, error?: string}>}
 */
export async function logEvent(type, payload = {}) {
  try {
    const user = auth.currentUser;
    if (!user) return { ok: false, error: 'no-authenticated-user' };

    const check = validateEvent(type, payload);
    if (!check.ok) {
      console.warn('[coach/events] dropped invalid event:', check.error, payload);
      return { ok: false, error: check.error };
    }

    const eventDoc = buildEventDoc(user.uid, type, payload);
    const ref = doc(eventsCol());
    const batch = writeBatch(db);
    batch.set(ref, eventDoc);
    await batch.commit();

    // Tier-2 update — intentionally not awaited by callers; errors self-log.
    applyEventToDerivedState(user.uid, eventDoc);
    broadcastEvent(eventDoc);

    return { ok: true, id: ref.id };
  } catch (err) {
    console.error('[coach/events] logEvent failed:', type, err);
    return { ok: false, error: String(err && err.message) };
  }
}

/**
 * Log a batch of question attempts plus one completion event atomically
 * (single Firestore batch), then fold everything into Tier-2 state.
 *
 * @param {Array<object>} attempts - question_attempt payloads
 * @param {{type: string, payload: object}|null} completion - e.g. quiz_completed
 */
export async function logQuestionAttempts(attempts, completion = null) {
  try {
    const user = auth.currentUser;
    if (!user) return { ok: false, error: 'no-authenticated-user' };

    const batch = writeBatch(db);
    const docs = [];

    for (const raw of attempts || []) {
      const check = validateEvent(EVENT_TYPES.QUESTION_ATTEMPT, raw);
      if (!check.ok) {
        console.warn('[coach/events] skipped invalid attempt:', check.error, raw);
        continue;
      }
      const eventDoc = buildEventDoc(user.uid, EVENT_TYPES.QUESTION_ATTEMPT, raw);
      batch.set(doc(eventsCol()), eventDoc);
      docs.push(eventDoc);
    }

    if (completion) {
      const check = validateEvent(completion.type, completion.payload);
      if (check.ok) {
        const eventDoc = buildEventDoc(user.uid, completion.type, completion.payload);
        batch.set(doc(eventsCol()), eventDoc);
        docs.push(eventDoc);
      } else {
        console.warn('[coach/events] skipped invalid completion event:', check.error);
      }
    }

    if (docs.length === 0) return { ok: false, error: 'no-valid-events' };
    await batch.commit();

    // Sequential fold keeps per-doc transactions small and ordered.
    (async () => {
      for (const eventDoc of docs) {
        // eslint-disable-next-line no-await-in-loop
        await applyEventToDerivedState(user.uid, eventDoc);
      }
    })();
    docs.forEach(broadcastEvent);

    return { ok: true, count: docs.length };
  } catch (err) {
    console.error('[coach/events] logQuestionAttempts failed:', err);
    return { ok: false, error: String(err && err.message) };
  }
}
