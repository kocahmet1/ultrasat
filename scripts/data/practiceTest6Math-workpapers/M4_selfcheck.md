# ULTRASAT Practice Test 6 — MODULE 4 (Math Module 2) — authoring self-check
### Revision 3 (round-3 polish, 2026-08-15) — supersedes revision 2

Files: `M4.json` · `assets/PT6-M4-Q07.svg` · `assets/PT6-M4-Q11.svg` · `verify_M4.py` · `_spr_enum.py` · this file.
Contract: `docs/CB_Math_Style_Spec.md` (binding, **§8 alt-text rule amended 2026-08-15**) +
`analysis/blueprint_pt6_math.md` MODULE 4 slot table **as corrected 2026-08-14** (Q22 →
nonlinear-equations) + `analysis/B_question_bank.md` playbooks.

Verifier: `python verify_M4.py` → **ALL CHECKS PASSED, 2,426 assertions**, key letters 4/4/4/4.

**Round 3 changed two cosmetics and one instrument in this module, no mathematics:** Q15's table
headers are now `<i>x</i>` / `<i>y</i>` (F2, the one round-1 repair that had been skipped); Q7's alt
text states the curve's plotted points instead of announcing where it "crosses the y-axis", which was
the stem's own asked quantity verbatim (F6); and the length rulers gained a third measure that drops
**nothing at all**, tables included, with the difference reported per item (F7). Q11 keeps leg ↔
hypotenuse, which is now its alone form-wide after M3 Q18 was re-pitched (F3).

Fix round applied: A1 (Q22 domain correction) · B1–B5 (cross-form / internal re-archetyping at
Q1, Q9, Q13, Q15, Q18) · C1 (SPR completeness, now enforced by set equality with the project
enumerator) · D1–D6 (newlines, `<sup>`, alt-text policy, stale label, units clause, rationale
lengths). Items **not** named in the adjudicated list were left untouched.

---

## 1. Slot-by-slot conformance

**stem** = (prose tokens / all tokens incl. displayed equations / §2b cap); **rat** = rationale
tokens (ratio to the §7 norm 110·135·170 MC E/M/H, 40·100·130 SPR E/M/H). Both rulers count
EVERY whitespace-delimited token — numerals, operators and bare symbols included.

Round 3 added a third, **drop-nothing** ruler that also counts HTML table cells, and the script now
proves the three agree on the 20 items without a table. They differ on exactly two: **Q8 = 56 tokens
of which 19 are table cells** (37 of stem prose against a 55 cap) and **Q15 = 40 of which 8 are table
cells** (32 against a 35 cap). §2b measures stem *prose*, so the cap is binding on the middle ruler;
the drop-nothing count is printed for every item and the script asserts that any excess over a cap is
attributable **only** to tabular tokens. Nothing is hidden and nothing needed trimming.

