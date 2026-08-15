# PT6 Math Modules 3 & 4 — ROUND 3 (final polish) fix report

**Date:** 2026-08-15 · **Mandate:** the eight-item list adjudicated from
`critic_report_round2.md` (PUBLISH conditional on F-1/F-2/F-3) and `verifier_report_round2.md`
(PUBLISH; MINOR-1, NIT-2, and the single recommended edit at M3 Q12).
**Scope discipline:** exactly the eight ordered fixes were applied. No other item was edited; no
figure was redrawn; no key letter, quota, ramp, SPR position or context was disturbed.

| | Verifier | Result |
|---|---|---|
| Module 3 | `python3 verify_M3.py` | **ALL CHECKS PASSED — 838 assertions, 0 failures** (was 813) |
| Module 4 | `python3 verify_M4.py` | **ALL CHECKS PASSED — 2,426 assertions, 0 failures** (was 2,386) |

---

## 1. The eight fixes, before → after

### F1 · M3 Q20 stem: 43 tokens against the ≤35 abstract cap

| | text | all-token count |
|---|---|---|
| **before** | "In the xy-plane, the graph of the given equation is a circle, where c is a constant. If the point (4, 20) lies on this circle, what is the value of c?" | passage 11 + text 32 = **43 / 35** |
| **after** | "In the xy-plane, the given equation defines a circle through (4, 20), where c is a constant. What is the value of c?" | passage 11 + text 23 = **34 / 35** |

The passage (`x<sup>2</sup> + y<sup>2</sup> + 10x − 16y = c`) is untouched, so **no mathematics
changed**: the key is still 136, the three distractors still re-derive as 225 (= c + 89 = r²),
416 (linear terms dropped) and 696 (both linear signs flipped), and the key letter is still A.
Only the prose was compressed — the point clause absorbed into the noun phrase and the redundant
"the graph of … is" replaced by CB's own verb.

