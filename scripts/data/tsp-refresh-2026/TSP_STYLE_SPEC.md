# Text Structure and Purpose — Authoring Spec (measured from 149 official College Board items)

Source: `questionbank-export-2026-8-5 (12).pdf` — 155 PDF pages resolving to **149 official SAT
Question Bank items**, domain = Craft and Structure, skill = Text Structure and Purpose, each
with its official rationale. Every number below is measured from that export, including the
underlined spans, which were recovered from the PDF's underline rectangles rather than guessed.

Companion to `scripts/data/wic-refresh-2026/WIC_STYLE_SPEC.md`. Where the two disagree, the
disagreement is real: TSP and WIC manufacture difficulty in opposite places.

---

## 0. The three subtypes

| | Function of underlined portion | Main purpose | Overall structure |
|---|---|---|---|
| Share of bank | **66 / 149 (44%)** | **54 / 149 (36%)** | **29 / 149 (20%)** |
| Canonical stem | *Which choice best describes the function of the underlined portion in the text as a whole?* | *Which choice best states the main purpose of the text?* | *Which choice best describes the overall structure of the text?* |
| Option subject | **It + present-tense verb** (89%) | **To + infinitive** (83%) | **It + verb** (76%) |
| Option length (words) | 12.3 / 14.2 / 18.3 (E/M/H) | 11.3 / 13.7 / 16.6 | 16.7 / 20.3 / **30.0** |
| Difficulty spread | E 23 · M 20 · H 23 | E 20 · M 21 · H 13 | E 8 · M 15 · H 6 |

Three facts imitators get wrong:

1. **The function subtype is the largest, not the smallest.** Nearly half the bank. Third-party
   books under-write it because it requires typesetting an underline.
2. **The three subtypes do not mix option syntax.** A purpose item's options all begin *To…*; a
   function item's options all begin *It…*. Never mix within an item. (CB does write a handful of
   *To…* function items and *It…* purpose items — 11% and 17% respectively — but the whole set is
   always internally consistent.)
3. **Structure options are twice as long as purpose options and they get longer fastest.**
   16.7 → 30.0 words from easy to hard. This is the single loudest difficulty signal in the skill.

---

## 1. The essence — what is actually being measured

Words in Context asks *what does this word mean here.* Text Structure and Purpose asks a
categorically different question:

> **What job is this doing?** Not *what does it say* — what **work** does it perform for the text
> that contains it.

The measurement is: *can the student climb one level of abstraction — from content to
rhetorical role — without sliding back down into content?* Every distractor in the bank is
built to catch a student who slid back down.

Three load-bearing consequences:

- **The right answer is a description of a move, not a summary.** "It emphasizes Shakti's sense
  of belonging in the landscape" is a move. "It describes trees with branches like arms" is a
  summary. CB never keys a summary. Imitators key summaries constantly.
- **The correct option is almost always the *vaguest*-sounding one.** It has to be, because it
  is one level up. The distractors sound more specific and more informative — that is the trap.
  If your key is the most detailed-sounding option, the item is broken.
- **The underlined portion must have a job that the rest of the text assigns it.** The stem says
  *"in the text as a whole"* for a reason. An underline whose function you can determine by
  reading only the underlined sentence is a broken item. **Delete the surrounding text and the
  item must become unanswerable.**

### The one-sentence test for every authored item

State the key as a sentence beginning "The author put this here in order to…". If the sentence
you produce mentions the topic's content nouns, rewrite it. It should mention only rhetorical
objects: *a claim, an objection, a limitation, an example, a concession, a shift, an
implication, a hypothesis, a counterexample, a stake, a scope.*

---

## 2. Measured numbers

### Passage length (words)

| Subtype | Difficulty | mean | median | p10 | p90 | **author to** |
|---|---|---|---|---|---|---|
| Function | Easy | 80.6 | 81 | 62 | 102 | **65–95** |
| Function | Medium | 87.5 | 88 | 80 | 98 | **75–100** |
| Function | Hard | 100.3 | 93 | 80 | 129 | **80–120** |
| Purpose | Easy | 90.5 | 93 | 72 | 111 | **72–105** |
| Purpose | Medium | 97.0 | 91 | 74 | 132 | **75–115** |
| Purpose | Hard | 89.0 | 86 | 77 | 102 | **77–105** |
| Structure | Easy | 85.1 | 86 | 72 | 106 | **70–100** |
| Structure | Medium | 91.5 | 91 | 63 | 129 | **70–110** |
| Structure | Hard | 92.7 | 92 | 84 | 102 | **82–105** |

**Passage length is essentially flat across difficulty.** Purpose passages are *shorter* at hard
than at medium. Compare WIC, where the same is true. CB does not make TSP harder by writing more
text. It makes it harder by writing **longer, more finely differentiated options**. Author the
passage to ~90 words and put the difficulty in the answer set.

