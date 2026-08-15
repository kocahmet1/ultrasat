# Practice Test 6 — Math Modules 3 & 4: 44-Slot Blueprint (binding)

Style contract: docs/CB_Math_Style_Spec.md (unchanged, binding). This blueprint re-rolls the form
WITHIN the measured ranges so PT6 differs from BOTH shipped forms (PT4, PT5).

## How PT6 differs from PT4 and PT5 (all inside measured bounds)
| Dimension | PT4 | PT5 | **PT6** | Measured constraint |
|---|---|---|---|---|
| Domain mix (form) | 15/14/8/7 | 14/14/8/8 | **ALG 15 / ADV 14 / PSDA 7 / GEO 8** | per-module ALG 7–10, ADV 7–9, PSDA 3–6, GEO 4–6 |
| Per-module domains | — | — | **M3: 8/7/3/4 · M4: 7/7/4/4** | every count inside the measured band |
| Difficulty | 9/7/6 + 8/8/6 | 8/8/6 + 9/7/6 | **9E/7M/6H both modules** | parallel modules, pooled E42/M32/H26 |
| Skill emphasis | inference 1, 2-var 2 | inference 0, 1-var 2 | **inference 1, 1-var 1, 2-var 1, area-volume 2, lin-eq-2var 3** | inference 0–1/form |
| Visual palette | table·line·geom·scatter / geom·parabola·2-way·scatter | dot plot·geom·table·parabola / exp curve·2-way·geom·scatter | **bar graph·scatter·geometry·line graph / two-way table·geometry·parabola·data table** | bar graph attested (2 in 216) and unused so far |
| SPR census | 9 int / 3 frac (1 neg) | 9 int (1 neg) / 2 frac / 1 dec | **8 int / 3 frac (one NEGATIVE fraction) / 1 decimal** | ~70% int, ~23% frac, ~7% dec, 4–9% neg |
| New trap family | — | robustness, must/could, nesting, extraneous | **"not-to-scale doubt" (measured 3 in 216, never used yet)** | spec §5 #18 |
| Applied share | 39% (over) | 34% | **target 14/44 ≈ 32%** | band 30–35% |

Invariants NOT re-rolled (fixed across all 8 measured modules): 22 items, 16 MC + 6 SPR,
SPR at **5, 6, 12, 13, 19, 22** with difficulty E/E/M/M/H/H, monotone ramp **with exactly one
honest dip per module**, hard SPR closer, ascending numeric options, key letters ≈4/4/4/4,
probability in Module 4 only, ≥1 circles per module, evaluating-statistical-claims absent.

**App limitation to respect:** answer choices render as plain React text, so the measured
"which table/graph is correct" answer-choice-exhibit archetype cannot be used. Do not attempt it.

## Context firewall — PT4 AND PT5 already used these; do NOT reuse
PT4: pottery studio · community garden seed packets · recycling drive · nature-center visitors ·
ferry tickets · storage crate · greenhouse seedlings · marsh bird · freight elevator · furlong
track · library format survey · kiln bowls · tree canopy · square banners · bus-route survey ·
robotics kits · used bicycles. PT5: orchard crates · rainwater cistern · chess club dot plot ·
creamery cave · solar array modules · gondola ridership · test-plot yields · parking garage ·
weather balloon · grain silo · museum admissions · textile mill fabric · trail crew · lichen
thallus scatter · courier tiers. **Names used: Nadia (PT4), Mateo, Idris (PT5) — pick new ones.**
PT6 palette (suggested): food co-op bulk bins · aquarium tank · print shop · tram fares · rowing
club · bakery proof box · ski rental · wind turbine · pledge drive · cider press · kayak livery ·
bookbindery · observatory · hardware store · laundromat · seed library · marching band · quarry ·
tide-pool survey · ferry-free: harbor buoy.

---

## MODULE 3 (moduleNumber 3) — 9E / 7M / 6H · SPR at 5, 6, 12, 13, 19, 22
Domains: ALG 8 · ADV 7 · PSDA 3 · GEO 4

