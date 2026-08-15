# Practice Test 6 — Math Modules 3 & 4: Adversarial Verification Report

**Scope:** 44 items (M3 22, M4 22) + 6 SVG figures. Everything below was re-derived from the item
text alone with sympy / exact rationals / independent SVG affine-map recovery. The writers'
`verify_M3.py` / `verify_M4.py` and the two `*_selfcheck.md` files were **not** consulted for any
mathematical claim; they were opened only to read the headline assertion counts quoted in the brief.

**Result: 0 BLOCKER · 0 MAJOR · 10 MINOR · 34 OK.**

No key is wrong. No item has a second defensible answer. No stem is underdetermined. No figure
contradicts its stem. No schema or rendering break. All seven stress-test items survived exhaustive
proof (Section C).

---

## A. Verdict table

| Item | Verdict | Finding |
|---|---|---|
| M3.Q1 | OK | 4(x+8)=52 → x=5 unique; distractors 8/11/13 all non-solutions and each matches its stated slip. |
| M3.Q2 | OK | f(6)=68; 6=input, 14=f(0), 54=9(6) — all three dismissals verified true. |
| M3.Q3 | OK | 420·6=2,520; 70=420/6, 426=420+6, 25,200=420·60 all confirmed. |
| M3.Q4 | OK | (7x+5)(7x−5) unique; A→49x²−70x+25, C→49x²+70x+25, D→2401x²−25, none equal the stem. |
| M3.Q5 | OK | x=7; all 18 accepted forms evaluate to 7 and equal the canonical enumerator output exactly. |
| M3.Q6 | OK | f(6)=94; 12 accepted forms complete and correct. |
| M3.Q7 | MINOR | Figure verified (bars 18/30/12/24/6, max 30 at Pool 2, total 90). Alt text omits every bar height → item unanswerable from the description alone (see §D). |
| M3.Q8 | OK | Same-side interior angles → x=112 unique; SVG drawn angle is 67.94°/112.06°, labels correctly placed. |
| M3.Q9 | OK | 4,320/(24·15)=12; 180, 288, 360 all confirmed as the stated slips. |
| M3.Q10 | OK | Figure gives exactly slope −3, intercept 8 → y=−3x+8. Alt text is data-complete, matching binding spec and 5 shipped forms. |
| M3.Q11 | OK | **Exhaustive:** t≤9 over all integers; t=9 loads exactly 900 lb (allowed), t=10 → 975 lb. 8/12/20 all non-maximal or infeasible. |
| M3.Q12 | OK | y=12 (x=14); 8(14)+20(12)=352, 14+12=26. 12 accepted forms complete. |
| M3.Q13 | OK | z=84/36=7/3; 15 accepted forms incl. the required max-precision decimal 2.333. |
| M3.Q14 | MINOR | Figure verified: drawn line is the *exact* least-squares line y=25x; prediction at 18 = 450; an observed point really sits at (18,400). Alt text omits the readable values (see §D); axis-increment wording describes label spacing, not gridline spacing. |
| M3.Q15 | OK | 24,000(0.85)ᵗ unique; 0.15 base = −85%/yr, 1.15 = +15%, 1.85 = +85% — all dismissals true. |
| M3.Q16 | OK | Negative reciprocal of 5/8 = −8/5; the other three are −5/8, 5/8, 8/5 exactly as described. |
| M3.Q17 | OK | Vertex x=4; 3(x−4)²−7 expands to the stem exactly; −7 is the min *value*, 8=24/3, −4 sign slip. |
| M3.Q18 | OK | **Exhaustive:** ASA fixes the triangle up to congruence; DE=16cos30°=8√3 unique. 4√3, 8, 8√2 each derivable only from a named error. |
| M3.Q19 | OK | a=315 is the unique value making the two sides identical; 5 accepted forms complete. |
| M3.Q20 | OK | (x+6)²+(y−4)²=64 → r=8; 12/16/64 are the constant, the diameter, and r². |
| M3.Q21 | OK | Roots x=6, −1; exactly one positive → y=8. −6 is the other root's y, 6 is x, 2 comes from the stated sign slip. |
| M3.Q22 | OK | a=−2/3, b=13, ab=−26/3; 5 accepted forms complete under the 6-char-with-minus rule. |
| M4.Q1 | OK | 2.75n+6=39 (n=12, an integer — well-posed); the three distractors are not equivalent equations. |
| M4.Q2 | OK | 4x³+11x unique; A is the exact sign-error result; C/D are the unlike-terms errors. |
| M4.Q3 | OK | 2 tons/hr; 0.5 = hr per ton, 18 = tons per shift, 4,000 = lb per hour — all true. |
| M4.Q4 | OK | f(6)=13.00; 2.50=f(0), 4.25=1.75+2.50, 10.50=1.75(6). |
| M4.Q5 | MINOR | y=17 correct. 4 legal SPR entries missing: `102/6`, `119/7`, `136/8`, `153/9` (see §E). |
| M4.Q6 | OK | 42·14=588; accepted-answer list is provably complete (no other form fits 5 chars). |
| M4.Q7 | MINOR | Figure verified: curve is exactly y=x²−2x−3, y-intercept (0,−3)=key, (−1,0) is a real x-intercept, (1,−4) is the vertex, (−3,0) is **not** on the curve. Alt text says "tick marks at every 2 units" — the grid is at every **1** unit (labels are every 2). Factual error, no answer impact. |
| M4.Q8 | OK | 72/200=9/25; table fully self-consistent (all six marginal sums check); 9/20, 3/5, 4/5 are the three stated wrong denominators. |
| M4.Q9 | OK | **Exhaustive:** only D is defensible. n=625 ↔ 1/√625 = 4.00 pts exactly; true 95% MoE = 3.92 pts. |
| M4.Q10 | OK | C(0)=25 → one-time fee; C(1)=43 kills D; rate is 18 not 25, killing C; A is the full swap. |
| M4.Q11 | MINOR | √521=22.825 → 22.8 uniquely closest; figure is drawn to exact scale (8 px/unit on both legs). Stale token: `_distractorLogic.B` still says "treating **DF** as the hypotenuse" — residue of the DEF→RST relabel. Metadata only; the rendered explanation correctly says "RT". |
| M4.Q12 | MINOR | p=26.5 correct. 2 legal SPR entries missing: `159/6`, `212/8`. |
| M4.Q13 | MINOR | **Exhaustive:** r≤10.545 → 10 (r=10 → 1,910 lb; r=11 → 2,075 lb). 4 legal SPR entries missing: `60/6`, `70/7`, `80/8`, `90/9`. Also a mild wording looseness (see §F). |
| M4.Q14 | OK | −5a=−20 and a−15=b force a=4, b=−11 uniquely; (3x+4)(x−5)=3x²−11x−20 verified. |
| M4.Q15 | OK | All four table rows satisfy y=7x−5; each distractor fails at least one row. Table is genuinely linear. |
| M4.Q16 | OK | **Exhaustive:** det = 5k−60 = 0 ⟺ k=12, and 24/6=4≠3 so k=12 gives *no* solution (not infinitely many). Every other k gives a unique solution. |
| M4.Q17 | OK | g(4)=f(14)=98; −34=3f(4)+2, −12=f(4), 60=f(12) all verified. |
| M4.Q18 | OK | **Exhaustive:** only C forces the scale factor r=1. A, B, D leave r free (B is already implied by similarity). |
| M4.Q19 | MINOR | **Exhaustive:** k²<400 ⟺ −20<k<20; k=20 gives a double root (excluded), so 19. 4 legal SPR entries missing: `114/6`, `133/7`, `152/8`, `171/9`. |
| M4.Q20 | MINOR | 1.44^(t/2)=(1.2)ᵗ since 1.2²=1.44; distractors distinct. Style: the only explanation in the entire PT1–PT6 corpus that uses `<sup>` tags (11 occurrences) instead of Unicode superscripts. Renders correctly (DOMPurify allows `sup`). |
| M4.Q21 | OK | r=12, C=24π, arc=(150/360)(24π)=10π; 20π, 60π, 120π each reproduce their stated slip exactly. |
| M4.Q22 | MINOR | a=3/4, b=15/2, f(1)=33/4=8.25 correct. 1 legal SPR entry missing: `99/12`. |