| # | skill (id) | diff | fmt | visual | archetype (B §2) | trap (spec §5) | context | key | stem | rat |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | linear-equations-one-variable (11) | E | MC | — | 2.1-B applied single-unknown, **depletion at a constant rate** | slope/intercept role swap | bookbindery ribbon (Priya) | **A** | 35/35/55 | 138 (1.25) |
| 2 | equivalent-expressions (18) | E | MC | — | 2.6-A simplify a difference of polynomials | wrong operation on exponents | abstract | **B** | 14/14/15 | 122 (1.11) |
| 3 | ratios-rates-proportions (19) | E | MC | — | 2.9-A two-hop conversion, factor GIVEN | unit-conversion chain | quarry: stone per shift | **B** | 33/33/55 | 136 (1.24) |
| 4 | linear-functions (12) | E | MC | — | 2.2-B applied model, forward use | adjacent-quantity | tram fares | **D** | 33/38/55 | 135 (1.23) |
| 5 | systems-linear-equations (14) | E | SPR | — | 2.4-A solve system, report one variable | — | abstract | 17 | 17/27/35 | 48 (1.20) |
| 6 | area-volume (26) | E | SPR | — | 2.16-A direct area with one scale step | — | abstract (converted) | 588 | 29/29/35 | 50 (1.25) |
| 7 | nonlinear-functions (16) | E | MC | **SVG parabola** | 2.8-E read an intercept off a shown graph | ordered-pair reversal | abstract, xy-plane | **C** | 22/22/35 | 127 (1.15) |
| 8 | probability (23) | E | MC | **HTML two-way table** | 2.13-A probability from a two-way table | wrong denominator | seed library: type × germination | **A** | 37/37/55 | 133 (1.21) |
| 9 | inference-statistics (24) | M | MC | — | 2.14-B **margin of error on an estimated MEAN** | MoE misconception menu | observatory volunteer hours | **D** | 70/70/75 | 169 (1.25) |
| 10 | linear-functions (12) | E | MC | — | 2.2-D best interpretation of the y-intercept | slope↔intercept mis-mapping | hardware store rental | **B** | 36/41/55 | 144 (1.31) |
| 11 | right-triangles-trigonometry (28) | M | MC | **SVG geometry fig** | 2.18-C Pythagorean, "closest to" | leg ↔ hypotenuse | abstract right triangle *RST* | **C** | 22/22/35 | 177 (1.31) |
| 12 | percentages (20) | M | SPR | — | 2.10-B percent change over successive years | percent-multiplier semantics | abstract | 26.5 | 33/33/35 | 117 (1.17) |
| 13 | linear-inequalities (15) | M | SPR | — | 2.5-D threshold to an integer bound, **volume budget** | — | cider press: juice in barrels | 14 | 39/39/55 | 129 (1.29) |
| 14 | equivalent-expressions (18) | M | MC | — | 2.6-C identity with unknown constants | coefficient matching / must-be | abstract | **C** | 22/34/35 | 175 (1.30) |
| 15 | linear-equations-two-variables (13) | M | MC | **HTML data table (3 rows)** | 2.3-D **missing table value**, constant in one cell | slope/intercept interchange | abstract (x \| y) | **B** | 32/32/35 | 180 (1.33) |
| 16 | systems-linear-equations (14) | M | MC | — | 2.4-B parameter k for no solution | solution-count hunt | abstract | **D** | 22/32/35 | 180 (1.33) |
| 17 | nonlinear-functions (16) | H | MC | — | 2.8-H function-notation nesting | function-notation nesting | abstract | **D** | 26/32/35 | 195 (1.15) |
| 18 | lines-angles-triangles (27) | H | MC | — | 2.17-B **multi-triangle angle chaining across vertical angles** | answer-the-wrong-target | abstract, verbal, figure-less | **C** | 31/31/35 | 185 (1.09) |
| 19 | nonlinear-equations (17) | H | SPR | — | 2.7-D discriminant parameter, integer bound | solution-count boundary integer | abstract | 19 | 23/31/35 | 147 (1.13) |
| 20 | nonlinear-functions (16) | H | MC | — | 2.8-C growth per non-unit interval, rewritten | exponent-structure conversion | abstract | **A** | 24/28/35 | 139 (0.82) |
| 21 | circles (29) | H | MC | — | 2.19-B arc length with a radius step | radius ↔ diameter | abstract, figure-less | **A** | 33/33/35 | 218 (1.28) |
| 22 | **nonlinear-equations (17)** | H | SPR | — | 2.7-B **a given solution fixes the constant, second solution recovered** | step-skip | abstract | 13/4 | 25/33/35 | 158 (1.22) |

Every stem is under its §2b cap on **both** rulers. Rationale ratios: **median 1.24, max 1.33,
min 0.82** — D6 satisfied (nothing beyond ~35% over its norm); the previous round's four
over-length rationales (Q6 1.38, Q10 1.36, Q11 1.37, Q21 1.36) were trimmed with every
derivation step and every dismissal retained. `verify_M4.py` now hard-fails above 1.35.

## 2. Key tally and answer census

- **Key letters across the 16 MC: A 4 · B 4 · C 4 · D 4.** Each rewritten MC was engineered to
  land on its previous letter (Q1 A, Q9 D, Q15 B, Q18 C), so the balance is unchanged and was
  not achieved by shuffling. Q15's and Q18's numeric sets ascend (8 < 15 < 17 < 19;
  65 < 68 < 76 < 115) with the key wherever the arithmetic puts it.
