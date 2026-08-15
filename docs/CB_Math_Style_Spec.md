# College Board Digital SAT — Math Item Style Spec
### Derived from 400 labeled Question-Bank items (100 per domain) + 4 official practice forms (PT4–PT7 math sections, 216 items)
### Binding authoring contract for ULTRASAT Practice Test 4, Math Modules 3–4 (and reusable for Tests 5–10)
### Companion measurement docs: analysis/A_practice_tests.md (form anatomy), analysis/B_question_bank.md (per-skill playbook)

---

## 0. THE ESSENCE (read this twice)

A College Board math item is **one isolated mathematical decision wrapped in frictionless arithmetic**.
The measured construct is:

> Can the student see the STRUCTURE of the situation — which quantity is which, what condition
> governs the constants, what one manipulation collapses the problem — and resist four answers
> that are each the correct result of a *slightly different* problem?

Eight invariants that separate real CB items from Barron's/Princeton Review imitations:

1. **One item = one insight.** Every item isolates exactly one decision (a swap, a structure,
   a condition). Imitators stack two insights and call it "hard"; CB never does.
2. **Difficulty lives in the setup, never in messy numbers.** Hard items use engineered
   constants (65/7, 1,089√3, 24√37) that collapse the moment the right structure is seen.
   Easy items have easy numbers AND easy structure. "Clean" is a property of the ANSWER.
3. **Distractors are derivations, not noise.** Each wrong option is reachable by one nameable
   error — the wrong turns of the intended solution path. If you cannot write the one-sentence
   recipe for option C, option C is wrong for this test.
4. **Wrong-target questions are a signature.** "If 4x + 12 = 36, what is the value of 12x?" —
   rewarding manipulation of the equation as an object instead of grinding for x. ~1–2 per
   module. Prep-company clones almost never do this.
5. **Interpretation items test mapping, not computing.** All four options are true-sounding
   sentences built from the same two numbers with permuted roles (slope↔intercept,
   input↔output, amount↔rate).
6. **Parameters are first-class citizens.** Roughly 1 item in 6 asks about a constant
   (k for no solution, a·b from an identity, c for tangency), not the variable.
7. **Ruthless economy + absolute self-containment.** Median stem ≈ 25 prose words; a single
   terminal question; conversion factors and exotic formulas handed over in parentheses;
   no motivation, no story arc, no second question, no "you".
8. **Dry, interchangeable contexts.** A named person performs at most one economic or
   observational act. The math survives deleting the context. 70% of items have no context
   at all.

---

## 1. FORM BLUEPRINT (44 items, 22 per module)

**Source mapping note.** The four analyzed PDF forms are the paper-adapted linear forms:
27 items/module, 20 MC + 7 SPR, SPR fixed at 6, 7, 13, 14, 20, 21, 27, modules parallel
(non-adaptive). The ULTRASAT app uses the digital shape (QC enforces 22 items for modules
3–4; 35 min → timeLimit 2100). All rates below are the measured paper-form rates re-expressed
on 22 items, preserving the measured rhythm.

### 1a. Format skeleton (both modules, hard rule)
- 16 MC + 6 SPR per module (27.3% SPR ≈ measured 25.9%).
- SPR positions: **5, 6, 12, 13, 19, 22** — two interspersed pairs + late single + closer,
  preserving the measured "pairs at thirds + hard SPR closer" texture. Q22 is ALWAYS hard.
- SPR difficulty by position: 5–6 easy, 12–13 medium, 19 hard, 22 hard.

### 1b. Domain quotas (44 items)
| Domain | Form | M3 | M4 | Measured share |
|---|---|---|---|---|
| Algebra | 15 | 8 | 7 | 33.3% |
| Advanced Math | 14 | 7 | 7 | 31.5% |
| Problem-Solving & Data Analysis | 8 | 4 | 4 | 18.1% |
| Geometry & Trigonometry | 7 | 3 | 4 | 17.1% |

### 1c. Skill quotas (44 items)
nonlinear-functions 7 · linear-functions 4 · nonlinear-equations 4 · linear-equations-one-variable 3 ·
linear-equations-two-variables 3 · systems-linear-equations 3 · equivalent-expressions 3 ·
linear-inequalities 2 · ratios-rates-proportions 2 · two-variable-data 2 · one-variable-data 1 ·
percentages 1 · probability 1 (Module 4 ONLY — measured: probability never appears in M1) ·
inference-statistics 1 · area-volume 2 · lines-angles-triangles 2 · right-triangles-trigonometry 1 ·
circles 2 (≥1 per module — every measured module has a circles item) ·
evaluating-statistical-claims 0 (absent from all 4 measured forms).

