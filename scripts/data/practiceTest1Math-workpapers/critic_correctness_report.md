# PT1 Math M3/M4 — Adversarial Math-Correctness Critique (Round 1)

Critic: independent re-derivation of all 44 items. Nothing the writers claimed was trusted:
every key was re-solved from the stem alone (sympy/exact rational arithmetic), every MC
option was tested against the stem's conditions, every `_distractorLogic` recipe was
recomputed, all 12 SPR `acceptedAnswers` lists were regenerated from scratch with the
spr_enum logic and diffed exactly, and all 6 SVGs were parsed and re-measured
coordinate-by-coordinate against stem, key, and rationale. A signature sweep against
PT4/PT5 (annotated workpapers) checked the context/number firewall.

Verification scripts (run clean end-to-end from this directory):
- `verify_pt1_M3.py` — exit 0: **496 PASS, 0 FAIL, 1 WARN**
- `verify_pt1_M4.py` — exit 1: **439 PASS, 1 FAIL, 2 WARN** (the single FAIL is defect
  D1 below, deliberately encoded; the script goes green once D1 is fixed)

## Verdict summary

| Severity | Count | Items |
|---|---|---|
| BLOCKER (wrong/ambiguous math) | **0** | — |
| MAJOR (accepted-answer / structural / SVG inconsistency) | **1** | D1: M3 Q10 ⇄ M4 Q11 |
| MINOR (polish) | **3** | D2: M4 Q9+Q14 · D3: M3 Q8 figure · D4: M4 Q21 alt text |

Every one of the 44 keys is correct and unique. All 32 MC items have exactly one
defensible answer (each distractor was substituted/tested — none survives any reasonable
alternate reading). All 96 distractor recipes reproduce their printed values exactly.
All 12 SPR lists match the machine enumeration form-for-form (0 missing, 0 illegal).

---

## Defect register

### D1 — MAJOR — Cross-item number-set collision: M3 Q10 and M4 Q11 share (r = 6, V = 288π)
- **Finding.** M3 Q10 (sphere): r = 6 ⇒ V = (4/3)π·216 = **288π**, the keyed answer.
  M4 Q11 (cylinder): stem *gives* r = 6 cm and V = **288π** cm³ ⇒ h = 8. The form's only
  two area-volume items reuse the identical (radius, volume) pair, and M3's keyed answer
  string reappears verbatim as M4's given. Spec §9.7 ("contexts must also not collide with
  each other across the 44 items") and the blueprint's form-level "zero number collisions"
  check both prohibit this; it is also exactly the pattern a student notices across modules.
- **Independent derivation.** Sphere: (4/3)π6³ = 288π (verified). Cylinder: 288π/(π·6²) = 8
  (verified). Both items are individually airtight — the defect is the shared number set.