- **SPR answers: Q5 = 17 · Q6 = 588 · Q12 = 26.5 · Q13 = 14 · Q19 = 19 · Q22 = 13/4.**
- SPR census for M4: **4 integers (one three-digit, 588), 1 terminating decimal (26.5),
  1 positive lowest-terms fraction (13/4)**. No negative — M3 Q22 owns the form's only negative.
- **acceptedAnswers is now SET-EQUAL to `_spr_enum.py`** for all six slots (12 · 3 · 6 · 12 · 12 · 9
  entries). The verifier reports both `missing` and `extra`, so the PT5-era regression cannot recur.

## 3. Trap list — exactly one per item

Trapped items: 19. Untrapped: Q5, Q6, Q13 (blueprint trap column blank). All 19 mechanisms are
distinct (asserted). Two changed in this round: **Q18** moves from "sufficiency meta-reasoning"
to **answer-the-wrong-target**, which also repairs the form-level tally the critic found short
(wrong-target ×2: M3 Q22 + M4 Q18). **Q22** keeps step-skip but now targets the constant *c*
rather than a function value. The slope/intercept-swap family still fires three times in the form
(M3 Q10, M4 Q1 role swap, M4 Q15 interchange), with M4 Q10 carrying the interpretation variant.

## 4. Applied-share decision

Converted slot is still **Q6** (abstract rectangle). M4 applied = **7**: Q1 (bookbindery),
Q3 (quarry), Q4 (tram), Q8 (seed library), Q9 (observatory), Q10 (hardware store),
Q13 (cider press). Unchanged at 7 + M3's 7 = 14/44 ≈ 32%.

## 5. Difficulty engineering (items rebuilt this round)

- **Q18 — the chain IS the difficulty.** Segments *WY* and *XZ* cross at *V*; the student must
  build the configuration from prose, run the triangle sum, recognise the vertical-angle pair,
  and run the triangle sum again. The seductive wrong answer is 65 — the intersection angle
  computed en route — which is the item's named trap. The verifier proves the vertical-angle
  chain over 120 grid configurations, then **constructs the item's own configuration by the law
  of sines and measures the fourth angle at 76.0000**, then scans every admissible integer value
  of the third given angle (only 39 yields 76).
- **Q22 — two steps, and the first one is a decoy.** Substituting the given solution fixes
  c = 39; the item then asks for the *other* root, 13/4. A student who stops at c has the
  step-skip. gcd(13, 4) = 1 and the discriminant is exactly 1, so the two roots are distinct and
  rational.
- **Q15 — the constant sits in the table.** Three rows, CB's own "the table gives three values of
  x and their corresponding values of y, where k is a constant" lead-in (attested 9× in the bank
  and in practice tests 6 and 7). The slope/intercept-interchange distractor survives as the
  equation y = 10x + 5, which yields k = 8.
- **Q9 — the margin now rides on a MEAN with units.** n = 400 with an implied sample standard
  deviation of 12.24 hours gives 1.96·s/√n = 1.20 hours exactly. The verifier **builds a real
  400-value data set** with that mean and margin and shows every individual value lies outside
  [17.3, 19.7], which is what falsifies choice B.
- **Q13 — a volume budget.** 34b + 74 ≤ 560 → b ≤ 14.29 → 14. The bound is deliberately *not*
  met exactly, because M3 Q11 owns the inclusive-boundary texture.
- **Q1 — depletion, not a fee.** 640 − 16n = 96. The verifier hard-fails on the words *fee*,
  *charge*, *costs*, *per hour*, *monthly*, *flat*, so the fee-plus-rate archetype cannot return.

## 6. Freshness of the re-archetyped items

