# QC Chunk 3 — array indices 50–74 (CID-M21 through CID-H05)

Reviewed all 25 items against the CID authoring spec and the 9 failure modes (two defensible answers,
wrong/unsupported key, outside knowledge, real-world falsehood, accidental real people/works, difficulty
misfit, stem/answer mismatch, rebuttal accuracy, tell-tale artifacts).

Note on the id range: the task header said "CID-M21 through CID-H15," but array indices 50–74 in
`cid_100_authored.json` actually run **CID-M21 through CID-H05** (100 items ÷ 4 chunks of 25 = indices
0–24 / 25–49 / 50–74 / 75–99). I reviewed the 25 items at indices 50–74 as explicitly instructed, which
is the internally-consistent reading. If a different 25 items were intended, that needs to be reconciled
against the chunk-1/2/4 boundaries.

## Verdict table

| Item ID | Verdict | Reason (non-OK) |
|---|---|---|
| CID-M21 | OK | — |
| CID-M22 | OK | — |
| CID-M23 | OK | — |
| CID-M24 | OK | — |
| CID-M25 | OK | — |
| CID-M26 | MINOR | Passage reproduces a real, famous published study almost exactly |
| CID-M27 | OK | — |
| CID-M28 | OK | — |
| CID-M29 | OK | — |
| CID-M30 | OK | — |
| CID-M31 | OK | — |
| CID-M32 | OK | — |
| CID-M33 | OK | — |
| CID-M34 | OK | — |
| CID-M35 | MINOR | Passage reproduces a real, famous published study almost exactly |
| CID-M36 | OK | — |
| CID-M37 | OK | — |
| CID-M38 | OK | — |
| CID-M39 | OK | — |
| CID-M40 | OK | — |
| CID-H01 | OK | — |
| CID-H02 | MINOR | "Peveril" collides with the title character of Scott's real novel |
| CID-H03 | OK | — |
| CID-H04 | OK | — |
| CID-H05 | BROKEN | "Achebe-Vance" collides with real novelist Chinua Achebe |

**Counts: 21 OK / 3 MINOR / 1 BROKEN**

---

## BROKEN

### CID-H05 — accidental real-person collision (failure mode 5)

