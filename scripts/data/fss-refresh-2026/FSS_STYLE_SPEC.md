# Form, Structure, and Sense — Authoring Spec

Measured from `questionbank-export-2026-8-5 (17).pdf`: **206 official College Board SAT
Question Bank items**, domain = Standard English Conventions, skill = Form, Structure, and
Sense, with official rationales. Corpus split: 98 Easy / 47 Medium / 61 Hard.
Every number below is measured, not estimated. Raw parse: `fss_corpus.json`.

---

## 0. The one stem

**206 / 206 items use the identical prompt, verbatim:**

> Which choice completes the text so that it conforms to the conventions of Standard English?

There is no second subtype, no variant wording, no "which choice best…". Any item in our bank
that phrases this differently is not a Form, Structure, and Sense item. This is the cheapest
tell of a third-party imitation and we get it right for free.

Every item has exactly one `______` blank (six underscores) and exactly four options.

---

## 1. The essence — what is actually being measured

FSS is **not** a grammar-rules quiz. It is a **structural parsing test wearing a grammar
costume.** The four options are almost always four inflections of the *same* lexeme. The
student is not being asked *"which form is correct English?"* — in isolation, all four are
correct English. They are being asked:

> **"What is the sentence's skeleton, and what slot does the blank occupy in it?"**

Every item reduces to one question of structure:

| Convention | The structural question the student must answer |
|---|---|
| Subject-verb agreement | *Which noun is the head of the subject?* (not: which noun is nearest) |
| Verb form (finite/nonfinite) | *Does this clause already have a main verb, or does it still need one?* |
| Verb tense | *What time does the rest of the passage fix?* (not: what tense sounds fluent) |
| Subject-modifier placement | *What does the opening modifier describe?* (not: what is the topic) |
| Plural vs. possessive nouns | *Does this noun own something, or is it just more than one?* |
| Pronoun-antecedent | *Which noun does this pronoun stand in for?* (not: which noun is closest) |

**The distractors are never ungrammatical strings.** They are grammatical forms placed in the
wrong structural slot. This is the single most-missed property in imitations: Barron's and
Princeton Review write distractors that are *wrong English* (`"the datas is"`), so a student
with an ear can eliminate them without parsing. College Board writes distractors that are
*right English in the wrong structure*, so the ear is actively a liability. **An item whose
wrong answers can be eliminated by reading aloud is a broken item.**

Corollary, and it is load-bearing: **the trap is always designed to reward the student's ear
and punish it.** In 69% of hard subject-verb items, the noun immediately before the blank
disagrees in number with the true subject. The fluent-sounding choice is the wrong one, by
construction.

### The three properties every authored item must have

1. **Self-contained determinacy.** No outside knowledge. The correct answer is forced by the
   text alone, and forced *uniquely* — no second choice is defensible under any reading.
2. **One quotable trigger.** The rationale must be able to quote a specific span and say "this
   is the subject" / "this is the antecedent" / "this is what the modifier describes." If you
   cannot quote the span, the item is broken.
3. **Every distractor fails for a stateable structural reason.** "Awkward," "wordy," and
   "less natural" are not reasons. "Plural verb with singular head noun," "supplies a second
   finite verb to a clause that already has one," "makes *pressure* the thing that was
   pleading" — those are reasons. If a distractor's only flaw is style, replace it.

---

## 2. Measured distributions

### 2.1 Convention mix

| Convention | Easy | Med | Hard | Total | % of bank |
|---|---:|---:|---:|---:|---:|
| Verb form (finite/nonfinite) | 27 | 6 | 19 | 52 | 25.2% |
| Subject-verb agreement | 18 | 14 | 16 | 48 | 23.3% |
| Verb tense/aspect | 28 | 5 | 0 | 33 | 16.0% |
| Subject-modifier placement | 1 | 8 | 16 | 25 | 12.1% |
| Plural vs. possessive nouns | 9 | 8 | 6 | 23 | 11.2% |
| Pronoun-antecedent agreement | 9 | 3 | 2 | 14 | 6.8% |
| Determiners | 2 | 0 | 0 | 2 | 1.0% |
| Unlabeled / mixed | 4 | 3 | 1 | 8 | 3.9% |

**Two conventions are difficulty-locked, and this is the most important structural fact in
the table:**

- **Verb tense is an easy-band convention.** 28 easy, 5 medium, **0 hard** out of 61 hard
  items. Tense is decided by an explicit date or an adverbial the student can point to; there
  is no way to make that subtle without making it ambiguous, and College Board does not try.
  **Never author a hard tense item.** At most one, and only if the tense is fixed by a
  *relationship* between two clauses rather than by a date.
