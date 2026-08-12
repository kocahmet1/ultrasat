# Digital SAT Reading & Writing — DOMAIN SPEC: **INFORMATION AND IDEAS**
### Reverse-engineered item-writing specification
### Skills covered: Central Ideas and Details · Command of Evidence (Textual) · Command of Evidence (Quantitative) · Inferences

---

## 0. CORPUS, METHOD, AND CONFIDENCE

**Primary source.** Four official College Board Question Bank exports
(`questionbank-export-2026-8-5__4_.txt` … `__7_.txt`). Programmatically parsed:
**1,200 SAT Reading and Writing items total**, every one carrying an official metadata row
(Assessment / Test / Domain / Skill / Difficulty), a `Question` block, an `Answer` block with
options `A.`–`D.`, a `Correct Answer:` letter, and a `Rationale` block.

**Domain slice used for this spec: 300 items** labeled `Information and Ideas`:

| Skill (as labeled by College Board) | n | Easy | Medium | Hard |
|---|---|---|---|---|
| Command of Evidence | 148 | 40 | 43 | 65 |
| Central Ideas and Details | 78 | 27 | 27 | 24 |
| Inferences | 74 | 10 | 27 | 37 |
| **Total** | **300** | 77 | 97 | 126 |

The Question Bank does **not** sub-label Command of Evidence. I split it deterministically on the
stem: a stem containing the word *table* or *graph* ⇒ **Quantitative**; otherwise **Textual**.
Result: **CoE-Textual = 77**, **CoE-Quantitative = 71**. Zero textual items contain the words
table/graph/figure anywhere in the passage, and zero quantitative items lack a graphic block, so
the split is clean.

| Sub-skill | n | Easy | Medium | Hard |
|---|---|---|---|---|
| CoE-Textual | 77 | 14 | 26 | 37 |
| CoE-Quantitative | 71 | 26 | 17 | 28 |

**Corroborating source.** Six official practice-test files (SAT Practice Tests 2, 3, 4, 5).
NOTE: all six are the **linear / nonadaptive paper form**, whose header reads `33 QUESTIONS` per
Reading-and-Writing module (66 RW items per form), **not** the 27-per-module adaptive digital form
(54 RW items). Two-column PDF extraction is messy; these files are used for §18 blueprint
corroboration and for confirming stem wording only.

**Extraction caveat (must be stated).** Bar/line-graph internals extract poorly: axis category
labels rendered rotated in the PDF explode into vertical character stacks (e.g. `ns / o / sp / re /
no` = "no response"). **Table** internals extract essentially perfectly. Graph **titles, axis
titles, axis tick values, and legend entries** survive extraction and are reported verbatim; graph
**plotted values** generally do not and were recovered from the rationale text where the rationale
quotes them. Every claim below is a count, a verbatim quote, or explicitly tagged **INFERRED**.

---

## 1. CENTRAL IDEAS AND DETAILS — STEMS

### 1.1 Verbatim stem inventory (n = 78)

| n | Verbatim stem | Type |
|---|---|---|
| **30** | `Which choice best states the main idea of the text?` | main idea |
| 1 | `Which choice best states the text's main idea?` | main idea |
| 1 | `Which choice best describes the main idea of the text?` | main idea |
| **17** | `According to the text, <wh-question>?` | retrieval |
| **15** | `Based on the text, <wh-question>?` | inferential detail |
| 3 | `What does the text most strongly suggest about <X>?` | inferential detail |
| 2 | `What does the text indicate about <X>?` | retrieval |
| 2 | `Which question does the text most directly attempt to answer?` | meta |
| 2 | `Which statement about <X> is (most strongly supported by / best supported by) the text?` | inferential detail |
| 1 | `It can most reasonably be inferred from the text that <X> for which reason?` | inferential detail |
| 1 | `Information in the text best supports which statement about <X>?` | inferential detail |
| 1 | `The text makes which point about <X>?` | retrieval |
| 2 | other wh- (`What feature of <X> does the text say…?`, `In the text, which point does <X> most directly make about…?`) | retrieval |

**THE SPLIT (required deliverable):**
- **Main-idea items: 32 / 78 = 41 %.** One canonical wording carries 30 of the 32.
- **Detail / retrieval + inferential-detail items: 46 / 78 = 59 %.**

Main-idea items are stem-invariant; detail items are stem-*variable* — the wh-question is written
fresh for each passage and names a specific entity from the passage
(`…why are ecologists worried about Pando?`, `…what is true about Elinor?`,
`…how did the researchers determine the level of surprise displayed by the cats in the study?`).

**Difficulty is not carried by the stem type.** Main idea: 12 Easy / 12 Medium / 8 Hard.
Detail: 15 Easy / 15 Medium / 16 Hard.

**Sub-frames observed inside the detail stems, with counts:**
`According to the text, what is true about <CHARACTER>?` (3) · `According to the text, why …?` (5) ·
`According to the text, how …?` (5) · `According to the text, what is one reason …?` (2) ·
`Based on the text, <PERSON> would most likely agree with which statement about <X>?` (3) ·
`Based on the text, which choice best describes <X>?` (2) ·
`Based on the text, how did <CHARACTER> most likely feel …?` (1).

### 1.2 Rules for the author
1. If you want a main-idea item, use the exact string **`Which choice best states the main idea of the text?`** — do not paraphrase (94 % of main-idea stems use it).
2. If you want a retrieval item, open **`According to the text,`** and ask a *wh-* question whose answer is a single explicitly stated proposition.
3. Reserve **`Based on the text,`** / **`What does the text most strongly suggest about`** for items where the answer is one short deductive step from stated content — these are graded as Central Ideas, not Inferences, because the answer is an *option*, not a *completion of a blank*.
4. Never put a blank (`______`) in a Central Ideas and Details passage. **0 / 78** contain one.

---

## 2. CENTRAL IDEAS AND DETAILS — PASSAGE ANATOMY

### 2.1 Word counts (passage only, stem excluded)

| Slice | n | min | p25 | median | mean | p75 | max |
|---|---|---|---|---|---|---|---|
| All | 78 | 48 | 83 | **88** | 91.5 | 98 | 161 |
| Easy | 27 | 48 | 80 | 87 | 90.9 | 100 | 152 |
| Medium | 27 | 49 | 82 | 87 | 84.9 | 94 | 111 |
| Hard | 24 | 79 | 85 | **91** | 99.5 | 102 | 161 |
| Main-idea items | 32 | 49 | — | 88 | 89.4 | — | 152 |
| Detail items | 46 | 48 | — | 89 | 92.9 | — | 161 |

**Sentence count:** min 2, median **4**, mean 4.1, max 11 (p25 = 3, p75 = 5).

**AUTHOR TARGET: 85–100 words, 4 sentences, one paragraph.** Difficulty is *not* produced by
length — the Hard median (91) is 4 words above the Easy median (87). Difficulty is produced by
syntactic density, abstraction of the referents, and the closeness of the distractors.

**Paragraph structure:** single paragraph in essentially all items. Multi-paragraph layout appears
only in the small number of literary excerpts with dialogue.

### 2.2 Genre mix (keyword-scored; n = 78)

| Genre | n | % |
|---|---|---|
| Natural science (biology / ecology) | 20 | 26 % |
| **Literature — narrative or poetic excerpt** | 17 | 22 % |
| Humanities (art, music, literary criticism, philosophy) | 14 | 18 % |
| History / archaeology / social studies | 10 | 13 % |
| Social science (psychology, economics, politics) | 8 | 10 % |
| Natural science (earth / space / physics / chemistry) | 4 | 5 % |
| Unclassified | 5 | 6 % |

**Central Ideas and Details is the ONLY Information-and-Ideas skill that uses literature.**
18 / 78 CID passages (23 %) open with the literary attribution formula; **0 / 74 Inferences and
0 / 71 CoE-Quantitative items do**, and CoE-Textual uses a *different* framing (§6).

