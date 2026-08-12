# CRITIC_M2 — hostile review of Practice Test 10, Reading & Writing, Module 2

Scope: all 27 items read in full, including every explanation. Attacks 1–12 applied to every
item. Reference: `STYLE_SPEC.md` §0, `SLOTS.md`, and the ten `EXEMPLARS_*.md` official dumps.

**Findings: 0 BROKEN · 11 MAJOR · 7 MINOR** (18 total, across Q1–Q9, Q14, Q17–Q19, Q22, Q25).

---

## Overall verdict

This is a strong form. I went at all 27 items looking for a second defensible answer and did
not find one. In every item the three distractors fail for a nameable, mechanical reason that
survives a careful re-reading of the actual words in the stimulus — not merely the explanation's
say-so. The two data items decode cleanly. The conventions block substitutes cleanly. The
transitions set is genuinely discriminating, including the synthesis item, which is the one most
third-party forms botch.

What is wrong with the module is **not logic — it is voice, hedging discipline, and one binding
rule violation.** Seven of the twenty-seven rationales are written in a register that appears
nowhere in the official corpus; one conventions item is built out of options that violate the
"same words, only punctuation varies" rule; one inference item hands the key to any test-wise
student who never reads the passage; one word-in-context item imports a technical definition the
passage never supplies; and two conventions rationales assert grammatical claims that are simply
false. None of that breaks an item, but all of it is exactly the kind of thing that makes an
imitation form read as an imitation.

Mechanical conformance was verified and is clean: the key sequence is
`B D A C B D C A D B C A D B A C D B A C B D A C D B A`, matching `SLOTS.md` letter for letter;
letter balance is 7/7/6/7; skill counts are 4/2/1/2/4/1/4/4/3/2 as specified; the difficulty mix
is exactly 5 easy / 15 medium / 7 hard on the assigned slots; domain order is Craft (Q1–7) →
Information (Q8–14) → Conventions (Q15–22) → Expression (Q23–27) with difficulty non-decreasing
within each skill and across the whole conventions domain; every prose stimulus sits above its
skill floor and under 150 words; long-option parity is within 30% on all twelve long-option items
and the key is uniquely longest on only one of them (Q12); blank and underline-marker counts are
correct everywhere; and every invented proper noun (Halme, Etxaide, Oyelude, Ilangovan, Gelovani,
Anzir, Serath, Vessmo, Etxeberri, Ramokgopa, Mekouar, Ostenhorn, Kirivaara, Kaur, Chidambaram,
Toure, Salgado, Obiako, Rele, Yermekova, Bittencourt, Frimpong, Sohn, Belkacem, Beshkol, Tergen,
Redfen, Longmoor, Millbeck) is absent from `AVOID_NAMES_PT10.txt`.

---

## Data attack — decoded independently from the raw markup

**Q10 (SVG line, 2 series).** Y-axis calibration from the `<text>` ticks: y=250→0, 220→2,
190→4, 160→6, 130→8, 100→10, 70→12, 40→14. X positions: 130 May, 218 June, 306 July, 394 August,
482 September. Decoding the two polylines gives Kirivaara (bare, `#1f5c8b`) **4, 8, 12, 6, 4** and
Ostenhorn (debris, `#b4531f`, dashed) **2, 4, 8, 10, 6**. All ten plotted points land on labeled
gridlines. Key B is arithmetically true (Ostenhorn peaks August, Kirivaara peaks July) and is the
only option that supports the stated prediction that a debris-covered glacier peaks *later*.
Choice A is true but non-supportive; choice C is the series swap and is genuinely false; choice D
describes a quantity the graph does not plot. Markup uses only `svg/g/line/polyline/circle/text`
with `viewBox`, `role="img"`, and nonempty `<title>`/`<desc>` — DOMPurify-safe under the SLOTS
allowlist. **Clean.**

**Q11 (table).** Declines by group: 18–29 = 27 points (36→9); 30–44 = 11 (52→41); 45–59 = 7
(64→57); 60–74 = 4 (73→69); 75+ = 2 (81→79). Key C names the steepest decline, and 27 is more
than twice the next-largest drop, so "far faster than the rest" is satisfied. Choice A is
accurate but describes level rather than change; choice B is the column swap and is false; choice
D concerns recognition, which the survey never measured. **Clean.**

---

## The three weakest items

### 1. Q4 (WIC, hard) — the precision/accuracy distinction is assumed, not supplied

This is the worst item in the module. The passage names the two failure modes ("scatter widely";
"cluster tightly around a value that is simply the wrong one") but **never labels either one**.
So the elimination of choice A depends entirely on the student importing the technical metrology
convention that *precision* means low scatter. In ordinary English, *precise* and *accurate* are
near-synonyms — Merriam-Webster glosses *precise* as "minutely exact" — and a bright student can
argue in good faith that a survey missing the population figure by a wide margin every time is
exactly what "lacking precision" describes.

