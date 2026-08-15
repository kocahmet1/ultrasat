# Critic Report — Round 2 (post-fix re-audit) — PT6 Math Modules 3 & 4

### CB-authenticity critic + originality gate, re-run against `docs/CB_Math_Style_Spec.md` and `analysis/blueprint_pt6_math.md` (as corrected 2026-08-14)

**Method.** Every number below was recomputed from the live artefacts — `modules-pt6/M3.json`,
`M4.json`, `assets/*.svg` — never from `fix_M3_report.md`, `fix_M4_report.md`, the two selfchecks,
or the two `verify_*.py` scripts. Those five documents were read as *claims*; four of their claims
are falsified below and one is confirmed against evidence the fix agent could not have fabricated.
All 44 keys were re-solved independently (48 assertions, 0 mismatches). All six SVGs were re-parsed
and their pixel geometry mapped back to data coordinates through the tick-label text nodes only;
the M3-Q08 transversal was re-measured wedge by wedge with a positive-combination containment test
on both angle labels. The four originality scripts in `review-pt6/` were **re-run**, not rebuilt:
`build_corpus.py` (809 records: 400 bank + 321 practice-test windows + 88 sister-form items),
`pass1_lexical.py`, `pass1b_content.py`, `pass3_numeric.py`, `pass3b_keys.py`.

**Ruler note (important).** Stem and rationale lengths use the **all-token ruler** — every
whitespace-delimited token in `passage + text` after tag-stripping, numerals and operators
included. This is the ruler round 1 used, and it is validated here: it reproduces round 1's
published figures exactly (M3 Q14 = 53, M3 Q21 = 34, M3 Q22 = 35, M4 Q14 = 34). `verify_M3.py`'s
`STEMCAP` check uses a **text-only** ruler that silently drops the displayed equation; that is why
its Q20 reads "32/35" while the honest ruler reads 43/35. Where the two disagree, the honest ruler
governs, as it did in round 1.

---

## HEADLINE

> **Everything that was ordered landed.** The source-corpus violation is gone and provably gone
> (`pass3b_keys.py` fires **zero** times across all 44 items, down from one). All five cross-form
> repeats are re-archetyped against verified evidence. All 15 accepted-answer gaps are closed and
> the lists are now exhaustive on independent re-enumeration. Every countable blueprint row —
> domains, all 18 skill rows, difficulty, ramp, SPR census, visuals, key letters, applied share —
> is **exact for the first time in the series**. Mathematics: 44/44 keys, 96/96 distractors, zero
> errors.
>
> **What the fix round bought is not free.** It introduced three small new defects (one stem over
> cap, one duplicated trap mechanism across the form's only two right-triangle items, one new
> internal key echo), left one ordered cosmetic entirely untouched (M4 Q15 table-header italics),
> and pushed four alt texts past the spec's "1–2 sentences". And because the adjudicated list never
> reached them, the two habits that actually let a student recognise our house — **"value of *ab*"**
> and the **"two conditions on *f* fix *a* and *b*"** closer, both landing on the single item
> **M3 Q22** — are in their third consecutive form untouched.

---

## 1. FIX VERIFICATION — 26 ordered repairs

Grades are against **the specific repair that was ordered**, not against the fix agent's summary.

### 1.1 Source-corpus violation

| # | Item | Ordered repair | Verdict | Evidence recomputed |
|---|---|---|---|---|
| A1 | **M3 Q3** | Change the *shape of the given*, not the nouns: aggregate ÷ count × new count. No printing/paper scenario. Key ≠ 2,520 or any 42/420-derived value. Keep reciprocal-rate + additive distractors. Re-run `pass3b_keys.py`. | **LANDED** | Warehouse / 12 cartons / 3,900 bolts → 20 cartons. Pipeline is divide-then-multiply (3,900 ÷ 12 = 325, × 20 = 6,500) — re-solved. Key **6,500**; 2,520/420/42 appear nowhere in the module. Distractors preserved: A = 195 (3,900 ÷ 20, reciprocal), B = 3,920 (additive), D = 78,000 (step-skip). `pass3b_keys.py` re-run over the rebuilt 809-record corpus: **0 hits form-wide** (was 1, on this key). `pass1_lexical.py`: **M3.Q03 produces no hit at any n ≥ 8 against any corpus** — one of only 18 items in the form that are lexically silent. Scenario nouns `warehouse`/`carton`/`bolt`: 0 occurrences in all ten corpus files. Key letter C preserved. |

### 1.2 Cross-form repeats (5)

