# Adversarial Verification Report — Practice Test 5, Math Modules 3 & 4

**Verifier:** independent re-derivation from item text only. Writer verify scripts (`verify_M3.py`, `verify_M4.py`) and self-check notes (`M3_selfcheck.md`, `M4_selfcheck.md`) were **not read or executed** — every answer, distractor, explanation step, figure coordinate, and schema field below was re-derived from scratch.

**Method:**
- 70 independent sympy assertions covering every key, every numeric distractor derivation, and every arithmetic claim inside every explanation (`0 failures`).
- Full re-enumeration of the legal SPR entry space (all `n·k/k` unreduced fractions and all zero-padded decimals that fit the 5-character / 6-with-minus grid) for each of the 12 user-input items, compared set-wise against `acceptedAnswers`.
- All 6 SVGs parsed as XML; the data→pixel affine map recovered from tick-label text nodes alone, then every plotted primitive (65-point parabola polyline, 21-point decay polyline, 24 dot-plot circles, 10 scatter circles, 2 triangle paths) re-projected into data space and compared with the stem.
- Rasterized all 6 figures at 2× via cairosvg and inspected visually for label collision / mislabeling.
- Schema, subcategory-pair, option-content, and HTML-escaping sweep over all 44 items.

**Headline: 0 BLOCKER, 0 MAJOR, 7 MINOR, 37 OK.** Every keyed answer is correct and unique; every non-keyed option is definitively wrong; every explanation step is arithmetically true; every figure matches its stem exactly.

---

## 1. Verdict table (44 rows)

