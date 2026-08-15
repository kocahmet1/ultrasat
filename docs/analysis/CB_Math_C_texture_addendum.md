# College Board Math — Texture Addendum (C)
### Measured on the 4 official practice forms (216 items) + 4 question-bank domain exports (400 items), re-read item by item for this pass
### Companion to docs/CB_Math_Style_Spec.md. The spec stays binding; this file **sharpens** it and **corrects** it where the sources disagree with it.

---

## 0. How to use this file

The style spec (A) states the contract. Docs A/B state the anatomy and the per-skill playbook.
This file records what a fresh, exhaustive re-read of the same sources shows that the spec
either does not say or says too strongly. Where a line here contradicts the spec, the rule is:

- **Anything the validator enforces → follow the spec** (so the form ships).
- **Everything the validator cannot see → follow this file** (that is where the imitators die).

---

## 1. THE CORRECTION THAT MATTERS MOST

> **Within a single skill, Hard is a change of QUESTION TYPE, not a change of arithmetic.**

Measured on clone pairs that CB stamped from one skeleton and then re-labelled:

| Skill | Easy | Medium | Hard |
|---|---|---|---|
| Nonlinear functions | evaluate f(a); read an intercept off a shown graph; interpret a labelled point | recover the two constants of an exponential from a table; interpret one coefficient | rewrite the structure (period conversion, a(b)^x from a(b)^(kx)); recover constants from two conditions and evaluate elsewhere |
| One-variable data | read a display | compute a center | **argue about what changes** — invariance / "must be true" / "cannot be determined" |
| Percentages | direct percent of a number | one percent change | percent as an **algebraic multiplier** (letters), or reverse/compound direction |
| Two-variable data | read a point | compare observed vs predicted | reason about the **model family** (decreasing exponential ⇒ 0 < b < 1) with no arithmetic at all |
| Circles | — | one relation | **completing the square** (8 of 16 bank items convert general ↔ standard form) |
| Similar figures | — | side ratio | the **k vs k² vs k³** choice set, alone |

A clone pair in the Geometry export is decisive: "square A's side is k times square B's" ships as
**Medium MC**, and the identical mathematics ships as **Hard SPR with a 5-digit answer plus one
root-rejection clause**. The idea did not get harder. The vehicle did.

**Consequence for authoring:** never manufacture a hard item by making the numbers uglier. Change
what has to be decided before the arithmetic starts, or change MC → SPR, or add a rejection
condition (extraneous root, "positive solution", "k is a positive integer").

---

## 2. Ratios/rates has NO hard tier

Zero Hard items in 100 PSDA bank items. The Medium ceiling is exactly two moves: a two-hop
conversion with **both** factors supplied, or the product of two unit rates. Do not label a
ratios/rates item hard; if a slot needs hard PSDA, use percentages or one-variable data.

---

## 3. Option-set architecture the spec does not name

**3a. The 2×2 cross-product grid — the dominant option shape.** When the item contains two binary
decisions, CB enumerates all four combinations rather than inventing a third distractor. ~11% of
items. Examples: {which of the two given constants} × {+ , −}; {variable role} × {sign};
{grouping} × {sign} — `C = (19+P)/N / (19−P)/N / 19 + P/N / 19 − P/N`.
Use this 4–6 times per form. It is the single most recognizable CB option signature.

**3b. Distractors are engineered by choosing the givens.** A line is defined as
`y = 7x + 1/8` *specifically* so that −8 (the negative reciprocal of the **intercept**) can sit
beside the correct −1/7: the option set {−8, −1/7, 1/8, 7} covers all four confusions of the two
numbers the stem handed over. Pick your constants so the four confusions are all available.

**3c. Digit-echo.** A decimal parameter is mined for a fake integer: `P(t) = 1,800(1.02)^t`
generates "102", offered once as a count and once as a rate. `f(x) = (1.84)^(x/4)` generates
21 = 84/4 and 46 = 184/4.

**3d. Ordering.** Plain-numeric sets are monotone but the **direction is free** — descending runs
~29% in one form and is not confined to radicals/geometry. Ordered-pair sets are sorted on the
first coordinate only, ties left unsorted. Algebraic and mixed radical/integer sets follow the
**template slot**, not the value. Mixed fraction/integer sets do sort by value, and the
"divide instead of subtract" distractor is left as an **unsimplified quotient of the two stem
numbers** (65/61), never decimalized.

