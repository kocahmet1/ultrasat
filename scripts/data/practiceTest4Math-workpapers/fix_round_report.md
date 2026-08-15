# Fix-Round Report — PT4 Math Modules 3 & 4 (adjudicated fixes, 2026-08-14)

Editor pass applying the ADJUDICATED AND BINDING 12-fix list (verifier + critic reports), followed by
full re-verification. Files touched: `modules/M3.json`, `modules/M4.json`, `modules/assets/M3-Q08.svg`,
`modules/assets/M4-Q04.svg`, `modules/verify_M3.py`, `modules/verify_M4.py`, `modules/M3_selfcheck.md`,
`modules/M4_selfcheck.md`. No item outside the fix list was touched.

## 1. The 12 fixes — what changed

| # | Item | Before | After |
|---|---|---|---|
| 1 | M3 Q8 SVG | Canvas 340×350 — the only non-380px asset | 380×350; clean rescale (every x-coordinate +20, data mapping now px = 168 + 26x, 26px unit and all grid/axis/label conventions kept). Machine-checked: drawn segment still exactly y = 2x − 4 |
| 2 | M4 Q4 SVG | Vertical gridline at data x = 5 (px 200) missing from an otherwise complete unit lattice | `<line x1="200" y1="56" x2="200" y2="320"/>` added to the #cccccc group; verify_M4 now asserts the full vertical-gridline set (axis px 80 the only correct skip) |
| 3 | M3 Q15 metadata | `_distractorLogic` A claimed "−6x − 28x = −22x" (false arithmetic; −34x) | Note corrected to the real slip route: "6x − 28x = −22x (the negative sign applied to the wrong cross term)". Item and student-facing rationale untouched |
| 4 | M3 Q12 rationale | Ended with off-liturgy meta-sentence "It isn't necessary to find the value of w to answer the question." | Sentence deleted; rationale now ends on the §7 "Therefore," close. Everything else kept |
| 5 | M3 Q21 rationale | No "Therefore," close; Choice-A dismissal ("sign error when taking the square root") produced −6, not 6 | Subsumed by fix 10's rebuild: derivation closes "…it follows that k = 12. Therefore, the value of k is 12." and all three dismissals name center-misread recipes that verifiably produce their options |
| 6 | M4 Q17 rationale | Derivation ended "Since k must be an integer greater than 8, the least possible integer value of k is 9." (no Therefore) | "…yields 8 < k. It follows that k must be an integer greater than 8. Therefore, the least possible integer value of k is 9." |
| 7 | M4 Q12 rationale | ~184 words (SPR-medium norm ≈100) — slope-formula recitation + every add/divide narrated | ≈105 words; every equation of the derivation kept: slope (2 − 10)/(7 − 3) = −2 → 10 = −2(3) + b → b = 16 → y = −2x + 16 → 0 = −2x + 16 → 2x = 16 → x = 8 |
| 8 | M4 Q10 variable | "large bowls, g" — arbitrary-letter voice tell; 3s + 7g = 132 | Renamed g → b (non-confusable, reads "bowls") consistently: passage equation 3s + 7b = 132, defining sentence "large bowls, b", explanation "Substituting 9 for b…". Options (pure numerals 15/23/44/69) and key B unchanged |
| 9 | M4 Q14 numbers | Random sample of 400 with MoE 3% — statistically inconsistent (400 ↔ ≈5%) | Sample size 400 → 1,100 (100/√1100 ≈ 3.0 ✔). Estimate 62%, MoE 3%, interval 59%–65%, all four canonical MoE-misreading options, and the rationale numbers untouched (rationale never cited n) |
| 10 | M3 Q21 trap rebuild | r²-vs-r slip architecture (options 6/9/12/84 on (x − 4)² + (y − 3)² = 81) duplicating M4 Q20's mechanism | Sign-slip-on-center architecture on (x − 6)² + (y + 1)² = 169 — mixed-sign center (6, −1), r = 13, 5-12-13 engineered so every misread lands on an integer. Distractors: 4 (center read (−6, −1)), 6 (center read (−6, 1)), 14 (center read (6, 1) from (y + 1)²). Key value 12 KEPT, key letter C KEPT; options honestly ascending 4 < 6 < 12 < 14. `_trap`/`_distractorLogic`/dismissals all updated |
| 11 | M3 Q19 rework | Vertex-form composite a + h + k = 118 (sign-slip-on-h fork of the blueprint slot) | Function-notation nesting per the slot's blueprint option: f(x) = x² + 5, g(x) = f(x − 2), target the composite g(f(3)) = g(14) = f(12) = 149. Kept: position 19, SPR, hard, engineered 3-digit integer, quadratic family. Slip paths 201 (f(f(3))), 261 (f(14 + 2)), 12 (stopped at 14 − 2), 6 (g(3)) all distinct from key. Stem/explanation rewritten, metadata updated |
| 12 | SPR graders (12 items) | acceptedAnswers held canonical-only or partial lists (verifier: M3 Q22 lacked the legal "-2.400") | Every SPR answer's acceptedAnswers replaced by the machine-enumerated COMPLETE legal-entry set (canonical first): unreduced fractions ≤5 chars (≤6 w/ minus), exact terminating decimals with all zero-paddings, leading-zero/bare-point variants, max-precision truncation+rounding for repeating values. Enumerator (`spr_enumerate`) embedded verbatim in both verify scripts, which now assert set-equality + canonical-first per item. M3 Q22 gains "-2.400" (and -24/10 … -96/40) |

## 2. Process items 13–15

- **13.** verify_M3.py updated (Q19 nesting section, Q21 sign-slip-on-center section, SPR enumeration block,
  380px + line-mapping figure checks) and verify_M4.py updated (Q10 b-rename checks, Q14 MoE↔n plausibility
  check, Q4 gridline-lattice check, SPR enumeration block). Both re-run to green: **M3 exit 0, 255 PASS
  assertions; M4 exit 0, 338 ok assertions** (full outputs in §4/§5).
- **14.** Both selfchecks updated: M3 trap list now shows Q19 function-notation nesting and Q21 sign-slip on
  center coordinates; M3 §1/§3/§4/§7/§8 rows refreshed (Q19 answer 149, stem count 17, constants list);
  M4 §1 rows 10/14 and §4 SPR table refreshed. No key letter moved.
