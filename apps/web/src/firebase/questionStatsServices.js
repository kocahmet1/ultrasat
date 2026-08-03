// firebase/questionStatsServices.js
// --------------------------------------------------------------
// Peer statistics (P2-B) — read side.
//
// One aggregate doc per question at questionStats/{questionId}:
//   { attempts, correct, totalTimeMs, optionCounts: { "0".."3": n }, updatedAt }
// Written incrementally by recordSmartQuizResult (utils/smartQuizUtils.js)
// and rebuildable offline via scripts/backfill-question-stats.js.
//
// Display rule: every derivation (percentCorrect / percentPerOption /
// avgSeconds, and the formatStats bundle) returns null until a question
// has at least MIN_SAMPLE attempts, and callers render nothing for null —
// no "not enough data" noise anywhere in the UI.
// --------------------------------------------------------------

import {
  collection,
  doc,
  documentId,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from './config';

export const QUESTION_STATS_COLLECTION = 'questionStats';

/** Attempts required before peer stats are shown to students. */
export const MIN_SAMPLE = 5;

/** Firestore 'in' filters accept at most 30 values per query. */
const IN_QUERY_LIMIT = 30;

const clampPct = (value) => Math.min(100, Math.max(0, value));

/**
 * Fetch the raw stats doc for ONE question (single getDoc) — the tutor-mode
 * reveal path, where questions are revealed one at a time.
 *
 * Never rejects: a missing doc, a signed-out reader the rules refuse, or a
 * network failure all resolve to null, and callers render nothing for null.
 *
 * @param {string} questionId
 * @returns {Promise<Object|null>} raw questionStats doc data, or null
 */
export const getQuestionStats = async (questionId) => {
  if (!questionId) return null;
  try {
    const snap = await getDoc(doc(db, QUESTION_STATS_COLLECTION, questionId));
    return snap.exists() ? snap.data() : null;
  } catch (error) {
    console.warn(`[questionStats] Read failed for ${questionId}:`, error?.message);
    return null;
  }
};

/**
 * Fetch raw stats docs for a list of question ids.
 *
 * Primary path: chunked documentId() 'in' queries (up to 30 ids per query),
 * so a whole results page costs one query per 30 questions. If a chunk's
 * query fails, that chunk falls back to parallel getDoc reads; ids that are
 * missing — or whose read fails — map to null, so callers never branch on
 * errors.
 *
 * @param {string[]} questionIds
 * @returns {Promise<Object.<string, Object|null>>} id -> raw stats doc data (or null)
 */
export const getStatsForQuestions = async (questionIds = []) => {
  const ids = Array.from(new Set((questionIds || []).filter(Boolean)));
  const result = {};
  ids.forEach((id) => { result[id] = null; });
  if (ids.length === 0) return result;

  const chunks = [];
  for (let i = 0; i < ids.length; i += IN_QUERY_LIMIT) {
    chunks.push(ids.slice(i, i + IN_QUERY_LIMIT));
  }

  await Promise.all(chunks.map(async (chunk) => {
    try {
      const snap = await getDocs(query(
        collection(db, QUESTION_STATS_COLLECTION),
        where(documentId(), 'in', chunk),
      ));
      snap.forEach((d) => { result[d.id] = d.data(); });
    } catch (queryError) {
      console.warn('[questionStats] in-query failed, falling back to per-doc reads:', queryError?.message);
      await Promise.all(chunk.map(async (id) => {
        try {
          const snap = await getDoc(doc(db, QUESTION_STATS_COLLECTION, id));
          if (snap.exists()) result[id] = snap.data();
        } catch (docError) {
          console.warn(`[questionStats] Read failed for ${id}:`, docError?.message);
        }
      }));
    }
  }));

  return result;
};

// ---- pure derivations ------------------------------------------------------
// Each takes a raw questionStats doc (or null) and returns null below the
// MIN_SAMPLE noise floor, so "not enough data" and "no data" are the same
// non-rendering case for every caller.

const sampleSize = (raw) => {
  const attempts = Number(raw?.attempts) || 0;
  return attempts >= MIN_SAMPLE ? attempts : null;
};

/** Rounded 0-100 "% of students answer this correctly", or null. */
export const percentCorrect = (raw) => {
  const attempts = sampleSize(raw);
  if (attempts === null) return null;
  return clampPct(Math.round(((Number(raw?.correct) || 0) / attempts) * 100));
};

/**
 * Rounded 0-100 selection share per option index, `[pctA, pctB, pctC, pctD]`,
 * or null. Grid-in attempts count toward the denominator but never appear in
 * optionCounts, so the four values can legitimately sum below 100.
 */
export const percentPerOption = (raw) => {
  const attempts = sampleSize(raw);
  if (attempts === null) return null;
  const optionCounts = raw?.optionCounts || {};
  return [0, 1, 2, 3].map((index) => {
    const count = Number(optionCounts[index]) || 0;
    return clampPct(Math.round((count / attempts) * 100));
  });
};

/** Average seconds per attempt (rounded, floored at 1s), or null — also null
 *  when the sample is big enough but no time was ever recorded. */
export const avgSeconds = (raw) => {
  const attempts = sampleSize(raw);
  if (attempts === null) return null;
  const totalTimeMs = Number(raw?.totalTimeMs) || 0;
  if (totalTimeMs <= 0) return null;
  return Math.max(1, Math.round(totalTimeMs / attempts / 1000));
};

/**
 * Convenience bundle of the pure derivations above for the quiz surfaces, or
 * null when the sample is too small to show. Null means "render nothing".
 *
 * @param {Object|null} raw questionStats doc data
 * @returns {{
 *   attempts: number,
 *   pctCorrect: number,            // rounded 0-100
 *   avgTimeSec: number|null,       // rounded seconds; null when no time recorded
 *   optionPcts: number[]           // % of attempts per option index 0-3
 * }|null}
 */
export const formatStats = (raw) => {
  const attempts = sampleSize(raw);
  if (attempts === null) return null;
  return {
    attempts,
    pctCorrect: percentCorrect(raw),
    avgTimeSec: avgSeconds(raw),
    optionPcts: percentPerOption(raw) || [0, 0, 0, 0],
  };
};

/**
 * Compact duration label for peer-stats copy ("48s", "2m 05s").
 * Shared by SmartQuiz (tutor reveal) and SmartQuizResults.
 */
export const formatPeerSeconds = (seconds) => {
  const safe = Math.max(0, Math.round(Number(seconds) || 0));
  if (safe < 120) return `${safe}s`;
  const minutes = Math.floor(safe / 60);
  const remainder = safe % 60;
  return `${minutes}m ${String(remainder).padStart(2, '0')}s`;
};
