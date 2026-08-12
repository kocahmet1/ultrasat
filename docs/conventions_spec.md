# Digital SAT Reading & Writing — **Standard English Conventions** Style Specification
### Reverse-engineered from 300 official College Board Question Bank items + 6 official practice-test modules

---

## 0. Corpus, method, and a caveat

**Primary source.** The four `questionbank-export-2026-8-5__{4,5,6,7}_.txt` files were parsed programmatically (split on `\f` + `Question ID: <hex>`; metadata row split on runs of ≥2 spaces; sections `Question` / `Answer` / `Correct Answer:` / `Rationale`).

| | count |
|---|---|
| Total items in export (unique Question IDs) | **1,200** |
| Domain = *Information and Ideas* | 300 |
| Domain = *Craft and Structure* | 300 |
| Domain = *Expression of Ideas* | 300 |
| **Domain = *Standard English* (Conventions)** | **300** |
| &nbsp;&nbsp;— Skill = **Boundaries** | **150** (Easy 47 / Medium 35 / Hard 68) |
| &nbsp;&nbsp;— Skill = **Form, Structure, and Sense** | **150** (Easy 70 / Medium 33 / Hard 47) |

Every one of the 300 Conventions items parsed cleanly: 300/300 have four choices A–D, 300/300 have exactly one `______` blank, 300/300 have a stem, 300/300 have a rationale.

**Corroborating source.** Six official linear practice-test RW modules (Practice Tests 2, 3, 4, 5 — each module 33 questions). These overlap the Question Bank pool heavily (e.g. the Julia Alvarez / *In the Time of the Butterflies* item, the Peter Whibberley "leap second" item, and the Richard Serra item appear in both), which confirms the Question Bank is drawn from the same operational pool.

**Caveat on verbatim text.** The Question Bank PDF export floats curly apostrophes/quotes/em-dashes onto separate lines (2,471 such "float" lines across the export; `’` = 1,921 of them). A column-position reconstruction algorithm was applied. **223 of 300** Conventions items reconstruct perfectly (no residual whitespace anomaly anywhere in stimulus + choices + rationale); all verbatim quotations in this document are drawn from that clean subset unless explicitly marked `[sic — extraction artifact]`.

---

## 1. Rule inventory & frequency

### 1.1 BOUNDARIES — full taxonomy (n = 150)

Classification is grounded in College Board's **own** label. 251/300 rationales contain the sentence *"The convention being tested is ___."* and 7 more contain *"The conventions being tested are ___."*; the remaining 39 use a plainer explanatory style and were classified on rationale keywords (`nonessential`, `run-on`, `comma splice`, `complex list`, `independent clauses`, etc.).

| # | Rule | n | Easy | Med | Hard | % of Boundaries | % of all Conventions |
|---|---|---|---|---|---|---|---|
| B1 | **Supplementary element** — paired commas / dashes / parentheses; also single-boundary supplementary phrase | **41** | 6 | 16 | 19 | **27.3%** | 13.7% |
| B2 | **Sentence boundary** — period or semicolon between main clauses; comma splice, run-on, fragment; end-of-sentence punctuation | **32** | 12 | 2 | 18 | **21.3%** | 10.7% |
| B3 | **Coordination of main clauses** — comma + FANBOYS | **19** | 7 | 8 | 4 | **12.7%** | 6.3% |
| B4 | **Colon** — introducing a list, a name, or an explanation after a main clause | **16** | 4 | 2 | 10 | **10.7%** | 5.3% |
| B5 | **Series** — simple series commas; complex series with semicolons | **9** | 3 | 2 | 4 | 6.0% | 3.0% |
| B6 | **No punctuation: subject \| verb** | **7** | 2 | 2 | 3 | 4.7% | 2.3% |
| B7 | **No punctuation: preposition \| complement, noun \| PP, modifier \| noun** | **7** | 6 | 0 | 1 | 4.7% | 2.3% |
| B8 | **No punctuation: verb \| object / verb \| complement** | **5** | 4 | 1 | 0 | 3.3% | 1.7% |
| B9 | **Titles & proper nouns** (name+title; work titles) | **5** | 0 | 0 | 5 | 3.3% | 1.7% |
| B10 | **Relative clause** — integrated (restrictive) vs supplementary (nonrestrictive) | **4** | 1 | 1 | 2 | 2.7% | 1.3% |
| B11 | **Subordinate/dependent clause \| main clause** boundary | **3** | 2 | 1 | 0 | 2.0% | 1.0% |
| B12 | **Within / between coordinated noun phrases** | **2** | 0 | 0 | 2 | 1.3% | 0.7% |

**Consolidated "no-punctuation-needed" family (B6+B7+B8) = 19 items = 12.7% of Boundaries.** Counting by *answer* rather than by label, **40 of 150 Boundaries items (26.7%) have "no punctuation" as the correct answer** (Easy 19/47 = 40%, Medium 6/35 = 17%, Hard 15/68 = 22%).

Sub-breakdown of B2 by the punctuation the correct answer actually uses: **period 21, no-punctuation 5, comma 4, semicolon 2.** *The period, not the semicolon, is the default correct answer for a sentence-boundary item.*

### 1.2 FORM, STRUCTURE, AND SENSE — full taxonomy (n = 150)

