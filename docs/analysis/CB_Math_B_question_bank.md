# B. College Board SAT Math Question Bank — Authoring Playbook
Reverse-engineered from 4 official CB Question Bank PDF exports (400 items, 100/file, one domain per file). All numbers below are measured from the exports. No item text or rationale text is reproduced; skeletons are generic formulas.

Source note: text extraction strips typeset math (equations appear as gaps), so stem word counts measure PROSE ONLY; typography facts come from rendered page images.

---

## 1. INVENTORY

**File → domain mapping** (each export = one domain, exactly 100 items):
| File | Domain | Items |
|---|---|---|
| questionbank-export-2026-8-14.pdf | Algebra | 100 |
| ...(1).pdf | Advanced Math | 100 |
| ...(2).pdf | Problem-Solving and Data Analysis | 100 |
| ...(3).pdf | Geometry and Trigonometry | 100 |

All 19 official CB math skills are present. Difficulty totals: **Easy 143 / Medium 121 / Hard 136**. Format totals: **MC 304 / SPR 96**.

**Skill × Difficulty × Format crosstab** (E/M/H = counts; MC/SPR split):

| Domain | Skill | E | M | H | Tot | MC | SPR |
|---|---|---|---|---|---|---|---|
| Algebra | Linear equations in one variable | 13 | 0 | 4 | 17 | 12 | 5 |
| Algebra | Linear functions | 18 | 7 | 5 | 30 | 23 | 7 |
| Algebra | Linear equations in two variables | 8 | 5 | 8 | 21 | 13 | 8 |
| Algebra | Systems of two linear equations | 5 | 5 | 11 | 21 | 14 | 7 |
| Algebra | Linear inequalities in one or two variables | 7 | 2 | 2 | 11 | 11 | 0 |
| Adv Math | Equivalent expressions | 8 | 9 | 7 | 24 | 19 | 5 |
| Adv Math | Nonlinear equations in one var & systems | 7 | 8 | 11 | 26 | 18 | 8 |
| Adv Math | Nonlinear functions | 11 | 17 | 22 | 50 | 42 | 8 |
| PSDA | Ratios, rates, proportional relationships, units | 14 | 7 | 0 | 21 | 10 | 11 |
| PSDA | Percentages | 6 | 3 | 8 | 17 | 13 | 4 |
| PSDA | One-variable data (center/spread) | 9 | 6 | 6 | 21 | 19 | 2 |
| PSDA | Two-variable data: models & scatterplots | 7 | 6 | 3 | 16 | 14 | 2 |
| PSDA | Probability and conditional probability | 8 | 4 | 3 | 15 | 13 | 2 |
| PSDA | Inference from sample stats & margin of error | 3 | 3 | 1 | 7 | 6 | 1 |
| PSDA | Evaluating statistical claims (obs./experiments) | 0 | 2 | 1 | 3 | 3 | 0 |
| GeoTrig | Area and volume | 8 | 17 | 10 | 35 | 25 | 10 |
| GeoTrig | Lines, angles, and triangles | 8 | 10 | 10 | 28 | 21 | 7 |
| GeoTrig | Right triangles and trigonometry | 3 | 8 | 10 | 21 | 16 | 5 |
| GeoTrig | Circles | 0 | 2 | 14 | 16 | 12 | 4 |

**MC/SPR by difficulty:** Easy 125 MC / 18 SPR (13% SPR) · Medium 99/22 (18%) · Hard 80/56 (**41% SPR**). SPR is CB's preferred vehicle for Hard items (no answer choices to back-solve from).

**MC answer-letter distribution:** A 76 (25.0%) · B 84 (27.6%) · C 68 (22.4%) · D 76 (25.0%). Effectively uniform — author to a flat key, no "C bias". (By difficulty the wobble is noise-level; Hard skews slightly D at 30/80.)

**Stem length (prose words, math stripped):** Easy median 22 (q25 13, q75 44) · Medium 25 (17–41) · Hard 30 (21–49); max ~110. Length tracks context, not difficulty: shortest-stem skills are Equivalent expressions (median 10) and Nonlinear equations (19); longest are Inference/margin of error (64), Statistical claims (49), Probability (55).

133/400 items reference a shown figure, graph, table, or scatterplot.

---

## 2. PER-SKILL AUTHORING TEMPLATES

Legend: freq = share of that skill's items; E/M/H = where the archetype typically sits.

### ALGEBRA

#### 2.1 Linear equations in one variable (17 items)
Archetypes:
- **A. Bare solve** (~60%, E): "If [1–2 step linear equation], what is the value of x?" or "What value of x is the solution to the given equation?" Twist: ask for an expression's value (e.g., value of a multiple of x) rather than x itself.
- **B. Applied single-unknown model** (~20%, E→H): total = fixed + rate·quantity story (payment plan, depletion at constant rate); ask either "Which equation represents this situation?" (E) or solve for the time/count value (H when multi-quantity, e.g., three products with multiplicative relationships summing to a total).
- **C. Constant-parameter equation** (~20%, H, often SPR): "In the given equation, a and b are constants…" the equation has infinitely many / exactly one / no solution(s); find the constant, or "what CANNOT be the value of" it. Solved by coefficient matching.
Difficulty levers: E = integer coefficients, 1–2 inverse operations. H = fractional coefficient built from a constant (e.g., k/13), solution-count reasoning instead of solving, reversal (CANNOT), or 3-quantity verbal chains. Context: ~75% abstract; applied only in archetype B.

