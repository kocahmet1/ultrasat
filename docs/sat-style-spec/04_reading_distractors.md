# 04 — Distractor Architecture of Digital SAT *Reading* Items

Reverse-engineered from the College Board's own published rationales. Every quoted item, option, and
rationale below is verbatim from the official sources; the only edits are (a) truncation, marked by
length, and (b) silent repositioning of curly apostrophes that PDF text-extraction dislocated. A handful
of residual apostrophe artifacts (e.g. `colleagues 2010`, `behavior'is`) survive in quoted strings and
should be read through.

## 0. Corpus and method

Primary corpus: the four official question-bank exports (`questionbank-export-2026-8-5 (4)–(7)`), parsed
into **1,200 discrete items**, each with skill tag, difficulty tag, stimulus, four options, key, and
College Board's per-choice rationale. The four practice-test PDFs (Tests 2–5) were checked against this
corpus: every practice-test Reading item sampled also appears in the question bank, so the bank is the
superset and the rationales there are the authoritative statement of CB's reasoning.

In-scope item counts (Reading + Rhetorical Synthesis):

| Skill | N | Easy | Medium | Hard |
|---|---:|---:|---:|---:|
| Words in Context | 166 | 89 | 39 | 38 |
| Text Structure and Purpose | 96 | 28 | 36 | 32 |
| Central Ideas and Details | 78 | 27 | 27 | 24 |
| Inferences | 74 | 10 | 27 | 37 |
| Command of Evidence | 148 | 40 | 43 | 65 |
| Cross-Text Connections | 38 | 6 | 16 | 16 |
| Rhetorical Synthesis | 143 | 26 | 85 | 32 |
| **Total in scope** | **743** | | | |

(The remaining 457 items are Standard English Conventions — Boundaries, Form/Structure/Sense — and
Transitions, which are out of scope here.)

### The one rule that governs every Reading distractor

Across all 2,226 in-scope wrong-answer rationales (3,592 across the whole 1,200-item corpus), CB never once says a distractor is *nonsense*,
*ungrammatical*, or *obviously silly*. Every distractor is a well-formed, meaningful English proposition
that a competent reader could believe. What disqualifies it is always one of exactly four things:

1. **The text does not say it** (no textual warrant).
2. **The text says something adjacent but different** (right topic, wrong relation).
3. **The text says the opposite** (polarity/direction reversed).
4. **It is true and supported but does not do the job the stem asks for** (off-function).

Type 4 is the load-bearing one for the hard items and is almost the *only* mechanism in Rhetorical
Synthesis. An item writer who can only build types 1–3 will produce easy items.

---

## 1. WORDS IN CONTEXT

**N = 166.** Two disjoint subtypes, with radically different architecture:

| Subtype | N | % | Easy/Med/Hard | Stimulus |
|---|---:|---:|---|---|
| **A. Fill-the-blank** — `Which choice completes the text with the most logical and precise word or phrase?` | 140 | 84% | 69/36/35 | contemporary expository prose |
| **B. As-used-in-the-text** — `As used in the text, what does the word "X" most nearly mean?` | 26 | 16% | 20/3/3 | 100% literary / period prose |

Stem wording is essentially frozen: 140/140 fill-the-blank items use the identical sentence above;
as-used items vary only in `word` vs `phrase` and the quoted target.

### 1.1 What kind of vocabulary is actually tested

**Common words used precisely, not hard words.** The keyed answers, sorted by CB's own difficulty tag:

- **Easy (69 keys):** `abrupt`, `accidental`, `acknowledged`, `adapt to`, `attributed to`, `available`, `categorize`, `collaboration`, `complexity`, `comprehend`, `consistent`, `creating`, `defied`, `demonstrating`, `depended on`, `dominance`, `effective`, `efficient`, `embraced`, `exemplifies`, `exposure to`, `extensive`, `featured`, `fragile`, `handmade from`, `healthy`, `impede`, `important`, `inadequate`, `inexperienced with`, `influenced`, `inspecting`, `instituting`, `interpret`, `involuntarily`, `involved in`, `justify`, `melodic`, `newfound`, `observant`, `obtain`, `offered`, `overlook`, `patterns`, `persistent`, `predicted`, `preserving`, `preventable`, `protect`, `provide`, `provide`, `rarely`, `reflect`, `reforms`, `replenishes`, `reputation for`, `requires`, `sensitive`, `simulate`, `spans`, `speculates`, `successful`, `suppress`, `traced`, `tranquil`, `transformed`, `validate`, `vivid`, `widespread`

- **Medium (36 keys):** `ambivalence toward`, `an overtly`, `anomaly`, `atypical`, `catalyst of`, `commonalities with`, `competent`, `comprises`, `concede`, `confirm`, `conform to`, `created`, `diminish`, `dormant`, `esteem`, `exactitude`, `fluctuations in`, `haphazard`, `impenetrable`, `intangible`, `integral`, `integral`, `invalidate`, `irrelevant`, `marginalize`, `neglect`, `proponent of`, `receptive to`, `recognizable`, `rectify`, `reduced`, `reuse`, `rudimentary`, `scale`, `transcending`, `uniform`

- **Hard (35 keys):** `ambiguity`, `an arduous`, `an exhaustive`, `concentrated among`, `conjectures`, `corroborate`, `counterfactual`, `demarcated from`, `discern`, `diverse`, `dogmatic`, `elasticity`, `engendering`, `exploited`, `foster`, `homogeneous`, `impending`, `independent of`, `inertia`, `innocuous`, `latent`, `mediated by`, `notional`, `opaque`, `optimize`, `overshadowed by`, `peripheral`, `proxies for`, `prudent`, `repudiates`, `sanguine`, `stymie`, `surmised`, `tenuous`, `variable`

Read that list from the item-writer's side: the Easy band is entirely ordinary words (`protect`,
`healthy`, `successful`, `important`, `provide`, `rarely`, `patterns`) — the difficulty is *not lexical*,
it is the precision of the fit. Only the Hard band recruits genuinely low-frequency words (`sanguine`,
`stymie`, `notional`, `engendering`, `demarcated from`, `dogmatic`, `repudiates`), and even there roughly
half the keys are common (`diverse`, `foster`, `variable`, `discern`, `opaque`, `prudent`).

**Rule:** target hard *fit*, not hard *words*. Hard vocabulary is a difficulty lever of last resort and
is used in fewer than half of Hard items.

### 1.2 Option-set shape (hard formal constraints)

- **116/140 (83%)** of fill-the-blank items have all four options as *single words*.
- **22/140 (16%)** have all four options as *two-word verb/noun + preposition* phrases (`handmade from`, `catalyst of`, `receptive to`, `concentrated among`).
- The two shapes are **never mixed inside one item**. All four options are always the same syntactic category and same length class.
- When the phrasal shape is used, the four options carry **four different prepositions** (0/140 items repeat a single preposition across all four). The preposition is part of the test.
- All four options are grammatically substitutable into the blank. Grammar is never the discriminator.

### 1.3 The four-option architecture — hypothesis tested and revised

The proposed architecture (one wrong-sense synonym + one topical associate + one near-opposite) is
**not** CB's default. Measuring at item level against CB's own rationale language (n = 140 items,
419 distractors):

| Distractor property | Items containing ≥1 such distractor |
|---|---:|
| Definition-misfit — a real word whose actual meaning yields a proposition the sentence does not license | 123/140 (88%) |
| Simply unsupported — meaning is fine, text never asserts it | 71/140 (51%) |
| Topical associate — CB concedes "Although the text discusses X…" | 46/140 (33%) |
| Near-opposite / polarity reversal — CB says "would contradict" / "the opposite" | 36/140 (26%) |
| **All three of {reversal, topical, wrong-sense} present in one item** | **9/140 (6%)** |

Per-item type signatures (each letter = one distractor): the single most common signature is
**three definition-misfits** (20/140), then mixed misfit+unsupported. The neat one-of-each triad is rare.

**Revised architecture (this is the mechanical rule):**

```
KEY        : the single word whose dictionary sense makes the stimulus's logical relation come out true.
DISTRACTOR : a real, glossable word of the same syntactic shape and same register, whose dictionary
             sense makes the stimulus's logical relation come out FALSE, UNSUPPORTED, or BACKWARD.
```

The generator is **the gloss test**: 227/419 (54%) of CB's wrong-answer rationales *explicitly define the
distractor* inside the rationale — `"sponsor of," or an entity who takes on responsibility for`;
`"relocate from," or physically move from one place to another`; `"waive" means to refrain from
insisting…`. If you cannot write a one-clause dictionary gloss for your distractor and then show that
the gloss fails against the stimulus, the distractor is not built correctly.

Sub-mechanisms, ordered by how CB actually deploys them:

| # | Mechanism | How it reads in CB's rationale | Deploy |
|---|---|---|---|
| D1 | **Definition-misfit.** Right register, right collocation, wrong denotation. | "…would mean X, which wouldn't make sense in context" | 2–3 per item, always |
| D2 | **Under-strength / imprecise.** The word is *directionally* right but too weak or too general. | "would mean to emphasize or call attention to…, but the text indicates Walker took concrete steps beyond merely drawing attention" | 1 per item at Medium/Hard |
| D3 | **Polarity reversal.** Correct semantic field, inverted direction. | "would contradict the text" | 26% of items |
| D4 | **Topical associate.** Lifted from the stimulus's subject matter; sounds on-topic. | "Although the text discusses…, nothing in the text suggests…" | 33% of items |
| D5 | **Wrong-entity attribution.** The predicate is true of a *different* actor in the stimulus. | "it's Logan and not the economic historians who 'questioned'…" | 9/419 |

### 1.4 Verbatim option sets (key in bold)

**`84b5125b` (Easy)** — Artist Marilyn Dingle's intricate, coiled baskets are ______ sweetgrass and palmetto palm. Following a Gullah technique that originated in West Africa, Dingle skillfully winds a thin palm frond around a bunch of sweetgrass with the help of a "sewing bone" to create the basket's signature look that no factory can reproduce.
  - indicated by / **handmade from** / represented by / collected with  → key in **bold**
  - *Phrasal shape; all four are V+prep with four different prepositions. D1×3.*

**`dc0bca21` (Easy)** — It would be a mistake to ______ the exhibit that artist and curator Joe Baker, who is a member of the Lenape (Delaware) people, has organized at the Brooklyn Public Library. The exhibit, which includes Lenape beadwork from the 1850s as well as modern works that use traditional patterns, is essential viewing.
  - complicate / amplify / **overlook** / assemble  → key in **bold**
  - *Frame: "It would be a mistake to ___" + evaluative second sentence ("essential viewing"). "amplify" is the D3 reversal.*

**`a318c1ef` (Easy)** — The Cambrian explosion gets its name from the sudden appearance and rapid diversification of animal remains in the fossil record about 541 million years ago, during the Cambrian period. Some scientists argue that this ______ change in the fossil record might be because of a shift in many organisms to body types that were more likely to be preserved.
  - catastrophic / elusive / **abrupt** / imminent  → key in **bold**
  - *"sudden appearance and rapid diversification" in sentence 1 is the paraphrase that fixes the key. "catastrophic" is the D4 topical associate of "explosion"; "imminent" is a near-miss on the temporal dimension.*

**`e1d5d5df` (Easy)** — According to botanists, a viburnum plant experiencing insect damage may develop erineum — a discolored, felty growth — on its leaf blades. A ______ viburnum plant, on the other hand, will have leaves with smooth surfaces and uniformly green coloration.
  - struggling / beneficial / simple / **healthy**  → key in **bold**
  - *"on the other hand" forces the polarity flip; "struggling" is the D3 reversal that a careless reader picks.*

**`a1139ff8` (Easy)** — In the 1990s, conservationists began planting more than 500,000 native trees in the habitat of the Azores bullfinch to boost the bird's numbers. This approach was apparently ______: the Azores bullfinch's population size increased from as few as 100 birds at the end of the 1980s to around 1,300 in 2023.
  - amusing / costly / **successful** / disastrous  → key in **bold**
  - *Colon-restatement: the clause after the colon *is* the definition of the key. "disastrous" = D3, "costly" = D4.*

**`f6d1f735` (Easy)** — Researchers have struggled to pinpoint specific causes for hiccups, which happen when a person's diaphragm contracts ______. However, neuroscientist Kimberley Whitehead has found that these uncontrollable contractions may play an important role in helping infants regulate their breathing.
  - **involuntarily** / beneficially / strenuously / smoothly  → key in **bold**
  - *"uncontrollable contractions" in the next sentence is the restatement. "smoothly" = D3; "beneficially" = D4 lifted from "play an important role".*

**`1c7fe9be` (Medium)** — At the turn of the twentieth century, Black residents of Richmond, Virginia, had few formal options for banking and other financial services. To ______ this situation, Maggie Lena Walker chartered the St. Luke Penny Savings Bank in 1903. The bank went on to provide home loans and savings opportunities to thousands of Black families over the following decades.
  - prolong / **rectify** / retain / highlight  → key in **bold**
  - *Purpose frame "To ___ this situation" + a described remedy. "prolong"/"retain" = D3 pair; "highlight" = D2 under-strength.*

**`3f37eb3b` (Medium)** — People sometimes dismiss a claim if it comes from a source they regard as self-interested, but from a strictly logical perspective, the source of a claim is ______: it has no direct bearing on whether the claim is true.
  - indistinct / **irrelevant** / indisputable / implicit  → key in **bold**
  - *All four options are i-initial adjectives — deliberate morphological camouflage. The colon supplies the definition ("it has no direct bearing on whether the claim is true").*

**`be612a26` (Medium)** — Recent measurements of the mass of the W boson (a subatomic particle) were notable not only for the mere fact that the particle's mass differed from expectations but for the ______ of that difference: the measured mass of the W boson was seven standard deviations higher than predicted by the standard model of particle physics.
  - cause / existence / implication / **scale**  → key in **bold**
  - *"not only for the mere fact that…but for the ___" explicitly rules out "existence"; the colon then quantifies. Key is a common word used precisely.*

**`1107e7dc` (Medium)** — Economists often assert that countries looking to increase their reliance on solar energy should expand their capacity for storage; having an ample reserve of stored energy can mitigate the effects of ______ solar energy collection caused by unpredictable shifts in cloud cover and haze.
  - developments of / **fluctuations in** / calibrations with / incentives for  → key in **bold**
  - *Phrasal shape. "caused by unpredictable shifts" is the restatement that fixes "fluctuations in".*

**`dd0aada1` (Medium)** — Science fiction has long served as a ______ real-world technological advancements. Indeed, from Jules Verne's 1865 novel From the Earth to the Moon inspiring developments in aerospace engineering to the television show Star Trek sparking the design of the ancestor of today's smartphones, these narratives have spurred many actual innovations.
  - constraint to / sponsor of / **catalyst of** / diversion from  → key in **bold**
  - *Exemplification cue ("Indeed, from…to…"), reinforced by three synonyms of the key in the evidence sentence: inspiring / sparking / spurred.*

**`15daaded` (Hard)** — Among saltwater fish species, there is a clear association between habitat latitude and morphological variety. While tropical species are ______ deep-bodied physical forms (body shapes that are laterally compressed but vertically extended), polar and temperate species are highly dispersed across the morphological spectrum.
  - authenticated by / habituated to / contemporary with / **concentrated among**  → key in **bold**
  - *"While tropical species are ___, polar and temperate species are highly dispersed across the morphological spectrum" — the contrast forces the antonym of "dispersed".*

**`3d658a5a` (Hard)** — Some foraging models predict that the distance bees travel when foraging will decline as floral density increases, but biologists Shalene Jha and Claire Kremen showed that bees behavior'is inconsistent with this prediction if flowers in dense patches are ______: bees will forage beyond patches of low species richness to acquire multiple resource types.
  - depleted / **homogeneous** / immature / dispersed  → key in **bold**
  - *Colon after the blank supplies the condition; key is a genuinely hard word but the colon makes it determinable.*

**`dba9eaf8` (Hard)** — Within baleen whale species, some individuals develop an accessory spleen — a seemingly functionless formation of splenetic tissue outside the normal spleen. Given the formation s greater'prevalence among whales known to make deeper dives, some researchers hypothesize that its role isn't ______; rather, the accessory spleen may actively support diving mechanisms.
  - replicable / predetermined / operative / **latent**  → key in **bold**
  - *NOT-X-BUT-Y frame: "its role isn't ___; rather, the accessory spleen may actively support diving mechanisms." Key must be the antonym of "actively support".*

**`e26d23c4` (Hard)** — Proposals to raise the age at which retirees begin receiving government transfers of funds are generally discussed in terms of the effects on transfer recipients, but Andria Smythe has argued that delaying such transfers could ______ wealth creation among working adults by lengthening the period in which they are providing financial support to their nonworking parents.
  - **stymie** / compound / disparage / outstrip  → key in **bold**
  - *"by lengthening the period in which they are providing financial support" supplies the causal direction; "compound" is the D3 reversal.*

Two as-used-in-the-text sets, where the wrong-sense architecture *is* the design:

**`359902ae` — Words in Context — Medium**

> The following text is adapted from Nathaniel Hawthorne's 1837 story "Dr. Heidegger's Experiment." The main character, a physician, is experimenting with rehydrating a dried flower. At first [the rose] lay lightly on the surface of the fluid, appearing to imbibe none of its moisture. Soon, however, a singular change began to be visible. The crushed and dried petals stirred and assumed a deepening tinge of crimson, as if the flower were reviving from a deathlike slumber. As used in the text, what does the phrase "a singular" most nearly mean?

- A. A lonely
- B. A disagreeable
- C. An acceptable
- **D. An extraordinary**  **[KEY]**

CB rationale (condensed):
  - `x A` Although in some contexts "singular" can mean of or relating to an individual or to a single instance of something, this usage doesn't imply loneliness or an otherwise unsatisfactory condition of isolation. Mor
  - `x B` Although "singular" has several related meanings, none of them relate to being disagreeable or unpleasant. Moreover, the text doesn't portray the change undergone by the rose as necessarily disagreeable.
  - `x C` "singular" means extraordinary, not acceptable. The change is portrayed as striking, not barely satisfactory.

**`45a109a3` — Words in Context — Easy**

> The following text is from Bram Stoker's 1897 novel Dracula . The narrator is being driven in a carriage through a remote region at night. The baying of the wolves sounded nearer and nearer, as though they were closing round on us from every side. I grew dreadfully afraid, and the horses shared my fear. The driver, however, was not in the least disturbed; he kept turning his head to left and right, but I could not see anything through the darkness. As used in the text, what does the word "disturbed" most nearly mean?

- A. Disorganized
- **B. Alarmed**  **[KEY]**
- C. Offended
- D. Interrupted

CB rationale (condensed):
  - `x A` Although in some contexts, "disturbed" can mean disorganized, the text doesn't portray a character acting in a disorganized manner; instead, the driver continues to drive the carriage, even though the horses pu
  - `x C` Although in some contexts, "disturbed" can mean offended, the text doesn't portray one character feeling offended, or upset, by another's actions; instead, it contrasts the fear felt by the narrator with anothe
  - `x D` Although in some contexts, "disturbed" can mean interrupted, the text doesn't portray an action being interrupted; indeed, the travel depicted in the scene continues despite the threat of the wolves outside the

**`84ece3f6` — Words in Context — Easy**

> The following text is adapted from Nathaniel Hawthorne's 1844 short story "Drowne's Wooden Image." Drowne, a young man, is carving a wooden figure to decorate the front of a ship. Day by day, the work assumed greater precision, and settled its irregular and misty outline into distincter grace and beauty. The general design was now obvious to the common eye. As used in the text, what does the word "assumed" most nearly mean?

- **A. Acquired**  **[KEY]**
- B. Acknowledged
- C. Imitated
- D. Speculated

CB rationale (condensed):
  - `x B` Although in some contexts "assumed" can mean acknowledged, or recognized, it doesn't have that meaning in this context because an inanimate object like the wooden figure can't acknowledge its own precision.
  - `x C` there's nothing in the text to suggest that the wooden figure merely imitated, or mimicked, precision. Rather, the text suggests that as Drowne carved his wooden figure, it gradually became more precise.
  - `x D` Although in some contexts "assumed" can mean speculated, or supposed based on incomplete information, it doesn't have that meaning in this context because an inanimate object like the wooden figure can't specul

