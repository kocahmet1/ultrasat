# Practice Test 5 — Math Modules 3 & 4: 44-Slot Blueprint (binding)

Style contract: docs/CB_Math_Style_Spec.md (unchanged, binding). This blueprint re-rolls the
form WITHIN the measured ranges so PT5 is a genuinely different form from PT4 — not a
renumbered clone.

## How PT5 deliberately differs from PT4 (all inside measured bounds)
| Dimension | PT4 | PT5 | Measured range |
|---|---|---|---|
| Domain mix (form) | ALG 15 / ADV 14 / PSDA 8 / GEO 7 | **ALG 14 / ADV 14 / PSDA 8 / GEO 8** | ALG 14–16, ADV 13–15, PSDA 7–9, GEO 6.5–9 |
| Difficulty | M3 9E/7M/6H, M4 8E/8M/6H | **M3 8E/8M/6H, M4 9E/7M/6H** | parallel modules, E~42/M~32/H~26 |
| Skill emphasis | inference-statistics 1, two-var-data 2, one-var-data 1 | **inference 0, two-var-data 1, one-var-data 2, circles 2 split** | inference 0–1 per form; one/two-var 1–2 |
| Visual palette | table, line graph, geometry, scatter / geometry, parabola, two-way table, scatter | **dot plot, geometry, table, parabola / exp-decay curve, two-way table, geometry, scatter** | dot plot & bar are rare-but-attested (1 and 2 in 216) |
| SPR census | 9 int / 3 frac / 1 neg-fraction | **9 int (1 negative) / 2 frac / 1 decimal** | ~70% int, ~23% frac, ~7% decimal, 4–9% negative |
| Archetypes | see PT4 blueprint | **different archetype per skill wherever the skill repeats** (listed below) | 2–5 archetypes per skill exist |
| Traps closed | missing statistical-robustness, must-be/could-be | **both present (M3 Q18, M3 Q20)**; length/area-scale capped at 1 (PT4 over-used it 3×) | spec §5 quota |
| Applied share | 39% (over band) | **~34% (15/44)** | 30–35% |

Invariants NOT re-rolled (measured as fixed across all 8 official modules): 22 items,
16 MC + 6 SPR, SPR at **5, 6, 12, 13, 19, 22** with difficulty E/E/M/M/H/H, monotone ramp,
hard SPR closer, ascending numeric options, key letters ≈4/4/4/4, probability in Module 4 only,
≥1 circles item per module, evaluating-statistical-claims absent.

## Context firewall (PT4 already used these — do NOT reuse)
pottery studio · community garden seed packets · recycling drive aluminum/glass · nature-center
visitors · ferry tickets · storage crate · greenhouse seedlings · marsh bird population · freight
elevator crates · horse-farm furlong track · library format survey · ceramics kiln bowls · tree
canopy · square banners · bus-route survey · robotics kits/motors · used bicycles. Name used: Nadia.
PT5 palette (suggested, writers may vary): food co-op bulk bins · gondola lift · aquarium tank ·
print shop · orchard crates · tram fares · textile mill · weather balloon · solar array · museum
admissions · creamery cave · rowing club · parking garage · rainwater cistern · chess club ·
trail-maintenance crew · courier tiers · bakery.

---

## MODULE 3 (moduleNumber 3) — 8E / 8M / 6H · SPR at 5, 6, 12, 13, 19, 22

