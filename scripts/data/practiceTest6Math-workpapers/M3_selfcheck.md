# PT6 Math Module 3 — authoring self-check

Artifacts: `M3.json` (22 items) · `assets/PT6-M3-Q07.svg`, `PT6-M3-Q08.svg`, `PT6-M3-Q10.svg`,
`PT6-M3-Q14.svg` · `verify_M3.py`.
Verifier status: **838 checks, 0 failures** (`python3 verify_M3.py` → `ALL CHECKS PASSED`).

**Revision 3 (round-3 polish, 2026-08-15).** Four items and one instrument changed, no mathematics
elsewhere: **Q20**'s stem was trimmed from 43 to 34 tokens against the 35-token abstract cap (F1);
**Q18**'s trap was re-pitched off leg↔hypotenuse — which round 2 had left on *both* of the form's
right-triangle items — to *special-triangle side ratio applied to the wrong side* (F3); **Q22**'s
composite target moved from the three-form "value of *ab*" habit to **a − b**, key **−41/3** (F4);
**Q12**'s numbers were re-tuned (368 rolls on 22 trays) so its key is **16**, dissolving the 12/12/12
three-way tie and one key-equals-question-number coincidence (F5). `verify_M3.py`'s stem ruler was
corrected to drop nothing at all (F7) — that instrument, not the item, is why Q20's breach passed
round 2. Before/after: `../review-pt6/fix_round3_report.md`.

**Revision 2 (fix round, 2026-08-14).** Eight items were changed under the adjudicated fix list from
the three PT6 audits (originality gate / CB-authenticity critic / math verifier): Q3 rewritten
(originality violation), Q6 and Q20 re-archetyped (cross-form repeats), Q11 re-skinned (internal
duplication with M4), Q8 and Q18 traded traps (the not-to-scale family moved to the item that has a
figure), Q17 and Q19 strengthened to earn their hard labels. `PT6-M3-Q08.svg` was redrawn. All four
`graphDescription` fields were rewritten to the corrected **data-complete** alt-text policy, and the
rationales of Q8, Q11, Q12 and Q14 were trimmed. Full before/after: `../review-pt6/fix_M3_report.md`.

---

## 1. Slot-by-slot conformance (blueprint MODULE 3 table)

All measurements below are produced by `verify_M3.py`, whose ruler (corrected in round 3) counts
**every whitespace-delimited token of `passage` + `text` after tag-stripping — nothing is dropped**:
prose words, numerals, operators, bare `=`, and the tokens of a centered displayed equation. The
round-2 ruler subtracted the display div before counting, which is exactly how Q20 shipped at 43
tokens while reporting 32 against a 35-token cap. The self-test at the top of the script now asserts
the count of a display-equation stem (13, not 8) and of a table stem, so the ruler cannot regress.

