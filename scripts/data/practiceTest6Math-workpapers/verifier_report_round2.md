# PT6 Math — POST-FIX RE-VERIFICATION (round 2)

**Scope:** `outputs/modules-pt6/M3.json`, `M4.json`, `assets/*.svg` — 44 items.
**Method:** every item re-solved from the item text alone. No claim in `fix_M3_report.md`,
`fix_M4_report.md`, `verify_M3.py` or `verify_M4.py` was taken on trust; the two fix reports
were read for *scope only* and then re-tested against the live files. All arithmetic,
enumeration and figure measurement performed independently in Python/sympy.

**Headline:** **0 BLOCKER · 0 MAJOR · 3 MINOR · 4 NIT.**
The specific failure mode this pass exists to catch — an inequality item shipping with two
correct answers because its check tested only one direction of the boundary — **is not
present.** All three inequality/threshold items (M3 Q11, M4 Q13, M4 Q19) were tested on
*both* sides of the boundary and each has exactly one admissible answer.

**Recommendation: PUBLISH.**

---

## 1. Touched-item table (PRIORITY 1)

Every item the fix round touched, re-solved from scratch. "Key unique" = no second option is
defensible under any reading of the stem. "Distractors" = all three reproduce the recipe named
in `_distractorLogic` **and** are definitively wrong.

### Module 3

| Item | Skill / form | Key re-derived | Key unique | Distractors | Verdict |
|---|---|---|---|---|---|
| **M3 Q3** | ratios, MC | 3,900÷12 = 325; ×20 = **6,500** (C) | yes | 195 = 3900/20 · 3,920 = 3900+20 · 78,000 = 3900×20 — all confirmed, all ≠ key | **PASS** |
| **M3 Q6** | NLF, SPR | 5(2)⁴+9 = 80+9 = **89** | yes | n/a (SPR) — 12 legal entries, set-equal to an independent enumeration | **PASS** |
| **M3 Q7** (alt text) | 1-var data, MC | max bar = **30** (C) | yes | 2 = pool number · 5 = category count · 90 = 18+30+12+24+6 (bar total) | **PASS** |
| **M3 Q8** | lines/angles, MC | co-interior ⇒ 68+x = 180 ⇒ **112** (C) | yes | 22 = 90−68 · 68 = the other marked angle (eyeball trap, named) · 158 = 180−22 | **PASS** — see §3 |
| **M3 Q10** (alt text) | linear fn, MC | (0,8),(2,2) ⇒ m = −3, b = 8 ⇒ **y = −3x + 8** (B) | yes | −3x−8 · 3x+8 · 8x−3 — all confirmed sign/role slips | **PASS** |
| **M3 Q11** | inequalities, MC | 75t+225 ≤ 900 ⇒ t ≤ 9 ⇒ **9** (B) | yes — **exhaustive, §2.1** | 8 = strict-inequality reading · 12 = 900/75 · 20 = 900/45 | **PASS** |
| **M3 Q12** | systems, SPR | x+y = 26, 8x+20y = 352 ⇒ y = **12** (x = 14, checks to 352) | yes | n/a — 12 legal entries, complete | **PASS** |
| **M3 Q14** (alt text) | 2-var data, MC | fit line (2,50)→(23,575), m = 25; at x = 18 ⇒ **450** (D) | yes | 18 = the input · 25 = the slope · 400 = the *observed* point at x = 18 | **PASS** |
| **M3 Q17** | NLF, MC | 3(x−5)²+17; global min over ℝ = **17** (C) at x = 5 | yes | −75 = 3(5)²−30(5) · 5 = vertex x · 92 = f(0). −75 and 5 lie **below the range of f** | **PASS** |
| **M3 Q18** | right triangles, MC | ∠E = 90 ⇒ DF = hyp = 16; DE opposite 60° = **8√3** (D) | yes | 4√3 = EF used as hypotenuse · 8 = EF · 8√2 = 45-45-90 misread. Values 6.93 / 8 / 11.31 / 13.86 all distinct | **PASS** — `_trap` retargeted, string "scale" absent from the whole item |
| **M3 Q19** | 1-var linear, SPR | 7a = 3a+504 **and** 105 = a−21 both give a = **126** | yes — **exhaustive over a, §2.6** | n/a — 9 legal entries, complete | **PASS** |
| **M3 Q20** | circles, MC | 16+400+40−320 = **136** (A); (x+5)²+(y−8)² = 225, r = 15 > 0, so it really is a circle | yes | 225 = c+89 = r² · 416 = linear terms dropped · 696 = both linear signs flipped | **PASS** |