**The literary attribution formula — verbatim, 12 instances:**

```
The following text is adapted from <AUTHOR>'s <YEAR> <GENRE> <TITLE>.
The following text is adapted from Johanna Spyri's 1881 novel Heidi (translated by Elisabeth Stork in 1915).
The following text is adapted from María Cristina Mena's 1914 short story "The Vine-Leaf."
The following text is adapted from Countee Cullen's 1926 poem "Thoughts in a Zoo."
The following text is adapted from Oscar Wilde's 1891 novel The Picture of Dorian Gray.
The following text is adapted from Sylvia Acevedo's 2018 memoir Path to the Stars: My Journey from Girl Scout to Rocket Scientist.
The following text is from Laila Lalami's 2019 novel The Other Americans.
The following text is from Edith Nesbit's 1902 novel Five Children and It.
```
`is adapted from` : 12 · `is from` : 5. **Rule:** use *adapted from* when the excerpt has been
lightly edited; *from* when verbatim. Novel titles italic/unquoted; short-story and poem titles in
double quotes. Year always given. Translator credited in parentheses when applicable.

Of the 18 literary CID items, **6 are main-idea and 12 are detail** — literature skews toward
`According to the text, what is true about <CHARACTER>?`

---

## 3. CENTRAL IDEAS AND DETAILS — OPTION ARCHITECTURE

### 3.1 Option length: the key is NOT longer

| Slice | n | min | median | mean | max |
|---|---|---|---|---|---|
| Key | 78 | 3 | **14** | 16.2 | 38 |
| Distractors | 234 | 3 | **15** | 16.7 | 45 |

**The key is the longest option in only 17 / 78 = 22 % of items — *below* the 25 % chance rate.**
Length is deliberately non-diagnostic. Main-idea options run longer (mean 19.4 words) than
detail options (mean 14.6 words); detail options can be as short as 3 words.

**AUTHOR RULE:** write all four options to within ±4 words of each other. Do not let the key be the
longest. This is a hard constraint, verified across all four skills (see §5.1, §10.1, §14.1).

### 3.2 Distractor taxonomy (231 distractor rationales, machine-classified on rationale wording; categories are non-exclusive)

| Failure mode | n | % of 231 |
|---|---|---|
| **(d) Not stated / unsupported by the text** ("the text never says…", "nothing in the text…", "no evidence that…") | **97** | **42 %** |
| **(a′) True of a detail but insufficient / true-but-not-the-answer** ("Although the text does state X, …") | 27 | 12 % |
| **(c) Reverses or contradicts a stated relationship** ("the text says the opposite", "Rather than indicating X, the text reveals Y") | 18 | 8 % |
| **(a) Explicit scope error — a detail, not the main idea** ("this is just a detail and not the main focus") | 8 | 3.5 % |
| **(e) Conflates / mis-assigns two entities in the text** ("the text's discussion of X is about Y, not Z") | 8 | 3.5 % |
| **(b) Overstates / absolutizes / too general** ("This is too general and too strong") | 2 | 1 % |
| Restates without answering | 1 | 0.4 % |

*(40 % of distractor rationales use item-specific prose that names no generic failure category; the
underlying defect in nearly all of these is category (d) or (a′) stated concretely.)*

**Interpretation for the author.** The dominant SAT distractor is **not** a factual reversal — it
is a **plausible proposition the text simply does not assert**. Build three distractors that are
each *topically on-point, semantically reasonable, and textually unlicensed*. Reversals and
overstatements are seasoning, not the main dish.

### 3.3 Five verbatim distractor examples with official rationale reasoning

**(1) SCOPE ERROR — true detail, not the main idea.** ID `0e3b4967` (Easy, key D)
> Passage: *"Scrapbooks of saved fabric pieces were commonly kept by women in the nineteenth-century United States, but few are as meticulously detailed as Hannah Ditzler Alspaugh's work…"*
> Stem: `Which choice best states the main idea of the text?`
> Distractor **C**: *"Fabric scrapbooks were a popular hobby for many women in the nineteenth-century United States."*
> Rationale: *"Choice C is incorrect. **The text does say this, but it's a detail — not the main idea.** The text is mainly about one woman's scrapbook (Alspaugh's), and this choice doesn't even mention her."*

**(2) OVERSTATEMENT / OVERGENERALIZATION.** Same item, distractor **B**: *"Historians rely on fabric scrapbooks to understand how fashions changed throughout the nineteenth-century United States."*
> Rationale: *"Choice B is incorrect. **This is too general and too strong.** The text says that Alspaugh's scrapbook is a historical record of nineteenth-century textiles and dressmaking, but it never says that historians rely on such scrapbooks in general… This choice also fails to even mention Alspaugh, who is the real focus of the text."*

**(3) REVERSAL of a stated relationship.** ID `92c2564d` (Medium, key A). Stem: `According to the text, why are ecologists worried about Pando?`
> Distractor **B**: *"It isn't producing young trees anymore."*
> Rationale: *"Choice B is incorrect. **Rather than indicating that Pando isn't producing young trees anymore, the text reveals that Pando is indeed producing young trees,** stating that those trees can be protected from grazing deer by strong fences."*

**(4) CONFLATION of two things in the text.** Same item, distractor **C**: *"It can't grow into new areas because it is blocked by fences."*
> Rationale: *"Choice C is incorrect because **the text states that fences can be used to prevent deer from eating Pando's young trees, not that Pando itself can't grow in new areas because it's blocked by fences.**"* — the distractor takes the real noun (*fences*) and re-attaches it to the wrong argument slot.

**(5) PLAUSIBLE REAL-WORLD KNOWLEDGE NOT IN THE TEXT.** ID `5325b3cc` (Medium, key C), Black Pearl Chamber Orchestra.
> Distractor **D**: *"Johnson has community members conduct an orchestra to demonstrate how difficult the task is."*
> Rationale: *"Choice D is incorrect. Although the text explains that community members are invited to conduct the Black Pearl orchestra after participating in the iConduct! program, **the text doesn't indicate that Johnson allows community members to do this for the specific purpose of showing how difficult the task is.**"* — a real-world-plausible motive that the passage never supplies.

**Bonus (scope + omission).** ID `92c2564d`, distractor **D**: *"Its root system can't support many more new trees."* → *"the text offers **no evidence** that Pando's root system is incapable of supporting new trees."*

---

## 4. COMMAND OF EVIDENCE — TEXTUAL: STEMS

### 4.1 The two families (n = 77)

| Family | n | % | Easy / Med / Hard |
|---|---|---|---|
| **A. "Which finding, if true, would most directly [support/weaken] the …?"** | **46** | 60 % | 7 / 13 / 26 |
| **B. "Which quotation from … most effectively illustrates the claim?"** | **30** | 39 % | 7 / 12 / 11 |
| unparsed (extraction failure, ID `b0b40727`) | 1 | 1 % | — |

Family A skews **Hard** (57 % of family A is Hard); family B is evenly spread. This is the single
biggest difficulty lever in the sub-skill.

### 4.2 Family A — exact slot grammar

The canonical string is:

```
Which finding, if true, would most directly support the researchers' hypothesis?
        ^          ^              ^       ^           ^           ^
     [NOUN]   [always this]   [ADVERB] [DIRECTION]  [OWNER]   [TARGET NOUN]
```

Slot fillers with counts (n = 46):