In this subtype **29/78 (37%)** of wrong-answer rationales open with the formula *"Although in some
contexts 'X' can mean Y…"* — CB is explicitly telling you the distractor is a **real alternate sense of
the same polysemous headword**. That is the design: pick a polysemous common word (`assumed`, `clear`,
`spread`, `contracted`, `quality`, `simply`, `trace`, `reserve`, `manifest`), key one sense, and use two
or three of its *other* real senses as distractors. The full target list in the corpus:

`a singular`, `a void`, `answers`, `assumed`, `beckoning`, `clear`, `completing`, `consideration`, `contracted`, `disputing`, `disturbed`, `manifest`, `marked`, `quality`, `reaching`, `receiving`, `reconcile his mother to`, `rough`, `sheltering`, `simply`, `specific`, `spread`, `suggestion`, `supported`, `trace`

### 1.5 How the stimulus makes the answer *determinable* — cue templates with frequencies

Stimulus geometry: **median 51 words** (range 28–81); **86/140 are exactly two sentences**, 36 are one
sentence, 18 are three or more. The blank sits mid-stimulus in 66/140, in the final third in 40, in the
first third in 34. The structure is invariant in function: **one clause states the proposition with a
hole in it; another clause states the same proposition in different words.**

Priority-coded cue templates (each item assigned its single strongest cue, n = 140):

| # | Cue template | N | % | Shape |
|---|---|---:|---:|---|
| 1 | **Contrast connector** — `however, but, although, while, whereas, yet, despite, unlike, in contrast, on the other hand, instead, rather than` | 46 | 33% | Blank sits on one side of a contrast; the other side names the opposite property. Key = antonym of the stated side. |
| 2 | **Bare paraphrase** — no connective; the adjacent sentence simply restates the idea in other words | 37 | 26% | Sentence 2 re-describes the blanked relation with concrete detail (`skillfully winds… no factory can reproduce` → `handmade from`). |
| 3 | **Colon restatement** — `X is ______: [clause that defines the blank]` | 28 | 20% | The post-colon clause is a *definition* of the key. Highest-yield template; produces the cleanest single-answer defensibility. |
| 4 | **Causal chain** — `thus, therefore, because, since, so, as a result, consequently, due to, enabling` | 15 | 11% | Blank is a link in a stated cause→effect chain; key is forced by the direction of the arrow. |
| 5 | **Exemplification** — `indeed, for example, for instance, such as, in fact` | 10 | 7% | Examples instantiate the blanked category; key is the category label the examples share. |
| 6 | **NOT-X-BUT-Y** — `isn't ______; rather, …` / `not ______ but …` | 2 | 1% | Key is the explicit antonym of the post-`rather` clause. |
| 7 | **Dash appositive** — `______ — [gloss] —` | 2 | 1% | Same as 3, with dashes. |

Raw connective presence (non-exclusive, so it sums past 100%): contrast markers appear somewhere in
**62/140 (44%)** of stimuli; restatement punctuation in 40 (29%); negation near the blank in 28 (20%);
causal markers in 21 (15%); exemplification in 17 (12%); comparatives in 16 (11%).

**Determinability rule.** Do not rely on the reader's prior sense of the word. The stimulus must contain
a *second, independent statement of the same proposition* — a definition after a colon, a contrast that
names the opposite, an example set that names the category, or a paraphrase. If you delete the blanked
word, a competent reader must still be able to state the missing meaning in their own words. That is
what makes exactly one option defensible and is why CB's rationales can always say *"the text indicates
that…"* and quote a phrase.

---

## 2. TEXT STRUCTURE AND PURPOSE

**N = 96.** Three subtypes, cleanly separated by stem and by option grammar.

| Subtype | N | Exact stem wording (frequency) | Option opening |
|---|---:|---|---|
| (a) Main purpose | 33 | `Which choice best states the main purpose of the text?` (25) · `Which choice best describes the main purpose of the text?` (2) · `What choice best describes the main purpose of the text?` (1) · `Which choice best describes the overall purpose of the text?` (2) | **`To` + infinitive** (108/132 options) |
| (b) Overall structure | 22 | `Which choice best describes the overall structure of the text?` (19+) | **`It` + present-tense verb** (72/88); literary texts use **`The speaker/The text` + verb** (16/88) |
| (c) Function | 39 | `Which choice best describes the function of the underlined portion in the text as a whole?` (16) · `…the underlined sentence in the text as a whole?` (11) · `Which choice best states the function of the underlined portion in the text as a whole?` (2) · `…the function of the underlined sentence?` (2) · variants for `underlined question`, `underlined phrase`, `underlined statement`, `the second/first/third sentence in the overall structure of the text` (1 each) | **`It` + present-tense verb** (144/156) |

**Grammatical parallelism is absolute.** Within an item, all four options open with the same word and
the same tense. Nothing about the surface form distinguishes the key.

### 2.1 (a) MAIN PURPOSE — option architecture

Each option is a single `To [rhetorical verb] [object NP]` clause. The rhetorical verb names a *speech
act* (describe, explain, summarize, argue, evaluate, compare, introduce, illustrate, convey, justify,
suggest, capture, provide an overview of); the object NP names *what the text is about*. **The key must
be right on both axes; each distractor is wrong on exactly one.**

| Wrong-option build | Diagnostic in CB's rationale |
|---|---|
| **W1. Right content, wrong speech act** — the text does describe X, but it does not *evaluate* / *argue* / *compare* / *suggest improvements to* X. | "the text doesn't evaluate a scholarly work but rather simply describes it" |
| **W2. Right speech act, wrong content** — the verb is right; the object NP is a detail, a neighbouring topic, or a distortion. | "the text's main purpose isn't to provide an overview of the employment challenges…" |
| **W3. True but not the point** — an accurate statement about something the text *mentions* in one clause, promoted to purpose. | "Although the text mentions… it doesn't discuss…" |
| **W4. Overreach** — imports an evaluative or causal claim the text never makes (`unexpected`, `surprised`, `widely held belief`, `qualms`). | "The text also never categorizes Flewellen's findings as 'unexpected'" |
| **W5. Polarity flip on the content** — states the inverse of the text's claim while keeping every content word. | "The text actually explains that Black female farmworkers were trying to achieve traditional feminine ideals, not resist them" |

W4 and W5 are the ones that make Hard items. Note W5 in `d4732483` below: choice B reuses *every*
content noun of the key and flips one verb.

**`82cb7dda` — Text Structure and Purpose — Hard**

> The field of study called affective neuroscience seeks instinctive, physiological causes for feelings such as pleasure or displeasure. Because these sensations are linked to a chemical component (for example, the release of the neurotransmitter dopamine in the brain when one receives or expects a reward), they can be said to have a partly physiological basis. These processes have been described in mammals, but Jingnan Huang and his colleagues have recently observed that some behaviors of honeybees (such as foraging) are also motivated by a dopamine-based signaling process. What choice best describes the main purpose of the text?

- A. It describes an experimental method of measuring the strength of physiological responses in humans.
- B. It illustrates processes by which certain insects can express how they are feeling.
- **C. It summarizes a finding suggesting that some mechanisms in the brains of certain insects resemble mechanisms in mammalian brains.**  **[KEY]**
- D. It presents research showing that certain insects and mammals behave similarly when there is a possibility of a reward for their actions.

CB rationale (condensed):
  - `x A` the text doesn't describe any experiments or experimental methods. Instead, the text describes a phenomenon that has been observed in mammals and then presents the recent observations of Huang and colleagues that this phenomenon is also seen in honeybees.
  - `x B` there's nothing in the text to suggest that certain insects can express how they're feeling through particular processes. The text does indicate that certain honeybee behaviors such as foraging are linked to dopamine, but it doesn't suggest that these behaviors enable h
  - `x D` the text presents research showing that certain honeybee behaviors such as foraging are linked to dopamine and therefore may be motivated by similar mechanisms to those in mammalian brains, not that honeybees and mammals behave similarly when there is the possibility of

**`2af2016f` — Text Structure and Purpose — Medium**

> A study by Dr. Paul Hanel and colleagues concluded that people are more likely to behave politely when listening to ideas they disagree with if they think about values before they engage in a discussion. Study participants were assigned to one of two groups. The experimental group spent a few minutes writing about one of their personal values before they had a group discussion on a controversial topic. And the control group spent a few minutes writing about a drink (tea, milk, etc.) before their group discussion on that topic. Hanel and colleagues found that the ' ' experimental group s discussion was more civil than the control group s discussion was. Which choice best describes the main purpose of the text?

- A. To describe a widely held belief and how a study s results'support that belief
- B. To argue that researchers were surprised by the results of a certain study
- C. To suggest ways to improve a certain study s'experimental design
- **D. To explain a study s'conclusion and how a research team arrived at that conclusion**  **[KEY]**

CB rationale (condensed):
  - `x A` Although the text discusses the results of a study, it doesn't provide any indication that the conclusion the study supported —that when facing disagreement, people behave more politely when they have thought about their values — is a belief that is widely held.
  - `x B` the text doesn t'indicate that the researchers found the results of their study to be surprising, or contrary to what they ' ' expected. In fact, there s no indication provided in the text about how the researchers felt about the study s results or that the results shou
  - `x C` Although the text discusses the experimental design of a study, it doesn t'suggest any improvements to that design; instead, it focuses on how the design enabled the researchers to draw a particular conclusion.

**`b13378c8` — Text Structure and Purpose — Medium**

> Early in the Great Migration of 1910 – 1970, which involved the mass migration of Black people from the southern to the northern United States, political activist and Chicago Defender writer Fannie Barrier Williams was instrumental in helping other Black women establish themselves in the North. Many women hoped for better employment opportunities in the North because, in the South, they faced much competition for domestic employment and men tended to get agricultural work. To aid with this transition, Barrier Williams helped secure job placement in the North for many women before they even began their journey. Which choice best states the main purpose of the text?

- **A. To introduce and illustrate Barrier Williams's integral role in supporting other Black women as their circumstances changed during part of the Great Migration**  **[KEY]**
- B. To establish that Barrier Williams used her professional connections to arrange employment for other Black women, including jobs with the Chicago Defender
- C. To demonstrate that the factors that motivated the start of the Great Migration were different for Black women than they were for Black men
- D. To provide an overview of the employment challenges faced by Black women in the agricultural and domestic spheres in the southern United States

CB rationale (condensed):
  - `x B` Although the text mentions Barrier Williams s work as a political activist and writer for the Chicago Defender, it doesn t discuss any professional connections she made in these roles or indicate that she used any such connections in her work to secure employment for ot
  - `x C` Although the text discusses a factor that caused many women to relocate during the Great Migration, their difficulty finding employment in the South, the text doesn't indicate that this factor motivated the start of the Great Migration. Moreover, the text doesn't discus
  - `x D` Although the text mentions the difficult employment prospects for Black women in the domestic and agricultural sectors in the South during the Great Migration, the text s main'purpose isn't to provide an overview of the employment challenges Black women faced in these s

**`d4732483` — Text Structure and Purpose — Hard**

> Studying late nineteenth- and early twentieth-century artifacts from an agricultural and domestic site in Texas, archaeologist Ayana O. Flewellen found that Black women employed as farm workers utilized hook-and-eye closures to fasten their clothes at the waist, giving themselves a silhouette similar to the one that was popular in contemporary fashion and typically achieved through more restrictive garments such as corsets. Flewellen argues that this sartorial practice shows that these women balanced hegemonic ideals of femininity with the requirements of their physically demanding occupation. Which choice best states the main purpose of the text?

- A. To describe an unexpected discovery that altered a researcher's view of how rapidly fashions among Black female farmworkers in late nineteenth- and early twentieth-century Texas changed during the period
- B. To discuss research that investigated the ways in which Black female farmworkers in late nineteenth- and early twentieth-century Texas used fashion practices to resist traditional gender ideals
- C. To evaluate a scholarly work that offers explanations for the impact of urban fashion ideals on Black female farmworkers in late nineteenth- and early twentieth-century Texas
- **D. To summarize the findings of a study that explored factors influencing a fashion practice among Black female farmworkers in late nineteenth- and early twentieth-century Texas**  **[KEY]**

CB rationale (condensed):
  - `x A` The text never discusses the rate of fashion change among Black female farmworkers. The text also never categorizes Flewellen's findings as "unexpected."
  - `x B` The text actually explains that Black female farmworkers were trying to achieve traditional feminine ideals, not resist them.
  - `x C` The text doesn't evaluate a scholarly work but rather simply describes it. Furthermore, the text is focused on "agricultural and domestic" fashion, not urban fashion as this choice suggests.

**`d9915c15` — Text Structure and Purpose — Hard**

> In 2020, rap artist and professor A.D. Carson published the first peer-reviewed rap album about his experiences with Black masculinity called "i used to love to dream." Typically in peer review, experts evaluate scholarly articles prior to publication. For Carson's album, dubbed a "mixtap/e/ssay," peer review involved both scholars and rap artists. In combining elements of a mixtape album with scholarly essays that connect Carson's lyrics to historical and contemporary contexts for listeners both inside and outside academia, Carson's album helped redefine how scholarship is created and shared. Which choice best states the main purpose of the text?

- A. To compare the relative public impact of scholarly articles and albums
- B. To capture one scholar's opinion of a new rap album
- **C. To explain why a certain rap album is particularly innovative**  **[KEY]**
- D. To describe how each step of the peer review process unfolds

CB rationale (condensed):
  - `x A` though the text mentions an album that combines elements of scholarly essays and mixtapes, it does not compare the relative public impact of scholarly articles and albums.
  - `x B` the text does not present the opinion of a scholar regarding the rap album.
  - `x D` though the text mentions that the album was peer reviewed, it does not detail the steps of the review.

**`5f56fdec` — Text Structure and Purpose — Hard**

> The following text is from George Marion McClellan s 1895'poem " " Eternity. My spirit swoons, and all my senses cry For Ocean s'breast and covering of the sky. Rock me to sleep, ye waves, and outward bound, Just let me drift far out from toil and care, Where lapping of the waves shall be the sound, Which mingled with the winds that gently bear Me on between a peaceful sea and sky, To make my soothing slumberous lullaby. Which choice best states the main purpose of the text?

- A. To illustrate the increasing intensity of the speaker s'desire to escape ongoing hardship by gliding on the ocean
- B. To contrast the demands of the speaker s'everyday life with the serenity of being rocked to sleep by the ocean
- **C. To convey the speaker s'longing for the ocean to impart a sense of inner tranquility**  **[KEY]**
- D. To justify the speaker's qualms about being transported by the ocean to a quiet destination

CB rationale (condensed):
  - `x A` Given the poem s'expression of a longing to achieve tranquility by drifting on the ocean, it can be inferred that the speaker desires to escape something unpleasant in daily life. However, the poem doesn t refer'directly to any such hardship — ongoing or otherwise. And
  - `x B` The speaker does express a desire for the serenity of being rocked to sleep by the ocean, and it can ' ' be inferred that this desire is a response to demands that make the speaker s daily life stressful. However, the poem doesn t refer directly to such demands or contr
  - `x D` the text doesn t'suggest the speaker has any qualms, or reservations, about being transported by the ocean. On the contrary, the speaker actively desires to "drift far out" and be carried by the waves and wind. Moreover, the poem doesn t'suggest that this drifting would

### 2.2 (b) OVERALL STRUCTURE — option architecture

Each option is a **move-sequence skeleton**: `It [V1]s [NP1], then [V2]s [NP2].` (two moves) or
`It [V1]s [NP1], [V2]s [NP2], and then [V3]s [NP3].` (three moves, used in the Hard band). All four
options carry the *same number of moves*. The distractors are built by holding the skeleton fixed and
substituting content in one or both slots.

| Wrong-option build | Diagnostic |
|---|---|
| **S1. Right first move, wrong second move** — the text does introduce X, but the second half is not what the option claims. | "The text doesn't present a hypothesis, but rather reports on the findings of a study." |
| **S2. Both moves plausible, neither performed** — a generic academic arc (`presents two views, then adjudicates`) that the text does not actually execute. | "The text doesn't compare two different methods, but rather focuses on one study…" |
| **S3. Invented third party** — asserts a challenge, a reception, a critique, or an alternative that the text never introduces. | "The text doesn't mention any scientists challenging the conclusion…" |
| **S4. Wrong grain** — describes a real move but at the level of a single sentence, or generalizes one clause into a whole arc. | "Although the text discusses companies offering something consumers like…, it doesn't characterize this as a product-marketing technique." |
| **S5. Right arc, wrong scope of comparison** — the comparison the text makes is *within* one thing; the option claims it is *between* two things (or vice versa). | "both approaches are for making the same type of textile (batik). No other type of textile is" [discussed] |

**`2903a041` — Text Structure and Purpose — Easy**

> Using NASA's powerful James Webb Space Telescope (JWST), Mercedes L ópez-Morales and colleagues measured the wavelengths of light traveling through the atmosphere of WASP-39b, an exoplanet, or planet outside our solar system. Different molecules absorb different wavelengths of light, and the wavelength measurements showed the presence of carbon dioxide (CO₂) in WASP-39b's atmosphere. This finding not only offers the first decisive evidence of CO₂ in the atmosphere of an exoplanet but also illustrates the potential for future scientific breakthroughs held by the JWST. Which choice best describes the overall structure of the text?

- A. It discusses a method used by some researchers, then states why an alternative method is superior to it.
- **B. It describes how researchers made a scientific discovery, then explains the importance of that discovery.**  **[KEY]**
- C. It outlines the steps taken in a scientific study, then presents a hypothesis based on that study.
- D. It examines how a group of scientists reached a conclusion, then shows how other scientists have challenged that conclusion.

CB rationale (condensed):
  - `x A` The text doesn't compare two different methods, but rather focuses on one study that used the JWST.
  - `x C` The text doesn't present a hypothesis, but rather reports on the findings of a study.
  - `x D` The text doesn't mention any scientists challenging the conclusion reached by L ópez-Morales and colleagues.

**`805e361d` — Text Structure and Purpose — Easy**

> Companies are providing consumers with more opportunities to purchase customized products than ever before. Whether buying customized sneakers, jewelry, or clothing, consumers can participate in the design of products to meet their specific needs and tastes. In turn, companies profit too: studies have shown that consumers are willing to pay more and wait longer for a customized product. Still, it can be difficult for companies to offer customization while keeping costs low, as the standard methods of mass production may not be able to accommodate making a unique product each time. Which choice best describes the overall structure of the text?

- A. It discusses several recent innovations in product manufacturing and then suggests some potential applications of those innovations.
- B. It describes a company's recent success with new products and then explains multiple factors that may have contributed to that success.
- **C. It introduces a trend in consumer products and then explains how the trend both benefits and poses a challenge to companies.**  **[KEY]**
- D. It presents two contrasting product-marketing techniques and then provides examples of one of those techniques.

CB rationale (condensed):
  - `x A` the text doesn't present the customization of various products as a recent innovation — the fact that there are "more opportunities" now indicates that there were opportunities before —and no other innovations, in product manufacturing or otherwise,
  - `x B` the text doesn t'discuss any particular company or example and instead speaks broadly about the trend of companies providing customizable products.
  - `x D` Although the text discusses companies offering something that consumers like and are willing to pay more for — the ability to customize products — ' it doesn t characterize this as a product-marketing technique and doesn t'compare it to any other kin

**`190857f0` — Text Structure and Purpose — Easy**

> Why do sand cats purr but lions roar? Researchers hypothesize that this difference between the two feline species may be partly due to a U- shaped bone in their throats called the hyoid. Sand cats, which are much smaller than lions, have a rigid hyoid that rumbles when the cat's larynx vibrates, resulting in a purr. By contrast, lions have a somewhat flexible hyoid, and the bone is attached to the skull with a stretchy ligament that sand cats lack. These traits allow lions and most other species of big cats to produce powerful roars. The same traits may also prevent most big cats from purring. Which choice best describes the overall structure of the text?

- A. The text presents a theory about two species, then discusses facts that weaken it.
- B. The text compares the habitats of two species, then explains how those habitats are changing.
- C. The text describes a behavior shared by two species, then discusses other behaviors shared by them.
- **D. The text poses a question about two species, then presents a possible answer.**  **[KEY]**

CB rationale (condensed):
  - `x A` the text doesn't present facts that weaken the theory about two cat species; rather, it asks a question about two species and then discusses a potential answer.
  - `x B` the text doesn't discuss the habitats of sand cats and lions at all, nor does it mention any changes to their habitats.
  - `x C` the text doesn't describe a behavior shared by the two cat species mentioned. On the contrary, it specifically focuses on the different vocalization behaviors of each species (purring versus roaring) and why those differences may exist.

