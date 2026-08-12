# Digital SAT Reading & Writing — CRAFT AND STRUCTURE
## Reverse-engineered item specification

**Primary corpus.** Four College Board Question Bank exports (`questionbank-export-2026-8-5__4_/5_/6_/7_.txt`), parsed programmatically. 1,200 unique `Question ID` records, zero duplicates across files. Domain split is exactly balanced: Information and Ideas 300, **Craft and Structure 300**, Expression of Ideas 300, Standard English Conventions 300.

**Corroborating corpus.** Six official linear practice-test files (Practice Tests 2, 3, 4, 5). These are the 33-question-per-module linear forms; two-column PDF extraction is lossy, so they are used only for *ordering* and *within-module composition* evidence, never for counts of item features.

**The 300 Craft and Structure items:**

| Skill | n | % of domain | Easy | Medium | Hard |
|---|---|---|---|---|---|
| Words in Context | 166 | 55% | 89 (54%) | 39 (23%) | 38 (23%) |
| Text, Structure, and Purpose | 96 | 32% | 28 (29%) | 36 (38%) | 32 (33%) |
| Cross-Text Connections | 38 | 13% | 6 (16%) | 16 (42%) | 16 (42%) |

Answer-key letter distribution is near-uniform (WIC B50/D41/C40/A35; TSP A30/C23/D23/B20; XTC B11/D10/A9/C8).

**Parsing notes.** The export is PDF-derived plain text. Curly apostrophes are frequently extracted onto the line *above* the line they belong to, leaving a space in their place (`Bianchi and Carla Morri s 2000 census`). All figures below were computed after stripping floating-glyph lines and restoring apostrophes via regex (`\b(\w+) s\b` → `\1's`, `\b(can|wouldn|doesn…) t\b` → `\1't`). Verbatim quotations in this document have been spot-checked and normalized.

---

# PART 1 — WORDS IN CONTEXT (n = 166)

## 1. The two item shapes

There are exactly two shapes, and they are **completely disjoint on every observable dimension**.

### Shape A — FILL-THE-BLANK ("logical and precise")

**n = 140 (84.3% of WIC).** Difficulty: Easy 69, Medium 36, Hard 35.

Verbatim stem, **140 out of 140 items, zero variants, zero exceptions**:

> Which choice completes the text with the most logical and precise word or phrase?

### Shape B — UNDERLINED WORD ("most nearly mean")

**n = 26 (15.7% of WIC).** Difficulty: Easy 20, Medium 3, Hard 3.

Two verbatim variants only:

> As used in the text, what does the word "____" most nearly mean?  (23 items)
>
> As used in the text, what does the phrase "____" most nearly mean?  (3 items)

The target word appears in **curly double quotes** in the stem *and* is underlined in the passage. `word` vs `phrase` tracks span length: `phrase` is used for *a singular*, *a void*, *reconcile his mother to*.

### Hard structural correlates that separate the shapes

| Feature | Shape A (blank) | Shape B (underlined) |
|---|---|---|
| Literary attribution line ("The following text is…") | **0 / 140** | **26 / 26** |
| Options capitalized | 0 / 560 | **104 / 104** |
| Option length (words) | med 1, 24 items = 2 words | med 1, mean 1.4, max 6 |
| Stimulus words | med 51 (28–80) | med 74 (41–114) |
| Stimulus sentences | med 2 (1–5) | med 4 (2–9) |
| Difficulty skew | 49% Easy | **77% Easy** |
| Register | contemporary expository | pre-1960 literary prose/verse |

**Authoring rule (absolute):** the blank shape is *always* expository/scientific/critical prose with no attribution line and lowercase options; the underlined shape is *always* a dated literary excerpt with an attribution line and Capitalized options. Never mix.

Genre of the 26 underlined-word passages: novel 13, short story 5, novella 2, poem 2, play 1, other (story/autobiography) 3. Dates range 1837–2018; 21 of 26 are pre-1930.

## 2. Vocabulary tier analysis

### 2a. Complete keyed-word list, Shape A, by difficulty band

**EASY (n = 69):** abrupt · accidental · acknowledged · adapt to · attributed to · available · categorize · collaboration · complexity · comprehend · consistent · creating · defied · demonstrating · depended on · dominance · effective · efficient · embraced · exemplifies · exposure to · extensive · featured · fragile · handmade from · healthy · impede · important · inadequate · inexperienced with · influenced · inspecting · instituting · interpret · involuntarily · involved in · justify · melodic · newfound · observant · obtain · offered · overlook · patterns · persistent · predicted · preserving · preventable · protect · provide (×2) · rarely · reflect · reforms · replenishes · reputation for · requires · sensitive · simulate · spans · speculates · successful · suppress · traced · tranquil · transformed · validate · vivid · widespread

**MEDIUM (n = 36):** ambivalence toward · an overtly · anomaly · atypical · catalyst of · commonalities with · competent · comprises · concede · confirm · conform to · created · diminish · dormant · esteem · exactitude · fluctuations in · haphazard · impenetrable · intangible · integral (×2) · invalidate · irrelevant · marginalize · neglect · proponent of · receptive to · recognizable · rectify · reduced · reuse · rudimentary · scale · transcending · uniform

**HARD (n = 35):** ambiguity · an arduous · an exhaustive · concentrated among · conjectures · corroborate · counterfactual · demarcated from · discern · diverse · dogmatic · elasticity · engendering · exploited · foster · homogeneous · impending · independent of · inertia · innocuous · latent · mediated by · notional · opaque · optimize · overshadowed by · peripheral · proxies for · prudent · repudiates · sanguine · stymie · surmised · tenuous · variable

### 2b. Register characterization — quantified

| Metric | Easy key | Medium key | Hard key | Easy dist. | Medium dist. | Hard dist. |
|---|---|---|---|---|---|---|
| Mean characters | 9.0 | 9.3 | 9.4 | 9.1 | 9.8 | 10.3 |
| Median characters | 9 | 9 | 9 | — | — | — |
| Mean syllables | 3.12 | 3.42 | 3.34 | 3.18 | 3.47 | 3.65 |
| Median syllables | 3 | 3 | 3 | 3 | 3 | 3 |
| n | 69 | 36 | 35 | 207 | 108 | 105 |

**Finding: length and syllable count are nearly flat across difficulty (9.0 → 9.4 chars; 3.12 → 3.34 syllables).** Difficulty is *not* produced by longer or more syllabic words. It is produced by (a) **semantic abstraction** (Easy: *healthy*, *patterns*, *protect*; Hard: *notional*, *latent*, *proxies for*, *counterfactual*), and (b) **the fineness of the discrimination the stimulus demands**.

**Register verdict: these are overwhelmingly common-to-mid-frequency words used with precision, not obscure flashcard vocabulary.** Only a small tail is genuinely low-frequency, and it is confined to Hard: *sanguine, stymie, notional, dogmatic, tenuous, engendering, surmised, conjectures, innocuous, inertia, exactitude* (Medium). Even the Hard band is dominated by ordinary academic words (*diverse, variable, foster, optimize, exploited, discern, impending*). The corresponding Easy band is entirely Tier-2 general-academic vocabulary. **INFERRED: the construct is contextual precision, not lexical rarity.**

### 2c. Every keyed multiword phrase (24 total — exactly 8 per band)

- **Easy (8):** handmade from · adapt to · involved in · inexperienced with · attributed to · reputation for · exposure to · depended on
- **Medium (8):** catalyst of · receptive to · ambivalence toward · commonalities with · conform to · an overtly · proponent of · fluctuations in
- **Hard (8):** independent of · an exhaustive · mediated by · an arduous · concentrated among · overshadowed by · demarcated from · proxies for

Structure: 21 of 24 are **content word + governed preposition** (`ambivalence toward`, `proxies for`, `demarcated from`). 3 are **article + modifier**, used when the blank sits before a noun and `a/an` must vary (`an overtly`, `an arduous`, `an exhaustive`). 116 keys are single words; 24 are two words; **no key exceeds two words.**

### 2d. Key–distractor relationship (computed)

