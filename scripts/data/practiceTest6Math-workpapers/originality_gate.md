# PT6 ORIGINALITY GATE — collision detection report

**Material under test:** `outputs/modules-pt6/M3.json`, `outputs/modules-pt6/M4.json` (44 items), `outputs/modules-pt6/assets/*.svg` (6 figures)
**Gate scope:** collision detection only. Nothing was edited. Verdicts are advisory to the critic/rewrite stage.
**Date of run:** 2026-08-14

---

## 1. METHOD

### 1.1 Corpora assembled

| Tag | Source | Items | Fidelity |
|---|---|---|---|
| `A-bank` | `outputs/extracted/questionbank-export-2026-8-14*.txt` (4 files, one per domain) | **400** parsed items with Question ID, Domain, Skill, Difficulty, stem, correct answer, full rationale | Prose intact; **math expressions stripped by the PDF text layer** (see 1.4) |
| `A-ptest` | `outputs/extracted/sat-practice-test-{4,5,6,7}-digital*.txt` | **321** 3-paragraph sliding windows (layout is two-column OCR-scrambled; item segmentation is not reliable, so windowed) | Prose + **numerals intact**; column interleaving |
| `B-sister` | `ultrasat/scripts/data/practiceTest4Math.json`, `practiceTest5Math.json` | **88** items (2 modules × 22 × 2 forms), stem + passage + options + full explanation | Full fidelity |

Built by `review-pt6/build_corpus.py` → `review-pt6/corpus.json` (809 records).
Item splitting for the bank exports required `re.split(r'[\n\x0c]+Question ID:[ \t]*', ...)` — the naive `\n`-anchored split silently returns 1 item/file because each record is preceded by a form feed. (This was a real bug in the first run; flagging it for whoever reuses the script.)

### 1.2 Pass 1 — Lexical n-gram (`pass1_lexical.py`, `pass1b_content.py`)

Two normalisations, n = 12 → 8, maximal-n retained per (PT6 item × corpus item):

* `digitblind` — punctuation stripped, every numeral collapsed to `#` (catches template reuse with re-skinned numbers).
* `withnum` — punctuation stripped, numerals preserved.

Fields compared on the PT6 side: `passage + text + graphDescription + options`. Corpus side: `text + rationale`.
**595 maximal hits.** Full dump: `review-pt6/pass1_hits.json`.

Because ~95% of those hits are stem-frame boilerplate, a second lexical run (`pass1b_content.py`) strips a hand-built 130-token SAT-liturgy stoplist plus all bare numerals and re-runs n = 5 → 3 on the residual **content words only**. That reduced 595 hits to **37 content-bearing overlaps**, which is the list actually worth reading. Every one of those 37 was hand-adjudicated.

### 1.3 Pass 2 — Scenario / structural

Each PT6 item was characterised on 7 axes — `{skill, difficulty, stimulus type, scenario noun phrase, asked quantity, solution pipeline, option architecture}` — and the corpus was queried by archetype rather than by wording, via `review-pt6/find.py <regex> <limit> <chars>`. Queries actually run (verbatim):

```
arc.{0,40}(intercepted|central angle)|central angle.{0,60}arc
sufficient to prove
prove that (the )?triangles? .{0,40}congruent|similar to triangle .{0,80}congruent
area of (a |the )?circle is
margin of error
has no solution
no real solutions?
perpendicular to line|slope of line .{0,30}perpendicular
parallel.{0,60}intersected by|transversal
30\D{0,3}60\D{0,3}90|special right triangle
at most .{0,60}(pounds|weight)|maximum total weight
greatest number of .{0,40}(can|that)
one-time fee|per day|each additional day|rent
total cost .{0,40}rent
best interpretation of
constant rate of|at this rate, how many
1 ton = 2,000|2,000 pounds|pounds per
line of best fit
bar graph|frequency table|dot plot
decreases by|depreciat|each year.{0,40}value
which function|which of the following functions.{0,60}model
equivalent to the given equation
g\(x\) = f\(
difference of squares|which expression is equivalent to
system of equations.{0,120}(x, y).{0,60}(positive|negative)
reach(es)? its (minimum|maximum)
laundromat|wash load / tram|fare / quarry / kayak / aquarium / tide pool|snail /
wind turbine|power output / floor sander|sander / seed librar|germinat /
observatory|volunteer / rowing|rower / print shop|sheets of paper / tray
```

Every archetype the brief named as high-risk was queried explicitly: circles/tangent, arc length, similarity-sufficiency, margin of error, perpendicular slope, volume ladder, no-solution parameter, discriminant boundary, two-way-table probability.

### 1.4 Pass 3 — Numeric

`pass3_numeric.py` extracts the number multiset from each PT6 item (passage + stem + options + key + accepted answers + figure description) and intersects it with each corpus item's multiset, suppressing trivia `{0–10, 12, 100, 180, 360}` and requiring ≥ 2 shared non-trivial numerals, with a same-skill flag.
`pass3b_keys.py` runs the sharper test the brief asked for: **does a PT6 key value equal the published correct answer of a same-skill corpus item?** Across all 44 items this fired exactly **once** (M3.Q03 — see the violation dossier).

> **Corpus limitation, stated plainly.** In the `A-bank` exports the equations, table cells and answer choices are rendered as glyph runs that the PDF text layer drops: 330/400 stems and 299/400 rationales contain **zero** digits. Numeric comparison against corpus A is therefore only partially sound, and "no numeric collision found in corpus A" is weaker evidence than it looks. Mitigations used: (a) the `A-ptest` and `B-sister` corpora retain numerals fully and were compared without caveat; (b) for the two highest-stakes bank comparisons the rendered page PNGs in `outputs/pdf_pages/qb/` were read directly — `geo2-070.png` recovered the full stimulus of Question ID `76c73dbf` (see M3.Q20 dossier). Page images exist for only 49 of ~420 bank pages, so this is not scalable; if this gate is repeated, re-extract the bank PDFs with a math-aware extractor first.