**3e. Special sets are rationed and have fixed surfaces.** Solution-count runs
`Exactly one / Exactly two / Infinitely many / Zero` — **Zero LAST**. Roman-numeral items use
exactly **two** statements (I and II), never three. Probability option sets hold one common
denominator and refuse to reduce the degenerate case (1/7, 2/7, 5/7, **7/7** — not 1).

**3f. The "cannot be determined" bait.** ~2 per form, **always keyed wrong**: "The value of x
cannot be determined.", "There is not enough information to compare the means." One per module,
never the answer.

**3g. Unsimplified forms survive in options when the unsimplified shape displays the derivation** —
a radius-squared printed `(4)(9)` rather than 36, so the r → 2r step stays visible.

---

## 4. Trap deployment, corrected

- **Wrong-target lives at EASY too**, not only at hard. It runs ~2 per module across the whole ramp:
  easy SPR (n + 4), easy MC (x − 7), medium MC (6x), medium SPR (30x).
- The scaled target is an **exact multiple of the equation's own coefficient** — 7p from
  (6/7)p + 18 = 54; 72x from 8x = 6; 39x from a system whose y-terms are ±3.
- **Boundary ±1 straddle** is a reusable hard shape: the key sits one unit inside a feasibility
  bound and the nearest distractor one unit outside (∠S < 117 → key 116, distractor 118;
  a ∈ [−15, 7] → key −14, distractor −16).
- **Probability distractors vary the DENOMINATOR, never the numerator**: the same count over the
  row total, the column total, and the transposed conditional.
- **Read-the-display items** have one signature distractor: **the other axis's number**.
- **Central-tendency dismissals name the sibling statistic verbatim** — for a median item the
  three wrong choices are literally the mode, the mean, and the range.
- **Similarity-exponent traps are named in the rationale verbatim**: "may result from using the
  area scale factor instead of the side length scale factor."
- **Two-way tables printed WITHOUT totals are a difficulty lever** — tables with a Total row and
  column sit at Easy; removing them forces the student to sum.

---

## 5. Prose register

- **No pronouns.** Full noun phrases repeat verbatim, at heavy word cost: "the proportion of the
  population that has the characteristic" three times in ~73 words; a named person named again as
  the subject of all four option sentences. CB never writes "he", "she", or "it" for a stem noun.
- **"a certain" and "a particular" are co-equal** generic determiners.
- **Real geographic proper nouns are permitted** ("Oak Park, Illinois", "Mount Jefferson", a real
  year) while institutions stay generic ("a store", "a company", "a certain city").
- **Named people:** 1–4 per form, always a single given name, never pronominalized, and only when
  the person is the **consumer/actor**. When the agent is an expert or an institution, CB uses a
  **role noun** instead ("A veterinarian", "A manufacturing company"). Geometry names **zero**
  people in 100 items.