---

## B. What was checked and passed globally

**Schema / rendering (all 44 items clean):**

* `questionType` legal everywhere; 4 options for every MC, `[]` for every SPR; `correctAnswer` is an
  int 0–3 for MC and a string for SPR; `acceptedAnswers` is `null` for MC and a list for SPR.
* All 44 `subcategory` / `subcategoryId` pairs match the required map (11–29). Verified
  programmatically against the table in the brief — zero mismatches.
* **No unescaped bare `<` or `>` anywhere** in `passage` / `text` / `explanation` /
  `graphDescription`. This matters: `apps/web/src/pages/ExamResults.jsx:585,593,723` and
  `apps/web/src/components/Question.jsx:157,161` render these fields through
  `dangerouslySetInnerHTML`, so a bare `<` would truncate the string. M4.Q19 correctly uses
  `&lt;` (4×); M3.Q11 and M4.Q13 use the `≤` glyph, which is safe.
* **No HTML tags or entities in any option**, and none needed: options render as plain React text
  (`Question.jsx:93` → `<span className="option-text">{option}</span>`), so the Unicode
  superscripts (`³ ⁴ ᵗ ²`), `√`, and `π` used in M3.Q4/Q15/Q18 and M4.Q2/Q20/Q21 are the correct form.
* No LaTeX anywhere. ASCII hyphen-minus in every option, `correctAnswer`, and `acceptedAnswers`
  string. (U+2212 appears only inside explanations — that is established house style: 60–100
  occurrences per module across all six shipped modules.)