| Item | Verdict | Finding |
|---|---|---|
| M3.Q1 | OK | 4x = 28 → x = 7; key A. Distractors 12/13/28 all non-solutions. |
| M3.Q2 | OK | 96/4 = 24; 24·7 = 168; key D. Options strictly ascending. |
| M3.Q3 | OK | (2x⁵)(9x³) = 18x⁸; key C. No distractor equals key under any exponent law. |
| M3.Q4 | OK | 3·5² = 75; key D. 5(3)² = 45 confirms distractor C's stated derivation. |
| M3.Q5 | OK | 6x − 19 = 47 → x = 11. All 12 SPR forms valid; enumeration complete (no ≤5-char form missing). |
| M3.Q6 | OK | 9·4·6 = 216. All 6 SPR forms valid; enumeration complete. |
| M3.Q7 | OK | SVG dot stacks = 3/5/7/4/3/2 over 2–7, total 24 (matches passage); exactly 4 above 5; key A. |
| M3.Q8 | OK | Isosceles: 80 + 2x = 180 → x = 50; key A. Figure labels verified against vertex positions. |
| M3.Q9 | OK | m = −3/2, b = 22; all 4 table rows satisfy f(x) = −(3/2)x + 22; key A. |
| M3.Q10 | OK | Both endpoints attained → only 47 ≤ t ≤ 55 holds for all t; key D. |
| M3.Q11 | OK | 52/0.04 = 1,300 exactly; key D. 4% of 1,300 = 52 confirms consistency. |
| M3.Q12 | OK | (x−12)(x−15) = 0; **both** roots and all 24 legal forms present; enumeration complete. |
| M3.Q13 | **MINOR** | Key 15/17 correct; all 8 accepted forms valid. `.882` (leading-zero-dropped twin of the accepted `0.882`) is absent — see §3.1. |
| M3.Q14 | OK | R(t+1) = 1.08·R(t) → +8%/yr; key C. 108% ↔ 2.08 and −8% ↔ 0.92 both verified. |
| M3.Q15 | OK | Polyline re-projects to y = x²−6x+5 (max err 0.012); vertex vertex point is exactly (3,−4); key C. |
| M3.Q16 | OK | (45/360)·2πr = 18π → r = 72; key C. 180°-slip gives exactly 36 as claimed. |
| M3.Q17 | OK | 3a = 6 → a = 2; a = 2 makes the equations identical multiples; key B. |
| M3.Q18 | OK | Mean +15/15 = +1; 8th-of-15 median unchanged (holds even with ties at 32); key B unique. |
| M3.Q19 | OK | a = 3, b = 6, f(7) = 147+42+12 = 201. All 6 SPR forms valid; enumeration complete. |
| M3.Q20 | OK | RHS = 7x+6 → (k−7)x = −3; only k = 7 kills the solution; key B. k = 5/12/17 each verified to give one solution. |
| M3.Q21 | OK | b²−4ac = 196−40 = 156; (14+√156)/4 verified to satisfy the equation; q = 156 unique; key B. |
| M3.Q22 | OK | y = (3/4)x + 9 → x-int −12 (confirmed by the substitution method too). All 12 SPR forms valid and complete. |
| M4.Q1 | OK | y = 3x + 4; key A. 7x and 12x derivations both reproduce. |
| M4.Q2 | OK | 18x+12−8x+20 = 10x+32; key B. All three distractor derivations reproduce exactly. |
| M4.Q3 | OK | 300·60/1000 = 18 km/h; key B. |
| M4.Q4 | OK | Curve re-projects to 640·(1/2)^t (max err 0.13 g); (2,160) exact; key C. Distractors are the t=3 and t=1 values, confirmed. |
| M4.Q5 | **MINOR** | Key 13 correct, all listed forms valid — but `104/8` and `117/9` (both ≤5 chars, both = 13) are missing. See §3.2. |
| M4.Q6 | **MINOR** | Key 82 correct — `492/6`, `574/7`, `656/8`, `738/9` missing. See §3.2. |
| M4.Q7 | OK | x = 8, y = 52; key D. Distractors are x, 5x, 6x, all confirmed. |
| M4.Q8 | OK | 9³ = 729; key D. 4·9 = 36, 9² = 81, 6·81 = 486 all confirm the formula-fragment ladder. |
| M4.Q9 | OK | Table internally consistent (all 6 margin sums check). 45/150 = 3/10; key B. |
| M4.Q10 | OK | 12x + 300 = 960 → x = 55; key C. Coefficient-swap gives exactly 39. |
| M4.Q11 | **MINOR** | Math correct (7-24-25, cos A = 7/25, key A). Drawing scale varies ~3× across the three labeled sides. See §3.3. |
| M4.Q12 | **MINOR** | Key 12 correct (x = 7, y = 5 verified in both equations) — `108/9` missing. See §3.2. |
| M4.Q13 | **MINOR** | Key 12.5 correct — `100/8` missing. See §3.2. |
| M4.Q14 | OK | "at least" → ≥, "at most" → ≤; key C. Feasible region non-empty (x=25, y=0 satisfies both). |
| M4.Q15 | OK | w = (3v/x)² = 9v²/x²; key C. No distractor is identically equal to the key. |
| M4.Q16 | OK | 10 scatter points re-project to a clean line (OLS R² = 0.9967, increments non-accelerating); key A. |
| M4.Q17 | OK | 3(m/60) = m/20; key B. Exponents m/60 < m/20 < 3m < 180m — strictly ascending. |
| M4.Q18 | OK | Radius slope −4/3, tangent 3/4, (9,6) on k; other three verified **not** on k; key D. |
| M4.Q19 | OK | 8.50 + 1.25(w−1) = 46 → w = 31 (whole number, as stipulated). SPR enumeration complete. |
| M4.Q20 | OK | k = 3 → area factor 9; 252/9 = 28; key A. |
| M4.Q21 | OK | x² = 7 or x² = 1 → 4 distinct real roots (sympy solveset confirms cardinality 4); key D. |
| M4.Q22 | **MINOR** | Key 15/2 correct (a = 3/2, b = 5, identity verified) — `60/8`, `75/10`, `90/12`, `7.500` missing. See §3.2. |

