# PT6 Math Module 3 — fix-round report

**Scope:** `outputs/modules-pt6/M3.json`, `verify_M3.py`, `M3_selfcheck.md`,
`assets/PT6-M3-Q08.svg`. Module 4 was not touched.
**Mandate:** the adjudicated fix list (A1, B1–B3, C1, D1–D2, E1–E3) drawn from
`originality_gate.md`, `critic_report.md` and `verifier_report.md`.
**Result:** 8 items changed + 4 alt-texts rewritten + 4 rationales trimmed + 1 SVG redrawn.
`python3 verify_M3.py` → **813 checks, 0 failures, ALL CHECKS PASSED.**
Items not named in the fix list were left alone.

---

## A. ORIGINALITY VIOLATION

### A1 — Q3 (easy, ratios-rates-proportions) — rewritten

| | before | after |
|---|---|---|
| Stem | "A press at a print shop produces sheets of paper at a constant rate of **420 sheets per hour**. At this rate, how many sheets of paper does the press produce in 6 hours?" | "A certain **warehouse** receives **bolts** in identical **cartons**. A shipment of **12** of these cartons contains a total of **3,900** bolts. At this rate, how many bolts are in **20** of these cartons?" |
| Pipeline | rate × time — one multiplication | **divide then multiply**: 3,900 ÷ 12 = 325 per carton, × 20 |
| Key | **2,520** (= qb `3c8fdc40`'s published answer; given 420/hr = 10 × its 42/min) | **6,500** |
| Options | 70 / 426 / 2,520 / 25,200 | 195 / 3,920 / 6,500 / 78,000 |
| Trap | reciprocal rate | reciprocal rate — **preserved** (195 = 3,900 ÷ 20) |
| Additive distractor | 426 = 420 + 6 | 3,920 = 3,900 + 20 — **preserved** |
| Third distractor | ×60 scale slip | 78,000 = 3,900 × 20 (step-skip: the per-carton amount never found) |
| Key letter | C | **C (unchanged)** |

The collided stem template (`fe4c1c9e`), the collided scenario domain (`3c8fdc40`, a printing device
producing paper) and the collided key are all gone. Verifier additions: the key is proved unreachable
by **any single operation** on the givens (so the two-step pipeline is real), and the module is
grepped for printing/paper/press vocabulary and for the values 2,520 / 420 / 42 in every field a
student can see, plus a check that no key in the module is any of those values.

---

## B. CROSS-FORM REPEATS

### B1 — Q20 (hard, circles) — re-archetyped off PT4 M4.20

| | before | after |
|---|---|---|
| Stimulus | x² + y² + 12x − 8y = 12 | x² + y² + 10x − 16y = **c** |
| Ask | "What is the radius of the circle?" | "If the point **(4, 20)** lies on this circle, what is the value of **c**?" |
| Pipeline | complete the square on both variables → r | **substitute a point that lies on the circle** into the general form → c |
| Distractor rule | {RHS-echo, **2r**, **r²**} — PT4 M4.20's own rule | {225 = the completed-square constant c + 89 (i.e. r²), 416 = linear terms omitted, 696 = both linear signs flipped} |
| Key | 8 | **136** |
| Key letter | A | **A (unchanged)** |

Archetype check against the spent inventory: PT4 used complete-the-square→radius (M4.20) and
standard-form + point-on-circle→a missing coordinate (M3.21); PT5 used arc-length proportionality
(M3.16) and tangent ⊥ radius (M4.18); PT6 M4 owns area→arc (Q21). The new item runs the **opposite
direction** to PT4 M3.21 (the point is given, the equation's constant is asked) and does not require
completing the square at all — the "2r" distractor is gone and the r² value survives only as the
natural *stopping point* B, which the rationale names explicitly.

Two archetypes suggested in the gate's repair note were tested and **rejected on evidence**: the bank
ships "a circle has a diameter with endpoints … an equation of this circle is …, where k is a positive
constant, what is the value of k?" (Hard SPR, answer 5) and, twice, "Circle A … Circle B has the same
center as circle A. The radius of circle B is two times the radius of circle A … what is the value of
k?" (Hard SPR, answers **100** and 16). Both are slot-for-slot templates, and the concentric one would
have landed a key of 100 — a published answer. Documented here so the choice is not re-litigated.

### B2 — Q6 (easy SPR, nonlinear-functions) — re-archetyped off PT4 M3.06

| | before | after |
|---|---|---|
| Stimulus | f(x) = 2x² + 5x − 8 (quadratic) — PT4 M3.06 is `3x² − 5x + 9` at the same slot | f(x) = **5(2)ˣ + 9** (exponential) |
| Ask | f(6) | **f(4)** |
| Answer | 94 | **89** (integer, 12 legal entries) |

PT4 M3.06 = evaluate a quadratic; PT5 M4.06 = function-notation nesting f(g(11)); PT6 M3.06 is now
evaluate an exponential at a small input — an easy-NLF-SPR archetype the series has not used. Moving
the input from 6 to 4 also removes one of the three "evaluate at 6" soft echoes the critic counted.

### B3 — Q11 (medium, linear-inequalities) — resource re-skinned

| | before | after |
|---|---|---|
| Constraint | trailer **weight cap**, at most **900 pounds** | at most **900 minutes** of **preparation time** |
| Givens | 5 single kayaks at 45 **lb**, tandems at 75 **lb** | 5 single kayaks take 45 **minutes** each, tandems 75 **minutes** each |
| Mechanism | (cap − fixed load) ÷ per-unit, floor | **unchanged**; boundary still met exactly at t = 9 |
| Key / letter | 9 / B | **9 / B (unchanged)** |

M3 Q11 keeps the integer-optimization slot as instructed; no weight-cap language survives anywhere in
the item (verifier greps `pound|weigh|weight|carry|capacity|load` across passage, stem and rationale
and requires "minutes" + "preparation"). Whatever M4 Q13 becomes, the two cannot read as the same item.

---

## C. TRAP CORRECTION

### C1(a) — Q8 receives the not-to-scale-doubt family, and the figure was redrawn

`PT6-M3-Q08.svg` before: transversal (130, 40) → (224, 272); the angle labelled 68° was **drawn at
67.94°**, i.e. the figure was accurate and there was nothing to doubt.
After: transversal mirrored to (250, 40) → (156, 272), intersection dots moved to (230, 90) and
(189, 190), labels repositioned to (266, 120) and (224, 176).

| measured from the SVG | before | after |
|---|---|---|
| wedge carrying the "68°" label | 67.94° (accurate) | **112.06° — obtuse, contradicting its label** |
| wedge carrying the "x°" label | 112.06° | **67.94° — acute; eyeballing gives 68 = choice B** |
| r ∥ s in the drawing | yes | **yes** (both still horizontal; the two marked angles are still drawn supplementary) |
| trap | complement/supplement confusion | **not-to-scale doubt** |

Only the angle *sizes* are off-scale — no given is contradicted, which is precisely what the mandated
"Note: Figure not drawn to scale." licenses. Choice B's dismissal was rewritten to name the mechanism
("the angle marked x° is drawn as an acute angle, but the figure isn't drawn to scale"). The verifier
recovers both intersection points from the line geometry, checks the drawn dots sit on them, proves by
a positive-combination test that each label lies **strictly inside its own wedge**, measures both drawn
wedges, and asserts the drawn pair sums to 180° while the labelled pair does not match the drawing.

### C1(b) — Q18 gets a standard special-triangle trap

`_trap` before: "not-to-scale doubt (figure-less verbal triangle; a careless sketch invites
eyeballing)" — uninstantiable without a figure. After: **"leg versus hypotenuse interchange"**, which
is what choice A (4√3) already was: EF, the shorter leg, used as the hypotenuse. Choice C's gloss was
rewritten from "the value a hastily drawn, roughly isosceles sketch suggests" to "assumed the two legs
are congruent, reading the triangle as a 45-45-90 triangle". The mathematics, options, key (D = 8√3)
and difficulty are untouched. Verifier now asserts the string "scale" appears nowhere in Q18.

Visual count is unchanged at 4 (Q7, Q8, Q10, Q14); hard geometry (Q18, Q20) remains figure-less.

---

## D. DIFFICULTY HONESTY

### D1 — Q17 (hard, nonlinear-functions) — one genuine structural step added

| | before | after |
|---|---|---|
| Stimulus | f(x) = 3x² − 24x + 41 | f(x) = **3x² − 30x + 92** |
| Ask | "For what value of x does f reach its minimum?" (the vertex x **is** the answer) | "What is the **minimum value** of f?" (the vertex x = 5 is only an intermediate) |
| Work | −b/2a, one step | locate the vertex, **then evaluate** — 3(x − 5)² + 17 |
| Key | 4 | **17** |
| Options | −7 / −4 / 4 / 8 | −75 / 5 / 17 / 92 |
| Trap | ordered-pair / x-vs-y reversal | **same family, now the primary bait**: choice B is 5, the x-coordinate |
| Key letter | C | **C (unchanged)** |

Distractor recipes: −75 = 3(5)² − 30(5) with the constant term dropped; 5 = the vertex's
x-coordinate; 92 = f(0). The verifier proves −75 and 5 lie **below the range of f** (so neither is a
value of f at all), that 92 = f(0) is a value but not the least one, and that 17 is the global minimum
over the reals, attained only at x = 5.

### D2 — Q19 (hard SPR, coefficient matching) — the condition now has to be earned

| | before | after |
|---|---|---|
| Equation | 12(3x − 8) = 36x − a + 219 — the x-terms match **by construction** | **7(ax + 15) = 3ax + 504x + a − 21** — the parameter is on **both** sides |
| Work | −96 = 219 − a (constants only) | coefficients: 7a = 3a + 504 ⇒ 4a = 504 ⇒ a = 126; constants: 105 = a − 21 ⇒ a = 126 — **both conditions bite and agree** |
| Answer | 315 | **126** (still a clean 3-digit integer; 9 legal entries) |
| Rationale | 97 words = 0.75× the H-SPR norm ("nothing to narrate") | 141 words = 1.08× |

The verifier solves the coefficient condition and the constant condition separately, shows each forces
a = 126, brute-forces every integer a in [−500, 500] (infinitely many solutions only at 126), and
proves no value of a produces the no-solution case, so the stem's condition is unambiguous.
126 was chosen partly to avoid a new internal echo: 112 (an earlier candidate) is Q8's key.

---

## E. HYGIENE

### E1 — alt-text policy corrected to DATA-COMPLETE on all four figures

| item | before | after |
|---|---|---|
| Q7 | "…The bars differ in height." (verifier: item unanswerable from the description) | "…is labeled from 0 to 30 in increments of 5. The bars for pools 1 through 5 have heights **18, 30, 12, 24, and 6** snails, respectively." |
| Q14 | no coordinates at all; "increments of 4"/"increments of 100" described label spacing as if it were gridline spacing | all **ten** plotted points listed, plus "gridlines every 2 units"/"every 50 units" and the fit line's drawn endpoints **(2, 50)** and **(23, 575)** |
| Q8 | factual but silent about the scale note | unchanged data (68°, x°, their positions) **+ the transversal's direction + "A note below the figure states that the figure is not drawn to scale."** — a screen-reader user must know the drawing is misleading |
| Q10 | already data-complete (three lattice points) | unchanged |

The verifier's old rule ("alt text must not state the key") was **replaced**, since it contradicted the
binding spec and both shipped forms and made three items unanswerable for screen-reader users. The new
rule is a per-figure datum manifest (every bar height, every plotted point, both fit-line endpoints,
every labelled measure, axis ranges and gridline increments) plus a ban on interpretive/answer-
announcing phrasing (`therefore`, `predicted`, `the equation of`, `greatest number of snails`, …).

### E2 — rationale trims (all-token ruler)

| item | before | after | norm |
|---|---|---|---|
| Q8 (E-MC) | 152 (1.38) | **146 (1.33)** | 110 |
| Q11 (M-MC) | 187 (1.39) | **174 (1.29)** | 135 |
| Q12 (M-SPR) | 138 (1.38) | **135 (1.35)** | 100 |
| Q14 (M-MC) | 191 (1.41) | **168 (1.24)** | 135 |
| Q17 (H-MC) | 236 (1.39) | **219 (1.29)** | 170 |

Only restatement was cut (repeated premises, doubled unit clauses); every derivation step and every
dismissal survives — Q8 still cites the parallel-lines theorem, Q11 still shows the inequality solved
line by line, Q14 keeps all three dismissals. Band means moved from the critic's measurements to
**E-MC 1.18 · M-MC 1.26 · H-MC 1.20** (critic: 1.22 / 1.32 / 1.25). The verifier's per-item ceiling was
tightened from 1.45× to **1.36×** and a new band-mean check enforces ≤ 1.30.

### E3 — SPR enumerator re-run

`modules-pt5/_spr_enum.py` (the project's canonical enumerator) was re-run over all six answers and
its output written verbatim; `verify_M3.py` re-derives the same sets independently and cross-checks
that no legal equivalent fraction is missing.

| Q5 | Q6 | Q12 | Q13 | Q19 | Q22 |
|---|---|---|---|---|---|
| 7 → 18 forms | **89 → 12 forms** | 12 → 12 forms | 7/3 → 15 forms | **126 → 9 forms** | −26/3 → 5 forms |

`126` → `126, 126/1, 252/2, 378/3, 504/4, 630/5, 756/6, 882/7, 126.0`;
`89` → `89, 89/1, 178/2, 267/3, 356/4, 445/5, 534/6, 623/7, 712/8, 801/9, 89.0, 89.00`.
All entries ≤ 5 characters (6 with a minus), canonical string first.

---

## Verifier output

```
$ python3 verify_M3.py
== Length rulers (instrument self-test) ==      == Q11 integer optimization under a TIME budget — EXHAUSTIVE …
== Module shell ==                              == Q12 SPR two-totals system ==
== Blueprint quotas ==                          == Q13 SPR literal rearrangement ==
== App format contract ==                       == Q14 line-of-best-fit prediction — re-measured from the SVG ==
== Rationale liturgy (spec section 7) ==        == Q15 exponential model selection — EXHAUSTIVE …
== SPR acceptedAnswers (complete enumeration) ==== Q16 perpendicular slope ==
== Q1 … Q10 ==                                  == Q17 minimum VALUE of a quadratic — EXHAUSTIVE over all real x ==
== Q3 aggregate per batch: divide then multiply ==== Q18 30-60-90 triangle, figure-less ==
== Q6 SPR evaluate an exponential function ==   == Q19 SPR infinitely many solutions — EXHAUSTIVE over all real a ==
== Q8 parallel lines and a transversal ==       == Q20 point on a circle recovers the general-form constant ==
                                                == Q21 / Q22 / SVG figures / Trap census / Originality firewall ==

ALL CHECKS PASSED — M3.json verified clean.        (813 PASS, 0 FAIL)
```

Exhaustive (not spot-check) proofs retained or added for every statement/range/optimization item:
Q4 (polynomial identity over all x), Q10 (all four equations against every plotted point), Q11 (every
integer count 0–200), Q15 (both model conditions symbolically for all t), Q17 (global minimum over the
reals), Q19 (every integer a in [−500, 500]), Q20 (each distractor shown to fail the point test),
Q21 (both intersection points). All-token word rulers for stems and rationales are unchanged and
self-tested at the top of the script.

## Post-fix conformance (all verifier-enforced)

| check | value |
|---|---|
| Domains | ALG 8 · ADV 7 · PSDA 3 · GEO 4 ✔ |
| Skills | 1var 2 · func 2 · 2var 2 · systems 1 · ineq 1 · NLF 4 · NLE 2 · EE 1 · ratios 1 · 1-var-data 1 · 2-var-data 1 · AV 1 · LAT 1 · RTT 1 · circles 1 ✔ |
| Difficulty | 9E / 7M / 6H, monotone with exactly one dip, at Q10 ✔ |
| SPR | 5, 6, 12, 13, 19, 22 = E/E/M/M/H/H; 4 integers (one 3-digit: 126), 2 lowest-terms fractions, the negative still at **Q22 (−26/3)** ✔ |
| **Key letters** | **A 4 (Q1, Q9, Q16, Q20) · B 4 (Q4, Q10, Q11, Q15) · C 4 (Q3, Q7, Q8, Q17) · D 4 (Q2, Q14, Q18, Q21)** ✔ |
| Visuals | 4 — bar (Q7), geometry (Q8), line (Q10), scatter (Q14); scale note on the geometry figure only ✔ |
| Traps | 17 items, 17 distinct mechanisms; trap-free slots exactly Q5/6/12/13/19 ✔ |
| Applied share | 7/22 — Q3, Q7, Q9, Q11, Q12, Q14, Q15 (unchanged) ✔ |
| Named people | Anika only (1 ≤ 2) ✔ · Latin binomial: *Littorina fuscopunctata* ×1 ✔ |
| Internal key echo | only the pre-existing 12 at Q9/Q12; the fix round added none ✔ |

## Corpus re-grep (all touched items)

1. **Key-equality test.** `review-pt6/pass3b_keys.py` re-run against the 809-record corpus: **zero
   hits** for the whole form (it previously fired once, on the old M3.Q03 key 2,520).
2. **Lexical n-gram** (n = 12→8, digit-blind and numerals-kept) for the eleven touched items against
   all three corpora: 146 maximal hits, **every one liturgy** —
   "in the xy plane the graph of the given equation is a circle" (Q20; the frame the gate itself
   classified as liturgy, and the ask/pipeline/options beneath it are all new),
   "the function f is defined by the given equation" (Q6, Q17; the highest-frequency CB frame),
   "the equation has infinitely many solutions what is the value of" (Q19),
   "a line of best fit is also shown" (Q14). No content-bearing overlap. **Q3 and Q11 produce zero
   hits at n ≥ 8 against any corpus.**
3. **Scenario nouns.** `warehouse`, `carton`, `bolt`, `kayak`, `tandem`, `preparation time` — **0
   occurrences** in the four question-bank exports, the four official practice-test extracts, and both
   shipped sister forms.
4. **Numerals.** 3,900 / 6,500 / 325 / 3,920 / 78,000 / 504 / 416 / 89 / 112-as-a-key — 0 hits.
   Four coincidences inspected and cleared: `136` appears once as an option in a bank
   Ratios/Medium item (different skill, answer letter D, no second shared numeral); `225` appears only
   in percentage/value contexts ("225%", "$225") and inside the fraction 4/225; `126` appears twice,
   both times as an option in unrelated practice-test items (an ∠S-measure item and an absolute-value
   equation); `696` appears only inside the decimal string ".696". None is a same-skill published
   answer, and none shares a second non-trivial numeral with a PT6 item — below the gate's own
   two-numeral threshold.
5. **PT4/PT5 archetype inventory.** circles: complete-square→radius (PT4 M4.20) and point-on-circle→
   coordinate (PT4 M3.21), arc length (PT5 M3.16), tangent ⊥ radius (PT5 M4.18) — the new Q20 matches
   none. Easy NLF SPR: evaluate a quadratic (PT4 M3.06), nesting (PT5 M4.06) — the new Q6 matches
   neither. Weight-cap inequality (PT4 M3.16, PT6 M4.13) — the new Q11 is a time budget.

## Residual notes (not in the fix mandate, flagged for the editor)

* The value **12** is the key at both Q9 and Q12 — a pre-existing soft echo the critic logged; neither
  item was in the fix list, so neither was touched.
* Q20's distractor 225 and Q11's derivation constant 225 (5 × 45 minutes) coincide. Neither is a key
  and neither is visible as the other's answer; left as is.
* The invented epithet in *Littorina fuscopunctata* remains house-consistent with PT4/PT5 (both audits
  noted it; neither charged it).
* M4 Q21 (area → arc length) is untouched and still owns the form's second circles slot; the new M3
  Q20 shares no step with it.