* Every MC explanation opens with the letter matching `correctAnswer` and dismisses exactly the
  other three letters — 0 mismatches.
* Key-letter balance: M3 = 4/4/4/4, M4 = 4/4/4/4.
* Numeric option ordering ascending in every MC item where options are numeric (checked
  including `4√3 < 8 < 8√2 < 8√3` and `10π < 20π < 60π < 120π`); non-numeric option sets are
  systematically ordered. **No ordering violation.**
* Difficulty ordering (`8×easy, medium@9, easy@10, 6×medium, 6×hard`) is identical in both PT6
  modules and matches the shipped pattern in `modules/M3.json` and `modules-pt5/M4.json`. The
  Q9/Q10 inversion is house practice, **not** a defect.
* SPR slot positions (5, 6, 12, 13, 19, 22) identical to all four previously shipped modules.
* SPR answer mix across the form: 8 integers, 3 lowest-terms fractions, 1 negative, 1 clean
  decimal — exactly the `CB_Math_Style_Spec.md` §6 target.
* All four non-integer SPRs (M3.Q13, M3.Q22, M4.Q12, M4.Q22) carry the mandated
  "Note that … are examples of ways to enter a correct answer." sentence, and every form named in
  those sentences is actually present in `acceptedAnswers`.

**Explanations:** every arithmetic step, factorisation, completed square, substitution and
dismissal reason in all 44 explanations was recomputed. Every dismissal reason genuinely produces
the distractor it is attached to (e.g. M3.Q17 "divided 24 by 3 rather than 6" → 8 ✓; M4.Q16
"used 5/15 rather than 15/5" → 4/3 ✓; M4.Q21 "used 144 as the radius" → 120π ✓). **No numeric or
algebraic error found.**

**Cross-module consistency:** rendered triangle label sets are DEF (M3.Q18), RST (M4.Q11),
GHJ/KLM (M4.Q18) — **no collision**. The only residue of the DEF→RST relabel is the metadata-only
"DF" in M4.Q11 (logged MINOR). No two items share a figure label set. Variable reuse (a/b in
M3.Q22 & M4.Q14/Q22, k in M4.Q16/Q19, t in M3.Q11 & M4.Q20) is confined to unrelated items and
cannot confuse.

---

## C. Exhaustive proofs for the seven stress-test items

### C1. M3.Q11 — integer optimization (key B = 9)
Model: total = 75t + 225, constraint ≤ 900 ("at most" is inclusive).
Brute force over t ∈ {0,…,59}: feasible set = {0,…,9}, **max = 9**.
* t = 9 → 675 + 225 = **900 ≤ 900** ✓ feasible — this is exactly what kills option A (8).
  "At most 900 pounds" admits equality with no reading under which it does not.
* t = 10 → 975 > 900 ✗.
* Option C (12): 12·75 + 225 = 1,125 > 900 ✗. Option D (20): 1,725 > 900 ✗.
Constraint set is a single upper bound on a non-negative integer, so no alternate branch exists.
**Unique.**

