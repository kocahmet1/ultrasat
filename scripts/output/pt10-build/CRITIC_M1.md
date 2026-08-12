# CRITIC — Practice Test 10, Reading & Writing, Module 1

Hostile panel review of all 27 items. 30 findings: **1 BROKEN · 4 MAJOR · 25 MINOR**,
across Q2, Q3, Q4, Q6, Q7, Q8, Q9, Q11, Q13, Q14, Q15, Q16, Q18, Q22, Q23, Q24, Q25, Q27.
Clean, no findings: **Q1, Q5, Q10, Q12, Q17, Q19, Q20, Q21, Q26**.

---

## Overall verdict

This module is closer to authentic College Board than most published imitations, and it is close
for the right reason: with one exception the keyed answers are forced by quotable spans rather than
chosen as the best of four. The mechanical hygiene is flawless — I re-measured every stimulus
against the skill word bands, every long-option set against the 30 percent parity rule, every
explanation against the 150–320-word band and the `Choice {KEY}` opener, every blank and
`[UNDERLINED]` marker count, and the 6/7/7/7 letter balance, and all 27 items pass. I recomputed
Q10's table and every bar in Q11's SVG from the raw geometry (baseline y=260, 27.5 px per 5 MPa:
None 15, Rice husk ash 20, Chitin 25, Flax 30, Bamboo 35); both keyed statements are arithmetically
true, both "misread" distractors are genuinely false, and no distractor is accidentally true *and*
supportive. I substituted all four options into all seven conventions items (Q15–Q21) and exactly
one produced a grammatical sentence in each.

Where it falls short of College Board is not correctness but **calibration and tells**. The module's
six hard items are not hard. Two of them (Q6, Q13) are built on the easy/medium template, and one
(Q14) hands the answer to any student who knows that College Board hedges its keys. The single
genuinely broken item, Q4, breaks in the most predictable way a hard words-in-context item can: it
asks a student to separate two dictionary synonyms on a feature the passage never isolates. Register
is generally excellent — no second person, no rhetorical questions, no humor, no opinion, and the
literary stimuli in Q5, Q8 and Q13 are the best prose on the form — but Q9's stem and Q13's third
sentence both hand the student a hinge she should have had to find. Net: this is a strong draft that
would embarrass itself in exactly three places, and every one of those three is fixable without
touching a keyed index.

---

## The three weakest items

### 1. Q4 (words-in-context, hard) — **BROKEN**

> "Her verdict was firmly worded but avowedly ______: she stated plainly that she would revisit it
> once poets other than Aasen had attempted the form."
> A) tentative · B) provisional (keyed) · C) equivocal · D) categorical

Merriam-Webster's *first* sense of **tentative** is literally "not fully worked out, concluded, or
agreed on : PROVISIONAL." The two options are dictionary synonyms in exactly the sense the colon
activates. The only discriminator the item offers is "firmly worded," which speaks to the *manner*
of delivery, while the colon speaks to the *status* of the judgment — and the concessive "but"
actively invites a word that contrasts with firmness, which "tentative" does. The explanation's
rebuttal ("tentativeness would describe hesitancy in the stating") simply asserts sense 2 and
ignores sense 1. Two defensible answers; STYLE_SPEC §6 violation. Fix replaces A with
*impressionistic*, which contrasts with "firmly worded" so the concessive still works but is killed
by the colon, since it characterizes the *grounds* of the verdict rather than its openness to
revision.

### 2. Q14 (inferences, hard) — **MAJOR**

The keyed option is the **only** one containing a hedge: C reads "is likely to depend," while A says
"proves," B says "causes," D says "indicates how much." Three distractors share the absolutist
feature the key lacks. A test-wise student picks C without reading a word of the stimulus. This is
the exact tell STYLE_SPEC §4 names ("CB keyed answers are hedged") and it is worse here because the
item is slotted **hard**. I checked it against the 38 official Question Bank INF exemplars in this
folder: only 4 (11 percent) put the hedge exclusively in the key, and **none of those is hard**. The
current explanation even advertises the tell — "The hedge matters." Fix hedges choice A and moves
its failure from surface language to content (a time-frame reversal the mouse result refutes).

### 3. Q6 (text-structure-purpose, hard) — **MAJOR**

The stem asks for the **function** of the underlined sentence, but no distractor characterizes the
underlined sentence at all. A describes the final sentence, B describes an unstated motive, D
describes the sentence immediately after the underline. The item is therefore
locate-the-sentence, not identify-the-function, and it collapses the moment a student puts a finger
on the underline. Compare the official hard exemplar for this stem (Question Bank df45f0eb), where
all four options characterize the *same* sentence and differ only in the relation they assign it.
Fix converts B into a same-span, wrong-relation option (a causal reversal: the text attributes the
decline to the *removal* of the shelf, not to the shelf). A fuller repair would convert A or D the
same way.