| # | Rule | n | Easy | Med | Hard | % of FSS | % of all Conventions |
|---|---|---|---|---|---|---|---|
| F1 | **Subject–verb agreement** | **41** | 16 | 12 | 13 | **27.3%** | 13.7% |
| F2 | **Finite vs. non-finite verb form** (the "no main verb" / "-ing fragment" trap) | **41** | 21 | 5 | 15 | **27.3%** | 13.7% |
| F3 | **Verb tense / aspect sequencing** (incl. past perfect, conditional) | **24** | 20 | 3 | 1 | **16.0%** | 8.0% |
| F4 | **Subject–modifier placement** (dangling modifier) | **16** | 1 | 4 | 11 | **10.7%** | 5.3% |
| F5 | **Pronoun–antecedent agreement** | **13** | 7 | 3 | 3 | 8.7% | 4.3% |
| F6 | **Possessive determiners** (its / their / his / her; its vs it's) | **7** | 2 | 2 | 3 | 4.7% | 2.3% |
| F7 | **Plural vs. possessive vs. plural-possessive nouns** | **6** | 1 | 4 | 1 | 4.0% | 2.0% |
| F8 | **Determiners** (this / these / that / those / each / one) | **2** | 2 | 0 | 0 | 1.3% | 0.7% |

**F6 + F7 together = 13 items (8.7%) = "the apostrophe cluster."** Note: the word *apostrophe* **never appears** in any of the 300 rationales (0 occurrences). College Board always names these as *possessive noun*, *plural noun*, *plural possessive noun*, *possessive determiner*, or *contraction*.

### 1.3 Rules that are **absent** or vanishingly rare — do not write them

Measured across all 300 rationales:

| Rule commonly taught in prep books | occurrences |
|---|---|
| **Parallel structure** | **2** (and neither is a pure parallelism item — the word appears incidentally) |
| **Comparative / superlative forms** ("comparative", "superlative") | **0** |
| **Pronoun case** ("whom", "objective case/form", "subjective case/form") | **0** |
| **"There is / there are" expletive-subject agreement** | 0 items where this is the named rule |
| **Punctuation with quotations as a standalone rule** | 0 items labelled as such (quotation marks appear *inside* 49 stimuli, but the tested rule is always B1/B2/B4) |
| **Collective nouns / "each…every" as the named SVA hook** | 6 items contain `each/every/one of/neither` before the blank, but the rationale never names it as the rule |

**INFERRED:** the Digital SAT has narrowed Conventions to a compact, closed rule set. A new form should not contain parallelism, comparatives, or who/whom items.

### 1.4 Compound (two-rule) items

Rationales that say *"The conventions being tested **are** …"* = **7 / 300 (2.3%)**:
Boundaries — Medium 1, Hard 1. FSS — Easy 2, Medium 3, Hard 0.
The compound pairs observed are always: *possessive noun + possessive determiner*, *possessive determiner + plural noun*, *plural + possessive noun*, *verb forms + punctuation*, *subject–verb agreement + agreement between nouns*.
**Compound items are NOT how the SAT makes an item hard** (Hard has the fewest of them). Difficulty comes from syntactic distance, not from stacking rules.

---

## 2. The trap architecture

### 2.1 The master distinction: **punctuation-only** vs **wording-varies** items

| | Boundaries | Form/Structure/Sense |
|---|---|---|
| All four choices are the **same words**, differing **only in punctuation** | **91 / 150 (60.7%)** | **0 / 150 (0%)** |
| Wording varies across choices | 59 / 150 (39.3%) | 150 / 150 (100%) |

Punctuation-only share by difficulty (Boundaries): **Easy 22/47 (47%), Medium 25/35 (71%), Hard 44/68 (65%).**
Of the 91 punctuation-only items, **64 (70%)** have choices of ≤2 tokens each (`writers` / `writers,` / `writers —` / `writers;`).

**This is the single most important structural fact for an author.** Boundaries is *mostly* a "same words, four punctuations" format. Form/Structure/Sense **never** is — its choices always change a word (a verb form, a pronoun, an apostrophe, or an entire clause).

### 2.2 The standard 4-option punctuation shapes (Boundaries, n = 150)

Signature = the multiset of marks appearing in the four choices (`0` = no punctuation).

| Shape | n | Canonical realization |
|---|---|---|
| `{0, , : ;}` | 15 | `word` / `word,` / `word:` / `word;` |
| `{0, , : —}` | 14 | `word` / `word,` / `word:` / `word —` |
| `{. . 0 0}` | 12 | `word. The` / `word and the` / `word the` / `word, the`-type sets where two options carry a period |
| `{, . 0 ;}` | 12 | `word,` / `word. The` / `word` / `word;` |
| `{, , 0 0}` | 11 | `word, and` / `word and` / `word,` / `word` (the FANBOYS quartet) |
| `{, , , 0}` | 9 | three comma-bearing options + one bare |
| `{, . 0 0}` | 8 | |
| `{, 0 ; —}` | 5 | |
| `{, . : ;}` | 4 | `word,` / `word. The` / `word:` / `word;` |
| `{, 0 0 ;}` | 4 | |
| `{. 0 : ;}` | 4 | |
| `{, , ,; ,;}` | 3 | the **complex-series** signature (commas vs semicolons) |

**Four canonical "shapes" an author should reuse:**

1. **The single-mark ladder** — `X` / `X,` / `X;` / `X:` (or `X —` swapped for one of them). Tests: no-punctuation rules, colon, sentence boundary, supplementary element with a pre-existing partner mark.
2. **The FANBOYS quartet** — `X, but` / `X but` / `X,` / `X`. Tests coordination of main clauses. All four permutations of {comma present/absent} × {conjunction present/absent}. Appears 11× verbatim in this shape.
3. **The two-token boundary set** — `X. The` / `X: the` / `X; the` / `X, the`. Tests colon vs period vs semicolon vs comma splice, and forces the student to notice the capital letter.
4. **The complex-series set** — `X, Y,` / `X; Y,` / `X, Y;` / `X; Y;`. Tests semicolons in a series with internal commas.

**Distinct-mark diversity by difficulty (Boundaries):** Easy — 2 distinct marks in 22/47 items, 4 distinct in 20; Medium — 2 in 9/35, 4 in 21; **Hard — 3 distinct in 28/68 and 4 distinct in 26/68 (79% use 3–4 distinct marks).** Easy items are frequently binary in disguise (`{0, comma}` × 2 variants); Hard items force a genuine four-way discrimination.

### 2.3 Trap-by-trap catalogue, with verbatim evidence

---

#### TRAP A — "A plausible pause needs punctuation" (the illusion of the breath)

**What it catches:** students who punctuate where they would *pause aloud*. College Board deliberately places the blank exactly where a reader draws breath — after a long subject, after a verb, before a long complement — and makes **no punctuation** correct. 40/150 Boundaries items (26.7%) have "no punctuation" as the key. Across those 40, the distractor marks are: **comma 50×, colon 21×, semicolon 15×, period 14×, dash 13×**. The comma is *always* offered.

**Evidence 1 — subject/verb, long subject** (`960dec02`, Hard, key **C**):
> A recent study tracked the number of bee species present in twenty-seven New York apple orchards over a ten-year period. ______ found that when wild growth near an orchard was cleared, the number of different bee species visiting the orchard decreased.
> A) `Entomologist Heather Grab:`  B) `Entomologist, Heather Grab,`  C) `Entomologist Heather Grab`  D) `Entomologist Heather Grab,`
> Rationale: *"The convention being tested is punctuation use between a name and title and between a subject and a verb. No punctuation is needed between the proper noun "Heather Grab" and "entomologist," the title that describes Grab. Additionally, no punctuation is needed between the sentence's subject ("Entomologist Heather Grab") and the main verb ("found") that indicates what Grab did. … Choice B is incorrect because no punctuation is needed. **Setting the entomologist's name off with commas suggests that it could be removed without affecting the coherence of the sentence, which isn't the case.**"*

**Evidence 2 — verb/preposition** (`cdbbbf94`, Medium, key **D**):
> …an extra "leap second" (the 86,401st second of the day) is ______ time based on the planet's rotation lags a full nine-tenths of a second behind time kept by precise atomic clocks.
> A) `added, whenever`  B) `added; whenever`  C) `added. Whenever`  D) `added whenever`
> Rationale: *"The convention being tested is punctuation between a verb and a preposition. When, as in this case, a verb ("is added") is immediately followed by a preposition ("whenever"), no punctuation is needed. Choice A is incorrect because no punctuation is needed between the verb and the preposition. Choice B is incorrect because no punctuation is needed between the verb and the preposition. Choice C is incorrect because no punctuation is needed between the verb and the preposition."*

**Evidence 3 — verb/object** (`96499989`, Easy, key **A**):
> A) `appreciate the`  B) `appreciate. The`  C) `appreciate, the`  D) `appreciate: the`
> Rationale: *"The convention being tested here is punctuation between a verb and object. No punctuation is needed between the verb ("appreciate") and its object ("the multiple references…"). The object helps complete the idea of the verb…"*

**Authoring rule:** when the key is "no punctuation," the three distractors are `,` plus two of `{; : . —}`, and **the rationale is a near-verbatim triple repetition of the same sentence.** Never justify the distractors differently in this trap type.

---

#### TRAP B — The mismatched supplementary-element boundary

**What it catches:** students who evaluate the blank locally and never scan for the *partner* mark. College Board plants **one** boundary marker (a dash, a comma, or an open parenthesis) elsewhere in the sentence and requires the student to match it.

**19 of the 41 B1 items (46%) already contain an opening boundary marker in the text before the blank.** Distribution of key by what's already in the stimulus:
- dash already in stimulus → **dash** is the key: 9 items
- dash already in stimulus → **comma** is the key (the pre-existing dash is *not* part of the supplement): 5 items
- parenthesis in stimulus → close-paren / comma is the key: 5 items
- no partner mark, ordinary appositive → **comma** is the key: 20 items