The invented novelist is named **"Roland Achebe-Vance."** "Achebe" is not a generic surname — it is
essentially synonymous with one specific, globally famous author, Chinua Achebe (*Things Fall Apart*),
who is standard reading in American high schools and is exactly the kind of real, identifiable writer
the spec forbids attaching fabricated claims to (§7: "no fabricated text is ever attributed to a real
author"). The item's actual content compounds the risk: it discusses critics accusing this novelist of
"smuggling" a "lesser," genre form into serious literary fiction — a live real-world debate about literary
vs. genre hierarchy that readers already associate with postcolonial African literature and its critical
reception, which is precisely Achebe's own field. A student who recognizes the surname has real grounds
to think the item is making a false claim about the real Chinua Achebe.

This is a global-rename issue, not a single-clause fix: "Achebe-Vance" (or "Achebe-Vance's") appears in
the passage and in all four answer options (A: "Achebe-Vance's work"; B: "Achebe-Vance read... his
literary novels"; C: "Achebe-Vance's notebooks"; D: "Achebe-Vance's novels... his literary reputation").

**Fix:** Globally replace "Roland Achebe-Vance" with an invented name that shares no root with any real
author surname — e.g., "Roland Kessler-Vance" or "Teodor Marchetti-Vance" — in the passage, all four
options, `evidence`, `steps`, and `rebuttals`. No other content change is needed; the underlying argument
(Raghunathan's reframing of the "smuggling" language as the critics' hierarchy, not the novelist's own) is
sound and passes the two-defensible-answers, key-support, and difficulty checks cleanly.

---

## MINOR

### CID-H02 — name collision with a real novel's title character

Lord Verrell's rival is named **"Peveril."** Sir Walter Scott's *Peveril of the Peak* (1823) is a real
Waverley novel whose protagonist is literally named Julian Peveril, and the title refers to a real
Derbyshire landmark (Peveril Castle). Less globally famous than the Achebe collision, so I'm not calling
the item broken, but it is a specific, identifiable, real literary name and should be swapped.
**Fix:** Rename "Peveril" to a different invented courtier name (e.g., "Corvane" or "Denholt") throughout
the passage, options, `hinge`, `evidence`, `steps`, and `rebuttals`.

### CID-M26 — passage reproduces a real, famous study almost exactly

The "frigatebird in-flight sleep" passage matches Rattenborg et al., *"Evidence that birds sleep in
mid-flight,"* Nature Communications (2016) on every distinguishing detail: great frigatebirds, EEG-style
brain-activity recorders, ~10-day foraging trips, sleep bouts of only seconds totaling under an hour per
day (real figure: 0.69 h/day) versus roughly 12 hours on land, and sleep occurring almost exclusively
during upward circling on thermals rather than during the gliding-down phase. The researcher name ("Yuki
Tanabe") is invented, so this doesn't trip failure-mode 5 literally, but it violates the spirit of §7 of
the style spec ("invented studies with invented investigators" — the *study*, not just the person, must
be invented) and creates a prior-knowledge shortcut: a student who has encountered this widely-covered
pop-science story (Audubon, Max Planck press office, etc.) can answer from memory rather than the passage.
**Fix:** Keep the topic (in-flight sleep in a long-duration flying animal) but decouple the specifics —
change the species, the measurement method, and the discriminating mechanism (e.g., have sleep bouts
correlate with a different flight phase or a different environmental cue than thermal-soaring-vs-gliding)
so it no longer maps 1:1 onto the Rattenborg study.

### CID-M35 — passage reproduces a real, famous study almost exactly

The "spider ballooning in an electric field" passage matches Morley & Robert, *"Electric Fields Elicit
Ballooning in Spiders,"* Current Biology (2018): a sealed chamber with air held still, a controlled
vertical electric field switched on and off, and spiders launching only while the field was on. Same
concern as CID-M26 — invented researcher name ("Priya Nandakumar") but a real, specific, widely-covered
experimental design and finding reused wholesale.
**Fix:** Same approach — keep the "windless-day puzzle resolved by a non-aerodynamic trigger" structure
but change the specific stimulus/mechanism and species so the item is no longer a recognizable retelling
of the Morley & Robert design.

---

## Patterns

1. **Real-study reuse is a live risk in the science lane.** Two of the six science items in this chunk
   (M26, M35) are close retellings of specific, well-known real papers, not "invented studies" as the
   spec requires — even though both use fabricated researcher names, which is why a name-only originality
   check wouldn't catch them. Worth a dedicated pass that checks *findings and experimental design*
   against known literature, not just author names, especially for "cool science fact" topics (animal
   sleep, spider ballooning, biosignatures) that are exactly the kind of material likely to already be in
   a training corpus verbatim.
2. **Real-name collisions cluster in literature/humanities items with period or Anglophone-literary
   surnames.** Both collisions found (H02 "Peveril," H05 "Achebe-Vance") are literary-fiction items where
   an invented character or author name happens to reuse a real, specific literary surname. A quick
   surname search against a list of canonical authors/characters before finalizing literature items would
   catch both.
3. **Everything else is clean.** Across all 25 items: no two-defensible-answer cases survived scrutiny
   (every distractor fails on a specific, checkable ground — wrong subject, wrong scope, contradicted
   clause, or unsupported comparison); every "the text doesn't discuss X" rebuttal was verified accurate
   against the passage (no false-silence claims); key-letter distribution across the chunk is close to
   uniform (A 7, B 6, C 6, D 6); correct answers are not systematically the longest or most-hedged choice;
   all technical terms are glossed inline; Hard items' distractors are not eliminable at a glance (the
   detail-as-main-idea distractor is consistently the fastest of the three to rule out, which is expected
   by design, but the wrong-relation and unsupported-comparison distractors reliably require a full read).
4. **Medium DETAIL/BASED_ON items are uniformly well-built.** The "pivot word" mechanism (however/yet/
   instead/rather than) is used consistently and correctly as the hinge, and every DETAIL item's key
   answers the specific sub-group or aspect named in the stem rather than a plausible-sounding adjacent
   fact — this lane has no defects in this chunk.
