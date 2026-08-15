# M3 Self-Check — PT4 Math Module 1 (moduleNumber 3) blueprint conformance

Verified programmatically by `verify_M3.py` (ALL CHECKS PASSED after the adjudicated fix round; ~255 assertions:
every key recomputed from givens, every distractor re-derived from its named recipe and shown ≠ key, ascending order,
SPR entry forms incl. full legal-entry enumeration, module quotas, figure files). This document records the human-audit side.

## 1. Slot-by-slot blueprint match (all 22 exact — no deviations)

| # | skill (id) | diff | fmt | visual | archetype delivered | trap (exactly one) | key |
|---|---|---|---|---|---|---|---|
| 1 | linear-equations-one-variable (11) | E | MC | — | bare 2-step solve, 4x + 6 = 38 | verbatim-number echo | B (8) |
| 2 | linear-functions (12) | E | MC | — | pottery studio fee+rate, "which equation represents" | slope/intercept swap | B |
| 3 | equivalent-expressions (18) | E | MC | — | sum of two degree-2 polynomials | sign error | A |
| 4 | ratios-rates-proportions (19) | E | MC | — | rate×amount, seed packets per plot bed | adjacent-quantity (part vs total) | D (60) |
| 5 | linear-equations-two-variables (13) | E | SPR | — | 3a + 2g = 96 recycling drive, given a find g | — | 27 |
| 6 | nonlinear-functions (16) | E | SPR | — | evaluate f(4), f(x) = 3x² − 5x + 9 | — | 37 |
| 7 | one-variable-data (21) | E | MC | HTML table | median of 7 unsorted daily visitor counts | adjacent-quantity (mean/mode/range offered) | C (47) |
| 8 | linear-functions (12) | E | MC | SVG line | line shown → equation y = 2x − 4 | sign-slip grid slope/intercept | C |
| 9 | systems-linear-equations (14) | M | MC | — | ferry adult/child tickets, "which system represents" | reversal — standing trio: swap totals / swap coeffs / both | D |
| 10 | area-volume (26) | E | MC | SVG geometry | volume of 8×6×5 crate (easy straggler per curve) | formula-fragment omission (perimeter/base-area/surface-area ladder) | D (240) |
| 11 | two-variable-data (22) | M | MC | SVG scatter | observed vs predicted at x = 2, 9 dots + fit line | adjacent-quantity (predicted vs observed) | B (6) |
| 12 | linear-equations-one-variable (11) | M | SPR | — | 7(w+3) = 55 → 21(w+3); w = 34/7 non-integer, shortcut ×3 | answer-the-wrong-target | 165 |
| 13 | right-triangles-trigonometry (28) | M | SPR | — | cofunction: sin(p°) = 4/9 → cos(q°), p + q = 90 | — (clean identity per blueprint) | 4/9 |
| 14 | nonlinear-functions (16) | M | MC | — | P(t) = 1,150(0.94)ᵗ, marsh bird *Porzana lutescens* (invented Latin binomial), interpret 1,150 | interpretation mis-mapping menu (4 parallel role-permuted phrases) | A |
| 15 | equivalent-expressions (18) | M | MC | — | (2x+7)(4x−3) ≡ ax²+bx+c, find b | coefficient matching (partial-product distractors) | C (22) |
| 16 | linear-inequalities (15) | M | MC | — | freight elevator, small/large crates, at most 2,400 lb | at-least↔at-most reversal (+ boundary-inclusion & swap slots per blueprint) | A |
| 17 | nonlinear-equations (17) | H | MC | — | √(15−x) = 3−x with extraneous root; Roman I/II set incl. extraneous-only / both / neither | extraneous-solution awareness | A (I only) |
| 18 | nonlinear-equations (17) | H | MC | — | y = c tangent to y = −x²+8x−3 → c = 13 | solution-count parameter hunt | D (13) |
| 19 | nonlinear-functions (16) | H | SPR | — | function-notation nesting: f(x) = x² + 5, g(x) = f(x − 2), composite g(f(3)) = f(12) | function-notation nesting (slip paths give 201 / 261 / 12 / 6) | 149 |
| 20 | percentages (20) | H | MC | — | x is 250% of y, y is 50% of z → x as % of z | percent-multiplier semantics (added / subtracted / reversed-chain distractors) | B (125%) |
| 21 | circles (29) | H | MC | — | (x−6)²+(y+1)²=169 (mixed-sign center), point (6,k), k>0 — figure-less per blueprint | sign-slip on the center coordinates (4 / 6 / 14 from wrong-signed centers; 5-12-13 engineered) | C (12) |
| 22 | systems-linear-equations (14) | H | SPR | — | k for no solution, kx+4y=7 ∥ 6x−10y=9 | sign-slip on negative fraction | -12/5 |

