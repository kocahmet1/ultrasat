# Transitions — Authoring Spec (measured from 194 official College Board items)

Source: `questionbank-export-2026-8-5 (15).pdf` — 194 official SAT Question Bank items,
skill = Transitions (Expression of Ideas), with official rationales and official
difficulty labels (80 Easy / 73 Medium / 41 Hard). **Every number below is measured
from that export**, not estimated. Parsed corpus kept at `src/_official-corpus-194.json`
for re-verification.

This spec supersedes the Transitions section of `scripts/output/pt5-build/STYLE_SPEC.md`.

---

## 0. The essence — what this skill actually measures

Transitions is **not** a test of whether you know what "nevertheless" means. Every one of
the four options is a perfectly ordinary English connective that the student already knows.

> **The item measures one thing: can the student name the *rhetorical job* that the blank's
> sentence performs relative to the sentence before it — before looking at the choices?**

The load-bearing structure is always the same:

> Sentence A establishes a proposition. Sentence B does *something* to it — extends it,
> reverses it, narrows it, explains it, concedes it, resolves it. The blank is the **label
> for that operation.** The four options name **four different operations.**

Proof from the corpus: in **181 of 194 items (93%) no distractor belongs to the same logical
family as the key.** Options are drawn from 3 distinct families (39%) or 4 distinct families
(59%). College Board is *never* asking "which of these two contrast words is better." It is
asking "is this a contrast at all, or is it a consequence?"

**This is the single most-missed feature in third-party imitations.** Barron's/Princeton-style
Transitions items typically offer two contrast words and two addition words and ask for a fine
shade of meaning. That is a different, easier, and less diagnostic test. Author four different
*operations*, one per option.

### Three consequences that must hold in every authored item

1. **Self-contained determinacy.** No outside knowledge. The relation is fixed by what the
   two sentences assert, not by what the reader knows about the topic.
2. **One quotable hinge.** The rationale must be able to quote a span and say "this is the
   operation." If you cannot name the operation in five words ("reverses the expectation,"
   "supplies the mechanism," "concedes a limit"), the item is broken.
3. **Every distractor fails *structurally*, never stylistically.** "Doesn't flow as well" is
   not a reason. The official rationale formula is absolute: *"X illogically signals that
   [the operation X names]. Instead, [the operation actually performed]."* If a distractor
   can't be refuted in that exact frame, replace it.

---

## 1. Measured numbers

### Stimulus length (words)

| Difficulty | mean | median | min | max | p25 | p75 | **author to** |
|---|---|---|---|---|---|---|---|
| Easy   | 49.4 | 50 | 26 | 68 | 45 | 56 | **40–60** |
| Medium | 55.2 | 56 | 37 | 79 | 51 | 60 | **44–68** |
| Hard   | 59.7 | 59 | 40 | 80 | 55 | 63 | **48–74** |

**Hard items are only 21% longer than easy items.** CB does not manufacture difficulty with
length or with vocabulary. It manufactures it with a *less obvious operation* and a *more
plausible wrong operation.* Never exceed 76 words.

### Sentence count

| Difficulty | 1 sent | 2 sent | 3 sent | 4+ sent | mean |
|---|---|---|---|---|---|
| Easy   | 0% | 33% | 51% | 16% | 2.85 |
| Medium | 1% | 52% | 44% | 3% | 2.48 |
| Hard   | 0% | 51% | 46% | 2% | 2.51 |

Counter-intuitive but real: **easy items are the *longest* by sentence count.** Three
sentences give the student extra runway — the relation gets set up over two sentences before
the blank arrives. Medium and hard compress to two sentences, so the whole relation must be
inferred from a single prior clause. **Compression, not expansion, is the difficulty lever.**

### Blank placement

| Difficulty | sentence-initial | mid-sentence (comma-offset) |
|---|---|---|
| Easy   | 90% | 9% |
| Medium | 79% | 15% |
| Hard   | 71% | 17% |

The blank is almost always in the **final sentence** (Easy 79%, Medium 81%, Hard 85%).
Mid-sentence blanks — `Larch trees, ______ lose their needles every fall.` — are a difficulty
device: they bury the connective inside the sentence so it can't be read off the sentence
opening. Lowercase the option and keep the trailing comma: `for instance,`.

### Surface complexity markers

| marker | Easy | Medium | Hard |
|---|---|---|---|
| semicolon | 2% | 12% | **22%** |
| em dash | 10% | 30% | 27% |
| parenthetical gloss | 21% | 21% | **32%** |
| quoted phrase | 10% | 22% | 22% |
| colon | 6% | 12% | 15% |
| named person | 71% | 73% | 66% |
| specific year | 31% | 40% | 32% |

**~70% of every item names a real-sounding person.** Transitions passages are almost always
*about somebody doing something* — a researcher, an artist, a historian. Abstract topic-only
passages are rare. Author names.

### Option length

Single-word options dominate (Easy 57%, Medium 60%, Hard 54%); the rest are 2–3 words.
Options longer than 3 words appear in ~3% of items and are a *hard-only* device
(`Undermining this explanation,` / `Beyond the simple coining of a term,`).