#### 2.2 Linear functions (30 items)
Archetypes:
- **A. Evaluate/invert a defined function** (~30%, E): "The function f is defined by f(x) = mx + b. What is the value of f(a)?" / "For what value of x does f(x) = c?"
- **B. Applied linear model, forward use** (~30%, E–M): rate + starting value story (weekly deposits, per-mile depletion, per-pound calories); evaluate at a point or pick "Which equation represents this situation?" Variables always defined in a trailing "where…" clause.
- **C. Determine the function from two points / a table / a graph** (~25%, M–H): find slope, an intercept, an unknown constant, or f at a new input; includes "which table gives three values…" and translated-line variants.
- **D. Interpretation** (~7%, E–M): "Which of the following is the best interpretation of [slope or y-intercept] in this context?"
- **E. Tiered-fee structures** (~7%, H): first-unit price + per-additional-unit fee; write the function with a domain restriction ("where x is a positive integer and …").
Difficulty levers: E = direct substitution, clean integers, one step. M = one unknown constant k to recover first. H = two conditions to intersect (two (price, demand)-type points), tiered fees, ugly slope (fraction from a table), or SPR with 3-digit target. Context: ~50% applied at E, drops at H (abstraction replaces story).

#### 2.3 Linear equations in two variables (21 items)
Archetypes:
- **A. Perpendicular/parallel slope** (~30%, E–H): "Line k is defined by [slope-intercept equation]. Line j is perpendicular (parallel) to line k. What is the slope of line j?" — appears 6× as a near-clone with different numbers; difficulty tuned ONLY by the ugliness of m (integer → fraction → fraction needing sign flip and reciprocal of a fraction). This is the clearest evidence CB stamps items from parameterized skeletons.
- **B. Applied combination equation ax + by = c** (~35%, E–H): two products/activities with unit values and a total (container sizes, course hours, coin collection, mixtures); given one variable's value, solve for the other (often SPR), or interpret a point/intercept on its graph.
- **C. Line through two points / table → equation or intercept** (~25%, M–H): includes "translate the line down k units, find the new x-intercept" and "y-intercept is (0, b), find a constant".
- **D. Which table matches the equation** (~10%, E).
Difficulty levers: fraction slopes, negative direction, translation composition, and interpretation-of-graph-region stems.

#### 2.4 Systems of two linear equations (21 items)
Archetypes:
- **A. Solve the system** (~35%, E→H): "The solution to the given system is (x, y). What is the value of x?" — E when one equation is already "y = …" or elimination is immediate; H when asked for a combination (x + y, xy) that rewards adding the equations, or SPR.
- **B. Parameter for no solution / infinitely many** (~20%, H, SPR-heavy): "In the given system, k is a constant. The system has no solution. What is the value of k?" — parallel-slope matching.
- **C. Two-totals word problem** (~25%, E–H): two item types, two totals (prices, capacities, counts); ask "which system represents" (E) or solve for one quantity (M–H, e.g., mixed 2-person/4-person capacity, month-over-month sales split).
- **D. Graphical** (~20%, E–H): read intersection from graph (E), match graphed lines to a system (H), "how many points of intersection" / "which point lies on both for every value of a constant".
Difficulty levers: E = solution read-off; H = constants as unknowns, coefficient ratios, systems given in mismatched forms needing rearrangement first.

#### 2.5 Linear inequalities in one or two variables (11 items; all MC in this export)
Archetypes:
- **A. Represent the situation** (~55%, E): budget/threshold story ("has $A; each X costs c, each Y costs d") → "Which inequality represents this relationship…?"; includes at least/at most phrasing traps.
- **B. Bounded range** (~20%, E): min recorded a, max recorded b → "Which inequality is true for all values of r?" (compound a ≤ r ≤ b).
- **C. Graph/shaded region** (~15%, E–H): shaded region ↔ inequality; H version hides a constant in the boundary line and asks for its value.
- **D. Integer optimization / solution check** (~10%, M–H): max count of heavier packages given weight cap and min count; "for which table are all pairs solutions".
Difficulty levers: number of constraints (one vs two), strict/inclusive boundary reasoning, and whether the inequality direction must be reasoned (which scenario "is faster") vs transcribed.

### ADVANCED MATH

#### 2.6 Equivalent expressions (24 items)
Archetypes:
- **A. Simplify/combine** (~50%, E–M): "Which expression is equivalent to [sum/difference/product of polynomials]?" — one distribute + combine at E; two-variable terms and rational coefficients at M.
- **B. Factor** (~15%, M–H): "Which of the following is a factor of the polynomial…?"; difference of squares; occasionally Roman-numeral I/II factor lists (legacy style).
- **C. Identity with unknown constants** (~25%, H, SPR-heavy): "The expression [quadratic/product form] is equivalent to [other form], where a and b are constants. What is the value of a (or ab, a+b)?" — matching coefficients "for all x"; the "true for all x" phrase marks this archetype.
- **D. Exponent/radical rules** (~10%, E–H): product of powers with same base, rational exponents; H version has a constant exponent k to solve for (SPR fraction answer).
Difficulty levers: E = one rule application, small integers. H = multiple constants at once, products of constants requested (forces solving for all), fractional/negative coefficients, rational exponents. Context: essentially 100% abstract at every difficulty — the only fully context-free skill.