| # | skill (id) | diff | fmt | visual | archetype delivered | trap delivered | key | stem/cap | rationale/norm |
|---|---|---|---|---|---|---|---|---|---|
| 1 | lin-eq-1var (11) | E | MC | — | bare solve, one distribution step: 4(x + 8) = 52 | verbatim-number echo | A | 13/35 | 123/110 (1.12) |
| 2 | lin-functions (12) | E | MC | — | evaluate f(x) = 9x + 14 at 6 | adjacent-quantity (x vs f(x)) | D | 17/35 | 103/110 (0.94) |
| 3 | ratios (19) | E | MC | — | **aggregate per batch → divide then multiply** (warehouse cartons) | reciprocal rate | C | 33/55 | 107/110 (0.97) |
| 4 | equiv-expr (18) | E | MC | — | factor 49x² − 25, difference of squares | sign error in factoring | B | **9/15** | 137/110 (1.25) |
| 5 | lin-eq-2var (13) | E | SPR | — | 9x + 4y = 87, y given → x (**abstract**) | — | 7 | 22/35 | 53/40 (1.32) |
| 6 | nonlin-func (16) | E | SPR | — | **evaluate an exponential**, f(x) = 5(2)ˣ + 9 at x = 4 | — | 89 | 21/35 | 45/40 (1.12) |
| 7 | 1-var-data (21) | E | MC | **bar graph** | read a frequency display, tide-pool survey | value read as frequency / category total | C | 44/55 | 144/110 (1.31) |
| 8 | lines-angles (27) | E | MC | **geometry fig** | parallel lines + transversal | **not-to-scale doubt** | C | 22/35 | 146/110 (1.33) |
| 9 | area-volume (26) | M | MC | — | inverse volume formula, aquarium tank | formula-fragment omission | A | 47/55 | 168/135 (1.24) |
| 10 | lin-functions (12) | **E (dip)** | MC | **line graph** | equation of a shown line | slope/intercept role swap | B | 15/35 | 149/110 (1.35) |
| 11 | lin-inequalities (15) | M | MC | — | integer optimization under a **time budget**, kayak livery | strict vs inclusive boundary | B | 54/55 | 174/135 (1.29) |
| 12 | systems (14) | M | SPR | — | two-totals word problem, bakery trays (**368 rolls on 22 trays**) | — | **16** | 34/55 | 135/100 (1.35) |
| 13 | nonlin-eq (17) | M | SPR | — | literal rearrangement then evaluate | — | 7/3 | 30/35 | 71/100 (0.71) |
| 14 | 2-var-data (22) | M | MC | **scatter** | line-of-best-fit prediction, wind turbines | adjacent-quantity (observed vs predicted) | D | 53/55 | 168/135 (1.24) |
| 15 | nonlin-func (16) | M | MC | — | exponential model selection, ski rental | exponent-structure conversion | B | 41/55 | 176/135 (1.30) |
| 16 | lin-eq-2var (13) | M | MC | — | perpendicular slope from y = (5/8)x − 3 | reciprocal vs negative reciprocal | A | 30/35 | 166/135 (1.23) |
| 17 | nonlin-func (16) | H | MC | — | **minimum VALUE** of 3x² − 30x + 92 (vertex located, then evaluated) | ordered-pair / x-vs-y reversal | C | 24/35 | 219/170 (1.29) |
| 18 | right-tri-trig (28) | H | MC | — (figure-less) | 30-60-90, answer 8√3 | **special-triangle ratio applied to the wrong side** | D | 30/35 | 215/170 (1.26) |
| 19 | lin-eq-1var (11) | H | SPR | — | **parameter on both sides**, coefficient AND constant matching | — | **126** | 31/35 | 141/130 (1.08) |
| 20 | circles (29) | H | MC | — (figure-less) | **point on the circle → the general-form constant c** | r² vs the given constant | A | **34/35** | 162/170 (0.95) |
| 21 | nonlin-eq (17) | H | MC | — | linear–nonlinear system, one coordinate | sign slip on substitution | D | 34/35 | 212/170 (1.25) |
| 22 | nonlin-func (16) | H | SPR | — | two constants jointly constrained → **a − b** | answer-the-wrong-target (composite) | **-41/3** | 31/35 | 154/130 (1.18) |

Every rationale is inside **+36%** of its §7 norm (widest: Q10 and Q12 at 1.35, and nothing anywhere
near the 1.45 line the round-3 mandate flags); the MC band means are E 1.18 · M 1.26 · H 1.19, all
under the 1.30 ceiling the verifier enforces. Every stem is inside its §2b cap **on the corrected
drop-nothing ruler** — the tightest are Q20 at 34/35 (was 43/35), Q11 at 54/55 and Q14 at 53/55;
Q4 (equivalent expressions) is 9 tokens against the 15-token cap.

**Quotas.** Domains ALG 8 / ADV 7 / PSDA 3 / GEO 4. Skills: 1var 2 · func 2 · 2var 2 · systems 1 ·
ineq 1 · NLF 4 · NLE 2 · EE 1 · ratios 1 · 1-var-data 1 · 2-var-data 1 · AV 1 · LAT 1 · RTT 1 ·
circles 1 = 22 — the blueprint row exactly. Difficulty 9E / 7M / 6H with exactly one dip (medium at
Q9, easy straggler at Q10). SPR at 5, 6, 12, 13, 19, 22 with difficulty E/E/M/M/H/H. 16 MC + 6 SPR.
No probability, no evaluating-statistical-claims, one circles item. Four visuals: bar graph (Q7),
geometry figure (Q8), line graph (Q10), scatter (Q14) — zero histograms, zero box plots.

---

## 2. Trap list (exactly one mechanism per item; 17 traps, all distinct)

verbatim-number echo (Q1) · adjacent-quantity x-vs-f(x) (Q2) · reciprocal rate (Q3) · sign error in
factoring (Q4) · value-read-as-frequency / category total (Q7) · **not-to-scale doubt (Q8)** ·
formula-fragment omission (Q9) · slope/intercept role swap (Q10) · strict-vs-inclusive boundary (Q11) ·
adjacent-quantity observed-vs-predicted (Q14) · exponent-structure conversion (Q15) ·
reciprocal-vs-negative-reciprocal (Q16) · ordered-pair / x-vs-y reversal (Q17) ·
**special-triangle side ratio applied to the wrong side (Q18)** · r²-vs-the-given-constant (Q20) ·
sign slip on substitution (Q21) · answer-the-wrong-target composite (Q22).