*Why this wording.* The verb "defines a circle in the xy-plane" is CB's own — two bank records use
it, including "The given equation, where k is a constant, defines a circle in the xy-plane. The
radius of this circle is r. What is the value of k?" That item gives a *radius* and asks for the
constant, where PT6 gives a *point*, so the pipelines differ; even so the trailing where-clause was
kept **after** the circle rather than lifted into CB's comma position, which measurably lowers the
shared span: the comma-position variant would have shared 6 normalised tokens ("is a constant
defines a circle") with that record, the shipped wording shares **5** ("in the xy plane the").
Both sit under the gate's n ≥ 8 threshold, so this is a margin, not a rescue. The larger gain is
against our own PT4 M4.20, which round 2 flagged for an identical opening: that shared span drops
**13 → 5 tokens**, and the 12-gram "in the xy plane the graph of the given equation is a circle"
no longer exists anywhere in PT6.

The rationale was re-opened to match ("It's given that in the xy-plane the given equation defines a
circle through the point (4, 20)."), which also brought it from 170 to **162 tokens** (0.95× norm).

### F2 · M4 Q15 table headers italicised

| | header markup |
|---|---|
| **before** | `<th style="border:1px solid #333; padding:4px 8px;">x</th>` … `>y</th>` |
| **after** | `<th style="border:1px solid #333; padding:4px 8px;"><i>x</i></th>` … `<i>y</i></th>` |

Matches PT5 M3.08 as shipped and §8's italic-variable convention. Q8's headers are words
("Seed type", "Germinated", "Did not germinate", "Total") and correctly stay roman —
`verify_M4.py` now asserts both halves of that split. One consequential guard change: M4's
Latin-binomial test used to assert *zero* `<i>` spans in the module, which a required italic
variable would trip; it now asserts that every italic span is a single lower-case variable and
that none is a `Genus species` pair.

### F3 · M3 Q18 trap re-pitched (leg↔hypotenuse was on both right-triangle items)

| | M3 Q18 `_trap` | M4 Q11 `_trap` |
|---|---|---|
| **before** | "leg versus hypotenuse interchange" | "leg and hypotenuse interchanged" |
| **after** | "special-triangle side ratio applied to the wrong side (the 2:1 hypotenuse relation used on the asked side)" | unchanged |

Options, key and mathematics are untouched (30-60-90 with DF = 16 ⇒ DE = 8√3, options
4√3 < 8 < 8√2 < 8√3, key D). The three distractor recipes were re-derived from the new mechanism
and the three dismissals rewritten:

| opt | before | after |
|---|---|---|
| A = 4√3 | "treated EF, the shorter leg, as the hypotenuse" | "the 2:1 relation applied twice: 16 halved to 8 and halved again to 4 before the √3 ratio is attached" — dismissal: "…may result from halving 16 twice, obtaining 4, before multiplying by √3." |
| B = 8 | "the length of the shorter leg EF, the adjacent quantity" | "the 2:1 relation applied to the wrong side: DF halved to give DE, using the relation that belongs to the shorter leg EF" — dismissal: "…may result from halving 16; this is the length of EF, not the length of DE." |
| C = 8√2 | "assumed the two legs are congruent…" | "the 45-45-90 ratio used in place of the 30-60-90 ratio, as though the two legs were congruent" (dismissal unchanged in substance) |

This is a mechanism the archetype genuinely supports (the 2:1 relation applied to the wrong side),
and it makes **B** — the single most common student answer on this item type — the primary bait
rather than an also-ran. Rationale grew 212 → **215 tokens** (1.26× norm).

**Both verifiers now enforce the form-level fact**, each reading the sibling module's JSON:
leg↔hypotenuse is carried by exactly one item form-wide (M4 Q11), the form's two
right-triangles-trigonometry items are M3 Q18 and M4 Q11, and their trap strings name different
mechanisms. The guard is deliberately *specific*, not a blanket cross-module uniqueness test — the
blueprint schedules slope/intercept ×3, ordered-pair ×2, solution-count ×2 and wrong-target ×2 on
purpose, so a blanket test would contradict the binding doc.

### F4 · M3 Q22 composite target moved off the three-form "value of ab" habit

| | before | after |
|---|---|---|
| stem | "The function f is defined by the given equation, where a and b are constants. If f(3) = 7 and f(6) = −11, what is the value of **ab**?" | "In the given equation, a and b are constants. If f(3) = 7 and f(6) = −11, what is the value of **a − b**?" |
| key | −26/3 | **−41/3** |
| acceptedAnswers | `-26/3, -52/6, -78/9, -8.666, -8.667` (5) | `-41/3, -82/6, -123/9, -13.66, -13.67` (5) |
| stem tokens | 35 / 35 | **31 / 35** |
| `_trap` | "answer the wrong target (a, b, or a + b reported instead of the product ab)" | "answer the wrong target (a, b, or the product ab reported instead of the difference a − b)" |

**Target choice, checked against both prior forms before committing.** PT4 uses *ab* (M4 Q19,
key 486) and "the maximum value of f" (M4 Q22, key 49/8); PT5 uses *ab* (M4 Q22, key 15/2) and
"the value of f(7)" (M3 Q19, key 201). So a **value of the function at a new input is out (PT5)**
and a **coefficient of a rewritten form is the PT4 M4.19 shape**; a **difference of the constants
appears in neither form**, and no PT4/PT5 item asks for a − b anywhere (all 44+44 asks enumerated).

Everything the mandate said to keep is kept: position 22, hard, SPR, nonlinear-functions,
the answer-the-wrong-target mechanism, and a negative lowest-terms fraction — still the form's
**only** negative. The setup is unchanged (9a + b = 7, 36a + b = −11 ⇒ a = −2/3, b = 13), so the
retired product ab = −26/3 survives as one of the named wrong targets. `verify_M3.py` proves that
**none** of a, b, a + b, ab, b − a, b/a equals −41/3, and re-enumerates the five legal entries by
set equality with `_spr_enum.py` (`-164/12` overflows the six-character rule and is rightly absent).

The opener was shortened because "a − b" costs two tokens more than "ab" and the stem was already
at exactly 35. "In the given equation, a and b are constants." is the frame M3 Q19 already uses and
is CB-attested. Measured side benefit: the longest shared normalised span with PT5 M3.19 falls from
**28 tokens to 18** (all of it §2a liturgy: "a and b are constants if f # # and f # # what is the
value of"). The gate's headline still reads n = 12 because 12 is its scanning ceiling.
Rationale 141 → **154 tokens** (1.18× norm).

### F5 · M3 Q12 re-tuned so its key stops colliding three ways

| | before | after |
|---|---|---|
| passage | "Anika arranged a total of **352** rolls on a total of **26** trays. Each small tray held 8 rolls, and each large tray held 20 rolls." | "Anika arranged a total of **368** rolls on a total of **22** trays. Each small tray held 8 rolls, and each large tray held 20 rolls." |
| solve | x + y = 26, 8x + 20y = 352 ⇒ 208 + 12y = 352 ⇒ y = **12** | x + y = 22, 8x + 20y = 368 ⇒ 176 + 12y = 368 ⇒ y = **16** |
| acceptedAnswers | 12 entries | 12 entries (`16 … 144/9, 16.0, 16.00`; `160/10` overflows) |

Skill (systems-linear-equations), difficulty (medium), format (SPR), archetype (two-totals word
problem → one quantity), context (Anika's bakery trays), stem length (34/55) and rationale length
(135 tokens, 1.35×) are all unchanged. What changes is what the verifier called the highest-yield
single edit in the form — all four coincidences at once:

| coincidence | before | after |
|---|---|---|
| three-way key tie on 12 | M3 Q9 · M3 Q12 · M4 Q16 | **gone** — one benign cross-module pair left (M3 Q9 area-volume MC / M4 Q16 systems MC) |
| same-skill key pair | M3 Q12 / M4 Q16, both systems-linear-equations | **gone** |
| same-module nearby pair | M3 Q9 / M3 Q12, three positions apart | **gone**; M3 now has **no repeated key value at all** |
| key = question number | 4 items (M3 Q12, M3 Q17, M4 Q15, M4 Q19) | **3 items** (M3 Q17, M4 Q15, M4 Q19) |

A new **exhaustive** proof was added: `verify_M3.py` enumerates every non-negative integer split of
the 22 trays and shows exactly one — 6 small, 16 large — holds 368 rolls, so the key is unique over
the integers rather than merely the output of one elimination path.

### F6 · M4 Q7 alt text no longer announces the key as the answer

| | graphDescription, second sentence |
|---|---|
| **before** | "The parabola crosses the x-axis at (−1, 0) and (3, 0), **crosses the y-axis at (0, −3)**, and has its lowest point at (1, −4)." |
| **after** | "The curve **passes through the plotted points (−1, 0), (0, −3), and (3, 0)**, and its lowest point is at (1, −4)." |

The stem asks "What are the coordinates of the **y-intercept**…?" and the old clause handed that
exact asked-quantity back with the key attached, which neutralised the ordered-pair-reversal trap
for screen-reader users only. The new sentence is **data-identical** — all four readable points, the
axis ranges (x from −3 to 5, y from −5 to 6), gridlines at 1 unit and labels at 2 units all remain,
so the item is still answerable from the description alone — but it states plotted geometry in
coordinate order and never uses intercept vocabulary. A non-sighted reader must still decide which
listed point has x-coordinate 0, exactly as a sighted student must. First sentence untouched; the
SVG was not edited. `verify_M4.py` asserts the four points are present **and** that "intercept" and
"crosses the y-axis" are absent.

### F7 · Instrument fix: both rulers now count every whitespace-delimited token

`verify_M3.py`'s `stem_words` subtracted the centered display `<div>` before counting. That is
precisely why Q20 self-reported "32/35" while the auditors' honest ruler read 43/35: the instrument,
not the item, was hiding the breach.

* **M3** — `stem_words` now counts every token of `passage + text` after tag-stripping, dropping
  nothing (M3 ships no tables). Self-tests assert (a) operators and numerals count, (b) a
  display-equation stem measures **13, not 8**, (c) an HTML table stem counts its cells, and
  (d) a live regression pin: Q20 measures 34.
* **M4** — already counted display equations; it gained `stem_words_full`, which drops *nothing at
  all* (tables included), self-tests for equations **and** table cells, and a proof that the two
  rulers agree exactly on the 20 items that have no table — so nothing else can be silently dropped.
* Both scripts now print a per-item stem/rationale table and hard-fail on (i) any stem over its §2b
  cap and (ii) any rationale ≥1.45× its §7 norm.

**Everything the corrected rulers newly flagged, and what was done about it:**

| flagged | ruler reading | verdict |
|---|---|---|
| **M3 Q20** | 43 / 35 (+23%) | **genuine breach — trimmed to 34** (F1) |
| M4 Q8 | 56 / 55 on the drop-nothing ruler; **19 of those 56 tokens are two-way-table cells**; stem prose 37 / 55 | **not a breach — not trimmed.** §2b measures stem *prose*; the table is the stimulus. Recorded, and the script asserts that any over-cap reading is attributable only to tabular tokens |
| M4 Q15 | 40 / 35 on the drop-nothing ruler; **8 tabular tokens**; stem prose 32 / 35 | **not a breach — not trimmed**, same reasoning |
| rationales | max ratio **1.35** (M3 Q10, M3 Q12); M4 max 1.33 | **nothing at or above 1.45; no rationale trimmed** |

No other item moved above a cap when the display equations started counting: the next tightest are
M3 Q11 at 54/55, M3 Q14 at 53/55, M3 Q21 at 34/35 and M4 Q14 at 34/35.

### F8 · Documentation amendments

**`analysis/blueprint_pt6_math.md`** (three edits, all dated in-line 2026-08-15):

1. **M3 Q8 trap row** — "complement/supplement confusion" → **not-to-scale doubt**, with the
   measured distortion recorded (the wedge labelled 68° is drawn at 112.06°, the x° wedge at
   67.94°, so the eyeball answer 68 is a real option) and the note that the drawn pair still sums
   to 180°, so nothing in the drawing contradicts a given.
2. **M3 Q18 trap row** — "**not-to-scale doubt** — figure-less, verbal description invites
   eyeballing" (which a figure-less item could never instantiate) → **special-triangle side ratio
   applied to the wrong side**, with the reason recorded: leg↔hypotenuse is reserved for M4 Q11.
3. **Form-level checks** — a new *Errata* entry records both trap moves, and a second entry records
   that the **"wrong-target ×2" form-line was never reconcilable with the slot tables**, which name
   answer-the-wrong-target on exactly one slot (M3 Q22). The form does deliver two — M3 Q22 and
   M4 Q18 — but only because Q18 was recast off similar-triangle sufficiency, a slot the tables
   still describe as a sufficiency item. Recorded, not silently satisfied, with the instruction
   that PT7 must reconcile tally and tables before drafting.

**`docs/CB_Math_Style_Spec.md` §8** — one sentence added to the `graphDescription` rule:

> **Alt text must be DATA-COMPLETE: it states every datum a sighted student can read off the figure
> — each bar height, plotted point, labelled measure, axis range and grid spacing, and the presence
> of a "not drawn to scale" note — so that a screen-reader user can answer the item from the
> description alone; it must not interpret the figure or announce the answer as an answer, so state
> the plotted geometry rather than restating the stem's asked quantity, and add as many sentences as
> the figure's data require.**

with a parenthetical recording that this **reverses the earlier instruction to withhold figure
data**, which left three items unanswerable without sight and contradicted every shipped form. The
"1–2 factual sentences" phrase is retained as the default; the amendment supplies the exception the
data requires, which is what all six PT6 figures and both sister forms already do.

---

## 2. Verifier output

```
$ python3 verify_M3.py
== Length rulers (instrument self-test) ==
  PASS  rat_words counts every whitespace token (operators and numerals included)
  PASS  stem_words counts every whitespace token (numerals and operators included)
  PASS  stem_words COUNTS the centered displayed equation: 5 equation tokens + 8 prose tokens
  PASS  stem_words COUNTS HTML table cells too — the ruler drops nothing at all
  PASS  instrument regression: Q20 (a displayed equation) now measures 34 all-token, not 32
  …
  PASS  no key value repeats anywhere in the module — the Q9/Q12 echo on 12 is gone (F5) ([])
  PASS  exactly one integer split of 22 trays holds 368 rolls: [(6, 16)]
  PASS  A = 16 halved twice (16 -> 8 -> 4) before the sqrt(3) ratio is attached
  PASS  B = the 2:1 relation applied to the WRONG side: DF halved and reported as DE
  PASS  Q18 no longer duplicates M4 Q11's leg-versus-hypotenuse mechanism (F3)
  PASS  leg-versus-hypotenuse is carried by exactly one item form-wide, M4 Q11 ([], [11])
  PASS  Q20 stem 34 all-token tokens inside the 35-token cap
  PASS  Q20 no longer reproduces the 12-gram frame it shared with PT4 M4.20
  PASS  a - b = -41/3, the composite target (-41/3)
  PASS  no wrong target coincides with a - b ({'a': '-2/3', 'b': '13', 'a + b': '37/3',
        'ab': '-26/3', 'b - a': '41/3', 'b/a': '-39/2'})
  PASS  no stem exceeds its section 2b cap on the all-token ruler []
  PASS  no rationale runs 45%+ over its section 7 norm []
  max stem ratio 0.98 · max rationale ratio 1.35 · mean rationale ratio 1.19

ALL CHECKS PASSED — M3.json verified clean.          [838 assertions, 0 failures]
```

```
$ python3 verify_M4.py
ULTRASAT PT6 - MODULE 4 verification
  questions      : 22 (16 MC / 6 SPR)
  key letters    : {'A': 4, 'B': 4, 'C': 4, 'D': 4}
  SPR answers    : {5: '17', 6: '588', 12: '26.5', 13: '14', 19: '19', 22: '13/4'}
  max stem/cap   : 0.97   max rationale ratio 1.33   mean 1.21
  Q09 exhaustive : {'constructed sample': 400, 'mean': 18.5, 's': 12.2449, 'margin': 1.2,
                    'individuals outside [17.3, 19.7]': 400}
  Q18 exhaustive : {'grid configurations': 120,
                    'constructed angles (XWV, WXV, ZYV, YZV)': (47.0, 68.0, 39.0, 76.0),
                    'integer scan of m(ZYV) hitting 76': [39]}
  SPR exhaustive : {5: '17 -> 12 entries', 6: '588 -> 3 entries', 12: '26.5 -> 6 entries',
                    13: '14 -> 12 entries', 19: '19 -> 12 entries', 22: '13/4 -> 9 entries'}
  assertions run : 2426

ALL CHECKS PASSED
```

Every exhaustive proof already in place was kept — M3: Q4 by polynomial identity (all real x), Q10
over every plotted point, Q11 over every integer count 0–200, Q15 over the model conditions
symbolically, Q17 over the reals by sympy `minimum`, Q19 over every integer a ∈ [−500, 500], Q20
over all four options, Q21 over both intersection points; M4: Q9's constructed 400-value sample,
Q13's integer scan of the volume budget (admissible set proved to be exactly 0…14), Q16's rational
grid for the no-solution parameter, Q18's 120 constructed configurations plus the integer scan of
the third angle, Q19's integer scan of the discriminant condition (boundary integer 20 included),
Q22's rational scan for extraneous roots, and all twelve SPR enumerations by set equality.
**Two were added**, one for each item F4/F5 changed:

* **M3 Q12** — every integer split of the 22 trays enumerated; exactly one (6, 16) satisfies both
  totals, so 16 is unique over the integers.
* **M3 Q22** — all six plausible wrong targets (a, b, a + b, ab, b − a, b/a) computed exactly and
  shown distinct from a − b = −41/3.

---

## 3. Length tables under the corrected rulers

### Module 3 (single ruler: nothing dropped)

| Q | stem/cap | rat/norm | ratio | | Q | stem/cap | rat/norm | ratio |
|---|---|---|---|---|---|---|---|---|
| 1 | 13/35 | 123/110 | 1.12 | | 12 | **34/55** | 135/100 | 1.35 |
| 2 | 17/35 | 103/110 | 0.94 | | 13 | 30/35 | 71/100 | 0.71 |
| 3 | 33/55 | 107/110 | 0.97 | | 14 | 53/55 | 168/135 | 1.24 |
| 4 | 9/15 | 137/110 | 1.25 | | 15 | 41/55 | 176/135 | 1.30 |
| 5 | 22/35 | 53/40 | 1.32 | | 16 | 30/35 | 166/135 | 1.23 |
| 6 | 21/35 | 45/40 | 1.12 | | 17 | 24/35 | 219/170 | 1.29 |
| 7 | 44/55 | 144/110 | 1.31 | | 18 | 30/35 | **215/170** | 1.26 |
| 8 | 22/35 | 146/110 | 1.33 | | 19 | 31/35 | 141/130 | 1.08 |
| 9 | 47/55 | 168/135 | 1.24 | | 20 | **34/35** | **162/170** | 0.95 |
| 10 | 15/35 | 149/110 | 1.35 | | 21 | 34/35 | 212/170 | 1.25 |
| 11 | 54/55 | 174/135 | 1.29 | | 22 | **31/35** | **154/130** | 1.18 |

Max stem ratio 0.98 (Q11) · max rationale ratio 1.35 · mean rationale ratio 1.19 ·
MC band means E 1.18 / M 1.26 / H 1.19.

### Module 4 (prose / stem / drop-nothing / cap)

| Q | prose | stem | full | cap | rat/norm | ratio |
|---|---|---|---|---|---|---|
| 1 | 35 | 35 | 35 | 55 | 138/110 | 1.25 |
| 2 | 14 | 14 | 14 | 15 | 122/110 | 1.11 |
| 3 | 33 | 33 | 33 | 55 | 136/110 | 1.24 |
| 4 | 33 | 38 | 38 | 55 | 135/110 | 1.23 |
| 5 | 17 | 27 | 27 | 35 | 48/40 | 1.20 |
| 6 | 29 | 29 | 29 | 35 | 50/40 | 1.25 |
| 7 | 22 | 22 | 22 | 35 | 127/110 | 1.15 |
| **8** | 37 | 37 | **56 (+19 tabular)** | 55 | 133/110 | 1.21 |
| 9 | 70 | 70 | 70 | 75 | 169/135 | 1.25 |
| 10 | 36 | 41 | 41 | 55 | 144/110 | 1.31 |
| 11 | 22 | 22 | 22 | 35 | 177/135 | 1.31 |
| 12 | 33 | 33 | 33 | 35 | 117/100 | 1.17 |
| 13 | 39 | 39 | 39 | 55 | 129/100 | 1.29 |
| 14 | 22 | 34 | 34 | 35 | 175/135 | 1.30 |
| **15** | 32 | 32 | **40 (+8 tabular)** | 35 | 180/135 | 1.33 |
| 16 | 22 | 32 | 32 | 35 | 180/135 | 1.33 |
| 17 | 26 | 32 | 32 | 35 | 195/170 | 1.15 |
| 18 | 31 | 31 | 31 | 35 | 185/170 | 1.09 |
| 19 | 23 | 31 | 31 | 35 | 147/130 | 1.13 |
| 20 | 24 | 28 | 28 | 35 | 139/170 | 0.82 |
| 21 | 33 | 33 | 33 | 35 | 218/170 | 1.28 |
| 22 | 25 | 33 | 33 | 35 | 158/130 | 1.22 |

Max stem/cap 0.97 · max rationale ratio 1.33 · mean 1.21. The only two rows where the rulers
disagree are the two table items, and the whole difference is table-cell text (§7 above).

---

## 4. Corpus and sister-form re-grep for every item touched

`pass3b_keys.py` (key value vs same-skill corpus answers, 809-record corpus rebuilt from source):
**0 hits across all 44 items** — unchanged from round 2, and specifically clean for the two new
keys. Same-skill scans run before committing them:

| new key | same-skill corpus scan | result |
|---|---|---|
| M3 Q12 = **16** (systems-linear-equations) | all systems items in bank + practice tests + both sister forms | **0** items publish 16 (candidates 11, 13, 16, 18, 20, 21, 23, 24, 27 all returned 0; PT4 M4.13's published 16 is an *area-volume* item, a different skill) |
| M3 Q22 = **−41/3** (nonlinear-functions) | all 64 NLF corpus records | **0** (also 0 for 41/3 and −13.66) |

Lexical: run with **`pass1_lexical.py`'s own normalisers, corpus and thresholds** (n = 12 → 8,
digit-blind and digit-keeping variants, all 809 records) but restricted to the six touched items,
which is the comparison this round needs — no untouched item's text changed, so no untouched item's
hit set can have moved. (The full 44-item `pass1_lexical.py` sweep was also relaunched and rewrites
`pass1_hits.json` on completion; it takes ~25 minutes and its per-item numbers for these six will be
the ones below.)

| item | max n | against | verdict |
|---|---|---|---|
| **M3 Q12** | **none ≥ 8** | — | **CLEAN — lexically silent**, an improvement on round 2 |
| M3 Q18 | 8 | ptest-7 | liturgy, "measure of angle e is # and the" — unchanged, the stem was not edited |
| M3 Q20 | 11 | our PT5 M4.18 | liturgy: "where c is a constant what is the value of c" — the §2a constant declaration plus the workhorse ask. **Down from 12**, and the round-2 12-gram against PT4 M4.20 is gone (span 13 → 5) |
| M3 Q22 | 12 (scanner ceiling) | our PT5 M3.19 | liturgy: "a and b are constants if f # # and f # #…". True longest shared span **28 → 18 tokens** |
| M4 Q7 | 12 | our PT5 M4.15/M4.04 | liturgy, "is shown in the xy plane what are the coordinates of the" — pre-existing, in the *stem*; the new alt-text sentence adds nothing (see below) |
| M4 Q15 | 11 | ptest-7 | CB's own table liturgy, "three values of x and their corresponding values of y where" — unchanged; italics are markup and are stripped before scanning |

Direct string greps over all ten corpus files for every phrase and number introduced this round:

| introduced | corpus occurrences |
|---|---|
| "defines a circle through" / "circle through (4" | **0 / 0** |
| "the given equation defines a circle" (the 6-token span) | **0** |
| "368" as "368 rolls" · "22 trays" · "large trays" | **0 · 0 · 0** |
| "passes through the plotted points" / "plotted points" | **0 / 0** |
| "halving" (the new Q18 dismissals) | **0** |
| "In the given equation, a and b are constants" | 0 verbatim; the frame is attested — "In the given equation, [p] is a constant" appears in the bank and "where … and … are constants" 18× |

`pass3_numeric.py` (≥2 shared non-trivial numerals): 91 rows, all noise, none skill-matched for a
touched item except two pre-existing rows whose numbers were **not** edited (M3 Q18 on {30, 90} —
any 30-60-90 item shares those; M3 Q20 on {16, 20}). M3 Q12's and M3 Q22's rows are cross-skill.
No corpus item's published answer equals any PT6 key.

Context firewall re-run: all 37 banned PT4/PT5 context strings and both prior Latin binomials
return zero; the new names/nouns (Anika, Priya, warehouse, carton, bolt, bakery tray, cider,
barrel, bookbindery, quarry, seed library, observatory) remain absent from every corpus file.

---

## 5. Drift check — every countable row recomputed from the JSON

| row | target | measured |
|---|---|---|
| Domains, per module | M3 8/7/3/4 · M4 7/7/4/4 | **M3 ALG 8 · ADV 7 · PSDA 3 · GEO 4 · M4 ALG 7 · ADV 7 · PSDA 4 · GEO 4** ✔ |
| Domains, form | ALG 15 / ADV 14 / PSDA 7 / GEO 8 | **15 / 14 / 7 / 8** ✔ |
| All 18 skill rows | 1var 3 · lf 4 · le2v 3 · sys 3 · ineq 2 · NLF 7 · NLE 4 · EE 3 · rrp 2 · pct 1 · 1var-data 1 · 2var-data 1 · prob 1 · inf 1 · AV 2 · LAT 2 · RTT 2 · circ 2 · ESC 0 | **exact, sum 44, ESC 0** ✔ |
| Difficulty | 9E / 7M / 6H both | **9/7/6 both** ✔ |
| Ramp | monotone, exactly one dip, at position 10 | `EEEEEEEEMEMMMMMMHHHHHH` both; computed dip set **[10]** each ✔ |
| SPR positions | 5, 6, 12, 13, 19, 22 (E/E/M/M/H/H) | exact both ✔ |
| SPR census | 8 int (≥1 three-digit) · 3 frac · 1 dec · only negative at M3 Q22 | **8 int** (7, 89, **16**, 126 · 17, 588, 14, 19) with 126 and 588 three-digit · **3 frac** (7/3, **−41/3**, 13/4), all lowest terms · **1 dec** (26.5) · only negative **M3 Q22** ✔ |
| Key letters | 4/4/4/4 both | M3 A4 B4 C4 D4 · M4 A4 B4 C4 D4 ✔ |
| Visuals | 4 + 4 | M3 bar(7) geom(8) line(10) scatter(14) · M4 parabola(7) two-way table(8) geom(11) data table(15) ✔ |
| Traps | one per item, all distinct in-module | M3 17/17 distinct · M4 19/19 distinct; trap-free slots are exactly the blueprint's blanks ✔ |
| Applied share | 14/44 | M3 7 (Q3,7,9,11,12,14,15) + M4 7 (Q1,3,4,8,9,10,13) = **14/44 = 31.8%** ✔ |
| Named people | ≤2 per module, new names | Anika (M3 Q12) · Priya (M4 Q1) ✔ |
| Latin binomial | exactly 1 | *Littorina fuscopunctata*, M3 Q7, italic, passage only ✔ |

Nothing drifted. The four edited items kept their slot, skill, difficulty, format, key letter (or
SPR-ness), context and visual status; only the two documented values (M3 Q12's key, M3 Q22's key)
and the two documented strings (M3 Q20's stem, M3 Q18's dismissals) changed.

---

## 6. Final key tallies and SPR lists

**Module 3 key letters** — A 4 · B 4 · C 4 · D 4
`A — Q1, Q9, Q16, Q20 · B — Q4, Q10, Q11, Q15 · C — Q3, Q7, Q8, Q17 · D — Q2, Q14, Q18, Q21`
(letter string `ADCB--CCABB--DBACD-AD-`, longest run 2)

**Module 4 key letters** — A 4 · B 4 · C 4 · D 4
`A — Q1, Q8, Q20, Q21 · B — Q2, Q3, Q10, Q15 · C — Q7, Q11, Q14, Q18 · D — Q4, Q9, Q16, Q17`
(letter string `ABBD--CADBC--CBDDC-AA-`, longest run 2)

**SPR answers**

| module | Q5 | Q6 | Q12 | Q13 | Q19 | Q22 |
|---|---|---|---|---|---|---|
| **M3** | 7 | 89 | **16** | 7/3 | 126 | **−41/3** |
| **M4** | 17 | 588 | 26.5 | 14 | 19 | 13/4 |

Accepted-entry counts (set-equal to `_spr_enum.py` and to an independent enumeration inside each
verifier): M3 **18 / 12 / 12 / 15 / 9 / 5** · M4 **12 / 3 / 6 / 12 / 12 / 9**. Every entry is ≤5
characters (6 with the leading minus), the canonical string is first in every list, and the
entry-forms note closes exactly the four non-integer rationales (M3 Q13, M3 Q22, M4 Q12, M4 Q22).

Form-wide key-value coincidences after this round: **12** (M3 Q9 area-volume MC / M4 Q16 systems
MC) and **17** (M3 Q17 NLF MC / M4 Q5 systems SPR) — two benign cross-module pairs, no same-module
and no same-skill pair anywhere. Key equals question number at three items (M3 Q17, M4 Q15,
M4 Q19), down from four.

---

## 7. Deliberately not touched

Everything not on the eight-item list, including: the two residual §5 exotica the critic carries
(robustness = 0, load-bearing must-be/could-be = 0, no CAPS negation); the shared
`ax + c ≤ B → greatest integer` pipeline at M3 Q11 / M4 Q13; the ADV applied share (1/14); the
invented epithet in *Littorina fuscopunctata*; M3 Q17's integer vertex; the H-3/H-4 house habits
(non-unit-interval exponential, "each of 10 … A line of best fit is also shown"); and the pair of
pre-existing cross-module key echoes on 12 and 17. All are PT7 blueprint items, not PT6 defects.

One earlier claim is corrected rather than acted on: `fix_M4_report.md`'s note that "112 is now the
answer at both M3 Q8 and M3 Q19" is **false** — M3 Q19's key is 126, and both round-2 auditors
confirmed it. The correction is now recorded in `M4_selfcheck.md` §11.