### 1.5 Pass 4 — Named entities

Direct regex sweep of both corpora for every proper noun, binomial and non-stock unit introduced by PT6.

| PT6 entity | Item | In corpus A? | In PT4/PT5? |
|---|---|---|---|
| **Priya** | M4.Q01 | no | no (PT4/PT5 use Nadia, Mateo, Idris) |
| **Anika** | M3.Q12 | no | no |
| *Littorina fuscopunctata* | M3.Q07 | no (neither genus nor epithet) | no (PT4 = *Porzana lutescens*; PT5 = *Rhizocarpon nivalescens*) |
| tide pool, kayak livery, print shop, laundromat, floor sander, seed library, quarry, city tram, aquarium tank, observatory, rowing club | various | **all zero hits** | zero hits |
| unit "sheets per hour", "kilowatts" (turbine power), "wash load", "zone" (tram fare), "tandem kayak" | various | zero hits | zero hits |

Only proper noun in the corpora that PT6 could have collided with is **Isabel** (bank `1087f6c4`) — unused. **Pass 4: clean.** One caution: the genus *Littorina* is a real, extremely common intertidal snail genus, and *fuscopunctata* is not a real *Littorina* species; that is the same "plausible-but-invented binomial" convention PT4/PT5 used, so it is house-consistent, but if the house rule is *fully* invented genera it is a deviation.

### 1.6 Figure assets

All six SVGs were text-extracted. Labels are: `PT6-M3-Q07` bar graph (tide pools 1–5, snail counts), `PT6-M3-Q08` (single 68° label + "Note: Figure not drawn to scale."), `PT6-M3-Q10` (bare axis ticks), `PT6-M3-Q14` (wind speed / power output scatter), `PT6-M4-Q07` (bare axis ticks), `PT6-M4-Q11` (legs 11 and 20, "Note: Figure not drawn to scale."). No figure caption, label set or annotation string matches any corpus figure description. "Note: Figure not drawn to scale." is CB liturgy. **Figures: clean.**

---

## 2. VERDICT TABLE — all 44 items

Legend: **LITURGY** in the similarity-basis column marks the portion of the match that is spec-mandated boilerplate and therefore *not* evidence.
Corpus IDs: `qb:<id>` = College Board question-bank Question ID; `PT4M1#n` / `PT5M2#n` = sister form, module, item; `ptest-N` = official SAT practice test N.