### 1d. Difficulty mix and curve
- Module 3: **9 E / 7 M / 6 H** · Module 4: **8 E / 8 M / 6 H** (forms are parallel;
  measured pooled mix E 42 / M 32 / H 26).
- Monotone ramp with one honest dip: all-easy through Q7–8 (one medium may appear at Q9
  with an easy straggler at Q10), medium band Q9–16, hard band Q17–22. Q22 hard, always.
- Hard bins by skill (measured): circles (0E/2M/14H in the bank), systems-parameter,
  discriminant/tangency hunts, exponential structure, chained percents, similar-triangle
  sufficiency. Easy bins: bare solves, evaluate-f, unit rates, read-the-display.

### 1e. Visual quota
- 4 visual-stimulus items per module (8/44 = 18% ≈ measured 20.4%).
- Palette per form: 3–4 coordinate-plane graphs (line, parabola, scatter ×2 max), 2 HTML
  tables (data table, two-way table), 1–2 geometry figures. **Zero histograms, zero box
  plots** (never appeared in the measured forms).
- Geometry figures accompany EASY/MEDIUM geometry only; hard geometry is deliberately
  figure-less (verbal figures). Every geometry figure carries "Note: Figure not drawn to
  scale." Coordinate grids never carry the note.
- All two-variable-data items get a scatter/graph (measured 9/9).

---

## 2. STEM CONVENTIONS

### 2a. Canonical stem formulas (use these, at these rates)
- "What is the value of ___?" — the workhorse, ≈20% of items; target often composite (7p, x+y, ab).
- "Which of the following …?" — ≈25% of items (~34% of MC).
- "The function f is defined by f(x) = … ." opener for function items.
- "Which equation represents this situation?" / "…defines f?" for model-building.
- "Which expression is equivalent to …?" — the equivalent-expressions stem, nearly 1:1.
- "What is the best interpretation of ___ in this context?" — exactly this wording.
- "The solution to the given system of equations is (x, y). What is the value of ___?"
- "What is the positive solution to the given equation?" / "What is a solution…?" (multi-root).
- "In the xy-plane, …" opener for coordinate statements; "The graph of … is shown." for exhibits.
- Displayed equation floats above a prose stem that references "the given equation".
- Parenthetical clarifiers only when ambiguity is real: "(1 mile = 1,760 yards)",
  "(Express your answer as a decimal or fraction, not as a percent.)".
- Constants declared: "…, where a and b are constants." Parameter letters a, b, c, k, p, r,
  s, t, w — never colliding with axis variables in the same item.
- Negations in caps: "What CANNOT be…", "is NOT…"; estimates flagged "closest to" / "best estimate".
- NEVER: two questions, imperatives ("Find x."), "you", brand names, humor, exclamation points.

### 2b. Stem length (prose words, binding)
Equivalent-expressions ≤ 15 · abstract algebra/adv-math ≤ 35 · applied contexts ≤ 55 ·
stat/inference verbal ≤ 75. Median target ≈ 25. Going long is the #1 tell of a fake item.

### 2c. Context register
- Applied ≈ 30–35% of the form: PSDA ~85% applied, Algebra ~40%, AdvMath ~20%, Geometry ~10%.
- Named people ≤ 2 per module (measured 4%): single given-name, culturally diverse, one person
  per context, no dialogue. Institutions generic: "a company", "a certain store", "a state park".
- Topic palette: small commerce (prices, fees, rentals), school/club logistics, biology counts
  (include ~one Latin species name per form), light physics (dropped/launched object, pressure),
  civic data (surveys, samples). Money is the most common unit.
- Units named at every mention, comma-interpolated: "the volume, in cubic inches, of the box".
  Imperial and metric both fine; any conversion factor is GIVEN.
- Trailing where-clauses define every symbol: "…where t is the number of months after purchase".
- Numbers plausible but not researched; decimals only where the context earns them (prices,
  rates, probabilities, growth factors).

---

## 3. ANSWER-CHOICE CONVENTIONS (MC)

- Exactly 4 options; one correct; no "None of the above".
- Numeric sets sorted ascending (~90%; descending allowed for radical/geometry sets). Never shuffled.
- Key letter balance ≈ flat across the module (target 4/4/4/4 ±1 over 16 MC; no rigging, no C-bias).
- Every distractor derived from a named error (see §4); easy-item option sets usually include
  the stem's own numbers verbatim (recognition bait).
- Equation options share one surface template varying a single slot (sign, coefficient, exponent).
- Interpretation items: 4 grammatically parallel full sentences, near-equal length, each a
  systematic mis-mapping.
- Special sets (≤1 each per form): "Zero / Exactly one / Exactly two / Infinitely many";
  Roman-numeral I/II lists; "could be" vs "must be" wording as the load-bearing distinction.
