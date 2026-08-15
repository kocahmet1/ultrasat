# Critic Report — PT6 Math Modules 3 & 4 (44 items)
### College Board authenticity audit vs `docs/CB_Math_Style_Spec.md` + `analysis/blueprint_pt6_math.md` (as corrected 2026-08-14)

Method. Every count below was recomputed from `modules-pt6/M3.json`, `M4.json` and `assets/*.svg`.
The two selfchecks and the two `verify_*.py` scripts were read as **claims, not evidence**; three of
their claims are falsified here. All 44 keys and all 96 MC distractor recipes were re-solved by hand
or symbolically; all 6 SVGs were re-parsed and their pixel geometry mapped back to data coordinates
through the tick-label text nodes only; the shipped sister forms
`scripts/data/practiceTest4Math.json` and `practiceTest5Math.json` were diffed item-by-item; and the
PT4 and PT5 critic reports were re-read to hold a consistent bar. Rationale and stem lengths were
measured with an **all-token ruler** (every whitespace-delimited token after tag-stripping, numerals
and operators included) — the ruler that reproduced the PT4/PT5 round-1 numbers, not the numeral-
dropping counter the PT5 fix round introduced.

**Headline: mathematically the cleanest of the three forms — 44/44 keys unique, 96/96 distractors
nameable, zero arithmetic errors, and the SPR census, applied share, stem caps, ramp and key balance
all land exactly. What it does not do is differentiate: five items re-run a shipped PT4/PT5 archetype,
half of Module 3's hard band is labelled aspirationally, Module 4's SPR accepted-answer lists are
systematically incomplete, and the form's headline new trap family is delivered in name only.**

---

## 1. Form-level scoreboard (target vs actual)