- **Arity match: 138 / 140 items (98.6%)** have all four options at the same word count class (all single-word or all multiword). Only 2 items mix.
- **Part-of-speech match: effectively 100% by inspection.** A suffix-class heuristic scored 59/140 as strictly identical, but that undercounts because English derivational suffixes are irregular (`impede/recommend/criticize/construct` are all verbs but have four different endings). Manual review of all 140 option sets found no item in which the four options were not mutually substitutable in the frame — same part of speech, same subcategorization (all transitive verbs, or all preposition-taking nouns, etc.).
- **Preposition match in multiword sets is deliberate but *not* uniform.** In `catalyst of / constraint to / sponsor of / diversion from` the prepositions vary; the preposition is part of the tested lexical unit, not a giveaway. Do not make the key the only option with a grammatical preposition.
- **Register match:** distractors are drawn from the same tier as the key. Distractor syllable means (3.18 / 3.47 / 3.65) are marginally *higher* than key means (3.12 / 3.42 / 3.34) at every level — **the key is never the longest or hardest-looking word.** This is a deliberate anti-heuristic.

**Complete distractor pools are recorded per item in the item lists above (Section 2a maps 1:1 to the source dump); representative sets:**
`corroborate` ← circumvent, disseminate, implement (all Latinate verbs of comparable length) · `sanguine` ← recalcitrant, misanthropic, earnest (all adjectives of temperament) · `patterns` ← quantities, decorations, agreements (all plural count nouns) · `inertia` ← decisiveness, evasion, turnover (all abstract nouns naming a behavioral disposition).

## 3. The disambiguation engine

The stimulus must license exactly one option. The device inventory below was computed over all 140 blank items by locating the sentence containing `______` and analysing what precedes and follows it.

### 3a. Positional architecture (where the disambiguating material sits)

| Device | n | % |
|---|---|---|
| A **prior** sentence sets up the blank sentence | 69 | 49% |
| Numerals / quantities somewhere in the stimulus | 55 | 39% |
| A **following** sentence elaborates the blank sentence | 40 | 29% |
| **Colon gloss after the blank** (`is ______: <restatement>`) | 29 | 21% |
| Contrast marker **before** the blank (but/however/yet/while/although/whereas) | 26 | 19% |
| Causal marker **after** the blank (because/since/so/thus/therefore) | 26 | 19% |
| Contrast marker **after** the blank | 17 | 12% |
| Causal marker **before** the blank | 7 | 5% |
| `not X but ___` / `rather than` / `instead of` frame | 7 | 5% |
| Appositive definition (`, or X,` / `that is` / `known as`) | 6 | 4% |
| Em-dash gloss after the blank | 4 | 3% |
| Semicolon gloss after the blank | 2 | 1% |

### 3b. Whole-stimulus marker frequencies (blank shape, n=140)

adversative connective anywhere 41 (29%) · quantitative movement 69 (49%) · research/attitude verb (*suggests/argues/found/contends*) 32 (23%) · negation or failure verb (*fails to, lacks, without, unable*) 23 (16%) · concessive 18 (13%) · comparative (*than*, *unlike*, *similar to*) 18 (13%) · exemplification (*for example*, *such as*) 9 (6%) · colon anywhere 30 (21%) · em-dash 13 (9%) · semicolon 6 (4%).

For the **underlined-word shape (n=26)** the profile inverts: em-dash 31%, adversative 31%, concessive 23%, colon 4%, causal connective **0%**, comparative **0%**, exemplification **0%**. Literary excerpts disambiguate by *scene contrast* and *juxtaposed description*, not by connective logic.

### 3c. Six verbatim device examples

**(1) COLON GLOSS — the clause after the colon literally restates the blank** `[3f37eb3b, Medium, key = irrelevant]`
> People sometimes dismiss a claim if it comes from a source they regard as self-interested, but from a strictly logical perspective, the source of a claim is \_\_\_\_\_\_: it has no direct bearing on whether the claim is true.

**(2) COLON GLOSS + QUANTITATIVE PROOF** `[69a6d050, Easy, key = widespread]`
> In the early 1800s, the Cherokee scholar Sequoyah created the first script, or writing system, for an Indigenous language in the United States. Because it represented the sounds of spoken Cherokee so accurately, his script was easy to learn and thus quickly achieved \_\_\_\_\_\_ use: by 1830, over 90 percent of the Cherokee people could read and write it.

**(3) COLON GLOSS AS OUTRIGHT DEFINITION** `[e37b9e34, Medium, key = dormant]`
> …may be \_\_\_\_\_\_ in humans: present yet having essentially no effect on our bodily processes.

**(4) `not X but also ___` FRAME** `[5a97d9cd, Hard, key = mediated by]`
> …possibly because residential location choices are not fully reducible to economic factors but are also \_\_\_\_\_\_ noneconomic factors such as access to strong local social networks.

**(5) CONCESSIVE `Although` — the blank must be the thing that *failed*** `[16f2d678, Easy, key = suppress]`
> Although the government of the Soviet Union attempted to \_\_\_\_\_\_ Georgi Vladimov's novel *Faithful Ruslan*, copies of the book circulated in secret among readers in several parts of the country.

**(6) NEXT-SENTENCE ELABORATION — sentence 2 is a worked demonstration of the blank** `[af4300b0, Hard, key = an arduous]`
> The creation of Lotte Reiniger's 1926 animated film *The Adventures of Prince Achmed* was \_\_\_\_\_\_ process. Over the course of three years, Reiniger and her collaborators painstakingly made more than 250,000 individual images of hand-cut paper silhouettes and repeatedly had to invent entirely new methods and tools to create the special effects Reiniger envisioned.

**Bonus — ADVERSATIVE + GRADED ADJECTIVE (the Hard signature)** `[d7807ec8, Hard, key = sanguine]`
> While some commentators lauded this development, asserting that such blogs had a welcome transparency missing from traditional news, less \_\_\_\_\_\_ observers countered that such blogs tended to ideological extremes…

Note the extra machinery here: `less ______` requires the key to be a *positive* attitude adjective whose negation yields the critics' stance. This is the characteristic Hard move — a scalar operator (`less`, `more`, `not fully`, `barring`) wrapped around the blank.

### 3d. Rules the engine implies

1. **The stimulus must contain a redundant restatement of the blank's meaning.** In 21% of items that restatement is literally after a colon. In 78% it is in an adjacent sentence.
2. **Never let the blank be the only place a proposition appears.** Every keyed item can be solved by paraphrase-matching.
3. Median 23 words follow the blank (mean 23.5, range 1–54). **Do not put the blank at the very end of the stimulus without a preceding setup**: only ~15% of items have <5 words after the blank, and those always have a heavy prior-sentence setup.

## 4. Distractor taxonomy (Shape A)

Computed over **419 machine-extracted distractor-dismissal segments** (140 items × 3). Tags overlap (mean 1.18 tags per distractor).

| Category | Signal in rationale | n | % |
|---|---|---|---|
| **(c1) Selectional / logical misfit** — the word cannot combine with this subject or this argument at all | "it wouldn't make sense to say…", "doesn't fit the logic of the text" | 144 | 34% |
| **(a) Topically adjacent, dimension never raised** — the word names a real property of the subject matter that the text simply never discusses | "the text doesn't discuss…", "nothing in the text suggests…" | 115 | 27% |
| **(e) Contradicted by an explicit earlier statement** | "the text indicates/states that…" | 56 | 13% |
| **(c2) Near-synonym failing on one semantic feature** | "implies…", "merely…", "doesn't go so far as…" | 29 | 7% |
| **(a2) Topically adjacent, conceded then rejected** | "Although the text mentions…", "While it's true…" | 24 | 6% |
| **(d) Reverse of the key** | "the opposite of…", "would contradict the text" | 23 | 5% |
| Unclassified by the tagger (mostly variants of c1/a) | — | 105 | 25% |

### Worked examples

**(a) Topically adjacent** `[d5235d39, Easy, key = collaboration]` — passage is about two authors co-writing a play. Distractors *characterization*, *interpretation*, *commercialization* are all genuine literary-critical concepts, all plausible with "the ______ of *The Mule Bone*." Rationale: *"the text doesn't discuss characterization in The Mule Bone specifically or in collaborative works more generally."*

