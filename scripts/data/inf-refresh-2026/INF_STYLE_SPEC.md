# Inferences (INF) — Authoring Spec

**Measured from 214 official College Board items** — 140 from `questionbank-export-2026-8-5 (10).pdf`
(Information and Ideas → Inferences, with official rationales: 20 Easy / 48 Medium / 72 Hard) plus
74 INF items already in `scripts/output/pt5-build/bank.json`.

Every number below is measured, not guessed. Author to these numbers.

---

## 0. The essence — what INF actually measures

The stem is invariant. **140/140 items** use exactly:

> *Which choice most logically completes the text?*

And **140/140** stimuli end with `______` — the blank is *always* the last thing in the passage,
and it always completes the sentence that is already in progress.

That form is not decoration. It is the whole design. INF is not "what does the passage mean?" —
that is Central Ideas. INF is:

> **The passage supplies premises and then begins the conclusion sentence for you.
> You must finish the sentence with the one conclusion those premises license — no more, no less.**

Three properties follow, and every authored item must have all three:

1. **Deductive sufficiency.** The keyed choice is not the *best-sounding* completion; it is the
   completion the premises *force*. If a student can construct a world consistent with the passage
   in which the keyed choice is false, the item is broken.
2. **Deductive necessity in reverse.** Each of the three distractors must fail for a *nameable,
   mechanical reason* — and in the official set, that reason is usually the bluntest one available:
   **64% of official rationales dismiss a distractor with "the text doesn't mention X, so there is
   no basis for this inference."** Not "less good." *Not in the text at all.*
3. **Self-containment.** Zero outside knowledge. A well-informed adult who has never heard of the
   topic must get it right from the text alone. Conversely, a specialist must not be able to get it
   right *without* the text.

### The one-sentence generator

Write the last sentence first:

> *"The premises rule out W, X, and Y; therefore Z."*

Then write the passage so it rules out W, X, and Y. Then make W, X, and Y the distractors.
If you wrote the passage first and are now hunting for a conclusion, you will produce a Central
Ideas item wearing an INF costume — which is the single most common failure in imitation banks.

---

## 1. Measured shape

### 1.1 Stimulus length (words, excluding the stem)

| | n | mean | p10 | p25 | median | p75 | p90 | min | max |
|---|---|---|---|---|---|---|---|---|---|
| Easy | 20 | 90.2 | 69 | 79 | 91 | 101 | 113 | 59 | 121 |
| Medium | 48 | 91.0 | 65 | 78 | 92 | 108 | 116 | 48 | 129 |
| Hard | 72 | 99.9 | 71 | 87 | 104 | 113 | 116 | 64 | 133 |
| **All** | 140 | **95.5** | 68 | 82 | 99 | 110 | 116 | 48 | 133 |

**Author to 75–120 words. Hard skews to 90–120. Never exceed 130.**

Hard items are only **11% longer** than easy ones. CB does not manufacture difficulty with length.

### 1.2 Sentence count — this is the real length signal, and it runs *backwards*

| | mean sentences | modal |
|---|---|---|
| Easy | **5.20** | 5 |
| Medium | **4.25** | 3 |
| Hard | **3.81** | 4 |

Easy and Hard items are nearly the same number of *words* but Hard uses **27% fewer sentences.**
Hard items are the same information compressed into longer, subordinated, appositive-laden
sentences. **Difficulty is syntactic density, not volume.** This is the most reliably missed
feature in third-party imitations, which make hard items long and simple instead of short and dense.

### 1.3 Option length (words)

| | mean | p10 | median | p90 | max |
|---|---|---|---|---|---|
| Easy | 13.2 | 8 | 13 | 19 | 26 |
| Medium | 14.5 | 9 | 14 | 21 | 32 |
| Hard | **20.1** | 13 | 19 | 29 | 42 |

Options scale much harder than stimuli: **Hard options are 52% longer than Easy options.**
Hard difficulty lives in the *choices*, not the passage.

### 1.4 Option parity — the anti-tell

- Keyed option mean length: **16.9 words.** Distractor mean: **17.3 words.** Keys are *slightly
  shorter*, not longer.