| Slot | Fillers (count) |
|---|---|
| **NOUN** | `finding` (36) · `statement` (7) · `detail` (2) · `choice` (1) |
| **modifier** | bare (34) · `from the study` / `from the experiment` / `from the students' study` / `from Granito and Álvarez's research` / `from the experiment with Tiffany & Co. and Forever 21` (7) · `about the basin` / `about mbaqanga and quan họ` (2) |
| **`, if true,`** | **46 / 46 — always present, always comma-set** |
| **ADVERB** | `most directly` (36) · `most strongly` (7) · `best` (2) |
| **DIRECTION** | `support` (38, 83 %) · `weaken` (5, 11 %) · `illustrate` (2) · `account(s) for` (1) |
| **OWNER** | `the researchers'` (9) · `the underlined [claim/sentence/explanation]` (11) · `the student's` (5) · `the team's` (4) · a **named person or pair** (14) · `the journalist's` / `the astronomers'` / `the administrators'` / `the scholar's` (4) |
| **TARGET NOUN** | `claim` (18) · `hypothesis` (11) · `conclusion` (11) · `idea` (3) · `assumption` (1) · `explanation` (1) · `observation` (1) |

**Verbatim exemplars (all real):**
```
Which finding, if true, would most directly support the researchers' hypothesis?
Which finding from the experiment, if true, would most directly support Garza and Robles's hypothesis?
Which statement, if true, would most directly weaken the claim by Caron and colleagues about the fossils found in China and the United States?
Which finding, if true, would most directly support the claim in the underlined sentence?
Which finding from the students' study, if true, would most strongly support Tannen's hypothesis?
Which finding, if true, would most directly support the researchers' claim regarding the size of PCFG whales?
Which finding about the basin, if true, would most directly support Cardenas and Lamb's conclusion?
Which finding from Medina and her colleagues' study, if true, would most directly challenge the assumption in the underlined sentence?
Based on the text, which finding, if true, would best account for the discrepancy Etta-Nkwelle observed?
Which detail, if true, would most directly support the researcher's claim?
```

**Author rules.** (i) `, if true,` is obligatory — it licenses the counterfactual. (ii) Prefer
`most directly` (78 %). (iii) Support:weaken ≈ **8 : 1**; write weaken items sparingly and only at
Medium/Hard. (iv) When the claim is embedded mid-passage rather than final, mark it and refer to it
as **`the underlined claim`** / `the claim in the underlined sentence` (11 / 46 items do this).

### 4.3 Family B — exact slot grammar

```
Which quotation from <SOURCE> most effectively illustrates the claim?
```
Verb fillers: `most effectively illustrates` (20) · `would best support` / `most directly support(s)` (7) ·
`best illustrates` (2) · `most directly challenges` (1).

**SOURCE slot has two modes:**
- **Named literary work (17):** `O Pioneers!` ×2, `Sense and Sensibility`, `The Souls of Black Folk`, `Hedda Gabler`, `Happy House`, `The Land of Enchantment`, `"The Bet"`, `"Looking Back on Girlhood"`, `"Aunt Sue's Stories"`, `"To You"`, `"We Are Marching"`, `"The Mountain"`, `"Poetry"`, `"Loon Point"`, `"Ghosts of the Old Year"`, `Mrs. Spring Fragrance's letters`.
- **Anonymous expert (13):** `a work by a historian` (3), `a scholarly article`, `an art critic`, `an art historian`, `a researcher`, `a philosopher's analysis of The Politics`, `a scholar describing Catlett's work`, `an article about Coleman`, `a survey respondent`, `the interviews`, `the article`.

**Never name a real institution or a real living scholar in the anonymous mode** — the anonymous
form (`a work by a historian`) is what keeps the item verifiable from the text alone.

---

## 5. COMMAND OF EVIDENCE — TEXTUAL: THE LOGICAL ENGINE

### 5.1 Structure of the "which finding would most support" item

The passage is a **4-move machine** (median 4 sentences, 98 words for family A):

| Move | Function | Typical realization |
|---|---|---|
| 1 | **Establish the background regularity** | *"Ochre sea stars live in tidal pools… At night, they move to higher shore levels in search of prey."* |
| 2 | **Introduce the anomaly / observation** | *"But scientists Corey Garza and Carlos Robles noticed that ochre sea stars stayed at lower levels at night after heavy rains."* |
| 3 | **State the hypothesis — one named causal variable, one named outcome** | *"Garza and Robles hypothesized that a layer of fresh water formed by rainfall was a barrier to the sea stars."* |
| 4 | **Describe the method / the contrast that will produce data — and STOP** | *"They placed some sea stars in a climbable tank of seawater and other sea stars in a similar tank of seawater with a layer of fresh water on top. Then, the scientists watched the sea stars' behavior at night."* |

**Critically, the passage never reports the result.** The passage must set up a *specific, testable,
directional prediction* with (a) a manipulated variable, (b) a control condition, and (c) an
outcome measure. The four options are four possible results.

**The key is the unique option that matches BOTH the variable AND the direction**, and — in the
strongest items — expresses the *contrast between the two conditions*:

> **Key B:** *"Sea stars in the tank with only seawater climbed to the top of the tank, but sea stars in the other tank stopped climbing just below the layer of fresh water."*

**Structural signal:** in **23 / 46 (50 %)** of family-A items the key contains an explicit contrast
connective (`but` / `whereas` / `while` / `than` / `compared with`). Only **9 / 46 (20 %)** of keys
contain a number — this is a *qualitative* evidence task, not an arithmetic one.
Key word count: min 11, median **25**, mean 25.6, max 45.

### 5.2 Distractor failure catalogue (136 distractor rationales in family A)

| Failure mode | n | % | Rationale signature |
|---|---|---|---|
| **Right variable, WRONG DIRECTION** (would weaken / contradict / refute) | 14 | 10 % | *"would weaken, not support"*, *"directly refutes"*, *"a finding contrary to the researchers' conclusion"* |
| **IRRELEVANT — silent on the variable** | 25 | 18 % | *"would be irrelevant"*, *"reveal nothing about"*, *"doesn't include anything about"* |
| **WRONG ENTITY / WRONG POPULATION** | 5 | 4 % | *"the claim is about X, not Y"*, *"other than humans"* |
| **NULL RESULT — no change, therefore no support** | 4 | 3 % | *"would reflect a lack of change"*, *"roughly the same frequency"* |
| **RIVAL / DIFFERENT EXPLANATION** (true, but explains something else) | 1–2 | ~1 % | *"could suggest a change in writing style or conventions… does not directly support"* |
| **TOO WEAK / NOT DIRECT** | 1 | 1 % | *"doesn't directly support"* |
| Generic "wouldn't support the hypothesis" with the specific defect stated concretely rather than named | 89 | 65 % | *"It doesn't include anything about how the LINE transposon in octopuses might support advanced cognition."* |

**Design recipe (INFERRED from the above, corroborated by every example read):**
> Given hypothesis "**V** causes **O**", build:
> **Key** = *V-present → O; V-absent → not-O* (right variable, right direction, contrastive).
> **D1** = *V-present → not-O* (right variable, **wrong direction**).
> **D2** = a result about a **different variable** entirely (irrelevant).
> **D3** = a result about the **right variable in the wrong population / wrong comparison**, or a **null result**.

### 5.3 Five verbatim examples with official rationale reasoning

**(1) WRONG DIRECTION.** ID `3091f805` (Easy, key B), sea stars.
> Distractor **C**: *"Both groups of sea stars climbed to the tops of the tanks, but sea stars in the tank with only seawater climbed more slowly than sea stars in the other tank did."*
> Rationale: *"Choice C is incorrect because finding that sea stars climbed to the top of both tanks **would weaken, not support**, Garza and Robles's hypothesis, since it would indicate that the layer of fresh water wasn't a barrier to the sea stars."*

**(2) IRRELEVANT VARIABLE.** Same item, distractor **A**: *"None of the sea stars climbed to the tops of the tanks, but sea stars in the tank with only seawater moved around the bottom of the tank more than sea stars in the other tank did."*
> Rationale: *"…would be **irrelevant** to Garza and Robles's hypothesis. Such a finding would **reveal nothing about whether fresh water serves as a barrier** to sea stars."*