## 2. Quotas (spec §1b–1e)
- **Domains:** Algebra 8 (Q1,2,5,8,9,12,16,22) · Advanced Math 7 (Q3,6,14,15,17,18,19) · PSDA 4 (Q4,7,11,20) · GeoTrig 3 (Q10,13,21). ✔ 8/7/4/3.
- **Skills:** lin-eq-1var 2 · linear-functions 2 · lin-eq-2var 1 · systems 2 · inequalities 1 · nonlinear-functions 3 · nonlinear-equations 2 · equiv-expressions 2 · ratios 1 · percentages 1 · one-var-data 1 · two-var-data 1 · area-volume 1 · right-tri-trig 1 · circles 1 (≥1 per module ✔). No probability (M4-only rule ✔), no evaluating-statistical-claims ✔.
- **Format:** 16 MC + 6 SPR ✔. **Visuals:** 4 — HTML table (Q7), SVG line graph (Q8), SVG geometry fig (Q10, with "Note: Figure not drawn to scale."), SVG scatter (Q11) — matches "M3 = table, line graph, geometry fig, scatter" ✔. Zero histograms/box plots ✔. Hard geometry (Q21) figure-less ✔. Two-variable-data item has its scatter ✔.

## 3. Difficulty curve (9E / 7M / 6H) ✔
E E E E E E E E | M | E(straggler Q10) | M M M M M M | H H H H H H — matches "all-easy through Q7–8, medium at Q9 with easy straggler at Q10, medium band through Q16, hard band Q17–22, Q22 hard." Hard items require the structural insight (checked by dumb-solve test): Q17 both-roots trap survives full solving; Q18 needs discriminant/vertex; Q19 nested function notation (the shift applies to the input of f, not its output); Q20 abstract multiplier chain; Q21 mixed-sign center extraction + root selection; Q22 parallel-slope condition on a negative fraction.

## 4. SPR positions, difficulty, and answer-form census
Positions 5, 6, 12, 13, 19, 22 ✔ · difficulty E, E, M, M, H, H ✔.
| Q | answer | forms accepted (machine-enumerated full legal-entry set) | family |
|---|---|---|---|
| 5 | 27 | 27 + 27/1…243/9 (unreduced) + 27.0, 27.00 — 12 forms | integer (2-digit) |
| 6 | 37 | 37 + 37/1…333/9 + 37.0, 37.00 — 12 forms | integer (2-digit) |
| 12 | 165 | 165 + 165/1…990/6 + 165.0 — 8 forms | integer (3-digit) |
| 13 | 4/9 | 4/9 + 8/18…44/99 (unreduced) + 0.444, .4444 — 13 forms | fraction, lowest terms + decimals ≤5 chars |
| 19 | 149 | 149 + 149/1…894/6 + 149.0 — 8 forms | integer (3-digit, engineered) |
| 22 | -12/5 | -12/5 + -24/10…-96/40 + -2.4, -2.40, -2.400 — 11 forms | REQUIRED negative fraction, ≤6 chars w/ minus ✔ |
acceptedAnswers are now machine-enumerated (`spr_enumerate` in verify_M3.py): every legal ≤5-char (≤6 with minus) equivalent —
unreduced fractions, exact decimals with all zero-paddings, leading-zero/bare-point variants, max-precision truncation + rounding
for repeating values — canonical form always listed first. M3 contribution to the 12-SPR form census: 4 integers (two 3-digit), 2 fractions, 1 negative ✔ (blueprint row targets). Non-integer rationales carry the "Note that … are examples of ways to enter a correct answer." sentence ✔; integer rationales don't ✔.