#### 2.7 Nonlinear equations in one variable & systems (26 items)
Archetypes:
- **A. Solve one equation** (~30%, E–H): quadratic/radical/rational; "What is the positive solution…?" (factoring or quadratic formula), "What is a solution…?" (SPR accepts either root), "How many distinct real solutions?" (discriminant or absolute-value reasoning).
- **B. Literal rearrangement** (~12%, E–M): "The given equation relates the positive numbers v, w, x. Which equation correctly expresses w in terms of v and x?"
- **C. Linear–nonlinear system** (~25%, E–H): intersection point(s) of a line and parabola/circle-free curve; "Which ordered pair is a solution?"; given intersection at (a, b), find a coordinate.
- **D. Parameter for solution count** (~20%, H, SPR-heavy): "…k is a constant. The equation has no real solutions / exactly one real solution. What is the largest (minimum) possible value of k?"; "a line with equation y = c intersects the parabola at exactly one point — value of c" (vertex or discriminant = 0).
- **E. Structured-solution constant** (~12%, H): "One solution can be written as [radical expression with constant k]. What is the value of k?" — quadratic formula, then match the radicand.
Difficulty levers: E = solution visible by inspection/substitution; H = discriminant inequalities over integers ("largest integer k"), extraneous-root awareness, completing the square, systems needing substitution then quadratic formula.

#### 2.8 Nonlinear functions (50 items — the biggest skill in the bank)
Archetypes:
- **A. Evaluate** (~10%, E): f defined by a quadratic/cubic/exponential; find f(a).
- **B. Quadratic structure** (~25%, M–H): vertex/min/max ("For what value of x does f reach its minimum?"), x-/y-intercepts of the graph, intercept coordinates as constants ("graph has x-intercept (a, 0)… what is a?"), vertex-form vs standard-form reasoning, "which of the following must be true" about parameters/vertex when signs of constants are constrained.
- **C. Exponential model** (~25%, M–H): value = a·(b)^(t or t/n); interpret a (initial) and b (growth/decay factor); doubling time; "increases by p% every n months/years"; pick the equation whose base/coefficient literally displays a requested quantity.
- **D. Contextual interpretation** (~12%, E–M): "Which of the following is the best interpretation of [f(0) = c / the number k / the marked point] in this context?"
- **E. From table/graph** (~16%, E–H): which equation defines the exponential fitting a table; which graph matches a table; translated graph ("shifted up k units") and its new equation/points; read intercept coordinates off a shown graph (SPR: "The x-intercept of the graph shown is (a, 0). What is a?").
- **F. Geometric-word quadratics** (~6%, E–H): rectangle with length k× width and known area; product of two integers with a linear relation (SPR).
- **G. Sequences** (~4%, H): first term given, each term r× the preceding; "which equation gives the nth term?"
Difficulty levers: E = single evaluation or graph read. M = interpretation and model-matching. H = two constants constrained jointly (products of constants given, find another value), function families f, g, h chained (g(x) = f(x) + k), rewriting to expose a quantity "as a coefficient or base", percent-growth per non-unit interval (the t/n exponent), min/max of composed quadratics. Applied context ~35% at M but only ~20% at E and H (hard items go abstract).

### PROBLEM-SOLVING AND DATA ANALYSIS

#### 2.9 Ratios, rates, proportional relationships, and units (21 items; the most SPR-heavy skill, 11/21)
Archetypes:
- **A. Unit conversion / unit rate** (~35%, E–M, SPR): per-minute → per-hour; quarts → fluid ounces; fathoms → feet (conversion factor supplied for exotic units); "At what rate, in X per Y…?" with the changed unit underlined.
- **B. Proportion solve** (~25%, E–M, SPR): "The ratio a to b is equivalent to the ratio c to x; what is x?"; table with constant y:x ratio, find k.
- **C. Density / total = rate × amount** (~30%, E): population density, items per hour, price per pound — one multiplication or division.
- **D. Two-step applied rate** (~10%, M): total distance over total days → per-day rate; mi/sec → mi/hr (large numbers).
Difficulty levers: number of conversion hops (1 vs 2), awkward magnitudes (4-digit SPR answers), rate direction (per-mile vs miles-per). No Hard items in this export — CB caps this skill around Medium.

#### 2.10 Percentages (17 items)
Archetypes:
- **A. Direct percent** (~35%, E): "What percentage of a is b?", "b is p% of what number?", percent of a count; tax/discount on a price.
- **B. Percent change over time** (~20%, M–H): year-over-year table; compute % increase, or extrapolate "if it increases by the same percent…" (compounding trap).
- **C. Chained percent-of-percent** (~25%, H): "x is p% of y, y is q% of z — what percent of z is x?" — fully abstract with letters; also expression-form "result of decreasing a quantity by what percent?" given a multiplier expression.
- **D. Rate applied to subgroup** (~20%, E–M): p% of units returned/faulty per period, project over n periods; find total from part ("p% of the items are faulty; there are f faulty items; how many total?").
Difficulty levers: E = single multiplication with clean %, H = composition of percents, reverse percent, percent as algebraic multiplier (1 − p/100), extrapolation requiring compounding not addition.