- **Minimal fix.** The sphere is arithmetically locked (r = 6 is the smallest radius that
  keeps the key AND the diameter-slip distractor (4/3)π(3)³ = 36π clean), so move the
  cylinder: **r = 4 cm, V = 128π** ⇒ h = 128/16 = **8** (key value and key letter B both
  preserved, module tally untouched). Recipes re-run cleanly: d² slip 128/8² = **2**,
  ÷d slip 128/8 = **16**, unsquared 128/4 = **32** → options 2 / 8 / 16 / 32, strictly
  ascending, all distinct. Collateral edits: stem text ("radius of 4 centimeters …
  128π cubic centimeters"), explanation numbers (128π = 16πh), `_distractorLogic`,
  SVG label "6 cm" → "4 cm", and graphDescription. Checked fresh against PT4/PT5
  (PT5's cylinder was r = 5, h = 12, V = 300π — do NOT use 300π/12) and against all
  PT1 keyed values (h = 12 would have duplicated M4 Q16's key; h = 8 is safe).

### D2 — MINOR — M4 has two MC items keyed to the same value AND letter: Q9 = 36 (D), Q14 = 36 (D)
- **Finding.** Q9 (ornamental grasses 6x = 36) and Q14 (flagpole 18·(8/4) = 36) are both
  keyed **36**, both at **letter D**, in the same module. Below the 3+-repeat threshold,
  but a same-value/same-letter pair is the kind of coincidence CB forms avoid.
- **Independent derivation.** Q9: x + 2x + 6x = 54 ⇒ x = 6 ⇒ grasses 36 (unique). Q14:
  h/18 = 8/4 ⇒ 36 (unique). Both correct.
- **Minimal fix (optional).** Rescale Q14's flagpole shadow 18 → 16 ft: h = 16·2 = **32**;
  recipes stay clean (reversed ratio 16·(4/8) = 8, additive 16 + 4 = 20, added height
  16 + 8 = 24 → options 8/20/24/32 ascending, key still D). Note 8 then echoes M4 Q11's
  key value only as a distractor, which is harmless; any shadow length ∈ {14, 16, 22}
  with the 8:4 post works — avoid 18 (current), 20 (h = 40 = Q10's key), 22 (reversed
  ratio 11 = Q17's key).

### D3 — MINOR — M3 Q8 figure: drawn angle sizes invert the labeled order
- **Finding.** In PT1-M3-Q08.svg the angle labeled **34°** (at A) is drawn ≈ **62°** and
  the angle labeled **78°** (at B) is drawn ≈ **55°** — the visual rank order contradicts
  the labels. The mandatory caption "Note: Figure not drawn to scale." is present, so the
  item is defensible, but CB figures preserve rough rank order; a student sanity-checking
  by eye is misled. (The exterior angle itself is drawn ≈ 117° vs labeled 112° — fine.)
- **Independent derivation.** From the SVG coordinates A(170,55), B(70,195), C(240,195):
  ∠A = arccos(12600/(172.05·156.52)) ≈ 62.1°, ∠B ≈ 54.5°. Math of the item itself is
  correct: x = 34 + 78 = 112, supplement 68, all distractor recipes verified.
- **Minimal fix.** Move the apex to ≈ (150, 80): drawn ∠B ≈ 75°, ∠A ≈ 49°, restoring
  ∠A < ∠B with no other edits needed (labels/caption unchanged).

### D4 — MINOR — M4 Q21 graphDescription overclaims monotone shrinking decreases
- **Finding.** Alt text says the points fall "with the yearly decreases becoming smaller
  over time," but the drawn year-over-year decreases are 90, 90, 50, 60, 30, 40, 15, 27,
  12 — the trend shrinks, the sequence does not (three local rises). The scatter itself is
  excellent (exactly what realistic exponential-decay data should look like); only the
  alt-text sentence is stronger than the drawing.
- **Independent derivation.** Re-measured dot values: 480, 390, 300, 250, 190, 160, 120,
  105, 77.9, 66.0 (strictly decreasing ✓); every yearly ratio ∈ (0.74, 0.88) ✓; geometric
  decay factor (66.0/480)^(1/9) = **0.802** ⇒ 0.8 is the unique closest option ✓; a ≈ 480
  matches distractor D ✓; the rationale's quoted 480/390/300 match the drawing exactly ✓.
- **Minimal fix.** Reword the clause: "…falling steeply at first and more gradually in
  later years" (or delete it).

---

## Per-item verdicts — Module 3

| # | Skill | Independent result | Verdict |
|---|---|---|---|
| 1 | lin-eq-1var E | 2x−7=15 ⇒ x=11; distractors 4=(15−7)/2, 7, 15 all fail the equation | PASS |
| 2 | ratios E | 34,500/15 = 2,300 exact; −/+/× recipes reproduce 34,485/34,515/517,500 | PASS |
| 3 | NLF E | only f(x)=4(3)ˣ fits (0,4),(1,12),(2,36); A fails at x=0, C/D at x=1,2; 256/576 dismissal values verified | PASS |
| 4 | lin-func E | C(0)=40 ⇒ fee $40; C(1)=95 kills D; roles in A/C swapped as claimed | PASS |
| 5 | lin-func E SPR | f(8)=16; 12 accepted forms = machine enumeration exactly | PASS |
| 6 | percentages E SPR | 0.15·31 = 4.65 = 93/20; forms {4.65, 93/20, 4.650} exact; entry note present | PASS |
| 7 | systems E (SVG) | SVG re-measured: lines y=x+3, y=−2x+9; drawn intersection exactly (2,5) = key; y-intercepts (0,3),(0,9) = distractors; no scale note on grid | PASS |
| 8 | lines-angles E (SVG) | x = 34+78 = 112; 44/68/78 recipes verified; caption present; x° in the ACD region | PASS (D3 minor: drawn-angle rank order) |
| 9 | systems M | b+d=24, 7b+13d=264 ⇒ b=8 unique (d=16 checks: 56+208=264); 11=264/24, 16=price swap, 24 echo | PASS |
| 10 | area-volume E | (4/3)π6³ = 288π; 36π/48π/144π recipes verified | PASS (D1 major: pairs with M4 Q11) |
| 11 | lin-eq-2var M | ⊥ slope of 4/9 is −9/4; trio −4/9, 4/9, 9/4 verified; ascending | PASS |
| 12 | two-var-data M SPR (SVG) | (13−4)/(7−1)=3/2; 36 accepted forms exact; SVG dots exactly (1,4),(7,13) on a strictly rising curve; no scale note | PASS |
| 13 | right-tri M SPR | 21²+20²=841=29²; 12 forms exact | PASS |
| 14 | NLF M | vertex x=4 (f′=0); min value 5 and f(0)=21 are the distractors, −4 sign slip | PASS |
| 15 | equiv-expr M | x²+2x−48=(x+8)(x−6); of candidate roots 8/6/−6/−12 only 6 annihilates (values 32/0/−24/72) | PASS |
| 16 | inference M | (36/200)·4,500 = 810; 125 = 4,500/36 exact; 1,620 = 0.36·4,500 | PASS |
| 17 | lin-eq-1var H | 5k=60 ⇒ k=12 identity; k=−12/3/5 each give exactly ONE solution (verified), so no distractor defends | PASS |
| 18 | circles H | center (−2,4), r=5 ⇒ −7 ≤ x ≤ 3; −8 impossible; −7/3 attained at y=4, x=0 interior | PASS |
| 19 | NLF H SPR | w(w+5)=266 ⇒ w=14 (positive root; −19 rejected); 12 forms exact | PASS |
| 20 | percentages H | 800/3,200 = 25% exactly; 4,000·1.25 = 5,000; 1,000/4,800/6,000 recipes verified | PASS |
| 21 | NLE H | product = c/a = 13/2 (disc 17 > 0 so roots real); sum 11/2 = distractor C; sign variants A/B | PASS |
| 22 | NLE H SPR | k² = 196 ⇒ k = ±14, least −14; 12 forms exact (6-char minus rule); +14 correctly NOT accepted | PASS |

M3 structure: curve 8E+M(9)+E(10)+6M+6H ✓ 9E/7M/6H ✓ SPR 5/6/12/13/19/22 E/E/M/M/H/H ✓
key tally A4/B4/C4/D4 ✓ ascending sets ✓ options plain-text ASCII ✓ liturgy complete on
all 22 ✓ centered-div/table conventions ✓ subcategory↔id map ✓ blueprint slot-for-slot ✓.

## Per-item verdicts — Module 4

| # | Skill | Independent result | Verdict |
|---|---|---|---|
| 1 | lin-func E | y = 9x+12; swap 12x+9, (9+12)x = 21x, 9·12x = 108x verified | PASS |
| 2 | equiv-expr E | difference = 4x²+8x+9 (sympy); all three sign/add recipes reproduce A/B/D exactly | PASS |
| 3 | lin-eq-2var E | parallel slope 4; trio −4, −1/4, 1/4 | PASS |
| 4 | probability E | 9/60 = 3/20; table sums to 60; 1/10 bird, 3/17 complement denominator, 17/20 complement | PASS |
| 5 | NLF E SPR | 27−12 = 15; 12 forms exact | PASS |
| 6 | lin-eq-2var E SPR | (57−12)/5 = 9; 15 forms exact (incl. 90/10, 99/11, 9.000) | PASS |
| 7 | NLF E | p(0)=150 initial count; D falsified (increases 150 then 300, not constant) | PASS |
| 8 | lin-ineq E | 4r+20 ≤ 92; direction/coefficient single-slot variants | PASS |
| 9 | lin-eq-1var M | 9x = 54 ⇒ grasses 36; 6/12/18 = ferns/shrubs/both | PASS (D2 minor: dup 36 with Q14) |
| 10 | one-var-data E (SVG) | bars re-measured 30/50/5/45/25/50/40 (exact on the 4px scale); median 40 = key; mean 245/7 = 35, range 45, mode 50 = distractors; rationale list matches drawing | PASS |
| 11 | area-volume M (SVG) | 288π/36π = 8; 2/24/48 recipes verified; caption + "6 cm" radius-to-rim segment verified | PASS (D1 major: pairs with M3 Q10) |
| 12 | ratios M SPR | 51/3 = 17, ×60 = 1,020; ["1020"] is the complete legal set (all other forms >5 chars) | PASS |
| 13 | NLE M SPR | 6x²−7x−20 = (2x−5)(3x+4); roots 5/2, −4/3; positive 5/2; 22 forms exact; no negative form accepted | PASS |
| 14 | lines-angles M | 18·(8/4) = 36; 9 reversed, 22 additive, 26 height-added | PASS (D2 minor) |
| 15 | NLE M | full solution set {(2,6),(5,9)}; among options only (2,6) satisfies both; A/D quadratic-only, C line-only (each verified) | PASS |
| 16 | lin-ineq M | brute force over all S ≥ 4: max L = 12 (1,620 ≤ 1,700; 13 ⇒ 1,740 breaks); 14 = smalls ignored, 27 = smalls maximized | PASS |
| 17 | systems H | x = 15/2, y = 7/2 (substituted back: 105/2−21/2 = 42 ✓, 35/2 = 75/2−40/2 ✓); x+y = 11; distractors y, x, 2x+2y | PASS |
| 18 | circles H | midpoint (1,1); r² = 4²+3² = 25; both endpoints lie ONLY on option C (all four equations tested against both points) | PASS |
| 19 | lin-func H SPR | slope 24/4 = 6, b = 1, f(20) = 121; 10 forms exact | PASS |
| 20 | NLF H | only 5(3)ⁿ⁻¹ generates 5, 15, 45 at n = 1,2,3; first-term failures 3/15/1 verified | PASS |
| 21 | two-var-data H (SVG) | 10 dots strictly decreasing 480→66; fitted b = 0.802 ⇒ 0.8 uniquely closest; a = 480 = distractor D; 0.2 = 1−b, 1.25 = 1/b; no scale note; binomial present | PASS (D4 minor: alt-text clause) |
| 22 | equiv-expr H SPR | 3/4 + 5/6 = 19/12; 6 forms exact — including the subtle fact that truncation and half-up rounding of 1.5833… coincide at 1.583, so one decimal entry is correct | PASS |

M4 structure: curve 8E+M(9)+E(10)+6M+6H ✓ 9E/7M/6H ✓ SPR positions/difficulties ✓
key tally A4/B5/C4/D3 (within ±1) ✓ ascending sets ✓ plain-text ASCII options ✓ liturgy
complete ✓ conventions ✓ subcategory↔id map ✓ blueprint slot-for-slot ✓.

## Form-level results
- Domains: M3 ALG7/ADV6/PSDA5/GEO4, M4 ALG8/ADV7/PSDA4/GEO3 ⇒ form 15/13/9/7 ✓ blueprint.
- Skill census matches the blueprint exactly (18 skills; evaluating-statistical-claims 0;
  probability in M4 only; circles 1 per module, both hard).
- SPR census: 16, 4.65, 3/2, 29, 14, **−14** | 15, 9, **1020**, 5/2, **121**, 19/12 —
  8 integers (1 negative, 1 four-digit, 1 three-digit), 3 lowest-term fractions, 1 decimal ✓.
- Named people: exactly Ibrahim (M3 Q9) and Hana (M4 Q1), one per module ✓. One invented
  Latin binomial (Petrobrachys sylvicola, M4 Q21) — distinct from PT4's *Porzana lutescens*
  and PT5's *Rhizocarpon nivalescens* ✓.
- Firewall sweep vs PT4/PT5 annotated modules over ~60 signature strings (equations,
  number pairs, context words): **no real collisions**. (Three raw substring hits were
  inspected and are false positives: "4/9" inside PT4 accepted-fraction lists and a PT4
  trig SPR, "60x + 15" inside PT4's "60x + 150y" inequality, "5(3)" as arithmetic in a
  PT5 rationale.) PT5's cylinder (r = 5, h = 12, 300π) does not collide with PT1's — but
  constrains the D1 fix (avoid 300π/h = 12).
- Applied share 15/44 ✓ (M3: Q2, Q4, Q9, Q16, Q20; M4: Q1, Q4, Q7, Q8, Q9, Q10, Q12, Q14,
  Q16, Q21).
- Difficulty honesty: no easy item needs 3+ nontrivial steps; the two one-insight hard
  items (M3 Q21 Vieta, M4 Q17 add-the-equations) are the licensed wrong-target signatures —
  their "obvious" grind paths (quadratic formula; full solve to x = 15/2, y = 7/2) are
  long and unrewarded, which is the design. M4 Q16 (medium) is 3 mechanical steps — at the
  top of the medium band, position 16, acceptable.

## How to re-verify after fixes
```
python3 verify_pt1_M3.py   # expect exit 0, ALL CHECKS PASSED
python3 verify_pt1_M4.py   # expect exit 0 once D1 is fixed (update the collision check's
                           # visible-field probe if the cylinder numbers change)
```
Note: after re-parameterizing M4 Q11 per D1, also update that item's stem, options,
explanation, `_distractorLogic`, SVG radius label, and graphDescription together, then
update `verify_pt1_M4.py`'s Q11 block (288→128, recipes 2/16/32) so the whole suite
re-derives the new numbers rather than the old ones.