Sentences per passage: function 4.6 mean / 4 median · purpose 5.2 / 4.5 · structure 4.1 / 4.
**Three to five sentences is the whole distribution.** Two-sentence passages exist (5 of 149) and
are always dense expository single-paragraph items.

### Options

| Subtype | Difficulty | mean words/option | ceiling seen |
|---|---|---|---|
| Function | E / M / H | 12.3 / 14.2 / 18.3 | 36 |
| Purpose | E / M / H | 11.3 / 13.7 / 16.6 | 29 |
| Structure | E / M / H | 16.7 / 20.3 / 30.0 | 44 |

All four options in an item must be **within ~35% of one another in length**. A conspicuously
long or short option is a tell, and CB never leaves one.

**Structure "beats"** — the count of sequenced verbs in a structure option (*it X, then Y, and
then Z*):

| Difficulty | mean beats | distribution |
|---|---|---|
| Easy | 1.38 | two beats or one |
| Medium | 1.85 | mostly two, some three |
| **Hard** | **2.67** | **three beats in 20 of 24 options** |

This is the cleanest difficulty dial in the entire skill. **Easy structure = two beats. Hard
structure = three beats, and all four options must have the same number of beats.** A student
must then match three moves in sequence, and each wrong option gets exactly one of the three
beats wrong — which is how CB builds a four-option structure set that has no shortcut.

### Answer key

Official spread across 149: A 42 · C 36 · D 36 · B 35. **Author to exactly 25/25/25/25 per 100.**
Never three of the same letter consecutively in emitted file order.

### Passage genre

| Genre | count | share | **author to (per 100)** |
|---|---|---|---|
| Expository / informational prose | 98 | 66% | **66** |
| Literature (novel, short story, play) | 34 | 23% | **23** |
| Poetry | 13 | 9% | **8** |
| Historical speech / essay / letter excerpt | 4 | 3% | **3** |

51 of 149 items (34%) open with the attribution line **"The following text is from …"**. That
line is mandatory for every literary, poetic, and historical excerpt, and is followed by a
one-sentence orienting gloss when the excerpt needs one: *"Shakti is walking near a riverbank
that she visited frequently during her childhood."* Never use it for expository prose.

Literature and poetry items keep the option subject **It** in most sets, but switch to **The
speaker** for poetry structure items (12 options observed) and **The text** for a minority of
expository structure items (16 observed). Pick one subject per item and hold it across all four.

### Passage furniture

- 64 of 149 (43%) mention a researcher, scholar, or expert; when named, always **first + last
  name**, globally diverse, usually with *"and colleagues"* or *"et al."*.
- 80 of 149 (54%) contain a year or date range.
- 92 of 149 (62%) contain a number, quantity, or percentage.
- 31 of 149 (21%) contain a direct quotation in quotation marks.
- **Only 19 of 149 (13%) contain a colon** — sharply lower than WIC's 26–34%. TSP passages
  advance by sentence-to-sentence rhetorical moves, not by intra-sentence hinges.
- Present tense for scholarly claims and for all option verbs; past tense for studies, historical
  events, and narrative.

---

## 3. The move grammar — the eight rhetorical jobs CB assigns

Every function item, and every beat of every structure item, is one of these. Choose the move
**before** writing the passage.

1. **Frame the problem / establish the puzzle.** Opens the text; names what is unexplained.
2. **Introduce a claim, consensus, or common view.** Frequently exists only to be complicated.
3. **Complicate or qualify the claim.** The *but* sentence. Highest-frequency underline target.
4. **Supply the evidence for a claim already made.** Concrete detail whose job is support.
5. **Illustrate through a specific instance.** A named case, a *for example*, a single organism.
6. **Concede a limitation.** "…but none adequately explain…" — CB loves keying this one.
7. **State the implication or stake.** Usually the last sentence; answers "so what."
8. **Characterize a person, place, or mood** (literature and poetry only). The underline conveys
   an attitude or a state, and the correct option names it abstractly.

For structure items, the option is a **sequence** of these: *frame → investigate → imply* (the
Venus phosphine item), *method → two approaches → relative advantage* (the batik item),
*discovery → importance* (the JWST item). Write the sequence first, in three words, then prose
it out.

---

## 4. Distractor families — every wrong option must be exactly one of these

1. **Right content, wrong job.** Accurately restates something the passage says, but names the
   wrong rhetorical role for it. *The most common CB distractor and the hardest to write.* The
   Betelgeuse item: "It presents the central finding reported by Nance and colleagues" — the
   sentence is about Nance's subject matter, but its job is to name the problem, not report the
   finding.