#### 2.11 One-variable data: distributions, center, spread (21 items)
Archetypes:
- **A. Compute a statistic** (~40%, E–M): median/mean/mode/range from a short list, frequency table, or bar graph; lists deliberately unsorted for median items.
- **B. Read a frequency display** (~25%, E): bar graph / frequency table → "How many…?", "Which frequency table represents the data?", max data value.
- **C. Comparative reasoning without computation** (~25%, M–H): two samples with equal means but different SDs → "which statement must be true / best compares"; box plots → medians comparable, means not determinable; "which list has the smallest standard deviation" (judged by spread, not computed).
- **D. Perturbation of a data set** (~10%, H): change one value, or add/subtract from values above/below the median → effect on mean vs median; mean=median constraint → which x is NOT possible.
Difficulty levers: E = read-off; M = compute with a twist (unsorted list, weighted table); H = reason about what CANNOT be determined, error-correction effects, integer-constrained missing values (SPR).

#### 2.12 Two-variable data: models and scatterplots (16 items)
Archetypes:
- **A. Line of best fit numerics** (~45%, E–M): slope "closest to", predicted y at given x, difference between an observed point and the prediction, y-intercept interpretation.
- **B. Model choice** (~25%, E): "Which is the best model / most appropriate model for the data?" — increasing vs decreasing × linear vs nonlinear grid of 4 choices; "best describes the function" (increasing exponential, etc.).
- **C. Exponential scatter model** (~15%, H): y = a(b)^x fit; "closest to the value of b" (reasoning: decreasing ⇒ 0 < b < 1 — eliminates without computing).
- **D. Rate of change from a graph** (~15%, M, SPR): average rate of change between two shown points.
Difficulty levers: E = qualitative match; H = parameter reasoning about model families, transformed data sets (all y-coordinates scaled by k → new best-fit equation), axis-scale traps.

#### 2.13 Probability and conditional probability (15 items)
Archetypes:
- **A. Simple probability from a table/collection** (~45%, E): marbles/dice/rocks/singers; P = category count ÷ total. Frequency table supplied.
- **B. Conditional from a two-way table** (~40%, E–H): "given that / selected at random from [row]" — numerator and denominator both from inside the table, never the grand total. Contexts: kittens' coat×eye color, cars hybrid×price, parks, gas-station purchases.
- **C. Complement / neither-nor** (~10%, M): P(neither blue nor yellow) = sum of remaining categories ÷ total.
- **D. Verbal-to-table construction** (~10%, H, SPR): counts described per row-type ("each row of X trees has a trees ≥ h feet and b shorter"), build totals, then a conditional probability; SPR answer as fraction/decimal.
Difficulty levers: E = one cell ÷ grand total; M–H = correct denominator selection under conditioning, complement phrasing, or having to assemble the table yourself.

#### 2.14 Inference from sample statistics and margin of error (7 items)
Archetypes:
- **A. Point estimate scale-up** (~30%, E): sample proportion × population size = best estimate of total.
- **B. Margin-of-error interpretation** (~70%, E–H): estimate p with MoE m → "Which is the most appropriate conclusion / correct statement?" Correct answer is always the "plausible/likely interval" phrasing; distractors are the four canonical misreadings (see §3).
Difficulty levers: E = compute the interval; H = all-verbal choice discrimination among subtle claims.

#### 2.15 Evaluating statistical claims: observational studies and experiments (3 items)
Archetype (all 3): **Generalizability of a random sample** — sample drawn at random from population P → results extend to P and only P (not to a broader population, not to individuals with certainty); or "sampling a different group could yield different results." M–H, all MC, all-verbal choices.

### GEOMETRY AND TRIGONOMETRY

#### 2.16 Area and volume (35 items)
Archetypes:
- **A. Direct formula application** (~40%, E–M): area of rectangle/square/circle, volume of cube/prism/cylinder/sphere from given dimensions; answers sometimes left in terms of π.
- **B. Inverse formula** (~20%, M–H): given volume/area + all-but-one dimension → find radius/height/edge (requires a root or division); given circumference → volume.
- **C. Scale-factor family** (~20%, M–H, SPR-friendly): side lengths ×k → area ×k²; similar prisms with surface-area ratio → volume ratio (k² → k³ chaining); perimeter scaling; "square A's sides are k times square B's, its area is n times — find n (or k)".
- **D. Composite/coordinate** (~10%, H): sphere inscribed in cube, rectangle from 4 plotted points, triangle+square combined area.
- **E. Circle metrics from geometry** (~10%, M–H): circle defined by three plotted points → circumference kπ, find k.
Difficulty levers: E = one formula, given dimensions. M = π handling, unit phrases everywhere. H = dimension chaining (circumference→radius→volume), similarity exponents (k vs k² vs k³ — the entire distractor set), inscribed-solid spatial step, nearest-integer rounding.

