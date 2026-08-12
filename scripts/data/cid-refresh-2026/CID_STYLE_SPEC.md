# Central Ideas and Details — Authoring Spec (2026 refresh)

**Derived from measurement, not impression.** Every number below was computed from the 138
official College Board *Information and Ideas → Central Ideas and Details* items in
`questionbank-export-2026-8-5.pdf` (41 Easy / 52 Medium / 45 Hard). Where this spec gives a
range, the range is the observed distribution. Do not "improve" on it.

---

## 0. The one-paragraph thesis

A Central Ideas and Details item is **not** a reading-comprehension question in the ordinary
sense. It is a test of **whether a student can hold the boundary of what a text actually
claims.** The passage is engineered so that three of the four choices are *statements a
reasonable, well-informed person would find entirely plausible* — and which the text simply
never makes. The skill under measurement is the discipline to reject a true-sounding statement
because the evidence for it is absent, not because the statement is wrong.

This is precisely where commercial imitations fail. Barron's, Princeton Review, and most
AI-generated banks write distractors that are **false about the world** or **obviously
inconsistent with the passage**. College Board writes distractors that are **unobjectionable
prose about the right topic that the passage is silent on.** In the 138 official rationales,
the phrase *"the text doesn't discuss / doesn't mention / never says"* appears **144 times** —
it is the single dominant rebuttal, by a factor of eight over "contradicts the text" (17).

> **If your distractor can be refuted by pointing at a sentence in the passage, it is a weak
> distractor. The strong distractor is refuted by pointing at the *absence* of a sentence.**

---

## 1. Measured shape

### 1.1 Stimulus length (words, excluding the question stem)

| Difficulty | mean | median | observed range | sentences (median) |
|---|---|---|---|---|
| Easy | 88 | 84 | 48–152 | 4 |
| Medium | 88 | 86 | 49–141 | 4 |
| Hard | 98 | 91 | 71–159 | 4 |

**Critical finding: passage length is nearly flat across difficulty.** Hard items are only ~11%
longer than Easy. Difficulty is *not* manufactured by adding text. Anyone who makes hard
questions by writing longer passages has misread the exam. Target **75–100 words for the
overwhelming majority of items**, at every difficulty, and reserve 120–160 words for literary
excerpts only.

### 1.2 Answer-choice length (words per choice)

| Difficulty | all stems | MAIN_IDEA stems | DETAIL stems |
|---|---|---|---|
| Easy | mean 12.9, median 13 | mean 16.1 | mean 9.9 |
| Medium | mean 17.1, median 16 | mean 19.5 | mean 13.8 |
| Hard | mean 23.7, median 22 (max 45) | mean 26.2 | mean 19.5 |

**This is where difficulty actually lives.** Choices grow ~85% from Easy to Hard while
passages grow 11%. Hard items are hard because each choice is a *compound proposition* —
a claim plus a qualifier plus a relationship — and only one of the three components is wrong.

### 1.3 Stem-type distribution (reproduce these proportions)

| Stem type | Easy | Medium | Hard |
|---|---|---|---|
| `MAIN_IDEA` — "Which choice best states the main idea of the text?" | 39% | 50% | 40% |
| `DETAIL` — "According to the text, …?" | 44% | 19% | 2% |
| `BASED_ON` — "Based on the text, …?" | 12% | 12% | 7% |
| `SUGGEST` — "What does the text most strongly suggest/imply about …?" | 0% | 4% | 13% |
| `BEST_DESCRIBES` — "Which choice best describes …?" | 2% | 4% | 11% |
| `AGREE_WITH` — "Based on the text, X would most likely agree with which statement …?" | 0% | 0% | 7% |
| `SUPPORTED_BY` — "Which statement about X is best supported by the text?" | 0% | 2% | 4% |
| `WHICH_QUESTION` — "Which question does the text most directly attempt to answer?" | 0% | 2% | 2% |
| `INDICATE` — "What does the text indicate about …?" | 0% | 2% | 2% |