| # | skill (id) | diff | fmt | visual | archetype (B §2) | trap (spec §5) | context | notes |
|---|---|---|---|---|---|---|---|---|
| 1 | linear-equations-one-variable (11) | E | MC | — | bare solve, **variable on both sides** | verbatim-number echo | abstract | integer answer |
| 2 | ratios-rates-proportions (19) | E | MC | — | **proportion solve** (a:b = c:x) | reciprocal / other-member | orchard: apples per crate | ascending numeric |
| 3 | equivalent-expressions (18) | E | MC | — | **exponent rules** (product/quotient of powers) | wrong-operation on exponents | abstract | ≤15-word stem |
| 4 | nonlinear-functions (16) | E | MC | — | **evaluate an exponential** f(2) | a↔b swap in a(b)ˣ | abstract | Unicode superscripts in options |
| 5 | linear-functions (12) | E | SPR | — | invert: for what x is f(x)=c | — | abstract | integer |
| 6 | area-volume (26) | E | SPR | — | direct volume formula | — | rainwater cistern | integer |
| 7 | one-variable-data (21) | E | MC | **SVG dot plot** | read a frequency display | value ↔ frequency | chess club: games won by each member | rare-but-attested visual; title above plot |
| 8 | lines-angles-triangles (27) | E | MC | **SVG geometry fig** | isosceles/triangle angle arithmetic | measure of the OTHER angle | abstract figure | "Note: Figure not drawn to scale." |
| 9 | linear-functions (12) | M | MC | **HTML table** | **determine the function from a table** | slope/intercept swap | abstract (x | f(x)) | fraction or negative slope |
| 10 | linear-inequalities (15) | M | MC | — | **bounded range / compound inequality** | strict vs inclusive boundary | creamery cave temperature range | compound a ≤ t ≤ b choices |
| 11 | percentages (20) | M | MC | — | **reverse percent** (p% are faulty, f faulty → total) | percent-of wrong anchor | solar array modules | |
| 12 | nonlinear-equations (17) | M | SPR | — | **radical equation** with an extraneous candidate (was: factorable quadratic) | **extraneous/nonreal-solution awareness** | abstract | plain-integer SPR (9); the extraneous candidate 2 is excluded from acceptedAnswers |
| 13 | right-triangles-trigonometry (28) | M | SPR | — | **trig ratio from a described right triangle** | — | abstract | **fraction** answer, lowest terms + decimal forms |
| 14 | nonlinear-functions (16) | M | MC | — | **contextual interpretation** of a model constant | interpretation mis-mapping menu | gondola lift ridership or savings model | 4 parallel sentences permuting roles |
| 15 | nonlinear-functions (16) | M | MC | **SVG parabola** | quadratic structure from a shown graph (vertex/intercept) | ordered-pair reversal | abstract, xy-plane | full grid, O marked |
| 16 | circles (29) | M | MC | — | **arc length proportionality** (central angle : arc) | adjacent-quantity (arc vs angle vs circumference) | abstract | one of the 2 attested M circles items |
| 17 | systems-linear-equations (14) | H | MC | — | **parameter for infinitely many solutions** | solution-count / coefficient matching | abstract | |
| 18 | one-variable-data (21) | H | MC | — | **perturbation of a data set** (change one value → mean vs median) | **statistical-robustness** (PT4 gap) | test-plot yields or lap times | "which must be true" style choices |
| 19 | nonlinear-functions (16) | H | SPR | — | two conditions jointly constrain constants → composite target | answer-the-wrong-target (composite) | abstract | engineered **3-digit integer** |
| 20 | linear-equations-one-variable (11) | H | MC | — | **constant-parameter: "What CANNOT be the value of k?"** | **must-be/could-be quantifier** (PT4 gap) | abstract | negation in CAPS |
| 21 | nonlinear-equations (17) | H | MC | — | **structured solution** ("a solution can be written as (p + √q)/r — find q") | step-skip / sign-slip | abstract | quadratic-formula matching |
| 22 | linear-equations-two-variables (13) | H | SPR | — | **translation composition** (line translated k units → new x-intercept) | sign-slip on translation | abstract, xy-plane | **negative integer** — the form's only negative |

Module 3 visuals: dot plot (Q7), geometry figure (Q8), HTML table (Q9), parabola (Q15) = 4.
Applied slots: Q2, Q6, Q7, Q10, Q11, Q14, Q18 = 7.

---

## MODULE 4 (moduleNumber 4) — 9E / 7M / 6H · SPR at 5, 6, 12, 13, 19, 22