- The key is the longest of the four options in only **27/140 = 19%** of items — *below* the 25%
  chance rate.
- Within-item max/min option-length ratio: mean **1.46**, median 1.4, p90 **1.9**, absolute max 2.3.

**Rule: within an item, the longest option may not exceed ~1.9× the shortest, and the key must not
be the longest option more often than 1 item in 4.** A conspicuously long, hedged, well-qualified
keyed option is the #1 giveaway in imitation tests. Fix it by *lengthening a distractor*, never by
trimming the key into imprecision.

### 1.5 Grammar of the options

- **560/560 options end with a period.** They complete the sentence; they are not standalone.
- The option must be grammatically *and* semantically continuous with the lead-in for **all four**
  choices. Grammar is never a shortcut.
- Option openers, measured: `the` (92), `although` (11), `a` (8), `is` (8), `some` (7), `many` (7),
  `there` (7). Definite-article noun phrases dominate.
- Subordinate-clause openers (*although / while / because / rather than / contrary to / despite*):
  Easy **0%**, Medium **2%**, Hard **8%** of options.
- Commas per option: Easy **0.07**, Medium **0.14**, Hard **0.22**.

### 1.6 The lead-in (the words immediately before the blank)

The lead-in dictates the syntactic category of the answer. Measured distribution:

| lead-in shape | Easy | Medium | Hard |
|---|---|---|---|
| `…that ______` (that-clause) | 30% | 50% | **68%** |
| `…could/may/will/thus ______` (modal or adverb + VP) | 20% | 23% | 8% |
| `…because/since ______` (cause) | 15% | 4% | 1% |
| `…in order to ______` (purpose) | 5% | 6% | 3% |
| `…Consequently, ______` (full new clause) | 5% | 2% | 3% |
| other | 25% | 15% | 17% |

Most frequent exact lead-ins in the official set: *this finding suggests that* · *these findings
suggest that* · *the researchers therefore concluded that* · *it can be inferred that* ·
*the team concluded that* · *therefore contends that* · *could thus* · *in order to*.

Verb families: **suggest/indicate 29% · conclude/infer/contend/hypothesize 17% · therefore/thus 9% ·
because/since/if 4% · serves-to/purpose 2%.**

**Vary the lead-in across the set. Do not write 40 items that all end in "suggests that."**

### 1.7 Framing

Research framing (a named study, team, experiment, survey, or scholar) appears in
**Easy 50% · Medium 71% · Hard 68%** of items. A named researcher with collaborators
("X and colleagues," "X et al.," "X and a research team") appears in **~19%** — mostly Hard.

Names are globally diverse and always plausible-real, never comic. Register is neutral,
present- or past-tense expository prose. No second person, no rhetorical questions (one official
Easy item uses "Does this difference matter?" — that is the *only* one in 140; do not imitate it),
no humor, no opinion in the narrator's voice.

Topic mix, measured: life science/ecology ~26% · literature & arts ~11% · psychology/behavioral ~9% ·
history/archaeology ~7% · earth & space ~6% · economics/social science ~5% · physical science &
engineering ~4% · remainder mixed/interdisciplinary.

---

## 2. Hedging — the truth, which is subtler than folklore

Common advice says "the INF key is always the hedged one." **The measured data says that is only
weakly true and must not be used as a construction rule.**

| | keyed options | distractors |
|---|---|---|
| contain a hedge (*may, might, likely, some, tend to, often, partly, at least*) | **37%** | **28%** |
| contain an absolute (*all, always, never, only, every, must, proves, entirely*) | **5%** | **7%** |

A 37/28 split is a *tendency*, not a tell. If you hedge every key and absolutize every distractor,
a student can answer your whole bank without reading the passage — and your items no longer measure
inference.

**Operating rule:**
- Hedge the key **only when the premises genuinely support only a hedged claim** — which, in
  well-built items, is roughly a third of the time.
- Give **at least one distractor a hedge too**, so hedging cannot be scanned for.
- Keep absolutes rare in *both* columns. When you do use an overclaiming distractor, the overclaim
  must be the specific thing the passage under-determines, not generic "always."