**(3) EXACT REVERSAL (mirror-image key).** Same item, distractor **D**: *"Sea stars in the tank with only seawater mostly stayed near the bottom of the tank, but sea stars in the other tank climbed into the layer of fresh water."*
> Rationale: *"…such a finding would suggest that the layer of fresh water **wasn't** a barrier to the sea stars, thereby **weakening** Garza and Robles's hypothesis."*
> **Note the architecture:** the key and D are the *same two clauses with the conditions swapped*. This is the highest-yield distractor construction in the sub-skill.

**(4) WRONG POPULATION.** ID `22e4d633` (Hard, key A), octopus LINE transposons.
> Hypothesis: *"…that transposon family is tied to a species' capacity for advanced cognition."*
> **Key A:** *"The LINE transposon in O. vulgaris and O. bimaculoides genomes is active in an octopus brain structure that functions similarly to the human hippocampus."*
> Distractor **B**: *"The human genome contains multiple transposons from the LINE family that are all primarily active in the hippocampus."*
> Rationale: *"This choice doesn't support the hypothesis. **It doesn't include anything about how LINE transposons function in species other than humans.**"* — right variable, right direction, **wrong species**; and it merely restates what the passage already said about humans.

**(5) RIVAL EXPLANATION.** ID `98d0a5d7` (Hard, key B), time references in novels.
> **Key B:** *"Novels published after 1880 contain significantly more references to activities occurring after 10 p.m. than do novels from earlier periods."*
> Distractor **C**: *"Among novels published in the nineteenth century, implied time references become steadily more common than clock phrases as publication dates approach 1900."*
> Rationale: *"…while an increase in implied time references relative to clock phrases in nineteenth-century novels **could suggest a change in writing style or conventions**, it does not directly support the conclusion involving a shift in **human behavior**… The text indicates that the researchers' conclusion is based on the **content** of the time references themselves, **not the phrasing** used."*
> Distractor **D** (null result): *"The time references of noon (12 p.m.) and midnight (12 a.m.) are used with roughly the same frequency in the novels."* → *"this would reflect a **lack of change** in human behavior… and therefore would not support the researchers' conclusion."*
> Distractor **A** (right shape, wrong direction *and* wrong time-of-day): *"Novels published after the year 1800 include the clock phrase 10 a.m. less often…"* → *"**The time of 10 a.m. is in the morning and, in most places, characterized by daylight**, so a change in references to that time would not be clearly linked to the impact of electric lighting."*

---

## 6. LITERARY QUOTATION ITEMS (Family B) — FRAMING AND OPTION DESIGN

### 6.1 The three-part frame (verbatim)

```
<TITLE> is a[n] <YEAR> <GENRE> by <AUTHOR>.  In the <GENRE>, <AUTHOR> <CLAIM VERB> that <CLAIM>: ______
```

Real instances:
```
O Pioneers! is a 1913 novel by Willa Cather. In the novel, Cather portrays Alexandra Bergson as
having a deep emotional connection to her natural surroundings: ______

"To You" is an 1856 poem by Walt Whitman. In the poem, Whitman suggests that readers, whom he
addresses directly, have not fully understood themselves, writing, ______

"Looking Back on Girlhood" is an 1892 short story by Sarah Orne Jewett.
Hedda Gabler is an 1890 play by Henrik Ibsen.
The Souls of Black Folk is a 1903 book by W.E.B. Du Bois.
"Ghosts of the Old Year" is an early 1900s poem by James Weldon Johnson.
"The Bet" is an 1889 short story by Anton Chekhov.
"Aunt Sue's Stories" is a 1926 poem by Langston Hughes.
"The Mountain" is a 1914 poem by Robert Frost.
Happy House is a 1920 novel by Jane Abbott.
```
**Attribution rules (all observed, no exceptions):** title first, then `is a/an`, then the **year**,
then the genre noun (`novel` / `poem` / `short story` / `play` / `book` / `travel book`), then
`by <AUTHOR>`. Poems and short stories in double quotes; novels, plays, and books unquoted.
Approximate dating uses `an early 1900s poem`.

**16 / 30 quotation items end the passage with `______` or a colon** — i.e. the claim sentence runs
directly into the quotation. When a poem is quoted, the lead-in ends `…, writing, ______`.

### 6.2 Quotation length and what distinguishes the key

Option word counts (family B, n = 120 options): min 7, **median 29**, mean 30.6, max 76 — noticeably
longer than family A (median 23). Prose quotations run 2–4 sentences; verse quotations run 2–4 lines
with `/` marking line breaks and are wrapped in a single pair of double quotes:
> `"You have not known what you are, you have slumber'd upon yourself / all your life, / Your eyelids have been the same as closed most of the time."`

**What distinguishes the key.** The key **instantiates the claim's exact predicate**, usually twice —
once by direct statement and once by figurative elaboration. From the Cather rationale:
> *"This quotation states that the country meant a great deal to Alexandra and **then goes on to detail several ways in which her natural surroundings affect her emotionally**: the insects sound like 'the sweetest music,' she feels as though 'her heart were hiding' in the grass 'with the quail and the plover,' and near the ridges she feels 'the future stirring.'"*

**The three distractors are all authentic, on-topic quotations about the same character** that
illustrate a *different* property:
- B → *"describes how she interacts with the people around her to learn more about crops, poultry, and experiments with clover hay"* (wrong domain: social, not emotional-natural)
- C → *"describes her nighttime departure in a wagon. **The quotation says nothing about Alexandra's emotional state.**"* (right setting, missing the predicate)
- D → *"describes how well she understands the markets and livestock."* (competence, not emotion)

**AUTHOR RULE:** every distractor quotation must be *about the same subject* and must fail on exactly
one attribute of the claim. Never make a distractor quotation off-topic.

### 6.3 Family B passage anatomy

| Slice | n | min | median | mean | max |
|---|---|---|---|---|---|
| Quotation-item passage words | 30 | 22 | **45** | 57.3 | 117 |
| — Easy | 7 | 22 | **27** | 27.3 | 32 |
| — Medium | 12 | 31 | 53 | 56.7 | 99 |
| — Hard | 11 | 29 | 87 | 77.1 | 117 |
| Sentence count | 30 | 2 | **3** | 2.8 | 5 |

**Easy quotation items are ~27 words — two sentences: attribution + claim.** Hard items add a
paragraph of context (a historical or critical situation) before the claim.

---

## 7. COMMAND OF EVIDENCE — TEXTUAL: PASSAGE ANATOMY BY DIFFICULTY

| Slice | n | min | p25 | median | mean | p75 | max |
|---|---|---|---|---|---|---|---|
| All CoE-Textual | 77 | 22 | 58 | **86** | 80.7 | 106 | 127 |
| Easy | 14 | 22 | 27 | **36** | 51.9 | 72 | 115 |
| Medium | 26 | 31 | 57 | **74** | 75.7 | 99 | 127 |
| Hard | 37 | 29 | 87 | **102** | 95.2 | 113 | 126 |
| Family A (finding) — all | 46 | 41 | — | 98 | 95.0 | — | 126 |
| Family A — Easy / Medium / Hard | | | | 72 / 83 / **104** | 76.6 / 89.3 / 102.8 | | |
| Family B (quotation) — all | 30 | 22 | — | 45 | 57.3 | — | 117 |

**Sentence count:** min 2, median **3**, mean 3.4, max 7. Family A median 4 sentences; family B median 3.

**Unlike Central Ideas, CoE-Textual difficulty IS strongly length-coded** — Easy median 36 words vs.
Hard median 102 words, a ~3× spread. **AUTHOR TARGET: Easy 30–45 w · Medium 70–90 w · Hard 100–120 w
(hard ceiling ≈127).**

---