**Counts — BLOCKER 0 · MAJOR 0 · MINOR 7 · OK 37.**

---

## 2. Global sweeps — all clean

| Check | Result |
|---|---|
| `questionType` legal | 44/44 (`multiple-choice` ×32, `user-input` ×12) |
| MC has exactly 4 options; SPR has `[]` | 44/44 |
| `correctAnswer` type (int 0–3 for MC, string for SPR) | 44/44 |
| SPR `correctAnswer` ∈ `acceptedAnswers` | 12/12 |
| `difficulty` ∈ {easy, medium, hard} | 44/44 (M3 8/8/6, M4 9/7/6) |
| `subcategory`/`subcategoryId` pair matches the canonical map | 44/44 |
| No duplicate options within an item | 32/32 |
| Numeric option sets strictly ascending | 20/20 (verified as exact rationals, incl. 3/10 < 18 < 180 < 18000 and 7/25 < 24/25 < 24/7 < 25/7) |
| Non-numeric option sets in a defensible order | 12/12 (by slope, by coefficient-then-constant, by exponent magnitude, by x-then-y, by strictness, standard 2×2 menus) |
| No HTML tags in options | 32/32 |
| No HTML entities in options | 32/32 |
| No `$` / LaTeX in options | 32/32 |
| ASCII hyphen used as minus in options (no U+2212/U+2013/U+2010) | 32/32 |
| **Bare unescaped `<` or `>` in passage/text/explanation** | **0 occurrences across all 44 items** — the truncation hazard is not present anywhere |
| HTML entities in passage/text/explanation | 0 (nothing needs escaping) |
| Passage/text tag inventory vs DOMPurify default allow-list | Only `p, div, span, sup, table, thead, tbody, tr, th, td, i` — all safe |
| SPR entry length ≤5 chars (≤6 with leading minus) | 0 violations across 116 accepted strings |
| Every string in every `acceptedAnswers` evaluates to a correct value | 116/116 |
| SVG well-formed XML | 6/6 |
| SVG `width` = 380 | 6/6 |
| "Note: Figure not drawn to scale." | Present on exactly the 2 geometry figures (M3.Q08, M4.Q11); **absent from all 4 coordinate grids** — correct |
| `graphDescription` present without `graphAsset` | 0 |
| Item text references a figure with no asset attached | 0 (M3.Q9 says "table shows" but carries an inline HTML `<table>`) |
| "where"-clauses define every introduced symbol | 44/44 (a, b, k, p, q, t, m, v, w, x, y all bound) |
| Units internally consistent | 44/44 (feet→ft³, inches→in³, m/min→km/h with the factor supplied, hours↔minutes, kg, $, yd, mm/yr) |

### 2.1 `$` occurrences are currency, not LaTeX
`$` appears only in M4.Q1 ("$4", "$3"), M4.Q14 ("$1,000", "$28", "$45"), and M4.Q19 ("$8.50", "$1.25", "$46") — all inside `text`/`explanation`, all genuine dollar signs required by the stem. **Zero `$` inside any option string.** Not a finding.

### 2.2 Bare `<` inside options (M3.Q10) — checked, safe
M3.Q10's options carry literal `<`: `47 < t < 55`, `47 < t ≤ 55`, `47 ≤ t < 55`. Every one of the four `<` characters is followed by a **space**, so an HTML parser cannot read it as a tag open and renders it literally. Since the spec forbids entities inside options, this is the only legal encoding and it is correct as written. No verdict.

---

## 3. Detailed findings (all MINOR)

### 3.1 M3.Q13 — MINOR: `.882` missing from `acceptedAnswers`

**Independent derivation.** Right triangle ABC, ∠B = 90°, so AC is the hypotenuse. AC² = 8² + 15² = 64 + 225 = 289 → AC = 17. ∠A = a°; the leg opposite ∠A is BC = 15. sin(a°) = 15/17 = 0.8823529411… ✔ key correct, stem fully determined, no figure needed.