| Item | Retired archetype | New archetype | Guard in `verify_M4.py` |
|---|---|---|---|
| Q1 | flat fee + per-unit rate → "which equation" (PT4 M3.02, PT5 M4.01) | depletion at a constant rate | banned-word list on the stem |
| Q9 | MoE on a percentage with PT4 M4.14's four propositions | MoE on an estimated mean in hours | stem and options must contain no `%` |
| Q13 | fixed load + per-unit under a **weight** cap (= M3 Q11) | fixed reserve + per-unit under a **volume** budget | banned-word list incl. *minute*, *time* |
| Q15 | four-row table → "which equation" (PT5 M3.08) | three-row table with a constant cell → value of *k* | "four values" banned, "three values" required |
| Q18 | similar-triangle sufficiency (PT4 M4.18) | angle chaining across vertical angles | *sufficient / congruent / similar / perimeter* banned |
| Q22 | linear f, two conditions → f(1) (echoed M3 Q22) | nonlinear equation, given root fixes c | *f( / function / a and b are constants* banned |

## 7. Originality firewall (re-run after the rewrite)

- Pass-1 lexical n-gram (n = 20 → 8, digit-blind and with-numerals) against the four question-bank
  exports, the four practice-test extracts, `practiceTest4Math.json`, `practiceTest5Math.json` and
  the live `M3.json`: **Q1, Q13, Q18, Q22 return no run of 8 tokens at all**; Q9's longest run is
  the 9-token stem frame *"which of the following is the most appropriate conclusion"*; Q15's is the
  11-token table liturgy *"three values of x and their corresponding values of y where"*. Every
  surviving hit is spec-mandated boilerplate.
- New context words — bookbinding, ribbon, cider, barrel, juice, tasting — return **zero** hits in
  the corpus, in PT4/PT5 and in the live M3.
- No new key equals a same-skill corpus item's published answer; no corpus item shares three or
  more numerals with any rewritten item.
- **Named people: 1 (Priya, Q1)**; **no Latin binomial** in Module 4.

## 8. Figures, alt text and the app-format contract

- **Alt-text policy corrected to DATA-COMPLETE** (the binding spec and both shipped forms; §8 of
  the contract now says so in one sentence, added 2026-08-15).
  `PT6-M4-Q07` states the true gridline spacing (**1 unit**, labels at 2), both axis ranges
  (x from −3 to 5, y from −5 to 6) and every readable point — (−1, 0), (3, 0), (0, −3), (1, −4).
  **Round 3 (F6) re-phrased how it says so.** It previously read "…crosses the x-axis at (−1, 0) and
  (3, 0), **crosses the y-axis at (0, −3)**, and has its lowest point at (1, −4)" — the second clause
  is the stem's own asked quantity ("the coordinates of the y-intercept") with the key attached, so a
  screen-reader user was handed the answer as an answer while a sighted student still had to find it.
  It now reads "…**the curve passes through the plotted points (−1, 0), (0, −3), and (3, 0), and its
  lowest point is at (1, −4)**": the same four data, stated as plotted geometry, in coordinate order,
  with no intercept vocabulary at all. Data-completeness is unchanged — every datum needed to answer
  is still present — but the ordered-pair-reversal trap is live again for a non-sighted reader, who
  must still decide which of the three listed points lies on the y-axis. `verify_M4.py` asserts both
  halves: the four points must be present, and the words "intercept" and "crosses the y-axis" must
  not be.
  `PT6-M4-Q11` names the vertices, the right angle at *T*, both leg labels 20 and 11, and that
  *RS* carries no label; it does not compute √521 for the reader. Neither SVG was edited.
- Q15's table keeps the house styling (`border-collapse:collapse`, `border:1px solid #333`,
  `padding:4px 8px`, `margin:8px auto`, bold `<th>`) at three data rows, and **round 3 italicised its
  two variable headers — `<th …><i>x</i></th>`, `<th …><i>y</i></th>` (F2)** — matching PT5 M3.08 as
  shipped and §8's italic-variable convention. Q8's headers are words ("Seed type", "Germinated",
  "Did not germinate", "Total"), so they stay roman; the verifier asserts that split, and the
  Latin-binomial guard was narrowed from "zero italic spans" to "no italicised binomial" so that a
  required italic variable cannot trip it.
- **Explanations are now markup-free and newline-free in all 22 items.** Q20's eleven `<sup>` runs
  became Unicode (`ᵗ⁄²`, `¹⁄²`, `ᵗ`), matching PT5 M4.17's shipped `ᵐ⁄²⁰`. The `<sup>` in the
  *passage* of Q14, Q17, Q19, Q20 and Q22 is retained — §8 licenses it there.
- Q4's terminal question now reads "What is the total fare, **in dollars,** for a trip through
  6 zones?"; Q11's `_distractorLogic.B` says **RT**, not the retired **DF**.

