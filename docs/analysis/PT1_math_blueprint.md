# Practice Test 1 — Math Modules 3 & 4: 44-Slot Blueprint (binding)

Style contract: docs/CB_Math_Style_Spec.md (unchanged, binding). This blueprint re-rolls the
form WITHIN the measured ranges so PT1 is a genuinely different form from PT4 and PT5 — not a
renumbered clone of either.

## How PT1 deliberately differs from PT4 and PT5 (all inside measured bounds)
| Dimension | PT4 | PT5 | **PT1** | Measured range |
|---|---|---|---|---|
| Domain mix (form) | 15/14/8/7 | 14/14/8/8 | **ALG 15 / ADV 13 / PSDA 9 / GEO 7** | ALG 14–16, ADV 13–15, PSDA 7–9, GEO 6.5–9 |
| Difficulty | M3 9/7/6, M4 8/8/6 | M3 8/8/6, M4 9/7/6 | **M3 9E/7M/6H, M4 9E/7M/6H** (18/14/12 = 40.9/31.8/27.3) | E~42/M~32/H~26, parallel modules |
| Skill emphasis | inference 1, NLF 7, ratios 2E | inference 0, NLF 7, one-var 2 | **inference 1 (point-estimate, NOT MoE), NLF 6, PSDA 9 w/ percentages 2** | inference 0–1; NLF 6–8 |
| Visual palette | table, line graph, geom, scatter / geom, parabola, two-way table, scatter | dot plot, geom, table, parabola / exp curve, two-way table, geom, scatter | **exp-from-TABLE, two-line graph, geom fig, curve / freq table, BAR GRAPH, cylinder fig, scatter** | bar graph rare-but-attested (2 in 216) |
| SPR census | 9 int / 3 frac / 1 neg | 9 int (1 neg) / 2 frac / 1 dec | **8 int (1 neg, one 4-digit, one 3-digit) / 3 frac / 1 dec** | spec §6 default exactly |
| Archetypes | see PT4 blueprint | see PT5 blueprint | **fresh archetype wherever a skill repeats** (grid below) | 2–5 archetypes per skill |
| Signature items | MoE menu, no-solution k | infinitely-many k, tangent ⊥ | **parallel+perpendicular stamped pair (E+M), Vieta product-of-solutions, sequences nth-term, exp-scatter b-reasoning** | all attested in bank |

Invariants NOT re-rolled (fixed across all 8 official modules): 22 items, 16 MC + 6 SPR,
SPR at **5, 6, 12, 13, 19, 22** with difficulty E/E/M/M/H/H, monotone ramp with one honest
dip (M at Q9, E straggler Q10, both modules), hard SPR closer, ascending numeric options,
key letters ≈4/4/4/4 (±1), probability in Module 4 only, ≥1 circles per module (both H),
evaluating-statistical-claims absent, applied share 15/44 ≈ 34%.

## Context firewall — PT4 and PT5 already used these; source PDFs are also off-limits
PT4: pottery studio · community garden seeds · recycling drive · nature-center visitors ·
ferry tickets · storage crate · greenhouse seedlings · marsh bird (Latin binomial) · freight
elevator · furlong track · library format survey · ceramics kiln · tree canopy · square
banners · bus-route survey · robotics kits · used bicycles · Nadia.
PT5: orchard crates (Mateo) · creamery cave · solar-array modules (percent) · gondola lift ·
chess club dot plot · rainwater cistern · museum admissions two-way table · parking garage ·
weather balloon · textile mill · trail-maintenance crew · courier tiers · lichen (Latin
binomial) · test-plot yields · shipping cube · moving-van?? (no — freight was PT4; PT5 used none).
Full item-level list: see workpapers `used_contexts_t4_t5.txt`. Zero context, number-set, or
scenario reuse from PT4, PT5, or any source PDF item.