| # | skill (id) | diff | fmt | visual | archetype (B §2) | trap (spec §5) | context | notes |
|---|---|---|---|---|---|---|---|---|
| 1 | linear-equations-one-variable (11) | E | MC | — | bare solve, one distribution step | verbatim-number echo | abstract | |
| 2 | linear-functions (12) | E | MC | — | evaluate a defined linear f at a point | adjacent-quantity (x vs f(x)) | abstract | |
| 3 | ratios-rates-proportions (19) | E | MC | — | **density / total = rate × amount** | reciprocal rate | print shop: sheets per hour | |
| 4 | equivalent-expressions (18) | E | MC | — | **factor a difference of squares** (or simple factor) | sign error in factoring | abstract | ≤15-word stem |
| 5 | linear-equations-two-variables (13) | E | SPR | — | ax + by = c, given one variable solve the other | — | food co-op: two bin sizes, fixed total | integer |
| 6 | nonlinear-functions (16) | E | SPR | — | evaluate a quadratic at a point | — | abstract | integer |
| 7 | one-variable-data (21) | E | MC | **SVG bar graph** | read a frequency display (bar) | value ↔ frequency / category total | tide-pool survey: counts of a snail species — **carries the form's one Latin binomial** | bars gray-filled, axis titles roman |
| 8 | lines-angles-triangles (27) | E | MC | **SVG geometry fig** | parallel lines + transversal | **not-to-scale doubt** (amended 2026-08-15) — the figure is deliberately misdrawn: the wedge labelled 68° is drawn at 112.06°, the wedge labelled x° at 67.94°, so the eyeball answer 68 is a real option | abstract figure | scale note present; the drawn pair still sums to 180°, so nothing in the drawing contradicts a given |
| 9 | area-volume (26) | M | MC | — | **inverse formula** (given volume + all-but-one dimension → find the missing one) | formula-fragment omission | aquarium tank | root or division required |
| 10 | linear-functions (12) | E | MC | **SVG line graph** | read slope/intercept from a shown line and select its equation | slope/intercept swap | abstract, xy-plane | **the ramp dip: easy at position 10** |
| 11 | linear-inequalities (15) | M | MC | — | **integer optimization / solution check** (max count under a cap with a minimum) | strict vs inclusive boundary | kayak livery: two boat weights | |
| 12 | systems-linear-equations (14) | M | SPR | — | two-totals word problem → solve for one quantity | — | bakery: two tray sizes, two totals | integer |
| 13 | nonlinear-equations (17) | M | SPR | — | **literal rearrangement then evaluate** | — | abstract | **fraction** answer, lowest terms |
| 14 | two-variable-data (22) | M | MC | **SVG scatter** | **rate of change between two shown points** / predicted-vs-observed | adjacent-quantity (observed vs predicted) | wind turbine: wind speed vs output | ~10 dots + fit line |
| 15 | nonlinear-functions (16) | M | MC | — | **exponential model selection** ("decreases by p% each year → which function") | exponent-structure (decay factor) | pledge drive or ski rental | Unicode superscripts |
| 16 | linear-equations-two-variables (13) | M | MC | — | **perpendicular/parallel slope** with a fraction slope | reciprocal vs negative-reciprocal | abstract | standing trio distractors |
| 17 | nonlinear-functions (16) | H | MC | — | **quadratic vertex/min from standard form** ("for what value of x does f reach its minimum?") | ordered-pair / x-vs-y reversal | abstract | |
| 18 | right-triangles-trigonometry (28) | H | MC | — | **special triangle (30-60-90 or equilateral height)** with a √3-bearing answer | **special-triangle side ratio applied to the wrong side** (amended 2026-08-15) — the 2:1 hypotenuse relation used on the asked side, so choice B is DF halved. Not-to-scale doubt moved to Q8, which actually has a figure; leg↔hypotenuse is reserved for M4 Q11, the form's other right-triangle item | abstract, verbal | radicals survive into options |
| 19 | linear-equations-one-variable (11) | H | SPR | — | **constant-parameter, coefficient matching** (infinitely many solutions → find the constant) | — | abstract | engineered **3-digit integer** |
| 20 | circles (29) | H | MC | — | **complete the square → radius or center** | r² vs r slip | abstract, xy-plane | figure-less |
| 21 | nonlinear-equations (17) | H | MC | — | **linear–nonlinear system**: intersection ordered pair / a coordinate | sign-slip on substitution | abstract | |
| 22 | nonlinear-functions (16) | H | SPR | — | two constants jointly constrained → composite target | answer-the-wrong-target (composite) | abstract | **NEGATIVE fraction** — the form's only negative |

Module 3 visuals: bar graph (Q7), geometry figure (Q8), line graph (Q10), scatter (Q14) = 4.
Applied slots: Q3, Q5, Q7, Q9, Q11, Q12, Q14, Q15 = 8.
Skills: 1var 2 · func 2 · 2var 2 · systems 1 · ineq 1 · NLF 4 · NLE 2 · EE 1 · ratios 1 · 1-var-data 1 ·
2-var-data 1 · AV 1 · LAT 1 · RTT 1 · circles 1 = 22.

