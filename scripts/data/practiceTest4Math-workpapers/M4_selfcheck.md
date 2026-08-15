# M4 Self-Check — Practice Test 4, Math Module 2 (moduleNumber 4)

Verification: `verify_M4.py` → **RESULT: ALL CHECKS PASSED** after the adjudicated fix round (sympy recomputation of every key,
every named distractor recipe rebuilt and confirmed ≠ key, MC ordering, SPR entry rules incl. full legal-entry enumeration,
SVG XML well-formedness incl. the restored x = 5 gridline on M4-Q04).

## 1. Blueprint conformance, slot by slot

| # | skill (id) | diff | fmt | visual | archetype delivered | trap delivered | key |
|---|---|---|---|---|---|---|---|
| 1 | linear-functions (12) | E | MC | — | invert defined f: f(x)=31 → x | adjacent-quantity (x vs f(x)) | A |
| 2 | ratios-rates-proportions (19) | E | MC | — | conversion w/ GIVEN factors (furlong→yd→ft, horse-farm track) | scale/unit slip (partial conversion) | D |
| 3 | lines-angles-triangles (27) | E | MC | M4-Q03.svg | parallel lines + transversal, find x | adjacent-quantity (supplement vs the angle) | B |
| 4 | nonlinear-functions (16) | E | MC | M4-Q04.svg | parabola shown → read vertex | ordered-pair reversal | C |
| 5 | linear-equations-one-variable (11) | E | SPR | — | 2-step solve (9x − 7 = 47) | — | 6 |
| 6 | linear-functions (12) | E | SPR | — | evaluate f(7) for f(x) = 8x − 3 | — | 53 |
| 7 | systems-linear-equations (14) | E | MC | — | simple system, one eq already y=…; value choices | adjacent-quantity (x, y offered for x+y) | C |
| 8 | equivalent-expressions (18) | E | MC | — | distribute monomial × binomial | wrong-operation on exponents | C |
| 9 | probability (23) | M | MC | HTML two-way table | conditional prob from table (library format × age) | wrong-denominator + transposed conditional | D |
| 10 | linear-equations-two-variables (13) | M | MC | — | applied 3s + 7b = 132, given b find s (kiln glazing; b renamed from g in fix round) | reversal (coefficient roles; swap gives clean 15) | B |
| 11 | nonlinear-functions (16) | M | MC | — | "increases 6% every 4 years → which function" (tree canopy) | exponent-structure conversion (t/4 vs t vs 4t vs 1.24) | A |
| 12 | linear-equations-two-variables (13) | M | SPR | — | line through (3,10), (7,2) → x-intercept | — | 8 |
| 13 | area-volume (26) | M | SPR | — | square banners, sides ×4 → area ×k | length-vs-area scale (k=4 tempting) | 16 |
| 14 | inference-statistics (24) | M | MC | — | MoE interpretation (bus-route survey, n = 1,100, 62% ± 3%; MoE ≈ 1/√n consistent) | canonical MoE menu | A |
| 15 | linear-inequalities (15) | M | MC | — | system: min quantity + budget cap (robotics kits/motors) | boundary strict/inclusive | A |
| 16 | two-variable-data (22) | M | MC | M4-Q16.svg | best-fit slope interpretation (used bicycles, decreasing) | slope↔intercept mis-mapping menu | D |
| 17 | nonlinear-equations (17) | H | MC | — | no real solutions → least integer k | discriminant hunt; **trap integer 8 sits exactly at disc = 0** | C |
| 18 | lines-angles-triangles (27) | H | MC | — | similarity sufficiency, verbal, no figure | similar-vs-congruent gap | D |
| 19 | nonlinear-functions (16) | H | SPR | — | rewrite 6(3)⁴ˣ = a(b)ˣ → ab | exponent-structure (power of a power) | 486 |
| 20 | circles (29) | H | MC | — | complete the square → radius | r² vs r slip | B |
| 21 | nonlinear-equations (17) | H | MC | — | linear–nonlinear system, x = p ± √q, find q | step-skip (discriminant 28 undivided) | B |
| 22 | nonlinear-functions (16) | H | SPR | — | two conditions constrain a, b → maximum value | wrong-target composite | 49/8 |

Every column of the MODULE 4 blueprint table is met. **No deviations.**

## 2. Quotas

- Format: 16 MC + 6 SPR; SPR at 5, 6, 12, 13, 19, 22 (E, E, M, M, H, H). ✓
- Difficulty: 8 E (Q1–8) / 8 M (Q9–16) / 6 H (Q17–22); monotone ramp, Q22 hard. ✓
- Domains: Algebra 7 (Q1, 5, 6, 7, 10, 12, 15) · Advanced Math 7 (Q4, 8, 11, 17, 19, 21, 22) ·
  PSDA 4 (Q2, 9, 14, 16) · Geometry/Trig 4 (Q3, 13, 18, 20). ✓ (7/7/4/4 per blueprint)
- Skills: nonlinear-functions 4, linear-functions 2, nonlinear-equations 2, lin-eq-1var 1,
  lin-eq-2var 2, systems 1, equiv-expr 1, linear-inequalities 1, ratios 1, two-var-data 1,
  probability 1 (M4 only ✓), inference 1, area-volume 1, lines-angles-triangles 2, circles 1 (≥1 ✓). ✓