- **Subject-modifier placement is a hard-band convention.** 1 easy, 8 medium, 16 hard.
  It carries 26% of the hard band and 1% of the easy band. **Never author an easy modifier
  item.**

Verb form is bimodal (27 easy / 19 hard, only 6 medium) — the easy version and the hard
version are genuinely different tasks (§4.2).

### 2.2 Target mix for our 100-item set (30 easy / 40 medium / 30 hard)

Derived by applying each band's measured within-band share to our band sizes.

| Convention | Easy (30) | Medium (40) | Hard (30) | **Total** |
|---|---:|---:|---:|---:|
| Subject-verb agreement | 6 | 13 | 8 | **27** |
| Verb form (finite/nonfinite) | 9 | 6 | 9 | **24** |
| Verb tense/aspect | 9 | 5 | 1 | **15** |
| Subject-modifier placement | 0 | 7 | 8 | **15** |
| Plural vs. possessive nouns / determiners | 3 | 7 | 3 | **13** |
| Pronoun-antecedent agreement | 3 | 2 | 1 | **6** |
| **Total** | **30** | **40** | **30** | **100** |

### 2.3 Stimulus length (words, excluding the stem prompt)

| Difficulty | mean | median | p10 | p90 | min | max | **author to** |
|---|---:|---:|---:|---:|---:|---:|---|
| Easy | 41.5 | 42 | 26 | 56 | 16 | 64 | **26–56** |
| Medium | 44.4 | 46 | 27 | 57 | 11 | 64 | **28–58** |
| Hard | 46.1 | 49 | 24 | 63 | 9 | 76 | **26–66** |

**Hard items are only 11% longer than easy ones.** College Board does not manufacture
difficulty with length — it manufactures it with distance between the subject and the blank,
and with the *number of decoy nouns in that distance*. Never exceed 66 words. An item that
needs 80 words to set up its trap has the wrong trap.

Sentence count: 1.93 (easy) / 1.83 (medium) / 1.69 (hard). **Hard items are shorter and have
fewer sentences than easy ones.** Two sentences is the mode in every band. One-sentence items
are 31% / 36% / 41% — they get *more* common as difficulty rises, because the compression is
itself the difficulty.

Blank in the first sentence: 36% easy / 38% medium / 43% hard. Blank in the final sentence:
57% / 51% / 49%. A trailing sentence *after* the blank is common (used to supply the
disambiguating evidence) and appears in roughly a third of items.

### 2.4 Options

| Difficulty | mean words/option | median | share 1-word | share ≥6 words |
|---|---:|---:|---:|---:|
| Easy | 1.8 | 2 | 49% | 2% |
| Medium | 4.1 | 2 | 33% | 24% |
| Hard | 5.1 | 2 | 36% | 25% |

The median never moves off 2 words. The mean rises purely because modifier-placement items
(clause-length options, 8–23 words) enter the medium and hard bands. **Options are bimodal,
not gradually longer:** either all four are 1–3 words (inflection sets) or all four are full
clauses (modifier items). Never mix.

