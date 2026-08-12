# Words in Context — Authoring Spec (measured from 200 official College Board items)

Source: `questionbank-export-2026-8-5 (8).pdf` — 200 official SAT Question Bank items, skill =
Words in Context, with official rationales. Every number below is measured from that export.
This spec supersedes the WIC section of `scripts/output/pt5-build/STYLE_SPEC.md`, which was
derived from a mixed sample and got two things wrong (blank placement, and the existence of a
second subtype).

---

## 0. The two subtypes — and why they are different tests

| | Completion | "Most nearly means" |
|---|---|---|
| Share of bank | **168 / 200 (84%)** | **32 / 200 (16%)** |
| Stem | *Which choice completes the text with the most logical and precise word or phrase?* | *As used in the text, what does the word "___" most nearly mean?* |
| Stimulus | Expository prose, one `______` | Literary/historical excerpt with a **block quotation** |
| Stimulus length | 51 words mean | 77 words mean |
| Options | lowercase, 1–2 words | **Capitalized**, 1 word (or a short phrase) |
| Word tested | may be a **hard** word; the sense is obvious | always an **easy, familiar** word; the **sense** is the difficulty |

**This is the single most-missed distinction in third-party imitations.** Publishers write
"most nearly means" items whose distractors are synonyms of the intended meaning. College Board
does the opposite: **every distractor is a genuine, common sense of the tested word**, and only
one of them fits the context. The measured set proves it —

- *drew* → **Pulled** (key) / Sketched / Drained / Inspired
- *clear* → **Transparent** (key) / Obvious / Understandable / Simple
- *spread* → **Extended** (key) / Coated / Hidden / Discussed
- *contracted* → **Developed** (key) / Restricted / Described / Settled
- *determine* → **Dictate** (key) / Conclude / Evaluate / Select

The trap is always **sense frequency**: the most common sense of the word is offered as a
distractor, and the context forces a less common but perfectly standard sense.

---

## 1. The essence — what is actually being measured

WIC is not a vocabulary test. It is a **reading-of-one-sentence test wearing a vocabulary
costume.** The measurement is: *can the student let the sentence's own logic constrain a word,
rather than letting the topic's vocabulary suggest one?*

The load-bearing structure of nearly every completion item:

> **The blank is an abstract label. The rest of the passage is the concrete evidence that
> forces the label.**

The student must run the inference *concrete → abstract*. Reversing it is what the distractors
punish: they are the abstractions you'd guess from the topic, not the one the evidence licenses.

Three consequences that must hold in every authored item:

1. **Self-contained determinacy.** No outside knowledge. A well-informed adult who has never
   heard of the topic gets it right from the text alone.
2. **One quotable hinge.** The rationale must be able to quote a specific span and say "this is
   why." If you cannot quote the span, the item is broken.
3. **Every distractor fails mechanically.** "Less precise" is not a reason. "Contradicts the
   contrast," "requires an agent that can't act," "true of the topic but not asserted here" —
   those are reasons.

---

## 2. Measured numbers

### Stimulus length (words)

| Subtype | Difficulty | mean | median | p10 | p90 | **author to** |
|---|---|---|---|---|---|---|
| Completion | Easy | 48.9 | 50 | 36 | 60 | **38–58** |
| Completion | Medium | 53.0 | 55 | 40 | 62 | **42–62** |
| Completion | Hard | 54.9 | 55 | 43 | 66 | **45–68** |
| Meaning | Easy | 72.7 | 74 | 52 | 95 | **55–82** |
| Meaning | Medium | 80.0 | 80 | — | — | **65–90** |
| Meaning | Hard | 99.0 | 95 | 88 | — | **80–108** |

**Hard items are only ~12% longer than easy ones.** CB does not manufacture difficulty with
length. It manufactures it with a subtler hinge and a higher-register option set. Never exceed
70 words on a completion item.

Sentence count: 1.76–1.93 sentences on average. **Most completion items are two sentences.**
One-sentence items (with a colon or semicolon splitting evidence from label) are common and are
disproportionately medium/hard.

### Blank placement — *corrects the old spec*

| Difficulty | Sentence 1 | Middle | Final sentence |
|---|---|---|---|
| Easy | 47% | 5% | 47% |
| Medium | 46% | 9% | 46% |
| **Hard** | **64%** | 2% | 33% |