- **No Latin binomial is required.** Three of the four official forms contain **zero**; the bank
  has one in 400 items, glossed by comma apposition ("Eretmochelys imbricata, a type of sea
  turtle") and used as an uninflected plural. Do not force one in.
- **Money:** both surfaces are attested — "$27" (PT4, PT6, PT7) and "896.86 dollars" (PT5). Pick
  one per form and hold it. The safe pattern is to ask "the price, **in dollars**, of …" so the
  options stay bare numerals. Money is written without cents unless the context earns them.
- **Parenthetical clarifiers sit AFTER the terminal question mark**, on the same line:
  "How far did the fish swim, in miles? (1 mile = 1,760 yards)". ~2 per form.
- **Exotic quantities are defined in the opening sentence**, not in a parenthetical: "For an
  electric field passing through a flat surface perpendicular to it, the electric flux … is the
  product of …".
- **Parameter domains are declared only when well-posedness needs them**: "where k is a positive
  integer constant", "where 0 ≤ x ≤ 6", "the distinct positive real numbers w, x, and y".
- **Constant-first function definitions when the constant is the target**: `g(x) = b − 15x`, not
  `−15x + b`, because b is what is asked for.
- **Model-validity ranges fold into the interrogative sentence itself**, immediately before the
  question mark.
- **"Based on …," is a real question-sentence opener** the spec's formula list omits.
- Stem length by skill, measured, is tighter than the pooled figure for abstract skills and looser
  for statistical ones: equivalent-expressions median **9** prose words; nonlinear equations 16.5;
  geometry 18/22/25 (E/M/H); inference 64; probability 55. An applied two-condition stem at 64
  words is authentic — the spec's 55-word cap is a soft target, not a wall.

---

## 6. Rationale register, corrected

- **Verb density is the real fingerprint**, not the curly apostrophe (which is itself inconsistent
  inside a single official export). Per 100 items: `yields` ~183–198×, `Therefore,` ~87–101×,
  `Substituting` 66×, `Subtracting` 43×, `Dividing` 41×, `It follows that` 26–29×,
  `which is equivalent to` 13×.
- **The generic escape hatch is heavier than the spec's ≤28%** in three domains: ~41% of Advanced
  Math dismissal clauses and ~42% of Geometry's are "may result from conceptual or calculation
  errors". Every graph-read-off item and most figure items dismiss generically.
- **Three dismissal shapes dominate**, in this order: `This is the [other quantity], not the
  [asked quantity].` (most common) · `is incorrect and may result from [named error].` ·
  `is incorrect because [counterfact].` (rare, verbal items only).
- **Grouped dismissals are legal**: "Choices A, B, and C are incorrect and may result from
  calculation errors." ~5–17 per 100 items.
- **Domain-specific shapes the spec omits:**
  - equivalent expressions → `This expression is equivalent to [the expression the student
    actually produced].`
  - geometry → the **back-computed consequence**: "If this were the length of the hypotenuse, the
    perimeter would be [value] inches."
  - symbol-choice items → the **full substitution audit**: substitute each wrong pair and report
    the factor obtained.
  - verification-fail → recompute the wrong world numerically and end on a bare contradiction,
    rather than always using "which isn't a true statement".
- **Every area/volume rationale opens by restating the formula with its letters defined** before
  substituting. This is Geometry's analogue of "It's given that".
- **"Alternate approach:"** appears ~3% of items, always a conceptual shortcut, never a second
  computation.
- Rationale length medians measured: Geometry 110 / 126 / 150 (E/M/H) against the spec's
  110/135/170 — the spec's Hard figure runs long for figure-less geometry.

---

## 7. SPR bookkeeping, corrected

- **The entry-forms note is triggered by MULTIPLE legal entry surfaces, not by non-integrality.**
  A clean terminating decimal with one legal form (4.44) closes with a plain "Thus, … is 4.44."
  and **no note**. `0.5 | 1/2` and `.9538 | 62/65` both get the note.
- Non-integer accepted lists are generous — five forms is normal:
  "Note that 16/23, .6956, .6957, 0.695, and 0.696 are examples of ways to enter a correct answer."
- Bank SPR answers skew to **3–4 digit clean integers** (2520, 2432, 980, 348, 324, 180, 110, 90,
  75, 52, 24, 14, 9, 8, 5) with a handful of non-integers. Everything fits 5 characters.
- **Extraneous/rejected-root hygiene is worth one item per form** and is always explicit in the
  rationale: square both sides → state the sign condition → check the candidate before declaring.
  Roots are also discarded by a stated domain ("x is a positive integer").

---

## 8. Figures, corrected

- **"Note: Figure not drawn to scale." lives INSIDE the figure image, never in the stem.** It
  appears zero times in the extracted stem text of 100 geometry items.
- Plural when the figure shows two objects: "Note: Figures not drawn to scale."
- **A whole form can be geometry-figure-free** — PT7 has zero figures across ten geometry items,
  all verbal. Hard geometry is figure-less everywhere; PT7 shows even easy geometry can be.
- Coordinate-grid exhibits **never** carry the note.
- **Histograms and box plots exist in the bank** (one each, both Hard one-variable-data,
  both "must be true / cannot be determined") but never in the four measured forms — which is
  exactly why the form rule is zero.
- Visuals concentrate in one skill: 15 of 16 bank visuals are nonlinear functions;
  equivalent-expressions has zero, ever.
- Three items push the visual into the **answer choices** (four mini graphs, four x|y tables) —
  a legal, rare shape.

---

## 9. Things the spec over-constrains (relax, don't chase)

| Spec line | Measured reality |
|---|---|
| numeric options ascending ~90% | monotone, direction free; descending ~29% in one form |
| key letters ≈ 4/4/4/4 ±1 | flatness is a **form**-level target; per-module A ran 5–6 of 18 with C at 3. Never rig keys at the cost of honest ordering |
| ~1 Latin binomial per form | 3 of 4 forms have zero |
| named people ≤ 2 per module | 1–4 per form, unevenly split across modules |
| applied ≤ 55 words | 64–107 words occurs when the context genuinely supplies two conditions |
| "exactly this wording" for interpretation stems | three surfaces attested, incl. "Which statement is the best interpretation of the point (a, b) in this context?" |
| cross-item number uniqueness | not enforced by CB — $27 appears in two adjacent items of one module |
