# Critic Report — PT5 Math Modules 3 & 4 (44 items)
### College Board authenticity audit vs `docs/CB_Math_Style_Spec.md` + `analysis/blueprint_pt5_math.md`

Every count below was recomputed from `modules-pt5/M3.json`, `M4.json` and `assets/*.svg`; the two
selfchecks were read only to compare claims, never trusted. All 44 keys and all 96 MC distractor
derivations were re-solved symbolically; all 6 SVGs were re-parsed and their pixel geometry mapped
back to data coordinates; the 4 extracted question-bank exports and 4 extracted practice-test PDFs
were grepped for scenario, noun-phrase and number-pipeline collisions; and the shipped sister form
`scripts/data/practiceTest4Math.json` was diffed item-by-item against PT5.

**Headline: the form is mathematically flawless and liturgically the cleanest yet — and it contains
one item lifted in structure from a real College Board question-bank item and one item that is a
renumbered PT4 item with the same parabola, the same key and three of four identical options.**

---

## 1. Form-level scoreboard

| # | Check (source) | Target | Actual | Verdict |
|---|---|---|---|---|
| 1 | Items / format per module (§1a) | 22 = 16 MC + 6 SPR | 22 = 16 MC + 6 SPR, both | **PASS** |
| 2 | Module metadata (§8) | modNum 3/4 · "Math" · calc true · 2100 · desc "Module 1/2" | exact on both | **PASS** |
| 3 | Domain quota, form (blueprint) | ALG 14 / ADV 14 / PSDA 8 / GEO 8 | 14 (7+7) / 14 (7+7) / 8 (4+4) / 8 (4+4) | **PASS** |
| 4 | Skill quota, all 19 rows (blueprint "Form-level checks") | le1v3·lf4·le2v2·sys3·ineq2·NLF7·NLE4·ee3·rrp2·pct2·ovd2·tvd1·prob1·inf0·esc0·av2·lat2·rtt2·circ2 | every row exact | **PASS** |
| 5 | Probability in M4 only | yes | M4 Q9 only | **PASS** |
| 6 | Circles ≥1 per module | yes | M3 Q16, M4 Q18 | **PASS** |
| 7 | inference-statistics / evaluating-statistical-claims | 0 / 0 | 0 / 0 | **PASS** |
| 8 | Difficulty mix | M3 8E/8M/6H · M4 9E/7M/6H | M3 8/8/6 · M4 9/7/6 | **PASS** |
| 9 | Ramp shape (§1d) | monotone **with one honest dip** | perfect step function both modules: `EEEEEEEE\|MMMMMMMM\|HHHHHH` and `EEEEEEEEE\|MMMMMMM\|HHHHHH`; zero interleaving | **FAIL (soft)** |
| 10 | SPR positions & difficulty | 5,6,12,13,19,22 = E,E,M,M,H,H | exact in both modules | **PASS** |
| 11 | SPR census (blueprint) | 9 int (exactly 1 neg, ≥1 three-digit), 2 frac, 1 dec, 1 multi-root | 9 int (−12 the only negative; 216 & 201 three-digit) · 2 frac (15/17, 15/2) · 1 dec (12.5) · M3 Q12 lists both roots 12 and 15 | **PASS** |
| 12 | acceptedAnswers legality (§6) | every legal form, ≤5 chars (6 w/ minus); entry note iff non-integer | 87 entries, all legal and in-length (`-108/9` = 6 w/ minus, allowed); note on exactly M3 Q12/Q13, M4 Q13/Q22 and on no integer | **PASS** |
| 13 | Visual quota & types (§1e + blueprint) | 4/module: M3 dot plot·geometry·HTML table·parabola; M4 exp curve·two-way table·geometry·scatter | exactly those 8; zero histograms, zero box plots | **PASS** |
| 14 | Scale note placement | geometry figures only | M3 Q8 and M4 Q11 only; neither coordinate grid carries it | **PASS** |
| 15 | Hard geometry figure-less | yes | M4 Q18 (H circles) and M4 Q20 (H similarity) both verbal | **PASS** |
| 16 | graphDescription on all 6 figure items | present & factual | present; all 6 re-derived from SVG pixel geometry and factual to the unit | **PASS** (2 disclose the key — note §5) |
| 17 | SVG conventions (§8) | arrowed axes · italic vars · O · #cccccc unit gridlines · roman axis titles w/ units | all met; **gridlines complete on all three grids** (PT4's Q4 gap is fixed). Origin `O` is italic in M3 Q15 but roman in M4 Q4/Q16 | **PASS w/ note** |
| 18 | Key-letter balance | ≈4/4/4/4 ±1 over 16 MC | M3 4/4/4/4 · M4 4/4/4/4 | **PASS** |
| 19 | Numeric options ascending | ~90%+ | 22/22 numeric sets strictly ascending | **PASS** |
| 20 | Options plain text (§8) | no HTML tags/entities, no LaTeX, ASCII hyphen | 128 option strings scanned, 0 violations | **PASS** |
| 21 | Bare `<`/`>` escaped in passage/text/explanation | all escaped | 0 stray angle brackets anywhere | **PASS** |
| 22 | HTML tables (§8) | bordered, centered, bold headers; two-way has Total row **and** column | M3 Q9 (x / f(x)); M4 Q9 has both Totals and all six margins sum correctly | **PASS** |
| 23 | Named people ≤2 per module | ≤2 | Mateo (M3), Idris (M4); neither is PT4's "Nadia" | **PASS** |
| 24 | Exactly one Latin binomial | 1 | *Rhizocarpon nivalescens*, M4 Q16, italic | **PASS** |
| 25 | Exactly one trap mechanism per item, matching blueprint | 38 MC assigned, 6 SPR trap-free | every MC carries its blueprint-assigned mechanism; the 6 trap-free slots are exactly the E/E/M/M SPRs. M3 Q21's label names two ("step-skip / sign-slip") — the blueprint's own wording | **PASS w/ note** |
| 26 | Trap form-level quota (blueprint) | robustness 1 · must/could 1 · wrong-target 3 · role-swap 2 · solution-count 2 · sign-slip 2 · similarity 1 · percent 2 · menu 2 · exponent 1 · ladder 1 | 1 · 1 · 3 · 2 · 2 · 2 · **1** · 2 · 2 · 1 · 1 — every row exact | **PASS** |
| 27 | Spec §5 residual families | function-notation nesting ~1 · extraneous/nonreal ~1 | **0 and 0** (PT4 shipped a nesting item at M3.19 and an extraneous-root item at M3.17; both families went 1 → 0) | **FAIL** |
| 28 | Applied share (§2c band 30–35%) | blueprint 15/44 ≈ 34% | **17/44 ≈ 39%** under the rule PT4 was scored by (M4 Q4 "mass of a substance… experiment" and M4 Q17 "bacteria in a culture" are contexts, not abstractions) | **FAIL** |
| 29 | Stem length caps (§2b) | equiv ≤15 · abstract ≤35 · applied ≤55 · stat ≤75 | 43/44 inside. **M4 Q20 = 44 prose words on a context-free item** vs the ≤35 abstract cap. At-cap: M3 Q10 (55/55), M4 Q14 (53/55), M3 Q18 (73/75) | **FAIL (1 item)** |
| 30 | Rationale liturgy (§7) | openers · "It's given that" curly · gerund-yields · "Therefore," · dismissals in letter order · SPR no dismissals · entry note | **44/44 exact.** 32/32 MC openers match their key letter; 96/96 dismissals in strict letter order; 44/44 close with "Therefore,"; 0 straight apostrophes; 0 dismissals inside an SPR | **PASS** |
| 31 | Rationale lengths (§7) | MC 110/135/170 · SPR 40/100/130 | E-MC mean **136** (+24%) · M-MC **163** (+20%) · H-MC **212** (+25%) · M3's six SPRs mean **133** vs a 90 norm (+48%); M4's six mean 99 (+10%) | **FAIL** |
| 32 | Mathematical airtightness (§9.2) | unique key, all distractors wrong & nameable | all 44 keys and all 96 distractor recipes re-solved: **zero errors, zero unnameable options** | **PASS** |
| 33 | Originality vs CB sources (§9.7) | no scenario/number-set reproduction | **M4 Q18 reproduces the scenario and stem trio of QB item `9adb86ed`** (Circles, Hard). 43/44 clean | **FAIL** |
| 34 | Differentiation from PT4 | no renumbering, no context reuse, different archetype where a skill repeats | **M3 Q15 = PT4 M4.04's parabola, key and 3 of 4 options.** M4 Q6 = PT4 M3.06's quadratic template. 3 archetype repeats (M4 Q1, Q8, Q14). Context firewall itself: clean | **FAIL** |
| 35 | Internal 44×44 collisions | none | no repeated context; soft echoes only (two direct-volume items; two lab/exponential contexts in M4; SPR answer **12** sits at Q12 in *both* modules) | **PASS w/ notes** |
| 36 | Voice fingerprint (§2a forbidden moves) | no "you", no imperative, no double question, CAPS negation, "closest to", constants declared, units comma-interpolated, where-clauses | 0 "you/we/let's", 0 imperatives, 0 double questions, 0 exclamations, 0 "None of the above"; CAPS negation at M3 Q20; constants declared on all 6 parameter items; units comma-interpolated on all 8 unit-bearing stems | **PASS** |