## 8. COMMAND OF EVIDENCE — QUANTITATIVE: GRAPHIC INVENTORY

### 8.1 Type frequency (n = 71)

| Graphic | n | % | Easy | Medium | Hard |
|---|---|---|---|---|---|
| **Table** | **38** | **54 %** | 18 | 8 | 12 |
| **Graph** (bar or line) | **33** | **46 %** | 8 | 9 | 16 |
| Scatterplot | **0** | 0 % | — | — | — |
| Pie chart | **0** | 0 % | — | — | — |

**Tables carry the Easy end (18 of 26 Easy quant items are tables); graphs carry the Hard end
(16 of 28 Hard quant items are graphs).**

**Bar vs. line split (INFERRED — the PDF export does not label graph type).** Classification
criterion used: a **categorical or discrete x-axis whose ticks are names, treatments, or ≤3
non-contiguous time points ⇒ bar graph**; a **continuous/temporal x-axis with ≥4 evenly spaced
ticks and an axis title of `Year` / `Month` / `Time (hours)` / `Days after infection` ⇒ line graph**.
Under this rule:

| | n of 33 | share |
|---|---|---|
| **Bar graph (clustered/grouped in almost all cases)** | ~24–26 | ~73–79 % |
| **Line graph (multi-series trend)** | ~7–9 | ~21–27 % |

Two independent confirmations of bar-graph dominance: (a) rationale text explicitly uses bar
vocabulary — ID `040583a5`: *"the gap between the **two bars** showing ripening times… crosses fewer
than **2 gridlines**"*; ID `a15b3219`: *"The **lighter bars** show what happened when the
announcement was…"*; (b) the extraction artifact of vertically-stacked, rotated category labels
occurs in ~24 of 33 graph blocks, which only happens with word-labeled category axes.
Clear line graphs: `702eb7e3` (UK policy uncertainty 2005–2010), `3dc911d6` (US Congress veterans
1953–2023), `224428ac` (California condors 2014–2020), `8a668840` (monthly sunshine Apr–Sep),
`15873d14` (maize exports 2009/2010–2013/2014), `cbdd5287` (fruit-fly survival, days 0–14),
`8a584241` (seed germination, hours 24–168), `800771e5` (research submissions 2016–2019).

### 8.2 TABLE structure (n = 38 — extraction is reliable here)

| Property | Distribution |
|---|---|
| **Columns** | 2 : 6 items · **3 : 13** · **4 : 10** · 5 : 4 · 7 : 1 (min 2, median **3**, mean 3.5, max 7) |
| **Data rows** | 1 : 4 · 2 : 2 · 3 : 3 · **4 : 8** · **5 : 16** (min 1, median **4**, mean 3.9, **max 5**) |

**HARD CONSTRAINT: no table in the corpus exceeds 5 data rows or 7 columns.** The modal table is
**3–4 columns × 4–5 rows.**

**Caption format — a descriptive title line, ALWAYS. There is no `Figure 1` / `Table 1` numbering
anywhere in 71 items.** Titles are in **Title Case**, are noun phrases, and name every dimension of
the data plus any unit or date range. Verbatim titles:

```
Pyramids in Egypt and the Americas
Nucleobase Concentrations from Murchison Meteorite and Soil Samples in Parts per Billion
Land Area Covered by Native Flowering Plants at a Site in Antarctica
Employment by Sector in France and the United States, 1800–2012 (% of total employment)
Percentage Point Changes in US Federal Outlays Relative to GDP by Congressional Status
Average Number and Duration of Torpor Bouts and Arousal Episodes for Alaska Marmots and Arctic Ground Squirrels, 2008–2011
Delta 15-N Values in Seagrass Samples from Four Sites on the Yucatan, 2016–2017
Total Areas and 2022 Populations of Smallest Arabian Peninsula Countries
Approximate Rates of Speech and Information Conveyed for Five Languages
Correlations Between Congestion Ratings and Features of the Crowd in Raters' Immediate Vicinity
Four Studies of Food Choices in Various Contexts
Video Game Availability by Initial Release Years
Results of Footprint Analysis for Two Sets of Theropod Tracks
```

**Column-header convention:** sentence case, **unit inside parentheses** —
`Height (meters)` · `Area (square miles)` · `Area covered in 2009 (in square meters)` ·
`Mean bill surface area (cm²)` · `Highest average surface temperature (Fahrenheit)` ·
`Estimated mean speed (meters per second)` · `Age (years before present)` ·
`Percentage of games still available` · `Percent increase in area covered from 2009 to 2018`.
The first column is the **entity/label column** with a bare noun header (`Pyramid`, `Species`,
`Country`, `Location`, `Nucleobase`, `Researchers`, `Dolphin ID`, `Tracks`, `Period`, `Year`).

**Source notes: essentially absent — 1 / 71 items.** The only one:
> `Rows in table may not add up to 100 due to rounding.` (ID `3fc06a91`)
No `Source:` line appears anywhere. **Do not add source attributions to graphics.**

### 8.3 GRAPH structure (n = 33)

**Title:** same convention — descriptive Title-Case noun phrase, no figure number, often with a date
range or an explanatory parenthetical on its own line. Verbatim:
```
Municipalities' Responses to Inquiries about Potential Incentives for Firm [Expansion]
Economic Policy Uncertainty in the United Kingdom, 2005–2010
  (larger values = more uncertainty)                     <- parenthetical scale gloss, own line
Number of Lizard Species by Average Percent of Maximal Speed Used When Pursuing Prey or Escaping Predators
Banana Ripening Time at Different Temperatures with and without Ethylene Treatment
Percentage of US Congress Members Who Self-Identified as Veterans, 1953–2023
Participants' Responses to Three Review Conditions
  (1–9; higher values = more positive)                   <- scale gloss
Home Heating Needs Met with Subsurface Thermal Pollution for Two Temperature Conditions, by Percentage of Sites
Percentage of Ondo State Small-Scale Farmers Who Are Female, by Main Crop Grown
Monthly Hours of Sunshine from April to September in Anchorage and Fairbanks, Alaska
Census Data for Four Canadian Cities, 1871–1901
Mean Ticket Prices Chosen in Two Studies of Participative Pricing Messaging
Relative Contributions of Processes to Prokaryotic and Fungal Community Assembly in Qinghai-Tibetan Lakes
```
Note the **scale gloss** device: when a constructed index is plotted, a parenthetical line
immediately under the title tells the reader how to read it (`larger values = more uncertainty`;
`1–9; higher values = more positive`). Use this whenever the y-axis is not a natural unit.

**Axes.** The **y-axis title is a rotated left-side label naming the quantity plus its unit** —
`Number of municipalities` · `Uncertainty` · `Time (days)` · `Percent` · `Area (square meters)` ·
`Hours of sunshine` · `Population (in thousands)` · `Imports (in hundreds of millions of dollars)` ·
`Electricity (in thousands of MWh)` · `Seeds germinated (%)` · `Female farmers as a percentage of
total` · `Yearly copper production (in millions of pounds)` · `Participants' mean rating` ·
`REM sleep as % of baseline (mean difference from baseline…)`.
**The y-axis always starts at 0** in every readable case, with evenly spaced round gridline
increments (10, 20, 25, 50, 100, 1,000…).
The **x-axis title is a bare sentence-case noun** —
`Year` · `Years` · `Month` · `Season` · `Study` · `species` · `volcano` · `artifact` · `State` ·
`Import types` · `Marketing year` · `Time (hours)` · `Days after infection` ·
`Temperature (degrees Celsius)` · `Percent of maximal speed` · `Ondo State region` ·
`Lithium-ion battery type` · `suggestion type` · `Climate scenario` · `Test administration` ·
`Local heating needs met` · `Sleep on land` · `Region, by time period`.

**Legend.** Placed **below** the plot, one series per line, **lower-case** entries (except proper
nouns), no box, no color words. Series-count distribution (legend lines recovered):