- Typography: π symbolic (726π), radicals simplified unless the unsimplified form IS the trap,
  thousands commas, ° on angles, coordinates as ordered pairs.

---

## 4. DISTRACTOR RECIPE BOOK (generate 3 per MC from these)

Universal taxonomy by measured frequency:
1. **Adjacent-quantity substitution** (~45% of specific dismissals): the correctly computed
   *other* quantity — x for f(x); the other variable; perimeter/face-area/surface-area for
   volume; mean/mode/range for median; r² / diameter / circumference for radius; leg for
   hypotenuse; P(B|A) for P(A|B); the intermediate result one step before the answer.
2. **Reversal/swap** (~15%): swapped totals or coefficients between equations; a↔b in a(b)^t;
   reversed ratio; reciprocal instead of negative reciprocal (perpendicular-slope trio:
   reciprocal, plain negative, original slope); at-least↔at-most; up↔down translation.
3. **Wrong operation** (~10%): multiplied vs added exponents; ÷2 vs √; added vs multiplied
   percent factor; multiplied radius by k instead of squaring.
4. **Step-skip/partial** (~8%): one of two conversions applied; solved inner equation only;
   one root reported; solved for x but not the asked expression.
5. **Sign error** (~6%): (y−k) vs (y+k); dropped ± on square root; k vs −k.
6. **Scale/unit slip** (~6%): unconverted minutes/hours; % not decimalized; diameter as radius.
7. **Similarity exponents** (geometry signature): k vs k² vs k³ as the entire choice set.
8. **Canonical misconception menus** (verbal items): margin-of-error's four fixed misreadings
   (accuracy claim / impossibility outside interval / exact value / all-equally-likely);
   overgeneralized samples; "means equal ⇒ medians equal".
Per-skill standing trios are listed in analysis/B_question_bank.md §3.2 — use them verbatim
(e.g. systems word problems: swap totals / swap coefficients / both).

---

## 5. TRAP QUOTA (per 44-item form, target counts)

answer-the-wrong-target ~3 · slope-intercept/role swap ~3 · solution-count & discriminant
parameter hunts ~2 · sign-slip bait ~2 · percent-multiplier semantics ~1 · radius/diameter or
length-vs-area scale ~1–2 · formula-fragment omission ~1 · interpretation mis-mapping menu ~2 ·
exponent-structure conversion ~1 · statistical-robustness reasoning ~1 · must-be/could-be ~1 ·
extraneous/nonreal-solution awareness ~1 · function-notation nesting ~1 · verbatim-number echo
(easy MC sets, pervasive). Exactly ONE mechanism per item.

---

## 6. SPR (user-input) RULES

- 12 per form. Answers: ~8 integers (unafraid of 3–4 digits: 336, 774, 4205-style),
  ~3 fractions in lowest terms (improper fine: 44/3, 81/4; never mixed numbers),
  ~1 negative, ≤1 clean decimal. Everything ≤5 characters (6 with the minus sign).
- acceptedAnswers lists every legal entry: for fractions add the decimal truncated to 4
  significant characters AND rounded variant AND leading-zero variant where they fit
  (e.g. 7/24 → ["7/24", ".2916", ".2917", "0.291", "0.292"] — follow the app's grader
  reality; keep all ≤6 chars). For either-sign/multi-root answers list every valid root.
- Non-integer answers end the rationale with: "Note that [forms] are examples of ways to
  enter a correct answer."
- Easy SPRs are 1–2 step with clean integers; hard SPRs come from constant-parameter
  archetypes and produce fractions, negatives, or large engineered integers.

---

## 7. RATIONALE STYLE GUIDE (binding liturgy)

**MC skeleton:**
1. `Choice [K] is correct.`
2. `It's given that [restated premise].` (curly apostrophe; cite definitions as needed)
3. Derivation loop, every operation named: `[Gerund phrase] yields [result], or [simpler form].`
   Chains use ", or" for rewrites and "which is equivalent to" for form changes. "Since …" for
   justifications.
4. `Therefore, [answer restated in the question's own noun phrase] is [value].`
5. Per-choice dismissals, letter order, own sentences:
   - `Choice [L] is incorrect and may result from [named error].`
   - `Choice [L] is incorrect. This is the [other quantity], not the [asked quantity].`
   - `Choice [L] is incorrect because [one-sentence counterfact].` (verbal choices)
   - Verification-fail: `Substituting [a] for [x] … yields [false statement], which isn't a
     true statement.`
   - Fallback (≤28% of items, mostly easy/figure items): `…and may result from conceptual or
     calculation errors.`
   - Interpretation items: append the alternate-world sentence — `This equation represents a
     situation where [parameter] is [wrong value], not [right value].`

