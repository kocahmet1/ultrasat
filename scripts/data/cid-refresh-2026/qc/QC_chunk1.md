# QC Chunk 1 — Adversarial Review of CID-E01–CID-E25

Source: `cid_100_authored.json`, array indices 0–24 (the first 25 of 30 "easy" items; the easy
tier runs CID-E01–CID-E30, so CID-E26–CID-E30 are out of scope for this review).

Method: for every item, the strongest possible passage-only case was built for each distractor
(failure mode 1), every clause of the keyed choice was checked against the passage (failure mode
2), technical terms were checked for inline glossing (failure mode 3), factual/scientific/
historical claims were checked against real-world knowledge (failure mode 4), every proper noun
was checked against real people/works (failure mode 5), stem/answer alignment and rebuttal
accuracy were checked clause-by-clause (failure modes 7–8), and the batch was checked
computationally for length/position/hedging artifacts (failure mode 9).

## Verdict table

| ID | Verdict | Reason (non-OK only) |
|---|---|---|
| CID-E01 | OK | |
| CID-E02 | OK | |
| CID-E03 | OK | |
| CID-E04 | OK | |
| CID-E05 | OK | |
| CID-E06 | OK | |
| CID-E07 | OK | |
| CID-E08 | OK | |
| CID-E09 | OK | |
| CID-E10 | OK | |
| CID-E11 | OK | |
| CID-E12 | MINOR | Passage overstates when expressive/atmospheric stage lighting began; real theater history predates the stated 1930s threshold |
| CID-E13 | OK | |
| CID-E14 | OK | |
| CID-E15 | OK | |
| CID-E16 | OK | |
| CID-E17 | OK | |
| CID-E18 | OK | |
| CID-E19 | OK | |
| CID-E20 | OK | |
| CID-E21 | OK | |
| CID-E22 | OK | |
| CID-E23 | MINOR | "Ixchiu" is a real, culturally specific Guatemalan Maya surname tied to real public figures |
| CID-E24 | OK | |
| CID-E25 | MINOR | Title echoes Woolf's "A Room of One's Own"; author surname matches real Dutch poet Gerrit Achterberg |

**Totals: 22 OK / 3 MINOR / 0 BROKEN**

## BROKEN

None in this chunk. For every one of the 25 items, only the keyed choice survived an adversarial
attempt to defend each distractor using the passage alone; every clause of every key is licensed
by a quotable sentence; no item requires outside knowledge (all technical terms — *tun*,
*metabolic activity*, *fractoemission*, *conservators*, *woodblock*, *marimba/resonator tube*,
*copper-red glaze* — are glossed inline); and every rebuttal's "the text doesn't discuss…" or
"contradicts the text…" claim checked out against the passage. Structural integrity (4 options,
valid key index, trapTypes/rebuttals keyed to exactly the 3 non-key letters, no duplicate option
text) was verified programmatically for all 25 with no errors.

## MINOR

### CID-E12 — hum-stage-lighting-designer
**Defect (failure mode 4, real-world coherence):** The setup sentence, "Until the 1930s, stage
lighting in most American theaters was chiefly practical: its purpose was to make the actors
visible," compresses theater history more than is defensible. Expressive/atmospheric lighting
was already a known American commercial-theater practice well before 1930 (e.g., David Belasco's
naturalistic lighting effects from the 1900s–1910s, the "New Stagecraft" movement of the
1910s–1920s). It does not touch the correct answer (B is still uniquely supported), so the item
is answerable as written, but a student could walk away with a mildly false timeline.
**Fix:** Remove the falsifiable date/scope claim, e.g. replace with: "In much of American
commercial theater, stage lighting was still treated chiefly as practical — its purpose was to
make the actors visible." This keeps the contrast Halvorsen exemplifies without asserting a
specific incorrect historical cutoff.

### CID-E23 — hum-marimba-ensemble
**Defect (failure mode 5, accidental real name):** "Ixchiu" is not a generic invented surname —
it is a specific K'iche' Maya surname associated with real, publicly known Guatemalan
indigenous-rights figures. Pairing it with an invented first name ("Teodora") still creates
unnecessary collision risk under the spec's own rule that names must be invented, not merely
unfamiliar-sounding.
**Fix:** Replace "Teodora Ixchiu" with a fully invented surname with no real-world referent, e.g.
"Teodora Balan-Reyes" or "Teodora Wexler" (either preserves the international-name feel the spec
wants without the collision).