| # | Verdict | Closest corpus match | Similarity basis |
|---|---|---|---|
| M3.Q01 | CLEAN | PT4M1#1, PT5M1#5; qb:`baca4a4c` | Stem "What is the solution to the given equation?" = **LITURGY**. Constants, distractor logic unrelated. |
| M3.Q02 | CLEAN | qb:`3d1070c9`, `7fac16fb`, `361f97c7`, `447fa970` | "The function f is defined by … What is the value of f(6)?" = **LITURGY** (4 near-identical CB frames). No numeric or scenario overlap. |
| M3.Q03 | **VIOLATION** | qb:`fe4c1c9e` (Ratios/rates, Easy) + qb:`3c8fdc40` (Ratios/rates, Easy) | Slot-for-slot stem-template reproduction of `fe4c1c9e`; scenario domain of `3c8fdc40`; **key 2,520 = `3c8fdc40`'s published answer**. Dossier V-1. |
| M3.Q04 | CLEAN | qb:`a05bd3a4` | Both factor a difference of squares; CB's is monic (x²−25), PT6's carries a leading 49. Only shared surface is "Which expression is equivalent to" = **LITURGY**. |
| M3.Q05 | CLEAN | qb:`ee846db7`, `4edecdba`; PT4M2#10 | Corpus instances are all applied (bowls/pennies/yogurt); PT6 is deliberately abstract. No numeric overlap. |
| M3.Q06 | CLEAN | PT5M1#19, PT4M2#19 | "The function f is defined by the given equation. What is the value of f(6)?" = **LITURGY**. |
| M3.Q07 | CLEAN | qb:`15d87c0f`, `fe6a49d6`, `80f1f3a9`, `29fa7970` | Same skill (read a bar graph) but all four CB instances ask a category count; PT6 asks the maximum. Scenario and species unique. |
| M3.Q08 | WATCH | qb:`5207e508`, `c24e1bda` (both Easy) | Same figure schema (two parallel lines + transversal, one angle labelled, solve for x), same difficulty, same supplementary/corresponding pipeline. Dossier W-08. |
| M3.Q09 | WATCH | qb:`3b931fb0` (Area/volume, Medium) | Inverse-volume ladder: V and base given → height. Same ask sentence shape, same difficulty. Dossier W-09. |
| M3.Q10 | WATCH | PT4M1#8 (Easy) | Identical ask (line graphed → which equation) and identical 4-option generation rule (± slope, ± intercept, swap). Dossier W-10. |
| M3.Q11 | WATCH-HIGH | qb:`f224df07` (Linear inequalities, Medium) | Carrier + two item weights + weight cap → max count of the heavier item. Dossier W-11. |
| M3.Q12 | WATCH-HIGH | qb:`71189542` (Systems, Medium) | Two-totals container problem, solve for one container type. Dossier W-12. |
| M3.Q13 | WATCH | PT5M2#15; qb:`4e18fc5d` | Opening clause "The given equation relates the positive numbers x, y, and z" is CB stock (**LITURGY**) and was already used in PT5. PT6 adds a numeric evaluation step. Dossier W-13. |
| M3.Q14 | WATCH | qb:`ac5b6558` (Two-variable data, Easy) | Line-of-best-fit prediction at a stated input; same observed-vs-predicted trap. Dossier W-14. |
| M3.Q15 | CLEAN | qb:`3cf2698e`, `e53add44`; PT4M2#14 | Exponential model-selection is canonical but no corpus item pairs a stated % *decrease* with a "which function" ask. Scenario unique. |
| M3.Q16 | WATCH | qb:`5b8a8475` (Easy), `002dba45`, `01682aa5`, `00723d16`, `db422e7f` | Perpendicular-slope stem is **LITURGY** (5 CB instances in a 100-item slice). PT6 matches the *Easy* variant (already slope-intercept) but is tagged medium. Dossier W-16. |
| M3.Q17 | WATCH-HIGH | qb:`8e1da169` (Hard), qb:`841ef26c` (Hard), ptest-4 M1 | 12-word verbatim stem; same skill, same difficulty, same vertex pipeline. Stem is **LITURGY** (3 corpus instances). Dossier W-17. |
| M3.Q18 | CLEAN | qb:`4c95c7d4`, `f389569d` | Corpus 30-60-90 items are all embedded in equilateral-triangle area/perimeter contexts; PT6's is a bare verbal triangle. No collision. |
| M3.Q19 | WATCH | qb:`ac472881` (Hard, key 403); PT5M1#17 | "…has infinitely many solutions, what is the value of a?" = **LITURGY**. Dossier W-19. |
| M3.Q20 | **WATCH-TOP** | PT4M2#20 (Hard); qb:`76c73dbf` (Hard) | Complete-the-square radius. Identical to PT4M2#20 on skill, difficulty, stimulus type, ask **and distractor-generation rule**; only constants differ. Dossier W-20. |
| M3.Q21 | CLEAN | ptest-5 (frame only) | "One solution to the given system of equations is (x, y)…" = **LITURGY**. No linear-quadratic system item in either corpus matches the givens or the pipeline. |
| M3.Q22 | WATCH | PT5M1#19; PT4M2#19, PT5M2#22 | Two function-value conditions → solve for both constants; "value of ab" target is now a 3-form house habit. Dossier W-22. |
| M4.Q01 | WATCH | qb:`520c8177` (Easy), qb:`3dffe9d2` (Easy) | Fixed purchase + n units = stated total, equation-selection form. Dossier W-M4-01. |
| M4.Q02 | CLEAN | PT4M2#8; qb:`072…` family | "Which expression is equivalent to" = **LITURGY**. Polynomial and trap arithmetic unrelated. |
| M4.Q03 | WATCH | PT5M1#3 (Easy); ptest-6 (yards/inches item) | Two-hop unit conversion with the factor supplied in parentheses; same one-hop/reversed-hop trap. Also shares the noun "crushed stone"+"tons" with qb:`1087f6c4` — different skill and pipeline, noun coincidence only. Dossier W-M4-03. |
| M4.Q04 | CLEAN | qb:`88e13c8c`, `3a3b95df` | Applied linear evaluate-at-a-point; entirely stock frame, unique scenario and constants. |
| M4.Q05 | CLEAN | PT4M1#7, PT5M1#7, PT5M2#12, ptest-4/5/6/7 | "The solution to the given system of equations is (x, y). What is the value of y?" = **LITURGY** (highest-frequency frame in the whole corpus). Coefficients unique. |
| M4.Q06 | WATCH | qb:`93f48423` (Easy); clause from qb:`beca03de` | Rectangle area preceded by one scale step; PT6's opening clause inverts CB's "A rectangle has a length that is k times its width". Dossier W-M4-06. |
| M4.Q07 | WATCH | PT4M2#4, PT5M1#15 | Read a named point off a shown parabola with the ordered-pair-reversal trap. Dossier W-M4-07. |
| M4.Q08 | WATCH-HIGH | qb:`b1b5300b` (Medium); PT5M2#10, PT4M2#9 | 2×2 table with margins → joint probability, wrong-denominator trap; PT5M2#10 also uses grand total 200. Dossier W-M4-08. |
| M4.Q09 | **WATCH-TOP** | PT4M1#14 (Medium); qb:`2c76bcce`, `f8f79e11`, `85939da5` | Margin-of-error conclusion; PT6's four options are the **same four propositions** as PT4M1#14, reordered. Dossier W-M4-09. |
| M4.Q10 | WATCH | qb:`be9cb6a2` (Hard), qb:`6863c7ce` (Easy) | "Which of the following is the best interpretation of 25 in this context?" = **LITURGY**. Equipment-rental scenario overlaps qb:`be9cb6a2` (backhoe). Dossier W-M4-10. |
| M4.Q11 | WATCH-HIGH | qb:`e6f2ace7` (Right triangles, Easy) | "Which of the following is closest to the length of …" + right-triangle figure + Pythagorean pipeline. Dossier W-M4-11. |
| M4.Q12 | WATCH | PT4M2#20 (Hard); qb:`4aaa9c42`, `993000da` | Chain two percentage relations, report a combined percent. Dossier W-M4-12. |
| M4.Q13 | WATCH | qb:`c50ede6d` (Easy), qb:`f224df07`; **and PT6 M3.Q11** | Fixed overhead + per-unit ≤ cap → greatest integer count. Dossier W-M4-13 (includes the internal-duplication finding). |
| M4.Q14 | WATCH-HIGH | qb:`371cbf6b` (Equivalent expressions, Hard); PT5M2#22 | Binomial-product identity true for all x, solve for a coefficient by matching. Dossier W-M4-14. |
| M4.Q15 | **WATCH-TOP** | PT5M1#8 (Medium); qb:`d4572f55` | Table of four (x, y) pairs → which equation, with the slope/intercept-interchange distractor. Dossier W-M4-15. |
| M4.Q16 | WATCH-HIGH | qb:`ff501705` (Hard), qb:`b5f62071` (Hard); PT4M2#22 | "In the given system of equations, k is a constant. If the system has no solution, what is the value of k?" = **LITURGY**, but the whole item is the archetype. Dossier W-M4-16. |
| M4.Q17 | WATCH | PT4M1#19 (Hard); PT5M1#6, PT5M2#17 | g defined by f at a transformed input, then evaluate. Dossier W-M4-17. |
| M4.Q18 | WATCH | qb:`1dc7e423` (Hard), qb:`f7dbde16` (Hard), qb:`ecc98c87` | Sufficiency-of-criteria menu for triangles; PT6 *inverts* the direction. Dossier W-M4-18. |
| M4.Q19 | WATCH-HIGH | qb:`46308566` (Hard, key 16); PT4M2#17; ptest-4 M2 | Discriminant < 0 → integer bound on a parameter. Dossier W-M4-19. |
| M4.Q20 | WATCH | PT4M2#19 (Hard); PT5M2#17 (Hard) | Rewrite an exponential stated per non-unit interval to expose the per-year factor. Dossier W-M4-20. |
| M4.Q21 | WATCH | PT5M1#16 (Medium); qb:`c8345903` (Hard) | Arc-length proportionality; PT6 runs it in the opposite direction and prepends an area→radius step. Dossier W-M4-21. |
| M4.Q22 | WATCH | PT5M1#19 (Hard); qb:`1480dd5c` (Medium) | Two conditions determine a and b, then evaluate at a new input. Dossier W-M4-22. |