---

## 3. The distractor taxonomy — with measured weights

Every distractor must be assignable to exactly one of these, and the rebuttal must name it.

| # | Family | Share (est. from rationales) | The rationale sentence it earns |
|---|---|---|---|
| 1 | **Unmentioned variable** — introduces a quantity, population, or comparison the text never measures | **~45%** (dominant at Easy) | "The text doesn't discuss X, so there's no basis for this inference." |
| 2 | **Polarity flip** — states the correct relationship in the wrong direction | ~15% | "The text indicates the opposite relationship." |
| 3 | **Already-excluded explanation** — the passage explicitly rules this out or accounts for it, and the choice offers it anyway | ~15% (dense at Hard) | "The text explicitly addresses this: the difference is only *partly* attributable to…" |
| 4 | **Half-right / two-clause split** — the subordinate clause is faithful, the main clause is not (or the reverse) | ~12% (Hard only, needs long options) | "While it is true that…, the text does not support the claim that…" |
| 5 | **Scope inflation** — right relationship, illegitimately generalized past the studied population or period | ~8% | "The study concerns only…, so this conclusion cannot be drawn about…" |
| 6 | **Wrong element** — a true statement about the text that does not answer the *lead-in* (describes the other approach, the other group, the other researcher) | ~5% | "This describes the ecosystem-based approach, but the sentence is about the single-species approach." |

Two rules that come out of this table:

- **Family 1 is the workhorse, and it is what makes an item Easy.** An Easy item is one whose
  distractors are *mostly family 1* — a student who has read the passage can eliminate them without
  reasoning, because the topic simply isn't there.
- **Families 3, 4, and 6 are what make an item Hard.** A Hard distractor is *inside the passage's
  content*; eliminating it requires re-reading a specific clause, not scanning for a missing topic.

---

## 4. The difficulty ladder — the delicate part

The difference between the three levels is **not** vocabulary, **not** topic obscurity, and only
marginally length. It is *where the eliminating evidence sits* and *how many clauses the student
must hold at once*.

### Easy (target 30 items)

- **5 short sentences**, ~75–100 words, plain syntax, one idea per sentence.
- Structure is nearly always: **setup → manipulation → result → "This finding suggests that ___"**
  (a study with two conditions and one contrast), or **fact → constraint → "because ___".**
- The keyed answer is the *result restated one level of generality up*. It introduces no new term.
- **3 of 3 distractors are family 1** (unmentioned variable) or one polarity flip.
- Options 8–19 words, no subordinate clauses, ≤1 comma total across all four.
- Often a **lexical grid**: `increase/decrease × experienced/inexperienced` — four options built from
  two binary features, where three cells are wrong. (This is a real CB Easy move; see the
  street-lighting item.) Use it, but not more than ~4 times in 30.
- **Keyed answer is negative/limiting in 0/20 official Easy items. Never key a negative at Easy.**

### Medium (target 40 items)

