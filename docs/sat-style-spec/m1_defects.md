# Practice Test 9 RW — Module 1 — Hostile Item Review

Source: `scripts/data/practiceTest9RW.json` → `modules[0].questions` (27 items)
Reference: `spec/05_SCHEMA_RULES.md`, `spec/03_conventions_transitions.md`, `spec/04_reading_distractors.md`,
`spec/02_stimulus_texture.md`, `spec/00_BLUEPRINT_TEST9.md`

Protocol per item: (1) answer cold, (2) attack the key, (3) disqualify each distractor in one
sentence and judge whether the disqualifier is available in the passage, (4) grammar/logic,
(5) fact check against the real world and for internal consistency, (6) difficulty audit.

Severity: **MAJOR** = the item as shipped is broken or has a second defensible answer.
**MINOR** = a real but repairable leak. **PASS** = nothing I could break. Where an objection is
a matter of taste rather than a defect I say so explicitly.

---

## Verdict table

| # | Skill | Diff | Key | Verdict | One-line reason |
|---|---|---|---|---|---|
| 1 | words-in-context | easy | A | PASS | — |
| 2 | words-in-context | easy | D | MINOR | ceramic film on *steel* cycled to 900 °C with zero cracking is a materials-science stretch |
| 3 | words-in-context | medium | A | MINOR | "a measurable fraction … each year" is off by ~7 orders of magnitude; decay mechanism loosely stated |
| 4 | words-in-context | medium | D | MINOR | passage calls the fund "the strike fund," which pre-loads the reading the item then overturns |
| 5 | words-in-context | hard | B | MINOR | not hard: all three distractors die on the sentence immediately before the blank |
| 6 | text-structure-purpose | medium | D | MINOR | key is the uniquely longest option by 2+ words; pad a distractor |
| 7 | text-structure-purpose | hard | C | PASS | — |
| 8 | cross-text-connections | hard | A | PASS | — |
| 9 | central-ideas-details | easy | C | MINOR | key says the scheme "failed to serve the owners' aim," but the aim the passage states (raise output) was met |
| 10 | central-ideas-details | medium | B | PASS | — |
| 11 | command-of-evidence | easy | D | MINOR | "local" for a union branch is a North-American term in an explicitly British 1895 setting |
| 12 | command-of-evidence | medium | A | MINOR | "In the passage below" — there is no passage below; the options are four quotations from different scenes |
| 13 | command-of-evidence | hard | C | MINOR | not hard: the key is the only option containing the phrase "grain boundaries" |
| 14 | inferences | hard | B | MINOR | key asserts *exchange*; the data entail only *long-distance connection* (direct procurement is not excluded) |
| 15 | form-structure-sense | easy | B | PASS | — |
| 16 | boundaries | easy | C | PASS | — |
| 17 | form-structure-sense | easy | A | MINOR | the explanation's disqualifier for "it" is wrong, and it leaves "collection" as an unaddressed antecedent |
| 18 | boundaries | medium | D | MINOR | the rationale for C rests on clause *length*, implying the rule is soft |
| 19 | form-structure-sense | medium | B | **MAJOR** | **the noun "grains" is missing from the passage**; sentence is ungrammatical under all four options and the trap is deleted |
| 20 | boundaries | medium | D | **MAJOR** | **"steady" appears in both the option and the passage** → "at once: steady steady time" |
| 21 | form-structure-sense | hard | C | PASS | — |
| 22 | boundaries | hard | B | PASS | — |
| 23 | transitions | easy | B | MINOR | "Meanwhile," is a dead slot; no contrast-family distractor, contra the modal architecture |
| 24 | transitions | medium | D | MINOR | linen does shrink measurably on a first hot wash; "very nearly the size it went in" overclaims |
| 25 | transitions | hard | C | MINOR | not hard: "Consequently" is the only causal option and the sentence is visibly a conclusion |
| 26 | rhetorical-synthesis | medium | A | PASS | (difficulty sits at the easy end of medium — noted, not a defect) |
| 27 | rhetorical-synthesis | hard | C | MINOR | A and D fail on the *identical* ground; one of the four slots is duplicated |

**Totals: 2 MAJOR · 17 MINOR · 8 PASS.**
Both MAJORs are single-word text errors with trivial fixes. Neither creates a second defensible
answer; each makes the printed item unanswerable-as-written.

---

## Module-level checks (all clean unless noted)

- **Schema (machine-checkable):** 27/27 pass. 4 distinct non-prefixed non-HTML options; `correctAnswer`
  in range; `acceptedAnswers` null throughout; every explanation opens `Choice X` with the correct
  letter and runs 612–1151 chars (min 120); no "tricky", "trap", or second-person address; all
  passages ≤150 words and above the per-skill minimum; blank counts correct (1 where required
  including the quantitative CoE item, 0 elsewhere); `[UNDERLINED]` appears on exactly one item
  (Q8, cross-text, one non-empty span, stem says "underlined claim"); Q11's `<table>` has real
  `<th>`/`<td>` and a `<caption>` and is DOMPurify-safe; `subcategoryId` correct on all 27.
- **Verbatim stems:** all 27 match the mandated boilerplate exactly.
- **Blueprint conformance:** domain order C&S(1–8) → I&I(9–14) → SEC(15–22) → EOI(23–27); SEC opens
  form-structure-sense (Q15) and closes boundaries (Q22) and is interleaved; difficulty is monotone
  non-decreasing inside every skill block and across the whole SEC block. Literary preambles appear
  only at Q5 and Q7, and Q7 is the poem. Correct.
- **Answer key:** A×6, B×7, C×7, D×7. Longest same-letter run is 2 (Q14–15, Q22–23). Well inside spec.
- **Length cue:** the key is the uniquely longest option on 2 of the 10 long-option items (Q6, Q12).
  Spec permits up to half. Q6 is the more visible of the two — see Q6.
- **Near-duplication:** highest pairwise passage Jaccard is 0.163 (Q26 vs Q27). Threshold 0.52. Clean.
- **Register:** 2 semicolons in ~2,100 words of stimulus prose (spec: ~1.07/1,000). Parenthetical and
  appositive glosses used on qollqa, ropewalk, covert, sedums, creep. Matches the measured corpus.
- **Transitions architecture:** each item's three distractors come from three different relationship
  categories, none matching the key's; no conditional relationship is tested; every keyed transition
  is followed by a comma; no keyed transition repeats anywhere in the form. Correct.
- **Blueprint arithmetic error (not an item defect):** `00_BLUEPRINT_TEST9.md` states "Module 1
  difficulty totals: 6 easy / 15 medium / 6 hard," but its own per-item table — which the JSON
  follows exactly — sums to **8 easy / 10 medium / 9 hard**. The JSON is right; the blueprint's
  summary line is wrong and should be corrected so downstream QA does not chase a phantom mismatch.