**Evidence** (`7f226b4b`, Medium, key **D**) — the definitive mismatch item:
> …the plant's ______ the cellular organs that generate energy from light — reshuffled to form a tightly packed, glass-like surface ideal for collecting more light. `[sic — em-dash position is an extraction artifact]`
> A) `chloroplasts`  B) `chloroplasts;`  C) `chloroplasts,`  D) `chloroplasts —`
> Rationale: *"The convention being tested is the punctuation of a supplementary element within a sentence. **The dash after "chloroplasts" pairs with the dash after "from light"** to separate the supplementary element "the cellular organs that generate energy from light" from the rest of the sentence. This supplementary element functions to define the term "chloroplasts," and the pair of dashes indicates that this element could be removed without affecting the grammatical coherence of the sentence. Choice A is incorrect because it fails to use appropriate punctuation to separate the supplementary element from the rest of the sentence. **Choice B is incorrect because a semicolon can't be paired with a dash in this way** to separate the supplementary element from the rest of the sentence. **Choice C is incorrect because a comma can't be paired with a dash in this way**…"*

**Evidence** (`a3e87535`, Medium, key **C**) — comma partner, and note the conjunction decoy:
> Julia Alvarez's 1994 novel *In the Time of the Butterflies*, a fictionalized account of the lives of the Mirabal ______ can serve as a starting point for those wanting to explore how the rule of dictator Rafael Trujillo has been represented in Dominican American literature.
> A) `sisters, and`  B) `sisters and`  C) `sisters,`  D) `sisters`
> Rationale: *"…**The comma after "sisters" pairs with the comma after "Butterflies"** to separate the supplementary element "a fictionalized account of the lives of the Mirabal sisters" from the rest of the sentence. … the pair of commas indicates that this element could be removed without affecting the grammatical coherence of the sentence."*

**Evidence** (`1aa3f174`, Medium, key **A**) — parenthesis partner:
> …Teotihuacan housed its residents (as many as 200,000, by some ______ in a complex of comfortable apartments of comparable size.
> A) `estimates)`  B) `estimates),`  C) `estimates —`  D) `estimates`
> Rationale: *"…This choice correctly completes the parenthetical element "as many as 200,000, by some estimates" with a closing parenthesis, pairing with the opening parenthesis that appears earlier in the sentence."*

**Authoring rule:** offer the *correct-pairing* mark, the *wrong-pairing* mark, one non-pairing mark (`;`), and the bare form. The rationale sentence is templated: **"a [X] can't be paired with a [Y] in this way."**

---

#### TRAP C — Hiding subject–verb agreement behind distance

**Measured subject→blank distance** (words between the head noun named in the rationale and the blank; 34 SVA items measurable):

| Difficulty | n | median | mean | max | full distribution |
|---|---|---|---|---|---|
| Easy | 14 | **1.0** | 1.9 | 7 | 0,0,0,0,0,0,1,1,1,4,4,4,5,7 |
| Medium | 8 | **3.5** | 5.1 | 13 | 0,1,1,2,5,7,12,13 |
| **Hard** | 12 | **14.0** | 14.3 | **28** | 4,5,9,9,9,11,17,19,20,20,21,28 |
| All | 34 | 4.5 | 7.1 | 28 | |

**Threshold: distance ≤ 2 words ⇒ Easy; 3–12 ⇒ Medium; ≥ 13 ⇒ Hard.**

**What fills the gap** (categories of intervening material, 41 SVA items):
appositive / dash-supplement **19**, relative clause **11**, prepositional phrase **9**, `each/every/one of/none of` **6**, adjacent-no-gap **10**. (Categories overlap.)

**The attractor:** in **17 of 37 measurable SVA items (46%)**, the noun *immediately adjacent to the blank* has the **opposite** number from the true subject.

**Evidence — the 28-word gap** (`ea0aa676`, Hard, key **D**):
> In the 1970s, Janaki Ammal, a prominent botanist, emerged as a powerful voice in India's environmental conservation movement. **Her exhaustive chromosomal survey** of plants in Silent Valley, a pristine tropical forest in Kerala, India, that is home to nearly 1,000 species of native flora (many of which are endangered), ______ instrumental in the government's decision to preserve the forest.
> A) `are`  B) `were`  C) `have been`  D) `was`
> Rationale: *"Choice D is the best answer. The subject "survey" is singular, and so is the verb "was." Choice A is incorrect. The subject "survey" is singular, but the verb "are" is plural. Choice B is incorrect. The subject "survey" is singular, but the verb "were" is plural. Choice C is incorrect. The subject "survey" is singular, but the verb "have been" is plural."*
> Note the stacking: *survey* (sing.) → PP `of plants` (pl. attractor) → appositive `a pristine tropical forest` → relative clause `that is home to nearly 1,000 species` (pl. attractor) → parenthetical `(many of which are endangered)` (pl. attractor). **Three plural attractors, one singular head.**

**Evidence — 21 words, coordinated abstract subject** (`b0fb36ad`, Hard, key **A**):
> **The question** of what cross-cultural traits distinguish these distinct modes, and secondarily what pressures led humans to develop them in the first place, ______ neuropsychologist Daniela Sammler's 2024 study…
> A) `animates`  B) `have animated`  C) `animate`  D) `animating`
> (Note the fourth option is a **non-finite** decoy — see Trap E.)

**Evidence — 20 words, present participle supplement** (`9994ae0d`, Hard, key **A**):
> **Barrada's pieces**, utilizing elements as disparate as plant-dyed fabrics, wire crab traps filled with stones, and cotton balls dangling above a fan, ______ the ways humans attempt to organize and regulate nature.
> A) `explore`  B) `has explored`  C) `explores`  D) `exploring`

**Evidence — Easy, zero distance** (`e38b3e4f`, Easy, key **A**):
> The **radiation** that ______ during the decay of radioactive atomic nuclei is known as gamma radiation.
> A) `occurs`  B) `have occurred`  C) `occur`  D) `are occurring`

**Standard SVA option shape:** 1 correct + **3 options of the wrong number** (in **29 of 41** items the rationale dismisses exactly three choices as number-mismatches). The three wrong options are typically {bare plural/singular present, `have/has` + participle, `are/is` + `-ing`} — i.e. tense and aspect are varied purely as camouflage, never as a second tested rule.

---

#### TRAP D — Comma splice / run-on / fragment (the four-way sentence-boundary quartet)

Every B2 and B3 rationale uses a fixed three-way dismissal vocabulary: **"results in a comma splice"**, **"results in a run-on sentence. The two main clauses are fused without punctuation and/or a conjunction"**, **"results in a rhetorically unacceptable sentence fragment beginning with '___'"**.

**Evidence** (`148be4da`, Easy, key **D**) — the pure FANBOYS quartet:
> Human-made (synthetic) fibers used in clothes and many other consumer products are more durable than most natural plant ______ the manufacture of synthetic fibers requires toxic chemical solvents that can pollute air and water.
> A) `fibers,`  B) `fibers but`  C) `fibers`  D) `fibers, but`
> Rationale: *"…This choice correctly uses a comma and the coordinating conjunction "but" to join the first main clause ("Human-made...fibers") and the second main clause ("the manufacture...water"). **Choice A is incorrect because it results in a comma splice. Without a conjunction following it, a comma can't be used in this way to join two main clauses. Choice B is incorrect because when coordinating two longer main clauses such as these, it's conventional to use a comma before the coordinating conjunction. Choice C is incorrect because it results in a run-on sentence. The two main clauses are fused without punctuation and/or a conjunction.**"*

The same three sentences recur verbatim across the corpus with only the clause names swapped — see `155239cf` (Easy, key B) and `89fbc3eb` (Medium, key C, where the key is a **semicolon** and the FANBOYS option becomes the distractor: *"When coordinating two longer main clauses such as these, it's conventional to use a comma before the coordinating conjunction."*).

