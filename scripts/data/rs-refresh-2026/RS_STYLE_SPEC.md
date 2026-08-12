# Rhetorical Synthesis — Authoring Spec

Measured from **154 official College Board SAT Question Bank items**, skill = Rhetorical Synthesis,
with official rationales (`questionbank-export-2026-8-5 (14).pdf`).
Official mix in that export: **31 Easy / 89 Medium / 34 Hard**.

Every number below is measured, not estimated. Where a rule is a judgement call rather than a
measurement it is marked *(judgement)*.

---

## 0. What this question actually tests

Rhetorical Synthesis is **not a writing question**. Nothing is grammatically wrong with any choice.
All four choices are usually fluent, usually factually consistent with the notes, and usually
*interesting*. The item is a **goal-matching** task:

> Given a closed universe of facts (the notes) and a precisely worded rhetorical purpose (the goal
> sentence), decide which single sentence **performs that purpose** — not which sentence is best
> written, most complete, or most informative.

The construct being measured is the ability to hold a narrow purpose in working memory and evaluate
candidates against it while resisting three pulls:

1. **The pull of fluency** — the most elegant sentence is frequently a distractor.
2. **The pull of completeness** — the sentence that uses the most notes is frequently a distractor.
3. **The pull of interestingness** — the most surprising fact is frequently in a distractor.

**Authoring consequence:** the correct answer must be correct *only* because of the goal. If you can
identify the key without reading the goal sentence, the item is broken. Conversely, if two choices
both satisfy the goal and you are separating them on style, the item is broken.

---

## 1. Fixed surface form — never vary this

Every item is built from four parts, in this order:

```
While researching a topic, a student has taken the following notes:

<4–6 note lines, each a complete sentence, each on its own line>

The student wants to <GOAL>. Which choice most effectively uses relevant information
from the notes to accomplish this goal?
```

- The lead-in is **verbatim**: *While researching a topic, a student has taken the following notes:*
  (154/154 items).
- The question stem is **verbatim**: *Which choice most effectively uses relevant information from
  the notes to accomplish this goal?* (148/154). The plural variant *…to accomplish these goals?*
  appears in 4/154 and is used only when the goal sentence names two purposes joined by *and*.
  **Do not author the plural variant** — it is a rare form and adds no diagnostic value.
- The goal sentence always begins *The student wants to …* (154/154) and is a **single sentence
  ending in a period**, followed immediately by the question stem.
- Options are full sentences, capitalized, ending in a period. Never fragments, never quoted.

---

## 2. Measured envelopes

| metric | Easy | Medium | Hard |
|---|---|---|---|
| notes per item (mean / range) | 4.7 / 4–6 | 5.0 / 3–6 | 5.2 / 4–7 |
| note-block words (mean / median) | **51 / 47** | **70 / 72** | **81 / 80** |
| words per note (mean) | 10.8 | 14.0 | 15.7 |
| goal-sentence words (mean) | 12.5 | 13.4 | 13.3 |
| mean option length (words) | 15.6 | 21.0 | 22.9 |
| longest option (words, mean) | 19.4 | 26.0 | 27.4 |
| rationale words (mean) | 113 | 120 | 138 |
| items containing a numeral | 21/31 (68%) | 67/89 (75%) | 24/34 (71%) |
| items containing a quoted title/term | 5/31 (16%) | 13/89 (15%) | 10/34 (29%) |

**Enforced note-block word envelopes** (build.js hard-fails outside these; ±1 SD of the measured
distribution):

| difficulty | min | max |
|---|---|---|
| easy | 34 | 68 |
| medium | 48 | 95 |
| hard | 58 | 110 |

**Enforced option-length envelopes** (mean across the 4 options):

| difficulty | min | max |
|---|---|---|
| easy | 9 | 23 |
| medium | 13 | 28 |
| hard | 16 | 29 |

The four options in one item must be **within 12 words of each other** (longest minus shortest).
Length is never a cue to the key. Measured across the official bank, the keyed answer is the longest
option only ~28% of the time — i.e. chance. *(judgement: enforce ≤ 12-word spread, and forbid the key
from being the longest option in more than 30% of the set.)*

---

## 3. Anatomy of the note block

The notes are written as a student's *raw research shorthand*, not as prose. Specifically:

1. **Note 1 is almost always an orienting definition or identification.**
   *The Haber-Bosch process is an industrial process used to manufacture ammonia (NH₃).*
   *The Philadelphia and Lancaster Turnpike was a road built between 1792 and 1794.*
   It names the subject and puts it in a category. It rarely carries the payload.