| Series | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| approx. n of graphs | 5 | 10 | 12 | 6 |

**Median = 3 series; maximum = 4. Categories on the x-axis: 2–6, modal 3–4.**
Verbatim legends: `announcement before election / announcement after election` ·
`tax and public spending policy / trade policy / general economic policy` ·
`grass cover / bare soil / forest cover` · `ethylene / no ethylene` ·
`no anger (control) / high anger / low anger` · `500 micromoles per liter / 10 micromoles per liter
/ untreated` · `with nitrogen / without nitrogen` · `captive / wild` ·
`House of Representatives / Senate` · `Halifax / Montréal / Québec City / Toronto` ·
`no leave / 2–4 days leave / 1–5 weeks leave` · `pay what you can / pay what you think it's worth /
pay what you want`.
Note the recurring **treatment-vs-control naming pattern** (`ethylene / no ethylene`,
`with nitrogen / without nitrogen`, `untreated`, `(control)`).

---

## 9. THE TEXT-PLUS-GRAPHIC ARCHITECTURE

### 9.1 Prose length (graphic block stripped; stem excluded)

| Slice | n | min | median | mean | max |
|---|---|---|---|---|---|
| All quantitative prose | 71 | 15 | **79** | 82.8 | 170 |
| Graph items | 33 | 36 | 77 | 81.4 | 128 |
| Table items | 38 | 15 | 86 | 84.0 | 170 |
| Easy | 26 | 15 | **59** | 64.1 | 170 |
| Medium | 17 | 43 | **77** | 79.6 | 115 |
| Hard | 28 | 46 | **103** | 102.1 | 148 |

**Sentence count:** min 1, median **3**, mean 3.4, max 7.
**AUTHOR TARGET: Easy 45–70 w · Medium 75–90 w · Hard 100–120 w.**

### 9.2 What the prose does — the 3-move machine

1. **Name the agent and the situation.** Two agent types dominate:
   - a **student/writer** doing a task: *"A student is writing an essay about four pyramids for a history class and wants to note how long ago each pyramid was built and how tall each pyramid is."*; *"A student is conducting an experiment to test the effect of temperature and ethylene treatment on the ripening speed of bananas."*
   - a **named researcher or research team**: *"A team of political scientists hypothesized that municipalities are much more likely to respond to firms and offer incentives if expansions can be announced in time to benefit local elected officials than if they can't."*
2. **State the claim / hypothesis / conclusion that the data must be tested against** (this is the proposition the key must support).
3. **Hand off to the graphic** — either with the reading cue *"Consulting the table, the student finds that…"* / *"Comparing the data for bananas with and without ethylene, the student concluded that…"* and a terminal `______`, **or** with no blank at all (standalone shape).

