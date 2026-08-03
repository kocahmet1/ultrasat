/**
 * AI Coach — Tier-2 PURE reducers (zero dependencies, zero imports).
 *
 * This module is the single implementation of derived-state logic. It is used by:
 *   - coach/tier2.js (web, incremental updates on each logged event)
 *   - scripts/backfill-coach-events.js (node, historical replay)
 *   - any future server-side rebuild endpoint
 *
 * Because incremental updates and full replays share these functions, derived
 * state can always be safely rebuilt from the activityEvents stream.
 *
 * INVARIANTS: pure functions only (no I/O, no Date.now() — timestamps come in
 * via the event), all percent values are integers.
 */

export const TIER2_VERSION = 1;

export const LAST_N = 20; // rolling window: last 10 vs prior 10 gives the trend
export const TREND_DELTA_PTS = 15; // accuracy-point change that counts as a real trend
export const EWMA_ALPHA = 0.15;

// Event type strings duplicated here (not imported) to keep this module
// dependency-free; scripts/verify-taxonomy-style checks are unnecessary since
// coach/tier2.js asserts agreement at import time.
export const ET = {
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

const pct = (correct, total) => (total > 0 ? Math.round((correct / total) * 100) : 0);

const accuracyOf = (results) =>
  results.length ? Math.round((results.filter(Boolean).length / results.length) * 100) : null;

/** 'improving' | 'declining' | 'stable' | 'insufficient' from a last-20 window. */
export function computeTrend(lastResults) {
  if (!lastResults || lastResults.length < 10) return 'insufficient';
  const recent = lastResults.slice(-10);
  const prior = lastResults.slice(0, Math.max(0, lastResults.length - 10));
  if (prior.length < 5) return 'insufficient';
  const delta = accuracyOf(recent) - accuracyOf(prior);
  if (delta >= TREND_DELTA_PTS) return 'improving';
  if (delta <= -TREND_DELTA_PTS) return 'declining';
  return 'stable';
}

// ---------------------------------------------------------------------------
// Empty states
// ---------------------------------------------------------------------------

export function emptySkillState(subcategoryId) {
  return {
    v: TIER2_VERSION,
    subcategoryId,
    attempts: 0,
    correct: 0,
    accuracy: 0, // lifetime, int 0-100
    lastResults: [], // most recent last, capped at LAST_N
    accuracyLast10: null,
    rollingAccuracy: null, // EWMA 0-100, int
    trend: 'insufficient',
    lastPracticedTs: null,
    bySource: {}, // { smartquiz: {attempts, correct}, exam: {...}, ... }
    avgTimeMs: null,
  };
}

export function emptyConceptState(conceptId) {
  return {
    v: TIER2_VERSION,
    conceptId,
    subcategoryId: null,
    attempts: 0,
    correct: 0,
    accuracy: 0,
    lastResults: [],
    missStreak: 0,
    lastMissedTs: null,
    recoveredTs: null,
    regressionFlag: false, // recovered earlier, now missing again — the coach's cue
    correctRun: 0,
    hadEarlyStruggle: false,
    errorPatterns: {},
    lastPracticedTs: null,
  };
}

export function emptyHabits() {
  return {
    v: TIER2_VERSION,
    streakDays: 0,
    lastActiveDay: null,
    activeDays14: [],
    totalMinutes: 0,
  };
}

export function emptyVocab() {
  return {
    v: TIER2_VERSION,
    wordsSaved: 0,
    conceptsSaved: 0,
    cardsReviewed7d: 0,
    lastSessionTs: null,
    sessions: 0,
  };
}

// ---------------------------------------------------------------------------
// Reducers
// ---------------------------------------------------------------------------

/**
 * Fold one question attempt into a skillState.
 * @param {object} prev
 * @param {object} a - { correct, source, timeSpentMs?, ts (ms) }
 */
export function reduceSkillState(prev, a) {
  const s = { ...prev, bySource: { ...prev.bySource } };
  s.attempts += 1;
  if (a.correct) s.correct += 1;
  s.accuracy = pct(s.correct, s.attempts);

  s.lastResults = [...prev.lastResults, !!a.correct].slice(-LAST_N);
  s.accuracyLast10 = accuracyOf(s.lastResults.slice(-10));
  s.rollingAccuracy =
    prev.rollingAccuracy === null
      ? (a.correct ? 100 : 0)
      : Math.round(EWMA_ALPHA * (a.correct ? 100 : 0) + (1 - EWMA_ALPHA) * prev.rollingAccuracy);
  s.trend = computeTrend(s.lastResults);
  s.lastPracticedTs = a.ts || null;

  const src = a.source || 'unknown';
  const bucket = s.bySource[src] || { attempts: 0, correct: 0 };
  s.bySource[src] = { attempts: bucket.attempts + 1, correct: bucket.correct + (a.correct ? 1 : 0) };

  if (typeof a.timeSpentMs === 'number' && a.timeSpentMs > 0 && a.timeSpentMs < 30 * 60 * 1000) {
    s.avgTimeMs =
      s.avgTimeMs === null
        ? Math.round(a.timeSpentMs)
        : Math.round(0.9 * s.avgTimeMs + 0.1 * a.timeSpentMs);
  }
  return s;
}

/**
 * Fold one question attempt into a conceptState.
 * Regression semantics (the "possessives" scenario):
 *  - early misses set hadEarlyStruggle
 *  - 3 correct in a row after struggle sets recoveredTs and clears the streak
 *  - 2+ misses after a recovery raises regressionFlag
 */
export function reduceConceptState(prev, a) {
  const c = { ...prev, errorPatterns: { ...prev.errorPatterns } };
  c.attempts += 1;
  if (a.correct) c.correct += 1;
  c.accuracy = pct(c.correct, c.attempts);
  c.lastResults = [...prev.lastResults, !!a.correct].slice(-LAST_N);
  c.lastPracticedTs = a.ts || null;
  if (a.subcategoryId) c.subcategoryId = a.subcategoryId;

  if (a.correct) {
    c.correctRun = prev.correctRun + 1;
    c.missStreak = 0;
    if (c.correctRun >= 3 && prev.hadEarlyStruggle && !prev.recoveredTs) {
      c.recoveredTs = a.ts || null;
    }
    if (prev.regressionFlag && c.correctRun >= 3) {
      c.regressionFlag = false;
      c.recoveredTs = a.ts || null;
    }
  } else {
    c.correctRun = 0;
    c.missStreak = prev.missStreak + 1;
    c.lastMissedTs = a.ts || null;
    if (c.attempts <= 6 || c.accuracy < 60) c.hadEarlyStruggle = true;
    if (prev.recoveredTs && c.missStreak >= 2) {
      c.regressionFlag = true;
    }
    if (a.errorPattern) {
      c.errorPatterns[a.errorPattern] = (c.errorPatterns[a.errorPattern] || 0) + 1;
    }
  }
  return c;
}

export function dayKey(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Fold an activity day + minutes into habits. */
export function reduceHabits(prev, { ts, minutesDelta = 0 }) {
  const h = { ...prev, activeDays14: [...(prev.activeDays14 || [])] };
  const today = dayKey(ts);
  if (h.lastActiveDay !== today) {
    const yesterday = dayKey(ts - 24 * 60 * 60 * 1000);
    h.streakDays = h.lastActiveDay === yesterday ? (h.streakDays || 0) + 1 : 1;
    h.lastActiveDay = today;
  }
  h.activeDays14 = Array.from(new Set([...h.activeDays14, today])).sort().slice(-14);
  h.totalMinutes = Math.round((h.totalMinutes || 0) + minutesDelta);
  return h;
}

/** Fold a vocab-related event into vocabState. */
export function reduceVocab(prev, event) {
  const v = { ...prev };
  if (event.type === ET.WORD_SAVED) v.wordsSaved = (prev.wordsSaved || 0) + 1;
  if (event.type === ET.CONCEPT_SAVED) v.conceptsSaved = (prev.conceptsSaved || 0) + 1;
  if (event.type === ET.FLASHCARD_SESSION) {
    v.sessions = (prev.sessions || 0) + 1;
    v.cardsReviewed7d = (prev.cardsReviewed7d || 0) + (event.payload?.cardsReviewed || 0);
    v.lastSessionTs = event.clientTs || null;
  }
  return v;
}

// ---------------------------------------------------------------------------
// Full replay — THE rebuild implementation
// ---------------------------------------------------------------------------

/**
 * Replay a user's full (chronologically ordered) event list into complete
 * Tier-2 state. Used by the backfill script and rebuild tooling.
 *
 * @param {Array<{type: string, payload: object, clientTs: number}>} events
 * @returns {{ skillState: Object, conceptState: Object, habits: Object, vocab: Object }}
 */
export function replayEvents(events) {
  const skillState = {};
  const conceptState = {};
  let habits = emptyHabits();
  let vocab = emptyVocab();

  for (const event of events || []) {
    const { type, payload = {}, clientTs } = event;
    const ts = clientTs || null;

    if (type === ET.QUESTION_ATTEMPT) {
      const a = {
        correct: !!payload.correct,
        source: payload.source,
        timeSpentMs: payload.timeSpentMs,
        errorPattern: payload.errorPattern,
        subcategoryId: payload.subcategoryId,
        ts,
      };
      if (payload.subcategoryId) {
        const prev = skillState[payload.subcategoryId] || emptySkillState(payload.subcategoryId);
        skillState[payload.subcategoryId] = reduceSkillState(prev, a);
      }
      for (const conceptId of payload.conceptIds || []) {
        const prev = conceptState[conceptId] || emptyConceptState(conceptId);
        conceptState[conceptId] = reduceConceptState(prev, a);
      }
    } else if (type === ET.QUIZ_COMPLETED || type === ET.EXAM_COMPLETED || type === ET.DRILL_COMPLETED) {
      habits = reduceHabits(habits, { ts, minutesDelta: Math.round((payload.durationMs || 0) / 60000) });
    } else if (type === ET.FLASHCARD_SESSION) {
      vocab = reduceVocab(vocab, event);
      habits = reduceHabits(habits, { ts, minutesDelta: Math.round((payload.durationMs || 0) / 60000) });
    } else if (type === ET.WORD_SAVED || type === ET.CONCEPT_SAVED) {
      vocab = reduceVocab(vocab, event);
    } else if (type === ET.SESSION_START) {
      habits = reduceHabits(habits, { ts, minutesDelta: 0 });
    }
  }

  return { skillState, conceptState, habits, vocab };
}
