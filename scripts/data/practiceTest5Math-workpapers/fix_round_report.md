# Fix-Round Report — PT5 Math Modules 3 & 4 (44 items)
### Every change applied against the adjudicated fix list, with before/after, re-verification, and recomputed form statistics.

Files touched: `modules-pt5/M3.json` · `modules-pt5/M4.json` · `modules-pt5/verify_M3.py` ·
`modules-pt5/verify_M4.py` · `modules-pt5/M3_selfcheck.md` · `modules-pt5/M4_selfcheck.md` ·
`modules-pt5/assets/PT5-M3-Q15.svg` · `modules-pt5/assets/PT5-M3-Q08.svg` → `PT5-M3-Q09.svg` (renamed) ·
`modules-pt5/assets/PT5-M4-Q04.svg` · `modules-pt5/assets/PT5-M4-Q11.svg` · `modules-pt5/assets/PT5-M4-Q16.svg`.
New files: `modules-pt5/_spr_enum.py` (the shared SPR legal-entry enumerator, imported by both verify
scripts) and `modules-pt5/_gen_svg.py` (the generator for the two regenerated figures).

**No item outside the adjudicated list was touched. No deviation from the list.**

---

## 1. Fix ledger

| # | Item | Fix | Before | After |
|---|---|---|---|---|
| **A1** | M4 Q18 (H, circles) | Rewrite — new archetype, same insight | "In the xy-plane, a circle has its center at (2, 7). Line k is tangent to the circle at the point (5, 3). **Which of the following points lies on line k?**" — options are four points; key D = (9, 6). Reproduces question-bank item `9adb86ed` and the official-PT5 stem trio. | Passage displays **x + 4y = 92**; "In the xy-plane, the graph of the given equation is tangent to a circle at the point (12, 20). The circle has center **(8, c)**, where c is a constant. **What is the value of c?**" — options 4 / 19 / 21 / 36; **key A = 4**. Tangent line and tangency point are the *givens*, the centre coordinate is the *unknown*: reversed pipeline, new constants. Tangent ⊥ radius and the reciprocal-vs-negative-reciprocal trap both preserved (distractors are the opposite slope 1/4 → 19, the tangent slope −1/4 → 21, the plain reciprocal −4 → 36). Stem 33 prose words. |
| **A2** | M3 Q15 (M, nonlinear-functions) | Rewrite — new parabola, new target, new SVG | y = x² − 6x + 5, vertex (3, −4); "What are the coordinates of the **vertex**?"; options `(-4, 3) · (0, 5) · (3, -4) · (5, 0)`. Identical parabola, key and 3 of 4 options to shipped PT4 M4.04. | y = **−x² − 4x + 5** (opens **downward**, vertex (−2, 9), x-intercepts −5 and 1); "What are the coordinates of the **y-intercept** of this graph?"; options `(-5, 0) · (-2, 9) · (0, 5) · (5, 0)`; **key C = (0, 5)** (unchanged letter). `PT5-M3-Q15.svg` regenerated to match exactly; ordered-pair-reversal trap now sits on choice D. |
| **A3** | M4 Q6 (E, SPR, nonlinear-functions) | Recast as function-notation nesting | `f(x) = 3x² − 5x + 4`, find f(6) = **82** — PT4 M3.06's template with one constant changed. | Passage stacks **f(x) = 2x² + 9** and **g(x) = x − 4**; "What is the value of **f(g(11))**?" → g(11) = 7, f(7) = **107**. Position 6, SPR, easy, integer answer, nonlinear-functions all retained. Closes the spec §5 **function-notation nesting** family (PT5 had 0). |
| **B1** | M3 Q12 (M, SPR, nonlinear-equations) | Recast to a radical equation with an extraneous candidate | `x² + 180 = 27x`, "What is **a** solution…?", multi-root answer **12 or 15**, 24 accepted entries, entry-forms note. | Passage displays **√(x + 7) = x − 5**; "What is **the** solution to the given equation?" Squaring gives x² − 11x + 18 = 0 → x = 2 or 9; **2 is extraneous** (3 ≠ −3), so the single valid answer is **9**. Trap = extraneous-solution awareness (closes the spec §5 family, PT5 had 0). Plain integer, no entry-forms note. |
| **B2** | M4 Q8 (E, area-volume) | Recast from a cube to a cylinder, answer in terms of π | "A **shipping box** is in the shape of a **cube** with an edge length of 9 inches" → 729; ladder 36 / 81 / 486 / **729**. Repeats PT4 M3.10's solid *and* its distractor family, and echoed M3 Q6's prism. | "A **grain silo** is in the shape of a **right circular cylinder** with a radius of 5 feet and a height of 12 feet" → **300π**; CB signature ladder kept: **25π** (base area only), **60π** (radius not squared, a wrong-formula companion), **120π** (lateral surface area). Key stays **D**. |
| **C1** | M4 Q20 (H, similar triangles) | Tighten to ≤35 words + add one genuine step | 42 prose words on a context-free item; single division 252/9 = 28; key A. | "Triangle ABC is similar to triangle DEF. The perimeter of ABC is 4 times the perimeter of DEF, and the area of DEF is 32 square centimeters. What is the area, in square centimeters, of ABC?" — **34 prose words**. Two steps: perimeter ratio → side ratio (4) → area ratio (16) → **512**. Ladder 2 (÷16) / 8 (÷4) / **128 (×4, the k-vs-k² trap)** / 512. Key moves A → **D** (used to rebalance A1's move D → A). |
| **C2** | M3 Q10 (M, linear-inequalities) | Rebuild the option set so the bounds vary | `47 < t < 55` · `47 < t ≤ 55` · `47 ≤ t < 55` · `47 ≤ t ≤ 55` — one bound pair, four strictness permutations. | `0 ≤ t ≤ 47` (lowest recorded value read as the maximum) · `0 ≤ t ≤ 55` (0 used as the lower bound) · `47 < t < 55` (**the one strictness distractor**) · **`47 ≤ t ≤ 55` (key D)**. Three distinct bound pairs; strict/inclusive is load-bearing in exactly one distractor (machine-asserted). |
| **C3** | Rationale lengths | Trim every item over ≈+45% of its §7 norm | M3 Q5 61 w (1.52×) · Q6 79 w (1.98×) · Q8 triangle 157 w (1.43×) · Q13 159 w (1.59×) · Q18 262 w (1.54×); M4 probability item 157 w (1.43×) · Q14 191 w (1.41×). Band means +20–25% across the form. | M3 Q5 **48 w (1.20×)** · Q6 **42 w (1.05×)** · triangle item (now Q9) **142 w (1.29×)** · Q13 **108 w (1.08×)** · Q18 **237 w (1.39×)**; M4 probability item (now Q10) **130 w (1.18×)** · Q14 **173 w (1.28×)**. **Worst ratio in the form is now 1.41× (M3 Q16).** Only restatement and redundancy were cut — no derivation step and no dismissal was dropped. Both verify scripts now fail any rationale outside [0.55×, 1.45×] of its norm. |
| **D1** | M4 Q4, M4 Q17 | Convert to abstract (applied share) | Q4: "The graph shows the **mass, in grams, of a sample of a certain substance t hours after the start of an experiment**… what is the mass 2 hours after the start?" Q17: "The function f gives the **number of bacteria in a certain culture** t hours after the culture was prepared… (1 hour = 60 minutes)". | Q4: passage "The graph of y = f(x) is shown in the xy-plane."; text "What is the value of f(2)?" — key C = 160 unchanged; alt text and the SVG axis titles rewritten (unit-bearing roman titles removed, italic *x*/*y* at the axis tips). Q17: "The function f is defined by the given equation. The function g is defined by **g(m) = f(m/60)**. Which equation defines g?" — key B = 900(1.15)^(m/20) unchanged; the t/n-vs-nt option family and the exponent-structure trap survive intact. |
| **D2** | M3 Q8↔Q9, M4 Q9↔Q10 | Swap adjacent MC positions to create the licensed ramp dip | Both modules were perfect step functions: `EEEEEEEE|MMMMMMMM|HHHHHH` and `EEEEEEEEE|MMMMMMM|HHHHHH`. | M3: the medium table item is now Q8 and the easy triangle item is Q9 → `EEEEEEE M | E MMMMMMM | HHHHHH`. M4: the medium two-variable item is now Q9 and the easy two-way-table item is Q10 → `EEEEEEEE M | E MMMMMM | HHHHHH`. Content, skills and difficulty labels unchanged; `originalQuestionNumber` and array order updated; **`PT5-M3-Q08.svg` renamed to `PT5-M3-Q09.svg`** with its `graphAsset` reference; no M4 asset needed renaming. SPRs still sit at **5, 6, 12, 13, 19, 22** in both modules. |
| **E1** | All 12 SPRs | Python enumerator + set-equality check in both verify scripts | Ten grid-legal entries missing across five items (M3 Q13 `.882`; M4 Q5 `104/8`, `117/9`; M4 Q6 four unreduced fractions; M4 Q12 `108/9`; M4 Q13 `100/8`; M4 Q22 `60/8`, `75/10`, `90/12`, `7.500`). | `modules-pt5/_spr_enum.py` generates every legal entry (integer form; every unreduced equivalent fraction whose string fits 5 chars / 6 with a minus; exact terminating decimals with all zero-paddings; for repeating values the truncated **and** half-up-rounded renderings at every fitting precision, **with and without the leading zero**), canonical form first. All 12 lists regenerated from it; both scripts assert set equality **and** separately brute-force that no legal equivalent fraction is missing. |
| **E2** | Figures | Redraw M4 Q11; harmonise the origin glyph | `PT5-M4-Q11.svg`: legs drawn 140 px and 160 px for labels 7 and 24 — ~3.4× out of proportion. Origin `O` italic in `PT5-M3-Q15.svg`, roman in `PT5-M4-Q04.svg` and `PT5-M4-Q16.svg`. | `PT5-M4-Q11.svg` redrawn at exactly **7 px per unit** (49 / 168 / 175 px for 7 / 24 / 25); the scale note stays. Origin `O` is now **italic on all figures that carry one** (M3 Q15, M4 Q04, M4 Q16), matching the italic-variable convention; both verify scripts assert it. |

---

## 2. Verify script outputs (both re-run to completion, exit 0)

### `verify_M3.py`

```
== Module shell ==
  PASS  moduleNumber 3 / section Math
  PASS  title 'Exam 5, Module 3'
  PASS  calculatorAllowed true, timeLimit 2100
  PASS  22 questions
  PASS  originalQuestionNumber 1..22 in order
  PASS  SPR positions [5, 6, 12, 13, 19, 22] == [5, 6, 12, 13, 19, 22]
  PASS  16 MC + 6 SPR
  PASS  every MC has exactly 4 options
  PASS  difficulty ramp E x7, M at Q8, E straggler at Q9, M x7 (Q10-16), H x6 (Q17-22)
  PASS  ramp carries exactly one dip (Q8 medium before Q9 easy), not a perfect step function
  PASS  PT5 M3 difficulty mix 8E / 8M / 6H
  PASS  SPR difficulty by position E/E/M/M/H/H
  PASS  key-letter tally {'A': 4, 'B': 4, 'C': 4, 'D': 4} == 4/4/4/4
== Blueprint quotas ==
  PASS  subcategory -> subcategoryId map correct on all 22 items
  PASS  domain quota {'ALG': 7, 'PSDA': 4, 'ADV': 7, 'GEO': 4} == ALG 7 / ADV 7 / PSDA 4 / GEO 4
  PASS  skill quota matches blueprint row-by-row (15 skills)
  ... (22 blueprint-slot assertions, visual quota, applied slots)
== App format contract ==
== Rationale liturgy (spec section 7) ==
== SPR acceptedAnswers (full legal-entry enumeration) ==
== Q1 linear solve, variable on both sides ==   ... == Q7 dot plot read-off ==
== Q8 linear function from a table ==
== Q9 isosceles triangle angles ==
== Q10 bounded range ==
  PASS  option set varies the BOUNDS, not only the strictness symbols
  PASS  three distinct bound pairs across the four options [(0, 47), (0, 55), (47, 55)]
  PASS  the strict/inclusive distinction is load-bearing in exactly one distractor (C)
== Q11 reverse percent ==
== Q12 SPR radical equation with an extraneous candidate ==
  PASS  squaring gives x^2 - 11x + 18 = 0, whose roots are 2 and 9
  PASS  x = 2 is extraneous: sqrt(9) = 3 but 2 - 5 = -3
  PASS  sympy confirms the equation has the single real solution 9 (got [9])
  PASS  the extraneous candidate 2 is NOT accepted
== Q13 SPR trig ratio ==   == Q14 exponential-base interpretation ==
== Q15 y-intercept from a shown parabola ==
  PASS  vertex of y = -x^2 - 4x + 5 is (-2, 9) and the parabola opens downward
  PASS  leading coefficient negative (orientation differs from PT4's parabola)
  PASS  D is the key with its coordinates reversed (the trap)
  PASS  asked target is the y-intercept (PT4 M4.04 asked for the vertex)
== Q16 arc length proportionality ==  ... == Q22 SPR translated line, new x-intercept ==
== Figures ==
  PASS  PT5-M3-Q09.svg exists / well-formed SVG / canvas width 380px / Georgia serif stack
  PASS  Q15 all 65 plotted points satisfy y = -x^2 - 4x + 5 (max err 0.0168)
  PASS  Q15 highest plotted point re-measures to the vertex (-2, 9)
  PASS  Q15 the plotted curve crosses the y-axis exactly once
  PASS  Q15 drawn y-intercept re-measures to (0, 4.994) == the keyed (0, 5)
  PASS  PT5-M3-Q15.svg origin O is italic (house convention across all six figures)
== Trap census (exactly one mechanism per item) ==
  PASS  the three trap-free slots are the E/E/M SPRs at 5, 6, 13
  PASS  all 19 trap mechanisms are distinct
  PASS  Q12 carries the extraneous/nonreal-solution trap (spec section 5 family, 0 before this round)
== Originality firewall (PT4 contexts must not recur) ==

ALL CHECKS PASSED — M3.json verified clean.        [673 assertions, exit 0]
```

### `verify_M4.py`

```
ULTRASAT PT5 - MODULE 4 verification
  questions      : 22 (16 MC / 6 SPR)
  key letters    : {'A': 4, 'B': 4, 'C': 4, 'D': 4}
  SPR answers    : {5: '13', 6: '107', 12: '12', 13: '12.5', 19: '31', 22: '15/2'}
  assertions run : 1226

ALL CHECKS PASSED                                   [exit 0]
```

`verify_M4.py` gained four new check groups this round: `check_prose_lengths` (§7 rationale norms at
±45% and the §2b stem caps), `check_applied_share`, `check_figures` (SVG conventions, the italic origin
glyph, and the Q11 proportionality assertion) and the enumerator set-equality inside `check_accepted`.
`verify_M3.py` gained the ramp-dip assertion, the rebuilt Q10/Q12/Q15 item blocks, the swapped
Q8/Q9 blocks and figure references, the enumerator import, and the same ±45% rationale band.

---

## 3. SPR `acceptedAnswers` after the enumerator pass (12/12)

| Module · Q | Answer | Entries | Complete legal-entry set (canonical first) |
|---|---|---|---|
| M3 Q5 | 11 | 12 | `11, 11/1, 22/2, 33/3, 44/4, 55/5, 66/6, 77/7, 88/8, 99/9, 11.0, 11.00` |
| M3 Q6 | 216 | 6 | `216, 216/1, 432/2, 648/3, 864/4, 216.0` |
| M3 Q12 | **9** | 15 | `9, 9/1, 18/2, 27/3, 36/4, 45/5, 54/6, 63/7, 72/8, 81/9, 90/10, 99/11, 9.0, 9.00, 9.000` |
| M3 Q13 | 15/17 | 9 | `15/17, 30/34, 45/51, 60/68, 75/85, 0.882, ` **`.882`** `, .8823, .8824` |
| M3 Q19 | 201 | 6 | `201, 201/1, 402/2, 603/3, 804/4, 201.0` |
| M3 Q22 | -12 | 12 | `-12, -12/1, -24/2, -36/3, -48/4, -60/5, -72/6, -84/7, -96/8, -108/9, -12.0, -12.00` |
| M4 Q5 | 13 | 12 | `13, 13/1, 26/2, 39/3, 52/4, 65/5, 78/6, 91/7, ` **`104/8, 117/9`** `, 13.0, 13.00` |
| M4 Q6 | **107** | 11 | `107, 107/1, 214/2, 321/3, 428/4, 535/5, 642/6, 749/7, 856/8, 963/9, 107.0` |
| M4 Q12 | 12 | 12 | `12, 12/1, 24/2, 36/3, 48/4, 60/5, 72/6, 84/7, 96/8, ` **`108/9`** `, 12.0, 12.00` |
| M4 Q13 | 12.5 | 6 | `12.5, 25/2, 50/4, 75/6, ` **`100/8`** `, 12.50` |
| M4 Q19 | 31 | 12 | `31, 31/1, 62/2, 93/3, 124/4, 155/5, 186/6, 217/7, 248/8, 279/9, 31.0, 31.00` |
| M4 Q22 | 15/2 | 9 | `15/2, 30/4, 45/6, ` **`60/8, 75/10, 90/12`** `, 7.5, 7.50, ` **`7.500`** |

Bold = an entry the adversarial verifier reported missing. All ten gaps are closed; **122 accepted strings
total**, every one machine-checked to evaluate correctly and to fit the 5-character grid (6 with a minus).
No entry accepts an incorrect value — in particular M3 Q12 accepts 9 and **not** the extraneous candidate 2.

**SPR census (form):** 9 integers (exactly one negative, −12; three-digit engineered values at 216, 201
and 107) · 2 fractions (15/17, 15/2) · 1 terminating decimal (12.5) · **0 multi-root**. The blueprint's
multi-root line is formally retired — measured multi-root frequency is ≈0.6 per form, so zero is authentic.
The entry-forms note now appears on exactly the three non-integer answers (M3 Q13, M4 Q13, M4 Q22).

---

## 4. Key-letter tallies (16 MC per module)

| Module | A | B | C | D | Positions |
|---|---|---|---|---|---|
| M3 | **4** | **4** | **4** | **4** | A: 1, 7, 8, 9 · B: 17, 18, 20, 21 · C: 3, 14, 15, 16 · D: 2, 4, 10, 11 |
| M4 | **4** | **4** | **4** | **4** | A: 1, 11, 16, **18** · B: 2, 3, 10, 17 · C: 4, 9, 14, 15 · D: 7, 8, **20**, 21 |

Both modules land on **4/4/4/4 exactly**, achieved by engineering numbers, never by reordering:

- M3 needed no compensation. Q15's rewrite was engineered so the y-intercept (0, 5) still sorts **third**
  among four ordered pairs ascending by first coordinate; Q10's rebuilt bound pairs still sort the key
  **last** (lower bound, then upper bound, then strictness).
- M4's two rewrites moved in opposite directions and cancel exactly. A1 vacated a **D** and C1 vacated an
  **A**; Q18's new constants were chosen with |slope of k| < 1 so the correct centre coordinate is the
  **smallest** of the four (key **A** = 4), and Q20's area target is the **largest** of the four
  (key **D** = 512) because every named error divides or under-scales. Every numeric option set in the
  form remains strictly ascending (M4 Q8's π-symbolic set is compared on its coefficients), and every
  non-numeric set keeps an explicit ordering rule — M3 Q10's rebuilt set sorts by lower bound, then upper
  bound, then strictness.

---

## 5. Recomputed form statistics

### Applied share — **15/44 ≈ 34.1%** (§2c band 30–35%; blueprint target 15/44)

| Module | Applied slots | Count |
|---|---|---|
| M3 | Q2 orchard · Q6 rainwater cistern · Q7 chess club · Q10 creamery cave · Q11 solar array · Q14 gondola lift · Q18 test plots | 7 / 22 |
| M4 | Q1 parking garage · Q3 weather balloon · Q8 **grain silo** · Q9 textile mill · Q10 museum · Q14 trail crew · Q16 lichen · Q19 courier | 8 / 22 |

Before: 17/44 ≈ 38.6% (M4 Q4 "mass of a substance … experiment" and M4 Q17 "bacteria in a certain
culture" scored as contexts). D1 abstracted both; the recast M4 Q8 keeps a context, so the net move is
exactly −2. Per-domain shares: **PSDA 7/8 = 88% · ALG 5/14 = 36% · GEO 2/8 = 25% · ADV 1/14 = 7%**
(spec §2c reference points: PSDA ~85%, Algebra ~40%, Geometry ~10%, AdvMath ~20%). Both abstracted items
were Advanced Math, so ADV's share fell from 21% to 7% — a direct and intended consequence of D1, which
named exactly those two slots; the form total is now on the blueprint's number.

### Trap tally (form level, exactly one mechanism per item)

| Mechanism | Quota | Delivered | Items |
|---|---|---|---|
| answer-the-wrong-target | ~3 | 3 | M3 Q19 · M4 Q12 · M4 Q22 |
| slope-intercept / role swap | ~2 | 2 | M3 Q8 · M4 Q1 |
| solution-count & parameter hunts | ~2 | 2 | M3 Q17 · M4 Q21 |
| sign-slip bait | ~2 | 2 | M3 Q22 · M4 Q2 |
| percent-multiplier semantics | ~2 | 2 | M3 Q11 · M4 Q13 |
| length-vs-area / similarity exponents | 1 | 1 | M4 Q20 |
| formula-fragment ladder | 1 | 1 | M4 Q8 |
| interpretation mis-mapping menu | ~2 | 2 | M3 Q14 · M4 Q16 |
| exponent-structure conversion | ~1 | 1 | M4 Q17 |
| statistical-robustness reasoning | ~1 | 1 | M3 Q18 |
| must-be / could-be | ~1 | 1 | M3 Q20 |
| **extraneous / nonreal-solution awareness** | ~1 | **1** | **M3 Q12 (was 0)** |
| **function-notation nesting** | ~1 | **1** | **M4 Q6 (was 0)** |
| verbatim-number echo + the remaining adjacent-quantity / reversal / wrong-operation family | pervasive | 20 | the balance of the 40 trap-bearing items |

40 items carry exactly one mechanism; the four trap-free slots are the bare SPRs at M3 Q5, M3 Q6,
M3 Q13 and M4 Q5. Both spec §5 families that had gone to zero are back, and no quota row moved.

### Ramp shape — one honest dip per module

```
M3  E E E E E E E  M | E  M M M M M M M | H H H H H H      (8E / 8M / 6H)
                   ^dip ^straggler
M4  E E E E E E E E  M | E  M M M M M M | H H H H H H      (9E / 7M / 6H)
                     ^dip ^straggler
```

Content, skill, difficulty label and trap are unchanged for every swapped item; only
`originalQuestionNumber` and array position moved. SPR positions are still **5, 6, 12, 13, 19, 22** in
both modules and no SPR was displaced.

### Rationale lengths (§7 norms 110/135/170 MC, 40/100/130 SPR)

| Band | Norm | M3 mean before → after | M4 mean before → after |
|---|---|---|---|
| Easy MC | 110 | 126 → **123** (+12%) | 139 → **129** (+18%) |
| Medium MC | 135 | 157 → **148** (+10%) | 159 → **155** (+15%) |
| Hard MC | 170 | 198 → **191** (+12%) | 205 → **183** (+8%) |
| SPR (E/M/H) | 40 / 100 / 130 | 70 / 138 / 144 → **45 / 111 / 144** | 36 / 85 / 144 → **39 / 85 / 144** |

The form's worst single ratio is **1.41×** (M3 Q16), down from 1.98× (M3 Q6). Seven items were trimmed for
length (M3 Q5, Q6, the triangle item, Q13, Q18; M4's probability item and Q14) and four more shortened as
a by-product of being re-authored (M4 Q4, Q17, Q18, Q20). No derivation step and no dismissal was removed
from any item; every one of the 44 rationales is inside the enforced ±45% band.

### Quota re-confirmation after the swaps and recasts

| Check | Target | Delivered |
|---|---|---|
| Domains (form) | ALG 14 / ADV 14 / PSDA 8 / GEO 8 | 14 (7+7) / 14 (7+7) / 8 (4+4) / 8 (4+4) ✔ |
| Skills, all 19 rows | blueprint list | every row exact (NLF 7 · lin-func 4 · NLE 4 · lin-eq-1var 3 · systems 3 · equiv-expr 3 · lin-eq-2var 2 · ineq 2 · ratios 2 · pct 2 · 1-var data 2 · area-vol 2 · lines-angles 2 · right-tri 2 · circles 2 · 2-var data 1 · prob 1 · inference 0 · ESC 0) ✔ |
| Difficulty mix | M3 8/8/6 · M4 9/7/6 | exact ✔ |
| Format | 16 MC + 6 SPR per module | exact ✔ |
| SPR positions & difficulty | 5, 6, 12, 13, 19, 22 = E/E/M/M/H/H | exact in both modules ✔ |
| Visual quota | 4 per module | M3: dot plot Q7, table Q8, geometry Q9, parabola Q15 · M4: curve Q4, table Q10, geometry Q11, scatter Q16 ✔ |
| Scale note | geometry figures only | M3 Q9 and M4 Q11 only ✔ |
| Probability | M4 only, ×1 | M4 Q10 ✔ |
| Circles | ≥1 per module | M3 Q16, M4 Q18 ✔ |
| Latin binomial | exactly 1 | M4 Q16 ✔ |
| Named people | ≤2 per module | Mateo (M3), Idris (M4) ✔ |
| Stem caps (§2b) | equiv-expr 15 / abstract 35 / applied 55 / stat 75 | 44/44 inside (M4 Q20 44 → **34**; new M4 Q18 33; medians M3 24, M4 23) ✔ |
| Format contract (§8) | plain-text options, no bare `<`/`>` | 0 violations across 128 option strings and 132 passage/text/explanation fields ✔ |
| Liturgy (§7) | openers, letter-order dismissals, "Therefore,", curly apostrophes | 44/44 ✔ |

---

## 6. Originality re-grep for the rewritten content

Every new distinctive phrase and number pipeline was grepped across all eight `outputs/extracted` sources
before shipping:

| Probe | Hits |
|---|---|
| `grain silo` / `silo` | 0 / 0 |
| `x + 4y = 92` · `(12, 20)` · `(8, c)` · `y-coordinate of the center` | 0 · 0 · 0 · 0 |
| `coordinates of the y-intercept` · `y-intercept of this graph` | 0 · 0 |
| `f(g(` · `g(f(` | 0 · 0 |
| `Which of the following points also lies on line` (the collided stem) | present in the sources; **absent from PT5** |

Attested-but-different archetypes confirmed present in the corpus (so the new items sit inside CB's own
repertoire rather than inventing shapes): right-circular-cylinder volume items, "the perimeter of Y is n
times the perimeter of X" similarity items, and a radical-equation SPR whose rationale checks for an
extraneous root. The only incidental lexical overlap is the linear form `x + 4y` (PT4 carries
`x + 4y = −16` inside a solution-count system item) — different constant, different question type,
different pipeline; not a reproduction under the §9.7 scenario/number-set test.

---

## 7. Bottom line

All 12 adjudicated fix items (A1–A3, B1–B2, C1–C3, D1–D2, E1–E2) are applied and nothing else was touched. `verify_M3.py` (673 assertions) and
`verify_M4.py` (1,226 assertions) both re-run clean at exit 0. Both modules end at exactly 4/4/4/4 on key
letters, the applied share is 15/44 ≈ 34%, each module carries one honest ramp dip, all 12 SPR
accepted-entry lists are exhaustive under a shared enumerator that both scripts assert against, the two
spec §5 families that had gone to zero are back at one each, and the rationale overrun is down from
+20–25% per band to +8–18% with no item above 1.41× of its norm.

*Fix round completed 2026-08-14.*