- **15.** Sanity re-confirmed programmatically: key tallies **M3 A4/B4/C4/D4, M4 A4/B4/C4/D4** (exact, better
  than the ±1 tolerance); every touched explanation (M3 Q12, Q19, Q21; M4 Q10, Q12, Q17) passes the §7 liturgy
  probes — correct opener, curly apostrophes, "Therefore," close before dismissals, dismissals in letter order.

## 3. Updated SPR acceptedAnswers (all 12 items, canonical first)

| Item | Answer | acceptedAnswers |
|---|---|---|
| M3 Q5 | 27 | 27, 27/1, 54/2, 81/3, 108/4, 135/5, 162/6, 189/7, 216/8, 243/9, 27.0, 27.00 |
| M3 Q6 | 37 | 37, 37/1, 74/2, 111/3, 148/4, 185/5, 222/6, 259/7, 296/8, 333/9, 37.0, 37.00 |
| M3 Q12 | 165 | 165, 165/1, 330/2, 495/3, 660/4, 825/5, 990/6, 165.0 |
| M3 Q13 | 4/9 | 4/9, 8/18, 12/27, 16/36, 20/45, 24/54, 28/63, 32/72, 36/81, 40/90, 44/99, 0.444, .4444 |
| M3 Q19 | 149 | 149, 149/1, 298/2, 447/3, 596/4, 745/5, 894/6, 149.0 |
| M3 Q22 | -12/5 | -12/5, -24/10, -36/15, -48/20, -60/25, -72/30, -84/35, -96/40, -2.4, -2.40, -2.400 |
| M4 Q5 | 6 | 6, 6/1, 12/2, 18/3, 24/4, 30/5, 36/6, 42/7, 48/8, 54/9, 60/10, 66/11, 72/12, 78/13, 84/14, 90/15, 96/16, 6.0, 6.00, 6.000 |
| M4 Q6 | 53 | 53, 53/1, 106/2, 159/3, 212/4, 265/5, 318/6, 371/7, 424/8, 477/9, 53.0, 53.00 |
| M4 Q12 | 8 | 8, 8/1, 16/2, 24/3, 32/4, 40/5, 48/6, 56/7, 64/8, 72/9, 80/10, 88/11, 96/12, 8.0, 8.00, 8.000 |
| M4 Q13 | 16 | 16, 16/1, 32/2, 48/3, 64/4, 80/5, 96/6, 112/7, 128/8, 144/9, 16.0, 16.00 |
| M4 Q19 | 486 | 486, 486/1, 972/2, 486.0 |
| M4 Q22 | 49/8 | 49/8, 98/16, 6.125 |

Enumeration rules (embedded identically in both verify scripts as `spr_enumerate`): ≤5 chars (≤6 with leading
minus); equivalent p/q fractions including unreduced; exact terminating decimals with every zero-padding that
fits (integers gain .0/.00/… forms); for repeating values the maximum-precision truncation AND half-up rounding
in both leading-zero (0.444) and bare-point (.4444) variants. Rationale "Note that …" sentences still cite
examples only (per spec §6) and were not altered.

## 4. verify_M3.py output (re-run after fixes)

