# Adversarial Verification Report — Exam 4, Modules 3 & 4 (44 items)

Verifier: independent re-derivation of every item from the stem text alone (sympy + hand checks; 57 computational checks, all reproduced below where relevant). SVGs parsed as XML; data-to-pixel affine mappings recovered from axis tick labels and cross-checked against every plotted element. Writers' claims were not trusted at any step.

**Summary: 40 OK, 0 BLOCKER, 0 MAJOR, 4 MINOR.** Every keyed answer is independently confirmed correct and unique; every distractor is definitively wrong; no second defensible option found anywhere; all SPR canonical forms verified. The 4 MINOR findings are cosmetic/edge-case only and do not affect scoring or solvability.

## Verdict table

| Item | Verdict | Finding (one line) |
|---|---|---|
| M3.Q1 | OK | 4x+6=38 → x=8; key B; distractors 6/11/32 all verified wrong; ascending |
| M3.Q2 | OK | C=4x+30 unique; role-swap distractors wrong |
| M3.Q3 | OK | Sum = 7x²+5x−3; key A; B/C/D each fail expansion |
| M3.Q4 | OK | 5·12=60; key D; ascending |
| M3.Q5 | OK | g=(96−42)/2=27; integer SPR, no variants needed |
| M3.Q6 | OK | f(4)=48−20+9=37; integer SPR |
| M3.Q7 | OK | Median 47 (sorted 41,44,44,47,52,55,60); range 19, mode 44, mean 343/7=49 exact; ascending |
| M3.Q8 | MINOR | Math/figure exact (slope 2, y-int −4) but SVG is 340px wide, not ~380px |
| M3.Q9 | OK | a+c=260, 9a+5c=1900; key D; system solvable (a=150, c=110) |
| M3.Q10 | OK | V=8·6·5=240; distractors = perimeter 28 / base area 48 / surface area 236, all verified; figure labels match; scale note present |
| M3.Q11 | OK | Observed (2,14) minus predicted 2(2)+4=8 → 6; figure verified point-by-point (9 dots, line through (0,4)-(10,24)) |
| M3.Q12 | OK | 21(w+3)=3·55=165; shortcut sound (w=34/7 non-integer by design) |
| M3.Q13 | OK | cos(q°)=sin(p°)=4/9; accepted set {4/9, .4444, 0.444} complete per SPR decimal rules |
| M3.Q14 | OK | 1,150=P(0)=2015 population; unique interpretation; P(1)=1,081 claim exact |
| M3.Q15 | MINOR | Key b=22 and explanation correct; internal _distractorLogic note states "−6x − 28x = −22x" (false arithmetic; −34x) — not student-facing |
| M3.Q16 | OK | 60x+150y ≤ 2,400 unique ("at most" ⇒ inclusive ≤) |
| M3.Q17 | OK | Squaring gives x=−1, 6; x=6 extraneous (√9=3≠−3), x=−1 checks (√16=4=4); key A unique |
| M3.Q18 | OK | Discriminant 52−4c=0 → c=13 (= vertex value f(4)); ascending incl. negatives |
| M3.Q19 | OK | 2(x−5)²+111 re-expands to 2x²−20x+161; a+h+k=118 |
| M3.Q20 | OK | x=2.5(0.5z)=1.25z → 125%; key B; ascending |
| M3.Q21 | OK | (k−3)²=81, k>0 → k=12; distractors −6-sign-slip/radius/3+81 verified |
| M3.Q22 | MINOR | k=−12/5 verified (slopes equal, intercepts 7/4 ≠ −9/10); accepted set omits legal 6-char entry "-2.400" (includes -2.40) |
| M4.Q1 | OK | 4x+3=31 → x=7; f(31)=127 distractor exact; ascending |
| M4.Q2 | OK | 6·220·3=3,960 ft; partial-conversion distractors 226/660/1,320 verified |
| M4.Q3 | OK | Same-side interior: x=180−122=58; figure verified (drawn 123.6°/56.4°, supplementary; scale note present) |
| M4.Q4 | MINOR | Vertex (3,−4) exact in figure (Bezier vertex at px(152,296)); one vertical gridline (data x=5, px 200) missing from otherwise complete lattice |
| M4.Q5 | OK | 9x−7=47 → x=6 |
| M4.Q6 | OK | f(7)=56−3=53 |
| M4.Q7 | OK | x=9, y=27, x+y=36; distractors are x, y, and 2x+y=45 |
| M4.Q8 | OK | 2x²(6x³+5)=12x⁵+10x²; key C; exponent-rule distractors wrong |
| M4.Q9 | OK | P(print | 40+)=36/48=3/4; table internally consistent; options ascending (0.25<0.36<0.6<0.75) |
| M4.Q10 | OK | 3s+63=132 → s=23; distractors 15 (swap), 44 (132/3), 69 (=3s) verified |
| M4.Q11 | OK | 6% per 4 yr → 9,000(1.06)^(t/4); key A unique |
| M4.Q12 | OK | Slope −2, y=−2x+16, x-intercept 8 |
| M4.Q13 | OK | (4s)²/s²=16 |
| M4.Q14 | OK | Plausible-interval 59%–65% is the only defensible MoE conclusion |
| M4.Q15 | OK | x ≥ 8 and 45x+6y ≤ 520 unique; boundary cases correctly inclusive |
| M4.Q16 | OK | Slope (60−210)/10=−15 → "$15 decrease per year"; figure verified (10 dots; drawn line ≈ true LSF −14.76/209.7) |
| M4.Q17 | OK | 64−8k<0 → k>8 → least integer 9; k=8 boundary (disc 0) correctly excluded |
| M4.Q18 | OK | AA given; only JK & PQ (corresponding included sides) decide congruence either way; A/B/C insufficient |
| M4.Q19 | OK | 6(3)^(4x)=6(81)^x → ab=486 |
| M4.Q20 | OK | (x−5)²+(y+2)²=36 → r=6; option set √7<6<12<36 ascending |
| M4.Q21 | OK | x²−8x+9=0 → x=4±√7 → q=7; distractors p=4, constant 9, discriminant 28 verified |
| M4.Q22 | OK | a=−2, b=7 from (1,5),(3,3); max f(7/4)=49/8=6.125; accepted forms complete |