The old spec said "never in sentence 1." That is wrong and it is backwards for hard items.
Putting the blank in sentence 1 is CB's difficulty lever: the student must hold the blank open,
read the evidence forward, and *then* resolve it. **At least 60% of hard items must open with
the blank.**

### Options

- Mean words per option: 1.20 (easy) / 1.23 (medium) / 1.26 (hard).
- All four options are a single word in **77%** of items.
- All four options must be the **same part of speech** and the **same syntactic shape**.
- **17%** of items use options ending in a preposition (*contingent on, saturated with,
  demarcated from, concentrated among*). When one option takes a preposition, **all four take
  one, and they must be four different prepositions.** Never mix a bare adjective with a
  prepositional phrase in the same set.
- **5%** of items carry the article inside the option (*a haphazard / a contentious /
  an ineffectual / an arduous*). If so, all four carry it, correctly matched for a/an.

### Answer key

Official spread across the 200: B 57 · D 49 · A 44 · C 42. **Author to exactly 25/25/25/25 per
100.** Never three of the same letter consecutively in the emitted file order.

### Passage furniture

- **67%** of completion items name a person (researcher, artist, writer) — always with a first
  and last name, globally diverse, and always introduced by role: *"Economist Jingting Fan
  argues…"*, *"Botanist Al Kovaleski found…"*, *"As discussed by scholar Anna Mladentseva…"*.
- **37%** contain a number, a year, a percentage or a quantity.
- 26–34% contain a **colon** — the single most common hinge.
- Present tense for scholarly claims; past tense for studies and historical events.
- No second person, no rhetorical questions, no humor, no opinion, no hedging about the topic's
  importance ("interestingly," "remarkably" are used sparingly and only where CB would).

---

## 3. The hinge — the six structures CB uses

Every completion item must be built on exactly one of these. Choose it **before** writing.

1. **Colon expansion** (~30%). Claim with blank, colon, then the evidence that defines it.
   *"…critics found truly ______: they praised Tsang for creatively transforming a museum
   rotunda…"* → **inventive**
2. **Contrast pivot** (`but`, `while`, `whereas`, `however`, `by contrast`) (~25%). Blank sits on
   one side of an explicit opposition; the other side is stated plainly.
   *"While tropical species are ______ deep-bodied forms, polar and temperate species are highly
   dispersed across the morphological spectrum."* → **concentrated among**
3. **Concession / negation frame** (`despite`, `by no means`, `far from`, `although`) (~12%,
   concentrated in hard). The blank is inside a polarity inversion.
   *"It is by no means ______ to recognize the influence of Bosch… indeed, Banisadr himself cites
   Bosch as an inspiration."* → **unimportant**
4. **Cause / consequence** (`because`, `since`, `so that`, `which is why`) (~15%).
5. **Exemplification** (`for example`, `such as`, a named instance) (~10%). The example is a
   sufficient definition of the blank.
6. **Restatement** (`that is`, `in other words`, an appositive, a parenthetical gloss) (~8%).

---

## 4. Distractor families — every wrong option must be exactly one of these

1. **Semantic-field lure.** A word drawn from the topic's own vocabulary that the sentence does
   not assert. (Bicycle-share item: *depleted* — the passage does say some locations are depleted,
   but the blank names the *opposite* half of the contrast.)
2. **Polarity flip.** Right dimension, reversed direction. (*conflated with* vs *demarcated from*.)
3. **Selectional-restriction violation.** The option requires an agent or object that cannot
   fill that role. *"Transport costs cannot **denigrate** a price advantage."* *"A scenario cannot
   be **ambivalent**."* *"Locations are not **susceptible to** bicycles."* This is CB's most
   elegant distractor and the one imitators almost never write. **Use it in ≥25% of items.**
4. **True-but-not-asserted.** Defensible about the topic in the world, but the passage never
   claims it. (Native-art item: *individualistic* is true of some of those artists, but it is not
   the misconception being disproved.)
5. **Near-synonym off by one feature.** Reserved for hard. Four formal words sharing a rough
   sense, separated by a single component of meaning (*conjecture / supposition / corroboration /
   surmise*).

Prohibited: a distractor that is simply a rarer or uglier word for the right idea. If a fair
reader can defend it, the item is broken.

---

## 5. The difficulty ladder