**Accepted list audit (all 8 verified correct):** `15/17`, `30/34`, `45/51`, `60/68`, `75/85` (the complete set of unreduced 15k/17k forms fitting 5 characters — 90/102 is 6 chars, correctly excluded), plus `0.882` (round/truncate at the 3rd decimal, 5 chars), `.8823` (truncate at the 4th), `.8824` (round at the 4th). All three decimal conventions the College Board publishes are covered.

**Gap.** `.882` (4 chars) is the same value as the accepted `0.882` but with the leading zero dropped — the same stylistic choice the item already blesses for `.8823`/`.8824`. Accepting `0.882` but rejecting `.882` is internally inconsistent, and dropping the leading zero is a common student habit on this grid. **Fix:** add `.882`.

Not a BLOCKER: the three canonical entry forms named in the item's own closing note (`15/17`, `.8824`, `0.882`) are all present.

### 3.2 M4.Q5, Q6, Q12, Q13, Q22 — MINOR: unreduced-fraction enumeration truncated

M3 enumerates the unreduced-fraction space **exhaustively** to the 5-character limit; M4 stops early on five items. All listed strings are correct — nothing accepted is wrong — but these grid-legal entries would be marked incorrect by a string-matching grader:

| Item | Value | Missing grid-legal forms |
|---|---|---|
| M4.Q5 | 13 | `104/8`, `117/9` |
| M4.Q6 | 82 | `492/6`, `574/7`, `656/8`, `738/9` |
| M4.Q12 | 12 | `108/9` *(M3.Q12, same value 12, does include it)* |
| M4.Q13 | 12.5 | `100/8` |
| M4.Q22 | 15/2 | `60/8`, `75/10`, `90/12`, `7.500` |

Kept at MINOR because no *plausible* student entry is missing: the reduced fraction, the integer/decimal, and the low-multiplier fractions are all present on every item, and the closing "Note that … are examples" sentences name only forms that are in the list. The defect is a consistency/robustness gap between the two writers, not a scoring hazard for a realistic test-taker. (If the delivery engine normalizes numerically instead of string-matching, this is fully moot.)

**M4.Q22 derivation, for the record:** a(4x+6) + b(x−3) = (4a+b)x + (6a−3b) ≡ 11x − 6 → 4a+b = 11 and 6a−3b = −6 ⇒ 2a−b = −2 ⇒ 6a = 9 ⇒ a = 3/2, b = 5. Identity re-checked by expansion: (3/2)(4x+6) + 5(x−3) = 6x+9+5x−15 = 11x−6 ✔. ab = 15/2 = 7.5 ✔.

### 3.3 M4.Q11 — MINOR: drawing scale varies ~3× across the labeled sides

**Independent figure parse.** Path `M 90 250 L 230 250 L 90 90 Z`; label anchors place A at (230,250), B at (90,90), C at (90,250). The right-angle square is drawn at C ✔ (matches "right angle at vertex C"). `7` sits under segment C→A, `24` sits left of segment C→B, `25` sits outside the hypotenuse B→A. So AC = 7, BC = 24, AB = 25, and 7² + 24² = 49 + 576 = 625 = 25² ✔. cos A = adjacent/hypotenuse = AC/AB = 7/25 ✔ key A. Distractors sin A = 24/25, tan A = 24/7, sec A = 25/7 are each correct as labeled and none equals 7/25.

**Nit.** Drawn pixel lengths are CA = 140 px (label 7 → 20 px/unit), CB = 160 px (label 24 → 6.7 px/unit), AB = 212.6 px (label 25 → 8.5 px/unit). The two legs are drawn nearly equal though they differ by a factor of 3.4. This is *legal* — the figure carries "Note: Figure not drawn to scale." — and it cannot mislead toward a wrong option here because all three side lengths are given numerically and the relative ordering (AB longest, CB > CA) is preserved. Still, it is visually further off than the released-item norm. Cosmetic only.