**Evidence** (`940ff6f7`, Hard, key **C**) — period is correct, and the trap is that the second "sentence" *looks* like a modifier:
> Jamaican British artist Willard Wigan is known for his remarkable ______ so small that they are best viewed through a microscope, Wigan's sculptures are made from tiny natural materials, such as spiderweb strands.
> A) `microsculptures creations`  B) `microsculptures, creations`  C) `microsculptures. Creations`  D) `microsculptures and creations`
> Rationale: *"…the period is used to correctly mark the boundary between one sentence ("Jamaican…microsculptures") and another ("Creations…strands"). The noun phrase beginning with "creations" modifies the subject of the next sentence, "Wigan's sculptures." Choice A is incorrect because it results in a run-on sentence… Choice B is incorrect because it results in a comma splice… Choice D is incorrect. Without a comma preceding it, the conjunction "and" can't be used in this way to join sentences."*

---

#### TRAP E — Finite vs. non-finite ("this sentence has no main verb")

41 items (27.3% of FSS). The trap: a stimulus whose main clause is left verbless, with an attractive `-ing` participle offered; **or** the mirror image, a stimulus that already has a main verb, where a *finite* verb would create a fused sentence.

**Option archetypes** (composition of the four choices by verb form):

| Composition | n |
|---|---|
| 1 `-ing` participle + 3 finite | 6 |
| 1 `-ing` + 1 finite + 1 `having/being` + 1 `to`-infinitive | 6 |
| 1 `-ing` + 1 finite-aux + 2 finite | 6 |
| 1 `-ing` + 2 finite + 1 `to`-infinitive | 4 |
| 1 `-ing` + 1 finite-aux + 1 finite + 1 `to`-infinitive | 3 |
| 2 `-ing` + 2 others | 6 |

**Every** F2 item contains at least one `-ing` participle option; most contain a `to`-infinitive and/or `having`/`being`.

**Evidence — direction 1: non-finite is correct** (`3a1239d2`, Hard, key **B**):
> …In a recent study, scientists ______ for evidence of self-awareness in snakes, species that rely primarily on olfactory rather than visual processing, **adapted** the test to foreground smell, modifying the scent trails of North American eastern garter snakes and African ball pythons.
> A) `searched`  B) `searching`  C) `were searching`  D) `have searched`
> Rationale: *"…The nonfinite present participle "searching" is correctly used to form a supplementary element that modifies the subject "scientists"… Choice A is incorrect because it results in an ungrammatical sentence. The finite past tense verb "searched" can't be used in this way to form a supplementary element…"*
> **The real main verb ("adapted") is buried 14 words downstream, after a 9-word appositive.**

**Evidence — direction 2, plus the comma decoy** (`a2816c7f`, Hard, key **C**):
> American abstract artist Richard ______ his installations to make passersby keenly aware of how one's movements are affected by the physical features of one's environment, **assembles** large-scale steel plates into sculptures that dominate the outdoor spaces they occupy.
> A) `Serra is intending`  B) `Serra, intends`  C) `Serra, intending`  D) `Serra intends`
> Rationale: *"…This choice pairs the comma after "Serra" with the comma after "environment" and uses the nonfinite present participle "intending" to correctly form a supplementary phrase describing the reaction Serra intends his sculptures to provoke. This supplementary phrase appears between the noun phrase that it modifies ("American abstract artist Richard Serra") and the finite present tense verb ("assembles"), which functions as the sentence's main verb…"*
> **This is Trap B and Trap E fused in one item — the student must both match a comma boundary and choose a non-finite form.**

**Evidence — direction 3: finite is required inside a relative clause** (`36e89f74`, Easy, key **C**):
> A) `resulting`  B) `were resulting`  C) `results`  D) `to result`
> Rationale: *"…**Relative clauses, such as the one beginning with "that," require a finite (tensed) verb, a verb that can function as the main verb of a clause.** This choice correctly supplies the clause with the finite present tense verb "results"…"*

**Standard rationale sentence for the main-clause version:** *"A main clause requires a finite (tensed) verb to perform the action of the subject (in this case, ___), and this choice supplies the finite [past/present] tense verb "___"…"* (verbatim in `e6f2dba6`, `35ae047d`, `4320b4ad`).

---

#### TRAP F — Dangling modifier (subject–modifier placement)

16 items; **Hard 11 / Medium 4 / Easy 1** — the most difficulty-skewed rule in the whole domain. Always a **wording-varies** item: all four options are full clause-openings of 6–14 words.

**Evidence** (`dab8b8ee`, Hard, key **C**):
> Known as Earth's "living skin," biocrusts are thin layers of soil held together by surface-dwelling microorganisms such as fungi, lichens, and cyanobacteria. Fortifying soil in arid ecosystems against erosion, ______
> A) `a recent study's estimate is that these crusts reduce global dust emissions by 60 percent each year.`
> B) `an estimated 60 percent reduction in global dust emissions each year is due to these crusts, according to a recent study.`
> C) `these crusts reduce global dust emissions by an estimated 60 percent each year, according to a recent study.`
> D) `a recent study has estimated that these crusts reduce global dust emissions by 60 percent each year.`
> Rationale: *"…The subject of the modifier "fortifying soil in arid ecosystems against erosion" is "biocrusts." **Subject-modifier placement requires a modifier and its subject to be next to each other**, so "biocrusts" or some variant meaning "biocrusts" (in this case, "these crusts") must begin the missing clause. Choice A is incorrect. Modifiers and their subjects must go next to each other. The subject of the modifier … is "biocrusts," **not "a recent study's estimate."**"*

**Distractor engineering:** every wrong option opens with a noun phrase that is *semantically related* to the true subject but grammatically distinct — a **nominalization of it** (`a recent study's estimate`, `an estimated 60 percent reduction`, `Kurosawa's use of Western literary sources`, `the argument researcher Robert Losey has made`), an **existential `there was`**, or a **passive** with the true subject demoted to a `by`-phrase. Note **choice D of `dab8b8ee` is perfectly grammatical English in isolation** — it is wrong only because the modifier's subject is "biocrusts," not "a recent study."

**Evidence** (`f0864217`, Hard, key **A**) — the same architecture:
> A) `Rabinal Achí tells the story of K'iche' Achí, a military leader who`  B) `K'iche' Achí, the military leader in the story of Rabinal Achí,`  C) `the military leader whose story is told in Rabinal Achí, K'iche' Achí,`  D) `there was a military leader, K'iche' Achí, who in Rabinal Achí`
> Rationale: *"The modifier "Based on events…by a king," is describing the drama "Rabinal Achí." **Modifiers need to be next to the subjects they describe, so "Rabinal Achí" needs to be the first word after the comma.**"*

---

#### TRAP G — The apostrophe grid (possessive determiner × plural/possessive noun)

13 items. The four options are the **2×2 grid** over two independent apostrophe decisions.

**Evidence** (`b7363ba2`, Easy, key **A**):
> …the wind from a butterfly flapping ______ in Brazil might eventually grow into a storm elsewhere across the globe.
> A) `its wings`  B) `its wings'`  C) `it's wing's`  D) `it's wings'`
> Rationale: *"The conventions being tested are the use of possessive determiners and plural nouns. The singular possessive determiner "its" and the plural noun "wings" correctly indicate that the butterfly has multiple wings. Choice B is incorrect because the context requires the plural noun "wings," not the plural possessive noun "wings'." Choice C is incorrect because the context requires the singular possessive determiner "its" and the plural noun "wings," not the contraction "it's" and the singular possessive noun "wing's."…"*

**Evidence** (`20ea68b7`, Medium, key **A**):
> …the Twenty-Second Amendment, which limits the number of ______ can serve, was first proposed in 1947…
> A) `terms presidents`  B) `term's presidents`  C) `term's president's`  D) `terms president's`