- Visuals: 4 = geometry figure (Q3, with "Note: Figure not drawn to scale."), parabola grid (Q4,
  gridlines #cccccc, arrowed axes, italic x/y, O), HTML two-way table w/ Total row+column (Q9),
  scatter + fit line (Q16, axis titles with units). Hard geometry (Q18) figure-less. ✓

## 3. Key-letter tally (16 MC)

A: Q1, Q11, Q14, Q15 = **4** · B: Q3, Q10, Q20, Q21 = **4** · C: Q4, Q7, Q8, Q17 = **4** ·
D: Q2, Q9, Q16, Q18 = **4**. Flat 4/4/4/4, achieved by number choice under honest ascending order
(numeric sets ascending: Q1, 2, 3, 7, 9, 10, 17, 20, 21; Q4 ordered pairs ascend by x; Q8/Q11/Q15
equation/expression sets in template order; Q14/Q16/Q18 verbal).

## 4. SPR answers and entry forms

| # | answer | acceptedAnswers (machine-enumerated full legal-entry set) | form family |
|---|---|---|---|
| 5 | 6 | 6 + 6/1…96/16 (unreduced) + 6.0, 6.00, 6.000 — 20 forms | integer |
| 6 | 53 | 53 + 53/1…477/9 + 53.0, 53.00 — 12 forms | integer |
| 12 | 8 | 8 + 8/1…96/12 + 8.0, 8.00, 8.000 — 16 forms | integer |
| 13 | 16 | 16 + 16/1…144/9 + 16.0, 16.00 — 12 forms | integer (perfect square) |
| 19 | 486 | 486 + 486/1, 972/2 + 486.0 — 4 forms | integer, 3-digit engineered (6 × 3⁴) |
| 22 | 49/8 | 49/8 + 98/16 + 6.125 — 3 forms | fraction lowest terms + exact terminating decimal; rationale carries the "Note that …" entry-forms sentence |

acceptedAnswers are now machine-enumerated (`spr_enumerate` in verify_M4.py): every legal ≤5-char (≤6 with minus)
equivalent entry — unreduced fractions, exact decimals with all zero-paddings — canonical form always listed first.
All entries ≤5 chars (no negatives in M4; the form's single negative lives in M3 Q22).
Per-slot blueprint note satisfied for each (5 integers incl. one 3-digit; 1 fraction).

## 5. Trap-per-item audit (exactly one mechanism each)

Q1 adjacent-quantity · Q2 scale/unit slip · Q3 adjacent-quantity (supplement) · Q4 reversal (ordered pair) ·
Q7 adjacent-quantity · Q8 wrong-operation (exponents) · Q9 wrong-denominator/transposed menu ·
Q10 reversal (coefficients) · Q11 exponent-structure (t/n) · Q13 length-vs-area scale ·
Q14 MoE misconception menu (distractors = impossibility, exact-value, equal-likelihood; accuracy-claim
is the omitted fourth) · Q15 boundary strict/inclusive · Q16 interpretation mis-mapping ·
Q17 solution-count boundary-integer · Q18 sufficiency meta-reasoning · Q19 exponent-structure ·
Q20 r²-vs-r slip · Q21 step-skip · Q22 wrong-target composite. SPR Q5/Q6/Q12 trap-free easy/medium solves.
(Q11 and Q19 both exponent-structure by explicit blueprint assignment.)

## 6. Stem lengths (prose words, math tokens inflate the crude count)

Q1 15 · Q2 24 · Q3 16 · Q4 21 · Q5 9 · Q6 14 · Q7 22 · Q8 7 (equiv-expr ≤15 ✓) · Q9 ~51 ·
Q10 ~48 · Q11 49 · Q12 20 · Q13 36 · Q14 60 (≤75 ✓) · Q15 52 · Q16 47 · Q17 26 · Q18 49 (verbal
geometry) · Q19 ~28 · Q20 23 · Q21 ~33 · Q22 ~31. All within §2b caps; median ≈ 27.

## 7. Style/format contract spot-checks

- Options plain text only; Unicode superscripts audited (Q11: ᵗ U+1D57, ⁄ U+2044, ⁴ U+2074; Q8: ⁵ ⁶ ²;
  Q20: √). ASCII hyphens as minus in options.
- Displayed equations in centered divs; Q7/Q21 systems as two stacked divs; Q9 table full-bordered,
  inline-styled, Total row + Total column, lead-in sentence.
- Rationale liturgy: MC open "Choice X is correct.", "It's given that …" (curly apostrophe),
  gerund + "yields …, or …" chains, "Therefore, …", per-choice dismissals in letter order with named
  errors / "This is the …, not the …" identifications; interpretation items (Q11, Q16) use
  alternate-world dismissals; SPR open "The correct answer is …", Q22 ends with entry-forms note.
- Named people: 0 in M4 (artist, researcher, club — generic; ≤2 allowed). No Latin binomial (M3 carries it).
- Context seeds honored with no M3 collisions: horse-farm track, library survey, kiln glazing,
  tree canopy, square banners, bus-route survey, robotics club, used bicycles.
- Q17 boundary engineering: disc(k) = 64 − 8k → zero exactly at trap integer k = 8; key 9.
- Q20 even-coefficient engineering: −10/+4 halve cleanly to 5/2; 7 + 25 + 4 = 36 → radius collapses to 6.