**The Easy→Hard gradient is a stem gradient.** `According to the text` collapses from 44% to
2%; `most strongly suggests` and `would most likely agree` appear *only* in Medium/Hard. Easy
items ask what the text *says*. Hard items ask what the text *commits you to* without saying.

### 1.4 Exact stem wording — use verbatim

Do not paraphrase these. College Board's stems are near-invariant, and the invariance is itself
part of the format:

- `Which choice best states the main idea of the text?` — by far the most common (60 of 138)
- `Which choice best states the main topic of the text?` — for descriptive/expository texts with no argument
- `Which choice best states the main purpose of the text?`
- `According to the text, what is one reason …?` / `… what is true about [character]?` / `… why does [X] …?`
- `Based on the text, how did [character] most likely feel when …?`
- `Based on the text, what would [researcher] most likely say is …?`
- `What does the text most strongly suggest about …?` / `What does the text most strongly imply about …?`
- `Which choice best describes what is happening in the text?` (literary)
- `Which statement about [X] is best supported by information in the text?`
- `Which question would be most useful to answer in determining the validity of the researchers' claim …?`
- `Information in the text best supports which statement about [X]?`

### 1.5 Genre mix (measured)

| Genre | Easy | Medium | Hard |
|---|---|---|---|
| Science / natural science | 20% | 33% | 44% |
| Literature (prose fiction, drama, poetry) | 32% | 19% | 24% |
| Humanities (art, music, film, architecture, literary criticism) | 39% | 27% | 20% |
| Social science / history / archaeology | 10% | 21% | 11% |

Science dominates Hard; humanities and literature dominate Easy. 35 of 138 items (25%) open
with the literary attribution header.

---

## 2. Passage architecture

### 2.1 The research-report skeleton (science / social science — ~60% of the bank)

Four moves, in this order, ~4 sentences:

1. **Ambient fact.** A phenomenon or context stated flatly. *"Microplastics are tiny pieces of plastic waste."*
2. **Puzzle or correlation.** Something unexplained, often two things co-occurring.
3. **Method.** Named researcher(s) + what they did. `[Name] and colleagues` or `[Name] et al.` — used in ~70% of science items.
4. **Finding, usually behind a pivot.** `However,` / `Instead,` / `But` / `Rather,` — **the last sentence carries the main idea.**

> **Load-bearing rule:** in a research-report stimulus the correct MAIN_IDEA answer paraphrases
> the FINAL sentence, constrained by the research question in sentence 2–3. Sentences 1–2 exist
> to be harvested by distractors. This is the machine.

### 2.2 The literary skeleton (~25%)

```
The following text is adapted from [Author]'s [Year] novel [Title]. [One or two sentences of
neutral situational context: who is who, where they are.]

[Excerpt, 60–130 words, in period register.]
```

Header variants observed: `is adapted from` (loose modernization), `is from` (verbatim), and for
verse `The following text is [Author]'s circa [Year] poem "[Title]."` — poems get a gloss line
defining archaic nouns (*"Spars are ships' masts, moorings are ropes that hold docked ships in place."*).

The context gloss is **strictly factual and affect-free**. It never tells you how anyone feels —
that is the question.

### 2.3 The humanities skeleton (~25%)

Subject introduced → a characteristic practice or a critical claim → an evaluative turn or
scholarly consensus. Frequently: *"Some critics argue X. But [artist]'s work suggests Y."*

### 2.4 Register rules

- Present tense for scholarship (*"researchers argue"*), past for events and findings.
- Technical terms are **glossed inline in parentheses** when introduced: *"negative disconfirmation (which occurs when experiences fall short of one's expectations)"*, *"radial (non-sticky threads extending from the center)"*. Glossing is mandatory — the item must never require outside knowledge.
- Direct quotation of a short phrase from a source appears in ~20% of items and is a favorite anchor for the correct answer.
- **No rhetorical questions. No second person. No exclamation. No authorial editorializing.**
- Names are internationally distributed and unglamorous. Invent them; never attribute fabricated research to a real person.

---

## 3. The trap taxonomy

Every distractor must be assignable to exactly one of these. Tag it in the `trapTypes` field.
Frequencies are from the 138 official rationales.