#### 2.17 Lines, angles, and triangles (28 items)
Archetypes:
- **A. Parallel lines + transversal** (~25%, E–M): find x from vertical/corresponding/alternate angles and linear pairs; "line m is parallel to line n" with figure.
- **B. Triangle angle arithmetic** (~30%, E–H): angle sum, isosceles base angles, exterior-angle theorem; H versions chain 3–5 angle relations through a multi-triangle figure (SPR, answers like 3-digit angle sums of two variables).
- **C. Similar triangles — compute** (~25%, M): proportional sides → missing length; applied version with two objects and their shadows; figures with segment-labeled variables.
- **D. Sufficiency of criteria** (~15%, H): "Which additional piece of information is sufficient to prove/determine similar (congruent)?" — tests AA/SAS-similarity vs congruence distinction, and the "similar but not necessarily congruent" gap.
- **E. Scale-factor percent** (~5%, M): each side ×k → each side is what % greater.
Difficulty levers: E = one theorem, one unknown; H = theorem chaining with no numeric shortcut, sufficiency meta-reasoning, altitude-in-right-triangle configurations.

#### 2.18 Right triangles and trigonometry (21 items)
Archetypes:
- **A. Trig ratio read-off** (~35%, M): right triangle with labeled sides (figure or verbal) → value of sin/cos/tan of a named angle; similar-triangle variant: corresponding angles have equal ratios.
- **B. Cofunction identity** (~10%, M): angles sum to 90° → sin a = cos b; given one value, report the other.
- **C. Pythagorean computation** (~25%, E–H): hypotenuse from legs (E, "closest to" for non-perfect squares); rectangle diagonal (SPR); isosceles-right perimeter → hypotenuse (H, radical arithmetic).
- **D. Special triangles** (~20%, H): 30-60-90 and equilateral height (√3 relationships); trapezoid built from 3 congruent equilateral triangles (perimeter → area, composite).
- **E. Area/expression hybrids** (~10%, H, SPR): area expressible as k√3 or trig-defined length chains → find k.
Difficulty levers: E = plug into a² + b² = c²; M = which-ratio selection; H = radicals surviving into the answer, perimeter/area conversions with √3, tangent given as a ratio to scale segments, multi-triangle composites.

#### 2.19 Circles (16 items — the Hard-skewed skill: 0 E / 2 M / 14 H)
Archetypes:
- **A. Circle equation ↔ geometry** (~50%, H): (x−h)² + (y−k)² = r²: extract center/radius/diameter; complete the square first when given expanded form (SPR: radius of x²+y²+ax+by=c); equation from center+radius; diameter endpoints → equation constant; concentric circle with doubled radius → new constant.
- **B. Arc length proportionality** (~15%, H): central angle / 360 = arc / circumference; given one arc and its angle, find another.
- **C. Tangent ⊥ radius** (~10%, H): tangent line at point P → which other point lies on the tangent (slope via negative reciprocal of radius slope).
- **D. Point-on-circle constraints** (~20%, M–H): point (a, k) on a shown/given circle → value(s) of k; "which is NOT a possible value of x" via radius bounds; unit-circle angle measure.
Difficulty levers: this skill IS the hard bin — completing the square, ± root selection justified by figure position ("k must be positive since the point lies above the x-axis"), radius-vs-r² confusion pressure, multi-step center/radius/tangent chains.

---

## 3. DISTRACTOR FORMULAS (the recipe book)

Data: 821 wrong-choice dismissal clauses parsed. Connectors: "…is incorrect and may result from …" (401), bare "…is incorrect." followed by an explanatory sentence (390), "…is incorrect because …" (23), "…and may be the result of …" (7). 30 items dismiss all three wrong choices in one grouped sentence ("Choices A, C, and D are incorrect and may result from calculation errors."); 10 dismiss a pair jointly.

**Specificity split:** ~212 clauses (26%) use the generic fallback "may result from conceptual or calculation errors" (variants: "conceptual errors", "calculation errors", "computational errors"). 85/304 MC items (28%) dismiss ALL wrong choices generically — most common for Easy items and figure-reading items where no mechanism exists (Easy 35/125, Medium 17/99, Hard 26/80). The other 72% of items give at least one mechanistic dismissal. **Authoring rule: build 2–3 distractors from named error mechanisms; the generic line is the documented escape hatch, used most when choices are graphs/tables.**

### 3.1 Universal taxonomy (ranked by observed frequency across skills)

