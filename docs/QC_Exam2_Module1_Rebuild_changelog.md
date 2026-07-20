# Stage 2 — Exam 2 Module 1: full rebuild (prepared, not yet applied)

Exam `vxxtBSqnVQUPsXu9Xy4B` · R&W Module 1 `5COidioj5VkQlG22UrY9`.

**Why a rebuild:** Module 1 currently points to the exact same 27 question documents as Exam 1 Module 2. This pass creates **27 brand-new questions** as new documents and repoints Module 1 to them. The old shared documents are **never modified or deleted** — they stay in use by Exam 1 Module 2.

## How to apply

From the `ultrasat` folder:

```
node scripts/rebuildExam2Module1.js --dry-run   # checks + writes a backup, no changes
node scripts/rebuildExam2Module1.js             # creates 27 docs, repoints Module 1
```

The backup stores Module 1's previous `questionIds`, so rollback is just restoring that array. The script is guarded (marker tag) so re-running won't duplicate. After it runs, Module 1 should show 27 fresh questions; reload to confirm.

## What the new module contains

**College Board domain blueprint (27 questions):**

| Domain | Count | Questions |
|---|---|---|
| Words in Context | 4 | 1–4 |
| Text Structure & Purpose | 2 | 5–6 |
| Cross-Text Connections | 1 | 7 |
| Central Ideas & Details | 2 | 8–9 |
| Command of Evidence (2 textual, 1 graph, 1 table) | 4 | 10–13 |
| Inferences | 2 | 14–15 |
| Boundaries | 3 | 16–18 |
| Form, Structure & Sense | 4 | 19–22 |
| Transitions | 2 | 23–24 |
| Rhetorical Synthesis | 3 | 25–27 |

Domain groupings: Craft & Structure 7 · Information & Ideas 8 · Standard English Conventions 7 · Expression of Ideas 5 — matching the official blueprint.

**Difficulty spread (built in, not deferred):** 6 easy, 15 medium, 6 hard.

**Answer key positions balanced:** A 7 · B 7 · C 6 · D 7 (drafted keys were skewed to A; I redistributed and re-verified every explanation's letter references against the reordered options).

**Two figures generated** (PNG, same as Exam 1): a bar graph (Q11, tree canopy vs. afternoon temperature) and a table (Q12, rechargeable battery comparison). Both verified to support their keyed answers.

**Content is all-new and non-duplicating** — checked against Exam 1 (both modules, post-fix) and Exam 2 Module 2; no overlap. Real-world anchors were fact-checked where used (e.g., Voynich manuscript dating, Morpho structural color, the Spanish cave-art dating debate, the desert-ant step-counting experiment).

## Topics (for a quick scan)

Florence Price; elephant infrasound; 3D-printed prosthetics; railroads & industrialization; Sarah Orne Jewett (adapted); Morpho butterfly color; Neanderthal cave-art dating debate (Text 1/Text 2); Willa Cather's *O Pioneers!* (adapted); the Voynich manuscript; desert-ant navigation; urban tree canopy & heat (graph); rechargeable batteries (table); *Mamenchisaurus* neck hypotheses; the axolotl; inflation & constant-price output; kintsugi; the quipu; auroral sounds; riverbank tree-planting; archaeology (future perfect); a city committee (pronoun); John Muir (parallelism); cacti vs. ocotillo; flexible bridge design; the kora & Toumani Diabaté; stalactites vs. stalagmites; the Rosetta Stone.

## Still open

- **Exam module order** — R&W1 → Math → R&W2 → Math should become R&W1 → R&W2 → Math → Math (one-line reorder on the exam doc). Quick to prepare whenever you want it.
- **Global difficulty relabel** for the *older* questions across exams — deferred, as agreed.