| # | skill (id) | diff | fmt | visual | archetype (B §2) | trap (spec §5) | context | notes |
|---|---|---|---|---|---|---|---|---|
| 1 | linear-functions (12) | E | MC | — | applied model → "Which equation represents this situation?" | slope/intercept swap | parking garage: flat entry + hourly rate | single-slot option variants |
| 2 | equivalent-expressions (18) | E | MC | — | distribute + combine | sign error in distribution | abstract | |
| 3 | ratios-rates-proportions (19) | E | MC | — | **unit conversion with a GIVEN factor** | partial/reversed conversion | weather balloon ascent rate | factor in parentheses |
| 4 | nonlinear-functions (16) | E | MC | **SVG exponential-decay curve** | read a value/intercept off a shown graph | adjacent-quantity (x vs y read) | abstract or thin context | axis titles with units |
| 5 | linear-equations-one-variable (11) | E | SPR | — | 2-step solve | — | abstract | integer |
| 6 | nonlinear-functions (16) | E | SPR | — | evaluate a quadratic f(a) | — | abstract | integer |
| 7 | systems-linear-equations (14) | E | MC | — | solve system (one equation already y = …) | adjacent-quantity (other variable) | abstract | |
| 8 | area-volume (26) | E | MC | — | direct volume of a cube/prism | **formula ladder**: perimeter / face area / surface area offered | shipping cube | the CB signature distractor ladder |
| 9 | probability (23) | E | MC | **HTML two-way table** | conditional probability from a two-way table | wrong denominator (row vs grand total) | museum admissions: ticket type × membership | Total row AND column |
| 10 | linear-equations-two-variables (13) | M | MC | — | applied ax + by = c → solve/interpret | coefficient role reversal | textile mill: two fabric widths, fixed total yards | |
| 11 | right-triangles-trigonometry (28) | M | MC | **SVG geometry fig** | trig ratio read-off | sin ↔ cos ↔ tan confusion | abstract right triangle | scale note present |
| 12 | systems-linear-equations (14) | M | SPR | — | solve, then report a **combination** (x + y or a multiple) | answer-the-wrong-target | abstract | integer; adding the equations is the shortcut |
| 13 | percentages (20) | M | SPR | — | percent change / reverse percent | percent-multiplier semantics | abstract | **terminating decimal** answer (e.g. 12.5) |
| 14 | linear-inequalities (15) | M | MC | — | represent a situation with **two constraints** | at-least ↔ at-most | trail-maintenance crew: hours + budget cap | system-of-inequalities choices |
| 15 | nonlinear-equations (17) | M | MC | — | **literal rearrangement** ("express w in terms of v and x") | reversal / step-skip | abstract | |
| 16 | two-variable-data (22) | M | MC | **SVG scatter** | **model choice** (increasing/decreasing × linear/exponential) | interpretation mis-mapping menu | lichen thallus diameter vs age — **the form's one Latin binomial** (invented) | ~10 dots, no fit line needed |
| 17 | nonlinear-functions (16) | H | MC | — | **exponential structure conversion** (p% per n periods → rewrite) | exponent-structure (t/n) | abstract or thin context | t vs t/n vs nt option family |
| 18 | circles (29) | H | MC | — | **tangent ⊥ radius** (which point lies on the tangent line) | reciprocal vs negative-reciprocal reversal | abstract, xy-plane | figure-less |
| 19 | linear-functions (12) | H | SPR | — | **tiered-fee structure** (first unit + per additional) | step-skip (first unit double-counted) | courier: first pound + per additional pound | integer answer |
| 20 | lines-angles-triangles (27) | H | MC | — | **similar triangles: area ratio ↔ side ratio** | **similarity exponents** k vs k² (capped at 1 for the form) | abstract, verbal (figure-less) | |
| 21 | nonlinear-equations (17) | H | MC | — | **absolute-value / solution-count** ("how many distinct real solutions?") | solution-count reasoning | abstract | "Zero / Exactly one / Exactly two / More than two" set |
| 22 | equivalent-expressions (18) | H | SPR | — | **identity with unknown constants**, "true for all x" → product/sum of constants | wrong-target composite | abstract | **fraction** answer, lowest terms |