### Module 4

| Item | Skill / form | Key re-derived | Key unique | Distractors | Verdict |
|---|---|---|---|---|---|
| **M4 Q1** | 1-var linear, MC | depletion ⇒ **640 − 16n = 96** (A) (n = 34, exact) | yes | +16n sign error · 16−640n role swap · 16+640n both. All four equations have distinct solutions | **PASS** |
| **M4 Q4** | linear fn, MC | 1.75(6)+2.50 = **13.00** (D) | yes | 2.50 = f(0) · 4.25 = 1.75+2.50 · 10.50 = 1.75(6). Stem now carries "in dollars" | **PASS** |
| **M4 Q7** | NLF, MC | Bézier decodes to Y = X²−2X−3; y-intercept **(0, −3)** (C) | yes | (−3,0) reversal · (−1,0) an x-intercept · (1,−4) the vertex — all real features of the drawn curve, none the y-intercept | **PASS** (see MINOR-1) |
| **M4 Q9** | inference, MC | 18.5 ∓ 1.2 ⇒ plausible interval ⇒ **D** | yes — **exhaustive, §2.3** | A exactness · B individuals-vs-mean · C impossibility. Every option `%`-free | **PASS** |
| **M4 Q11** | right triangles, MC | √(20²+11²) = √521 = 22.8254 ⇒ **22.8** (C) | yes | 9.0 = 20−11 · 16.7 = √(400−121) = 16.703 · 31.0 = 20+11. `_distractorLogic.B` now says **RT**, not DF | **PASS** (see MINOR-3) |
| **M4 Q13** | inequalities, SPR | 34b+74 ≤ 560 ⇒ b ≤ 243/17 = 14.294 ⇒ **14** | yes — **exhaustive, §2.2** | n/a — 12 legal entries, complete | **PASS** |
| **M4 Q15** | 2-var linear, MC | m = 5, b = 10 ⇒ 85 = 5k+10 ⇒ **15** (B) | yes — **exhaustive, §2.5** | 8 = y = 10x+5 interchange (**and** contradicts row 2: x = 8 already maps to 50) · 17 = constant dropped · 19 = constant added | **PASS** |
| **M4 Q18** | lines/angles, MC | 180−47−68 = 65 (vertical) ⇒ 180−65−39 = **76** (C) | yes — **exhaustive, §2.4** | 65 = ∠YVZ en route · 68 = ∠WXV · 115 = 180−65 | **PASS** |
| **M4 Q20** | NLF, MC | 1.44^(t/2) = (1.44^½)^t = 1.2^t ⇒ **500(1.2)ᵗ** (A) | yes — B/C/D fail on a 33-point grid of t | 1.22 = 44/2 · 1.44ᵗ = ÷2 dropped · 1.44²ᵗ = ×2 not ÷2 | **PASS** |
| **M4 Q22** | NLE, SPR | x = 3 ⇒ c = 39; 4x²−25x+39 = (4x−13)(x−3); other root **13/4** | yes (disc = 1; root set exactly {3, 13/4}) | n/a — 9 legal entries, complete | **PASS** |

### All six SPR lists (M3 Q5/6/12/13/19/22, M4 Q5/6/12/13/19/22)

Re-enumerated **from the grader rules written from scratch**, not by importing
`_spr_enum.py`; the project enumerator was then run as a third opinion. All three sets agree
exactly on all twelve items.

| | M3 Q5 | M3 Q6 | M3 Q12 | M3 Q13 | M3 Q19 | M3 Q22 | M4 Q5 | M4 Q6 | M4 Q12 | M4 Q13 | M4 Q19 | M4 Q22 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| key | 7 | 89 | 12 | 7/3 | 126 | −26/3 | 17 | 588 | 26.5 | 14 | 19 | 13/4 |
| listed | 18 | 12 | 12 | 15 | 9 | 5 | 12 | 3 | 6 | 12 | 12 | 9 |
| independent | 18 | 12 | 12 | 15 | 9 | 5 | 12 | 3 | 6 | 12 | 12 | 9 |