2. **Scope inflation / deflation.** Correct move, wrong span. Describes the function of one
   clause when the stem asked about the whole text, or describes the whole text when the stem
   asked about one sentence. Watch for options that quietly promote an example to a thesis.
3. **Attribution swap.** Assigns the view, question, or reaction to the wrong party — animators
   vs. audiences, one research team vs. its critics, the narrator vs. the character. In the
   computer-animation item, distractor D moves the underlined question from animators to
   audiences and is wrong for that reason alone.
4. **Polarity flip on the argumentative frame.** The passage says these women *conformed to*
   gender ideals; the distractor says they *resisted* them. The move is named correctly; the
   direction is reversed.
5. **Unlicensed evaluative or emotional load.** Inserts *surprising, unexpected, controversial,
   admiring, urges, criticizes, calls for* where the text is merely descriptive. CB's rationales
   say this explicitly and often: "The text also never categorizes Flewellen's findings as
   'unexpected.'" **Use this family in ≥25% of items.**
6. **A move the text never makes.** Evaluates, recommends, predicts, refutes, or proposes further
   research when the text does none of those. For structure items, this is normally one wrong
   beat inside an otherwise correct three-beat sequence.

Prohibited: a distractor that is merely a weaker paraphrase of the key. If two options name the
same move at different levels of precision, the item is broken. Every rejection in your rationale
must be expressible as *"the text never does X"* or *"X belongs to Y, not Z."*

---

## 5. The difficulty ladder

Difficulty in TSP lives in the **option set**, not the passage. Hold the passage at ~90 words and
move these three dials: option length, number of beats, and the size of the gap between the key
and the nearest distractor.

**Easy (target ~80% correct).**
The text's structure is signposted by explicit connectives — *but, however, for example,
therefore, in contrast*. The underlined portion sits adjacent to its own explanation. Options are
short (11–13 words) and three of them are wrong on content grounds a careful reader catches in
one pass: they name a party the text never mentions, or an event the text never describes. One
distractor is a plain polarity flip. Expository or literary; if literary, the emotional register
is unambiguous (welcoming trees, an old friend).

**Medium (target ~55%). The workhorse — 40% of the set.**
The connective is present but the mapping takes one inference: the reader must notice that a
sentence introducing a study exists in order to set up the *limitation* announced two sentences
later. Options run 13–20 words and exactly **two** of them are live: the key and one competitor
separated by a single feature — usually scope (whole text vs. one clause) or attribution
(researcher vs. field). Structure items at medium carry two or three beats. This is the band
where "right content, wrong job" distractors do the work.

**Hard (target ~30%). Three flavours, roughly equal thirds.**

