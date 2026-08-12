# QC Chunk 4 — Adversarial Review of CID-H06–CID-H30 (indices 75–99)

Source: `cid_100_authored.json`, array indices 75–99. Note: the task's ID pointer ("CID-H16
through CID-H30") and the actual index range disagree — indices 75–99 hold CID-H06 through
CID-H30 (25 items, all `difficulty: hard`). Reviewed all 25, per the instruction to cover any
preceding hard items that fall inside the index window.

Method: for every item, the strongest possible passage-only case was built for each distractor
(failure mode 1); every clause of the keyed choice was checked against the passage individually,
since Hard choices are compound claim+qualifier+relation propositions (failure mode 2); every
technical term was checked for outside-knowledge dependence (failure mode 3); every
science/history claim was checked for real-world coherence, including targeted web searches for
claims that looked unusually specific (failure mode 4); every researcher/author/title/character
name was checked against real people and works, including a full-100-item duplicate-name scan
(failure mode 5); the Hard-item "three choices in ten seconds" test was applied to every
distractor set (failure mode 6); stem/key alignment and rebuttal accuracy were checked
clause-by-clause (failure modes 7–8); and the batch was checked computationally for
length/hedging/absolute/position artifacts against `CID_STYLE_SPEC.md`'s measured targets
(failure mode 9).

**Result: 22 OK / 3 MINOR / 0 BROKEN.**

No item in this chunk has a genuinely defensible second answer, an unsupported key component, a
requirement for outside knowledge, or a real-world scientific/historical falsehood. The three
MINOR findings are real but non-fatal: one confirmed cross-bank duplicate invented name, one key
whose final clause is the most inferentially loaded in the set (still clearly the best of four,
but worth tightening), and one invented study that reproduces a specific, identifiable, and
moderately famous real astronomical finding closely enough to raise a test-security concern. See
**Patterns** for chunk-wide construction habits — most notably a systematic gap in the Hard-tier
trap recipe — worth fixing even though they don't sink any single item.

---

## Verdict table

| ID | Verdict | Reason (non-OK) |
|---|---|---|
| CID-H06 | OK | — |
| CID-H07 | MINOR | "Marta Oyelaran" is an exact-string duplicate of the unrelated film scholar in CID-M09 |
| CID-H08 | OK | — |
| CID-H09 | OK | — |
| CID-H10 | OK | — |
| CID-H11 | OK | — |
| CID-H12 | MINOR | Key's final clause ("the feeling…is itself part of Barros's design") mildly over-attributes intent |
| CID-H13 | OK | — |
| CID-H14 | OK | — |
| CID-H15 | OK | — |
| CID-H16 | OK | — |
| CID-H17 | OK | — |
| CID-H18 | OK | — |
| CID-H19 | OK | — |
| CID-H20 | OK | — |
| CID-H21 | OK | — |
| CID-H22 | OK | — |
| CID-H23 | OK | — |
| CID-H24 | OK | — |
| CID-H25 | OK | — |
| CID-H26 | OK | — |
| CID-H27 | OK | — |
| CID-H28 | OK | — |
| CID-H29 | MINOR | Scenario closely reproduces the real, well-publicized 16-day FRB 180916.J0158+65 finding |
| CID-H30 | OK | — |

---

## BROKEN section

None. For all 25 items, only the keyed choice survived an adversarial attempt to build the
strongest possible passage-only case for each distractor. Every clause of every key was traced to
a specific quotable phrase or a licensed inference (checked component-by-component per the
"compound proposition" warning in spec §1.2/§5, since Hard choices bundle a claim + qualifier +
relation). No item requires outside knowledge to resolve — every technical term (chromatin,
melanosome, sedimentary ancient DNA, ocean alkalinity enhancement, magnetar, phase separation,
etc.) is either glossed inline or usable without specialist background. Every rebuttal's "the text
doesn't…" or "contradicts…" claim was checked against the passage and holds. Structural integrity
(4 options, valid key index, trapTypes/rebuttals keyed to exactly the 3 non-key letters, no
duplicate option text) was verified programmatically for all 25 with zero errors, and all 25 topic
tags are unique across the full 100-item file.

Four items were stress-tested hardest because their keys rest on a single interpretive final
clause with no directly quotable anchor (CID-H09, the cousins' ignorance of the atlas contents;
CID-H12, Weight Room's paradox of authorship; CID-H20, the directionality of DNA displacement;
CID-H26, the footnotes undercutting their own authority) — all four held up: in each case the
strongest competing distractor is refuted either by a direct textual contradiction or by an
explicit absence the passage draws attention to, not merely by implausibility.

---

## MINOR section