**Counts: CLEAN 12 · WATCH 31 · VIOLATION 1.**

---

## 3. VIOLATION DOSSIER

### V-1 — M3.Q03 (easy, ratios-rates-proportions)

**Corpus matches:** `outputs/extracted/questionbank-export-2026-8-14 (2).txt` — **Question ID `fe4c1c9e`** (Problem-Solving and Data Analysis / Ratios, rates, proportional relationships, and units / **Easy**) and **Question ID `3c8fdc40`** (same skill, same difficulty).

**Structural comparison**

| Axis | PT6 M3.Q03 | CB `fe4c1c9e` | CB `3c8fdc40` |
|---|---|---|---|
| Skill | ratios-rates-proportions | Ratios, rates, proportional relationships, and units | same |
| Difficulty | easy | Easy | Easy |
| Stimulus type | bare applied sentence, no figure | bare applied sentence, no figure | bare applied sentence, no figure |
| Scenario noun phrase | *a press at a print shop*, producing *sheets of paper* | *a mechanical device in a workshop*, producing *items* | *a printer*, producing *posters* |
| Rate clause | "…at a constant rate of 420 sheets per hour" | "…at a constant rate of N items per hour" | "…at a constant rate of 42 posters per minute" |
| Asked quantity | total output in 6 hours | total output in M hours | output rate per hour |
| Pipeline | rate × time (one multiplication) | rate × time (one multiplication) | rate × 60 (one multiplication) |
| Option architecture | MC, reciprocal-rate trap + additive trap + ×10 trap | SPR (key 180) | SPR (**key 2,520**) |
| **Key** | **2,520** | 180 | **2,520** |

**Why this is a violation and not liturgy.** The stem *frame* ("produces X at a constant rate of N per hour. At this rate, how many X…in M hours?") occurs 3× in the corpus and is, on its own, liturgy. What is not liturgy is the conjunction of three independent coincidences:

1. **Template**: every content slot of `fe4c1c9e` is filled with a synonym — machine→press, workplace→print shop, generic units→sheets of paper — with the ask sentence preserved intact. The contiguous literal run is only 7 words ("per hour. At this rate, how many"), i.e. **below the n = 8 lexical floor**. This is precisely the profile of the PT5 failure, which scored 9 words.
2. **Scenario domain**: PT6 lands on a *printing device producing paper output* — which is `3c8fdc40`'s scenario, not `fe4c1c9e`'s generic one.
3. **Key**: PT6's answer is **2,520**, which is the published correct answer of `3c8fdc40`, and PT6's given (420/hour) is exactly 10× `3c8fdc40`'s given (42/minute). Across all 44 PT6 items this is the **only** case where a PT6 key equals a same-skill corpus item's published answer (`pass3b_keys.py`, single hit).

Any one of these alone would be a WATCH. Together they mean a student who has drilled the public question bank meets a printing device, a constant rate, and the number 2,520 for the second time.

**Recommended repair (preserves blueprint: ratios-rates-proportions, easy, trap = reciprocal rate).**
Keep the skill, the difficulty and the reciprocal-rate trap; change the *shape of the given*, not just the nouns. Rather than a per-hour rate multiplied by hours, give an aggregate and a count and ask for a different aggregate — e.g. a scenario in which a stated quantity per *batch/bundle/tray* is scaled to a different number of batches, so the pipeline becomes divide-then-multiply rather than a single multiply. Constraints for the rewrite: (a) do not use a printing/paper scenario; (b) do not let the key be 2,520 or any 42/420-derived value; (c) keep the reciprocal-rate distractor (given ÷ count) and the additive distractor (given + count) so the trap column of the blueprint is unchanged; (d) re-run `pass3b_keys.py` after the rewrite to confirm the new key does not collide.

---

## 4. WATCH DOSSIERS

Tiered by risk. WATCH-TOP and WATCH-HIGH get the full 7-axis comparison; the remainder get a compact structural diff, since the whole point of the WATCH tier is that these are legitimate archetype reuse and the critic needs a fast freshness read, not 31 essays.

### W-20 — M3.Q20 (hard, circles) — **TOP PRIORITY**

| Axis | PT6 M3.Q20 | **PT4 M2#20** (shipped) | CB qb:`76c73dbf` |
|---|---|---|---|
| Skill / difficulty | circles / hard | circles / hard | Circles / Hard |
| Stimulus | bare general-form circle equation | bare general-form circle equation | bare general-form circle equation |
| Ask | radius | radius | length of the circle's radius |
| Pipeline | complete the square on both variables | complete the square on both variables | complete the square on both variables |
| Coefficients | both even, integer RHS | both even, integer RHS | **unit coefficients, fractional RHS** (recovered from `pdf_pages/qb/geo2-070.png`) |
| Response type | MC | MC | SPR |
| Option architecture | {key r, RHS-echo, 2r, r²} | {√RHS, key r, 2r, r²} | n/a |
| Key | 8 | 6 | 10 |