The rationale convicts itself. It says "that tight scatter is precision" — a definition that
appears nowhere in the passage. STYLE_SPEC §0.1 requires that a well-informed adult who has never
heard of the topic still get it right, and §3.1 forbids testing a word whose meaning must be
known from outside. *Accuracy* remains the best answer, which is why this is MAJOR rather than
BROKEN, but it is not forced by a quotable span. The fix drops "precise" into the passage as a
property the survey **possesses** — the standard CB vocabulary-field lure — which makes A
mechanically dead at the cost of a little difficulty.

### 2. Q19 (BND, medium) — the options break a binding rule, and that is why B is wobbly

The options are `one that / one, which / one, that / one; which`. Two use *that* and two use
*which*. `SLOTS.md` ("Options must be the *same words* with only punctuation varying") and
STYLE_SPEC §3.7 ("Keep the wording identical across choices; only punctuation varies") both
forbid this, and every relative-clause item in the official corpus obeys it (626a1642:
`models — / models, which / models which / models which —`).

This is not cosmetic. Because the pronoun varies, the item stops being a pure punctuation test,
and choice B stays alive longer than it should: a determined student can argue that "the one" is
already identified by the predicate ("most often revive") together with the closing sentence
("The other ten are rarely staged today"), which makes the *which*-clause genuinely
supplementary. The head "the one" is a fused head with no modifier, which is what actually kills
B, but that is a discourse argument, not a bright line. Holding the pronoun constant at *that*
kills B mechanically and leaves three cleanly distinct failure types.

### 3. Q14 (INF, medium) — the hedge is the answer key

Choice B is the only option containing a hedge ("is likely to"); choice A carries the classic
overclaim pair ("proves" + "always"); C and D are flat assertions. Strike the overclaimer, take
the hedger, never read the passage. The underlying logic is genuinely forced by the
before-versus-after disclosure contrast, so nothing is broken — but this is the single most
recognizable third-party tell in the module, and STYLE_SPEC §3.6's own observation that CB keyed
inference answers are hedged is precisely what makes it exploitable. Hedging one distractor
removes the signal at no logical cost.

---

## Systemic observations

**1. The module carries two rationale voices, split at Q8. (MAJOR, 7 items.)** Q1–Q7 open
`Choice B ("dormant") is correct.` and rebut with `is not supported` / `is contradicted by the
text`. Q8–Q27 open `Choice X is the best answer` and rebut with `Choice X is incorrect because`.
Measured across the supplied official corpus: `Choice X is the best answer` = **408**
occurrences, `Choice X is correct` = **0**; `is incorrect because` = **735**, `is not supported`
= **1**. The Q8–Q27 voice is the authentic one. (Note that STYLE_SPEC §5's printed template is
itself wrong here relative to the corpus it claims to be measured from — worth correcting
upstream, or M1 will have the same problem.) Q2 also closes with a summative wrap-up sentence
("Each of these three names a quality…"); official rationales end on the last distractor rebuttal.

**2. Typographic inconsistency.** Q1–Q7 and Q15–Q22 use straight quotes in explanations; Q8–Q14
and Q23–Q27 use curly. Same module, two conventions. The replacement explanations supplied in
`CRITIC_M2.json` follow each block's local convention, but the whole file should be swept to
curly to match rendered CB output.

**3. Two conventions rationales assert false grammar.** Q18 calls "firing" a "past tense verb" —
it is a gerund, i.e. exactly the nonfinite category the item is built to trap; a finite/nonfinite
item cannot have a rationale that confuses finite and nonfinite. Q17 says omitting the comma
before *but* produces "a run-on sentence"; official item 148be4da reserves "run-on" for the
option with **no conjunction at all** and rebuts the missing-comma option on conventionality
alone. Q22 mispairs prepositions with their objects and lists the modal "would be" as a present
tense verb. Q8 says the baker and ferryman "had not allowed for … that the time it displayed was
four minutes behind" — backwards, since by that point the clock has been corrected and is *not*
behind, which is the whole reason they complain.

**4. The hedge-only-key pattern recurs at Q9.** Choice D is the only option containing "probably"
*and* the shortest of the four. The stem ("most strongly suggest") licenses the hedge, so I did
not raise a separate finding, but two of the module's two hedged keys being the only hedged
options in their sets is a pattern a coaching company would find in an afternoon. Watch it in M1.