**Easy (target: ~80% of students correct).**
Keyed word is high-frequency and concrete — *fragile, protect, obtain, widespread, efficient,
inexpensive, patterns, similarities with*. The hinge is explicit and adjacent to the blank; the
evidence is almost a dictionary definition. Distractors are transparently wrong on one reading.
Blank in either position. Registers: everyday academic.

**Medium (target: ~55%). This is the workhorse — 40% of the set.**
Keyed word is a mid-register abstraction — *consensus, advantageous, competent, nullify,
homogeneous, integral, contingent on, receptive to, ambivalence toward*. One inference step sits
between the evidence and the label: *"researchers regularly dispute one another's
classifications"* → little **consensus**; *"waiting for a favorite treat instead of instantly
devouring a readily available meal"* → **competent** at self-control. Exactly one distractor is a
real competitor. The hinge is usually a contrast or a colon, and the evidence is *behavioural or
quantitative*, not definitional.

**Hard (target: ~30%). Two flavours, roughly half and half.**

- **(a) Register jump.** All four options are formal/academic, so the student cannot shortcut by
  recognising the one word they know: *demarcated from, counterfactual, defunct, opaque, arduous,
  manifest in, paucity of, notional, engendering, stymie, buttress, repudiates, surreptitiously,
  supposition, prescribed, mediated by*. The reasoning is not harder — the vocabulary floor is.
- **(b) Logical inversion.** The blank is inside a negation, concession, or double contrast, so
  the student must track polarity. *"Despite how ______ they may seem on first glance, the works
  of Georg Hegel have proven quite influential"* → **opaque** (not *authoritative*, which is what
  the topic suggests but the frame forbids). This is the highest-discrimination WIC structure CB
  writes.

Plus, structurally: hard items open with the blank 64% of the time, and their evidence is
subordinated — buried in a relative clause, a parenthetical, or a second clause after a colon.

---

## 6. Rationale voice (mirror the official register exactly)

One paragraph, plain text, 160–300 words:

> Choice **{L}** is the best answer because it most logically completes the text's discussion of
> {topic}. In this context, "{keyed word}" means {gloss}. {One or two sentences quoting the
> hinge and showing the evidence.} This context supports the idea that {restatement}.
> Choice {L2} is incorrect because "{option}," or {gloss}, {mechanical failure}.
> Choice {L3} is incorrect because … Choice {L4} is incorrect because …

Non-negotiable features observed in all 200 official rationales:

- Opens literally with `Choice {Letter} is the best answer`.
- **Glosses the keyed word** with *"In this context, 'X' means Y."*
- **Glosses every distractor inline** with *"or {definition},"* — this is a CB fingerprint.
- Names a mechanism for each rejection. Never "is less precise," "sounds awkward," "is not the
  best choice."
- Quotes the passage at least once, in quotation marks.
- For "most nearly means" items: *"Choice {L} is the best answer because as used in the text,
  'X' most nearly means {gloss}."* and distractor rebuttals frequently begin *"Although 'X' can
  mean {other sense} in some contexts, …"* — explicitly acknowledging the other real senses.

---

## 7. Composition targets for the 100-item refresh

| | Easy | Medium | Hard | total |
|---|---|---|---|---|
| Completion | 25 | 33 | 26 | **84** |
| Most nearly means | 5 | 7 | 4 | **16** |
| **total** | **30** | **40** | **30** | **100** |

- Answer key: 25 A / 25 B / 25 C / 25 D.
- Topic lanes: natural science 34 · social science 24 · humanities & arts 21 · literature 14 ·
  history & civics 7.
- Hinge distribution across the 84 completion items: colon 25 · contrast 21 · concession/negation
  12 (≥9 of them hard) · cause 13 · exemplification 8 · restatement 5.
- ≥21 items must contain a selectional-restriction distractor.
- ≥14 items use prepositional-phrase options (all four with different prepositions).
- ≥60% of hard items open with the blank.
- Named people: ~65 of 100, globally diverse, all invented, all introduced by role.

## 8. Hard prohibitions

- No topic, person, artwork, organism, place, study or phrasing reused from the official bank
  export, official Practice Tests, or this repo's Practice Tests 3–5.
- No keyed word reused from the official bank's keyed-answer list (checked programmatically).
- No real living people; no real named studies. Invented researchers and works only.
- No item solvable without reading the passage; no item with two defensible answers.
- No "NOT" stems, no all/none of the above, no lettered prefixes inside option strings.