2. **Notes 2–4 add attributes**: dates, dimensions, personnel, mechanism, a second entity.
3. **The last 1–2 notes carry the payload** the goal will target — the result, the contrast, the
   significance, the number. This is the single most reliable structural regularity in the bank.
4. Notes use **pronouns and ellipsis across lines** (*It was sixty-two miles long.* / *She examined
   thousands of pages…*). This is what makes them read like notes rather than an encyclopedia entry.
   At least two notes in every block should begin with a pronoun or a bare noun phrase referring back.
5. **No note is a full paragraph.** Range 6–23 words. If a note exceeds 25 words, split it.
6. **Numbered-step blocks are legitimate** for process items (*Step 1: … Step 2: …*) — used for
   engineering/procedure topics, ~4% of the bank, and only at Medium/Hard.

**Facts must be closed and sufficient.** Everything needed to justify the key is in the notes;
nothing needed to eliminate a distractor requires outside knowledge. Equally: never leave a fact in
the notes that would make a distractor defensible.

---

## 4. Goal taxonomy — measured frequencies

| goal verb | overall | Easy | Medium | Hard |
|---|---|---|---|---|
| **emphasize** (a similarity / a difference / significance / thoroughness / order / uniqueness) | **28.6%** | 7 | 31 | 6 |
| specify | 8.4% | 4 | 9 | 0 |
| present (a study / a study and its findings / results) | 8.4% | 0 | 9 | 4 |
| describe | 6.5% | 2 | 5 | 3 |
| explain (how / why / an advantage / a disadvantage) | 6.5% | 2 | 6 | 2 |
| contrast | 5.8% | 1 | 7 | 1 |
| provide (an overview / a historical overview) | 5.2% | 2 | 4 | 2 |
| indicate | 4.5% | 6 | 1 | 0 |
| introduce (to a new / familiar / unfamiliar audience) | 4.5% | 2 | 4 | 1 |
| identify | 3.9% | 3 | 2 | 1 |
| **make and support a generalization** | 3.9% | 0 | 2 | 4 |
| compare | 2.6% | 1 | 1 | 2 |
| place X within its historical context | 1.3% | 0 | 0 | 2 |
| summarize | 1.3% | 0 | 0 | 2 |
| define … and provide an example | 0.6% | 1 | 0 | 0 |

**Read the columns, not the total.** The verb distribution *is* the difficulty gradient:

- **indicate / specify / identify** — 13/31 Easy (42%), 12/89 Medium (13%), 1/34 Hard (3%).
- **make and support a generalization / place in historical context / summarize** — 0/31 Easy,
  2/89 Medium (2%), 8/34 Hard (24%).
- **emphasize** is the workhorse at every level but changes character (§5).

**Target for this set (100 items):** emphasize 28, specify 8, present 8, describe 7, explain 7,
contrast 6, provide-overview 5, indicate 5, introduce 5, identify 4, generalization 4, compare 3,
historical-context 2, summarize 2, define-and-exemplify 1, note/convey 5. Distribution across
difficulty must follow the columns above.

**Audience clauses** (*…to an audience already familiar with X*, *…unfamiliar with X*, *…to a new
audience*) appear in **12/154 (8%)**: 2 Easy, 8 Medium, 2 Hard. Target 8 in this set. An audience
clause converts the item into a two-constraint problem — the sentence must both accomplish the goal
*and* pitch at the right level of assumed knowledge — which is why it clusters at Medium.

---

## 5. The difficulty gradient — what actually changes

Length changes only slightly (§2). What changes is **how many notes the key requires** and
**whether the goal names a fact or a relation**.

### Easy — one note is the answer

The goal names a **single retrievable fact**: the year, the number, the distance, which of three
foods, where the fossil was found. Exactly one note contains it. The key is that note, restated in a
sentence with light context. The three distractors draw on **different** notes, so they are visibly
off-target once the goal is read.

> *The student wants to emphasize the distance covered by the Philadelphia and Lancaster Turnpike.*
> Key: the only choice containing "sixty-two-mile-long." Distractors give the founding date, the
> "first private turnpike" claim, and the two cities.

Easy distractor recipe: **omission**. The distractor simply does not contain the targeted fact.
Rationale shape: *The sentence emphasizes when the turnpike was built; it doesn't emphasize the
distance that the turnpike covered.*

### Medium — the key fuses exactly two notes, or names a relation

Two moves dominate:

1. **Relation goals** — *emphasize a similarity / a difference between X and Y*, *contrast A and B*.
   24/89 Medium items (27%) versus 6/31 Easy and 4/34 Hard. The key must state **both** entities
   **and** the relation. Distractors: one entity only; both entities with the **opposite** relation
   (similarity↔difference — this is the highest-yield medium distractor); both entities with a
   relation the notes don't support.
2. **Function goals** — *explain an advantage of…*, *present the study and its findings*,
   *emphasize the thoroughness of…*. The key requires a specific pair of notes; using either alone
   is insufficient.

At Medium the **subordination trick** appears: a distractor *contains* the targeted fact but buries
it in a relative or participial clause while the main clause does something else.

> Goal: *emphasize the order in which two of Jordan Bennett's exhibitions were held.*
> Distractor B: *Jordan Bennett's paintings, **some of which appeared in 2017 and 2018 exhibitions**,
> pay homage to traditional Mi'Kmaq craftsmanship.* — the years are present; the emphasis is on the
> homage. Rationale: *While the sentence mentions that exhibitions took place in 2017 and 2018, it
> doesn't identify the exhibitions or emphasize the order in which they were held.*

This is the most College-Board-specific move in the whole skill and the one commercial imitations
most often miss. **At least 10 items in this set must use it.**

### Hard — no note contains the answer

The goal names an **abstract rhetorical function** that no single note states and no pair of notes
states literally:

- *place Einstein's argument within its historical context*
- *emphasize the significance of the 1990 discovery to Plot's reputation*
- *make and support a generalization about honeybees*
- *summarize the findings of Padmanabhan and Chen's study*

The correctness criterion becomes a **relationship between propositions** rather than a fact. All
four choices are true to the notes on their face; the distractors fail on **scope, direction, or
agent**, not on content. Hard rationales are 138 words on average (vs 113 Easy) precisely because
each wrong choice needs two sentences: what it does do, and the specific way it falls short.

The three hard distractor recipes, in the bank's own words:

| recipe | rationale template | frequency at Hard |
|---|---|---|
| **agent swap / relation inversion** — a true-sounding sentence that attributes the action, property, or claim to the wrong party | *While the sentence [does part of the goal], it misrepresents information from the notes: [X], not [Y], [verb].* | very common — often 2–3 of the 3 wrong choices in one item |
| **partial** — satisfies the first half of a two-part goal and stops | *The sentence only partially explains …; it doesn't [second half].* | common |
| **over/under-scope** — generalizes a specific, or specifies a generalization | *The sentence makes a claim about [category] in general; it doesn't explain [the specific case].* | common |

> Canonical example (Robert Plot, Hard): goal = *emphasize the significance of the 1990 discovery to
> Plot's reputation.* Distractor A says Benoit *"challenged Plot's reputation for being the first
> person to have discovered **M. carinatus** remains"* — Plot's reputation was for dinosaur remains
> **in general**. One noun phrase, swapped. That is the entire difference between A and B.

**Authoring test for Hard:** if a strong student can eliminate a distractor without going back to
the notes, it isn't a Hard distractor.

---

## 6. Distractor construction — the four failure modes

Every wrong choice must fail in exactly one identifiable way, and the rationale must name it.
Measured across 425 wrong-choice rationale segments:

| # | failure mode | share | what the student sees |
|---|---|---|---|
| 1 | **Right facts, wrong job** | ~60% | A true, well-formed sentence that performs a *different* rhetorical function than the goal names. |
| 2 | **Misrepresents the notes** | ~20% | Agent swapped, relation inverted, a specific rendered as a general, a claim slightly overstated. |
| 3 | **Partial / incomplete** | ~13% | Does part of the goal and stops. *"the overview is incomplete"*, *"only partially explains"*. |
| 4 | **Audience mismatch** | ~7% | Explains what the named audience already knows, or omits what it doesn't. |

Hard rules:

- **Never** make a distractor wrong by being ungrammatical, awkward, wordy, or vague. Zero instances
  in 154 official items.
- **Never** make a distractor wrong by inventing a fact absent from the notes *as the only defect* —
  outright fabrication is rare and it makes the item too easy. Misrepresentation of a fact that *is*
  in the notes is the correct move.
- Every distractor must be **tempting to a student who skimmed the goal**. Test: read the four
  choices with the goal covered. The key should not stand out.
- Distribute the failure modes within each item. An item with three mode-1 distractors is an Easy
  item; an item with two mode-2 and one mode-3 is a Hard item.