```
== Module shell ==
  PASS  moduleNumber 3 / section Math
  PASS  calculator true, timeLimit 2100
  PASS  22 questions
  PASS  SPR positions [5, 6, 12, 13, 19, 22] == [5, 6, 12, 13, 19, 22]
  PASS  16 MC
  PASS  difficulty curve E×8, M, E(straggler), M×6, H×6  (9E/7M/6H)
  PASS  difficulty mix 9/7/6
  PASS  key-letter tally {'B': 4, 'A': 4, 'D': 4, 'C': 4} == 4/4/4/4
  PASS  subcategoryId map correct
  PASS  options contain no HTML tags
  PASS  Q1 rationale opener matches key letter
  PASS  Q2 rationale opener matches key letter
  PASS  Q3 rationale opener matches key letter
  PASS  Q4 rationale opener matches key letter
  PASS  Q7 rationale opener matches key letter
  PASS  Q8 rationale opener matches key letter
  PASS  Q9 rationale opener matches key letter
  PASS  Q10 rationale opener matches key letter
  PASS  Q11 rationale opener matches key letter
  PASS  Q14 rationale opener matches key letter
  PASS  Q15 rationale opener matches key letter
  PASS  Q16 rationale opener matches key letter
  PASS  Q17 rationale opener matches key letter
  PASS  Q18 rationale opener matches key letter
  PASS  Q20 rationale opener matches key letter
  PASS  Q21 rationale opener matches key letter
  PASS  Q5 SPR rationale opener
  PASS  Q5 SPR field shapes
  PASS  Q5 canonical answer in acceptedAnswers
  PASS  Q5 entry '27' within 5-char rule
  PASS  Q5 entry '27/1' within 5-char rule
  PASS  Q5 entry '54/2' within 5-char rule
  PASS  Q5 entry '81/3' within 5-char rule
  PASS  Q5 entry '108/4' within 5-char rule
  PASS  Q5 entry '135/5' within 5-char rule
  PASS  Q5 entry '162/6' within 5-char rule
  PASS  Q5 entry '189/7' within 5-char rule
  PASS  Q5 entry '216/8' within 5-char rule
  PASS  Q5 entry '243/9' within 5-char rule
  PASS  Q5 entry '27.0' within 5-char rule
  PASS  Q5 entry '27.00' within 5-char rule
  PASS  Q6 SPR rationale opener
  PASS  Q6 SPR field shapes
  PASS  Q6 canonical answer in acceptedAnswers
  PASS  Q6 entry '37' within 5-char rule
  PASS  Q6 entry '37/1' within 5-char rule
  PASS  Q6 entry '74/2' within 5-char rule
  PASS  Q6 entry '111/3' within 5-char rule
  PASS  Q6 entry '148/4' within 5-char rule
  PASS  Q6 entry '185/5' within 5-char rule
  PASS  Q6 entry '222/6' within 5-char rule
  PASS  Q6 entry '259/7' within 5-char rule
  PASS  Q6 entry '296/8' within 5-char rule
  PASS  Q6 entry '333/9' within 5-char rule
  PASS  Q6 entry '37.0' within 5-char rule
  PASS  Q6 entry '37.00' within 5-char rule
  PASS  Q12 SPR rationale opener
  PASS  Q12 SPR field shapes
  PASS  Q12 canonical answer in acceptedAnswers
  PASS  Q12 entry '165' within 5-char rule
  PASS  Q12 entry '165/1' within 5-char rule
  PASS  Q12 entry '330/2' within 5-char rule
  PASS  Q12 entry '495/3' within 5-char rule
  PASS  Q12 entry '660/4' within 5-char rule
  PASS  Q12 entry '825/5' within 5-char rule
  PASS  Q12 entry '990/6' within 5-char rule
  PASS  Q12 entry '165.0' within 5-char rule
  PASS  Q13 SPR rationale opener
  PASS  Q13 SPR field shapes
  PASS  Q13 canonical answer in acceptedAnswers
  PASS  Q13 entry '4/9' within 5-char rule
  PASS  Q13 entry '8/18' within 5-char rule
  PASS  Q13 entry '12/27' within 5-char rule
  PASS  Q13 entry '16/36' within 5-char rule
  PASS  Q13 entry '20/45' within 5-char rule
  PASS  Q13 entry '24/54' within 5-char rule
  PASS  Q13 entry '28/63' within 5-char rule
  PASS  Q13 entry '32/72' within 5-char rule
  PASS  Q13 entry '36/81' within 5-char rule
  PASS  Q13 entry '40/90' within 5-char rule
  PASS  Q13 entry '44/99' within 5-char rule
  PASS  Q13 entry '0.444' within 5-char rule
  PASS  Q13 entry '.4444' within 5-char rule
  PASS  Q19 SPR rationale opener
  PASS  Q19 SPR field shapes
  PASS  Q19 canonical answer in acceptedAnswers
  PASS  Q19 entry '149' within 5-char rule
  PASS  Q19 entry '149/1' within 5-char rule
  PASS  Q19 entry '298/2' within 5-char rule
  PASS  Q19 entry '447/3' within 5-char rule
  PASS  Q19 entry '596/4' within 5-char rule
  PASS  Q19 entry '745/5' within 5-char rule
  PASS  Q19 entry '894/6' within 5-char rule
  PASS  Q19 entry '149.0' within 5-char rule
  PASS  Q22 SPR rationale opener
  PASS  Q22 SPR field shapes
  PASS  Q22 canonical answer in acceptedAnswers
  PASS  Q22 entry '-12/5' within 6-char rule
  PASS  Q22 entry '-24/10' within 6-char rule
  PASS  Q22 entry '-36/15' within 6-char rule
  PASS  Q22 entry '-48/20' within 6-char rule
  PASS  Q22 entry '-60/25' within 6-char rule
  PASS  Q22 entry '-72/30' within 6-char rule
  PASS  Q22 entry '-84/35' within 6-char rule
  PASS  Q22 entry '-96/40' within 6-char rule
  PASS  Q22 entry '-2.4' within 6-char rule
  PASS  Q22 entry '-2.40' within 6-char rule
  PASS  Q22 entry '-2.400' within 6-char rule
== SPR acceptedAnswers completeness (full legal-entry enumeration) ==
  PASS  Q5 acceptedAnswers == complete legal-entry set (12 forms)
  PASS  Q5 canonical form listed first
  PASS  Q6 acceptedAnswers == complete legal-entry set (12 forms)
  PASS  Q6 canonical form listed first
  PASS  Q12 acceptedAnswers == complete legal-entry set (8 forms)
  PASS  Q12 canonical form listed first
  PASS  Q13 acceptedAnswers == complete legal-entry set (13 forms)
  PASS  Q13 canonical form listed first
  PASS  Q19 acceptedAnswers == complete legal-entry set (8 forms)
  PASS  Q19 canonical form listed first
  PASS  Q22 acceptedAnswers == complete legal-entry set (11 forms)
  PASS  Q22 canonical form listed first
== Q1 linear 2-step solve ==
  PASS  recompute: (38-6)/4 = 8
  PASS  distractors (echo 6, sign 11, 4x=32) all differ from key
  PASS  options/key index
  PASS  numeric options strictly ascending
== Q2 linear model equation ==
  PASS  key equation C = 4x + 30 at index B
  PASS  A = fee-sign slip 4x − 30
  PASS  C = slope/intercept swap 30x + 4
  PASS  D = fee+rate combined 34x
  PASS  all distractors differ from key
== Q3 combine like terms ==
  PASS  recompute sum = 7x² + 5x − 3
  PASS  key at index A
  PASS  B = constant-sign error (+3)
  PASS  C = x-term sign error (8x+3x)
  PASS  D = added exponents (7x⁴)
  PASS  distractors differ from key
== Q4 rate × amount ==
  PASS  recompute 5×12 = 60
  PASS  distractors: part 5, count 12, sum 17
  PASS  ascending
== Q5 SPR ax+by=c ==
  PASS  recompute g = (96 − 3·14)/2 = 27
  PASS  canonical 27 (full accepted set checked in enumeration block)
== Q6 SPR evaluate quadratic ==
  PASS  f(4) = 37
== Q7 median from table ==
  PASS  median = 47 (key)
  PASS  distractors mean 49, mode 44, range 19
  PASS  all four statistics distinct
  PASS  ascending [19,44,47,49]
== Q8 line graph → equation ==
  PASS  slope from (0,−4),(2,0) is 2; intercept −4
  PASS  key y = 2x − 4 at index C
  PASS  options form the sign 2×2 grid, all distinct
== Q9 which system represents ==
  PASS  situation facts: a=150, c=110
  PASS  key system D yields (150, 110)
  PASS  distractor systems yield [(4210, -2310), (-2310, 4210), (110, 150)] ≠ (150, 110)
  PASS  C is the coefficient swap (solution roles swapped)
== Q10 prism volume ==
  PASS  volume 8·6·5 = 240 (key)
  PASS  ladder distractors 28 / 48 / 236
  PASS  all four values distinct
  PASS  ascending
== Q11 observed vs predicted ==
  PASS  predicted 8, difference 6
  PASS  key 6; distractors x-echo 2, predicted 8, observed 14
  PASS  ascending
  PASS  best-fit plausibility: residuals ≈ balanced
  PASS  unique outlier dot at x = 2
== Q12 SPR wrong-target ==
  PASS  21(w+3) = 3·55 = 165
  PASS  w itself = 34/7 is non-integer → structural shortcut rewarded
== Q13 SPR cofunction ==
  PASS  identity cos(90°−p°) = sin(p°)
  PASS  canonical 4/9
  PASS  accepted entry '4/9' is a correct value of 4/9
  PASS  accepted entry '8/18' is a correct value of 4/9
  PASS  accepted entry '12/27' is a correct value of 4/9
  PASS  accepted entry '16/36' is a correct value of 4/9
  PASS  accepted entry '20/45' is a correct value of 4/9
  PASS  accepted entry '24/54' is a correct value of 4/9
  PASS  accepted entry '28/63' is a correct value of 4/9
  PASS  accepted entry '32/72' is a correct value of 4/9
  PASS  accepted entry '36/81' is a correct value of 4/9
  PASS  accepted entry '40/90' is a correct value of 4/9
  PASS  accepted entry '44/99' is a correct value of 4/9
  PASS  accepted entry '0.444' is a correct value of 4/9
  PASS  accepted entry '.4444' is a correct value of 4/9
== Q14 exponential interpretation ==
  PASS  P(0) = 1,150 → initial value (key A)
  PASS  B wrong: population in 2016 is 1,081, not 1,150
  PASS  C wrong: annual change is not a constant amount
  PASS  D wrong: annual percent decrease is 6, not 1,150
== Q15 identity coefficient b ==
  PASS  expand → 8x² + 22x − 21, b = 22
  PASS  key 22 at C
  PASS  distractors: sign −22, partials −6 and 28
  PASS  ascending
== Q16 inequality represents ==
  PASS  key A = 60x + 150y ≤ 2,400
  PASS  key admits boundary loads (2,400 exactly) and rejects overloads
  PASS  B (strict) wrongly rejects an exactly-2,400 load
  PASS  C (≥) wrongly rejects an empty elevator
  PASS  D (swapped weights) disagrees with key at (30, 4)
  PASS  option B semantically differs from key
  PASS  option C semantically differs from key
  PASS  option D semantically differs from key
== Q17 radical extraneous ==
  PASS  squaring yields candidates −1 and 6
  PASS  only −1 satisfies the original equation (6 extraneous: √9 = 3 ≠ −3)
  PASS  Roman-numeral option set
  PASS  valid set {−1} = numeral I → key A
== Q18 tangency parameter ==
  PASS  discriminant 52 − 4c = 0 → c = 13
  PASS  tangency confirmed: double root at x = 4
  PASS  distractors: sign −13, y-intercept −3, vertex x 4
  PASS  key 13 at D
  PASS  ascending
== Q19 SPR function-notation nesting ==
  PASS  inner value f(3) = 3² + 5 = 14
  PASS  g(f(3)) = f(14 − 2) = f(12) = 149
  PASS  nesting-slip paths [6, 12, 201, 261] all differ from 149
  PASS  slip paths mutually distinct from key and each other
== Q20 chained percents ==
  PASS  2.5 × 0.5 = 1.25 → x is 125% of z
  PASS  key 125% at B
  PASS  distractor 80% = reversed chain (z as % of x)
  PASS  distractors 200% subtracted, 300% added
  PASS  ascending
== Q21 circle point constraint (sign-slip-on-center architecture) ==
  PASS  (k+1)² = 169 → k = 12 or −14
  PASS  k > 0 selects 12 (key value unchanged, letter C)
  PASS  true center (6, −1) reproduces the key
  PASS  A = 4: wrong-signed a, center read (−6, −1) → 144 + (k+1)² = 169
  PASS  B = 6: both signs flipped, center read (−6, 1) → (k−1)² = 25
  PASS  D = 14: wrong-signed b, center read (6, 1) → (k−1)² = 169
  PASS  5-12-13 engineering: wrong-center paths land on integers
  PASS  ascending [4, 6, 12, 14]
  PASS  all option values distinct
== Q22 SPR no-solution parameter ==
  PASS  slope match −k/4 = 3/5 → k = −12/5
  PASS  y-intercepts differ → truly no solution (not coincident)
  PASS  system with k = −12/5 has no solution
  PASS  sign-slip value +12/5 differs from key
  PASS  canonical -12/5
  PASS  accepted entry '-12/5' equals −12/5
  PASS  accepted entry '-24/10' equals −12/5
  PASS  accepted entry '-36/15' equals −12/5
  PASS  accepted entry '-48/20' equals −12/5
  PASS  accepted entry '-60/25' equals −12/5
  PASS  accepted entry '-72/30' equals −12/5
  PASS  accepted entry '-84/35' equals −12/5
  PASS  accepted entry '-96/40' equals −12/5
  PASS  accepted entry '-2.4' equals −12/5
  PASS  accepted entry '-2.40' equals −12/5
  PASS  accepted entry '-2.400' equals −12/5
== Figures ==
  PASS  M3-Q08.svg exists
  PASS  M3-Q08.svg well-formed SVG
  PASS  M3-Q08.svg canvas width 380px (house standard)
  PASS  Q8 references M3-Q08.svg with alt text
  PASS  M3-Q10.svg exists
  PASS  M3-Q10.svg well-formed SVG
  PASS  M3-Q10.svg canvas width 380px (house standard)
  PASS  Q10 references M3-Q10.svg with alt text
  PASS  M3-Q11.svg exists
  PASS  M3-Q11.svg well-formed SVG
  PASS  M3-Q11.svg canvas width 380px (house standard)
  PASS  Q11 references M3-Q11.svg with alt text
  PASS  M3-Q08 has exactly one drawn data line
  PASS  M3-Q08 rescaled line still exactly y = 2x − 4
  PASS  geometry figure carries the not-drawn-to-scale note
  PASS  M3-Q08.svg (coordinate grid) carries no scale note
  PASS  M3-Q11.svg (coordinate grid) carries no scale note
  PASS  all other items have graphAsset/graphDescription null

ALL CHECKS PASSED — M3.json verified clean.
```

