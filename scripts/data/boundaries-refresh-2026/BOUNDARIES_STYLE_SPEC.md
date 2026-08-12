# Boundaries — Authoring Spec (measured from 211 official College Board items)

Source: `questionbank-export-2026-8-5 (16).pdf` — 211 official SAT Question Bank items, skill =
Boundaries (Standard English Conventions), with official rationales. **Every number below is
measured from that export**, not estimated. Companion to `wic-refresh-2026/WIC_STYLE_SPEC.md`.

Bank composition: 61 Easy · 54 Medium · 96 Hard.

---

## 0. The essence — what is actually being measured

Boundaries looks like a punctuation quiz. It is not. It is a **clause-parsing test wearing a
punctuation costume.**

In 125 of 211 items (59%) the four options are *the identical words* with different marks. The
student is given no semantic choice at all. The only question is:

> **What is the syntactic status of the span to the left of the seam, and of the span to the
> right?**

Everything else follows mechanically. Which means the item writer's real job is not choosing a
punctuation rule — it is **engineering a seam whose two sides are hard to classify.**

This is the thing third-party imitations get wrong. Barron's and Princeton Review write items
where the seam is obvious and the rule is the difficulty ("do you know the semicolon rule?").
College Board writes items where the **rule is trivial and the parse is the difficulty**. A
strong student who knows every rule still misses 70% of hard official items, because the
sentence is built so that the left span *feels* complete when it isn't, or *feels* incomplete
when it is.

Three consequences that must hold in every authored item:

1. **One seam, one blank.** Never test two things. The `______` marks exactly one junction, and
   the four options differ only there.
2. **The key must be provable by parse, not by ear.** If the answer can be reached by "that's
   where I'd pause," the item is broken. Every official item punishes the ear at least once.
3. **Every distractor fails for a nameable, quotable reason** — comma splice, run-on, fragment,
   illegal subject/verb separation, mismatched pair, colon after a fragment. "Sounds awkward" is
   never a reason. If you cannot name the failure in the CB vocabulary of §5, the option is bad.

---

## 1. Measured numbers

### The stem

**100% identical across all 211 items**, verbatim, no variation by difficulty:

> Which choice completes the text so that it conforms to the conventions of Standard English?

Never paraphrase it. Never write "Which choice is grammatically correct?"

### Passage length (words, stem excluded)

| Difficulty | mean | median | p10 | p90 | min | max | **author to** |
|---|---|---|---|---|---|---|---|
| Easy | 39.9 | 41 | 26 | 52 | 20 | 62 | **28–52** |
| Medium | 49.2 | 49 | 36 | 62 | 27 | 67 | **38–62** |
| Hard | 48.1 | 49 | 39 | 58 | 24 | 69 | **40–62** |

**Hard items are shorter than medium items.** This is the single most counter-intuitive measured
fact in the bank and the one imitators most reliably violate: they manufacture difficulty by
piling on length. College Board does not. A hard Boundaries item is ~48 words — the same as a
medium one — and gets its difficulty entirely from *where the seam sits inside those 48 words*.
Never exceed 65 words.

Mean sentences per passage: **1.66.** Most items are one long sentence or two sentences.

### Comma noise — the real hard lever

Count of commas already present in the passage, *not counting the tested seam*:

| Difficulty | mean commas | mean subordinators |
|---|---|---|
| Easy | 2.16 | 0.95 |
| Medium | 2.69 | 1.35 |
| Hard | 3.21 | 1.09 |

Difficulty rises with **comma density, not word count**. Hard passages are the same length but
carry ~50% more untested commas — from appositives, dates, parenthetical glosses, coordinate
adjectives, and lists. The tested comma is camouflaged among commas the student must recognize
as *not* the seam. Subordinator count does **not** rise from medium to hard; syntactic
subordination is a medium-level lever, comma camouflage is the hard one.

### Blank position

| Difficulty | opening third | middle third | final third |
|---|---|---|---|
| Easy | 5 | 29 | 27 |
| Medium | 4 | 31 | 19 |
| Hard | 14 | 47 | 35 |

The seam sits mid-passage in ~55% of items. Unlike Words in Context, opening placement is rare
(11%) and is a hard-only device — used when the blank is a name/appositive at the very start.

### Answer key