**Close fourth:** Q22 (transitions, medium). "As a result" survives a first reading — sentence 2 is
phrased as a causal generalization ("clay content largely **determines** how much carbon a soil
retains"), and a specific comparison genuinely does follow from a generalization of that form. The
item survives only on the thin margin of the past-tense "held … after a decade." Fix front-loads the
evidential frame.

---

## Systemic findings

**1. The answer-key letter sequence is patterned and exploitable.**
`C A D B D C A B C D A B | A C D B C A D B C A D B C A B`
From Q17 the sequence runs **C A D B / C A D B / C A B** — two complete four-letter cycles and most
of a third. Q13–Q16 is `A C D B`. A student who notices this at Q21 can guess Q22–Q24 correctly.
This originates in SLOTS.md, not in the authoring, so no per-item fix is legal (letters are
slot-bound), but the form-level key sequence should be re-randomized before shipping. No JSON
finding is emitted for it.

**2. Name collisions — three inside this module, one across modules.**
- *Tuulikki* Rantanen (Q1) and *Tuulikki* Saarinen (Q18)
- Aarthi *Ramanathan* (Q11) and Priya *Ramanathan* (Q26)
- *Constance* Merrow (Q13) and *Constance* Barrow (Q21) — and Merrow/Barrow rhyme
- *Tumelo* Mokoena (M1 Q22) and *Tumelo* (M2 Q9), outside this module's scope but flagged here

The module also carries three Finnish `-nen` surnames (Rantanen Q1, Saarinen Q18, Virtanen Q24),
which pushes against the global-diversity requirement in STYLE_SPEC §4. Fixes are applied to the
cheaper side of each collision (Q11 and Q13, whose names appear in no option and no explanation)
and are checked against `AVOID_NAMES_PT10.txt`.

**3. Two authoring passes are visible in the typography.**
Q1–Q21 and Q26 use straight ASCII quotation marks; Q22, Q23, Q24, Q25 and Q27 explanations use
curly U+201C/U+201D/U+2019; Q23's passage carries a curly apostrophe in "year's"; and Q13's four
option strings mix curly outer double quotes with a straight apostrophe inside. The split falls
almost exactly at the Expression-of-Ideas boundary. Normalization fixes supplied for Q22–Q25 and
Q27; Q13's options are documented and left to editorial choice.

**4. All four words-in-context blanks sit in the final sentence.**
STYLE_SPEC §3.1 permits mid-passage or final-sentence placement; using final-sentence four times out
of four is uniform enough to be a pattern a student can lean on. No fix emitted — this is a
form-level authoring note, not an item defect.

**5. The explanation voice is formulaic across the Craft and Structure block.**
Q1, Q2, Q3 and Q4 each rebut all three distractors using only two mechanisms — "is not supported"
(6 uses in the module) and "is contradicted by" (11 uses). Official rationales vary the mechanism
much more (*describes the whole text rather than the underlined sentence*, *reverses the direction
of the relationship*, *restates the observation the hypothesis was proposed to explain*). The
Information-and-Ideas block does this well (Q7, Q12, Q13 name genuinely different mechanisms); the
WIC block does not.

**6. The hard slots in Craft and Structure use medium templates.**
Q6 (function item with no function distractor), Q13 (the "small act" that illustrates disapproval is
a man taking a coin back from a boy — no student misses it, and the only competing small act shows
him rising early, transparently positive). Q4's difficulty comes from ambiguity rather than
subtlety, which is the wrong kind of hard. Q21 and Q24 are the module's only genuinely hard items,
and both are excellent.

---

## What is genuinely good (do not touch)

- **Q12** is the best item on the form. The keyed finding isolates the named mechanism (bare *smooth*
  tiles + conditioned seawater), choice A supports the *rival* explanation, C changes species, D
  restates the observation the hypothesis was proposed to explain. Four nameable, non-overlapping
  failures.
- **Q21** — the complex-series item. "Three were not:" pre-commits the item count, which is what
  kills choice B (the detached appositive would make four items). Elegant.
- **Q10's table is designed, not decorated.** Per-site occupancy sums are 83/82/84/81, so the inverse
  relation is real rather than assembled, and the "most pronounced" claim survives checking
  (Oakstile gap 47, Hallowfen 41, Dunnet Rise 26, Brackmere 6).
- **Q17** — the dash distractor is a real trap. Choice D produces a fused run-on under either parse
  (paired dashes leave the clauses unjoined; a clause-joining second dash leaves the supplement
  unclosed), and the explanation names it correctly.
- **Q20, Q25, Q26, Q27** all pass their skill-specific attacks unamended. In particular every Q25/
  Q26/Q27 distractor is factually accurate about the notes, so no option can be eliminated without
  reading the goal — the check that most third-party synthesis items fail.
- **Q5 and Q8** are the strongest prose. "the ledger, closed and squared on her desk, no longer
  looked like the end of anything" is a genuine College Board-grade hinge: it forces the key without
  announcing it.

---

## Attack coverage

| Attack | Items where it produced a finding |
|---|---|
| second-defensible-answer | Q4 (BROKEN), Q22 (MAJOR) |
| keyed-answer forced by a span | none — every key is forced by a quotable span |
| outside-knowledge | Q2 (relief-printing physics is backwards), Q8 ("frozen knots" in summer) |
| register | Q4, Q9, Q11, Q13, Q18, Q22, Q23, Q24, Q25, Q27 |
| giveaway | Q7, Q11, Q14 (MAJOR) |
| difficulty-calibration | Q3, Q6 (MAJOR) |
| convention-item (Q15–Q21) | Q16 only; all seven pass mechanical substitution |
| data (Q10, Q11) | Q11 structure only; all figures recomputed and correct |
| transitions (Q22–Q24) | Q22 (MAJOR), Q23 (MAJOR) |
| synthesis (Q25–Q27) | none — all twelve options are factually accurate about the notes |
| explanation | Q2, Q3, Q4, Q6, Q7, Q11, Q14, Q15, Q16, Q23 |

Every `fix` in `CRITIC_M1.json` was applied to a working copy and re-validated: no fix moves a keyed
index, every changed passage stays inside its skill's word band and above its editorial floor with
its blank and underline-marker counts preserved, every changed option set stays inside the 30 percent
parity rule, and every replacement explanation begins with the correct `Choice {KEY}` and lands
inside 150–320 words as a single plain-text paragraph.