Per item, all four conditions hold: **no legal entry missing**, **no illegal or over-length
entry present** (≤ 5 chars, 6 with a leading minus), **every listed entry evaluates to the exact
key**, **canonical form first**, no duplicates, ASCII hyphen for the negative.
Boundary cases spot-confirmed: `126/1`…`882/7` closes at n = 7 (`1008/8` is 6 chars);
`801/9` closes M3 Q6; `171/9` closes M4 Q19; `91/28` closes M4 Q22 (`104/32` is 6 chars);
M4 Q6 legitimately has only 3 forms (`1176/2` and `588.00` both overflow).

---

## 2. Exhaustive-proof section (enumeration sizes and results)

### 2.1 M3 Q11 — integer optimization under a time budget
Enumerated **1,001** integer values of *t* in [0, 1000] against 5(45) + 75t ≤ 900.
Feasible set = {0, …, 9}; **maximum = 9**, unique.
Both directions of the boundary tested: t = 9 → exactly 900 min (**admissible** under "at most");
t = 10 → 975 min (**inadmissible**). The strict-inequality misreading yields 8, which is
exactly distractor A, and 900/75 = 12 (C), 900/45 = 20 (D) are reproduced. No second option is
the *greatest* feasible value, so the "greatest" ask leaves no ambiguity.

### 2.2 M4 Q13 — integer optimization under a volume budget
Enumerated **1,001** integer values of *b* in [0, 1000] against 34b + 74 ≤ 560.
Feasible set = {0, …, 14}; **maximum = 14**, unique. b = 14 → 550 L used, slack 10 L (< 34, so no
15th barrel); b = 15 → 584 L, inadmissible. 486/34 = 243/17 = 14.294.
**Direction robustness:** the boundary is *not* tight here, so the strict-inequality reading
(34b + 74 < 560) also returns 14. This item cannot reproduce the earlier form's two-answer
failure. The alternative "ignore the 74 L" reading gives 16, which is neither the key nor a
listed accepted answer.

### 2.3 M4 Q9 — margin of error about a mean
n = 400, mean 18.5 h, MoE 1.2 h ⇒ interval [17.3, 19.7]; the stated margin is realised by
s = 1.96⁻¹(1.2)√400 = **12.2449 h**.
Enumerated **399** admissible 400-value sample shapes (low-group size k = 1…399), each
constructed to have mean *exactly* 18.5 and sample sd *exactly* 12.2449, i.e. each reproducing
the stem's statistics precisely.
Count of individuals falling inside [17.3, 19.7], across all 399 shapes: **{0, 397, 398, 399}** —
**never 400.** At least one volunteer always falls outside the interval, so **proposition B is
false in every admissible configuration**, not merely in a convenient one. (E.g. k = 200 gives a
non-negative, fully realistic sample at 6.27 h and 30.73 h with **zero** individuals inside.)
Truth over the family: A not entailed (18.5 is a sample estimate); B false everywhere; C false
(the margin gives plausible, not impossible, bounds); **D is the sole valid inference.**
Endpoint arithmetic in options B/C/D re-checked: 18.5 − 1.2 = 17.3, 18.5 + 1.2 = 19.7.

### 2.4 M4 Q18 — multi-triangle angle chaining
Enumerated **1,584** constructed intersecting-segment configurations
(24 bearings × 11 direction offsets × 6 distance quadruples, degenerate/collinear pairs skipped).
In every one, segments WY and XZ genuinely cross at V and the identity
**m(∠YZV) = m(∠XWV) + m(∠WXV) − m(∠ZYV)** holds: max deviation **9.58 × 10⁻¹³**, **0 violations**.
The item's own configuration was then built by the law of sines and its angles *measured*:
∠XWV = 47.000000°, ∠WXV = 68.000000°, ∠WVX = 65.000000°, ∠ZYV = 39.000000°,
∠YVZ = 65.000000° (vertical, verified), **∠YZV = 76.000000°**. Collinearity W–V–Y and X–V–Z with
V strictly between was asserted, not assumed.
Integer scan over **1,895,789** admissible (∠XWV, ∠WXV, ∠ZYV) triples with both triangles valid;
holding 47 and 68 fixed, the only third angle producing 76 is **39** — unique.
Degeneracy note: V cannot coincide with W, X, Y or Z, because each of the four named angles would
then be undefined; so the vertical-angle step is forced, not assumed.