**CID-H07** (lit-poem-quarry-sonnet). A full-file scan for duplicate invented proper names found
that "Marta Oyelaran," the poet credited with "At the Sandstone Quarry" (1908), is an *exact*
string match for the film scholar "Marta Oyelaran" in CID-M09 (chunk 2's report already flagged
this from its side and noted CID-H07 was "outside this chunk" at the time). The surname
"Oyelaran" additionally appears a third time as a different first name, "Naima Oyelaran," in
CID-M15. Neither collides with a real person, and nothing in H07 itself is broken — the poem, its
content, and its key all check out independently. But two unrelated invented people sharing an
identical full name in the same 100-item bank is a confirmed bank-hygiene defect, not a
coincidence a QC pass should wave through. *Fix:* rename the poet in CID-H07 to a name with no
match elsewhere in the bank, e.g. "Marta Ferreira" or "Marta Solberg," and run a full-bank
first+last-name uniqueness pass before publication (a two-word capitalized-token scan across all
100 passages, as run for this review, takes seconds and would have caught this immediately).

**CID-H12** (hum-installation-viewer-role). Key C reads: "Weight Room produces a strong impression
of visitor authorship while constraining what visitors can actually contribute, so the feeling of
having made the work is itself part of Barros's design." The first two clauses are directly
licensed ("almost any body moving through will produce almost the same field"; visitors "leave
describing the piece as something they made"). The third clause — that the *feeling itself* is
"part of Barros's design" — reads as attributing intent to Barros regarding the psychological
effect, when the passage only establishes her intent regarding the physical consistency of the
rods' output. This is the most inferentially loaded key clause in the chunk. It remains the best
of the four options by a clear margin (no distractor is remotely as well supported — checked
adversarially), so this does not rise to BROKEN, but it sits at the edge of "licensed implication"
versus "unlicensed extension." *Fix:* soften the clause to something the design facts alone carry,
e.g. "…so the feeling of authorship persists despite a design built to limit what any one visitor
can change," which keeps the irony without claiming Barros engineered the emotional response
itself.

**CID-H29** (fast-radio-burst-magnetar). The invented source "FRB 20211109" — bursts confined to a
five-day window recurring every sixteen days, two competing explanations (companion-star wind
occultation vs. a precessing/wobbling magnetar), and a reported finding that higher-frequency
bursts arrive earlier in the window — was checked against real astronomy and matches the real,
well-known repeater **FRB 180916.J0158+65** to an unusual degree: its real activity window is
"about 5 days" within a "16.35-day period" (CHIME/FRB, widely reported in 2020 by Nature, Universe
Today, EarthSky, etc.), and real follow-up work (e.g., Pastor-Marazuela et al.) documents exactly
the frequency-dependent behavior described — "the active window begins earlier and becomes
narrower at higher frequencies." Real competing explanations for the periodicity also include both
a binary-companion-wind model and a precessing-neutron-star model, matching the passage's "two
accounts." Neither the FRB designation "20211109" nor the researcher name "Anneke Broekhuis"
matches a real catalog entry or a real person (both checked via search), so this is not a literal
real-name collision under failure mode 5, and the item is fully self-answerable from the text
alone with no contradiction — a student who *did* recognize the real case would land on the same
keyed answer (B), not a different one, since the real epistemic state (consistent with, but not
exclusive to, one hypothesis) matches what the item wants. Still, reproducing a specific, famous,
easily-searched real finding this closely under a fig-leaf ID number is a test-security and
originality risk in a high-stakes bank — a prepared student could recognize the setup instantly,
and the item's "invented study" premise is invented in label only. *Fix:* de-identify the
scenario from the real case by changing the numbers (e.g., a nine-day window recurring every
twenty-two days) and/or reversing which frequency band arrives earlier, while keeping the
two-hypothesis structure and the hedged "a pattern X could produce" framing that make the logic
work.

---

## Patterns

**1. The mandated Hard distractor recipe (spec §3: "1 × T7 + 1 × T5-or-T4 + 1 × T3") is followed
in only 9 of 25 items; the T3 slot is the one that goes missing.** `CID_STYLE_SPEC.md` calls
`detail-as-main-idea` (T3) "the highest-quality trap" and requires exactly one per Hard item,
alongside one `wrong-relation` (T7) and one `overreach`-or-`unsupported-comparison` (T4/T5). A
trapType tally across the chunk shows 11 of 25 items (CID-H10, H13, H15, H17, H18, H20, H22, H25,
H26, H27, H29) instead run T7 + T4 + T5 together — doubling the overreach/comparison slot and
dropping T3 entirely. A further 3 items (CID-H16, H23, H28) substitute `out-of-scope` (T1, the
Easy-tier trap) for the T3/T5 slot, and CID-H07 uses `reversal` (T2, the Medium-tier trap) in the
T7 slot. Only CID-H06, H08, H09, H11, H12, H14, H19, H21, H24 (and H30, which legitimately swaps
in `word-lift`/T6 — spec-endorsed for its DETAIL stem type) match the prescribed recipe exactly.
None of this breaks any individual item — every T1/T2 substitute was individually verified to
still survive the ten-second test because the *other* two distractors in the same item carry real
difficulty — but the T3 gap is a systematic drift away from the spec's own stated highest-value
trap, worth correcting in a revision pass by converting some of the doubled T4/T5 slots into true
"true-but-a-supporting-detail" distractors.

**2. `unsupported-comparison` is positionally frozen at C/D, never A/B — a mechanically learnable
partial shortcut.** The trap appears in 20 of 25 items (80%) and, across all 20 instances, lands
at C in 7 and D in 13; it never once appears at A or B. Complementing this, `wrong-relation`
(present in 24/25 items) lands at A or B in 22 of 24 instances. A student who has seen enough of
this bank could learn "scan C and D first for a claim comparing two things the passage never set
side by side" as a content-free first pass. It doesn't fully solve any item (the key itself is
fairly evenly distributed — see Pattern 4 — so eliminating the comparison choice narrows 4 options
to 3, not to 1), but it is a real, evidence-based, fixable pattern. *Recommend:* when authoring the
T5 slot, rotate it into the A/B positions in some fraction of items instead of defaulting to C/D.