**`acb852e7` — Text Structure and Purpose — Medium**

> The following text is from the 1923 poem "Black Finger" by Angelina Weld Grimké, a Black American writer. A cypress is a type of evergreen tree. I have just seen a most beautiful thing, Slim and still, Against a gold, gold sky, A straight black cypress, Sensitive, Exquisite, A black finger Pointing upwards. Why, beautiful still finger, are you black? And why are you pointing upwards? Which choice best describes the overall structure of the text?

- A. The speaker assesses a natural phenomenon, then questions the accuracy of her assessment.
- **B. The speaker describes a distinctive sight in nature, then ponders what meaning to attribute to that sight.**  **[KEY]**
- C. The speaker presents an outdoor scene, then considers a human behavior occurring within that scene.
- D. The speaker examines her surroundings, then speculates about their influence on her emotional state.

CB rationale (condensed):
  - `x A` the speaker assesses a natural sight —a "black cypress" tree standing "against a gold, gold sky" like a pointed finger —but doesn't question the accuracy of her own assessment. Although she wonders why the finger, which is really a tree, is black and
  - `x C` Although the speaker describes seeing a "black cypress" tree standing "against a gold, gold sky" like a pointed finger, she wonders about that natural image (asking ' ' why the finger, which is really a tree, is black and why it s pointing) and doesn
  - `x D` Although the speaker examines and wonders about one thing in her surroundings —a "black cypress" tree standing "against a gold, gold sky " like a pointed finger—she doesn't address her own emotional state or consider how it's affected by her surround

**`70e6af39` — Text Structure and Purpose — Hard**

> To produce batik, an Indonesian textile that originated as early as the 6th century CE, an artist creates patterns on fabric by skillfully applying wax to the surface and then dyeing it. Traditionally, the artist draws on the cloth using a canting, a pen-shaped tool that applies wax in fine lines or dots. To expedite this laborious process, the cap, a copper stamp that applies preset wax patterns, was introduced. Although the cap made the process of producing batiks much quicker, the canting is often preferred because it results in unique pieces. Which choice best describes the overall structure of the text?

- A. It introduces a traditional type of textile, suggests that it is a variation of an even older type of textile, and then explains a significant difference in how those types of textiles are produced.
- B. It establishes how a textile production technique originated, indicates how the technique has changed over time, and then suggests that renewed interest in the original technique is growing.
- **C. It presents a method of textile production, identifies two approaches to that method, and then addresses the relative advantage of each approach.**  **[KEY]**
- D. It conveys admiration of a certain style of textile, emphasizes the level of skill needed to produce the textile, and then urges broader recognition of the skill involved in producing the textile.

CB rationale (condensed):
  - `x A` Although the text describes making the textile batik with a canting and with the cap, both approaches are for making the same type of textile (batik). No other type of textile is mentioned in the text.
  - `x B` Although the text indicates when batik originated (perhaps the 6th century CE), it doesn t describe'how it originated. And although the text indicates that a batik created using a canting " is often preferred " over mass-produced batiks, nothing in t
  - `x D` Although the text indicates that the batik artists " skillfully " apply the wax designs that create the batik patterns, the overall discussion in the text describes factual aspects of the process of batik production without seeming to advocate for gr

**`8af926b1` — Text Structure and Purpose — Hard**

> Despite potential independent confirmation, the apparent detection in 2020 of phosphine (PH ) 3 — a gas that on Earth almost exclusively derives from biological sources — ' in Venus s cloud deck remains controversial, in part because Venus is thought to be uninhabitable. To evaluate such a finding's plausibility, William Bains et al. modeled multiple abiotic PH 3 pathways, including geochemical, atmospheric, and photochemical reactions, but none adequately explain the observed levels of PH . If Venusian PH does exist, it would indicate insufficiencies in the current 3 3 consensus on Venus s'chemistry. Which choice best describes the overall structure of the text?

- A. It outlines recent efforts to confirm the presence of a particular gas in Venus s atmosphere,'summarizes a research team s evaluations of ' those efforts'methodological shortcomings, and then explains why that team remains skeptical of the gas s future detection. '
- B. It explains why the consensus view of a particular gas in Venus s atmosphere'has recently become controversial, expands on a scientific ' ' team s reasons for questioning that consensus, and then suggests that future observations of Venus s atmosphere will likely be needed to settle the controversy.
- **C. It introduces an unexpected observation of a particular gas in Venus s atmosphere,'presents an effort to investigate possible mechanisms that could explain that observation, and then notes an implication of that investigation s findings. '**  **[KEY]**
- D. It compares the levels of a particular gas on Venus and Earth, sketches the chemical processes that account for differences in these levels, and then addresses some of the practical challenges of studying the presence of this gas on Venus more closely.

CB rationale (condensed):
  - `x A` The text starts by mentioning that phosphine has been detected in Venus s atmosphere. Rather than'discuss whether the presence of phosphine on Venus can be confirmed, the text focuses on the efforts of one team of researchers, Bains et al., who are t
  - `x B` , rather than indicating a consensus view about the phosphine detected on Venus, the text focuses on the fact that the detection " remains controversial, " a framing that suggests the controversy is not a new phenomenon. The text also doesn't suggest
  - `x D` the text does not compare levels of phosphine on Venus with levels on Earth, nor does it address practical challenges of studying the gas on Venus.

### 2.3 (c) FUNCTION OF THE UNDERLINED PORTION — option architecture

The stem's phrase **`in the text as a whole`** is not decoration; it is the discriminator. The key must
state a *relational* role (what this portion does **for** the surrounding argument), not a *content
summary* (what this portion says). Distractors are built to be summaries, or to be relations the portion
has to the wrong neighbour.

| Wrong-option build | Diagnostic |
|---|---|
| **F1. Right relation, wrong sentence** — the function described is genuinely performed *by a different sentence* of the text. | "the second sentence introduces the general problem…, not the central finding. It is the third sentence that presents…" |
| **F2. Content summary instead of function** — accurately paraphrases the underlined words but names no role. | "the example given in the last sentence has to do with how the panels were joined, not with what is depicted" |
| **F3. Wrong relation-verb over right content** — swaps `supports` ↔ `challenges`, `defines` ↔ `illustrates`, `outlines a hypothesis` ↔ `provides evidence`. | "The underlined sentence doesn't outline a hypothesis but instead provides evidence. And the following sentence agrees…" |
| **F4. Wrong referent / wrong perspective** — attributes the portion's viewpoint to the wrong party (audience vs. animators; researchers vs. critics). | "the underlined question pertains to the perspective of computer animators, not the audience" |
| **F5. Literal reading of a figurative phrase** (literary stimuli). | "the third sentence uses the phrase 'as an old friend' figuratively…, not in reference to her long-standing friendships with other people" |

**`ca50de52` — Text Structure and Purpose — Hard**

> "How lifelike are they?" Many computer animators prioritize this question as they strive to create ever more realistic environments and lighting. Generally, while characters in computer-animated films appear highly exaggerated, environments and lighting are carefully engineered to mimic reality. But some animators, such as Pixar's Sanjay Patel, are focused on a different question. Rather than asking first whether the environments and lighting they're creating are convincingly lifelike, Patel and others are asking whether these elements reflect their films' unique stories. Which choice best describes the function of the underlined question in the text as a whole?

- **A. It reflects a primary goal that many computer animators have for certain components of the animations they produce.**  **[KEY]**
- B. It represents a concern of computer animators who are more interested in creating unique backgrounds and lighting effects than realistic ones.
- C. It conveys the uncertainty among many computer animators about how to create realistic animations using current technology.
- D. It illustrates a reaction that audiences typically have to the appearance of characters created by computer animators.

CB rationale (condensed):
  - `x B` , as the text makes clear, the underlined question is one posed by computer animators who wish to create realistic backgrounds and lighting effects, not by those who, instead, wish to create effects that reflect films' unique stories and aren't neces
  - `x C` As the text explains, many computer animators strive for realistic environments and lighting, while others do not; this difference of approach relates to whether these components should be realistic, not to how realism can be achieved using current t
  - `x D` the underlined question pertains to the perspective of computer animators, not the audience, and the text never considers audience's reactions to characters in animated films.

**`c966ad55` — Text Structure and Purpose — Easy**

> The following text is from Srimati Svarna Kumari Devi's 1894 novel The Fatal Garland (translated by A. Christina Albers in 1910). Shakti is walking near a riverbank that she visited frequently during her childhood. She crossed the woods she knew so well. The trees seemed to extend their branches like welcoming arms. They greeted her as an old friend. Soon she reached the river-side. Which choice best describes the function of the underlined portion in the text as a whole?

- A. It suggests that Shakti feels uncomfortable near the river.
- B. It indicates that Shakti has lost her sense of direction in the woods.
- **C. It emphasizes Shakti's sense of belonging in the landscape.**  **[KEY]**
- D. It conveys Shakti's appreciation for her long-term friendships.

CB rationale (condensed):
  - `x A` the text and underlined portion suggest that Shakti is comfortable, not uncomfortable, in her surroundings: the trees around her are described as welcoming and reassuring. Moreover, the underlined portion discusses Shakti's feelings in the forest, no
  - `x B` the text and underlined portion emphasize Shakti's familiarity with the woods. The trees are inviting, and she feels like "an old friend" to the woods, so she isn't lost or confused there.
  - `x D` the third sentence uses the phrase "as an old friend" figuratively in reference to Shakti's sense of familiarity with the landscape, not in reference to her long-standing friendships with other people, and the text and underlined portion never discus

**`e818241b` — Text Structure and Purpose — Hard**

> Astronomers are confident that the star Betelgeuse will eventually consume all the helium in its core and explode in a supernova. They are much less confident, however, about when this will happen, since that depends on internal characteristics of Betelgeuse that are largely unknown. Astrophysicist Sarafina El-Badry Nance and colleagues recently investigated whether acoustic waves in the star could be used to determine internal stellar states but concluded that this method could not sufficiently reveal Betelgeuse's internal characteristics to allow its evolutionary state to be firmly fixed. Which choice best describes the function of the second sentence in the overall structure of the text?

- A. It describes a serious limitation of the method used by Nance and colleagues.
- B. It presents the central finding reported by Nance and colleagues.
- **C. It identifies the problem that Nance and colleagues attempted to solve but did not.**  **[KEY]**
- D. It explains how the work of Nance and colleagues was received by others in the field.

CB rationale (condensed):
  - `x A` the second sentence introduces the general problem Nance and colleagues hoped to solve, not a serious limitation of how Nance and colleagues tried to solve it. It is the third sentence that introduces Nance and colleagues, but no serious limitation o
  - `x B` the second sentence introduces the general problem Nance and colleagues hoped to solve, not the central finding they ultimately reported. It is the third sentence that presents Nance and colleagues' conclusion that a potential method for determining
  - `x D` the second sentence doesn't indicate how other astronomers or astrophysicists responded to the work done by Nance and colleagues; the text doesn't address this information at all.

**`236fee8e` — Text Structure and Purpose — Medium**

> Archeological excavation of Market Street Chinatown, a nineteenth-century Chinese American community in San Jose, California, provided the first evidence that Asian food products were imported to the United States in the 1800s: bones from a freshwater fish species native to Southeast Asia. Jinshanzhuang—Hong Kong–based import/export firms—likely coordinated the fish's transport from Chinese-operated fisheries in Vietnam and Malaysia to North American markets. This route reveals the (often overlooked) multinational dimensions of the trade networks linking Chinese diaspora communities. Which choice best describes the function of the underlined sentence in the text as a whole?

- A. It explains why efforts to determine the country of origin of the items mentioned in the previous sentence remain inconclusive.
- **B. It provides information that helps support a claim about a discovery's significance that is presented in the following sentence.**  **[KEY]**
- C. It traces the steps that were taken to locate and recover the objects that are described in the previous sentence.
- D. It outlines a hypothesis that additional evidence discussed in the following sentence casts some doubt on.

CB rationale (condensed):
  - `x A` The underlined sentence never suggests that the countries of origin of the fish are in question —in fact, it tells us exactly where they came from.
  - `x C` The passage never describes the steps taken to discover the fish bones described in the previous sentence.
  - `x D` The underlined sentence doesn t'outline a hypothesis but instead provides evidence. And the following sentence agrees with the underlined sentence, so we could eliminate this choice just for saying that the following sentence "casts some doubt on" th

**`cef79fb9` — Text Structure and Purpose — Medium**

> The Bayeux Tapestry, from eleventh-century France, depicts 75 scenes over 250 feet of fabric. It was likely produced by workers embroidering in sections and then joining the resulting panels together. It's plausible that the workshop that produced the tapestry had never produced one so large, and some researchers claim that a close examination of the joins — the places where the panels are stitched together — suggests that the workers developed and refined their joining process over the course of production. For example, the first join the workers completed exhibits a clear misalignment of the borders of the two panels, whereas the later joins are virtually invisible. Which choice best describes the function of the underlined sentence in the text as a whole?

- A. It identifies the people and events depicted in the Bayeux Tapestry.
- **B. It supports an argument about the workers who produced the Bayeux Tapestry.**  **[KEY]**
- C. It compares the Bayeux Tapestry with other tapestries from eleventh-century France.
- D. It describes how researchers determined where the Bayeux Tapestry was produced.

CB rationale (condensed):
  - `x A` the example given in the last sentence of the text has to do with how the panels of the Bayeux Tapestry were joined by the workers, not with what is depicted in those panels; the text never identifies any people or places depicted in the tapestry.
  - `x C` the last sentence compares how early panels in the Bayeux Tapestry were joined with how later panels in the same tapestry were joined; it doesn't make any comparison between the Bayeux Tapestry and other tapestries from the same time in France.
  - `x D` the last sentence doesn t address'the location where the Bayeux Tapestry was created; the first sentence of the text presents it as a given that the tapestry was created in France, but nothing in the text indicates how that origin was determined.

**`066a3295` — Text Structure and Purpose — Easy**

> Researchers have found a nearly 164,000-year-old molar from a member of the archaic human species known as Denisovans in a cave in Laos, suggesting that Denisovans lived in a wider range of environments than indicated by earlier evidence. Before the discovery, Denisovans were thought to have lived only at high altitudes in relatively cold climates in what are now Russia and China, but the discovery of the tooth in Laos suggests that they may have lived at low altitudes in relatively warm climates in Southeast Asia as well. Which choice best states the function of the underlined portion in the text as a whole?

- A. It dismisses as untrue the research presented in the previous sentence.
- B. It defines a term used in the description that follows in the rest of the sentence.
- C. It emphasizes the main goal of the research introduced in the previous sentence.
- **D. It provides context that clarifies the significance of the information that follows in the rest of the sentence.**  **[KEY]**

CB rationale (condensed):
  - `x A` The underlined portion doesn t'do this. Instead, it explains what we used to believe about Denisovans before the discovery — ' ' it doesn t dismiss the new discovery as false.
  - `x B` The underlined portion doesn t do this. No term is defined here.
  - `x C` The underlined portion doesn t'do this. The text never tells us what the " goal" of the research was, just what its discovery was.

---

## 3. CENTRAL IDEAS AND DETAILS

**N = 78** (Easy 27 / Medium 27 / Hard 24). Three stem families:

| Family | N | Stem wording |
|---|---:|---|
| **Main idea** | 32 | `Which choice best states the main idea of the text?` (30) · `Which choice best describes the main idea of the text?` · `Which choice best states the text's main idea?` |
| **Explicit detail** | 17 | `According to the text, [wh-question]?` — e.g. `According to the text, what did Gloria Richardson lead?` · `According to the text, what is true about Elinor?` · `According to the text, why are ecologists worried about Pando?` · `According to the text, how did the researchers determine the level of surprise displayed by the cats in the study?` |
| **Inferential detail** | 20+ | `Based on the text, what can be concluded about X?` · `What does the text most strongly suggest about X?` · `Based on the text, what is true about X?` · `Based on the text, [Character] would most likely agree with which statement about Y?` · `Which statement about X is most strongly supported by the text?` · `Which question does the text most directly attempt to answer?` · `Based on the text, which research question was X's study most likely intended to answer?` |

### 3.1 How CID distractors are built

| # | Build | CB's phrasing | Notes |
|---|---|---|---|
| C1 | **Uses passage vocabulary, distorts the relation.** Every content word appears in the stimulus; the predicate linking them does not. | "the text doesn't compare the brains of hawk moths and brine shrimp. These animals are merely mentioned as examples… in the opening sentence" | The dominant Easy/Medium build. Harvest nouns from the stimulus's *setup* clause, which the reader skims. |
| C2 | **A detail instead of the main idea.** Accurately restates one sentence and offers it as the thesis. | "While the text concludes by noting that researchers aim to discover additional characteristics…, this statement doesn't suggest that researchers need to focus on…" | Always at least one per Main-Idea item. |
| C3 | **Unsupported extrapolation.** A causally or temporally *downstream* claim that would be reasonable if true. | "The text never suggests that portrait painters shifted to become photographers." | The Hard build for inferential-detail items. |
| C4 | **Overreach beyond the text's scope.** Introduces an evaluative dimension the text is silent on (artistic merit, cost, motive, prior state). | "The text never discusses the 'artistic merit' of either art form." | |
| C5 | **Wrong causal explanation for a stated fact.** Keeps the fact, swaps the reason. | "the text doesn't suggest that Mrs. Ochiltree's acquaintances don't speak with her because they are too focused on their own concerns, but rather because they don't like the frank comments she makes" | Standard for literary stimuli. |
| C6 | **Scope inflation / deflation.** `people other than Thornton` → `humans generally`; a local claim promoted to universal. | "there's no indication that Buck mistrusts and avoids people generally; indeed, he accepts Thornton, who is a human" | |

Measured against CB's rationale language across 234 CID distractors: 32.5% flagged **no textual support**,
23.5% flagged **topical-but-unsupported** (the "Although the text does discuss…" concession), 6.0%
flagged **reversal**, 3.4% **attribution swap**.

On the *Easy* end the build is almost mechanical — see `487a05f8`, where three distractors are simply
other plausible car-trip activities the text never mentions, and CB's three rationales are near-identical
sentences. On the *Hard* end (`70aacc03`) all four options share an identical `Although [expectation],
[outcome] because [mechanism]` skeleton and differ only in which mechanism is named.

**`ee41d7e0` — Central Ideas and Details — Easy**

> Arthropods —brine shrimp, hawk moths, and many other invertebrate animals — have a nervous system made up of a brain, nerve cord, and other nerves. Researchers have gained insights about this system in ancient arthropods from traces found in various fossils. For example, in a study of two fossils of the extinct arthropod species Mollisonia symmetrica, Javier Ortega-Hern ández, James Weaver, and team observed clear signs of a nerve cord. They also saw possible indications of a synganglion, a brain-like mass of nerves. Researchers hope to identify more features of the nervous systems of prehistoric arthropods as additional fossils are found. Which choice best states the main idea of the text?

- A. There are several similarities between the brains of hawk moths and the brains of brine shrimp.
- **B. Fossil evidence can contribute to the understanding of the nervous system in ancient arthropods.**  **[KEY]**
- C. Newly discovered fossils suggest that ancient hawk moths and ancient brine shrimp had spines.
- D. Researchers need to focus on finding more fossils of ancient arthropods.

CB rationale (condensed):
  - `x A` the text doesn t'compare the brains of hawk moths and brine shrimp. These animals are merely mentioned as examples of arthropods in the opening sentence, and the text doesn t go'on to discuss any similarities between their brains.
  - `x C` the text discusses nervous systems, not spines, in ancient arthropods, and it doesn t'specifically mention findings about ancient hawk moths or brine shrimp.
  - `x D` While the text concludes by noting that researchers aim to discover additional characteristics of ' ' prehistoric arthropods nervous systems as more fossils are uncovered, this statement doesn t suggest that researchers need to focus on finding more

**`7ffae38a` — Central Ideas and Details — Medium**

> The following text is adapted from Jack London's 1903 novel The Call of the Wild. Buck is a sled dog living with John Thornton in Yukon, Canada. Thornton alone held [Buck]. The rest of mankind was as nothing. Chance travellers might praise or pet him; but he was cold under it all, and from a too demonstrative man he would get up and walk away. When Thornton's partners, Hans and Pete, arrived on the long-expected raft, Buck refused to notice them till he learned they were close to Thornton; after that he tolerated them in a passive sort of way, accepting favors from them as though he favored them by accepting. Which choice best states the main idea of the text?