**PT1 palette (seeds, writers flesh out, stay dry):** town population density · bicycle repair
shop (flat diagnostic fee + hourly labor) · hardware-store workshop kits · rooftop-solar
household survey · harvest-festival attendance · kayak rental · laboratory bacteria culture ·
gift-wrapping stand · landscaping order (ferns/shrubs/grasses) · smoothie stand daily sales ·
bottling machine · flagpole & signpost shadows · cargo trailer load limit · declining beetle
species (the form's ONE invented Latin binomial, M4 Q21). Named people: exactly 2 in the form,
one per module, diverse single given names, each performing one act.

---

## MODULE 3 (moduleNumber 3) — 9E / 7M / 6H · SPR at 5, 6, 12, 13, 19, 22

| # | skill (id) | diff | fmt | visual | archetype (B §2) | trap (spec §5) | context | notes |
|---|---|---|---|---|---|---|---|---|
| 1 | linear-equations-one-variable (11) | E | MC | — | bare 2-step solve, subtracted constant (5x − 9 = 21 shape) | verbatim-number echo | abstract | integer answer; distractors = stem echoes + sign slip |
| 2 | ratios-rates-proportions (19) | E | MC | — | **density: population ÷ area** (division direction) | wrong operation (×), part/total | town population density, people per km² | integer choices ascending |
| 3 | nonlinear-functions (16) | E | MC | **HTML table** | **which exponential function fits the table** (x = 0, 1, 2) | a↔b swap in a(b)ˣ | abstract (x, f(x) table) | 4 single-slot function variants |
| 4 | linear-functions (12) | E | MC | — | **interpretation of the y-intercept** in an applied model | interpretation mis-mapping menu | bicycle repair shop: flat diagnostic fee + per-hour labor | 4 parallel sentences permuting fee/rate/hours/total |
| 5 | linear-functions (12) | E | SPR | — | evaluate f(a), **negative slope**: f(x) = 40 − 3x, f(8) | — | abstract | **int 16** |
| 6 | percentages (20) | E | SPR | — | direct percent with decimal result: "What number is 15% of 31?" | — | abstract | **DECIMAL 4.65** — the form's one decimal SPR |
| 7 | systems-linear-equations (14) | E | MC | **SVG two-line graph** | **graphical: read the intersection** | ordered-pair reversal | abstract, xy-plane | choices = ordered pairs incl. reversed pair |
| 8 | lines-angles-triangles (27) | E | MC | **SVG geometry fig** | **exterior-angle theorem** | adjacent-quantity (supplement vs exterior) | abstract triangle figure | "Note: Figure not drawn to scale." |
| 9 | systems-linear-equations (14) | M | MC | — | two-totals word problem — **SOLVE for one quantity** (PT4 only represented) | reversal | hardware-store workshop kits: two kit prices, count + revenue totals | standing trio: swap totals / swap coefficients |
| 10 | area-volume (26) | E | MC | — | direct **sphere** volume, formula GIVEN parenthetically | adjacent (surface area 4πr², r² slip, diameter) | abstract sphere (dip straggler) | π symbolic, ascending |
| 11 | linear-equations-two-variables (13) | M | MC | — | **perpendicular slope**, fraction m (stamped-skeleton pair with M4 Q3) | reciprocal trio (reciprocal / plain negative / original) | abstract | m = 2/5-style → −5/2 |
| 12 | two-variable-data (22) | M | SPR | **SVG curve** | **average rate of change between two labeled points on a shown graph** | — | abstract y = f(x) curve, points (1, 4) and (7, 13) | **FRACTION 3/2** (+1.5) |
| 13 | right-triangles-trigonometry (28) | M | SPR | — | **Pythagorean: rectangle diagonal**, 20-21-29 triple | — | thin: a rectangle's dimensions | **int 29** |
| 14 | nonlinear-functions (16) | M | MC | — | **vertex/min location from standard form** (for what x is f minimum) | adjacent (min VALUE vs location, y-int) | abstract, f(x) = x² − 10x + 21 shape | |
| 15 | equivalent-expressions (18) | M | MC | — | **factor: "Which of the following is a factor of…"** (trinomial) | sign flip / wrong pair | abstract | ensure exactly ONE listed factor is right |
| 16 | inference-statistics (24) | M | MC | — | **point-estimate scale-up** (sample proportion × population) | wrong anchor (sample size vs population) | civic survey: households with rooftop solar panels | NOT the MoE menu (PT4 used it) |
| 17 | linear-equations-one-variable (11) | H | MC | — | **constant-parameter: infinitely many solutions → k** | solution-count reasoning | abstract, a(kx + b) = cx + d engineered | |
| 18 | circles (29) | H | MC | — | **point-on-circle bounds: "which is NOT a possible value"** | must/cannot quantifier, CAPS negation | abstract, xy-plane | radius-bound reasoning |
| 19 | nonlinear-functions (16) | H | SPR | — | **geometric-word quadratic**: length = width + 5, area 266 → width | — | thin: a rectangular photograph/panel | **int 14** |
| 20 | percentages (20) | H | MC | — | **percent-change extrapolation with compounding** ("increases by the same percent again") | percent-multiplier semantics (added vs compounded) | harvest-festival attendance, two years then a third | distractor = linear add |
| 21 | nonlinear-equations (17) | H | MC | — | **product of the solutions (Vieta)**, 2x² − 7x − 15 shape | answer-the-wrong-target (structure over solving) | abstract | options ± c/a, ± b/a ascending |
| 22 | nonlinear-equations (17) | H | SPR | — | **parameter for exactly one real solution, LEAST value** (x² + kx + 49 → k = ±14) | sign-slip on ± | abstract | **NEGATIVE int −14** — the form's one negative |

Module 3 visuals: HTML table (Q3), two-line graph (Q7), geometry figure (Q8), curve (Q12) = 4.
Applied slots: Q2, Q4, Q9, Q16, Q20 (+ thin Q19) = 5. Named person: one (suggest Q4 or Q9).

---

## MODULE 4 (moduleNumber 4) — 9E / 7M / 6H · SPR at 5, 6, 12, 13, 19, 22

| # | skill (id) | diff | fmt | visual | archetype (B §2) | trap (spec §5) | context | notes |
|---|---|---|---|---|---|---|---|---|
| 1 | linear-functions (12) | E | MC | — | applied model → "Which equation represents this situation?" | slope/intercept swap | kayak rental: one-time fee + per-hour charge | 4 single-slot variants |
| 2 | equivalent-expressions (18) | E | MC | — | **difference of two polynomials** | sign error in distributing the minus | abstract | |
| 3 | linear-equations-two-variables (13) | E | MC | — | **parallel slope, integer m** (stamped pair with M3 Q11) | reciprocal/negative trio | abstract | |
| 4 | probability (23) | E | MC | **HTML freq table** | **simple probability from a one-way frequency table** (PT4/PT5 both went conditional) | wrong denominator (category vs total) | vehicles in a lot / animal-shelter intake by type | fraction options ascending |
| 5 | nonlinear-functions (16) | E | SPR | — | evaluate a **cubic**: f(x) = x³ − 4x, f(3) | — | abstract | **int 15** |
| 6 | linear-equations-two-variables (13) | E | SPR | — | bare ax + by = c, given x find y: 3x + 5y = 57, x = 4 | — | abstract | **int 9** |
| 7 | nonlinear-functions (16) | E | MC | — | **interpretation of p(0) = a** in a doubling exponential | interpretation mis-mapping menu | laboratory bacteria culture doubling per hour | 4 parallel sentences |
| 8 | linear-inequalities (15) | E | MC | — | represent single-constraint budget **with a flat fee**: c·r + f ≤ B | at-least ↔ at-most | gift-wrapping stand: booth fee + cost per roll, budget cap | inequality direction + fee placement slots |
| 9 | linear-equations-one-variable (11) | M | MC | — | **applied 3-quantity verbal chain** (twice as many X as Y…, total given) | wrong anchor (reports the other quantity) | landscaping order: ferns, shrubs, ornamental grasses | |
| 10 | one-variable-data (21) | E | MC | **SVG bar graph** | compute the **median from a bar graph** (7 bars, unsorted heights) | adjacent (mean / range / mode offered) | smoothie stand: cups sold per day for 7 days (dip straggler) | the form's rare-visual |
| 11 | area-volume (26) | M | MC | **SVG cylinder fig** | **inverse volume: V and r given → height**, π symbolic | ÷ slip (used d), r² skipped | abstract right cylinder | figure + "Note: Figure not drawn to scale." |
| 12 | ratios-rates-proportions (19) | M | SPR | — | **two-hop unit rate**: 51 bottles per 3 minutes → per hour | — | bottling machine | **int 1020** — the engineered 4-digit |
| 13 | nonlinear-equations (17) | M | SPR | — | **"What is the positive solution…"** factorable: 6x² = 7x + 20 | — | abstract | **FRACTION 5/2** (+2.5); negative root rejected |
| 14 | lines-angles-triangles (27) | M | MC | — | **similar triangles via shadows** (applied compute — the rare applied-geometry) | reversed ratio | flagpole and signpost with measured shadows | verbal, no figure |
| 15 | nonlinear-equations (17) | M | MC | — | **linear–nonlinear system**: which ordered pair is a solution / find coordinate | step-skip (solved line only) | abstract, y = x + k with parabola | |
| 16 | linear-inequalities (15) | M | MC | — | **integer optimization**: max count of heavier item under weight cap + min lighter count | boundary strict/inclusive | cargo trailer: two crate weights, load limit | "greatest number of…" |
| 17 | systems-linear-equations (14) | H | MC | — | **mismatched forms, target x + y** (adding halves it; full solve is non-integer) | answer-the-wrong-target | abstract | 7x − 3y = 52, −5x + 5y = −30 shape → x + y = 11 |
| 18 | circles (29) | H | MC | — | **diameter endpoints → circle equation** | r vs r², center sign slips | abstract, xy-plane | 4 single-slot equation variants |
| 19 | linear-functions (12) | H | SPR | — | **two conditions determine f, evaluate at a new input**: f(3) = 19, f(7) = 43 → f(20) | — | abstract | **int 121** — the 3-digit |
| 20 | nonlinear-functions (16) | H | MC | — | **sequences: which equation gives the nth term** (first term 5, ratio 3) | exponent-structure (n vs n − 1) | abstract sequence | 4 variants: 5·3ⁿ, 5·3ⁿ⁻¹, 3·5ⁿ⁻¹, 15ⁿ⁻¹-style |
| 21 | two-variable-data (22) | H | MC | **SVG scatter** | **exponential scatter: "closest to the value of b"** (decreasing ⇒ 0 < b < 1, no computing) | statistical-model parameter reasoning | count of an invented beetle species (the Latin binomial) vs year | ~10 dots, no fit curve |
| 22 | equivalent-expressions (18) | H | SPR | — | **rational exponents**: ⁴√x³ · ⁶√x⁵ = xᵏ → k | — | abstract, x > 0 | **FRACTION 19/12**; entry-forms note |

Module 4 visuals: freq table (Q4), bar graph (Q10), cylinder figure (Q11), scatter (Q21) = 4.
Applied slots: Q1, Q4, Q7, Q8, Q9, Q10, Q12, Q14, Q16, Q21 = 10. Named person: one (suggest Q1 or Q9).

---

## Form-level checks (the critics enforce)
- Domains: ALG 15 (M3 7 / M4 8), ADV 13 (6/7), PSDA 9 (5/4), GEO 7 (4/3).
- Skills: lin-eq-1var 3 · lin-func 4 · lin-eq-2var 3 · systems 3 · lin-ineq 2 · NLF 6 · NLE 4 ·
  equiv-expr 3 · ratios 2 · percentages 2 · one-var-data 1 · two-var-data 2 · probability 1 (M4) ·
  inference 1 · evaluating-statistical-claims 0 · area-volume 2 · lines-angles 2 ·
  right-tri-trig 1 · circles 2 (1 per module, both H).
- SPR census (12): 8 integers — 16, 29, 14, −14 (the one negative), 15, 9, 1020 (4-digit), 121
  (3-digit); 3 fractions — 3/2, 5/2, 19/12 (all lowest terms, decimal forms in acceptedAnswers);
  1 decimal — 4.65. Matches spec §6 default exactly.
- Traps (≈): wrong-target ×3 (M3-21, M4-17, + M3-14 value-vs-location pressure) · role-swap ×3
  (M3-4, M4-1, M3-11/M4-3 trio) · solution-count/parameter ×2 (M3-17, M3-22) · sign-slip ×2
  (M4-2, M3-22) · percent-multiplier ×1 (M3-20) · r-vs-r²/scale ×2 (M4-11, M4-18) ·
  formula-fragment ×1 (M3-10) · interpretation menus ×2 (M3-4?—no: M3-4 counts once; M4-7) ·
  exponent-structure ×2 (M4-20, M4-22) · statistical reasoning ×1 (M4-21) · must-be/cannot ×1
  (M3-18) · nonreal-solution awareness ×1 (M3-22 discriminant) · verbatim echo (easy sets,
  pervasive). Exactly ONE mechanism per item.
- Applied share 15/44 ≈ 34%; exactly 2 named people (one per module); exactly one Latin
  binomial (M4 Q21, invented species name).
- Zero context/number collisions with PT4, PT5 (see firewall), or any source PDF item.
- Key letters ≈ 4/4/4/4 (±1) per module over 16 MC via honest ascending ordering.

---

## Blueprint latitudes exercised in authoring (recorded, binding going forward)

Five decisions taken while authoring and fixing PT1 sit at the edge of (or amend) a line in this
blueprint. They are recorded here so the shipped form and the blueprint agree.

| # | Latitude | Slot | How it was exercised | Consequence tracked |
|---|---|---|---|---|
| L1 | Sphere volume formula **given parenthetically** | M3 Q10 | Stem carries "(The volume V of a sphere with radius r is given by V = (4/3)πr³.)" although official-corpus sphere items lean on the reference sheet. Kept deliberately: the app player shows **no reference sheet**, so the item is unanswerable without it. | Licensed deviation from official-corpus practice; policy holds for future no-reference-sheet forms |
| L2 | Function-notation-**nesting trap** (~1 per spec §5) | — | Not present in the 44 items; the gap is inherited from this blueprint's own trap table, which never assigned nesting a slot. | Spec-level gap, 0 delivered; **booked for PT6 rebalance** |
| L3 | M4 Q11 cylinder numbers | M4 Q11 | Retuned post-critique from (r = 6 cm, V = 288π) to **r = 4 cm, V = 128π → h = 8** (options 2/8/16/32, key B): the drafted pair collided form-level with M3 Q10's sphere (constant 288π, radius 6). | Form-level "zero number collisions" restored; Q11 reads with r = 4 going forward |
| L4 | M4 Q20 sequence parameters and stem | M4 Q20 | Uses **(first term 4, ratio 6)** — not the drafted (5, 3) — and the attested QB stem "If a(n) represents the nth term of the sequence, which equation gives a(n) in terms of n?" (avoids the extraction-stripped official pair and the within-form 3-and-5 echo of M4 Q6). Key a(n) = 4(6)ⁿ⁻¹ at letter A; M4 tally A5/B5/C3/D3, within ±1. | Q20 row's "(first term 5, ratio 3)" and option list superseded |
| L5 | M4 Q1 surface texture | M4 Q1 | Varied from the app PT5 same-slot sibling (parking garage, flat fee + integer hourly): corpus-absent name (Priya), $14 one-time equipment fee with a **non-integer $9.50 hourly rate**, C/h variables, canonical "which equation represents this situation?" closer. | Same-slot stamping with PT5 broken; swap/sum/product distractor architecture retained |
