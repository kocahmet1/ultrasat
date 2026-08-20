# Practice Test 9 — Reading & Writing Build Brief
## Distilled from 1,200 official College Board Question Bank items + 6 official RW modules

This brief is **self-contained**. Do not re-analyze the corpus. Build strictly to these numbers.

---

## 0. NON-NEGOTIABLE OUTPUT SCHEMA

Each item is a JSON object with EXACTLY these keys, in this order:

```json
{
  "originalQuestionNumber": 1,
  "passage": "…the stimulus…",
  "text": "…the question stem…",
  "questionType": "multiple-choice",
  "options": ["A text", "B text", "C text", "D text"],
  "correctAnswer": 2,
  "acceptedAnswers": null,
  "difficulty": "medium",
  "subcategory": "words-in-context",
  "subcategoryId": 4,
  "explanation": "Choice C (…) is correct. …"
}
```

**subcategory → subcategoryId map (exact, do not guess):**

| subcategory | subcategoryId | domain |
|---|---|---|
| `words-in-context` | 4 | Craft and Structure |
| `text-structure-purpose` | 5 | Craft and Structure |
| `cross-text-connections` | 6 | Craft and Structure |
| `central-ideas-details` | 1 | Information and Ideas |
| `command-of-evidence` | **3** | Information and Ideas |
| `inferences` | **2** | Information and Ideas |
| `boundaries` | 9 | Standard English Conventions |
| `form-structure-sense` | 10 | Standard English Conventions |
| `transitions` | **8** | Expression of Ideas |
| `rhetorical-synthesis` | **7** | Expression of Ideas |

