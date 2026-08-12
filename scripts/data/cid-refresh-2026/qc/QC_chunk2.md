# QC Review — Chunk 2 (indices 25–49, CID-E26 through CID-M20)

Reviewer stance: adversarial. Every distractor was tested by attempting to build the strongest
possible case for it using only the passage. Quantitative checks (word counts, key-letter
distribution, hedging/absolutes, topic uniqueness, structural integrity) were run against the
full 100-item file for context, but only items in this chunk (indices 25–49) were scored.

**Result: 19 OK / 6 MINOR / 0 BROKEN.**

No item in this chunk has a genuinely defensible second answer, an unsupported key, a required
piece of outside knowledge, a real-world falsehood, or a real-person/real-work collision. The
MINOR findings below are real but non-fatal: a length tell, an unglossed term, a duplicated
invented surname, and two items whose invented studies sit uncomfortably close to a famous real
scientific/documentary controversy. See **Patterns** for chunk-wide construction habits that are
worth fixing even though no single item is broken by them.

---

## Verdict table

| ID | Verdict | Reason (non-OK) |
|---|---|---|
| CID-E26 | OK | — |
| CID-E27 | OK | — |
| CID-E28 | OK | — |
| CID-E29 | MINOR | Key is the longest choice by a clear margin (length tell) |
| CID-E30 | MINOR | Key is the longest choice; Easy distractor mix uses T5, not spec's T1/T2 |
| CID-M01 | OK | — |
| CID-M02 | OK | — |
| CID-M03 | OK | — |
| CID-M04 | OK | — |
| CID-M05 | OK | — |
| CID-M06 | OK | — |
| CID-M07 | OK | — |
| CID-M08 | OK | — |
| CID-M09 | MINOR | Premise closely mirrors the real film *The Thin Blue Line* (1988) |
| CID-M10 | OK | — |
| CID-M11 | OK | — |
| CID-M12 | OK | — |
| CID-M13 | OK | — |
| CID-M14 | OK | — |
| CID-M15 | MINOR | Invented surname "Oyelaran" duplicated from CID-M09 |
| CID-M16 | OK | — |
| CID-M17 | OK | — |
| CID-M18 | MINOR | "iambic pentameter" used without the spec-mandated inline gloss |
| CID-M19 | OK | — |
| CID-M20 | MINOR | Study design closely mirrors the real "mother tree" mycorrhizal controversy |

---

## BROKEN section

None. No item in this chunk has a defensible second answer, an unlicensed key, a required piece
of outside knowledge, or a real-world/real-person collision. This was checked adversarially for
all 25 items (see method note above) — three items in particular were stress-tested hardest
because their MAIN_IDEA keys rest on a subjective/interpretive final clause (CID-M02, the
governess-letter metaphor; CID-M09, the film scholar's reading of intent; CID-M15, the
composition-vs-preservation claim) and all three held up: in each case the "reversal" distractor
is directly and explicitly contradicted by a quoted clause, not merely unlikely.

---

## MINOR section