### C2. M3.Q18 — verbal special triangle (key D = 8√3)
Given ∠D=30°, ∠E=90° ⇒ ∠F=60°, and DF=16. The 30-60-90 angle triple plus one fixed side is an
ASA/AAS configuration: the triangle is unique up to congruence — there is no SSA ambiguous case,
so **every** admissible configuration gives the same DE.
DF is opposite ∠E ⇒ DF is the hypotenuse. DE is opposite ∠F (60°) ⇒ DE is the longer leg.
Two independent derivations: DE = √(16² − 8²) = 8√3 (exact, via sympy), and
DE = 16·cos 30° = 8√3. Numerically 13.8564.
Non-keyed options, checked as values and as claims:
* 4√3 ≈ 6.928 — arises only from treating EF (=8) as the hypotenuse; not a side of this triangle.
* 8 — this is EF, the shorter leg, not DE.
* 8√2 ≈ 11.314 — requires ∠D=∠F=45°, contradicting the given 30°.
All three are strictly less than DE and none is an alternate form of 8√3.
Sanity: DE (13.86) < DF (16) ✓ leg shorter than hypotenuse. **Unique; stem is fully determined
without a figure.**

### C3. M4.Q9 — statistical statements (key D)
Internal plausibility first: n = 625, 1/√625 = 0.0400 = **exactly** the stated 4 percentage points;
the true 95% margin 1.96·√(0.48·0.52/625) = 3.92 pts. The sample is stated to be random and the
conclusion is scoped to the sampled population ("all volunteers at the observatory"). Interval:
48 ∓ 4 = [44, 52].
Each option evaluated as a universally quantified claim:
* **A** "Exactly 48% …" — a point estimate from a sample never establishes an exact population
  value. False for the general case; no sample size makes it true.
* **B** "cannot be less than 44% or greater than 52%" — asserts the interval is a hard bound. A
  confidence interval assigns *lower plausibility*, never impossibility, to outside values. False.
* **C** "Every percentage between 44% and 52% is equally likely" — asserts a uniform posterior;
  the sampling distribution is peaked at 48%. False.
* **D** "likely between 44% and 52%" — the canonical, and only correct, reading.
Exactly one option survives. **Unique.**

### C4. M4.Q13 — threshold to an integer bound (key 10)
165r + 260 ≤ 2,000 ⇒ r ≤ 1,740/165 = 10.5454…
Brute force over r ∈ {0,…,99}: feasible = {0,…,10}, **max = 10**.
Boundary: r = 10 → 1,910 ≤ 2,000 ✓; r = 11 → 2,075 > 2,000 ✗. r is a count, hence a non-negative
integer, so no fractional answer is admissible. **Unique** under the intended model (see §F for the
one wording note).

### C5. M4.Q16 — no-solution parameter (key D = 12)
Treated over **all real k**, not just the four options. Coefficient determinant
Δ(k) = 5k − 15·4 = 5k − 60.
* Δ(k) ≠ 0 ⇒ the system has exactly one solution. So *no* value of k with Δ≠0 can be an answer.
* Δ(k) = 0 ⟺ **k = 12** (unique real root).
* At k = 12: 12/4 = 3, 15/5 = 3, but 24/6 = 4 ≠ 3 ⇒ parallel and distinct ⇒ **no solution**
  (and specifically *not* the infinitely-many case).
Therefore the no-solution set is the singleton {12}. Independently brute-forced over all integers
k ∈ [−500, 500]: no-solution occurs at k = 12 and nowhere else.
Distractors: k = −12 → Δ = −120 ≠ 0 (unique solution); k = 4/3 → Δ = −53.33 ≠ 0; k = 4 → Δ = −40 ≠ 0.
None is defensible. **Unique.**

### C6. M4.Q18 — similarity sufficiency (key C)
Parametrize every admissible configuration: △GHJ has sides (p, q, s) = (GH, HJ, GJ) with
p,q,s > 0, and similarity with correspondence G↔K, H↔L, J↔M means △KLM has sides
(rp, rq, rs) for some r > 0, with all three angle pairs already equal. Congruence ⟺ r = 1.
* **A** (m∠G = 58°): constrains only the shape, which similarity already fixes. For any r > 0 a
  valid pair exists (e.g. a 58-60-62 triangle with GH=1 and KL=r). r unconstrained ⇒ **insufficient**.