### T1 — `out-of-scope` (dominant; ~50% of all distractors)
A reasonable claim, on-topic, using the passage's vocabulary, about which the passage says
nothing. Rebuttal: *"the text doesn't discuss …"*
> *Ex.* Passage explains what surfactants do to waves. Distractor: *"They are helpful for removing microplastics from the ocean."* Sounds like something a chemistry-literate reader might believe. Text is silent.

**Construction recipe:** take a question a curious reader would ask *after* finishing the
passage, and answer it. That answer is a perfect T1.

### T2 — `reversal` (~15%)
States the opposite of the finding, usually by negating the pivot sentence. Nearly every
MAIN_IDEA item has exactly one.
> *Ex.* Study finds users overcame disappointment. Distractor: *"most users … will not achieve a feeling of satisfaction."*

### T3 — `detail-as-main-idea` (~12%; MAIN_IDEA items only — the highest-quality trap)
**Entirely true and explicitly stated**, but it is a supporting detail, a method note, or the
setup rather than the central claim. Refutable only by relative weight, never by fact. Reserve
for Medium and Hard.

### T4 — `overreach` (~8%)
Text hedges — *proposed, could, suggests, may* — and the distractor hardens it to *confirmed,
proved, established, was the first to*. Also covers scope inflation: one moon → *"several of Saturn's moons."*

### T5 — `unsupported-comparison` (~5%)
The passage characterizes one thing; the distractor ranks it against something never introduced.
> *Ex.* *"It is more expensive at scale than are processes for … other perovskite architectures."* — other architectures are never discussed.

### T6 — `word-lift` (~5%)
Recycles a distinctive phrase from the passage but reattaches it to the wrong agent, object, or
direction. Punishes keyword-matching. Especially effective in DETAIL items.

### T7 — `wrong-relation` (Hard)
All the right components, wrong wiring: cause and effect swapped; the study's separate question
recast as its explanation; view attributed to the wrong party.
> *Ex.* Researchers asked whether silk properties *also* diversified. Distractor says web variation *is explained by* silk variation — a causal claim the study never made.

### Distractor set composition by difficulty

| | typical mix |
|---|---|
| **Easy** | 3 × T1, or 2 × T1 + 1 × T2. Distractors are cleanly out of scope; a careful reader eliminates them in one pass. |
| **Medium** | 1 × T2 (or T4) + 1 × T3 + 1 × T1. At least one distractor must be *literally true*. |
| **Hard** | 1 × T7 + 1 × T5 (or T4) + 1 × T3. **Zero distractors may be dismissable at a glance.** Each must survive the first read and fail only on a specific qualifier. |

---

## 4. Anti-heuristic calibration — non-negotiable

Measured on the official set. A student must not be able to beat these items with test-taking
tricks. Verify your batch against these:

| Signal | Official value | Requirement |
|---|---|---|
| Correct answer is the **longest** choice | **27%** (chance = 25%) | 20–33%. Length must carry *no* information. |
| Correct answer contains hedging (*may, might, could, likely, suggest, some, often*) | 29% | Wrong answers must also hedge (official: 18%). Never let "hedged = correct" hold. |
| Correct answer contains an absolute (*all, never, always, only, first, every, cannot*) | 7% | Wrong: 11%. Only a **mild** tilt — do not make "absolute = wrong" reliable. |
| Correct-answer letter | A 28% / B 26% / C 18% / D 28% | Target uniform 25% each. |

**The most common failure mode in imitation banks is that the correct answer is the longest,
most hedged, most "academic-sounding" choice.** If a student who never reads the passage can
score above 25% on your batch, the batch is broken.

---

## 5. Difficulty — what actually moves it

Difficulty is **not** vocabulary, and **not** passage length. It is the *distance between the
text and the answer*, plus the *resolution needed to reject distractors*.

**EASY** — the answer is a paraphrase of one clause you can point to. Stem is usually `According
to the text` or a plain `main idea`. Distractors are off-topic enough to eliminate confidently.
Subject matter is concrete: a person, an organization, an animal, a technique. One idea per
sentence. *Difficulty comes from careful reading, not inference.*

