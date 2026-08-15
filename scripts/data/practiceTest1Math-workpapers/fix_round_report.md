# PT1 Math M3/M4 — Fix Round 1 Report

Executor pass applying the orchestrator's adjudicated fix list F1–F12 (from
`critic_correctness_report.md` + `critic_style_report.md`). Every renumbered value was
re-derived by computation before writing; both verifiers were updated to the adjudicated
expectations and re-run to 0 FAIL / 0 WARN.

## Per-fix record

### F1 (MAJOR) — M4-Q11 cylinder retuned to (r = 4 cm, V = 128π) → h = 8
- **Recomputed:** 128π = π(4)²h = 16πh ⇒ h = 128/16 = **8**. Distractors re-derived from the
  named recipes: diameter-in-r² 128/8² = **2**; ÷diameter 128/8 = **16**; unsquared radius
  128/4 = **32**. Options rebuilt ascending **2 / 8 / 16 / 32**, key 8 at index 1 = **letter B**
  (module tally untouched by this fix). Avoids h = 12 (would duplicate M4-Q16's key) and the
  PT5 cylinder (r = 5, 300π, h = 12).
- **Changed:** stem ("radius of 4 centimeters… 128π cubic centimeters"), options, full §7
  rationale with the new numbers (each distractor's recipe named accurately: diameter 8 used
  for r; r² replaced with the diameter 8; radius not squared), `_distractorLogic`,
  `graphDescription` ("labeled 4 centimeters"), and `assets/PT1-M4-Q11.svg` label
  "6 cm" → "4 cm" (figure conventions, radius-to-rim segment, and the "Note: Figure not
  drawn to scale." caption all kept; drawn h:r = 144:72 px = 2 now matches 8:4 exactly).
- **Verifier:** Q11 block re-derives 128/16, recipes 2/16/32, "4 cm" label, and the stem pair;
  the deliberately encoded 288π-collision FAIL was replaced by three positive checks
  (sphere keeps r = 6/288π; cylinder is 4/128π; no shared pair). All PASS.

### F2 — M4-Q14 rekeyed 36 → 32, staying at letter D
- **Recomputed:** signpost 8 ft / 4-ft shadow, flagpole shadow **16 ft** ⇒ h = 16(8/4) = **32**
  (one-step proportion). Distractors from the standing recipes: reversed ratio 16(4/8) = **8**;
  additive 16 + (8 − 4) = **20**; height added to shadow 16 + 8 = **24**. Options ascending
  **8 / 20 / 24 / 32**, key at index 3 = **letter D** (unchanged). The 8 echoing Q11's key value
  appears only as a distractor — adjudicated harmless. No more duplicate of M4-Q9's 36-at-D.
- **Changed:** stem (18 → 16; applied register and unit commas kept), rationale (all numbers,
  proportion h/16 = 8/4), `_distractorLogic`.
- **Verifier:** Q14 block re-derives 16·(8/4) = 32 and recipes 8/20/24; a key-letter-D check
  added; the module dup-key warn is now a check (no repeated keyed value in M4). All PASS.

### F3 — M3-Q08.svg drawn angle rank order restored
- The correctness critic's suggested apex (150, 80) was re-measured and does **not** restore
  rank order (drawn ∠A ≈ 72.9°, ∠B ≈ 55.2° — still inverted). Per the fix list's latitude
  ("or any position achieving drawn-rank consistency"), the apex was moved to **(112, 52)**:
  drawn **∠A ≈ 58.2° < ∠B ≈ 73.6°**, so the 78°-labeled angle is now drawn larger than the
  34°-labeled angle; the drawn exterior angle (≈ 131.8°) remains clearly the largest, matching
  x = 112 as the largest label. A-vertex label moved to (112, 42); 34° label to (116, 90),
  verified inside the triangle (interior span at y = 90 is x ∈ [101, 146]); 78°, x°, B/C/D
  labels, baseline, and the "Note: Figure not drawn to scale." caption untouched.
- **Verifier:** apex constant updated; a check pins the drawn sides to (70,195)→(112,52) and
  (112,52)→(240,195); the rank-order warn became a hard check (M3's former 1 WARN → 0 WARN).

### F4 — M4-Q21 graphDescription accuracy
- Replaced the monotone overclaim ("with the yearly decreases becoming smaller over time" —
  drawn decreases are 90, 90, 50, 60, 30, 40, 15, 27, 12, not monotone) with:
  "The estimated number of beetles **generally decreases** as the number of years after 2010
  increases, from about 480 beetles at 0 years to about 66 beetles at 9 years."
- **Verifier:** the alt-text warn became a check ("becoming smaller" absent, "generally
  decreases" present, drawn decreases printed as evidence). PASS.

### F5 — M3 straight apostrophes → curly
- All 7 straight apostrophes found by full-file sweep were converted: explanations of Q15
  (isn't → isn’t), Q17 (it's → it’s), Q18 (can't → can’t), Q21 (isn't → isn’t), Q22
  (isn't → isn’t), plus two `_sprForms` annotations ("the form's" → "the form’s", Q6 and Q22)
  so the file matches M4's 100%-curly state. JSON syntax untouched.
- **Post-fix sweep: straight-apostrophe count = 0 in M3 and 0 in M4** (all string values).
  Both verifiers now carry a zero-straight-apostrophe check. PASS.

### F6 — M4-Q13 "Therefore" restatement
- Appended before the entry-forms note: "Since −4/3 is negative, 5/2 is the only positive
  solution to the given equation. **Therefore, the positive solution to the given equation is
  5/2.** Note that 5/2 and 2.5 are examples of ways to enter a correct answer." SPR skeleton
  kept, no dismissal formulas added. Verifier check added (restatement present exactly once).

### F7 — Rationale length trims
- **M4-Q16: 226 → 195 words (≤ 196 medium cap).** Dropped the double-verification clause for
  the key ("carrying 12 large … 1,620 pounds, which is at most 1,700 pounds"); all skeleton
  steps (least smalls → 180 → 1,520 → 12.67 → whole-number 12), the Therefore close, and all
  three dismissal formulas (including the 13-overload computation 1,740) kept. Wording follows
  the F10 restructure (pallets, load limit).
- **M4-Q18: 264 → 239 words (≤ 246 hard cap).** Compressions: midpoint sentence merged
  ("The center of a circle is the midpoint of any diameter, so the center of this circle is
  ((−3 + 5)/2, (4 + (−2))/2), or (1, 1)."), radius distance tightened (dropped "or √(16 + 9),"),
  and the substitution sentence no longer repeats the general form. Skeleton and all three
  dismissal formulas intact.
- Other touched rationales confirmed in band: Q1 = 153 (≤ 159 easy), Q11 = 162, Q14 = 183
  (≤ 196 medium), Q20 = 240 (≤ 246 hard). Word-cap checks for Q16/Q18 added to the verifier.

### F8 — M4-Q22 passage markup
- Passage now reads
  `<div style="text-align:center; margin:8px 0;"><sup>4</sup>√x<sup>3</sup> · <sup>6</sup>√x<sup>5</sup> = x<sup>k</sup></div>`
  — house `<sup>` convention, x<sup>k</sup> target, centered div kept. Stem's "true for all
  x > 0, where k is a constant" declaration untouched; options/answer untouched (SPR, census
  19/12 unchanged). Verifier checks the exact markup and the absence of raw Unicode
  superscripts (⁴√, xᵏ) in the passage. PASS.

### F9 — M4-Q1 renamed and de-cloned
- **Hana → Priya** (from the style critic's verified corpus-absent list). Texture varied from
  app PT5-M4-Q1 (parking garage, $4 + $3/hr, y/x): one-time **equipment fee $14** plus
  **non-integer $9.50 per hour**, variables **C/h**, and the canonical closer "…which equation
  represents this situation?" Key **C = 9.50h + 14 at letter A** (tally slot unchanged).
  Single-slot variant family rebuilt on the new numbers: role swap C = 14h + 9.50; sum-as-slope
  (9.50 + 14)h = **C = 23.50h**; product-as-slope (9.50)(14)h = **C = 133h** — coefficient-
  ascending 9.50 / 14 / 23.50 / 133. Rationale and `_distractorLogic` rewritten accordingly.
- **Verifier:** Q1 strings, both name checks (exactly one named person per module = Ibrahim,
  Priya; names don't cross modules), and a Hana-absent check. All PASS.

### F10 — M4-Q16 stem de-skeletoned
- "A delivery trailer **has a load limit of** 1,700 pounds. The trailer will be loaded with
  large **pallets that weigh 120 pounds each** and small pallets that weigh 45 pounds each.
  If the trailer carries at least 4 small pallets, …" — noun changed crates → pallets and the
  PT4 "can carry a total weight of at most X pounds. Each … weighs …" sentence order broken.
  All numbers kept; optimum re-verified by brute force: max L with 120L + 45·4 ≤ 1,700 is
  **12** (1,620 ≤ 1,700; 13 ⇒ 1,740 breaks); distractors 13/14/27 recipes still exact
  (floor(1,700/120) = 14; floor((1,700 − 480)/45) = 27). Key 12 and option set unchanged.
- **Verifier:** brute-force block unchanged (passes); added checks that "crate" is gone and
  the old opening skeleton is not used.

### F11 — M4-Q20 sequence: attested stem + (4, 6)
- Stem now prose-defines the sequence then uses the attested QB formula: "The first term of a
  sequence is 4. Each term after the first is 6 times the preceding term. **If a(n) represents
  the nth term of the sequence, which equation gives a(n) in terms of n?**"
- **Recomputed:** sequence 4, 24, 144; only **a(n) = 4(6)ⁿ⁻¹** fits n = 1, 2, 3. Option family
  as adjudicated: 4(6)ⁿ (first term 24), 6(4)ⁿ⁻¹ (first term 6), 24ⁿ⁻¹ (first term 1).
  Coefficient-ascending typography (4, 4, 6, 24; within the 4(6) pair, exponent ascending
  n − 1 < n) places the key at **letter A** — the key letter changed from the budgeted C, so
  the tally was re-balanced as the fix list provides: **M4 = A5/B5/C3/D3, all within ±1 of
  flat** (no other item touched). Rationale and `_distractorLogic` rewritten; dismissal first
  terms 24/6/1 verified.
- **Verifier:** Q20 block re-derives the fit vector [True, False, False, False], key index 0,
  dismissal first terms, and the attested stem string. All PASS.

### F12 — Blueprint bookkeeping
- Appended "## Blueprint latitudes exercised in authoring (recorded, binding going forward)"
  to `C:\Users\Test1\CascadeProjects\ultrasat\docs\analysis\PT1_math_blueprint.md` in the PT5
  blueprint's intro-plus-table style, recording L1 (M3-Q10 sphere formula given — app player
  has no reference sheet), L2 (nesting-trap gap inherited, booked for PT6), L3 (M4-Q11 retuned
  to r = 4/128π/h = 8 post-critique), L4 (M4-Q20 (4, 6) + a(n) stem, key A, tally A5/B5/C3/D3),
  L5 (M4-Q1 texture varied from the PT5 same-slot sibling).

## Verification evidence

Verifier runs (updated expectations encode the adjudicated values; every other check is the
original independent re-derivation):

```
$ python3 verify_pt1_M3.py    → exit 0
  499 PASS
  PASS  key-letter tally {'A': 4, 'B': 4, 'C': 4, 'D': 4} within 4/4/4/4 +-1
FAILURES: 0   WARNINGS: 0
ALL CHECKS PASSED (M3)

$ python3 verify_pt1_M4.py    → exit 0
  457 PASS
  PASS  key-letter tally {'A': 5, 'B': 5, 'C': 3, 'D': 3} within 4/4/4/4 +-1
FAILURES: 0   WARNINGS: 0
ALL CHECKS PASSED (M4 + form)
```

Independent post-fix sweep (separate script, all PASS):
- Both JSONs parse; **straight apostrophes in prose = 0** (M3 and M4, every string field).
- No HTML in any MC option; every numeric option set strictly ascending (13 sets in M3,
  9 in M4 — including the rebuilt Q11 2/8/16/32 and Q14 8/20/24/32).
- **SPR census unchanged:** M3 16, 4.65, 3/2, 29, 14, −14 | M4 15, 9, 1020, 5/2, 121, 19/12.
- **Key tallies:** M3 **4/4/4/4**; M4 **A5/B5/C3/D3** (within ±1 of flat).
- Word counts: Q16 = 195 ≤ 196; Q18 = 239 ≤ 246; Q1 = 153; Q11 = 162; Q14 = 183; Q20 = 240.
- Both touched SVGs parse as well-formed XML (ElementTree): PT1-M4-Q11.svg labels "4 cm" +
  scale note, matching the retuned stem; PT1-M3-Q08.svg apex measured from the drawn lines at
  (112, 52) with ∠A = 58.2° < ∠B = 73.6°, exterior ≈ 131.8° (largest), all labels + caption
  present, 34° label anchor inside the triangle.

Deviation note (for the record): the correctness critic's illustrative apex (150, 80) was
re-measured and found not to restore rank order; (112, 52) was chosen under the fix list's
explicit "any position achieving drawn-rank consistency" latitude. No other deviation from
the adjudicated list.