| # | Item | Ordered repair | Verdict | Evidence recomputed |
|---|---|---|---|---|
| B1 | **M3 Q20** | Re-archetype off PT4 M4.20's complete-the-square→radius. Change the *direction*; at minimum retire the r² distractor. | **LANDED** (with a new stem-cap breach — see §5) | `x² + y² + 10x − 16y = c`, point (4, 20) on the circle → *c*. Re-solved: 16 + 400 + 40 − 320 = **136** ✔. Distractors re-derived: B = 225 = *c* + 89 = r² (completing the square gives (x+5)² + (y−8)² = c + 89; independently, (4+5)² + (20−8)² = 81 + 144 = 225 = 15² — the point genuinely lies on the circle, a 9-12-15 triple); C = 416 (linear terms dropped); D = 696 (both linear signs flipped). Ascending ✔, key letter A preserved ✔. Runs **opposite** to PT4 M3.21 (which gives standard form + a partial point and asks for the missing coordinate) and shares no step with PT4 M4.20 or M4 Q21's area→arc. The r² value survives only as the named stopping point, which is the CB-signature wrong-target move (spec §0.4). |
| B1b | **M3 Q20 — the fix agent's rejection of two suggested alternatives** | (verify the claim that the bank ships them verbatim) | **CLAIM CONFIRMED — and I could not have guessed it** | `questionbank-export…(3).txt` line 6112 ships *"A circle in the xy-plane has a diameter with endpoints … and …. An equation of this circle is …, where k is a positive constant. What is the value of k?"* — Question ID `ebbf23ae`, **Hard**, `Correct Answer: 5`. The concentric variant ships **twice**: lines 6562 and 6728, *"Circle A in the xy-plane has the equation …. Circle B has the same center as circle A. The radius of circle B is two times the radius of circle A…"* with `Correct Answer: 100` and `Correct Answer: 16` — and once more in `sat-practice-test-6` line 440. The fix agent's stated answers (5, 100, 16) are exact. The concentric route would indeed have landed a key of **100**, a published answer. **This rejection was evidence-based, not a dodge.** |
| B2 | **M3 Q6** | Recast to an NLF-easy archetype the series has not used at Q6 (evaluate-a-radical, an *a·bˣ* read, or an inverse). | **LANDED** | `f(x) = 5(2)ˣ + 9`, f(4) = 5(16) + 9 = **89** ✔. This is the *a·bˣ* read the repair named. PT4 M3.06 = evaluate a quadratic; PT5 M4.06 = nesting f(g(11)); PT5 M3.04 = f(x) = 3(5)ˣ, f(2) — **note**: PT5 M3.04 is the same exponential-evaluate family at an *easy MC/SPR* slot. PT6's differentiator is the additive constant (5(2)ˣ **+ 9**), which PT5's bare 3(5)ˣ lacks; adequate but the family is now two-for-two. Side benefit confirmed: moving the input 6 → 4 kills one of the three "evaluate at 6" echoes (M3 Q2 and M4 Q4 remain). |
| B3 | **M3 Q11 / M4 Q13** | Re-roll **M4 Q13** to the other half of its cell — "at least" rather than "at most", *a budget in dollars rather than a weight*, or a compound range — and **keep M3 Q11 as is**. | **LANDED as ordered · PARTIAL in substance** | Both were changed, not one. M3 Q11 → a **time** budget (900 minutes; 5 singles × 45 = 225 fixed; 75t + 225 ≤ 900 → t ≤ 9 exactly, so the strict-vs-inclusive bait is real). M4 Q13 → a **volume** budget (34b + 74 ≤ 560 → b ≤ 14.29 → 14). The ordered repair ("a budget in *[units]* rather than a weight") was executed verbatim, no weight vocabulary survives in either, and the small-watercraft semantic collision is gone. **But the underlying algebra is still delivered twice**: both are `ax + c ≤ B → greatest integer x`, both in the form's only two linear-inequalities slots, both terminating in "What is the greatest number of …". The genuine differentiator is texture — Q11's boundary is *exact* (an inclusion decision), Q13's is *fractional* (a floor). Charged as a residual, not as a failure of the order. |
| B4 | **M4 Q18** | Keep the sufficiency meta-reasoning but move the direction; or ask which fact is **not** sufficient; or run it on a right-triangle pair where HL discriminates. | **LANDED — repaired past the order** | The fix agent abandoned sufficiency entirely for multi-triangle angle chaining: segments *WY* and *XZ* meet at *V*; ∠XWV = 47°, ∠WXV = 68°, ∠ZYV = 39° → ∠YZV. Re-solved: 180 − 47 − 68 = 65 (∠WVX), vertical ⇒ ∠YVZ = 65, 180 − 65 − 39 = **76** ✔. Distractors re-derived: A = 65 (the intersection angle, wrong target), B = 68 (assumed correspondence — genuinely false, since 47 ≠ 39 the triangles are *not* similar), D = 115 = 180 − 65 (∠ZYV omitted). Ascending ✔, key C, figure-less as the blueprint requires ✔. `sufficient/congruent/similar/perimeter` appear nowhere. Corpus: `pass1` max hit **n = 8**, "what is the measure in degrees of angle" — liturgy. "vertical angles" occurs only 2× in the 100-item geometry bank slice and 1× in ptest-6; the three bank items that open "…intersect at point P" all supply a **figure** and ask for a length or a tangent. No collision. **Bonus:** this recast supplies the second `answer-the-wrong-target` the blueprint's form-line demanded and round 1 scored as missing. |
| B5 | **M4 Q1** | Stop the third consecutive fee-plus-rate opener; make it a forward evaluation, a "how many" solve, or a two-tier fee. | **LANDED** | Priya's bookbindery: 640 cm of ribbon, 16 cm per book, 96 cm remain → `640 − 16n = 96` (n = 34). **Depletion, not accumulation** — structurally the opposite of PT4 M3.02 (`C = 4x + 30`) and PT5 M4.01 (`y = 3x + 4`), both of which I re-read from the shipped forms. The role-swap trap survives in options C/D (`16 − 640n`, `16 + 640n`), easy band and key letter A preserved. `fee/charge/costs/per hour/monthly/flat` are absent. `pass1`: **no hit at n ≥ 8 against any corpus**; `bookbind/ribbon/Priya` = 0 occurrences everywhere. *(The fee-plus-rate **family** still appears once in the form, at M4 Q10's interpretation item — see §6.)* |
| B6 | **M4 Q15** | Ask for a missing table value (the blueprint's own alternative), or give three points and ask which is not on the line. | **LANDED** | Three-row table (3, 25), (8, 50), (k, 85) → value of *k*. Re-solved: slope 5, intercept 10, 85 = 5k + 10 → **15** ✔. Options 8 / 15 / 17 / 19 numeric and ascending (was: four equations). Distractors re-derived: A = 8 (slope↔intercept interchange, y = 10x + 5), C = 17 (constant dropped), D = 19 (constant added). The interchange trap survives as ordered. **Table retained, so the visual quota is untouched** — confirmed independently, M4 still ships 4 visuals. The lead-in is CB's own: `grep` gives **"table gives three values" ×8** (7 in the bank, 1 in ptest-4) and **"table shows three values" ×5** (bank, ptest-4, ptest-6, ptest-7 ×2). The fix agent's "9× attested" claim is accurate to within the counting convention. PT5 M3.08's *four*-row / "which equation" shape is genuinely retired. |

### 1.3 Trap correction (2)

| # | Item | Ordered repair | Verdict | Evidence recomputed |
|---|---|---|---|---|
| C1a | **M3 Q8** | Ship a figure that is drawn misleadingly, carry the scale note, let the eyeball answer be a real option. (Round 1 assigned this to Q18; the fix round moved it to Q8.) | **LANDED — and verified from the SVG geometry, not from the report** | `PT6-M3-Q08.svg` re-parsed. Transversal (250, 40) → (156, 272); intersections recovered analytically at (229.74, 90) and (189.22, 190), drawn dots at (230, 90) and (189, 190) — on the lines to 0.26 px. **The wedge carrying the "68°" label measures 112.06°** (obtuse — contradicting its own label); **the wedge carrying "x°" measures 67.94°** (acute — so eyeballing yields 68 = choice B). Both labels proved **strictly inside their own wedges** by angular containment: the 68° label sits at −39.6° within the wedge spanning 0° to −112.06°; the x° label at +21.9° within 0° to +67.94°. The two drawn wedges sum to 180.00°, so *r ∥ s* and the same-side-interior relation are still honest in the drawing — only the angle *sizes* are off-scale, which is exactly what "Note: Figure not drawn to scale." licenses. Choice B's dismissal now names the mechanism. Distractors A = 22 (90 − 68) and D = 158 (180 − 22) re-derived and nameable. **This is the first genuine instantiation of the blueprint's headline new trap family in the series.** |
| C1b | **M3 Q18** | Give it an instantiable trap. | **LANDED with a new form-level side effect (§5)** | `_trap` is now "leg versus hypotenuse interchange"; the string `scale` appears nowhere in the item (verified). Choice C's gloss rewritten to "assumed the two legs are congruent, reading the triangle as a 45-45-90 triangle". Mathematics untouched and re-solved: 30-60-90, hypotenuse *DF* = 16 ⇒ shorter leg *EF* = 8, longer leg *DE* = **8√3** ✔; option set 4√3 < 8 < 8√2 < 8√3 ascends ✔. **Side effect:** leg↔hypotenuse is now the trap at *both* M3 Q18 and M4 Q11 — the form's only two right-triangles-trigonometry items. See §5. |

### 1.4 Difficulty honesty (2)

| # | Item | Ordered repair | Verdict | Evidence recomputed |
|---|---|---|---|---|
| D1 | **M3 Q17** | Ask for the minimum **value** *with a fractional vertex*, or give *f* factored and ask for the vertex, or hand over a(x−h)²+k and ask for a constant. | **PARTIAL — is it *now* genuinely hard? Marginally.** | `f(x) = 3x² − 30x + 92` → minimum **value**. Re-solved: 3(x − 5)² + 17, minimum **17** at x = 5 ✔; −75 and 5 both lie below the range of *f* (so neither is a value of *f* at all), 92 = f(0) is a value but not the least. The ordered *step* was added — the vertex x = 5 is now only an intermediate, and choice B = 5 is a real, well-baited wrong target. But **the fractional vertex the repair named was not taken**: the vertex is the integer 5 and −b/2a = 30/6 is frictionless. Three routine sub-steps, no structural insight. This is an honest bottom-of-hard item now rather than a mislabelled medium — an improvement, not a resolution. Stem 24/35 ✔; ask "What is the minimum value of" is CB-attested (2× in the bank), so the new wording is liturgy, not invention. |
| D2 | **M3 Q19** | Put the parameter where it has to be earned; make the student match a scaled coefficient before matching constants. | **LANDED** | `7(ax + 15) = 3ax + 504x + a − 21`. Re-solved both conditions independently: coefficients 7a = 3a + 504 ⇒ 4a = 504 ⇒ **a = 126**; constants 105 = a − 21 ⇒ **a = 126**. **Both bite and agree** — the *x*-terms no longer match by construction, so the scale relation must actually be spotted. Key 126 is a clean engineered 3-digit integer, exactly what the blueprint slot demands. Rationale is now 141 words = 1.08× the H-SPR norm (was 0.75×, round 1's tell that there was nothing to narrate). Accepted-answer list re-enumerated independently: 9 entries, complete, nothing over length. |

### 1.5 Blueprint domain correction (1)

| # | Item | Ordered repair | Verdict | Evidence recomputed |
|---|---|---|---|---|
| E1 | **M4 Q22** | Recast to nonlinear-equations to restore M4 = ALG 7 / ADV 7 and the form to ALG 15 / ADV 14. Close the `99/12` gap. Kill the M3 Q22 echo. | **LANDED — all three** | `4x² − 25x + c = 0`, one solution x = 3 → the other. Re-solved: 4(9) − 75 + c = 0 ⇒ c = 39; 4x² − 25x + 39 = (4x − 13)(x − 3), other root **13/4** ✔ (lowest terms, positive, 4 chars). `subcategoryId` 17 ✔. Domains recomputed from scratch below: the form now lands **ALG 15 / ADV 14 / PSDA 7 / GEO 8 exactly**, and all 18 skill rows are exact. The echo is genuinely dead — M3 Q22 is "two conditions fix two constants → a composite"; M4 Q22 is "one condition fixes one constant → recover a root". No function appears in M4's closer. |

### 1.6 Hygiene set

| # | Ordered repair | Verdict | Evidence recomputed |
|---|---|---|---|
| H1 | **Alt text data-complete everywhere** | **LANDED (with a spec tension, §5)** | Every figure datum re-measured from the SVG and checked against the description. M3 Q7: bars re-measure at 6 px/unit to **18 / 30 / 12 / 24 / 6** — the alt text states exactly those five. M3 Q14: all **ten** points recovered — (4,75) (6,125) (8,225) (10,300) (12,325) (14,350) (16,375) (18,400) (20,500) (22,575) — every one matches; fit-line endpoints (2, 50) and (23, 575) match; gridline pitches (2 units / 50 units) match. *(Independently: the drawn line **is** the exact least-squares line — slope Sxy/Sxx = 8250/330 = 25, passes the centroid (13, 325); at x = 18 it gives 450 = the key, while the plotted datum at 18 sits at 400 = distractor C. Best-engineered figure in the series, unchanged.)* M3 Q8: now discloses the transversal's direction **and** that the note is present — essential, since the drawing is deliberately misleading. M4 Q7: the false "tick marks at every 2 units" is gone; gridlines re-measure at 24 px = **1 unit**, labels at 2 units, x ∈ [−3, 5], y ∈ [−5, 6], and the Bézier `M 100 70 Q 172 502 244 70` reduces algebraically to **y = x² − 2x − 3** exactly, giving (−1,0), (3,0), (0,−3), vertex (1,−4) — all four as stated. M4 Q11: vertices, right angle at *T*, both legs, hypotenuse unlabelled, and √521 correctly withheld. **Both house rules reconciled to one**: data-complete. |
| H2 | **Newlines / markup cleaned** | **LANDED** | Independent sweep of all 176 text fields: **0** newlines/tabs anywhere (was 16 explanations with literal `\n\n`); **0** HTML tags in any `explanation` (M4 Q20's eleven `<sup>` runs are now Unicode `500(1.44)ᵗ⁄²`, matching PT5 M4.17's shipped `900(1.15)ᵐ⁄²⁰`); **0** tags, entities or Unicode-minus signs across all 128 option strings; **0** stray `<`/`>`. M4 Q19's four `&lt;` entities remain — **correct**, and house precedent: PT4 ships 8 such entities in explanations. |
| H3 | **M4 Q4 units phrase** | **LANDED** | "What is the total fare, **in dollars,** for a trip through 6 zones?" |
| H4 | **M4 Q11 stale label** | **LANDED** | `_distractorLogic.B` now reads "treating **RT** as the hypotenuse". Independent disjointness sweep of every field: M3's *DEF* set appears nowhere in M4; M4's *RST* and *WXYZV* sets appear nowhere in M3. |
| H5 | **SPR lists complete** | **LANDED — verified by independent re-enumeration, not by the shared script** | I re-enumerated the ≤5-character (6 with minus) grid for all 12 keys from scratch. **Zero missing fractions, zero illegal or over-length entries, in either module.** The 15 gaps round 1 found are closed: M4 Q5 17 → 12 forms, Q12 26.5 → 6, Q13 14 → 12, Q19 19 → 12, Q22 13/4 → 9; M3's six re-verified (Q5 → 18, Q6 → 12, Q12 → 12, Q13 → 15, Q19 → 9, Q22 → 5). Boundary cases confirmed correct: 105/45, 265/10, 104/32, 1008/8, 890/10 and 126.00 are all 6+ characters and rightly absent. Entry-forms note present on exactly the four non-integers ✔. |
| H6 | **Rationale trims** | **LANDED at item level; the systemic band regression is reduced, not closed** | Under the honest all-token ruler: **max 1.35** (M3 Q10, M3 Q12), min 0.71 (M3 Q13), overall mean **1.20**, MC mean **1.21** (round 1: 1.25). Band means M3 E/M/H-MC = **1.18 / 1.26 / 1.20** — matching the M3 report's claim exactly; M4 = **1.21 / 1.31 / 1.08**. But M3's M-MC still averages 170 words against PT5's 153, and M4's 176 against PT5's 159. Row 35 stays PARTIAL. |
| H7 | **M4 Q15 table headers italic** (`<th><i>x</i></th>`, round-1 FIX) | **NOT DONE** | `grep` of the live passage returns bare `<th …>x</th>` and `<th …>y</th>`. Neither fix report mentions it. PT5 M3.08 ships `<th><i>x</i></th>`. The only ordered repair that was simply skipped. |

**Fix tally: 22 LANDED · 2 PARTIAL (M3 Q17, M4 Q13-in-substance) · 1 NOT DONE (M4 Q15 italics) · 1 CLAIM independently confirmed (the circles rejection).**

### 1.7 Fix-report claims that are false or overstated

| Claim | Where | Status |
|---|---|---|
| "**112 is now the answer at both M3 Q8 and M3 Q19** — an M3-internal duplicate created by the parallel fix round." | `fix_M4_report.md`, "Two things for the form-level auditor" #1 | **FALSE.** M3 Q19's key is **126** (the M3 agent explicitly chose 126 over 112 to avoid exactly this). The M4 agent read `M3.json` at an intermediate state and did not re-read. There is no 112 duplicate. |
| "Q9 … **four propositions rewritten** for a mean." | `fix_M4_report.md` B2 | **OVERSTATED.** One proposition was swapped (all-equally-likely → individual-vs-mean); the other three are the same canonical misconceptions as PT4 M4.14, re-nouned. That is *defensible* — spec §4.8 names those four as a fixed menu and CB reuses them — but the substantive change is the estimate's **type** (percent → mean with units), not the proposition set. |
| "Traps: 17 items, **17 distinct mechanisms**" / "19 trapped, **19 distinct**" | both reports | **True within each module, misleading form-wide.** Leg↔hypotenuse now fires at M3 Q18 *and* M4 Q11. Neither report checks across modules. |
| "`verify_M3.py` … stem-length caps … ALL CHECKS PASSED" | `fix_M3_report.md` | **True only under the verifier's own text-only ruler.** Under the ruler round 1 used and validated, M3 Q20 is 43/35. |

---

## 2. FORM-LEVEL SCOREBOARD — independently recounted

Every row recomputed from the JSON; the round-1 verdict is shown for delta.

| # | Check | Target | Round 1 | **Round 2 (recounted)** | Verdict |
|---|---|---|---|---|---|
| 1 | Items / format | 22 = 16 MC + 6 SPR ×2 | PASS | 22 = 16 + 6, both | **PASS** |
| 2 | Module metadata | modNum 3/4 · Math · calc true · 2100 · desc "Module 1/2" | PASS | exact on both | **PASS** |
| 3 | **Domain quota, form** | ALG 15 / ADV 14 / PSDA 7 / GEO 8 | **FAIL** (16/13) | **ALG 15 · ADV 14 · PSDA 7 · GEO 8** | **PASS — CLOSED** |
| 4 | **Domain quota, per module** | M3 8/7/3/4 · M4 7/7/4/4 | **FAIL** (M4 8/6) | **M3 8/7/3/4 · M4 7/7/4/4** | **PASS — CLOSED** |
| 5 | **Skill quota, all 18 rows** | 1var 3 · lf 4 · le2v 3 · sys 3 · ineq 2 · NLF 7 · NLE 4 · EE 3 · rrp 2 · pct 1 · 1var-data 1 · 2var-data 1 · prob 1 · inf 1 · AV 2 · LAT 2 · RTT 2 · circ 2 · ESC 0 | **FAIL** (2 rows) | **all 18 rows exact, sum 44, ESC 0** | **PASS — CLOSED** |
| 6 | Probability in M4 only | yes | PASS | M4 Q8 only | **PASS** |
| 7 | Circles ≥ 1 per module | yes | PASS | M3 Q20 · M4 Q21 | **PASS** |
| 8 | evaluating-statistical-claims | 0 | PASS | 0 | **PASS** |
| 9 | Difficulty mix | 9E/7M/6H both | PASS | M3 9/7/6 · M4 9/7/6 | **PASS** |
| 10 | Ramp: monotone, exactly one dip, at 10 | yes | PASS | both `EEEEEEEEMEMMMMMMHHHHHH`; computed dip set = **[10]** each | **PASS** |
| 11 | SPR positions & difficulty | 5,6,12,13,19,22 = E,E,M,M,H,H | PASS | exact both | **PASS** |
| 12 | SPR census | 8 int (≥1 three-digit) · 3 frac (M3 Q22 the only negative) · 1 dec | PASS | **8 int** (7, 89, 12, 126 · 17, 588, 14, 19) with **126 and 588** three-digit · **3 frac** (7/3, −26/3, 13/4) all lowest terms · **1 dec** (26.5) · only negative = **M3 Q22 (−26/3)** · all ≤ 5 chars (6 w/ minus) | **PASS (exact)** |
| 13 | **acceptedAnswers completeness** | every legal entry | **FAIL** (15 missing) | **12/12 lists exhaustive on independent re-enumeration; 0 missing, 0 illegal, 0 over-length** | **PASS — CLOSED** |
| 14 | Entry-forms note | non-integers only | PASS | exactly M3 Q13, M3 Q22, M4 Q12, M4 Q22 | **PASS** |
| 15 | Visual quota & types | 4/module, listed types | PASS | M3 bar(7) · geom(8) · line(10) · scatter(14); M4 parabola(7) · two-way(8) · geom(11) · **data table(15, retained)**. 3 coordinate-plane graphs, 2 HTML tables, 2 geometry figures, 1 bar graph. Zero histograms/box plots | **PASS** |
| 16 | Scale note placement | geometry figures only | PASS | M3-Q08 and M4-Q11 only; no coordinate grid or bar graph carries it | **PASS** |
| 17 | Hard geometry figure-less | yes | PASS | M3 Q18, M3 Q20, M4 Q18, M4 Q21 all verbal | **PASS** |
| 18 | SVG conventions §8 | 380px · Georgia · arrowed axes · italic vars · italic *O* · #cccccc gridlines | PASS | all six re-parsed; all met; italic *O* on all three coordinate grids; no gridline gaps | **PASS** |
| 19 | Figure geometry re-measured | drawn values must match | PASS | bars 18/30/12/24/6 ✔ · **transversal now 112.06°/67.94°, deliberately mis-scaled** ✔ · line exactly y = −3x + 8 ✔ · scatter's drawn line **is** the least-squares fit (slope 25, centroid (13,325)) ✔ · Bézier reduces to y = x² − 2x − 3 exactly ✔ · right triangle exact at 8 px/unit ✔ | **PASS** |
| 20 | graphDescription factual & complete | factual | PASS w/ FIX | **all six factual and data-complete**; the M4 Q7 falsehood is gone; the two-rules problem is resolved. **New tension: 4 of 6 now run 3–5 sentences against §8's "1–2"** | **PASS w/ spec amendment needed** |
| 21 | Key-letter balance | 4/4/4/4 ±1 | PASS | M3 **4/4/4/4** (`ADCB--CCABB--DBACD-AD-`) · M4 **4/4/4/4** (`ABBD--CADBC--CBDDC-AA-`); longest run = 2 | **PASS** |
| 22 | Numeric options ascending | ~90%+ | PASS | **22/22 numeric sets strictly ascending**, incl. radicals (4√3 < 8 < 8√2 < 8√3), π (10π…120π), ordered pairs (M4 Q7 by x), and both new sets (8<15<17<19; 65<68<76<115) | **PASS** |
| 23 | Options plain text | no HTML/entities/LaTeX | PASS | 128 strings: 0 tags, 0 entities, 0 Unicode minus | **PASS** |
| 24 | Bare `<`/`>` escaped | all | PASS | 0 stray brackets in 176 fields; M4 Q19's `&lt;` correct and precedented | **PASS** |
| 25 | HTML tables §8 | bordered, centred, bold headers, two-way has both Totals | PASS w/ cosmetic FIX | M4 Q8 Totals re-sum (72+18=90, 48+62=110, 72+48=120, 18+62=80, 90+110=200) ✔. **M4 Q15 headers still bare `x`/`y`, not `<i>x</i>`** | **PASS w/ cosmetic FIX (unrepaired)** |
| 26 | **Explanation field format** | 0 tags, 0 newlines | **FAIL** | **0 newlines, 0 tags, both modules** | **PASS — CLOSED** |
| 27 | One trap per item, matching blueprint | 17 M3 + 19 M4 | PASS | one per item ✔, trap-free slots exactly the blueprint's blanks ✔. **But M3 Q8 and M3 Q18 no longer carry their blueprint-assigned mechanisms** (swapped: Q8 → not-to-scale, Q18 → leg↔hyp). Substantively better; the blueprint doc was not amended | **PASS w/ undocumented deviation** |
| 28 | Form trap tally | not-to-scale 1 · nesting 1 · unit-chain 1 · MoE 1 · solution-count 2 · **wrong-target 2** · slope/int 3 · reciprocal 1 · ordered-pair 2 · sign-slip 1 · radius/diam 1 · formula-frag 1 · exponent 2 · percent 1 | PASS (wrong-target 1) | every row delivered; **wrong-target now = 2** (M3 Q22, M4 Q18) — round 1's shortfall closed by the Q18 recast. slope/intercept = 4 (the blueprint's own form-line/slot-table inconsistency, unchanged) | **PASS — improved** |
| 29 | **New trap family "not-to-scale doubt" instantiated** | present and real | **FAIL (nominal)** | **Genuinely instantiated at M3 Q8**, proved from the SVG: labelled 68° drawn at 112.06°, x° drawn at 67.94°, eyeball answer = choice B, note present, no given contradicted | **PASS — CLOSED** |
| 30 | §5 residual families | robustness ~1 · must-be/could-be ~1 · extraneous/nonreal ~1 | **FAIL (2 of 3)** | robustness **0** · load-bearing must-be/could-be **0**, still **no CAPS negation anywhere in 44 items** · nonreal ✔ 1 (M4 Q19) | **FAIL — carried, not in the mandate** |
| 31 | Applied share | 14/44 ≈ 32% | PASS | **14/44 = 31.8%** — M3 Q3,7,9,11,12,14,15 · M4 Q1,3,4,8,9,10,13 | **PASS** |
| 32 | Applied by domain | PSDA ~85 · ALG ~40 · ADV ~20 · GEO ~10 | PASS w/ note | PSDA 6/7 = 86% ✔ · ALG 6/15 = 40% ✔ · GEO 1/8 = 13% ✔ · **ADV 1/14 = 7%** | **PASS w/ note (ADV thin, carried)** |
| 33 | **Stem length caps §2b** | equiv ≤15 · abstract ≤35 · applied ≤55 · stat ≤75 | PASS 44/44 | **43/44 inside cap. M3 Q20 = 43/35 (+23%)** — the only breach, and it is *new*. Tightest legit: M3 Q22 35/35, M3 Q11 54/55, M4 Q1 35/55, M4 Q14 34/35, M3 Q14 53/55, M4 Q9 70/75 | **FAIL (1 item) — REGRESSION** |
| 34 | Rationale liturgy §7 | openers · dismissal order · "Therefore," · SPR no dismissals | PASS | **44/44 exact.** 32/32 MC openers match their key letter; 96/96 dismissals in strict A→D order; 44/44 close on "Therefore,"; 0 straight apostrophes; 0 dismissals inside an SPR; 0 "you/we/let's"; 0 imperatives; 0 double questions | **PASS — no regression** |
| 35 | Rationale lengths | MC 110/135/170 · SPR 40/100/130 | PARTIAL | max **1.35**, mean **1.20**, MC mean **1.21** (was 1.25). Band means improved in 5 of 6 MC bands, but M-MC still runs ~+12% longer than PT5's | **PARTIAL — improved, not closed** |
| 36 | Voice fingerprint §2a | see spec | PASS w/ 1 FIX | the M4 Q4 unit miss is repaired; all 7 parameter items declare their constants; "closest to" at M4 Q11 | **PASS — CLOSED** |
| 37 | Mathematical airtightness | unique key, all distractors wrong & nameable | PASS | **44/44 keys re-solved independently, 0 mismatches. 96/96 distractors re-derived under a named recipe.** Zero arithmetic errors | **PASS** |
| 38 | Named people / Latin binomial | ≤2/module, new names; exactly 1 binomial | PASS w/ note | Anika (M3 Q12), Priya (M4 Q1) — 1 each, no Nadia/Mateo/Idris ✔; *Littorina fuscopunctata* ×1 italic, M3 Q7 ✔; M4 has 0 italic spans ✔. Epithet still invented | **PASS w/ note (carried)** |
| 39 | Context firewall vs PT4/PT5 | zero reuse | PASS | all PT6 contexts absent from both shipped forms; all new nouns (warehouse, carton, bolt, preparation time, bookbindery, ribbon, cider, barrel, tasting) return **0** in all ten corpus files | **PASS** |
| 40 | **Internal 44×44 collisions** | none | **FAIL** (M3 Q11 = M4 Q13) | **hard collision resolved** (time vs volume, disjoint vocabulary). Residual soft echoes: the identical `ax + c ≤ B → greatest integer` **pipeline** at M3 Q11 / M4 Q13; key **12** at M3 Q9, M3 Q12, M4 Q16; key **17** at M3 Q17 / M4 Q5 (**new**); leg↔hyp trap at M3 Q18 / M4 Q11 (**new**) | **PASS w/ residual echoes** |
| 41 | **Cross-form archetype differentiation** | different archetype wherever a skill repeats | **FAIL** (5 repeats) | **all five re-archetyped and verified against the shipped forms** (§1.2). No PT6 item now re-runs a PT4/PT5 item's slot + band + archetype + distractor rule | **PASS — CLOSED** |
| 42 | **Difficulty-label honesty** | hard band must earn it | **FAIL (M3)** | M3 Q19 now genuinely hard (parameter on both sides, two conditions). M3 Q18 improved but still a bare 30-60-90. **M3 Q17 improved but still bottom-of-band** (integer vertex). **M3 Q20 traded a heavy pipeline for a light one** — one substitution and arithmetic — defensible only as a structural wrong-target item. M4's six remain honest | **PARTIAL — 2 of 3 repaired** |

**Round-2 scoreboard: 34 PASS · 5 PASS-with-note/PARTIAL · 3 FAIL (rows 30, 33, and the unrepaired row-25 cosmetic).**
Round 1 was **30 PASS · 2 PARTIAL · 10 FAIL**. Seven FAILs closed; one new FAIL created (row 33).

---

## 3. ORIGINALITY RE-SCAN — all 44 items, all four passes re-run

Corpus rebuilt from source: **809 records** (A-bank 400 · A-ptest 321 · B-sister 88), identical to round 1.

| Pass | Round 1 | **Round 2 (re-run)** | Delta |
|---|---|---|---|
| **3b — key equality vs same-skill corpus answers** | **1 hit** (M3.Q03 key 2,520 = qb `3c8fdc40`) | **0 hits across all 44 items** | **VIOLATION CLEARED** |
| **1b — content-word n-grams (liturgy stripped, n ≥ 3)** | 37 content-bearing | **31**, longest n = 5 | improved |
| **1 — lexical n-gram (n = 12→8, two normalisations)** | 595 maximal | **592 maximal**; **18 of 44 items now produce no hit at any n ≥ 8** | improved |
| **3 — numeric multiset (≥2 shared non-trivial numerals)** | 88 overlaps, all noise | no same-skill numeric collision; 136 / 225 / 416 / 696 / 126 / 89 / 6,500 / 76 / 13/4 / 39 are **not** the published answer of any corpus item | clean |
| **4 — named entities** | 0 | 0 (Priya, Anika, *Littorina fuscopunctata*, and all nine new nouns: 0 hits) | clean |
| **figures** | 0 | 0 | clean |

### 3.1 Every surviving n-gram hit at n ≥ 10, classified

| Item | max n | Against | String | Class |
|---|---|---|---|---|
| M3.Q01 | 10 | PT4 M3.01 | "what is the solution to the given equation" | **liturgy** (spec §2a) |
| M3.Q06 | 10 | PT5 M3.19 | "the function f is defined by the given equation" | **liturgy** (§2a opener) |
| M3.Q09 | 10 | PT5 M3.06 | "in the shape of a right rectangular prism has a" | **liturgy** (solid boilerplate; 6 bank instances) |
| M3.Q10 | 12 | PT4 M3.08 | "the graph of a line in the xy plane is shown which" | **liturgy** — but the *whole item* (same ask, same easy tag, same 4-option rule) is thin against PT4 M3.08. Carried WATCH, not in the mandate |
| M3.Q14 | 12 | bank ×4, ptest ×8 | `# # # # # # # # # # # #` | **scan artefact — new.** The data-complete alt text now lists 10 coordinate pairs, so the digit-blind normaliser collapses 20+ consecutive numerals to `#`. Not a content hit. Flagged so the next gate does not chase it |
| M3.Q17 | 10 | PT5 M3.19 | "the function f is defined by the given equation" | **liturgy** |
| M3.Q19 | 11 | qb `ac472881` | "the equation has infinitely many solutions what is the value of" | **liturgy** (CB frame; the solve is now *harder* than CB's, not easier) |
| **M3.Q20** | **12** | **PT4 M4.20** + ptest-7 | "in the xy plane the graph of the given equation is a circle" | **liturgy** — the gate classified this frame as liturgy in round 1 and it is unchanged. **Note honestly:** PT6 M3.Q20 and PT4 M4.Q20 still open with the *identical sentence*. Everything beneath it (ask, pipeline, all four options, key) is new |
| M3.Q22 | 12 | **PT5 M3.19** | "by the given equation where a and b are constants if f" | **liturgy frame + real archetype echo** — see §4. Not in the mandate |
| M4.Q05 | 12 | PT4/PT5 ×3, ptest ×6 | "the solution to the given system of equations is (x, y)…" | **liturgy** (§2a canonical) |
| M4.Q07 | 12 | PT5 M4.15 / M4.04 | "is shown in the xy plane what are the coordinates of the" | **liturgy** |
| M4.Q08 | 11 | qb `0ae37ff3` | "is selected at random what is the probability of selecting a" | **liturgy** |
| M4.Q10 | 12 | ptest-6 | "the best interpretation of # in this context" | **liturgy — spec §2a mandates this exact wording** |
| M4.Q11 | 10 | qb `e6f2ace7` | "which of the following is closest to the length of" | **liturgy** |
| M4.Q14 | 12 | qb `371cbf6b`, PT4 M4.19, PT5 M4.22 | "x where a and b are constants what is the value of" | **liturgy** |
| **M4.Q15** | **11** | ptest-7 | "three values of x and their corresponding values of y where" | **liturgy — verified.** "table gives three values" ×8 and "table shows three values" ×5 across bank + ptest-4/6/7. The fix agent traded PT5's *house* four-row phrasing for CB's *own* three-row phrasing. Correct direction |
| M4.Q16 | 12 | qb `ff501705`, `b5f62071`, ptest-6 | "a constant if the system has no solution what is the value" | **liturgy** (CB ships it unchanged ×2) |
| M4.Q17 | 12 | **PT5 M4.17** | "f is defined by the given equation the function g is defined" | **liturgy frame + archetype streak** — third consecutive form with function-nesting at a hard slot. Not in the mandate |
| M4.Q19 | 12 | PT4 M4.17 | "in the given equation k is a constant the equation has" | **liturgy** |
| M4.Q20 | 11 | PT5 M3.19 | "the function f is defined by the given equation where" | **liturgy** |

**Rewritten items, lexical exposure:**

| Item | max n | Verdict |
|---|---|---|
| **M3.Q03** | **none ≥ 8** | CLEAN |
| **M3.Q08** | **none ≥ 8** | CLEAN |
| **M3.Q11** | **none ≥ 8** | CLEAN |
| **M4.Q01** | **none ≥ 8** | CLEAN |
| **M4.Q13** | **none ≥ 8** | CLEAN |
| **M4.Q22** | **none ≥ 8** | CLEAN |
| M3.Q06 | 10 | liturgy |
| M3.Q17 | 10 | liturgy |
| M3.Q18 | 8 | liturgy ("measure of angle e is # and the") |
| M3.Q19 | 11 | liturgy |
| M3.Q20 | 12 | liturgy (frame shared with our own PT4 M4.20) |
| M4.Q04 | none ≥ 8 | CLEAN |
| M4.Q09 | 9 | liturgy ("with an associated margin of error of # #"); content-word n = 5 vs PT4 M4.14 ("associated margin error appropriate conclusion") — the MoE frame, and the closest content overlap left in the form |
| M4.Q15 | 11 | liturgy (CB's own, verified) |
| M4.Q18 | 8 | liturgy |

### 3.2 New collisions introduced by the rewrites

**None against the source corpus or the sister forms.** Every rewritten item is either lexically
silent at n ≥ 8 or carries only spec-mandated liturgy, and none introduced a key that equals a
same-skill corpus item's published answer.

**Three new *internal* echoes were introduced:**

| # | Echo | Cause |
|---|---|---|
| N-1 | Key **17** is now the answer at **M3 Q17** and **M4 Q5** | M3 Q17's key moved 4 → 17 in the difficulty repair |
| N-2 | **leg↔hypotenuse** is now the trap at **M3 Q18** and **M4 Q11** — the form's only two RTT items | M3 Q18's trap was swapped off "not-to-scale doubt" |
| N-3 | M3 Q14's digit-blind n-gram signature is now a 12-token `#` run | data-complete alt text listing 10 coordinate pairs (scan artefact only) |

---

## 4. THREE-FORM DIFFERENTIATION VERDICT

**Verdict: the series is still producing distinct forms — the skeleton finally moved — but four
sentence-level and target-level habits now recur in all three forms, and one item carries two of
them at once.**

What the fix round genuinely bought. Round 1's core charge was that PT6's *skeleton* was PT4's:
five blueprint cells pointed straight back at the shipped forms. All five are gone, and I verified
each against the sister forms item by item rather than against the fix reports. Circles moved from
PT4's complete-square→radius to a point-substitution that recovers a general-form constant — the
opposite direction to PT4 M3.21 as well. The easy-NLF SPR moved off "evaluate a quadratic". The
similarity-sufficiency item became multi-triangle angle chaining, a mechanism the corpus shows only
with a figure and which PT6 runs verbally. The fee-plus-rate opener became a depletion model — the
first break in that streak in three forms. The four-row table became CB's own three-row
constant-in-a-cell form. And the form's advertised new trap family, which round 1 called "nominal
only", is now real and provable from pixel geometry.

**Habits that survive, with locations.**

| # | Habit | PT4 | PT5 | **PT6** | Status |
|---|---|---|---|---|---|
| **H-1** | **"What is the value of *ab*?"** as the ask | **M4 Q19** (6(3)⁴ˣ → a(b)ˣ, ab = 486) | **M4 Q22** (a(4x+6)+b(x−3) = 11x−6, ab = 15/2) | **M3 Q22** (ab = −26/3) | **THREE FORMS — unfixed.** Round 1 named it; it was never adjudicated |
| **H-2** | **"f(x) = ax² + bx(+c); two conditions on *f* fix *a* and *b*"** closer | **M4 Q22** (graph through two points) | **M3 Q19** (f(1) = 21, f(−1) = 9 → f(7)) | **M3 Q22** (f(3) = 7, f(6) = −11) | **THREE FORMS — unfixed.** n = 12 lexical overlap with PT5 M3.19 confirmed |
| **H-3** | **Exponential stated over a non-unit interval, rewritten** — always a hard M4 slot | **M4 Q19** (4x → x) | **M4 Q17** (3t → m/20) | **M4 Q20** (t/2 → t) | **THREE FORMS** — PT6 inverts the operation (root, not power); adequate but streaked |
| **H-4** | **Scatter sentence template**: "The scatterplot shows the [X], in [unit], and the [Y], in [unit], for each of **10** […]. **A line of best fit is also shown.**" | **M4 Q16** (10 used bicycles) | **M4 Q16** (10 lichens) | **M3 Q14** (10 wind turbines) | **THREE FORMS** — same count, same closing sentence. The phrase is CB-attested (3 corpus hits) so it is liturgy, but "each of 10" three times running is ours |
| **H-5** | **Function-notation nesting at a hard slot** | M3 Q19 | M4 Q17 (+ M4 Q06 easy) | M4 Q17 | THREE FORMS — blueprint-scheduled; note only |
| **H-6** | **"The table summarizes … the 200 […]"** two-way probability table, N = 200 | M4 Q09 (100 patrons) | **M4 Q10 (200 visitors)** | **M4 Q08 (200 seeds)** | TWO FORMS — same verb, same N, same band. Closest sister-form surface echo left in the untouched set |
| **H-7** | **Solution-count parameter hunts** | 2 (M3 Q22, M4 Q17) | 2 (M3 Q17, M3 Q20) | **3** (M3 Q19, M4 Q16, M4 Q19) | PT6 is the heaviest of the three. Not a repeat, but a texture the fix round deepened |
| H-8 | **Fee-plus-rate model** | M3 Q02 (equation) | M4 Q01 (equation) + M4 Q19 | **M4 Q10 (interpretation only)** | **REDUCED.** The opener is broken; the family appears once, in a form PT4/PT5 did not use |

**The single most recognisable item in the form is M3 Q22**, which sits at the intersection of H-1
and H-2: a student who has worked PT4 and PT5 meets both the *setup* and the *target* for the third
time, in one item. It was never on the adjudicated list, so no fix agent touched it. Round 1 named
it explicitly ("this is a three-form house habit… vary the *target*"). It is now the last
structural differentiation debt in the series.

**Bottom line.** After the rewrites, PT4 and PT5 and PT6 read as three genuinely different forms.
A student who has worked PT4 will not meet its circle item, its congruence item, its
quadratic-evaluation SPR, its fee-plus-rate opener or its table item again. What that student *will*
recognise is a voice: the "value of *ab*" closer, the ax²+b two-condition setup, the non-unit-interval
exponential, and the "each of 10 … A line of best fit is also shown" scatter. Those are house
habits, not repeats — but four of them recurring in three consecutive forms is exactly how a house
style becomes a fingerprint. **Fix the target at M3 Q22 and write H-1, H-3 and H-4 into the PT7
blueprint as prohibitions.**

---

## 5. REGRESSION CHECK & REMAINING FIX / REWRITE LIST

### 5.1 Everything that previously PASSED — re-verified

| Previously PASSED | Round 2 | Note |
|---|---|---|
| Rationale liturgy (44/44) | **HOLDS** | 32/32 openers, 96/96 dismissals in letter order, 44/44 "Therefore,", 0 straight apostrophes, 0 SPR dismissals |
| Numeric options ascending (22/22) | **HOLDS** | including both newly-built sets |
| Escaped brackets / options plain text | **HOLDS** | 0 stray brackets, 0 tags/entities/Unicode-minus in 128 options |
| Figure conventions (§8) | **HOLDS** | 380px, Georgia, italic variables, italic *O*, #cccccc gridlines, roman axis titles, no gridline gaps; scale note on the two geometry figures only |
| Figure geometry exactness | **HOLDS AND IMPROVES** | the scatter is still the true least-squares fit; the parabola's Bézier still reduces exactly; the new Q8 transversal is exact to 0.26 px on both intersections |
| Mathematical airtightness | **HOLDS** | 44/44 keys re-solved, 0 mismatches |
| Key-letter balance / ramp / SPR positions | **HOLDS** | all recomputed |
| Applied share 31.8% | **HOLDS** | |
| M4's six hard items honest | **HOLDS** | nesting, angle chaining, discriminant boundary, √1.44 rewrite, area→arc, two-condition root — all six re-solved and all six earn the band |
| **Stem caps 44/44** | **REGRESSED → 43/44** | M3 Q20 = 43/35 |
| **Trap distinctness form-wide** | **REGRESSED** | leg↔hyp now ×2 |
| §5 residual families (robustness, must/could) | **STILL FAILING** | carried, never in the mandate |

### 5.2 Remaining FIX list (5) — none requires re-authoring an item

| # | Item | Defect | Repair | Cost |
|---|---|---|---|---|
| **F-1** | **M3 Q20** | Stem 43 tokens against the 35-token abstract cap (+23%) — **new**, caused by the rewrite (the pre-fix text was 17 words). §2b: "Going long is the #1 tell of a fake item." | Move the constant declaration into the passage and tighten: `x² + y² + 10x − 16y = c, where c is a constant` in the passage, then "In the xy-plane, the graph of the given equation is a circle. If the point (4, 20) lies on this circle, what is the value of c?" → 24 + 11 = 35. No mathematics changes | 5 min |
| **F-2** | **M4 Q15** | Table headers `<th>x</th>` / `<th>y</th>` not italicised; PT5 M3.08 ships `<th><i>x</i></th>`. **The one ordered repair that was skipped** | Wrap both in `<i>` | 1 min |
| **F-3** | **M3 Q18** | leg↔hypotenuse duplicates M4 Q11's trap — the form's only two RTT items now share a mechanism. **New** | Re-pitch to `assumed-the-legs-are-congruent` (choice C, 8√2) as the primary bait and demote 4√3 to an ordinary adjacent-quantity dismissal. Options, key and mathematics unchanged | 10 min |
| **F-4** | **§8 alt-text length** | Four of six graphDescriptions now run 3–5 sentences against §8's "1–2 factual sentences" (M3 Q14 = 5 sentences / 99 words) | **Amend the spec**, not the items — data-completeness is required by the app's own QC prompt and by screen-reader answerability, and withholding the data made three items unanswerable. Change §8 to "factual and data-complete; as many sentences as the figure's data require" | doc edit |
| **F-5** | **Blueprint doc** | M3 Q8 and M3 Q18 no longer carry their blueprint-assigned traps (swapped). The change is an improvement; the binding doc still records the old assignment | Amend `blueprint_pt6_math.md` rows M3 Q8 and M3 Q18 so the artefact and the binding doc agree | doc edit |

### 5.3 Recommended (not blocking PT6, binding on PT7)

| # | Item | Finding | Recommendation |
|---|---|---|---|
| **R-1** | **M3 Q22** | Carries habits H-1 *and* H-2 — third consecutive form for both | Change the **target** only: ask for `a − b`, `b − a`, `f(0)` or the vertex. Key and accepted-answer list must be re-enumerated, so this is not costless. **Binding on PT7 regardless: no fourth "value of *ab*".** |
| **R-2** | M3 Q11 / M4 Q13 | Same `ax + c ≤ B → greatest integer` pipeline in the form's two inequality slots | PT7: schedule one lower-bound ("at least") or compound-range inequality |
| **R-3** | Form | robustness = 0, load-bearing must-be/could-be = 0, no CAPS negation in 44 items | PT7 blueprint must schedule one of each; PT6 delivered fewer §5 exotica than PT5 |
| **R-4** | M3 Q20 / M3 Q17 | Both sit at the bottom of the hard band | PT7: give one M3 hard item a fractional vertex or a two-completion pipeline |
| **R-5** | Form | ADV applied share 1/14 = 7% vs §2c's ~20% | PT7: schedule one applied Advanced-Math item |
| **R-6** | M3 Q7 | *Littorina fuscopunctata* — real genus, invented epithet (as PT4, PT5) | Decide the house rule once and write it down |

**REWRITE list: empty.** No item is mathematically wrong, ambiguous, unscorable, or reproduces a
source item.

---

## 6. WOULD IT PASS AS BLUEBOOK? — verdict

**PUBLISH — conditional on F-1, F-2 and F-3, which together are about fifteen minutes of work and
touch no mathematics.**

Round 1 said HOLD, narrowly, and listed four conditions: fix M4 Q22, close the fifteen
accepted-answer gaps, re-roll M4 Q13 off M3 Q11, and re-pitch M3 Q17/Q18/Q19. All four are done,
and I verified each without trusting a single sentence of the fix reports — the domain and skill
tables were recounted from the JSON, the twelve accepted-answer grids were re-enumerated from
scratch, the corpus was rebuilt from source and `pass3b_keys.py` re-run to zero hits, and the
misdrawn transversal was measured wedge by wedge out of the SVG. This is now the first form in the
series where **every countable blueprint row is exact**: ALG 15 / ADV 14 / PSDA 7 / GEO 8, all
eighteen skill rows, 9E/7M/6H twice, one dip at position 10 twice, the SPR census to the item, 4/4/4/4
twice, 14/44 applied. The mathematics remains the best thing about it — 44 keys re-solved, 96
distractors re-derived, zero errors, and three figures (the least-squares scatter, the exact Bézier
parabola, the newly mis-scaled transversal) that are better engineered than anything in PT4 or PT5.

What the round did not close is smaller but real. It created one new stem-cap breach at M3 Q20, it
duplicated a trap mechanism across the form's only two right-triangle items, it skipped one ordered
cosmetic outright, and one fix report told the auditor a fact about M3 Q19's key that is simply
false. None of that is visible to a student. What *is* visible to a student who has worked PT4 and
PT5 is M3 Q22 — "value of *ab*" for the third consecutive form, on the ax²+b two-condition setup for
the third consecutive form. That item was never on the adjudicated list and nobody touched it, which
is the same structural finding this series has now produced three times running: **the blueprint is
not being checked against the shipped forms before the writers execute it.** Fix that process and
PT7 will not need a round 2.

*Re-audited 2026-08-14. Every judgement recomputed from the JSON, the SVG geometry, the rebuilt
809-record corpus and the two shipped sister forms. Fix-report, selfcheck and verifier claims were
treated as claims; four are falsified above and one — the circles rejection — is confirmed against
bank evidence the fix agent could not have invented.*