## Detailed findings (non-OK items)

### M3.Q8 — MINOR: SVG width 340px (spec ~380px)
`M3-Q08.svg` has `width="340"`, `viewBox="0 0 340 350"`; the other five assets are exactly 380px wide. Content is fully correct: recovered mapping px = 148 + 26x, py = 172 − 26y from tick labels; the drawn segment (119,334)–(281,10) converts to exactly slope 2.0000, y-intercept −4.0000, passing through (0,−4) and (2,0) as the key requires; grid lattice complete (only axis lines omitted, correctly); no scale note (correct for a coordinate grid). Cosmetic width inconsistency only.

### M3.Q15 — MINOR: false arithmetic in internal `_distractorLogic` (not student-facing)
Key and explanation verified: (2x+7)(4x−3) = 8x² + 22x − 21, b = 22; distractors −6 and 28 are the exact partial products. The internal metadata for choice A says "−6x − 28x = −22x", but −6 − 28 = −34, not −22. The plausible sign-slip route to −22 is 6x − 28x (negative applied to the wrong cross term). The student-facing dismissal ("a sign error when combining the terms −6x and 28x") remains defensible; only the authoring note is arithmetically wrong.

### M3.Q22 — MINOR: acceptedAnswers omits a legal padded entry
k = −12/5 independently confirmed: slope condition −k/4 = 3/5 gives k = −12/5, and intercepts 7/4 ≠ −9/10 confirm parallel distinct lines (truly no solution, not coincident). Accepted set is ["-12/5", "-2.4", "-2.40"]. Since negative SPR entries allow 6 characters including the minus sign, "-2.400" is also a legal, correct entry and is missing — inconsistent with having included the padded "-2.40". Edge-case only; canonical forms are all present. (If the grader exact-matches strings, unreduced fractions such as "-24/10" would also score wrong; see general note below.)