- A. Buck has become less social since he began living with Thornton.
- B. Buck mistrusts humans and does his best to avoid them.
- C. Buck has been especially well liked by most of Thornton's friends.
- **D. Buck holds Thornton in higher regard than any other person.**  **[KEY]**

CB rationale (condensed):
  - `x A` the text conveys that Buck isn't social with people other than Thornton but doesn't address Buck's life or temperament before he lived with Thornton.
  - `x B` the text conveys that Buck doesn't really care about people other than Thornton and is aloof toward them. However, there's no indication that Buck mistrusts and avoids people generally; indeed, he accepts Thornton, who is a human.
  - `x C` the text refers to random travelers praising and petting Buck and Thornton's partners giving Buck favors, but there's no indication that any of these people are Thornton's friends or that they have a particular fondness for Buck.

**`70aacc03` — Central Ideas and Details — Hard**

> Elizabeth Asiedu has identified a negative correlation between the share of developing countries'economies derived from natural-resource extraction and those countries'receipts of foreign investment. This may appear counterintuitive — resource extraction requires initial investments (in extractive technology, for instance) at scales best met by multinational corporations —but Asiedu notes that natural-resource industries ' boom-bust cycle can destabilize local currencies and increase developing countries'vulnerability to external shocks, creating levels of uncertainty to which foreign investors are typically averse. Which choice best states the main idea of the text?

- A. Although it may seem surprising that foreign investment declines in developing countries as natural-resource extraction makes up a larger share of those countries'economies, that decline happens because resource extraction requires initial investments too large for foreign investors to supply.
- B. Although developing countries tend to become less dependent on foreign investment as natural-resource industries make up a larger share of their economies, this change may not occur if the boom-bust cycle of those industries destabilizes local currencies or increases countries ' vulnerability to external shocks.
- **C. Although one might expect that foreign investment would increase as natural-resource extraction makes up a larger share of developing countries'economies, the opposite happens because heavy reliance on natural resources can lead to unattractive conditions for investors.**  **[KEY]**
- D. Although foreign investors tend to avoid initial investments in natural-resource industries in developing countries, foreign investment may increase significantly as those industries stabilize and the risks associated with them decline.

CB rationale (condensed):
  - `x A` The text does indicate that foreign investment is typically lower in developing countries whose economies are more dependent on natural-resource extraction; the text further indicates that natural-resource extraction requires substantial initial inve
  - `x B` The text indicates that greater dependence on natural-resource extraction makes a developing country less appealing to foreign investors because of associated economic instability. Rather than arguing that the goal of developing countries is to becom
  - `x D` Although the text indicates that natural- resource extraction requires substantial initial investments (to acquire things like required technologies) and that there are fewer likely investors willing to participate at this stage than one might think,

**`706046f7` — Central Ideas and Details — Easy**

> In the 1960s, Gloria Richardson led a movement to promote racial equality. Her involvement in this effort was inspired by her daughter, Donna Richardson. In 1961, Donna joined protests organized by the Student Nonviolent Coordinating Committee in Cambridge, Maryland. Following her daughter, Gloria joined these protests too. Gloria soon became the cochair of the Cambridge Nonviolent Action Committee. She was also the leader of what became known as the Cambridge movement. According to the text, what did Gloria Richardson lead?

- **A. The Cambridge movement**  **[KEY]**
- B. Her daughter Donna's high school
- C. Protests to support environmental protections
- D. A new business in Cambridge, Maryland

CB rationale (condensed):
  - `x B` the text never indicates that Gloria Richardson led her daughter Donna's high school. The text says only that Gloria was inspired by her daughter to become involved in efforts to promote racial equality.
  - `x C` the text doesn't mention protests related to environmental protections. Rather, the text discusses Gloria Richardson's involvement in efforts to promote racial equality.
  - `x D` the text doesn't indicate that Gloria Richardson led a new business in Cambridge, Maryland. Rather, the text states that she led what became known as the Cambridge movement.

**`3543e6e2` — Central Ideas and Details — Easy**

> The following text is from Jane Austen s 1811'novel Sense and Sensibility. Elinor lives with her younger sisters and her mother, Mrs. Dashwood. Elinor, this eldest daughter, whose advice was so effectual, possessed a strength of understanding, and coolness of judgment, which qualified her, though only nineteen, to be the counsellor of her mother, and enabled her frequently to counteract, to the advantage of them all, that eagerness of mind in Mrs. Dashwood which must generally have led to imprudence. She had an excellent heart; — her disposition was affectionate, and her feelings were strong; but she knew how to govern them: it was a knowledge which her mother had yet to learn; and which one of her sisters had resolved never to be taught. According to the text, what is true about Elinor?

- A. Elinor often argues with her mother but fails to change her mind.
- B. Elinor can be overly sensitive with regard to family matters.
- C. Elinor thinks her mother is a bad role model.
- **D. Elinor is remarkably mature for her age.**  **[KEY]**

CB rationale (condensed):
  - `x A` it isn t'supported by the text: although the text says that Elinor advises her mother and often counteracts her ' ' ' mother s impulses, there s no mention of Elinor arguing with her mother or failing to change her mother s mind.
  - `x B` it ' ' ' isn t supported by the text: although the text mentions that Elinor has strong feelings, it doesn t indicate that she s excessively sensitive when it ' ' comes to family issues.
  - `x C` it isn t supported by the text: there s no mention of what Elinor thinks about her mother and no suggestion that she thinks her mother is a bad role model. Because she s'described as having "an excellent heart, " ' Elinor likely doesn t think ill of

**`487a05f8` — Central Ideas and Details — Easy**

> The following text is adapted from Sylvia Acevedo's 2018 memoir Path to the Stars: My Journey from Girl Scout to Rocket Scientist. The narrator is traveling by car with her family to Mexico City. Mario and Laura are her brother and sister. Mario and I played games to see how many different license plates we could spot, and Laura liked to look for children in the back seats of the cars we passed. We were used to the forty-five-minute drive to El Paso and familiar with the six-hour ride to Chihuahua, but I wondered what the long journey to Mexico City would be like. ©2018 by Sylvia Acevedo According to the text, what did the narrator and Mario do while riding in the car?

- A. They read books.
- B. They sang songs.
- C. They went to sleep.
- **D. They played games.**  **[KEY]**

CB rationale (condensed):
  - `x A` the text doesn't mention the narrator and Mario reading during the car ride and instead describes them playing games.
  - `x B` the text doesn't mention the narrator and Mario singing songs during the car ride and instead describes them playing games.
  - `x C` the text doesn't mention the narrator and Mario sleeping during the car ride and instead describes them playing games.

**`87aa7bab` — Central Ideas and Details — Medium**

> A common assumption among art historians is that the invention of photography in the mid-nineteenth century displaced the painted portrait in the public consciousness. The diminishing popularity of the portrait miniature, which coincided with the rise of photography, seems to support this claim. However, photography s'impact on the portrait miniature may be overstated. Although records from art exhibitions in the Netherlands from 1820 to 1892 show a decrease in the number of both full-sized and miniature portraits submitted, this trend was established before the invention of photography. Based on the text, what can be concluded about the diminishing popularity of the portrait miniature in the nineteenth century?

- **A. Factors other than the rise of photography may be more directly responsible for the portrait miniature s'decline.**  **[KEY]**
- B. Although portrait miniatures became less common than photographs, they were widely regarded as having more artistic merit.
- C. The popularity of the portrait miniature likely persisted for longer than art historians have assumed.
- D. As demand for portrait miniatures decreased, portrait artists likely shifted their creative focus to photography.

CB rationale (condensed):
  - `x B` The text never discusses the "artistic merit" of either art form.
  - `x C` The text never suggests that the portrait miniature was popular for longer than historians thought — if anything, it suggests that the portrait miniature started losing its popularity earlier than historians thought.
  - `x D` The text never suggests that portrait painters shifted to become photographers.

**`835545cd` — Central Ideas and Details — Medium**

> The following text is adapted from Charles W. Chesnutt's 1901 novel The Marrow of Tradition. Mrs. Ochiltree was a woman of strong individuality, whose comments upon her acquaintance[s], present or absent, were marked by a frankness at times no less than startling. This characteristic caused her to be more or less avoided. Mrs. Ochiltree was aware of this sentiment on the part of her acquaintance[s], and rather exulted in it. Based on the text, what is true about Mrs. Ochiltree's acquaintances?

- A. They try to refrain from discussing topics that would upset Mrs. Ochiltree.
- B. They are unable to spend as much time with Mrs. Ochiltree as she would like.
- C. They are too preoccupied with their own concerns to speak with Mrs. Ochiltree.
- **D. They are likely offended by what Mrs. Ochiltree has said about them.**  **[KEY]**

CB rationale (condensed):
  - `x A` the text doesn't suggest that Mrs. Ochiltree's acquaintances avoid discussing topics that would upset Mrs. Ochiltree; instead, it states that they avoid being around Mrs. Ochiltree at all.
  - `x B` the text makes it clear that Mrs. Ochiltree knows her acquaintances often avoid her and is pleased about it (she "rather exulted in it"), not that she wants to spend more time with them.
  - `x C` the text doesn't suggest that Mrs. Ochiltree's acquaintances don't speak with Mrs. Ochiltree because they are too focused on their own concerns, but rather because they don't like the frank comments she makes.

**`c6d7dc78` — Central Ideas and Details — Easy**

> Stores often play background music to create a pleasant shopping experience. Based on a survey, Amir Manzoor found that such music was linked to reduced enjoyment among customers. Manzoor thinks that one explanation for this result is that the surveyed customers may have wanted to finish their shopping as quickly as possible. They therefore weren't focused on enjoying the experience. It's possible that background music could improve the experience of other customers whose main goal is to have a good time while they shop. Based on the text, which research question was Manzoor's study most likely intended to answer?

- A. Does the volume of a store's background music affect how much time customers spend in the store?
- **B. How does the use of background music in stores affect customers' shopping experience?**  **[KEY]**
- C. Do customers spend more money when shopping for music in stores or online?
- D. What genres of music do customers prefer to listen to while they are shopping?

CB rationale (condensed):
  - `x A` the text doesn't mention the volume of background music or how much time customers spend in a store. Instead, the text focuses on whether background music is linked to customer enjoyment of the shopping experience.
  - `x C` the text doesn't address how much money customers spend or compare in-store and online purchasing. Rather, the text discusses background music played during shopping, not music as a product to be purchased.
  - `x D` the text doesn't discuss different genres of music or customers' preferences for particular genres. Instead, the text addresses background music in general and its link to customer enjoyment.

---

## 4. INFERENCES

**N = 74** (Easy 10 / Medium 27 / **Hard 37** — the most Hard-skewed Reading skill).

### 4.1 The stem is invariant

```
Which choice most logically completes the text?
```

**74/74 = 100%** of items use exactly this sentence. **74/74 = 100%** end the stimulus with a terminal blank `______`.
There is no variation to model. All the design work is in the stimulus.

### 4.2 Stimulus geometry

Median **94 words** (range 49–138) — roughly **double** a Words-in-Context stimulus.
The blank is always the *final* element and is always introduced by an inference-licensing lead-in.
Lead-in frequencies (non-exclusive, n = 74):

| Lead-in | N | % | Verbatim examples |
|---|---:|---:|---|
| Inferential connective — `therefore, thus, hence, consequently, as a result, then, so` | 29 | 39% | `Therefore, businesses should recognize that ______` · `It thus seems that ______` · `Consequently, ______` |
| `suggest(s)/suggesting that` | 20 | 27% | `This finding suggests that ______` · `…, suggesting that ______` · `These observations may suggest that ______` |
| Modal hedge — `may, might, likely, seems, appears` | 14 | 19% | `Hence, the "pay as you wish" model may ______` · `Therefore, the discovered ship was likely ______` |
| `concluded/conclude that` | 9 | 12% | `The researchers therefore concluded that ______` · `Thus, some scholars have concluded that ______` |
| `it can (reasonably) be inferred that` | 3 | 4% | `Assuming that the findings of Fan's team are valid, it can be inferred that ______` |
| Attributed-claim frame — `X contends/argues/reasons that` | 2 | 3% | `Ghisbain therefore contends that ______` |
| Explicit conditional — `if X, then ______` | 2 | 3% | `…reasoning that if chickens lacked a capacity for visual self-recognition, then ______` |

**The lead-in is a promise.** `suggesting that` promises an evidential inference; `therefore` promises a
deductive step; `concluded that` promises the researcher's own stated conclusion; `may` promises a
*possibility* claim (and therefore licenses an option that would be wrong if stated flatly). The key must
match the modal strength of the lead-in exactly. This is a frequent Hard-item discriminator (see
`5105ca38`: lead-in `The fact that a cupid is shown near the female figure, therefore, ______`; key is
`is not conclusive evidence that the figure is Venus`; distractor C `eliminates the possibility that the
figure is Venus` is the *same direction, wrong strength*).

### 4.3 The logical templates CB uses

Every Inference stimulus is one of six argument shapes. In each, the missing clause is *forced*:

| # | Template | Stimulus skeleton, and what the blank must be |
|---|---|---|
| **L1. Eliminated-alternatives** | Effect E observed. Cause C1 explains only part of E. Factor F is introduced. Data rule out C2, C3. `…suggesting that ______` | the residual cause — F applied to E. (`f1bfbed3`: two species counts differ; new-invertebrate description explains only part; vertebrate/plant/algal counts match → the difference must lie in *microorganism species-delimitation decisions*.) |
| **L2. General principle + specific case** | Principle P stated in the abstract. Case X instantiates P's antecedent. `Therefore ______` | P's consequent applied to X. (`4889580c`: marketplaces arise when groups control *different* resources; scholars underestimated ecological diversity → they must have assumed marketplaces would yield *nothing new*.) |
| **L3. Contrast-forced characterization** | Norm N described for the whole class. Case X described as doing not-N. `X was therefore ______` | the evaluative label that follows from X ≠ N. (`9077be25`: all films of the era used exaggerated acting; Guy-Blaché demanded natural acting → her style was *very unusual for the period*.) |
| **L4. Defeated-inference / undercut** | Observation O. Inference I drawn from O because of link L. New fact: L is not unique to I. `O, therefore, ______` | the *weakened* status of I — not its refutation. (`5105ca38`.) |
| **L5. Selective-effect projection** | Intervention affects measure M3 but not M1, M2. `These findings suggest that ______` | the real-world consequence that follows from M3 alone. (`5cd55c77`: ALAN does not affect spawning or fertilization but wholly blocks hatching → settling in ALAN regions puts *reproductive success* at risk.) |
| **L6. Chronology / genealogy** | Dated sequence of sources; element E is introduced at date D. `…which suggests that ______` | a fact about anything *earlier* than D. (`5c7e0d62`: the Round Table enters in 1155 → the 11th-century source could not have featured it.) |

### 4.4 How CB makes exactly one option *entailed* rather than merely plausible

This is the mechanical core. Reconstruct it as a five-step build:

**Step 1 — Write the conclusion first.** Decide the proposition K that will be the key. It must be a
proposition that is *not stated anywhere in the stimulus* but that follows from the stimulus by one
step.

**Step 2 — Plant both premises, in different vocabulary from K.** The stimulus must contain a *major*
premise (the general link) and a *minor* premise (the particular fact). Neither may use K's wording. In
`4889580c` the major premise is `Marketplaces typically emerge because different individuals or groups
want to trade resources they control for resources they don't control`; the minor is `Scholars seriously
underestimated the ecological diversity of the Maya landscape`. K then follows and shares almost no
vocabulary with either.

**Step 3 — Explicitly close every escape route.** This is what CB does that ordinary item writers do
not. The stimulus contains a sentence whose *only* job is to eliminate a rival explanation, so that only
one conclusion survives:

- `a difference only partly attributable to the description of new invertebrate species in the interim` (kills the obvious answer)
- `the two censuses reported similar counts of vertebrate, plant, and algal species` (kills three more)
- `While exposure to low levels of ALAN had no significant effect on spawning frequency and egg fertilization` (kills two)
- `Barring the possibility of several farmers of the same era independently developing techniques that the Haudenosaunee people had already invented` (kills the coincidence explanation outright)

  Every Hard Inference item in the corpus contains at least one such **exclusion clause**. Distractor A
  in `f1bfbed3` is precisely the excluded explanation, and CB's rationale reads: *"the text explicitly
  addresses this issue by stating that the description of new invertebrate species… can explain only
  part of the difference."* Write the exclusion clause and then *make one distractor be the thing it
  excludes*. This is the highest-value single technique in the whole skill.

**Step 4 — Build the four distractors from the entailment's failure modes**, not from topic:

| # | Distractor build | Test it fails | Example |
|---|---|---|---|
| I1 | **The explicitly excluded explanation.** | Contradicts the exclusion clause. | `f1bfbed3` A |
| I2 | **Comparative claim about entities the text never compares.** Both entities are in the text; the comparison is not. | No premise supports the *relation*. | `5cd55c77` C (`more greatly affected… than other species`) ; `5c7e0d62` C (`more similar overall in content`) |
| I3 | **Right direction, wrong strength.** Upgrades a defeasible conclusion to a categorical one, or downgrades. | Modal mismatch with the lead-in. | `5105ca38` C `eliminates the possibility` vs key `is not conclusive evidence` |
| I4 | **Imports an entity the stimulus never mentions.** | No premise at all. | `9077be25` D (`better than film acting today`) — CB: *"The text never discusses film acting today, so there's no basis for this inference."* |
| I5 | **Detail inversion.** Restates the finding with one polarity flipped, using the exact reporting vocabulary. | Contradicts a stated premise. | `5cd55c77` D (`spawning frequency was more strongly affected… than egg fertilization`, when the text says *neither* was affected) |
| I6 | **The reverse inference.** A conclusion that would follow if the premises ran the other way. | CB spells out the reversal explicitly. | `f1bfbed3` C — CB: *"If Bianchi and Morri had been less sensitive…, [they] would likely have reported more species…"* |
| I7 | **Plausible-and-consistent but underdetermined.** True-ish, not forced. | Entailment test. | `5c7e0d62` B (`though historians know that works containing such stories were available to him`) |

**Step 5 — Run the entailment test on all four.** For each option ask: *can I write one sentence,
quoting the stimulus, that makes this option follow?* Exactly one must pass. This is literally the shape
of every CB key rationale: `Choice X is the best answer because… The text states "[quote]"… The text goes
on to explain… Given all this information, it most logically follows that [key].` If you cannot write
that paragraph, the key is not entailed and the item is broken. Conversely, if you *can* write it for
two options, one of them is a live distractor and must be weakened.

**Anti-heuristic check.** CB deliberately defeats the "hedged option is correct" strategy. Measured on
Inference options: **35.1%** of keys contain a hedge (`may/might/likely/could/suggests`) versus **28.4%**
of distractors — a difference far too small to exploit. Absolute language (`all/only/never/must/prove`)
appears in **10.8%** of keys versus **9.5%** of distractors. Do not let hedging correlate with keying.

**`f1bfbed3` — Inferences — Hard**

> Marta Coll and colleagues'2010 Mediterranean Sea biodiversity census reported approximately 17,000 species, nearly double the number reported in Carlo Bianchi and Carla Morri s'2000 census — a difference only partly attributable to the description of new invertebrate species in the interim. Another factor is that the morphological variability of microorganisms is poorly understood compared to that of vertebrates, invertebrates, plants, and algae, creating uncertainty about how to evaluate microorganisms as species. Researchers decisions'on such matters therefore can be highly consequential. Indeed, the two censuses reported similar counts of vertebrate, plant, and algal species, suggesting that ______

- A. Coll and colleagues reported a much higher number of species than Bianchi and Morri did largely due to the inclusion of invertebrate species that had not been described at the time of Bianchi and Morri s'census.
- **B. some differences observed in microorganisms may have been treated as variations within species by Bianchi and Morri but treated as indicative of distinct species by Coll and colleagues.**  **[KEY]**
- C. Bianchi and Morri may have been less sensitive to the degree of morphological variation displayed within a typical species of microorganism than Coll and colleagues were.
- D. the absence of clarity regarding how to differentiate among species of microorganisms may have resulted in Coll and colleagues underestimating the number of microorganism species.