---

## MODULE 4 (moduleNumber 4) — 9E / 7M / 6H · SPR at 5, 6, 12, 13, 19, 22
Domains: ALG 7 · ADV 7 · PSDA 4 · GEO 4

| # | skill (id) | diff | fmt | visual | archetype (B §2) | trap (spec §5) | context | notes |
|---|---|---|---|---|---|---|---|---|
| 1 | linear-equations-one-variable (11) | E | MC | — | **applied single-unknown model** → "Which equation represents this situation?" | slope/intercept role swap | laundromat: card fee + per-load charge | |
| 2 | equivalent-expressions (18) | E | MC | — | simplify a sum/difference of polynomials | wrong-operation on exponents | abstract | |
| 3 | ratios-rates-proportions (19) | E | MC | — | **unit conversion, two hops** (factor GIVEN) | **unit-conversion chain** (direction/partial) | quarry: stone per shift | factor in parentheses |
| 4 | linear-functions (12) | E | MC | — | applied model, forward use (evaluate at a point) | adjacent-quantity | tram fares | where-clause defines variables |
| 5 | systems-linear-equations (14) | E | SPR | — | solve a system, report one variable | — | abstract | integer |
| 6 | area-volume (26) | E | SPR | — | direct area/volume with a scale step | — | bookbindery: cover panels | integer |
| 7 | nonlinear-functions (16) | E | MC | **SVG parabola** | read an intercept/vertex coordinate off a shown graph | ordered-pair reversal | abstract, xy-plane | |
| 8 | probability (23) | E | MC | **HTML two-way table** | simple probability from a two-way table | wrong denominator (row vs grand total) | seed library: seed type × germination result | Total row AND column |
| 9 | inference-statistics (24) | M | MC | — | **point estimate scale-up** OR margin-of-error interpretation | canonical MoE misconception menu | observatory volunteers survey | 4 parallel statements; sample size must fit the stated MoE |
| 10 | linear-functions (12) | E | MC | — | interpretation: "best interpretation of the y-intercept" | slope↔intercept mis-mapping | hardware store rental model | **the ramp dip: easy at position 10** |
| 11 | right-triangles-trigonometry (28) | M | MC | **SVG geometry fig** | Pythagorean computation / "closest to" | leg ↔ hypotenuse | abstract right triangle | scale note present |
| 12 | percentages (20) | M | SPR | — | **percent change over time** (year-over-year) | percent-multiplier semantics | abstract | **terminating decimal** answer |
| 13 | linear-inequalities (15) | M | SPR | — | bounded/threshold reasoning → a specific integer bound | — | rowing club: boat capacity | integer |
| 14 | equivalent-expressions (18) | M | MC | — | **identity with unknown constants** ("true for all x") | coefficient-matching / must-be | abstract | |
| 15 | linear-equations-two-variables (13) | M | MC | **HTML data table** | line through table values → equation or a missing value | slope/intercept swap | abstract (x | y) | bordered table |
| 16 | systems-linear-equations (14) | M | MC | — | **parameter k for no solution** | solution-count hunt | abstract | |
| 17 | nonlinear-functions (16) | H | MC | — | **function-notation nesting** (g defined via f at a shifted input; evaluate or compare) | function-notation nesting | abstract | |
| 18 | lines-angles-triangles (27) | H | MC | — | **similar-triangle sufficiency** ("which additional information is sufficient…") | sufficiency meta-reasoning (similar vs congruent) | abstract, verbal | figure-less |
| 19 | nonlinear-equations (17) | H | SPR | — | **discriminant / parameter for solution count** ("greatest integer k for no real solutions") | solution-count with boundary integer | abstract | integer |
| 20 | nonlinear-functions (16) | H | MC | — | **percent growth per non-unit interval** → rewrite to expose the rate | percent semantics × exponent structure (pick ONE: exponent-structure) | abstract | |
| 21 | circles (29) | H | MC | — | **arc length / sector proportionality with a radius step** | radius ↔ diameter | abstract | figure-less |
| 22 | nonlinear-equations (17) | H | SPR | — | **structured solution / two conditions on a nonlinear relation** → a constant | step-skip | abstract | **fraction** answer, lowest terms. *(Corrected 2026-08-14: this slot was originally written as linear-functions, which left Module 4 at ADV 6 — below the measured per-module floor of 7 — and the form at ALG 16 / ADV 13. Moving it to Advanced Math restores M4 = ALG 7 / ADV 7 and the form to ALG 15 / ADV 14 / PSDA 7 / GEO 8.)* |