*(These are the repo's canonical IDs. Note that `command-of-evidence`/`inferences` and `transitions`/`rhetorical-synthesis` are the reverse of what you might guess — an earlier version of this table had them swapped and misfiled 21 items.)*

*(If your assigned items use a subcategory not listed, stop and report.)*

### Hard schema rules enforced by an automated validator
- `options` = exactly 4 strings, no `A)` / `B.` prefixes, no HTML inside options, no duplicates.
- `correctAnswer` = integer 0–3. `acceptedAnswers` = `null` always. `questionType` = `"multiple-choice"` always.
- `explanation` **must begin with the literal string** `Choice X ` where X is the keyed letter (A/B/C/D). E.g. if `correctAnswer` is 2, the explanation starts `Choice C `.
- The blank is **exactly six underscores**: `______`. Use six, never five, never seven.

  | item type | blanks required in `passage` |
  |---|---|
  | `words-in-context`, `inferences`, `boundaries`, `form-structure-sense`, `transitions` | **exactly 1** |
  | `command-of-evidence` whose stem contains `uses data from the table` or `uses data from the graph` | **exactly 1** (trailing, at the very end of the prose) |
  | `command-of-evidence` whose stem starts `Which quotation from` | 0 or 1 (choose one; 0 is simpler) |
  | `command-of-evidence` whose stem is `Which finding, if true, …` | **exactly 0** |
  | `text-structure-purpose`, `cross-text-connections`, `central-ideas-details`, `rhetorical-synthesis` | **exactly 0** |
- `cross-text-connections` passage must literally contain `Text 1` and `Text 2`.
- `rhetorical-synthesis` passage must contain **at least 5** `•` bullet characters.
- Underline markers `[UNDERLINED]…[/UNDERLINED]` are allowed **only** on (a) a `text-structure-purpose` item whose stem contains "function of the underlined", or (b) a `cross-text-connections` item whose stem references an "underlined claim/portion/assertion". Exactly one open + one close marker, non-empty span. **Never anywhere else.**
- Stimulus prose word count: **hard ceiling 150 words** (HTML tables/SVG excluded from the count). Per-skill floors in §1.

---

## 1. PER-SKILL STIMULUS WORD-COUNT TARGETS

Prose word count, excluding any `<table>`/`<svg>`. **Floor is a hard validator error; aim for the target band.**

| subcategory | validator floor | TARGET BAND | official median |
|---|---|---|---|
| `words-in-context` | 50 | **52–62** | 55 |
| `text-structure-purpose` | 75 | **85–95** | 90 |
| `cross-text-connections` | 100 | **130–145** (65–70 per text, balanced) | 135 |
| `central-ideas-details` | 70 | **85–100** | 88 |
| `command-of-evidence` | 65 | **70–105** (quantitative 70–90; textual 90–105) | 98 |
| `inferences` | 65 | **85–100** | 92 |
| `boundaries` | 35 | **38–52** | 45 |
| `form-structure-sense` | 35 | **38–52** | 43 |
| `transitions` | 45 | **50–62** | 56 |
| `rhetorical-synthesis` | 70 | **80–100** (note block only) | 90 |

---

## 2. THE VERBATIM STEM INVENTORY — copy these exactly

| skill | stem (verbatim) |
|---|---|
| words-in-context (blank) | `Which choice completes the text with the most logical and precise word or phrase?` |
| words-in-context (underlined word) | `As used in the text, what does the word "___" most nearly mean?` |
| text-structure-purpose (purpose) | `Which choice best states the main purpose of the text?` |
| text-structure-purpose (function) | `Which choice best describes the function of the underlined portion in the text as a whole?` |
| text-structure-purpose (structure) | `Which choice best describes the overall structure of the text?` |
| cross-text-connections | `Based on the texts, how would <AGENT> most likely respond to <TARGET> in Text 1?` |
| central-ideas-details (main idea) | `Which choice best states the main idea of the text?` |
| central-ideas-details (detail) | `According to the text, <wh-question>?` |
| command-of-evidence (finding) | `Which finding, if true, would most directly support <OWNER>'s <hypothesis\|claim\|conclusion>?` — `, if true,` is **obligatory** |
| command-of-evidence (quotation) | `Which quotation from <SOURCE> most effectively illustrates the claim?` |
| command-of-evidence (table) | `Which choice most effectively uses data from the table to <complete the statement\|support …>?` |
| command-of-evidence (graph) | `Which choice most effectively uses data from the graph to <complete the statement\|support …>?` |
| inferences | `Which choice most logically completes the text?` — **100% invariant, zero variants** |
| boundaries **and** form-structure-sense | `Which choice completes the text so that it conforms to the conventions of Standard English?` — **300/300 items, zero variants** |
| transitions | `Which choice completes the text with the most logical transition?` |
| rhetorical-synthesis | `Which choice most effectively uses relevant information from the notes to accomplish this goal?` |

---

## 3. STANDARD ENGLISH CONVENTIONS (boundaries + form-structure-sense)

### Measured rule frequency (n=300 official items)

**Boundaries (n=150):** supplementary element / paired punctuation **27%** · sentence boundary (period, semicolon, comma splice, run-on, fragment) **21%** · comma+FANBOYS joining main clauses **13%** · colon **11%** · series **6%** · no-punctuation subject|verb **5%** · no-punctuation prep|complement **5%** · no-punctuation verb|object **3%** · titles/names **3%** · relative clause **3%** · subordinate|main **2%**.

**Form/Structure/Sense (n=150):** subject–verb agreement **27%** · finite vs. non-finite verb form **27%** · tense/aspect **16%** · dangling modifier **11%** · pronoun–antecedent **9%** · possessive determiner **5%** · plural vs. possessive noun **4%** · determiners **1%**.

**NEVER WRITE THESE — 0 occurrences in 300 official items:** parallel structure, comparative forms, who/whom or pronoun case. Never call the rule "apostrophe" — say "possessive noun" / "possessive determiner".

**Never stack two rules in one item.** Only 7/300 do, and those are *not* the hard ones.

### The 4-option architecture
- **Boundaries: 61% of items have identical words in all four options — only the punctuation differs.**
- **Form/Structure/Sense: 0% do this — FSS always changes a word.**
- Canonical Boundaries option shapes: `{no punct, comma, colon, semicolon}` · `{no punct, comma, colon, dash}` · `{comma, period, no punct, semicolon}` · FANBOYS quartet `X, but / X but / X, / X` · two-token `X. The / X: the / X; the / X, the`.
- When the key is "no punctuation," **always offer the comma** (40/40 official items do) plus two of `{; : . —}`.

### Difficulty thresholds (measured)

| | Easy | Medium | Hard |
|---|---|---|---|
| stimulus words | 30–45 | 40–55 | 45–60 |
| blank-sentence words | ≤25 | 25–35 | 35–50 |
| commas in stimulus | ≤2 | 2–3 | ≥3 |
| subject→verb gap (SVA items) | ≤2 words | 3–12 | **≥13** (max 28) |
| distinct punctuation marks across options | 2 | 4 | 3–4 |

### Anatomy
Blank sits **in the final sentence 92% of the time**, at ~58% (Boundaries) / ~68% (FSS) through the text, with **13–18 words after it**. 1 sentence 42% / 2 sentences 49%. 77% contain a proper name.

### Traps to build
- **Illusion of a pause:** the key is "no punctuation" in **27%** of Boundaries items. A plausible breath point is not a punctuation point.
- **Mismatched supplementary boundary:** put a dash (or comma, or paren) at the *opening* of the supplementary element upstream, then make three options close it with the wrong mark. Dismiss with: *"a semicolon can't be paired with a dash in this way."*
- **SVA attractor:** in **46%** of SVA items the noun *adjacent to the blank* has the **opposite number** from the true subject. At Hard, stack 2–3 attractors (prepositional phrase + relative clause + parenthetical).
- **Finite/non-finite:** every such option set offers an `-ing` participle; typical set = 1 participle + 2–3 finite forms, often plus a `to`-infinitive or `having/being`.
- **Dangling modifier** distractors are nominalizations of the true subject, existential `there was`, or passives — several are grammatical in isolation.

### Rationale formula (110–170 words, median 134)
```
Choice X is correct. The convention being tested is <RULE NAME>. <Positive explanation, quoting spans in double quotes.>
Choice A is incorrect because <predicate>.
Choice B is incorrect because <predicate>.
Choice D is incorrect because <predicate>.
```
Dismiss in **A→B→C→D order**, skipping the key. Reusable predicates: *results in a comma splice* · *results in a run-on sentence; the two main clauses are fused without punctuation and/or a conjunction* · *results in a rhetorically unacceptable sentence fragment* · *no punctuation is needed between the X and the Y* · *doesn't agree in number with the singular subject "___"* · *the context requires the X "___," not the Y "___."*

---

## 4. TRANSITIONS

**Blank at the head of the FINAL sentence (84%), preceded by a period (83%), followed by a lowercase continuation. Every option ends with a comma. All four options share capitalization.**

- Distractor build: **one polar reversal** (77% of official items have one), **one additive/elaborative** (85% have one), one from a third family. **Four distinct relations in 89.8% of items.**
- Stimulus: 2–3 sentences, 50–60 words, about a named person / dated event / measured finding.
- **Verify: no `unlike`/`whereas` in the stimulus, at most one `but`, and the answer must survive deleting every explicit connective from the stimulus.** The logical relation must be recoverable from *content*, not surface cues.
- At Hard, choose a key *outside* the most common list.

**Test 9 keyed transitions — PRE-ASSIGNED, do not deviate (each is unique across the whole form):**

| item | key (verbatim, with comma) | relation |
|---|---|---|
| M1 Q22 (medium) | `Thus,` | cause-result |
| M1 Q23 (medium) | `Nevertheless,` | contrast-concession |
| M1 Q24 (hard) | `In sum,` | synthesis |
| M2 Q23 (medium) | `Similarly,` | similarity |
| M2 Q24 (medium) | `Furthermore,` | addition |
| M2 Q25 (hard) | `That is,` | restatement |


Distractors may be drawn from any other transition, but **no distractor may be another item's key**, and **no transition may appear as a key twice**.

---

## 5. RHETORICAL SYNTHESIS

- Passage opens with the invariant lead-in `While researching a topic, a student has taken the following notes:` then **5 bullets** (69% of official items), each a **complete sentence ending in a period**, 65–75 total note words at Medium, 80–100 at Hard.
- Bullet order: orientation → narrowing → **the two-to-four facts the key must fuse (put them at positions 3–5)**.
- Then a goal sentence `The student wants to <goal>.` (13–14 words), then the invariant stem.
- **Key:** ONE sentence, 19–24 words, fusing **2 bullets (Medium)** or **3–4 bullets (Hard)**.
- **Distractors:** three single sentences, 15–23 words, **all factually true to the notes**, each drawing on *different* bullets, each failing the goal a different way (wrong facet of the study / wrong bullet pair / context instead of content). Fact-distortion in at most 1 item in 4.
- Rationale repeats the goal clause verbatim in all four segments.

---

## 6. COMMAND OF EVIDENCE

### 6a. Textual — "which finding, if true" (Family A, 60% of official CoE-textual, skews Hard)
The passage is a **4-move machine** (~4 sentences, ~98 words):
1. Establish the background regularity.
2. Introduce the anomaly / observation (often with a named researcher).
3. State the hypothesis — **one named causal variable, one named outcome**.
4. Describe the method / the contrast that will produce data — **and STOP before reporting any result.**

The key is the **one option matching BOTH the predicted direction AND the predicted variable.** Distractor failures: right variable / wrong direction · right direction / wrong variable · irrelevant variable · restates the hypothesis without supplying evidence · supports a rival hypothesis.
`, if true,` is obligatory. Support:weaken ≈ 8:1.

### 6b. Textual — "which quotation" (Family B)
Frame the source as either a **named fictional literary work written for this test** or an **anonymous expert** (`a work by a historian`, `a scholarly article`, `an art critic`). **Never name a real living scholar or real institution in anonymous mode.** Options are quoted excerpts in double quotes.

### 6c. Quantitative (table / bar / line)

**Structure:** the graphic HTML comes FIRST in the `passage` string, then a blank line, then the prose.

**Table format (copy this shape exactly):**
```html
<table><caption>Title Case Caption Naming the Variables and Units</caption><tr><th>Category</th><th>Variable 1 (unit)</th><th>Variable 2 (unit)</th></tr><tr><td>Row A</td><td>88</td><td>61</td></tr>…</table>
```
4 data rows, 2–3 columns. Caption is a descriptive noun phrase, Title Case, no "Figure 1".

**SVG format — MUST have, or the validator fails it:** `viewBox`, `role="img"`, `data-graph-type="bar"` or `data-graph-type="line"`, a non-empty `<title>`, and a non-empty `<desc>` that describes axes, ticks, units, and series in prose for screen readers. Use `<text>` elements for tick labels, axis titles, and (for bars) printed data values above each bar.

**Prose:** 70–90 words that introduce a study, name the researcher(s), and state what was measured, then hand off to the options with a trailing blank. **A quantitative item MUST end its prose with `______`** (six underscores) and MUST use a stem containing `uses data from the table` or `uses data from the graph`.

Working hand-off patterns (copy the shape):
- `…They report that the results are broadly consistent with that expectation: for example, after 12 months, ______`
- `…Ferreira concluded that the coating slows the loss. Her data support this claim: ______`
- `…The measurements bear this out: ______`

All four options then continue that sentence in **lowercase**, ending in a period.

**Numeric design:** choose values so that each specific misreading produces a specific distractor — reading the wrong series, reversing an inequality, misstating a trend, citing a true data point that doesn't support the claim, inventing a value, or comparing the wrong two points. Keys should require comparing **two** values roughly as often as reading one.

---

## 7. INFERENCES

- Stem is **100% invariant**: `Which choice most logically completes the text?`
- The blank is in the **final sentence**, introduced by a lead-in such as `Therefore, the researchers concluded that ______`, `This suggests that ______`, `…, suggesting that ______`, `…, reasoning that if X, then ______`.
- **It is a deductive completion, not a creative leap.** The reader must be able to derive the key by syllogism from stated premises.
- Logical shapes: a contrast set up earlier constrains the conclusion (60%) · a study found X and Y so the mechanism must be Z (50%) · conditional/counterfactual (11%) · definitional constraint (9%).
- Distractors are dismissed with *"the text never mentions …, so there's no basis for this inference"* — build each distractor so that exactly that dismissal is true: overreach beyond what's licensed · a claim about a different entity · a reversal · plausible but unstated · something already stated (hence not an inference).

---

## 8. CRAFT AND STRUCTURE

### Words in Context (blank shape)
- 52–62 words. Install **one explicit disambiguation device**: prior-sentence setup (49%) · next-sentence elaboration (29%) · colon gloss (21%) · contrast marker (19%) · causal marker (19%) · `not X but ___` (5%). **The blank's meaning must be recoverable by paraphrase from elsewhere in the stimulus.**
- Key: single word (83%) or `word + preposition` (17%). ~8–10 characters, ~3 syllables, **Tier-2 academic register**. *Do not reach for rare vocabulary — reach for precise vocabulary.*
- Three distractors: same part of speech, same arity, same or slightly *higher* syllable count than the key. One selectional misfit, one topically adjacent, one near-synonym or polar reverse.
- Every option must be glossable in six words.

### Text, Structure, and Purpose
- 85–95 words, 3–5 sentences. Genre mix ≈ 40% science / 28% literature / 19% humanities / 14% history.
- FUNCTION items: underline sentence 1 or 2 of a 4-sentence passage, span 15–25 words; the key names the span's **relation to the rest of the text**, not its content.
- Option frames: `To <infinitive>` for purpose · `It <verb>s` for function and structure · `The speaker <verb>s` for poetry. 12–20 words. **The key is never the longest option.**
- STRUCTURE keys are two- or three-move chains: `It <verb>s X, then <verb>s Y[, and then <verb>s Z].`
- Distractors: invent content the text never raises (40%) · true-but-not-the-function (14%) · describes a different sentence (9%) · too narrow.

### Cross-Text Connections
- Bare `Text 1` / `Text 2` headers, **no attribution lines**. 65–70 words each, 130–145 combined, balanced.
- **Text 1 states a position; Text 2 reacts** (Text 2 is the responder in ~80%).
- Relationship mix: contradiction 24% · qualification 18% · partial agreement 18% · evidence-bearing 16% · methodological critique 13% · complement 11%. **NOT always disagreement.**
- Options ~20 words; 42% take the `By <-ing verb>` frame. **Keys favour hedged/compound acts** (`noting that…`, `agreeing that X but pointing out that Y`); distractors favour bare strong acts.
- Distractors: cite content in neither text (30%) · attribute Text 1's view to Text 2 (21%) · state Text 2's view without making it a *response* (6%) · reverse a polarity (4%).

---

## 9. CENTRAL IDEAS AND DETAILS
- 85–100 words, 4 sentences, one paragraph. **Never a blank.**
- 41% main-idea (use the exact stem, do not paraphrase) / 59% detail (`According to the text, <wh->?`).
- Genre mix: natural science 26% · **literature 22%** · humanities 18% · history 13% · social science 10%.
- Literary attribution formula — this test uses **original** literature, so write: `The following text is from an original short story.` / `The following original poem was written for this practice test.` / `The following text is from an original novel.`
- Distractors: true of one detail but not the main idea (scope error) · overstates/absolutizes (`proves`, `all`, `never`) · reverses a relationship · plausible outside knowledge not stated · conflates two entities in the text.

---

## 10. GLOBAL PROSE FINGERPRINT — the thing most imitators get wrong

**Voice.** Third-person expository. Mean sentence ~26–29 words. Appositive-driven: a technical term is glossed inline by an appositive or an em-dash aside, never by a separate definition sentence. Hedged attributive verbs: *suggests, posits, contends, proposes, argues, reports, notes*. Dates appear as bare years or parenthetical ranges.

**Absolutely avoid:**
- Second person, contractions, rhetorical questions to the reader, humor, exclamation.
- Politics, religion, violence, war, illness, death, anything a 15-year-old shouldn't read cold.
- Any requirement for outside knowledge, arithmetic, or trust in a real-world statistic.
- Editorializing. The text reports what someone claims; it never tells the reader what to think.
- Idioms and phrasal verbs that disadvantage English learners.
- Negative stereotyping of any group.

**Do deliberately include (a strong College Board signature):**
- Named researchers, artists, and scholars with **diverse, non-Anglo names** — Nigerian, Korean, Mexican, Lebanese, Filipino, Tamil, Polish, Brazilian, Ethiopian, Vietnamese, Māori, Kazakh, Quechua, etc. Roughly **half** the named people across your batch.
- Women in science and the arts at roughly parity.
- Indigenous, Black, Latino, and Asian scholars, artists, and communities treated as **subjects of expertise**, not as objects of study.
- Topic weighting across a module: arts/literature ~30% · natural science ~28% · social science ~20% · history/humanities ~18% · technology ~4%.

**Fictional-but-plausible is REQUIRED.** Every person, study, place, artwork, and dataset you invent must be fictional but indistinguishable in register from a real one. **Do not use any real named study, real researcher, real artwork, or any content from an existing SAT question.** Invent freely; keep the science correct in principle.

---

## 11. DO NOT REUSE — everything already used in Tests 3, 4, and 8

**Test 3 topics:** expedition diary · volcanic-glass blades · astronomical glass plates · steam engine · drought/abandoned settlement · story "Mara" hearing · green roofs/pollinators · seagrass restoration · novel "Nadia" school desk · bee electric charge · urban park bees · novelist Irena Vale · smoke-cue germination · cave fish alarm chemical · weather-station prototype · coral growth bands · wetland reconstruction · octopus camouflage texture · mountain-ridge seedlings · whale-tagging records · seventeenth-century cartographer · portable solar cookers · volunteer bird surveys · archival silence · rain garden · eDNA surveys · North Fen rewetting · night orchid scent · Antarctic fish antifreeze · Nari Okafor novel window · library curator manuscript loan · New Caledonian crow tools · clay/pottery poem · medieval poem "The Falcon's…" · spelling vs. pronunciation · oyster reef wave energy · self-healing concrete · menu descriptions/diners · poet Amina Daro maps · spaced vs. massed study · glass beads exchange · pottery clay composition · wetland moisture sensors · Lake Aro floodwaters · portrait underdrawing imaging · nest-egg predation protocol · moths and lamp brightness · perovskite solar cells · mica/quartz banding · serotiny · glass frog transparency · moth survey 2015–2025 · Anchiornis melanosomes · Maria Sibylla Merian.

**Test 4 topics:** icy-moon dust haze · denim panel textiles · whistled speech · climate model validation · school recess furnishings · driftwood tagging story · coastal shell mounds · Rowan Gulch subscription library · clockmaker apprentice novel · canopy cover/litter decay · annealed polymer film · banded reed chat song · novel "The Long Quay" · Marchvale housing list · steelpan making · mobile vaccination unit · theater fly tower · village school 1861 · preserved lemons/brine · walnut ink crust · shaded relief maps · community murals · hearth tax population · ranked ballots · checkout abandonment · jury instructions · critical edition of a manuscript · running-shoe plates · tamarisk poem · sleep spindles · guild account books · permafrost carbon · film-take short story · ice giant ring · street food vendors · Wenlow Canal ledgers · bilingual task switching · nitrate leaching cover crops · firefly synchrony · story "The Back Landing" · dendrochronology ship timbers · leather fire buckets · "doubleback" fiddle dance · alluvial fan · multiblock woodcut · pigment purchase entries · villanelle form · oral-history pauses · waterlogged canoe conservation · loading zones · untranslatable pun · memory T cells · iron meteorite crystal bands · grid-scale batteries.

**Test 8 topics (most recent — avoid these especially):** deep-sea turbidite sand layers · eighteenth-century keyboard ornamentation · shoppers not comparing store prices · medieval sermon headings improvised · bacterial-cellulose leather substitute · short story: autumn departure-date list · Karasu Tepe sheep-tooth enamel · eastern Mediterranean shared bread ovens · novel: woman swimming alone at a municipal pool · mulch, soil moisture and weed cover · warm-up duration and vertical jump · novel *Nine Bridges* / bridge inspector · shorebird bill probing in wet sand · limestone cave stalagmite magnesium · cooperage / oak barrel staves · lichen growth rate on bare rock · Calder Street Market Hall 1868 · excavated clay-lined storage pits · small-scale hydropower Archimedes screw · rotating savings groups · stop-motion miniature ruins · reservoir evaporation shade panels · time-diary vs. survey estimates of hours · Alderbeck Assembly landscape panel attribution · kaolin/clay-coated stored maize · composer's additive rhythm cells · mill electrification and line shafts · high-altitude ice crystal clouds · wood-kiln ash glaze ceramics · radio bulletins compressing findings · composer's shorthand symphony sketches · freshwater turtles overwintering under ice · original poem: learning a house by its stairs · commuter rail extension and earnings · museum visible storage · short story: accordion repairer photographing interiors · recycled-rubber roofing membrane UV loss · cotton content and paper drying time · poetry collection *Zinc Roof* · streambed biofilms and flow speed · Warakuna evidential verb suffixes · paper wasp facial markings · foam liner for shipping mangoes · camera lucida in botanical illustration · river plume boundary at sea · urushi lacquer curing in humidity · marginalia and book provenance · Andean ice-core basal sediment · cable-hauled street railways · mussel shell crack deflection · Vindolyth Roman tile yard · job-seeker bus-pass program evaluation · demountable timber pavilions · twenty-year restored dune monitoring.

**Keyed transitions already used — none may be a Test 9 key, and none may be a Test 9 distractor:** Consequently · Even so · For example · For instance · In other words · Accordingly · By contrast · Therefore · Moreover · Likewise · Indeed · As a result · However · In fact · Specifically · In addition · Instead.

**Keyed words-in-context vocabulary already used:** provisional · untenable · augment · circumscribed · pronounced · inhibit · integral · contingent · cyclical · inherited · depart from · tenable · universal · dwindled · promote · silent on · episodic · embellish · laborious · preparatory · transient · discovers · definitive · sufficient.

**Names already used — do not reuse any given name or any surname:** Villalobos · Nwosu · Tran · Warsame · Zalewski · Cawley · Nallathambi · Ferreiro · Mensah · Zdunek · Iturbe · Nguyen · Eze · Kwon · Hale · Bhatt · Halvorsen · Lund · Aydin · Haddad · Bekele · Handayani · Demirtaş · Morimoto · Choucair · Aguilar · Jang · Whitfield · Asare · Choueiri · Bermúdez · Peixoto · Kohestani · Oyarzún · Raghunathan · Obiora · Kovács · Aquino · Chalhoub · Radcliffe · Baek · Qureshi · Venkataraman · Al-Sayegh · Cho · Solano · Fallon · Kolbusz · Chuquimia · Casipit · Marreiro · Vaher · Ashgrove · Uzodike · Vestri · Sten · Aubertin · Zogheib · Novotny · Baranyi · Halloway · Merrow · Dizon · Ashby · Lindqvist · Mansour · Osei · Quispe · Zofia · Marisol · Priya · Beatriz · Nadia · Delia · Hyun-woo · Kwabena · Ines · Yuki · Emil · Chidi · Ada · Petra · Anjali · Frances · Renata · Rosalba · Nilo · Ondina · Marju · Peter · Ilona · Sylvie · Rania · Giulia · Halvard · Marguerite · Seo-yeon · Hilario · Bridget · Karim · Wei-Lin · Linh · Tomás · Lucía · Nabil · Serpil · Sohrab · Sri · Ingrid · Gordon · Colin · Meera · Ifeoma · Tomasz · Bruna · Renato.

**Also do not reuse these invented proper nouns:** Karasu Tepe · Calder Street · Alderbeck · Vindolyth · Warakuna · Nine Bridges · Zinc Roof · Belmar · Serat Reservoir · Kettleby Mills · Almond Court · Rivergate · Alder Wove · Bramble Laid · Cormorant Rag · Sorrel Rag.
---

## 12. FINAL SELF-CHECK BEFORE YOU RETURN

For every item you wrote:
1. Can a strong reader defend a second option? If yes, rewrite. **Exactly one option must be defensible.**
2. Could someone answer it **without reading the passage** — by option length, by grammar of the stem, by general knowledge? If yes, rewrite. **The key must not be the longest option** (check word count and character count).
3. Is the stem verbatim from §2?
4. Is the blank count right for the skill (§0)?
5. Is the prose word count inside the §1 band?
6. Does the explanation start with `Choice <keyed letter> ` and dismiss the other three in A→B→C→D order, each with a *specific* textual reason?
7. Is every fact in the passage self-contained — no outside knowledge, no arithmetic?
8. Is the topic absent from the §11 do-not-reuse ledger, and different from every other item in your own batch?


---

## 13. LESSONS FROM THE TEST 8 AUDIT — these are the mistakes to avoid

Three independent auditors reviewed Test 8. Every defect below was real. Do not repeat them.

1. **The key must sometimes be the longest option.** Test 8's first draft had the key as the longest option **0 times in 54** — a detectable exploit ("cross off the longest choice"). Across a module, the key should be the longest option roughly **1 item in 4**. Do not systematically pad distractors.
2. **Never invent a name that belongs to a real person.** Test 8's draft named a real Lancaster researcher, a real Imperial College professor, and a sitting UK MP. **Web-search every full name you invent** before using it; if a real researcher, artist, politician, or public figure comes back, discard it.
3. **Never reproduce a real published finding under an invented attribution.** Test 8's draft restated the real paper-wasp face-recognition result. Invent the finding, not just the researcher.
4. **Do not twin module 1 and module 2 at the same question number.** Test 8's draft had M1Q4/M2Q4 running the identical template, M1Q13/M2Q13 running the identical 4-move machine with the same key letter and the same polar-reversal distractor, M1Q7/M2Q7 both methodological critiques with a `By <hedged compound act>` key, and M1Q12/M2Q12 both using "X almost never lets Y…". **Your item must not share its template with the same-numbered item in the other module.**
5. **Do not let one option's *shape* select it.** Test 8 had items where the key was the only finite verb, the only option with a number, the only two-part option, and the only one beginning "Both." Before you finish, cover the passage and ask whether option shape alone picks the key.
6. **Vary the conventions block's structure.** Test 8's draft had all 15 conventions items at exactly two sentences with the blank 13–16 words from the end. Spread yours across **1, 2, and 3 sentences**, and across **11–21 words after the blank**.
7. **Vary the openers.** Test 8's draft opened 17 of 54 stimuli with `[Occupational title] [Full Name] [verb]s…`, six of them with `studies`. Cap this at about a third of your batch; lead the rest with the phenomenon, the observation, or a date.
8. **Use the em dash.** It is a College Board signature and Test 8's draft used it twice in 54 stimuli while colons carried 20. Put an em-dash appositive gloss in at least two of your stimuli.
9. **Vary the cross-text relationship.** Test 8's draft made both cross-text items methodological critiques. The measured mix is contradiction 24% / qualification 18% / partial agreement 18% / evidence-bearing 16% / methodological critique 13% / complement 11%. The two items on this form must use **different** relationships.
10. **Vary the literary situations.** All four of Test 8's literary stimuli told the same story — a young person inheriting a careful practice from an older relative or mentor. Write four unrelated human situations.
11. **Every dismissal must be true and specific, and must not also dismiss the key.** Test 8 had a rationale rejecting a distractor for citing one time point when the key also cited one time point.
12. **Distinguish "contradicted by the text" from "the text is silent."** These are different dismissals and College Board uses them precisely. Do not write "contradicted" when the passage merely fails to mention something.
13. **Check every mechanism against reality.** Test 8's draft claimed river riffles *produce* dissolved oxygen (they entrain it) and that basal ice-core sediment marks the surface of a vanished glacier (it marks the ground surface between advances). Invented studies still have to be scientifically coherent.
14. **Name provenance should be balanced, not engineered.** Test 8 landed at 86% non-Anglo names with the Anglo names clustered in the skeptic/administrative roles. Aim for **roughly half** non-Anglo, women at parity, and spread both across winning and challenged positions.
15. **Do not repeat a given name or a surname anywhere on the form**, and do not reuse one from Tests 3, 4, or 8 (§11).