**Scoreboard: 28 PASS · 1 PASS-with-note-escalation · 7 FAIL** (rows 9, 27, 28, 29, 31, 33, 34).

Note on row 11: the SPR census is the single most precisely delivered quota in the form — the
blueprint asked for a specific 9/2/1 split with exactly one negative and at least one engineered
three-digit integer, and PT5 lands it exactly, with complete and legal `acceptedAnswers` on all
twelve. This is a genuine improvement over PT4, whose own census had to be defended against an
arithmetically self-inconsistent blueprint line.

---

## 2. Item-by-item verdicts (44 rows)

| Item | Grade | Reason (one line) |
|---|---|---|
| M3.01 | PASS | Variable-both-sides solve; echo (12), (40+12)/4, and 4x distractors all close cleanly. |
| M3.02 | PASS | Unit-rate proportion; 24 / 7·4 / 96+7 trio nameable; rationale 132w for an E slot (note). |
| M3.03 | PASS | 5-prose-word equivalent-expressions stem; add-coeffs / subtract-exps / multiply-exps grid. |
| M3.04 | PASS | f(2) = 75 with the a↔b swap (5·3²=45) as the designed bait; frictionless. |
| M3.05 | FIX | Correct and clean, but a 68-word rationale against the ~40-word E-SPR norm (+70%). |
| M3.06 | FIX | Bare ℓwh = 216 carried by an 84-word rationale — the biggest relative overrun in the form (+110%). |
| M3.07 | PASS | Dot plot re-counted from the SVG: 24 dots, 4 above 5; cumulative-above/below distractors exact. |
| M3.08 | FIX | Item airtight (x=50), but 162-word rationale for an E slot (+47%) and the figure double-states AB = AC. |
| M3.09 | PASS | Slope −3/2, b = 22, verified against all four table rows; reciprocal/sign/swap trio (189w — borderline). |
| M3.10 | FIX | The four options permute only `<` vs `≤` on one fixed pair of bounds — not a CB option-set shape. |
| M3.11 | PASS | Reverse percent 52/0.04 = 1,300; /4, /0.4, ×4 distractors are the canonical percent trio. |
| M3.12 | PASS | Multi-root SPR done right: both 12 and 15 accepted, entry note in the attested multi-answer form. |
| M3.13 | FIX | 8-15-17 → sin = 15/17 with complete accepted forms, but a 165-word rationale vs the ~100 M-SPR norm. |
| M3.14 | PASS | Exact "best interpretation of ___ in this context" wording; four parallel sentences; alternate-world dismissals. |
| M3.15 | **REWRITE** | Same parabola, same key (3, −4) and **3 of 4 identical options** as shipped PT4 M4.04. |
| M3.16 | FIX | Math clean (r = 72), but "the length of a radius of this circle" isn't the attested phrasing; 194w (+44%). |
| M3.17 | PASS | Infinitely-many parameter a = 2 via the ×3 scale; −2 / 6 / 18 each nameable. Model hard item. |
| M3.18 | FIX | Closes PT4's robustness gap and is airtight, but 263 words (longest in the form, +55%) and a redundant clause. |
| M3.19 | FIX | Engineered 3-digit composite target f(7) = 201 — excellent; 190-word rationale vs the ~130 H-SPR norm. |
| M3.20 | PASS | CANNOT-be-k executed exactly; 5, 12, 17 each verifiably give one solution. Closes PT4's must/could gap. |
| M3.21 | PASS | Unsimplified radicand q = 156 with 4ac / b² / b²+4ac ladder — the unsimplified form *is* the trap. |
| M3.22 | PASS | Translate-then-intercept → −12, the form's only negative; sign-slip trap sits exactly on the translation. |
| M4.01 | FIX | Correct and canonical, but archetype + trap + option template repeat PT4 M3.02 (fee-plus-rate → which equation). |
| M4.02 | PASS | 10x + 32 with a clean 2×2 sign×operation option grid; 5-prose-word stem. |
| M4.03 | PASS | Two-hop conversion with the factor GIVEN; partial-hop distractors on both hops plus the ÷100 slip. |
| M4.04 | PASS | Decay curve re-measured: (0,640)…(4,40); reads at t=1 and t=3 are the distractors. `t` declared then unused (note). |
| M4.05 | PASS | 39-word rationale — the E-SPR model for the whole form. |
| M4.06 | FIX | f(x) = 3x² − 5x + 4 is PT4 M3.06's `3x² − 5x + 9` with one constant changed, in the same easy-SPR slot. |
| M4.07 | PASS | y = 52 with x / 5x / 6x adjacent-quantity ladder; 153w for an E slot (note). |
| M4.08 | FIX | Perimeter/face-area/surface-area ladder on a cube repeats PT4 M3.10's archetype *and* its distractor family. |
| M4.09 | PASS | Two-way table margins all verified; 45/200, 105/150, 45/60 is the exact CB probability trio (157w — borderline). |
| M4.10 | PASS | 12x + 20(15) = 960 → 55; coefficient-swap distractor lands on the clean integer 39. |
| M4.11 | PASS | cos A = 7/25 with sin/tan/reciprocal ladder; stem matches an attested CB frame verbatim. |
| M4.12 | PASS | Add the equations → 8(x+y) = 96; 86-word rationale. The single most CB-shaped item in the form. |
| M4.13 | PASS | 0.875 = 1 − p/100 → 12.5, the form's one decimal; accepted forms and entry note complete. |
| M4.14 | FIX | 201-word rationale (+49%) and the two-constraint at-least/at-most archetype repeats PT4 M4.15. |
| M4.15 | PASS | Literal rearrangement w = 9v²/x²; the three distractors are three distinct incomplete squarings. |
| M4.16 | PASS | Scatter re-measured (10 points, slope ≈ 0.6 mm/yr, near-linear); 2×2 direction×form menu. |
| M4.17 | PASS | 3(m/60) → m/20 with the m/60 · 3m · 180m family; the cleanest exponent-structure item in either form. |
| M4.18 | **REWRITE** | Scenario and stem trio reproduce College Board question-bank item `9adb86ed` (Circles, Hard). |
| M4.19 | PASS | Tiered fee 8.50 + 1.25(w−1) = 46 → 31; money decimals earned by the context. |
| M4.20 | FIX | 44-word stem on a context-free item vs the ≤35 abstract cap; "hard" overstates a single k² division. |
| M4.21 | PASS | \|x²−4\| = 3 → four roots; Choice A dismissed by substitution — the attested verification-fail formula. |
| M4.22 | PASS | Identity → a = 3/2, b = 5, ab = 15/2; engineered so the constants are ugly and the product is clean. |