**All four options end in the same word-stem in 53% of items** (61% easy / 45% medium / 48%
hard) — i.e. four inflections of one verb: `occurs / have occurred / occur / are occurring`.
Where they don't, they are four *shapes* of the same material: `Austen's most famous novels, /
Austens' most famous novels', / Austens most famous novels, / Austen's most famous novel's,`.

Hard rules for option sets:
- All four options must be **grammatical English in isolation.** No malformed strings.
- All four must occupy the **same syntactic slot** — same part of speech, same shape.
- Never repeat an option within an item; never let two options be interchangeable in context.
- In inflection sets, vary **both** number and tense across the four so number alone doesn't
  give it away: `was / were / have been / are`, not `was / were / is / are`.

### 2.5 Answer key

Official spread across 206: A 65 · D 61 · C 41 · B 39. Skewed, but not usefully — **author to
exactly 25/25/25/25 per 100**, and never place three of the same letter consecutively in the
emitted file order.

### 2.6 Passage furniture

| Feature | all | Easy | Medium | Hard |
|---|---:|---:|---:|---:|
| Names a professional role (*botanist*, *historian*…) | 40% | 36% | 38% | 49% |
| Contains a year | 33% | 36% | 36% | 28% |
| Contains any digit | 48% | 48% | 60% | 39% |
| Em/en dash | 18% | 12% | 23% | 25% |
| Parenthetical | 17% | 17% | 15% | 16% |
| Quotation marks | 14% | 10% | 11% | 23% |
| Colon | 10% | 6% | 15% | 13% |

People are introduced **by role, with first and last name, globally diverse**: *"Economist
Jingting Fan argues…"*, *"Oglala Lakota poet Layli Long Soldier's…"*, *"researchers Michael
O'Connell and Karen Molloy counter…"*. Topics run across STEM, art, music, history,
archaeology, linguistics, and economics, with a marked preference for non-Western and
underrepresented subjects. No topic is used to make the item hard — the topic is scenery.

---

## 3. The difficulty ladder — what actually moves an item up a band

This is the section that separates a real imitation from a bad one. Difficulty is **not**
vocabulary, **not** length, **not** obscurity of topic. It is *how far the student must travel
to find the structural anchor, and how many decoys sit on the path.*

### The universal lever: subject-to-blank distance and decoy count

| | Easy | Medium | Hard |
|---|---|---|---|
| Anchor position | Adjacent to blank | One phrase away | Two+ phrases away |
| Decoy nouns between anchor and blank | 0 | 1 | 2, and **of opposite number** |
| Interrupting `, … ,` construction before blank | 17% | 43% | **69%** |
| What the ear says | Agrees with the answer | Neutral | **Contradicts the answer** |

Measured on subject-verb items — the `, … ,` interrupter rate of 17 → 43 → 69% is the single
cleanest difficulty signal in the entire corpus.

### Worked ladder — the same convention at three levels

**Easy** (anchor adjacent, ear agrees):
> The vest frottoir ______ a wearable washboard that is played by rubbing spoons or bottle
> openers against it. → `is`

**Medium** (one interrupter, ear neutral):
> Every last second of space shuttle mission STS-79, which lasted ten days and three hours,
> ______ carefully monitored by a team of experts. → `was`
>
> Head noun *second* is singular; *hours* and *experts* pull plural.

**Hard** (two decoys, ear actively wrong):
> Researchers studying the "terra-cotta army," the thousands of life-size statues of warriors
> found interred near the tomb of Emperor Qin Shi Huang of China, were shocked to realize that
> the shape of each statue's ears, like the shape of each person's ears, ______ unique. → `is`
>
> The word immediately before the blank is *ears*. The head is *shape*, eleven words back,
> behind a `like`-phrase that itself ends in *ears*. Reading aloud gives the wrong answer.

Note what did **not** change: topic accessibility, vocabulary, sentence count. Only the
distance and the decoys.

### Band-specific rules

**Easy** — the anchor is in the same clause as the blank with nothing between them, or one
short prepositional phrase. A student who can find the subject gets it right. Tense items
carry an explicit date (*"In 1613, a prop cannon ______"*). No interrupters, no appositives
before the blank, no `like`/`as well as` comparison phrases.

**Medium** — exactly one structure sits between the anchor and the blank: a nonrestrictive
`, which … ,` clause, an appositive, or a prepositional chain whose object is opposite in
number. The student must know to look past it, but there is only one thing to look past.

**Hard** — two or more of these, **and** at least one of these three intensifiers:
1. The noun **immediately** before the blank is opposite in number to the true subject.
2. The blank sits in a subordinate or relative clause whose boundary is easy to mislocate.
3. The correct answer is the **nonfinite** form where the ear expects a finite one, because a
   finite verb appears later in the sentence (see §4.2 — this is CB's signature hard move,
   19 of 61 hard items).

---

## 4. Convention playbooks

### 4.1 Subject-verb agreement (27 items: 6E / 13M / 8H)

Options: four inflections of one verb, varying number **and** tense
(`attests / has attested / is attesting / attest`). Never all-present or all-past.

Decoy structures, in ascending difficulty:
- Prepositional chain: `The dedication of Madden and her fellow activists ______` (44% of easy
  items already use one — a single `of`-phrase is easy, not medium).
- Nonrestrictive interrupter: `Paine, whose pamphlets circulated widely, ______`
- Comparison phrase: `the shape of each statue's ears, like the shape of each person's ears, ______`
- Inverted or fronted structure: `Among the fossils recovered ______ a nearly complete jaw`
- Quantified/collective head: `Every last second of…`, `Each of the seven basins…`,
  `The trefoil knot and the figure-eight knot, each with a crossing number below five, ______`
  (note: compound subject → plural, even though `each` intervenes).

**Never** use a genuinely contested construction — no `none of the`, no collective nouns whose
number varies by dialect (`the committee are`), no `neither…nor` proximity agreement. College
Board tests only agreement that is uncontested in American edited English.

### 4.2 Verb form: finite vs. nonfinite (24 items: 9E / 6M / 9H)

The most common convention in the bank and the one imitations get most wrong.

**The rule being tested:** a main clause requires exactly **one** finite (tensed) verb — no
more, no fewer. Options offer one finite form and two or three nonfinite ones (`-ing`
participle, `to`-infinitive, past participle), or vice versa.

**Easy form** — the clause has *no* verb yet, so the blank must supply a finite one, or the
blank opens a participial phrase before a complete main clause:
> A decade later, Land ______ his technology to invent the world's first instant camera.
> → `used` (vs. *to have used / to use / using*)
>
> ______ by businessman William A.G. Brown, the saloon was known to offer elegant
> accommodations. → `Created` (vs. *Creates / Creating / Create*)

**Hard form — CB's signature move.** The sentence already contains its finite main verb
*later*, so the blank must take a **nonfinite** form. The ear wants the finite one because at
the moment of reading the blank, no verb has appeared yet:
> Aslanian's macroanalysis ______ nearly 1,000 book titles published between 1512 and 1800
> **shows** not only the steady popularity of religious texts but also… → `examining`
>
> This hypothesis ______ that certain trees survived… **cannot stand**, researchers counter.
> → `suggesting`

The student must read to the end of the sentence, find `shows` / `cannot stand`, recognize it
as the main verb, and conclude that the blank cannot be a second one. **At least 6 of our 9
hard verb-form items must use this pattern.** It is the highest-value pattern in the bank and
almost nobody outside College Board writes it.

A related hard variant tests verb form **plus punctuation** — whether the comma after a proper
noun opens a nonrestrictive modifier:
> American abstract artist Richard ______ his installations to make passersby keenly aware…,
> assembles large-scale steel plates… → `Serra, intending`

### 4.3 Verb tense and aspect (15 items: 9E / 5M / 1H)

**Easy** — an explicit date or period fixes the tense, and the options are four tenses of one
verb: `malfunctions / will malfunction / has malfunctioned / malfunctioned` with *"In 1613"*
in the sentence.

**Medium** — no date; the tense is fixed by a *relationship*:
- `since 1945` + present perfect (`has collected`) — ongoing from a past point.
- A literary present: a work of fiction's contents are described in present tense even when
  the work is from 1993 (*"in Tom Stoppard's 1993 play Arcadia, there is a tortoise that
  ______ by two names"* → `goes`, not `went`).
- Sequence-of-past: past perfect for the earlier of two past events, simple past for the
  later.

**Hard: do not author.** Budget is 1, and only for a two-clause sequencing item where neither
clause carries a date.

Never use `will have been` style exotics as the key. The key is always simple past, simple
present, present perfect, or past perfect.

### 4.4 Subject-modifier placement (15 items: 0E / 7M / 8H)

Structure: the sentence opens with a modifying phrase, then `______`. All four options are
full clauses (8–23 words). The correct one places the noun the modifier describes
**immediately** after the comma.

> Far from being modern inventions, ______ more than 5,000 years ago.
> → `drinking straws were used by Sumerians in ancient Mesopotamia`

**The property that makes it a College Board item:** *all four options mention the right noun
somewhere.* They differ only in what sits in subject position. Imitations write distractors
that omit the noun entirely, which makes the item solvable by scanning. Note in the example
above that `Sumerians in ancient Mesopotamia used drinking straws` contains the phrase
*drinking straws* — it just isn't the subject. That is the whole test.

Distractor kit — each must produce a *nameable* absurdity the rationale can state:
- Fronting a different noun from the same sentence (`Sumerians … used drinking straws`).
- Nominalizing (`the use of drinking straws by Sumerians … happened`) — now *the use* is the
  thing that isn't a modern invention.
- Expletive `there` (`there are two problems associated with commercial plastics`) — now
  *there* is cheap and versatile.
- Possessive-fronting (`commercial plastics' two associated problems are that`) — now the
  *problems* are cheap and versatile.