**Evidence** (`4c335aea`, Hard, key **B**) — coordinated possessives:
> A) `rocks and raps`  B) `rock's and rap's`  C) `rocks and rap's`  D) `rock and rap's`

**Authoring rule:** pick two nouns near the blank; cross {plural, singular-possessive, plural-possessive} on each; the four options must be the four corners of a genuine 2×2. Dismissal template: *"the context requires the [X] "___," not the [Y] "___.""*

---

#### TRAP H — Tense sequencing against an anchor verb in the *previous sentence*

24 items, and **20 of them are Easy** — this is the SAT's easiest rule. Almost always a 2-sentence stimulus where sentence 1 supplies the tense anchor.

**Option archetype:** one simple present, one simple past or past perfect, one future/future-perfect, one progressive. Verbatim option sets:
`measures / had measured / would have measured / will have been measuring`
`studies / has been studying / will study / was studying`
`includes / included / will have included / had included`
`is vowing / vowed / will vow / vows`
`has doubled / had doubled / doubles / will double`

**Evidence** (`3580533b`, Easy, key **A**):
> In recent years, economists around the world have created new tools that quantify the overall well-being of a country's citizens. Economists in India, for example, **use** an Ease of Living Index. This tool ______ economic potential, sustainability, and citizens' quality of life.
> Rationale: *"…The previous sentence tells us how economists in India "use" a certain tool, while this sentence describes general facts about that tool. To express general facts (**and also to match the simple present tense of "use"**), we should use the simple present tense form "measures." Choice B is incorrect. This choice uses the past perfect tense, but the previous sentence tells us that the tool is currently used…"*

**Evidence** (`1ee7b429`, Medium, key **D**) — the only sub-type where difficulty rises: two past events in relation to each other:
> Bonnie Buratti of NASA's Jet Propulsion Laboratory ______ data about Saturn's rings collected by the Cassini spacecraft **when she made** an interesting discovery…
> A) `studies`  B) `has been studying`  C) `will study`  D) `was studying`
> Rationale: *"…the past progressive tense verb "was studying" is consistent with the other past tense verbs (e.g., "made" and "collected")… Further, the past progressive tense correctly indicates that **an ongoing action in the past was occurring (she was studying) at the same time that another event occurred in the past** (she made an interesting discovery)."*

---

## 3. Difficulty calibration — measured thresholds

### 3.1 The three levers, in order of effect size

| Lever | Easy | Medium | Hard |
|---|---|---|---|
| **Subject→verb distance** (SVA items, words) | median **1** | median **3.5** | median **14** |
| **Blank-sentence length** (words in the sentence containing the blank) — Boundaries | median **22** | median **33** | median **37.5** |
| **Blank-sentence length** — FSS | median **21.5** | median **26** | median **31** |
| **Commas in stimulus** — Boundaries | 2.04 | 2.57 | **3.24** |
| **Commas in stimulus** — FSS | 2.39 | 2.55 | **3.23** |
| **Words ≥ 9 letters in stimulus** — Boundaries | 5.0 | 6.7 | **7.4** |
| **Words ≥ 9 letters in stimulus** — FSS | 5.4 | 6.4 | **7.2** |
| **Prepositions in stimulus** — Boundaries | 4.87 | 6.49 | 6.16 |
| **Em dashes in stimulus** — FSS | 0.17 | 0.36 | **0.51** |
| **Total stimulus words** — Boundaries | mean **37.5** (med 38) | mean 47.8 (med 47) | mean **47.1** (med 49) |
| **Total stimulus words** — FSS | mean **39.4** (med 40) | mean 43.5 (med 45) | mean **44.4** (med 47) |
| **# distinct punctuation marks across the 4 options** (Boundaries) | 2 in 47% of items | 4 in 60% | **3–4 in 79%** |
| **Compound (two-rule) items** | 2/117 | 4/68 | **1/115** |

### 3.2 Concrete authoring thresholds

**To write EASY:**
- Stimulus **30–45 words**, ≤ 2 sentences, blank-sentence ≤ 25 words, ≤ 2 commas.
- Subject and verb **adjacent or ≤ 2 words apart**. No appositive between them.
- Options span only **2 distinct punctuation marks** (e.g. `{0, comma}` in two arrangements), or a 4-option verb-tense ladder with a same-sentence/previous-sentence anchor.
- Prefer rules F3 (tense, 20/24 are Easy), F2 (finite/non-finite, 21/41 Easy), B7/B8 (no-punct after preposition/verb, 10/12 Easy).
- ~40% of Easy Boundaries items have "no punctuation" as the key.

**To write MEDIUM:**
- Stimulus **40–55 words**, blank-sentence 25–35 words, 2–3 commas.
- Subject→verb distance **3–12 words**, filled with one prepositional phrase or one short appositive.
- Options span **4 distinct marks** (Medium is where the full `{0 , : ;}` and `{0 , : —}` ladders concentrate: 21/35 Medium items use 4 distinct marks).
- Highest punctuation-only rate (71%) — Medium is "the same four words, four punctuations, and you must reason."

**To write HARD:**
- Stimulus **45–60 words**, blank-sentence **35–50 words**, **≥ 3 commas**, ≥ 7 words of ≥ 9 letters.
- Subject→verb distance **≥ 13 words**, with **2–3 stacked attractors** of the opposite number (PP + relative clause + parenthetical).
- Put the **partner boundary mark** ≥ 8 words away from the blank so the student must scan.
- Use 3–4 distinct punctuation marks, and make **two** of the distractors defensible under a different (wrong) parse of the sentence.
- Prefer rules B1 (19/41 Hard), B2 (18/32), B4 (10/16), F4 (11/16), F2 (15/41).
- **Do not** make it hard by adding a second rule. Only 1 of 115 Hard items is compound.
- **Do not** make it hard by lengthening the whole stimulus much — Hard is only ~10 words longer than Easy. Lengthen the *blank sentence*, not the passage.

### 3.3 Register
Stimulus vocabulary is deliberately academic: **mean 5.0 (Easy) → 7.4 (Hard) words of ≥ 9 letters per stimulus**, i.e. roughly 13–16% of tokens. Mean **28.8 words per sentence** (median 26). Domain terminology is always glossed in-line (`biocrusts`, `pašrūtum ("unwinding")`, `Bose-Einstein condensate`, `the vest frottoir`, `frisson (a physiological response akin to goosebumps…)`), which is itself the excuse for appositives — and appositives are the raw material of Boundaries.

---

## 4. Stimulus anatomy

### 4.1 Word counts

| Metric | Boundaries (n=150) | Form/Structure/Sense (n=150) |
|---|---|---|
| Words — min | 19 | 8 |
| Words — 25th pct | 38 | 34 |
| **Words — median** | **45.5** | **43.0** |
| Words — mean | 44.3 | 41.9 |
| Words — 75th pct | 52 | 51 |
| Words — 90th pct | 57 | 57 |
| Words — max | 65 | 75 |

**Target band: 34–52 words. 50% of all Conventions stimuli fall in 35–52 words. Never below 19 (Boundaries) and essentially never above 60.**

### 4.2 Sentence counts and the position of the blank

| | Boundaries | FSS |
|---|---|---|
| 1 sentence | **68 (45%)** | **58 (39%)** |
| 2 sentences | 72 (48%) | 75 (50%) |
| 3 sentences | 9 (6%) | 15 (10%) |
| 4 sentences | 1 | 2 |
| mean sentences | 1.6 | 1.7 |

**The blank is in the FINAL sentence in 138/150 Boundaries items (92%) and 138/150 FSS items (92%).**
Exact joint distribution `(n sentences, sentence containing blank)`:
- Boundaries: (1,1)=68, (2,2)=64, (2,1)=8, (3,3)=5, (3,2)=3, (3,1)=1, (4,4)=1
- FSS: (1,1)=58, (2,2)=69, (2,1)=6, (3,3)=10, (3,2)=4, (3,1)=1, (4,4)=1, (4,3)=1