CB rationale (condensed):
  - `x A` the text explicitly addresses this issue by stating that the description of new invertebrate species in the years between the two studies can explain only part of the difference in the number of species reported by the studies. The focus of the text is on ' ' explaining the difference between Coll and colleagues count and Bianch
  - `x C` nothing in the text suggests that Bianchi and Morri may have been less sensitive to how much the form and structure of microorganisms vary within the same species than Coll and colleagues were. If Bianchi and Morri had been less sensitive to within-species variation than Coll and colleagues were, Bianchi and Morri would likely h
  - `x D` the text is focused on explaining why Coll and colleagues reported many more species than Bianchi and Morri did, and an underestimate of the number of microorganism species by Coll and colleagues would not explain that difference — it would suggest, in fact, that the difference in the number of species should have been even larg

**`9077be25` — Inferences — Medium**

> Alice Guy-Blaché directed hundreds of films between 1896 and 1920. She wanted audiences to feel like they were watching real people on screen. She would encourage actors in her films to behave naturally. Guy-Blaché even hung a large sign reading " Be Natural " in the studio where she made her films. At the time, films lacked sound, so actors needed to rely solely on their bodies and facial expressions to convey emotions. As a result, actors tended to highly exaggerate their actions and expressions. The style of acting in Guy-Blaché s'films was therefore ______

- A. copied by many of Guy-Blaché s'peers.
- B. familiar to actors who had worked on other directors films.'
- **C. very unusual for the period.**  **[KEY]**
- D. better than film acting today.

CB rationale (condensed):
  - `x A` The text never discusses any other directors copying the style of acting found in Guy-Blaché s films,'and in fact suggests the opposite — that it was unusual for directors to suggest this style of acting at the time.
  - `x B` The text never discusses actors ' ' ' familiarity with the style of acting found in Guy-Blaché s films, so there isn t much basis for this inference. But since the text tells us that other films of the period used a highly exaggerated form of acting, we might predict that the natural style in Guy-Blachés films would have been un
  - `x D` The text never discusses film acting today, so there s no'basis for this inference.

**`5105ca38` — Inferences — Medium**

> Several artworks found among the ruins of the ancient Roman city of Pompeii depict a female figure fishing with a cupid nearby. Some scholars have asserted that the figure is the goddess Venus, since she is known to have been linked with cupids in Roman culture, but University of Leicester archaeologist Carla Brain suggests that cupids may have also been associated with fishing generally. The fact that a cupid is shown near the female figure, therefore, ______

- **A. is not conclusive evidence that the figure is Venus.**  **[KEY]**
- B. suggests that Venus was often depicted fishing.
- C. eliminates the possibility that the figure is Venus.
- D. would be difficult to account for if the figure is not Venus.

CB rationale (condensed):
  - `x B` the text says nothing about how often Venus was depicted fishing in Roman art: it only implies that in certain instances a female figure may or may not be Venus.
  - `x C` Carla Brain's proposed explanation for the presence of the cupids makes no reference to the female figure, and so the possibility that the figure in the artworks is in fact Venus cannot be definitively eliminated.
  - `x D` there is nothing in the text to suggest that the only reasonable way to interpret the figure is as Venus.

**`5cd55c77` — Inferences — Hard**

> During their larval phase, numerous species of coral reef fish are drawn toward areas where light is present. To better understand how artificial light at night (ALAN) might affect some coral reef fish, researchers explored the effect of exposure to low levels of ALAN on the reproductive success of the common clownfish (Amphiprion ocellaris). While exposure to low levels of ALAN had no significant effect on spawning frequency and egg fertilization in A. ocellaris, incubation in the presence of ALAN completely inhibited hatching. These findings suggest that ______

- A. A. ocellaris that settle in areas with low levels of ALAN have significantly higher rates of successful egg fertilization than A. ocellaris that settle in areas without ALAN do.
- **B. the reproductive success of A. ocellaris would be at risk if they were to selectively settle in regions that are regularly exposed to low levels of ALAN.**  **[KEY]**
- C. the reproductive success of A. ocellaris is more greatly affected by the presence of low levels of ALAN during incubation than the reproductive success of other species of coral reef fish is.
- D. the spawning frequency of A. ocellaris was more strongly affected by the presence of low levels of ALAN than egg fertilization was, though both were less affected than incubation.

CB rationale (condensed):
  - `x A` the text indicates that exposure to low levels of ALAN had no significant effect on egg fertilization for A. ocellaris, so there's no reason to expect there would be any significant difference in rates of successful egg fertilization between areas with low levels of ALAN and areas without ALAN.
  - `x C` the text doesn t discuss'the particular effects of low levels of ALAN on any species of coral reef fish besides A. ocellaris. For this reason, there's no support in the text for the idea that the reproductive success of A. ocellaris is more greatly affected by the presence of low levels of ALAN than the reproductive success of o
  - `x D` The text does indicate that A. ocellaris incubation was most strongly affected by low levels of ALAN, but it doesn t'indicate that there was a greater effect on spawning frequency than on egg fertilization; in fact, the text states that there was no significant effect on either.

**`4889580c` — Inferences — Hard**

> Archaeologists and historians used to believe that the Maya civilization during its Classic period (roughly 250– 900) lacked agricultural marketplaces. One reason for this belief was that these scholars misunderstood the ecology of the regions the Maya inhabited. Marketplaces typically emerge because different individuals or groups want to trade resources they control for resources they don t'control. Scholars seriously underestimated the ecological diversity of the Maya landscape and thus assumed that ______

- A. marketplaces likely would not have attracted many traders from outside the regions controlled by the Maya.
- B. farming practices would have been largely the same throughout Maya lands even if the crops people produced varied significantly.
- **C. marketplaces would not have enabled Maya people to acquire many products different from those they already produced.**  **[KEY]**
- D. farmers would trade agricultural products only if they had already produced enough to meet their own needs.

CB rationale (condensed):
  - `x A` the text doesn't say anything about trade between the Maya and people from outside the regions controlled by the ' ' Maya. Although scholars mistaken belief that the Maya lands weren t very ecologically diverse would give those scholars a reason to think that ' ' the Maya didn t have marketplaces, it wouldn t lead scholars to as
  - `x B` the text indicates that scholars underestimated the ecological diversity of the Maya lands, which suggests that they mistakenly believed that the Maya produced a relatively small array of resources throughout their territory, not that the crops the Maya produced varied significantly throughout the Maya lands. Although the schola
  - `x D` nothing in the text suggests that scholars assumed that farmers wouldn t ' trade their agricultural products unless they had already met their own needs with those products. Instead, the text says that scholars thought that the Maya lands produced a smaller array of resources than they actually did, which the text suggests led s

**`5c7e0d62` — Inferences — Hard**

> Arthurian legends (tales related to the character of King Arthur) derive from many sources, such as Vita Sancti Cadoci, composed in the 11th century, and Culhwch and Olwen from the second half of the 12th century. One of the most significant sources, Geoffrey of Monmouth s History'of the Kings of Britain, was written in the 1130s; some material from it was later adapted by the Norman poet Wace into the Roman de Brut in 1155. ' ' But Wace didn t merely adapt History, he added to it as well, introducing the famous Round Table at which Arthur s knights assembled, which suggests that ______

- A. Roman de Brut is more historically accurate than History, because Culhwch and Olwen had not been written when Geoffrey of Monmouth was writing his work.
- B. Geoffrey of Monmouth was unaware of stories of the Round Table when composing his History, though historians know that works containing such stories were available to him.
- C. Geoffrey of Monmouth s'accounts of Arthurian legends in his History are more similar overall in content to the accounts in Culhwch and Olwen than they are to the accounts in Roman de Brut.
- **D. the Arthurian legends that the author of Vita Sancti Cadoci drew on would not have featured the Round Table.**  **[KEY]**

CB rationale (condensed):
  - `x A` the text discusses several works that include legends about a character, King Arthur, but doesn t'address the historical accuracy of the stories in those works or suggest that the creation of Culhwch and Olwen was relevant to any other works'accuracy.
  - `x B` the text doesn t'suggest that works containing stories of the Round Table were available to Geoffrey of Monmouth when he composed his History in the 1130s, whether he was aware of them or not; it instead suggests that the idea of the Round Table wasn t ' introduced until more than a decade later, when Wace added it to Geoffrey s
  - `x C` Although the text indicates that the ' ' Arthurian legends in Geoffrey of Monmouth s History differ from those in Wace s Roman de Brut in that Wace added the idea of the Round Table, ' ' the text doesn t compare the overall content of the Arthurian legends in the two works and doesn t indicate anything about the overall content

---

## 5. COMMAND OF EVIDENCE

**N = 148** — the largest Reading skill. Three subtypes:

| Subtype | N | % |
|---|---:|---:|
| (a) Quantitative (table / graph) | 71 | 48% |
| (b) Textual — `Which quotation…` | 30 | 20% |
| (c) `Which finding, if true…` | 47 | 32% |

### 5.1 (a) QUANTITATIVE — stems and distractor mechanics

Two stem families:

**Completion form** (the stem completes a sentence begun in the stimulus):
```
[Stimulus sentence ending in] ______
Which choice most effectively uses data from the table to complete the statement?
     …to complete the text?   …to complete the comparison?   …to complete the example?
     …to complete the student's conclusion?   …to illustrate the claim?
     …to support the research team's conclusion?
```
**Description form:**
```
Which choice best describes data from the table that support the researchers' claim?
Which choice best describes data in the graph that support the team's conclusion?
Which choice best describes data from the graph that weaken the team's hypothesis?
```

Difficulty distribution is bimodal — 26 Easy, 17 Medium, 28 Hard — and the two ends use different
distractor machinery.

**Easy items = pure cell-location.** The stimulus names a row and a column; the key is that cell's value.
Every distractor is **a real value from the graphic belonging to a different row**. Never a fabricated
number. CB's rationale is a one-liner naming the true owner of the value:

**`0147b080` — Command of Evidence — Easy**

> Pyramids in Egypt and the Americas Pyramid Country Height (meters) Age (years before present) The Great Pyramid Mexico 33 2,050 to 2,400 The Pyramid of Djoser Egypt 60 4,600 to 4,700 The Pyramid of Sahure Egypt 47 4,400 to 4,500 El Castillo Belize 40 1,100 to 1,400 A student is writing an essay about four pyramids for a history class and wants to note how long ago each pyramid was built and how tall each pyramid is. Consulting the table, the student finds that el Castillo was built 1,100 to 1,400 years ago and is ______ Which choice most effectively uses data from the table to complete the text?

- A. 33 meters tall.
- B. 47 meters tall.
- **C. 40 meters tall.**  **[KEY]**
- D. 60 meters tall.

CB rationale (condensed):
  - `x A` , according to the table, el Castillo is 40 meters tall, not 33 meters, which is the height of the Great Pyramid in Mexico.
  - `x B` , according to the table, el Castillo is 40 meters tall, not 47 meters, which is the height of the Pyramid of Sahure in Egypt.
  - `x D` , according to the table, el Castillo is 40 meters tall, not 60 meters, which is the height of the Pyramid of Djoser in Egypt.

**`75e07a4d` — Command of Evidence — Easy**

> Sample of Food Items from Gemini Mission Menus Food item Day Meal Sugar cookie cubes 1 B Chicken and vegetables 2 B Shrimp cocktail 4 C Hot cocoa 3 A To make sure they got the nutrition they needed while in space, the astronauts of NASA's Gemini missions were given menus for three meals a day (meals A, B, and C) on a four-day rotating schedule. Looking at the sample of food items from these menus, a student notes that on day 1, the menu included ______ Which choice most effectively uses data from the table to complete the statement?

- A. shrimp cocktail for meal B.
- B. hot cocoa for meal C.
- **C. sugar cookie cubes for meal B.**  **[KEY]**
- D. chicken and vegetables for meal A.

CB rationale (condensed):
  - `x A` according to the table, shrimp cocktail was served on day 4, not day 1; moreover, the item was served for meal C, not meal B, as this choice claims.
  - `x B` according to the table, hot cocoa was served on day 3, not on day 1; moreover, the item was served for meal A, not for meal C, as this choice claims.
  - `x D` according to the table, chicken and vegetables were served on day 2, not on day 1; moreover, the item was served for meal B, not for meal A, as this choice claims.

**Hard items = the true-but-inert distractor.** All four options are accurate readings of the graphic;
only one performs the *logical function* the stem names. `a15b3219` is the canonical case — CB rejects
three choices with the identical sentence *"This accurately describes some data from the graph, but it
doesn't weaken the hypothesis. It doesn't include the [other] data for comparison."*

**`a15b3219` — Command of Evidence — Hard**

> Municipalities' Responses to Inquiries about Potential Incentives for Firm 1,300 1,200 1,100 Number of municipalities 1,000 900 800 700 600 500 400 300 200 100 0 ns e ry tiv e o qui n sp in ce re to d in no de d re n fe o of esp r announcement before election announcement after election In the United States, firms often seek incentives from municipal governments to expand to those municipalities. A team of political scientists hypothesized that municipalities are much more likely to respond to firms and offer incentives if expansions can be announced in time to benefit local elected officials than if they can't. The team contacted officials in thousands of municipalities, inquiring about incentives for a firm looking to expand and indicating that the firm would announce its expansion on a date either just before or just after the next election. Which choice best describes data from the graph that weaken the team's hypothesis?

- A. A large majority of the municipalities that received an inquiry mentioning plans for an announcement before the next election didn't respond to the inquiry.
- **B. The proportion of municipalities that responded to the inquiry or offered incentives didn't substantially differ across the announcement timing conditions.**  **[KEY]**
- C. Only around half the municipalities that responded to inquiries mentioning plans for an announcement before the next election offered incentives.
- D. Of the municipalities that received an inquiry mentioning plans for an announcement date after the next election, more than 1,200 didn't respond and only around 100 offered incentives.

CB rationale (condensed):
  - `x A` This accurately describes some data from the graph, but it doesn't weaken the hypothesis. It doesn't include the "announcement after election" data for comparison.
  - `x C` This accurately describes some data from the graph, but it doesn't weaken the hypothesis. It doesn't include the "announcement after election" data for comparison.
  - `x D` This accurately describes some data from the graph, but it doesn't weaken the hypothesis. It doesn't include the "announcement before election" data for comparison.

**`702eb7e3` — Command of Evidence — Hard**

> Economic Policy Uncertainty in the United Kingdom, 2005–2010 (larger values = more uncertainty) 200 150 Uncertainty 100 50 0 05 06 07 08 09 10 20 20 20 20 20 20 Year tax and public spending policy trade policy general economic policy High levels of public uncertainty about which economic policies a country will adopt can make planning difficult for businesses, but measures of such uncertainty have not tended to be very detailed. Recently, however, economist Sandile Hlatshwayo analyzed trends in news reports to derive measures not only for general economic policy uncertainty but also for uncertainty related to specific areas of economic policy, like tax or trade policy. One revelation of her work is that a general measure may not fully reflect uncertainty about specific areas of policy, as in the case of the United Kingdom, where general economic policy uncertainty ______ Which choice most effectively uses data from the graph to illustrate the claim?

- A. aligned closely with uncertainty about tax and public spending policy in 2005 but differed from uncertainty about tax and public spending policy by a large amount in 2009.
- B. was substantially lower than uncertainty about tax and public spending policy each year from 2005 to 2010.
- C. reached its highest level between 2005 and 2010 in the same year that uncertainty about trade policy and tax and public spending policy reached their lowest levels.
- **D. was substantially lower than uncertainty about trade policy in 2005 and substantially higher than uncertainty about trade policy in 2010.**  **[KEY]**

CB rationale (condensed):
  - `x A` the graph shows that the level of general economic policy uncertainty was similar to the level of uncertainty about tax and public spending policy in both 2005 (with values of approximately 90 and 100, respectively) and 2009 (with values of approximately 80 and 75, respectively).
  - `x B` the graph shows that general economic policy uncertainty was higher than uncertainty about tax and public spending policy in 2006, 2007, and 2009, not that it was lower each year from 2005 to 2010.
  - `x C` the graph shows that general economic policy uncertainty reached its highest level in 2010, which was when uncertainty about tax and public spending policy also reached its highest level, not its lowest level.

**`15873d14` — Command of Evidence — Medium**

> Percentage of Maize Exported by Three Countries for Marketing Years 2009/2010–2013/2014 90 80 70 60 Percent 50 40 30 20 10 0 0 1 2 3 4 201 201 201 201 201 / / / / / 009 010 011 012 013 2 2 2 2 2 Marketing year Argentina Brazil United States Argentina, Brazil, and the United States are among the world's leading producers of maize (corn), and each country exports a certain percentage of maize each marketing year, which runs from March to February in Argentina and Brazil and from September to August in the United States. A student is researching those percentages and finds that for the marketing year 2012/2013, the percentage of maize exported by ______ Which choice most effectively uses data from the graph to complete the text?

- A. Brazil increased from the previous marketing year but remained lower than the percentage exported by the United States.
- B. Brazil exceeded the percentage exported by Argentina for the first time.
- **C. Argentina decreased from the previous marketing year but remained the highest among the three countries.**  **[KEY]**
- D. the United States reached its highest point during the five marketing years.

CB rationale (condensed):
  - `x A` for the marketing year 2012/2013, the graph indicates that the percentage of maize exported by Brazil didn't increase from the previous year; rather, it decreased from about 34 percent to about 31 percent. Moreover, the graph show
  - `x B` the graph indicates that the percentage of maize exported by Brazil never exceeded the percentage exported by Argentina for any of the marketing years represented.
  - `x D` the graph indicates that the percentage of maize exported by the United States reached its lowest point, not its highest, during the five marketing years in 2012/2013, with the United States exporting only about 8 percent of its m

Priority-coded distractor failure modes across 203 quantitative distractors:

| # | Misread mechanism | N | % | Precise construction |
|---|---|---:|---:|---|
| Q1 | **Wrong row / column / cell.** The value is genuine and appears in the graphic; it belongs to another entity, year, or condition. | 49 | 24% | Take the key's number and swap the row label. Best distractors swap *two* coordinates at once (`shrimp cocktail was served on day 4, not day 1; moreover, the item was served for meal C, not meal B`). |
| Q2 | **Reversed or misordered comparison.** `A > B` when the graphic shows `B > A`; `increased` when it decreased; `highest` when it is the lowest. | 29 | 14% | Keep both entities and the magnitude word; invert the direction. CB: *"reached its lowest point, not its highest"*. |
| Q3 | **True but inert.** A correct reading that does not support / weaken / illustrate the stated claim — typically because it reports **only one arm of the required comparison**. | 19 | 9% | This is *the* Hard build. The claim requires contrasting two series; the distractor reports one series accurately and omits the other. |
| Q4 | **Out of bounds.** Asserts a pattern over a range the graphic does not display, or a variable it does not plot. | 14 | 7% | `each year from 2005 to 2010` when only some years fit; `the data in the graph isn't organized in such a way that a comparison of…` |
| Q5 | **Right data, wrong series.** Reads the correct value from the *other* plotted series (prey-pursuit vs predator-escape; before-election vs after-election). | in Q1/Q4 | | Multi-series graphics make this near-free. |

**Construction rule for quantitative items:** design the graphic so that it contains at least one true
value for every distractor. A quantitative distractor should never be checkable by arithmetic alone —
the reader must locate the right cell *and* verify that the cell does the claim's work.

### 5.2 (b) TEXTUAL — `Which quotation…`

