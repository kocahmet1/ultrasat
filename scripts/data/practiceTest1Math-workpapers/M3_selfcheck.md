# M3 Self-Check — PT1 Math Module 1 (moduleNumber 3) blueprint conformance

All 22 items authored to `docs/analysis/PT1_math_blueprint.md` (Module 3 table) under
`docs/CB_Math_Style_Spec.md` and the B-playbook. Machine checks were run in-session (JSON parse,
key recomputation via sympy, ascending options, SPR enumeration, letter tally, word counts,
firewall probes) — all passed; details below.

## 1. Slot-by-slot blueprint match (all 22 slots delivered as assigned)

| # | skill (id) | diff | fmt | visual | archetype delivered | trap (exactly one) | key |
|---|---|---|---|---|---|---|---|
| 1 | linear-equations-one-variable (11) | E | MC | — | bare 2-step solve with subtracted constant, 2x − 7 = 15 | verbatim-number echo | C (11) |
| 2 | ratios-rates-proportions (19) | E | MC | — | density: population 34,500 ÷ area 15 km² | wrong operation (× / + / −) | A (2,300) |
| 3 | nonlinear-functions (16) | E | MC | **HTML table** | which exponential fits the table (x = 0, 1, 2 → 4, 12, 36) | a↔b swap in a(b)ˣ | B (4(3)ˣ) |
| 4 | linear-functions (12) | E | MC | — | interpretation of the y-intercept, C(h) = 55h + 40 (bicycle repair shop) | interpretation mis-mapping menu | B |
| 5 | linear-functions (12) | E | SPR | — | evaluate f(8) for f(x) = 40 − 3x (negative slope) | — | **16** |
| 6 | percentages (20) | E | SPR | — | direct percent: what number is 15% of 31 | — | **4.65** (the form's one decimal) |
| 7 | systems-linear-equations (14) | E | MC | **SVG two-line graph** | graphical: read the intersection (2, 5) | ordered-pair reversal | C ((2, 5)) |
| 8 | lines-angles-triangles (27) | E | MC | **SVG geometry fig** | exterior-angle theorem, 34° + 78° = x° | adjacent (supplement vs exterior) | D (112) |
| 9 | systems-linear-equations (14) | M | MC | — | two-totals word problem, solve one quantity (24 kits, $264; hardware-store kits, **Ibrahim**) | reversal (prices interchanged) | A (8) |
| 10 | area-volume (26) | E | MC | — | direct sphere volume, formula given parenthetically, r = 6 | formula-fragment omission | D (288π) |
| 11 | linear-equations-two-variables (13) | M | MC | — | perpendicular slope, m = 4/9 → −9/4 (stamped pair with M4 Q3 parallel) | reciprocal trio | A (-9/4) |
| 12 | two-variable-data (22) | M | SPR | **SVG curve** | average rate of change between labeled points (1, 4) and (7, 13) | — | **3/2** |
| 13 | right-triangles-trigonometry (28) | M | SPR | — | Pythagorean rectangle diagonal, 20-21-29 triple | — | **29** |
| 14 | nonlinear-functions (16) | M | MC | — | location of the minimum from standard form, f(x) = x² − 8x + 21 | adjacent (min value 5 vs location 4) | B (4) |
| 15 | equivalent-expressions (18) | M | MC | — | "Which of the following is a factor of x² + 2x − 48?" | sign flip / wrong pair | B (x - 6) |
| 16 | inference-statistics (24) | M | MC | — | point-estimate scale-up, 36/200 × 4,500 (rooftop-solar household survey; NOT the MoE menu) | wrong anchor | C (810) |
| 17 | linear-equations-one-variable (11) | H | MC | — | constant parameter for infinitely many solutions, 5(kx + 3) = 60x + 15 | solution-count reasoning | D (12) |
| 18 | circles (29) | H | MC | — | point-on-circle bounds, (x + 2)² + (y − 4)² = 25, "NOT a possible value" | must/cannot quantifier (CAPS) | A (-8) |
| 19 | nonlinear-functions (16) | H | SPR | — | geometric-word quadratic: length = width + 5, area 266 | — | **14** (−19 rejected) |
| 20 | percentages (20) | H | MC | — | percent-change extrapolation with compounding (harvest festival, 3,200 → 4,000 → ?) | percent-multiplier semantics (linear-add bait at B) | C (5,000) |
| 21 | nonlinear-equations (17) | H | MC | — | product of the solutions (Vieta), 2x² − 11x + 13 = 0, discriminant 17 (non-square, resists solving) | answer-the-wrong-target | D (13/2) |
| 22 | nonlinear-equations (17) | H | SPR | — | parameter for exactly one real solution, least value: x² + kx + 49 | sign-slip on ± | **-14** (the form's one negative) |

All six blueprint-engineered answers kept exactly: Q5 = 16, Q6 = 4.65, Q12 = 3/2, Q13 = 29, Q19 = 14, Q22 = −14.

## 2. Quotas
- **Domains:** Algebra 7 (Q1, 4, 5, 7, 9, 11, 17) · Advanced Math 6 (Q3, 14, 15, 19, 21, 22) · PSDA 5 (Q2, 6, 12, 16, 20) · GeoTrig 4 (Q8, 10, 13, 18) — matches the PT1 form split ALG 15 (M3 7) / ADV 13 (6) / PSDA 9 (5) / GEO 7 (4).
- **Skills:** lin-eq-1var 2 · lin-func 3 · lin-eq-2var 1 · systems 2 · NLF 3 · NLE 2 · equiv-expr 1 · ratios 1 · percentages 2 · two-var-data 1 · inference 1 · area-volume 1 · lines-angles 1 · right-tri-trig 1 · circles 1 (H) — exactly the blueprint's M3 rows; no probability (M4-only), no linear-inequalities/one-var-data (both scheduled in M4), no evaluating-statistical-claims.
- **Format:** 16 MC + 6 SPR; SPR at positions **5, 6, 12, 13, 19, 22** with difficulty E/E/M/M/H/H.
- **Visuals (4):** HTML table (Q3, in passage — not an SVG, per blueprint), SVG two-line graph (Q7), SVG geometry figure (Q8, carries "Note: Figure not drawn to scale."), SVG curve with two labeled points (Q12). Exactly 3 SVG files. Coordinate grids carry no scale note; zero histograms/box plots; hard geometry (Q18 circles) is figure-less.
- **Applied share:** Q2, Q4, Q9, Q16, Q20 applied + thin Q19 = 5 (+1 thin) — the blueprint's list verbatim; supports the form's 15/44 ≈ 34% with M4's 10.

## 3. Difficulty curve (9E / 7M / 6H)
`E E E E E E E E | M E | M M M M M M | H H H H H H` — machine-verified string EEEEEEEEMEMMMMMMHHHHHH: monotone ramp, medium at Q9, the licensed easy straggler (sphere volume) at Q10, hard band Q17–22, hard SPR closer. Hard items are structural, not arithmetic: Q17 needs the equivalence condition (distractors k = 3, 5, −12 each yield exactly one solution — sympy-checked); Q18 needs the radius bound (each distractor substituted and shown attainable); Q19's quadratic factors to (w + 19)(w − 14) with the negative root rejected; Q20 compounds on the new base (4,000 × 1.25, not +800); Q21's discriminant is 17, a non-square, so Vieta is the only clean path; Q22 requires discriminant = 0 then the NEGATIVE root of k² = 196.

## 4. SPR census and accepted-answer enumeration
Positions/difficulty as above. M3 contributes **4 integers (one negative: −14) + 1 fraction (3/2) + 1 decimal (4.65)** to the form's 8-int/3-frac/1-dec census (M4 supplies the 4-digit 1020, 3-digit 121, etc.).

All six `acceptedAnswers` lists were generated by the shared enumerator `scripts/data/practiceTest5Math-workpapers/spr_enum.py` (run in-session; set equality asserted):
| Q | answer | entries |
|---|---|---|
| 5 | 16 | 12 (16, 16/1 … 144/9, 16.0, 16.00) |
| 6 | 4.65 | 3 (4.65, 93/20, 4.650) |
| 12 | 3/2 | 36 (3/2, 6/4 … 99/66, 1.5, 1.50, 1.500) |
| 13 | 29 | 12 (29, 29/1 … 261/9, 29.0, 29.00) |
| 19 | 14 | 12 (14, 14/1 … 126/9, 14.0, 14.00) |
| 22 | -14 | 12 (-14, -14/1 … -126/9, -14.0, -14.00; ≤6 chars with minus) |

Every entry ≤5 characters (≤6 with minus) — machine-asserted. Entry-forms note appears on Q6 and Q12 only (the two non-integer answers); Q22's list excludes +14 (the sign-slip trap).

## 5. Key-letter tally (16 MC) — **A ×4 · B ×4 · C ×4 · D ×4, exact**
A: Q2, Q9, Q11, Q18 · B: Q3, Q4, Q14, Q15 · C: Q1, Q7, Q16, Q20 · D: Q8, Q10, Q17, Q21.
Balance was engineered through VALUES under honest ascending order, never by reordering: Q2's density (division) is the smallest of its wrong-operation set; Q8's exterior angle exceeds every adjacent-angle distractor; Q10's volume exceeds the fragment/surface-area values because r = 6 > 3 makes r³ dominate; Q11's negative-reciprocal −9/4 sorts first in the standing trio; Q17's k = 12 exceeds the echoed constants 3 and 5; Q18's impossible value −8 sits below the attainable range [−7, 3]; Q21 uses c > |b|/… so the product 13/2 sorts above the sum 11/2. All 12 numeric sets machine-checked strictly ascending; the 4 non-numeric sets follow explicit rules (Q3 coefficient-then-base ascending; Q4 parallel-sentence menu; Q7 ordered pairs by first then second coordinate; Q15 binomials by constant ascending).

## 6. Trap-per-item list (exactly one mechanism each)
Q1 verbatim echo · Q2 wrong operation · Q3 a↔b swap · Q4 interpretation menu · Q7 ordered-pair reversal · Q8 adjacent (supplement vs exterior) · Q9 reversal (price swap) · Q10 formula-fragment · Q11 reciprocal trio · Q14 adjacent (min value vs location — the blueprint's wrong-target pressure) · Q15 sign flip/wrong pair · Q16 wrong anchor · Q17 solution-count · Q18 must/cannot (CAPS NOT) · Q20 percent-multiplier semantics · Q21 answer-the-wrong-target · Q22 sign-slip on ±. Trap-free slots are the SPRs at 5, 6, 12, 13, 19 (blueprint "—"). Every MC `_distractorLogic` names one derivation recipe per wrong letter, all recipes from spec §4 / B §3.2; every distractor value machine-verified ≠ key and actually wrong (roots substituted, solution counts solved, circle points tested).

## 7. Stem word counts (honest ruler: every whitespace token of tag-stripped prose; displayed equations and tables excluded)
Q1 6 · Q2 28 · Q3 23 · Q4 53 · Q5 17 · Q6 6 · Q7 24 · Q8 10 · Q9 44 · Q10 33 · Q11 27 · Q12 33 · Q13 26 · Q14 19 · Q15 14 · Q16 53 · Q17 20 · Q18 32 · Q19 32 · Q20 40 · Q21 11 · Q22 23.
Caps honored: equiv-expr Q15 = 14 ≤ 15; abstract items ≤ 35 (max 33); applied items ≤ 55 (max 53); no stat-verbal item exceeds 75. Median 24.5 ≈ the spec's 25.

## 8. Rationale lengths (norms 110/135/170 MC E/M/H; 40/100/130 SPR; enforced at ±45%)
MC: Q1 108 · Q2 123 · Q3 144 · Q4 154 · Q7 132 · Q8 143 · Q9 192 · Q10 124 · Q11 157 · Q14 146 · Q15 154 · Q16 180 · Q17 216 · Q18 231 · Q20 160 · Q21 157. SPR: Q5 52 · Q6 50 · Q12 126 · Q13 105 · Q19 155 · Q22 148. **Zero out-of-band** (worst ratio Q18 at 1.36×). Liturgy machine-checked: every MC opens "Choice K is correct." with K = key, dismisses exactly the three wrong letters in letter order with named errors ("may result from…", "This is the …, not the …", substitute-and-fail on Q15/Q17/Q18, alternate-world sentences on Q4); every SPR opens "The correct answer is …" with no dismissals; "It’s given that" uses the curly apostrophe throughout; derivations are gerund + "yields" chains closing with "Therefore, …" in the question's own noun phrase.

## 9. Context firewall and originality
Contexts used: town population density · bicycle repair shop (diagnostic fee + hourly labor) · hardware-store workshop kits (Ibrahim) · rooftop-solar household survey · harvest-festival attendance · rectangular panel (thin) · rectangle diagonal (thin) — all from the blueprint's PT1 palette seeds, none from the PT4/PT5 firewall list. In-session grep of every distinctive string and number pipeline (2x − 7 = 15 · 34,500 · 4(3)ˣ · 55h + 40 · 40 − 3x · 15% of 31 · (2, 5) · 264 · 288π · (4/9)x · (7, 13) · x² − 8x + 21 · x² + 2x − 48 · 5(kx + 3) · (x + 2)² · 266 · 2x² − 11x + 13 · kx + 49 · Ibrahim · population density · diagnostic fee · tool kits · rooftop solar · harvest · panel) against both PT5 annotated modules and `used_contexts_t4_t5.txt`: **zero hits**. Exactly **one named person** (Ibrahim — diverse single given name, one economic act, no dialogue); no Latin binomial in M3 (the form's single invented binomial is scheduled at M4 Q21); no brand names, no "you", no imperatives, no second questions, no exclamation points.

## 10. Figures
- **PT1-M3-Q07.svg** (380×350): two black lines (y = x + 3 rising from (−4, −1) to (6, 9); y = −2x + 9 falling from (−0.5, 10) to (5.5, −2)), arrowheads both ends of both lines and both axes, intersection at gridline crossing (2, 5) — pixel-exact (198, 146) on the 26px/unit map; #cccccc gridlines every unit, labels every 2 units, italic x/y at axis tips, origin O, no scale note (coordinate grid). Alt text names the two y-intercepts and the intersection (the figure's own visible features).
- **PT1-M3-Q08.svg** (380×250): minimal line art — BD horizontal with triangle ABC on it, side BC extended to D; interior angles 34° (at A) and 78° (at B) marked, exterior angle at C marked x° with italic x; italic vertex labels; centered 12px "Note: Figure not drawn to scale." inside the SVG (geometry figure only).
- **PT1-M3-Q12.svg** (380×345): smooth increasing exponential-shaped curve y = 3.2866(1.21706)ˣ chosen to pass exactly through the two labeled points — dots at (1, 4) → (80, 236) and (7, 13) → (260, 74) on the 30px/18px unit map, coordinate labels beside the dots, first-quadrant grid (x every 1, y every 2), both-end arrowed axes, italic x/y, origin O, no scale note.
All three ~380px wide, Georgia serif, black curves/dots, roman tick numerals.

## 11. Latitude exercised (with justification)
1. **Q1 asks "What is the value of x?"** rather than "What is the solution to the given equation?" — both are canonical §2a workhorses; chosen to differentiate from PT5 M3 Q1's phrasing on the same archetype.
2. **Q14's quadratic is x² − 8x + 21** (blueprint illustrated the shape as "x² − 10x + 21"): the shape note is illustrative, and −8x makes the minimum's location (4) and value (5) adjacent-and-confusable — a cleaner instance of the assigned trap. Not an engineered-answer slot.
3. **Q9's system trio adapted to the solve archetype:** for solve-for-one-quantity items the "swap the coefficients" recipe provably lands on the other variable's value (16, offered as C and dismissed by both names); the third distractor is the attested divided-total slip (264 ÷ 24 = 11). The blueprint's standing trio is stated for the which-system archetype; this is its correct solve-archetype projection.
4. **Q17's parameter form is 5(kx + 3) = 60x + 15** — the blueprint's a(kx + b) = cx + d skeleton with the constants engineered so the constant terms match automatically after distribution, isolating the single coefficient-matching insight (spec §0: one item, one decision).
No engineered answer was changed; no slot, skill, difficulty, format, visual, or trap assignment deviates from the blueprint.