### M4.Q4 — MINOR: missing vertical gridline at x = 5
Parabola verified from the Bezier path `M 76 56 Q 152 536 228 56`: mapping px = 80 + 24x, py = 200 − 24y gives vertex exactly (3, −4) (Bezier midpoint (152, 296)) and x-axis crossings at x = 0.997 and 5.003 (0.07px from exact 1 and 5 — visually indistinguishable), matching the stem and graphDescription. However, the vertical gridline at px 200 (data x = 5) is absent from an otherwise complete every-unit lattice — the writer appears to have skipped px 200 as if it were an axis (the x-axis is at py 200; the y-axis is at px 80, which is the correct vertical skip). The keyed vertex (3, −4) is fully supported by present gridlines (px 152, py 296), and (5, 0) — a distractor — remains readable midway between the labeled x = 4 and x = 6 lines, so this is cosmetic rather than misleading.

## Informational notes (no verdict impact)

1. **M3.Q11 fit line vs true least-squares line.** The drawn line (through (0,4) and (10,24), slope 2) is an eyeballed fit; the true LSF for the 9 plotted points is slope ≈ 1.73, intercept ≈ 5.56. This is standard practice-test convention (the shown line is authoritative; it threads the cloud with 4 points above / 5 below, and passes exactly through the gridline point (2,8) that the item requires). No option corresponds to a true-LSF reading (14 − 9.0 ≈ 5 is not offered), so no ambiguity. For contrast, M4.Q16's drawn line (−15, 210) is nearly identical to its true LSF (−14.76, 209.7).
2. **SPR grading by exact string match.** If the delivery platform compares raw strings against acceptedAnswers, mathematically equivalent unreduced fractions that fit the character budget (e.g., 8/18 for M3.Q13, 98/16 for M4.Q22, -24/10 for M3.Q22) would be scored wrong. The College Board scores by value. Recommend numeric-equivalence grading platform-side; only M3.Q22's "-2.400" rose to a per-item flag because the writer's own set includes the padded "-2.40".
3. **Module header wording.** M3.json pairs title "Exam 4, Module 3" with description "Practice Test 4 - Math, Module 1" (likewise M4/Module 2) — consistent with site-wide module numbering where modules 3–4 are the two math modules; noted in case it is unintentional.
4. **Schema sweep results.** All 44: questionType legal; MC items have exactly 4 options with int correctAnswer 0–3 and null acceptedAnswers; SPR items have options [] and string keys present in acceptedAnswers; all difficulties in {easy, medium, hard}; all 22 subcategory/subcategoryId pairs match the reference map; all numeric MC option sets strictly ascending (incl. negative sets −22<−6<22<28 and −13<−3<4<13, and radical set √7<6<12<36); no HTML tags and no Unicode minus inside any option string; no LaTeX $-delimiters (all $ occurrences are currency followed by digits, including M4.Q16's "$210"/"$15" option text); passage HTML limited to div/p/table/thead/tbody/tr/td/th/sup/i with inline styles (all within DOMPurify defaults). All 6 SVGs are well-formed XML; "Note: Figure not drawn to scale." appears on exactly the two geometry figures (M3-Q10, M4-Q03) and on no coordinate grid; all SPR strings ≤5 chars (≤6 with leading minus).
5. **Figure-content verification method.** For each graph asset the affine map was recovered from tick-label/gridline pairs and every plotted primitive was converted back to data coordinates: M3-Q08 line exact; M3-Q11 nine dots at (1,4),(2,14),(3,12),(4,10),(5,12),(6,18),(7,16),(8,22),(9,20) with the single x=2 dot at height 14 as the stem requires; M3-Q10 prism edge labels 8/6/5 ft on length/depth/height edges with consistent px-per-ft on front-plane edges; M4-Q03 same-side interior angles drawn 123.6°/56.4° (sum 180°) labeled 122°/x°, positions verified on the correct side of the transversal; M4-Q04 vertex/intercepts as above; M4-Q16 ten dots (1,200)…(10,65) around the drawn line with fit line endpoints exactly (0,210) and (10,60).