**Hard variants** additionally require the answer to satisfy a *second* constraint set by text
after the blank — a relative clause that must attach to a specific noun, or a colon that must
be preceded by an independent clause:
> Despite being cheap, versatile, and easy to produce, ______ they are made from nonrenewable
> petroleum, and most do not biodegrade in landfills.
> → `commercial plastics have two associated problems:`
>
> The modifier fixes the subject *and* the colon requires an independent clause before it.

The hardest variant makes the opening phrase a **noun phrase requiring an appositive** rather
than a participial phrase:
> Recordings of electrical activity in the brain, ______ increased activity in brain areas…
> → `electrograms show that while responding to hypothetical match scenarios, the most highly
> skilled soccer players have`

### 4.5 Plural vs. possessive nouns and determiners (13 items: 3E / 7M / 3H)

Options are four apostrophe placements over the same one or two nouns:
`grain's physical properties' / grains' physical properties / grains' physical property's /
grains physical properties`.

The test is whether the student can tell *ownership* from *plurality* per noun. Difficulty
scales with the number of nouns under test:
- **Easy** — one noun (`Austen's most famous novels,`), or two where only one is possessive.
- **Medium** — two nouns, one possessive and one plural, in a chain
  (`the author's political writings`, `the screw's threads`).
- **Hard** — a coordinated pair each needing its own apostrophe (`rock's and rap's
  chorus-to-verse ratios`), or possessive-determiner agreement across a long distance
  (`their` vs `its` vs `it's` vs `they're`, keyed to a plural head eight words back).

