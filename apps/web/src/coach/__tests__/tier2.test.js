/**
 * Tests for the Tier-2 pure reducers — the mechanical layer the coach narrates.
 * The conceptState scenario mirrors the product's canonical example:
 * struggle → recovery → regression on "plural possessives".
 */

import {
  reduceSkillState,
  reduceConceptState,
  emptySkillState,
  emptyConceptState,
  computeTrend,
} from '../tier2';

const attempt = (correct, extra = {}) => ({ correct, source: 'smartquiz', ts: 1000, ...extra });

const foldSkill = (results) =>
  results.reduce((s, c) => reduceSkillState(s, attempt(c)), emptySkillState('boundaries'));

const foldConcept = (results) =>
  results.reduce((s, c) => reduceConceptState(s, attempt(c)), emptyConceptState('plural-possessive'));

describe('reduceSkillState', () => {
  test('accumulates counts and integer accuracy', () => {
    const s = foldSkill([true, true, false]);
    expect(s.attempts).toBe(3);
    expect(s.correct).toBe(2);
    expect(s.accuracy).toBe(67); // rounded int — never a float (audit bug class)
    expect(Number.isInteger(s.accuracy)).toBe(true);
  });

  test('tracks per-source buckets and last-10 accuracy', () => {
    let s = emptySkillState('boundaries');
    s = reduceSkillState(s, attempt(true, { source: 'exam' }));
    s = reduceSkillState(s, attempt(false, { source: 'smartquiz' }));
    expect(s.bySource.exam).toEqual({ attempts: 1, correct: 1 });
    expect(s.bySource.smartquiz).toEqual({ attempts: 1, correct: 0 });
    expect(s.accuracyLast10).toBe(50);
  });

  test('trend flags decline after a good run turns bad', () => {
    // 10 mostly-correct then 10 mostly-wrong => declining
    const results = [...Array(10).fill(true), ...Array(10).fill(false)];
    const s = foldSkill(results);
    expect(s.trend).toBe('declining');
  });

  test('trend is insufficient with little data', () => {
    expect(computeTrend([true, false, true])).toBe('insufficient');
  });
});

describe('reduceConceptState — struggle → recovery → regression', () => {
  test('the possessives scenario end to end', () => {
    // Jun 30: two misses among early attempts → struggle
    let c = foldConcept([false, false, true]);
    expect(c.hadEarlyStruggle).toBe(true);
    expect(c.recoveredTs).toBeNull();

    // Jul 10: three correct in a row → recovery recorded
    c = [true, true, true].reduce((st, r) => reduceConceptState(st, attempt(r)), c);
    expect(c.recoveredTs).not.toBeNull();
    expect(c.regressionFlag).toBe(false);

    // Jul 25: two misses after recovery → REGRESSION (the coach's cue)
    c = [false, false].reduce(
      (st, r) => reduceConceptState(st, attempt(r, { errorPattern: 'apostrophe-before-s-plural' })),
      c
    );
    expect(c.regressionFlag).toBe(true);
    expect(c.missStreak).toBe(2);
    expect(c.errorPatterns['apostrophe-before-s-plural']).toBe(2);
  });

  test('a new 3-correct run clears the regression flag', () => {
    let c = foldConcept([false, false, true, true, true]); // struggle then recover
    c = [false, false].reduce((st, r) => reduceConceptState(st, attempt(r)), c); // regress
    expect(c.regressionFlag).toBe(true);
    c = [true, true, true].reduce((st, r) => reduceConceptState(st, attempt(r)), c); // fix again
    expect(c.regressionFlag).toBe(false);
  });

  test('one isolated miss after recovery does NOT flag regression', () => {
    let c = foldConcept([false, false, true, true, true]);
    c = reduceConceptState(c, attempt(false));
    expect(c.regressionFlag).toBe(false);
    expect(c.missStreak).toBe(1);
  });

  test('reducers are pure (no input mutation)', () => {
    const before = emptyConceptState('x');
    const frozen = JSON.stringify(before);
    reduceConceptState(before, attempt(true));
    expect(JSON.stringify(before)).toBe(frozen);
  });
});
