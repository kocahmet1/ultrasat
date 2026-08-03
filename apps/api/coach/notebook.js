/**
 * AI Coach — the coach notebook (Tier 3: narrative memory).
 *
 * One document per student: `coachNotebook/{uid}`.
 *   text  — LLM-maintained markdown, the coach's durable memory of this student
 *   meta  — mechanical bookkeeping the significance rules use (no LLM involved)
 *
 * The notebook is what makes "I remember you were missing these a few weeks
 * ago" possible in one read. It is token-bounded; the LLM is instructed to
 * merge/prune, and we hard-clamp as a backstop.
 */

const MAX_NOTEBOOK_CHARS = 7000;

const DEFAULT_NOTEBOOK_TEXT = `## Goals & logistics
(not captured yet)

## Story so far
New student — no coaching history yet.

## Working observations
(none yet)

## Commitments & follow-ups
(none yet)

## Preferences
(unknown yet)`;

const NOTEBOOK_CONTRACT = `THE NOTEBOOK is your durable memory of this student. Maintain it with care:
- Keep the five sections: Goals & logistics / Story so far / Working observations / Commitments & follow-ups / Preferences.
- Working observations are DATED, concept- or skill-specific, and tell a story over time, e.g.
  "plural-possessive: Jun 30 struggled (apostrophe-before-s) -> Jul 10 recovered -> Jul 25 REGRESSED (2 misses)".
  Update an existing line rather than adding a duplicate; delete lines that are resolved and stale.
- Commitments record what you suggested, whether the student did it, and when to follow up.
- NEVER invent facts. Only fold in what the STUDENT CONTEXT or the conversation shows.
- Keep the whole notebook under ${MAX_NOTEBOOK_CHARS} characters — merge and prune aggressively.`;

function defaultMeta() {
  return {
    lastObserveAt: null, // ms
    lastWeeklyNoteAt: null, // ms
    lastBriefingDay: null, // 'YYYY-MM-DD'
    acknowledgedRegressions: [], // conceptIds already surfaced to the student
  };
}

async function getNotebook(db, uid) {
  const snap = await db.doc(`coachNotebook/${uid}`).get();
  if (!snap.exists) {
    return { text: DEFAULT_NOTEBOOK_TEXT, meta: defaultMeta(), exists: false };
  }
  const data = snap.data();
  return {
    text: data.text || DEFAULT_NOTEBOOK_TEXT,
    meta: { ...defaultMeta(), ...(data.meta || {}) },
    exists: true,
  };
}

/**
 * Persist notebook text (clamped) and/or merge meta updates.
 * @param {*} db  @param {string} uid
 * @param {{ text?: string, meta?: object }} update
 */
async function saveNotebook(db, uid, update) {
  const payload = { updatedAt: new Date() };
  if (typeof update.text === 'string' && update.text.trim()) {
    payload.text = update.text.slice(0, MAX_NOTEBOOK_CHARS);
  }
  if (update.meta) {
    const current = await getNotebook(db, uid);
    payload.meta = { ...current.meta, ...update.meta };
  }
  await db.doc(`coachNotebook/${uid}`).set(payload, { merge: true });
}

module.exports = {
  MAX_NOTEBOOK_CHARS,
  DEFAULT_NOTEBOOK_TEXT,
  NOTEBOOK_CONTRACT,
  getNotebook,
  saveNotebook,
  defaultMeta,
};