Include the `its / it's / their / they're` set — it appears as both a determiner item and a
pronoun item and is high-yield. Always ensure the antecedent's number is unambiguous.

### 4.6 Pronoun-antecedent agreement (6 items: 3E / 2M / 1H)

**Easy** — the antecedent is the subject of the immediately preceding sentence, and the
options are `It / They / Those / Some`.

**Hard** — the antecedent is a *singular* noun phrase interrupted by a plural example set,
so the nearest plural noun is a decoy:
> When a given industry — water and electricity are two well-known examples — carries high
> infrastructural start-up costs…, ______ of just one or two suppliers per municipality.
> → `it often consists`

Note the construction: singular head (`a given industry`), a dashed plural aside (`water and
electricity`), then the blank. Reading aloud gives `they often consist`. This exact frame
appears twice in the corpus — it is a College Board template, and we should use it once.

**Never** author an item whose answer depends on singular *they* or on a gendered pronoun
choice. College Board avoids both.

---

## 5. Rationale format

Measured: mean 138 words, median 131, range 63–330. 94% open with `Choice X is the best
answer.`; 87% name the convention within the first 120 characters; **98% explicitly rebut all
three wrong choices by letter.**

Required shape:

> **Choice [K] is the best answer.** The convention being tested is [convention name]. [One
> or two sentences stating the structural fact and **quoting the trigger span** — the subject,
> the antecedent, the main verb, or the modified noun.]
>
> **Choice [W1] is incorrect because** [structural reason, naming the same span]. **Choice
> [W2] is incorrect because** […]. **Choice [W3] is incorrect because** […].

Rules:
- Name the convention using College Board's own vocabulary: *subject-verb agreement*,
  *subject-modifier placement*, *pronoun-antecedent agreement*, *the use of verb forms within
  a sentence*, *the use of verbs to express tense in a sentence*, *the use of plural and
  possessive nouns*, *the use of possessive determiners*.
- Quote the trigger span in quotation marks. Every rationale must contain at least one quoted
  span from the stimulus.
- Rebut each wrong choice on the same structural axis. When two wrong choices fail identically
  (both plural verbs with a singular subject), say so identically — College Board repeats
  itself verbatim rather than manufacturing variety.
- Never say "awkward," "wordy," "unclear," or "less concise."

---

## 6. Originality constraints

- No stimulus may reuse a topic, finding, person, study, or phrasing from the 206 official
  items, from `scripts/output/pt5-build/bank.json`, or from any existing question in our bank.
  The corpus is parsed to `fss_corpus.json` and is checked programmatically by `build.js`
  (5-gram overlap + proper-noun collision).
- Real named people may be used only where the claim about them is accurate and uncontroversial.
  Prefer inventing plausible researchers with globally diverse names for research contexts, as
  College Board does; use real figures only for well-documented historical facts.
- No statistic may be presented as a real research finding unless it is one. Where an item
  needs a number, make the number internal to a fictional-but-plausible study attributed to a
  fictional researcher.

---

## 7. Automated checks (enforced by `build.js`)

Hard failures:
1. Stem prompt matches the single official wording exactly.
2. Exactly one `______`; exactly four options; no duplicate options.
3. Stimulus word count within the band envelope (§2.3), sentence count ≤ 4.
4. Convention counts match the §2.2 grid exactly.
5. Answer key spread is exactly 25/25/25/25; no three consecutive same letters in file order.
6. Rationale contains `is the best answer`, names the convention, quotes ≥1 span, and rebuts
   all three wrong letters by name.
7. No 5-gram shared with any official item; no proper noun shared with an official item.
8. Option sets are shape-consistent (all ≤3 words, or all ≥6 words — never mixed).
9. No banned construction: `none of the`, `neither…nor` as the keyed agreement trigger,
   singular *they* as key, collective-noun agreement as key.

Warnings:
10. Difficulty-lever heuristics — hard subject-verb items should carry an interrupter or a
    number-opposite decoy immediately before the blank; hard verb-form items should have the
    main verb after the blank.