Stem variants (the claim is always stated in the stimulus first, in CB's own words):
```
Which quotation from [literary work] most effectively illustrates the claim?
Which quotation from a work by a historian would most directly support the student's claim?
Which quotation from a work by a historian would be the most effective evidence for the student
     to include in support of this claim?
Which quotation from a researcher would best support the student's assertion?
Which quotation from a scholarly article best supports the assertion of the historians mentioned in the text?
Which choice most effectively uses a quotation from "[work]" to illustrate the claim?
```

Two stimulus templates:

- **Literary**: `"[Title]" is a [year] poem by [Author]. In the poem, [Author] [does X], writing, ______`
  — the claim is a *specific rhetorical operation* (personification, direct address, prediction of future
  success, an emotional relation to place). Options are four real quotations from the same work.
- **Research-paper**: `In a research paper, a student claims that [multi-clause claim].` Options are four
  invented but plausible scholarly quotations.

**How the wrong quotations fail.** The claim in the stimulus is deliberately written as a *conjunction of
two or three conditions*. Each distractor satisfies a proper subset:

| # | Failure | Verbatim CB rationale |
|---|---|---|
| E1 | **Right topic, missing the specific operation.** On-subject, but does not perform the named rhetorical act. | "Although the quotation describes a nighttime scene on a body of water, the element of nature in these lines — the waves — isn't portrayed as an active participant… instead, the waves merely ripple softly against a canoe, as waves would normally do." |
| E2 | **Right operation, wrong subject matter.** | "the quotation doesn't present a nighttime scene on a body of water; instead, it describes petals falling from a rose." |
| E3 | **Satisfies one conjunct, fails the other.** | "Although the quotation presents an image of an element of nature — the moon — it doesn't mention a body of water; moreover, it portrays the moon not as an active participant… but instead as static or unchanging." |
| E4 | **Adjacent evidence that does not reach the claim.** Speaks to the general area but not to the claim's specific object (here: *materials* and *deliberate application*). | "Although the quotation describes a feature of the temple's structure (the high ceiling), it makes no mention of the materials used, the materials' acoustic properties, or temple users' awareness of how materials impact sound quality." |
| E5 | **Supports the wrong proposition.** Evidence for a related but distinct claim — often a *call for more research*, which reads as evidence but is not. | "the quotation suggests that more research is needed to understand the effects." · "this quotation supports the idea that transgenic fish may be present in more ecosystems than has been observed; it doesn't address whether…" |

**Construction rule:** write the claim as `[Author] [operation] [object] [manner]`. Then generate four
candidate quotations that hit, respectively, all four elements (key), operation-minus-object,
object-minus-operation, and neither-but-same-work. CB's own rationales are literally the checklist:
*"it doesn't address any materials that were used in the temple, let alone their acoustic properties or
temple users' awareness of how materials impact sound quality"* — three conjuncts, checked in order.

**`1f3be847` — Command of Evidence — Medium**

> " Loon Point " is a 1912 poem by Amy Lowell. In the poem, which presents a nighttime scene on a body of water, Lowell describes an element of nature as an active participant in the experience, writing, ______ Which quotation from " Loon Point " most effectively illustrates the claim?

- **A. " Through the water the moon writes her legends / In light, on the smooth, wet sand. "**  **[KEY]**
- B. " ' Softly the water ripples / Against the canoe s curving side. "
- C. " Or like the snow-white petals / Which drop from an overblown rose. "
- D. " But the moon in her wayward beauty / Is ever and always the same. "

CB rationale (condensed):
  - `x B` Although the quotation describes a nighttime scene on a body of water, the element of nature in these lines — the waves— isn t'portrayed as an active participant in an experience; instead, the waves merely ripple softly against a canoe, as waves would normally do.
  - `x C` the quotation doesn t present'a nighttime scene on a body of water; instead, it describes petals falling from a rose.
  - `x D` Although the quotation presents an image of an element of nature — — the moon ' it doesn t mention a body of water; " moreover, it portrays the moon not as an active participant in a scene but instead as static or unchanging ( ever and always the same ). "

**`2903668a` — Command of Evidence — Hard**

> The interiors of many temples in the ancient Middle East needed to satisfy a precise set of acoustic demands: the sounds of chants and hymns should travel with clarity, while profound silences should be fully felt and appreciated. In a research paper, a student claims that the users of one such temple were aware of how the materials that were used within the structure could affect sound quality and that they deliberately applied this knowledge to influence how sound was experienced in the space. Which quotation from a work by a historian would most directly support the student's claim?

- A. "Many researchers believe that the central chamber of the temple had a high ceiling, a feature that has since become essential to the acoustic design of modern concert halls."
- B. "The innermost room of the temple was likely among the quietest spaces in the interior of the temple."
- C. "The acoustic environment of the temple was best suited for music that eschewed ornamentation in favor of simple melodies, harmonies, and rhythms."
- **D. "During special occasions, curtains were placed inside the temple to minimize reverberation and confine the sound to designated locations."**  **[KEY]**

CB rationale (condensed):
  - `x A` Although the quotation describes a feature of the temple's structure (the high ceiling), it makes no mention of the materials used, the materials' acoustic properties, or temple users' awareness of how materials impact sound quality.
  - `x B` it doesn't address any materials that were used in the temple, let alone their acoustic properties or temple users' awareness of how materials impact sound quality.
  - `x C` it doesn't address any materials that were used in the temple, let alone their acoustic properties or temple users' awareness of how materials impact sound quality.

**`29f5c8c2` — Command of Evidence — Medium**

> Fish whose DNA has been modified to include genetic material from other species are known as transgenic. Some transgenic fish have genes from jellyfish that result in fluorescence (that is, they glow in the dark). Although these fish were initially engineered for research purposes in the 1990s, they were sold as pets in the 2000s and can now be found in the wild in creeks in Brazil. A student in a biology seminar who is writing a paper on these fish asserts that their escape from Brazilian fish farms into the wild may have significant negative long-term ecological effects. Which quotation from a researcher would best support the student's assertion?

- A. "In one site in the wild where transgenic fish were observed, females outnumbered males, while in another the numbers of females and males were equivalent."
- B. "Though some presence of transgenic fish in the wild has been recorded, there are insufficient studies of the impact of those fish on the ecosystems into which they are introduced."
- C. "The ecosystems into which transgenic fish are known to have been introduced may represent a subset of the ecosystems into which the fish have actually been introduced."
- **D. "Through interbreeding, transgenic fish might introduce the trait of fluorescence into wild fish populations, making those populations more vulnerable to predators."**  **[KEY]**

CB rationale (condensed):
  - `x A` this quotation doesn't mention any negative effects of the introduction of fluorescent transgenic fish into the wild. The quotation merely compares the ratio of females to males at two sites in the wild where transgenic fish have been observed.
  - `x B` this quotation doesn't support the idea that the escape of fluorescent transgenic fish from Brazilian fish farms may have significant negative long-term ecological effects. Rather, the quotation suggests that more research is needed to understand the effects.
  - `x C` this quotation supports the idea that transgenic fish may be present in more ecosystems than has been observed; it doesn't address whether the presence of fluorescent transgenic fish affects these ecosystems.

### 5.3 (c) `Which finding, if true…`

Stem inventory (n = 47): `most directly support` 29 · `most strongly support` 7 · `most directly weaken` 5 ·
`most strongly suggest` 1 · `most directly illustrate` 1 · `most directly challenge` 1. Full forms:
```
Which finding, if true, would most directly support the researchers' hypothesis?
Which finding from the study, if true, would most directly support the researchers' conclusion?
Which finding from the experiment, if true, would most directly support [Names]'s hypothesis?
Which statement, if true, would most directly weaken the claim by [Names] about [X]?
Which statement, if true, would most strongly support the claim in the underlined sentence?
Which detail about [X], if true, would best illustrate the underlined claim?
Based on the text, which finding, if true, would best account for the discrepancy [Name] observed?
```
Difficulty skew is extreme: **26 Hard, 14 Medium, 7 Easy**.

**Structure of the hypothesis.** CB never asks you to support a bare assertion. The stimulus always
builds a **two-domain bridge**:

```
  Domain A (established)   :  In humans, LINE transposons are functionally important in the hippocampus,
                              a structure that supports complex cognitive processes.
  Domain B (new)           :  A LINE transposon was confirmed in two octopus genomes.
  HYPOTHESIS (the bridge)  :  that transposon family is tied to a species' capacity for advanced cognition.
```

The hypothesis is *the generalization that would be true if the A-mechanism operates in B*. A finding
**supports** it only if it establishes the missing link — that the B-instance has the *same functional
role* as the A-instance. It merely **relates** if it adds detail inside A, or inside B, without joining
them. CB's rejection formula is identical across choices and states exactly this:

> *"Choice B is incorrect. This choice doesn't support the hypothesis. It doesn't include anything about
> how LINE transposons function in species other than humans."*
> *"Choice C is incorrect. …It doesn't include anything about how the LINE transposon in octopuses might
> support advanced cognition."*

| # | Distractor build | Why it fails |
|---|---|---|
| H1 | **Deepens Domain A only.** More detail about the established case. | Adds no bridge. |
| H2 | **Deepens Domain B only.** More detail about the new case, on a dimension irrelevant to the hypothesis. | Adds no bridge. |
| H3 | **Correlational look-alike.** Pairs the two domains on the *wrong* variable (brain size, count of copies, taxonomic breadth). | Bridges, but not the hypothesised link. |
| H4 | **Supports when the stem says weaken** (or vice versa). | Directional. |
| H5 | **Targets a neighbouring claim.** In weaken items, undermines a claim the named party did *not* make. CB repeats the corrective verbatim: *"Caron's claim is that fossils from the US and China are ctenophores, not jellyfish"* — three times in one rationale set. | Wrong target. |
| H6 | **True and topical but logically inert.** Plausible fact whose truth leaves the hypothesis exactly as probable as before. | No evidential relation. |

**Construction rule for weaken items:** the key must attack the *inference*, not the *conclusion*. In
`0d7f4966` the key does not say "the fossils are jellyfish"; it says the fossils are too poorly preserved
to be identified as *either* — removing the ground for the claim. Distractors that assert the opposite
conclusion outright are weaker distractors and are not what CB builds.

**`22e4d633` — Command of Evidence — Hard**

> Although many transposons, DNA sequences that move within an organism s genome through'shuffling or duplication, have become corrupted and inactive over time, those from the long interspersed nuclear elements (LINE) family appear to remain active in the genomes of some species. In humans, they are functionally important within the hippocampus, a brain structure that supports complex cognitive processes. When the results of molecular analysis of two species of octopus— an animal known for its intelligence — were announced in 2022, the confirmation of a LINE transposon in Octopus vulgaris and Octopus bimaculoides genomes prompted researchers to hypothesize that that transposon family is tied to a species'capacity for advanced cognition. Which finding, if true, would most directly support the researchers'hypothesis?

- **A. The LINE transposon in O. vulgaris and O. bimaculoides genomes is active in an octopus brain structure that functions similarly to the human hippocampus.**  **[KEY]**
- B. The human genome contains multiple transposons from the LINE family that are all primarily active in the hippocampus.
- C. A consistent number of copies of LINE transposons is present across the genomes of most octopus species, with few known corruptions.
- D. O. vulgaris and O. bimaculoides have smaller brains than humans do relative to body size, but their genomes contain sequences from a wider variety of transposon families.

CB rationale (condensed):
  - `x B` This choice doesn t support the hypothesis. It doesn t include anything about how LINE transposons function in species ' ' other than humans.
  - `x C` This choice doesn t support the hypothesis. It doesn t include anything about how the LINE transposon ' ' in octopuses might support advanced cognition.
  - `x D` This choice doesn t support the hypothesis. It doesn t include anything about how the LINE transposon in octopuses might support advanced cognition.

**`0d7f4966` — Command of Evidence — Hard**

> Jean-Bernard Caron and colleagues recently discovered a cache of jellyfish fossils in the Burgess Shale, a site in the Canadian Rockies that is rich in fossils from the Cambrian period (over 500 million years ago). Caron and colleagues claim that these are the oldest jellyfish fossils ever discovered. In the past twenty years, two sites in China and the United States have yielded fossils of a similar age that some experts believe are most likely jellyfish due to their shapes and the appearance of projecting tentacles. But Caron and colleagues argue that the apparent tentacles are in fact the comb rows of ctenophores, gelatinous animals that are only distantly related to jellyfish. Which statement, if true, would most directly weaken the claim by Caron and colleagues about the fossils found in China and the United States?

- A. Sites in the Canadian Rockies from later periods than the Cambrian period have yielded fossils that have been conclusively identified as ctenophore fossils.
- **B. The fossils found in China and the United States are so poorly preserved that though they cannot be conclusively identified as jellyfish, they cannot be conclusively identified as ctenophores either.**  **[KEY]**
- C. While ctenophore fossils have been discovered in China and the United States, they have never been discovered in the Burgess Shale.
- D. The fossils discovered by Caron and colleagues in the Burgess Shale were better preserved than the fossils discovered by other researchers in China and the United States.

CB rationale (condensed):
  - `x A` Caron's claim is that fossils from the US and China are ctenophores, not jellyfish. These fossils are said to be "of a similar age" to the Cambrian fossils found in the Canadian Rockies. And nothing in the text or this choice suggests that the presence or absence of ctenophores after the Cambrian wo
  - `x C` Caron's claim is that fossils from the US and China are ctenophores, not jellyfish. Nothing in the text suggests that the presence or absence of ctenophores in the Burgess Shale (in Canada) would affect whether the fossils found in the US and China are ctenophores.
  - `x D` Caron's claim is that fossils from the US and China are ctenophores, not jellyfish. Although fossil quality is a plausible issue for the research described in the text, nothing in the text or this choice suggests that the fossils from US and China would have been too poorly preserved for proper iden

**`068f939b` — Command of Evidence — Hard**

> The ancient Greek concept of " mimesis, " a term used in the works of Plato, Aristotle, and other Greek philosophers in discussions of representational art — visual, performance, or literary art that aims to depict the real world — is a foundational concept of the Western philosophy of aesthetics. Mimesis is typically translated as " imitation " in modern editions of ancient Greek texts, but scholar Stephen Halliwell warns that this is overly reductive: " imitation " implies that art merely copies —and is thus by definition entirely derivative of — a reality that exists outside and prior to the work of art, and translating " mimesis " thusly obscures the multifaceted ways in which the ancient Greeks understood the relationship between art and reality. Which statement, if true, would most directly support the claim by Halliwell presented in the text?

- A. One of the earliest appearances of mimesis s root word, mimos, can be'found in an ancient Greek tragedy in reference to dramatic impersonation, and the mim- root came to be generally associated with the musical and poetic arts by the fifth century BCE. ' '
- B. Both Plato s and Aristotle s theorizations of mimesis examine the psychological effects that works of art induce in the viewer or listener.
- C. Although several of Plato s earliest'philosophical works discuss aesthetic ideas, the term " mimesis " ' ' doesn t appear in Plato s discussions of art until Cratylus, a relatively late work.
- **D. Although Plato s'writings typically characterize representational art as an inferior reflection of the physical world, Aristotle suggests that mimesis can refer to art s capacity to'envision hypothetical conditions that could, but don t yet, exist. '**  **[KEY]**

CB rationale (condensed):
  - `x A` information about the root word mimos first being used in drama and the root mim- coming to be associated with music and poetry wouldn t indicate'anything about the meaning of the specific term "mimesis" as it was used by ancient Greek philosophers in discussions of representational art; thus, the i
  - `x B` the issue of art s psychological effects on audiences'gets at how people respond to works of art instead of how art itself is related to reality, so the idea that Plato and Aristotle both addressed such effects in their considerations ' ' of mimesis wouldn t have any bearing on Halliwell s claim tha

---

## 6. CROSS-TEXT CONNECTIONS

**N = 38** (Easy 6 / Medium 16 / Hard 16). Rarest Reading skill; typically **2 items per RW module**.

### 6.1 Text lengths

- **Text 1: median 68 words** (range 50–93), mean 69.
- **Text 2: median 66 words** (range 51–88), mean 66.
- The two texts are deliberately **near-equal in length** (mean difference 3 words) and each runs 3–4
  sentences. Combined stimulus ≈ 135 words — comparable to one Inference stimulus split in two.
- Text 1 is *always* the position under pressure; Text 2 *always* does the work on it.

### 6.2 Exact stems

Three families. The **response** family is 27/38 = 71% of items:

```
RESPONSE (71%)
  Based on the texts, how would the author of Text 2 most likely respond to the underlined claim in Text 1?
  Based on the texts, how would the author of Text 2 most likely respond to the overall argument presented in Text 1?
  Based on the texts, how would the author of Text 2 most likely respond to the claims of the author of Text 1?
  Based on the texts, how would [Names] (Text 2) most likely respond to the research discussed in Text 1?
  Based on the texts, how would [Names] (Text 2) most likely respond to the "conventional wisdom" discussed in Text 1?
  Based on the texts, how would [Names] (Text 2) most likely characterize the conclusion presented in Text 1?
  Based on the texts, what would [Name] (Text 2) most likely say about the interpretation presented in the
       underlined portion of Text 1?
  Based on the two texts, how would the author of Text 1 most likely regard the situation presented in the
       underlined sentence in Text 2?

AGREEMENT (16%)
  Based on the texts, both authors would most likely agree with which statement?
  Based on the texts, both [Name] in Text 1 and the scholars in Text 2 would most likely agree with which statement?
  Based on the texts, [Team] and the author of Text 2 would most likely agree with which statement about [X]?
  Based on the texts, if [A] (Text 1) and [B] (Text 2) were aware of the findings of both experiments,
       they would most likely agree with which statement?

RELATION / DIFFERENCE (8%)
  Which choice best describes how Text 1 and Text 2 relate to each other?
  Which choice best describes a difference in how the author of Text 1 and the author of Text 2 view [X]?
```

### 6.3 How the two texts relate

The relation is never symmetric disagreement. Observed inventory:

| Relation | Description and example |
|---|---|
| **Qualifies** (most common at Hard) | Text 2 accepts Text 1's concern but denies its universality. `105ea6de`: T1 says conjugation *may* make innocuous nanomaterials toxic; T2 agrees the worry is deserved but says effects `vary by case` and gives a counter-instance. Key: *"By agreeing that the possibility described in Text 1 is a cause for concern but pointing out that nanomaterial conjugation does not inevitably produce that result."* |
| **Rebuts** | Text 2 supplies a fact that defeats Text 1's inference. `de2c2f57`: T1 offers Miller & Simpson's carcass-preservation explanation; T2 notes scavengers and weathering destroy surface remains within a millennium. |
| **Offers an alternative explanation** | Same phenomenon, different mechanism. |
| **Provides evidence bearing on Text 1** | T2 reports a study whose result cuts against T1's conclusion. `02fd3da7`: T1 (Fowler) says compulsory voting makes results more representative; T2 (Singh & Roy) finds coerced voters research less, so their votes may not reflect preferences. |
| **Shares a premise while differing on the conclusion** (agreement items) | The key is the *sub-claim both texts entail*, usually a background fact neither disputes. `97e5bf55`: Sykes and modern scholars disagree about authorship but both rely on `John Fletcher's writing has a unique, readily identifiable style`. |

**Note the option grammar of Hard response items:** all four options are `By [V-ing] that [T1 proposition]
but [V-ing] that [T2 proposition]` — a two-move concession structure with the same skeleton in all four.
The four choices vary the *stance verbs* (`concurring/arguing/denying/agreeing`) and the *second move*.
Building this well is the single hardest thing in the skill.

### 6.4 How the wrong options fail (n = 114 distractors)

| # | Build | Rate | CB's phrasing |
|---|---|---:|---|
| X1 | **Neither text addresses it** — content imported from outside both passages, on-topic and reasonable. | 25% | "Neither text mentions the population size of countries that require voting." · "Neither text discusses the ease or difficulty of the voting process." · "Neither text gets into the diets of people in the United States, nor the diets of people in Japan." |
| X2 | **Misstates one text's position** — attributes to Text 1 or Text 2 a claim it never makes. | 17% | "Text 1 does not describe a critique of Wang and colleagues' methodology, but rather an interpretation of their results by Miller and Simpson." |
| X3 | **Invented stance** — manufactures agreement where the text is silent, or disagreement where the text concedes. | 11% | "The author of Text 2 agrees that the potential toxicity of nanohybrids 'has drawn deserved attention,' so they aren't denying the problem." |
| X4 | **Overstates one text's position** — pushes a qualified claim to a categorical one. | | "This choice overstates the central claim of Text 2. The author of Text 2 argues against the chronological progression supported in Text 1, but does not go so far as to say that Soyinka's style remained consistent." |
| X5 | **Both moves come from one text** — the option describes a contrast that occurs *inside* Text 1. | | "Both components mentioned here… are contained in Text 1." |
| X6 | **One text supports it, the other is silent** — fatal in `both would agree` items. | | "Text 2 does talk about the molecular weights of chemical compounds, but there isn't enough information provided about molecular weights in Text 1 to make an inference about what the scientists in Text 1 would say." |

**The single mechanical test for agreement items:** the key must be independently derivable from *each*
text on its own. If either text is silent on any clause of the option, it is a distractor.

**`02fd3da7` — Cross-Text Connections — Easy**

> Text 1 Public policy researcher Anthony Fowler studied the history of elections in Australia, a country that requires citizens to vote. Fowler argues that requiring citizens to vote leads to a significant increase in voters who would otherwise not have the time or motivation to vote. Thus, election results in countries that require citizens to vote better reflect the preferences of the country as a whole. Text 2 Governments in democratic countries function better when more people vote. However, forcing people to vote may have negative consequences. Shane P. Singh and Jason Roy studied what happens when a country requires its citizens to vote. They found that when people feel forced to vote, they tend to spend less time looking for information about their choices when voting. As a result, votes from these voters may not reflect their actual preferences. Based on the texts, how would Singh and Roy (Text 2) most likely respond to the research discussed in Text 1?

- A. Only countries of a certain population size should implement mandatory voting.
- B. People who are forced to vote are likely to become politically engaged in other ways, such as volunteering or running for office.
- **C. Requiring people to vote does not necessarily lead to election outcomes that better represent the preferences of the country as a whole.**  **[KEY]**
- D. Countries that require voting must also make the process of voting easier for their citizens.

CB rationale (condensed):
  - `x A` Neither text mentions the population size of countries that require voting, or how that might affect election outcomes.
  - `x B` Neither text discusses the effects of mandatory voting on other forms of political engagement.
  - `x D` Neither text discusses the ease or difficulty of the voting process in countries that require voting.

**`97e5bf55` — Cross-Text Connections — Medium**

> Text 1 In 1916, H. Dugdale Sykes disputed claims that The Two Noble Kinsmen was coauthored by William Shakespeare and John Fletcher. Sykes felt Fletcher s'contributions to the play were obvious — Fletcher had a distinct style in his other plays, so much so that lines with that style were considered sufficient evidence of Fletcher s'authorship. But for the lines not deemed to be by Fletcher, Sykes felt that their depiction of women indicated that their author was not Shakespeare but Philip Massinger. Text 2 Scholars have accepted The Two Noble Kinsmen as coauthored by Shakespeare since the 1970s: it appears in all major one-volume editions of Shakespeare s complete'works. Though scholars disagree about who wrote what exactly, it is generally held that on the basis of style, Shakespeare wrote all of the first act and most of the last, while John Fletcher authored most of the three middle acts. Based on the texts, both Sykes in Text 1 and the scholars in Text 2 would most likely agree with which statement?

- **A. John Fletcher s writing'has a unique, readily identifiable style.**  **[KEY]**
- B. The women characters in John Fletcher s'plays are similar to the women characters in Philip Massinger s plays.'
- C. The Two Noble Kinsmen belongs in one-volume compilations of Shakespeare s complete'plays.
- D. Philip Massinger s style'in the first and last acts of The Two Noble Kinsmen is an homage to Shakespeare s style. '

CB rationale (condensed):
  - `x B` While Text 1 refers to the women in Massinger plays, neither text compares the women of Fletcher s plays'to the women of ' ' Massinger s plays. Text 2 doesn t mention Massinger at all.
  - `x C` Text 1 states that Sykes disputed that Shakespeare coauthored the play, and implied that it was coauthored by Fletcher and Massinger instead. Sykes, therefore, would disagree that The Two Noble Kinsmen belongs in a Shakespeare compilation.
  - `x D` Text 1 doesn t'suggest that Massinger was inspired by Shakespeare, and Text 2 doesn t'mention Massinger at all.

**`a87c3925` — Cross-Text Connections — Hard**

> Text 1 Soy sauce, made from fermented soybeans, is noted for its umami flavor. Umami —one of the five basic tastes along with sweet, bitter, salty, and sour — was formally classified when its taste receptors were discovered in the 2000s. In 2007, to define the pure umami flavor scientists Rie Ishii and Michael O Mahony'used broths made from shiitake mushrooms and kombu seaweed, and two panels of Japanese and US judges closely agreed on a description of the taste. Text 2 A 2022 experiment by Manon J ünger et al. led to a greater understanding of soy sauce's flavor profile. The team initially presented a mixture of compounds with low molecular weights to taste testers who found it was not as salty or bitter as real soy sauce. Further analysis of soy sauce identified proteins, including dipeptides, that enhanced umami flavor and also contributed to saltiness. The team then made a mix of 50 chemical compounds that re-created soy sauce s flavor.' Based on the texts, if Ishii and O'Mahony (Text 1) and J ünger et al. (Text 2) were aware of the findings of both experiments, they would most likely agree with which statement?

- A. On average, the diets of people in the United States tend to have fewer foods that contain certain dipeptides than the diets of people in Japan have.
- B. Chemical compounds that activate both the umami and salty taste receptors tend to have a higher molecular weight than those that only activate umami taste receptors.
- C. Fermentation introduces proteins responsible for the increase of umami flavor in soy sauce, and those proteins also increase the perception of saltiness.
- **D. The broths in the 2007 experiment most likely did not have a substantial amount of the dipeptides that played a key part in the 2022 experiment.**  **[KEY]**

CB rationale (condensed):
  - `x A` Neither text supports this. Neither text gets into the diets of people in the United States, nor the diets of people in Japan.
  - `x B` Neither text supports this. Text 2 does talk about the molecular weights of chemical compounds, but there isn t enough ' information provided about molecular weights in Text 1 to make an inference about what the scientists in Text 1 would say.
  - `x C` Neither text supports this. Text 1 briefly mentions that soy sauce is " made from fermented soybeans, " but it never claims that fermentation is responsible for its flavor in any way. And Text 2 never mentions fermentation at all.

**`de2c2f57` — Cross-Text Connections — Medium**

> Text 1 The fossil record suggests that mammoths went extinct around 11 thousand years (kyr) ago. In a 2021 study of environmental DNA (eDNA) — genetic material shed into the environment by organisms — in the Arctic, Yucheng Wang and colleagues found mammoth eDNA in sedimentary layers formed millennia later, around 4 kyr ago. To account for this discrepancy, Joshua H. Miller and Carl Simpson proposed that arctic temperatures could preserve a mammoth carcass on the surface, allowing it to leach DNA into the environment, for several thousand years. Text 2 Wang and colleagues concede that eDNA contains DNA from both living organisms and carcasses, but for DNA to leach from remains over several millennia requires that the remains be perpetually on the surface. Scavengers and weathering in the Arctic, however, are likely to break down surface remains well before a thousand years have passed. Which choice best describes how Text 1 and Text 2 relate to each other?

- A. Text 1 discusses two approaches to studying mammoth extinction without advocating for either, whereas Text 2 advocates for one approach over the other.
- **B. Text 1 presents findings by Wang and colleagues and gives another research team s'attempt to explain those findings, whereas Text 2 provides additional detail that calls that explanation into question.**  **[KEY]**
- C. Text 1 describes Wang and colleagues study'and a critique of their methodology, whereas Text 2 offers additional details showing that methodology to be sound.
- D. Text 1 argues that new research has undermined the standard view of when mammoths went extinct, whereas Text 2 suggests a way to reconcile the standard view with that new research.

CB rationale (condensed):
  - `x A` Neither text compares two different approaches for studying mammoth extinction. Text 1 describes one study and one hypothesis pertaining to it. Text 2 critiques that hypothesis.
  - `x C` Text 1 does not describe a critique of Wang and colleagues ' methodology, but rather an interpretation of their results by Miller and Simpson. Text 2 does not offer additional details showing that methodology to be sound, but rather casts doubt on the Miller/Simpson explanation.
  - `x D` Both components mentioned here (the new "undermining" research and the theory for reconciling this discovery) are contained in Text 1. Text 2 then shows how the attempt to reconcile the standard view and new research is flawed, and still fails to explain the discrepancy.

**`2c50ed1a` — Cross-Text Connections — Medium**

> Text 1 Literary scholars have struggled with the vastness of Nigerian writer Wole Soyinka's collective works of drama (spanning over 20 plays in total). It is best, however, to understand Soyinka's body of work as a dramatist chronologically. Soyinka's progression as a playwright can be considered to fall into three periods, with each one representing a particular thematic and stylistic cohesion: the 1960s, the two decades between 1970 and 1990, and lastly, from roughly 1990 onwards. Text 2 It is tempting to impose a linear sense of order on the expanse of Wole Soyinka's body of work as a dramatist. However, critics who have considered Soyinka's plays to fit neatly into three phases overlook potential commonalities in Soyinka's work that span across these phases. Additionally, this view may discount significant differences in the styles and content of plays written around the same time. Which choice best describes a difference in how the author of Text 1 and the author of Text 2 view the study of Soyinka's works of drama?

- **A. While the author of Text 1 believes that thinking about Soyinka's works of theater in phases is useful, the author of Text 2 views such an approach as limiting.**  **[KEY]**
- B. Although the author of Text 1 claims that Soyinka's style as a dramatist has evolved over time, the author of Text 2 argues that Soyinka's style has remained consistent throughout his career.
- C. The author of Text 1 considers Soyinka's plays to showcase his strongest writing, whereas the author of Text 2 believes that Soyinka's poetry is where he is most skilled.
- D. The author of Text 1 argues that Soyinka's early plays were his most politically charged, whereas the author of Text 2 claims that Soyinka's most recent plays are the most politicized.

CB rationale (condensed):
  - `x B` This choice overstates the central claim of Text 2. The author of Text 2 argues against the chronological progression supported in Text 1, but does not go so far as to say that Soyinka's style remained consistent. In fact, Text 2 points out "significant differences in styles and content" a
  - `x C` Neither of the texts mention Soyinka's poetry, nor do they rank his dramatic writing relative to his other work.
  - `x D` Neither text discusses the political aspects of Soyinka's plays, nor do they make any claims about whether they have changed over time.

**`105ea6de` — Cross-Text Connections — Hard**

> Text 1 Growth in the use of novel nanohybrids — materials created from the conjugation of multiple distinct nanomaterials, such as iron oxide and gold nanomaterials conjugated for use in magnetic imaging — ' has outpaced studies of nanohybrids environmental risks. Unfortunately, risk ' ' evaluations based on nanohybrids constituents are not reliable: conjugation may alter constituents physiochemical properties such that innocuous nanomaterials form a nanohybrid that is anything but. Text 2 The potential for enhanced toxicity of nanohybrids relative to the toxicity of constituent nanomaterials has drawn deserved attention, but the effects of nanomaterial conjugation vary by case. For instance, it was recently shown that a nanohybrid of silicon dioxide and zinc oxide preserved the desired optical transparency of zinc oxide nanoparticles while mitigating the nanoparticles potential'to damage DNA. Based on the texts, how would the author of Text 2 most likely respond to the assertion in the underlined portion of Text 1?

- A. By concurring that the risk described in Text 1 should be evaluated but emphasizing that the risk is more than offset by the potential benefits of nanomaterial conjugation
- B. By arguing that the situation described in Text 1 may not be representative but conceding that the effects of nanomaterial conjugation are harder to predict than researchers had expected
- C. By denying that the circumstance described in Text 1 is likely to occur but acknowledging that many aspects of nanomaterial conjugation are still poorly understood
- **D. By agreeing that the possibility described in Text 1 is a cause for concern but pointing out that nanomaterial conjugation does not inevitably produce that result**  **[KEY]**

CB rationale (condensed):
  - `x A` While the author of Text 2 gives an example of a nanohybrid that isn t as toxic as its constituent parts, they don t argue that the benefit outweighs the risk. They merely argue that " the effects of nanomaterial conjugation vary by case. "
  - `x B` The author of Text 2 states that the effects of nanomaterial conjugation "vary by case, " and that the attention that their potential toxicity has drawn is warranted. If the situation in Text 1 weren't representative, then there would be less attention to the potential danger of these mate
  - `x C` The author of Text 2 agrees that the potential toxicity of nanohybrids "has drawn deserved attention, " ' so they aren t denying the problem.

---

## 7. RHETORICAL SYNTHESIS

**N = 143** (Easy 25 / Medium 85 / Hard 33).

### 7.1 Exact stem

```
While researching a topic, a student has taken the following notes:
  • [note 1]
  • [note 2]   … typically 4–6 bullets
The student wants to <GOAL>. Which choice most effectively uses relevant information
from the notes to accomplish this goal?
```

**139/143 (97%)** use `…to accomplish this goal?`; **4/143** use the plural `…to accomplish these
goals?` — and that plural is a *signal*: it marks a two-part goal (`emphasize the decline in unique apple
varieties in the US **and specify why** this decline occurred`) where the key must satisfy both conjuncts.

### 7.2 Goal taxonomy (verbatim goal clauses, n = 140 parsed)

| Goal family | N | Verbatim `The student wants to…` clauses |
|---|---:|---|
| **Emphasize a similarity** | 13 | `emphasize a similarity between the two specimens` · `…between P waves and S waves` · `…between Beard's invention and Jones's invention` · `emphasize a similarity in how critics responded to Treuer's book` · `emphasize the significance of a similarity between two of the kits` |
| **Emphasize a difference / contrast** | 18 | `emphasize a difference between C-type and S-type asteroids` · `emphasize a difference in how katydids and crab spiders use mimicry` · `contrast first-class levers and second-class levers` · `contrast the emissivity of reflective metal fibers with that of silicon carbide fibers` · `contrast the purposes of the two maps in The Hobbit` · `compare some disadvantages of docked and dockless bike-share programs` |
| **Emphasize a property / magnitude / order** | 14 | `emphasize the thickness of lead-208's neutron skin` · `emphasize the distance covered by the Philadelphia and Lancaster Turnpike` · `emphasize how long the museum has existed` · `emphasize the order in which the two marches occurred` · `emphasize the uniqueness of Taylor's accomplishment` · `emphasize the thoroughness of Ida Tarbell's investigation` |
| **Present the study's aim** | 6 | `present the primary aim of the research study` · `emphasize the aim of the research study` (×3) · `present the aim of the study` |
| **Present the study + method / findings** | 12 | `present the study and its methodology` · `present LIGO's aim and methodology` · `present the study and its findings` (×2) · `present an overview of the study's findings` · `present the study's results` · `present the Quanhucun study and its conclusions` · `summarize the study's findings` |
| **Present a finding and its significance** | 5 | `emphasize the fossil's significance` · `emphasize the historical significance of Stephen Amos's enlistment date` · `emphasize the significance of the 1990 discovery to Plot's reputation` |
| **Introduce X to a specified audience** | 12 | `introduce Kahlo to an audience unfamiliar with the artist` · `introduce Cathryn Halverson's book to an audience already familiar with the Atlantic Monthly` · `describe the rocking chair to an audience unfamiliar with Sam Maloof` · `describe Adnan's December from My Window to an audience already familiar with leporellos` · `present Tan's research to an audience unfamiliar with Angkor Wat` · `describe where Fung is in the photograph to an audience already familiar with Kang and Fung` |
| **Explain a mechanism / cause / advantage** | 12 | `explain how DLS cures 3D objects` · `explain why brine pools are toxic to most sea life` · `explain an advantage of the ICAA's archive being digital` · `explain the origin of the species' name` · `specify how the salt enables energy storage` |
| **Specify a single fact** | 15 | `specify how many chromosomes the pineapple has` · `specify the location of Ctesiphon` · `identify the year that The Canon of Medicine was published` · `indicate how long John Cage's musical piece will last` · `specify who may have first populated the Azores, according to the 2015 study` |
| **Make (and support) a generalization** | 8 | `make a generalization about ultramarathons` · `make and support a generalization about exoplanets` · `make and support a generalization about honeybees` · `make and support a generalization about the orbits of comets` |
| **Define + exemplify** | 5 | `define the term "Lazarus species" and provide an example of one` · `provide an explanation and an example of Aeolian landforms` |
| **Place in context / begin a narrative / overview** | 10 | `place Einstein's argument within its historical context` · `begin a narrative about the creation of the robots` · `provide a historical overview of the two theories` · `provide an overview of the matsutake commodity chain` |

**Note the audience parameter.** `unfamiliar with X` requires the key to *include* a gloss of X;
`already familiar with X` requires the key to *omit* background about X. This flips which option is
correct while leaving all four factually accurate — the purest instance of the off-goal architecture.
See `39ccb463`, where CB rejects C with *"The sentence assumes that the audience is unfamiliar with the
Atlantic Monthly, providing background information about the magazine"*.

### 7.3 The essential architecture, made mechanical

**Across all 429 Rhetorical Synthesis distractors, CB uses the words `inaccurate`, `not accurate`,
`incorrectly states`, `misstates`, or `distorts` exactly ZERO times.** Only 6.3% of rationales mention the
notes failing to support the sentence at all, and those say `misrepresents information in the notes`
(a subtle over-claim), not `false`. **69.5%** of rationales are the pure off-goal formula:

```
Choice <L> is incorrect. The sentence <accurately describes what it does do>;
     it doesn't <verbatim restatement of the goal clause>.
```

Examples of that formula, verbatim:

- *"The sentence contrasts the locations of Sue and Big Mike; it doesn't emphasize a similarity between the two specimens."*
- *"The sentence emphasizes a similarity between jellyfish and black dragonfish; it doesn't emphasize a difference between the behavior of the two animals."*
- *"This choice doesn't present the primary aim of the research study. It describes how the study worked, but not why it was done."*
- *"This choice doesn't present the primary aim of the research study. It describes a result of the experiment, but not why it was carried out."*
- *"The sentence describes a finding from the LIGO study; it doesn't effectively present the study's aim or its methodology."*
- *"The sentence makes and supports a generalization about stars, not exoplanets."*
- *"While the sentence describes the rocking chair, it doesn't explain who Sam Maloof was."*

**The build, in five deterministic steps:**

1. **Write 4–6 notes that partition into functional roles.** Every set contains, at minimum: a
   *background/definition* note, an *aim/motivation* note, a *method* note, a *result* note, and one or
   two *incidental fact* notes (dates, places, honours, names). The goal clause will select exactly one
   role, or exactly two.
2. **Write the key** as a single sentence that uses the notes belonging to the selected role(s), and only
   those. If the goal is compound (`aim and methodology`; `emphasize X and specify why`), the key must
   contain both, joined in one sentence.
3. **Build each distractor from a DIFFERENT role**, written just as fluently and just as accurately:

   | # | Distractor build | Fails because |
   |---|---|---|
   | R1 | **Wrong role.** Uses the method notes when the goal asks for the aim; the result note when the goal asks for the method. | Off-goal. |
   | R2 | **Right relation, wrong polarity.** Emphasizes a *similarity* when the goal says difference (or vice versa) — both are truly in the notes. | Off-goal. |
   | R3 | **One-sided.** Describes only one of the two entities the goal requires a comparison between. | *"The sentence only provides information about one specimen (Big Mike)."* |
   | R4 | **Half of a compound goal.** Satisfies conjunct 1, drops conjunct 2. Rate: 9.1%. | *"While the sentence emphasizes the decline…, it doesn't explain why this decline occurred."* |
   | R5 | **Wrong level of generality.** Generalizes about the superordinate category (stars, crops) rather than the named one (exoplanets, US apple varieties). | *"The sentence emphasizes the general decline of crop varieties in the mid-1900s; it doesn't emphasize the specific decline in unique apple varieties in the US."* |
   | R6 | **Wrong audience calibration.** Supplies background the audience already has, or omits background the audience lacks. | *"…providing background information about the magazine; it doesn't effectively introduce Halverson's book to an audience already familiar with the Atlantic Monthly."* |
   | R7 | **Meets the goal but adds an unsupported inferential step.** The one build where a distractor over-reaches: it draws a conclusion the notes do not license (`disproved his claims`, `cast doubt on`). Rate: 6.3%. | *"While the sentence does emphasize that the discovery challenged Plot's reputation, it misrepresents information in the notes."* |

4. **Verify accuracy of all four.** Read each option against the notes. If you can mark any option
   *false*, rewrite it — a false option is a giveaway and is not what CB builds.
5. **Verify off-goal-ness of the three.** For each distractor, write CB's sentence: `The sentence [does
   Y]; it doesn't [goal clause verbatim].` If you cannot write that sentence, the distractor is either
   a second correct answer or a throwaway.