**3. No exploitable calibration signal beyond Pattern 2.** Computed against spec §4's targets:
correct answer is the strict-longest choice in 7/25 (28%, within the 20–33% band); key hedge rate
is 36% vs. distractor hedge rate 31% (a 5-point gap — nowhere near reliable enough to make "hedged
⇒ correct" work, consistent with spec's warning); key absolute-word rate is 28% vs. distractor 31%
(essentially flat, no signal); correct-answer letter distribution is A5/B7/C7/D6 (20/28/28/24%,
close to the spec's ~25%-uniform target, with A slightly under-represented). Structural integrity
(4 options, valid key, matched trapTypes/rebuttals sets, no duplicate option text) is clean across
all 25 with zero errors.

**4. Passage and choice lengths run mildly long against the Hard-tier baseline, but not
alarmingly.** Spec §1.1 gives Hard passages as mean 98 / median 91 words; this chunk measures mean
108.8 / median 100 (~10–11% over), driven partly by the six literature excerpts (mean 138.7 words,
within spec's allowed 120–160 literary exception) and partly by the 19 non-literature passages
running at mean/median 99 (right at the edge of, but consistent with, the tier's own baseline
rather than the more aggressive universal "75–100" guidance). Choice lengths are well-calibrated:
mean 25.8 words overall (spec: mean 23.7) and mean 27.8 for the MAIN_IDEA subset specifically
(spec: mean 26.2) — both close to target, nothing resembling the runaway length drift chunk 2
found in the Medium tier.

**5. Rebuttal and key-clause quality is strong.** Every rebuttal's factual claim about the passage
("the text doesn't discuss…," "the text doesn't compare…," "this contradicts…") was checked and
holds; none misstates what the passage does or doesn't say. Clause-by-clause verification of all
25 keys (required for Hard items, where each choice is claim+qualifier+relation) found only the
one soft over-attribution in CID-H12 noted above — every other key's every component traces to a
specific quotation or a tightly licensed inference.

**6. Underlying science/history is well-grounded, with one exception.** Spot-checked and confirmed
scientifically coherent: quantum-dot core/shell blinking suppression, chromatin-accessibility
duration vs. CRISPR editing efficiency, urban-heat thermal-mass asymmetry (masonry districts
running hottest after midnight), biomolecular-condensate aging and cellular protein turnover, and
the asymmetric diagenetic drift of phaeomelanosome vs. eumelanosome shape under heat/pressure (an
actual live question in fossil-color paleontology). The one item whose real-world grounding is
*too* precise rather than false is CID-H29 (see MINOR) — the underlying science is entirely
accurate, which is exactly the problem: it's recognizably a real, specific, famous case rather than
a generic invented one.

**7. Minor-weight name reuse beyond CID-H07, not rising to individual verdicts.** A first-name
"Ruth" is reused across three unrelated invented people (CID-H12's critic Ruth Adeyemi, CID-E30's
architect Ruth Nagayama, CID-M40's architect Ruth Amankwah), and the surname "Baptiste" is reused
across CID-H27's paleontologist Solenne Baptiste and CID-M36's 1893 playwright Cornelius Baptiste.
Both are common enough real-world names, and differ enough in the paired first name/role, that
these read as unremarkable coincidences rather than confusing collisions — unlike the exact
full-string "Marta Oyelaran" duplicate — but combined with Pattern 1 of chunk 2's report (the
"Oyelaran" surname used three times bank-wide), it reinforces that no bank-wide name-deduplication
pass has been run. Worth a single automated pass before publication.