### CID-E25 — lit-market-day-debut
**Defect (failure mode 5, accidental real works, two independent instances):** (1) The novel
title "A Stall of One's Own" is a transparent pun on Virginia Woolf's "A Room of One's Own"
(1929) — one of the most recognizable titles in English letters, and exactly the kind of
"invented name that collides confusingly with a famous real one" the spec prohibits. (2) The
invented author's surname, "Achterberg," matches Gerrit Achterberg, a well-known Dutch poet.
Neither affects the correctness of the key (A is still the only defensible answer), but both
violate the originality constraint in §7 of the style spec.
**Fix:** Retitle to something that doesn't echo Woolf, e.g. "The Thursday Stall," and rename the
author, e.g. "Wilhelmina Brandt-Osei," to clear both collisions at once.

## Patterns

1. **Distractor-template monotony is the dominant systematic issue.** 20 of 25 items (80%) use
   the identical distractor skeleton — exactly 2× `out-of-scope` + 1× `reversal`, with the
   reversal built by restating the passage's "before/expected" half of an Instead/But/However
   pivot as if it were the finding. This is spec-compliant (§3 explicitly allows "3×T1, or
   2×T1+1×T2" for Easy) and each individual instance is well-executed, but the batch reads as
   templated. Only 5 items deviate: CID-E14 and CID-E16 substitute a `word-lift` for the reversal
   slot; CID-E19 and CID-E21 use 3×`out-of-scope`; CID-E22 substitutes an
   `unsupported-comparison`. Across all 75 distractors in the chunk: out-of-scope 51 (68%),
   reversal 21 (28%), word-lift 2 (2.7%), unsupported-comparison 1 (1.3%), and zero
   detail-as-main-idea/overreach/wrong-relation (correctly reserved for Medium/Hard).
   Recommend converting 3–4 more reversal slots to word-lift, which is markedly underused given
   it is the trap type the spec calls out as especially effective against keyword-matching.

2. **The reversal trick is learnable.** Because the reversal distractor is built the same way in
   nearly every research-report item (negate the pivot sentence), a coached student could develop
   a content-free heuristic — "whichever choice describes what people originally expected/assumed
   is wrong" — that works across most of this chunk. This mirrors the official College Board
   pattern per the spec and is not a defect, but it's worth naming since it's the single most
   repeated move in the batch.

3. **Literary MAIN_IDEA keys often bundle two clauses rather than one.** CID-E02, CID-E09,
   CID-E10, and CID-E11 build the correct choice from two separate explicit statements (e.g.
   CID-E02: "accepts the work as an obligation" + "hides its difficulty from her father") rather
   than a single pointable clause. Both halves are always directly stated, never inferred, so
   none of these were downgraded, but they sit at the upper edge of the Easy-tier "one clause"
   ideal in §5 of the spec and are worth a second look in a future pass.

4. **No exploitable calibration signal in this chunk.** Correct-answer letter distribution is
   A7/B7/C6/D5 (28/28/24/20%), close to uniform. Longest-choice-is-key rate is 20% (spec's
   required range is 20–33%). Key hedge-word rate (20%) modestly exceeds distractor hedge rate
   (14.7%) but not enough to make "hedged ⇒ correct" reliable. A student guessing purely from
   length, hedging, or letter position would not beat chance on this chunk.

5. **Stem-type coverage in this slice is MAIN_IDEA/DETAIL only (12/13, 0 BASED_ON or other).**
   The full easy tier is CID-E01–E30; CID-E26 (outside this chunk) is stemType BASED_ON, so the
   tier's §1.3 target mix (39% MAIN_IDEA / 44% DETAIL / 12% BASED_ON / …) likely depends on
   CID-E26–E30 to balance out. Flagging so whoever reviews that chunk checks the full 30-item
   easy-tier stem mix lands near target, since E01–E25 alone is 48%/52%/0%.

6. **Underlying science/history is unusually well-grounded where it was checked.** Several
   "invented" studies closely and correctly track real research: CID-E01's urchin
   behavioral-shift mechanism matches documented "urchin barren" ecology; CID-E06's tardigrade
   trehalose finding matches the real post-2008 research trajectory (trehalose insufficient,
   other protectants implicated); CID-E14's reduction-fired copper-red glaze is technically
   accurate ceramics; CID-E22's near-vent volcanic lightning height/timing matches real
   volcanology on fractoemission vs. ice-charging. This is a strength worth naming, since failure
   mode 4 otherwise turned up nothing besides the CID-E12 soft overstatement.