- **3–4 sentences**, ~78–110 words. One sentence now carries a subordinate clause or an appositive.
- The passage contains a **mechanism plus a constraint**: something works *but only under* a
  condition, or a trade-off is stated ("greater height allows more ears… however, greater height
  makes stalks snap").
- The inference requires **combining two separated sentences** — not just restating the last one.
- Distractor mix shifts: ~1–2 family 1, plus one from families 2/3/5. At least one distractor must
  use real content from the passage attached to the wrong element.
- Options 9–21 words, up to one subordinate clause across the four.
- **25% of official Medium keys are negative/limiting** ("cannot," "does not," "rather than").
  Author ~10 of your 40 that way.

### Hard (target 30 items)

- **3–4 dense sentences**, ~90–120 words, with at least one of: an em-dash definitional gloss, a
  parenthetical qualification, a stacked participial opener ("Applying X to Y, Z observed…"), or a
  three-part conditional premise.
- The passage contains an **eliminative premise** — a clause whose whole job is to close off the
  obvious answer. Official examples:
  - *"a difference only partly attributable to the description of new invertebrate species"*
  - *"Barring the possibility of several farmers independently developing techniques…"*
  - *"(The researchers did not replicate local differences in light or temperature.)"*
  - *"Given that Polynesia was peopled only in the last three thousand years…"*
  - *"Microplastics were present in all layers, likely because certain shapes enabled rapid
    downward migration."*

  **This clause is the item.** Without it the item is Medium. Write it before you write anything else.
- **The keyed conclusion is frequently negative, limiting, or conditional — 28% of official Hard
  keys.** Characteristic shapes:
  - *"…cannot be treated as indicative of…"*
  - *"…human activity likely played no role in…"*
  - *"…if X is indeed the case, then the adaptation must be to something other than Y."*
  - *"…researchers need to exercise caution when extrapolating…"*
  - *"…rather than A, as previously assumed, it is in fact B."*
- **Two-clause distractors.** 8% of Hard options open with *although / while / because / contrary
  to / rather than*, and average 0.22 commas. Half-right distractors (family 4) require this shape:
  the student must verify both halves.
- **Never** make it hard by using rarer words. Vocabulary load is flat across the three levels;
  syntactic and logical load is what moves.

### The five things that must never differ across levels

Stem wording · blank position · option-final period · option-length parity · self-containment.

---

## 5. The rationale template (mandatory — 140/140 official items follow it)

Every official rationale opens with the identical string:

> **Choice X is the best answer.**

Then, in order:

1. One sentence naming what the passage establishes (paraphrase the premises, don't quote wholesale).
2. One or two sentences walking the inference: *because P and Q, and because R is excluded, it
   follows that…*
3. Explicit contact with the **eliminating clause** — quote or closely paraphrase the exact span.
4. Then, per distractor, in A→D order: **"Choice Y is incorrect because…"** followed by a
   *mechanical* reason drawn from §3's taxonomy.

Official rationale length: **mean 286 words, median 290.** Easy rationales are much shorter than
Hard ones. Do not pad Easy rationales to Hard length; the terseness is part of the calibration.

The two forbidden rebuttal moves:

- ❌ "Choice B is less precise than Choice D." — INF has no *degrees* of correctness.
- ❌ "Choice C is a possible inference, but D is better." — if C is possible, the item is broken.

Every rebuttal must be reducible to one of: *not in the text* · *backwards* · *the text rules this
out* · *true of the wrong element* · *goes beyond the studied population* · *only half of it is
supported*.

---

## 6. Authoring checklist (all must pass)

**Form**
- [ ] Stem is exactly *Which choice most logically completes the text?*
- [ ] Stimulus ends with `______` (6 underscores); blank appears nowhere else.
- [ ] Stimulus 75–130 words; sentence count matches the ladder (Easy ~5, Medium 3–4, Hard 3–4 dense).
- [ ] All four options end with a period and are grammatically continuous with the lead-in.
- [ ] longest option ≤ 1.9× shortest option.
- [ ] Option mean length in band (Easy 8–19, Medium 9–21, Hard 13–29 words).

**Logic**
- [ ] The key is *entailed*, not merely *supported*.
- [ ] Each distractor is tagged with exactly one family from §3, and its rebuttal names that family.
- [ ] No two distractors fail for the same reason at Medium/Hard.
- [ ] Hedging is not a scannable tell: at least one distractor also hedges.
- [ ] No outside knowledge required; no outside knowledge sufficient.
- [ ] Hard items contain an explicit eliminative premise.

**Originality**
- [ ] No researcher name, place, organism, artwork, study, or dataset from `AVOID_NAMES_TOPICS.txt`.
- [ ] No topic reused within the 100-item set.
- [ ] Invented researchers must not collide with real prominent scholars in that field.

**Balance across the 100**
- [ ] Answer key letters ~25/25/25/25.
- [ ] Lead-in verb families roughly match §1.6 shares.
- [ ] Topic domains roughly match §1.7 shares.
- [ ] Negative/limiting keys: 0 Easy, ~10 of 40 Medium, ~9 of 30 Hard.