**Read:** the CB item is meaningfully differentiated (half-integer completion, SPR). The problem is **PT4M2#20**: same skill, same difficulty, same stimulus type, same ask, same pipeline, and *the same distractor-generation rule* (report 2r, report r², echo a stem constant). Only the constants moved. Two consecutive shipped forms carrying the identical template is the freshest-looking freshness liability in PT6.
**For the critic:** if the blueprint slot must stay "circles, hard, complete-the-square", change the *direction* — give the standard-form equation and ask for a general-form coefficient, or give the centre and a point on the circle, or ask for the diameter so the 2r distractor stops being the reflex error. If that is not permissible, at minimum retire the r² distractor, which is the shared fingerprint.

### W-M4-09 — M4.Q09 (medium, inference-statistics) — **TOP PRIORITY**

| Axis | PT6 M4.Q09 | **PT4 M1#14** (shipped) | CB qb:`2c76bcce` / `f8f79e11` |
|---|---|---|---|
| Skill / difficulty | inference-statistics / medium | inference-statistics / medium | Inference from sample statistics / Easy, Medium |
| Stimulus | random sample, point estimate as a **percent**, MoE in percentage points | random sample, point estimate as a **percent**, MoE in percentage points | mean weight / mean distance (a *mean*, not a percent) |
| Scenario | 625 observatory volunteers, training attendance | 1,100 city residents, bus-route support | handbags; park visitors' hiking distance |
| Ask | "most appropriate conclusion about all volunteers" | "most appropriate conclusion based on the estimate and margin of error" | "most plausible / best conclusion" |
| Pipeline | estimate ± MoE → plausible interval | identical | identical |
| Option architecture | **four propositions: (i) exactly p%, (ii) cannot be outside the interval, (iii) every value in the interval equally likely, (iv) likely inside the interval [key]** | **the same four propositions**, ordered (iv)(ii)(i)(iii) | CB uses the same misconception family but the bank slice does not show all four in one menu |
| Key position | D | A | A / D |

**Read:** the option menu is not merely the same *family* — it is the same four sentences with the nouns swapped and the order permuted. The distractor set for this archetype is genuinely small (there are only about four canonical misconceptions), so this is defensible, but two consecutive forms with a bit-for-bit identical menu reads as a template fill.
**For the critic:** the cheapest freshening is to change the estimate's *type* — CB's own bank items attach MoE to a **mean** (`2c76bcce`, `f8f79e11`, `3e1bd4e2`), not a percent, and one of them asks for the MoE itself given the interval. A mean-based version keeps the skill, the difficulty and the misconception-menu trap while breaking the identity with PT4.
*(Noted but not a collision: the sample size 625 is chosen so 1/√625 = 0.04 matches the 4-point margin. That is a nice internal touch and is not a corpus signal.)*

### W-M4-15 — M4.Q15 (medium, linear-equations-two-variables) — **TOP PRIORITY**

| Axis | PT6 M4.Q15 | **PT5 M1#8** (shipped) | CB qb:`d4572f55` |
|---|---|---|---|
| Skill / difficulty | linear-equations-two-variables / medium | linear-functions / medium | Linear functions / Hard |
| Stimulus | table, **four** (x, y) pairs | table, **four** (x, f(x)) pairs | table, **three** (x, y) pairs, one entry a constant |
| Ask | which equation represents this relationship | which equation defines f | which equation represents this relationship |
| Pipeline | slope from two rows → back-solve intercept | identical | identical + solve for the constant |
| Option architecture | {swap, key, wrong intercept, wrong slope} incl. an explicit slope↔intercept interchange | {key, wrong slope sign, wrong slope, **slope↔intercept interchange**} | not recoverable (math stripped) |
| Key | y = 7x − 5 | f(x) = −(3/2)x + 22 | n/a |

