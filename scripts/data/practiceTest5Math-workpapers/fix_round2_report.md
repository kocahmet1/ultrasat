# Fix Round 2 — Repair Report — PT5 Math Modules 3 & 4
### Scope: the one BLOCKER plus the six residuals adjudicated in `review-pt5/critic_report_round2.md`
### Binding: `docs/CB_Math_Style_Spec.md` · `analysis/blueprint_pt5_math.md`

Seven work items were adjudicated and exactly seven were executed. **No item outside the list was
touched.** Both verify scripts pass clean under the corrected instruments (`verify_M3.py` 702
assertions exit 0; `verify_M4.py` 1,242 assertions exit 0), and every form-level invariant the
re-audit certified is re-confirmed below.

---

## 1. Before / after ledger

| # | Item | Before (round 2 audit) | After | Evidence |
|---|---|---|---|---|
| **1** | **M3 Q10** — BLOCKER, two correct answers | Options `0 ≤ t ≤ 47` / **`0 ≤ t ≤ 55`** / `47 < t < 55` / `47 ≤ t ≤ 55`. With min 47 and max 55, **B and D are both true of every recorded t** — unscorable. Dismissal of B ("includes temperatures less than 47") is logically invalid: admitting a non-recorded value does not falsify a statement universally quantified over the recorded ones. | Distractor B replaced with **`47 ≤ t ≤ 51`** — the average of the two recorded extremes, (47 + 55)/2, used as the upper bound. **False at the recorded value 55.** Key, letter (D), skill, difficulty, context and the strict/inclusive trap (still load-bearing in exactly one distractor, C) all unchanged. All three dismissals rewritten to name the **recorded value on which the option is false**; §7 liturgy intact (opener, letter-order dismissals, "Therefore,", curly apostrophe). Rationale 129 → **158 w (1.17×)**. | §2 below: exhaustive enumeration of **32,768** half-degree admissible data sets + **128** integer ones + a real-valued closure argument — all now embedded in `verify_M3.py`, replacing the unsound `preds[1](12)` check. |
| **2** | **M4 Q17** — *hard* no longer earned | Stem handed the modelling step over: "The function g is defined by **g(m) = f(m/60)**." Rationale 119 w = **0.70×** the hard-MC norm, the lowest ratio in the form. | Stem now states only the relation: "The function g is defined so that **g(m) = f(t), where m = 60t**." The student must (i) invert m = 60t to t = m/60 and (ii) simplify 3(m/60) to m/20. **Still abstract** — no real-world referent, applied share untouched at 15/44. Key (`900(1.15)ᵐ⁄²⁰`), key letter B, the `t vs t/n vs nt` option family and all three distractor recipes are unchanged; distractor D (180m) is now genuinely live, because misreading m = 60t as t = 60m is exactly what produces it. Rationale 119 → **159 w (0.94×)**. Stem 22 → 27 w (cap 35). Originality probes on the new strings: "is defined so that" 0 · "where m = 60t" 0 · "60t" 0 across the 8 extracted sources, and 0 in `practiceTest4Math.json`. | `verify_M4.py` `q17()`: `sympy.solve(m = 60t, t)` → `t = m/60`; `3(m/60)` → `m/20`; `g(60t) = f(t)` verified at t = 0, 1, 5, 7/3; each distractor proved ≠ key **and** proved not to coincide with the key at m = 60; a standing assertion that `g(m) = f(m/60)` is **absent** from the stem. |
| **3** | **M3 Q15** — key echoes PT4; *medium* generous; alt text names all four options | Curve y = −x² − 4x + 5; asked for the y-intercept; key **(0, 5)** = PT4 M4.04's y-intercept, both parabolas sharing the constant term 5. One-glance graph read. Alt text named the key (0, 5), the vertex (−2, 9) and both x-intercepts — the entire option set. Rationale 102 w = 0.76×. | Curve re-rolled to **y = −x² − 2x + 8** (vertex (−1, 9), roots −4 and 2, y-intercept (0, 8) — constant term no longer 5). Target re-pitched to **the vertex of y = f(x) + 3**: read two features off the grid, then translate. Key **(−1, 12)** — none of PT4 M4.04's features (vertex (3, −4), roots 1 and 5, y-intercept (0, 5)). Key letter still **C** (the tie on the first coordinate with (−1, 9) is broken by the second, so the key still sorts third). **Ordered-pair-reversal trap kept** at D = (12, −1). Options `(-4, 9)` / `(-1, 9)` / `(-1, 12)` / `(12, -1)`. `assets/PT5-M3-Q15.svg` regenerated; `graphDescription` rewritten. Rationale 102 → **176 w (1.30×)**. **PT4 differentiation of the new pitch, stated explicitly:** PT4 M4.04 shows an *upward* parabola, asks for the vertex *of the shown graph*, and keys a **plotted point** (3, −4) — an *easy* read. Here the parabola opens *downward*, the asked graph y = f(x) + 3 is **not drawn**, the key (−1, 12) is machine-confirmed not to be a plotted point, and PT4's style of answer (the untranslated vertex) is offered as **distractor B**. New-string probes against the 8 extracted sources and the shipped `practiceTest4Math.json`: "coordinates of the vertex of the graph of" 0 · "vertex of the graph of y = f(x) + 3" 0 · "f(x) + 3" 0 · "-x² - 2x + 8" 0 · "(-1, 12)" 0 — all zero. | `verify_M3.py` recovers the data↔pixel map **from the tick-label text nodes alone** (px = 223 + 22x), then re-measures all 65 plotted points against y = −x² − 2x + 8 (max err 0.017), the vertex to (−1, 9), the y-crossing to (0, 8.000), the x-crossings to −4 and 2, and confirms the key (−1, 12) and distractor A (−4, 9) are **not** plotted points. Alt-text assertions: **does not contain the key**, and names **at most one** option (the figure's own vertex, which a sighted reader also sees). |
| **4** | **M3 Q19** rationale 190 w = **1.462×** (the form's only remaining ≥+45% breach; byte-identical to round 1) | 190 w | **141 w (1.085×)**. Every derivation step retained: substitute 1 → a + b = 9; substitute −1 → a − b = −3; add → a = 3; back-substitute → b = 6; write f; substitute 7 → 147 + 42 + 12 = 201; "Therefore,". Only premise re-narration and two restatements of "in the equation defining f" were collapsed. | Length table §4. |
| **5a** | **M4 Q9** stem 56 / 55 (applied) | "the **total** number of yards of fabric" | word "total" removed → **55 / 55** | Length table §4 |
| **5b** | **M4 Q18** stem 36 / 35 (abstract) | "tangent to a circle **at the point** (12, 20)" | → "tangent to a circle at (12, 20)" → **34 / 35**. Originality unaffected: `is tangent to a circle` still 0 hits in the 8-source corpus. | Length table §4 |
| **5c** | **M4 Q20** stem 36 / 35 (abstract) | "…perimeter of DEF**, and** the area of DEF is 32 square centimeters." | → two sentences: "…perimeter of DEF**.** The area of DEF is 32 square centimeters." → **35 / 35**. Numbers, key, ladder and trap untouched. | Length table §4 |
| **6** | **INSTRUMENT** — both scripts under-reported length | `stem_words` filtered to tokens containing `[A-Za-z]` (discarding **every numeral**); `rat_words` filtered to tokens containing `[A-Za-z0-9]` (discarding the operators `+`, `−`, `=`). 36-word stems read 33; a 190-word rationale read 148. | Both helpers in **both** scripts now count **every whitespace-delimited token**. Non-prose stimuli stay excluded — displayed equations (as before) **and HTML data tables**, whose cell values are tabular data, not stem prose. Each script now carries a **ruler self-test** that fails if a numeral or operator is ever dropped again. | §3 below: the repaired ruler reproduces the round-1 critic's numbers **exactly** on every value that critic published. |
| **7** | **DOCS** out of sync | Blueprint still bound "multi-root SPR: acceptedAnswers lists BOTH roots" (M3 Q12 row) and "SPR census: … one multi-root item (M3 Q12) listing both roots"; the two abstraction latitudes were unrecorded. | `blueprint_pt5_math.md`: both multi-root lines retired (census now reads **0 multi-root**, Q12 row rewritten to the radical/extraneous archetype), and a new **"Blueprint latitudes exercised"** section records L1 (M4 Q4 abstract), L2 (M4 Q17 abstract) and L3 (multi-root retired), including the tracked cost — AdvMath's own applied share at 1/14 ≈ 7% vs the ~20% reference. `M3_selfcheck.md` and `M4_selfcheck.md` updated to reality: round-2 revision notes, new assertion counts, Q10/Q15/Q17 rows, honest-ruler stem and rationale tables, regenerated-figure description, alt-text policy. | Diffs in the three files. |

**Not touched (correctly out of scope):** M3 Q6, M3 Q9, M3 Q16, M3 Q18, M4 Q1, M4 Q14, M4 Q16, M4 Q20's
PT4 number echo, and the AdvMath applied-share regression — all of which the re-audit lists but the
round-2 work order does not. The AdvMath share is now *documented* in the blueprint rather than repaired,
which is what item 7 asked for.

---

## 2. M3 Q10 — exhaustive key-uniqueness proof

The stem quantifies universally over the recorded temperatures: "Which inequality is **true for all
values of t**, where t is a recorded temperature …". It fixes exactly this much — the recorded set T is
finite with min(T) = 47 and max(T) = 55, i.e. **{47, 55} ⊆ T ⊆ [47, 55]**. An option is defensible on a
given T iff its predicate holds at *every* member of T. Hence:

* an option can be the key **iff** it holds at every point of the closed interval [47, 55] (T may contain any point of it);
* an option is safely wrong **iff** it already fails at 47 or at 55 — the two values *every* admissible T must contain.

Run against both option sets, so the defect and the repair are visible side by side:

```
--- round-1 (broken) : A [0, 47], B [0, 55], C (47, 55), D [47, 55]
    half-degree grid : 32768 admissible data sets enumerated (2^15, complete power set)
    true-option signature counts : {'BD': 32768}
    integer grid     : 128 of 128 integer data sets have a true-option set != {D}
    real closure     : options true on ALL of [47, 55] = ['B', 'D']
                       options false at 47 or at 55 (forced members) = ['A', 'C']
    VERDICT          : 2 DEFENSIBLE ANSWERS -> UNSCORABLE

--- round-2 (repaired) : A [0, 47], B [47, 51], C (47, 55), D [47, 55]
    half-degree grid : 32768 admissible data sets enumerated (2^15, complete power set)
    true-option signature counts : {'D': 32768}
    integer grid     : 0 of 128 integer data sets have a true-option set != {D}
    real closure     : options true on ALL of [47, 55] = ['D']
                       options false at 47 or at 55 (forced members) = ['A', 'B', 'C']
    VERDICT          : EXACTLY ONE defensible answer (D)
```

The round-1 set reproduces the re-audit's finding exactly: **B and D are true on all 32,768 admissible
data sets**, so the item was unscorable. The round-2 set yields **D and only D on every one of them**,
on all 128 integer-valued sets, and — by the closure argument — on every real-valued admissible set.

This is now embedded in `verify_M3.py` (section `== Q10 bounded range — EXHAUSTIVE key-uniqueness
proof ==`), replacing the unsound round-1 test. That test was `check(preds[1](12), …)`: it asked only
whether B **admits** a non-recorded value, and never whether B is **false on a recorded one** — which is
precisely why a broken item passed. The new block asserts, per data set, that the true-option set is
exactly `{D}`; it also asserts that each written dismissal names a genuinely recorded counterexample.

```
== Q10 bounded range — EXHAUSTIVE key-uniqueness proof ==
  PASS  option set varies the BOUNDS, not only the strictness symbols
  PASS  key D = 47 <= t <= 55
        exhaustive: 32768 admissible data sets; true-option signatures {'D': 32768}
  PASS  enumerated all 2^15 = 32,768 half-degree admissible data sets (got 32768)
  PASS  exactly ONE option is true of every admissible data set (counterexamples: [])
  PASS  the single true option is D on every one of the 32,768 data sets
  PASS  exactly one option true on all 128 integer-valued data sets ([])
  PASS  only D holds at every point of [47, 55], so no other option can be true of every data set
  PASS  A, B and C each fail at 47 or at 55 -- values EVERY admissible data set must contain
  PASS  each dismissal's counterexample is a RECORDED value: A and B fail at 55, C at 47 and at 55
  PASS  key admits both recorded extremes
  PASS  key excludes values outside the recorded range
  PASS  three distinct bound pairs across the four options [(0, 47), (47, 51), (47, 55)]
  PASS  the strict/inclusive distinction is load-bearing in exactly one distractor (C)
  PASS  option A semantically differs from the key
  PASS  option B semantically differs from the key
  PASS  option C semantically differs from the key
  PASS  options ordered by lower bound, then upper bound, then strictness
  PASS  B's upper bound 51 is the average of the two recorded extremes (its named recipe)
  PASS  Q10 dismissal A names its recipe
  PASS  Q10 dismissal B names its recipe
  PASS  all three dismissals name a RECORDED value on which the option is false
```

---

## 3. The honest ruler, and what it reveals

**Definition (both scripts, identical).** Stem prose = **every** whitespace-delimited token of the
tag-stripped `passage` + `text`, numerals and operators included, with the two non-prose stimuli
excluded: displayed equations (`text-align:center` divs) and HTML data tables. Rationale length =
**every** whitespace-delimited token of `explanation`.

**Calibration — the repaired ruler reproduces the round-1 critic exactly**, on every number that
critic published, without a single adjustment:

| Published by the round-1/round-2 critic | Repaired ruler | Old (broken) ruler |
|---|---|---|
| M3 Q10 stem 55 / 55 | **55** | 55 |
| M3 Q18 stem 73 / 75 | **73** | 70 |
| M4 Q14 stem 53 / 55 | **53** | 49 |
| M4 Q9 stem **56** / 55 | **56** (pre-fix) | 55 |
| M4 Q18 stem **36** / 35 | **36** (pre-fix) | 33 |
| M4 Q20 stem **36** / 35 | **36** (pre-fix) | 34 |
| M3 Q19 rationale **190** (1.462×) | **190** (pre-fix) | 148 |
| M3 Q16 rationale 194 (1.437×) | **194** | 190 |
| M3 Q8 rationale 189 | **189** | 172 |
| M4 Q18 rationale 243 (1.429×) | **243** | 234 |

**Newly revealed under the honest ruler, and its disposition.** Two items read over cap only if the
HTML data-table cell values are counted as stem prose: **M3 Q8** (23 prose words + table → 36) and
**M4 Q10** (47 prose words + table → 65). Both are excluded as stimulus, exactly as displayed equations
already were — and this is demonstrably the round-1 critic's own convention, since a 65-word stem would
have been by far the largest overrun in the form and was never reported. Counting the prose only, **M3 Q8
= 23/35 and M4 Q10 = 48/55**. Beyond the three stems and one rationale already in the work order,
**nothing else breaches a §2b cap or exceeds a §7 norm by ≥45%**, so nothing else was trimmed — per the
instruction to trim only on those two triggers.

---

## 4. Recomputed length tables (honest ruler)

### Module 3
| Q | diff | fmt | stem | cap | ✓ | rationale | norm | ratio | ✓ |
|---|---|---|---|---|---|---|---|---|---|
| 1 | E | MC | 8 | 35 | ok | 117 | 110 | 1.064 | ok |
| 2 | E | MC | 22 | 55 | ok | 132 | 110 | 1.200 | ok |
| 3 | E | MC | 10 | 15 | ok | 119 | 110 | 1.082 | ok |
| 4 | E | MC | 17 | 35 | ok | 106 | 110 | 0.964 | ok |
| 5 | E | SPR | 20 | 35 | ok | 53 | 40 | 1.325 | ok |
| 6 | E | SPR | 38 | 55 | ok | 42 | 40 | 1.050 | ok |
| 7 | E | MC | 33 | 55 | ok | 135 | 110 | 1.227 | ok |
| 8 | M | MC | 23 | 35 | ok | 189 | 135 | 1.400 | ok |
| 9 | E | MC | 13 | 35 | ok | 147 | 110 | 1.336 | ok |
| 10 | M | MC | 55 | 55 | ok | 158 | 135 | 1.170 | ok |
| 11 | M | MC | 36 | 55 | ok | 122 | 135 | 0.904 | ok |
| 12 | M | SPR | 8 | 35 | ok | 136 | 100 | 1.360 | ok |
| 13 | M | SPR | 31 | 35 | ok | 112 | 100 | 1.120 | ok |
| 14 | M | MC | 39 | 55 | ok | 182 | 135 | 1.348 | ok |
| 15 | M | MC | 28 | 35 | ok | 176 | 135 | 1.304 | ok |
| 16 | M | MC | 24 | 35 | ok | 194 | 135 | 1.437 | ok |
| 17 | H | MC | 22 | 35 | ok | 199 | 170 | 1.171 | ok |
| 18 | H | MC | 73 | 75 | ok | 237 | 170 | 1.394 | ok |
| 19 | H | SPR | 29 | 35 | ok | 141 | 130 | 1.085 | ok |
| 20 | H | MC | 24 | 35 | ok | 199 | 170 | 1.171 | ok |
| 21 | H | MC | 24 | 35 | ok | 180 | 170 | 1.059 | ok |
| 22 | H | SPR | 29 | 35 | ok | 157 | 130 | 1.208 | ok |

Band means: MC-E **126.0** (norm 110, +15%) · MC-H **203.8** (norm 170, +20%) · MC-M **170.2** (norm 135, +26%) · SPR-E **47.5** (norm 40, +19%) · SPR-H **149.0** (norm 130, +15%) · SPR-M **124.0** (norm 100, +24%)
**Stems over cap: 0. Rationales outside [0.55×, 1.45×]: 0.** Worst ratio Q16 **1.437×** (unchanged, below the trigger).

Two medium-MC ratios rose as the *direct, unavoidable* cost of the adjudicated repairs, and are booked
here rather than hidden: **Q10 129 → 158 w**, because each dismissal must now name the recorded value on
which its option is false (the logical defect the re-audit found), and **Q15 102 → 176 w**, because the
item grew a translation step — and its 0.76× rationale was itself the re-audit's evidence that *medium*
was not earned. Medium-MC band mean therefore moves 153.0 → 170.2. Every item remains inside the
enforced ±45% band.

### Module 4
| Q | diff | fmt | stem | cap | ✓ | rationale | norm | ratio | ✓ |
|---|---|---|---|---|---|---|---|---|---|
| 1 | E | MC | 36 | 55 | ok | 147 | 110 | 1.336 | ok |
| 2 | E | MC | 12 | 15 | ok | 132 | 110 | 1.200 | ok |
| 3 | E | MC | 27 | 55 | ok | 131 | 110 | 1.191 | ok |
| 4 | E | MC | 17 | 35 | ok | 98 | 110 | 0.891 | ok |
| 5 | E | SPR | 8 | 35 | ok | 39 | 40 | 0.975 | ok |
| 6 | E | SPR | 17 | 35 | ok | 44 | 40 | 1.100 | ok |
| 7 | E | MC | 17 | 35 | ok | 153 | 110 | 1.391 | ok |
| 8 | E | MC | 34 | 55 | ok | 152 | 110 | 1.382 | ok |
| 9 | M | MC | 55 | 55 | ok | 164 | 135 | 1.215 | ok |
| 10 | E | MC | 48 | 55 | ok | 130 | 110 | 1.182 | ok |
| 11 | M | MC | 12 | 35 | ok | 162 | 135 | 1.200 | ok |
| 12 | M | SPR | 19 | 35 | ok | 86 | 100 | 0.860 | ok |
| 13 | M | SPR | 27 | 35 | ok | 102 | 100 | 1.020 | ok |
| 14 | M | MC | 53 | 55 | ok | 183 | 135 | 1.356 | ok |
| 15 | M | MC | 22 | 35 | ok | 126 | 135 | 0.933 | ok |
| 16 | M | MC | 41 | 55 | ok | 162 | 135 | 1.200 | ok |
| 17 | H | MC | 27 | 35 | ok | 159 | 170 | 0.935 | ok |
| 18 | H | MC | 34 | 35 | ok | 243 | 170 | 1.429 | ok |
| 19 | H | SPR | 39 | 55 | ok | 144 | 130 | 1.108 | ok |
| 20 | H | MC | 35 | 35 | ok | 192 | 170 | 1.129 | ok |
| 21 | H | MC | 10 | 35 | ok | 214 | 170 | 1.259 | ok |
| 22 | H | SPR | 22 | 35 | ok | 178 | 130 | 1.369 | ok |

Band means: MC-E **134.7** (norm 110, +22%) · MC-H **202.0** (norm 170, +19%) · MC-M **159.4** (norm 135, +18%) · SPR-E **41.5** (norm 40, +4%) · SPR-H **161.0** (norm 130, +24%) · SPR-M **94.0** (norm 100, -6%)
**Stems over cap: 0. Rationales outside [0.55×, 1.45×]: 0.** Worst ratio Q18 **1.429×** (unchanged, below the trigger).
Q17 moves 119 → 159 w, i.e. **0.70× → 0.935×**, closing the "lowest ratio in the entire form" finding.

---

## 5. Form-level invariants re-confirmed after the repairs

| Check | Result |
|---|---|
| Key-letter balance | M3 **A4 / B4 / C4 / D4** · M4 **A4 / B4 / C4 / D4** — exact, recomputed from `correctAnswer`. Q10 keeps D; Q15 keeps C; Q17 keeps B. |
| Difficulty ramp / dip | M3 `EEEEEEE M E MMMMMMM HHHHHH` · M4 `EEEEEEEE M E MMMMMM HHHHHH` — **exactly one dip per module**, monotone otherwise |
| Difficulty mix | M3 8E / 8M / 6H · M4 9E / 7M / 6H — exact |
| SPR positions & difficulty | 5, 6, 12, 13, 19, 22 = E/E/M/M/H/H in both modules — untouched |
| SPR census | 9 integers (one negative, −12; three-digit engineered 216, 201, 107) · 2 fractions · 1 decimal · **0 multi-root** — now matching the blueprint, which was updated |
| Domain quotas | ALG 14 · ADV 14 · PSDA 8 · GEO 8 — exact |
| Skill quotas | all 19 rows exact (no repaired item changed `subcategory` or `subcategoryId`) |
| Visual quota | 4 per module; M3 dot plot Q7 / table Q8 / geometry Q9 / **parabola Q15 (regenerated)**; M4 curve Q4 / two-way table Q10 / geometry Q11 / scatter Q16. Zero histograms, zero box plots. 6 referenced, 6 on disk, 0 orphans; `PT5-M4-Q11.svg` byte-identical after regeneration (md5 `7fdf124e…`) |
| Trap tally | unchanged, incl. **function-notation nesting ×1** (M4 Q6) and **extraneous/nonreal ×1** (M3 Q12). Q10 keeps strict-vs-inclusive, Q15 keeps ordered-pair reversal, Q17 keeps exponent-structure conversion — one mechanism per item |
| Applied share | M3 7 + M4 8 = **15/44 = 34.1%**, inside the §2c 30–35% band. Q17 stayed abstract by construction; the verifier asserts the applied slot list item-by-item |
| §8 notation | 128 option strings: 0 HTML tags, 0 entities, 0 LaTeX/`$`, 0 Unicode minus. 0 bare `<`/`>` in `passage`/`text`/`explanation`/`graphDescription` across all 44 items — machine-scanned after the edits. Q10's `47 < t < 55` is an **option** (plain React text, never HTML) and remains spaced so it can never look like a tag |
| §7 liturgy | 44/44 — correct openers, dismissals in strict letter order, "Therefore," everywhere, curly apostrophes, no dismissals inside an SPR, entry-forms note on exactly the three non-integer SPRs |

---

## 6. Verify outputs

### `verify_M4.py` (exit 0)

```
ULTRASAT PT5 - MODULE 4 verification
  questions      : 22 (16 MC / 6 SPR)
  key letters    : {'A': 4, 'B': 4, 'C': 4, 'D': 4}
  SPR answers    : {5: '13', 6: '107', 12: '12', 13: '12.5', 19: '31', 22: '15/2'}
  assertions run : 1242

ALL CHECKS PASSED
```

### `verify_M3.py` (exit 0) — summary

```
== Q15 vertex of a translated parabola ==
  PASS  vertex of y = -x^2 - 2x + 8 is (-1, 9) and the parabola opens downward
  PASS  leading coefficient negative (orientation differs from PT4's parabola)
  PASS  x-intercepts (-4, 0) and (2, 0); y-intercept (0, 8)
  PASS  vertex of y = f(x) + 3 is (-1, 12) -- the key, a two-step read
  PASS  key (-1, 12) is none of PT4 M4.04's features (its (0, 5) y-intercept included)
  PASS  the re-rolled parabola no longer shares PT4 M4.04's constant term 5
  PASS  options / key index C
  PASS  ordered pairs ascending by first coordinate, then second
  PASS  A = the vertex of y = f(x + 3): the f(x)+3 vs f(x+3) confusion, one nameable error
  PASS  B = the untranslated vertex (the translation not applied)
  PASS  D is the key with its coordinates reversed (the trap)
  PASS  the reversal distractor (12, -1) is on neither the drawn nor the translated graph
  PASS  all four ordered pairs distinct
  PASS  asked target is the vertex of a TRANSLATED graph: read two features, then translate
  PASS  Q15 medium is now earned by the added translation step
  PASS  Q15 trap unchanged: ordered-pair reversal
  PASS  Q15 alt text does not disclose the key
  PASS  Q15 alt text names at most one option (the figure's own vertex) -- it never enumerates the set
  PASS  Q15 alt text describes the figure: (-1, 9)
  PASS  Q15 alt text describes the figure: (-4, 0)
  PASS  Q15 alt text describes the figure: (2, 0)
  PASS  Q15 alt text describes the figure: (0, 8)
  PASS  Q15 alt text describes the figure: opens downward
```

```
ALL CHECKS PASSED — M3.json verified clean.
```

Section-by-section PASS counts for the full M3 run are in Appendix A, which reproduces the complete
735-line transcript.

---

## Appendix A — `verify_M3.py`, complete transcript

```
== Length ruler (instrument self-test) ==
  PASS  rat_words counts every whitespace token (operators and numerals included)
  PASS  stem_words counts every whitespace token (numerals and operators included)
== Module shell ==
  PASS  moduleNumber 3 / section Math
  PASS  title 'Exam 5, Module 3'
  PASS  calculatorAllowed true, timeLimit 2100
  PASS  22 questions
  PASS  originalQuestionNumber 1..22 in order
  PASS  SPR positions [5, 6, 12, 13, 19, 22] == [5, 6, 12, 13, 19, 22]
  PASS  16 MC + 6 SPR
  PASS  every MC has exactly 4 options
  PASS  difficulty ramp E x7, M at Q8, E straggler at Q9, M x7 (Q10-16), H x6 (Q17-22)
  PASS  ramp carries exactly one dip (Q8 medium before Q9 easy), not a perfect step function
  PASS  PT5 M3 difficulty mix 8E / 8M / 6H
  PASS  SPR difficulty by position E/E/M/M/H/H
  PASS  key-letter tally {'A': 4, 'B': 4, 'C': 4, 'D': 4} == 4/4/4/4
== Blueprint quotas ==
  PASS  subcategory -> subcategoryId map correct on all 22 items
  PASS  domain quota {'ALG': 7, 'PSDA': 4, 'ADV': 7, 'GEO': 4} == ALG 7 / ADV 7 / PSDA 4 / GEO 4
  PASS  skill quota matches blueprint row-by-row (15 skills)
  PASS  no probability item (Module 4 only)
  PASS  no evaluating-statistical-claims and no inference-statistics (PT5 sets inference to 0)
  PASS  at least one circles item per module
  PASS  Q1 slot == blueprint (linear-equations-one-variable / easy / multiple-choice)
  PASS  Q2 slot == blueprint (ratios-rates-proportions / easy / multiple-choice)
  PASS  Q3 slot == blueprint (equivalent-expressions / easy / multiple-choice)
  PASS  Q4 slot == blueprint (nonlinear-functions / easy / multiple-choice)
  PASS  Q5 slot == blueprint (linear-functions / easy / user-input)
  PASS  Q6 slot == blueprint (area-volume / easy / user-input)
  PASS  Q7 slot == blueprint (one-variable-data / easy / multiple-choice)
  PASS  Q8 slot == blueprint (linear-functions / medium / multiple-choice)
  PASS  Q9 slot == blueprint (lines-angles-triangles / easy / multiple-choice)
  PASS  Q10 slot == blueprint (linear-inequalities / medium / multiple-choice)
  PASS  Q11 slot == blueprint (percentages / medium / multiple-choice)
  PASS  Q12 slot == blueprint (nonlinear-equations / medium / user-input)
  PASS  Q13 slot == blueprint (right-triangles-trigonometry / medium / user-input)
  PASS  Q14 slot == blueprint (nonlinear-functions / medium / multiple-choice)
  PASS  Q15 slot == blueprint (nonlinear-functions / medium / multiple-choice)
  PASS  Q16 slot == blueprint (circles / medium / multiple-choice)
  PASS  Q17 slot == blueprint (systems-linear-equations / hard / multiple-choice)
  PASS  Q18 slot == blueprint (one-variable-data / hard / multiple-choice)
  PASS  Q19 slot == blueprint (nonlinear-functions / hard / user-input)
  PASS  Q20 slot == blueprint (linear-equations-one-variable / hard / multiple-choice)
  PASS  Q21 slot == blueprint (nonlinear-equations / hard / multiple-choice)
  PASS  Q22 slot == blueprint (linear-equations-two-variables / hard / user-input)
  PASS  SVG-stimulus items [(7, 'PT5-M3-Q07.svg'), (9, 'PT5-M3-Q09.svg'), (15, 'PT5-M3-Q15.svg')] == Q7 dot plot, Q9 geometry, Q15 parabola
  PASS  Q8 carries the HTML data table (not an SVG)
  PASS  Q8 graphAsset is null (table lives in the passage)
  PASS  visual quota = 4 (3 SVGs + 1 HTML table)
  PASS  applied slots [2, 6, 7, 10, 11, 14, 18] exactly (7/22 = 32%)
== App format contract ==
  PASS  options contain no HTML tags
  PASS  options contain no HTML entities
  PASS  options contain no LaTeX / dollar-math
  PASS  options use the ASCII hyphen for minus, never U+2212
  PASS  Q1 passage has no unescaped angle bracket
  PASS  Q1 text has no unescaped angle bracket
  PASS  Q1 explanation has no unescaped angle bracket
  PASS  Q2 text has no unescaped angle bracket
  PASS  Q2 explanation has no unescaped angle bracket
  PASS  Q3 text has no unescaped angle bracket
  PASS  Q3 explanation has no unescaped angle bracket
  PASS  Q4 text has no unescaped angle bracket
  PASS  Q4 explanation has no unescaped angle bracket
  PASS  Q5 text has no unescaped angle bracket
  PASS  Q5 explanation has no unescaped angle bracket
  PASS  Q6 passage has no unescaped angle bracket
  PASS  Q6 text has no unescaped angle bracket
  PASS  Q6 explanation has no unescaped angle bracket
  PASS  Q7 passage has no unescaped angle bracket
  PASS  Q7 text has no unescaped angle bracket
  PASS  Q7 explanation has no unescaped angle bracket
  PASS  Q8 passage has no unescaped angle bracket
  PASS  Q8 text has no unescaped angle bracket
  PASS  Q8 explanation has no unescaped angle bracket
  PASS  Q9 text has no unescaped angle bracket
  PASS  Q9 explanation has no unescaped angle bracket
  PASS  Q10 passage has no unescaped angle bracket
  PASS  Q10 text has no unescaped angle bracket
  PASS  Q10 explanation has no unescaped angle bracket
  PASS  Q11 passage has no unescaped angle bracket
  PASS  Q11 text has no unescaped angle bracket
  PASS  Q11 explanation has no unescaped angle bracket
  PASS  Q12 passage has no unescaped angle bracket
  PASS  Q12 text has no unescaped angle bracket
  PASS  Q12 explanation has no unescaped angle bracket
  PASS  Q13 passage has no unescaped angle bracket
  PASS  Q13 text has no unescaped angle bracket
  PASS  Q13 explanation has no unescaped angle bracket
  PASS  Q14 passage has no unescaped angle bracket
  PASS  Q14 text has no unescaped angle bracket
  PASS  Q14 explanation has no unescaped angle bracket
  PASS  Q15 text has no unescaped angle bracket
  PASS  Q15 explanation has no unescaped angle bracket
  PASS  Q16 text has no unescaped angle bracket
  PASS  Q16 explanation has no unescaped angle bracket
  PASS  Q17 passage has no unescaped angle bracket
  PASS  Q17 text has no unescaped angle bracket
  PASS  Q17 explanation has no unescaped angle bracket
  PASS  Q18 passage has no unescaped angle bracket
  PASS  Q18 text has no unescaped angle bracket
  PASS  Q18 explanation has no unescaped angle bracket
  PASS  Q19 passage has no unescaped angle bracket
  PASS  Q19 text has no unescaped angle bracket
  PASS  Q19 explanation has no unescaped angle bracket
  PASS  Q20 passage has no unescaped angle bracket
  PASS  Q20 text has no unescaped angle bracket
  PASS  Q20 explanation has no unescaped angle bracket
  PASS  Q21 passage has no unescaped angle bracket
  PASS  Q21 text has no unescaped angle bracket
  PASS  Q21 explanation has no unescaped angle bracket
  PASS  Q22 passage has no unescaped angle bracket
  PASS  Q22 text has no unescaped angle bracket
  PASS  Q22 explanation has no unescaped angle bracket
  PASS  no LaTeX in stems
  PASS  Q1 displayed equation is centered
  PASS  Q12 displayed equation is centered
  PASS  Q17 displayed equation is centered
  PASS  Q19 displayed equation is centered
  PASS  Q20 displayed equation is centered
  PASS  Q21 displayed equation is centered
  PASS  Q22 displayed equation is centered
  PASS  Q17 system stacks two centered equation divs
  PASS  Q8 table: border-collapse, 1px #333 borders, bold <th> headers
  PASS  Q8 table has a lead-in sentence
  PASS  Q1 has no stray graphDescription
  PASS  Q2 has no stray graphDescription
  PASS  Q3 has no stray graphDescription
  PASS  Q4 has no stray graphDescription
  PASS  Q5 has no stray graphDescription
  PASS  Q6 has no stray graphDescription
  PASS  Q7 figure has alt text
  PASS  Q8 has no stray graphDescription
  PASS  Q9 figure has alt text
  PASS  Q10 has no stray graphDescription
  PASS  Q11 has no stray graphDescription
  PASS  Q12 has no stray graphDescription
  PASS  Q13 has no stray graphDescription
  PASS  Q14 has no stray graphDescription
  PASS  Q15 figure has alt text
  PASS  Q16 has no stray graphDescription
  PASS  Q17 has no stray graphDescription
  PASS  Q18 has no stray graphDescription
  PASS  Q19 has no stray graphDescription
  PASS  Q20 has no stray graphDescription
  PASS  Q21 has no stray graphDescription
  PASS  Q22 has no stray graphDescription
  PASS  Q1 carries the authoring metadata fields
  PASS  Q2 carries the authoring metadata fields
  PASS  Q3 carries the authoring metadata fields
  PASS  Q4 carries the authoring metadata fields
  PASS  Q5 carries the authoring metadata fields
  PASS  Q6 carries the authoring metadata fields
  PASS  Q7 carries the authoring metadata fields
  PASS  Q8 carries the authoring metadata fields
  PASS  Q9 carries the authoring metadata fields
  PASS  Q10 carries the authoring metadata fields
  PASS  Q11 carries the authoring metadata fields
  PASS  Q12 carries the authoring metadata fields
  PASS  Q13 carries the authoring metadata fields
  PASS  Q14 carries the authoring metadata fields
  PASS  Q15 carries the authoring metadata fields
  PASS  Q16 carries the authoring metadata fields
  PASS  Q17 carries the authoring metadata fields
  PASS  Q18 carries the authoring metadata fields
  PASS  Q19 carries the authoring metadata fields
  PASS  Q20 carries the authoring metadata fields
  PASS  Q21 carries the authoring metadata fields
  PASS  Q22 carries the authoring metadata fields
== Rationale liturgy (spec section 7) ==
  PASS  Q1 opens 'Choice A is correct.'
  PASS  Q1 dismisses BCD in letter order
  PASS  Q1 rationale closes with a 'Therefore,' sentence
  PASS  Q1 rationale has no first/second person
  PASS  Q2 opens 'Choice D is correct.'
  PASS  Q2 dismisses ABC in letter order
  PASS  Q2 rationale closes with a 'Therefore,' sentence
  PASS  Q2 rationale has no first/second person
  PASS  Q3 opens 'Choice C is correct.'
  PASS  Q3 dismisses ABD in letter order
  PASS  Q3 rationale closes with a 'Therefore,' sentence
  PASS  Q3 rationale has no first/second person
  PASS  Q4 opens 'Choice D is correct.'
  PASS  Q4 dismisses ABC in letter order
  PASS  Q4 rationale closes with a 'Therefore,' sentence
  PASS  Q4 rationale has no first/second person
  PASS  Q7 opens 'Choice A is correct.'
  PASS  Q7 dismisses BCD in letter order
  PASS  Q7 rationale closes with a 'Therefore,' sentence
  PASS  Q7 rationale has no first/second person
  PASS  Q8 opens 'Choice A is correct.'
  PASS  Q8 dismisses BCD in letter order
  PASS  Q8 rationale closes with a 'Therefore,' sentence
  PASS  Q8 rationale has no first/second person
  PASS  Q9 opens 'Choice A is correct.'
  PASS  Q9 dismisses BCD in letter order
  PASS  Q9 rationale closes with a 'Therefore,' sentence
  PASS  Q9 rationale has no first/second person
  PASS  Q10 opens 'Choice D is correct.'
  PASS  Q10 dismisses ABC in letter order
  PASS  Q10 rationale closes with a 'Therefore,' sentence
  PASS  Q10 rationale has no first/second person
  PASS  Q11 opens 'Choice D is correct.'
  PASS  Q11 dismisses ABC in letter order
  PASS  Q11 rationale closes with a 'Therefore,' sentence
  PASS  Q11 rationale has no first/second person
  PASS  Q14 opens 'Choice C is correct.'
  PASS  Q14 dismisses ABD in letter order
  PASS  Q14 rationale closes with a 'Therefore,' sentence
  PASS  Q14 rationale has no first/second person
  PASS  Q15 opens 'Choice C is correct.'
  PASS  Q15 dismisses ABD in letter order
  PASS  Q15 rationale closes with a 'Therefore,' sentence
  PASS  Q15 rationale has no first/second person
  PASS  Q16 opens 'Choice C is correct.'
  PASS  Q16 dismisses ABD in letter order
  PASS  Q16 rationale closes with a 'Therefore,' sentence
  PASS  Q16 rationale has no first/second person
  PASS  Q17 opens 'Choice B is correct.'
  PASS  Q17 dismisses ACD in letter order
  PASS  Q17 rationale closes with a 'Therefore,' sentence
  PASS  Q17 rationale has no first/second person
  PASS  Q18 opens 'Choice B is correct.'
  PASS  Q18 dismisses ACD in letter order
  PASS  Q18 rationale closes with a 'Therefore,' sentence
  PASS  Q18 rationale has no first/second person
  PASS  Q20 opens 'Choice B is correct.'
  PASS  Q20 dismisses ACD in letter order
  PASS  Q20 rationale closes with a 'Therefore,' sentence
  PASS  Q20 rationale has no first/second person
  PASS  Q21 opens 'Choice B is correct.'
  PASS  Q21 dismisses ACD in letter order
  PASS  Q21 rationale closes with a 'Therefore,' sentence
  PASS  Q21 rationale has no first/second person
  PASS  Q5 SPR opens 'The correct answer is ...'
  PASS  Q5 SPR has no dismissals
  PASS  Q5 SPR closes with 'Therefore,'
  PASS  Q6 SPR opens 'The correct answer is ...'
  PASS  Q6 SPR has no dismissals
  PASS  Q6 SPR closes with 'Therefore,'
  PASS  Q12 SPR opens 'The correct answer is ...'
  PASS  Q12 SPR has no dismissals
  PASS  Q12 SPR closes with 'Therefore,'
  PASS  Q13 SPR opens 'The correct answer is ...'
  PASS  Q13 SPR has no dismissals
  PASS  Q13 SPR closes with 'Therefore,'
  PASS  Q19 SPR opens 'The correct answer is ...'
  PASS  Q19 SPR has no dismissals
  PASS  Q19 SPR closes with 'Therefore,'
  PASS  Q22 SPR opens 'The correct answer is ...'
  PASS  Q22 SPR has no dismissals
  PASS  Q22 SPR closes with 'Therefore,'
  PASS  Q5 entry-forms note present iff the answer is non-integer
  PASS  Q6 entry-forms note present iff the answer is non-integer
  PASS  Q12 entry-forms note present iff the answer is non-integer
  PASS  Q13 entry-forms note present iff the answer is non-integer
  PASS  Q19 entry-forms note present iff the answer is non-integer
  PASS  Q22 entry-forms note present iff the answer is non-integer
  PASS  'It’s given that' (curly apostrophe) used on at least 13 items
  PASS  'yields' used throughout the derivations
  PASS  Q1 rationale 117 words within [60, 159] (norm 110, ratio 1.06)
  PASS  Q2 rationale 132 words within [60, 159] (norm 110, ratio 1.20)
  PASS  Q3 rationale 119 words within [60, 159] (norm 110, ratio 1.08)
  PASS  Q4 rationale 106 words within [60, 159] (norm 110, ratio 0.96)
  PASS  Q5 rationale 53 words within [22, 58] (norm 40, ratio 1.32)
  PASS  Q6 rationale 42 words within [22, 58] (norm 40, ratio 1.05)
  PASS  Q7 rationale 135 words within [60, 159] (norm 110, ratio 1.23)
  PASS  Q8 rationale 189 words within [74, 195] (norm 135, ratio 1.40)
  PASS  Q9 rationale 147 words within [60, 159] (norm 110, ratio 1.34)
  PASS  Q10 rationale 158 words within [74, 195] (norm 135, ratio 1.17)
  PASS  Q11 rationale 122 words within [74, 195] (norm 135, ratio 0.90)
  PASS  Q12 rationale 136 words within [55, 145] (norm 100, ratio 1.36)
  PASS  Q13 rationale 112 words within [55, 145] (norm 100, ratio 1.12)
  PASS  Q14 rationale 182 words within [74, 195] (norm 135, ratio 1.35)
  PASS  Q15 rationale 176 words within [74, 195] (norm 135, ratio 1.30)
  PASS  Q16 rationale 194 words within [74, 195] (norm 135, ratio 1.44)
  PASS  Q17 rationale 199 words within [93, 246] (norm 170, ratio 1.17)
  PASS  Q18 rationale 237 words within [93, 246] (norm 170, ratio 1.39)
  PASS  Q19 rationale 141 words within [71, 188] (norm 130, ratio 1.08)
  PASS  Q20 rationale 199 words within [93, 246] (norm 170, ratio 1.17)
  PASS  Q21 rationale 180 words within [93, 246] (norm 170, ratio 1.06)
  PASS  Q22 rationale 157 words within [71, 188] (norm 130, ratio 1.21)
  PASS  Q1 stem prose 8 words within cap 35
  PASS  Q2 stem prose 22 words within cap 55
  PASS  Q3 stem prose 10 words within cap 15
  PASS  Q4 stem prose 17 words within cap 35
  PASS  Q5 stem prose 20 words within cap 35
  PASS  Q6 stem prose 38 words within cap 55
  PASS  Q7 stem prose 33 words within cap 55
  PASS  Q8 stem prose 23 words within cap 35
  PASS  Q9 stem prose 13 words within cap 35
  PASS  Q10 stem prose 55 words within cap 55
  PASS  Q11 stem prose 36 words within cap 55
  PASS  Q12 stem prose 8 words within cap 35
  PASS  Q13 stem prose 31 words within cap 35
  PASS  Q14 stem prose 39 words within cap 55
  PASS  Q15 stem prose 28 words within cap 35
  PASS  Q16 stem prose 24 words within cap 35
  PASS  Q17 stem prose 22 words within cap 35
  PASS  Q18 stem prose 73 words within cap 75
  PASS  Q19 stem prose 29 words within cap 35
  PASS  Q20 stem prose 24 words within cap 35
  PASS  Q21 stem prose 24 words within cap 35
  PASS  Q22 stem prose 29 words within cap 35
  PASS  named people ['Mateo'] within the 2-per-module cap
  PASS  no Latin binomial in Module 3 (the form's one binomial belongs to Module 4)
== SPR acceptedAnswers (full legal-entry enumeration) ==
  PASS  Q5 SPR field shapes
  PASS  Q5 acceptedAnswers == complete legal-entry set (12 forms)
  PASS  Q5 canonical form listed first
  PASS  Q5 canonical answer evaluates to the key value
  PASS  Q5 entry '11' within the 5-character rule
  PASS  Q5 entry '11' is a correct value
  PASS  Q5 entry '11/1' within the 5-character rule
  PASS  Q5 entry '11/1' is a correct value
  PASS  Q5 entry '22/2' within the 5-character rule
  PASS  Q5 entry '22/2' is a correct value
  PASS  Q5 entry '33/3' within the 5-character rule
  PASS  Q5 entry '33/3' is a correct value
  PASS  Q5 entry '44/4' within the 5-character rule
  PASS  Q5 entry '44/4' is a correct value
  PASS  Q5 entry '55/5' within the 5-character rule
  PASS  Q5 entry '55/5' is a correct value
  PASS  Q5 entry '66/6' within the 5-character rule
  PASS  Q5 entry '66/6' is a correct value
  PASS  Q5 entry '77/7' within the 5-character rule
  PASS  Q5 entry '77/7' is a correct value
  PASS  Q5 entry '88/8' within the 5-character rule
  PASS  Q5 entry '88/8' is a correct value
  PASS  Q5 entry '99/9' within the 5-character rule
  PASS  Q5 entry '99/9' is a correct value
  PASS  Q5 entry '11.0' within the 5-character rule
  PASS  Q5 entry '11.0' is a correct value
  PASS  Q5 entry '11.00' within the 5-character rule
  PASS  Q5 entry '11.00' is a correct value
  PASS  Q6 SPR field shapes
  PASS  Q6 acceptedAnswers == complete legal-entry set (6 forms)
  PASS  Q6 canonical form listed first
  PASS  Q6 canonical answer evaluates to the key value
  PASS  Q6 entry '216' within the 5-character rule
  PASS  Q6 entry '216' is a correct value
  PASS  Q6 entry '216/1' within the 5-character rule
  PASS  Q6 entry '216/1' is a correct value
  PASS  Q6 entry '432/2' within the 5-character rule
  PASS  Q6 entry '432/2' is a correct value
  PASS  Q6 entry '648/3' within the 5-character rule
  PASS  Q6 entry '648/3' is a correct value
  PASS  Q6 entry '864/4' within the 5-character rule
  PASS  Q6 entry '864/4' is a correct value
  PASS  Q6 entry '216.0' within the 5-character rule
  PASS  Q6 entry '216.0' is a correct value
  PASS  Q12 SPR field shapes
  PASS  Q12 acceptedAnswers == complete legal-entry set (15 forms)
  PASS  Q12 canonical form listed first
  PASS  Q12 canonical answer evaluates to the key value
  PASS  Q12 entry '9' within the 5-character rule
  PASS  Q12 entry '9' is a correct value
  PASS  Q12 entry '9/1' within the 5-character rule
  PASS  Q12 entry '9/1' is a correct value
  PASS  Q12 entry '18/2' within the 5-character rule
  PASS  Q12 entry '18/2' is a correct value
  PASS  Q12 entry '27/3' within the 5-character rule
  PASS  Q12 entry '27/3' is a correct value
  PASS  Q12 entry '36/4' within the 5-character rule
  PASS  Q12 entry '36/4' is a correct value
  PASS  Q12 entry '45/5' within the 5-character rule
  PASS  Q12 entry '45/5' is a correct value
  PASS  Q12 entry '54/6' within the 5-character rule
  PASS  Q12 entry '54/6' is a correct value
  PASS  Q12 entry '63/7' within the 5-character rule
  PASS  Q12 entry '63/7' is a correct value
  PASS  Q12 entry '72/8' within the 5-character rule
  PASS  Q12 entry '72/8' is a correct value
  PASS  Q12 entry '81/9' within the 5-character rule
  PASS  Q12 entry '81/9' is a correct value
  PASS  Q12 entry '90/10' within the 5-character rule
  PASS  Q12 entry '90/10' is a correct value
  PASS  Q12 entry '99/11' within the 5-character rule
  PASS  Q12 entry '99/11' is a correct value
  PASS  Q12 entry '9.0' within the 5-character rule
  PASS  Q12 entry '9.0' is a correct value
  PASS  Q12 entry '9.00' within the 5-character rule
  PASS  Q12 entry '9.00' is a correct value
  PASS  Q12 entry '9.000' within the 5-character rule
  PASS  Q12 entry '9.000' is a correct value
  PASS  Q13 SPR field shapes
  PASS  Q13 acceptedAnswers == complete legal-entry set (9 forms)
  PASS  Q13 canonical form listed first
  PASS  Q13 canonical answer evaluates to the key value
  PASS  Q13 entry '15/17' within the 5-character rule
  PASS  Q13 entry '15/17' is a correct value
  PASS  Q13 entry '30/34' within the 5-character rule
  PASS  Q13 entry '30/34' is a correct value
  PASS  Q13 entry '45/51' within the 5-character rule
  PASS  Q13 entry '45/51' is a correct value
  PASS  Q13 entry '60/68' within the 5-character rule
  PASS  Q13 entry '60/68' is a correct value
  PASS  Q13 entry '75/85' within the 5-character rule
  PASS  Q13 entry '75/85' is a correct value
  PASS  Q13 entry '0.882' within the 5-character rule
  PASS  Q13 entry '0.882' is a correct value
  PASS  Q13 entry '.882' within the 5-character rule
  PASS  Q13 entry '.882' is a correct value
  PASS  Q13 entry '.8823' within the 5-character rule
  PASS  Q13 entry '.8823' is a correct value
  PASS  Q13 entry '.8824' within the 5-character rule
  PASS  Q13 entry '.8824' is a correct value
  PASS  Q19 SPR field shapes
  PASS  Q19 acceptedAnswers == complete legal-entry set (6 forms)
  PASS  Q19 canonical form listed first
  PASS  Q19 canonical answer evaluates to the key value
  PASS  Q19 entry '201' within the 5-character rule
  PASS  Q19 entry '201' is a correct value
  PASS  Q19 entry '201/1' within the 5-character rule
  PASS  Q19 entry '201/1' is a correct value
  PASS  Q19 entry '402/2' within the 5-character rule
  PASS  Q19 entry '402/2' is a correct value
  PASS  Q19 entry '603/3' within the 5-character rule
  PASS  Q19 entry '603/3' is a correct value
  PASS  Q19 entry '804/4' within the 5-character rule
  PASS  Q19 entry '804/4' is a correct value
  PASS  Q19 entry '201.0' within the 5-character rule
  PASS  Q19 entry '201.0' is a correct value
  PASS  Q22 SPR field shapes
  PASS  Q22 acceptedAnswers == complete legal-entry set (12 forms)
  PASS  Q22 canonical form listed first
  PASS  Q22 canonical answer evaluates to the key value
  PASS  Q22 entry '-12' within the 6-character rule
  PASS  Q22 entry '-12' is a correct value
  PASS  Q22 entry '-12/1' within the 6-character rule
  PASS  Q22 entry '-12/1' is a correct value
  PASS  Q22 entry '-24/2' within the 6-character rule
  PASS  Q22 entry '-24/2' is a correct value
  PASS  Q22 entry '-36/3' within the 6-character rule
  PASS  Q22 entry '-36/3' is a correct value
  PASS  Q22 entry '-48/4' within the 6-character rule
  PASS  Q22 entry '-48/4' is a correct value
  PASS  Q22 entry '-60/5' within the 6-character rule
  PASS  Q22 entry '-60/5' is a correct value
  PASS  Q22 entry '-72/6' within the 6-character rule
  PASS  Q22 entry '-72/6' is a correct value
  PASS  Q22 entry '-84/7' within the 6-character rule
  PASS  Q22 entry '-84/7' is a correct value
  PASS  Q22 entry '-96/8' within the 6-character rule
  PASS  Q22 entry '-96/8' is a correct value
  PASS  Q22 entry '-108/9' within the 6-character rule
  PASS  Q22 entry '-108/9' is a correct value
  PASS  Q22 entry '-12.0' within the 6-character rule
  PASS  Q22 entry '-12.0' is a correct value
  PASS  Q22 entry '-12.00' within the 6-character rule
  PASS  Q22 entry '-12.00' is a correct value
  PASS  Q5 no legal equivalent fraction is missing (gap [])
  PASS  Q6 no legal equivalent fraction is missing (gap [])
  PASS  Q12 no legal equivalent fraction is missing (gap [])
  PASS  Q13 no legal equivalent fraction is missing (gap [])
  PASS  Q19 no legal equivalent fraction is missing (gap [])
  PASS  Q22 no legal equivalent fraction is missing (gap [])
  PASS  M3 SPR census: 5 integers, 1 fraction
  PASS  exactly one negative SPR, at Q22 (the form's only negative)
  PASS  at least one engineered 3-digit integer
  PASS  Q5, Q6, Q12 and Q19 are plain integers (the retired multi-root SPR is now a single integer)
== Q1 linear solve, variable on both sides ==
  PASS  recompute: 7x + 12 = 3x + 40 gives x = 7
  PASS  recipes: sign error (40+12)/4 = 13, 4x = 28
  PASS  key and all three distractors distinct
  PASS  options / key index A
  PASS  numeric options strictly ascending
== Q2 proportion solve ==
  PASS  96/4 = 24 apples per crate; 24 x 7 = 168
  PASS  recipes: unit rate 24, other member 7x4 = 28, sum 103
  PASS  key and distractors distinct
  PASS  options / key index D
  PASS  ascending
== Q3 product of powers ==
  PASS  recompute (2x^5)(9x^3) = 18x^8
  PASS  key 18x^8 at index C
  PASS  A = added coefficients (2 + 9)
  PASS  B = subtracted exponents (5 - 3)
  PASS  D = multiplied exponents (5 x 3)
  PASS  all distractors differ from the key
  PASS  options ordered by coefficient, then exponent
== Q4 evaluate an exponential ==
  PASS  f(2) = 3(5)^2 = 75
  PASS  recipes: 5^2 = 25, 3x5x2 = 30, swap 5(3)^2 = 45
  PASS  key and distractors distinct
  PASS  options / key index D
  PASS  ascending
== Q5 SPR invert a linear function ==
  PASS  6x - 19 = 47 gives x = 11
  PASS  back-substitution confirms f(11) = 47
== Q6 SPR prism volume ==
  PASS  V = (9)(4)(6) = 216
  PASS  adjacent quantities (surface area 228, base perimeter 26, base area 36) differ from 216
== Q7 dot plot read-off ==
  PASS  dot plot totals the 24 stated members
  PASS  frequency at 5 games is 4 (key)
  PASS  recipes: 5 or more = 9, fewer than 5 = 15
  PASS  key and distractors distinct
  PASS  options / key index A
  PASS  ascending
== Q8 linear function from a table ==
  PASS  slope -3/2, y-intercept 22
  PASS  all four table rows satisfy f(x) = -(3/2)x + 22
  PASS  key at index A
  PASS  B = reciprocal slope (dx/dy)
  PASS  C = sign error on the slope
  PASS  D = slope/intercept swap
  PASS  option B fails the table at [(2, 19)]
  PASS  option C fails the table at [(2, 19)]
  PASS  option D fails the table at [(2, 19)]
  PASS  equation options ordered by slope, ascending
== Q9 isosceles triangle angles ==
  PASS  base angles = (180 - 80)/2 = 50
  PASS  recipes: other angle 80, undivided sum 100, supplement 130
  PASS  key and distractors distinct
  PASS  options / key index A
  PASS  ascending
  PASS  angle sum verified: 80 + 50 + 50 = 180
== Q10 bounded range — EXHAUSTIVE key-uniqueness proof ==
  PASS  option set varies the BOUNDS, not only the strictness symbols
  PASS  key D = 47 <= t <= 55
        exhaustive: 32768 admissible data sets; true-option signatures {'D': 32768}
  PASS  enumerated all 2^15 = 32,768 half-degree admissible data sets (got 32768)
  PASS  exactly ONE option is true of every admissible data set (counterexamples: [])
  PASS  the single true option is D on every one of the 32,768 data sets
  PASS  exactly one option true on all 128 integer-valued data sets ([])
  PASS  only D holds at every point of [47, 55], so no other option can be true of every data set
  PASS  A, B and C each fail at 47 or at 55 -- values EVERY admissible data set must contain
  PASS  each dismissal's counterexample is a RECORDED value: A and B fail at 55, C at 47 and at 55
  PASS  key admits both recorded extremes
  PASS  key excludes values outside the recorded range
  PASS  three distinct bound pairs across the four options [(0, 47), (47, 51), (47, 55)]
  PASS  the strict/inclusive distinction is load-bearing in exactly one distractor (C)
  PASS  option A semantically differs from the key
  PASS  option B semantically differs from the key
  PASS  option C semantically differs from the key
  PASS  options ordered by lower bound, then upper bound, then strictness
  PASS  B's upper bound 51 is the average of the two recorded extremes (its named recipe)
  PASS  Q10 dismissal A names its recipe
  PASS  Q10 dismissal B names its recipe
  PASS  all three dismissals name a RECORDED value on which the option is false
== Q11 reverse percent ==
  PASS  52 / 0.04 = 1,300
  PASS  check: 4% of 1,300 is 52
  PASS  recipes: 52/4 = 13, 52/0.4 = 130, 52x4 = 208
  PASS  key and distractors distinct
  PASS  options / key index D
  PASS  ascending (thousands comma stripped)
== Q12 SPR radical equation with an extraneous candidate ==
  PASS  squaring gives x^2 - 11x + 18 = 0, whose roots are 2 and 9
  PASS  factorization (x-2)(x-9) verified
  PASS  x = 2 is extraneous: sqrt(9) = 3 but 2 - 5 = -3
  PASS  x = 9 satisfies sqrt(x + 7) = x - 5
  PASS  sympy confirms the equation has the single real solution 9 (got [9])
  PASS  canonical answer 9
  PASS  the extraneous candidate 2 is NOT accepted
  PASS  radical displayed in the passage; the rationale rejects the extraneous candidate by substitution
== Q13 SPR trig ratio ==
  PASS  Pythagorean theorem: hypotenuse = sqrt(64 + 225) = 17
  PASS  sin(a) = opposite/hypotenuse = 15/17
  PASS  fraction is in lowest terms
  PASS  cos(a) = 8/17 and tan(a) = 15/8 differ from the key
== Q14 exponential-base interpretation ==
  PASS  key C = increases by 8% each year
  PASS  year-over-year factor is exactly 1.08
  PASS  1.08 - 1 = 0.08, an 8% increase
  PASS  B wrong: a 108% increase is a factor of 2.08
  PASS  D wrong: an 8% decrease is a factor of 0.92
  PASS  A wrong: the yearly change is not a constant number of riders
  PASS  interpretation options are near-parallel in length
== Q15 vertex of a translated parabola ==
  PASS  vertex of y = -x^2 - 2x + 8 is (-1, 9) and the parabola opens downward
  PASS  leading coefficient negative (orientation differs from PT4's parabola)
  PASS  x-intercepts (-4, 0) and (2, 0); y-intercept (0, 8)
  PASS  vertex of y = f(x) + 3 is (-1, 12) -- the key, a two-step read
  PASS  key (-1, 12) is none of PT4 M4.04's features (its (0, 5) y-intercept included)
  PASS  the re-rolled parabola no longer shares PT4 M4.04's constant term 5
  PASS  options / key index C
  PASS  ordered pairs ascending by first coordinate, then second
  PASS  A = the vertex of y = f(x + 3): the f(x)+3 vs f(x+3) confusion, one nameable error
  PASS  B = the untranslated vertex (the translation not applied)
  PASS  D is the key with its coordinates reversed (the trap)
  PASS  the reversal distractor (12, -1) is on neither the drawn nor the translated graph
  PASS  all four ordered pairs distinct
  PASS  asked target is the vertex of a TRANSLATED graph: read two features, then translate
  PASS  Q15 medium is now earned by the added translation step
  PASS  Q15 trap unchanged: ordered-pair reversal
  PASS  Q15 alt text does not disclose the key
  PASS  Q15 alt text names at most one option (the figure's own vertex) -- it never enumerates the set
  PASS  Q15 alt text describes the figure: (-1, 9)
  PASS  Q15 alt text describes the figure: (-4, 0)
  PASS  Q15 alt text describes the figure: (2, 0)
  PASS  Q15 alt text describes the figure: (0, 8)
  PASS  Q15 alt text describes the figure: opens downward
== Q16 arc length proportionality ==
  PASS  circumference 144pi; radius 72
  PASS  check: 45/360 of 144pi is 18pi
  PASS  recipes: arc 18, 180-degree slip 36, diameter 144
  PASS  key and distractors distinct
  PASS  options / key index C
  PASS  ascending
== Q17 parameter for infinitely many solutions ==
  PASS  coefficient matching: 3a = 6 gives a = 2
  PASS  with a = 2 the second equation is exactly 1/3 of the first (same line)
  PASS  a = -2 gives exactly one solution, not infinitely many
  PASS  a = 6 gives exactly one solution, not infinitely many
  PASS  a = 18 gives exactly one solution, not infinitely many
  PASS  options / key index B
  PASS  ascending
== Q18 perturbation: mean versus median ==
  PASS  400 randomized 15-value data sets: mean strictly increases, median unchanged
  PASS  mean increases by exactly (47 - 32)/15 = 1
  PASS  key B = mean greater, median the same
  PASS  the four statements form a distinct 2 x 2 menu
== Q19 SPR two conditions, composite target ==
  PASS  f(1) = 21 and f(-1) = 9 give a = 3, b = 6
  PASS  both stated conditions verified
  PASS  f(7) = 147 + 42 + 12 = 201
  PASS  wrong-target values [3, 6, 9, 18, 21] all differ from 201
  PASS  engineered 3-digit integer
== Q20 CANNOT be the value of k ==
  PASS  right-hand side simplifies to 7x + 6
  PASS  equation reduces to (k - 7)x = -3
  PASS  no solution exactly when k = 7
  PASS  k = 7 truly yields no solution
  PASS  k = 5 gives exactly one solution (x = 3/2), so it CAN be the value of k
  PASS  k = 12 gives exactly one solution (x = -3/5), so it CAN be the value of k
  PASS  k = 17 gives exactly one solution (x = -3/10), so it CAN be the value of k
  PASS  options / key index B
  PASS  ascending
  PASS  negation capitalized in the stem
== Q21 structured solution, radicand matching ==
  PASS  b^2 - 4ac = 196 - 40 = 156
  PASS  (14 + sqrt(156))/4 satisfies the given equation
  PASS  the stated form (14 + sqrt(q))/4 matches -b and 2a exactly
  PASS  recipes: 4ac = 40, b^2 = 196, sign slip 236
  PASS  key and distractors distinct
  PASS  q = 40 does not produce a solution
  PASS  q = 196 does not produce a solution
  PASS  q = 236 does not produce a solution
  PASS  options / key index B
  PASS  ascending
== Q22 SPR translated line, new x-intercept ==
  PASS  3x - 4y = 24 is y = (3/4)x - 6
  PASS  translated up 15 units: y = (3/4)x + 9
  PASS  x-intercept of the translated graph is (-12, 0)
  PASS  sign-slip paths (translated down: 28; no translation: 8) differ from -12
  PASS  answer is a negative integer
== Figures ==
  PASS  PT5-M3-Q07.svg exists
  PASS  PT5-M3-Q07.svg well-formed SVG
  PASS  PT5-M3-Q07.svg canvas width 380px (house standard)
  PASS  PT5-M3-Q07.svg uses the Georgia serif stack
  PASS  Q7 references PT5-M3-Q07.svg with alt text
  PASS  PT5-M3-Q09.svg exists
  PASS  PT5-M3-Q09.svg well-formed SVG
  PASS  PT5-M3-Q09.svg canvas width 380px (house standard)
  PASS  PT5-M3-Q09.svg uses the Georgia serif stack
  PASS  Q9 references PT5-M3-Q09.svg with alt text
  PASS  PT5-M3-Q15.svg exists
  PASS  PT5-M3-Q15.svg well-formed SVG
  PASS  PT5-M3-Q15.svg canvas width 380px (house standard)
  PASS  PT5-M3-Q15.svg uses the Georgia serif stack
  PASS  Q15 references PT5-M3-Q15.svg with alt text
  PASS  Q07 SVG dots re-measure to {2: 3, 3: 5, 4: 7, 5: 4, 6: 3, 7: 2} == authored frequencies
  PASS  Q07 SVG contains exactly 24 dots
  PASS  Q07 tallest stack has 7 evenly spaced dots
  PASS  Q07 lowest dot of each stack sits just above the number line
  PASS  Q07 carries a title above the plot
  PASS  Q07 carries a roman axis title
  PASS  Q07 (data display) carries no scale note
  PASS  Q09 geometry figure carries the scale note
  PASS  Q09 shows the 80-degree vertex angle
  PASS  Q09 uses italic vertex/variable labels
  PASS  Q09 marks the two congruent sides with tick marks (2 line elements)
  PASS  Q09 draws one closed triangle path
  PASS  Q15 x-axis tick labels recovered from the SVG (9 found)
  PASS  Q15 map recovered from tick labels: px = 223 + 22x
  PASS  Q15 all 65 plotted points satisfy y = -x^2 - 2x + 8 (max err 0.0168)
  PASS  Q15 highest plotted point re-measures to the vertex (-1, 9)
  PASS  Q15 the plotted curve crosses the y-axis exactly once
  PASS  Q15 drawn y-intercept re-measures to (0, 8.000) == the alt text's (0, 8)
  PASS  Q15 drawn x-intercepts re-measure to [-4.0, 2.0] == (-4, 0) and (2, 0)
  PASS  Q15 the key (-1, 12) is NOT a plotted point -- the translation must be performed
  PASS  Q15 distractor A (-4, 9) is NOT a plotted point either
  PASS  Q15 (coordinate grid) carries no scale note
  PASS  Q15 gridlines are #cccccc
  PASS  Q15 marks origin O and italic x/y at the axis tips
  PASS  PT5-M3-Q15.svg origin O is italic (house convention across all six figures)
  PASS  the other 19 items have graphAsset/graphDescription null
== Trap census (exactly one mechanism per item) ==
  PASS  the three trap-free slots are the E/E/M SPRs at 5, 6, 13
  PASS  all 19 trap mechanisms are distinct
  PASS  Q20 carries the must-be/could-be trap (a PT4 gap)
  PASS  Q18 carries the statistical-robustness trap (a PT4 gap)
  PASS  Q12 carries the extraneous/nonreal-solution trap (spec section 5 family, 0 before this round)
  PASS  Q1 _distractorLogic covers exactly the three wrong letters
  PASS  Q2 _distractorLogic covers exactly the three wrong letters
  PASS  Q3 _distractorLogic covers exactly the three wrong letters
  PASS  Q4 _distractorLogic covers exactly the three wrong letters
  PASS  Q7 _distractorLogic covers exactly the three wrong letters
  PASS  Q8 _distractorLogic covers exactly the three wrong letters
  PASS  Q9 _distractorLogic covers exactly the three wrong letters
  PASS  Q10 _distractorLogic covers exactly the three wrong letters
  PASS  Q11 _distractorLogic covers exactly the three wrong letters
  PASS  Q14 _distractorLogic covers exactly the three wrong letters
  PASS  Q15 _distractorLogic covers exactly the three wrong letters
  PASS  Q16 _distractorLogic covers exactly the three wrong letters
  PASS  Q17 _distractorLogic covers exactly the three wrong letters
  PASS  Q18 _distractorLogic covers exactly the three wrong letters
  PASS  Q20 _distractorLogic covers exactly the three wrong letters
  PASS  Q21 _distractorLogic covers exactly the three wrong letters
== Originality firewall (PT4 contexts must not recur) ==
  PASS  PT4 context 'pottery' absent
  PASS  PT4 context 'seed packet' absent
  PASS  PT4 context 'recycling' absent
  PASS  PT4 context 'nature center' absent
  PASS  PT4 context 'ferry' absent
  PASS  PT4 context 'storage crate' absent
  PASS  PT4 context 'greenhouse' absent
  PASS  PT4 context 'seedling' absent
  PASS  PT4 context 'marsh bird' absent
  PASS  PT4 context 'freight elevator' absent
  PASS  PT4 context 'furlong' absent
  PASS  PT4 context 'library' absent
  PASS  PT4 context 'kiln' absent
  PASS  PT4 context 'canopy' absent
  PASS  PT4 context 'banner' absent
  PASS  PT4 context 'bus-route' absent
  PASS  PT4 context 'robotics' absent
  PASS  PT4 context 'used bicycle' absent
  PASS  PT4 context 'Nadia' absent

ALL CHECKS PASSED — M3.json verified clean.
```
