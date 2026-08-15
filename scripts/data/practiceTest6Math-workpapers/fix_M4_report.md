# PT6 — MODULE 4 fix round: what changed, and the evidence

**Scope:** `outputs/modules-pt6/M4.json` only (22 items). M3 was not touched; `M3.json` was read
twice (before and after the parallel M3 fix round) purely for collision checking.
**Result:** all 12 adjudicated fixes applied · `verify_M4.py` **ALL CHECKS PASSED, 2,386 assertions**
(was 1,852) · zero new corpus or cross-form collisions · **the form's visual count is unchanged
at 4 per module / 8 per form** — M4 Q15 kept an HTML table.

---

## A. Blueprint domain correction

### A1 — Q22 recast to nonlinear-equations

| | Before | After |
|---|---|---|
| Stimulus | `f(x) = ax + b`, f(2) = 9 and f(10) = 15 → f(1) | `4x² − 25x + c = 0`, one solution is x = 3 → the other solution |
| Skill / id | linear-functions / 12 | **nonlinear-equations / 17** |
| Key | 33/4 | **13/4** (lowest terms, positive, 4 chars) |
| Trap | step-skip | step-skip (the constant *c* = 39 reported instead of the second root) |
| Accepted forms | 4 (missing `99/12`) | **9, set-equal to the enumerator** |

Module 4 now measures **ALG 7 / ADV 7 / PSDA 4 / GEO 4** and the skill census is exactly
1var 1 · func 2 · 2var 1 · systems 2 · ineq 1 · NLF 3 · NLE 2 · EE 2 · ratios 1 · pct 1 · prob 1 ·
inference 1 · AV 1 · LAT 1 · RTT 1 · circles 1 = 22. Both are asserted in `check_blueprint`.
The recast also kills the critic's soft echo: both Q22s were "two conditions on *f* fix *a* and *b*";
M4's closer no longer contains a function at all (`verify_M4` bans *f(*, *function*,
*a and b are constants* from its stem).

## B. Cross-form and internal repeats

| | Before | After | Why it is now fresh |
|---|---|---|---|
| **B1 Q1** | laundromat card $6 + $2.75/load = $39, "which equation" — the third consecutive form with a flat-fee-plus-rate model (PT4 M3.02, PT5 M4.01) | Priya's bookbindery: 640 cm of ribbon, 16 cm per book, 96 cm remain → `640 − 16n = 96` | **depletion**, not accumulation; the verifier hard-fails on *fee / charge / costs / per hour / monthly / flat*. Skill, easy band, role-swap trap and key letter A all preserved |
| **B2 Q9** | 625 observatory volunteers, 48% ± 4 points; four propositions identical to PT4 M4.14, reordered | 400 volunteers, mean **18.5 hours ± 1.2 hours**; four propositions rewritten for a mean | the estimate is a **mean with units** (stem and every option are `%`-free, asserted). The "all equally likely" proposition is retired in favour of the individual-vs-mean misconception — which is CB's own distractor in bank item `f8f79e11`. n = 400 with s ≈ 12.24 h gives 1.96·s/√n = 1.20 h exactly |
| **B3 Q15** | four-row table → "which equation", slope/intercept-interchange distractor = PT5 M3.08 | **three-row** table with `k` in one cell → "What is the value of k?"; options 8 / 15 / 17 / 19 | new ask, numeric options instead of equations, and CB's own lead-in ("the table **gives** three values of x and their corresponding values of y, where k is a constant") — attested 9× in the bank and in practice tests 6 and 7. The interchange distractor survives as y = 10x + 5 → k = 8. **Table retained, so the visual quota is untouched** |
| **B4 Q18** | "triangles GHJ ~ KLM — which additional information is sufficient to prove congruence" = PT4 M4.18 | segments *WY* and *XZ* meet at *V*; angles XWV = 47°, WXV = 68°, ZYV = 39° → angle YZV | multi-triangle angle chaining through triangle sum → vertical angles → triangle sum. Hard, figure-less, one trap (**answer-the-wrong-target**: 65 is the intersection angle computed en route). *sufficient / congruent / similar / perimeter* are banned from the item |
| **B5 Q13** | rowing club, 2,000-lb cap, 260-lb boat, 165-lb rowers → 10 (same pipeline as M3 Q11) | cider press: 560 L of juice, 74 L set aside, 34 L per barrel → **14** | the resource is a **volume**. *See the note below — this changed twice.* |

