# Stage 1 QC — Practice Exam 1, Reading & Writing Modules 1 & 2

**Scope:** English (R&W) Modules 1 and 2 only. Math modules not reviewed.
**Reference standard:** College Board official SAT Practice Tests 4 & 5 (R&W modules) — 132 questions analyzed.
**Data source:** Firestore. Exam 1 = `IcRvQJmEg0pyW2vTv0pB`. Module 1 doc = `62S6QRLJIRQaR0xfQurX`, Module 2 doc = `COUaD8uRujchbMej3MT1`. Questions live in the `questions` collection; each module holds an ordered `questionIds` array.

**This is a findings-only report. No changes have been made. Corrections wait for your approval (Stage 2).**

---

## Headline

Each module is supposed to have 27 questions. Both modules have 27 IDs, **but several point to deleted/empty question documents**, so fewer than 27 actually render:

- **Module 1: 4 blank questions** → only 23 render.
- **Module 2: 1 blank question** → only 26 render.
- **2 questions reference a graph/chart that does not exist** (broken — unanswerable as shown).
- **Every question is labelled "medium."** No easy/hard spread, which you specifically asked about.
- **5 pairs of questions are duplicated or near-duplicated across the two modules** (same passage or same template). A student taking both modules will see repeats — College Board never does this within one test.

Severity legend: 🔴 blocker (must fix before publish) · 🟡 quality/style · 🔵 minor/polish.

---

## A. Missing questions (🔴 must produce new questions)

These IDs exist in the module's question list but the underlying document is gone. They render as blanks.

| Module | Position | Dangling ID | Needed type (to keep CB domain balance) |
|---|---|---|---|
| 1 | Q9 | `DQEjlzeyhcwKmAnq4SqS` | Central Ideas & Details, or Command of Evidence (textual) |
| 1 | Q12 | `qOKK86nOp5cEkPQnejPM` | Command of Evidence (quantitative/graph) |
| 1 | Q21 | `vppzeudePma4yTmj7RlL` | Standard English — Boundaries or Form/Structure/Sense |
| 1 | Q23 | `6ggs5FUyaHiu40nMLiWh` | Transitions |
| 2 | Q21 | `9uTnBz3o08WiQZKNL8FI` | Standard English — Form/Structure/Sense |

The "needed type" column is my recommendation so the rebuilt module keeps the College Board question-type distribution and ordering. Confirm and I'll generate replacements in Stage 2.

---

## B. Missing / broken graphics (🔴)

**Module 1, Q11 — FTA agricultural-export graph is missing.** The stem says *"The graph shows the results for three countries in the study,"* and all four answer choices depend on reading growth-rate bars for Mexico, Nicaragua, and El Salvador. `graphUrl` is null. As shown, the question can't be answered from the data given — it needs the actual bar graph produced. (Correct answer B is internally consistent, so the item is salvageable once the graph is built.)

**Module 2, Q12 — "Spoiled vs. Unspoiled" bar graph is missing.** The text contains only a bracketed placeholder describing a graph ("*[A bar graph is shown with pairs of bars…]*") with **no real values**. The task asks which two stories best illustrate the varying gap — impossible to answer without numbers. This needs a real graph with defined values, and the answer key must be re-derived from those values. Currently broken.