**`af76771f` — Rhetorical Synthesis — Easy**

> While researching a topic, a student has taken the following notes: Sue is the nickname of a dinosaur fossil specimen housed at the Field Museum of Natural History. The Field Museum of Natural History is located in Chicago, Illinois. Sue is a member of the genus Tyrannosaurus. Big Mike is the nickname of a dinosaur fossil specimen housed at the Museum of the Rockies. The Museum of the Rockies is located in Bozeman, Montana. Big Mike is a member of the genus Tyrannosaurus. The student wants to emphasize a similarity between the two specimens. Which choice most effectively uses relevant information from the notes to accomplish this goal?

- A. The Field Museum of Natural History, where Sue is housed, is located in Chicago, Illinois.
- B. Big Mike is the nickname of a Tyrannosaurus fossil specimen housed at the Museum of the Rockies in Bozeman, Montana.
- **C. The dinosaur fossil specimens Sue and Big Mike are both members of the genus Tyrannosaurus.**  **[KEY]**
- D. While Sue is housed at the Field Museum of Natural History, Big Mike is housed at the Museum of the Rockies.

CB rationale (condensed):
  - `x A` The sentence only provides information about where one of the specimens (Sue) can be found; it doesn't emphasize a similarity between the two specimens.
  - `x B` The sentence only provides information about one specimen (Big Mike); it doesn't emphasize a similarity between the two specimens.
  - `x D` The sentence contrasts the locations of Sue and Big Mike; it doesn't emphasize a similarity between the two specimens.