**MEDIUM** — the answer requires **combining the research question with the result**, or
**resolving a pivot** (*however / instead*). One distractor is true-but-partial (T3); one
reverses the finding (T2). The student who reads only the first half of the passage picks wrong.
Subject matter permits one abstract construct, always glossed. *Difficulty comes from synthesis.*

**HARD** — the answer is **never stated in any form**; it is an implication the passage licenses.
Stems shift to `most strongly suggests`, `would most likely agree`, `best describes`. Choices
become compound — claim + qualifier + relation — and the discriminator is a single qualifier
(*more rapidly than*, *rather than*, *as a separate question*). Often two nested relationships
(a study about whether one process resembles another; a character's opinion about a third
party's opinion). *Difficulty comes from holding the exact scope of a claim.*

**The Hard-item test:** if a strong student can eliminate three choices in under ten seconds,
you have written a Medium item with harder words.

---

## 6. Rationale format

Mirror College Board's own voice — it is terse, evidentiary, and never lectures.

**Correct choice** (2–5 sentences):
> `Choice [X] is the best answer because it [accurately states the main idea of the text /
> presents a statement about [Y] that is supported by the text]. The text [traces the evidence,
> quoting the load-bearing clause]. Thus, …`

**Each wrong choice** (1–3 sentences), opening with the trap, not with a restatement:
> `Choice [Y] is incorrect because the text doesn't discuss …` (T1)
> `Choice [Y] is incorrect because it contradicts the text. …` (T2)
> `Choice [Y] is incorrect because although the text does state …, this is a supporting detail rather than the main idea.` (T3)
> `Choice [Y] is incorrect because it overstates the text's claim. The text says … "could" …` (T4)
> `Choice [Y] is incorrect because the text doesn't compare … to …` (T5)

Rationales quote the passage with straight double quotes around lifted phrases. They never say
"tricky," "trap," "students often," or address the reader.

Maps to `explanationStructured`:
- `rule` → one sentence naming the skill being applied
- `steps` → the evidentiary trace for the correct answer
- `choiceRebuttals` → `{A|B|C|D}` for the three wrong choices
- `thingsToRemember` → 1–2 transferable heuristics

---

## 7. Originality constraints

- **No passage may reuse any subject, study, researcher, artwork, or literary work appearing in
  the official export or in any existing item in the bank.** Every stimulus is newly written.
- Science and social-science passages describe **invented studies with invented investigators.**
  Never attribute a fabricated finding to a real, identifiable researcher.
- Literary passages are **original prose written in period register, attributed to an invented
  author and title.** Real public-domain excerpts are not reproduced, and no fabricated text is
  ever attributed to a real author.
- Content described must nonetheless be **scientifically and historically coherent** — a student
  should learn nothing false.
- No two items in the batch may share a topic. Each item declares a `topic` tag for dedupe.

---

## 8. Authoring record (per item)

```jsonc
{
  "id": "CID-E01",
  "difficulty": "easy",              // easy | medium | hard
  "stemType": "MAIN_IDEA",           // §1.3
  "genre": "science",                // science | literature | humanities | social-science
  "topic": "kelp-forest-urchin-recovery",   // unique across batch
  "passage": "…",                    // §1.1 word budget
  "text": "Which choice best states the main idea of the text?",   // §1.4 verbatim
  "options": ["…", "…", "…", "…"],   // §1.2 word budget
  "key": 2,                          // 0-based index of correct choice
  "hinge": "final sentence — the 'Instead' clause",
  "evidence": "\"…\"",               // the load-bearing quote
  "trapTypes": { "A": "out-of-scope", "B": "reversal", "D": "detail-as-main-idea" },
  "rule": "…",
  "steps": ["…", "…"],
  "rebuttals": { "A": "…", "B": "…", "D": "…" },
  "remember": ["…"]
}
```

`buildCidDocs.js` converts this to the production Firestore shape
(`correctAnswer` as a **numeric index**, `usageContext: "general"`, both `subcategory` and
`subCategory` set to `central-ideas-details`, `subcategoryId: 1`).
