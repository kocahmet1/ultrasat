# Stage 2 — Exam 2 Module 2 (R&W): changes prepared (not yet applied)

Exam `vxxtBSqnVQUPsXu9Xy4B` · R&W Module 2 `Goq368OvlAGDI4ghw4Jx`.
6 operations. Nothing is written until you run the apply script. The 27th question is added as a new document and its ID spliced into the module's `questionIds`; all other edits are in place.

## How to apply

From the `ultrasat` folder:

```
node scripts/applyExam2Module2QCFixes.js --dry-run   # checks + writes a backup, no changes
node scripts/applyExam2Module2QCFixes.js             # applies
```

Backs up every touched question and the module's `questionIds` array to `scripts/output/qc_backup_e2m2_<timestamp>.json` first. The append step is guarded (a marker tag) so re-running won't add the question twice. After it runs, the module should report 27 questions; reload the exam to confirm.

## Changes

1. **Q16 — replaced (was broken).** The old item had two identical answer choices, a wrong key, and duplicated Exam 1's Twombly question. New item is a clean plural-possessive Form/Structure question ("several researchers' contributions…"), correctly keyed to A, four distinct options.

2. **Q20 — re-keyed.** The sentence's main verb is "offers," so the blank must be the participle "counteracting" (D), not the finite "counteracts" (C) which made a run-on. Answer changed C → D; explanation rewritten. Text and options unchanged.

3. **Q17 — typos fixed.** "Kizonba" → **Kizomba** (twice); "the India dance duo" → "the **Indian** dance duo." Answer (D) unchanged.

4. **Q23 — typos fixed.** "Linmocharis fava" → **Limnocharis flava** (twice). Answer (B) unchanged.

5. **Q3 — punctuation fixed.** Added a colon after the blank ("…is ___: featuring tropes…") to resolve the run-on. Answer (D, "visionary") unchanged.

6. **New 27th question added.** The module had 26; the College Board blueprint and this module's mix (Craft & Structure was light, Information heavy) call for a **Words in Context** item, so I added one (Edith Widder's far-red deep-sea camera → "disturbing"), inserted at position 4 with the other Words-in-Context questions. *(This refines the Stage 1 note, which had suggested an Inferences item before I tallied the domain counts.)*

## Not touched (separate passes)

- **Module 1 full rebuild** — 27 new questions to replace the set shared with Exam 1 Module 2. This is the next pass, on your go-ahead.
- **Exam module order** — R&W1 → Math → R&W2 → Math should become R&W1 → R&W2 → Math → Math (one-line reorder on the exam doc). Say the word and I'll prepare it.
- **Difficulty spread** — deferred, as agreed. The new/replaced items carry sensible difficulty labels.