**Module 2, Q10 — copper table is embedded as raw text, not a rendered table.** The data is present (so it's answerable), but it displays as an inline markdown table rather than a styled figure like College Board uses. 🟡 Recommend converting to a proper table graphic for consistency.

---

## C. Cross-module duplication (🟡 strong recommend fix)

Same passage or same note-set template reused across Modules 1 and 2 of the *same* exam:

| Module 1 | Module 2 | Nature of overlap |
|---|---|---|
| Q3 (film critics / Sumiko Higashi) | Q2 | **Essentially identical** passage and answer ("perception of"). |
| Q5 & Q6 (George Eliot, "Rev. Amos Barton" / Mr. Ely) | Q6 | **Same passage** reused; near-identical answer choices. |
| Q14 (Ballard, *Empire of the Sun* — autobiographical) | Q14 (Ocean Vuong — autobiographical) | Same template, author swapped. |
| Q26 (Oahu birds: *Leptecophylla* / *Passiflora*) | Q23 (Oahu birds: *Peydrax* / *Cestrum*) | Same note set, species renamed. |
| Q27 (torsional heating: EPDM / natural rubber) | Q26 (torsional heating: EPDM / NiTi wire) | Same 2019 study template, one fiber swapped. |

Recommend replacing one side of each pair with a fresh passage/topic. I'd keep Module 1's version and regenerate Module 2's, or vice-versa — your call.

---

## D. Broken or incoherent question text (🔴 / 🟡)

- 🔴 **Module 2, Q5** — the sentence does not parse: *"But simple, unadorned stages that were likely ____ audiences in the very highly decorated and detailed sets were not common until the 1600s."* The clause structure is broken and no answer choice can make it coherent. Needs a full rewrite of the passage.
- 🟡 **Module 2, Q24 and Q27** — both are Rhetorical Synthesis (notes) items but **omit the standard stem line** "While researching a topic, a student has taken the following notes:" and jump straight into bullets. Inconsistent with every other notes question and looks truncated. Add the missing stem line.
- 🟡 **Module 2, Q1** — "his 1989 work *Enthrace*" appears to be a fabricated/misspelled title (not a known Allan Houser work). College Board uses real works. Recommend correcting to a real piece or a clearly generic reference.

---

## E. Smaller text/typo issues (🔵)

- **M1 Q2** — mismatched quotation marks around *outstanding universal value* (straight open, curly close).
- **M2 Q4** — mid-sentence capitalization "UK Economists"; slightly clunky but answerable.
- **M2 Q19** — director name "Katsitsiouii Fox" (real name is Katsitsionni Fox).
- Several stems use invented researcher names (e.g., "Yuzo R. Yanagisuru"). This is fine and on-style for SAT *as long as* it isn't a garbled version of a real name — flagging for awareness, not necessarily fixing.

---

## F. Subcategory mis-tagging (🟡 affects ordering & adaptivity)

- **M2 Q10** tagged `rhetorical-synthesis` — it is actually **quantitative Command of Evidence** (data from table).
- **M2 Q12** tagged `rhetorical-synthesis` — actually **quantitative Command of Evidence** (graph).

Re-tagging matters because the module order and any adaptive logic key off subcategory.

---

## G. Difficulty range (🟡 — you flagged this explicitly)

**Every one of the 54 questions is labelled `difficulty: "medium"."`** College Board Module 1 is a fixed easy→hard mix, and Module 2 (in an adaptive test) skews per the student's Module 1 performance. Our reference set spans a clear easy/medium/hard range.

Recommendation for Stage 2: relabel existing items to an approximate CB spread (roughly 30% easy / 45% medium / 25% hard) and ensure new/replacement questions fill the easy and hard ends — especially Words-in-Context (should include 1–2 easy) and the later Command-of-Evidence / Inference items (should include genuinely hard ones with tightly competing distractors).

---

## H. Question ordering vs. College Board (🔵)

CB fixes the within-module order: Words-in-Context → Text Structure/Purpose → Cross-Text → Central Ideas → Command of Evidence (textual then quantitative) → Inferences → Boundaries → Form/Structure/Sense → Transitions → Rhetorical Synthesis.

Both modules mostly follow this, with minor deviations:
- M1 Q4 and M2 Q5 place an **Inference** item early (inside the Craft & Structure cluster) instead of within Information & Ideas.
- M2's two quantitative items (Q10, Q12) are scattered among textual evidence items rather than grouped.

Low priority, but easy to reorder in Stage 2 while we're editing.

---

## What's actually good (context for calibration)

The bulk of the items are on-style and correctly keyed. Answer keys I checked are correct; distractors on the strong items (e.g., M1 Q6 cross-text on molybdenum, M1 Q13 fish-vortex support, M2 Q10 copper table) are constructed the CB way — plausible, parallel, and each traceable to a specific misreading. M1 Q20 even correctly uses Twombly's deliberate spelling "Iliam." So the fixes below are targeted repairs, not a teardown.

---

## Proposed Stage 2 work order (on your approval)

1. Produce 5 new questions for the missing slots (Section A) — matched to the recommended types, difficulty-balanced.
2. Build the 2 missing graphs (M1 Q11, M2 Q12) and re-derive/confirm the M2 Q12 answer key.
3. Rewrite M2 Q5 (broken passage); fix M2 Q24/Q27 stems; fix M2 Q1 title.
4. De-duplicate the 5 cross-module pairs (Section C) by regenerating one side of each.
5. Re-tag M2 Q10 & Q12; apply a difficulty spread across both modules.
6. (Optional) Reorder the few out-of-sequence items.

Tell me which of these you want, and whether to keep Module 1 or Module 2 versions of the duplicated pairs.