1. **Adjacent-quantity substitution** (~45% of specific dismissals) — the wrong choice IS a correctly computed *different* quantity from the same problem. Dismissal template: "This is the [other quantity], not the [asked quantity]." Sub-recipes:
   - value of x when f(x)/y asked, and vice versa ("This is the value of x, not f(x)")
   - the other variable of a system/pair; the other segment/side/angle; the other line's slope
   - x-intercept ↔ y-intercept; slope ↔ y-coordinate of y-intercept
   - perimeter ↔ area ↔ face area ↔ surface area ↔ volume (the cube/prism ladder — CB's favorite: for "volume of a cube" the three distractors were literally perimeter, face area, surface area)
   - mean ↔ median ↔ mode ↔ range; count ↔ percentage; sample count ↔ population estimate; part ↔ total
   - radius ↔ diameter ↔ r² ↔ circumference ↔ area; leg ↔ hypotenuse; sin ↔ cos ↔ tan ↔ reciprocal ratio
   - complement ↔ supplement of an angle; P(A|B) ↔ P(B|A) ↔ P(A|not-B) (conditional-probability items build all three distractors this way)
   - intermediate result of the correct computation (the value one step before finishing)
2. **Reversal / swap** (~15%): swapped totals between two people/equations; swapped a and b in a(b)^x; reversed ratio (b:a for a:b); reciprocal instead of negative reciprocal, and plain negative instead of negative reciprocal (perpendicular-slope items generate exactly these two + the raw slope); at-least ↔ at-most; increase ↔ decrease; translated down/left/right instead of up; frequency table columns interchanged; growth factor applied to wrong first term (sequences).
3. **Wrong operation** (~10%): multiplied instead of added exponents; divided instead of subtracted (population change); multiplied radius by k instead of squaring; divided by 2 instead of taking the square root; added instead of multiplied a percent factor; subtracted 4 from 40 instead of multiplying by 4.
4. **Step-skip / partial answer** (~8%): evaluated only the numerator; stopped after solving the inner equation; only one of two required conversions applied; forgot to multiply back by the base amount ($20 × tax rate); one root reported when the other is required; solved for the variable but not the asked expression.
5. **Sign error** (~6%): sign of a constant in factoring; dropped ± when square-rooting; k vs −k in vertex/translation forms. Dismissal: "may result from a sign error when…"
6. **Scale/unit slip** (~6%): minutes vs hours unconverted; percent not converted to decimal ("the percentages were not converted to decimals"); divided by 10 instead of 100; read 10-year axis increments as 1 year; used k where 2k (diameter/radius) belongs — "used the diameter, not the radius, in the formula".
7. **Similarity-exponent error** (GeoTrig signature, ~4%): used the side-length scale factor where the area factor belongs (k vs k²), or area factor for volume (k² vs k³). Dismissal: "may result from using the area scale factor instead of the side length scale factor."
8. **Plausible-misconception statements** (verbal-choice items): each wrong statement is a canonical misconception, dismissed by mini-refutation:
   - Margin of error: (i) claims about measurement accuracy, (ii) "not possible" outside the interval, (iii) exact-value claim, (iv) "all values in the interval equally likely" — these four ARE the distractor set.
   - Statistical claims: overgeneralizing beyond the sampled population; certainty about individuals.
   - Data comparisons: "means equal ⇒ medians equal", "SD determines the maximum", box plots determine means.
   - Geometry sufficiency: information that proves similarity offered where congruence is asked (and vice versa).
9. **Substitute-and-fail verification** (for which-value/which-pair/which-table MC): each wrong choice is dismissed by plugging it in and showing a false statement — "Substituting a for x and b for y in the second equation yields [false equation], which isn't a true statement." Also used in reverse for "which equation is equivalent": "This equation is equivalent to [other rearrangement], not the given one."
10. **Wrong-form display** (equation-choice items): the wrong equation encodes a systematically perturbed scenario, narrated as a full alternate world: "This equation represents a situation where [rate] is p, not q, and [start] is m, not n." All three distractors get parallel sentences of this exact shape.

### 3.2 Per-skill standard recipes (the 3 distractors to generate)

- **Linear solve (one var):** other variable's value; value of x when an expression in x is asked (and each other choice = correct answer to a neighboring rearrangement); solutions of the equation with one distribution error.
- **Perpendicular slope:** reciprocal (no sign flip), negative (no reciprocal), original slope. (Observed verbatim as the standing trio.)
- **Systems word problems:** swap the two totals; swap the two per-item coefficients; both swaps at once. (Observed as the exact A/B/C/D architecture.)
- **k-for-no-solution:** k giving infinitely many instead; ratio inverted; sign flipped.
- **Function evaluation f(a):** f evaluated at the other anchor values in the stem — "This is the value of f(b), not f(a)" ×3.
- **Equivalent expressions:** one sign error in distribution; add instead of multiply exponents; distribute to only the first term; "equivalent to [the given expression's cousin], not the given expression".
- **Quadratic vertex/intercepts:** x-coordinate ↔ y-coordinate of vertex; x-intercept values offered for a vertex question; y-intercept of g when f asked; a and b of the form swapped.
- **Exponential models:** initial value a offered when doubling time asked; exponent base offered as time; percent per n-units misread as per-unit (×n and ÷n variants flank the key); decay factor for growth.
- **Percent:** p% of the wrong anchor (of b instead of a); a+p vs a(1+p/100); averaged before percenting; interpreted p% as $p.
- **Ratios/rates:** rate in the unconverted unit; ×2 and ×3 of the unit rate (partial conversions); reciprocal rate ("days per mile" when "miles per day" asked); value of the other ratio member.
- **Central tendency:** the mean, the mode, and the range offered when the median is asked (and every permutation); midpoint of unsorted middle pair for median.
- **Probability:** correct numerator over wrong denominator (row total vs grand total vs complement count); the complement probability; the transposed conditional.
- **Margin of error:** the four canonical misreadings (accuracy / impossibility / exact value / equal likelihood).
- **Area/volume ladder:** perimeter, face area, surface area vs volume; area of base vs height; circumference vs area; π-coefficient slips (2r vs r²).
- **Similarity scaling:** k, k², k³ all present as choices; reciprocal scale factor.
- **Triangles:** measure of the OTHER angle; complement/supplement; the value of the variable when the angle measure is asked (x vs the angle containing x°).
- **Trig:** sin/cos/tan of the same angle; the ratio of the other angle; reciprocal of the ratio; length of the adjacent object ("length of the leg opposite, not the value of tan").
- **Circles:** r² offered for r; radius for diameter; x-coordinate of an x-intercept for a center coordinate; equation with radius r (unsquared) on the right side.
- **Best-fit/scatter:** slope sign flipped; y-intercept used as slope; prediction at the wrong axis reading; "equation for the other data set".

**Numeric-choice ordering:** numeric MC choices are always listed in ascending order (A smallest → D largest); the key's position is whatever ascending order dictates — never rigged.

---

## 4. RATIONALE STYLE GUIDE

**Openers (measured):** MC: "Choice X is correct." (306; letter matches key). SPR: "The correct answer is [value]." (93). No other openers exist.

**Voice/tense:** third person, present tense, zero "we/you/let's". Facts from the stem are re-imported with "It's given that …" (114×, curly apostrophe; legacy items spell "It is given that"). Consequences: "It follows that …" (133×). Every algebra step is narrated with **"yields"** (543×): "[Action]-ing [object] yields [result], or [simplified result]." Chains use ", or" for successive rewrites and "which is equivalent to" (64×) for form changes. Justifications lead with "Since …". Final sentence is a "Therefore, …" (397×) restating the answer in the exact noun phrase of the question ("Therefore, the value of s is 403." pattern).

**MC skeleton:**
1. `Choice [K] is correct.`
2. `It's given that [restated premise(s)].` (1–2 sentences; cites definitions/theorems as needed: "The equation of a circle in the xy-plane with its center at (h, k) can be expressed as …")
3. Derivation loop (2–8 sentences): `[Substituting a for x / Adding c to both sides / Applying the distributive property] … yields [expr], or [expr].` Every operation named; both sides tracked; no skipped arithmetic.
4. `Therefore, [answer restated in question's own words].`
5. Blank line, then per-choice dismissals in letter order, each its own paragraph:
   - Mechanistic: `Choice [L] is incorrect and may result from [named error].`
   - Identification: `Choice [L] is incorrect. This is the [adjacent quantity], not the [asked quantity].`
   - Refutation (verbal/statement choices): `Choice [L] is incorrect because [one-sentence counterfact].`
   - Verification-fail: `Choice [L] is incorrect. Substituting [values] in [equation] yields [false statement], which isn't a true statement.`
   - Fallback: `Choice [L] is incorrect and may result from conceptual or calculation errors.`
   - Grouped when all share a mechanism: `Choices A, C, and D are incorrect and may result from calculation errors.`
6. Interpretation items append a mini-alternate-world to each dismissal: `This equation represents a situation where [parameter] is [wrong value], not [right value].`

**SPR skeleton:**
1. `The correct answer is [value].`
2. `It's given that …` + same derivation loop.
3. `Therefore, … is [value].`
4. If non-integer: `Note that [fraction] and [decimal(s)] are examples of ways to enter a correct answer.`
(No dismissals — nothing to dismiss.)

**Length norms (words, prose):** MC — Easy median 110, Medium 135, Hard 169 (max ~350). SPR — Easy median 37, Medium 100, Hard 131. Alternate methods are rare (10/400): introduced as "Alternate approach:" or "Alternatively, …".

**Micro-rules:** answer value never appears before the first sentence ends; numbers are recomputed inline rather than referenced ("24,000 − 3(930) = 21,210 … not 12,840" pattern in dismissals); dismissals for wrong numeric claims always name the right value ("…is p, not q"); rationale cites the figure ("It's shown that …", "The graph shown passes through …").

---

## 5. SPR CONVENTIONS

96 SPR items. Answer-format census:
- **Plain integers: 81/96** (incl. 4 negative). Integers run large by design: 22 answers > 100 (403, 609, 1728, 2520, 27556 …) — 3–5 digit targets that resist guessing. Entered without commas.
- **Multi-form answers: 15** — listed on the `Correct Answer:` line as all accepted entries, e.g. fraction + truncated decimal + rounded decimal (".1764, .1765, 3/17" style). Truncation AND rounding variants of a repeating decimal are both accepted; 4 significant characters is the accepted decimal length (leading "0." variants also listed: "0.176").
- **Either-sign answers: 1** ("30, -30" — stem asked for "a solution").
- Fractions are given in lowest terms; improper fractions fine (65/4, 43/5); no mixed numbers ever.
- Companion note sentence closes the rationale whenever the answer is non-integer: "Note that [forms] are examples of ways to enter a correct answer." (18 occurrences — present on effectively every fraction/decimal answer, absent for integers).
- The QB export shows no student-facing gridding instructions (those live in the practice-test PDFs, not the bank export).
- Authoring correlation: SPR concentrates in Hard (56/96) and in constant-parameter archetypes ("find k", coefficient-matching, scale factors) and unit-rate conversions.

---

## 6. NUMBER & NOTATION AESTHETICS

**From rendered pages (typography):**
- Two typesetting generations coexist: newer items use LaTeX-style Computer Modern serif italic math (variables x, s, r italic; stacked fractions inline in running text); legacy items (older bank IDs) use sans-serif math, occasionally color-tinted in the question display, with "=" spaced plainly. Emulate the Computer Modern look for new items.
- Displayed equations are centered above the prose stem; multi-equation systems stack left-aligned, one per line — this also applies inside MC choices (a system choice = two stacked equations).
- Exponents are true superscripts (x², 41³); radicals use a vinculum (√60 with bar); π symbol used (answers "in terms of π" or with π folded into a coefficient); ∠ABC notation with the angle glyph; degree symbol tight to the number (67°); segment/triangle names as italic letter pairs/triples (AB, ABC); ordered pairs (8, 0) with space after comma; function notation f(x); interval-free inequality chains (a ≤ x ≤ b).
- Unit-cancellation fractions typeset with words inside: (42 posters / 1 minute)(60 minutes / 1 hour) — words in roman, numbers in math font.
- **Numbers:** thousands commas everywhere in display and prose (2,520; 68,921; 24,000) but NOT in SPR entry values; decimals < 1 written with leading zero in prose ("0.176") though SPR accepts ".176"; money as $86, $25,000 (no decimals unless cents matter, then 2 places); percents as "25%"; large real-world constants kept realistic (populations, wages).
- **Coefficient palette:** Easy = 1–2 digit integers, slopes like 2, 3, ½; Medium = one deliberately awkward value (fraction slope, 25% longer radius, 4.76); Hard = constants engineered backward from a clean-but-large SPR integer (403, 231) or a tidy fraction (81/4), fraction coefficients with prime denominators (s/13, 17/3), and radical-bearing answers (√60, k√3) in MC only.
- **Metadata table (every item):** dark header row, white bold labels Assessment | Test | Domain | Skill | Difficulty; values SAT | Math | [domain] | [skill] | Easy/Medium/Hard plus a 3-segment difficulty bar (1, 2, or 3 segments filled).
- **Figures:** axes labeled italic x (right end) and y (top end) with arrowheads both directions; origin "O"; fine gridlines with integer ticks (every 1, 2, or a round step like 20); graphs/curves in black, data dots solid black; geometry figures minimal line art with italic vertex labels and x°-style angle marks; centered caption "Note: Figure not drawn to scale." under geometry figures whenever measures aren't scaled.
- **Data tables:** simple full-border grids, bold column headers (sometimes a title row above), two-way tables always include a Total row and column; bar charts use gray-filled bars, rotated category labels, axis titles in roman ("Number of students", "Activity").
- **Tables in stems** get a lead-in sentence ("The table shows …", "The bar graph summarizes …") rather than a caption below.

---

## 7. VOICE FINGERPRINT (micro-tells of an authentic CB item)

1. "It's given that …" (with the contraction) to restate premises in rationales; stems never say "given that" loosely — they declare: "In the given equation, a and b are constants."
2. Every derivation step narrated as "[Gerund phrase] yields [result], or [simpler form]." — "yields" is the single most CB word (543 uses).
3. "Therefore, the [asked quantity] is [value]." as the closing sentence, echoing the question's noun phrase verbatim.
4. Units are named at every mention, interpolated with commas: "the volume, in cubic inches, of the cube"; "the height h, in feet, of the ball t seconds after launch."
5. Trailing "where"-clauses define every symbol: "…where x is the number of months after purchase and 0 ≤ x ≤ 24." Constants are declared: "where a and b are constants."
6. "a certain" for unnamed real-world entities (a certain school, a certain rabbit, a certain product) — 31 uses; never a brand or proper noun for businesses ("an online news service").
7. People are first-name-only and deliberately diverse: Hector, Gabriella, Hiro, Sofia, Amaya, Josie, Isabel, Valentina, Leo, Hana, Rosa. One person per context, no dialogue, no humor, no second person "you" anywhere (0 uses).
8. The question is always a single terminal interrogative sentence: "What is the value of k?" / "Which of the following …?" — never two questions, never imperatives like "Find x." "Which of the following" (79×) for choice-referential stems; "What is the value of" (58×) for computations.
9. Negations capitalized: "What CANNOT be the value of …", "is NOT a possible value"; estimates flagged with "closest to" and "best estimate"; interpretations with "best interpretation"; models with "Which equation represents this situation?"
10. Setting formula "in the xy-plane" (136×) for any coordinate statement; graphs are "the graph of y = f(x) in the xy-plane"; shown visuals referenced as "the … shown" ("the lines shown", "the graph shown") — never "above/below" in newer items (legacy items say "above").
11. Rationale dismissals in fixed liturgy: "Choice B is incorrect and may result from [error]." / "Choice C is incorrect. This is the [other quantity], not the [asked quantity]." — mechanism named, right value often restated ("…is p, not q").
12. Real-world stems are aggressively dry and plausible: manufacturing plants, surveys with sample sizes, savings accounts, population densities; numbers are realistic for the context (minimum wage by year, 799 surveyed teens).
13. Contexts state measurement conditions pedantically: "selected at random", "at a constant rate", "rounded to the nearest", "assuming all the tents were filled to capacity".
14. Displayed equation first, prose after (abstract items); context first, model equation second, definitions third, question last (applied items).
15. No rhetorical flourishes: no exclamation points, no ellipses, no em-dash asides; sentences short, declarative, comma-spliced only with "or" for algebraic rewrites.

---

### Quick-use checklists

**To author an MC item:** pick skill → pick archetype (§2) → set difficulty via that skill's levers → draft stem to length norm (§1) with voice rules (§7) → compute key → generate 3 distractors from the skill's recipe list (§3.2), ensure numeric choices ascend → write rationale from the MC skeleton (§4).

**To author an SPR item:** prefer Hard constant-parameter or unit-rate archetypes → engineer constants backward from a large integer or lowest-terms fraction target (§5) → write rationale from SPR skeleton; append the "Note that …" entry-forms sentence if non-integer.