Official spread: A 37 · B 51 · C 61 · D 62 — heavily back-loaded, because CB tends to order
options by mark (∅, comma, dash, semicolon) and the "harder" mark lands late.
**Author to exactly 25/25/25/25 per 100.** Never three of the same letter consecutively in
emitted file order.

### Passage furniture

- **36%** name a person, always introduced by role and always with first + last name:
  *"Entomologist Heather Grab found…"*, *"British artist Willard Wigan is known for…"*.
  Globally diverse. In Boundaries the named person is doing double duty — the name is often
  *itself* the seam (appositive, title, or subject/verb junction).
- **47%** contain a digit — a year, a count, a percentage, a span. Far higher than in Words in
  Context, because numbers bring commas and parentheses with them, which is exactly the noise
  the hard items need.
- **16%** contain parentheses; **15%** contain a quotation.
- Present tense for standing claims, past tense for studies and history.
- No second person, no humor, no rhetorical questions except in the interrogative family (§3.5).

---

## 2. Convention families

Derived from the official rationales' own `The convention being tested is ___` label. The 74
items whose label is the generic *"the use of punctuation within a sentence"* have been
redistributed here by their keyed mark.

| Family | official n | E | M | H | what it tests |
|---|---|---|---|---|---|
| **1. Sentence boundary (IC \| IC)** | ~50 | ●● | ●● | ●●● | period / semicolon / colon vs comma splice vs run-on |
| **2. Supplementary element** | ~40 | ● | ●●● | ●●● | matched pair of commas, dashes, or parentheses |
| **3. No-punctuation seam** | ~30 | ●●● | ●● | ●● | subject\|verb, verb\|object, prep\|complement, 2 coordinates |
| **4. Coordination of main clauses** | 22 | ●● | ●●● | ● | comma + FANBOYS vs bare conjunction vs splice |
| **5. Series / complex series** | ~21 | ● | ● | ●●● | semicolons separating items that contain commas |
| **6. Colon** | ~11 | — | ● | ●● | colon requires a complete clause on its left |
| **7. Relative clause** | 5 | ● | ● | ● | integrated ("that/which," no comma) vs supplementary |
| **8. Subordinate + main clause** | 3 | ●●● | — | — | comma after a fronted subordinate clause |
| **9. Titles & proper nouns** | 6 | — | — | ●●●● | no comma between a title and the name it restricts |
| **10. Interrogative** | 13 | ●●●● | — | — | word order + `?` vs `.` — **easy only, all 13** |

Two families are **difficulty-locked in the official bank** and must stay locked:

- **Interrogative** appears at Easy 13 times and at Medium/Hard *zero* times.
- **Titles & proper nouns** appears at Hard 6 times and at Easy/Medium *zero* times. (*"…praise
  from leading contemporary ______ them Nigerian American essayist and novelist Teju Cole…"*)
- **Colon** never keys an Easy item. Not once in 61.

---

## 3. Option-set menus — the six shapes

The four options are generated by one of six menus. Choose the menu **before** writing the
passage; the menu determines what the passage must be engineered to hide.

### 3.1 The full menu — `X` / `X,` / `X;` / `X —`
Same words, four marks, no capitalization change. Tests **whether any break is licensed at all.**
The ∅ option is the key in 46/211 items (22%) — this is CB's highest-value trap, because every
student instinct says "something goes here."
> `writers` / `writers,` / `writers —` / `writers;` → key **writers** (subject–verb seam)

### 3.2 The boundary menu — `X. The` / `X: the` / `X; the` / `X, the`
Capitalization varies with the mark. **64 items (30%)** use this shape. Tests IC | IC and, when
the right span is a list or an explanation, colon vs semicolon.
> `periods. The` / `periods: the` / `periods; the` / `periods, the` → key **periods: the**

### 3.3 The bracket menu — 0 / 1 / 2 marks around a supplementary element
The blank sits at one edge of a supplementary element whose *other* edge already carries a mark
in the passage. Options offer a matching comma, a mismatched dash, a semicolon, and nothing.
> `models —` / `models, which` / `models which` / `models which —`
The signature distractor here is the **mismatched pair** (`, … —`), which CB rebuts with a stock
sentence (§5.5) and which almost no imitator writes.

### 3.4 The connector menu — `X and` / `X,` / `X;` / `X, and`
Tests coordination: whether the right span is a full main clause (needs comma + FANBOYS), a bare
second verb (needs nothing), or a second item in a two-item coordinate pair (needs nothing).
> `nutrients` / `nutrients and` / `nutrients,` / `nutrients —` → key **nutrients**

### 3.5 The interrogative menu — **easy only**
Two variables crossed: word order (declarative vs subject–auxiliary inversion) and terminal mark
(`.` vs `?`). Exactly one cell is legal. All 13 official instances are Easy.
> `where sound is made?` / `where is sound made.` / `where sound is made.` / `where is sound made?`
Note: the key is the *declarative* order 7 times and the *interrogative* order 6 times — the
embedded-question version ("researchers wondered where sound is made.") is as common as the
direct question. Do not make `?` a reliable signal.

### 3.6 The complex-series menu — `,` vs `;` at one item boundary
The passage contains a list of three items, at least two of which contain internal commas. The
blank sits at one item boundary; another boundary already shows a semicolon in the passage.
> `items managing` / `items, managing` / `items; managing` / `items. Managing`
The comma distractor is rebutted specifically: *"a comma after 'items' doesn't match the
semicolon used later to separate the second and third items."*

**Menu × difficulty:** distinct marks offered averages 3.05–3.19 at every difficulty — CB does
**not** make hard items harder by widening the menu. Easy 3.08 · Medium 3.19 · Hard 3.05.

---

## 4. The difficulty ladder

The cleanest measured discriminator is **which mark the key uses.**

| keyed mark | Easy (n=61) | Medium (n=54) | Hard (n=96) |
|---|---|---|---|
| comma | **26** | 21 | 12 |
| ∅ no punctuation | 17 | 11 | **18** |
| period | 11 | 5 | **18** |
| `?` | 6 | 0 | 0 |
| dash | 1 | 5 | 5 |
| semicolon | **0** | 4 | 9 |
| colon | **0** | 2 | **12** |
| complex series (`,`+`;`) | **0** | 3 | **13** |

**Easy (target ~80% correct).** Key is a comma, nothing, a period, or `?` — 60/61 items.
**A colon, a semicolon, or a complex series is never the answer to an easy item.** The seam is
adjacent to what determines it: the subject is short and its verb immediately follows; the two
main clauses are short and plainly separate. ≤2 untested commas. 28–52 words. One inference:
*is this one sentence or two?*

**Medium (target ~55%). The workhorse — 40 items.**
Key broadens to dash and semicolon. The determining span is **one modifier away** from the seam:
a prepositional phrase, an appositive, or a participle now sits between the subject and its verb,
or between the two clauses. 2–3 untested commas, 38–62 words. Coordination of main clauses peaks
here (12/22 official). The student must strip a modifier before parsing.

**Hard (target ~30%). Three levers — every hard item uses at least one, most use two.**

- **(a) Comma camouflage.** 3+ untested commas already in the passage, from an appositive, a
  date, a parenthetical gloss, a coordinate-adjective pair, or an embedded list. The student must
  identify which comma is structural and which is decoration. This is what the measured jump from
  2.69 → 3.21 commas is.
- **(b) False completeness.** The span left of the seam is built to feel finished when it is not
  (a long noun phrase with a participle: *"British artist Willard Wigan is known for his
  remarkable microsculptures ______ so small that they are best viewed through a microscope"*),
  or to feel unfinished when it is. Every hard fragment distractor exists to punish this.
- **(c) The rare keyed mark.** Colon (12), complex-series semicolon (13), plain semicolon (9) —
  34/96 hard items key a mark that is *never* the answer at Easy. And symmetrically, ∅ is the key
  in 18/96, in sentences engineered so that a break feels mandatory.

What hard does **not** do: it does not get longer (48 words vs medium's 49), it does not offer
more marks (3.05 vs 3.19), and it does not use rarer grammar. It reuses the same ten conventions
with the evidence moved further from the seam.

---

## 5. Distractor mechanics — the CB failure vocabulary

Every wrong option must fail as exactly one of these, and the rebuttal must name it in this
language. Frequencies are counted across all 633 official rebuttals.

1. **Comma splice** (42 uses). *"…it results in a comma splice. Without a conjunction following
   it, a comma can't be used in this way to join two main clauses."* / *"…a comma can't be used
   in this way to mark the boundary between sentences."*
2. **Illegal separation** (58 uses). *"no punctuation is needed between the subject and the
   verb"* / *"…between the verb and its object"* / *"…between the preposition and its
   complement"* / *"…between the coordinates 'X' and 'Y'."* Terse and repeated verbatim across
   all three distractors — CB does not vary this for elegance, and neither should we.
3. **Run-on / fused** (34 uses). *"…it results in a run-on sentence. The two main clauses ('X'
   and 'Y') are fused without punctuation and/or a conjunction."*
4. **Fragment** (24 uses). *"…placing a period after 'X' results in a rhetorically unacceptable
   sentence fragment beginning with 'Y'."* Note the adverb: **rhetorically unacceptable**, not
   "grammatically incorrect." CB's position is that fragments are a style choice the SAT
   declines, not an error.
5. **Mismatched pair** (12 uses). *"a comma can't be paired with a dash in this way to separate
   the supplementary element from the rest of the sentence"* / *"a semicolon can't be paired with
   a comma in this way…"*
6. **Unbracketed supplement** (16 uses). *"…it fails to use appropriate punctuation to separate
   the supplementary element 'X' from the rest of the sentence."*
7. **Series inconsistency** (6 uses). *"a comma after 'X' doesn't match the semicolon used later
   to separate the second and third items in the series."*
8. **Colon without a complete clause** — the left span is not an independent clause.

Prohibited: a distractor that is defensible under any standard style guide. Serial-comma
variation, British quoting conventions, and "some writers would allow this" are all disqualifying.
If two options are both correct under *any* mainstream convention, the item is broken.

### 5.9 The equivalence constraint — the rule that makes or breaks the option set

A period and a semicolon are **functionally identical** between two independent clauses. So are a
period and a colon in many contexts. An option set that offers two functionally identical marks
in a position where both are legal has two right answers. Measured, CB is scrupulous about this,
and the pattern is unmistakable:

| key | distractor mark-sets offered | n |
|---|---|---|
| **period** | `,` + ∅ + ∅ | **17 / 34** |
| period | `.`+ `?` + `?` (interrogative family) | 7 |
| period | `,` + `,` + ∅ | 5 |
| period | `,` + ∅ + `;` | **2 only** |
| **semicolon** | `,` + ∅ + ∅ | 6 / 13 |
| semicolon | `,` + `,` + `,` (series) | 2 |
| **colon** | `,` + ∅ + ∅ | 5 / 14 |
| colon | `.` + ∅ + `;` | 4 / 14 |

Read that top row carefully. **When the period is the key, the standard distractor set is a comma
and two flavours of nothing** — a comma splice and two run-ons. The semicolon is offered against a
period key only twice in 211 items, and in both of those the right-hand span is *not* an
independent clause, so the semicolon is independently illegal:

> `temperature; by adding` / `temperature, adding` / **`temperature. Adding`** / `temperature by adding`
> — rebuttal: *"a semicolon can't be used in this way to join the sentence 'On…temperature' and the
> supplementary phrases that follow. Doing so leaves the verb phrase 'helps combat' without a
> subject."*

The construction rules that follow are absolute:

1. **In an IC | IC item, at most one of {period, semicolon} appears in the option set.** Never both.
   If the key is a period, the other three options are a comma splice and two run-ons/fragments.
2. **A period may co-occur with a semicolon key only when the semicolon's job is series
   separation, not clause joining** — because there a period produces a fragment.
3. **A colon key may sit alongside both a period and a semicolon distractor** — but only when the
   right span is a fragment, a list, or an appositive. Then the period yields a fragment, the
   semicolon is illegal for want of a second main clause, and the colon is uniquely licensed.
   4/14 official colon items are built exactly this way and they are the highest-quality items in
   the bank.
4. **Never offer two options that differ only in dash-vs-comma when both edges are unmarked** —
   both would be legal.

Violating rule 1 is the single most common defect in commercial imitations, and it is the fastest
way for a strong student to lose trust in a question bank.

---

## 6. Rationale voice — mirror the official register exactly

Two-part structure, plain text.

**Affirmative paragraph.** Opens *literally* with:

> Choice **{L}** is the best answer. The convention being tested is {convention label}.

then one of the measured continuations:

- *"In this choice, the period is used correctly to mark the boundary between…"* (14×)
- *"This choice correctly uses a comma and the coordinating conjunction 'and' to join…"* (9×)
- *"This choice uses a semicolon in a conventional way to join the first main clause… and the
  second main clause…"* (8×)
- *"This choice correctly uses a comma to separate the supplementary [adverbial/appositive]
  phrase… from the rest of the sentence."* (8×)
- *"The comma after 'X' pairs with the comma after 'Y' to separate the supplementary element…"* (7×)
- *"It's conventional to use a semicolon to separate items in a complex series…"* (5×)
- *"No punctuation is needed when, as in this case, a subject ('X') is immediately followed by a
  main verb ('Y')."*

**Rebuttals.** Each opens *literally* with `Choice {L} is incorrect because` and names a §5
failure. For §5.2 items the same sentence is repeated verbatim for all three distractors — do not
"improve" this.

Non-negotiable fingerprints:

- The `convention being tested` label is drawn from the official vocabulary, not invented. Use:
  *punctuation use between sentences · the coordination of main clauses within a sentence · the
  punctuation of a supplementary element within a sentence · punctuation between a subject and a
  verb · punctuation use between a verb and its object · punctuation use between a preposition and
  its complement · the use of a colon within a sentence · the punctuation of elements in a complex
  series · the punctuation of items in a series · end-of-sentence punctuation · the use and
  punctuation of an integrated relative clause · punctuation between a subordinate clause and a
  main clause · the use of punctuation between titles and proper nouns · punctuation between
  coordinates in a sentence · the use of punctuation within a sentence.*
- Quote the relevant spans in double quotes, using ellipsis for long spans: `"Since…periods"`.
- Never say "sounds better," "flows," "is awkward," "is less clear," or "pauses."
- Never mention breath, rhythm, or emphasis.

---

## 7. Composition targets for the 100-item refresh

### Family × difficulty

| Family | Easy | Medium | Hard | total |
|---|---|---|---|---|
| Sentence boundary (IC \| IC) | 8 | 10 | 6 | **24** |
| Supplementary element | 3 | 10 | 7 | **20** |
| No-punctuation seam | 6 | 5 | 3 | **14** |
| Coordination of main clauses | 4 | 5 | 2 | **11** |
| Series / complex series | 2 | 3 | 4 | **9** |
| Colon | 0 | 3 | 4 | **7** |
| Relative clause | 1 | 2 | 2 | **5** |
| Subordinate + main clause | 3 | 1 | 0 | **4** |
| Titles & proper nouns | 0 | 1 | 2 | **3** |
| Interrogative | 3 | 0 | 0 | **3** |
| **total** | **30** | **40** | **30** | **100** |

### Keyed mark

| mark | Easy | Medium | Hard |
|---|---|---|---|
| comma | 13 | 15 | 4 |
| ∅ | 8 | 8 | 6 |
| period | 5 | 4 | 6 |
| `?` | 3 | 0 | 0 |
| dash | 1 | 4 | 3 |
| semicolon | 0 | 4 | 3 |
| colon | 0 | 3 | 4 |
| complex series | 0 | 2 | 4 |

### Everything else

- Answer letters: **25 A / 25 B / 25 C / 25 D**; no three consecutive identical letters.
- Passage length inside the measured bands of §1; **no hard item longer than any medium item's
  band ceiling.**
- Untested comma count: Easy ≤2 · Medium 2–3 · Hard ≥3 in at least 20 of 30.
- Topic lanes: natural science 30 · humanities & arts 22 · literature 16 · history & civics 16 ·
  social science 16.
- Named, role-introduced people in ~36 of 100. All invented. Globally diverse.
- A digit in ~47 of 100.
- At least 22 items key **∅ (no punctuation)** across the set — this is the family imitators
  under-write most severely.

---

## 8. Hard prohibitions

- No topic, person, organism, artwork, place, study, or phrasing reused from the official bank
  export (`src/official-passages-index.json`), from the official Practice Tests, or from this
  repo's Practice Tests 3–5. Proper nouns are checked programmatically against
  `src/official-proper-nouns.json` (709 entries).
- No real living people. No real named studies. Invented researchers and works only. Real
  countries, cities, and species are fine; real *individuals* are not.
- No item with two defensible answers under any mainstream style guide.
- No item solvable without parsing — if "where you'd pause" gets it right, rebuild the seam.
- No `NOT` stems, no "all of the above," no lettered prefixes inside option strings.
- Options carry only the seam text, never the surrounding passage.
- The em dash is written as `—` (U+2014) with no surrounding spaces in the option string, matching
  the official export's rendering after normalization.