* **B** (m∠K = m∠G): this is a *theorem* of the given similarity, already true in every admissible
  configuration. Adding a statement that is already implied cannot reduce the configuration space;
  r remains free ⇒ **insufficient**.
* **C** (GH = KL): KL = r·GH and KL = GH ⇒ r·GH = GH; GH > 0 ⇒ r = 1 ⇒ all three side pairs equal
  ⇒ SSS congruence ⇒ **sufficient**, in every admissible configuration.
* **D** (perimeter of GHJ = 30): constrains p+q+s only; △KLM is unmentioned and r is free
  (r = 2 gives perimeter 60) ⇒ **insufficient**.
Exactly one sufficient option. **Unique.**

### C7. M4.Q19 — discriminant boundary (key 19)
a = 4 ≠ 0, so the equation is genuinely quadratic. Discriminant = k² − 4(4)(25) = k² − 400.
"No real solutions" ⟺ k² − 400 < 0 ⟺ k² < 400 ⟺ **−20 < k < 20**.
Integer solution set brute-forced over k ∈ [−100, 100]: {−19, …, 19}; **greatest = 19**.
Boundary stress-test:
* k = 20 ⇒ discriminant = 0 ⇒ the equation has **one** real solution (x = −5/2), so it is correctly
  excluded — "no real solutions" is strict.
* k = 19 ⇒ discriminant = 361 − 400 = −39 < 0 ✓.
The explanation states this boundary case explicitly and correctly. **Unique.**

---

## D. Figures — affine map recovery and element-by-element verification

Every SVG parses as well-formed XML (`ElementTree`), is `width="380"`, and carries
"Note: Figure not drawn to scale." on **exactly** the two geometry figures (M3-Q08, M4-Q11) and on
none of the four data/coordinate figures. Data→pixel maps were recovered from tick labels and
gridlines, then checked for uniform scale before use.

**PT6-M3-Q07.svg** — y map from tick labels: value = (250 − y_px)/6, uniform to 1e-9.
Bar values **18, 30, 12, 24, 6**; all bars seated on the axis (y+h = 250). Max = 30 at Pool 2,
unique max ✓ key C. Sum = 90 ✓ distractor D. 5 bars ✓ distractor B. Tallest bar's index = 2 ✓
distractor A. Everything the stem and explanation claim is true of the drawing.

**PT6-M3-Q08.svg** — transversal (130,40)→(224,272) meets r at x=150.26 and s at x=190.78,
matching the drawn dots at cx=150 and cx=191. Measured drawn angles: 67.94° (right of t, below r)
and 112.06° (right of t, above s) — the figure is *also* accurate to scale, and the two labels sit
unambiguously in those quadrants (68° label at (176,112) with the transversal at x=159 on that
row; x° label at (216,176) with the transversal at x=185). Same-side interior ⇒ x = 112 ✓.

**PT6-M3-Q10.svg** — x: 30 px/unit, y: 17.5 px/unit, both uniform; origin at (160,215).
Segment (140,40)→(300,320) maps to (−2/3, 10)→(14/3, −6): **slope exactly −3, intercept exactly 8**
⇒ key B. All three points named in the alt text — (0,8), (2,2), (4,−4) — lie exactly on the drawn
line. Gridlines: x every 1 unit, y every 2 units, matching the description.

**PT6-M3-Q14.svg** — x: 11.25 px/unit, y: 0.4 px/unit, uniform; origin (60,300).
The drawn "line of best fit" maps to **y = 25x + 0**. Independently computing the least-squares fit
of the 10 plotted points gives slope 25.000000, intercept 0.000000 — the drawn line **is** the exact
least-squares line, so calling it a line of best fit is literally true. Prediction at x = 18 is
**450** ✓ key D; slope 25 ✓ distractor B. The 10 points are
(4,75) (6,125) (8,225) (10,300) (12,325) (14,350) (16,375) **(18,400)** (20,500) (22,575) — strictly
increasing, and there really is an observed point at (18, 400), which is what makes distractor C a
genuine misreading rather than a fabrication. 400 ≠ 450 ✓.