**(b) Correct denotation, wrong connotation** `[a318c1ef, Easy, key = abrupt]`, distractor *catastrophic*: *"Although the word 'explosion' appears in the name of the event…, the text never suggests that the change was 'catastrophic,' or disastrous. In context, 'explosion' refers to the rapid diversification… a phenomenon that the text presents in a relatively neutral manner."* The distractor is baited by a connotation-loaded word in the stimulus.

**(c) Near-synonym, one feature off** `[1eeb9bb8, Hard, key = inertia]`, distractor *evasion*: *"Evasion implies deliberate action to avoid something, but the text describes consumers as passive — they fail to cancel not because they actively avoid doing so but because they don't take action at all."* Key and distractor share [non-action]; distractor adds [+intentional], which the text excludes.

**(d) Reverse** `[dba9eaf8, Hard, key = latent]`, distractor *operative*: *"Choice C is incorrect because it's the opposite of what the context of the text is conveying."`

**(e) Contradicted by an earlier sentence** `[e35d481c, Hard, key = surmised]`, distractor *questioned*: *"the text indicates that it's Logan and not the economic historians who 'questioned,' or doubted, the assumption… the economic historians are the ones who made that assumption to begin with."* The distractor is fine for the local clause; it is ruled out only by attribution established earlier.

### Distractor-construction rules

- Give each item **one selectional misfit** (impossible collocation), **one topically adjacent word** (right field, wrong dimension), and **one near-synonym or reverse**. That is the modal composition.
- The near-synonym distractor is what makes an item Hard; the topically-adjacent distractor is what makes it Easy.
- **Every distractor must have a clean one-clause gloss** — the rationale will always supply one (`"circumvent," or find a way around or bypass,`). If you cannot gloss it in six words, it is the wrong distractor.

## 4b. Distractor mechanic for Shape B (underlined word) — different construct

For the 26 underlined-word items the distractors are **other genuine dictionary senses of the same polysemous word**. The rationale template makes this explicit: *"Although in some contexts, 'X' can mean Y…"* appears in **13 of 26 items, 24 total occurrences**.

`disturbed` → Disorganized / **Alarmed** / Offended / Interrupted — all four are real senses of *disturbed*.
`assumed` → **Acquired** / Acknowledged / Imitated / Speculated.
`quality` → Standard / Prestige / **Characteristic** / Accomplishment.
`trace` → **Evidence** / Blemish / Amount / Sketch.

**Authoring rule:** for Shape B, pick a common polysemous word (all 26 targets are high-frequency: *clear, spread, marked, rough, simply, answers, reserve*), place it in a literary context that selects an *unexpected but standard* sense, and use the other standard senses as distractors. The correct sense is usually the less-common one; the most frequent sense is usually a distractor.

## 5. Stimulus anatomy (Shape A)

| Difficulty | n | Words min/med/mean/max | Sentences min/med/mean/max | Words after blank med/mean/range | Blank in 1st sentence | Blank in last sentence |
|---|---|---|---|---|---|---|
| Easy | 69 | 28 / 50 / 48.3 / 80 | 1 / 2 / 2.00 / 5 | 23 / 23.0 / 1–51 | 48% | 68% |
| Medium | 36 | 36 / 50 / 50.8 / 67 | 1 / 2 / 1.86 / 4 | 20 / 21.3 / 1–52 | 42% | 81% |
| Hard | 35 | 34 / 55 / 54.1 / 74 | 1 / 2 / 1.74 / 4 | 24 / 26.8 / 1–54 | 66% | 69% |
| **All** | **140** | **28 / 51 / 50.4 / 80** | **1 / 2 / 1.90 / 5** | **23 / 23.5 / 1–54** | **51%** | **71%** |

Blank-position distribution: sentence 2 of 2 → 51 items; sentence 1 of 1 → 39; sentence 1 of 2 → 32; 3 of 3 → 7; 2 of 3 → 5; other → 6.

**Key finding:** Hard items are only ~4 words longer than Easy but are markedly more likely to be **a single long sentence** (13/35 = 37% single-sentence, vs 15/69 = 22% Easy). Hard difficulty is delivered by *subordination density within one sentence*, not by passage length. Design targets: **Easy 45–55 words in two sentences; Hard 50–60 words in one or two sentences with at least one embedded concessive/causal clause.**

Shape B stimulus: 41–114 words, median 74, median 4 sentences — roughly 45% longer than Shape A, because a literary excerpt needs scene.

---

# PART 2 — TEXT, STRUCTURE, AND PURPOSE (n = 96)

## 6. Sub-shapes and verbatim stems

| Sub-shape | n | % | Easy | Medium | Hard |
|---|---|---|---|---|---|
| FUNCTION of an underlined span | 43 | 45% | 12 | 12 | 15+ |
| MAIN PURPOSE of the text | 33 | 34% | 9 | 15 | 9 |
| OVERALL STRUCTURE of the text | 19 | 20% | 6 | 8 | 5 |
| Other (3-span function) | 1 | 1% | — | — | 1 |

### Exact stem strings and counts

**MAIN PURPOSE family (33)**
- `Which choice best states the main purpose of the text?` — **28**
- `Which choice best describes the main purpose of the text?` — 2
- `Which choice best describes the overall purpose of the text?` — 2
- `What choice best describes the main purpose of the text?` — 1

**FUNCTION family (43)**
- `Which choice best describes the function of the underlined portion in the text as a whole?` — **16**
- `Which choice best describes the function of the underlined sentence in the text as a whole?` — **12**
- `Which choice best describes the function of the underlined sentence?` — 3
- `Which choice best states the function of the underlined portion in the text as a whole?` — 2
- `Which choice best describes the function of the underlined question in the text as a whole?` — 1
- `Which choice best describes the function of the underlined phrase in the text as a whole?` — 1
- `Which choice best describes the function of the underlined statement in the text as a whole?` — 1
- `Which choice best describes the function of the underlined portion?` — 1
- `Which choice best states the function of the underlined sentence in the overall structure of the text?` — 1
- `Which choice best states the function of the underlined sentence?` — 1
- `Which choice best states the purpose of the underlined portion in the text as a whole?` — 1
- `Which choice best describes the function of the first sentence in the text as a whole?` — 1
- `Which choice best describes the function of the second sentence in the overall structure of the text?` — 1
- `Which choice best describes the function of the third sentence in the overall structure of the text?` — 1
- `Taken together, the three underlined portions most clearly serve which function in the text as a whole?` — 1

**STRUCTURE family (19)**
- `Which choice best describes the overall structure of the text?` — **19 / 19, no variants**

**Canonical set to author against:** the three high-frequency stems (`…best states the main purpose of the text?`, `…best describes the function of the underlined portion/sentence in the text as a whole?`, `…best describes the overall structure of the text?`) cover 75 of 96 items (78%). There is **no separate "literary/poetry stem"** — poetry and fiction items reuse the same three stems verbatim; only the option wording changes (`The speaker…` instead of `It…`).

## 7. Passage genres

| Genre | n | % | Main purpose | Function | Structure |
|---|---|---|---|---|---|
| Science (natural + social, incl. research reports) | 38 | 40% | 10 | 19 | 8 |
| Literature: prose fiction | 19 | 20% | 10 | 8 | 1 |
| Humanities (arts, literary/cultural criticism) | 18 | 19% | 5 | 8 | 5 |
| History / social studies | 13 | 14% | 5 | 6 | 2 |
| Literature: poetry | 5 | 5% | 1 | 1 | 3 |
| Literature: drama | 3 | 3% | 2 | 1 | 0 |

Literature total: **27 of 96 = 28%**. Poetry is 5% and is disproportionately used for the **STRUCTURE** stem (3 of 5 poems).

### Attribution-line format — exact verbatim templates

All 53 literary items in the Craft and Structure set (26 WIC + 27 TSP) use one of these:

```
The following text is from <Author>'s <YEAR> <genre> <Title>.
The following text is adapted from <Author>'s <YEAR> <genre> <Title>.
```
where `<genre>` ∈ {novel, novella, short story, story, play, poem, autobiography}. Titles of novels/plays are italic in the original (plain in export); short-story and poem titles take curly double quotes.

Observed verbatim instances:
> The following text is from Charlotte Brontë's 1847 novel *Jane Eyre*. Jane, the narrator, works as a governess at Thornfield Hall.
>
> The following text is adapted from George Bernard Shaw's 1912 play *Pygmalion*. Henry Higgins has just arrived at the house…
>
> The following text is adapted from Gwendolyn Bennett's 1926 poem "Street Lamps in Early Spring."
>
> The following text is from Sarah Orne Jewett's 1899 short story "Martha's Lady." Martha is employed by Miss Pyne as a maid.
>
> The following text is from William Shakespeare's circa 1611 play *The Winter's Tale*. Camillo has been away from his home…
>
> The following text is from John Muir's 1913 autobiography *The Story of My Boyhood and Youth*. Muir describes…

**Translation variant** (parenthetical, always after the title):
> The following text is from Srimati Svarna Kumari Devi's 1894 novel *The Fatal Garland* (translated by A. Christina Albers in 1910).
>
> The following text is adapted from José Martí's 1891 poem "At the Salon" (translated by Cecil Charles in 1898).
>
> The following text is from a 1955 translation of Samuel Beckett's 1951 novel *Molloy* (translated by the author and Patrick Bowles).

**Author-identity variant** (used when the author's identity is contextually relevant; the `by <Author>` order flips):
> The following text is from the 1923 poem "Black Finger" by Angelina Weld Grimké, a Black American writer. A cypress is a type of evergreen tree.
>
> The following text is from the 1913 story "The King's Coin" by Emily Pauline Johnson, a Kanienkahagen (Mohawk) writer.

**Scene-setting / gloss sentence:** 37 of 53 literary items (70%) append one short present-tense orienting sentence after the attribution. Formulas observed: `<Name>, the narrator, <verb>s …` / `<Name>, a young girl, <verb>s …` / `The narrator is <verb>ing …` / `In the novel, <Name> and <Name> are …` / a one-line glossary (`A cypress is a type of evergreen tree.`). Copyright lines appear for in-copyright texts (`©1955 by Grove Press, Inc.`) at the end of the excerpt.

**Cross-Text Connections never uses an attribution line (0/38).**

## 8. Option architecture

### Grammatical frame — fixed per sub-shape

| Sub-shape | Frame | Items conforming |
|---|---|---|
| MAIN PURPOSE | `To <bare infinitive> …` | **27 / 33** |
| MAIN PURPOSE (minority) | `It <3sg present verb> …` | 6 / 33 |
| FUNCTION | `It <3sg present verb> …` | **39 / 43** |
| FUNCTION (minority) | `To <bare infinitive>…` 3; `They <verb>…` 1 (multi-span item) | 4 / 43 |
| STRUCTURE | `It <3sg present verb> …, then/and then <verb>s …` | 15 / 19 |
| STRUCTURE (poetry/narrative) | `The speaker <verb>s …, then <verb>s …` / `The text <verb>s …` | 4 / 19 |

**All four options within an item always share the frame** (verified: MAIN PURPOSE 33/33 homogeneous, FUNCTION 39 `It`-only + 3 `To`-only + 1 `They`-only, STRUCTURE 15 `It`-only + 4 `The …`-only).

### Verb inventory with frequencies (all four options pooled)

**MAIN PURPOSE (132 options):** describe 16 · explain 14+4 · discuss 8+4 · compare 6 · argue 5 · present 5+3 · show 5 · demonstrate 4 · provide 4 · convey 4 · suggest 3 · summarize 3+1 · illustrate 3+1 · portray 3 · establish 2 · contrast 2 · emphasize 2 · call attention to 2 · give 2 · introduce 1 · evaluate 1 · capture 1.

**FUNCTION (172 options):** describes 16 · explains 14 · provides 11 · presents 10 · suggests 8 · identifies 8 · emphasizes 7 · illustrates 6+2 · offers 6 · introduces 6 · establishes 5 · elaborates (on) 4 · conveys 3 · indicates 3 · contrasts 3 · defines 2 · notes 2 · acknowledges 2 · makes 2 · shows 2 · argues 2 · states 2 · challenges 2 · summarizes 2 · reflects 1 · qualifies 1 · concedes 1 · underscores 1 · sets up 1.

**STRUCTURE (76 options):** describes 10 · introduces 8 · presents 7 · discusses 4 · explains 4 · outlines 3 · summarizes 3 · establishes 2 · identifies 2 · mentions 2 · examines/compares/conveys/details/lists/characterizes/gives/provides/reveals/sketches/makes/portrays/illustrates/notes/connects 1 each.

**Compound "verb + abstract object" phrases that recur across families:** *provide an example of* · *describe a limitation of* · *offer a detail about* · *elaborate on a claim made earlier in the text* · *identify a problem* · *present a generalization exemplified by* · *qualify an earlier description* · *concede that* · *set up the description that follows* · *note a factor that led X to* · *introduce a term used in the discussion that follows*.

### Option word counts

| Sub-shape | Key min/med/mean/max | Distractor min/med/mean/max |
|---|---|---|
| MAIN PURPOSE | 7 / 12 / 13.6 / 25 | 6 / 13 / 13.8 / 29 |
| FUNCTION | 8 / 14 / 16.3 / 32 | 7 / 15 / 16.2 / 36 |
| STRUCTURE | 11 / 17 / 20.9 / 36 | 11 / 18 / 22.2 / 45 |

**The key is never systematically longer than the distractors** — in all three families the distractor median is ≥ the key median. This is deliberate: length is not a cue.

### How TSP distractors work — computed over 286 dismissal segments

| Distractor mechanism | Rationale signal | n | % |
|---|---|---|---|
| **Content the text never raises** ("right verb, invented object") | "the text doesn't/never mention/discuss/indicate/state…" | 114 | 40% |
| **True of the text but not the function of this span** (concessive dismissal) | "Although/While the text does…" | 40 | 14% |
| **Nothing in the text supports it** | "nothing in the text…" | 22 | 8% |
| **Wrong location** — describes what a *different* sentence does | "…the previous/following/first/last/next sentence…" | 25 | 9% |
| **Wrong illocution** — the text *asserts* it but it isn't the *purpose/function* | "not the main purpose/function…" | 5 | 2% |
| **Over-narrow** ("this is too narrow" — a single detail offered as whole-text purpose) | "This is too narrow", "only one point in the broader…" | 3+ | — |
| **Reverse / contradicts** | "opposite", "contradicts" | 2 | 1% |

Verbatim over-narrow dismissal `[ff97fd53, Easy]`: *"Choice C is incorrect. This is too narrow. One sentence mentions that the Nuyorican Poets Cafe expanded its scope to include art and music, but this is only one point in the broader history…"*

Verbatim wrong-location dismissal `[e818241b, Hard]`: *"Choice A is incorrect because the second sentence introduces the general problem Nance and colleagues hoped to solve, not a serious limitation of how Nance and colleagues tried to solve it. It is the third sentence that introduces Nance and colleagues…"*

Verbatim right-verb-wrong-object `[ca50de52, Hard]`: key *"It reflects a primary goal…"*; distractor B *"It represents a concern of computer animators who are more interested in creating unique backgrounds… than realistic ones"* — dismissed because *"the underlined question is one posed by computer animators who wish to create realistic backgrounds…, not by those who, instead, wish to create effects that reflect films' unique stories; this latter group of animators is discussed later in the text."* **The distractor attributes the span to the wrong party in the passage's contrast.**

## 9. The underlined-portion mechanic

- **Span noun in the stem:** `portion` 20 · `sentence` 17 · ordinal `first/second/third sentence` 3 · `question` 1 · `phrase` 1 · `statement` 1 · `portions` (three spans) 1.
- **`portion` still means one whole sentence in practice.** All 20 "underlined portion" rationales refer to it as "the underlined portion", but the reasoning always treats it as a sentence-sized unit; only 2 explicitly call it a sentence. Sentence lengths in FUNCTION passages: **min 1, median 19, mean 21.4, max 104 words.** So **the span is typically 15–25 words.**
- **Position in the passage.** Rationale positional cues across 43 FUNCTION items: `first sentence` 13 (30%) · `previous sentence` 5 · `second sentence` 3 · `third sentence` 3 · `following sentence` 3 · `last sentence` 3 · `next sentence` 7 (16%). The span is most often the **first or second sentence of a 4-sentence passage**, i.e. a *setup* whose job is to be re-read after the payoff.
- **How the rationale reasons about "in the text as a whole":** **32 of 43 (74%)** rationales contain the phrase "in the text as a whole" or "the text as a whole". The reasoning template is invariant:

  1. Restate what the *whole text* does, sentence by sentence, in order.
  2. Locate the span in that sequence.
  3. State the span's relation to what comes before/after (`then`, `goes on to`, `the remainder of the text`).
  4. Conclude: *"Therefore, the function of the underlined portion is to <key>."*

  Verbatim `[e818241b, Hard]`: *"The first sentence establishes something astronomers believe with some certainty… The second sentence then introduces a problem… Finally, the third sentence indicates that… Thus, the function of the second sentence is to identify the problem that Nance and colleagues attempted to solve but didn't."*

- **35% of keys** (vs 24% of distractors) contain an explicit structural cross-reference (*previous / following / earlier / later / that follows / made earlier in the text*). **Authoring rule: the key for a FUNCTION item should name the span's relation to another part of the passage, not just its content.**

---

# PART 3 — CROSS-TEXT CONNECTIONS (n = 38)

## 10. Format

**Headers are bare, on their own lines, with no attribution whatsoever: `Text 1` … `Text 2`. 38 / 38.**

- `The following text is…` appears in **0 / 38** items.
- Authors of the *texts* are **never named as authors**. Instead, the researchers/scholars discussed *inside* the prose are named: a capitalized full name appears in Text 1 in 21/38 and in Text 2 in 27/38. The stem then refers either to "the author of Text 2" (unnamed) or to the named researcher with a parenthetical tag: `Putirka and Xu (Text 2)`, `Graeber and Wengrow (Text 2)`, `Tsai et al. (Text 2)`.
- No dates in the header; dates appear inside the prose (`In a 2020 paper, Arya Udry et al. cautioned that…`).

### Word counts

| | min | median | mean | max |
|---|---|---|---|---|
| Text 1 | 50 | 68 | 68.8 | 93 |
| Text 2 | 51 | 66 | 65.9 | 87 |
| Combined | 112 | 136 | 134.7 | 158 |

By difficulty (combined): Easy 112–149 (med 130), Medium 119–147 (med 132), Hard 120–158 (med 139). **The two texts are always near-balanced** — no item has one text more than ~1.6× the other. Target: **65–70 words each, 130–140 combined.**

### Are the two texts always in disagreement? **No.**

Manual classification of all 38 pairs (Section 12) puts **11 of 38 (29%) in non-disagreement relations** (partial agreement with different emphasis; complement/extension). A further 7 are *qualifications* rather than contradictions. Full opposition accounts for roughly **20 of 38 (53%)**.

## 11. Stems

| Template family | n | % | Easy | Medium | Hard |
|---|---|---|---|---|---|
| Text 2 **responds to** Text 1 | 18 | 47% | 2 | 9 | 7 |
| Text 2 **characterizes / says about** Text 1 | 10 | 26% | 2 | 3 | 5 |
| **Both authors agree** | 5 | 13% | 2 | 1 | 2 |
| **Difference in view** | 2 | 5% | 0 | 1 | 1 |
| **How the texts relate** | 1 | 3% | 0 | 1 | 0 |
| Other (apply model / apply advice) | 2 | 5% | 0 | 1 | 1 |

### Highest-frequency verbatim stems

> Based on the texts, how would the author of Text 2 most likely respond to the underlined claim in Text 1?  **(3)**
>
> Based on the texts, both authors would most likely agree with which statement?  **(3)**

### The full productive template (each realized once)

`Based on the texts, how would <AGENT> most likely <VERB> <TARGET> in Text 1?`

- **AGENT** ∈ { `the author of Text 2` (10) | `<Surname> and colleagues (Text 2)` | `<Surname> et al. (Text 2)` | `<Surname> and <Surname> (Text 2)` | `the researchers in Text 2` | `the paleontologists in Text 2` | `the ecologist in Text 2` | `the scholars in Text 2` }
- **VERB** ∈ { `respond to` (18) | `say about` (4) | `characterize` (3) | `describe` (1) | `regard` (1) | `suggest for` (1) }
- **TARGET** ∈ { `the underlined claim` | `the underlined portion` | `the assertion in the underlined portion` | `the claim underlined` | `the situation presented in the underlined sentence` | `the overall argument presented` | `the conclusion presented` | `the consensus view discussed` | `the "conventional wisdom" presented/discussed` | `the discussion` | `the research discussed` | `the study findings mentioned` | `the interpretation presented` | `the view of the theorists presented` | `the claims of the author of Text 1` | `<Name>'s findings` | `<Name>'s theory, as described` }

**Agreement templates (verbatim):**
> Based on the texts, both authors would most likely agree with which statement?
> Based on the texts, both Sykes in Text 1 and the scholars in Text 2 would most likely agree with which statement?
> Based on the texts, Fierer's team and the author of Text 2 would most likely agree with which statement about microbes?
> Based on the texts, if Ishii and O'Mahony (Text 1) and Jünger et al. (Text 2) were aware of the findings of both experiments, they would most likely agree with which statement?

**Non-"Based on the texts" templates (3 items):**
> Which choice best describes how Text 1 and Text 2 relate to each other?
> Which choice best describes a difference in how the author of Text 1 and the author of Text 2 view <X>?
> Which choice best describes a difference in how the authors of Text 1 and Text 2 view <X>?

### Underlined spans

**9 of 38 stems (24%)** refer to an underlined span. It sits in **Text 1** in 8 of 9 cases; one item underlines a span in Text 2 and asks the author of Text 1 to respond. Wordings: `the underlined claim in Text 1`, `the underlined portion of Text 1`, `the assertion in the underlined portion of Text 1`, `the claim underlined in Text 1`, `the interpretation presented in the underlined portion of Text 1`, `the situation described in the underlined sentence in Text 1`, `the situation presented in the underlined sentence in Text 2`.

### Direction

Text 2 reacts to Text 1 in **~30 of 38**; Text 1 reacts to Text 2 in **4**. **Default: Text 1 states a position, Text 2 is the reactive text.**

## 12. Relationship taxonomy

Manual classification of all 38 pairs (item IDs given so the classification is auditable):

| Relationship | n | % | Item IDs |
|---|---|---|---|
| **Direct contradiction / rebuttal** — Text 2 asserts Text 1's claim is false | 9 | 24% | eb89dcc8, 02fd3da7, 059f7201, ab56a107, c885c38b, 3cfbf077, 6977d22b, c4737d6a, d72b325e |
| **Evidence bearing on Text 1's hypothesis** — Text 2 reports a study that tests it | 6 | 16% | 1917ba9a, 8de51658, 27d9bb69, faee8ec7, c19b2f77, 7b55e895 |
| **Methodological / evidentiary critique** — the inference isn't warranted by the evidence | 5 | 13% | d6c77ae5, 8889d6e2, 835d1ae6, de2c2f57, e1befb41 |
| **Qualification / refinement** — Text 2 accepts the core but limits scope | 7 | 18% | 105ea6de, 5e101c70, 12d81fc1, 22105871, f0ae0da3, ed52a093, f653b273 |
| **Partial agreement, different emphasis / focus** | 7 | 18% | 8d802289, 97e5bf55, c106b9f7, 7bf79a90, 17bf10de, 2c50ed1a, 159ef46d |
| **Complement / extension / reconciliation** — Text 2 supplies detail that supports or explains Text 1 | 4 | 11% | 4b4ab04e, a87c3925, d0198544, 81da17d3 |

### Illustrative pairs

- **Methodological critique** `[d6c77ae5, Hard]` — T1: Holland et al. read lithium/sodium traces in white-dwarf atmospheres as evidence of Earth-like continental crusts. T2: Putirka and Xu argue those studies "unduly emphasize atmospheric traces of lithium… don't adequately account for different minerals… and the possibility of rock types not found on Earth." Key: *"As questionable, because it rests on an incomplete consideration of potential sources of the elements detected in white dwarf atmospheres."*
- **Qualification** `[105ea6de, Hard]` — Key: *"By agreeing that the possibility described in Text 1 is a cause for concern but pointing out that nanomaterial conjugation does not inevitably produce that result."* The `agree-that-X-but-Y` shape is the signature Hard key.
- **Model applied to data** `[1917ba9a, Hard]` — T1 gives a model of protogyny; T2 gives an experiment with two tanks; the stem asks the test-taker to *use* the model to explain the data. Key is 47 words. This is the most computational XTC item type.
- **Both agree** `[c106b9f7, Hard]` — T1 says Lewis is best represented by historical/mythological sculptures ("Although Lewis sculpted other subjects…"); T2 says the neglected portrait busts are central. Key: *"Lewis's works are varied in the subjects they depict"* — the shared entailment sits in each text's *subordinate* clause, not its thesis.

### Is this item "almost always Hard"? — verified with a correction

**In the Question Bank sample it is 42% Hard, 42% Medium, 16% Easy — hardest-skewing of the three skills but not "almost always Hard."**

| Skill | % Medium-or-Hard |
|---|---|
| Words in Context | 46% |
| Text, Structure, and Purpose | 71% |
| **Cross-Text Connections** | **84%** |

**Why it skews hard (INFERRED from the observed architecture, each point grounded in a measured feature):**
1. **Double reading load.** 135 words of stimulus vs 51 for WIC-blank and ~90 for TSP.
2. **Two-step inference.** The key is never stated in either text; it is a *derived* stance. The rationale must build Text 1's position, build Text 2's position, then compose them.
3. **Counterfactual framing.** "how would X **most likely** respond" asks for a stance the author never took. 74% of XTC stimuli contain a modal hedge (*may / might / likely / probably / appears*), the highest of any skill (WIC 21%, TSP 38%).
4. **No lexical or positional anchor.** Unlike WIC (blank position) and TSP (underlined span), there is nothing to point at.
5. **Long options.** Median 20 words, max 58, and 42% begin with the abstract frame `By <-ing verb>`, which forces the reader to evaluate a rhetorical act rather than a proposition.

## 13. Option architecture + distractor taxonomy (XTC)

**Openers:** `By <-ing verb>…` 64/152 (42%) · `It <verb>s…` 19 · `The <noun>…` 11 · `As <adj>, because…` 8 · `Text 1 …, whereas Text 2 …` 4 · `They would…` 4 · bare declarative sentence (agreement items) ~40.

**`By` gerunds used (all options):** arguing 7 · pointing (out) 6 · asserting 6 · suggesting 5 · acknowledging 4 · claiming 3 · noting 3 · agreeing 2 · insisting 2 · emphasizing 2 · challenging 2 · conceding 2 · disputing 2 · concurring, denying, warning, stating, maintaining, observing, recommending, distinguishing, indicating, objecting, praising, approving, cautioning, faulting, critiquing, explaining 1 each.
**Keys only:** asserting 4 · pointing out 2 · noting 2 · agreeing, warning, stating, arguing, suggesting, disputing, cautioning, insisting 1 each. **Keys favour the hedged/compound verbs (`noting`, `pointing out`, `cautioning`, `agreeing … but`); distractors favour the bare strong verbs (`arguing`, `claiming`, `insisting`, `denying`).**

**Word counts:** key min 7 / med 20 / mean 20.4 / max 58; distractor min 7 / med 20 / mean 21.0 / max 55. Again the key is not the longest.

**Distractor mechanisms** — 94 dismissal segments:

| Mechanism | Rationale signal | n | % |
|---|---|---|---|
| **Content in neither text** | "neither text…" | 28 | 30% |
| **Attributes to Text 2 something only Text 1 says (or vice versa)** | "Text 1/Text 2 doesn't / never…" | 20 | 21% |
| **Unsupported extrapolation** | "nothing in the texts suggests…" | 14 | 15% |
| **States Text 2's view but not as a *response*** | "While Text 2 does…, this is not how it would respond…" | 6 | 6% |
| **Over/understates agreement** | "would disagree / would not agree…" | 5 | 5% |
| **Reverses one author's position** | "opposite", "contradicts" | 4 | 4% |
| **Correct in kind, unsupported in detail** | "isn't supported / no basis" | 4 | 4% |

Verbatim `[97e5bf55, Medium]`: *"Choice B is incorrect. While Text 1 refers to the women in Massinger's plays, neither text compares the women of Fletcher's plays to the women of Massinger's plays. Text 2 doesn't mention Massinger at all."* — This is the canonical XTC distractor: it splices a real detail from Text 1 into a claim about Text 2.

Verbatim `[6977d22b, Hard]`: *"Choice D is incorrect because according to Text 2, Behrenfeld and colleagues argue that water density **decreases, not increases**, competition…"* — polarity reversal on a technical relation.

---

# PART 4 — CROSS-CUTTING

## 14. Rationale style

### Universal skeleton (all three skills)

```
Choice <X> is the best answer because it <SKILL-SPECIFIC PREDICATE>. <2–8 sentences reconstructing the text's logic, quoting key phrases in double quotes.> <Therefore/Thus, ...restate the key.>
Choice <A> is incorrect because <gloss of the option>, <why it fails>.
Choice <B> is incorrect because ...
Choice <C> is incorrect because ...
```

Distractors are **always dismissed one at a time, in letter order, never grouped.** Grouped dismissals ("Choices A, B, and D are incorrect because…") occur **0 times in 300 items.**

Two openers only:
- `Choice X is the best answer because …` — WIC 147/166 (89%), TSP 74/96 (77%), XTC 19/38 (50%).
- `Choice X is the best answer. ` (period, then reasoning) — WIC 19, TSP 22, XTC 19. This shorter register is more common in the newer/Easier items and in XTC.

Distractor openers: `Choice X is incorrect because …` (WIC 342, TSP 148, XTC 32) vs `Choice X is incorrect. ` (WIC 153, TSP 138, XTC 62).

### Skill-specific predicates (verbatim)

| Skill | Predicate |
|---|---|
| WIC — blank | `…because it most logically completes the text's discussion of <topic>.` |
| WIC — underlined | `…because as used in the text, "<word>" most nearly means <gloss>.` |
| TSP — purpose | `…because it most accurately states/describes the main purpose of the text, which is to …` |
| TSP — function | `…because it most accurately describes the function of the underlined portion in the text as a whole.` / `…describes how the underlined sentence functions in the text as a whole.` |
| TSP — structure | `…because it most accurately describes the overall structure of the text.` |
| XTC | `…because it reflects how the author of Text 2 would most likely respond to …` / `Choice X is the best answer. Text 1 states that… Text 2 states that… Both texts imply…` |