**Only 8/150 (B) and 6/150 (FSS) items place the blank in a non-final sentence with full sentences after it.** When that happens it is because the item tests *end-of-sentence punctuation* (`4b0c7b62`, `a7c85001`) and the following sentence is needed to prove the blanked clause is declarative, not interrogative.

### 4.3 Context before vs. after the blank

| Metric | Boundaries | FSS |
|---|---|---|
| Words **before** blank — median (mean) | 26 (26.1) | 28 (27.5) |
| Words **after** blank — median (mean) | 17 (18.2) | 13 (14.4) |
| **Blank position as % of stimulus — median** | **58.7%** | **68.3%** |
| Blank position — 25th / 75th pct | 42.9% / 73.9% | 50.0% / 83.7% |
| Blank at very end (100%) | 5 items | 12 items |
| Words in the blank's own sentence — median | **32** | **25** |

**Rule of thumb: put the blank about 60% (Boundaries) / 68% (FSS) of the way through the stimulus, with ~26 words of run-up and ~13–17 words of follow-through.** Boundaries needs more text *after* the blank because the second half of a supplementary element, the second main clause, or the rest of the series must be visible.

### 4.4 Standalone blurb vs. mini-paragraph

- **126/300 (42%)** are a single sentence.
- **98/300 (33%)** are a single sentence that contains a full proper name — the classic "fact blurb about a named researcher / artist / place."
- **231/300 (77%)** contain at least one full two-word proper name anywhere; **180/300 (60%)** have one in the first 14 words.
- **147/300 (49%)** are 2-sentence mini-paragraphs, where sentence 1 is background/definition and sentence 2 carries the blank.
- **110/300 (37%)** contain a 4-digit year; **47/300 (16%)** contain a parenthetical; **57/300 (19%)** contain an em dash; **49/300 (16%)** contain quotation marks.

---

## 5. Prose voice

### 5.1 Register profile

- **Sentence length:** mean 28.8 words, median 26. Long sentences, one idea, heavily right-branching.
- **Appositives everywhere.** The appositive is the workhorse: it supplies the gloss for jargon *and* the grammar being tested. Mean 2.0 (Easy) → 3.2 (Hard) commas per stimulus.
- **Openers.** Three recurring frames:
  1. `[Nationality/ethnic adjective] [profession] [Full Name] [verb]…` — e.g. "Jamaican British artist Willard Wigan is known for…"; "American abstract artist Richard Serra…"; "Ghanaian artist Ed Franklin Gavua creates…". A profession word appears within the first few words in 16/300 items; a full proper name appears in the first 14 words in 180/300.
  2. `In [year], [Name] [verb]…` / `In her [year] book *Title*, [Name]…`
  3. A definitional first sentence: "The algaita is a double reed wind instrument from West Africa."; "Cycads are palmlike plants with cones."; "Zydeco music originated in the French Creole community of southwest Louisiana."
- **Dates and parentheticals.** Years appear bare (`In 1929, Edwin Herbert Land invented…`), in parentheses after a title (`*The Tale of Peter Rabbit* (1902)`), as en-dash ranges after a name (`Marie-Denise Villers (1774–1821)`), or as era spans (`from roughly 270 to 232 BCE`, `(66 to 252 million years ago)`). Parentheses also carry glosses (`(Rana sylvatica)`, `(the 86,401st second of the day)`, `(13C)`).
- **Subject matter mix** (keyword-density classification, n = 300):

| Bucket | n | share |
|---|---|---|
| Literature & the arts (novels, poetry, painting, film, music, dance, quilts, sculpture) | 102 | **34%** |
| Natural science (biology, chemistry, physics, astronomy, geology, ecology) | 75 | **25%** |
| Social science & history (economics, archaeology, linguistics, government, sociology) | 47 | **16%** |
| Technology & engineering | 13 | 4% |
| Other / mixed (philosophy, food, sport, general-interest) | 63 | 21% |