| # | Check (source) | Target | Actual | Verdict |
|---|---|---|---|---|
| 1 | Items / format per module (§1a) | 22 = 16 MC + 6 SPR | 22 = 16 MC + 6 SPR, both | **PASS** |
| 2 | Module metadata (§8) | modNum 3/4 · "Math" · calc true · 2100 · desc "Module 1/2" | exact on both; titles "Exam 6, Module 3/4" match house form | **PASS** |
| 3 | Domain quota, form (blueprint corrected) | ALG 15 / ADV 14 / PSDA 7 / GEO 8 | **ALG 16 / ADV 13** / PSDA 7 / GEO 8 | **FAIL — known (M4 Q22)** |
| 4 | Domain quota, per module | M3 8/7/3/4 · M4 7/7/4/4 | M3 **8/7/3/4 exact** · M4 **8/6**/4/4 | **M3 PASS · M4 FAIL — known (Q22)** |
| 5 | Skill quota, all 19 rows | 1var3·lf4·le2v3·sys3·ineq2·NLF7·NLE4·EE3·rrp2·pct1·1var-data1·2var-data1·prob1·inf1·AV2·LAT2·RTT2·circ2·ESC0 | 17 of 19 rows exact; **lf 5 (target 4)** and **NLE 3 (target 4)** | **FAIL — known (M4 Q22)** |
| 6 | Probability in M4 only | yes | M4 Q8 only | **PASS** |
| 7 | Circles ≥1 per module | yes | M3 Q20, M4 Q21 | **PASS** |
| 8 | evaluating-statistical-claims | 0 | 0 | **PASS** |
| 9 | Difficulty mix | 9E/7M/6H both modules | M3 9/7/6 · M4 9/7/6 | **PASS** |
| 10 | Ramp: monotone, exactly ONE dip, both at position 10 | yes | both modules `E×8 · M(9) · E(10) · M×6 · H×6` — one dip each, at Q10, matching §1d's parenthetical | **PASS** |
| 11 | SPR positions & difficulty | 5,6,12,13,19,22 = E,E,M,M,H,H | exact in both modules | **PASS** |
| 12 | SPR census | 8 int (≥1 three-digit) · 3 frac (M3 Q22 the form's only negative) · 1 dec | **8 int (315, 588 three-digit) · 3 frac (7/3, −26/3, 33/4) · 1 dec (26.5); −26/3 is the only negative** | **PASS (exact)** |
| 13 | acceptedAnswers completeness (§6) | every legal entry, ≤5 chars (6 w/ minus) | M3: 6/6 lists **exhaustive**. M4: **5 of 6 lists incomplete — 15 legal entries missing** (Q5 ×4, Q12 ×2, Q13 ×4, Q19 ×4, Q22 ×1). Nothing illegal or over-length anywhere | **FAIL (M4 only)** |
| 14 | Entry-forms note | on non-integers only | on exactly M3 Q13, M3 Q22, M4 Q12, M4 Q22; on no integer | **PASS** |
| 15 | Visual quota & types | 4/module: M3 bar·geometry·line·scatter; M4 parabola·two-way·geometry·data table | exactly those 8; **bar graph delivered** (new to the series); zero histograms, zero box plots | **PASS** |
| 16 | Scale note placement | geometry figures only | M3-Q08 and M4-Q11 only; neither coordinate grid nor the bar graph carries it | **PASS** |
| 17 | Hard geometry figure-less | yes | M3 Q18, M3 Q20, M4 Q18, M4 Q21 all verbal | **PASS** |
| 18 | SVG conventions (§8) | 380px · Georgia · arrowed axes · italic vars · italic *O* · #cccccc unit gridlines · roman axis titles w/ units | all met; **origin *O* italic on all four figures that carry one** (PT4's harmonisation note finally closed); **no gridline gaps** on any of the three grids (PT4's Q4 defect not repeated) | **PASS** |
| 19 | Figure geometry re-measured | drawn values must match the item | M3-Q07 bars = 18/30/12/24/6 (total 90, unique max 30) · M3-Q08 transversal makes **67.94°** ≈ 68° · M3-Q10 line is exactly *y* = −3*x* + 8 through (0,8)(2,2)(4,−4) · M3-Q14 the drawn line **is** the exact least-squares fit (*y* = 25*x*, residuals sum 0) and the plotted point at 18 sits at 400 · M4-Q07 Bézier reproduces *y* = *x*² − 2*x* − 3 exactly · M4-Q11 exactly 8 px/unit on all three sides | **PASS (best figure set of the three forms)** |
| 20 | graphDescription factual & answer-free | 1–2 factual sentences | all 6 present and factual, **except M4 Q7** ("tick marks at every 2 units" — the grid is at every **1** unit). House rule is inconsistent: **M3 Q10 hands over three lattice points** (key fully derivable without the figure) while **M3 Q7, M3 Q14 and M4 Q7 withhold every number the item needs** | **PASS w/ FIX at M4 Q7** |
| 21 | Key-letter balance | 4/4/4/4 ±1 per module | M3 **4/4/4/4** · M4 **4/4/4/4**; no run of three | **PASS** |
| 22 | Numeric options ascending | ~90%+ | 22/22 numeric sets strictly ascending, incl. the radical set M3 Q18 (4√3<8<8√2<8√3), the π set M4 Q21 and the ordered-pair set M4 Q7 | **PASS** |
| 23 | Options plain text (§8) | no HTML/entities/LaTeX, ASCII hyphen | 128 option strings: 0 tags, 0 entities, 0 Unicode minus | **PASS** |
| 24 | Bare `<`/`>` escaped | all | 0 stray brackets in any `passage`/`text`/`explanation`; M4 Q19's `&lt;` correctly escaped | **PASS** |
| 25 | HTML tables (§8) | bordered, centered, bold headers; two-way has Total row **and** column | M4 Q8 has both Totals and all six margins re-sum correctly; M4 Q15 bordered/centred/`<th>`. **M4 Q15's headers `x`/`y` are not italicised** (PT5 M3.08 uses `<i>x</i>`) | **PASS w/ cosmetic FIX** |
| 26 | Explanation field format | house convention (0 tags, 0 newlines in 88 shipped items) | **M4 Q20's explanation uses `<sup>` tags** (unique in 347 items) and **16 of M4's explanations contain literal `\n\n`** (0/88 precedent; M3 has none) | **FAIL (M4 only, cosmetic)** |
| 27 | Exactly one trap per item, matching blueprint | 17 M3 + 19 M4, SPR slots blank | every trapped item carries its blueprint-assigned mechanism; trap-free slots are exactly the blueprint's blank cells (M3 Q5/6/12/13/19; M4 Q5/6/13) | **PASS** |
| 28 | Form trap tally (blueprint form-line) | not-to-scale 1 · nesting 1 · unit-chain 1 · MoE 1 · solution-count 2 · wrong-target 2 · slope/intercept 3 · reciprocal 1 · ordered-pair 2 · sign-slip 1 · radius/diameter 1 · formula-fragment 1 · exponent 2 · percent 1 | every row delivered **except wrong-target = 1** (M3 Q22 only). The blueprint's own slot tables schedule only one wrong-target and four slope/intercept swaps — its form-line and its slot tables disagree; the writers followed the slot tables | **PASS (blueprint-internal inconsistency, not a writer miss)** |
| 29 | New trap family "not-to-scale doubt" ×1 | present and instantiated | **nominal only.** M3 Q18 ships **no figure**, so nothing is drawn out of scale to doubt. The mechanism actually embodied in its distractors is "assumed the legs are congruent" (8√2) and "mis-seated the hypotenuse" (4√3) — two ordinary slips | **FAIL** |
| 30 | Spec §5 residual families | robustness ~1 · must-be/could-be ~1 · extraneous/nonreal ~1 | robustness **0** (PT4 0 → PT5 1 → PT6 0) · load-bearing must/could **0**, and **no CAPS negation anywhere in the form** · nonreal ✔ 1 (M4 Q19) | **FAIL (2 of 3) — regression vs PT5** |
| 31 | Applied share (§2c 30–35%) | blueprint 14/44 ≈ 32% | **14/44 = 31.8%** under the identical rule that scored PT4 39% and PT5 39%/34%: M3 Q3,7,9,11,12,14,15 = 7; M4 Q1,3,4,8,9,10,13 = 7 | **PASS (first clean pass of the series)** |
| 32 | Applied by domain (§2c reference) | PSDA ~85 · ALG ~40 · ADV ~20 · GEO ~10 | PSDA 6/7 = 86% ✔ · ALG 6/16 = 38% ✔ · GEO 1/8 = 13% ✔ · **ADV 1/13 = 8%** vs ~20% | **PASS w/ note (ADV thin, as in PT5)** |
| 33 | Stem length caps (§2b) | equiv ≤15 · abstract ≤35 · applied ≤55 · stat ≤75 | **44/44 inside cap on the all-token ruler.** Tightest: M3 Q22 35/35, M4 Q14 34/35, M4 Q22 34/35, M3 Q21 34/35, M3 Q14 53/55, M4 Q9 67/75. Equivalent-expressions: M3 Q4 9/15, M4 Q2 14/15 | **PASS (PT5's cap failure closed)** |
| 34 | Rationale liturgy (§7) | openers · curly "It's given" · gerund-yields · "Therefore," · letter-order dismissals · SPR no dismissals | **44/44 exact.** 32/32 MC openers match the key letter; 96/96 dismissals in strict letter order; 44/44 close on "Therefore,"; 0 straight apostrophes; 0 dismissals inside an SPR | **PASS** |
| 35 | Rationale lengths (§7) | MC 110/135/170 · SPR 40/100/130 | **0 items ≥1.45×** (max 1.41, M3 Q14; min 0.71, M3 Q13) — but band means are **over in 11 of 12 bands and longer than PT5 in 5 of 6 MC bands**: M3 E-MC 134.6 (+22%) · M-MC 177.6 (+32%) · H-MC 213.2 (+25%); M4 E-MC 135.0 (+23%) · M-MC 178.8 (+32%) · H-MC 197.0 (+16%). MC mean ratio **1.25** | **PARTIAL — item-level PASS, systemic regression vs PT5** |
| 36 | Voice fingerprint (§2a) | no "you/we", no imperative, no double question, constants declared, units comma-interpolated, where-clauses, "closest to" on estimates | 0 "you/we/let's", 0 imperatives, 0 double questions, 0 exclamations, 0 "None of the above"; all 7 parameter items declare their constants; "closest to" at M4 Q11. **One unit miss: M4 Q4's terminal question omits ", in dollars,"** while its options are bare money decimals | **PASS w/ 1 FIX** |
| 37 | Mathematical airtightness (§9.2) | unique key, all distractors wrong and nameable | **44/44 keys unique; 96/96 distractors re-derived and each closes under one nameable recipe.** Zero arithmetic errors. M4 Q18's sufficiency claim verified over the general similar-triangle family | **PASS** |
| 38 | Named people / Latin binomial | ≤2 per module, new names; exactly 1 binomial | Anika (M3 Q12), Priya (M4 Q1) — 1 per module, neither Nadia/Mateo/Idris ✔; *Littorina fuscopunctata* ×1, italic, M3 Q7 ✔ (**epithet invented — the same note PT5 drew for *nivalescens***) | **PASS w/ note** |
| 39 | Context firewall vs PT4/PT5 | zero reuse | all 14 PT6 contexts absent from both shipped forms; no PT4/PT5 context word appears anywhere in PT6 | **PASS** |
| 40 | Internal 44×44 collisions | none | **M3 Q11 and M4 Q13 are the same item** — a pounds weight cap plus a fixed load, "greatest number of" a small watercraft. Soft echoes: three items evaluate a function at exactly **6** (M3 Q2, M3 Q6, M4 Q4); both Q22s are "two conditions on f fix a and b"; the value **12** is the answer at M3 Q9, M3 Q12 and M4 Q16; 15% appears at M3 Q15 and M4 Q12 | **FAIL (1 hard collision)** |
| 41 | Cross-form archetype differentiation | different archetype wherever a skill repeats | **5 repeats of shipped items** — M3 Q6 = PT4 M3.06 (same slot, band, format, archetype); M3 Q20 = PT4 M4.20; M4 Q18 = PT4 M4.18; M4 Q1 = PT4 M3.02 / PT5 M4.01 (third consecutive form); M4 Q15 = PT5 M3.08. All five were **scheduled by the blueprint** | **FAIL** |
| 42 | Difficulty-label honesty | hard band must earn it | M4's six hard items all earn it. **M3's do not: Q17 (vertex-*x* from −b/2a), Q18 (bare 30-60-90) and Q19 (coefficient match with the *x*-terms already identical) are Medium-grade tasks**; Q19's rationale at 0.75× its band norm corroborates | **FAIL (M3)** |

**Scoreboard: 30 PASS · 2 PARTIAL/PASS-with-FIX · 10 FAIL** (rows 3, 4, 5, 13, 26, 29, 30, 40, 41, 42).
Rows 3–5 are the single known M4 Q22 correction and are not re-litigated.

---

## 2. Item-by-item verdicts (44 rows)

| Item | Grade | Reason (one line) |
|---|---|---|
| M3.01 | PASS | 4(x+8)=52 → 5; echo(8) / half-distribute(11) / x+8(13) all close; textbook opener. |
| M3.02 | PASS | f(6)=68 frictionless; x / f(0) / dropped-constant trio (soft archetype echo of PT4 M4.06). |
| M3.03 | PASS | 420×6 with divide / add / ×60 trio; honest easy, print-shop context is dry. |
| M3.04 | PASS | 9-word stem against a 15-word cap; difference-of-squares with both sign errors plus the 49x slip. |
| M3.05 | PASS | Abstract conversion delivered as promised; 18 accepted forms, exhaustive to the character. |
| M3.06 | **FIX** | Same slot, band, format and archetype as shipped PT4 M3.06 (evaluate a quadratic at a point). |
| M3.07 | PASS | Bar heights re-measure 18/30/12/24/6; pool-number / category-count / total trio (alt text omits the heights — note). |
| M3.08 | PASS | Transversal drawn at 67.94°; complement / other-angle / chained trio (archetype = PT4 M4.03 — note). |
| M3.09 | PASS | Solve-backwards volume — exactly the repair PT5's critic prescribed; ÷length / ÷width / base-area ladder. |
| M3.10 | PASS | Line re-derived as y = −3x + 8 through three lattice points; sign / sign / swap grid (alt text discloses those points — note). |
| M3.11 | PASS | 75t + 225 ≤ 900 → 9; strict-boundary bait genuinely lands (collides with M4 Q13 — see that row). |
| M3.12 | PASS | Two-totals system, 8x + 20y = 352 → 12; clean integers, one named person. |
| M3.13 | PASS | Literal rearrangement to 84/36 = 7/3; 15 accepted forms complete (71-word rationale = 0.71× — thin medium). |
| M3.14 | PASS | Drawn fit line **is** the exact least-squares line and the observed point at 18 sits at 400 — the sharpest figure in the form. |
| M3.15 | PASS | 24,000(0.85)ᵗ with the 0.15 / 1.15 / 1.85 base grid; exponent-structure trap executed cleanly. |
| M3.16 | PASS | Perpendicular slope −8/5 with the measured standing trio (plain negative / reciprocal / original). |
| M3.17 | **FIX** | Hard label aspirational: −b/2a = 4 is a Medium task in the measured bank; distractors are fine. |
| M3.18 | **FIX** | Hard label aspirational (bare 30-60-90) **and** the form's headline "not-to-scale doubt" trap is not instantiated — no figure exists to doubt. |
| M3.19 | **FIX** | Hard label aspirational: the x-terms already match, so no insight is required; 97-word rationale = 0.75× the H-SPR norm. |
| M3.20 | **FIX** | Re-runs shipped PT4 M4.20 — same skill, band, stem formula, complete-the-square pipeline and 2 of 3 distractor recipes. |
| M3.21 | PASS | Linear–nonlinear system; the sign-slip distractor lands on a clean second root (x = 3 → y = 2). |
| M3.22 | PASS | Two constants → composite ab = −26/3; the form's only negative, engineered as a lowest-terms fraction. |
| M4.01 | **FIX** | Third consecutive form with flat-fee + per-unit rate → "which equation", same slope/intercept role-swap trap. |
| M4.02 | PASS | 4x³ + 11x with sign / like-terms / like-terms-plus-exponents ladder; 14-word stem under the 15-word cap. |
| M4.03 | PASS | Two-hop conversion with the factor GIVEN; both partial-chain distractors and the reciprocal rate named. |
| M4.04 | **FIX** | Terminal question omits ", in dollars," (§2c) while the four options are bare money decimals. |
| M4.05 | **FIX** | acceptedAnswers incomplete — 102/6, 119/7, 136/8, 153/9 are legal at ≤5 chars and absent. |
| M4.06 | PASS | Abstract conversion delivered as promised; 588 with one scale step; forms complete. |
| M4.07 | **FIX** | graphDescription is factually wrong ("tick marks at every 2 units"; the grid is at 1 unit) and withholds the coordinate the item asks for. |
| M4.08 | PASS | Two-way table margins all re-sum; 72/200 = 9/25 with the exact CB probability trio (row / column / marginal). |
| M4.09 | PASS | n = 625 gives a 4-point margin exactly — PT4's implausible-n defect not repeated (option lengths 13–25 words, not near-equal — note). |
| M4.10 | PASS | Exact "best interpretation of ___ in this context" wording; four parallel sentences permuting fee ↔ rate ↔ d = 1. |
| M4.11 | PASS | √521 ≈ 22.8 with subtract / leg-swap / add ladder; figure exact at 8 px/unit (metadata says "DF" — a leak from M3 Q18). |
| M4.12 | **FIX** | acceptedAnswers incomplete — 159/6 and 212/8 are legal at ≤5 chars and absent. |
| M4.13 | **FIX** | Same archetype as M3 Q11 (pounds cap + fixed load → greatest number of a small boat); also missing 60/6, 70/7, 80/8, 90/9. |
| M4.14 | PASS | Unknown inside the product — genuinely different from PT4 M3.15 and PT5 M4.22; −19 / −15 / a ladder all nameable. |
| M4.15 | **FIX** | Table headers `x`/`y` not italicised (house convention is `<i>x</i>`); archetype repeats PT5 M3.08 (table → linear equation, medium). |
| M4.16 | PASS | k/4 = 15/5 → 12 with the same-line check performed; sign / reversed-ratio / equal-coefficients trio (archetype echo of PT4 M3.22 — note). |
| M4.17 | PASS | Nesting is the entire difficulty; three distractors are the three ways to mis-place the transformation. Model hard item. |
| M4.18 | **FIX** | Restates shipped PT4 M4.18: "given similar" ≡ PT4's two equal angle pairs, same key insight, same distractor logic. |
| M4.19 | **FIX** | Discriminant boundary is excellent, but acceptedAnswers omits 114/6, 133/7, 152/8, 171/9. |
| M4.20 | **FIX** | Explanation uses `<sup>` HTML tags — unique in 347 items across the three forms; the rest of the form uses Unicode superscripts. |
| M4.21 | PASS | Area → radius → circumference → sector proportion; sector-area (60π) and un-rooted-radius (120π) both real. |
| M4.22 | **FIX** | **KNOWN:** still linear-functions; the corrected blueprint moves it to nonlinear-equations. Also missing 99/12; echoes M3 Q22's closer archetype. |

**Totals: 28 PASS · 16 FIX · 0 REWRITE.**

Bar note. I applied PT5 round 2's triggers unchanged: rationale length is an item-level FIX only past
≈+45% (nothing in PT6 reaches it, so no item is FIXed for length); an archetype that repeats a shipped
item is a FIX; a reproduced item with shared numbers or options would be a REWRITE — PT6 has none, so
the REWRITE column is empty for the first time in the series.

---

## 3. Detailed notes on every FIX

### 3.1 Cross-form differentiation (5 items)

**M3 Q6 — PT4 M3.06 at the same slot.** Spec §9.7 and the blueprint's differentiation promise.
Shipped PT4 M3.06: easy SPR, position 6, nonlinear-functions, `f(x) = 3x² − 5x + 9`, find f(4) = 37.
PT6 M3 Q6: easy SPR, position 6, nonlinear-functions, `f(x) = 2x² + 5x − 8`, find f(6) = 94. Same
slot, band, format, skill and archetype; only the constants moved. This is the exact finding PT5's
critic graded a FIX for its M4.06 (`3x² − 5x + 4` vs PT4's `3x² − 5x + 9`); PT5 repaired it by
recasting the slot to function-notation nesting, and PT6 has restored PT4's shape at PT4's own slot
number. *Repair:* recast to a different NLF-easy archetype the series hasn't used at Q6 — an
evaluate-a-radical, an f(x) = a·bˣ read, or a "for what value of x does f(x) = k" inverse.

**M3 Q20 — PT4 M4.20 re-rolled.** PT4 M4.20 (hard, circles): `x² + y² − 10x + 4y = 7` → "What is the
radius of the circle?", options √7 · 6 · 12 · 36, distractors = skip-CTS / diameter / r². PT6 M3 Q20
(hard, circles): `x² + y² + 12x − 8y = 12` → the same question, options 8 · 12 · 16 · 64, distractors
= RHS constant / diameter / r². Same skill, same band, same equation template, same completing-the-
square pipeline, and two of three distractor recipes identical. No constant is shared, so this is not
a REWRITE — but PT5 deliberately gave its two circles items arc-length and tangency mechanisms
precisely so this archetype would rest, and PT6 brings it straight back. *Repair:* the form already
owns arc length at M4 Q21; give M3 Q20 the centre rather than the radius, or a
point-on-circle / translated-circle mechanism, or move the complete-the-square work into an SPR.

**M4 Q18 — PT4 M4.18 restated.** PT4 M4.18 (hard, LAT): "In triangles JKL and PQR, the measure of
angle J is equal to the measure of angle P, and the measure of angle K is equal to the measure of
angle Q. Which additional piece of information is sufficient to determine whether triangle JKL is
congruent to triangle PQR?" — key: the lengths of a corresponding side pair. PT6 M4 Q18 (hard, LAT):
triangles given *similar* — which is exactly PT4's two-equal-angle-pairs premise — asking the same
question, with the same key insight (one pair of equal corresponding sides forces the scale factor to
1) and the same distractor logic (a fact already implied by the premise; a fact about one triangle
only). The selfcheck's defence that it "runs the opposite direction" does not hold: AA-similarity and
"is similar to" are the same given. The item is mathematically airtight — I verified sufficiency over
the general family, and A/B/D are each genuinely insufficient — which is why it is a FIX and not a
rewrite of the mathematics. *Repair:* keep the sufficiency meta-reasoning (the form needs it) but move
the direction: give the scale factor and ask which additional fact determines a specific side; or ask
which fact is **not** sufficient; or run it on a right-triangle pair where HL is the discriminating
criterion.

**M4 Q1 — third consecutive form with the fee-plus-rate model.** PT4 M3.02 (pottery studio, $30/mo +
$4/kg → which equation, role-swap trap, option template `rate·x + fee` / `fee·x + rate` /
`(rate+fee)x`). PT5 M4.01 (parking garage, $4 entry + $3/hr → same). PT6 M4 Q1 (laundromat, $6 card +
$2.75/load → same). PT5's critic graded this a FIX and prescribed the repair ("swap to a rate-of-change
read or a 'which function models'"); it was never adjudicated, and PT6 makes it three for three.
PT6's version does differ in two respects — it is an *equation with a total* rather than a function,
and it sits on linear-equations-one-variable — but the situation, the trap and two of the four option
slots are the family's furniture. *Repair:* the form already carries the interpretation form of this
model at M4 Q10; make Q1 a forward evaluation, a "how many loads" solve, or a two-tier fee.

**M4 Q15 — PT5 M3.08 repeated.** PT5 M3.08 (medium, HTML table): "The table shows four values of x and
their corresponding values of f(x), where f is a linear function" → slope/intercept, swap trap.
PT6 M4 Q15 (medium, HTML table): "The table shows four values of x and their corresponding values of
y for a linear relationship between x and y" → slope/intercept, swap trap. Same visual, same band,
same trap, near-identical lead-in. *Repair:* ask for a missing table value (the blueprint's own
alternative — "line through table values → equation **or a missing value**"), or give three points and
ask which is not on the line.

### 3.2 Difficulty-label honesty — Module 3's hard band (3 items)

**M3 Q19.** `12(3x − 8) = 36x − a + 219`, infinitely many solutions → a = 315. Distributing gives
36x − 96 on the left; the x-terms match **by construction**, so no scale factor has to be spotted and
the item reduces to −96 = 219 − a. Contrast PT5 M3.17, where infinitely-many required noticing a ×3
scale between two equations, or PT4 M3.22, where no-solution required a coefficient ratio. The
97-word rationale at 0.75× the hard-SPR norm is the tell — there is nothing to narrate. *Repair:*
put the parameter where it has to be earned: `a(4x − 3) = 12x − 9 + k` style, or make the student
match a scaled coefficient before matching constants, or relabel the slot medium and move a genuine
hard SPR into position 19.

**M3 Q18.** In a 30-60-90 with the hypotenuse given as 16, the longer leg is 8√3. The measured bank
puts bare special-triangle recalls in the medium bin; hard RTT items chain a ratio into a second
figure or an unknown. *Repair:* add one turn — give the perimeter and ask for a leg, or embed the
30-60-90 inside an equilateral triangle whose area is asked, or give tan of the 30° angle implicitly.

**M3 Q17.** "For what value of x does f reach its minimum" from `3x² − 24x + 41` is −b/2a with
frictionless numbers. Defensible at the bottom of the hard band, but with Q18 and Q19 beside it
Module 3's hard band is half Medium. *Repair:* ask for the minimum **value** with a fractional vertex,
or give f in factored form and ask for the vertex, or hand over f(x) = a(x−h)² + k and ask for a
constant.

*Form-level consequence:* a strong student meets no real resistance until M3 Q20. Module 4's hard band
(nesting, sufficiency, discriminant boundary, √1.44 rewrite, area→arc, two-condition closer) is
honest throughout; the two modules are not parallel in demand even though they are parallel in labels.

### 3.3 The new trap family did not land (M3 Q18, form-level)

The blueprint's headline PT6 novelty is "not-to-scale doubt (measured 3 in 216, never used yet)",
spec §5 #18, assigned to M3 Q18 with the gloss "figure-less, verbal description invites eyeballing".
A figure-less item cannot carry this mechanism: the measured family works because a figure **is**
shown, is drawn misleadingly, carries the note, and the student who trusts the picture loses. With no
figure there is nothing to distrust, and the distractors that ship are ordinary — 8√2 is "assumed the
legs are congruent" and 4√3 is "mis-seated the hypotenuse". *Repair:* ship the figure. Draw triangle
DEF with the 30° angle rendered at roughly 45° so the sketch reads isosceles, carry
"Note: Figure not drawn to scale.", and let 8√2 be the eyeball answer. That instantiates the family,
and it also fixes the hard-label problem at the same time by making the item about resisting the
picture rather than reciting a ratio.

### 3.4 Module 4's SPR accepted-answer lists (5 items, one systematic defect)

Spec §6: "acceptedAnswers lists **every** legal entry ... keep all ≤6 chars". M3's six lists are
exhaustive — I re-enumerated the ≤5-character grid for each and found no gap and nothing illegal.
M4's are truncated at five denominators:

| Item | Answer | Missing legal entries (≤5 chars) |
|---|---|---|
| M4 Q5 | 17 | `102/6` `119/7` `136/8` `153/9` |
| M4 Q12 | 26.5 | `159/6` `212/8` |
| M4 Q13 | 10 | `60/6` `70/7` `80/8` `90/9` |
| M4 Q19 | 19 | `114/6` `133/7` `152/8` `171/9` |
| M4 Q22 | 33/4 | `99/12` |

Fifteen entries in total; M4 Q13's are the most exposed because `60/6` is four characters and a
student who divides 1,740 by 165 and simplifies by hand can plausibly land there. Nothing listed is
wrong or over-length, so this is a completeness failure, not a correctness one — but PT5 round 2
verified exactly this row as LANDED after ten gaps were closed, so it is a regression against a
lesson the house had already learned. *Repair:* run M3's enumerator over M4's six answers.

### 3.5 Internal collision (M4 Q13 / M3 Q11)

Spec §9.7: "contexts must also not collide with each other across the 44 items." M3 Q11: five 45-lb
kayaks already loaded, 75-lb tandems, trailer capacity 900 lb, "what is the greatest number of tandem
kayaks". M4 Q13: 260-lb boat and equipment, 165-lb rowers, capacity 2,000 lb, "what is the greatest
number of rowers". Same skill (both of the form's two linear-inequalities slots), same unit, same
fixed-load-plus-per-unit structure, same terminal question, and both in the small-watercraft
semantic field. The blueprint asked for two different archetypes (integer optimisation with a minimum
vs threshold reasoning to an integer bound); one archetype was delivered twice. Both also echo PT4
M3.16 (freight elevator, at most 2,400 pounds, crates of two weights). *Repair:* re-roll M4 Q13 to
the other half of its blueprint cell — a lower bound rather than an upper one ("at least"), a
budget in dollars rather than a weight, or a compound range — and keep M3 Q11 as is.

### 3.6 Format and voice (4 items + 1 form-level)

**M4 Q20 — `<sup>` in the explanation.** The rationale writes `500(1.44)<sup>t/2</sup>` eleven times.
No other explanation in PT6, PT4 or PT5 (347 items) contains a tag; every other exponent in this very
module is Unicode (`4x³`, `1.2ᵗ`). Two of the app's four explanation renderers pass the field through
as plain React text, where these will display as literal `<sup>`. *Repair:* Unicode superscripts, or
spell it `(1.44)^(t/2)` as prose.

**M4-wide — literal newlines in explanations.** Sixteen of M4's MC explanations contain `\n\n`
before the dismissal block; M3 has none and neither shipped form has any in 88 items. *Repair:*
replace with a single space.

**M4 Q7 — alt text.** "on a grid with tick marks at every 2 units" is false: the gridlines run at
every 1 unit and only the labels are at every 2. A screen-reader user builds a grid at half the true
density. The same sentence also refuses to name where the parabola crosses the y-axis — which is
literally the question — while M3 Q10's alt text hands over three lattice points that make its key
derivable without the figure. *Repair:* correct the grid statement, and pick one house rule. The
app's own QC prompt says graphDescription "must be exact and complete", and `Question.jsx` uses the
field only as `alt=`, so completeness (M3 Q10's approach) is the defensible standard — in which case
M3 Q7 ("The bars differ in height") and M3 Q14 (no coordinates at all) both need the numbers a
sighted student can read.

**M4 Q15 — table headers.** `<th>x</th>` / `<th>y</th>`; PT5 M3.08 ships `<th><i>x</i></th>` and
`<th><i>f</i>(<i>x</i>)</th>`. Variables are italic in the house style. *Repair:* wrap both in `<i>`.

**M4 Q4 — unit clause.** "What is the total fare for a trip through 6 zones?" with options
2.50 / 4.25 / 10.50 / 13.00. §2c requires units named at every mention. *Repair:* "What is the total
fare, in dollars, for a trip through 6 zones?"

### 3.7 Known FIX, not re-litigated

**M4 Q22** ships as linear-functions (f(x) = ax + b, two conditions → f(1) = 33/4). The corrected
blueprint moves the slot to nonlinear-equations to restore M4 = ALG 7 / ADV 7 and the form to
ALG 15 / ADV 14. Rows 3, 4 and 5 of the scoreboard are entirely accounted for by this one slot. Two
incidental defects ride along and should be fixed in the same pass: the accepted-answer list omits
`99/12`, and as written the item repeats M3 Q22's closer archetype ("two conditions on f fix a and b").
The recast to a nonlinear-equations closer resolves the echo at no extra cost.

---

## 4. Prior-lesson check (PT4 and PT5 findings, status in PT6)

| Prior finding | Status | Evidence |
|---|---|---|
| Applied share over band (PT4 39%, PT5 39% → 34%) | **FIXED** | 14/44 = 31.8% under the identical rule; both licensed abstract conversions (M3 Q5, M4 Q6) were made and recorded. First clean pass of the series. |
| Rationales over §7 norms (PT5: systemic, 6 items ≥+45%) | **REGRESSED at band level, fixed at item level** | 0 items ≥1.45× (PT5 round 2 still had one at 1.46). But band means are **longer than PT5's in 5 of 6 MC bands** — M3 M-MC 177.6 vs PT5's 153.0; M4 M-MC 178.8 vs 159.4. Measured with the honest all-token ruler; both selfchecks quote the same ruler and report the same numbers, so this is disclosed, not hidden. |
| Stems over §2b caps (PT5: 1–3 items over) | **FIXED** | 44/44 inside cap on the all-token ruler, including the three tightest at 34–35/35. |
| Trap-family monotony (PT4: r²-slip ×3; PT5: two families lost) | **PARTIAL** | Within-form the palette is wide and no mechanism fires twice. But robustness went 0 → 1 → **0**, must-be/could-be is again **0** with no CAPS negation anywhere, and the family PT6 was supposed to introduce (not-to-scale doubt) is nominal. Net: PT6's exotica are thinner than PT5's. |
| Alt text that reveals the answer (PT5: M3 Q15 disclosed all four options) | **PARTIAL** | No alt text enumerates an option set. M3 Q10 still hands over three lattice points from which the key follows; three other figure items withhold everything the item needs. The house has two rules, not one. |
| A too-perfect ramp (PT5 round 1: perfect step function) | **FIXED** | Exactly one dip per module, both at Q10, matching §1d's parenthetical precisely — the cleanest ramp delivery in the series. |
| Unescaped angle brackets | **CLEAN** | 0 stray brackets across 176 text fields; M4 Q19's `&lt;` correctly escaped. |
| Origin *O* glyph harmonisation (open since PT4) | **FIXED** | Italic on all four figures that carry one. |
| SVG gridline gaps (PT4 M4 Q4) | **FIXED** | All three coordinate grids complete at their stated increments. |
| Implausible sample/MoE pair (PT4 M4 Q14) | **FIXED** | n = 625 gives 1/√625 = 4 points exactly; the exact 95% margin is 3.92. |
| acceptedAnswers exhaustiveness (PT5 E1, closed in round 2) | **REGRESSED** | M3 exhaustive; M4 missing 15 legal entries across five items. |
| Solve-backwards volume (PT5 critic's prescription) | **FIXED** | M3 Q9 is volume-given → find a dimension, exactly as asked. |
| Unrepaired PT5 archetype repeats (M4 Q1 fee+rate) | **NOT FIXED** | Now in its third consecutive form. |
| Invented Latin epithet (PT5 note on *nivalescens*) | **NOT FIXED** | *Littorina fuscopunctata* — real genus, invented epithet. |

**Net: 7 clean fixes, 3 partials, 3 unfixed, 2 regressions.**

---

## 5. Three-form differentiation verdict (PT4 vs PT5 vs PT6)

**Verdict: the *surface* of PT6 is the most differentiated of the three; its *skeleton* is the least.**

What landed, verifiably. Every dimension in the blueprint's "How PT6 differs" table is real except
the domain mix. The context firewall is airtight — all 32 PT4/PT5 contexts avoided, two new names
(Anika, Priya), and no PT6 context word appears in either shipped form. The visual palette carries
the series' first **bar graph**, and it is a good one: five gray bars that re-measure to 18/30/12/24/6
with a unique maximum and roman axis titles. The SPR census is delivered to the item — 8 integers with
two engineered three-digit values, 3 fractions, 1 terminating decimal, and the negative placed exactly
where the blueprint put it, as a *fraction* (PT4's negative was a fraction, PT5's an integer, PT6's a
negative fraction — three distinct textures). The applied share finally comes down to 32% without
hollowing out a domain to get there. The ramp carries its licensed dip in both modules. The figure
work is the best of the three forms: PT4's gridline gap, PT4's roman-vs-italic origin, and PT5's
mis-proportioned triangle are all absent, and M3 Q14's scatter is engineered so the drawn line is
literally the least-squares fit of the ten plotted points.

What did not. Five items re-run a shipped archetype, and unlike PT5's breaks none of them can be
blamed on a writer working blind — **all five were scheduled by the blueprint**, cell by cell:
"evaluate a quadratic at a point" at M3 Q6 (PT4's M3.06, same slot number), "complete the square →
radius" at M3 Q20 (PT4's M4.20), "similar-triangle sufficiency" at M4 Q18 (PT4's M4.18), "applied
single-unknown model → which equation" at M4 Q1 (PT4's M3.02 *and* PT5's M4.01), and "line through
table values → equation" at M4 Q15 (PT5's M3.08). The writers executed those cells faithfully and
well; the blueprint simply did not check its own archetype column against the two shipped forms. That
is the same structural finding PT4's critic made about the trap quota and PT5's critic made about the
three unrepaired repeats, arriving for the third time in a different guise.

Where a skill genuinely moved, it moved well: area-volume from direct volume (PT4, PT5) to
solve-backwards (PT6); circles from r²-slip ×2 (PT4) to arc and tangency (PT5) to complete-square and
area→arc (PT6); two-variable-data from observed-minus-predicted (PT4) and slope interpretation (PT5)
to a line-of-best-fit prediction against a plotted observation (PT6); percentages from a chained
multiplier (PT4) to a reverse percent (PT5) to a year-over-year compounding (PT6). Inference-statistics
returns after PT5 dropped it, and returns with a numerically consistent sample size. One-variable-data
moves from a median table (PT4) and a dot plot (PT5) to a bar graph (PT6) — three displays, three forms.

Internally, PT6 collides with itself once (M3 Q11 / M4 Q13, the same weight-cap inequality twice) and
echoes itself three times softly (three f(6) evaluations; two "two conditions fix a and b" closers at
both Q22s; the answer 12 three times). PT4 had one soft ceramics cluster; PT5 had none after round 2.
This is the one axis on which PT6 is worse than both predecessors.

**Bottom line:** PT4 and PT5 read as two forms with a shared house style. PT6 reads as a third form
with a genuinely new wardrobe over PT4's bones. Fix the five scheduled repeats and the one internal
collision and the three forms are siblings; ship as is and a student who has worked PT4 will meet its
circle item, its congruence item, its quadratic-evaluation SPR and its fee-plus-rate model again.

---

## 6. Would it pass as Bluebook?

Put these 44 in front of a student who has worked every official form and I think 41 go by without a
flicker — the highest number I have given this series. The mathematics is the reason. I re-solved all
44 keys and re-derived all 96 wrong options, and there is not one arithmetic slip, not one ambiguous
key, not one option that closes only by hand-waving; after PT5 shipped an item with two correct
answers, that matters more than any quota. The liturgy is exact in all 44 rationales, the key letters
sit at 4/4/4/4 in both modules with no run of three, all 22 numeric sets ascend genuinely, and the
figures are the best the house has drawn: the scatter's fit line is the true least-squares line of its
ten points, the transversal is actually cut at 67.94°, the parabola's Bézier reproduces
y = x² − 2x − 3 to zero error, and the right triangle is exact to 8 pixels per unit.

The three strongest items are **M3 Q14**, where the line of best fit is engineered to be the real
regression line and the distractor 400 is a real plotted datum sitting directly under the key at
x = 18 — the observed-versus-predicted distinction made physical rather than asserted; **M4 Q17**,
where the nesting *is* the difficulty and the three wrong options are the three ways to mis-place the
transformation (onto the output, not at all, constant dropped); and **M4 Q21**, which hides a radius
step behind an area and then offers the sector's *area* as the arc's length. M3 Q22's −26/3 and
M4 Q8's two-way table are half a step behind.

The three weakest are all in Module 3's hard band. **M3 Q19** is labelled hard but the x-terms match
by construction, so there is no insight to have; its 97-word rationale is 0.75× the norm because there
is nothing to say. **M3 Q18** is a bare 30-60-90 carrying the form's advertised new trap family
without a figure to make that family exist. And **M4 Q18** is PT4's congruence-sufficiency item with
the premise renamed from "two angle pairs equal" to "similar" — airtight, well written, and one a
PT4 veteran has already answered. **M3 Q20** is a close fourth for the same reason.

What a rater would squint at is above the item line, and it is the same shape as last time: the
rationales run a quarter long in every band and are now *longer* than PT5's in five of six MC bands;
Module 4's six accepted-answer lists are missing fifteen legal entries that Module 3's enumerator
would have caught; and the two modules disagree with each other about alt text, about newlines in
explanations, and about whether `<sup>` belongs in a rationale. None of that is visible to a student.
All of it says two writers, one blueprint, no reconciliation pass.

**Verdict: HOLD, narrowly.** Nothing here is unscorable, so this is not PT5's blocker. Fix M4 Q22 as
already adjudicated, close the fifteen accepted-answer gaps, re-roll M4 Q13 off M3 Q11, and re-pitch
or relabel M3 Q17/Q18/Q19. Then decide the harder question, which is not a writing question at all:
whether to re-cut the five blueprint cells that point straight back at PT4 and PT5.

*Audited 2026-08-14. Every judgement recomputed from the JSON and SVG artifacts and from the two
shipped forms; selfcheck and verifier claims were treated as claims and are confirmed except where
contradicted above.*