Module 4 visuals: exponential curve (Q4), two-way table (Q9), geometry figure (Q11), scatter (Q16) = 4.
Applied slots: Q1, Q3, Q8, Q9, Q10, Q14, Q16, Q19 = 8.

---

## Blueprint latitudes exercised in authoring (recorded, binding going forward)

Two slots were written at one end of a latitude this blueprint already grants, and one binding
line was retired outright. All three are recorded here so the shipped form and the blueprint agree.

| # | Latitude | Slot | How it was exercised | Consequence tracked |
|---|---|---|---|---|
| L1 | "abstract **or thin context**" | **M4 Q4** | Authored **abstract**: "The graph of y = f(x) is shown in the xy-plane. What is the value of f(2)?" The SVG keeps its axis titles; the stem carries no real-world referent. | −1 applied item |
| L2 | "abstract **or thin context**" | **M4 Q17** | Authored **abstract**: the minutes→hours rescaling is stated as the bare relation m = 60t rather than as a context. The `t vs t/n vs nt` option family and the hard label are preserved — the student still inverts m = 60t to t = m/60 and then simplifies 3(m/60) to m/20, so the structural work the *hard* label pays for is in the item, not in the context. | −1 applied item |
| L3 | "multi-root SPR (M3 Q12) listing both roots" | **M3 Q12** | **Retired.** Replaced by a radical equation with a single valid integer solution (9) and an extraneous candidate (2). | SPR census multi-root 1 → **0** |

L1 + L2 are what bring the applied share from 17/44 (38.6%, over the §2c band) to **15/44 = 34.1%**,
inside 30–35%. The cost is booked here: both abstracted slots are Advanced Math, so **AdvMath's own
applied share reads 1/14 ≈ 7% against the §2c ~20% reference.** The aggregate is in band and the two
abstractions are licensed; the per-domain figure is a known, accepted deviation for this form and
should be rebalanced in PT6 by abstracting an Algebra or Geometry slot instead.

---

## Form-level checks (critic enforces)
- Domains: ALG 14 (M3 7 / M4 7), ADV 14 (7/7), PSDA 8 (4/4), GEO 8 (4/4).
- Skills: lin-eq-1var 3 · lin-func 4 · lin-eq-2var 2 · systems 3 · lin-ineq 2 · NLF 7 · NLE 4 ·
  equiv-expr 3 · ratios 2 · percentages 2 · one-var-data 2 · two-var-data 1 · probability 1 (M4) ·
  inference 0 · evaluating-statistical-claims 0 · area-volume 2 · lines-angles 2 · right-tri-trig 2 ·
  circles 2 (1 per module).
- SPR census: 9 integers (exactly 1 negative, ≥1 three-digit engineered), 2 fractions, 1 decimal;
  **0 multi-root items** — retired in the fix round (see "Blueprint latitudes exercised" below).
  M3 Q12 is a plain-integer radical/extraneous-root item (answer 9; the extraneous candidate 2 is
  correctly absent from `acceptedAnswers`), which closes the spec §5 extraneous/nonreal family that
  PT5 otherwise carried at 0. Measured multi-root frequency is ≈0.6 per form, so 0 is authentic.
- Traps: exactly one per item; statistical-robustness ×1, must-be/could-be ×1, wrong-target ×3,
  slope/intercept-role swap ×2, solution-count ×2, sign-slip ×2, similarity/area-scale ×1,
  percent semantics ×2, interpretation menu ×2, exponent-structure ×1, formula ladder ×1.
- Applied share 15/44 ≈ 34%; ≤2 named people per module; exactly one Latin binomial (M4 Q16).
- Zero context/number collisions with PT4 (list above) or with any source PDF item.