**`e3484c07` — Rhetorical Synthesis — Easy**

> While researching a topic, a student has taken the following notes: Bioluminescence is the emission of light by living organisms. This light is produced by chemical reactions in organisms' cells. Jellyfish emit flashes of blue light. This behavior serves to startle predators. Black dragonfish emit a steady red light. This behavior helps them locate prey in deep waters. The student wants to emphasize a difference between the behavior of jellyfish and that of black dragonfish. Which choice most effectively uses relevant information from the notes to accomplish this goal?

- A. Both jellyfish and black dragonfish are organisms that emit light, which is produced by chemical reactions in these organisms' cells.
- B. Black dragonfish emit a steady red light, which helps them locate prey in deep waters.
- C. Bioluminescence, the emission of light by living organisms, results from chemical reactions in organisms' cells.
- **D. Jellyfish emit light to startle predators, whereas black dragonfish do so to locate prey.**  **[KEY]**

CB rationale (condensed):
  - `x A` The sentence emphasizes a similarity between jellyfish and black dragonfish; it doesn't emphasize a difference between the behavior of the two animals.
  - `x B` The sentence emphasizes the type of bioluminescence exhibited by black dragonfish, noting that it's used in predation; it doesn't emphasize a difference between the behavior of the two animals.
  - `x C` The sentence defines bioluminescence and explains how it works; the sentence doesn't mention either animal or emphasize a difference between them.

**`afec1a70` — Rhetorical Synthesis — Medium**

> While researching a topic, a student has taken the following notes: As engineered structures, many bird nests are uniquely flexible yet cohesive. A research team led by Yashraj Bhosale wanted to better understand the mechanics behind these structural properties. Bhosale s'team used laboratory models that simulated the arrangement of flexible sticks into nest-like structures. The researchers analyzed the points where sticks touched one another. When pressure was applied to the model nests, the number of contact points between the sticks increased, making the structures stiffer. The student wants to present the primary aim of the research study. Which choice most effectively uses relevant information from the notes to accomplish this goal?

- **A. Bhosale s team wanted to better understand the mechanics behind bird nests uniquely flexible yet cohesive structural properties.**  **[KEY]**
- B. The researchers used laboratory models that simulated the arrangement of flexible sticks and analyzed the points where sticks touched one another.
- C. After analyzing the points where sticks touched, the researchers found that the structures became stiffer when pressure was applied.
- D. As analyzed by Bhosale's team, bird nests are uniquely flexible yet cohesive engineered structures.

CB rationale (condensed):
  - `x B` This choice doesn't present the primary aim of the research study. It describes how the study worked, but not why it was done.
  - `x C` This choice doesn't present the primary aim of the research study. It describes a result of the experiment, but not why it was carried out.
  - `x D` This choice doesn't present the primary aim of the research study.

**`5a5e22b5` — Rhetorical Synthesis — Medium**

> While researching a topic, a student has taken the following notes: Gravitational waves are powerful ripples that originate in deep space and eventually pass through Earth. The Laser Interferometer Gravitational Wave Observatory (LIGO) is a physics study that began in 2002. LIGO's goal is to detect and analyze gravitational waves. LIGO uses a pair of massive gravitational wave detectors called interferometers that are thousands of miles apart. In 2015, for the first time in history, LIGO researchers detected a gravitational wave passing through Earth. The student wants to present LIGO's aim and methodology. Which choice most effectively uses relevant information from the notes to accomplish this goal?

- A. In 2015, LIGO's massive interferometers detected a powerful ripple that originated in deep space and eventually passed through Earth.
- B. Though the physics study LIGO began in 2002, its massive interferometers didn't detect a gravitational wave until 2015.
- C. To achieve its aims, LIGO uses a pair of massive interferometers that are thousands of miles apart.
- **D. A physics study designed to detect and analyze gravitational waves, LIGO uses a pair of massive interferometers that are thousands of miles apart.**  **[KEY]**

CB rationale (condensed):
  - `x A` The sentence describes a finding from the LIGO study; it doesn't effectively present the study's aim or its methodology.
  - `x B` The sentence provides background information about the LIGO study's timeline; it doesn't effectively present the study's aim or its methodology.
  - `x C` The sentence touches on LIGO's methodology, noting that it uses two interferometers, but doesn't indicate what the study's aims are.

**`48d0bb34` — Rhetorical Synthesis — Medium**

> While researching a topic, a student has taken the following notes: Sam Maloof (1916 – 2009) was an American woodworker and furniture designer. He was the son of Lebanese immigrants. He received a " " genius grant from the John D. and Catherine T. MacArthur Foundation in 1985. The Museum of Fine Arts in Boston, Massachusetts, owns a rocking chair that Maloof made from walnut wood. The armrests and the seat of the chair are sleek and contoured, and the back consists of seven spindle-like slats. The student wants to describe the rocking chair to an audience unfamiliar with Sam Maloof. Which choice most effectively uses relevant information from the notes to accomplish this goal?

- **A. With its sleek, contoured armrests and seat, the walnut rocking chair in Boston s Museum'of Fine Arts is just one piece of furniture created by American woodworker Sam Maloof.**  **[KEY]**
- B. Sam Maloof was born in 1916 and died in 2009, and during his life, he made a chair that you can see if you visit the Museum of Fine Arts in Boston.
- C. Furniture designer Sam Maloof was a recipient of one of the John D. and Catherine T. MacArthur Foundation s ' " genius grants. "
- D. The rocking chair is made from walnut, and it has been shaped such that its armrests and seat are sleek and contoured.

CB rationale (condensed):
  - `x B` While the sentence explains who Sam Maloof was and mentions a chair, it doesn t describe'the chair.
  - `x C` While the sentence explains who Sam Maloof was, it doesn t describe'the rocking chair.
  - `x D` While the sentence describes the rocking chair, it doesn't explain who Sam Maloof was.

**`39ccb463` — Rhetorical Synthesis — Hard**

> While researching a topic, a student has taken the following notes: The Atlantic Monthly magazine was first published in 1857. The magazine focused on politics, art, and literature. In 2019, historian Cathryn Halverson published the book Faraway Women and the "Atlantic Monthly." Its subject is female authors whose autobiographies appeared in the magazine in the early 1900s. One of the authors discussed is Juanita Harrison. The student wants to introduce Cathryn Halverson's book to an audience already familiar with the Atlantic Monthly. Which choice most effectively uses relevant information from the notes to accomplish this goal?

- **A. Cathryn Halverson's Faraway Women and the "Atlantic Monthly" discusses female authors whose autobiographies appeared in the magazine in the early 1900s.**  **[KEY]**
- B. A magazine called the Atlantic Monthly, referred to in Cathryn Halverson's book title, was first published in 1857.
- C. Faraway Women and the "Atlantic Monthly" features contributors to the Atlantic Monthly, first published in 1857 as a magazine focusing on politics, art, and literature.
- D. An author discussed by Cathryn Halverson is Juanita Harrison, whose autobiography appeared in the Atlantic Monthly in the early 1900s.

CB rationale (condensed):
  - `x B` The sentence introduces the Atlantic Monthly and mentions that it's referred to in Cathryn Halverson's book title; it doesn't effectively introduce Halverson's book.
  - `x C` The sentence assumes that the audience is unfamiliar with the Atlantic Monthly, providing background information about the magazine; it doesn't effectively introduce Halverson's book to an audience already familiar with the Atlantic Monthly.
  - `x D` While the sentence assumes that the audience is familiar with the Atlantic Monthly, it doesn't effectively introduce Cathryn Halverson's book.

**`b0620764` — Rhetorical Synthesis — Hard**

> While researching a topic, a student has taken the following notes: Phobetor, a name drawn from Greek mythology, is an exoplanet that orbits the star PSR B1257+12, also known as Lich. Phobetor's mass is 0.01 times that of Jupiter, or 0.01 Jupiter masses. Mastika, which means "gem" or "jewel" in Malay, is an exoplanet that orbits the star HD 179949, also known as Gumala. Mastika's mass is 0.92 Jupiter masses. The student wants to make and support a generalization about exoplanets. Which choice most effectively uses relevant information from the notes to accomplish this goal?

- A. Exoplanets that are named Phobetor orbit Lich, and those that are named Mastika orbit Gumala.
- B. Even though Phobetor and Mastika are both exoplanets, their masses are different: Phobetor's mass is 0.01 Jupiter masses, and Mastika's is 0.92 Jupiter masses.
- C. Many stars have both a designation and a proper name; for instance, PSR B1257+12 is also known as Lich, and HD 179949 is also known as Gumala.
- **D. Exoplanet names have diverse origins, a fact that can be seen in the cases of Phobetor, a name drawn from Greek mythology, and Mastika, which means "gem" or "jewel" in Malay.**  **[KEY]**

CB rationale (condensed):
  - `x A` The sentence misrepresents information from the notes, implying that there are multiple exoplanets with the same names. Additionally, the sentence provides no support for its generalization.
  - `x B` The sentence contrasts the masses of two specific exoplanets; it doesn't make and support a generalization about exoplanets.
  - `x C` The sentence makes and supports a generalization about stars, not exoplanets.

**`6351062d` — Rhetorical Synthesis — Medium**

> While researching a topic, a student has taken the following notes: In the late 1890s, over 14,000 unique varieties of apples were grown in the US. The rise of industrial agriculture in the mid-1900s narrowed the range of commercially grown crops. Thousands of apple varieties considered less suitable for commercial growth were lost. Today, only 15 apple varieties dominate the market, making up 90% of apples purchased in the US. The Lost Apple Project, based in Washington State, attempts to find and grow lost apple varieties. The student wants to emphasize the decline in unique apple varieties in the US and specify why this decline occurred. Which choice most effectively uses relevant information from the notes to accomplish these goals?

- A. The Lost Apple Project is dedicated to finding some of the apple varieties lost following a shift in agricultural practices in the mid-1900s.
- B. While over 14,000 apple varieties were grown in the US in the late 1890s, only 15 unique varieties make up most of the apples sold today.
- **C. Since the rise of industrial agriculture, US farmers have mainly grown the same few unique apple varieties, resulting in the loss of thousands of varieties less suitable for commercial growth.**  **[KEY]**
- D. As industrial agriculture rose to prominence in the mid-1900s, the number of crops selected for cultivation decreased dramatically.

CB rationale (condensed):
  - `x A` The sentence introduces the Lost Apple Project; it doesn't emphasize the decline in unique apple varieties in the US and specify why this decline occurred.
  - `x B` While the sentence emphasizes the decline in unique apple varieties in the US, it doesn't explain why this decline occurred.
  - `x D` The sentence emphasizes the general decline of crop varieties in the mid-1900s; it doesn't emphasize the specific decline in unique apple varieties in the US.

**`3fa48bf3` — Rhetorical Synthesis — Hard**

> While researching a topic, a student has taken the following notes: British scholar Robert Plot described fossilized dinosaur bones in his 1676 book The Natural History of Oxfordshire. Plot earned a reputation for being the first person to have discovered dinosaur remains. In 1990, archaeologists in Lesotho, in southern Africa, discovered a fossilized phalanx of a Massospondylus carinatus dinosaur in a cave once inhabited by humans. Indigenous Khoesan and Basotho peoples had inhabited the cave beginning around 1100 CE. According to paleontologist Julien Benoit, these peoples may have found the phalanx and brought it to the cave centuries before Plot's descriptions. The student wants to emphasize the significance of the 1990 discovery to Plot's reputation. Which choice most effectively uses relevant information from the notes to accomplish this goal?

- A. Benoit challenged Plot's reputation for being the first person to have discovered M. carinatus remains.
- **B. Evidence that Khoesan and Basotho peoples may have found an M. carinatus phalanx as long ago as 1100 CE suggests that Plot may not have been the first person to have discovered dinosaur remains.**  **[KEY]**
- C. According to Benoit's analysis of the 1990 discovery, Indigenous peoples in southern Africa may have brought the fossilized phalanx to the cave as long ago as 1100 CE.
- D. In 1990, more than three centuries after Plot claimed in his book that he had found fossilized dinosaur bones, archaeologists uncovered evidence in southern Africa that disproved his claims.

CB rationale (condensed):
  - `x A` While the sentence does emphasize that Benoit challenged Plot's reputation, it misrepresents information in the notes; Plot was reputed to be the first person to discover dinosaur remains in general, not the first person to discover M. carinatus rema
  - `x C` The sentence only partially explains the significance of the 1990 discovery, noting that it suggests Indigenous people brought dinosaur remains to the cave in 1100 CE; it doesn't explain the discovery's significance to Plot's reputation.
  - `x D` While the sentence does emphasize that the discovery challenged Plot's reputation, it misrepresents information in the notes. The notes don't indicate that the 1990 discovery cast any doubt on Plot's claims to have found fossilized dinosaur bones; ra

---

## 8. LENGTH CUES — quantified

Computed over the 742 of 743 in-scope items whose four options parsed cleanly. Two measures:

- **`key = longest` / `key = shortest`**: restricted to items where the longest (and shortest) option is
  unique, so ties do not inflate either figure. Chance = 25%.
- **Mean length rank of the key** (1 = shortest, 4 = longest). Chance = 2.50.

### 8.1 Character-count results

| Skill | N | N (no ties) | key = longest | key = shortest | mean rank | mean chars key / distractor |
|---|---:|---:|---:|---:|---:|---|
| Words in Context | 166 | 94 | 21.3% | 34.0% | 2.13 | 9 / 10 |
| Text Structure and Purpose | 96 | 85 | 24.7% | 34.1% | 2.32 | 102 / 104 |
| Central Ideas and Details | 78 | 67 | 22.4% | 28.4% | 2.42 | 104 / 104 |
| Inferences | 74 | 68 | 22.1% | 27.9% | 2.38 | 110 / 112 |
| Command of Evidence | 148 | 126 | 23.0% | 16.7% | 2.48 | 137 / 133 |
| Cross-Text Connections | 38 | 36 | 30.6% | 33.3% | 2.39 | 129 / 131 |
| Rhetorical Synthesis | 142 | 131 | 36.6% | 16.0% | 2.82 | 133 / 119 |
| **All Reading (7 skills)** | 742 | 607 | 26.2% | 25.2% | 2.43 | 97 / 94 |
| *All R&W incl. grammar (context)* | 1199 | 873 | 22.9% | 28.8% | 2.24 | 65 / 64 |

### 8.2 Reading — CB avoids the length cue

**Across all Reading items the key is longest 26.2% of the time and shortest 25.2% of the time; mean
rank 2.43 against a chance value of 2.50.** Mean key length (96.5 chars) is *slightly shorter* than mean
distractor length (93.7 → essentially identical). There is no exploitable length heuristic in Words in
Context (keys are marginally *shorter*: longest 21.3%, shortest 34.0%), Text Structure and Purpose,
Central Ideas, Inferences, or Command of Evidence. **CB is clearly controlling for this.**

### 8.3 The one exception: Rhetorical Synthesis

| Rhetorical Synthesis | key = longest |
|---|---:|
| Easy (n=25) | 34.8% |
| Medium (n=85) | 36.5% |
| Hard (n=32) | 36.7% |
| **All RS (n=142)** | **36.6%** (shortest only 16.0%; mean rank **2.82**) |

Rhetorical Synthesis keys are longest **36.6%** of the time versus **16.0%** shortest — a 2.3:1 ratio, and
mean rank 2.82 versus chance 2.50. Mean key length 133 chars versus 119 for distractors. The effect is
stable across all three difficulty bands (32–37%), so it is structural, not an artifact.

**Why, and what to do about it.** The RS key must carry every element the goal names. When the goal is
compound (`aim and methodology`, `emphasize X and specify why`, `make **and support** a generalization`,
`define the term and provide an example`) the key is necessarily a two-clause sentence while at least one
distractor is a one-clause sentence covering half the goal. Length is a *by-product of the item type*.

Mitigation for an item writer who wants to kill the residual cue: for compound goals, write at least one
distractor that is also two-clause — pairing the correct first conjunct with a *wrong* second conjunct
(R7 build), or pairing two wrong conjuncts. `6351062d` and `3fa48bf3` above do exactly this and are both
Hard.

---

## 9. Cross-skill rules and item-writer checklist

### 9.1 Universal constraints observed in 100% of the corpus

1. **Four options, one demonstrably best.** Never `NOT/EXCEPT`, never `all of the above`, never a
   Roman-numeral compound.
2. **Options are syntactically parallel within an item.** Same opening word class, same tense, same
   number of clauses, same number of rhetorical moves. See §2 (`To`+infinitive vs `It`+verb), §1
   (all-one-word vs all-two-word), §6 (`By [V-ing]… but [V-ing]…` ×4).
3. **Every distractor is glossable and defensible as English.** CB defines 54% of its Words-in-Context
   distractors inside the rationale. No nonsense options anywhere in the 2,226 in-scope wrong-answer rationales.
4. **Every distractor is refutable by pointing at the text.** CB's rejection always cites the stimulus or
   its silence. If you cannot write `The text doesn't X` or `The text actually says Y, not Z`, the
   distractor is not falsifiable and does not belong.
5. **No length cue in Reading proper** (§8). No hedging cue: keys hedge only 3–12 points more than
   distractors, and in Command of Evidence they hedge *less*.
6. **The stimulus is short and self-contained.** WIC ≈ 51 words; Central Ideas / Text Structure ≈ 60–90;
   Inferences ≈ 95; Cross-Text ≈ 68 + 66. No outside knowledge is ever required.

### 9.2 The distractor-type frequency table (all in-scope skills)

Measured on CB's own wrong-answer rationales, non-exclusive coding:

| Skill | Distractors | No textual support | Topical but unsupported | Reversal | Attribution swap |
|---|---:|---:|---:|---:|---:|
| Words in Context | 497 | 29% | 18% | 11% | 2% |
| Text Structure and Purpose | 288 | 38% | 23% | 7% | 5% |
| Central Ideas and Details | 234 | 32% | 24% | 11% | 2% |
| Inferences | 222 | 36% | 14% | 8% | 2% |
| Command of Evidence | 442 | 2% | 13% | 8% | 2% |
| Cross-Text Connections | 114 | 32% | 8% | 7% | 1% |
| Rhetorical Synthesis | 429 | 0% | 1% | 2% | 2% |

Read the gradient: the **evidence-relation skills** (Command of Evidence 12.9% topical-unsupported and
almost no `no textual support`, Rhetorical Synthesis ~0% on every column) are barely served by these
categories at all — because their distractors are *accurate*. The **comprehension skills** (Text
Structure, Central Ideas, Inferences) are dominated by `no textual support` + `topical but unsupported`.
That is the single most important design distinction in the whole Reading section:

```
COMPREHENSION SKILLS  (WIC, TSP, CID, Inferences, Cross-Text)
     → distractors are FALSE or UNSUPPORTED about the text.
EVIDENCE/EXPRESSION SKILLS  (Command of Evidence, Rhetorical Synthesis)
     → distractors are TRUE about the text and FAIL THE STATED FUNCTION.
```

### 9.3 Ship-it checklist for a new Reading item

- [ ] Stem is copied verbatim from the frozen inventory in §1–§7. No paraphrasing of CB stems.
- [ ] All four options are syntactically parallel and grammatically substitutable.
- [ ] Every option is a meaningful, glossable English proposition; none is nonsense or a joke.
- [ ] I can write CB's key rationale: *"Choice X is the best answer because… The text states '[quote]'…
      Therefore it most logically follows that…"* — quoting the stimulus at least once.
- [ ] I can write CB's rejection for each of the other three, each citing the stimulus or its silence,
      and each using a *different* one of the mechanisms in the relevant section's table.
- [ ] For comprehension items: for each distractor I have identified the exact clause of the stimulus
      that defeats it (and, for Hard Inference items, an explicit exclusion clause that kills the most
      attractive distractor).
- [ ] For evidence/expression items: all four options are factually accurate; only goal-fit separates them.
- [ ] Key is not the longest option (unless the goal is compound — then at least one distractor is also
      two-clause).
- [ ] Key does not hedge more than the distractors.
- [ ] No outside knowledge required; stimulus is within the word budget for its skill.