**The prose describes the STUDY, not the graphic.** It does not narrate what the graphic shows —
that is the test-taker's job. Where prose does gloss the graphic it is only to identify the
variables (*"…indicating that the firm would announce its expansion on a date either just before or
just after the next election"*).

### 9.3 The two stem shapes — exact variants and counts (n = 71)

| Family | n | % | Blank in prose? |
|---|---|---|---|
| **A. FILL-THE-BLANK: `Which choice most effectively uses data from the <table/graph> to complete the <NOUN>?`** | **45** | 63 % | 43 / 45 = yes |
| **B. STANDALONE: `Which choice best describes data <from/in> the <table/graph> that <support/weaken> <OWNER>'s <NOUN>?`** | **21** | 30 % | 0 / 21 = no |
| C. DIRECT RETRIEVAL: `According to the <table/graph>, <wh-question>?` | 4 | 6 % | no |
| A2. `Which completion of the text is best supported by data in the graph?` | 1 | 1 % | yes |

**Family A tail-noun slot, with counts:**
`to complete the **statement**` (19) · `to complete the **text**` (8) · `to complete the **example**` (6) ·
`to complete the **comparison**` (2) · `to complete the **sentence**` (2) · `to complete the **claim**` (1) ·
`to complete the **student's conclusion / student's claim**` (2) · `to **support** the statement / the
research team's conclusion / Probst and colleagues' conclusion` (3) · `to **illustrate** the claim` (1).
Preposition: `data from the` (41) vs. `the data in the` / `data in the` (4).

**Family B slots:** verb `support` (20) vs. `weaken` (1). Target noun `conclusion` (13) ·
`claim` (4) · `hypothesis` (2) · `assertion` (2). Owner: `the researchers'` · `the team's` ·
`the student's` · `the students'` · `the biologists'` · `the underlined claim/conclusion` ·
or a named pair (`Benz and colleagues'`, `Martinez and colleagues'`, `Egoh and colleagues'`,
`Chung and colleagues'`, `Ibáñez and colleagues'`, `Probst and colleagues'`).

**Verbatim stem exemplars:**
```
Which choice most effectively uses data from the table to complete the statement?
Which choice most effectively uses data from the graph to complete the text?
Which choice most effectively uses data from the graph to complete the example?
Which choice most effectively uses data from the table to complete the comparison?
Which choice most effectively uses data from the graph to complete the student's conclusion?
Which choice best describes data from the graph that support the researchers' conclusion?
Which choice best describes data from the graph that weaken the team's hypothesis?
Which choice best describes data in the table that support the researchers' conclusion?
Which choice most effectively uses data from the table to support Probst and colleagues' conclusion?
According to the table, what is the total area of Bahrain?
According to the graph, which city had the largest population in 1891?
According to the table, in which year was the dolphin with the ID FB43 recorded with her calf?
```

**Grammatical rule for family A:** options are **sentence fragments that grammatically continue the
blank** and end with a period — `40 meters tall.` · `15%.` · `1985 – 1989.` ·
`bananas treated with ethylene ripen faster at 14°C and 16°C than at 18°C and 20°C.` — lower-case
initial letter, no capitalization. Family B/C options are **standalone sentences or noun phrases**
with an initial capital.

---

## 10. THE DATA-READING TRAP — QUANTITATIVE DISTRACTOR TAXONOMY

### 10.1 Option metrics

| | n | min | median | mean | max |
|---|---|---|---|---|---|
| Key | 71 | 1 | **17** | 16.0 | 55 |
| Distractors | 213 | 1 | **16** | 16.6 | 55 |

Key is longest option in 27 / 71 = 38 % (mildly above chance; still not a usable cue).
**168 / 284 options (59 %) contain a numeral.**

**Does the key require reading ONE value or comparing TWO+?**

| | ONE value read-off | TWO+ values / comparison |
|---|---|---|
| **Overall** | **35 (49 %)** | **36 (51 %)** |
| Table items | 23 | 15 |
| Graph items | 12 | 21 |
| **Easy** | **20** | 6 |
| Medium | 6 | 11 |
| **Hard** | 9 | **19** |

**This is the primary difficulty lever for quantitative items.** Easy ⇒ locate one cell.
Hard ⇒ compare two series across two conditions, or compare two gaps. Graphs skew comparative
(64 %), tables skew single-value (61 %).

### 10.2 Distractor failure catalogue (212 distractor rationales)

| Failure mode | n | % | Rationale signature |
|---|---|---|---|
| **MISREADS THE GRAPHIC — wrong cell, wrong series, wrong tick** | **46** | 22 % | *"according to the table, X is 40 meters tall, **not** 33 meters, which is the height of…"*; *"it inaccurately cites data from the graph"*; *"it misrepresents the data in the table"* |
| **TRUE DATA THAT DOESN'T DO THE JOB** | 22 | 10 % | *"**This accurately describes some data from the graph, but it doesn't weaken the hypothesis.** It doesn't include the 'announcement after election' data for comparison."*; *"Although it accurately represents the data in the table…"* |
| **WRONG VARIABLE / CLAIM MISMATCH** | 19 | 9 % | *"**The claim is about** states experiencing rapid growth…"*; *"The claim is only about government size as…"* |
| **REVERSED INEQUALITY / REVERSED TREND** | 7 | 3 % | *"…which is **greater than, not less than**…"*; *"bananas treated with ethylene ripen **more slowly, not faster**"* |
| **NOT SHOWN / INVENTED VALUE** | 13 | 6 % | *"the graph doesn't show…"*; *"**None of the dolphins in the table have**…"*; *"it doesn't provide the amount of copper mined…"* |
| Scope/partial ("doesn't fully support") | 6 | 3 % | *"This choice doesn't fully support the assertion."* |
| Item-specific prose naming the defect concretely | ~117 | 55 % | (mostly instances of the above stated with actual numbers) |

### 10.3 Five verbatim examples with official rationale reasoning

**(1) VALUE SWAP — cite the right column, wrong row.** ID `0147b080` (Easy, table, key C).
Table: `Pyramids in Egypt and the Americas` | columns `Pyramid · Country · Height (meters) · Age (years before present)` | rows: The Great Pyramid/Mexico/**33**/2,050–2,400 · The Pyramid of Djoser/Egypt/**60**/4,600–4,700 · The Pyramid of Sahure/Egypt/**47**/4,400–4,500 · El Castillo/Belize/**40**/1,100–1,400.
Prose ends: *"…the student finds that el Castillo was built 1,100 to 1,400 years ago and is ______"*
Options: **A.** `33 meters tall.` **B.** `47 meters tall.` **C.** `40 meters tall.` **D.** `60 meters tall.`
> *"Choice A is incorrect because, according to the table, el Castillo is 40 meters tall, **not 33 meters, which is the height of the Great Pyramid in Mexico**."*
> *"Choice B… **not 47 meters, which is the height of the Pyramid of Sahure in Egypt**."*
> *"Choice D… **not 60 meters, which is the height of the Pyramid of Djoser in Egypt**."*
> **This is the purest form of the design: every distractor is another cell of the same column.**

**(2) ROW **AND** COLUMN SWAP (two-error distractors).** ID `75e07a4d` (Easy, table `Sample of Food Items from Gemini Mission Menus`, columns `Food item · Day · Meal`).
> *"Choice A is incorrect because, according to the table, **shrimp cocktail was served on day 4, not day 1**; moreover, the item was **served for meal C, not meal B**, as this choice claims."*
> *"Choice B… **hot cocoa was served on day 3, not on day 1**; moreover, the item was served for **meal A, not for meal C**."*

**(3) TRUE DATA POINT THAT DOESN'T SUPPORT/WEAKEN THE CLAIM — the missing comparison.** ID `a15b3219` (Hard, bar graph, key B). Graph: `Municipalities' Responses to Inquiries about Potential Incentives for Firm [Expansion]`, y = `Number of municipalities` (0–1,300 by 100), 3 categories (`no response`, `responded to inquiry`, `offered incentive`), legend `announcement before election / announcement after election`. Hypothesis: municipalities respond and offer incentives *more* when the announcement lands before an election.
> **Key B:** *"The proportion of municipalities that responded to the inquiry or offered incentives didn't substantially differ across the announcement timing conditions."*
> *"Choice A is incorrect. **This accurately describes some data from the graph, but it doesn't weaken the hypothesis. It doesn't include the 'announcement after election' data for comparison.**"*
> *"Choice C is incorrect. This accurately describes some data from the graph, but… **It doesn't include the 'announcement after election' data for comparison.**"*
> *"Choice D is incorrect. …**It doesn't include the 'announcement before election' data for comparison.**"*
> **Design lesson: for a two-series graph, three distractors can all be true single-series readings; the key is the one that compares the series.**

**(4) WRONG SERIES / WRONG YEARS — misstated trend.** ID `702eb7e3` (Hard, line graph, `Economic Policy Uncertainty in the United Kingdom, 2005–2010`, 3 series).
> *"Choice B is incorrect because **the graph shows that general economic policy uncertainty was higher than uncertainty about tax and public spending policy in 2006, 2007, and 2009, not that it was lower each year from 2005 to 2010**."*
> *"Choice C is incorrect because the graph shows that general economic policy uncertainty reached **its highest level in 2010, which was when uncertainty about tax and public spending policy also reached its highest level, not its lowest level**."*

**(5) REVERSED INEQUALITY AND REVERSED TREND.** ID `040583a5` (Hard, grouped bar graph, key D). Graph: `Banana Ripening Time at Different Temperatures with and without Ethylene Treatment`, y = `Time (days)` 0–12 by 1, x = `Temperature (degrees Celsius)` 14/16/18/20 °C, legend `ethylene / no ethylene`.
> **Key D:** *"ethylene was associated with a greater absolute change in ripening time at 14°C, 16°C, and 18°C than at 20°C."*
> Rationale spells out the gridline arithmetic: *"at 20°C, the gap between the two bars… crosses fewer than 2 gridlines (from about **4** days for ethylene-treated bananas to about **5.5** days for untreated)… at 14°C, 16°C, and 18°C, the gap… crosses more than 2 gridlines (about **8**→**11** at 14°C; **6**→**9.5** at 16°C; **5.5**→**8.5** at 18°C)."*
> *"Choice C is incorrect because… ripening times of ethylene-treated bananas at 14°C and 16°C were about 8 and 6 days… which is **greater than, not less than**, ripening times… at 18°C and 20°C… In other words, bananas treated with ethylene ripen **more slowly, not faster**, at 14°C and 16°C."* (reversed inequality)
> *"Choice B is incorrect because the graph shows that as temperature increases, the ripening time of untreated bananas **decreases**, from about 11 days at 14°C to about 5.5 days at 20°C, **with no exceptions to this trend**."* (false "no association" claim)
> *"Choice A is incorrect because… storing bananas at 20°C **speeds up** ripening time… **not that this storage temperature slows ripening time**."* (reversed causal direction + an unwarranted "ideal storage" recommendation)

---

## 11. NUMERIC DESIGN — HOW THE NUMBERS ARE CHOSEN

**Measured fact: 95 / 127 numeric distractors (75 %) reuse a number that is printed elsewhere in the
same graphic.** This is the central numeric-design principle.

**Rules an author can apply directly:**

1. **Every numeric distractor must be a real value from the graphic, retrieved from the wrong place.**
   Do not invent numbers. Pull them from (a) the adjacent row, (b) the adjacent column, (c) the
   other series, (d) the adjacent time point.
2. **Make each distractor correspond to one *nameable* misreading**, so the rationale can end
   *"…, which is the height of the Pyramid of Sahure in Egypt."* If you cannot name the misreading,
   the distractor is wrong.
3. **Make values unambiguously distinct.** In `0147b080` the heights are 33 / 40 / 47 / 60 — no two
   within 6 units, and none is a round-number attractor. Avoid values a careless reader could
   confuse for a *different* reason than the one you intend.
4. **Put the target row/column in the middle, not first or last.** In the pyramid table el Castillo
   is row 4 of 4 and the correct height (40) is neither the max (60) nor the min (33).
5. **Y-axis gridlines are the unit of measurement for bar/line reading.** Choose increments so the
   key's comparison is ≥2 gridlines and the nearest distractor comparison is ≤1 gridline. Rationales
   literally count gridlines (`040583a5`). Increments observed: 1, 5, 10, 20, 25, 50, 100, 500,
   1,000, 20,000. Always start the y-axis at 0.
6. **State plotted values as "about X"** in your rationale (`about 5.5 days`, `approximately 90 and
   100`) — graph values are read to half a gridline, never exactly.
7. **For a 2-series graph, make three distractors true-but-single-series and the key comparative**
   (the `a15b3219` pattern) when you want Hard. For Easy, invert: make the key a single read-off and
   the distractors other cells of the same column.
8. **For a "weaken" item, the trap is a large, impressive, *uncompared* number** — e.g. *"more than
   1,200 didn't respond and only around 100 offered incentives"* is entirely accurate and entirely
   useless because it covers only one condition.
9. **Reversed-inequality distractors should reuse the key's exact two values with `greater`/`less`
   swapped** — this is the single cheapest Hard distractor and appears throughout.
10. **Percent columns need not sum to 100**; if they do and rounding breaks it, add the one sanctioned
    note: `Rows in table may not add up to 100 due to rounding.`

---

## 12. INFERENCES — STEMS

### 12.1 There is exactly one stem.

> **`Which choice most logically completes the text?`  — 74 / 74 = 100 %.**

No variants. No difficulty-linked variation. This is the most rigid stem in the entire
Reading & Writing section.

*(Do not confuse this with Central Ideas' inferential-detail stems — `Based on the text, …?`,
`What does the text most strongly suggest about X?`. Those are labeled **Central Ideas and Details**
by College Board because the passage has **no blank**. The blank is what makes an item an
Inferences item.)*

---

## 13. THE INFERENCE ENGINE

### 13.1 It is a deductive completion, not a creative leap.

The rationale language proves this. Key-rationale openers across 74 items:
`it presents the conclusion that most logically follows from the text` (7) ·
`it most logically completes the text's discussion of <TOPIC>` (17) ·
`it presents the conclusion that most logically completes the text` (5).
And the reasoning bodies read as syllogisms:

> ID `aaddd60f`: *"Cooling magma would create basalt, but 'a planetary surface that formed in a mostly basaltic environment would be unlikely to contain large amounts of silica.' **Since** Mars's crust does contain large amounts of silica, **it is unlikely that** Mars's crust was formed exclusively by cooling magma. **Therefore**, there were likely other major geological events that created the high silica concentrations."*

**Every distractor in that item is dismissed with the same formula:**
*"The passage never mentions anything about the crusts of other planets, so **there's no basis for this inference**."* (×3)

### 13.2 Logical shapes (non-exclusive tagging, n = 74)

| Shape | n | % | Recognition cue |
|---|---|---|---|
| **(b) A contrast set up earlier constrains the conclusion** | 44 | 60 % | `but` / `however` / `although` / `whereas` / `unlike` in the setup |
| **(a) Study found X and Y ⇒ the mechanism must be Z** | 37 | 50 % | study / experiment / researchers / participants / *"They found that…"* |
| **(d) Conditional or counterfactual** (`reasoning that if P, then ______`) | 8 | 11 % | `if` / `assuming` / `barring` / `suppose` in the blank sentence |
| **(e) Definitional / deductive constraint** (`Since X would be unlikely to Y, …`) | 7 | 9 % | `since` / `because` / `given that` / `means that` / `would be unlikely` in the blank sentence |
| **(c) Unexpected result limits a prior assumption** | 2 | 3 % | `surprisingly` / `long thought` / `previously assumed` |
| untagged (plain narrative or expository chain) | 11 | 15 % | — |

45 items carry exactly one tag, 23 carry two, 6 carry three or more. **Shapes (a) and (b) combine in
the modal item: a study with a contrastive result whose mechanism must be inferred.**

### 13.3 Five verbatim examples

**(1) SHAPE (d) — CONDITIONAL / COUNTERFACTUAL.** ID `09d942c6` (Hard, key B), chicken mirror self-recognition.
> Setup: chickens cry out to warn *others* about predators but stay silent when alone. Two conditions: mirror-only, and real-other-chicken. Hawk image shown in both.
> Blank sentence: *"Hillemacher presented an image of a hawk to the subject in both conditions, **reasoning that if chickens lacked a capacity for visual self-recognition, then ______**"*
> **Key B:** *"the subject likely would cry out a warning in both study conditions."*
> Rationale: *"It follows that if chickens aren't capable of recognizing themselves visually in a mirror, the subject likely would cry out a warning in both conditions; **in the first condition because it would perceive its reflection as another chicken** — that is, it would think another chicken is present — **and in the second condition because it would see that another chicken is actually present**."*
> Distractor **C** (`only the first study condition…`): *"…the text **also** indicates that regardless of their capacity of self-recognition, chickens cry out a warning when other chickens are present… Therefore, **both** conditions — not just the first one — likely would elicit an audible response."* (partial deduction — forgets one premise)

**(2) SHAPE (a) — RESULTS CONSTRAIN THE MECHANISM.** ID `8e6a96f5` (Hard, key C), duckweed ecotypes.
> *"(The researchers did not replicate local differences in light or temperature.) They found that the ecotypes grew equally well in all four water samples and that adding zinc consistently enhanced growth, regardless of concentration, **suggesting that ______**"*
> **Key C:** *"if each ecotype is indeed locally adapted as the researchers hypothesized, those adaptations are to other environmental conditions than the water each ecotype inhabits."*
> Rationale: *"…the experiment found no evidence that these ecotypes have specifically adapted to their local water or their local zinc exposure. **It follows, then, that if each ecotype is actually locally adapted, it is adapted not to the water conditions in its habitat but to other environmental factors** — such as local light or temperature levels, **which the text notes the researchers didn't account for**."*
> **Note the design:** the parenthetical about the *un*controlled variables is planted specifically to license the key. Distractor **A** overreaches (*"those differences do not represent adaptations to local environmental conditions"* → *"suggest only that… don't represent adaptations to local **water** conditions and zinc levels, not… to **any** local environmental conditions"*).

**(3) SHAPE (e) — DEFINITIONAL CONSTRAINT.** ID `aaddd60f` (Hard, key D), Mars crust.
> *"**Since a planetary surface that formed in a mostly basaltic environment would be unlikely to contain large amounts of silica**, Payré concluded that ______"*
> **Key D:** *"Mars's crust likely formed as a result of other major geological events in addition to the cooling of a magma ocean."*
> All three distractors dismissed identically: *"the passage never compares their reliability, so there's no basis for this inference"* / *"never mentions anything about the crusts of other planets"* / *"never mentions Earth's crust."*

**(4) SHAPE (b) — CONTRAST/ENABLING-CONDITION.** ID `20000f5f` (Easy, key C), Sherlock Holmes copyright.
> *"Until 2014, these stories were copyrighted. The right to adapt was only available to those who could afford the copyright fee and gain approval from the strict copyright holders… Some journalists predict that the number of Sherlock Holmes adaptations is likely to increase **since the end of copyright means that ______**"*
> **Key C:** *"producing adaptations will become easier and less expensive."*
> Rationale: *"The text tells us that **because of the copyright, adapting Sherlock Holmes stories used to be expensive and difficult. This suggests that after the copyright ends, it will be less expensive and less difficult**."* — a straight negation of a stated condition.

**(5) SHAPE (a)+(b) — ELIMINATION.** ID `f1bfbed3` (Hard, key B), Mediterranean species censuses.
> *"…a difference only partly attributable to the description of new invertebrate species in the interim. Another factor is that the morphological variability of microorganisms is poorly understood… **Indeed, the two censuses reported similar counts of vertebrate, plant, and algal species, suggesting that ______**"*
> **Key B:** *"some differences observed in microorganisms may have been treated as variations within species by Bianchi and Morri but treated as indicative of distinct species by Coll and colleagues."*
> Rationale: *"…this difference can only be **partly** attributed to new invertebrate species…, **which means there must be an additional factor**… the two censuses reported similar numbers of vertebrate, plant, and algal species, **which means the difference in overall species did not come from those categories**."* — explicit process of elimination.
> Distractor **A** is dismissed because *"the text **explicitly addresses this issue** by stating that the description of new invertebrate species… can explain **only part** of the difference"*; distractor **D** reverses the direction (*under*estimating rather than over-splitting).

---