**CID-E29** (pigeon-magnetoreception). Key D ("They depend on the sun, so a distorted magnetic
field matters little," 13 words) is noticeably longer than A/B/C (10 words each) — a length tell
in a 4-option Easy item. Content itself is fine (directly licensed by "Valjakka proposes that
pigeons rely on the sun when it is visible and turn to magnetic cues only when it is not"). *Fix:*
shorten D to ~10 words, e.g. "They rely on the sun, not the distorted magnetic field." — and/or
add a clause to one distractor so no option stands out by length.

**CID-E30** (hum-brutalist-library). Key C (17 words) is longer than A/B/D (14/12/12). Also, the
distractor set is 2×out-of-scope + 1×unsupported-comparison (choice B), where the style spec
prescribes only T1/T2 for Easy items (3×T1, or 2×T1+1×T2) — functionally harmless here since B is
still cleanly eliminable in one pass, but a taxonomy deviation. *Fix:* trim C to match distractor
length (e.g., "A common criticism of a style is described, and one building is offered as a
qualification," 14 words), and either re-tag B honestly as an accepted Easy-tier T1 variant or
replace it with a true T2 reversal, e.g. "Nagayama's library is criticized as even more indifferent
to its users than most brutalist buildings."

**CID-M09** (hum-documentary-reenactment). No real name is used, but the scenario — a 1988
documentary about a disputed [investigative] event, criticized by reviewers for "long reenacted
sequences," which a scholar later reappraises as deliberately varying each reenactment to match a
different witness's account and thereby dramatizing the unreliability of memory — reproduces the
real critical history and actual technique of Errol Morris's *The Thin Blue Line* (1988) closely
enough that a film-literate student would likely recognize it. Doesn't create a wrong-answer risk
(outside knowledge here would reinforce the keyed answer, not undermine it), but it violates the
spirit of the originality constraint. *Fix:* change the reenactment mechanism so it no longer
maps 1:1 onto Morris's method — e.g., have the variation be stylistic (lighting/pacing) rather
than "changing details... according to the testimony of a different survivor" — and/or move the
subject away from a forensic/investigative event (shipwreck) to something non-forensic (a
festival or folk-ritual reenactment film).

**CID-M15** (hum-choreographer-notation). The choreographer is "Naima Oyelaran." CID-M09 in this
same chunk names an unrelated film scholar "Marta Oyelaran," and a full-file grep shows "Marta
Oyelaran" is reused again verbatim in CID-H07 (outside this chunk). All names are invented, so
this isn't a real-person collision, but reusing a distinctive invented surname across unrelated
scholars in the same 25-item block (and a third time elsewhere) suggests no bank-wide name-dedupe
pass was run. *Fix:* rename one of the two — e.g., "Naima Oyelaran" → "Naima Kettering" — and run
a full-bank uniqueness check on all invented proper names before publication.

**CID-M18** (hum-poetry-translation-meter). "The loose iambic pentameter common in English
narrative verse" uses "iambic pentameter" without an inline parenthetical gloss, unlike every
other technical term in this chunk (crosshatching, walking, path integration, biofilms, opsins,
forgone wages, permafrost, dance notation, mycorrhizal fungi, etc., all glossed on first use per
spec §2.4). The item is still answerable from context alone ("common in English narrative verse"
supplies the needed fact — familiarity to English readers — without requiring the reader to know
the term's scansion), so this is not outside-knowledge-required in practice, but it breaks the
spec's own "glossing is mandatory" rule. *Fix:* add a gloss on first use, e.g., "the loose iambic
pentameter (a ten-syllable line alternating unstressed and stressed beats) common in English
narrative verse."

**CID-M20** (mycorrhizal-carbon-transfer). The invented study — labeling mature trees' carbon,
tracing it through fungal networks, finding it mostly stays in the fungi rather than reaching
seedlings, thereby overturning the popular "trees feed shaded seedlings" narrative — closely
tracks a real, well-known, currently active research controversy (Suzanne Simard's popularized
"mother tree"/"wood wide web" hypothesis and its real 2023–24 critical reassessments, e.g. Karst
et al. and Henriksson et al., which found evidence for meaningful seedling-directed transfer
weaker than the popular narrative claims). The underlying science in the item is coherent and not
false — if anything it aligns with the more rigorous, skeptical position in the real debate — and
no real name is used, so this does not rise to BROKEN. But the specific combination of isotope
tracer + mature "mother" trees + shaded seedlings + a network-skeptical finding is distinctive
enough to be recognizable to a well-read student. *Fix:* differentiate the design from the real
literature's signature setup — e.g., swap carbon for a different traded resource (phosphorus or
nitrogen), or restrict the network's role to storage/drought-buffering between mature trees only
(no seedlings), so it no longer reproduces the famous "mother tree feeds seedlings" claim
point-for-point.

---

## Patterns

**1. Medium passages run systematically long against the spec's own target.** The style spec
sets Medium passage length at mean 88 / median 86 words, with "target 75–100 words for the
overwhelming majority of items" and an explicit warning against manufacturing difficulty by
adding length. Measured across the 20 Medium items in this chunk: mean 106.75 words, range
96–138. Excluding the one literary item (CID-M02, 138 words, covered by the spec's literary
exception), the 19 non-literary Medium passages range 96–109 words, and only two of those
nineteen (96, 97) fall anywhere near the stated 75–100 target — the other seventeen all sit above
it. No single item exceeds the outer observed bound (141), so this isn't a per-item defect, but
the whole block is drifting long and should be trimmed by roughly 15–20 words per item in a
revision pass.

**2. Stem types are batched, not interleaved.** Every one of the 20 Medium items in this chunk
(CID-M01–M20) is stemType MAIN_IDEA, and all 5 Easy items (CID-E26–E30) are BASED_ON/
BEST_DESCRIBES with zero DETAIL or MAIN_IDEA. A full-file check shows this is a sequencing
artifact, not an aggregate imbalance: the bank's 40 Medium items are exactly 20 MAIN_IDEA / 20
other types (a perfect 50% match to spec), and the 30 Easy items are 13 DETAIL / 12 MAIN_IDEA / 4
BASED_ON / 1 BEST_DESCRIBES (also a close match to spec proportions) — but all the non-MAIN_IDEA
Mediums live in CID-M21–M40, and all the DETAIL/MAIN_IDEA Easys live in CID-E01–E25. Aggregate
composition is healthy; delivery order is not. Anything that serves items in ID order rather than
shuffled will produce a run of 20 consecutive main-idea questions in the same format. Worth
flagging to whoever consumes this file downstream even though it isn't a content defect.

**3. The Medium out-of-scope distractor is a template.** 17 of the 20 Medium items in this chunk
use the same flavor of out-of-scope choice: a hedged ("may"/"likely"/"might") claim about a
real-world application, a practitioner's future influence, or a downstream consequence beyond the
passage's scope (engineers borrowing the finding, other practitioners adopting the technique,
staffing/logistics tangents, etc. — e.g., CID-M01, M03, M05, M06, M07, M08, M09, M10, M11, M12,
M13, M14, M15, M17, M18, M19, M20). Each instance is individually a valid, correctly-rebutted T1,
but the repetition is a learnable shortcut: a test-taker could eliminate "the choice that
speculates about future application or other people's reactions" without reading the passage.
This distractor also lands on option D specifically in 12 of the 16 items where D isn't the key —
combined with D being the key in 8/25 items in this chunk (32%, vs. a 25% target — though the
full 100-item bank is exactly 25/25/25/25 across all four letters, so this skew is fully absorbed
elsewhere), option D in this chunk is very often either the answer or the speculative-application
filler. Recommend diversifying the fourth-choice construction recipe (more word-lifts, more
unsupported comparisons, more reversed-relation choices) rather than defaulting to "plausible
real-world extension."

**4. Anti-heuristic calibration is otherwise healthy.** Automated check across the chunk: correct
answer is strictly the longest choice in 6/25 (24%, within the 20–33% target band); correct
answer contains a hedge word in 5/25 (20%, vs. official ~29% — acceptable); correct answer
contains an absolute in 2/25 (8%, close to official ~7%). Distractor hedge rate is 32% (vs.
official ~18%), elevated by the speculative-application template in Pattern 3 — this pushes
slightly toward an inverse "hedged-sounds-wrong" tell but not far enough to be exploitable on its
own. No structural defects: every item has exactly 4 options, a key in range, exactly 3 rebuttals
and 3 trapTypes entries, and a unique topic tag (checked against all 100 items, zero collisions).

**5. Glossing discipline is otherwise strong.** Of roughly a dozen technical terms introduced
across this chunk (crosshatching, walking, mastership, path integration, type revivals,
biofilms, staged reenactment, isoglosses, opsins, forgone wages, permafrost, dance notation,
mycorrhizal fungi), all but one ("iambic pentameter," CID-M18 — see MINOR) are glossed inline on
first use exactly per spec §2.4.

**6. Name generation is diverse but not deduplicated across the batch.** Researcher/author names
in this chunk are well-invented (deliberately cross-cultural, no matches to real, identifiable
researchers, authors, or titles found — "The Winter Term," "Thin Ice," "The Halloway Governess,"
"The Ridge of Ash," "gridscore," and "Verrona" were each checked against real-world works/products
and none collide). The one exception is the repeated surname "Oyelaran" (CID-M09, CID-M15, and
CID-H07 elsewhere in the bank) — see MINOR above.
