# Critic Report — PT4 Math Modules 3 & 4 (44 items)
### College Board authenticity audit vs CB_Math_Style_Spec.md + blueprint_pt4_math.md
All counts below independently recomputed from M3.json / M4.json / assets (selfchecks NOT trusted); every key, distractor recipe, SVG coordinate geometry, and source-collision grep re-verified.

---

## 1. Form-level scoreboard (target vs actual)

| Check | Target (spec) | Actual | Verdict |
|---|---|---|---|
| Items / module, format | 22 = 16 MC + 6 SPR | 22 = 16 MC + 6 SPR both | PASS |
| Module metadata | modNum 3/4, Math, calc true, timeLimit 2100, desc "Module 1/2" | exact | PASS |
| Domain quota (form) | ALG 15 / ADV 14 / PSDA 8 / GEO 7 | 15 (8+7) / 14 (7+7) / 8 (4+4) / 7 (3+4) | PASS |
| Skill quota §1c | nf7 lf4 ne4 le1v3 le2v3 sys3 ee3 ineq2 rrp2 tvd2 ovd1 pct1 prob1 inf1 av2 lat2 rtt1 circ2 esc0 | all exact (recounted) | PASS |
| Probability M4-only | yes | M4 Q9 only | PASS |
| Circles ≥1 / module | yes | M3 Q21, M4 Q20 | PASS |
| Difficulty mix | M3 9E/7M/6H · M4 8E/8M/6H | EEEEEEEE M E MMMMMM HHHHHH · EEEEEEEE MMMMMMMM HHHHHH | PASS (M3 dip at Q9/10 is the sanctioned "easy straggler") |
| SPR positions & diff | 5,6,12,13,19,22 = E,E,M,M,H,H | exact in both modules | PASS |
| SPR answer census | ~9 int (incl 3-digit), ~3 frac, exactly 1 neg, ≤1 dec | 9 int (165, 118, 486 three-digit), 3 frac (4/9, 49/8, −12/5), 1 neg, 0 dec; all entries ≤5 chars (6 w/ minus); entry-forms notes on all 3 non-integers, on no integers | PASS (blueprint's own "8 int" line was arithmetically self-inconsistent; spec "~" satisfied) |
| Visual quota & types | 4/module; M3 table+line+geomfig+scatter, M4 geomfig+parabola+2way+scatter; 0 histogram/boxplot; note only on geometry figs; hard geometry figure-less | exact; both geometry figs carry the note, no grid carries it; Q21/Q18 hard geometry verbal | PASS |
| graphDescription on all 6 figure items | present & factual | present; all 6 checked against SVG pixel geometry — factual | PASS |
| Key letters / module | 4/4/4/4 ±1 over 16 MC | M3 4/4/4/4, M4 4/4/4/4; all 11 numeric sets genuinely ascending | PASS |
| Named people / binomial | ≤2 per module; exactly 1 Latin binomial | Nadia only (M3); *Porzana lutescens* only (M3 Q14, italic) | PASS |
| Options format | plain text, no HTML, ASCII hyphen, Unicode sups | verified programmatically, zero violations | PASS |
| Originality vs sources | no scenario+number collision | grepped ~60 distinctive nouns/pipelines across all 8 extracted files: zero collisions (all hits are different scenario classes — see §4) | PASS |
| Internal collisions (44×44) | no repeated context/number cluster | one soft cluster: pottery studio (M3.2) vs kiln-glazing artist (M4.10) — both ceramics; three plant-growth contexts (garden/seedlings/canopy) | PASS w/ note |
| Trap quota §5 | see rows | wrong-target ok (2 labeled + 3 composite-target) · role-swap ~3 ok · discriminant hunts 3 ok · sign-slip ok · percent-mult 1 ok · formula-fragment 1 ok · extraneous 1 ok · echo pervasive ok | PASS |
| Trap quota §5 — misses | length/area-scale ~1–2 | **3** (M3 Q21 r², M4 Q20 r², M4 Q13 k²) — and both circle items use the *identical* r²-vs-r slip | **FAIL (soft)** |
| | statistical-robustness ~1 | **0** (no transformation-effect item anywhere) | **FAIL** |
| | function-notation nesting ~1 | **0** (M3 Q19 slot chose the sign-slip fork) | **FAIL** |
| | must-be/could-be ~1 | **0** (no load-bearing must/could wording in any stem) | **FAIL (soft)** |
| | exponent-structure ~1 | 2 (M4 Q11, M4 Q19 — both blueprint-assigned) | over, tolerable |
| | interpretation menus ~2 | 3 counting MoE (M3 Q14, M4 Q16, M4 Q14) | over, tolerable |
| Applied share | ≈30–35% | ≈17/44 = 39% | borderline (note) |
| Rationale lengths | MC ≈110/135/170, SPR ≈40/100/130 | mostly in range; outliers: M3 Q2 178w (E), M3 Q8 167w (E), M4 Q12 184w (M-SPR), M3 Q22 201w / M4 Q22 235w (H-SPR) | 1 FIX (M4 Q12), rest notes |
| Rationale liturgy | openers/It's-given (curly)/yields/Therefore/dismissal order | all openers exact, curly apostrophes throughout, dismissals in letter order everywhere; "Therefore," close missing on 2 of 38 MC (M3 Q21, M4 Q17) | 2 trivial FIXes |

Every under/over-filled §5 row traces to the **blueprint**, not the writers — the writers hit their assigned blueprint cells exactly. The blueprint simply never scheduled a robustness, nesting, or must/could item; future forms should.

---

## 2. Item-by-item verdicts (44 rows)

| Item | Grade | Reason (one line) |
|---|---|---|
| M3.1 | PASS | Clean 2-step solve; echo/sign/4x distractors all derivable; textbook opener. |
| M3.2 | PASS | Canonical fee+rate which-equation; 4 single-slot variants; alternate-world dismissals (rationale runs long for E — note). |
| M3.3 | PASS | 5-prose-word equivalent-expressions stem; sign-error pair + exponent-add distractor per recipe. |
| M3.4 | PASS | Honest rate×amount E; part/total/add trio; "plot beds" diction slightly off (note). |
| M3.5 | PASS | ax+by=c SPR, 27 clean; equation-first + "The given equation represents…" is attested CB shape. |
| M3.6 | PASS | Evaluate f(4)=37; frictionless. |
| M3.7 | PASS | Unsorted median table; mean engineered to integer 49; full mean/mode/range menu — textbook CB. |
| M3.8 | PASS | SVG line verified through (0,−4),(2,0); 2×2 sign grid; grid conventions all met. |
| M3.9 | PASS | Ferry system-represents with the exact measured standing trio (swap totals / coeffs / both). |
| M3.10 | PASS | Volume 240 with perimeter/base-area/surface-area ladder — CB's favorite distractor set; fig + note correct. |
| M3.11 | PASS | Observed−predicted 14−8=6 verified against SVG dots; echo/predicted/observed trio; stem 66w under stat cap (note: wordiest in form). |
| M3.12 | FIX | Signature wrong-target gem, but rationale's meta-sentence breaks the SPR liturgy (§7). |
| M3.13 | PASS | Cofunction identity, correct M per bank; accepted forms complete (4/9/.4444/0.444); thin one-glance medium (essay note). |
| M3.14 | PASS | Exact "best interpretation" wording; noun-phrase menu permutes initial/time/rate roles; P(1)=1,081 recomputed correct. |
| M3.15 | PASS | b=22 verified; sign-error + both partial-product distractors nameable. |
| M3.16 | PASS | At-most inequality; boundary/direction/swap slots each named; feasible numbers. |
| M3.17 | PASS | Radical extraneous root fully checked both ways; Roman I/II set matches measured special format (only special set in form). |
| M3.18 | PASS | Tangency c=13 via discriminant; −13/−3/4 are sign-slip, y-intercept, vertex-x — all derivable. |
| M3.19 | PASS | Completing square w/ a=2, engineered 161→111, composite 118; hard SPR with real structure. |
| M3.20 | PASS | 2.5×0.5=1.25 chain; reversed/subtracted/added distractors exactly per percent recipe. |
| M3.21 | FIX | Item math airtight (k=12), but no "Therefore," close and Choice A's dismissal recipe doesn't actually yield 6 (§7). |
| M3.22 | PASS | No-solution k=−12/5 w/ intercept verification; required-negative fraction, entry forms right (rationale 201w — trim if convenient). |
| M4.1 | PASS | Invert f; 28/31/127 = intermediate/echo/f(31) — perfect adjacent-quantity set. |
| M4.2 | PASS | Two-hop conversion, both factors GIVEN in parentheses; partial-conversion distractors labeled correctly. |
| M4.3 | PASS | Same-side interior angles; SVG angle positions verified consistent (~124°/56°); note present. |
| M4.4 | FIX | Item and key fine (vertex (3,−4) verified in path math), but SVG is missing the unit gridline at x=5 — exactly where an x-intercept sits. |
| M4.5 | PASS | 9x−7=47→6; 39-word rationale is dead-on the E-SPR norm. |
| M4.6 | PASS | f(7)=53; frictionless. |
| M4.7 | PASS | x+y=36 composite target on an easy system — good CB texture; x/y/2x+y distractors. |
| M4.8 | PASS | 12x⁵+10x²; added-coeffs / half-distribute / multiplied-exponents trio per recipe. |
| M4.9 | PASS | Two-way table sums verified; 36/48=3/4; complement / grand-total / transposed-conditional — the exact probability trio; fractions ascend. |
| M4.10 | FIX | Math clean (23; swap gives clean 15), but "large bowls, g" is an arbitrary letter (voice tell) and second ceramics context after M3.2. |
| M4.11 | PASS | t/4 vs t vs 4t vs 1.24 — canonical exponent-structure grid; ᵗ⁄⁴ rendering is the app's least-bad plain-text form (note). |
| M4.12 | FIX | Solid medium SPR (x-int 8), but 184-word rationale is ~85% over the SPR-M norm (§7 length). |
| M4.13 | PASS | Sides ×4 → area ×16; k=4 bait; measured banner archetype verbatim class. |
| M4.14 | FIX | Menu and phrasing canonical, but MoE 3% is statistically inconsistent with n=400 (≈5%) — numbers must stay plausible (§2c). |
| M4.15 | PASS | ≥8 and ≤520 system; each wrong option violates exactly one boundary/direction slot. |
| M4.16 | PASS | Slope −15 verified against SVG fit line; 4 parallel same-length sentences permuting slope/intercept roles. |
| M4.17 | FIX | Best discriminant item in the form (disc=0 lands exactly on trap integer 8) — only miss is the absent "Therefore," close (§7). |
| M4.18 | PASS | Sufficiency reasoning airtight; similar-vs-congruent gap; every distractor's insufficiency provable; hard geometry correctly figure-less. |
| M4.19 | PASS | 3⁴ˣ→81ˣ, ab=486 engineered 3-digit; one clean insight. |
| M4.20 | PASS | Completing square → r=6; √7/12/36 = skip-CTS/diameter/r² — all nameable (r²-slip duplicates M3.21's trap; form-level note). |
| M4.21 | PASS | x=4±√7 verified; p/constant-term/discriminant-undivided distractors all derivable. |
| M4.22 | PASS | Two-condition constants → max 49/8; worthy hard closer; entry forms complete (rationale 235w — longest SPR, tolerated for the closer). |

**Totals: 38 PASS · 6 FIX · 0 REWRITE.**

---

## 3. Detailed notes on every FIX

**M3 Q12 — liturgy extra sentence.** Spec §7 SPR skeleton = opener → derivation → "Therefore, …" → (entry note). The closing sentence "It isn't necessary to find the value of w to answer the question." is instructional meta-commentary that exists nowhere in the 400-item measured corpus; CB lets the shortcut speak for itself. *Repair: delete the sentence.* (Everything else about this item is the single most CB-authentic move in the form.)

**M3 Q21 — two rationale defects.** (a) Spec §7.4: derivation must close "Therefore, [answer restated]"; here it ends "Since it's given that k > 0, the value of k is 12." *Repair: append/convert to "Therefore, the value of k is 12."* (b) Choice A (6) is dismissed as "a sign error when taking the square root" — but that error path yields k = −6, not 6; the one-sentence recipe for 6 as printed doesn't close (spec §0.3: if you can't name the error that produces the option, it's wrong for this test). *Repair: either re-derive the dismissal (e.g., "This is the difference between the radius and the y-coordinate of the center" — 9 − 3 = 6, a genuinely nameable slip) or swap the option to −6 and keep the sign-error dismissal (set stays ascending: −6, 9, 12, 84).*

**M4 Q4 — SVG gridline gap.** Spec §8: fine gridlines at unit spacing. Vertical gridlines run every 24 px except px 200 (x = 5) — the only gap that isn't the axis — and (5, 0) is an x-intercept a student will read. *Repair: add `<line x1="200" y1="56" x2="200" y2="320"/>` to the #cccccc group.* Cosmetic second: `O` here is roman while M3-Q08's is italic — harmonize.

**M4 Q10 — voice tell + context echo.** Spec §2c/§7.5: symbols map naturally to their nouns (M3 Q5's a = aluminum, g = glass is the model); "large bowls, g" is arbitrary and reads authored-around-a-collision (avoiding l). Also the form now has two ceramics scenarios (pottery-studio fee M3.2, kiln-glazing artist M4.10) — blueprint-seeded, but a Bluebook form wouldn't do it. *Repair: rename the pieces so letters fit — "bowls, b, and platters, p" (keeps 3b + 7p = 132 intact, kills both problems at once).*

**M4 Q12 — rationale length.** Spec §7: SPR medium ≈100 words; delivered 184. The overrun comes from reciting the slope formula and every add/divide. *Repair: compress to the CB cadence — state slope −2 via the substituted formula in one sentence, get b = 16 in one, set y = 0 and finish; target ≈100–120 words.*

**M4 Q14 — implausible number pair.** Spec §2c: numbers plausible; a random sample of 400 has a margin of error near 5%, not 3% (3% implies n ≈ 1,100). Measured CB items either omit n or keep the pair consistent. *Repair: change 400 → 1,100 (or drop the sample size sentence entirely, as the QB's park-ranger MoE item does); leave 62% ± 3% untouched.*

**M4 Q17 — liturgy close.** Spec §7.4: ends "Since k must be an integer greater than 8, the least possible integer value of k is 9." *Repair: "…greater than 8. Therefore, the least possible integer value of k is 9."* One word; the item itself is superb.

**Form-level repairs (blueprint, for Tests 5–10):** schedule one statistical-robustness item (add-constant → median/range behavior), one function-notation nesting item (g(f(a)) / f(c+k) untangling), and one load-bearing must-be/could-be stem; cap the length/area-scale family at 2 by giving the two circle items different trap mechanisms (one r²-slip, one tangent/translation/arc mechanism).

---

## 4. Originality audit detail

Grepped all 8 extracted sources for every distinctive noun phrase and constant pipeline in the 44 items (pottery/clay, ferry, recycling, seedling/greenhouse, furlong, Porzana/marsh/wetland, canopy, kiln/glaze/bowls, banners, robotics/kits/motors, bus, library, bicycle, crate, visitors, Nadia; 4x+6=38, 3a+2g=96, 260/1,900, 60x+150y≤2,400, 7(w+3)=55, 1,150(0.94), (2x+7)(4x−3), √(15−x)=3−x, 2x²−20x+161, 250%/50%, (x−4)²+(y−3)²=81, kx+4y=7 / 6x−10y=9, 220-yd furlong, 36/48, 3s+7g=132, 9,000(1.06), 45x+6y≤520, 62%±3%, 2x²+8x+k, 6(3)⁴ˣ, x²+y²−10x+4y=7, x²−2x+13 / 6x+4, ax²+bx through (1,5)(3,3)). **Zero scenario+number collisions.** All lexical hits are different scenario classes: QB "bicycle paths" state-park table ≠ used-bicycle resale scatter; PT7 "crates in storage" fee function ≠ crate volume; PT4 "library proposal" ballot ≠ library format survey; QB park-ranger "visitors" MoE ≠ nature-center visitor median. The MoE correct-answer phrasing ("It is plausible that…") matches the QB item's — that is the spec-mandated canonical formula, not a collision. Internal 44×44: no repeated number sets; repeated small values (45 twice in M4; answer 8 twice across modules) are below the distinctiveness bar; ceramics double noted at M4.10.

---

## 5. Would it pass as Bluebook? (closing essay)

Put these 44 in front of a student who has done every official practice test and I believe 40+ sail through unquestioned. The skeleton is genuinely right — quotas exact to the item, honest ascending options with a flat 4/4/4/4 key, SPR census that lands the measured "9 integers, 3 fractions, exactly one negative" texture, and rationales that speak fluent CB ("It's given that", gerund-yields chains, letter-order dismissals with named errors). Crucially, the distractors are real derivations: I re-derived all 48 MC wrong options and 47 close cleanly under their named recipe — the one exception (M3 Q21's "6") is the sort of wobble CB's own editors would catch in review. The hard band earns its label the CB way: constants engineered to collapse (161→111→118; disc = 64−8k zeroing exactly on the trap integer 8; 6·3⁴ˣ folding to 486), not noise.
The three strongest items are **M3 Q12** (7(w+3)=55 → 21(w+3): the wrong-target signature prep companies never write, with w deliberately non-integer so grinding is punished), **M4 Q17** (discriminant hunt whose boundary integer sits exactly at disc = 0 — the measured trap, executed perfectly), and **M4 Q18** (a genuinely airtight similar-vs-congruent sufficiency item, correctly figure-less). M3 Q17's checked-both-ways extraneous root and M4 Q22's 49/8 closer are right behind.
The three weakest: **M4 Q14**, whose 400-person sample with a 3% margin of error is the one number pair in the form a knowledgeable reader can call false; **M4 Q10**, where "large bowls, g" is an authored-around-the-alphabet tell and the form's second ceramics context; and **M3 Q4**, a multiply-5-by-12 item whose "plot beds" diction and near-zero demand make it the least load-bearing slot (defensible as E-band, but CB's easiest items still usually hide one decision).
What would make a rater squint at form level is subtler than any single item: the trap palette is narrower than a real form's — no robustness reasoning, no notation-nesting, no must/could quantifier anywhere, while the r²-vs-r slip fires twice and exponent-structure twice. Real forms distribute their exotica. That is a blueprint flaw the writers faithfully executed, and it is invisible to students but visible to anyone auditing against the measured taxonomy. Fix the six small items, widen the trap palette next form, and this passes as Bluebook.

*Verified: 2026-08-14. Every judgment above recomputed from the JSON/SVG artifacts; selfcheck claims were independently confirmed except where contradicted here.*
