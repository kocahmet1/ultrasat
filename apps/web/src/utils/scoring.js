/**
 * THE scoring module (Overhaul Phase D).
 *
 * One implementation for every score and accuracy number in the product.
 * The audit found FIVE competing SAT-score formulas and FOUR accuracy
 * definitions — the same exam showed different scores on different pages.
 * Every consumer now imports from here; never compute a score anywhere else.
 *
 * Canonical choices:
 *  - Scaled section score: 200 + pct·600, rounded to nearest 10 (the formula
 *    historical results were SAVED with — so history stays consistent).
 *  - Section split: canonical taxonomy getSection() — handles kebab, numeric,
 *    and name-format subcategory tags (fixes the old numeric-only lookup that
 *    dumped kebab-tagged questions into Math).
 *  - Accuracy: correct/total, integer percent.
 */

import { getSection } from './subcategoryTaxonomy';

/** Integer accuracy percent. */
export const accuracyPct = (correct, total) =>
  total > 0 ? Math.round((correct / total) * 100) : 0;

/** Canonical raw→scaled section score (200–800, rounded to 10). */
export const scaledSectionScore = (correct, total) => {
  if (!total || total <= 0) return 200;
  const raw = 200 + (correct / total) * 600;
  return Math.min(800, Math.max(200, Math.round(raw / 10) * 10));
};

/**
 * Resolve a response's section: 'reading-writing' | 'math' | null.
 * Accepts any historical field/format via the canonical taxonomy.
 */
export const responseSection = (response) => {
  const candidates = [
    response?.subcategoryId,
    response?.subcategory,
    response?.question?.subcategoryId,
    response?.question?.subcategory,
  ];
  for (const c of candidates) {
    const section = getSection(c);
    if (section) return section;
  }
  return null;
};

/**
 * Score a full exam from its responses (objects with isCorrect + subcategory
 * fields in any format). Unresolvable-section responses count toward totals
 * and the overall percent but not toward either section.
 *
 * @returns {{ readingWriting, math, total, correctCount, totalCount, overallPct,
 *             rw: {correct, total}, m: {correct, total}, unresolved: number }}
 */
export const examScores = (responses = []) => {
  let rwC = 0, rwT = 0, mC = 0, mT = 0, correct = 0, unresolved = 0;
  for (const r of responses) {
    const isCorrect = !!(r?.isCorrect);
    if (isCorrect) correct += 1;
    const section = responseSection(r);
    if (section === 'reading-writing') { rwT += 1; if (isCorrect) rwC += 1; }
    else if (section === 'math') { mT += 1; if (isCorrect) mC += 1; }
    else unresolved += 1;
  }
  const readingWriting = scaledSectionScore(rwC, rwT);
  const math = scaledSectionScore(mC, mT);
  return {
    readingWriting,
    math,
    total: readingWriting + math,
    correctCount: correct,
    totalCount: responses.length,
    overallPct: accuracyPct(correct, responses.length),
    rw: { correct: rwC, total: rwT },
    m: { correct: mC, total: mT },
    unresolved,
  };
};

/**
 * THE estimated SAT score, from Tier-2 skillState docs (event-fed, rebuildable).
 * Per section: total recent accuracy (last-10 window per skill, weighted by how
 * much the student practiced each skill) → canonical scaled score.
 *
 * @param {Array<{subcategoryId, attempts, accuracyLast10, accuracy}>} skillStates
 * @returns {{ total, readingWriting, math, coverage } | null} null when no data
 */
export const estimatedSATFromSkillState = (skillStates = []) => {
  const buckets = { 'reading-writing': { w: 0, acc: 0, skills: 0 }, math: { w: 0, acc: 0, skills: 0 } };
  for (const s of skillStates) {
    if (!s || !s.attempts) continue;
    const section = getSection(s.subcategoryId);
    if (!section || !buckets[section]) continue;
    const acc = s.accuracyLast10 ?? s.accuracy ?? 0;
    const weight = Math.min(s.attempts, 20); // cap so one grinded skill can't dominate
    buckets[section].w += weight;
    buckets[section].acc += acc * weight;
    buckets[section].skills += 1;
  }
  const rwB = buckets['reading-writing'];
  const mB = buckets.math;
  if (rwB.w === 0 && mB.w === 0) return null;
  const rwPct = rwB.w ? rwB.acc / rwB.w : 0;
  const mPct = mB.w ? mB.acc / mB.w : 0;
  const readingWriting = scaledSectionScore(rwPct, 100);
  const math = scaledSectionScore(mPct, 100);
  return {
    readingWriting,
    math,
    total: readingWriting + math,
    coverage: Math.round(((rwB.skills + mB.skills) / 29) * 100), // % of the 29 skills with data
  };
};