Module 4 visuals: parabola (Q7), two-way table (Q8), geometry figure (Q11), data table (Q15) = 4.
Applied slots: Q1, Q3, Q4, Q6, Q8, Q9, Q10, Q13 = 8 → **form applied share 16/44**; writers must
convert two of the thinner applied slots (M3 Q5 or Q12; M4 Q6 or Q13) to abstract to land at
**14/44 ≈ 32%**. Decide during drafting and record it in the selfcheck.
Skills (M4, as corrected): 1var 1 · func 2 (Q4, Q10) · 2var 1 · systems 2 · ineq 1 · NLF 3 ·
NLE 2 (Q19, Q22) · EE 2 · ratios 1 · pct 1 · prob 1 · inference 1 · AV 1 · LAT 1 · RTT 1 · circles 1 = 22.
Domains M4: ALG 7 (Q1, Q4, Q5, Q10, Q13, Q15, Q16) · ADV 7 (Q2, Q7, Q14, Q17, Q19, Q20, Q22) ·
PSDA 4 (Q3, Q8, Q9, Q12) · GEO 4 (Q6, Q11, Q18, Q21).

*(Form skill totals: 1var 3 · func 4 · 2var 3 · systems 3 · ineq 2 · NLF 7 · NLE 4 · EE 3 · ratios 2 ·
pct 1 · 1-var-data 1 · 2-var-data 1 · prob 1 · inference 1 · AV 2 · LAT 2 · RTT 2 · circles 2 = 44.
NLF 7 matches the measured "nonlinear-functions is roughly 1 in 6 items" finding.)*

---

## Form-level checks (auditors enforce)
- Domains 15/14/7/8; per-module 8/7/3/4 and 7/7/4/4; every skill row above exact.
- Difficulty 9E/7M/6H per module; monotone ramp with exactly one dip (both at position 10).
- SPR at 5/6/12/13/19/22, difficulty E/E/M/M/H/H; census 8 integers (≥1 three-digit), 3 fractions
  (M3 Q22 negative), 1 decimal; every legal entry form enumerated.
- Visuals 4 per module, types as listed; bar graph present; zero histograms/box plots; scale note on
  geometry figures only; hard geometry figure-less (M3 Q18, M4 Q18, M4 Q21).
- Exactly one trap per item; form tally must include not-to-scale-doubt ×1, function-notation
  nesting ×1, unit-conversion chain ×1, MoE menu ×1, solution-count ×2, wrong-target ×2,
  slope/intercept swap ×3, reciprocal-reversal ×1, ordered-pair reversal ×2, sign-slip ×1,
  radius/diameter ×1, formula-fragment ×1, exponent-structure ×2, percent semantics ×1.
- **Errata, 2026-08-15 (round 3).** Two trap rows above were corrected to match the shipped
  artefacts: **M3 Q8** now carries *not-to-scale doubt* (it is the item that actually ships a
  figure, and that figure is deliberately misdrawn), and **M3 Q18** — figure-less, so it could
  never have instantiated a drawing trap — was re-pitched to *special-triangle side ratio applied
  to the wrong side*. The re-pitch also removes a round-2 defect the doc could not see: leg↔
  hypotenuse had landed on **both** of the form's right-triangle items, M3 Q18 and M4 Q11.
  It is now carried once, by M4 Q11.
- **Known internal inconsistency in this document, recorded not silently fixed:** the
  **"wrong-target ×2"** line above was never reconcilable with the slot tables, which name
  answer-the-wrong-target on exactly **one** slot (M3 Q22). The form does deliver two —
  M3 Q22 and M4 Q18, the latter acquired when Q18 was recast off similar-triangle sufficiency —
  so the tally is met by the artefacts, but it was met by a slot the tables still describe as a
  sufficiency item. Writers executing a future form should treat the slot tables as governing and
  the form tally as a checksum, and PT7's blueprint must reconcile the two before drafting.
- Key letters 4/4/4/4 (±1) per module; numeric options ascending.
- Applied share 14/44 ≈ 32%; ≤2 named people per module (new names); exactly one Latin binomial (M3 Q7).
- Zero context/number-set collisions with PT4, PT5, or any source PDF item — checked by a dedicated
  originality gate after drafting.