Trap-free: Q5, Q6, Q12, Q13, Q19 — precisely the five SPR slots the blueprint leaves blank.

**Q8, the form's new trap family — now instantiated by a drawing.** The figure is deliberately drawn
off-scale: the angle *labelled* 68° is drawn at **112.06°** and the angle labelled *x*° is drawn at
**67.94°**, so a student who eyeballs the picture reads *x* ≈ 68 and takes choice B. Lines *r* and *s*
are still drawn exactly parallel and the two marked angles are still drawn supplementary, so nothing
in the figure contradicts the stem — only the *sizes* are off, which is exactly what the mandated
"Note: Figure not drawn to scale." licenses. The given 68° and the parallel-lines theorem determine
*x* = 112 without reference to the drawing. `verify_M3.py` recovers both wedge angles from the SVG
geometry, proves each label sits strictly inside its own wedge, and proves the drawn pair sums to 180°.

**Q18 — re-pitched in round 3.** Round 2 gave it *leg ↔ hypotenuse interchange*, which was already
the mechanism at M4 Q11: the form's only two right-triangle items were running the same trap. Q18 now
carries **the special-triangle side ratio applied to the wrong side** — the 2:1 hypotenuse relation
used on the side actually asked for, so choice B is simply DF halved (8), choice A is that halving
performed twice before the √3 is attached (4√3), and choice C swaps in the 45-45-90 ratio (8√2).
Options, key and mathematics are untouched; the three dismissals were rewritten to name the new
mechanism. Leg ↔ hypotenuse is now carried once form-wide, by M4 Q11, and both verifiers assert it.

**Engineered difficulty, as required.** Q17 asks for the minimum **value**, so the vertex *x* = 5 is
only an intermediate result and the seductive answer is that intermediate (choice B); the verifier
proves 3(x − 5)² + 17 is identically the given function and that 17 is the global minimum over the
reals. Q19 puts the parameter on **both** sides, so the coefficient condition 7a = 3a + 504 must be
solved rather than read off, and the constant condition 105 = a − 21 independently confirms a = 126;
the verifier brute-forces every integer a in [−500, 500]. Q22's two constants are jointly constrained
(f(3) = 7, f(6) = −11 ⇒ a = −2/3, b = 13) with a **negative fraction** composite target — since
round 3 the **difference a − b = −41/3**, the form's only negative. Q13's rearrangement yields the
lowest-terms fraction 84/36 = 7/3.

