# PT1 Module 4 — Self-Check (blueprint conformance audit)

Deliverable: `M4.annotated.json` (22 items) + `assets/PT1-M4-Q10.svg`, `assets/PT1-M4-Q11.svg`, `assets/PT1-M4-Q21.svg`.
JSON parses (verified with `json.load`); all three SVGs are well-formed XML (verified with `minidom.parse`).

## 1. Slot-by-slot blueprint conformance

| # | skill (id) | diff | fmt | visual | archetype delivered | engineered answer |
|---|---|---|---|---|---|---|
| 1 | linear-functions (12) | E | MC | — | applied model → "Which equation represents…" (kayak rental, fee $12 + $9/hr) | key y = 9x + 12 |
| 2 | equivalent-expressions (18) | E | MC | — | difference of two polynomials | 4x² + 8x + 9 |
| 3 | linear-equations-two-variables (13) | E | MC | — | parallel slope, integer m = 4 (stamped pair with M3 Q11 perpendicular) | 4 |
| 4 | probability (23) | E | MC | HTML freq table | simple probability, one-way table (animal shelter) | 3/20 |
| 5 | nonlinear-functions (16) | E | SPR | — | evaluate cubic f(x) = x³ − 4x at 3 | **15** ✓ |
| 6 | linear-equations-two-variables (13) | E | SPR | — | 3x + 5y = 57, x = 4 | **9** ✓ |
| 7 | nonlinear-functions (16) | E | MC | — | interpretation of p(0) = 150 in doubling exponential (bacteria) | menu key |
| 8 | linear-inequalities (15) | E | MC | — | budget with flat fee: 4r + 20 ≤ 92 (gift-wrapping stand) | key ≤-form |
| 9 | linear-equations-one-variable (11) | M | MC | — | 3-quantity verbal chain (ferns/shrubs/grasses, total 54) | 36 |
| 10 | one-variable-data (21) | E | MC | SVG bar graph | median from 7-bar unsorted bar graph (smoothie stand) | 40 |
| 11 | area-volume (26) | M | MC | SVG cylinder fig | inverse volume: V = 288π, r = 6 → h | 8 |
| 12 | ratios-rates-proportions (19) | M | SPR | — | two-hop unit rate, 51 bottles per 3 min → per hour (bottling machine) | **1020** ✓ |
| 13 | nonlinear-equations (17) | M | SPR | — | positive solution of 6x² = 7x + 20 (blueprint equation verbatim) | **5/2** ✓ |
| 14 | lines-angles-triangles (27) | M | MC | — | similar triangles via shadows (flagpole & signpost), verbal, no figure | 36 |
| 15 | nonlinear-equations (17) | M | MC | — | linear–nonlinear system, which ordered pair | (2, 6) |
| 16 | linear-inequalities (15) | M | MC | — | integer optimization under weight cap (cargo trailer) | 12 |
| 17 | systems-linear-equations (14) | H | MC | — | mismatched forms, target x + y; sum gives 2x + 2y = 22 → **x + y = 11**, solution (15/2, 7/2) non-integer ✓ | 11 |
| 18 | circles (29) | H | MC | — | diameter endpoints (−3, 4), (5, −2) → equation; 4 single-slot variants | (x − 1)² + (y − 1)² = 25 |
| 19 | linear-functions (12) | H | SPR | — | f(3) = 19, f(7) = 43 → f(20) (blueprint numbers verbatim) | **121** ✓ |
| 20 | nonlinear-functions (16) | H | MC | — | geometric sequence nth term, first term 5, ratio 3; n vs n−1 / base-coefficient family exactly as mandated | a(n) = 5(3)ⁿ⁻¹ |
| 21 | two-variable-data (22) | H | MC | SVG scatter | decreasing exponential scatter, "closest to the value of b" reasoned, ~20%/yr decay | 0.8 |
| 22 | equivalent-expressions (18) | H | SPR | — | ⁴√x³ · ⁶√x⁵ = xᵏ (blueprint radicals verbatim, presented as Unicode radicals in a centered div) | **19/12** ✓ |

All six pre-verified engineered answers kept: Q5 = 15, Q6 = 9, Q12 = 1020, Q13 = 5/2, Q19 = 121, Q22 = 19/12. Q17 target kept at 2x + 2y = 22 → x + y = 11 with non-integer components (see §9 for the coefficient latitude).

## 2. Difficulty curve
`E E E E E E E E M E M M M M M M H H H H H H` = **9E / 7M / 6H** — matches the blueprint exactly, including the mandated honest dip (medium at Q9, easy straggler at Q10) and the hard band Q17–22 with a hard SPR closer.

## 3. SPR positions and census
Positions **5, 6, 12, 13, 19, 22** with difficulty E/E/M/M/H/H — exact. Census: integers 15, 9, 1020 (the 4-digit), 121 (the 3-digit); fractions 5/2, 19/12 — exactly the module's share of the form census (M3 carries 16, 29, 14, −14, 3/2, 4.65). All acceptedAnswers enumerated with the shared `spr_enum.py` (canonical entry hoisted first; every entry ≤5 characters): 15→12 entries, 9→15, 1020→1 (only "1020" fits), 5/2→22, 121→10, 19/12→6. Non-integer rationales (Q13, Q22) end with the entry-forms note; integer rationales carry none. Q12's rationale opener uses the prose form "1,020" while the entry value is comma-free "1020", per §6 of the spec.

