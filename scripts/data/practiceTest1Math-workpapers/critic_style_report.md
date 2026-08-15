# PT1 Math M3/M4 — College Board Style-Fidelity Critique

Critic pass against `docs/CB_Math_Style_Spec.md` (binding), `docs/analysis/CB_Math_B_question_bank.md`,
`docs/analysis/PT1_math_blueprint.md`. Originality probed by grep against all 8 source PDF text files
(`outputs/pdf_text/*.txt`), `used_contexts_t4_t5.txt`, and the app's own `practiceTest4Math.json` /
`practiceTest5Math.json`. Every key, distractor derivation, SPR list, option ordering, letter tally,
stem/rationale word count, and liturgy element was machine-rechecked in-session (independent of the
writers' self-checks).

## Verdict counts
- **BLOCKER: 0**
- **MAJOR: 1** (F1 — 288π reused across M3-Q10 / M4-Q11, same skill, same sitting)
- **MINOR: 11** (F2–F12; covering 14 item instances)
- Notes (no fix required): 10

**Gestalt scores (CB-indistinguishability, 1–10): Module 3 = 9 · Module 4 = 8.**
Mathematically the form is airtight — all 44 keys recomputed and confirmed, every distractor verified
wrong with a nameable recipe, all SPR accepted-answer lists enumerate correctly within the 5-char
(6 with minus) rule, ascending order holds on all numeric sets, letter tallies are 4/4/4/4 (M3) and
4/5/4/3 (M4), the ramp/dip/SPR-position skeleton matches the blueprint exactly. The findings below
are the residual tells.

---

## 1. MAJOR finding

### F1 (MAJOR) — M3-Q10 ↔ M4-Q11: identical engineered constant 288π, same skill, same test sitting
- M3-Q10 (area-volume): sphere, r = 6 → key **"288π"**.
- M4-Q11 (area-volume): cylinder, r = 6, given **"The volume of the cylinder is 288π cubic centimeters."**
- Same unusual constant AND same radius 6 in the form's only two area-volume items, one per module.
  A student computes 288π in M3 and is handed 288π forty minutes later in M4. Internal collision of
  exactly the kind the checklist bars ("contexts must also not collide with each other across the 44
  items"); identical unusual constants in the same skill.
- **Fix (minimal, key letter preserved):** retune M4-Q11 to r = 4, V = 192π → h = 12.
  Options become 3 / 12 / 24 / 48 (d² slip 192⁄64, KEY, ÷d slip 192⁄8, unsquared 192⁄4) — ascending,
  key stays B, all three standing recipes survive. Update rationale numbers, `_distractorLogic`,
  figure label "6 cm" → "4 cm", and graphDescription.

## 2. MINOR findings

### F2 (MINOR) — M3 straight apostrophes break the curly liturgy (5 items)
M3 explanations mix straight and curly: Q15 `isn't` , Q17 `it's true for every value` , Q18 `can't lie` ,
Q21 `a isn't 0` , Q22 `a isn't 0` — in the same paragraphs as curly "It’s given that". M4 is 100% curly
("isn’t", "aren’t", "doesn’t"). **Fix:** replace the 5 straight apostrophes with ’.

### F3 (MINOR) — M4-Q13 rationale omits the "Therefore," restatement
Closes "…Since 5/2 is positive, the positive solution to the given equation is 5/2. Note that…".
§7 skeleton requires the Therefore-restatement. **Fix:** "…yields x = 5/2 and x = −4/3, respectively.
Since −4/3 is negative, … Therefore, the positive solution to the given equation is 5/2."

### F4 (MINOR) — M4 rationale word counts out of band (Q16, Q18; Q15 borderline)
Bands = MC 110/135/170 E/M/H ±45%. Measured: **Q16 (M) = 226** (cap ≈196), **Q18 (H) = 264** (cap ≈247),
Q15 (M) = 199 (cap ≈196, borderline). M3 is fully in band (worst 231 on hard Q18). **Fix:** trim
Q16's verification sentence for choice A (the "carrying 12 large crates…1,620 pounds" clause can go —
official mediums don't double-verify the key) and compress Q18's radius computation ("The distance
from (1, 1) to (5, −2) is √((5 − 1)² + (−2 − 1)²) = √25, or 5.").

### F5 (MINOR) — M4-Q16 opens with app-PT4's freight-elevator sentence skeleton
PT1: "A cargo trailer can carry a total weight of at most 1,700 pounds. Each large crate weighs 120
pounds, and each small crate weighs 45 pounds." App PT4-M3-Q16: "A freight elevator can carry a total
weight of at most 2,400 pounds. Each small crate weighs 60 pounds, and each large crate weighs 150
pounds." Different archetype (optimization vs represent-the-inequality) and numbers, but the two-sentence
template and the "crates" noun are verbatim-shape reuse inside the same app. CB stamps skeletons, so this
is a judgment call — but the firewall promised zero scenario reuse. **Fix (cheap):** crates → "pallets"
(or boxes) and restructure sentence 1 ("A delivery trailer has a load limit of 1,700 pounds.").

### F6 (MINOR) — M4-Q1 is a same-slot stamped sibling of app PT5-M4-Q1
Both apps' Module-4 Q1: flat fee + hourly rate → "Which equation represents the total cost/charge y,
in dollars, for … x hours?" with the identical distractor architecture (swap / sum-as-slope /
product-as-slope: 9x+12 / 12x+9 / 21x / 108x vs 3x+4 / 4x+3 / 7x / 12x). Context and numbers differ
(kayak 12+9 vs parking 4+3) and the blueprint assigned the slot, but a student running both forms meets
the same item twice as the M4 opener. **Fix (optional):** vary the stem formula ("Which equation gives
the total cost…") or swap M4-Q1 with another easy Algebra slot so the skeleton doesn't sit at the same
position.

### F7 (MINOR) — Named person "Hana" appears in the official source corpus
Official PT4 (pdf_text): "Hana deposited a fixed amount into her bank account each month… What is the
best interpretation of 25 in this context?" and QB-AdvMath has a Hana pole-vault item. The app's house
precedent picked corpus-absent names (Nadia, Mateo, Idris — 0 corpus hits each). Reusing a corpus name
in the same domain (applied linear function) is a small tell. **Fix:** rename to a corpus-absent diverse
name (verified zero hits: Amara, Priya, Yusuf, Tomas, Lena).

### F8 (MINOR) — M4-Q9 and M4-Q14 keys are both 36, both letter D, five slots apart
Grasses = 36 (Q9-D) and flagpole height = 36 feet (Q14-D). Repeated key value + letter inside one module
is a texture blemish. **Fix (keeps letter D and all recipes):** Q14 → signpost 6 ft with 4-ft shadow,
flagpole shadow 18 ft → h = 27; options 12 (reversed ratio 18·4/6) / 20 (18 + 2) / 24 (18 + 6) / 27.

### F9 (MINOR) — M4-Q20 sequence stem departs from the attested QB formula; numbers unverifiable
Official QB-AdvMath skeleton (extraction, gaps elided): "The first term of a sequence is __. Each term
after the first is _ times the preceding term. If __ represents the _th term of the sequence, which
equation gives __ in terms of __?" PT1 compresses to "Which of the following equations gives the nth
term, a(n), of the sequence?" **Fix:** adopt the attested two-part formula ("If a(n) represents the nth
term of the sequence, which equation gives a(n) in terms of n?" — ~33 prose words, inside the abstract
cap). Also: the official item's first term/ratio are stripped by extraction — have a human confirm the
official pair isn't (5, 3) before shipping (collision risk currently unverifiable).

### F10 (MINOR) — M3-Q7 stem wording is off-formula
"The graphs of the two equations in a system of two linear equations are shown." — the "two…two" stack
isn't the corpus formula ("The graph of a system…" is attested in QB-Algebra). **Fix:** "The graphs of
the equations in a system of two linear equations are shown. What is the solution (x, y) to the system?"

### F11 (MINOR) — Volume-formula policy is internally inconsistent (M3-Q10 vs M4-Q11)
M3-Q10 hands over "(The volume V of a sphere with radius r is given by V = (4/3)πr³.)" — but the official
QB sphere item ("A sphere has a radius of _ feet. What is the volume…?") gives NO formula in the stem
(reference sheet), and the app's own PT5-M4-Q8 silo cylinder also gave none, as does M4-Q11 here. The
parenthetical is blueprint-mandated, so keep it only if the app player really lacks a reference sheet —
otherwise drop it for corpus fidelity. Either way the form should follow ONE rule for formulas of equal
exoticness (sphere given, cylinder not, is the current mismatch a sharp-eyed tutor would catch).

### F12 (MINOR) — M4-Q22 passage uses raw Unicode superscripts instead of the app's `<sup>` convention
Passage: `⁴√x³ · ⁶√x⁵ = xᵏ` — every other passage in the form encodes exponents as `<sup>…</sup>`
(§8 contract: "Exponents `<sup>2</sup>`"). The rationale also uses fragile stacks ("x³⁄⁴ ⁺ ⁵⁄⁶").
**Fix:** `<sup>4</sup>√x<sup>3</sup> · <sup>6</sup>√x<sup>5</sup> = x<sup>k</sup>` (index-radical
approximation consistent with house markup), and smooth the rationale to "x^(3/4) can be rewritten…"
prose forms already used elsewhere ("x³⁄⁴, or x^(3/4)-style"). Verify rendering in the player either way.

---

## 3. Per-item verdicts

### Module 3
| # | Verdict | Notes (evidence in findings above) |
|---|---|---|
| 1 | PASS | Key 11 ✓; echo distractors 7/15 verbatim; liturgy clean. |
| 2 | PASS | 34,500/15 = 2,300 ✓. Add/subtract distractors initially looked noise-like, but official PT7's raccoon-density item (A 18 key / B 131 area echo / C 149 = 18+131 / D 2,376 = 2,358+18) licenses exactly this grammar. |
| 3 | PASS | Table 4/12/36 → 4(3)ˣ ✓; dismissals verify f(0)/f(2) values (256, 576 recomputed ✓). |
| 4 | PASS | Bare-number "best interpretation of 40 in this context?" matches official PT4's "best interpretation of 25 in this context?" verbatim formula ✓; alternate-world dismissals present. |
| 5 | PASS | f(8) = 16 ✓; 12 entries ≤5 chars ✓. |
| 6 | PASS (note N2) | 4.65 ✓; entry note ✓. "What number is 15% of 31?" unattested in the 8-file corpus (nearest: "__ is __% of what number?"). Plausible CB; verify or accept. |
| 7 | FLAG MINOR (F10) | Intersection (2, 5) verified against SVG pixel map ✓; reversal bait ✓. Stem wording off-formula. |
| 8 | PASS | 34 + 78 = 112 ✓; supplement 68 ✓; figure carries scale note ✓ (drawn not-to-scale is licensed by the note). |
| 9 | PASS | b = 8 ✓; price-swap distractor provably lands on 16 ✓; 264/24 = 11 ✓; Ibrahim corpus-clean (0 hits). |
| 10 | FLAG MAJOR (F1) + MINOR (F11) | 288π ✓ math; ladder distractors (36π diameter / 48π r² / 144π surface area) ✓. Constant collides with M4-Q11; formula-parenthetical policy inconsistent. |
| 11 | PASS | −9/4 ✓; standing reciprocal trio verbatim ✓; ascending ✓. |
| 12 | PASS | 9/6 = 3/2 ✓; curve passes through both labeled points in the SVG (pixel-verified) ✓; entry note ✓. |
| 13 | PASS | 20-21-29 ✓; "441/841" corpus hits are noise (question IDs, x² = −841 item). |
| 14 | PASS | Vertex x = 4, min 5, f(0) = 21 ✓; value-vs-location trap clean. |
| 15 | FLAG MINOR (F2) | (x+8)(x−6) ✓, lone correct factor verified by substitution ✓. Straight `isn't`. |
| 16 | PASS (note N4) | 0.18 × 4,500 = 810 ✓. Bank lists point-estimate scale-up as E; delivered as M per blueprint — texture stretch, acceptable. |
| 17 | FLAG MINOR (F2) | k = 12 ✓; each echoed distractor shown to give exactly one solution ✓. Straight `it's`. |
| 18 | FLAG MINOR (F2) | Range −7 ≤ x ≤ 3 ✓; endpoints attained, interior real ✓; CAPS NOT ✓. Straight `can't`. |
| 19 | PASS | 14 × 19 = 266 ✓; −19 rejected in rationale ✓; "266" corpus hit is a question-ID. |
| 20 | PASS | 25% compound → 5,000 ✓; linear-add bait 4,800 ✓. "increases by the same percent" phrasing unattested in corpus but matches playbook archetype B (note N3). |
| 21 | FLAG MINOR (F2) + note N1 | c/a = 13/2 ✓; discriminant 17 resists solving ✓; sum 11/2 beside it ✓. Straight `isn't`. "product of the solutions" absent from the 8-file corpus (blueprint claims bank attestation; operational CB uses the sibling "sum of the solutions" — low risk). |
| 22 | FLAG MINOR (F2) | k² = 196, least = −14 ✓; +14 correctly excluded from accepted list ✓. Straight `isn't`. |

### Module 4
| # | Verdict | Notes |
|---|---|---|
| 1 | FLAG MINOR (F6, F7) | Math/options ✓ (house distractor architecture confirmed against PT5-M4-Q1). Same-slot skeleton echo; corpus name Hana. |
| 2 | PASS | 4x² + 8x + 9 ✓; three sign-distribution variants each recomputed ✓. |
| 3 | PASS | Parallel slope 4 ✓; opposite/reciprocal/negative-reciprocal trio ✓; deliberate stamped pair with M3-Q11 per blueprint. |
| 4 | PASS | 9/60 = 3/20 ✓; complement-denominator distractors ✓; table totals ✓. |
| 5 | PASS | 27 − 12 = 15 ✓. |
| 6 | PASS | y = 9 ✓; 15 entries ✓. |
| 7 | PASS | p(0) menu clean; distinct from app PT4's marsh-bird coefficient-interpretation (different surface, growth vs decay, sentence menus). |
| 8 | PASS | 4r + 20 ≤ 92 ✓; 2×2 direction/coefficient family ✓. |
| 9 | FLAG MINOR (F8) | 9x = 54 → 36 ✓; other-quantity trio ✓. Key 36 duplicated with Q14. |
| 10 | PASS (note N5) | Bar heights decode to 30/50/5/45/25/50/40 ✓; median 40, mean 35, range 45, mode 50 — the standing quartet ✓. Weekday-median skeleton is a display-swapped sibling of app PT4-M3-Q7 (table→bar graph; acceptable stamping). Micro-nit: "cups of smoothies… smoothie stand" double-smoothie; "the number of cups a certain smoothie stand sold" is drier. |
| 11 | FLAG MAJOR (F1) | h = 8 ✓; slip family (d², d, unsquared) ✓. Carries the 288π/r = 6 collision — retune per F1. |
| 12 | PASS | 17 × 60 = 1,020 ✓; sole legal entry "1020" ✓; prose "1,020" vs entry "1020" is the documented comma convention. |
| 13 | FLAG MINOR (F3) | (2x − 5)(3x + 4) ✓; −4/3 rejected ✓; entries ✓. Missing "Therefore," close. |
| 14 | FLAG MINOR (F8) | 18(8/4) = 36 ✓; reversed-ratio and additive distractors match the official two-trees shadow recipe set. Key duplication with Q9 — retune to 27 per F8. |
| 15 | PASS (F4 borderline) | (2, 6) satisfies both ✓; A/D parabola-only, C line-only, each dismissed by substitute-and-fail ✓. Rationale 199 words, a hair over the medium band. |
| 16 | FLAG MINOR (F4, F5) | floor(1,520/120) = 12 ✓; 13 overloads ✓; 14 ignores smalls ✓; 27 mirrors ✓. Rationale 226 words; PT4-elevator sentence skeleton. |
| 17 | PASS | Adding rearranged equations → 2x + 2y = 22 → 11 ✓; solution (15/2, 7/2) non-integer ✓; distractors = y, x, 2x+2y ✓. Distinct from official PT5's "−5y = 5x − 21…30x" item and app PT5's 5x+3y/3x+5y SPR. |
| 18 | FLAG MINOR (F4) | Center (1, 1), r = 5 ✓; sign/RHS single-slot variants ✓. Rationale 264 words (hard cap ≈247) — compress. |
| 19 | PASS | m = 6, b = 1, f(20) = 121 ✓; corpus "121" hits are unrelated (r² = 121 circle, 121 eggs). |
| 20 | FLAG MINOR (F9) | 5(3)ⁿ⁻¹ ✓; n vs n−1 family exactly as mandated; each distractor's first term recomputed ✓. Stem formula + official-number verification per F9. |
| 21 | PASS (note N6) | Scatter decodes to ≈480→66 over 9 years, ratio ≈0.8 ✓; menu (1−b / key / 1/b / a) ✓; *Petrobrachys sylvicola* corpus-clean ✓; stem ≈71 math-stripped words (raw 78) — at the 75 cap, do not let it grow. Official QB has an invasive-beetle declining-exponential interpretation item — different archetype/visual, acceptable distance. |
| 22 | FLAG MINOR (F12) | 3/4 + 5/6 = 19/12 ✓; 1.583 truncation/rounding coincide ✓. Unicode-superscript passage markup. |

---

## 4. Trap tally vs blueprint/spec §5

| Mechanism | Spec target | Blueprint | Delivered | Items |
|---|---|---|---|---|
| answer-the-wrong-target | ~3 | 3 | 3 | M3-14 (value/location pressure), M3-21, M4-17 |
| slope-intercept / role swap | ~3 | 3 | 3 | M3-11, M4-1, M4-3 |
| solution-count & discriminant parameter | ~2 | 2 | 2 | M3-17, M3-22 |
| sign-slip bait | ~2 | 2 | 2 | M4-2, M3-15 |
| percent-multiplier semantics | ~1 | 1 | 1 | M3-20 |
| radius/diameter, length-vs-area scale | ~1–2 | 2 | 2 | M4-11, M4-18 |
| formula-fragment omission | ~1 | 1 | 1 | M3-10 |
| interpretation mis-mapping menu | ~2 | 2 | 2 | M3-4, M4-7 |
| exponent-structure conversion | ~1 | 2 | 2 | M4-20, M4-22 |
| statistical-robustness reasoning | ~1 | 1 | 1 | M4-21 |
| must-be / CANNOT quantifier | ~1 | 1 | 1 | M3-18 |
| extraneous/nonreal-solution awareness | ~1 | 1 | 1 | M3-22 (also served by M4-13/M3-19 root rejection) |
| function-notation nesting | ~1 | 0 | **0** | — (blueprint dropped it; spec-level gap, not an item defect) |
| verbatim-number echo | pervasive (easy) | ✓ | ✓ | M3-1, M3-8, M3-9, M3-16, M3-17 option sets |
| other §4 recipes (wrong operation, wrong denominator, reversed ratio, step-skip, boundary, wrong anchor, adjacent quartet, ordered-pair reversal) | — | as assigned | as assigned | M3-2/7/8/9/16, M4-4/9/10/14/15/16 |

One mechanism per item confirmed — no double-trapped item found (M3-22's triple appearance above is
the blueprint's own accounting quirk; the item carries a single decision). The only quota deviation
from spec §5 is the missing nesting item, inherited from the blueprint.

## 5. Originality-collision results

**Verbatim collisions: none.** Probes run (contexts): kayak, boathouse, bacteria, beetle, smoothie,
wrapping, landscap-, fern, shrub, ornamental, bottling, tool kit, rooftop, solar panel, harvest,
festival, population density, flagpole, signpost, shadow, animal shelter, cargo trailer, diagnostic,
Ibrahim, Hana, Petrobrachys, sylvicola. (numbers/equations): 34,500 · 2,300 · 55h · 40−3x · 15% of 31 ·
4.65 · 2x−7 · 264 · 288 · 4/9 · (1,4)/(7,13) · 441/841 · x²−8x+21 · x²+2x−48 · 4,500/810 · 5(kx ·
60x+15 · (x+2)²… · 266 · 3,200/4,000 · 2x²−11x+13 · kx+49 · 7x²+2x+5 · 4x+7 · x³−4x · 3x+5y · 150(2) ·
4r · 1,700/120/45 · 7x−3y · 5y=5x · (−3,4) · f(3)=19/f(7)=43 · 5(3) · 6x²=7x+20 · 51 bottles ·
19/12 · 1020 · 121 · 480. All hits were either question-ID noise, unrelated items, or resolved
neighbors:

| Probe | Where | Resolution |
|---|---|---|
| "Hana" | official PT4 + QB-AdvMath | name-only reuse → F7 |
| beetle (declining exponential) | QB-AdvMath interpretation item | different archetype/visual → note N6 |
| bacteria + base 2 | QB-AdvMath & PT7 doubling-time item (40,000(2)^(t/790)) | different question (interpretation vs doubling time) → PASS |
| population density | QB-PSDA (Iceland, Worthington), PT7 (raccoons 2,358/131) | same attested archetype, distinct numbers/context; PT7's distractor grammar licenses M3-Q2's set → PASS |
| shadows | QB-Geo two-trees item | attested archetype, distinct objects/numbers → PASS |
| crate/weight-cap skeleton | app PT4-M3-Q16 | different archetype, verbatim-shape sentences → F5 |
| flat-fee + hourly, slot M4-Q1 | app PT5-M4-Q1 | stamped sibling in same slot → F6 |
| weekday median, 7 days | app PT4-M3-Q7 (table) | display swapped to bar graph, numbers/statistic distractors differ → note N5 |
| 5y = 5x − 20 | official PT5 has "−5y = 5x − 21" system (asks 30x) | different system/target → PASS |
| 60x + 15 | app PT4 "60x + 150y" inequality | prefix false-positive → PASS |
| "sequence… nth term" | QB-AdvMath stamped skeleton, numbers stripped by extraction | confirm official first-term/ratio ≠ (5, 3) → F9 |
| **288π internal** | **M3-Q10 ↔ M4-Q11** | **→ F1 (MAJOR)** |
| 36 as key twice | M4-Q9 ↔ M4-Q14 | → F8 |

Intra-form scan otherwise clean: no context repeats across the 44 (two "town" settings in M3 — density
Q2, survey Q16 — are distinct scenarios and within CB's observed reuse of "a certain town"); the
M3-Q11/M4-Q3 parallel/perpendicular pair and the 14/−14 SPR pair are blueprint-engineered stamps, not
collisions. Exactly 2 named people (one per module), exactly 1 invented Latin binomial (M4-Q21), 0 brand
names, 0 "you", 0 imperatives, 0 second questions, 0 exclamation points (machine-checked).

## 6. Authenticity gestalt (read-through)

**Module 3 — 9/10.** The ramp reads real: eight instant-answer openers, the licensed dip at Q9/Q10,
mediums that each hinge on one selection (perpendicular ≠ reciprocal, factor signs, sample→population
anchor), and a hard band of short stems that collapse structurally (k-matching, radius bounds, Vieta,
discriminant). Easy items carry honest recognition bait. What breaks the spell, mildly: the sphere
formula parenthetical (official items lean on the reference sheet) and Q7's "two…two" stem wording.

**Module 4 — 8/10.** Same authentic texture item-by-item — Q17 is a genuinely CB-feeling wrong-target
system and Q21's no-computation b-reasoning is the best item in the form. The illusion-breakers are
repeats, not register: 288π arriving twice in one sitting (F1), the M4-Q1 kayak/parking same-slot stamp
(F6), the PT4 crate-sentence skeleton at Q16 (F5), and 36 landing twice as key D (F8). Two hard
rationales also run past the official length band (F4) — bloat is a prep-book tell even when liturgy is
correct.

Items that most break the illusion, in order: **M4-Q11 (with M3-Q10), M4-Q1, M4-Q16, M4-Q9/Q14 pair,
M3-Q10's parenthetical.** All are cheap fixes; none touches the math design.

## 7. Notes (no action required unless flagged above)
- N1: "product of the solutions" (M3-Q21) not in the 8-file corpus; operational CB uses the sibling stem. Keep.
- N2: "What number is 15% of 31?" (M3-Q6) unattested in corpus; blueprint-mandated phrasing. Verify or keep.
- N3: "increases by the same percent" (M3-Q20) unattested in corpus; playbook §2.10-B endorses. Keep.
- N4: M3-Q16 point-estimate archetype labeled M (bank shows E); blueprint-assigned. Keep.
- N5: M4-Q10 "cups of smoothies… smoothie stand" double noun; "the number of cups a certain smoothie stand sold" is drier.
- N6: M4-Q21 stem sits at the 75-word stat cap (math-stripped ≈71); do not expand.
- N7: SPR accepted-answer format matches the PT5 house enumerator exactly (spot-checked against practiceTest5Math.json lists).
- N8: SVGs decode correctly (M3-Q7 intersection, M3-Q12 curve points, M4-Q10 bar heights, M4-Q21 decay ratio all pixel-verified); conventions (Georgia serif, #cccccc grid, O origin, arrows, scale note only on geometry figures) hold.
- N9: M3-Q8's figure angles are not drawn to measure — licensed by its "Note: Figure not drawn to scale."
- N10: Form-level quotas verified: domains 15/13/9/7, all 19 skill counts, SPR census 8 int (1 neg, one 4-digit, one 3-digit) + 3 frac + 1 dec, visuals 4+4 with palette as assigned, probability M4-only, circles 1-per-module both hard, applied 15/44.