### Length

| Skill | min | median | mean | max | Easy med | Medium med | Hard med |
|---|---|---|---|---|---|---|---|
| Words in Context | 97 | 246 | 249 | 391 | 235 | 256 | 284 |
| Text, Structure, and Purpose | 89 | 226 | 224 | 425 | 183 | 226 | 266 |
| Cross-Text Connections | 116 | 200 | 220 | 386 | 168 | 232 | 200 |

Rationale length rises monotonically with difficulty for WIC and TSP. **Target ~230–260 words; ~55–70 words for the key, ~55–65 per distractor.**

### The gloss convention (WIC's defining feature)

**157 of 166 WIC rationales (95%)** contain the word `means`. Every option — key and distractors — is glossed inline in one of these frames:
- `In this context, "X" would mean <gloss>.`
- `"X," or <gloss>,`
- `it wouldn't make sense to say that <subject> could "X," or <gloss>, <object>`
- (underlined shape only) `Although in some contexts, "X" can mean <gloss>, …`

Dismissal-reason frequencies across all 166 WIC rationales: `wouldn't make sense` 46% · `nothing in the text / the text doesn't…` 37% · `the text says/states/indicates` 34% · `While it is true / Although the text` 14% · `opposite` 7% · `illogical` 2%.

### Verbatim rationale examples