**Totals: 29 PASS · 13 FIX · 2 REWRITE.**

Bar note: PT4's critic called a rationale a FIX only past roughly +80% over norm. Because PT5's
overrun is no longer a handful of outliers but a systemic +20–25% across every MC band, I have
tightened the item-level trigger to ≈+45% and reported the rest as a single form-level FAIL (row 31).
Applying PT4's looser bar would move M3.05, M3.08, M3.13, M3.18, M3.19 and M4.14 to PASS-with-note
and leave 7 FIX / 2 REWRITE — the form-level finding is unchanged either way.

---

## 3. Detailed notes on every FIX and REWRITE

### REWRITE

**M3.15 — renumbered PT4 item.** Spec §9.7 ("no context, number set, or scenario reproduced… contexts
must also not collide"); blueprint "different archetype per skill wherever the skill repeats."
Shipped PT4 M4.04: *"The graph of the function f in the xy-plane is shown. What are the coordinates
of the vertex of the graph?"* — parabola opening upward, vertex (3, −4), x-intercepts (1, 0) and
(5, 0); options `(-4, 3) · (1, 0) · (3, -4) · (5, 0)`; key (3, −4); difficulty **easy**.
PT5 M3.15: same stem template, and the SVG re-measures to the **identical** parabola y = x² − 6x + 5
(vertex px (190, 284) → (3, −4); crossings at px 138.1 and 241.8 → x = 1 and x = 5). Options
`(-4, 3) · (0, 5) · (3, -4) · (5, 0)`; key (3, −4); difficulty **medium**. The only edits are one
distractor swap, the word "quadratic", and a difficulty-label bump on a task PT4 correctly scored
easy. A student who sat PT4 will recognise this on sight.
*Repair:* re-roll the figure entirely — different vertex sign and location (e.g. opening downward
with vertex (−2, 5)), and change the asked quantity to something PT4 didn't ask: the x-intercepts,
the value of f at a stated input, or the equation in vertex form. Then re-label to easy or move the
slot's medium demand into the question, not the label.

**M4.18 — source reproduction.** Spec §9.7 and the task's own rule (same distinctive noun phrases =
violation). `extracted/questionbank-export-2026-8-14 (3).txt`, Question ID **9adb86ed**, SAT Math /
Geometry and Trigonometry / Circles / **Hard**:
> "A circle in the xy-plane has its center at ___. Line ___ is tangent to this circle at the point ___.
> Which of the following points **also** lies on line ___?"