*(For comparison, M3.Q08 is much closer: drawn ∠A ≈ 70.4° vs labeled 80°, drawn base angles ≈ 54.8° vs labeled 50°, ordering preserved. Within normal tolerance for a noted figure — no verdict.)*

---

## 4. Figure verification detail (all 6 confirmed consistent)

Affine maps were recovered **only** from tick-label text nodes, then applied to the plotted primitives.

**M3.Q07** — dot plot. x-map from the y=190 label row: px = 60 + 36·(games). Stacks re-projected: **3 dots over 2, 5 over 3, 7 over 4, 4 over 5, 3 over 6, 2 over 7**; total **24**, exactly matching "the 24 members" in the passage. Every stack is contiguous from the baseline y=156 in uniform 15 px steps (no floating/gapped dots). Answer "exactly 5 games" → 4 ✔. Distractor 9 = 4+3+2 ("5 or more") ✔ and 15 = 3+5+7 ("fewer than 5") ✔ — both dismissal reasons are literally true of this figure. No scale note on this plot ✔.

**M3.Q08** — triangle. A (190,44) top, B (80,200) lower-left, C (300,200) lower-right. Tick marks land exactly on the midpoints of AB (135,122) and AC (245,122) ✔, marking the two congruent sides. `80°` is placed inside the A-vertex region, `x°` inside the B-vertex region ✔. Consistent with AB = AC and the stem.

**M3.Q15** — parabola. x: px = 112 + 26·X; y: py = 180 − 26·Y (both recovered from labels, both exact for all 16 labeled ticks). All 65 polyline vertices re-project onto **y = x² − 6x + 5** with max error 0.012 in data units. Lowest plotted point is exactly (190, 284) → **(3, −4)** ✔ key. Curve crosses y = 0 at x ≈ 1.02 and 4.98 (i.e. roots 1 and 5) and hits y ≈ 4.79 at x = 0.035, i.e. the y-intercept (0, 5) — so distractor B "(0,5) is the y-intercept" and D "(5,0) is an x-intercept" are both truthful descriptions of the drawn graph, exactly as the explanation claims. No scale note ✔.

**M3.Q04 / M4.Q04** — decay curve. x: px = 60 + 48·t; y: py = 300 − 0.375·mass. All 21 vertices re-project onto **640·(1/2)^t** with max error 0.13 g. Integer-hour readings: (0,640) (1,320) **(2,160)** (3,80) (4,40) (5,20) ✔. Key 160 ✔; distractor 80 is genuinely the t=3 value and 320 genuinely the t=1 value, matching both dismissals. No scale note ✔.

**M4.Q11** — see §3.3.

**M4.Q16** — scatterplot. x: px = 60 + 4.8·age; y: py = 300 − 6·diameter. The 10 dots re-project to exactly (5,5) (10,9) (15,11) (20,15) (25,17) (30,21) (35,24) (40,26) (45,30) (50,32) — **10 points, matching "10 lichens."** OLS: diameter ≈ 0.601·age + 2.47, **R² = 0.9967**, max residual 0.53 mm, strictly increasing. Successive 5-year increments are 4,2,4,2,4,3,2,4,2 — flat, **not** accelerating, so the explanation's "increases by approximately the same amount for each 5-year increase" and "don't curve upward" are both literally true of the plotted data. "Increasing linear" is the only defensible option ✔. No scale note ✔.

---

## 5. "Exactly one defensible option" audit (must-be-true / count / model-choice items)