**Note on B5.** The brief prescribed "time, volume, count or distance" on the assumption that M3
would keep the weight cap. When I re-read `M3.json` after the parallel round, M3 Q11 had itself
been recast from a weight cap to a **preparation-time** cap ("at most 900 minutes"). A time budget
at M4 Q13 would therefore have re-created the very collision B5 exists to remove, so M4 Q13 went to
a **volume** budget instead. `verify_M4.py` now bans *pound, weight, weigh, carry, boat, rower,
minute, hour, time, kayak* from the item and requires *liters*.

## C. SPR completeness

`outputs/modules-pt5/_spr_enum.py` was copied to `outputs/modules-pt6/_spr_enum.py` and is now
**imported by `verify_M4.py`**, which asserts **set equality** (it reports both `missing` and
`extra`), so the PT5-era regression cannot silently recur.

| Item | Key | Listed before | Listed after | Entries closed |
|---|---|---|---|---|
| Q5 | 17 | 8 | **12** | `102/6 119/7 136/8 153/9` |
| Q6 | 588 | 3 | 3 | — (already exhaustive) |
| Q12 | 26.5 | 4 | **6** | `159/6 212/8` |
| Q13 | 14 (was 10) | 8 | **12** | full list re-enumerated for the new key |
| Q19 | 19 | 8 | **12** | `114/6 133/7 152/8 171/9` |
| Q22 | 13/4 (was 33/4) | 4 | **9** | full list re-enumerated for the new key |

All 15 gaps the critic and verifier found are closed; nothing illegal or over-length was introduced.

## D. Formatting and hygiene

- **D1** — 16 explanations carried literal `\n\n`; **0 explanations now contain any newline**
  (asserted for every item, plus `graphDescription`, `_archetype`, `_trap`).
- **D2** — Q20's eleven `<sup>` runs became Unicode: `500(1.44)ᵗ⁄²`, `(1.44)¹⁄²`, `500(1.2)ᵗ`.
  This matches the shipped house precedent `900(1.15)ᵐ⁄²⁰` in PT5 M4.17. `<sup>` in *passages*
  is retained — §8 licenses it there. `verify_M4` now bans any markup inside `explanation`.
- **D3 — alt-text policy corrected to DATA-COMPLETE.** Q7 previously said "tick marks at every
  2 units" (false — the gridlines are at 1) and withheld the coordinate the item asks for. It now
  reads: gridlines at every **1 unit**, axes labeled at every **2 units**, x from −3 to 5,
  y from −5 to 6, crossings at (−1, 0) and (3, 0), y-axis crossing at (0, −3), lowest point
  (1, −4). Q11 now names the vertices, the right angle at *T*, both leg labels and the unlabeled
  hypotenuse — but not √521 ≈ 22.8, which must still be computed. The guard that used to forbid
  naming the y-intercept has been inverted into a positive data-completeness check. Neither SVG
  was edited.
- **D4** — Q11 `_distractorLogic.B`: "treating **DF** as the hypotenuse" → "treating **RT** as the
  hypotenuse". A new `check_stale_labels` sweeps every field of both geometry items for retired
  label tokens and asserts the three label sets (M3 *DEF*, M4 *RST*, M4 *WXYZV*) are disjoint.
- **D5** — Q4: "What is the total fare, **in dollars,** for a trip through 6 zones?"
- **D6** — the four rationales over ~1.35× their §7 norm were trimmed with every derivation step
  and every dismissal kept: Q6 55→50 (1.38→1.25), Q10 150→144 (1.36→1.31), Q11 185→177
  (1.37→1.31), Q21 232→218 (1.36→1.28). Module ratios are now **median 1.24, max 1.33, min 0.82**;
  `check_prose_lengths` enforces a 1.35 ceiling.