---

## 2. Logical families — target distribution of the KEY

Measured share of correct answers, by difficulty. Author to these.

| family | Easy | Medium | Hard | what the operation is |
|---|---|---|---|---|
| **CONTRAST** | 19% | 26% | **32%** | B opposes, reverses, or displaces A |
| **CAUSE/EFFECT** | 21% | 18% | 17% | B follows from A, or B is done to achieve A |
| **SEQUENCE/TIME** | **29%** | 5% | 10% | B happens after (or before) A |
| **EXAMPLE/SPECIFY** | 11% | 16% | 5% | B is an instance of A, or narrows A |
| **EMPHASIS/CONCEDE** | 8% | 10% | **17%** | B confirms A, or grants a point against A |
| **ADDITION** | 5% | 15% | 10% | B is a second, parallel item alongside A |
| **GENERALIZE/QUALIFY** | 0% | 3% | 5% | B states how *often* A holds |
| **RESTATE** | 0% | 3% | 2% | B renames A in other words |

Read the ladder off that table: **easy items are overwhelmingly chronology and consequence;
hard items are overwhelmingly contrast and concession.** SEQUENCE collapses from 29% to 10%
because "what happened next" is the one relation nobody gets wrong.

---

## 3. The transition inventory — and the trap words

Measured across all 776 option slots. `key%` = how often that word, when it appears, is the
answer.

### Words CB uses as the KEY (author these as answers)

| ~100% key | ultimately · though · of course · more often · again and again · to be exact |
| high (≥50%) | then · finally · in fact · indeed · accordingly · hence · to that end · fittingly · later · that is · for this reason |
| moderate (25–45%) | by contrast · as a result · specifically · next · consequently · that said · in fact · additionally · in addition · thus · instead · granted · conversely · however · alternatively · on the other hand |

### Trap words — **never** the key in 194 items

> **regardless (0/16) · in conclusion (0/11) · furthermore (0/8) · secondly (0/4) ·
> firstly · lastly · in sum · rather · subsequently · soon · to conclude**

These exist purely to be wrong. "Regardless" and "In conclusion" are the two most-used pure
distractors in the entire bank. Use them freely as distractors; **never** key them.

### Low-yield words — heavy-duty traps (use mostly as distractors)

| word | key rate | why it traps |
|---|---|---|
| **in other words** | 3% (1/36) | students see a second sentence with more detail and read it as restatement when it is elaboration or exemplification |
| **similarly** | 8% (3/36) | topical continuity feels like similarity |
| **nevertheless** | 9% (3/35) | any contrasting *fact* in the content baits a contrast *connective*, even when B confirms A |
| **likewise** | 9% (2/22) | same trap as *similarly* |
| **for example** | 12% (8/64) | the single most-used option in the bank; a more specific second sentence is usually specification, not exemplification |
| **moreover** | 13% (2/15) | topical continuity again |

**"For example" appears in 64 of 194 items (33%) and is right only 8 times.** If you author
nothing else from this section, author that ratio.

---

## 4. The difficulty ladder — what actually moves an item up

### EASY — the relation is stated twice

Three sentences. The relation is **redundantly cued by content** before the blank arrives.
The passage often contains an explicit scaffold: an enumeration (`First, … ______ … Finally,`),
a date sequence (`In 1942 … overlooked for decades … ______ in 2017 …`), or an explicit
problem/solution pair (`began to struggle … ______ was subdivided`).

The key is a high-frequency everyday connective. The three distractors name operations that
are **flatly absent** from the text — not merely worse, but unsupported. Semicolons rare, dashes
rare, register plain.

*Easy is a passage where a student who read only the last two sentences still gets it right.*

### MEDIUM — the relation must be inferred once, and one distractor is baited

Compress to two sentences. Add one of these:

1. **A narrower family member is required.** Not *however* but **by contrast** (two things
   set against each other in parallel). Not *for example* but **specifically** (the second
   sentence gives the detail of the *same single thing*, not a new instance of a class).
2. **Expectation reversal.** `Researchers wondered if X … ______ they discovered [not-X]` →
   **Instead**. Bait: *Therefore*.
3. **Backward time.** `Cajal observed [new finding] … ______ scientists had assumed [old view]`
   → **Previously**. Bait: *However* — the content *is* a contrast, but the connective's job
   here is to mark the flashback.
4. **Frequency qualification.** `results have been impressive overall. ______ these strains
   have proven more effective` → **In many cases** / **Sometimes**. Bait: *However* / *Thus*.
5. **Confirmation that reads like escalation.** `considers the research its own reward.
   ______ she admits to finding it as fascinating as travel` → **In fact**.

Add one surface complication: a dash-offset appositive, a quoted title, a parenthetical gloss.

### HARD — the surface cue and the argumentative role point in *different directions*

This is the definition of a hard Transitions item. Every hard item in the corpus does at least
one of the following. Author from this list; it is exhaustive for the 41 hard items measured.