**WIC / EASY** `[01de46bb, key = sensitive]`
> Choice A is incorrect because "immune" means protected or shielded, which wouldn't make sense in this context. The text explains that deep water can cause young wild-rice plants to become uprooted and destroyed, indicating that these plants are harmed by deep water, not protected from it.

**WIC / MEDIUM** `[3f37eb3b, key = irrelevant]`
> Choice A is incorrect because in this context, "indistinct" would mean uncertain or not clearly recognizable. Instead of suggesting that the source of a claim can't be determined with certainty, the text suggests that recognizing a source and having an opinion of it simply doesn't matter because as a matter of logic, a claim is true or false in actuality, regardless of where it originates.

**WIC / HARD** `[d5ad34f0, key = corroborate]`
> Choice B is the best answer because it most logically completes the text's discussion of a relationship between the results of randomized clinical tests of how effective common medical interventions are and the conclusions practitioners reach about such interventions in real-world settings. In this context, "corroborate" means confirm or support with evidence. …
> Choice A is incorrect because it wouldn't make sense to say that the results of clinical trials could "circumvent," or find a way around or bypass, conclusions practitioners reach in real-world scenarios with patients; it's possible that researchers conducting the trials might avoid engaging with practitioners' conclusions, but findings from a study can't choose to get around something.