**Read:** PT5 shipped the four-row table with the slope/intercept-interchange distractor one form ago; the 12-gram "the table shows four values of x and their corresponding values of" is a literal carry-over from PT5 (it is house phrasing, not CB liturgy — CB's own version says "three values"). Skill tag differs (two-variables vs functions) but the student experience is identical.
**For the critic:** CB's bank version (`d4572f55`) uses **three** rows and hides a constant in one cell, which is why it is Hard. Moving to three rows, or to a table of two points plus a stated translation (cf. qb:`9bbce683`), preserves the slope/intercept trap while breaking the PT5 echo.

### W-11 — M3.Q11 (medium, linear-inequalities) — HIGH

| Axis | PT6 M3.Q11 | CB qb:`f224df07` (Medium) |
|---|---|---|
| Scenario | kayak livery loads 5 single (45 lb) + n tandem (75 lb) kayaks on a trailer, cap 900 lb | cargo helicopter carries 100-lb and 120-lb packages, cap 1,100 lb |
| Constraint count | **one** (weight cap; the light-item count is fixed at 5) | **two** (weight cap **and** at least 10 packages) |
| Ask | greatest number of tandem kayaks | maximum number of 120-lb packages |
| Pipeline | (cap − fixed load) ÷ heavy weight, floor | simultaneous integer optimisation over two inequalities |
| Options | 8, 9, 12, 20 (boundary trap at 9; the cap is met **exactly**) | 2, 4, 5, 6 |

**Read:** same scenario schema (carrier + two item weights + weight cap + max count of the heavier item) and same option family, but CB's is a genuinely two-constraint optimisation and PT6's is a single division. The pipelines are different enough to survive; the *scenario schema* is the exposed surface. Worth noting that PT6's cap is hit exactly at n = 9, which makes the "strict vs inclusive boundary" trap real rather than decorative — that is a point in the item's favour.

### W-12 — M3.Q12 (medium, systems-linear-equations) — HIGH

| Axis | PT6 M3.Q12 | CB qb:`71189542` (Medium) |
|---|---|---|
| Scenario | 352 rolls arranged on 26 trays; small trays hold 8, large hold 20 | 202 campers in 60 tents; some hold 2, the rest hold 4 |
| Given structure | total items + total containers + two capacities | total people + total tents + two capacities + "filled to capacity" |
| Ask | how many trays were large | exactly how many tents were 2-person tents |
| Pipeline | x + y = containers; ax + by = items; solve one variable | identical |
| Response | SPR (key 12) | MC (30, 20, 19, 18; key 19) |

**Read:** the two-totals mixture problem is one of the most-reused CB system archetypes (PT4M1#9 is a third instance, in "which system represents" form). PT6's framing is independent at the noun level and the response type differs. Acceptable, but three shipped forms in a row containing a two-totals container problem is worth a look.

### W-17 — M3.Q17 (hard, nonlinear-functions) — HIGH

| Axis | PT6 M3.Q17 | CB qb:`8e1da169` (Hard) | CB ptest-4 M1 |
|---|---|---|---|
| Stem | "The function f is defined by the given equation. For what value of x does f reach its minimum?" | **word-for-word identical** | "…For what value of x does f(x) reach its minimum?" |
| Stimulus form | **standard form**, 3x² − 24x + 41 | a form requiring rewriting first (its distractors are the two x-intercepts, implying factored form) | **factored form**, f(x) = (x − 10)(x + 13) |
| Pipeline | −b/2a directly | expand/complete square, then −b/2a | midpoint of the roots |
| Distractors | {minimum *value* (y of vertex), sign error, key, −b/a} | {x-intercept, key, x-intercept, y of vertex} | roots and their negatives |

**Read:** the 12-word stem match is real but the phrase occurs **3×** in the corpus, so it is a CB stem-frame — **LITURGY**, not a fingerprint. The stimulus form genuinely differs (standard vs factored/expandable), which changes the solve route and therefore the distractor pool. The shared distractor "the y-coordinate of the vertex" is the single most natural wrong answer for this archetype. Verdict stands at WATCH, but this is the item whose *stem* is closest to verbatim in the whole form, so the critic should confirm the standard-form stimulus is a deliberate differentiator and not a coincidence.

### W-M4-08 — M4.Q08 (easy, probability) — HIGH

| Axis | PT6 M4.Q08 | CB qb:`b1b5300b` (Medium) | PT5 M2#10 (shipped) |
|---|---|---|---|
| Stimulus | 2×2 table + row/col/grand totals, N = **200** | 2×2 table + totals, N = 14 | 2×2 table + totals, N = **200** |
| Categories | seed type × germinated | car type × price band | ticket type × membership |
| Ask | **joint**: a bean seed that germinated | **joint**: a hybrid priced ≤ $25,000 | **conditional**: member, given adult ticket |
| Denominator | grand total | grand total | row total |
| Trap | row/column total used as denominator | same | same |
| Key | 9/25 | 1/7 | 3/10 |

**Read:** pipeline identical to the CB bank item; direction (joint) differs from the sister form, which is good. Two soft signals: PT5M2#10 also uses grand total 200, and two of PT6's four options (9/25, 3/5) are also options in PT4M2#9. Small-fraction option sets overlap by chance easily, so this is noted, not charged.

### W-M4-11 — M4.Q11 (medium, right-triangles-trigonometry) — HIGH

| Axis | PT6 M4.Q11 | CB qb:`e6f2ace7` (**Easy**) |
|---|---|---|
| Stimulus | labelled right-triangle figure, right angle at T, legs 20 and 11 | labelled right-triangle figure, both legs shown |
| Ask | "Which of the following is closest to the length of RS?" | "Which of the following is closest to the length of the triangle's hypotenuse?" |
| Pipeline | a² + b² = c², take the root, round | identical |
| Options | 9.0, 16.7, 22.8, 31.0 — {difference of legs, leg-hypotenuse interchange, key, sum of legs} | four decimals, CB's rationale declines to explain them |
| Difficulty | medium | Easy |

**Read:** the "closest to the length of" frame plus a two-leg figure is the CB Easy archetype; PT6 is tagged medium on the strength of the interchange distractor. Good news on Pass 3: PT6 uses 20/11 → √521, deliberately **not** a Pythagorean triple, so it avoids the 3-4-5 / 5-12-13 / 7-24-25 / 8-15-17 constant pipelines that saturate the corpus (PT5M2#11 uses 7-24-25). That is the single best originality decision in the geometry set. The residual concern is only that the difficulty tag may be optimistic for what CB calls Easy.

### W-M4-14 — M4.Q14 (medium, equivalent-expressions) — HIGH

| Axis | PT6 M4.Q14 | CB qb:`371cbf6b` (**Hard**) | PT5 M2#22 (shipped, Hard) |
|---|---|---|---|
| Stimulus | (3x + a)(x − 5) = 3x² + bx − 20 | a binomial product = a quadratic, "true for all x, where a and b are constants" | a(4x + 6) + b(x − 3) = 11x − 6 |
| Ask | value of **b** | value of **ab** | value of **ab** |
| Pipeline | expand, match the constant term to get a, then match the x-coefficient | expand, match coefficients | distribute, match coefficients |
| Trap | coefficient matching / "must be true for all x" | same | same |

**Read:** the CB item is the same stimulus shape at Hard; PT6 sits at medium and asks for a single coefficient rather than the product, which is the right de-escalation. The 12-gram "x where a and b are constants what is the value of" is **LITURGY**. Note the house habit: "value of ab" is the ask in PT4M2#19, PT5M2#22 and PT6 M3.Q22.

### W-M4-16 — M4.Q16 (medium, systems-linear-equations) — HIGH

| Axis | PT6 M4.Q16 | CB qb:`ff501705`, `b5f62071` (both Hard) | PT4 M2#22 (shipped, hard) |
|---|---|---|---|
| Stem | "In the given system of equations, k is a constant. If the system has no solution, what is the value of k?" | **word-for-word identical** (×2) | near-identical |
| Pipeline | proportional coefficients, non-proportional constants | identical | identical |
| Response | MC (−12, 4/3, 4, 12) | SPR (6; −28) | SPR (−12/5) |
| Difficulty | medium | Hard | hard |
| Key | 12 | 6; −28 | −12/5 |

**Read:** the stem is **LITURGY** — CB ships this sentence unchanged across at least two bank items and PT4 already reused it. PT6 differentiates by dropping to MC and choosing constants (kx + 15y = 24 vs 4x + 5y = 6) where the constants are *deliberately* non-proportional so the distinctness condition bites. Acceptable; flagged because "no-solution parameter" is now in three consecutive forms.

### W-M4-19 — M4.Q19 (hard, nonlinear-equations) — HIGH

| Axis | PT6 M4.Q19 | CB qb:`46308566` (Hard) | PT4 M2#17 (shipped, hard) | CB ptest-4 M2 |
|---|---|---|---|---|
| Stimulus | 4x² + kx + 25 = 0 — parameter in the **linear** coefficient | quadratic requiring rearrangement first | 2x² + 8x + k = 0 — parameter in the **constant** term | −x² + bx − 676 = 0 — parameter in the **linear** coefficient |
| Condition | no real solutions | no real solutions | no real solutions | no real solution |
| Ask | **greatest** possible integer k | **largest** possible value | **least** possible integer k | **greatest** possible b |
| Inequality in the parameter | quadratic (k² < 400) | quadratic (after rearranging) | linear (64 − 8k < 0) | quadratic (b² < 2,704) |
| Key | 19 (boundary at 20) | 16 | 9 | 51 |

**Read:** the closest structural twin is not the sister form but **ptest-4 M2** — same parameter slot, same "greatest integer" ask, same quadratic-in-the-parameter inequality; only the coefficients differ (4/25 vs −1/−676). PT4M2#17 is the easier constant-term variant, so PT6 is *not* a repeat of our own form. Still the highest-canonicity item in M4: discriminant-boundary is a named high-risk archetype and PT6 lands on the exact CB variant. The stem sentence is **LITURGY**.

### Remaining WATCH items (compact)

* **W-08 — M3.Q08.** vs qb:`5207e508` / `c24e1bda` (Easy): identical figure schema (r ∥ s, transversal t, one angle labelled, solve for x), identical supplementary/corresponding pipeline, identical difficulty. CB ships six near-clones of this in a 100-item geometry slice, so it is the archetype's canonical form. PT6's 68° → 112° and the complement/supplement distractor pair (22, 158) are independently chosen. Fine; note only.
* **W-09 — M3.Q09.** vs qb:`3b931fb0` (Medium): CB gives a **cylinder** with the base *area* stated → one division. PT6 gives a **rectangular prism** with base *length and width* → two divisions, which is what creates the "divided by one dimension only" distractor (180 = 4,320/24). Genuine extra step; the shared surface is the ask sentence "What is the height, in [unit], of the [solid]?" Fine.
* **W-10 — M3.Q10.** vs PT4M1#8: same ask, same easy tag, same 4-option generation rule (two sign variants of the slope + a slope/intercept swap). PT6's swap option is y = 8x − 3. Differentiator is thin — only the numbers. Second-tier freshness concern behind M3.Q20.
* **W-13 — M3.Q13.** Opening clause matches CB stock ("The given equation relates the … positive numbers x, y, and z", qb:`4e18fc5d`) and matches PT5M2#15 almost exactly. PT6 differentiates by asking for a *numeric* value (7/3) rather than a symbolic rearrangement. Acceptable; the clause is liturgy.
* **W-14 — M3.Q14.** vs qb:`ac5b6558` (Easy): identical ask ("what [quantity] is predicted by the line of best fit for a [x] of N") and identical observed-vs-predicted trap. Scenario (wind speed → power output, 10 turbines) is unrelated to CB's (elevation → temperature, 8 Lake Tahoe locations) and appears nowhere in either corpus. Fine.
* **W-16 — M3.Q16.** Stem is CB's most-repeated Algebra frame (5 bank instances). PT6 supplies the equation already in slope-intercept form, which is the **Easy** CB variant (`5b8a8475`); the four Medium/Hard CB variants all require rearranging to y = mx + b first. If the blueprint wants medium, consider giving the line in standard form so the item earns its tag; as written the only medium-ness is the negative-reciprocal trap.
* **W-19 — M3.Q19.** vs qb:`ac472881` (Hard): CB's has **two** constants and asks for a ratio (key 403); PT6 has one constant and a direct constant-matching solve (key 315). PT5M1#17 is the systems analogue. Frame is liturgy; the solve is a full step simpler than CB's. Fine, but "infinitely many solutions" is now in PT5 and PT6.
* **W-22 — M3.Q22.** vs PT5M1#19: PT5 = ax² + bx + 12 with f(1) and f(−1) → f(7); PT6 = ax² + b with f(3) and f(6) → ab. Same two-conditions-solve-for-constants pipeline, same hard tag, same SPR. Combined with the "ab" ask shared with PT4M2#19 and PT5M2#22, this is a three-form house habit. Suggest the critic vary the *target* (a − b, f of a new input, or the vertex) rather than the setup.
* **W-M4-01 — M4.Q01.** vs qb:`520c8177` and `3dffe9d2` (both Easy): fixed charge + n units = stated total. CB's versions ask for the unit cost; PT6 asks which equation models it, which is the lighter task appropriate to an easy slot. Scenario (laundromat card + wash loads) is corpus-absent. Also note **internal**: M4.Q01 and M4.Q10 are both "one-time fee + per-unit rate" scenarios inside the same module.
* **W-M4-03 — M4.Q03.** vs PT5M1#3: both are two-hop conversions with the factor supplied in parentheses and both trap on applying one hop or reversing it. The parenthetical "(1 ton = 2,000 pounds)" is CB liturgy (ptest-6 uses "(1 yard = 36 inches)"). Separately, the nouns "tons" + "crushed stone" co-occur with qb:`1087f6c4`, but that item is a two-variable cost equation about a garden order — different domain, skill and pipeline. Noun coincidence only; not charged.
* **W-M4-06 — M4.Q06.** vs qb:`93f48423` (Easy, area from stated length and width): PT6 prepends one scale step (length = 3 × width). PT6's opening clause is a mirror of qb:`beca03de`'s "A rectangle has a length that is k times its width", but `beca03de` is an Advanced Math function-interpretation item — clause coincidence only.
* **W-M4-07 — M4.Q07.** vs PT4M2#4 and PT5M1#15: all three read a named point off a shown parabola and all three deploy the ordered-pair-reversal distractor. PT6 asks for the **y-intercept**, PT4/PT5 asked for the **vertex**, so the read differs. Third consecutive form with a "coordinates off a parabola" item; note only.
* **W-M4-10 — M4.Q10.** Stem is liturgy. Scenario is an equipment rental (floor sander, per-day + one-time fee), which is the same rental family as qb:`be9cb6a2` (backhoe, first day + each additional day) — but that item asks which equation, and its cost structure (first day priced differently) is not PT6's. The four-option interpretation menu is the stock CB menu.
* **W-M4-12 — M4.Q12.** vs PT4M2#20 (x is 250% of y, y is 50% of z): both chain two percentage relations to a combined percent, both hard-ish. PT6's chain is multiplicative *growth* (1.15 × 1.10 → 26.5) and traps on additivity (25); PT4's is a "percent of" chain. Related but not the same misconception. Fine.
* **W-M4-13 — M4.Q13.** vs qb:`c50ede6d` (Easy): CB asks which inequality represents a fixed-fee-plus-hourly cap; PT6 asks for the greatest integer under a weight cap. Different asks. **The real finding is internal**: M4.Q13 and M3.Q11 are the same pipeline in one form — (cap − fixed load) ÷ per-unit, floor to an integer, once as MC and once as SPR. Two weight-cap optimisations in a 44-item form is a blueprint-level redundancy the critic should weigh even though it is not a corpus collision.
* **W-M4-17 — M4.Q17.** vs PT4M1#19: PT4 = g(x) = f(x − 2), asks g(f(3)); PT6 = g(x) = f(3x + 2), asks g(4). PT6's inner map has a multiplier, so the trap is a genuine notation-nesting error rather than a shift. PT5 shipped two composition items (M1#6, M2#17). Third consecutive form with function-nesting at the hard slot; note only.
* **W-M4-18 — M4.Q18.** vs qb:`1dc7e423`, `f7dbde16` (both Hard, "which additional piece of information is sufficient to prove that triangle … is **similar** to triangle …"): PT6 **inverts** the direction — the triangles are *given* similar and the student must find what upgrades similarity to **congruence**. Corpus contains no item running that direction. This is the best-differentiated item among the named high-risk archetypes; the shared surface is only the phrase "sufficient to prove". Keep.
* **W-M4-20 — M4.Q20.** vs PT4M2#19 (6(3)^{4x} → a(b)^x, value of ab) and PT5M2#17 (900(1.15)^{3t} with m = 60t): all three rewrite an exponential stated over a non-unit interval. PT6's twist — recognising 1.44 = 1.2² to go from t/2 to t — is a *root* rather than a *power*, i.e. the opposite operation to PT4's. Adequate differentiation; note the three-form streak.
* **W-M4-21 — M4.Q21.** vs PT5M1#16 (central angle 45° intercepts an arc of length 18π → radius): PT6 runs it the other way (area 144π → r = 12 → 150/360 × 24π = 10π) and adds the area→radius step. CB's own arc item (`c8345903`) is an arc-to-arc ratio, different again. The radius/diameter interchange trap (20π) is the standard one. Fine; note that "arc length by proportionality" is now in PT5 and PT6.
* **W-M4-22 — M4.Q22.** vs PT5M1#19: PT5 = quadratic with two conditions → f(7); PT6 = linear with two conditions → f(1). Same pipeline, simpler function; PT6 is tagged hard largely on the fractional key (33/4). CB's qb:`1480dd5c` is the Medium analogue. Combined with M3.Q22, PT6 carries **two** "two-conditions-determine-the-constants" items — see W-22.

---

## 5. SUMMARY OF PASS RESULTS

| Pass | Hits raised | Adjudicated |
|---|---|---|
| 1 — lexical n-gram (n = 12→8, two normalisations) | 595 maximal | 558 LITURGY (stem frames), 37 content-bearing → all reviewed |
| 2 — scenario/structural (28 archetype queries) | 31 archetype pairings | 1 VIOLATION, 30 WATCH |
| 3 — numeric (multiset + key-equality) | 88 multiset overlaps (mostly practice-test window noise), **1** same-skill key equality | key equality = M3.Q03, folded into V-1 |
| 4 — named entities | 0 collisions | clean |
| figures | 0 collisions | clean |

**Artefacts produced (all in `outputs/review-pt6/`):** `build_corpus.py`, `corpus.json`, `pass1_lexical.py`, `pass1_hits.json`, `pass1b_content.py`, `pass3_numeric.py`, `pass3b_keys.py`, `find.py`, this report.

**Residual risk not covered by this gate:** (a) the bank exports' stripped math means an identical *equation* in a bank item would not be detected by pass 1 or pass 3 — only its stem, skill, difficulty and rationale prose were comparable; (b) the four question-bank exports are ~100 items per domain, a sample of a bank that runs to thousands, so absence of a match is weak evidence of absence; (c) the practice-test extracts are two-column-scrambled, so pass-1 hits against them are reliable but pass-3 numeric hits against them are noisy and were not treated as evidence.