**PT6-M4-Q07.svg** — 24 px/unit both axes; origin (148,190). The quadratic Bézier
`M 100 70 Q 172 502 244 70` has linear x(t), so it is a true parabola in data space; sampling 2,001
points and solving recovers **y = x² − 2x − 3 to 1e-9 over the whole curve**. Hence: y-intercept
(0,−3) ✓ key C; x-intercepts (−1,0) and (3,0) ⇒ distractor B is a real x-intercept ✓; vertex
(1,−4) ⇒ distractor D is the real minimum ✓; **(−3,0) is not on the curve** ⇒ distractor A is not
accidentally correct ✓; opens upward ✓; crosses the x-axis once left and once right of the y-axis ✓.

**PT6-M4-Q11.svg** — vertices T(150,250), S(238,250), R(150,90); legs axis-aligned so ∠T = 90°
exactly, with the right-angle box drawn at T and inside the triangle. TS = 88 px for label 11 and
TR = 160 px for label 20 — **8.0000 px/unit on both**, so the side proportions match the labels
exactly and the drawn hypotenuse measures √521 = 22.8254 units. Labels 11 and 20 sit on the correct
sides; R/S/T sit at the correct corners. The "not drawn to scale" caption is present as required
for a geometry figure (and the figure happens to be to scale, which is harmless).

**graphDescription factuality:** all six are factual, with two exceptions logged as MINOR —
M4.Q07 ("tick marks at every 2 units"; the grid is at every 1 unit, labels every 2) and M3.Q14
("increments of 4" / "increments of 100" describe label spacing while the gridlines are at 2 and 50).
None of the six enumerates the answer options. Four of six run to 3–4 sentences where
`CB_Math_Style_Spec.md` §7 asks for "1–2 factual sentences" — the shipped forms are equally loose,
so this is noted, not charged.

### Convention conflict worth a one-time decision
The brief requires alt text that "does not reveal the answer". The **binding** spec
(`ultrasat/docs/CB_Math_Style_Spec.md:249`) only requires "1–2 factual sentences (alt text)", and
all five previously shipped modules use **data-complete** descriptions that do reveal the answer —
e.g. `modules-pt5/M3.json` Q15 asks for the vertex and its description says "has its highest point
at (-1, 9)"; `modules/M4.json` Q4 likewise; `modules-pt5/M3.json` Q7 asks how many members won
exactly 5 games and the description lists "4 dots above 5"; `modules/M3.json` Q8 is the identical
archetype to PT6 M3.Q10 and its description gives two points on the line.

PT6 is internally split: **M3.Q10 follows the shipped convention** (gives three points), while
**M3.Q07, M3.Q14 and M4.Q07 withhold the data** — under those three descriptions a screen-reader
user literally cannot answer ("The bars differ in height."). I have graded the three withholding
items MINOR and M3.Q10 OK, because the three comply with the brief as written while M3.Q10 complies
with the binding spec and precedent. **Recommend picking one convention for the whole form**; the
shipped-product answer is the data-complete one.

---

## E. SPR accepted-answer completeness

Reference: `CB_Math_Style_Spec.md:193` — "acceptedAnswers lists **every** legal entry" — and the
project's own canonical enumerator `outputs/modules-pt5/_spr_enum.py`, which generates every entry
string ≤5 chars (6 with a leading minus): the integer form, every equivalent fraction including
unreduced ones, and every fitting decimal (truncated **and** rounded for repeating values).

Ran the enumerator against all 12 PT6 SPR answers:

| Item | Key | Listed | Canonical | Missing |
|---|---|---|---|---|
| M3.Q5 | 7 | 18 | 18 | — |
| M3.Q6 | 94 | 12 | 12 | — |
| M3.Q12 | 12 | 12 | 12 | — |
| M3.Q13 | 7/3 | 15 | 15 | — |
| M3.Q19 | 315 | 5 | 5 | — |
| M3.Q22 | −26/3 | 5 | 5 | — |
| M4.Q5 | 17 | 8 | 12 | `102/6 119/7 136/8 153/9` |
| M4.Q6 | 588 | 3 | 3 | — |
| M4.Q12 | 26.5 | 4 | 6 | `159/6 212/8` |
| M4.Q13 | 10 | 8 | 12 | `60/6 70/7 80/8 90/9` |
| M4.Q19 | 19 | 8 | 12 | `114/6 133/7 152/8 171/9` |
| M4.Q22 | 33/4 | 4 | 5 | `99/12` |

