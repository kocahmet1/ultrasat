# Critic Report — Round 2 Re-Audit — PT5 Math Modules 3 & 4 (44 items)
### Focused re-verification of the 12 adjudicated fixes, the 7 form-level failures, and a full regression sweep
### Binding: `docs/CB_Math_Style_Spec.md` + `analysis/blueprint_pt5_math.md`

Method: every number below was recomputed from `modules-pt5/M3.json`, `M4.json` and `assets/*.svg` as they
stand now. All 44 keys and all 96 distractor recipes were re-solved symbolically from the item text alone;
all 6 SVGs were re-parsed and their affine data↔pixel maps recovered from tick-label text nodes only; the
8 extracted CB sources were re-grepped across **all 44** stems, not just the changed ten; and
`scripts/data/practiceTest4Math.json` was re-diffed item-by-item. `verify_M3.py` and `verify_M4.py` were
executed (both exit 0) but their **assertions were treated as claims, not evidence**, and two of them were
falsified. `fix_round_report.md` was read only to compare claims.

**Headline: eleven of the twelve fixes are real, four of the seven form-level failures are cleanly closed —
and fix C2 turned a mathematically sound item into one with two correct answers. M3 Q10 is a publish
blocker.**

---

## 1. Fix-verification table (12 adjudicated fixes)