---

## Verifier output (final run)

```
ULTRASAT PT6 - MODULE 4 verification
  questions      : 22 (16 MC / 6 SPR)
  key letters    : {'A': 4, 'B': 4, 'C': 4, 'D': 4}
  SPR answers    : {5: '17', 6: '588', 12: '26.5', 13: '14', 19: '19', 22: '13/4'}
  stem tokens    : every item inside its §2b cap on BOTH rulers (tightest Q14 34/35, Q22 33/35,
                   Q15 32/35, Q9 70/75)
  rationale words: median ratio 1.24, max 1.33 (Q15, Q16), min 0.82 (Q20)
  Q09 exhaustive : constructed sample 400, mean 18.5, s 12.2449, margin 1.2000,
                   individuals outside [17.3, 19.7]: 400
  Q18 exhaustive : 120 grid configurations; constructed (XWV, WXV, ZYV, YZV) = (47.0, 68.0, 39.0, 76.0);
                   integer scan of m(ZYV) hitting 76 -> [39]
  SPR exhaustive : 5:17->12  6:588->3  12:26.5->6  13:14->12  19:19->12  22:13/4->9
  assertions run : 2386
ALL CHECKS PASSED
```

**Exhaustive (not spot-check) uniqueness proofs retained and added.** Retained: Q13 (integer scan
of the budget), Q16 (dense rational scan of *k*), Q19 (integer scan of the discriminant),
Q20 (functional equivalence on a grid of *t*). **Added this round:**
- **Q18** — the vertical-angle identity m(YZV) = m(XWV) + m(WXV) − m(ZYV) is verified over 120
  constructed intersecting-segment configurations (6 × 5 direction pairs × 4 distance quadruples),
  the item's own configuration is then built by the law of sines and its fourth angle *measured*
  at 76.0000, and every admissible integer value of the third given angle is scanned (only 39
  gives 76). Each of 65 / 68 / 115 is re-derived from its named recipe and shown ≠ 76.
- **Q9** — a real 400-value data set with mean exactly 18.5 and 1.96·s/√n = 1.2000 is constructed;
  all 400 individuals fall outside [17.3, 19.7], which falsifies choice B by construction. Each of
  the four propositions is matched to its named misconception, and no non-key option asserts the
  plausible interval.
- **Q15** — every option is tested against the table's own relation 5k + 10 = 85 (only B holds).
- **Q22** — *c* is solved for symbolically (unique: 39), the full solution set is recovered
  ({3, 13/4}), the factorisation is expanded back, the discriminant is confirmed to be 1, and a
  dense rational grid finds no third root.

All-token word rulers are unchanged and still self-tested by `check_length_ruler`.

## New key tally

`{'A': 4, 'B': 4, 'C': 4, 'D': 4}` — unchanged. Each rewritten MC was engineered onto its previous
letter (Q1 A, Q9 D, Q15 B, Q18 C) so the balance was preserved by the arithmetic, not by shuffling.
Both new numeric sets ascend: Q15 `8 < 15 < 17 < 19`, Q18 `65 < 68 < 76 < 115`.

## Corpus re-grep (every touched item)

Pass-1 lexical n-gram, n = 20 → 8, two normalisations (with-numerals and digit-blind), against the
four `outputs/extracted/questionbank-export-*.txt`, the four `sat-practice-test-*.txt` extracts,
`practiceTest4Math.json`, `practiceTest5Math.json` and the live `modules-pt6/M3.json`:

| Item | Longest content run | Against | Verdict |
|---|---|---|---|
| Q1 | **< 8 tokens** | — | CLEAN |
| Q13 | **< 8 tokens** | — | CLEAN |
| Q18 | **< 8 tokens** | — | CLEAN |
| Q22 | **< 8 tokens** | — | CLEAN |
| Q21 | **< 8 tokens** | — | CLEAN |
| Q4 | **< 8 tokens** | — | CLEAN |
| Q9 | 9 | PT4 | "which of the following is the most appropriate conclusion" — stem frame |
| Q6 | 9 | PT5 | "centimeters. what is the area in square centimeters of" — units boilerplate |
| Q10 | 13 (digit-blind) | ptest-6 | "which of the following is the best interpretation of # in this context" — §2a's *required* wording |
| Q11 | 10 | bank | "which of the following is closest to the length of" — CB frame |
| Q15 | 11 | ptest-7 | "three values of x and their corresponding values of y where" — CB liturgy, 9 bank instances + ptest-6/7 |
| Q20 | 10 | PT5 | "the function f is defined by the given equation where" — §2a opener |

Every surviving run is spec-mandated liturgy; no content-bearing overlap remains.
Named-entity and context sweep — *bookbind, ribbon, cider, barrel, juice, tasting, Priya* — returns
**0** hits in the corpus, **0** in PT4/PT5 and **0** in the live M3. No new key equals a same-skill
corpus item's published answer (`Correct Answer: 15 / 76 / 13/4 / 3.25 / 39` → 0 hits; the two
`Correct Answer: 14` bank items are Advanced-Math and one-variable-data, not linear inequalities).
No corpus item shares three or more numerals with any rewritten item except Q15's set
{25, 50, 85, 15}, whose three matches are a gas-station two-way table, a car-lease linear function
and a shaded-region inequality graph — unrelated skills and pipelines.

## Cross-module check against the fixed M3

- Contexts: zero overlap (M3 = warehouse bolts · snail survey · aquarium · kayak livery ·
  bakery trays · wind turbines · ski rental; M4 = bookbindery · quarry · tram · seed library ·
  observatory · hardware store · cider press). The word "press" does not occur standalone in M3.
- Figure labels: M3 *DEF* · M4 *RST* · M4 *WXYZV* — disjoint, asserted.
- Constrained resources: M3 Q11 **time**, M4 Q13 **volume** — no repeat.
- Form SPR census: **8 integers (126, 588 three-digit) · 3 fractions · 1 decimal**, with the form's
  only negative (−26/3) still in M3 Q22.

## Post-fix confirmation checklist

| Check | Target | Actual |
|---|---|---|
| M4 domains | ALG 7 / ADV 7 / PSDA 4 / GEO 4 | **exact** |
| M4 skills | the A1 list | **exact, 22 rows** |
| Difficulty | 9E / 7M / 6H | **9 / 7 / 6** |
| Ramp | monotone, one dip at Q10 | **dips = [10]** |
| SPR positions | 5, 6, 12, 13, 19, 22 (E/E/M/M/H/H) | **exact** |
| SPR census (M4) | 4 int incl. one 3-digit · 1 dec at Q12 · 1 frac at Q22 | **17, 588, 14, 19 · 26.5 · 13/4** |
| Form's only negative | in M3 | **M3 Q22 = −26/3** |
| Key letters | 4/4/4/4 | **4/4/4/4** |
| Visuals | 4 (parabola, two-way table, geometry figure, data table) | **Q7 SVG · Q8 table · Q11 SVG · Q15 table — count unchanged** |
| Traps | one per item, all distinct | **19 trapped, 19 distinct; Q5/Q6/Q13 blank per blueprint** |
| Named people | ≤ 2 | **1 (Priya)** |
| Latin binomial | none in M4 | **0 italic spans** |

## Two things for the form-level auditor (outside this round's mandate)

1. **112 is now the answer at both M3 Q8 and M3 Q19** — an M3-internal duplicate created by the
   parallel fix round. Not mine to repair.
2. Two soft numeric echoes survive across the form and were left alone because their items are not
   in the adjudicated list: **12** is the answer at M3 Q9, M3 Q12 and M4 Q16, and **17** is the
   answer at both M3 Q17 and M4 Q5.
