# Practice Test 9 RW — Module 2 — Hostile Item Review

Reviewer protocol: each item answered cold before reading the key or explanation; then key attacked,
each distractor attacked, grammar/logic verified against `03_conventions_transitions.md`, facts checked
against the real world, SVG geometry parsed and rendered, difficulty audited.

Machine baseline: `node scripts/validatePracticeTest9RW.js` → **0 errors, 0 warnings**. Blueprint
skill/difficulty ladder matches `00_BLUEPRINT_TEST9.md` slot-for-slot. Max same-letter run 2.
Key distribution A6/B7/C7/D7. No passage pair exceeds Jaccard 0.20 (threshold 0.52).
Everything below is editorial, not schema.

**Severity key**
- **MAJOR** — must not ship: broken key, two defensible answers, self-contradictory passage, or a
  claim a knowledgeable reader recognises as false.
- **MINOR** — should be fixed: over-reaching key language, soft distractor pull, factual overstatement,
  build-hygiene inconsistency.
- **PASS** — I could not break it.

---

## Verdict table

| # | Skill | Diff | Key | Verdict |
|---|---|---|---|---|
| 1 | words-in-context | easy | C | PASS |
| 2 | words-in-context | medium | A | PASS |
| 3 | words-in-context | medium | A | PASS |
| 4 | words-in-context | hard | B | PASS |
| 5 | text-structure-purpose | medium | D | **MAJOR** |
| 6 | text-structure-purpose | hard | A | PASS |
| 7 | cross-text-connections | hard | C | MINOR |
| 8 | central-ideas-details | easy | B | PASS |
| 9 | central-ideas-details | medium | D | MINOR |
| 10 | command-of-evidence (bar) | easy | B | MINOR |
| 11 | command-of-evidence (line) | medium | C | MINOR |
| 12 | command-of-evidence | hard | A | PASS |
| 13 | inferences | medium | D | PASS |
| 14 | inferences | hard | B | PASS |
| 15 | form-structure-sense | easy | B | PASS |
| 16 | boundaries | easy | C | PASS |
| 17 | form-structure-sense | medium | D | PASS |
| 18 | boundaries | medium | B | PASS |
| 19 | form-structure-sense | medium | D | PASS |
| 20 | boundaries | hard | C | PASS |
| 21 | boundaries | hard | D | PASS |
| 22 | transitions | easy | A | **MAJOR** |
| 23 | transitions | medium | C | PASS |
| 24 | transitions | hard | B | MINOR |
| 25 | rhetorical-synthesis | easy | D | PASS |
| 26 | rhetorical-synthesis | medium | A | PASS |
| 27 | rhetorical-synthesis | hard | C | MINOR |

**Totals: 2 MAJOR · 5 MINOR · 20 PASS.** No item has two defensible answers.

---

# MAJOR defects

## Q5 — self-contradictory premise (museum labels)

**Cold answer:** D. Key D. Agreed — no rival option.

**Defect.** Sentence 1 states a *universal* replacement:

> "When the Ashgrove Museum reinstalled its collection of hand tools in 2019, it replaced the single
> identifying label beneath **each object** with a short paragraph…"

Sentence 3 then requires that un-replaced labels still exist:

> "Visitors stopped for an average of 41 seconds at the rewritten cases and 12 seconds at **cases
> still carrying the old labels**…"