---

## 7. Rationale style — imitate exactly

**Opening.** 152/154 official rationales begin with the bare sentence **"Choice X is the best
answer."** No *because*. The justification follows as a separate sentence. Use this form.

**Best-answer body.** One sentence, of the shape:

> The sentence <restates the goal verbatim>, noting that <the specific note content that discharges it>.

e.g. *The sentence emphasizes a similarity between glaciers and icebergs in Greenland, noting that
both melt and thereby contribute to rising sea levels.*

**Wrong-choice segments.** Each begins **"Choice X is incorrect."** as its own sentence, then one or
two sentences. Three templates cover the bank:

- Plain miss — *The sentence [what it does]; it doesn't [goal].*
- Concessive — *While the sentence [does something adjacent], it doesn't [goal].*
- Misrepresentation — *While the sentence [does part of the goal], it misrepresents information from
  the notes: [the correction].*

**Register.** Third person, present tense, no second person, no *you*, no exhortation, no
"remember that". Refer to the option as *the sentence* or *this choice*. Restate the goal in full
each time rather than pronominalising it — the repetition is deliberate and is a strong stylistic
fingerprint of the official rationales.

**Banned phrasings** (never appear in the official bank; build.js fails on them):
*sounds awkward, is less precise, is too vague, not the best choice, is wordy, is grammatically
incorrect, flows better, is redundant*.

---

## 8. Content rules

**Topic lanes.** The official RS bank leans hard on history and material culture — measured first-hit
lane distribution: history 54%, engineering/technology 12%, natural science 11%, humanities/arts 5%,
social science 1%, other 16%. Reproduce roughly: **history/archaeology 30, natural science 22,
engineering & technology 18, arts & literature 16, social science 9, sport/food/everyday material
culture 5.**

**Global-majority representation is a structural feature, not decoration.** The official bank names
Chamoru poets, Mi'Kmaq painters, Choctaw and Navajo code talkers, the House of Wisdom, Haudenosaunee
political thought, Somali rock art, dhow shipwrights, MexiCali biennials. Roughly a third of items
centre a non-Western or Indigenous subject and name the people, place, or nation precisely. Match
this. Spell names correctly and use the community's own terms.

**Named researchers.** ~45% of items name a researcher with a full name and a discipline label
(*geoscientist Twila Moon*, *paleontologist Julien Benoit*, *mycologist Priya Raghunathan*). Invent
plausible names drawn from a wide range of naming traditions. Never use a real living researcher's
name attached to invented findings.

**Originality — hard constraints:**

- No topic, entity, study, artwork, or person from the official export may appear.
  `src/official-proper-nouns.json` holds all 1,116 proper nouns from the 154 items; build.js fails on
  any collision longer than 5 characters.
- No keyed answer sentence may reuse an official keyed answer; `src/official-keyed-answers.json`
  holds all 153. build.js checks for near-duplicates.
- Invented studies must be plausible but clearly fictional. Do not attribute invented results to a
  real institution, journal, or living scientist.
- No two items in this set may share a subject, and no two note blocks may share an opening.

**Content safety.** No violence, no medical advice, no politically contested present-day claims, no
content that could distress a 16-year-old. The official bank is uniformly safe expository material;
match that.

---

## 9. Answer-key mechanics

Official key distribution across 153 four-option items: A 44, B 34, C 39, D 36 — flat within noise.
This set is balanced to **exactly 25/25/25/25** by build.js, which rotates each item's options after
authoring. Therefore:

- Author with the key wherever it falls naturally; build.js will rotate.
- Write rebuttals keyed to **option text**, not letter — build.js re-maps them after rotation.
- No run of three identical keyed letters in file order (enforced).

---

## 10. Authoring checklist (per item)

1. Does the goal sentence name exactly one purpose, in ≤ 20 words, beginning *The student wants to*?
2. Do the notes contain everything needed and nothing that rescues a distractor?
3. Is the key correct **only** because of the goal? (Cover the goal — can you still pick it? Then fix.)
4. Does each distractor fail in exactly one nameable way, and does the rationale name it?
5. Are all four options within 12 words of each other?
6. Is the note block inside the word envelope for its difficulty?
7. Does the payload sit in the last one or two notes?
8. Have you checked every proper noun against `official-proper-nouns.json`?
9. Would a student who read only the notes and skimmed the goal be genuinely tempted by ≥ 2
   distractors?
10. For Hard: is every distractor still standing after a first pass, requiring a return to the notes?