| # | mechanism | example from corpus | the trap |
|---|---|---|---|
| **H1** | **Confirming an outlier.** A number/fact that *looks* like a contrast actually *supports* the preceding claim of extremity. | `mark these jets as outliers; ______ the majority reach only 20–50 km` → **indeed** | *nevertheless* — the numbers differ, so it feels contrastive |
| **H2** | **Concession architecture.** The blank grants a point *against* the paragraph's thesis; the *next* sentence walks it back with *Still,* / *but*. | `Modernista architects championed nature. ______ the staircase couldn't exactly grow in a forest. Still, one sees natural influences…` → **Of course** | *Furthermore* / *Thus* |
| **H3** | **Purpose vs. result.** *To that end* = B is an action taken **in order to** achieve a goal stated in A. *Accordingly/As such* = B **follows from** A. | `Dowsett sought to coordinate suffragists. ______ in 1912 she founded the Association` → **To that end** | *In other words* — founding the org restates nothing; it enacts the goal |
| **H4** | **Restatement vs. specification vs. exemplification.** *That is* renames A. *Specifically* narrows to the detail of the same single thing. *For example* supplies one member of a class. | `de Larios's art reflects a mix of cultural influences. ______ her work is grounded in Mexican and Japanese traditions` → **Specifically** | *For example* (there's only one artwork body, not a class) |
| **H5** | **The passage already contains its own contrast word.** A *however/but/yet* earlier in the text has already done the opposing; the blank must therefore be a consequence. | `Siderophiles are more abundant than predicted, however. ______ extraterrestrial material almost certainly accreted` → **Hence** | *That said* — a second contrast |
| **H6** | **Mid-sentence blank in a subject-heavy sentence.** The connective sits between a long subject and its verb, so it can't be read off the sentence opening. | `Bruno Morgado and colleagues, ______ detected a dense ring…` → **though** | *for example* |
| **H7** | **Non-adjacent antecedent.** The blank's sentence responds to sentence 1, not to sentence 2. | (H23) three-sentence poem item where the blank answers the collection's *general* practice, not the immediately preceding line-length fact | any connective that fits the adjacent sentence |
| **H8** | **Statistical rather than categorical contrast.** The two claims are not opposites; one is simply *more common*. | `migrants … ______ researchers determined, merely relocated within the region` → **more often** | *nevertheless* / *additionally* |
| **H9** | **Participial / phrasal options.** All four options are clauses naming an epistemic move. | `Undermining this explanation,` vs `Confirming this hypothesis,` vs `Drawing a similar conclusion,` | each option is individually fluent; only the epistemic direction differs |
| **H10** | **Resolution move.** The final sentence *closes* the tension rather than adding to it. | `one's mind might wander to faraway planets. ______ it's the title that brings one back to Earth` → **Ultimately** | *Alternatively* / *Additionally* |

**Hard is never "harder vocabulary."** The hard items key on *of course*, *then*, *though*,
*indeed*, *hence* — all fifth-grade words. Difficulty lives entirely in the relation.

---

## 5. Distractor construction rules

1. **Four different operations.** ≥3 distinct logical families among the four options; prefer 4.
   Never two words from the same family unless the item is deliberately mechanism-H4.
2. **Every distractor must be idiomatic in the slot.** If a distractor produces awkward English
   rather than wrong logic, the item is measuring the wrong thing. Read each option aloud in place.
3. **Every distractor must be refutable in the CB frame:** *"X illogically signals that [Y].
   Instead, [Z]."* Where Y is a real operation the text does not perform.
4. **One distractor should be baited** by a surface feature (a date → *Then*; contrasting numbers
   → *However*; a more detailed sentence → *For example*). Medium: one bait. Hard: the bait
   should be the *most* attractive option in the set.
5. **Punctuation matches placement.** Sentence-initial → capitalized, trailing comma
   (`However,`). Mid-sentence → lowercase, trailing comma (`however,`). Never mix cases
   within one option set.
6. **No option may be a correct paraphrase of another.** *Thus / Therefore / Consequently /
   As a result* are interchangeable; at most one may appear per item.

---

## 6. Formatting contract

- Blank is exactly six underscores: `______`, followed by a space, then a **lowercase**
  continuation when the blank replaces a sentence-initial connective
  (`______ in 2017, lawmakers declared…`). This is the official convention: the blank
  *is* the capital letter.
- Stem is the fixed string: `Which choice completes the text with the most logical transition?`
- `passage` holds the stimulus; `text` holds the stem. Never concatenate.
- Options carry their own trailing comma and no `A)` prefix.
- No em dash may be used as a substitute for the blank.

## 7. Content rules

- **Topic lanes** (target Easy/Medium: even four-way split; Hard: science-weighted, matching
  the measured 44% science share in hard items):
  `natural-science` · `arts-literature` · `history-social` · `technology-craft`
- **All contexts must be original.** No person, study, artwork, or finding from the official
  bank. `src/official-proper-nouns.json` holds all 593 proper nouns from the 194-item export;
  `build.js` hard-fails on collision.
- Invented researchers/artists are fine and expected — CB does the same thing with real ones.
  Names should be internationally varied, as the official bank's are.
- No named answer may repeat across the 100-item set more than the corpus rate allows
  (`build.js` caps any single keyed transition at 6 uses).