| Item | Confirmation |
|---|---|
| M3.Q10 (compound inequality) | 47 and 55 are both *stated as recorded*, so A, B, C each fail on a real data value; D holds for every t. Unique. |
| M3.Q17 (infinitely many solutions) | a = 2 makes eq.2 exactly (1/3)·eq.1. a = −2, 6, 18 each give a distinct, non-proportional line. Unique. |
| M3.Q18 (mean vs median) | Mean must rise (sum +15 over fixed n = 15). Median is the 8th of 15 and only the 15th entry moved — unchanged **even under ties at 32**. Only B. |
| M3.Q20 (CANNOT be k) | (k−7)x = −3 has exactly one solution ⟺ k ≠ 7. k = 5, 12, 17 each verified solvable. Only B. |
| M3.Q14 (interpret 1.08) | R(t+1) = 1.08·R(t) is +8%; 108% ⇒ 2.08; −8% ⇒ 0.92; "8 riders" is additive. Only C. |
| M4.Q14 (system of inequalities) | "at least" ⇒ ≥, "at most" ⇒ ≤; only C. Region non-empty (25, 0), so the situation is realizable. |
| M4.Q16 (model choice) | R² = 0.997 linear, non-accelerating increments, strictly increasing. Only A. |
| M4.Q21 (solution count) | \|x²−4\| = 3 ⇒ x² ∈ {7, 1} ⇒ {±√7, ±1}, four distinct reals. Only D ("More than two"). |
| M4.Q18 (point on tangent) | Line k: y = 3 + (3/4)(x−5). (9,6) satisfies it; (8,−1), (8,7), (9,0) each verified **off** the line. Unique. |
| M3.Q21 (radicand match) | (14 − √156)/4 cannot be written as (14 + √q)/4 for real q, so q = 156 is the only value. Unique. |

---

## 6. Non-item observations (no verdict assigned)

1. **Module header mismatch.** `M3.json` has `moduleNumber: 3`, `title: "Exam 5, Module 3"`, but `description: "Practice Test 5 - Math, Module 1 (22 questions)"`. `M4.json` mirrors this (`moduleNumber: 4` / "Module 4" / "Module 2"). Almost certainly intentional (math module 1-of-2 and 2-of-2), but the two fields read as contradictory. Worth confirming against how the app renders `description`.
2. **`_distractorLogic` convention differs between writers.** M3 keys the object by the three *non-key* letters only; M4 includes the key letter with a `"KEY — …"` value (M4.Q1, Q2, Q3, Q4, Q7, Q8, Q9, Q10, Q11, Q14, Q15, Q16, Q17, Q18, Q20, Q21). Underscore-prefixed metadata, so no rendering impact — but a downstream consumer that assumes "3 entries = 3 distractors" would break on M4.
3. **Identical SPR placement in both modules** (Q5, Q6, Q12, Q13, Q19, Q22 in each). Structurally fine; flagged only in case position variety across forms is desired.
4. **M3.Q05 / M4.Q19 subcategory choice.** Both are tagged `linear-functions` (12) though they read as one-variable solves; this matches College Board's own domain assignment for "for what value of x does f(x) = c" and tiered-fee items. No change recommended.
5. **Unicode superscripts in options** (M3.Q3 `18x⁸`; M4.Q17 `900(1.15)ᵐ⁄²⁰`, using U+1D50 and U+2044). Required by the "no HTML in options" rule and rendered correctly in the Georgia stack, but M4.Q17's stacked modifier-letter exponent is the least legible string on the test. Worth a spot-check in the live renderer at mobile font sizes.

---

## 7. Bottom line

**Ship-blocking issues: none.** All 44 keys are correct and uniquely defensible, all 96 distractors are definitively wrong and correctly diagnosed by their dismissal text, all 116 accepted SPR strings evaluate correctly and fit the grid, all 6 figures are numerically faithful to their stems, and there is not a single unescaped `<` anywhere in passage, text, or explanation. The 7 MINOR findings are (a) one leading-zero decimal variant on M3.Q13, (b) a truncated unreduced-fraction enumeration on five M4 SPR items, and (c) one out-of-proportion (but correctly noted) geometry drawing on M4.Q11. All three are safe to fix post-hoc or defer.