**Q22 — target changed in round 3 (F4).** "What is the value of *ab*?" had run three consecutive
forms (PT4 M4.19 → PT5 M4.22 → PT6 M3.22), and this item also carried the second three-form habit,
the *ax² + b* setup fixed by two conditions (PT4 M4.22 → PT5 M3.19). The setup is the blueprint's, so
the **target** moved instead, and it moved to something neither sister form asks: PT4 uses *ab* and
"the maximum value of f", PT5 uses *ab* and "the value of f(7)" — a difference of the constants
appears in neither. Position 22, hard, SPR, nonlinear-functions, the wrong-target trap and the
negative lowest-terms fraction all stand; the retired product *ab* = −26/3 is now itself one of the
named wrong targets, alongside a, b and a + b, none of which equals −41/3. The stem was shortened at
the same time (the ask costs two more tokens than "ab") and now opens "In the given equation, a and b
are constants" — the frame M3 Q19 already uses, and CB's own for a displayed equation carrying
constants. Measured effect on the sister-form echo: the longest shared normalised span with
PT5 M3.19 falls from **28 tokens to 18** ("a and b are constants if f # # and f # # what is the value
of"), all of it §2a-mandated liturgy. The originality gate's reported maximum stays at its 12-token
scanning ceiling, so the improvement is visible only in the span measurement, not in that headline.

---

## 3. Key tally and answer census

MC key letters over the 16 MC items: **A 4 · B 4 · C 4 · D 4**, unchanged by the fix round (Q3 kept
key C, Q17 kept key C, Q20 kept key A). No numeric set was reordered: every numeric option set is
strictly ascending, every equation set is ordered on its one varying slot (slope for Q10, base for
Q15, sign pattern for Q4), and the radical set in Q18 ascends by value (4√3 < 8 < 8√2 < 8√3).

Key positions: A — Q1, Q9, Q16, Q20 · B — Q4, Q10, Q11, Q15 · C — Q3, Q7, Q8, Q17 ·
D — Q2, Q14, Q18, Q21.

**The six SPR answers: 7 (Q5) · 89 (Q6) · 16 (Q12) · 7/3 (Q13) · 126 (Q19) · -41/3 (Q22).**
Census: 4 integers (one engineered 3-digit), 2 lowest-terms fractions, one of them the module's — and
the form's — only negative. Every legal entry form is re-enumerated by the project's canonical
enumerator (`_spr_enum.py`) and re-derived independently inside the verifier
(18 / 12 / 12 / 15 / 9 / 5 forms), all inside the 5-character rule (6 with the minus sign), with the
canonical string first. The entry-forms note closes exactly the two non-integer rationales.
Q12's twelve entries are `16, 16/1, 32/2, 48/3, 64/4, 80/5, 96/6, 112/7, 128/8, 144/9, 16.0, 16.00`
(`160/10` is six characters and rightly absent); Q22's five are `-41/3, -82/6, -123/9, -13.66, -13.67`
(`-164/12` overflows the six-character rule).

**No key value repeats anywhere in the module** (verifier-enforced). Round 2 shipped 12 at both Q9 and
Q12 — one leg of the form's only three-way tie (M3 Q9 · M3 Q12 · M4 Q16) and of its only same-skill
key pair (M3 Q12 · M4 Q16, both systems-linear-equations). Re-tuning Q12 to 16 dissolves all three at
once and removes one of the four key-equals-question-number coincidences; the form is left with a
single benign cross-module pair (12 at M3 Q9 area-volume MC and M4 Q16 systems MC) and the
pre-existing 17 at M3 Q17 / M4 Q5.

---

## 4. Applied-share decision

The blueprint lists eight applied slots for M3 (Q3, Q5, Q7, Q9, Q11, Q12, Q14, Q15) and instructs
the writers to convert one of the thinner ones — M3 Q5 or Q12 — to abstract so the form lands at
14/44 ≈ 32%.

**Converted slot: Q5.** It reads as a bare two-variable equation (9x + 4y = 87, y given, solve for x)
with no food-co-op bin context. Q12 kept its context because the two-totals systems archetype needs
two named item types to make the second equation legible; Q5's archetype survives the deletion of its
story completely, which is exactly the spec's test for a removable context.

M3 applied share is therefore **7/22** (Q3, Q7, Q9, Q11, Q12, Q14, Q15) — unchanged by the fix round.

---

## 5. Originality and register

Contexts used: **warehouse cartons of bolts** (Q3, new this round), tide-pool snail survey, aquarium
tank, kayak livery (now a **preparation-time** budget, not a weight cap), bakery trays, wind turbines,
ski rental fleet. None appears in PT4 or PT5; the verifier greps all 37 banned PT4/PT5 context strings
and both prior Latin binomials and confirms zero hits. "Warehouse", "carton" and "bolt" have zero
occurrences in the question-bank exports, the four official practice-test extracts and both shipped
sister forms.

Named people: **Anika** only (Q12) — one per module, well inside the cap of 2, and none of
Nadia / Mateo / Idris. Latin binomial: exactly one, *Littorina fuscopunctata* (Q7), an invented
epithet on a real periwinkle genus, italicised with `<i>` in the passage only and never in an option.

The values 2,520, 420 and 42 (the collided pipeline in the withdrawn Q3) appear nowhere a student can
see, and no key in the module is any of them — both verifier-enforced.

## 6. Figures

All four SVGs are 380px wide, Georgia serif, black marks, `#cccccc` gridlines. The verifier parses
each file and re-measures its geometry rather than trusting the alt text:

- **Q07 bar graph** — five gray-filled (`#999999`) bars re-measure to 18, 30, 12, 24, 6 snails at
  6 px per snail off the baseline; the tallest bar is unique; roman axis titles ("Tide pool",
  "Number of snails") and Pool 1–5 category labels; no scale note (data display).
- **Q08 geometry (redrawn this round)** — three line elements: *r* and *s* horizontal (hence exactly
  parallel) and *t* genuinely transverse, now running from upper right to lower left. The verifier
  computes both intersection points from the line geometry, checks the drawn dots sit on them, proves
  each angle label lies strictly inside its own wedge, and measures the drawn wedges at 112.06°
  (labelled 68°) and 67.94° (labelled *x*°) — the deliberate off-scale distortion. Italic line labels;
  the only file carrying the centered 12px "Note: Figure not drawn to scale."
- **Q10 line graph** — the data↔pixel map is recovered from the arrowed axis lines and the tick-label
  spacing, then the drawn segment re-measures to exactly y = −3x + 8 and is confirmed to pass through
  (0, 8), (2, 2) and (4, −4); italic *x*/*y* at the arrow tips and italic origin *O*; no scale note.
- **Q14 scatter** — ten dots; their least-squares line is computed from the re-measured coordinates
  and comes out at exactly y = 25x, which is the line actually drawn (residuals sum to zero). The
  drawn line reads 450 kW at 18 m/s (the key) while the plotted turbine at 18 m/s sits at 400 kW
  (distractor C). Roman axis titles carry units in parentheses; italic origin *O*; no scale note.

**Alt-text policy (corrected this round).** `graphDescription` states the figure's data **completely
and factually** — every bar height, plotted point, labelled measure, axis range and gridline
increment a sighted student can read — so that a screen-reader user can answer the item, which is the
binding spec's and both shipped forms' standard. It never interprets the figure or announces the
answer as a conclusion. The verifier now enforces a per-figure datum list (bar heights for Q7, the
ten scatter points and the fit line's two endpoints for Q14, the three lattice points for Q10, the two
angle labels and the scale note for Q8) plus a ban on interpretive phrasing.

## 7. What the verifier proves per item

Beyond quotas and formatting, `verify_M3.py` recomputes every key from the givens with exact sympy
arithmetic, re-derives all 48 distractors from their named recipes and shows each differs from its
key, and closes the "second defensible answer" hole exhaustively rather than by spot check:

- **Q3** proves the key is unreachable by any single operation on the givens, so the divide-then-
  multiply pipeline is genuinely two-step, and re-derives all three distractors.
- **Q4** compares polynomials by identity — equivalence over *every* real x, not sampled values.
- **Q10** tests all four candidate equations against every plotted lattice point.
- **Q11** enumerates every integer count 0–200 and shows exactly one integer (9) is feasible while its
  successor is not, then checks that of the four printed options only the key satisfies "is the
  greatest"; it also greps the item for weight-cap vocabulary and requires the constraint to be time.
- **Q15** checks both model conditions (f(0) = 24,000 and f(t+1) = 0.85·f(t)) symbolically for all t.
- **Q17** shows f(x) − 17 is identically 3(x − 5)², vanishing only at x = 5, cross-checks with sympy's
  global minimum over the reals, and proves −75 and 5 lie below the range of f (so neither is a value
  of f at all) while 92 = f(0) is a value but not the least one.
- **Q19** solves the coefficient condition and the constant condition separately, shows both force
  a = 126, brute-forces every integer a in [−500, 500], and proves no a produces the no-solution case.
- **Q20** solves for c from the point, cross-checks by completing the square (centre (−5, 8), r = 15)
  and by the distance formula, and proves that for each of the three distractors the point (4, 20)
  does **not** satisfy the equation — so no distractor is defensible under any reading.
- **Q21** solves the system exactly, finds both intersection points, and confirms only one has
  positive x.
- **Q12 (new in round 3)** enumerates **every** non-negative integer split of the 22 trays and shows
  exactly one — 6 small and 16 large — holds 368 rolls, so the key is unique over the integers and
  not merely the output of one elimination path; it also asserts the key is no longer 12.
- **Q22 (new in round 3)** solves the pair 9a + b = 7, 36a + b = −11 exactly, back-checks both
  conditions, and proves that **none** of the six plausible wrong targets — a, b, a + b, ab, b − a,
  b/a — coincides with a − b = −41/3, so the wrong-target bait cannot accidentally be right.
- **Q16, Q18** verify their keys and reject their distractors in exact arithmetic (products of
  slopes; the Pythagorean identity plus each of the three re-pitched wrong-side recipes).

## 8. Deviations

None outstanding. Every blueprint column is delivered as specified; the single licensed latitude
(converting one thin applied slot to abstract) was exercised at Q5 and is recorded in §4. Two
blueprint cells were re-cut under the adjudicated fix list and are recorded there rather than treated
as writer latitude: the not-to-scale-doubt trap moved from Q18 (figure-less) to Q8 (the figure item),
and the Q20 circles archetype moved off complete-the-square, which PT4 M4.20 already shipped.
**Both of those trap rows, and the Q18 re-pitch, are now written into `blueprint_pt6_math.md`
(errata dated 2026-08-15), so the binding doc and the artefacts agree.** The blueprint's own
"wrong-target ×2" form-line remains inconsistent with its slot tables (which name the mechanism on
one slot); that inconsistency is now recorded in the blueprint rather than quietly satisfied.
Q22's composite target (a − b rather than ab) is a deliberate departure from the *habit*, not from
the blueprint, whose Q22 row asks only for "a composite target" and a negative fraction — both
delivered.