## 9. Blueprint reconciliation — CLOSED

The drafting round recorded a conflict between the blueprint's Module 4 header (ALG 7 / ADV 7)
and its slot table (which assigned ALG 8 / ADV 6). The 2026-08-14 correction resolves it: Q22
moves from linear-functions (12) to **nonlinear-equations (17)**. Module 4 now measures
**ALG 7 · ADV 7 · PSDA 4 · GEO 4**, and the skill census is exactly
1var 1 · func 2 · 2var 1 · systems 2 · ineq 1 · NLF 3 · NLE 2 · EE 2 · ratios 1 · pct 1 · prob 1 ·
inference 1 · AV 1 · LAT 1 · RTT 1 · circles 1 = 22. Both are asserted.

## 10. Verifier summary

```
ULTRASAT PT6 - MODULE 4 verification
  questions      : 22 (16 MC / 6 SPR)
  key letters    : {'A': 4, 'B': 4, 'C': 4, 'D': 4}
  SPR answers    : {5: '17', 6: '588', 12: '26.5', 13: '14', 19: '19', 22: '13/4'}
  Q09 exhaustive : constructed sample 400, mean 18.5, s 12.2449, margin 1.2,
                   individuals outside [17.3, 19.7]: 400
  Q18 exhaustive : 120 grid configurations; constructed (XWV, WXV, ZYV, YZV) = (47, 68, 39, 76);
                   integer scan of m(ZYV) hitting 76 -> [39]
  SPR exhaustive : 5:17->12  6:588->3  12:26.5->6  13:14->12  19:19->12  22:13/4->9
  max stem/cap   : 0.97   max rationale ratio 1.33   mean 1.21
  assertions run : 2426
ALL CHECKS PASSED
```

## 11. Live cross-module check against the fixed M3

Re-read after the parallel M3 fix round landed:

- **Contexts — zero overlap.** M3: warehouse cartons of bolts · rocky-shore snail survey ·
  aquarium tank · kayak livery (now a *preparation-time* cap) · bakery trays · wind turbines ·
  ski rental. M4: bookbindery · quarry · city tram · seed library · observatory · hardware store ·
  cider press. None of M4's context words appears anywhere in M3.
- **Resource de-confliction.** M3 Q11 was recast to a **time** cap in the parallel round; M4 Q13
  was therefore moved from time to a **volume** budget, so the form's two linear-inequality slots
  constrain different quantities and neither repeats the other's pipeline.
- **Figure labels.** M3 Q18 *DEF* · M4 Q11 *RST* · M4 Q18 *W, X, Y, Z, V* — three disjoint sets.
- **Named people — 2 for the form**: Anika (M3 Q12), Priya (M4 Q1).
- **Latin binomial — exactly one for the form**, M3 Q7.
- **Form SPR census**: M3 {7, 89, **16**, 7/3, 126, **−41/3**} + M4 {17, 588, 26.5, 14, 19, 13/4} =
  **8 integers (three-digit: 126, 588) · 3 fractions (M3 Q22 the only negative) · 1 decimal.**
- **Trap de-confliction (round 3).** M4 Q11 keeps *leg ↔ hypotenuse*; M3 Q18 was re-pitched to
  *special-triangle side ratio applied to the wrong side*, so the form's two right-triangle items no
  longer run the same mechanism. Both verifiers now read the sibling module's JSON and assert that
  leg ↔ hypotenuse is carried exactly once form-wide.
- **Numeric echoes after round 3.** M3 Q12's key moved 12 → 16, so the three-way tie on 12 is gone
  and the same-skill pair (M3 Q12 / M4 Q16, both systems) is gone. What remains is one benign
  cross-module pair — 12 at M3 Q9 (area-volume, MC) and M4 Q16 (systems, MC) — and the pre-existing
  17 at M3 Q17 / M4 Q5; key-equals-question-number is down from four items to three (M3 Q17, M4 Q15,
  M4 Q19). **Correction to revision 2:** the claim that "112 is the answer at both M3 Q8 and M3 Q19"
  was false — M3 Q19's key is **126**, chosen in the parallel round precisely to avoid that echo.
  Revision 2 read `M3.json` mid-edit; the modules were never wrong.