PT5 M4.18:
> "In the xy-plane, a circle has its center at (2, 7). Line k is tangent to the circle at the point (5, 3).
> Which of the following points lies on line k?"

Same skill, same difficulty band, same three-sentence scenario, same four-points option format, and
the same solution pipeline (radius slope → negative reciprocal → substitute a candidate x). The
source's own rationale even turns on "the negative reciprocal." The exported text strips inline math
so I cannot confirm the constants also collide; the stem-and-scenario match is sufficient on its own.
Both selfchecks assert "No number set, scenario, or option set is reproduced from PT4 or from any
College Board form" — M3's selfcheck also records that "the uploads and outputs/extracted folders
were never opened," which explains how a canonical archetype was re-derived verbatim rather than
copied. The claim is nonetheless false as written.
*Repair:* keep tangent ⊥ radius as the mechanism (it is the right hard-circles insight and the form
needs a non-r² circles trap) but change the archetype: ask for **an equation of line k**, or give the
tangent line and ask for the radius, or ask which of four given points is the *center* consistent
with a stated tangency. Re-word off the CB frame ("Line k is tangent at…" → "In the xy-plane, line k
touches the circle… at exactly one point"). Also worth adding a source-grep step to the authoring
loop; this class of collision is invisible to a writer working from the abstracted spec.

### FIX

**M3.05 / M3.06 / M3.13 / M3.19 — SPR rationale length (§7).** Norms are 40 / 40 / 100 / 130; delivered
68 / 84 / 165 / 190. M4's six SPRs average 99 words against the same norms and M4.05 lands at exactly
39 — so the house *can* write to length; M3 simply doesn't. The overrun is always the same two habits:
restating the function definition that the stem just displayed, and narrating both sides of every
add/divide. *Repair:* delete the premise restatement on bare solves (M4.05 is the template), and
collapse two-step arithmetic into one "…yields …, or …" clause. Targets: M3.05 → ~40, M3.06 → ~45,
M3.13 → ~110, M3.19 → ~135.

**M3.08 — E-MC rationale + figure redundancy.** 162 words against a 110 norm (§7), and the stem
states `AB = AC` while the SVG *also* carries congruence tick marks on both sides. CB does one or the
other. *Repair:* trim to ~115 words (the isosceles justification can be one sentence), and drop
either the tick marks or the stem clause — keeping the tick marks and writing "In the triangle shown,
what is the value of x?" is the more CB move.

**M3.10 — non-CB option-set shape (§3).** The four options are `47 < t < 55`, `47 < t ≤ 55`,
`47 ≤ t < 55`, `47 ≤ t ≤ 55`: the same two bounds four times, permuting only strictness. Every
measured CB compound-inequality set varies at least one bound, because a set that varies only the
symbol tests reading rather than modelling — and this item's whole demand is noticing that "lowest
recorded" means the value was attained. Nothing here is wrong; it just isn't shaped like a CB medium.
Stem is also exactly at the 55-word applied cap. *Repair:* re-cut so two options carry wrong bounds
(e.g. `47 ≤ t ≤ 55`, `47 < t < 55`, `0 ≤ t ≤ 55`, `47 ≤ t ≤ 60`), or convert the slot to a genuine
compound-inequality solve (`−3 ≤ 2t − 11 ≤ 9`) and let strictness be one distractor, not all three.

**M3.16 — stem phrasing (§2a) + length.** "What is the length of a radius of this circle?" — the
corpus has 0 instances of that construction and 22 of "the radius of the circle" / "the length of the
radius of the circle." PT4's own circles item asked "What is the radius of the circle?" correctly, so
this is a small regression. Rationale 194w vs 135. *Repair:* "What is the length of the radius of the
circle?" and trim the circumference derivation to two sentences.

**M3.18 — length + two soft overlaps.** 263 words vs a 170 norm (§7). Two smaller things: the clause
"which is still the greatest yield in the data set" is entailed by 47 > 32 and CB doesn't over-specify;
and the stem's "must be true" framing layers a quantifier mechanism on top of the robustness trap the
blueprint assigned here, while the blueprint reserved must-be/could-be for Q20 (spec §5: exactly one
mechanism per item). *Repair:* trim to ~180 words, delete the redundant clause, and change the stem
to "Which of the following describes how the mean and the median of the corrected data set compare
with…"— leaving "must" to Q20.

**M4.01 / M4.08 / M4.14 — cross-form archetype repeats (blueprint's differentiation promise).**
Not CB-authenticity failures — real forms do recycle these — but the blueprint explicitly promised a
different archetype wherever a skill repeats, and these three didn't move:
- M4.01 vs PT4 M3.02: flat fee + per-unit rate → "which equation represents this situation," same
  slope/intercept-swap trap, and three of four option slots share a template (`rate·x + fee`,
  `fee·x + rate`, `(rate+fee)x`).
- M4.08 vs PT4 M3.10: direct volume of a generic shipping container, with the identical
  perimeter / face-area / surface-area distractor ladder. PT5's *other* volume slot (M3.06) is the
  right-rectangular prism, which is PT4 M3.10's actual solid — so neither area-volume item is new.
- M4.14 vs PT4 M4.15: two-constraint "which system of inequalities," at-least ↔ at-most trap.
  M4.14 also runs 201 words vs a 135 norm.
*Repair:* linear-functions appears four times in PT5, so M4.01 has room — swap to a rate-of-change
read or a "which function models" with a decreasing rate. For area-volume, give one slot a composite
solid or a solve-backwards (volume given, find a dimension). For inequalities, PT5 already owns the
compound-range archetype at M3.10, so M4.14 could take the graph-of-a-solution-region or a
single-constraint maximum instead.

**M4.06 — number-set reuse from PT4.** PT4 M3.06 (easy SPR): `f(x) = 3x² − 5x + 9`, find f(4) = 37.
PT5 M4.06 (easy SPR): `f(x) = 3x² − 5x + 4`, find f(6) = 82. Identical leading and linear
coefficients, identical archetype, identical format and difficulty, adjacent slot. *Repair:* re-roll
the quadratic entirely — e.g. `f(x) = 2x² + 7x − 5`, f(4) = 55.

**M4.20 — stem cap + difficulty label.** 44 prose words on a figure-less, context-free item against the
§2b abstract cap of ≤35. It is also the softest item in either hard band: a single division by k² = 9,
where the question-bank labels the similar-triangle area-ratio family Medium. *Repair:* compress to
~32 words ("Triangle DEF is similar to triangle ABC, and each side of DEF is 3 times the length of the
corresponding side of ABC. If the area of DEF is 252 square inches, what is the area, in square inches,
of ABC?"), and either accept it as medium or add the one extra turn that earns the hard label — give a
*perimeter* ratio and ask for area, or give the area ratio and ask for a side length.

---

## 4. PT4-lesson check

| PT4 finding | Status in PT5 | Evidence |
|---|---|---|
| (a) missing statistical-robustness trap | **FIXED** | M3 Q18 — greatest of 15 values corrected 32 → 47; mean +1, median unchanged; airtight including the tie case. |
| (b) missing must-be/could-be trap | **FIXED in substance, not in form** | M3 Q20 delivers the quantifier as a CAPS "CANNOT," and M3 Q18's stem uses "must be true." Spec §3's named special set — options that turn on *could be* vs *must be* — still appears nowhere in either form. |
| (c) length/area-scale trap over-used 3× | **FIXED, and fixed the way PT4's critic prescribed** | Exactly 1 (M4 Q20). The two circles items now carry genuinely different mechanisms — arc-length proportionality (M3 Q16) and tangent ⊥ radius (M4 Q18) — which was the literal repair PT4's report asked for. Best-executed lesson of the five. |
| (d) applied share too high at 39% | **NOT FIXED** | 17/44 ≈ 38.6%, indistinguishable from PT4's 17/44. The blueprint's 15/44 = 34% is reached only by scoring M4 Q4 ("the mass, in grams, of a sample of a certain substance … after the start of an experiment") and M4 Q17 ("the number of bacteria in a certain culture") as abstract; PT4's critic counted thinner contexts than those (e.g. square banners) as applied. Per-domain shares are healthy (PSDA 88%, ALG 36%, ADV 21%, GEO 25%); the total simply didn't come down. |
| (e) some rationales over length norms | **REGRESSED — now systemic** | PT4 had ~5 outliers against otherwise-in-range prose. PT5 is over across the board: E-MC mean 136 vs 110, M-MC 163 vs 135, H-MC 212 vs 170, and M3's six SPRs mean 133 against a 90 norm. Six items sit ≥+45%. M4's selfcheck reports its own ranges ("easy MC 131–157 w, medium MC 126–201 w, hard MC 189–237 w") without flagging them. |

**Two forward-looking PT4 recommendations also went unactioned.** PT4's report asked the blueprint to
schedule a **function-notation nesting** item for future forms; PT5's blueprint didn't, and the family
went from 1 in shipped PT4 (M3.19, `g(f(3))`) to 0. Shipped PT4 also carried an
**extraneous/nonreal-solution** item (M3.17, `√(15−x) = 3−x` with a Roman I/II set); PT5 has none, and
no Roman-numeral set at all. Spec §5 asks for ~1 of each per form. And the cosmetic "harmonize the
origin `O` glyph" note is still open — `O` is italic in M3-Q15.svg and roman in M4-Q04.svg and
M4-Q16.svg.

**Net: 2 of 5 clean fixes (a, c), 1 partial (b), 1 unfixed (d), 1 regression (e).**

---

## 5. Originality audit detail

Scenario/noun-phrase greps across all 8 extracted sources for every distinctive PT5 referent —
orchard, rainwater, cistern, chess club, creamery, solar array, gondola, thallus, Rhizocarpon, lichen,
textile, loom, weather balloon, courier, parking garage, shipping box, test plot, brush, museum, adult
ticket, nonmember, Mateo, Idris — returned **zero hits**. Three lexical hits are different scenario
classes and are fine: "trailer" (a towing-capacity item), "dot plot" (data set A, 15 values — which
also confirms dot plots are attested), and "number of bacteria in a population" (a doubling-time item,
different question and different structure from M4 Q17's unit conversion). Number-pipeline greps for
48 constants and equations returned only incidental digit matches (`201` inside years, `729` inside a
decimal, `216` inside a survey table, `15/2` as an unrelated triangle-area answer). Caveat worth
recording: the exports strip inline math, so number-level collision checking has limited power on this
corpus — noun-phrase and scenario checking is the reliable instrument, and that is what caught M4.18.

A normalised longest-common-phrase scan of all 44 stems against the full corpus returned six matches
of ≥10 words — M3.22, M4.07, M4.11, M4.12, M4.21, M4.22 — and every one of them is a spec §2a
mandated formula ("The solution to the given system of equations is (x, y). What is the value of ___?",
"Right triangle ABC is shown. What is the value of ___?", "How many distinct real solutions does the
given equation have?"). Those are liturgy, not collisions. The one true violation, M4.18, scored only
9 words on that metric — the scenario matched while the surface differed, which is exactly why the
structural read matters more than the n-gram.

Internal 44 × 44: no context repeats. Soft echoes worth watching: two direct-volume computations
(M3.06 prism, M4.08 cube); two laboratory/exponential contexts inside M4 (Q4 decaying substance,
Q17 growing bacteria culture); two "two conditions determine the constants, then report a composite"
hard SPRs (M3.19, M4.22); and the SPR answer **12** appearing at Q12 in *both* modules. None is
disqualifying; the last one is the kind of coincidence an editor would still re-roll.

One judgement call: *Rhizocarpon* is the real lichenometry genus and near-linear thallus growth after
the great period is genuinely how the dating method works, so the item's premise is unusually
well-founded — but *nivalescens* is invented, and CB uses real binomials. A real, dull species would
carry the same load with less exposure.

---

## 6. PT4 vs PT5 — differentiation verdict

**Verdict: substantially differentiated at form level, with two items that break the firewall
outright and three that quietly re-run PT4's archetypes.**

What landed as designed. Every deliberate variation in the blueprint's own "How PT5 differs" table is
real and verifiable: the domain mix moved to ALG 14 / GEO 8 exactly; the difficulty split flipped to
M3 8/8/6 and M4 9/7/6 exactly; inference-statistics went to 0 and one-variable-data to 2; the visual
palette is genuinely new (a dot plot and an exponential-decay curve, neither of which PT4 used, and
PT4's line graph and second scatter are gone); the SPR census changed shape from 9/3/0-decimal to
9/2/1-decimal with the negative moved from a fraction to an integer; the length/area-scale trap fell
from 3 to 1; and the context firewall is respected in full — all seventeen PT4 contexts avoided, and
sixteen of PT5's seventeen contexts come from the blueprint's suggested palette. The name changed. The
two circles items were re-mechanised precisely as PT4's critic asked. Skill-for-skill, most repeats do
carry new archetypes: linear-functions moved from graph-read to table-read, right-triangle-trig from
the cofunction identity to a Pythagorean-then-ratio and a figure read-off, percentages from a chained
multiplier to a reverse percent and an algebraic multiplier, systems from represent-the-situation to
a parameter hunt and a symmetric-sum shortcut, nonlinear-equations from an extraneous root to a
structured radicand and an absolute-value solution count.

What didn't. M3.15 is not a variation of PT4 M4.04 — it is PT4 M4.04 with one distractor swapped and
a label bump, on the same parabola. M4.06 is PT4 M3.06 with one coefficient changed. M4.01, M4.08 and
M4.14 re-run PT4's fee-plus-rate model, its volume-with-formula-ladder and its two-constraint
inequality system respectively, trap and option template included; individually defensible as CB
recycling its own furniture, collectively they mean three of PT5's easy/medium slots are doing PT4's
work in new clothes. And in the other direction, two of PT4's exotica (function-notation nesting,
extraneous roots) simply vanished rather than being replaced by different exotica — so PT5's trap
palette is narrower than PT4's even though it closed PT4's two named gaps.

Fix M3.15 and M4.06 outright and the firewall holds. Re-roll one of M4.01/M4.08/M4.14 and the forms
read as genuine siblings rather than one form and its cousin.

---

## 7. Would it pass as Bluebook?

Put these 44 in front of a student who has worked every official form, and 40 of them go by without a
flicker. The bones are right in a way that is now habitual rather than lucky: quotas exact to the item
across all nineteen skill rows, a flat 4/4/4/4 key in both modules, twenty-two numeric option sets all
genuinely ascending, twelve SPRs whose accepted-entry lists are complete and legal to the character,
and — the thing I checked hardest — 96 distractors that every one of them close under a nameable
recipe. I re-solved the whole form symbolically and found not one arithmetic error, not one ambiguous
key, not one option reachable only by hand-waving. The liturgy is the cleanest of any form I have
audited here: 44 of 44 rationales open correctly, close on "Therefore," and dismiss in strict letter
order with the fixed formulas, curly apostrophes throughout. The SVGs are better than PT4's — the
gridline gap that PT4 shipped is fixed, every figure's alt text survives re-measurement against the
pixel geometry, and the scale note appears on the two geometry figures and nowhere else.

The three strongest items are **M4.12**, where adding two symmetric equations collapses the whole
problem to 8(x + y) = 96 and the rationale says so in 86 words — one insight, frictionless arithmetic,
nothing wasted; **M4.22**, whose identity is engineered so that a comes out as 3/2 and b as 5 and the
asked product is clean, which is exactly how CB makes a hard closer hard without making it messy; and
**M3.20**, where the CANNOT-negation is load-bearing and all three wrong values of k verifiably do
produce one solution, closing a gap PT4 left open. M4.21 and M3.19 are half a step behind.

The three weakest are the two rewrites and one design miss. **M3.15** is the same parabola, same key
and three of the same four options as a PT4 item a student may have seen last week. **M4.18** is a
College Board question-bank item's scenario and stem trio re-derived almost word for word — the
irony being that it is otherwise the best-constructed hard item in the form, with the perpendicular-slope
trio executed perfectly. **M3.10** is nobody's fault mathematically, but four options that permute only
`<` against `≤` on one fixed pair of bounds is a shape CB does not make.

What a rater would actually squint at is above the item line. The ramp is a perfect step function in
both modules — eight easies, then eight mediums, then six hards, with not one straggler — where every
measured form has an honest dip; the spec licenses the dip precisely because real forms wobble.
The rationales run a fifth to a quarter long in every band, and unlike PT4 this is now a house habit
rather than a handful of misses. The applied share never actually came down. And the trap palette,
having closed PT4's two named gaps, quietly lost two others, so the form still narrates a smaller
taxonomy than a real one. None of that is visible to a student. All of it is visible to anyone
auditing against the measured corpus — which, on the evidence of M4.18, is a corpus the writers
should be grepping before they ship, not after.

*Verified 2026-08-14. Every judgement recomputed from the JSON and SVG artifacts and from the
extracted sources; selfcheck claims were independently confirmed except where contradicted above.*