## 4. Visual count
Exactly 4 visual-stimulus items: Q4 HTML frequency table (in `passage`, bordered/centered/bold headers, Total row), Q10 SVG bar graph (7 gray bars, rotated day labels, roman axis titles), Q11 SVG right-cylinder geometry figure (radius labeled 6 cm, centered 12px "Note: Figure not drawn to scale."), Q21 SVG scatter (10 dots, no fit curve, arrowed axes, origin O, #cccccc gridlines, no scale note). Exactly 3 SVG files as specified; the note appears only on the geometry figure.

## 5. Key-letter tally (16 MC)
A ×4 (Q1, Q7, Q8, Q16) · B ×5 (Q4, Q10, Q11, Q15, Q21) · C ×4 (Q2, Q17, Q18, Q20) · D ×3 (Q3, Q9, Q14) → **4/5/4/3**, within the ±1 tolerance. Balance achieved by value/target adjustment (e.g., Q1 fee/rate chosen so the key sorts first; Q9 asks for the grasses so the key sorts last; Q2 constants chosen so the key's constant sorts third) — never by shuffling: every numeric set is strictly ascending (machine-verified), equation/sentence sets follow single-slot template order.

## 6. Trap-per-item list (ONE mechanism each, spec §5)
| # | trap |
|---|---|
| 1 | slope/intercept role swap |
| 2 | sign-slip bait (distributed minus) |
| 3 | role swap (opposite/reciprocal/negative-reciprocal trio vs parallel) |
| 4 | wrong denominator (complement count / complement probability) |
| 7 | interpretation mis-mapping menu |
| 8 | at-least ↔ at-most reversal |
| 9 | wrong anchor (other quantity of the chain) |
| 10 | adjacent-quantity (mean/range/mode for median) |
| 11 | radius/diameter and r-vs-r² scale slips |
| 14 | reversed ratio |
| 15 | step-skip (solved the linear equation only) |
| 16 | boundary strict/inclusive (round down at the cap) |
| 17 | answer-the-wrong-target (add, don't solve) |
| 18 | r vs r² (with center sign-slip variant) |
| 20 | exponent-structure (n vs n−1 / base-coefficient swap family, as mandated) |
| 21 | statistical-model parameter reasoning (decreasing ⇒ 0 < b < 1) |
SPR items (5, 6, 12, 13, 19, 22) carry no MC trap; Q13 requires rejecting the negative root −4/3, Q22's load-bearing step is adding the fractional exponents. Every distractor has a named one-error recipe recorded in `_distractorLogic`.

## 7. Applied share and context register
Applied slots: Q1, Q4, Q7, Q8, Q9, Q10, Q12, Q14, Q16, Q21 = **10/22**, matching the blueprint line exactly (form total 15/44 ≈ 34% with M3's 5). Exactly **one named person** in the module: Hana (Q1), single given name, one economic act, no dialogue. Exactly **one invented Latin binomial** in the form, placed at Q21 as mandated: *Petrobrachys sylvicola* — invented genus + plausible epithet, not a real species. All other actors generic ("a landscaper", "a certain smoothie stand", "a volunteer group", "an animal shelter", "a bottling machine", "a cargo trailer").

## 8. Stem word counts (prose words, math stripped) vs §2b caps
| # | prose words (text; + passage prose where present) | cap | ok |
|---|---|---|---|
| 1 | 40 | 55 applied | ✓ |
| 2 | 5 ("Which expression is equivalent to") | 15 equiv-expr | ✓ |
| 3 | 27 | 35 abstract | ✓ |
| 4 | 18 + 21 passage lead-in | 75 stat verbal | ✓ |
| 5 | 13 | 35 abstract | ✓ |
| 6 | 20 | 35 abstract | ✓ |
| 7 | 12 + 20 passage | 55 applied | ✓ |
| 8 | 45 | 55 applied | ✓ |
| 9 | 51 | 55 applied | ✓ |
| 10 | 12 + 20 passage | 75 stat verbal | ✓ |
| 11 | 31 | 55 applied | ✓ |
| 12 | 22 | 55 applied | ✓ |
| 13 | 9 | 35 abstract | ✓ |
| 14 | 41 | 55 applied | ✓ |
| 15 | 17 | 35 abstract | ✓ |
| 16 | 47 | 55 applied | ✓ |
| 17 | 19 | 35 abstract | ✓ |
| 18 | 20 | 35 abstract | ✓ |
| 19 | 13 | 35 abstract | ✓ |
| 20 | 32 | 35 abstract | ✓ |
| 21 | 11 + 60 passage = 71 | 75 stat verbal | ✓ |
| 22 | 21 | 35 abstract | ✓ |
Every `text` is a single terminal interrogative; no imperatives, no "you", no double questions. Negative options use ASCII hyphens; options contain no HTML; π symbolic in Q11; passage equations centered one-per-line; exponents as `<sup>` in HTML fields and Unicode superscripts in options/explanations.

## 9. Latitude exercised (with justification)
1. **Q17 coefficients.** Blueprint sketched the shape "7x − 3y = 52, −5x + 5y = −30" (solution x = 8.5, y = 2.5). I kept the identical structure, the identical sum 2x + 2y = 22, and the identical answer x + y = 11, but retuned to **7x − 3y = 42 and 5y = 5x − 20** (solution x = 15/2, y = 7/2). Two reasons: (a) the second equation is now genuinely presented in a mismatched form (5y = 5x − 20 must be rearranged before elimination), which the archetype name requires; (b) the blueprint version's y-value 5/2 would have duplicated Q13's engineered answer 5/2 inside the same module — an internal number collision. The answer remains equally clean (11), the full solve remains non-integer and unattractive, and the distractors (7/2, 15/2, 22) are the wrong-target family.
2. **Q22 decimal forms.** The task sketch guessed acceptedAnswers "1.583, 1.584"; the authoritative `spr_enum.py` (grader reality) shows truncation and half-up rounding of 1.58333… coincide at **1.583**, so the list is 19/12, 38/24, 57/36, 76/48, 95/60, 1.583 — "1.584" would be a wrong entry and is excluded.
3. **Q12 acceptedAnswers.** Only "1020" is legal: every fractional or decimal equivalent (1020/1, 1020.0, …) exceeds 5 characters. Enumerator-confirmed.
4. **Bar graph conventions (Q10).** No official bar-graph SVG exists in the PT4/PT5 asset sets, so I followed the bank's measured conventions (§6 of doc B): gray-filled bars with black outline, rotated category labels, roman axis titles, #cccccc gridlines, Georgia serif, ~380px wide, plain (unarrowed) categorical axes, no scale note (it is a data display, not a geometry figure).
5. **Q21 first dot on the y-axis.** The x = 0 data point sits on the vertical axis (a legitimate data location); axis arrows/O/labels otherwise mimic PT5-M4-Q16 exactly, with axis titles instead of italic x/y tip letters, as in both measured scatter exemplars.

## 10. Context and number firewall — confirmation
Checked every item against `used_contexts_t4_t5.txt` (all 88 PT4/PT5 stems) and the PT4/PT5 asset/workpaper contexts:
- Contexts used here — kayak rental (Hana), polynomial difference, parallel-line stamp, animal-shelter intake table, cubic evaluation, 3x + 5y = 57, bacteria doubling culture, gift-wrapping stand, landscaping order (ferns/shrubs/grasses), smoothie-stand bar graph, abstract cylinder figure, bottling machine, 6x² = 7x + 20, flagpole & signpost shadows, parabola-line system, cargo trailer, mismatched-form system, diameter-endpoint circle, two-point linear function, geometric sequence, declining beetle scatter (*Petrobrachys sylvicola*), rational-exponent radicals — **all drawn from the PT1 palette; none appears in the firewall file.**
- Nearest neighbors checked for number/scenario separation: PT5's parking garage (4, 3) vs Q1 (12, 9); PT5's grain-silo cylinder (r 5, h 12, 300π applied) vs Q11 (abstract figure, r 6, V 288π, inverse direction); PT4's freight elevator (2,400 lb; 60/150 lb) vs Q16 (1,700 lb; 120/45 lb, different question type); PT4's k-for-no-solution and PT5's x + y system (5x + 3y = 50 / 3x + 5y = 46 → 12) vs Q17 (mismatched forms, 42/−20 → 11); PT5's lichen scatter (increasing linear, *Rhizocarpon nivalescens*) vs Q21 (decreasing exponential, invented beetle, b-value reasoning). No context, scenario, or number set is reused; no two contexts inside this module collide, and none reuses the PT1-M3 palette seeds assigned to Module 3.
- Named person Hana does not repeat PT4 (Nadia) or PT5 (Mateo, Idris).

## 11. Domain/skill quotas (module share of the form)
ALG 8 (Q1, 3, 6, 8, 9, 16, 17, 19) · ADV 7 (Q2, 5, 7, 13, 15, 20, 22) · PSDA 4 (Q4, 10, 12, 21) · GEO 3 (Q11, 14, 18) — matches the blueprint's M4 row (15/13/9/7 form totals with M3). Probability appears in Module 4 only (Q4); circles ×1 hard (Q18); evaluating-statistical-claims absent. Rationales follow the §7 liturgy (Choice X is correct. / It's given that… with curly apostrophes / gerund + "yields" chains / "Therefore, …" / letter-order dismissals naming errors or adjacent quantities; SPR openers "The correct answer is …" with no dismissals). Approximate rationale lengths: E-MC ≈ 105–145, M-MC ≈ 135–175, H-MC ≈ 160–230, SPR ≈ 45–115 words — tracking the E/M/H norms.