**M3 is exactly complete on all six items. M4 is short 15 entries across five items** — a
systematic gap: whenever the unreduced numerator reaches three digits the M4 list stops early.
Every listed entry in both modules evaluates to the correct value; there are no wrong or extraneous
entries. The required max-precision decimals for the two repeating answers are present
(M3.Q13 `2.333`; M3.Q22 `-8.666` and `-8.667`, both 6 chars with the minus). No answer is < 1, so no
leading-dot forms are applicable.

**Why MINOR and not BLOCKER:** the shipping practice-exam grader
(`apps/web/src/utils/practiceExamScoring.js` → `areStudentResponsesEquivalent`, used by
`PracticeExamController.jsx:345,532`) parses both sides into **exactly reduced rationals** with
BigInt, so a student entering `102/6` is scored correct against the key `17` regardless of the list.
The omissions therefore cannot mis-score anyone on this surface; the practical impact is limited to
the "accepted answers" strings shown in results (`ExamResults.jsx:701`) and to the
`SmartQuiz.jsx:241` path, which does use exact string matching. Still a violation of the binding
"every legal entry" rule and of the standard M3 met, so it should be closed.

---

## F. Well-posedness notes

All 44 stems supply every quantity needed, define every symbol, keep units consistent, and contain
no contradictory givens. Verified specifically: M4.Q8's two-way table is fully self-consistent
(72+18=90, 48+62=110, 72+48=120, 18+62=80, 90+110=120+80=200); M4.Q15's four table rows are exactly
collinear; M4.Q1 yields an integer n=12; M3.Q13's z=7/3 is positive as the stem requires; M3.Q20's
r²=64>0 really is a circle; M3.Q21 has exactly one solution with x positive; M3.Q22's a=−2/3≠0 so f
is genuinely quadratic; M4.Q9's n=625 matches the stated 4-point margin to two decimals.

One wording note, **M4.Q13**: "a boat that can carry a maximum total weight of 2,000 pounds. The
boat and its equipment weigh 260 pounds". A pedant could ask whether the boat's own weight counts
against its own carrying capacity. The reading is nonetheless forced — the 260 is given as a single
lumped figure that cannot be split, and discarding it would make a stated quantity useless — so 10
is the only computable answer. Compare M3.Q11, which is airtight ("The trailer can carry at most 900
pounds" with the kayaks as the load). Suggested tightening: "the combined weight of the boat, its
equipment, and the rowers can be at most 2,000 pounds." Logged as a note, not a defect.

Two within-form repetitions worth the editor's eye (neither is a correctness problem):
M3.Q11 and M4.Q13 are the same archetype (greatest integer count under a weight cap, both
subcategory 15) appearing once in each module; and three items ask for a function value at input 6
(M3.Q2, M3.Q6, M4.Q4).

---

## G. Method / reproducibility

* `math6.py` — 76 sympy/exact-rational assertions re-deriving all 44 keys, every distractor's stated
  derivation, and the exhaustive sweeps of §C. All pass. (One line in the first run reported FAIL
  only because the test itself used float division; the exact-integer rerun confirms DE = 8√3.)
* `svg6.py` — parses all 6 SVGs, asserts uniform axis scaling before recovering each data→pixel
  affine map, then verifies every plotted element (5 bar heights + total, 2 intersection points and
  both drawn angle measures, line slope/intercept and 3 named points, 10 scatter points + the exact
  least-squares refit, 2,001 sampled parabola points, 3 triangle side ratios), plus width, XML
  well-formedness and the scale-note rule.
* `chk.py` — schema, subcategory map, escaping, option-purity, LaTeX, hyphen, asset-existence,
  ordering, key-letter balance and explanation-letter checks across both modules.
* SPR completeness compared against `outputs/modules-pt5/_spr_enum.py`, the project's own enumerator.
* Grader semantics confirmed by reading `apps/web/src/utils/practiceExamScoring.js`,
  `apps/web/src/components/Question.jsx` and `apps/web/src/pages/ExamResults.jsx` rather than
  assuming.