**WIC / underlined shape** `[45a109a3, Easy, target = "disturbed"]`
> Choice B is the best answer because as used in the text, "disturbed" most nearly means alarmed. … The text contrasts the reaction of both the narrator and the horses pulling the carriage with that of the driver of the carriage: the narrator and horses are "dreadfully afraid," but the driver is "not in the least disturbed." In other words, the driver is not alarmed by the wolves nearby. Choice A is incorrect. Although in some contexts, "disturbed" can mean disorganized, the text doesn't portray a character acting in a disorganized manner…

**TSP / EASY (main purpose)** `[ff97fd53]`
> Choice D is the best answer. The text presents a brief history of the Nuyorican Poets Cafe, from how it got started in the 70s, to its expansion in the 80s, to its ongoing mission today. Choice A is incorrect. This isn't the overall purpose. The text never mentions Algarín's motivations. … Choice C is incorrect. This is too narrow.

**TSP / MEDIUM (function)** `[236fee8e]`
> Choice B is the best answer. The underlined sentence provides information about import/export firms, showing how Chinese communities across the world were connected by trade routes. … Choice D is incorrect. The underlined sentence doesn't outline a hypothesis but instead provides evidence. And the following sentence agrees with the underlined sentence, so we could eliminate this choice just for saying that the following sentence "casts some doubt on" the underlined one — **partly wrong is all wrong.**