### 2.5 M4 Q15 — three-row table → k
Two points determine a unique line: (3,25),(8,50) ⇒ m = 5, b = 10 ⇒ y = 5x + 10.
Dense rational scan of **16,001** values of k over [−1000, 1000] in steps of 1/8 against
5k + 10 = 85 ⇒ **exactly one solution, k = 15**. sympy `solve` over ℝ agrees.
Every option tested against the table's own relation: 8 → 50, 15 → 85 ✓, 17 → 95, 19 → 105.
k = 8 is doubly dead — it also contradicts row 2, where x = 8 already maps to y = 50.

### 2.6 Supporting exhaustive proofs (not requested, run anyway)
* **M3 Q19** — scanned **4,001** integer values of *a*: infinitely many solutions **only** at
  a = 126; the no-solution case **never** occurs, so the stem's condition is unambiguous.
  The coefficient condition and the constant condition were solved separately and each forces 126.
* **M3 Q17** — sympy global minimum over ℝ = 17, attained only at x = 5; −75 and 5 lie strictly
  below the range of f, so neither is *any* value of f.
* **M4 Q16** — determinant 5k − 60 vanishes only at k = 12, and at k = 12 the solution set is
  **empty** (no solution, not infinitely many); integer scan of [−500, 500] confirms uniqueness.
* **M4 Q19** — full integer scan of k ∈ [−1000, 1000]: k² < 400 ⟺ −19 ≤ k ≤ 19. k = 20 gives
  discriminant **0** (one real solution) and is correctly excluded; greatest = **19**.
  The explanation states the biconditional ("true exactly when −20 < k < 20"), so both directions
  are on the page.
* **M4 Q20** — all four options tested for equivalence on 33 grid values of t; only A.
* **M3 Q4 / M4 Q2** — all eight options expanded symbolically; exactly one equivalent each.
* **M3 Q21 / M4 Q22** — full root sets recovered and the discarded root's y-value confirmed as
  the named distractor.

---

## 3. PRIORITY 2 — `assets/PT6-M3-Q08.svg` figure analysis

**(a) Actual drawn geometry (measured, not read off the report).**
Line *r* = (50,90)→(330,90) and line *s* = (50,190)→(330,190): both exactly horizontal, so
**r ∥ s is true in the drawing** (dy = 0 for both). Transversal *t* = (250,40)→(156,272),
direction (−94, +232), i.e. upper-right to lower-left — matching the alt text.
Intersections recovered from the line equations: t×r = (229.741, 90), t×s = (189.224, 190).
The drawn dots (230, 90) and (189, 190) sit on them to within 0.26 px and 0.22 px.

Each label was proved to lie **strictly inside its own wedge** by a positive-combination test
(both cone coefficients > 0):

| wedge | position | label | positive-combination coeffs | **drawn measure** |
|---|---|---|---|---|
| at *r*, right of *t*, **below** *r* | (266, 120) | `68°` | 48.414, 0.129 → inside | **112.06°** (obtuse) |
| at *s*, right of *t*, **above** *s* | (224, 176) | `x°` | 29.103, 0.060 → inside | **67.94°** (acute) |

The fix report's claim is confirmed exactly: the wedge carrying "68°" is drawn at 112.06°, and
the wedge carrying "x°" is drawn at 67.94°, so eyeballing yields 68 = choice B.

**(b) The GIVEN measures determine the answer uniquely and correctly.**
Both labelled angles are **interior** (between r and s) and both lie on the **same side** of the
transversal (right of t). Co-interior angles across a transversal of parallel lines are
supplementary, so 68 + x = 180 ⇒ **x = 112**, uniquely. The keyed option C = 112. Correct.