- **(a) Four-plausible-moves.** All four options name a rhetorical move the text arguably
  performs; only one is the move the *underlined span* performs *for the whole text*. Options run
  18–29 words, each with a qualifying tail that carries the actual discriminator (*"…and then
  explains why that team remains skeptical of the gas's future detection"*). The student who
  reads only the first six words of each option cannot answer.
- **(b) Three-beat structure.** All four options give three sequenced moves. Each wrong option is
  correct on two beats and wrong on one, and the wrong beat is in a different position in each.
  30 words per option. This is the highest-discrimination item CB writes in this skill.
- **(c) The buried referent.** The underlined portion is a subordinate clause, a parenthetical, a
  rhetorical question, or a line of verse whose function only resolves against a *later*
  sentence. The student must hold the span open and read forward — the same lever WIC uses by
  putting the blank in sentence 1.

Additional hard markers measured in the bank: the passage's key sentence is subordinated
(*"Despite potential independent confirmation…"*), the topic requires holding two research
positions apart, and negation stacks (*"none adequately explain," "could not sufficiently
reveal"*).

---

## 6. The underline (function subtype only)

Measured across all 66 function items:

| | measured | **author to** |
|---|---|---|
| Underline length | mean 17.9 words, median 16, range 4–42 | **8–30 words** |
| Full sentence underlined | 33 of 66 (50%) | **~50%** |
| Phrase or clause underlined | 30 of 66 (45%) | **~45%** |
| Rhetorical question or quotation | 3 of 66 (5%) | **~5%** — 2 question items, 1 quotation |
| Position: opening sentence | 12 | **~20%** |
| Position: middle | 23 | **~45%** |
| Position: final sentence | 13 | **~25%** |

Markup: wrap the span in `[UNDERLINED]…[/UNDERLINED]`. `apps/web/src/utils/textProcessing.js`
converts this to `<u>`, and `Question.jsx`, `SmartQuiz.jsx`, and `DetailedQuizResults.jsx` all
render it.

Rules:

- The underline must be a **contiguous** span that begins and ends at a clean syntactic boundary.
  Never underline across a sentence boundary except in the "three underlined portions" variant.
- **Never underline the thesis.** If the underline states the text's main point, the function
  item collapses into a purpose item. Underline the sentence that *serves* the thesis.
- The rationale must be able to say what the text does **before** and **after** the underline.
  If either side is empty, move the underline.
- One item in the set uses the rare multi-span stem (*"Taken together, the three underlined
  portions…"*) with three separate spans.

---

## 7. Rationale voice (mirror the official register exactly)

Measured length: **200 words (easy) / 225 (medium) / 272 (hard)**, plain prose, no lists.

> Choice **{L}** is the best answer because it most accurately describes the function of the
> underlined {portion/sentence} in the text as a whole. The text begins by {move 1}. The
> underlined portion then {move 2}, {quoting the span}. The remainder of the text {move 3}.
> Therefore, the function of the underlined portion is to {restate the key}.
> Choice {L2} is incorrect because {mechanism}. Choice {L3} is incorrect. {Mechanism.}
> Choice {L4} is incorrect because {mechanism}.

Non-negotiable features observed in all 149 official rationales:

- Opens literally with `Choice {Letter} is the best answer` — 118 of 149 continue with
  `because it`, 31 with a period and then `The text…`. Use `because it` by default.
- **Walks the text's moves in order** before naming the function. This is the TSP fingerprint,
  and it is the part imitators skip.
- Quotes the passage at least once, in quotation marks.
- Rebuttals split roughly evenly between `Choice X is incorrect because …` (241 observed) and
  `Choice X is incorrect. …` (206 observed). Vary them.
- **`Although the text …` appears 60 times.** This is CB's signature concessive rebuttal: grant
  that the distractor touches something real, then name why it is not the function. Use it for
  the "right content, wrong job" family.
- Some form of *never / doesn't / isn't* appears 330 times — a mechanism per rejection, always.
  Never write "is less precise," "is too broad," or "does not fit as well."

For purpose items, substitute *"…most accurately states the main purpose of the text, which is
to {key}."* For structure items, *"…most accurately describes the overall structure of the text.
The text begins by {beat 1}. It then {beat 2}. Finally, it {beat 3}."*

---

## 8. Composition targets for the 100-item refresh

| | Easy | Medium | Hard | total |
|---|---|---|---|---|
| Function of underlined portion | 13 | 16 | 15 | **44** |
| Main purpose | 11 | 15 | 10 | **36** |
| Overall structure | 6 | 9 | 5 | **20** |
| **total** | **30** | **40** | **30** | **100** |

- **Answer key:** 25 A / 25 B / 25 C / 25 D.
- **Genre:** expository 66 · literature 23 · poetry 8 · historical excerpt 3.
- **Topic lanes** (expository 66): natural science 26 · social science 16 · humanities & arts 14 ·
  history & civics 10.
- **Stems**, mirroring official frequency:
  - Function: *…function of the underlined portion in the text as a whole?* ×14 ·
    *…function of the underlined sentence in the text as a whole?* ×13 ·
    *…states the function of the underlined portion in the text as a whole?* ×2 ·
    *…function of the underlined sentence?* ×2 · *…underlined question…* ×2 ·
    *…underlined phrase…* ×2 · *…function of the underlined sentence in the overall structure…* ×2 ·
    plus one each of the seven singleton variants including the three-span stem.
  - Purpose: *Which choice best states the main purpose of the text?* ×32 ·
    *…describes the main purpose…* ×2 · *…describes the overall purpose…* ×2.
  - Structure: *Which choice best describes the overall structure of the text?* ×19 ·
    *Which choice best describes the text's overall structure?* ×1.
- ≥25 items must carry an **unlicensed evaluative load** distractor.
- ≥30 items must carry a **right content, wrong job** distractor.
- All 5 hard structure items must be **three-beat, four-parallel-options**.
- ≥60% of hard function items must use the buried-referent structure (subordinate clause,
  parenthetical, question, or verse line resolving against a later sentence).
- Named researchers in ~43 items, globally diverse, all invented, first + last name.

## 9. Hard prohibitions

- No topic, person, artwork, organism, place, study, or phrasing reused from the official bank
  export (`official_proper_nouns.json` holds the 700 proper-noun strings to check against), the
  official Practice Tests, or this repo's Practice Tests 3–5.
- No real living people; no real named studies; no real journal titles. Invented researchers and
  invented works only. Invented literary excerpts must not imitate a specific real author closely
  enough to be mistaken for a quotation.
- No item solvable without reading the passage. No item with two defensible answers.
- No item whose key is a content summary rather than a rhetorical move.
- No "NOT" or "EXCEPT" stems, no all/none of the above, no lettered prefixes inside option
  strings, no options mixing *To…* and *It…* within one set.
- Underlined span must never be the passage's thesis, and must never be resolvable in isolation.