**TSP / HARD (function of the *n*th sentence)** `[e818241b]`
> Choice C is the best answer because it best describes how the second sentence functions in the text as a whole. The first sentence establishes something astronomers believe with some certainty… The second sentence then introduces a problem… Finally, the third sentence indicates that… Thus, the function of the second sentence is to identify the problem that Nance and colleagues attempted to solve but didn't.

**XTC / EASY** `[eb89dcc8]`
> Choice C is the best answer because it directly applies the research findings described in Text 2 to the situation underlined in Text 1. … Since Text 2 specifically argues against the strategy of concealing preferences and indicates negative outcomes from doing so, the author of Text 2 would most likely recommend stating a preference about where to eat. Choice A is incorrect because nothing in Text 2 suggests that canceling plans is a good solution.

**XTC / MEDIUM** `[97e5bf55]`
> Choice A is the best answer. Text 1 states that Sykes felt Fletcher's contributions to the play were obvious because he had a distinct style in his other plays. Text 2 states that scholars generally agree "on the basis of style" that Fletcher wrote most of the three middle acts. Both texts imply that Fletcher's writing has a unique, readily identifiable style…

**XTC / HARD** `[6977d22b]`
> Choice A is the best answer because based on Text 2, it represents how Behrenfeld and colleagues would most likely respond to the "conventional wisdom" discussed in Text 1. … Choice D is incorrect because according to Text 2, Behrenfeld and colleagues argue that water density decreases, not increases, competition between phytoplankton species.

## 15. Subject-matter mix and prose voice

### Topic distribution (300 Craft and Structure items, first-match classification)

| Topic | All | WIC | TSP | XTC |
|---|---|---|---|---|
| Biology / ecology / zoology | 34% | 29% | 38% | 50% |
| Literature / arts / music / film | 22% | 23% | 21% | 16% |
| Astronomy / space | 9% | 8% | 10% | 13% |
| History / archaeology / anthropology | 7% | 8% | 5% | 5% |
| Psychology / behavior / neuroscience | 6% | 5% | 7% | 5% |
| Economics / business / policy | 6% | 7% | 5% | 3% |
| Physics / chemistry / engineering | 5% | 5% | 4% | 5% |
| Earth / environment / climate | 3% | 3% | 3% | 3% |
| Other / general | 8% | 11% | 6% | 0% |

**Life sciences plus arts/humanities account for over half of all stimuli.** Cross-Text Connections is the most science-heavy (50% biology/ecology + 13% astronomy).

### Attribution conventions — measured

| Convention | n / 300 | % |
|---|---|---|
| `<Full Name> and colleagues` / `<Name> et al.` / `<Name> and her team` | 54 | 18% |
| `<Role-capitalized> <Full Name>` — e.g. *Ecologist Juan Amat*, *Economist Marco Castillo*, *Astronomer Mark Holland*, *Geologist Keith Putirka*, *Psychologist James Maddux*, *Novelist N. K. Jemisin*, *Composer Florence Price*, *Archaeologist Helle Vandkilde* | 15 | 5% |
| Bare plural agent — *Researchers…*, *Scholars…*, *Historians…* | 13 | 4% |
| `In a <year> study/paper…` (anonymous framing) | 12 | 4% |
| `<Name>, a <role>[, at <Institution>],` appositive | 7 | 2% |
| **Institution actually named** (University / Institute / Laboratory / Observatory / Museum) | **5** | **2%** |

**Correction to the assumed convention:** the "Named researcher (field) at Institution" pattern is **not** an SAT Craft-and-Structure convention. Institutions are named in only 5 of 300 items. The real convention is **role-capitalized name, or bare name + "and colleagues," with no institution.** Studies are located by **year** (`In a 2020 paper, Arya Udry et al. cautioned that…`), never by affiliation.

### Non-Anglo names — deliberately dense

Roughly one item in three that names a person names a non-Anglo one. Observed across the 300: Marta Coll, Carlo Bianchi, Carla Morri, Vicente Lull, Wriju Chowdhury, Sarafina El-Badry Nance, Gabriela González, Jingnan Huang, Samadi Galpayage, Rachit Dubey, Alexander Goikoetxea, Manon Jünger, Rie Ishii, Michael O'Mahony, Shang-Min Tsai, Nikku Madhusudhan, Agusto Luzuriaga-Neira, Florian Humpenöder, Exequiel Ezcurra, Melisa Diaz, Haesung Jung, Arya Udry, Trevon Logan, Tiya Miles, Michelene Pesantubbee, Ofelia Zepeda, Annie Dodge Wauneka, Sequoyah, Kumeyaay poet Tommy Pico, N. K. Jemisin, Sanjay Patel, Wole Soyinka, Alfonso Lacadena, Lisa Trever, Marissa Sharif, Ying Fan, Dario Focarelli, Fabio Panetta, Srimati Svarna Kumari Devi, José Martí, Sui Sin Far, Sadakichi Hartmann, Zora Neale Hurston, Angelina Weld Grimké, Emily Pauline Johnson, Karel Čapek, Mohsin Hamid, Pam Muñoz Ryan, Louise Erdrich, Cynthia Kadohata, Rachel Heng, Jason Reynolds, Mark Oshiro. Diacritics are preserved. Indigenous, Black American, Latin American, South Asian, East Asian, and Eastern European names all appear; the literary excerpts specifically privilege writers of color and women.