- **Texture repetition (worth a look, not a defect):** Q5 (Mr. Bramber, 1868) and Q12 (Mr. Pardoe,
  1878) are both Victorian English gentlemen whose stated principle is contradicted by the act that
  follows — same century, same naming pattern, same ironic move, seven items apart. Q9 ("the port
  town of Calder Reach") and Q11 ("a British harbor town in the 1890s") are both late-Victorian
  British port-labour items and sit two apart. Q15 (truffle fungus) and Q23 (leaf endophyte fungus)
  are the module's two mycology stimuli. None of these trips the Jaccard rule; all are noticeable to
  a student reading the module end to end.

---

# Item-by-item

## Q1 — words-in-context, easy, key A (*diverse*) — **PASS**

**Cold answer:** A. Chose it before reading the key, in ~4 seconds.

**Attack on the key.** No rival survives. The stimulus supplies an explicit contrast marker ("by
contrast") and a numeric gloss on both sides — "only a handful of low grasses" vs. "dozens of
species at once." *Diverse* is the word for "dozens of species."

**Distractor disqualifiers.**
- B *sparse* — means thinly scattered; the text describes the uncut lots by species count, and it is
  the *mowed* lots that are thin. Disqualifier is in the passage.
- C *uniform* — means all of one kind; directly contradicted by "dozens of species."
- D *fragile* — means easily damaged; nothing in the text touches damage or persistence.

**Architecture.** Signature is {definition-misfit, polarity reversal, unsupported}. Fits the measured
mixed misfit+unsupported signature (04 §1.3). All four options single words, same register,
grammatically substitutable. Correct.

**Fact check.** Mowing frequency suppressing forb diversity in urban vacant lots is standard urban
ecology; nothing counterfactual. Name "Dilnoza Rakhimova" (Uzbek) is fine for the register.

**Difficulty.** Easy is right — this is a 5-second item and the blank sits in the last sentence with
the answer pre-glossed. No defect.

---

## Q2 — words-in-context, easy, key D (*durable*) — **MINOR**

**Cold answer:** D.

**Attack on the key.** None available. The colon gloss defines the target word ("lost less than one
percent of its thickness and showed no cracking at all").

**Distractor disqualifiers.**
- A *brittle* — polarity reversal; contradicted by "no cracking at all."
- B *reflective* — describes optical behaviour; the text measures thickness and cracks.
- C *lightweight* — describes weight; nothing about weight is reported.

All three fail the gloss test cleanly. No slot is wasted.

**Defect — materials-science plausibility (low severity).** A thin ceramic film on a **steel**
substrate, thermally cycled 300 times to **900 °C**, "showed no cracking at all." Heat-resistant
austenitic steels (310S, 253MA) do survive continuous service near 900 °C, so the claim is not
strictly counterfactual. But the coefficient-of-thermal-expansion mismatch between austenitic steel
(~18 × 10⁻⁶ /K) and a typical oxide ceramic (~8–10 × 10⁻⁶ /K) makes zero cracking after 300 full
cycles a result a coatings specialist would flag as extraordinary. The blueprint's rule is
"fictional but not counterfactual"; this sits at the edge.

**Fix (one word, in the passage).**
Replace `A team of engineers coated steel plates with a thin ceramic film`
with `A team of engineers coated heat-resistant alloy plates with a thin ceramic film`.
No other text changes; the explanation does not mention the substrate.

**Difficulty.** Easy is right.

---

## Q3 — words-in-context, medium, key A (*transient*) — **MINOR**

**Cold answer:** A.

**Attack on the key.** The one real candidate is **B *recurring***: planets are, in current models,
thought to acquire rings repeatedly from disrupted satellites, so a "recurring" feature is a live
idea in the field. The attack fails on the text, though — the dash gloss defines the slot as "one
that a planet acquires long after it forms **and then gradually loses**," a single arc with no
repetition. Key survives. This is the item's real discriminator and it is well built.

**Distractor disqualifiers.**
- B *recurring* — means happening again and again; the gloss describes one acquisition and one loss.
- C *original* — would mean present from formation; explicitly ruled out by "acquires long after it forms."
- D *conspicuous* — means easy to notice; the sentence is about duration, not visibility. (Topical
  associate: the text does say "bright." Legitimate D4 build.)

**Defect 1 — quantitatively wrong statement (real, low-moderate severity).** "A measurable fraction
of the ring falls onto the planet each year." Using Cassini's numbers: Saturn's ring mass ≈
1.5 × 10¹⁹ kg; ring-rain plus equatorial influx ≈ 10³–10⁴ kg s⁻¹, i.e. ~3 × 10¹¹ kg yr⁻¹. The annual
fraction is ~2 × 10⁻⁸ — precisely the number that makes the rings short-lived on geological
timescales, and precisely *not* a fraction anyone measures year over year. What is measurable is the
**flux**, not the annual fraction. A planetary scientist would call the sentence as written false.

**Defect 2 — mechanism loosely stated (taste-leaning).** "the resulting debris loses the energy that
keeps it in orbit." The dominant ring-loss channels are electromagnetic (charged grains guided down
field lines) and meteoroid-impact ballistic transport, not a generic energy loss. Not wrong enough
to be called false, but imprecise in a passage whose whole point is a physical mechanism.

**Fix (one sentence, in the passage).**
Replace `and the resulting debris loses the energy that keeps it in orbit. A measurable fraction of the ring falls onto the planet each year.`
with `and the resulting debris spirals inward. Measurable quantities of ring material fall onto the planet every year.`
This leaves the argument, the gloss, and all four options untouched, and the explanation's phrase
"the text describes rings as steadily losing material" still holds verbatim.

**Difficulty.** Medium is right: *recurring* is a genuine near-miss that has to be killed on the gloss.

---

## Q4 — words-in-context, medium, key D (*safeguard*) — **MINOR**

**Cold answer:** D.

**Attack on the key.** No rival. The frame "less as a weapon than as a ______" demands the antonym of
*weapon* in the fund's own terms, and the ledger evidence (sick and injury payments) supplies it.

**Distractor disqualifiers.**
- A *windfall* — an unexpected piece of good fortune; the payments are the fund's routine business
  across a decade.
- B *luxury* — desirable but not needed; recipients were ill or burned.
- C *formality* — done for form's sake without effect; contradicted by "most of what the fund paid out."

Three clean definition-misfits, matching the modal WIC signature. No wasted slot.

**Defect — the passage names the fund in a way that begs its own question (low severity).** The
stimulus opens "Historians have long treated **the strike fund** of the Redmarch Glassworkers'
Mutual Association as a war chest." If the fund is *called* the strike fund in the author's own
narration, then the ledgers do not show that historians mis-read it — they show that the union
misnamed its own account. The intended structure is: neutral object → historians' interpretation →
contrary evidence. As written, the historians' interpretation is smuggled into the object's name.

**Fix (two words, in the passage).**
Replace `Historians have long treated the strike fund of the Redmarch Glassworkers' Mutual Association as a war chest`
with `Historians have long treated the reserve fund of the Redmarch Glassworkers' Mutual Association as a war chest`.
No option, stem, or explanation text depends on the word "strike."

**Fact check.** Nineteenth-century trade-union mutual funds did in fact spend the great majority of
their outlays on sickness, accident, superannuation and funeral benefit rather than dispute pay —
this is well documented for British craft unions of the 1870s–90s. Furnace burns in glassworks:
correct occupational hazard. No factual problem.

**Difficulty.** Medium is right — the answer requires reading the ledger sentence *and* the
weapon/safeguard antithesis.

---

## Q5 — words-in-context, hard, key B (*calculated*) — **MINOR**

**Cold answer:** B, in about 10 seconds, reading only the last two sentences.

**Attack on the key.** None succeeds. "He had got everything he came for, and no one could recall his
asking for it" plus "the family understood too late" fixes the word as purposive.

**Distractor disqualifiers.**
- A *spontaneous* — unplanned; contradicted by the engineered outcome.
- C *uncharacteristic* — unlike a person's usual behaviour; the text opens "Mr. Bramber **had a
  manner**," i.e. this is his standing manner, and no other occasion is given.
- D *unrewarded* — brings no return; contradicted by the clause immediately preceding the blank.

**Defect — difficulty is overstated, and D is a wasted slot (real, moderate severity for the
ladder).** D is killed by the sentence directly before the blank, in the same breath. A is killed by
the same sentence. C is killed by the first six words of the passage. A median student solves this by
elimination well inside 15 seconds, which is not what "hard" should mean at the top of the
words-in-context block — this slot carries the block's ceiling and the ladder depends on it.

**Fix (one option).** Replace option D `unrewarded` with `perfunctory`.
*Why this works:* "perfunctory" (= done merely as a duty, without care or interest) is a genuine
lure — a student who reads Bramber's soup-and-weather flattery as mechanical will reach for it —
and it is cleanly disqualified by the passage, which shows his courtesy as *effortful and
individually aimed* ("the late Mr. Enderby's judgment"; agreeing with Mrs. Enderby and then
explaining "in the gentlest voice imaginable"). It is a common word used precisely, per the WIC key
architecture, and it does not overlap *calculated*.

**Matching explanation fix.** Replace the final sentence of the explanation
`Choice D (unrewarded) is incorrect because it means bringing no return, which the text contradicts in reporting that Bramber got everything he came for.`
with
`Choice D (perfunctory) is incorrect because it means done merely as a duty and without care, and the text shows the opposite: Bramber's attentions are particular and sustained, praising the soup, the weather, and the late Mr. Enderby's judgment, and taking Mrs. Enderby's objection seriously enough to answer it in the gentlest voice imaginable.`

**Fact check / schema.** Literary preamble matches the corpus template and carries the permitted
one-sentence orienting gloss. 113 words is above the measured WIC p90 (79) but under the 150 cap and
consistent with literary WIC stimuli. Nothing counterfactual.

---

## Q6 — text-structure-purpose (purpose), medium, key D — **MINOR**

**Cold answer:** D.

**Attack on the key.** The only candidate is **C** ("To argue that tubers were more important than
maize in the diet…"). It fails: the text is about what the *storehouses held*, and Callisaya's
proposal is about who the stores fed, not about relative dietary importance. Nothing in the text
compares tubers and maize as diet components. Key survives, and D's wording ("evidence … that leads
a researcher to revise a common assumption about their use") tracks the passage's three moves
exactly.

**Distractor disqualifiers.**
- A — the colonial documents are named only as the source of the older view; the text never assesses them.
- B — recovery methods are compressed into one clause and never explained.
- C — as above.

All three disqualifiers are recoverable from the passage. All four options open `To` + infinitive,
per the measured main-purpose option grammar.

**Defect — length cue (real, low severity).** Option lengths are A 15 / B 17 / C 18 / **D 20**. The
key is the uniquely longest and the gap to second place is two words. The form-level rule in
05_SCHEMA_RULES is satisfied (2 of 10 long-option items), but on this item alone the cue is visible.

**Fix (pad option A to match).**
Replace `To evaluate the colonial documents that historians have relied on in describing highland Andean storehouses`
with `To evaluate the reliability of the colonial documents on which historians have relied in describing highland Andean storehouses`.
(20 words; the explanation's clause "it never assesses those documents or their reliability" already
covers this wording.)

**Fact check.** Dates (~1450–1530) sit inside Inca imperial expansion (1438) and pre-conquest (1532).
*Qollqa* built in rows along ridges above valley floors: correct, and the placement is genuinely
attributed to ventilation and cooling. Starch-grain analysis of earthen floors is a real and
standard technique. The internal detail — maize-rich floors clustering in "the lowest and warmest
row," tubers above — matches the real archaeological pattern (tuber storage at higher, colder
elevations). Nothing counterfactual; the invented finding is internally consistent.

**Difficulty.** Medium is right.

---

## Q7 — text-structure-purpose (structure), hard, key C — **PASS**

**Cold answer:** C.

**Attack on the key.** Two candidates.
- **B** is the strongest: "traces the physical changes it underwent over sixty years" is genuinely in
  the poem ("the ink going brown, the hand going small"), and "explains why it was preserved" sits
  suspiciously close to "My grandmother **kept** the weather in a book." The attack fails on two
  counts: those two physical details are one line inside a stanza whose subject is the entries'
  continuity, not the poem's middle *move*; and the closing stanza reinterprets what the book *was*
  (an argument), not why anyone preserved it. B also misdescribes the first move — the poem never
  says the notebook was inherited.
- **D** fails on a flat textual contradiction: the poem states that the grandfather's death is
  exactly what the entries do *not* record, so the entries cannot be "a record of the family's
  griefs," and there is no regret anywhere in the text.

**Distractor disqualifiers.**
- A — the poem never questions accuracy ("columns holding their line") and the speaker never resolves
  to keep her own record.
- B — as above.
- D — as above.

None requires information outside the poem; none requires mind-reading the author beyond what the
final stanza states in the speaker's own voice. No wasted slot — all three are live.

**Option grammar.** All four open `The speaker describes/…` rather than `It` + verb. This looks like a
deviation from 05_SCHEMA_RULES, but 04_reading_distractors §2 records the exception explicitly:
overall-structure options use `It` + present verb 72/88 times and **`The speaker`/`The text` + verb
16/88 for literary texts**, with a verbatim CB poem example in the same shape. Compliant. All four
share the key's three-move skeleton with the content swapped, as required.

**Fact check.** No real-world claims. Internal consistency holds ("Sixty years of columns" /
"across sixty years of Marches and Aprils").

**Difficulty.** Hard is right — B and D both require a return to the text to kill.

---

## Q8 — cross-text-connections, hard, key A — **PASS**

**Cold answer:** A.

**Attack on the key.** I tried to make **D** work: Text 2 does say the shell must be warm, and warmth
in the shell is compatible with an ocean below. But D requires Text 2 to *concede* an ocean, and Text
2's entire point is that the plain can be smoothed "without any liquid ever forming." Concession is
not merely absent — it is the claim being denied. Dead.
I also tried "Text 2 doesn't say *recently*." It grants a young surface explicitly ("a young surface
does require that the interior still be warm"), and tens of millions of years is recent on a 4.5 Gyr
clock. Key survives.

**Distractor disqualifiers.**
- B — Text 2 never says the plain is too old; it accepts a young surface and its own mechanism runs
  on a young-surface timescale.
- C — Text 2 does not dispute the crater observation, only the inference drawn from it.
- D — Text 2 concedes no ocean; the model's point is no liquid at all.

Each disqualifier is quotable from Text 2. This is the cleanest hard item in the module.

**Option grammar.** All four are `By [V-ing] that [T1 proposition] but [V-ing] that [T2 proposition]`,
varying only the stance verbs and the second move — the measured hard cross-text skeleton.
The relation is *rebuts* / *offers an alternative mechanism*, both in the observed inventory.

**Fact check.** Icy outer-solar-system bodies saturated with craters: correct. Solid-state convection
in an ice shell warmed by radiogenic heating in a rocky core, smoothing a surface without melt:
a real, published mechanism. Ice creeping near its homologous melting temperature: correct. The
underlined claim is *supposed* to be the defeated one, so its "only by liquid water" premise being
too strong is by design, not an error.

**Difficulty.** Hard is right.

---

## Q9 — central-ideas-details, easy, key C — **MINOR**

**Cold answer:** C.

**Attack on the key.** This is the item's real weakness. C says the pay change "**failed to serve the
owners' aim**." But the aim the passage actually states is "expecting the change to **raise output**"
— and the very next sentence says "**Output did rise**." On the stimulus's own terms the scheme
*achieved* its stated aim; what it failed to do was leave the owners better off. The key is still the
best of the four by a wide margin, and no distractor becomes defensible, so this is not a
two-answer item. But a careful student can be made to hesitate on the key's central verb, which is
exactly what an easy item must not do.

**Distractor disqualifiers.**
- A — restates one detail (output rose) as the whole point; drops the rejections and the reversal.
- B — reverses the sequence: rejections occurred under the piece rate, before the wage was restored and raised.
- D — supplies a cause the text never gives; the text names the cost of unsellable work.

All three disqualifiers are in the passage. None is silly.

**Fix (one clause, in the passage — this is the surgical repair).**
Replace `expecting the change to raise output`
with `expecting the change to raise the quantity of rope they could sell`.
Now "Output did rise, but so did the number of coils rejected" genuinely defeats the stated aim, and
C's wording becomes exact.

**Matching explanation fix.** Replace the opening clause
`The owners adopted the piece rate expecting it to raise output; output rose, but rejected coils rose with it,`
with
`The owners adopted the piece rate expecting it to raise the quantity of rope they could sell; output rose, but rejected coils rose with it,`.

**Fact check.** Piece rates degrading quality is a standard and well-documented result in labour
economics — the fiction is on the right side of the real world. "Ropewalk (long sheds in which rope
is spun)" is an accurate gloss: yarn was spun by walkers backing down the walk before strands were
laid. Rope sold by the coil: correct.

**Difficulty.** Easy is defensible — three of four options die on a single reading — but it is at the
top of the easy band.

---

## Q10 — central-ideas-details, medium, key B — **PASS**

**Cold answer:** B.

**Attack on the key.** The available attack is that Okorie's design is **cross-sectional** (31 roofs of
different ages measured once) while B's verb is longitudinal ("diverge … as they age"). The attack
fails: the passage explicitly controls the confound — "all planted at installation with the same
commercial mix of sedums" — and the concluding sentence in Okorie's own voice makes exactly this
inference ("have drifted away from the planting they were given"). A main-idea item is entitled to
report the text's own conclusion. Not a defect.

I also checked whether B over-generalises from "one metropolitan area" to green roofs at large. It
generalises no further than the text's closing sentence does. Acceptable.

**Distractor disqualifiers.**
- A — a single figure offered as the whole point; drops the young-roof comparison that gives it meaning.
- C — imports a comparison with parks and gardens the text never makes.
- D — a design recommendation the text never issues.

Standard, live CID builds (detail-as-main-idea, unmade comparison, unmade recommendation). No wasted slot.

**Fact check.** Sedums correctly glossed as low, drought-tolerant succulents. Spontaneous
colonisation of aging extensive green roofs by wind- and bird-dispersed grasses and forbs, with
sedum cover declining over decades, is a real and repeatedly documented result.

**Difficulty.** Medium is right.

---

## Q11 — command-of-evidence (quantitative, table), easy, key D — **MINOR**

**Cold answer:** D (58 hours).

**Table check (the specific audit requested).**

| Trade | Members | Avg workweek (h) | Avg weekly wage (s) |
|---|---|---|---|
| Coopers | 340 | **58** | 26 |
| Sailmakers | 210 | 54 | 31 |
| Riggers | 470 | 60 | 22 |
| Coppersmiths | 155 | 56 | 29 |

- The statement fixes the row by two independent anchors — "the coopers' local" **and** "had 340
  members" — and the members figure is correct for coopers. The row is unambiguous.
- Only 58 completes it. **D is the only statement the table supports.**
- **Every distractor is a real value read from the wrong row of the correct column**, never a
  fabricated number: 54 = sailmakers, 60 = riggers, 56 = coppersmiths. This is exactly the measured
  easy-item build (04 §5.1: "Every distractor is a real value from the graphic belonging to a
  different row. Never a fabricated number"), and the explanation names the true owner of each
  value, matching CB's one-liner rationale form.
- No value is duplicated across rows, so no distractor is accidentally also correct.
- The wage column is unused decoration — normal for CB tables, not a defect.

**Defect — anachronistic terminology (real, low severity).** The table header says "Members in local
union" and the stimulus says "the coopers' **local** had 340 members," in an explicitly British
setting ("a British harbor town in the 1890s", "the town's trades council"). "Local" as a noun for a
union sub-unit is North American (AFL usage). British unions of 1895 had **branches**, lodges, or
societies. A reader who knows the period will notice.

**Fix (three strings; the numbers do not move).**
1. Table header: `Members in local union` → `Members in local branch`.
2. Stimulus: `the coopers' local had 340 members` → `the coopers' branch had 340 members`.
3. Explanation: replace the three occurrences of `whose local had` with `whose branch had`, and
   `the coopers' local had 340 members` with `the coopers' branch had 340 members`.
Also consider the table caption: `Union Membership, Hours, and Wages in Four Port Trades, 1895`
is fine as is.

**Fact check on the invented figures.** 1895 British skilled-trade weekly wages of 22–31 shillings
and workweeks of 54–60 hours are inside the real historical range, and the inverse relation between
hours and pay across the four trades (riggers longest/lowest, sailmakers shortest/highest) is
plausible for a skilled-vs-semi-skilled gradient. Sailmaking being a small and shrinking union in
1895 is consistent with the transition to steam. Internally consistent.

**Difficulty.** Easy is right — pure cell location.

---

## Q12 — command-of-evidence (quotation-illustration), medium, key A — **MINOR**

**Cold answer:** A.

**Attack on the key.** The best attack: option A's own narration ("gave the sentence he had settled
on before the man was brought in") is itself fairly explicit, so does Wenlock really "nowhere say
otherwise"? The attack fails on the distinction the claim actually draws — A reports an *act*
(prejudgment), while B delivers a *judgment* ("was nothing of the kind"). Showing a man act against
his stated principle is not the same as telling the reader he is a hypocrite. Key survives.

**Distractor disqualifiers.**
- B — states the judgment outright; violates the claim's first conjunct.
- C — the words and the act belong to the clerk, and his conduct matches his words rather than
  contradicting them. (Wrong-entity + no gap; a legitimate double failure.)
- D — a principle with no contrary act; the wife's agreement confirms rather than exposes.

Claim is a two-conjunct construction and each distractor fails a proper subset — the measured
E1/E3 architecture. All disqualifiers are visible in the options themselves.

**Defect — the stimulus promises a passage that does not exist (real, low severity but visible).**
The stimulus ends "**In the passage below**, Pardoe has just heard a case brought against a laborer…"
There is no passage below. What follows are four quotations drawn from *different* scenes — option C
is the clerk at the bench, option D is Pardoe at home with his wife that evening. A student who
takes "the passage below" literally will look for a continuous excerpt and not find one.

**Fix (one clause, in the passage).**
Replace `In the passage below, Pardoe has just heard a case brought against a laborer accused of poaching a hare from the squire's covert, a thicket where game shelters.`
with `In one scene, Pardoe hears a case brought against a laborer accused of poaching a hare from the squire's covert, a thicket where game shelters.`
No option or explanation text changes.

**Fact check.** An 1878 English country magistrate hearing a poaching charge summarily, with a clerk
entering the sentence in the court book, is period-correct (Game Act 1831; Poaching Prevention Act
1862). "Covert, a thicket where game shelters" is an accurate gloss. *The Winter Sessions* is a
fictional title and need not correspond to the real Quarter Sessions calendar. A hare in a covert
rather than open field is a mild countryside quibble, not an error.

**Difficulty.** Medium is right.

---

## Q13 — command-of-evidence (finding-if-true), hard, key C — **MINOR**

**Cold answer:** C, by keyword, in under 10 seconds.

**Attack on the key.** None available. The hypothesis names a mechanism (boron segregates to grain
boundaries and locks them; creep proceeds by boundary sliding), and C supplies both halves of that
mechanism in the new material. It is the only option that bridges Domain A to Domain B.

**Distractor disqualifiers.**
- A — deepens Domain A only (more about nickel alloys); adds no bridge. [H1]
- B — hardness and density at room temperature; creep is defined in the text as deformation under
  load *at high temperature*. [H2]
- D — bridges on the wrong variable (dopant atomic weight rather than boundary locking). [H3]

Architecturally this is exactly the measured H1/H2/H3 spread. Nothing is silly.

**Defect — difficulty is overstated (real, moderate severity for the ladder).** C is the **only**
option containing the phrase "grain boundaries." A student who never reads the passage, and simply
matches the hypothesis's most distinctive noun phrase, solves the module's hard command-of-evidence
slot in seconds. 04 §5.3 records hard finding-items as carrying a "true and topical but logically
inert" distractor precisely to defeat keyword matching; this item has none.

**Fix (one option).** Replace option B
`The boron-doped composite is harder and denser at room temperature than the undoped composite is.`
with
`Grain boundaries in the undoped silicon carbide composite slide readily under load at high temperature.`
*Why this works:* it is true, on-mechanism, and keyword-matches "grain boundaries" and "slide," so
matching no longer identifies the key — but it reports only the baseline and says nothing about
boron, so it leaves the hypothesis exactly as probable as before. That is the measured H6 build.
C remains strictly stronger because it supplies both boron's location *and* the mechanical
consequence, so no second defensible answer is created.

**Matching explanation fix.** Replace
`Choice B is incorrect because hardness and density at room temperature bear on properties the text never connects to creep, which it defines as deformation under load at high temperature.`
with
`Choice B is incorrect because it restates the general mechanism of creep in the undoped material and says nothing about boron, so it leaves the hypothesis about how boron acts in the ceramic exactly as well supported as it was before.`

**Fact check.** Boron segregation to grain boundaries improving creep-rupture life in nickel-base
superalloys at a few hundred ppm (a few hundredths of a percent) is textbook and correct. Grain-
boundary sliding as a principal creep mechanism in fine-grained polycrystals is correct, and the
hedge "largely" is appropriate. Boron as a dopant in silicon carbide is real (a standard sintering
aid). Creep correctly defined. No internal inconsistency; the numbers in the two arms are stated as
"comparably small," which is honest rather than precise.

---

## Q14 — inferences, hard, key B — **MINOR**

**Cold answer:** B.

**Attack on the key.** The serious one: the data entail that Punkuyoq's materials travelled a long
way, but **not** that they travelled by *exchange*. Andean llama-caravan **direct procurement** —
residents travelling to the source themselves — is a real, competing archaeological model for
long-distance obsidian at exactly this period, and nothing in the stimulus excludes it. B says the
people "took part in **exchange** over long distances." The explanation quietly concedes the point:
its own summary says "what distinguishes Punkuyoq is the reach of the **connections** its residents
maintained" — a weaker and more accurate word than the option uses. The item is not broken (no
distractor becomes defensible), but the key asserts slightly more than the stimulus licenses, and
05_SCHEMA_RULES requires that exactly one option be **entailed**, not merely most plausible.

**Fix (one word, in the option).**
Replace option B `the people of Punkuyoq took part in exchange over long distances to a degree that their nearest neighbors did not.`
with `the people of Punkuyoq maintained connections over long distances to a degree that their nearest neighbors did not.`
This matches the explanation's own wording exactly, is entailed by both facts, and keeps the option
at 19 words (no length cue; current longest is C at 23).

**Matching explanation fix.** Replace `Choice B is correct.` opening sentence's later clause
`Because the three neighboring villages relied chiefly on the nearby flow, what distinguishes Punkuyoq is the reach of the connections its residents maintained.`
— no change needed; it already says "connections." Only the option text moves.

**Distractor disqualifiers.**
- A — killed by the passage's explicit exclusion clause ("The pattern does not reflect ignorance of
  the nearer flow"), backed by evidence from the three neighbouring villages.
- C — the text says the nearer flow's stone was worked into *the same kinds of tools*, so there is no
  ground for a suitability preference. (Correctly disqualified as unsupported rather than refuted.)
- D — origin of the settlers is never addressed, and a southern origin would leave the eastern
  lowland ornaments unexplained.

**Architecture.** This is the best-built inference item in the module: it carries the mandated
**exclusion clause** ("The pattern does not reflect ignorance of the nearer flow: …") and distractor
A is precisely the explanation that clause excludes — exactly the measured hard-item design.

**Fact check.** Obsidian source-matching by trace-element chemistry: correct and routine. Andean
obsidian moving hundreds of kilometres during the Early Horizon (roughly 500–200 BCE): correct.
Amazonian lowland materials appearing in highland ceremonial and burial contexts of the period:
correct. No internal inconsistency; 9-in-10, 300 km, 40 km, three neighbours, four villages all hold
together (Punkuyoq + three neighbours = "those four villages").

**Difficulty.** Hard is right, and honestly so — two facts must be combined and the exclusion clause
must be used.

---

## Q15 — form-structure-sense (tense), easy, key B (*produced*) — **PASS**

**Cold answer:** B.

**Attack on the key.** None. The sentence supplies two absolute dates (1998, 2009) and a past-tense
frame ("established … in 1998").

**Distractor disqualifiers.**
- A *produces* — present tense against an event the sentence dates to 2009.
- C *will produce* — future against two past dates.
- D *had produced* — past perfect with no later past reference point for the harvest to precede.

**Grammar audit.** I specifically checked whether any distractor is defensible under a permissive
style. It is not. Historical present is not available here because the sentence names the year
explicitly and mixes it with a past participial frame; past perfect is unavailable because there is
no anterior-to-what. B is the only Standard-English-correct option. The quartet is the measured F02
shape ({V-s, past, will V, had V-en}) with the two dominant wrong forms (future 17×, past perfect
11×) both present.

**Fact check.** *Tuber melanosporum* cultivation by inoculating oak seedlings and planting in limed,
calcareous soil: correct (the fungus requires pH ≈ 7.5–8.5). Truffles fruit hypogeously — "underground"
is right. First harvest typically 7–12 years after planting; 1998 + 11 = 2009 is arithmetically and
agronomically correct. Teruel province (Sarrión) is genuinely the largest black-truffle producing
area in the world, with plantations dating from the late 1980s–90s. Clean.

**Difficulty.** Easy is right (F02 is 20/24 easy in the official bank).

---

## Q16 — boundaries (no punctuation inside a clause), easy, key C — **PASS**

**Cold answer:** C.

**Attack on the key.** None. "Cloth colored with these lichen dyes" is a subject noun phrase; "kept"
is its verb; nothing may intervene.

**Distractor disqualifiers, checked against permissive style (the requested hunt).**
- A `dyes:` — a colon must follow a complete main clause; the subject NP is not one. No editor allows this.
- B `dyes,` — a comma between a six-word subject and its verb. I looked hard for a defensible style
  that permits it (the old "long subject" comma) and there is none in modern usage; every current
  handbook and every CB rationale in this family calls it an error. Not defensible.
- D `dyes —` — same subject–verb severance, and nothing follows that a dash could introduce.

**Ambiguity check.** I tested whether "dyes" could be parsed as a verb ("these lichen dyes…"). It
cannot: "these lichen" is not a well-formed plural NP, so the compound-noun reading is forced. No
second parse.

**Architecture.** Key `NONE` with distractor triple {COLON, COMMA, DASH} — one of the two modal
triples for a `NONE` key (9× each in the official bank). Correct.

**Fact check.** Orchil/cudbear lichen dyes, produced by steeping lichens in ammoniacal liquor,
yielding reds and purples, with a residual ammonia odour that persists in the cloth: correct and
well documented. Woollen mills of the Scottish Borders (Galashiels, Hawick) are real and were a
major dyeing centre. Mauveine dates to 1856, so synthetic dyes reaching Borders mills in the 1860s
is right. Clean.

**Difficulty.** Easy is right (B07 is E12 / M4 / H5).

---

## Q17 — form-structure-sense (pronoun–antecedent), easy, key A (*them*) — **MINOR**

**Cold answer:** A.

**Attack on the key.** The one real attack is on the *explanation*, not the key. "Librarians usually
digitize **it**" has a grammatically available antecedent the explanation never addresses: **"a public
library's local-history collection"** in the first sentence. Digitising a collection is an entirely
normal thing to say. The key survives because the clause that immediately precedes the blank is
"Because such documents exist in a single copy" — which sets *documents* as the thing at issue — and
because the sentence ends "before allowing readers to handle **the originals**," a plural that
confirms plural reference. But the item's stated disqualifier for B is wrong.

**Defect 1 — the explanation's disqualifier for B is unsound (real).** It claims "it" "reaches
instead for the nearer singular 'a single copy.'" That is not what a reader does with "digitize it,"
and it leaves the genuine rival antecedent ("collection") unmentioned.

**Fix (explanation).** Replace
`Choice B is incorrect because the singular "it" cannot refer back to the plural "such documents"; it reaches instead for the nearer singular "a single copy."`
with
`Choice B is incorrect because the singular "it" cannot refer back to the plural "such documents," the noun phrase the sentence has just made its subject, and the plural "the originals" at the end of the sentence confirms that the things being digitized are plural.`

**Defect 2 — number infelicity in the passage (low severity).** "Because such documents exist in a
single copy" reads as if the whole class shared one copy; the sense is distributive.

**Fix (passage).** Replace `Because such documents exist in a single copy`
with `Because such documents exist in only one copy each`.
(I deliberately do **not** recommend "Because each of these documents exists in a single copy" — that
would plant a singular head noun near the blank and give "it" a foothold.)

**Distractor disqualifiers (as repaired).**
- B *it* — singular against a plural antecedent, contradicted by "the originals."
- C *this* — singular demonstrative against a plural antecedent.
- D *that* — same.

**Architecture.** The bare four-pronoun list {them, it, this, that} is the measured F04 canonical set.
Correct.

**Difficulty.** Easy is right.

---

## Q18 — boundaries (two main clauses), medium, key D (*measurements, but*) — **MINOR**

**Cold answer:** D.

**Attack on the key.** None. Two full main clauses, opposition between them, comma + coordinating
conjunction is the standard join and the only one offered that works.

**Distractor disqualifiers, checked against permissive style.**
- A `measurements,` — comma splice. Not defensible under any editorial style.
- B `measurements` — fused sentence. Not defensible.
- C `measurements but` — this is the one worth interrogating. Chicago 6.22 requires a comma before a
  conjunction joining independent clauses; 6.23 permits omission only when the clauses are short and
  closely connected, and chiefly with *and*. Here the clauses run 11 and 13 words and the
  conjunction is adversative, so omission is not defensible. **C is genuinely wrong.**

**Defect — the rationale for C makes the rule sound optional (low severity, explanation only).**
The current text reads "a coordinating conjunction joining two main clauses **of this length** needs
a comma in front of it." That phrasing concedes, on the page, that shorter clauses would not — which
invites a student to argue the point. CB's rationales in this family state the rule flatly.

**Fix (explanation).** Replace
`Choice C is incorrect because a coordinating conjunction joining two main clauses of this length needs a comma in front of it.`
with
`Choice C is incorrect because the coordinating conjunction "but" cannot join two main clauses on its own; a comma must precede it to mark the boundary between them.`

**Architecture.** Key `COMMA&CONJ` with distractor triple {COMMA, NONE, CONJonly} — the modal triple
in 7 of 11 official items with this key. Correct.

**Fact check.** A stream gauge measures stage at a fixed section; stage is converted to discharge via
a **rating curve** built from earlier paired stage–discharge measurements; and the rating **shifts**
when a flood rearranges the channel control. This is accurate hydrology, correctly sequenced, and
the "but" relation is the right one.

**Difficulty.** Medium is right.

---

## Q19 — form-structure-sense (subject–verb agreement), medium, key B (*climbs*) — **MAJOR**

**Cold answer:** I could not answer this item as printed. I had to reconstruct the intended sentence.

### The defect

The passage reads, verbatim:

> The share of a household's monthly income spent on staple ______ in those weeks from about a
> third to well over half.

The four options are bare verbs (`climb` / `climbs` / `are climbing` / `have climbed`), so nothing in
any option supplies a noun. Substituting the key gives:

> The share of a household's monthly income spent on staple **climbs** in those weeks from about a
> third to well over half.

**"staple" is left as a bare attributive adjective with no head noun.** The sentence is ungrammatical
under all four options, so no option "conforms to the conventions of Standard English" and the stem
has no true answer.

Worse, the missing noun is the item's entire mechanism. The explanation says so in its own words:

> "The singular verb 'climbs' matches the singular subject 'The share,' which the prepositional
> phrase 'of a household's monthly income' and the participial phrase '**spent on staple grains**'
> hold apart from its verb. Choice A is incorrect because the plural verb 'climb' agrees not with the
> singular subject 'share' but with '**grains**,' the plural noun sitting immediately before the
> blank."

The explanation quotes a word — **grains** — that does not appear anywhere in the passage. With
"grains" deleted, the number-mismatched decoy required by 03_conventions_transitions §B.2 (present in
22 of 37 official non-relative F01 items) is gone, and the rationale for choice A is unintelligible.

### Fix (insert one word into the passage)

Replace
`The share of a household's monthly income spent on staple ______ in those weeks from about a third to well over half.`
with
`The share of a household's monthly income spent on staple grains ______ in those weeks from about a third to well over half.`

No option, stem, or explanation text changes — the explanation is already written against this
sentence. Passage word count goes 46 → 47, well inside the boundaries/FSS band.

### Post-fix review

**Attack on the key.** With "grains" restored, subject = "The share" (singular), verb = "climbs."
Nothing else can be the subject: "income" and "grains" are both inside modifiers.

**Distractor disqualifiers.**
- A `climb` — plural; agrees with the decoy "grains," not with "share."
- C `are climbing` — plural.
- D `have climbed` — plural.

All three sit in the opposite number from the key and vary only in aspect as camouflage — the
measured F01 architecture (39 of 44 official items), with the canonical `V-s → {base V, are V-ing,
have V-en}` quartet, the single most frequent shape in the bank. Options are 1–2 words. Correct.

**Fact check.** Engel's-law behaviour — staple food's share of household budgets rising sharply in
the pre-harvest lean season in low-income agrarian economies, from roughly a third to over half — is
real and repeatedly measured. The "market basket" price spike before harvest is the documented
lean-season pattern. Internally consistent (a third → well over half is a genuine "climb").

**Difficulty.** Medium is right once repaired: the subject head is separated from the verb by a
prepositional phrase *and* a participial phrase, with a plural decoy immediately before the blank —
a two-layer separation, which the spec associates with medium/hard.

---

## Q20 — boundaries (colon before a list), medium, key D (*once: steady*) — **MAJOR**

**Cold answer:** D (once I noticed the duplication and mentally deleted it).

### The defect

The passage reads, verbatim:

> the rhythm section was expected to supply three things at ______ **steady** time, harmony clear
> enough for the soloist to lean on, and a running commentary of fills.

Every option carries the word **steady**:
`once. Steady` / `once, steady` / `once; steady` / `once: steady`.

Substituting any option produces a duplicated word:

> …to supply three things at once: **steady steady** time, harmony clear enough for the soloist to
> lean on, and a running commentary of fills.

The house convention — visible in the official corpus and honoured everywhere else in this file — is
that any word carried inside the option is **removed from the passage**. Confirmed against the CB
verbatim set (`c3397d25`: options `periods. The` / `periods: the` …, and the passage after the blank
begins "Old Kingdom", not "the Old Kingdom") and against Module 2 of this same file (M2 Q18: options
`projection. That` / `projection that` …, passage after the blank begins "sailors have relied on",
with no stray "that"). M1 Q20 is the only item in the module that breaks it.

### Fix (delete one word from the passage)

Replace
`the rhythm section was expected to supply three things at ______ steady time, harmony clear enough for the soloist to lean on, and a running commentary of fills.`
with
`the rhythm section was expected to supply three things at ______ time, harmony clear enough for the soloist to lean on, and a running commentary of fills.`

No option, stem, or explanation text changes — the explanation already quotes the list as
"Steady time … fills" and "steady time … fills," i.e. it is written against the repaired passage.
Word count goes 50 → 49, inside the boundaries band.

### Post-fix review

**Attack on the key.** A colon after the complete main clause "In the hard-bop combos that followed,
the rhythm section was expected to supply three things at once," introducing the three things that
clause has just promised. Textbook B05.

**Distractor disqualifiers, checked against permissive style (the requested hunt).**
- A `once. Steady` — leaves "Steady time, harmony …, and a running commentary of fills" as a
  verbless fragment. Deliberate fragments are a stylistic option in prose but not on this test, and
  no distractor here is offered as a rhetorical fragment.
- B `once, steady` — this is the one an editor might wave through, and it deserves the scrutiny. A
  comma can introduce a short appositive series in loose prose. It fails here on a concrete,
  in-passage ground rather than on taste: the series items are themselves comma-separated and the
  series carries a final "and," so a leading comma makes "at once, steady time, harmony …, and a
  running commentary" scan as a **four-item series** ("at once" being item one) — the exact
  ambiguity a colon exists to prevent, and the exact ground the explanation states. Not defensible.
- C `once; steady` — a semicolon joins main clauses or separates internally-punctuated list items; it
  does not introduce a list after a complete clause. Not defensible.

**Architecture.** Key `COLON`, distractors {PERIOD, COMMA, SEMI} — matching the B05 verbatim set
(`c3397d25`) exactly.

**Fact check.** Bebop reduced the big-band chart to a horn line over a rhythm section: correct.
Hard bop followed bebop (from roughly 1954): correct. The three functions named — time, comping
harmony for the soloist, and fills/commentary — are an accurate description of the hard-bop rhythm
section's role. Clean.

**Difficulty.** Medium is right (B05 is M2 / E0 / H0 in the official bank).

---

## Q21 — form-structure-sense (finite vs nonfinite), hard, key C — **PASS**

**Cold answer:** C.

**Attack on the key.** The sentence's main verb, "argues," arrives after the blank, and the closing
comma before it is already printed. The slot must therefore open a supplement, not supply a second
finite verb. Only C does.

**Distractor disqualifiers.**
- A `Adeyemi embeds` — two finite verbs ("embeds", "argues") with nothing joining them. Asyndetic
  compound predicates are not Standard English, so this does not survive as a compound-verb reading.
- B `Adeyemi, embeds` — still finite, and additionally severs the verb from its own subject.
- D `Adeyemi is embedding` — finite; same collision with "argues."

**Grammar audit.** I checked the one place this family leaks: whether the present participle is
semantically wrong because the embedding precedes the arguing, so that "having embedded" or "who
embedded" would be more accurate. A nonrestrictive present participial supplement expressing an
attendant or characterising activity is standard, "having embedded" is not among the options, and
the official corpus item this is modelled on has the identical shape (`a2816c7f`: A `Serra is
intending` / B `Serra, intends` / **C `Serra, intending`** / D `Serra intends`). No leak.

**Architecture.** Key = bare `-ing` supplement; distractors are a single-variable sweep on finiteness
with the comma varied as camouflage. Matches F03 exactly. Two-to-three-word options. Correct.

**Fact check.** Ground-contact time at maximum sprinting velocity is ~0.08–0.10 s — "barely a tenth
of a second per stride" is right. The ankle plantar-flexors do dominate joint work during
top-speed ground contact, so "most of that contact is managed at the ankle" is defensible. Ankle
(joint) stiffness correlating with sprint performance more strongly than gross leg strength is a
real research direction, and it is presented as one biomechanist's argument rather than as settled
fact. Instrumented runways with embedded force plates exist. Clean.

**Difficulty.** Hard is right — the discriminator (main verb after the blank) has to be found by
reading past the blank, which is the measured hard F03 move.

---

## Q22 — boundaries (matched-pair supplement), hard, key B (*ceiling —*) — **PASS**

**Cold answer:** B.

**Attack on the key.** None. An opening em dash is already printed after "layers"; the blank must
supply its partner and hand the subject "The oxygen" back to its verb "carries."

**Distractor disqualifiers, checked against permissive style.**
- A `ceiling,` — a comma cannot close a dash-opened supplement. Mixed pairs (`—` … `,`) are wrong in
  every current style manual; 18 official items carry exactly this unmatched-pair distractor.
- C `ceiling:` — a colon cannot close a supplement and would falsely announce an explanation.
- D `ceiling` — leaves the opening dash unanswered and runs the supplement into "carries."

**Grammar audit.** I checked the attachment: the supplement "laid down season by season …" modifies
"calcite layers," which is the object of a preposition inside the subject NP, not the subject head.
A supplement may attach to any NP, and the sentence reads cleanly either way (oxygen is also laid
down, in the calcite). No second parse, no ambiguity that a different mark would resolve.

**Architecture.** Key `DASH`, distractors {COMMA, COLON, NONE} — the modal triple for a `DASH` key
(4× in the official bank), inside the matched-pair frame the spec identifies as the single most
common Hard Boundaries frame.

**Fact check.** Speleothem oxygen isotopes as a continuous terrestrial palaeoclimate archive:
correct. Seasonal/annual laminae in stalagmites: correct. Stalagmites form from water that seeps
through the overlying rock and **drips from the ceiling** onto the floor: correct (stalactites hang
from the ceiling; the passage does not confuse the two). "Among the few places on land where a
continuous record survives" is appropriately hedged given ice cores, tree rings, and lake sediments.
Clean.

**Difficulty.** Hard is right. Passage runs 56 words, marginally above the measured hard-boundaries
median (49) but under p90 (57).

---

## Q23 — transitions (example), easy, key B (*For instance,*) — **MINOR**

**Cold answer:** B.

**Attack on the key.** The only candidate is **C *Likewise***, which would need a prior specific case
for the grass endophyte to parallel. The first two sentences give a *class* ("Many fungi that live
inside plant leaves…", "Botanists call these fungi endophytes"), not a case, so there is nothing to
be like. Key survives.

**Distractor disqualifiers.**
- A *Meanwhile* — signals concurrent-but-separate action; no timing relation is in play.
- C *Likewise* — as above.
- D *In other words* — signals restatement; the sentence supplies a fungus and an effect not
  previously mentioned.

**Defect — one dead slot and a missing distractor family (low severity).** *Meanwhile* is not a
credible choice here for any student — there is no temporal frame anywhere in the stimulus — so the
item is effectively three-way. It also leaves the option set without a contrast-family member,
whereas the measured architecture for an EXAMPLE key pairs it with CONTRAST 4×, CONCESSION 4×,
ADDITION 4×.

**Fix (one option).** Replace option A `Meanwhile,` with `In addition,`.
*Why this works:* ADDITION is the modal partner for an EXAMPLE key, and "In addition" is a live lure
because the third sentence does add information — a student who reads it as a further fact about
endophytes rather than as an instance of the class will take it. It stays wrong because the sentence
names one member of the class just defined, which is instantiation, not addition. It also keeps the
three-distinct-relationship-categories rule intact (ADDITION / SIMILARITY / RESTATEMENT, none of
them EXAMPLE).

**Matching explanation fix.** Replace
`Choice A is incorrect because "Meanwhile" illogically signals that the grass endophyte acts at the same time as, but separately from, the fungi described earlier; the text indicates no such timing.`
with
`Choice A is incorrect because "In addition" illogically signals that the sentence contributes a further point alongside the preceding ones; instead, the sentence names one member of the class of fungi the preceding sentences have just defined.`

**Fact check (specialist note, no change required).** *Epichloë* grass endophytes of cool-season
pasture grasses produce alkaloids (ergot alkaloids, lolines, peramine) that deter insect herbivores
— correct. The general claim "a single leaf can host dozens of species" is correct for foliar
endophyte assemblages broadly, though a mycologist would note that the systemic clavicipitaceous
grass endophyte given as the example is precisely the kind that does *not* co-occur with dozens of
others in one leaf. The item's logic does not depend on the number, so I do not recommend changing it.

**Difficulty.** Easy is right, and correctly so for the first slot in the transitions block.
Worth noting for the record: 03 §D.3 measures EXAMPLE as keyed in only 4.5% of official items while
appearing in 14% of distractor slots, and §D.4 finds the first transitions slot keyed TEMPORAL or
CAUSE-RESULT in 5 of 5 observed blocks. Keying EXAMPLE here is a deliberate blueprint choice, not an
error, but it is the module's least corpus-typical transition decision.

---

## Q24 — transitions (contrast), medium, key D (*By contrast,*) — **MINOR**

**Cold answer:** D.

**Attack on the key.** None. Wool locks and shrinks; linen is smooth and does not. Straight opposition.

**Distractor disqualifiers.**
- A *For example* — linen is offered as the case where wool's behaviour does *not* occur, so it
  cannot illustrate it.
- B *In addition* — signals a further agreeing point; the sentence sets an opposing case.
- C *Therefore* — signals that linen's smoothness follows from the fullers' treatment of wool; no
  causal link exists.

The presence of *for example* is licensed: 03 §D.3 permits it only when the preceding sentences are a
general claim the blank sentence does **not** instantiate, which is exactly the setup here.

**Defect — factual overclaim (real, low-moderate severity).** "a linen shirt put through the same hot
wash comes out of the tub at very nearly the size it went in." Linen is not felting-prone — that part
is right and is the item's actual point — but linen does shrink measurably on a first hot wash,
typically ~3–10% from yarn and weave relaxation, which is why linen goods are routinely pre-shrunk.
Against wool's 20–50% fulling shrinkage the contrast is real, but "very nearly the size it went in"
is the kind of unqualified claim a textile specialist would mark false.

**Fix (one clause, in the passage).**
Replace `and a linen shirt put through the same hot wash comes out of the tub at very nearly the size it went in.`
with `and a linen shirt put through the same hot wash comes out of the tub with nothing like that shrinkage.`
The contrast is unchanged, all four rationales still hold, and the claim becomes unambiguously true.
(Word count 60 → 59, inside the transitions band.)

**Fact check, rest of passage.** Wool's overlapping cuticle scales interlocking under heat, moisture
and agitation — the felting mechanism — is correct. Medieval fulling deliberately exploited it to
produce dense, weather-resistant cloth: correct. Linen is a smooth bast fibre without scales:
correct.

**Difficulty.** Medium is right.

---

## Q25 — transitions (cause-result), hard, key C (*Consequently,*) — **MINOR**

**Cold answer:** C, in about 8 seconds.

**Attack on the key.** I pushed hardest on **B *Nevertheless***, which would require the third
sentence to hold *despite* the slow release from the clay. It runs the wrong way: the slow release is
what *produces* the overstatement, not what it survives. Dead.
I also checked whether the inference itself holds hydrologically, since a stated inference that does
not follow is a defect in its own right. It does: rapid recovery of *head* in a well reflects the
transmissivity of the layer the well taps, while most of the *stored* water sits in low-permeability
clay that drains over years. So a morning-after level reading credits the aquifer with more
deliverable water than it has — the standard specific-storage-vs-specific-yield / delayed-drainage
point. Sound.

**Distractor disqualifiers.**
- A *Similarly* — the third sentence follows from the first two rather than paralleling them.
- B *Nevertheless* — as above, directionally backwards.
- D *Specifically* — would signal a sharper restatement of sentence 2; instead the sentence turns
  from where the water sits to what a measurement implies.

**Defect — difficulty is overstated (real, moderate severity for the ladder).** *Consequently* is the
only causal option in the set, and the third sentence is visibly a conclusion (it evaluates a
measurement rather than adding a fact). A student who reads nothing but the option list and the
shape of the third sentence solves the module's hard transitions slot immediately. 03 §D.3 also
records CAUSE-RESULT as the single most-keyed relationship (22.3% of keys), so it is the guess a
strategic student makes by default.

**Fix (two options, to put a live rival in the set).**
Replace option A `Similarly,` with `Even so,` **and** option B `Nevertheless,` with `In addition,`.
Resulting set: `Even so,` (CONCESSION) / `In addition,` (ADDITION) / **`Consequently,`** (CAUSE-RESULT,
key) / `Specifically,` (PARTICULARIZATION).

*Why both options have to move.* The live rival this item lacks is a **concessive** — CONCESSION is
the modal partner for a CAUSE-RESULT key (20 pairings across 35 official items), and a student who
reads sentence 2 as the counterweight to sentence 1 rather than as the second half of a joint
premise will genuinely be tempted by it. But simply strengthening the existing concessive is not
enough, because `Nevertheless` is the weakest-phrased member of that family here; `Even so` reads as
a real turn and forces the student to decide whether sentence 3 follows from sentences 1–2 or holds
in spite of them. Swapping `Nevertheless` out for `In addition` then keeps the three distractors in
three distinct relationship categories (satisfied in 144 of 157 official items) and keeps all three
inside the measured partner set for a CAUSE-RESULT key. `Even so` stays wrong because sentence 3 is
the consequence of sentences 1 and 2 taken together, not a claim that survives them.

**Matching explanation fixes.**
- For A: `Choice A is incorrect because "Even so" illogically signals that the overstatement holds in spite of the preceding information; that information is precisely what produces the overstatement.`
- For B: `Choice B is incorrect because "In addition" illogically signals a further point standing alongside the preceding ones; instead, the sentence states what follows from them.`

**Fact check.** Fast water-level recovery in a pumped well, most aquifer storage residing in
low-permeability clay layers that release it over years, and the resulting overestimate of
sustainable yield from a head reading: all correct hydrogeology, correctly assembled. No internal
inconsistency.

---

## Q26 — rhetorical-synthesis, medium, key A — **PASS**

**Cold answer:** A.

**Attack on the key.** None. The goal is "emphasize a difference between the **results** the two
techniques produced," and A is the only option that puts two result figures side by side.

**Distractor disqualifiers.**
- B — contrasts how the two techniques are *performed*, not what they produced.
- C — describes how the sample was assembled.
- D — reports one technique's result with nothing to measure it against.

All three are accurate about the notes and fail only on goal fit, which is the measured build; the
explanation uses "accurately uses the notes but…" three times and never says
"inaccurate/misstates/distorts," matching CB's 429-rationale record. Correct.

**Length-cue check.** A = 24 words, B = 24, C = 17, D = 15. B has been padded to match the key
exactly, as the spec requires for compound goals. Correct.

**Fact check.** Glide (O'Brien) and spin (rotational) are the two shot-put techniques; in the glide
the thrower travels backward across the circle in a straight line and in the spin rotates through
roughly one and a half turns — both correct. Release velocities of 12.9–13.4 m s⁻¹ are in the right
range for collegiate men. The 30/30 split matches "half of them using each technique." Internally
consistent, and the invented 0.5 m s⁻¹ difference is presented as one study's finding rather than as
settled fact — appropriate, since the real literature does not find a reliable release-velocity
difference between the techniques.

**Difficulty note (not a defect).** This sits at the easy end of medium: the goal word "results"
plus the requirement for two arms eliminates B, C and D without any reading of the notes. The
blueprint fixes medium here and the ladder is monotone, so I do not recommend a change; flagging it
only so the ladder's honesty is on the record.

---

## Q27 — rhetorical-synthesis, hard, key C — **MINOR**

**Cold answer:** C.

**Attack on the key.** None. The goal has two constraints — *introduce Aksel's file* and *audience
already knows authority control* — and C is the only option that names the file, its scope, and the
one genuinely new fact (the Latin-script ↔ Arabic-script link) without spending words on background.

**Distractor disqualifiers.**
- A — spends its length explaining what an authority record does to an audience that already knows,
  and never reaches Aksel's file.
- B — reports uptake rather than introducing what the file is.
- D — restates the general problem authority control solves; same background the audience has.

**Defect — A and D share a single disqualifier (real, low severity).** Both fail because they supply
background the specified audience already possesses; the explanation's rationales for A and D are
near-paraphrases of each other ("spends its length explaining the purpose of authority records to an
audience that already knows it" / "restates the general problem authority control solves, again
supplying background the specified audience already has"). One of the four slots is therefore doing
no independent work, which inflates the item's nominal difficulty above its real difficulty: a
student who spots the audience constraint eliminates two options with one move.

**Fix (one option).** Replace option D
`Because an author's works scatter across variant spellings and transliterations without authority control, catalogs rely on records that fix a single form of each name.`
with
`Cataloguer Nurhan Aksel built a shared authority file for Ottoman-era Turkish authors so that a catalog will file all of one author's works together.`
*Why this works:* it introduces a **different** failure mode — this option *does* reach Aksel's file
and name its scope, so it is not eliminable by the audience constraint alone; it fails because its
second half explains the generic purpose of any authority file (background the audience has) and it
omits the Latin/Arabic script link that is the only thing distinctive about Aksel's. C remains
strictly better on both constraints, so no second defensible answer is created. 23 words, so the key
(26) is still not uniquely longest — A remains longest at 30, preserving the anti-length-cue padding.

**Matching explanation fix.** Replace
`Choice D is incorrect because it accurately uses the notes but restates the general problem authority control solves, again supplying background the specified audience already has.`
with
`Choice D is incorrect because it accurately uses the notes but explains the file in terms of what any authority record does, background the specified audience already has, and omits the link between the modern Latin-script form of a name and the Arabic-script form printed on the book.`

**Fact check.** Authority records fixing a single access-point form so that a catalog collocates an
author's works: correct. Variant transliterations scattering an author's works: correct and a real
operational problem. Ottoman-era Turkish authors published in Arabic script before the 1928 alphabet
reform, so a modern Latin-script form must be linked to the printed Arabic-script form: correct, and
exactly the function of non-Latin parallel fields in current cataloguing practice. Nothing
counterfactual; the twelve-libraries / two-slowdowns detail is internally consistent (two of twelve).

**Difficulty.** Hard is defensible once D is repaired; as shipped, it plays closer to medium.

---

# Priority of repairs

1. **Q19** — insert `grains`. Blocking: the item has no correct answer as printed.
2. **Q20** — delete `steady` from the passage. Blocking: the item renders a duplicated word.
3. **Q9, Q14, Q3, Q24, Q11, Q12** — one-clause or one-word accuracy repairs (key wording, entailment,
   physics, textile fact, British terminology, phantom "passage below").
4. **Q5, Q13, Q25, Q27** — difficulty-calibration repairs; each swaps one distractor to remove a
   free elimination at a slot the ladder depends on.
5. **Q17, Q18** — explanation-only repairs.
6. **Q2, Q4, Q6, Q23** — low-severity plausibility, framing, length-cue and dead-slot repairs.
7. **Blueprint** — correct the Module 1 difficulty totals line to 8 easy / 10 medium / 9 hard.

# Where I could not find a defect

Q1, Q7, Q8, Q10, Q15, Q16, Q21, Q22, Q26. I attacked each of these on key, on every distractor, on
permissive-style grammar readings, and on real-world fact, and found nothing that would survive an
appeal. Q8 (cross-text) and Q14 (inferences, post-repair) are the two best-engineered items in the
module; Q22 is a textbook matched-pair boundaries item; Q16 and Q21 reproduce official option
architecture exactly.