**(c) Scale note.** `Note: Figure not drawn to scale.` is present as a text node at (190, 308),
inside the 380×320 viewBox. It is also announced in `graphDescription` ("A note below the figure
states that the figure is not drawn to scale."), so a screen-reader user is told the drawing
is unreliable. Present and correct.

**(d) No other option becomes defensible; the figure is not self-contradictory.**
* The two drawn wedges sum to **180.0000°** — the drawing is *internally* consistent with r ∥ s.
  Only the label-to-wedge assignment is off-scale; no drawn relationship contradicts a given.
* There is **no labelled right angle** anywhere in the file (no right-angle marker path, no "90°"
  text), so the disqualifying case named in the brief does not arise.
* Choices 22 and 158 correspond to no drawn quantity at all. Choice 68 is the eyeball value and
  is explicitly named as such in both the rationale ("the angle marked x° is drawn as an acute
  angle, but the figure isn't drawn to scale") and `_distractorLogic.B`. It is a *trap*, not a
  second defensible key: the stem's given 68° plus the stated parallelism forces 112 regardless
  of the drawing.
* SVG text nodes are exactly `r`, `s`, `t`, `68°`, `x°`, and the scale note — no stray markup.
* File parses as well-formed XML.

**Q08 figure verdict: PASS.** The deliberate distortion is legitimate, disclosed, disclosed in
the alt text as well, and does not create a second answer.

---

## 4. PRIORITY 3 — regression sweep over all 44

| Check | Result |
|---|---|
| **Keys** | All **44** re-derived independently (sympy / exact rationals). **0 mismatches.** |
| **Distractors** | **96** distractors audited (91 by automated recipe reproduction + M4 Q9/Q10's 6 verbal options by hand). Every one reproduces its stated `_distractorLogic` recipe and is definitively wrong. One automated flag (M4 Q3 option A) was a string-format artifact — `"0.5"` vs my `Fraction(1,2)`, identical value. |
| **Option collisions** | No MC item has two options equal in value; no duplicate option strings. |
| **SPR** | 12/12 lists complete and legal (see §1 table). 0 missing, 0 illegal, 0 over-length. |
| **Explanation arithmetic** | Every derivation step in all 44 explanations hand-verified. An automated `A op B, or C` extractor produced 3 apparent failures, all regex artifacts (M4 Q5 "121 − 70, or 3y = 51"; M4 Q12 "1 + 15/100, or 1.15" ×2) — all three arithmetically correct. |
| **Schema** | All 17 required fields present on all 44 items; no unexpected fields; MC = 4 options with 0 ≤ index ≤ 3; SPR options `[]`, string key, non-empty `acceptedAnswers`; `graphAsset`/`graphDescription` paired on all 6 figure items and null together elsewhere. |
| **subcategory / subcategoryId** | One consistent 18-pair map across both modules; **zero conflicts** (11 1-var-lin, 12 lin-fn, 13 2-var-lin, 14 systems, 15 ineq, 16 NLF, 17 NLE, 18 EE, 19 ratios, 20 pct, 21 1-var-data, 22 2-var-data, 23 prob, 24 inference, 26 area-vol, 27 LAT, 28 RTT, 29 circles). |
| **Options plain text** | Zero markup tags, zero U+2212, zero en/em dashes, zero angle brackets, zero whitespace padding. ASCII hyphens throughout. |
| **Escaped `<` / `>`** | Zero bare `<` or `>` in any explanation. The one strict inequality (M4 Q19) uses `&lt;` correctly. M3 Q11 and M4 Q13 use Unicode `≤`, which renders safely. |
| **Newlines / stray markup** | Zero newlines and zero markup tags in every `explanation`, `graphDescription`, `_archetype` and `_trap`. Markup appears only in `passage` (div/p/i/sup/table), which the spec licenses. |
| **Rationale liturgy** | Every MC explanation opens `Choice X is correct.` and carries all three `Choice Y is incorrect` dismissals; every SPR opens `The correct answer is`. The entry-forms note appears on exactly the four non-integer SPRs (M3 Q13, M3 Q22, M4 Q12, M4 Q22) and nowhere else. |
| **SVGs re-measured** | All six parse as well-formed XML and every alt-text datum was re-derived from the drawing: M3 Q07 bar heights **18/30/12/24/6** (6 px per snail, total 90 = distractor D); M3 Q10 segment → slope −3, intercept 8, with (0,8),(2,2),(4,−4) all on it; M3 Q14 all ten points + fit line (2,50)→(23,575), slope 25, prediction 450, gridlines 2 units / 50 units; M4 Q07 Bézier decoded to **Y = X² − 2X − 3 = (X−3)(X+1)** giving x-int (−1,0),(3,0), y-int (0,−3), vertex (1,−4); M4 Q11 legs 88 px/160 px at 8 px per unit with the right-angle marker at T; M3 Q08 per §3. |
| **Tables** | M4 Q8 two-way table internally consistent on all four marginals and the grand total (200, matching the stem). M4 Q15 table = 3 rows, header wording matches. |
| **graphDescription** | Data-complete and factual on all six. No interpretive/answer-announcing vocabulary (`therefore`, `predicted`, `the equation of`, `greatest number of`). One item states the key verbatim — see MINOR-1. |
| **Blueprint** | M3 9E/7M/6H, ALG 8 / ADV 7 / PSDA 3 / GEO 4, traps 17 distinct/17. M4 9E/7M/6H, ALG 7 / ADV 7 / PSDA 4 / GEO 4, traps 19 distinct/19. Both modules: single ramp dip at Q10, key letters **A4 B4 C4 D4**, SPR at 5/6/12/13/19/22. Visuals 4 + 4. |
| **Fix-mandate token bans** | All 8 re-tested and passing: no `scale` in M3 Q18; no weight-cap vocabulary in M3 Q11; no time/weight/kayak vocabulary in M4 Q13; no `DF`/`DEF` in M4 Q11; no fee/charge/monthly in M4 Q1; no function language in M4 Q22; no `%`/percent in M4 Q9; no printing/paper vocabulary or the numerals 2,520 / 420 in M3 Q3. Label sets *DEF* / *RST* / *WXYZV* mutually disjoint. |

### Findings

**MINOR-1 — M4 Q7 alt text states the key verbatim.**
`graphDescription` reads "…crosses the y-axis at (0, −3)…", which is the keyed option string
exactly. This is a direct consequence of the corrected data-complete alt-text policy (D3), and
for a *read-the-intercept* item a sighted student reads the same fact off the figure, so the
information is not additional. But it does neutralise the ordered-pair-reversal trap for
screen-reader users, and M4 Q7 is the **only** item in the form where this happens. (M3 Q7's alt
text contains "30", but only as one of five bar heights and as an axis label, so the student
still has to select the maximum; M3 Q10, M3 Q14, M3 Q08 and M4 Q11 all still require work.)
No action required to publish; flag for the alt-text policy owner.

**MINOR-2 — `fix_M4_report.md` carries a stale, false claim.**
Its closing note 1 says *"112 is now the answer at both M3 Q8 and M3 Q19."* The live M3 Q19 key
is **126**, not 112 — exactly as `fix_M3_report.md` §D2 describes ("126 was chosen partly to
avoid a new internal echo: 112 … is Q8's key"). The M4 author evidently read `M3.json` at an
intermediate state. **The modules are correct; the documentation is wrong.** Worth correcting so
a future round does not "fix" a non-existent collision.

**MINOR-3 — M4 Q11's figure is drawn exactly to scale yet carries the not-to-scale note.**
Both labelled legs measure exactly 8 px per unit (TS = 88 px ↔ 11, TR = 160 px ↔ 20), so the
drawn hypotenuse measures 182.60 px ⇒ 22.83, i.e. the "closest to" ask is solvable by ruler.
Harmless in the sense that measurement yields the *correct* key and the note is a disclaimer
rather than a claim, but it is the inverse of the M3 Q08 design and worth noting. Related: M4
Q11's `graphDescription` does **not** mention its scale note, whereas M3 Q08's does — an
inconsistent alt-text convention between the form's two geometry figures.

**NIT-1 — M3 Q10 alt text mixes conventions.** "The x-axis is marked in increments of 1 …
the y-axis … in increments of 2." Both are true of the *gridlines* (x every 30 px = 1 unit,
y every 35 px = 2 units), but the printed numerals on the x-axis appear every 2 units. Factual,
just not parallel in phrasing to M4 Q7's "gridlines at every 1 unit … labeled at every 2 units".

**NIT-2 — four items have key = question number.** M3 Q12 → 12, M3 Q17 → 17, M4 Q15 → 15,
M4 Q19 → 19. Found independently; not flagged by any prior report. Unexploitable (wrong on 40 of
44 items) and two of the four are SPR, but it is the largest cosmetic pattern in the form.

**NIT-3 — mixed inequality rendering.** M3 Q11 and M4 Q13 use the Unicode `≤`; M4 Q19 uses the
entity `&lt;`. Both render correctly; house-style only.

**NIT-4 — 225 appears as M3 Q11's derivation constant (5 × 45) and as M3 Q20's distractor B.**
Pre-existing, already logged by the fix round; neither is a key.

---

## 5. PRIORITY 4 — cross-item hygiene

### Keyed 12 — M3 Q9, M3 Q12, M4 Q16

| | module | pos | format | skill | difficulty | what "12" means |
|---|---|---|---|---|---|---|
| M3 Q9 | 3 | 9 | MC (A) | area-volume (GEO) | M | a height in inches |
| M3 Q12 | 3 | 12 | **SPR** | systems-linear-equations (ALG) | M | a count of large trays |
| M4 Q16 | 4 | 16 | MC (D) | systems-linear-equations (ALG) | M | a parameter forcing no solution |

The risk criterion that actually matters is **same module + nearby positions + same skill**.
No pair satisfies all three:
* **M3 Q9 / M3 Q12** — same module and only 3 apart, but different domain (GEO vs ALG),
  different format (MC vs SPR) and unrelated pipelines (V = lwh inverted vs a two-totals system).
  A student cannot transfer one answer to the other.
* **M3 Q12 / M4 Q16** — same skill and band, but different modules, different formats (SPR vs
  MC) and radically different archetypes (word-problem elimination vs a solution-count parameter
  hunt). Cross-module transfer is not a realistic pattern.
* **M3 Q9 / M4 Q16** — nothing shared but the value.

**Assessment: harmless coincidence**, though a three-way tie on one value in a 44-item form is
above chance and 12 is a conspicuously "round" small answer.

### Keyed 17 — M3 Q17, M4 Q5
Different modules, different skills (nonlinear-functions vs systems), different formats
(MC vs SPR), different difficulty bands (Hard vs Easy), positions 17 and 5.
**Assessment: harmless coincidence, no action.**

### Distractor↔key echoes (checked as a by-product)
Fourteen exist across the form; all involve small integers (2, 5, 8, 12, 14, 17, 19, 68) and all
are distractor-to-key, never key-to-key. The three same-module instances worth a glance are
M4 Q15 option D = 19 = M4 Q19's key (4 positions apart), M4 Q15 option C = 17 = M4 Q5's key, and
M3 Q8 option B = 68 = M3 Q2's key. All are forced by the distractor recipes and none is
exploitable. No action.

### Single recommended change
**None is required to publish.** If the editor wants exactly one change, make it **M3 Q12**, and
it is the highest-yield single edit available: re-tuning its numbers (a plain two-totals system
— change the roll total and one tray capacity) simultaneously
(i) breaks the only three-way key tie in the form,
(ii) dissolves the only same-skill key pair (M3 Q12 / M4 Q16),
(iii) dissolves the only same-module nearby key pair (M3 Q9 / M3 Q12), and
(iv) removes one of the four key-equals-question-number coincidences (NIT-2),
all without touching its archetype, difficulty, position, format, key letter distribution, SPR
census or the blueprint. The only consequential follow-up is re-running the SPR enumerator for
the new key. Changing M4 Q16 instead would address (i) and (ii) but leave (iii) and (iv) standing.

---

## 6. Recommendation

# PUBLISH

**Reasons.**
1. **All 44 keys are correct** and were re-derived independently from the item text, with no
   reliance on the fix reports or the project's own verifiers.
2. **All 96 distractors are definitively wrong**, each reproduces the recipe its
   `_distractorLogic` claims, and no item admits a second defensible option — checked
   item-by-item, including the four verbal-option items where no arithmetic recipe exists.
3. **The specific regression this pass exists to prevent did not recur.** All three
   inequality/threshold items were tested on *both* sides of their boundary. M3 Q11's boundary is
   tight and admits t = 9 only; M4 Q13's boundary is slack, so even the strict reading returns 14;
   M4 Q19 correctly excludes k = 20 (discriminant 0 ⇒ one real solution) and its explanation
   states the biconditional. Two additional condition items (M3 Q19 infinitely-many, M4 Q16
   no-solution) were proved unique by exhaustive parameter scans.
4. **Five exhaustive proofs** were run at the sizes requested — 1,001 / 1,001 / 399 /
   1,584 + 1,895,789 / 16,001 configurations — plus seven more not requested. Every one returned
   a unique admissible answer matching the shipped key.
5. **The Q08 figure is sound.** The distortion is confined to angle sizes, the drawn lines are
   genuinely parallel, the drawn pair still sums to 180°, no right angle is labelled, the scale
   note is present in both the SVG and the alt text, and the given measures force x = 112
   uniquely. The eyeball value 68 is a named trap, not a second key.
6. **Zero schema, hygiene, escaping, markup, SPR or blueprint defects** across 44 items and six
   figures.

**Carry-forward (post-publication, non-blocking):** correct the stale claim in
`fix_M4_report.md` (MINOR-2); decide the alt-text policy question raised by M4 Q7 (MINOR-1) and
apply the resulting convention consistently to M4 Q11's missing scale-note sentence (MINOR-3).