### Hedging and stance

| Feature | All | WIC | TSP | XTC |
|---|---|---|---|---|
| Reporting/stance verb (*suggests, posits, contends, argues, proposes, maintains, asserts, hypothesizes, claims, theorizes*) | 17% | 11% | 19% | **34%** |
| Modal hedge (*may, might, could, likely, probably, appears, seems, tends to*) | 33% | 21% | 38% | **74%** |
| 4-digit year present | 42% | 40% | 48% | 34% |
| Numeral or percent | 61% | 49% | 66% | **100%** |
| First person (`I / we / my / our`) | 12% | 10% | 18% | 11% |
| Second person (`you / your`) | 2% | 0% | 4% | 3% |

**First person occurs almost exclusively inside literary excerpts** (53 literary items in the set); expository stimuli are third-person throughout. Second person appears in only 5 of 300, always in a "Imagine you and your friend…" thought-experiment frame.

**Attitude is always attributed, never asserted.** Expository stimuli never say "X is wrong"; they say "Y argues that X is wrong," "researchers contend," "conventional wisdom holds that." XTC depends on this entirely: at 34% stance verbs and 74% modal hedges, it is the most heavily attributed genre in the domain.

## 16. Within-module repetition constraints

**Evidence base:** question-bank proportions (WIC 55% : TSP 32% : XTC 13% of the domain) plus stem-sequence extraction from four official linear RW modules. The linear practice forms are **33 questions per module**; the adaptive digital form is **27 per module, 54 per form**.

### Observed within-module ordering (stem sequences extracted in document order)

```
PT5 Module 1: WIC-underline, WIC-blank, TSP-purpose, TSP-function, [Information&Ideas ×3], [SEC ×4], [EoI ×2]
PT5 Module 2: WIC-underline, WIC-blank, WIC-blank, TSP-function, XTC, [I&I ×2], [SEC ×7]
PT4 Module 1: WIC-blank, WIC-blank, TSP-structure, [I&I], XTC, [I&I ×3], [SEC ×5], [EoI]
PT3 Module 1: WIC-blank ×4, TSP-structure, [I&I ×6], [SEC ×6], [EoI-synthesis ×2]
PT3 Module 2: WIC-blank ×2, TSP-purpose, [I&I ×2], [SEC ×8], [EoI-transition ×3]
PT2 Module 1: WIC-blank ×3, TSP-purpose, [I&I ×6], [SEC ×6], [EoI-synthesis]
PT2 Module 2: WIC-blank ×3, [I&I ×2], [SEC ×7], [EoI-transition]
```
(Extraction from two-column PDFs is lossy; sequences under-count but preserve order.)

**Rules this establishes:**
1. **Craft and Structure is the first block of every module**, in the fixed internal order **Words in Context → Text, Structure, and Purpose → Cross-Text Connections**, followed by Information and Ideas → Standard English Conventions → Expression of Ideas.
2. **The underlined-word (literary) WIC item, when present, is the very first question of the module** (PT5 both modules). It appears at most once per module.
3. **WIC-blank repeats freely: 2–4 per module.** It is the only Craft and Structure stem that repeats within a module in the observed data.
4. **TSP: 1–2 per module. When two appear, they use *different* stems** (PT5 M1 = purpose + function). No observed module repeats a TSP stem.
5. **Cross-Text Connections: exactly 0 or 1 per module.** `Text 1` never occurs twice as a header in one module in the observed files.

### Blueprint targets (INFERRED, from bank proportions applied to the published 27-item module)

Craft and Structure is ~28% of the RW section → **~7–8 items per 27-question module, 13–15 per 54-question form.**

| Skill | per 27-item module | per 54-item form |
|---|---|---|
| Words in Context | 3–5 (mode 4) | 7–8 |
| Text, Structure, and Purpose | 2–3 | 4–5 |
| Cross-Text Connections | 0–1 (usually 1) | 1–2 |

### Genre repetition constraint (INFERRED)

Literary excerpts are 28% of TSP and 100% of WIC-underlined but 0% of WIC-blank and 0% of XTC. Since a module carries at most one WIC-underlined item and 2–3 TSP items, **a module contains at most 1–2 literary/poetic passages**, and never two of the same literary genre. Poetry is 5% of TSP overall — roughly one poem per two forms.

---

# PART 5 — CONSTRUCTION CHECKLIST

### Words in Context — fill-the-blank
1. 45–60 words, one or two sentences (Hard: allow a single long subordinated sentence). Contemporary expository register. No attribution line.
2. Place the blank so that **~23 words follow it**; it lands in the final sentence 71% of the time and in the first sentence 51% of the time.
3. Install **one explicit disambiguation device**: colon gloss (21%), prior-sentence setup (49%), next-sentence elaboration (29%), contrast marker (19%), causal marker (19%), or `not X but ___` (5%). The blank's meaning must be recoverable by paraphrase from elsewhere in the stimulus.
4. Key: single word (83%) or `word + preposition` (17%). 8–10 characters, 3 syllables, Tier-2 academic register. Do not reach for rare vocabulary — reach for precise vocabulary.
5. Three distractors, same part of speech, same arity, same or slightly *higher* syllable count than the key: one selectional misfit, one topically adjacent, one near-synonym or reverse.
6. Every option must be glossable in six words.

### Words in Context — underlined word
1. Literary excerpt with the standard attribution line, plus a one-sentence scene-setter. 60–90 words.
2. Target = a **high-frequency polysemous word**; the context selects a non-dominant standard sense.
3. Four Capitalized single-word (or short-phrase) options = four real senses of the target.
4. Difficulty defaults to Easy.

### Text, Structure, and Purpose
1. 85–95 words, 3–5 sentences. Genre mix 40% science / 28% literature / 19% humanities / 14% history.
2. Choose one of three stems verbatim.
3. FUNCTION: underline sentence 1 or 2 of a 4-sentence passage, 15–25 words; key names the span's **relation** to the rest of the text.
4. Options: `To <infinitive>` for purpose; `It <verb>s` for function and structure; `The speaker <verb>s` for poetry structure. 12–20 words, key never the longest.
5. STRUCTURE keys are two- or three-move chains: `It <verb>s X, then <verb>s Y[, and then <verb>s Z].`
6. Distractors: 40% invent content the text never raises; 14% are true-but-not-the-function; 9% describe a different sentence; some are too narrow.

### Cross-Text Connections
1. Bare `Text 1` / `Text 2` headers, no attribution. 65–70 words each, 130–140 combined, balanced.
2. Text 1 states a position; Text 2 reacts (Text 2 is the responder in ~80% of items).
3. Relationship: contradiction 24% / evidence-bearing 16% / methodological critique 13% / qualification 18% / partial agreement 18% / complement 11%. **Not always disagreement.**
4. Stem: `Based on the texts, how would <AGENT> most likely respond to <TARGET> in Text 1?` — optionally underline the target span in Text 1 (24%).
5. Options ~20 words; 42% take the `By <-ing verb>` frame. Keys favour hedged/compound acts (`noting that…`, `agreeing that X but pointing out that Y`); distractors favour bare strong acts.
6. Distractors: cite content in neither text (30%), attribute Text 1's view to Text 2 (21%), state Text 2's view without making it a *response* (6%), reverse a polarity (4%).
7. Target Medium/Hard; Easy is only 16% of the pool.

### Rationale (all skills)
```
Choice <KEY> is the best answer because it <predicate>. <Reconstruct the text's logic, 3–6 sentences, quoting phrases in double quotes.> <Therefore/Thus, restate the key.>
Choice <D1> is incorrect because "<option>," or <six-word gloss>, <specific failure>.
Choice <D2> is incorrect because ...
Choice <D3> is incorrect because ...
```
230–260 words. One distractor at a time, in letter order, never grouped. Gloss every option. Never appeal to outside knowledge; every dismissal cites the text.