## 5. Key-letter tally (16 MC)
A ×4 (Q3, Q14, Q16, Q17) · B ×4 (Q1, Q2, Q11, Q20) · C ×4 (Q7, Q8, Q15, Q21) · D ×4 (Q4, Q9, Q10, Q18) = **4/4/4/4 exact**, achieved by engineering the numbers (e.g., Q7 data chosen so median ranks 3rd; Q18 parabola opens downward so c = 13 ranks 4th; Q20 chain chosen so 125% ranks 2nd) — all 9 numeric sets remain strictly ascending (machine-checked), never reordered.

## 6. Trap-per-item list (exactly one mechanism each)
echo (1) · slope/intercept swap (2) · sign error (3) · part-vs-total (4) · stat menu (7) · sign grid (8) · totals/coeff reversal (9) · formula-fragment ladder (10) · predicted-vs-observed (11) · wrong-target (12) · interpretation menu (14) · coefficient matching (15) · at-most reversal (16) · extraneous root (17) · solution-count hunt (18) · function-notation nesting (19) · percent-multiplier (20) · sign-slip on center coordinates (21) · sign-slip negative fraction (22). SPR 5/6/13 trap-free per blueprint. One special set only (Q17 Roman numerals) ✔.

## 7. Stem word counts (prose; caps: equiv-expr ≤15, abstract ≤35, applied ≤55, stat verbal ≤75)
Q1 8 · Q2 43 · Q3 5 · Q4 32 · Q5 51 · Q6 13 · Q7 27 · Q8 18 · Q9 55 · Q10 24 · Q11 66 (stat/scatter, ≤75 cap) · Q12 7 · Q13 31 · Q14 35 · Q15 24 · Q16 48 · Q17 10 · Q18 26 · Q19 17 · Q20 24 · Q21 27 · Q22 21. Median ≈ 25 (target ≈25). All within their caps.

## 8. Voice / format / app-contract audit
- Canonical stems only: "What is the value of…" (7), "Which of the following…"/"Which equation/system/inequality/expression…" (7), "best interpretation… in this context" (Q14 exact wording), "In the xy-plane…" (Q18), "What is the solution to the given equation?" (Q1), "What are all values of x that satisfy…" (Q17). Zero imperatives, zero "you", zero double questions, no exclamation points.
- Constants declared ("where c is a constant", "where a, b, and c are constants", "k is a constant"); trailing where-clauses define all applied variables; units comma-interpolated ("the volume, in cubic feet, of the crate"); thousands commas (1,150 · 1,900 · 2,400).
- Options plain text (machine-checked: no HTML tags); Unicode ² ⁴ ≤ ≥ % only; ASCII hyphen minus in options; system options use the app's established "eq1 and eq2" single-line join; displayed equations in centered divs; Q7 table full-bordered with bold headers and lead-in sentence; no LaTeX anywhere.
- Rationale liturgy: every MC opens "Choice K is correct.", uses "It’s given that…", gerund + "yields …, or …", closes derivation with "Therefore, … is …", dismisses per-choice in letter order with the fixed formulas ("…is incorrect and may result from…", "This is the [other quantity], not the [asked quantity].", alternate-world sentences on the three which-equation/system/inequality items, verification-fail inside Q17). SPR uses "The correct answer is …" with no dismissals.
- Names/contexts: 1 named person (Nadia — under the ≤2 cap), diverse; invented Latin binomial *Porzana lutescens* on Q14 per blueprint; contexts all distinct (pottery studio, community garden, recycling drive, nature center, ferry, storage crate, greenhouse, wetland preserve, freight elevator); no context or number set reproduced from any source PDF (authored from the abstracted spec only; uploads/extracted never opened).
- Figures: ~380px-class serif SVGs; italic x/y at arrowed axis tips + italic O on the abstract grid (Q8); titled roman axes with units in parentheses on the scatter (Q11); minimal line art with dashed hidden edges and centered "Note: Figure not drawn to scale." on the geometry figure only (Q10); gridlines #cccccc; black line/dots; alt text present on all three.

## 9. Deviations from blueprint
**None.**