**5. `Taken together` is unattested as a keyed transition.** It occurs 0 times in the ~150-item
official TRN corpus and twice in official INF *rationales* ("Taken together, this information
suggests…"). This comes from `SLOTS.md`, not from the author, and the item's logic is sound — but
the keyed word is a spec artifact rather than a measured CB option, and it forces a plural
subject in the final sentence, which is the source of the Q25 surface cue.

**6. The key sequence is a repeating permutation.** Reading in blocks of four, the SLOTS-mandated
sequence is `BDAC | BDCA | DBCA | DBAC | DBAC | BDAC | DBA` — every block of four is a permutation
of {A,B,C,D} with no repeats. Letter balance and the no-three-in-a-row rule pass, but a student
tracking letters can narrow the last item of every block to one choice. This is a `SLOTS.md`
defect and cannot be fixed at the item level without changing keyed indices, so no finding was
emitted. Randomize the letter map in the next form.

**7. Difficulty calibration is basically honest.** The five easy items are genuinely easy — and
Q15's rule ("no punctuation between subject and verb") is rated **Easy** in the official corpus
too, so the label is corpus-supported. Of the seven hard items, Q13 (mechanism-specific
falsification, with the rival-hypothesis distractor as a real competitor), Q21 (the trap is a
single comma buried inside an otherwise identical option), Q22 ("each of" with the plural lure 13
words downstream), and Q9 (the word "unstable" is what forecloses the stockpiling objection) are
properly hard by *subtlety*, not by length — hard items run 111/52/53/95 words, comfortably inside
band. Q6 is the softest of the seven: "however … no longer an engineering one" is a loud signpost
and the answer is largely determined locally, though official hard TSP-function items are
similarly signposted, so I did not raise it. Q25 is hard in its logic but soft on its surface,
which is the finding filed.

**8. Credit where due.** Q20 is a faithful reconstruction of the official hard pronoun quartet
(cf. 99dedf36 and 908a76b8: `they / these / this / it`, keyed to *it*, with the singular
demonstrative rebutted on ambiguity in CB's own words). I attacked it hard as a candidate BROKEN —
"this no longer describes" agrees in number and is not ungrammatical — and withdrew the charge
only because CB itself kills the demonstrative on exactly this mechanism, twice. Q7 (concede the
ore, deny the route) and Q13 (piped air isolates the chemical channel from the physical one) are
the two best-built items in the module. Q26's audience condition is handled correctly: the key
refers to "a norsan's staves" without stopping to define the instrument, and the explaining
distractor (C) is disqualified without the key being caught by the same test.

---

## Per-item disposition

| Q | skill | diff | verdict |
|---|---|---|---|
| 1 | WIC | easy | rationale register (MAJOR) — logic clean |
| 2 | WIC | med | rationale register (MAJOR) + non-CB wrap-up sentence — logic clean |
| 3 | WIC | med | rationale register (MAJOR) — logic clean |
| 4 | WIC | hard | **outside knowledge (MAJOR)** + register (MAJOR) |
| 5 | TSP | med | rationale register (MAJOR) — logic clean; C dies on sequence order |
| 6 | TSP | hard | rationale register (MAJOR) — logic clean; softest of the seven hard items |
| 7 | CTC | med | rationale register (MAJOR) — logic clean, best-built item in the module |
| 8 | CID | med | explanation misstates the passage (MINOR) |
| 9 | CID | hard | explanation under-argues; "unstable" unused (MINOR) |
| 10 | COE | easy | clean — every coordinate verified |
| 11 | COE | med | clean — every cell verified |
| 12 | COE | med | clean — key enacts, B asserts, C shows the opposite, D is scenery |
| 13 | COE | hard | clean — "most directly" cleanly separates D from the rival-supporting C |
| 14 | INF | med | **hedge giveaway (MAJOR)** |
| 15 | BND | easy | clean; difficulty label corpus-supported |
| 16 | FSS | easy | clean |
| 17 | BND | easy | explanation names a false mechanism ("run-on") (MINOR) |
| 18 | FSS | med | **explanation calls a gerund a past tense verb (MAJOR)** |
| 19 | BND | med | **options violate same-words rule (MAJOR)** + paired explanation (MINOR) |
| 20 | FSS | med | clean — faithful to official 99dedf36 / 908a76b8 |
| 21 | BND | hard | clean — three distinct failures, genuinely subtle trap |
| 22 | FSS | hard | explanation mispairs prepositions, miscalls "would be" present (MINOR) |
| 23 | TRN | med | clean — four distinct relationships |
| 24 | TRN | med | clean — "for instance" correctly dead against the immediately prior sentence |
| 25 | TRN | hard | surface cue "the two measurements" (MINOR) + paired explanation (MINOR) |
| 26 | RS | med | clean — audience condition correctly asymmetric |
| 27 | RS | med | clean — all four options factually accurate about the notes |

---

## Applying the fixes

Every `fix.newValue` in `CRITIC_M2.json` is literal replacement text. Three pairs must be applied
together, and this is stated in each `finding` string:

- **Q4** passage fix + Q4 explanation fix (the explanation quotes the revised passage).
- **Q19** options fix + Q19 explanation fix (the explanation rebuts the revised options).
- **Q25** passage fix + Q25 explanation fix (the explanation quotes the revised final sentence).

No fix changes a keyed index. `correctAnswer` for Q4 stays 2, Q14 stays 1, Q19 stays 0, Q25 stays
3. All replacement passages were checked against their skill word band, blank count (exactly one
`______`), and underline-marker count (zero); no fix touches Q10 or Q11, so the graphic markup is
untouched and remains DOMPurify-safe. All replacement explanations are single plain-text
paragraphs of 205–300 words and begin literally with `Choice {KEY}`.