| # | Item | Verdict | Evidence |
|---|---|---|---|
| **A1** | M4 Q18 rewrite (originality) | **LANDED** | Stem is now "the graph of the given equation is tangent to a circle at (12, 20). The circle has center (8, c)… What is the value of c?" The collided QB stem *"which of the following points also lies on line"* greps **2 hits in the sources** (`questionbank-export…(3).txt` line 2569 = item `9adb86ed`, and official PT5 line 912) and **0 hits in PT5**. New probes: `is tangent to a circle` 0 · `tangent to a circle at the point` 0 · `x + 4y = 92` 0 · `grain silo` 0. Math: line slope −1/4, radius slope 4 (negative reciprocal) ⇒ c = 4. Distance-to-line test confirms the other three are genuinely **not** tangent: c = 19 → 8√17/17 vs radius √17; c = 21 → 0 vs √17; c = 36 → 60√17/17 vs 4√17. Distractors are exactly the opposite slope (19), the tangent slope (21) and the plain reciprocal (36) — one nameable recipe each, ascending, key A. Trap = reciprocal-vs-negative-reciprocal, exactly one. *Caveats:* stem 36 prose words vs the 35 abstract cap (see row 29); rationale 243 words = 1.43× (longest in the form). |
| **A2** | M3 Q15 rewrite (originality) | **PARTIAL** | The parabola is genuinely re-rolled. SVG re-derived from tick labels alone (px = 245 + 22·X, py = 250 − 22·Y): all 65 polyline vertices satisfy **y = −x² − 4x + 5**; highest plotted point px (201, 52) → **(−2, 9)**; crossings at X = −5.041 and 1.041 → roots −5 and 1; interpolated y-axis crossing = **(0, 4.994)** ≈ the keyed (0, 5). Opens downward (PT4's opened up), different vertex, different target (y-intercept, not vertex). PT4 option overlap down from **3 of 4 → 1 of 4** (`(5, 0)`). **But two round-1 findings survive:** (i) PT4 M4.04's parabola y = x² − 6x + 5 has y-intercept (0, 5) — so the new **key is a point that lies on PT4's parabola too**, both curves share the constant term 5, and the key letter is still **C**; (ii) the difficulty complaint is unaddressed — PT4 correctly scored the *vertex* read **easy**, and reading a **y-intercept** is easier still, yet PT5 keeps **medium**. Corroboration: the rationale is 102 words = **0.76×** the medium norm, the lowest MC ratio in M3. |
| **A3** | M4 Q6 recast to nesting | **LANDED** | g(11) = 7, f(7) = 2(49) + 9 = **107** (sympy). Wrong-order g(f(11)) = 247 and f(11) = 251 are not accepted. `f(g(` 0 hits · `g(f(` 0 hits in the sources. Position 6 / SPR / easy / integer / nonlinear-functions all preserved. Closes the spec §5 function-notation-nesting family (was 0). *Note:* PT4 M3.19 also carries a nesting item (g(f(3)) = 149, hard SPR); same family, different structure and band — a soft cross-form echo, not a reproduction. The family now sits on an SPR, so no distractor set embodies it. |
| **B1** | M3 Q12 recast to radical/extraneous | **LANDED** | `sp.solveset(√(x+7) = x−5, x, Reals)` = **{9}** — unique. Squaring gives x² − 11x + 18 = (x−2)(x−9); x = 2 verified extraneous (√9 = 3 ≠ −3). `acceptedAnswers` contains 9 and **not** 2; 15 entries, hand-checked complete to the 5-char grid (9/1 … 99/11, 90/10, 9.0, 9.00, 9.000; 108/12 correctly excluded at 6 chars). Closes the spec §5 extraneous/nonreal family (was 0). *Notes:* the archetype is PT4 M3.17's archetype (√(15−x) = 3−x, also extraneous-root) at different constants/format/band, and the fix report's originality table ran **no PT4 probe** for this item; the blueprint's binding "one multi-root item (M3 Q12) listing both roots" line is now contradicted and the blueprint file was **not updated**. |
| **B2** | M4 Q8 cube → cylinder | **LANDED** | V = π(5)²(12) = **300π**; ladder re-derived: 25π = base area, 60π = πrh (radius not squared), 120π = 2πrh lateral. Ascending on coefficients, all nameable, key stays D. `grain silo` 0 · `silo` 0 hits. Corpus check: `right circular cylinder` is attested 16× but the attested shapes are volume→radius, circumference→volume and a scaling comparison — **not** radius+height→volume-in-π. PT4 M3.10's crate/prism/perimeter-face-surface ladder is gone. *Residual:* PT5 **M3 Q6** is still a right-rectangular-prism "volume, in cubic feet" item — PT4 M3.10's actual solid and phrasing. That half of the round-1 finding was never adjudicated. |
| **C1** | M4 Q20 tighten + add a step | **PARTIAL** | The extra step is real: perimeter ratio 4 → side ratio 4 → area ratio 16 → 32(16) = **512**; ladder 2 (÷16), 8 (÷4), 128 (×4 = the k-vs-k² trap), ascending, key D. Stem is down from 44 → **36** prose words under the round-1 ruler — still **1 over** the 35 abstract cap (the fix report's "34" comes from a counter that drops all numerals; see row 29). **New soft echo:** the rewrite moved *onto* PT4 M4.13's numbers — scale factor **4** and area ratio **16** (16 is literally PT4 M4.13's answer). The pre-fix version's k = 3 / k² = 9 did not collide. Corpus: "the perimeter of Y is n times the perimeter of X" is attested, but the attested item asks for a **side length**, not an area — no source reproduction. Difficulty is better but still soft for a hard slot. |
| **C2** | M3 Q10 option-set rebuild | **FAILED — regression, blocker** | The *shape* target is met (three distinct bound pairs; strictness load-bearing in exactly one distractor). The *mathematics* broke. Stem: "Which inequality is **true for all values of t**, where t is a recorded temperature…?" Given min = 47 and max = 55, the recorded set T ⊆ [47, 55]. Then **B (`0 ≤ t ≤ 55`) is true for every recorded t**, exactly as D is. Brute-forced over 200,000 admissible data sets: A false, **B true**, C false, **D true** — **two defensible answers**. The rationale's dismissal of B ("This inequality includes temperatures less than 47") is logically invalid: admitting non-recorded values does not falsify a universally quantified statement over the recorded ones. `verify_M3.py` passes it because its B-check is `preds[1](12)` — it tests that B *admits* a non-recorded value and never tests that B is *false* on a recorded one. The pre-fix option set (four strictness permutations on one bound pair) was mathematically sound. *Provenance note:* the round-1 repair suggestion itself proposed `0 ≤ t ≤ 55` as a distractor; the defect originates there, but it is now in the form. |
| **C3** | Rationale trims | **PARTIAL** | All seven listed trims are real and land **exactly** on the reported after-values (M3 Q5 48, Q6 42, triangle item 142, Q13 108, Q18 237; M4 probability 130, Q14 173) under the verify scripts' counter. **But the headline is false under the round-1 ruler.** My all-token counter reproduces the round-1 critic's rationale numbers **exactly on 8 of 8 unchanged items** (M3.02 132, M3.16 194, M3.19 190, M4.05 39, M4.07 153, M4.12 86, the table item 189, and the M3.18 before-value 263). Under that ruler **M3 Q19 is 190 words = 1.462× the 130-word hard-SPR norm — byte-identical to round 1 and never touched** — even though the round-1 critic named it as a length FIX and C3's own stated scope was "trim every item over ≈+45%." The claim "every one of the 44 rationales is inside the enforced ±45% band" is true only under a counter that was introduced in this same round and that discards operator tokens (`+`, `−`, `=`), which is what drops M3 Q19 from 190 to 148. Reported band means are also 3–30 words low (M3 hard-SPR real mean **173.5** vs claimed 144; M4 medium-SPR real **94** vs claimed 85). |
| **D1** | Abstract M4 Q4 and Q17 | **LANDED (with regressions)** | Both slots are genuinely abstract now: Q4 = "The graph of y = f(x) is shown in the xy-plane. / What is the value of f(2)?"; Q17 = "The function f is defined by the given equation. The function g is defined by g(m) = f(m/60). Which equation defines g?" Applied share recounted item-by-item under the **identical** round-1 rule (any real-world referent = applied): M3 = Q2, Q6, Q7, Q10, Q11, Q14, Q18 = 7; M4 = Q1, Q3, Q8, Q9, Q10, Q14, Q16, Q19 = 8. **15/44 = 34.1%**, inside the §2c 30–35% band, and the −2 is exactly Q4 and Q17. Keys unchanged (160, 900(1.15)^(m/20)) and re-verified. *Regressions:* AdvMath applied share fell **21% → 7%** (1/14) vs the §2c ~20% reference, because both abstracted items were ADV; and Q17 lost the modelling step (m minutes → m/60 hours) that earned its **hard** label — the stem now hands `g(m) = f(m/60)` over, and its 119-word rationale is **0.70×** the hard-MC norm, the lowest ratio in the entire form. |
| **D2** | Position swaps for the ramp dip | **LANDED** | M3 = `E E E E E E E M | E M M M M M M M | H H H H H H` (8E/8M/6H); M4 = `E E E E E E E E M | E M M M M M M | H H H H H H` (9E/7M/6H). Exactly one dip per module, monotone otherwise. SPRs still at **5, 6, 12, 13, 19, 22** with difficulty E/E/M/M/H/H in both modules; no SPR displaced. `PT5-M3-Q08.svg` → `PT5-M3-Q09.svg` renamed, `graphAsset` updated, table item at Q8 correctly carries `graphAsset: null`. Asset audit: 6 referenced, 6 on disk, **0 missing, 0 orphans, 0 stale references in either JSON** (one historical mention survives in `M3_selfcheck.md` prose only). *Note:* M3's dip sits at Q8/Q9, one slot earlier than §1d's parenthetical ("a medium may appear at Q9 with an easy straggler at Q10"); M4 matches the parenthetical exactly. |
| **E1** | SPR accepted-entry enumeration | **LANDED** | All 12 lists re-enumerated by hand against the 5-character / 6-with-minus grid. Every list is **complete and contains nothing illegal or incorrect**. All ten verifier-named gaps are closed: `.882` (M3 Q13), `104/8`, `117/9` (M4 Q5), `108/9` (M4 Q12), `100/8` (M4 Q13), `60/8`, `75/10`, `90/12`, `7.500` (M4 Q22); M4 Q6's four were mooted by the recast and its new 11-entry list is complete. Boundary cases confirmed correctly excluded at 6 chars: `108/12`, `120/10`, `1070/10`, `125/10`, `105/14`, `90/102`, `9.0000`, `12.500`, `107.00`. M3 Q22's `-108/9` (6 with minus) correctly retained. |
| **E2** | Figures: M4 Q11 proportions + italic origin | **LANDED** | `PT5-M4-Q11.svg` path `M 166 250 L 215 250 L 166 82 Z`: CA = 49 px, CB = 168 px, AB = √(49² + 168²) = **175.000 px** — **exactly 7 px/unit on all three sides** (was 3.4× out). Right-angle box at C, labels 7/24/25 correctly placed, scale note retained. Origin **O is italic on all three figures that carry one** (M3-Q15, M4-Q04, M4-Q16); the other three have no origin. All six: width 380, Georgia serif, `#cccccc` gridlines complete on all three grids. Single arrowheads on M4-Q04/Q16 are correct — both are quadrant-I-only plots whose axes begin at O; M3-Q15 spans negatives and is double-arrowed. |

**Fix tally: 8 LANDED · 3 PARTIAL (A2, C1, C3) · 1 FAILED (C2).**

---

## 2. Updated form-level scoreboard — the 7 previously-failing rows

| Row | Check | Round 1 | Round 2 | Independent recount |
|---|---|---|---|---|
| **9** | Ramp shape (§1d) | FAIL | **PASS** | Each module now has exactly one dip and is otherwise monotone. M3 8E/8M/6H with M at Q8 and the E straggler at Q9; M4 9E/7M/6H with M at Q9 and the E straggler at Q10. Difficulty mix and SPR difficulty-by-position unchanged. *Note:* M3's dip is one slot earlier than §1d's parenthetical; M4 matches it exactly. |
| **27** | §5 residual families | FAIL (0 and 0) | **PASS** | Full 44-item trap census recounted: function-notation nesting **1** (M4 Q6), extraneous/nonreal **1** (M3 Q12). **No other quota row drifted:** wrong-target 3 (M3 Q19, M4 Q12, M4 Q22) · role swap 2 (M3 Q8, M4 Q1) · solution-count 2 (M3 Q17, M4 Q21) · sign-slip 2 (M3 Q22, M4 Q2) · percent 2 (M3 Q11, M4 Q13) · similarity 1 (M4 Q20) · formula ladder 1 (M4 Q8) · interpretation menu 2 (M3 Q14, M4 Q16) · exponent-structure 1 (M4 Q17) · robustness 1 (M3 Q18) · must/could 1 (M3 Q20). Exactly one mechanism per trap-bearing item. *Notes:* trap-free slots fall 6 → 4 (M3 Q5/Q6/Q13, M4 Q5); **both restored families were placed on SPRs**, so neither is embodied in a distractor set — a thinner way to close the gap than CB's own MC nesting items. M3 Q21's label still names two mechanisms ("step-skip / sign-slip"), as in round 1. |
| **28** | Applied share (§2c 30–35%) | FAIL (17/44 = 38.6%) | **PASS** | **15/44 = 34.1%** under the identical round-1 scoring rule, itemised above. Per-domain: PSDA 7/8 = 88% (ref ~85%) ✔ · ALG 5/14 = 36% (ref ~40%) ✔ · GEO 2/8 = 25% (ref ~10%) — high, as in round 1 · **ADV 1/14 = 7% (ref ~20%) — regressed from 21%**, the direct cost of abstracting two ADV items to hit the aggregate. |
| **29** | Stem caps (§2b) | FAIL (1 item, 9 over) | **PASS (marginal, ruler-dependent)** | The 9-word overrun is gone. Under the ruler that reproduces the round-1 critic's own at-cap numbers exactly (M3 Q10 55/55, M4 Q14 53/55, M3 Q18 73/75 — all three reproduced to the word), **three items are now 1 word over**: M4 Q9 **56**/55 applied (pre-existing; missed in round 1), M4 Q18 **36**/35 abstract (new this round), M4 Q20 **36**/35 abstract (rewritten this round). Under the verify scripts' counter — which filters stem tokens to those containing `[A-Za-z]` and therefore **discards every numeral** — the same three read 55, 33 and 34 and all 44 pass. That counter is what produced the fix report's numbers. Substantively the row is fixed; the residual is ±1 word of measurement convention, but the instrument was changed in the same round that certified the result. |
| **31** | Rationale lengths (§7) | FAIL (systemic +20–25%, 6 items ≥+45%) | **PARTIAL** | New per-band means (round-1 ruler): **M3** E-MC 126.0 (+15%) · M-MC 153.0 (+13%) · H-MC 203.8 (+20%) · E-SPR 47.5 (+19%) · M-SPR 124.0 (+24%) · H-SPR 173.5 (+34%). **M4** E-MC 134.7 (+22%) · M-MC 159.4 (+18%) · H-MC 192.0 (+13%) · E-SPR 41.5 (+4%) · M-SPR 94.0 (−6%) · H-SPR 161.0 (+24%). **Items still exceeding norm by ≥45%: one — M3 Q19 at 190 w / 1.462×**, down from six or seven. Next worst: M3 Q16 1.437 · M4 Q18 1.429 · M3 Q8 1.400 · M3 Q18 1.394 · M4 Q7 1.391. Under the scripts' counter: 0 items ≥1.45×, worst 1.41× (M3 Q16) — consistent with the fix report, but that counter drops operator tokens. Real improvement; not a clean pass. |
| **33** | Originality vs CB sources (§9.7) | FAIL (M4 Q18) | **PASS** | Scan re-run over **all 44** stems. Longest common contiguous word-run against the 8-source corpus: 27 stems have a run ≥8 words and **every one is §2a mandated liturgy** (max 17 w on "the solution to the given system of equations is (x, y). What is the value of y" — the spec's own formula). New-content probes all 0: `grain silo` · `silo` · `y-intercept of this graph` · `coordinates of the y-intercept` · `quadratic function f is shown` · `f(g(` · `g(f(` · `is tangent to a circle` · `tangent to a circle at the point` · `x + 4y = 92` · `creamery` · `textile` · `thallus` · `Rhizocarpon` · `gondola` · `cistern` · `chess club` · `solar array` · `weather balloon` · `parking garage` · `courier` · `orchard`. The round-1 violation's signature stem is present in the sources and **absent from PT5**. Attested-but-different archetypes confirmed by reading the source items, not just counting hits: cylinder-volume items ask volume→radius or circumference→volume; the "perimeter of Y is n times the perimeter of X" item asks for a **side length**. The only incidental overlap is `x + 4y` (PT4's `x + 4y = −16`, a solution-count system) — different constant, question and pipeline. |
| **34** | Differentiation from PT4 | FAIL (2 breaks + 3 repeats) | **PARTIAL** | Both outright breaks are closed: M3 Q15's identical parabola/key/3-of-4 options is gone (different curve, different target, 1 shared option); M4 Q6's `3x² − 5x + …` template is gone. Context firewall re-verified clean — all 17 PT4 contexts absent, Mateo/Idris vs Nadia, no internal 44×44 context repeat, and the round-1 soft echoes ("SPR answer 12 at Q12 in both modules"; two lab/exponential M4 contexts) are all resolved. **Residuals and one new echo:** (i) M3 Q15's new key **(0, 5)** is also PT4 M4.04's y-intercept — both parabolas share the constant term 5 — and the key letter is still C; (ii) **M4 Q20's rewrite adopted PT4 M4.13's numbers** (scale factor 4, area ratio 16 = PT4's answer) where the pre-fix k = 3 did not collide — a new echo created by a fix; (iii) M3 Q12's new archetype is PT4 M3.17's archetype (radical equation, extraneous root); (iv) M4 Q6's nesting archetype is PT4 M3.19's family; (v) the three unadjudicated repeats are unchanged — **M4 Q1** vs PT4 M3.02 (fee + rate → which equation, same trap, same option template), **M4 Q14** vs PT4 M4.15 (two-constraint at-least/at-most system), and **M3 Q6** vs PT4 M3.10 (right rectangular prism, "volume, in cubic feet"). The critic asked for one of the three to be re-rolled; the editor re-rolled a fourth item (M4 Q8) instead. |

**Row tally: 4 clean PASS (9, 27, 28, 33) · 1 marginal PASS (29) · 2 PARTIAL (31, 34) · 0 remaining outright FAIL** — but see §4, where a **new** blocker was introduced below the form line.

---

## 3. Items still FIX / REWRITE

| Item | Grade | Reason | Origin |
|---|---|---|---|
| **M3 Q10** | **REWRITE (blocker)** | Two correct answers. `0 ≤ t ≤ 55` (B) and `47 ≤ t ≤ 55` (D) are both true for every recorded t. Verified by exhaustive reasoning and 200,000 random admissible data sets. Rationale's dismissal of B is logically invalid. Unscorable as written. | **New — introduced by fix C2** |
| **M3 Q15** | FIX | Reading a y-intercept off a labelled grid is an **easy** task; PT4 scored the harder vertex read easy. Label is still **medium**, and the 102-word rationale (0.76× norm) confirms the mismatch. Alt text also now enumerates all four options: the key (0, 5), the vertex (−2, 9) and both x-intercepts. | Round-1 finding, not repaired by A2 |
| **M4 Q17** | FIX | The **hard** label is no longer earned: D1 removed the minutes→hours modelling step by handing `g(m) = f(m/60)` to the student. 119-word rationale = 0.70× the hard-MC norm, the lowest ratio in the form. | **New — side-effect of fix D1** |
| **M3 Q19** | FIX | 190-word rationale = 1.462× the 130-word hard-SPR norm — the only item still ≥+45% and **byte-identical to round 1**. Named as a length FIX in round 1; C3's stated scope covered it; never touched. | Round-1 finding, not repaired |
| **M4 Q18** | FIX | Stem 36 prose words vs the 35 abstract cap; 243-word rationale = 1.43×, the longest in the form. Mathematics and originality are sound. | New (cosmetic), from A1 |
| **M4 Q20** | FIX | Stem 36 words vs 35; new number echo of PT4 M4.13 (k = 4, k² = 16); difficulty still soft for a hard slot. | Partly new, from C1 |
| **M4 Q9** | FIX | Stem 56 prose words vs the 55 applied cap (1 over). Mathematics clean (x = 55 unique; 39/48/80 all nameable). | Pre-existing; **missed in round 1** |
| **M3 Q9** | FIX | Stem states `AB = AC` **and** the SVG carries congruence tick marks on both sides. CB does one or the other. | Round-1 finding, never adjudicated |
| **M3 Q16** | FIX | "the length of a radius of this circle" — 0 corpus instances of that construction; 194-word rationale = 1.437×, the form's worst MC ratio. | Round-1 finding, never adjudicated |
| **M3 Q18** | FIX | "must be true" framing layers a quantifier mechanism on top of the assigned robustness trap; the blueprint reserves must/could for Q20. Redundant clause "which is still the greatest yield" also survives. | Round-1 finding, never adjudicated |
| **M4 Q1 · M4 Q14 · M3 Q6** | FIX | Unrepaired cross-form archetype repeats of PT4 M3.02, M4.15 and M3.10 respectively. | Round-1 finding, never adjudicated |
| **M4 Q16** | note | Alt text "lie close to a straight line" states the key ("Increasing linear"). | Round-1 note, unchanged |

**Totals: 1 REWRITE (blocker) · 13 FIX · 30 PASS.**

---

## 4. Regression list (new since round 1)

1. **M3 Q10 — two correct answers.** BLOCKER. Fix C2 replaced a sound four-strictness-permutation set with a set containing a superset bound pair. `verify_M3.py` certifies it because its B-check (`preds[1](12)`) tests admission of a *non-recorded* value rather than falsity on a *recorded* one.
2. **M4 Q17 difficulty label softened** by D1 (see §3).
3. **AdvMath applied share 21% → 7%** (1/14 vs the §2c ~20% reference). The form aggregate was brought into band by hollowing out one domain rather than by rebalancing.
4. **M4 Q20 acquired a PT4 number echo** (scale factor 4, area ratio 16 = PT4 M4.13's answer) where the pre-fix version had none.
5. **M3 Q15's alt text now discloses the entire option set** — key, vertex and both x-intercepts. The round-1 "discloses the key" note is now maximal.
6. **Blueprint out of sync.** `analysis/blueprint_pt5_math.md` still binds "M3 Q12 … multi-root SPR: acceptedAnswers lists BOTH roots" and "SPR census: … one multi-root item (M3 Q12) listing both roots". The form now contradicts its own binding blueprint on two lines. (The 0-multi-root census is an accepted editorial decision; the *document* was not updated to record it.)
7. **Verification-instrument regression.** Both verify scripts' `stem_words` filters to tokens containing a letter, discarding every numeral; the fix report's stem counts (33, 34, 55) come from it while the round-1 findings came from a ruler I reproduced exactly on 8/8 unchanged items. The scripts now certify a looser standard than the one that produced the finding, and the same is true of `rat_words` (drops `+`, `−`, `=`), which is what moves M3 Q19 from 190 to 148 words.
8. **Minor:** M3 now carries the identical terminal question "What is the solution to the given equation?" at both Q1 and Q12 (Q12 previously read "What is *a* solution…?").

### Regression sweep — everything that did NOT regress

| Check | Result |
|---|---|
| Module metadata (§8) | moduleNumber 3/4 · "Math" · calc true · 2100 · 22 items · descriptions "Module 1/2" — unchanged, both **PASS** |
| Domain quota | ALG 14 (7+7) · ADV 14 (7+7) · PSDA 8 (4+4) · GEO 8 (4+4) — **exact** |
| Skill quota, all 19 rows | lin-eq-1var 3 · lin-func 4 · lin-eq-2var 2 · systems 3 · lin-ineq 2 · NLF 7 · NLE 4 · equiv-expr 3 · ratios 2 · pct 2 · 1-var 2 · 2-var 1 · prob 1 (M4 only) · inference 0 · ESC 0 · area-vol 2 · lines-angles 2 · right-tri 2 · circles 2 (1/module) — **every row exact** |
| Difficulty mix | M3 8/8/6 · M4 9/7/6 — **exact** |
| SPR positions & difficulty | 5, 6, 12, 13, 19, 22 = E/E/M/M/H/H in both modules — **exact** after the swaps |
| SPR census | 9 integers (exactly one negative, −12; three-digit engineered at 216, 201, **107**) · 2 fractions (15/17, 15/2) · 1 decimal (12.5) · **0 multi-root** (intentional) — entry-forms note on exactly the three non-integer answers |
| Visual quota & types | 4/module: M3 dot plot Q7 · table Q8 · geometry Q9 · parabola Q15; M4 curve Q4 · two-way table Q10 · geometry Q11 · scatter Q16. Zero histograms, zero box plots |
| Key-letter balance | M3 4/4/4/4 · M4 4/4/4/4 — recomputed from `correctAnswer`. *Standing observation (pre-existing, not flagged in round 1):* M3 runs A-A-A at Q7–Q9 and C-C-C at Q14–Q16 |
| Numeric options ascending | 22/22 numeric sets strictly ascending, including M4 Q8's π-symbolic set on coefficients (25 < 60 < 120 < 300); 13 non-numeric sets all carry an explicit ordering rule |
| Options plain text (§8) | 128 option strings: 0 HTML tags, 0 entities, 0 LaTeX/`$`, 0 Unicode minus |
| Bare `<`/`>` in passage/text/explanation | **0 occurrences** across all 44 items and all 4 text fields |
| Scale-note placement | Present on exactly M3-Q09 and M4-Q11 (the two geometry figures); absent from all three coordinate grids and the dot plot |
| graphDescription accuracy | All 6 re-derived from pixel geometry and factual to the unit: M4-Q04 (px = 60 + 48x, py = 300 − 0.375y → (0,640)(1,320)**(2,160)**(3,80)(4,40)); M4-Q11 (7 px/unit exactly, 49/168/175); M3-Q15 (y = −x²−4x+5, vertex (−2,9), roots −5 and 1, y-int (0,4.994)); M3-Q07 (24 dots, 3/5/7/4/3/2, exactly 4 above 5); M3-Q09 (ticks on the midpoints of AB and AC); M4-Q16 (10 points, increments 4,2,4,2,4,3,2,4,2 — non-accelerating, R² ≈ 0.997) |
| Asset filenames ↔ positions | 6 referenced, 6 on disk, 0 missing, 0 orphans, 0 stale references after the rename |
| Italic-O consistency | Italic on all three figures that carry an origin — **the E2 claim holds** |
| Rationale liturgy (§7) | 44/44: correct openers, dismissals in strict letter order, "Therefore," in every item, curly apostrophes throughout, 0 dismissals inside an SPR, entry note on exactly the three non-integer SPRs |
| Voice fingerprint (§2a) | 0 "you/we/let's", 0 imperatives, 0 double questions, 0 exclamations, 0 "None of the above"; CAPS negation at M3 Q20 |
| Named people / Latin binomial | Mateo (M3), Idris (M4); *Rhizocarpon nivalescens* ×1, italic |
| Two-way table (§8) | M4 Q10: bordered, centered, bold headers, Total row **and** column; all six margins re-summed correctly |
| Mathematical airtightness | 43/44 keys unique and all distractors wrong and nameable. **The exception is M3 Q10.** |

---

## 5. Verdict — HOLD

The fix round did real work. Eleven of twelve fixes landed in substance, the two originality breaks that
made round 1 a hold are genuinely gone — M4 Q18's stem no longer exists anywhere in the corpus and M3 Q15
is a different parabola asking a different question — and four of the seven form-level failures close
cleanly and verifiably: the ramp carries one honest dip per module, both missing spec §5 trap families are
back at exactly one each with no other quota row disturbed, the applied share is 15/44 = 34.1% under the
same rule that scored it 38.6% a round ago, and a fresh 44-stem scan against all eight sources finds
nothing but mandated liturgy. The SPR enumerations are now exhaustive and correct to the character, the
redrawn triangle is exact to 7 pixels per unit, and every figure still re-measures to its alt text.

But one fix broke an item. **M3 Q10 now has two correct answers**: with the recorded minimum 47 and maximum
55, `0 ≤ t ≤ 55` is as true of every recorded temperature as `47 ≤ t ≤ 55` is, so choices B and D are both
defensible and the item cannot be scored. That is a blocker in a form whose central claim has always been
that all 44 keys are unique — and it slipped through because the verify script tested the option set's
*shape* instead of the key's *uniqueness under the stem's own quantifier*. It is a five-minute repair
(replace B with a bound pair that is false on a recorded value, e.g. `47 ≤ t ≤ 50`), but it must be made.

Two further things should be settled before publication rather than after. The verification instrument was
changed in the same round it certified: both scripts' stem counter discards numerals and their rationale
counter discards operators, which is how three 36/36/56-word stems read as 33/34/55 and how a 190-word
rationale reads as 148. Under the ruler that reproduces round 1 exactly, M3 Q19 is still 1.46× its norm and
was never touched, and three stems are one word over cap. And D1 bought the applied share by abstracting
two Advanced Math items, which dropped ADV's context share to 7% against a ~20% reference and stripped
M4 Q17 of the modelling step that earned its hard label.

**HOLD.** Fix M3 Q10 — that alone is blocking. Then re-label or re-pitch M3 Q15 and M4 Q17, trim M3 Q19,
shave one word from M4 Q9/Q18/Q20, and reconcile the blueprint's multi-root line. With M3 Q10 repaired and
the difficulty labels honest, this is a publishable form; without it, it is a form with a broken item.

*Re-audited 2026-08-14. Every judgement recomputed from the JSON and SVG artifacts, from the extracted
sources and from the shipped PT4 form. Verify-script assertions were executed but treated as claims;
two were falsified (M3 Q10 key uniqueness, and the ±45% rationale band under the round-1 ruler).*