**SPR skeleton:** `The correct answer is [value].` + It's-given derivation + `Therefore, … is
[value].` + entry-forms note if non-integer. No dismissals.

**Length:** MC ≈ 110/135/170 words (E/M/H); SPR ≈ 40/100/130. Voice: third person, present
tense, no "we/you/let's", numbers recomputed inline, dismissals name the right value
("…is p, not q").

---

## 8. NOTATION & APP FORMAT CONTRACT (ULTRASAT-specific)

The exam player renders `passage` and `text` as sanitized HTML (DOMPurify), but **options are
plain React text — HTML in options will display as raw tags.**

- **passage** (nullable): context sentences and/or displayed equation(s). Displayed equations
  centered: `<div style="text-align:center; margin:8px 0;">3x + 7 = 25</div>`; systems stack
  two such lines. Data tables are HTML tables here (bordered, centered values, bold headers,
  two-way tables include a Total row+column), with a lead-in sentence in the stem or passage
  ("The table shows …"). Exponents `<sup>2</sup>`, no LaTeX (KaTeX is not loaded in the player).
- **text**: the single interrogative sentence (plus SPR has no special directions — the app
  supplies the input UI).
- **options**: plain text with Unicode math — superscripts ² ³ ⁴ ⁵ ⁶ ᵗ ˣ ⁿ, √, π, ≤, ≥, °,
  fractions as a/b, ASCII hyphen for minus (the QC normalizer maps Unicode minus to hyphen).
- **Figures**: standalone SVG assets (one file per figure) referenced by `graphAsset`
  filename in the module JSON; the import script inlines them as base64 data URIs into
  `graphUrl` and sets `hasImage: true`. `graphDescription` = 1–2 factual sentences (alt text).
  **Alt text must be DATA-COMPLETE: it states every datum a sighted student can read off the
  figure — each bar height, plotted point, labelled measure, axis range and grid spacing, and
  the presence of a "not drawn to scale" note — so that a screen-reader user can answer the item
  from the description alone; it must not interpret the figure or announce the answer as an
  answer, so state the plotted geometry rather than restating the stem's asked quantity, and add
  as many sentences as the figure's data require.** (Corrected 2026-08-15: this reverses the
  earlier instruction to withhold figure data, which left three items unanswerable without
  sight and contradicted every shipped form.)
  SVG conventions: ~380px wide; serif font (Georgia); italic variables; axes arrowed both
  ends with italic x/y at tips; origin O; fine gridlines #cccccc; black curves/dots;
  axis titles roman with units in parentheses ("Time (seconds)"); geometry figures minimal
  line art, right-angle boxes, x°-style angle marks, centered 12px caption
  "Note: Figure not drawn to scale." inside the SVG bottom.
- **Question JSON fields** (schema-identical to the R&W modules plus figure fields):
  `originalQuestionNumber, passage, text, questionType ("multiple-choice"|"user-input"),
  options (4 strings | []), correctAnswer (index | answer string), acceptedAnswers
  (null | string[]), difficulty ("easy"|"medium"|"hard"), subcategory (kebab),
  subcategoryId, explanation, graphAsset (null | filename), graphDescription (null | string)`.
- **Subcategory IDs**: linear-equations-one-variable 11 · linear-functions 12 ·
  linear-equations-two-variables 13 · systems-linear-equations 14 · linear-inequalities 15 ·
  nonlinear-functions 16 · nonlinear-equations 17 · equivalent-expressions 18 ·
  ratios-rates-proportions 19 · percentages 20 · one-variable-data 21 · two-variable-data 22 ·
  probability 23 · inference-statistics 24 · evaluating-statistical-claims 25 · area-volume 26 ·
  lines-angles-triangles 27 · right-triangles-trigonometry 28 · circles 29.
- **Module metadata**: moduleNumber 3 & 4, section "Math", calculatorAllowed true,
  timeLimit 2100, 22 questions each.

---

## 9. QC CHECKLIST (what validation + critique enforce)

1. Blueprint conformance: quotas §1b–1e, SPR positions, difficulty curve, visual quota.
2. Every item mathematically airtight: unique correct answer (MC), all distractors actually
   wrong, SPR accepted forms complete and ≤5 chars (6 with minus).
3. Exactly one trap mechanism per item, drawn from §5, at form-level quota.
4. Stems within length caps; voice fingerprint (§2a) with zero forbidden moves.
5. Numeric options ascending; key letters ≈ flat; equation options single-slot variants.
6. Rationales follow §7 liturgy ("yields", "It's given that", "Therefore," + dismissal formulas).
7. 100% original content: no context, number set, or scenario reproduced from any College
   Board form or export; contexts must also not collide with each other across the 44 items.
8. HTML passes DOMPurify defaults; options contain no HTML tags; SVGs well-formed.