## 5. verify_M4.py output (re-run after fixes)

```
=== Q1: linear function inversion f(x)=4x+3, f(x)=31 ===
  Q01 [ok] solution x = 7
  Q01 [ok] key option is '7' at index 0 — options=['7', '28', '31', '127']
  Q01 [ok] distractor B = recipe value '28'
  Q01 [ok] distractor B differs from key
  Q01 [ok] distractor C = recipe value '31'
  Q01 [ok] distractor C differs from key
  Q01 [ok] distractor D = recipe value '127'
  Q01 [ok] distractor D differs from key
  Q01 [ok] numeric options strictly ascending — [7, 28, 31, 127]
=== Q2: furlongs -> feet, 6 furlongs, 1 fur = 220 yd, 1 yd = 3 ft ===
  Q02 [ok] 6 furlongs = 3,960 feet
  Q02 [ok] key option is '3,960' at index 3 — options=['226', '660', '1,320', '3,960']
  Q02 [ok] distractor A = recipe value '226'
  Q02 [ok] distractor A differs from key
  Q02 [ok] distractor B = recipe value '660'
  Q02 [ok] distractor B differs from key
  Q02 [ok] distractor C = recipe value '1,320'
  Q02 [ok] distractor C differs from key
  Q02 [ok] numeric options strictly ascending — [226, 660, 1320, 3960]
=== Q3: parallel lines, same-side interior angles, 122 + x = 180 ===
  Q03 [ok] x = 58
  Q03 [ok] key option is '58' at index 1 — options=['32', '58', '90', '122']
  Q03 [ok] distractor A = recipe value '32'
  Q03 [ok] distractor A differs from key
  Q03 [ok] distractor C = recipe value '90'
  Q03 [ok] distractor C differs from key
  Q03 [ok] distractor D = recipe value '122'
  Q03 [ok] distractor D differs from key
  Q03 [ok] numeric options strictly ascending — [32, 58, 90, 122]
=== Q4: parabola y=(x-3)^2-4 vertex/intercepts consistency ===
  Q04 [ok] vertex x = 3
  Q04 [ok] vertex y = -4
  Q04 [ok] x-intercepts at 1 and 5
  Q04 [ok] y-intercept (0,5) on the drawn grid
  Q04 [ok] SVG has a #cccccc gridline group
  Q04 [ok] vertical gridlines complete at every unit incl. x=5 (px 200), axis px 80 skipped — [32.0, 56.0, 104.0, 128.0, 152.0, 176.0, 200.0, 224.0, 248.0, 272.0]
  Q04 [ok] key option is '(3, -4)' at index 2 — options=['(-4, 3)', '(1, 0)', '(3, -4)', '(5, 0)']
  Q04 [ok] distractor A = recipe value '(-4, 3)'
  Q04 [ok] distractor A differs from key
  Q04 [ok] distractor B = recipe value '(1, 0)'
  Q04 [ok] distractor B differs from key
  Q04 [ok] distractor D = recipe value '(5, 0)'
  Q04 [ok] distractor D differs from key
  Q04 [ok] numeric options strictly ascending by x-coordinate (ordered pairs) — [-4, 1, 3, 5]
=== Q5 SPR: 9x - 7 = 47 ===
  Q05 [ok] solution x = 6
  Q05 [ok] canonical answer in acceptedAnswers
  Q05 [ok] entry '6' within 5 chars
  Q05 [ok] entry '6' equals exact value — 6 vs 6 
  Q05 [ok] entry '6/1' within 5 chars
  Q05 [ok] entry '6/1' equals exact value — 6 vs 6 
  Q05 [ok] entry '12/2' within 5 chars
  Q05 [ok] entry '12/2' equals exact value — 6 vs 6 
  Q05 [ok] entry '18/3' within 5 chars
  Q05 [ok] entry '18/3' equals exact value — 6 vs 6 
  Q05 [ok] entry '24/4' within 5 chars
  Q05 [ok] entry '24/4' equals exact value — 6 vs 6 
  Q05 [ok] entry '30/5' within 5 chars
  Q05 [ok] entry '30/5' equals exact value — 6 vs 6 
  Q05 [ok] entry '36/6' within 5 chars
  Q05 [ok] entry '36/6' equals exact value — 6 vs 6 
  Q05 [ok] entry '42/7' within 5 chars
  Q05 [ok] entry '42/7' equals exact value — 6 vs 6 
  Q05 [ok] entry '48/8' within 5 chars
  Q05 [ok] entry '48/8' equals exact value — 6 vs 6 
  Q05 [ok] entry '54/9' within 5 chars
  Q05 [ok] entry '54/9' equals exact value — 6 vs 6 
  Q05 [ok] entry '60/10' within 5 chars
  Q05 [ok] entry '60/10' equals exact value — 6 vs 6 
  Q05 [ok] entry '66/11' within 5 chars
  Q05 [ok] entry '66/11' equals exact value — 6 vs 6 
  Q05 [ok] entry '72/12' within 5 chars
  Q05 [ok] entry '72/12' equals exact value — 6 vs 6 
  Q05 [ok] entry '78/13' within 5 chars
  Q05 [ok] entry '78/13' equals exact value — 6 vs 6 
  Q05 [ok] entry '84/14' within 5 chars
  Q05 [ok] entry '84/14' equals exact value — 6 vs 6 
  Q05 [ok] entry '90/15' within 5 chars
  Q05 [ok] entry '90/15' equals exact value — 6 vs 6 
  Q05 [ok] entry '96/16' within 5 chars
  Q05 [ok] entry '96/16' equals exact value — 6 vs 6 
  Q05 [ok] entry '6.0' within 5 chars
  Q05 [ok] entry '6.0' equals exact value — 6 vs 6 
  Q05 [ok] entry '6.00' within 5 chars
  Q05 [ok] entry '6.00' equals exact value — 6 vs 6 
  Q05 [ok] entry '6.000' within 5 chars
  Q05 [ok] entry '6.000' equals exact value — 6 vs 6 
=== Q6 SPR: f(x) = 8x - 3, f(7) ===
  Q06 [ok] f(7) = 53
  Q06 [ok] canonical answer in acceptedAnswers
  Q06 [ok] entry '53' within 5 chars
  Q06 [ok] entry '53' equals exact value — 53 vs 53 
  Q06 [ok] entry '53/1' within 5 chars
  Q06 [ok] entry '53/1' equals exact value — 53 vs 53 
  Q06 [ok] entry '106/2' within 5 chars
  Q06 [ok] entry '106/2' equals exact value — 53 vs 53 
  Q06 [ok] entry '159/3' within 5 chars
  Q06 [ok] entry '159/3' equals exact value — 53 vs 53 
  Q06 [ok] entry '212/4' within 5 chars
  Q06 [ok] entry '212/4' equals exact value — 53 vs 53 
  Q06 [ok] entry '265/5' within 5 chars
  Q06 [ok] entry '265/5' equals exact value — 53 vs 53 
  Q06 [ok] entry '318/6' within 5 chars
  Q06 [ok] entry '318/6' equals exact value — 53 vs 53 
  Q06 [ok] entry '371/7' within 5 chars
  Q06 [ok] entry '371/7' equals exact value — 53 vs 53 
  Q06 [ok] entry '424/8' within 5 chars
  Q06 [ok] entry '424/8' equals exact value — 53 vs 53 
  Q06 [ok] entry '477/9' within 5 chars
  Q06 [ok] entry '477/9' equals exact value — 53 vs 53 
  Q06 [ok] entry '53.0' within 5 chars
  Q06 [ok] entry '53.0' equals exact value — 53 vs 53 
  Q06 [ok] entry '53.00' within 5 chars
  Q06 [ok] entry '53.00' equals exact value — 53 vs 53 
=== Q7: system y=3x, 2x+y=45 -> x+y ===
  Q07 [ok] x = 9, y = 27
  Q07 [ok] x + y = 36
  Q07 [ok] key option is '36' at index 2 — options=['9', '27', '36', '45']
  Q07 [ok] distractor A = recipe value '9'
  Q07 [ok] distractor A differs from key
  Q07 [ok] distractor B = recipe value '27'
  Q07 [ok] distractor B differs from key
  Q07 [ok] distractor D = recipe value '45'
  Q07 [ok] distractor D differs from key
  Q07 [ok] numeric options strictly ascending — [9, 27, 36, 45]
=== Q8: 2x^2(6x^3 + 5) ===
  Q08 [ok] expansion = 12x^5 + 10x^2
  Q08 [ok] key option is '12x⁵ + 10x²' at index 2 — options=['8x⁵ + 7x²', '12x⁵ + 5', '12x⁵ + 10x²', '12x⁶ + 10x²']
  Q08 [ok] A recipe -> 8x^5 + 7x^2
  Q08 [ok] B recipe -> 12x^5 + 5
  Q08 [ok] D recipe -> 12x^6 + 10x^2
  Q08 [ok] all distractors differ from key
=== Q9: two-way table conditional probability ===
  Q09 [ok] row totals 52/48, col totals 60/40, grand 100
  Q09 [ok] P(print | 40+) = 3/4
  Q09 [ok] key option is '3/4' at index 3 — options=['1/4', '9/25', '3/5', '3/4']
  Q09 [ok] A recipe = 1/4
  Q09 [ok] B recipe = 9/25
  Q09 [ok] C recipe = 3/5
  Q09 [ok] all distractors differ from key
  Q09 [ok] numeric options strictly ascending — [Fraction(1, 4), Fraction(9, 25), Fraction(3, 5), Fraction(3, 4)]
=== Q10: 3s + 7b = 132, b = 9 (variable renamed g -> b in fix round) ===
  Q10 [ok] s = 23
  Q10 [ok] key option is '23' at index 1 — options=['15', '23', '44', '69']
  Q10 [ok] variable b used throughout; no stray 'g' variable remains
  Q10 [ok] swap recipe integer-clean: s = 15
  Q10 [ok] distractor A = recipe value '15'
  Q10 [ok] distractor A differs from key
  Q10 [ok] distractor C = recipe value '44'
  Q10 [ok] distractor C differs from key
  Q10 [ok] distractor D = recipe value '69'
  Q10 [ok] distractor D differs from key
  Q10 [ok] numeric options strictly ascending — [15, 23, 44, 69]
=== Q11: 6% growth every 4 years ===
  Q11 [ok] f(0) = 9,000
  Q11 [ok] f(4)/f(0) = 1.06 (one period)
  Q11 [ok] f(8)/f(4) = 1.06 (each period)
  Q11 [ok] B recipe grows 6% per year (wrong)
  Q11 [ok] C recipe grows 1.06^4 per year (wrong)
  Q11 [ok] D recipe grows 24% per 4 years (wrong)
  Q11 [ok] all distractor functions differ from key at t=8
  Q11 [ok] key at index 0 shows exponent t/4 and base 1.06
=== Q12 SPR: line through (3,10) and (7,2), x-intercept ===
  Q12 [ok] slope = -2
  Q12 [ok] x-intercept x = 8
  Q12 [ok] line really passes both points
  Q12 [ok] canonical answer in acceptedAnswers
  Q12 [ok] entry '8' within 5 chars
  Q12 [ok] entry '8' equals exact value — 8 vs 8 
  Q12 [ok] entry '8/1' within 5 chars
  Q12 [ok] entry '8/1' equals exact value — 8 vs 8 
  Q12 [ok] entry '16/2' within 5 chars
  Q12 [ok] entry '16/2' equals exact value — 8 vs 8 
  Q12 [ok] entry '24/3' within 5 chars
  Q12 [ok] entry '24/3' equals exact value — 8 vs 8 
  Q12 [ok] entry '32/4' within 5 chars
  Q12 [ok] entry '32/4' equals exact value — 8 vs 8 
  Q12 [ok] entry '40/5' within 5 chars
  Q12 [ok] entry '40/5' equals exact value — 8 vs 8 
  Q12 [ok] entry '48/6' within 5 chars
  Q12 [ok] entry '48/6' equals exact value — 8 vs 8 
  Q12 [ok] entry '56/7' within 5 chars
  Q12 [ok] entry '56/7' equals exact value — 8 vs 8 
  Q12 [ok] entry '64/8' within 5 chars
  Q12 [ok] entry '64/8' equals exact value — 8 vs 8 
  Q12 [ok] entry '72/9' within 5 chars
  Q12 [ok] entry '72/9' equals exact value — 8 vs 8 
  Q12 [ok] entry '80/10' within 5 chars
  Q12 [ok] entry '80/10' equals exact value — 8 vs 8 
  Q12 [ok] entry '88/11' within 5 chars
  Q12 [ok] entry '88/11' equals exact value — 8 vs 8 
  Q12 [ok] entry '96/12' within 5 chars
  Q12 [ok] entry '96/12' equals exact value — 8 vs 8 
  Q12 [ok] entry '8.0' within 5 chars
  Q12 [ok] entry '8.0' equals exact value — 8 vs 8 
  Q12 [ok] entry '8.00' within 5 chars
  Q12 [ok] entry '8.00' equals exact value — 8 vs 8 
  Q12 [ok] entry '8.000' within 5 chars
  Q12 [ok] entry '8.000' equals exact value — 8 vs 8 
=== Q13 SPR: side ratio 4 -> area ratio k ===
  Q13 [ok] area factor k = 16
  Q13 [ok] canonical answer in acceptedAnswers
  Q13 [ok] entry '16' within 5 chars
  Q13 [ok] entry '16' equals exact value — 16 vs 16 
  Q13 [ok] entry '16/1' within 5 chars
  Q13 [ok] entry '16/1' equals exact value — 16 vs 16 
  Q13 [ok] entry '32/2' within 5 chars
  Q13 [ok] entry '32/2' equals exact value — 16 vs 16 
  Q13 [ok] entry '48/3' within 5 chars
  Q13 [ok] entry '48/3' equals exact value — 16 vs 16 
  Q13 [ok] entry '64/4' within 5 chars
  Q13 [ok] entry '64/4' equals exact value — 16 vs 16 
  Q13 [ok] entry '80/5' within 5 chars
  Q13 [ok] entry '80/5' equals exact value — 16 vs 16 
  Q13 [ok] entry '96/6' within 5 chars
  Q13 [ok] entry '96/6' equals exact value — 16 vs 16 
  Q13 [ok] entry '112/7' within 5 chars
  Q13 [ok] entry '112/7' equals exact value — 16 vs 16 
  Q13 [ok] entry '128/8' within 5 chars
  Q13 [ok] entry '128/8' equals exact value — 16 vs 16 
  Q13 [ok] entry '144/9' within 5 chars
  Q13 [ok] entry '144/9' equals exact value — 16 vs 16 
  Q13 [ok] entry '16.0' within 5 chars
  Q13 [ok] entry '16.0' equals exact value — 16 vs 16 
  Q13 [ok] entry '16.00' within 5 chars
  Q13 [ok] entry '16.00' equals exact value — 16 vs 16 
=== Q14: margin of error interval ===
  Q14 [ok] interval is 59% to 65%
  Q14 [ok] stem states the n = 1,100 sample (fix round: was 400)
  Q14 [ok] MoE 3% statistically consistent with n = 1,100 (100/sqrt(n) ~ 3) — 100/sqrt(1100) = 3.02
  Q14 [ok] key A is the plausible-interval statement
  Q14 [ok] B = impossibility misreading
  Q14 [ok] C = exact-value misreading
  Q14 [ok] D = equal-likelihood misreading
=== Q15: x >= 8 and 45x + 6y <= 520 ===
  Q15 [ok] 8 kits alone affordable: 45*8 = 360 <= 520
  Q15 [ok] boundary spend reachable: 45*8 + 6*26 = 516 <= 520; +27 exceeds
  Q15 [ok] key A inclusive both bounds
  Q15 [ok] B strict on cost only
  Q15 [ok] C strict on kits only
  Q15 [ok] D directions reversed
=== Q16: slope of fit line through (0,210) and (10,60) ===
  Q16 [ok] slope = -15
  Q16 [ok] key D states $15 decrease per year
  Q16 [ok] A interprets intercept 210 as price at age 0
  Q16 [ok] B puts slope magnitude in intercept role
  Q16 [ok] C puts intercept value in slope role
  Q16 [ok] 10 dots, residuals within ±5
=== Q17: 2x^2 + 8x + k = 0 has no real solutions ===
  Q17 [ok] discriminant zero at k = 8 (integer AT the boundary)
  Q17 [ok] no real solutions iff k > 8 — Interval.open(8, oo)
  Q17 [ok] least integer k = 9; k=9 gives negative discriminant
  Q17 [ok] key option is '9' at index 2 — options=['7', '8', '9', '64']
  Q17 [ok] distractor A = recipe value '7'
  Q17 [ok] distractor A differs from key
  Q17 [ok] distractor B = recipe value '8'
  Q17 [ok] distractor B differs from key
  Q17 [ok] distractor D = recipe value '64'
  Q17 [ok] distractor D differs from key
  Q17 [ok] numeric options strictly ascending — [7, 8, 9, 64]
=== Q18: similarity sufficiency (logic audit) ===
  Q18 [ok] key D compares corresponding sides JK and PQ
  Q18 [ok] A gives one side of one triangle only
  Q18 [ok] B gives third angles (similarity only)
  Q18 [ok] C gives two sides of the same triangle
  Q18 [ok] third angles forced equal by angle sum (B adds nothing)
  Q18 [ok] similar triangles with scale 2 are not congruent (gap exists)
=== Q19 SPR: 6(3)^(4x) = a b^x -> ab ===
  Q19 [ok] 6*3^(4x) == 6*81^x for all x (sample + symbolic)
  Q19 [ok] a=6, b=81, ab=486
  Q19 [ok] canonical answer in acceptedAnswers
  Q19 [ok] entry '486' within 5 chars
  Q19 [ok] entry '486' equals exact value — 486 vs 486 
  Q19 [ok] entry '486/1' within 5 chars
  Q19 [ok] entry '486/1' equals exact value — 486 vs 486 
  Q19 [ok] entry '972/2' within 5 chars
  Q19 [ok] entry '972/2' equals exact value — 486 vs 486 
  Q19 [ok] entry '486.0' within 5 chars
  Q19 [ok] entry '486.0' equals exact value — 486 vs 486 
=== Q20: x^2 + y^2 - 10x + 4y = 7 -> radius ===
  Q20 [ok] completing the square: (x-5)^2 + (y+2)^2 = 36
  Q20 [ok] radius = 6 (clean value from even coefficients)
  Q20 [ok] key option is '6' at index 1 — options=['√7', '6', '12', '36']
  Q20 [ok] A recipe √7 (RHS constant as r²)
  Q20 [ok] distractor C = recipe value '12'
  Q20 [ok] distractor C differs from key
  Q20 [ok] distractor D = recipe value '36'
  Q20 [ok] distractor D differs from key
  Q20 [ok] options ascending by value (√7 < 6 < 12 < 36)
=== Q21: y = x^2-2x+13 and y = 6x+4 -> x = p ± √q ===
  Q21 [ok] combined quadratic x^2 - 8x + 9
  Q21 [ok] roots are 4 ± √7 (two real intersections)
  Q21 [ok] p = 4, q = 7
  Q21 [ok] discriminant 28 (distractor D source)
  Q21 [ok] key option is '7' at index 1 — options=['4', '7', '9', '28']
  Q21 [ok] distractor A = recipe value '4'
  Q21 [ok] distractor A differs from key
  Q21 [ok] distractor C = recipe value '9'
  Q21 [ok] distractor C differs from key
  Q21 [ok] distractor D = recipe value '28'
  Q21 [ok] distractor D differs from key
  Q21 [ok] numeric options strictly ascending — [4, 7, 9, 28]
=== Q22 SPR: f(x)=ax^2+bx through (1,5),(3,3) -> max value ===
  Q22 [ok] a = -2, b = 7
  Q22 [ok] f(1)=5 and f(3)=3 verified
  Q22 [ok] vertex x = 7/4
  Q22 [ok] maximum value = 49/8
  Q22 [ok] opens downward (a < 0), so vertex is a maximum
  Q22 [ok] canonical answer in acceptedAnswers
  Q22 [ok] entry '49/8' within 5 chars
  Q22 [ok] entry '49/8' equals exact value — 49/8 vs 49/8 
  Q22 [ok] entry '98/16' within 5 chars
  Q22 [ok] entry '98/16' equals exact value — 49/8 vs 49/8 
  Q22 [ok] entry '6.125' within 5 chars
  Q22 [ok] entry '6.125' equals exact value — 49/8 vs 49/8 
  Q22 [ok] decimal entry 6.125 is exact

=== module-level checks ===
  Q00 [ok] 16 MC + 6 SPR — 16 MC / 6 SPR
  Q00 [ok] SPR at positions 5, 6, 12, 13, 19, 22 — [5, 6, 12, 13, 19, 22]
  Q00 [ok] 8E / 8M / 6H
  Q00 [ok] curve: Q1-8 easy, Q9-16 medium, Q17-22 hard
  Q00 [ok] key letters flat 4/4/4/4 — {'A': 4, 'B': 4, 'C': 4, 'D': 4}
  Q01 [ok] exactly 4 options, no HTML tags (math </> symbols allowed) — []
  Q02 [ok] exactly 4 options, no HTML tags (math </> symbols allowed) — []
  Q03 [ok] exactly 4 options, no HTML tags (math </> symbols allowed) — []
  Q04 [ok] exactly 4 options, no HTML tags (math </> symbols allowed) — []
  Q07 [ok] exactly 4 options, no HTML tags (math </> symbols allowed) — []
  Q08 [ok] exactly 4 options, no HTML tags (math </> symbols allowed) — []
  Q09 [ok] exactly 4 options, no HTML tags (math </> symbols allowed) — []
  Q10 [ok] exactly 4 options, no HTML tags (math </> symbols allowed) — []
  Q11 [ok] exactly 4 options, no HTML tags (math </> symbols allowed) — []
  Q14 [ok] exactly 4 options, no HTML tags (math </> symbols allowed) — []
  Q15 [ok] exactly 4 options, no HTML tags (math </> symbols allowed) — []
  Q16 [ok] exactly 4 options, no HTML tags (math </> symbols allowed) — []
  Q17 [ok] exactly 4 options, no HTML tags (math </> symbols allowed) — []
  Q18 [ok] exactly 4 options, no HTML tags (math </> symbols allowed) — []
  Q20 [ok] exactly 4 options, no HTML tags (math </> symbols allowed) — []
  Q21 [ok] exactly 4 options, no HTML tags (math </> symbols allowed) — []
  Q05 [ok] SPR options empty + acceptedAnswers present
  Q06 [ok] SPR options empty + acceptedAnswers present
  Q12 [ok] SPR options empty + acceptedAnswers present
  Q13 [ok] SPR options empty + acceptedAnswers present
  Q19 [ok] SPR options empty + acceptedAnswers present
  Q22 [ok] SPR options empty + acceptedAnswers present

=== SPR acceptedAnswers completeness (full legal-entry enumeration) ===
  Q05 [ok] acceptedAnswers == complete legal-entry set (20 forms)
  Q05 [ok] canonical form listed first
  Q06 [ok] acceptedAnswers == complete legal-entry set (12 forms)
  Q06 [ok] canonical form listed first
  Q12 [ok] acceptedAnswers == complete legal-entry set (16 forms)
  Q12 [ok] canonical form listed first
  Q13 [ok] acceptedAnswers == complete legal-entry set (12 forms)
  Q13 [ok] canonical form listed first
  Q19 [ok] acceptedAnswers == complete legal-entry set (4 forms)
  Q19 [ok] canonical form listed first
  Q22 [ok] acceptedAnswers == complete legal-entry set (3 forms)
  Q22 [ok] canonical form listed first
  Q00 [ok] figures on Q3, Q4, Q16 only — {3: 'M4-Q03.svg', 4: 'M4-Q04.svg', 16: 'M4-Q16.svg'}
  Q00 [ok] M4-Q03.svg exists and is well-formed XML
  Q00 [ok] M4-Q04.svg exists and is well-formed XML
  Q00 [ok] M4-Q16.svg exists and is well-formed XML

RESULT: ALL CHECKS PASSED
```

## 6. Deviations from the adjudicated list

**None.** All 12 fixes applied as specified; no item outside the list touched. Two consistency notes, both
inside fix scope: (a) fix 5 was delivered through fix 10's rebuild of the same rationale (the Therefore-close
and a verifiable Choice-A dismissal are present in the rebuilt text); (b) `_sprForms` metadata strings on the
three non-integer SPR items were refreshed so they no longer contradict the enumerated acceptedAnswers
(fix 12 consistency; not student-facing). M3 Q21 keeps its correct answer 12 at letter C, so both modules
remain exactly 4/4/4/4 on key letters.