If every label in the hand-tool collection was replaced, the comparison group cannot exist inside that
collection. The only escape reading — that the forty cases span *other* departments — is worse, because
then the 41 s vs 12 s contrast is confounded by subject matter rather than by label style, and the
closing inference ("a museum can admit the gaps in its own records without losing the visitor's
attention") no longer follows from the data. Either way the study described is incoherent, in an item
whose entire purpose is that a measurement was made and a conclusion drawn from it. Distractor C
("…the labels in **one part** of a museum's permanent collection") already presupposes a partial
rewrite, confirming the passage was drafted with a partial rewrite in mind.

This does not create a second defensible answer, but a self-contradicting stimulus is a publication
blocker on a reading test.

**Fix — replace sentence 1 (`passage`):**

> When the Ashgrove Museum reinstalled **half of** its collection of hand tools in 2019, it replaced
> the single identifying label beneath each object **it rehoused** with a short paragraph that named
> the maker where a maker was known and said plainly where the record was silent.

**Optional reinforcement — replace sentence 2:**

> Curator Hana Sedláčková and her colleagues then timed visitors at forty cases**, twenty of each kind**.

Word count 114 → 118 (or 122 with both); ceiling is 150, TSP minimum 75. No option or explanation text
changes; choice C's "one part" now reads as an accurate-but-off-goal description, which is what it was
designed to be.

## Q22 — counterfactual biology (lake trout)

**Cold answer:** A ("Subsequently,"). Key A. The transition itself is unbreakable: sentence 2 is a dated
event, sentence 3 reports counts made afterward; the three distractors sit in example / similarity /
contrast, none of them temporal. **The key is sound. The passage is not.**

**Defect.**

> "A mill weir stood for sixty years across the only cold tributary feeding a large lowland reservoir,
> blocking the **lake trout that spawn on gravel upstream**."

Two separate errors about a real species:

1. **Lake trout (*Salvelinus namaycush*) are not adfluvial.** They spawn in autumn on wave-washed
   rocky/cobble shoals *within lakes*, at depths of a few metres; unlike most other freshwater
   salmonids they do not run up tributaries. River spawning is documented but described in the
   literature as very rare and exceptional (e.g. the Lower Niagara River population). A weir on a
   tributary is not what limits a lake trout population.
2. **Habitat mismatch.** Lake trout are stenothermic deepwater fish requiring cold, well-oxygenated
   water. A "large lowland reservoir" whose *only* cold inflow is one tributary is, by the passage's
   own construction, not lake trout water.

The blueprint's hard prohibition — "No factual claim that a knowledgeable reader would recognize as
false about the real world" — is violated. Note also the internal contrast: Q27 gets the parallel
biology exactly right (lake whitefish spawning in November on a gravel shoal *in* the reservoir).

**Fix — one word in `passage`:**

> …blocking the **brook** trout that spawn on gravel upstream.

**And one word in `explanation`:**

> …a mill weir kept the reservoir's **brook** trout from their spawning gravel for sixty years…

Brook trout (*S. fontinalis*) are autumn gravel-redd spawners that ascend cold tributaries, and
adfluvial populations holding in a larger downstream water body are ordinary. Every other sentence —
weir removal 2016, counts of spawning trout above the old dam site over four seasons — becomes
correct unchanged. "brook trout" does not appear in `/tmp/avoid_names.txt`.

---

# MINOR defects

## Q7 — key over-reaches Text 2's evidence (cross-text, Verstad particle)

**Cold answer:** C. Key C. C is the only survivable option — but its second half claims more than Text 2
establishes.

**Defect (a) — option C.** "…but denying that it entered the town **from outside**." Text 2 shows the
particle in verbatim court testimony from the 1870s, i.e. *before broadcasting*; that refutes
Terauchi's stated vector, not external origin as such. Worse, Text 2's own qualifier — the particle
runs through those volumes "almost only in the testimony of **fishing crews**" — is at least as
consistent with an external maritime introduction as with an indigenous feature. The key therefore
asks the student to endorse a denial that Text 2's evidence does not support (and mildly cuts against).
The item survives only because a reader glosses "import" by Text 1's own colon.

**Defect (b) — explanation.** "…since **through the twentieth century** it turns up in families joined
by marriage…" Text 2 says only "**later** turns up". The rationale supplies a timeframe the stimulus
does not contain.

**Fix — replace `options[2]`:**

> By agreeing that the particle has been spreading through Verstad but denying that broadcasting
> brought it into the town

(Stays clearly distinct from D, which asserts broadcasting *did* carry it beyond the crews and is
killed by "whether or not anyone in them owned a receiver." Side benefit: option lengths become
131/127/117/143, so the key is no longer near-longest.)

**Fix — two edits in `explanation`:**

- "since **through the twentieth century** it turns up in families" → "since **it later** turns up in families"
- "…while denying that **it arrived from outside**." → "…while denying that **broadcasting brought it into the town**."

## Q9 — topic and name collision with Q3

**Cold answer:** D. Key D. Unbreakable: A is correctly disqualified (mound *size* was read as evidence
of *duration*, not of *quantity*), B and C are unsupported. The stem `Based on the text, what can be
concluded about X?` is a legitimate official Central Ideas and Details "inferential detail" stem
(20+ official items) despite not appearing in the abbreviated table in `05_SCHEMA_RULES.md` — **not**
a defect.

**Defect — texture.** Q3 and Q9 are both West African iron-smelting passages set in "the **savanna
belt**", both crediting an invented Sahelian archaeologist, and the two surnames are near-homographs:

- Q3 "archaeometallurgist **Ousmane Sanogo**", "Smelters in the **savanna belt** of the western Sahel"
- Q9 "Archaeologist **Idrissa Sawadogo**", "among the largest in the **savanna belt**"

Jaccard is only 0.142 so the duplicate-passage gate does not fire, but six items apart a student
reasonably wonders whether these are the same site and the same researcher. Sa-n-o-go / Sa-w-a-do-go
is a gratuitous confusion.

**Fix — two edits in Q9 `passage`:**

- "are among the largest in the **savanna belt**" → "are among the largest in the **middle Niger valley**"
- "Archaeologist Idrissa **Sawadogo**" → "Archaeologist Idrissa **Diarra**"

**And in Q9 `explanation`:** "**Sawadogo**'s dates" → "**Diarra**'s dates" (2 occurrences: opening
sentence and choice-A rationale).

"Diarra" is absent from `/tmp/avoid_names.txt`.

## Q10 — SVG passes every graphic check; build-hygiene only

**Cold answer:** B. Key B. Correct and unique.

**Graphic audit — all clean.** Scale is `value = (260 − y) × 5`; every bar was parsed:

| Department | On display (top / height / printed) | In storage (top / height / printed) |
|---|---|---|
| Ceramics | 320 / 320 / **320** | 740 / 740 / **740** |
| Textiles | 180 / 180 / **180** | 900 / 900 / **900** |
| Metalwork | 260 / 260 / **260** | 480 / 480 / **480** |
| Prints | 140 / 140 / **140** | 620 / 620 / **620** |

Every bar's baseline sits exactly on y = 260; drawn height, drawn top edge and printed data label agree
to the unit in all eight bars. Gridlines and labels at 0/200/400/600/800/1,000 are present, axis titles
("Department", "Number of objects") present, legend present, category labels centred on each pair, all
content inside `viewBox 0 0 520 335`. Rendered to PNG and inspected: no clipping, no overlap.
Distractors are real values read from the wrong category (480 metalwork, 900 textiles, 620 prints) —
exactly the official easy-quantitative build, no fabricated numbers. Difficulty "easy" is honest: the
discriminating value is printed on the bar.

**Defect.** The passage string glues prose directly onto the closing tag:

> `…In storage</svg>The Halstow Museum publishes a yearly count…`

M1 Q11, the form's only other graphic item, uses `</table>\n\nA student is writing…`. Two different
conventions in one form is a rendering risk if the passage is paragraph-split on `\n\n` or displayed
with `white-space: pre-wrap`.

**Fix:** insert a blank line between `</svg>` and `The Halstow Museum` in Q10's `passage`
(i.e. `…</svg>\n\nThe Halstow Museum publishes…`).

## Q11 — chart is exact, but the stated conclusion is looser than the keyed data

**Cold answer:** C. Key C. No rival — A is one-armed, B swaps the series, D is a real but inert
observation.

**Graphic audit — all clean.** Scale `value = −(y − 50)/20`, `year = 2005 + (x − 90)·3/80`:

| Year | Sarybel (bare ice) | Kuzgun (debris) | gap |
|---|---|---|---|
| 2005 | 0 | 0 | 0 |
| 2008 | −1.5 | −0.5 | 1.0 |
| 2011 | −3.0 | −1.0 | 2.0 |
| 2014 | −4.5 | −2.0 | 2.5 |
| 2017 | −6.5 | −3.0 | 3.5 |
| 2020 | −9.0 | −4.0 | 5.0 |

Every number in the explanation is reproduced by the geometry: −1.5 vs −0.5 in 2008 (gap ≈ 1 m) and
−9 vs −4 in 2020 (gap ≈ 5 m). Half-metre readings sit exactly midway between whole-metre gridlines, so
they are readable. Distractor A quotes Kuzgun's true 2017/2020 values; distractor B quotes the true
2020 values with the series swapped; distractor D is literally true at every plotted year (minimum
gap 1.0 m, in 2008). Axis ticks 2005–2020 at 3-year intervals, whole-metre labels 0 to −10, both axis
titles, `<title>`, `<desc>`, `role="img"`, `data-graph-type="line"` all present; rendered and inspected,
no clipping. **No mismatch between drawn geometry and explanation.**

**Defect (a) — the claim the data are asked to support.**

> "Abenov concluded that the shelter the debris affords has **counted for more as the years have
> passed**, noting that ______"

A *cumulative* gap widens whenever one glacier loses more per year than the other — even if the
protective effect is perfectly constant. So "the gap grew from ~1 m to ~5 m" does not by itself show
that the shelter mattered *more* over time. The chart in fact shows the 3-year increment in the gap as
1.0, 1.0, **0.5**, 1.0, 1.5 — non-monotone, i.e. the protective effect does *not* strictly strengthen.
The item survives on the reading "counted for more" = "amounted to more", which is legitimate but is
precisely the ambiguity a hostile reviewer would exploit, and it also weakens the intended contrast
with distractor D.

**Fix — replace the final clause of `passage`:**

> Abenov concluded that **the debris has saved the Kuzgun a steadily larger quantity of ice**, noting that ______

**And the opening of `explanation`:**

> Choice C is correct. Abenov concluded that **the debris has saved the Kuzgun a steadily larger
> quantity of ice**, so the data that complete the statement must show the difference between the two
> glaciers widening rather than merely existing. …

(Rest of the explanation is unchanged and remains accurate.) This wording is what a growing cumulative
gap actually licenses, keeps D inert, and avoids handing the student the words "gap … grew".

**Defect (b).** Same missing `\n\n` after `</svg>` as Q10. **Fix:** `…</svg>\n\nRock debris lying on…`.

Underlying science checks out: thin debris (< ~2 cm) enhances melt, thicker debris insulates — the
passage says "more than a few centimeters thick slows melting considerably", which is correct.

## Q24 — melatonin magnitude overstated, and "In addition" retains pull

**Cold answer:** B ("Indeed,"). Key B. I did not switch, but this was the only item in the module where
I had to argue myself out of a distractor.

**Defect (a) — factual overstatement.** "The nightly rise of melatonin … comes **hours** later during
puberty than in childhood." The pubertal DLMO/SCN phase delay is on the order of **1–3 hours**; plural
"hours" implies ≥ 2 and sits at the top of the range as though it were typical.

**Defect (b) — distractor pull.** For "Indeed" the third sentence must *confirm and intensify* the
second. Official emphasis items do this by supplying the concrete substantiation of the very claim just
made ("…mark these gigantic jets as outliers; **indeed,** the majority of jets reach heights of only
20 to 50 km"). Here sentence 3 is a *different line of evidence* (a behavioural free-running result)
bearing on the same thesis rather than on the melatonin claim itself — which is the definition of
addition. The option set is otherwise textbook: EMPHASIS keys are paired with an ADDITION distractor
in 9 of 13 official items, so "In addition," belongs in the set; it just needs to be killable.

**Fix — replace sentences 2 and 3 of `passage`:**

> The nightly rise of melatonin, the hormone that signals the body to sleep, comes **as much as two
> hours** later during puberty than in childhood. ______ **the delay persists in** teenagers housed for
> a week without clocks or class schedules.

Because "the delay" is anaphoric to sentence 2's delay, sentence 3 can no longer be read as a separate
point — "In addition, the delay persists…" is incoherent — while "Indeed, the delay persists…" is
exactly the emphasis move. Word count 58 → 56, inside the 42–62 transitions band.

**And in `explanation`, sentence 3:**

> The sentence with the blank presses that fact harder, reporting that **the same delay persists in**
> teenagers kept for a week without clocks or class schedules.

## Q27 — duplicate given name inside the module

**Cold answer:** C. Key C. Item is clean: A reports method/result without significance, B gives
significance for habitat rather than for the quota, D gives the quota basis without the finding —
the official "accurate about the notes, fails only on goal fit" build, with no
"inaccurate/misstates/distorts" language anywhere. Whitefish biology (November spawning on gravel
shoals, egg-net survey, quota from spawner counts) is correct.

**Defect.** "fisheries biologist **Zofia** Wierzbicka" reuses the given name of Module 2's own Q1
author, "**Zofia** Halewska". Two Zofias in a 27-item module reads as authoring carelessness.

**Fix — one word in bullet 3 of `passage`:**

> In 2023 fisheries biologist **Danuta** Wierzbicka towed an egg net across four other shallow reefs.

"Zofia" occurs once in this item; the stem, options and explanation use the surname only, so no other
edit is needed. "Danuta" is absent from `/tmp/avoid_names.txt`.

---

# PASS items — what I tried and why it failed

**Q1 (wanted = Lacked).** Attacked with the personification reading of "Desired"; killed by the
itemised contents and by the closing paraphrase "what was missing would not appear on any list."
"Requested"/"Anticipated" are definition-misfits that pass the gloss test. No blank is correct here —
the validator explicitly exempts "As used in the text" items, so the flat rule in
`05_SCHEMA_RULES.md` is what is imprecise, not the item. Difficulty: "easy" is a shade generous for an
archaic sense, but the passage supplies a near-synonym in the same paragraph.

**Q2 (compressed).** "staggered" is the near-opposite and is exactly what the text attributes to *other*
songbirds; "variable" fails because the text reports one consistent pattern; "deliberate" fails on both
of its senses. "Compressed molt" is the field's own idiom. The species is invented, so the unusual
simultaneous wing moult is fiction, not counterfactual — the general claim made about real songbirds
(sequential replacement, wing stays serviceable) is accurate.

**Q3 (conservative).** Post-colon gloss "a design settled early and handed on without material change"
fixes the blank. Termite-mound clay as furnace fabric in West African smelting is real.

**Q4 (recommendation).** Tried hardest to defend "shortcut" — dead, because the sentence is explicitly
"not a saving of effort but a ___" and Karabulut has just rejected the effort account. "Constraint"
dies on "either group may switch at any time"; "subsidy" dies on the absence of any payment. The
auto-enrolment participation gap and the implied-endorsement account of defaults are both real.

**Q6 (glaciology structure).** Fact-checked hard because it is the flagged item: meltwater lubrication
→ early-season speed-up → melt cuts efficient channels → late-summer slowdown relative to a cool year →
near-cancellation over a full year is exactly the modern channelisation result, not a garbled version
of it. Structurally, B invents competing explanations and an extension that do not exist, C invents a
methodological limitation, D invents an error in earlier work; A is the only skeleton the text has.
All four options obey the `It` + verb rule and the key is not the longest.

**Q8 (fourth chair).** Classic detail-vs-main-idea: C is true but is one detail; A reverses the text;
D imports a fifth chair. B is what the closing line states outright.

**Q12 (quotation illustration).** Three-part claim; A alone satisfies all three (settled practice →
new practice, no motive, flat register). C is the strongest distractor — it nails the register — but
mentions neither the employer nor any change.

**Q13 (migratory timing).** Common-garden design with two explicit exclusion clauses ("day length …
held constant and no adult of the species was present" kills C; "so the difference is not one of
condition" kills A). B invents a time series. Exactly the official inferences architecture.

**Q14 (utility bills).** Best-built item in the module. 2×2 with cells (bill,bar) = −2%, (slip,bar) = 0,
(bill,number) = −2%; B is entailed. The follow-up-survey sentence exists solely to kill A, which is the
spec's exclusion-clause rule executed properly. C is refuted by group 3, D by the absence of any
within-group breakdown. The ~2% magnitude matches the real home-energy-report literature. The absence
of an untreated control does not touch B, which rests on the group-2/group-3 contrast.

**Q15 (its flanks).** No noun follows the blank, so both apostrophe-after-flanks options are dead and
"it's" cannot be a possessive determiner. Matches official F05.

**Q16 (indirect question).** Verified against official rule **B11**, which is the one boundaries rule
where CB *does* vary word order across options (word order × terminal mark, 2×2). Q16 is a structural
clone of official item `a7c85001`. All 8 official B11 items are Easy — the "easy" label is honest.

**Q17 (protect).** Official F01 executed to spec: plural subject, one intervening appositive in paired
commas planting a singular noun ("seed") immediately before the blank, all three distractors singular
varying only in aspect, options 1–2 words.

**Q18 (restrictive that).** "that" cannot head a non-restrictive clause, and without the clause the
sentence identifies no projection, so the comma is doubly wrong; the semicolon and the period both
require an independent clause that the string is not. Mercator (1569, rhumb lines straight) is correct
and correctly left unnamed.

**Q19 (dangling modifier).** Official F06 executed to spec — the three distractors are exactly the
prescribed trio: an **expletive** (A "there is"), a **passive** (B "are recorded by"), and a
**nominalisation** (C "the recording of"). D is the only option that puts the designed thing in
subject position.

**Q20 (semicolons in a complex series) — checked with particular care.** Full sentence with the key:
"…three obstacles at once: interference from FM broadcasts, which sit squarely in the band of interest;
ionospheric turbulence, which smears a source's apparent position**;** and the volume of raw data,
which must be reduced in real time." Correct: every item carries an internal comma, so semicolons must
separate, including before the final "and". **Option B (comma) is not defensible under any editorial
style** — it mixes a semicolon and a comma as separators of the same series and re-opens exactly the
ambiguity the semicolons resolve ("turbulence smears the position, and the volume of raw data"). A
leaves the second and third obstacles fused. D nests a colon inside a list a colon has already
introduced. I also checked the option-architecture note in `05_SCHEMA_RULES.md` that forbids a colon
distractor when the key is a semicolon: that rule is derived from two-independent-clause items, and
official B08 item `c04e9136` (Hard) uses precisely `Stanford / Stanford, / Stanford: / Stanford;` —
so Q20's sweep is a verbatim official shape. 5 of 6 official B08 items are Hard; the label is honest.
Radio-astronomy facts (FM RFI inside the low band, ionospheric position smearing, real-time data
reduction) are all correct.

**Q21 (colon before an explanation) — checked with particular care.** "…depended on one cheap
material**:** a white clay slip thin enough to be stamped, brushed, or poured over a darker body."
Independent clause + colon + appositive noun phrase: correct. Period and semicolon both strand a
verbless noun phrase as a fragment; bare juxtaposition gives no signal at all. **The one mark that
would also be acceptable — a comma before an appositive — is deliberately not in the option set**,
which is what makes the key unique; had a comma been offered this would be a MAJOR. Option shape is a
verbatim clone of official B06 item `c468db1c` (`plant. / plant; / plant / plant:`), and all 8 official
B06 items are Hard, so the "hard" label is honest rather than inflated. Buncheong facts (fifteenth-
century Korean stoneware, white slip stamped/brushed/poured over a darker body) are correct.

**Q23 (Moreover).** Second, separate capability of the same instrument = addition. "In other words"
requires no new information, "Specifically" requires the same proposition at higher resolution,
"Nevertheless" requires an obstacle — three different relations, none of them addition. InSAR
pre-eruptive inflation and co-eruptive deflation are both real.

**Q25 (portolan / Ming).** Only D names both traditions; A and B are single-tradition, C emphasises a
difference. Notes are accurate about both map traditions.

**Q26 (onggi walls).** Compound goal (describe the walls **and** orient an unfamiliar reader). C is the
strongest distractor — it describes the walls better than the key does — but never says what an onggi
is, and opens with "the fired wall of **the jar**" with no antecedent. This is the one item where a
determined student could argue taste rather than logic; I judge it sound because CB's compound-goal
items are decided on the goal clause read whole. Key is 181 chars against 171 for C, i.e. padded to
spec. Onggi facts (coarse body, air-permeable but liquid-tight wall, coil-and-paddle construction,
jangdokdae) are correct.

---

# Cross-item observations (not defects)

- **No length cue.** Key is uniquely longest in 4 of 13 long-option items (Q11 +1 char, Q25 +5, Q26 +10,
  Q27 +1). Every margin is imperceptible; the rhetorical-synthesis distractors are padded as the spec
  requires. Not exploitable.
- **Topic doubling in the SEC/EOI half is structural, not sloppy:** 13 items drawn from the 8 allotted
  topics forces five reuses (volcanology Q15/Q23, sleep science Q16/Q24, cartography Q18/Q25, Korean
  ceramics Q21/Q26, freshwater fisheries Q22/Q27). The most conspicuous pair is Q22/Q27 — two passages
  about fish spawning on gravel in a reservoir, five items apart, Jaccard 0.193. Well under the 0.52
  gate, but if any reshuffling happens anyway, separating those two would help.
- **Transitions distractor `For example,` at Q22** is not engineered per the spec note ("never include
  *for example* unless the preceding sentence is a general claim the blank sentence does not
  instantiate") — the preceding sentence is a dated event, so the distractor is trivially wrong. Fine
  for the block's easy slot; worth knowing it carries no pull.
- **Blueprint arithmetic error, not an item error:** `00_BLUEPRINT_TEST9.md` states Module 2 totals as
  "5 easy / 14 medium / 8 hard", but its own per-item table sums to 7/11/9, which is what the JSON
  contains and what the validator accepts. Fix the blueprint line, not the items.