- **Names and provenance.** 83 nationality/ethnicity descriptors across 45 items; most frequent: Japanese 10, African American 9, French 7, British 5, Indian 5, Hawaiian 5, then Mexican / Swedish / Jamaican / Nigerian / Spanish / Chinese American / Chinese (3 each). **26 stimuli contain a diacritic-bearing name** (Tranströmer, Ren é Descartes, Rabinal Achí / K'iche' Achí, Lê Lương Minh, Jardim Botânico, pašrūtum, Yiiiiikakaii, Pi'ilanihale Heiau). Non-Anglo names are deliberate and frequent; the SAT will not write four Anglo-named items in a row.
- **Opinion is avoided.** Only **10/300 (3%)** contain any of `I / we / our / my / should / must / ought`, and in those the word is inside a quotation or a modal of physical necessity. The voice is third-person expository, attributive ("According to linguist Martin Joos…", "Researcher Po Peng…"). Evaluative claims are always attributed to a named scholar.
- **Tense.** 150/300 contain a present-tense auxiliary, 85/300 a past-tense auxiliary. Definitional/scientific stimuli are present tense; biographical/historical stimuli are past tense; the two are mixed only when the item *is* a tense item.

### 5.2 Eight verbatim stimuli that typify the voice

1. *(Boundaries, Easy — definitional, 2 sentences)* — **`4b0c7b62`**
   > The algaita is a double reed wind instrument from West Africa. The reed of a wind instrument is the mouthpiece ______ A double reed contains two pieces of cane that vibrate and produce sound as air passes between them.

2. *(Boundaries, Hard — literary, appositive-dense, non-Anglo names)* — **`adf210e7`**
   > The haiku-like poems of Tomas Tranströmer, which present nature- and dream-influenced images in crisp, spare language, have earned the Swedish poet praise from leading contemporary ______ them Nigerian American essayist and novelist Teju Cole, who has written that Tranströmer's works "contain a luminous simplicity."

3. *(Boundaries, Hard — the "Named artist (nationality) is known for X" frame)* — **`940ff6f7`**
   > Jamaican British artist Willard Wigan is known for his remarkable ______ so small that they are best viewed through a microscope, Wigan's sculptures are made from tiny natural materials, such as spiderweb strands.

4. *(Boundaries, Easy — history, list, era dates)* — **`6fece68e`**
   > Emperor Ashoka ruled the Maurya Empire in South Asia from roughly 270 to 232 BCE. He is known for enforcing a moral code called the Law of Piety, which established the sanctity of animal ______ the just treatment of the elderly, and the abolition of the slave trade.

5. *(Boundaries, Easy — science, "By [gerund], [team] discovered…")* — **`155239cf`**
   > By analyzing ice cores from Greenland and Antarctica, a research team at Sweden's Lund University discovered evidence of a solar storm that occurred 9,200 years ago. Scientists had previously thought the Sun to be in a relatively "quiet" phase at that ______ the Lund team's finding suggests otherwise.

6. *(FSS, Hard — social science, deeply embedded subject)* — **`ea0aa676`**
   > In the 1970s, Janaki Ammal, a prominent botanist, emerged as a powerful voice in India's environmental conservation movement. Her exhaustive chromosomal survey of plants in Silent Valley, a pristine tropical forest in Kerala, India, that is home to nearly 1,000 species of native flora (many of which are endangered), ______ instrumental in the government's decision to preserve the forest.

7. *(FSS, Easy — biography with a year anchor)* — **`35ae047d`**
   > In 1929, Edwin Herbert Land invented a polarizing filter that was featured in a number of products, from sunglasses to 3D movies. A decade later, Land ______ his technology to invent the world's first instant camera, the Polaroid Land camera.

8. *(FSS, Easy — arts, sensory, present tense)* — **`db4e3819`**
   > Midway through her 1968 jazz album *A Monastic Trio*, Alice Coltrane switches instruments, swapping the piano for the harp. With the same fluid style that Coltrane was famous for on piano, she ______ her fingers across the harp strings and creates a radiant sound.

*(Bonus, for the "objects/list" and "philosophy" flavours: `d47bb0a4` — "Objects ranging from the Kikkoman soy sauce bottle to the Yamaha VMAX motorcycle to the Komachi bullet train ______ designed by twentieth-century industrial designer Kenji Ekuan."; `0aebdf5f` — "According to linguist Martin Joos, speakers of the English language ______ five main registers — frozen, formal, consultative, casual, and intimate — which they rotate between depending on the situation.")*

---

## 6. Question stem wording

**There is exactly ONE stem. It has no variants.**

> **Which choice completes the text so that it conforms to the conventions of Standard English?**

- **300 / 300** Question Bank Conventions items (the single apparent "variant" — `…Standard" "English?` — is a PDF quote-float artifact of the same string).
- **302 occurrences** across the six practice-test modules, again with no variation.
- For contrast, the neighbouring domains use: *"Which choice completes the text with the most logical transition?"* (158 occurrences) and *"Which choice completes the text with the most logical and precise word or phrase?"* (142). Conventions never borrows either.
- The stem always follows the stimulus on its own line, and choices are labelled `A.` `B.` `C.` `D.` in the Question Bank export / `A)` `B)` `C)` `D)` on the printed tests.
- **Key distribution across the 300 items: D 94 (31%), C 73 (24%), A 70 (23%), B 63 (21%).** Slight D-heaviness; treat as ~uniform.

---

## 7. Rationale style — the formula

### 7.1 Structure

**Sentence 1 (100% invariant):** `Choice [X] is the best answer.`
- 300/300 items use exactly `is the best answer` — never "is correct."

**Sentence 2 (84% of items): the rule is named explicitly.**
- `The convention being tested is ___.` — **251/300 (83.7%)**
- `The conventions being tested are ___ and ___.` — **7/300 (2.3%)**
- No rule-naming sentence (plainer style) — **39/300 (13%)**; these open instead with a direct observation: *"Notice that "the sanctity of animal life" is the first item in a list of three things."* / *"The subject "survey" is singular, and so is the verb "was.""* / *"The modifier "Based on events…by a king," is describing the drama "Rabinal Achí.""*
- The 70 distinct rule names actually used, most frequent first: `subject-verb agreement` (34), `the use of verb forms within a sentence` (23), `the use of punctuation within a sentence` (21), `the coordination of main clauses within a sentence` (13), `subject-modifier placement` (13), `punctuation use between sentences` (13), `end-of-sentence punctuation` (10), `the use of verbs to express tense in a sentence` (10), `the punctuation of a supplementary element within a sentence` (8), `the use of verbs to express tense` (8), `pronoun-antecedent agreement` (7).

**Sentence 3–4: the positive explanation.** Names the grammatical roles and quotes the spans.
Templates observed verbatim:
- *"The [singular/plural] verb "___" agrees in number with the [singular/plural] subject "___.""*
- *"The [comma/dash] after "___" pairs with the [comma/dash] after "___" to separate the supplementary element "___" from the rest of the sentence."*
- *"This choice correctly uses a comma and the coordinating conjunction "___" to join the first main clause ("___") and the second main clause ("___")."*
- *"A main clause requires a finite (tensed) verb to perform the action of the subject (in this case, "___"), and this choice supplies the finite [past/present] tense verb "___"…"*
- *"…the colon is used in a conventional way to introduce…"*
- Frequent closer for supplementary elements: *"…indicates that this element could be removed without affecting the grammatical coherence of the sentence."*

**Then exactly three dismissals, always in A→B→C→D order, skipping the key.**
- `Choice [X] is incorrect because …` — **720 occurrences**
- `Choice [X] is incorrect. [New sentence.]` — **177 occurrences**
- Ratio ≈ **4 : 1** in favour of the `because` form. The `because` form dominates the "convention being tested" style; the bare form dominates the 39 plain-style rationales.

**Standard dismissal predicates** (reuse verbatim):
`results in a comma splice` · `results in a run-on sentence. The two main clauses are fused without punctuation and/or a conjunction` · `results in a rhetorically unacceptable sentence fragment beginning with "___"` · `no punctuation is needed between the [X] and the [Y]` · `a [X] can't be paired with a [Y] in this way` · `doesn't agree in number with the [singular/plural] subject "___"` · `the context requires the [X] "___," not the [Y] "___"` · `it results in an ungrammatical sentence` · `it fails to mark the boundary between … with appropriate punctuation` · `it's unconventional to …`

### 7.2 How quoted spans are presented

- Short spans are quoted whole in double quotes: `"radiation."`, `"is added"`.
- Long spans are **elided with a horizontal ellipsis and no spaces**: `("The haiku-like…writers")`, `("Since...periods")`, `("Jamaican…microsculptures")`, `("A subseasonal…advance")`. The pattern is `"FirstWord…LastWord"` — first 1–3 words, ellipsis, last 1–2 words.
- Terminal punctuation goes **inside** the closing quote: `the singular subject "radiation."`
- Grammatical labels are given in parentheses after the quote or before it: `the nonfinite present participle "searching"`, `the finite past tense verb "used"`, `the plural demonstrative determiner "these"`.

### 7.3 Length

| Group | median words | mean words |
|---|---|---|
| All 300 | **134** | 140 |
| Boundaries Easy | 129 | 132 |
| Boundaries Medium | 148 | 144 |
| Boundaries Hard | **147** | 158 |
| FSS Easy | 124 | 127 |
| FSS Medium | 116 | 134 |
| FSS Hard | 148 | 142 |
| Range | min 63 | max 337 |

**Target: 110–170 words. Easy ≈ 125, Hard ≈ 148.**

### 7.4 Three verbatim rationales, Easy / Medium / Hard

**EASY** — `e38b3e4f`, FSS, subject–verb agreement (75 words, maximum formulaicity):
> Choice A is the best answer. The convention being tested is subject-verb agreement. The singular verb "occurs" agrees in number with the singular subject "radiation." Choice B is incorrect because the plural verb "have occurred" doesn't agree in number with the singular subject "radiation." Choice C is incorrect because the plural verb "occur" doesn't agree in number with the singular subject "radiation." Choice D is incorrect because the plural verb "are occurring" doesn't agree in number with the singular subject "radiation."

**MEDIUM** — `89fbc3eb`, Boundaries, coordination of main clauses:
> Choice C is the best answer. The convention being tested is the coordination of main clauses within a sentence. This choice uses a semicolon to correctly join the first main clause ("The Mission…parks") and the second main clause that begins with "it." Choice A is incorrect. When coordinating two longer main clauses such as these, it's conventional to use a comma before the coordinating conjunction. Choice B is incorrect because it results in a run-on sentence. The two main clauses are fused without punctuation and/or a conjunction. Choice D is incorrect because it results in a comma splice. Without a conjunction following it, a comma can't be used in this way to join two main clauses.

**HARD** — `9c3630b9`, Boundaries, complex series (note: two independent justifications per distractor):
> Choice B is the best answer. The convention being tested is the punctuation of elements in a complex series. It's conventional to use a semicolon to separate items in a complex series with internal punctuation, and in this choice, the semicolon after "leaves" is conventionally used to separate the first item ("natural debris, such as dried leaves") and the second item ("man-made trash, such as plastic bags") in the series of materials used by Gavua. Further, the comma after "trash" correctly separates the noun phrase "man-made trash" from the supplementary phrase ("such as plastic bags") that describes it. Choice A is incorrect because a comma after "leaves" doesn't match the semicolon used later to separate the second and third items in the series ("man-made...bags" and "and...glue"). Additionally, it's not conventional to use a colon in this way to separate a supplementary phrase ("such as plastic bags") from the noun phrase it modifies ("man-made trash"). Choice C is incorrect because a comma after "leaves" doesn't match the semicolon used later to separate the second and third items in the series ("man-made...bags" and "and...glue"). Choice D is incorrect because it's not conventional to use a semicolon in this way to separate a supplementary phrase ("such as plastic bags") from the noun phrase it modifies ("man-made trash").

---

## 8. Anti-repetition data

### 8.1 How many Conventions items per module / per form

Counted by occurrences of the literal string `conventions of Standard English` in each official practice-test module:

| Form | Module 1 | Module 2 | Full RW section | Module length |
|---|---|---|---|---|
| Practice Test 2 | **9** | **9** | **18 / 66 = 27.3%** | 33 q |
| Practice Test 3 | **7** | **10** | **17 / 66 = 25.8%** | 33 q |
| Practice Test 4 | **8** | **8** | **16 / 66 = 24.2%** | 33 q |
| Practice Test 5 | **6** | **8** | **14 / 66 = 21.2%** | 33 q |
| **Mean** | **7.5** | **8.75** | **16.25 / 66 = 24.6%** | |

These are the **linear (33-question) modules**. Scaled to the **adaptive 27-question module / 54-item form**: 27 × 0.246 ≈ **6–7 Conventions items per module, 13–14 per 54-item form** — consistent with College Board's published blueprint of 11–15 Standard English Conventions questions per RW section. *(INFERRED scaling; the corpus contains only 33-question modules.)*

**Position in the module.** Question numbers recovered for Conventions items include 18, 19, 20, 21, 23, 25 in several modules, and the block always sits after the Information-and-Ideas items and before the Transitions / Rhetorical-Synthesis items. **INFERRED: Conventions occupies one contiguous block, roughly items 18–27 of a 33-question linear module (≈ items 15–22 of a 27-question adaptive module).** Items inside the block are ordered easy→hard only loosely.

### 8.2 Rule repetition inside a single module

Classified by choice-set shape from the extracted practice-test options.

**Practice Test 2, Module 1 (9 Conventions items):**
| # | Options (verbatim) | Rule |
|---|---|---|
| 1 | `enter` / `to enter` / `having entered` / `entering` | F2 finite–nonfinite |
| 2 | `has doubled` / `had doubled` / `doubles` / `will double` | F3 tense (past perfect) |
| 3 | `configurations. TMAO` / `configurations TMAO` / `configurations, TMAO` / `configurations and TMAO` | B2 sentence boundary |
| 4 | `experienced` / `had experienced` / `experiences` / `will be experiencing` | F3 tense |
| 5 | `screw's thread's.` / `screws' threads.` / `screw's threads.` / `screws threads'.` | F7 plural/possessive |
| 6 | `materialism"; and` / `materialism" and` / `materialism,"` / `materialism"` | B1/B2 with quotation |
| 7 | `prey, rather,` / `prey rather,` / `prey, rather;` / `prey; rather,` | B2 semicolon + conjunctive adverb |
| 8 | `playas sediment mark the rock's` / `playa's sediment mark the rocks` / `playa's sediment mark the rocks'` / `playas' sediment mark the rocks'` | F7 plural/possessive |
| 9 | `Gingerbread—` / `Gingerbread,` / `Gingerbread` / `Gingerbread:` | B1 supplementary / no-punct |

→ **Maximum repeat of any one rule inside the module = 2** (tense ×2, plural/possessive ×2, sentence-boundary-family ×2, and even those two "sentence boundary" items use different marks and different structures).

**Practice Test 2, Module 2 (9 items):** F2 (`to use / have used / having used / using`); B3 (`lifelike but / lifelike / lifelike, / lifelike, but`); F3 (`suggested / suggests / had suggested / was suggesting`); B1 participial (`fungi; producing / fungi. Producing / fungi producing / fungi, producing`); F4 dangling modifier (Kurosawa, 4 clause rewrites); B5 complex series (`Basic; in 2009, an online television network; …`); B7 no-punct (`Springs to / Springs: to / Springs—to / Springs, to`); B4 colon (`varied: / varied, / varied, while / varied while`); B5 complex series (`Lagos, A Kind of Marriage, / Lagos; A Kind of Marriage, / …`).
→ **Maximum repeat = 2** (complex series ×2 — and those two are the *only* exact repeat in the module).

**Practice Test 3 (17 items across both modules):** F2 ×2, B3 ×2, B7 ×1, B2 ×4, F1 ×3, B1 ×3, F3 ×1, B5 ×0, F4 ×1.
→ Within Module 2 (10 items), B2 sentence-boundary appears 3× — but with **three different correct marks** (`decade; while` semicolon; `quilts. The` period; `tombs. Built` period-with-participle) and three different structural excuses.

### 8.3 Constraints for a new form

- **13–14 Conventions items per 54-item form; 6–7 per 27-item module.**
- Split ≈ **50/50 Boundaries vs. Form-Structure-Sense** (the Question Bank is exactly 150/150).
- Difficulty mix from the Question Bank: Boundaries E 31% / M 23% / H 45%; FSS E 47% / M 22% / H 31%. **Overall E 39% / M 23% / H 38%.**
- **No rule may appear more than twice in a module**, and if it appears twice, the two items must differ in (a) the correct punctuation mark or verb form, and (b) the structural context.
- A minimum viable rule pool for one 54-item form: **at least 9–10 distinct rules**, drawn so that the two highest-frequency Boundaries rules (B1 supplementary, B2 sentence boundary) and the two highest-frequency FSS rules (F1 SVA, F2 finite/non-finite) each appear 1–2×, and the long tail (B5 series, B9 titles, B10 relative clause, F7 possessives, F8 determiners) supplies the remainder.
- **Topic anti-repetition:** hold to ≈34% arts/literature, 25% natural science, 16% social science/history, 4% technology, 21% other. No two consecutive items should share a discipline or a nationality descriptor.

---

## 9. One-page authoring checklist

1. Pick a rule from the table in §1 weighted by its measured frequency.
2. Pick a topic weighted 34/25/16/4/21 (arts / natural science / social science / tech / other). Name a real-sounding researcher, artist, or place; vary provenance.
3. Write **35–52 words**, **1–2 sentences**, mean sentence length ~26–29 words. Gloss any technical term with an appositive.
4. Place the blank at **~60% (Boundaries) / ~68% (FSS)** of the stimulus, **in the last sentence** (92% of the time). Leave 13–18 words after it.
5. Set difficulty by **subject→verb distance** (≤2 / 3–12 / ≥13), **blank-sentence length** (≤25 / 25–35 / 35–50 words), and **comma count** (≤2 / 2–3 / ≥3). Do **not** stack rules.
6. **Boundaries:** 61% of the time make all four choices identical words with only the punctuation changed; use one of the four canonical shapes in §2.2. Always offer the comma. If the key is "no punctuation," offer `,` plus two of `{; : . —}`.
   **FSS:** always vary a word — never punctuation alone.
7. Stem, verbatim, no exceptions: **"Which choice completes the text so that it conforms to the conventions of Standard English?"**
8. Write a **110–170-word** rationale: `Choice X is the best answer.` → `The convention being tested is ___.` → positive explanation quoting spans as `"First…Last"` → three `Choice Y is incorrect because …` dismissals in A→B→C→D order using the standard predicate list in §7.1.
9. Check the module: no rule twice with the same correct mark, no discipline twice in a row, key letters roughly uniform (D 31 / C 24 / A 23 / B 21).
