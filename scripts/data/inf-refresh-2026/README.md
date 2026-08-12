# Inferences refresh — 2026

100 newly authored SmartQuiz items for the `inferences` subcategory: **30 easy / 40 medium / 30 hard**.
All original. Written to a spec measured from 214 official College Board Inferences items.

## Files

| file | what it is |
|---|---|
| `INF_STYLE_SPEC.md` | The authoring spec. Every number in it is measured from the 140-item official export plus 74 INF items in `scripts/output/pt5-build/bank.json`. Read this first — it is the reason the items look the way they do. |
| `src/inf-01..10-*.json` | The 100 authored items, 10 per file, in a rich format (passage, options, key, per-choice failure family, rationale, per-choice rebuttal, takeaway, and for hard items the `eliminative` clause). |
| `AVOID_NAMES_TOPICS.txt` | 194 proper names and topics harvested from the official items. The validator fails any item that reuses one. |
| `validate.py` | QC gate. Checks every measured band plus set-level balance. |
| `qc_overlap.py` | Originality check against all 214 official items, giveaway check, internal-consistency check. |
| `build-payload.py` | Converts `src/*.json` → `questions-payload.json` in the live `questions` schema. |
| `questions-payload.json` | Generated. What actually gets written to Firestore. |

## Deployment status — 2026-08-07

**Applied to the live database:**

1. `retireAndImportInferences.js` ran clean: 83 old pool questions soft-retired, 100 new imported,
   verified live (backup: `scripts/backups/inferences-refresh-2026-08-07T13-22-25-120Z.json`).
2. `detachRetiredInferences.js --from-backup` ran clean: the 83 retired docs no longer match any
   subcategory query (`subcategory` → `retired-inferences`, `subcategoryId` removed and preserved
   in `retiredSubcategoryId`). This was needed because the *deployed* SmartQuiz code does not
   filter `usageContext`. Backup: `scripts/backups/inferences-detach-2026-08-07T13-36-48-652Z.json`.

**Pending a web deploy:** `apps/web/src/utils/smartQuizUtils.js` now filters SmartQuiz candidate
pools through `filterServablePool()` — retired questions are never served, and exam-context
questions are excluded whenever the general pool can fill a quiz. Until this deploys, SmartQuiz
inference quizzes draw from the 100 new questions plus the 108 exam-context questions (the exam
mixing is pre-existing behavior, not a regression).

**Note:** the project's Firestore daily **read** quota was exhausted during final verification
(writes unaffected). Reads recover at midnight US Pacific time.

**Explanation rendering (2026-08-07, later the same day):** the deployed ExplanationCard renders
only `explanationStructured` (never the flat `explanation`), and the deployed bundle shows no
per-option notes and no rebuttals section. Two fixes:

1. *Data (already live, writes-only):* `build-payload.py` now derives the walkthrough `steps`
   from each item's full rationale, so the reasoning renders in the card's Walkthrough.
   (A same-day stopgap that also appended rebuttals to `steps` was reverted once the inline
   per-option notes were confirmed rendering on the deployed site — the notes were simply
   styled too much like the choice text to be noticed.)
2. *Code (takes effect on next web deploy):*
   - `SmartQuiz.jsx` passes `hideRebuttals={false}` so the toggled card shows its full
     "Why the other choices fail" section alongside the inline notes (product decision: both places).
   - `SmartQuizRunner.css` restyles `.sqr-option-note` as a labeled annotation box — mono
     uppercase kicker ("Why it's correct" / "Why it's wrong"), soft tint fill, state-colored
     left rule — so the notes are visually distinct from the choice text. The redundant inline
     "This is the best choice. / Not quite." prefixes were removed in favor of the kicker.

## How to ship it

```bash
cd <repo root>
python3 scripts/data/inf-refresh-2026/validate.py        # must print ERRORS (0)
python3 scripts/data/inf-refresh-2026/build-payload.py   # regenerates the payload
node scripts/retireAndImportInferences.js --dry-run      # prints the plan, writes nothing
node scripts/retireAndImportInferences.js                # backs up, retires, imports
```

Retirement is **soft**: existing Inferences questions get `usageContext: 'retired'`, which
`isGeneralUseQuestion()` in `smartQuizUtils.js` already filters out. Nothing is deleted, so past
SmartQuiz sessions and `userProgress` rows still resolve. Questions with `usageContext: 'exam'`
belong to practice tests and are left alone unless you pass `--include-exam`.

Every run writes a full backup to `scripts/backups/inferences-refresh-<timestamp>.json`.
Undo with:

```bash
node scripts/retireAndImportInferences.js --rollback scripts/backups/<file>.json
```

## Measured fidelity of the new set

| | official CB | this set |
|---|---|---|
| stem wording | invariant (140/140) | invariant (100/100) |
| blank at end of stimulus | 140/140 | 100/100 |
| stimulus words — easy / med / hard | 90 / 91 / 100 | 79 / 86 / 96 |
| sentences — easy / med / hard | 5.2 / 4.3 / 3.8 | matches ladder |
| option words — easy / med / hard | 13.2 / 14.5 / 20.1 | 14.5 / 14.7 / 17.8 |
| key is the longest option | 19% | 23% / 15% / 17% |
| negative or limiting key — easy / med / hard | 0% / 25% / 28% | 0% / 32% / 33% |
| key contains a hedge | 37% | 13% / 25% / 33% |
| answer-key letters | — | A 25 · B 26 · C 24 · D 25 |

Hard items run slightly shorter than official hard items (96 vs 100 words) and hard options
slightly shorter (17.8 vs 20.1). Both are inside the official p10–p90 band.

## Originality

Checked against all 214 official Inferences items:

- Highest content-word similarity of any new item to any official item: **Jaccard 0.080**
  (unrelated expository passages typically score 0.03–0.09).
- Verbatim 5-gram overlap: one item, one gram — `"this finding suggests that"`, which is a
  required CB lead-in idiom appearing in five official items.
- Zero reuse of any name, place, organism, artwork, study, or dataset from `AVOID_NAMES_TOPICS.txt`.
- No repeated proper name or topic anywhere inside the new set of 100.

## What is deliberately *not* in here

- No hedge-scanning shortcut. At least one distractor hedges wherever the key does, and the same
  rule is enforced for negation and contrast. A student cannot scan for "may" or "not".
- No degrees-of-correctness rebuttals. `validate.py` fails any rebuttal containing "less precise",
  "not the best", or "better answer". Every rebuttal names a mechanical failure from one of the
  seven families in §3 of the spec.
- No outside knowledge. Every keyed answer is forced by a quotable span of its own passage.
