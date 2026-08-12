# Command of Evidence refresh — 2026

100 new Command of Evidence items (30 easy / 40 medium / 30 hard) authored against a
specification measured from **226 official College Board items** exported from the SAT Question
Bank, to replace the existing Command of Evidence bank used by Smart Quizzes.

## What's here

| File | What it is |
|---|---|
| `COE_STYLE_SPEC.md` | **The standard.** Every number in it is measured from the 226 official items — subtype shares, stimulus and option lengths per family per difficulty, distractor taxonomies with counts, difficulty levers, rationale formulas, prohibitions. Read this before authoring anything else in this skill. |
| `AUTHORING_BRIEF.md` | Output schema and the rules that cut across all batches. |
| `manifest.json` | The 100 item slots with their assigned difficulty, family, subtype, stem type, topic lane, polarity and **answer-key letter**, fixed before authoring so the composition could not drift. |
| `src/*.json` | The authored items, in seven batches by family and difficulty. This is the editable source. |
| `assets/*.png` | 20 rendered charts, matplotlib, College Board visual register. |
| `graph-images.json` | The same 20 charts as base64 data URIs (same shape as `scripts/output/qc_images.json`). |
| `avoid_terms.txt` | 1,350 proper nouns extracted from the official export. Nothing in the new bank reuses them. |
| `render_graphs.py` | Regenerates the charts from the `figure` blocks in `src/`. |
| `validate.py` | Structural + spec-conformance checks. Run after any edit. |
| `build-coe-questions.js` | Emits `coe-questions.json` in the live question-document shape (field parity with the wic-refresh-2026 set: `usageContext`, `contentSetVersion`, `skillTags`, `explanationStructured`, charts inlined as data URIs). |
| `../../retireAndRefreshCommandOfEvidence.js` | The canonical cutover script, sibling of `retireAndRefreshWordsInContext.js`. Dry-run by default; `--status` / `--retire` / `--import` / `--rollback`. |

## Shipping it

```bash
python3 scripts/data/coe-refresh-2026/validate.py          # expect: ISSUES: 0
node scripts/data/coe-refresh-2026/build-coe-questions.js  # -> coe-questions.json
node scripts/retireAndRefreshCommandOfEvidence.js --status
node scripts/retireAndRefreshCommandOfEvidence.js --retire --apply
node scripts/retireAndRefreshCommandOfEvidence.js --import --apply
node scripts/retireAndRefreshCommandOfEvidence.js --status # confirm 100 general
```

Retirement flips old docs to `usageContext:'retired'` + `retired:true` (the two fields
`getQuestionsBySubcategory()` excludes, server-side and client-side) rather than deleting, so
`questionStats`, past `responses` and coach history keep resolving. Every touched doc is backed
up to `scripts/backups/` first and `--rollback <file> --apply` restores it. Exam-attached
questions are never touched.

**Deployed to production 2026-08-07**: 102 old pool questions retired, 100 imported, 158
exam-context and 95 exam-attached docs untouched. Verified live: the app's narrowed query
returns 30 easy / 40 medium / 30 hard, all `coe-refresh-2026-08`.

> Quota note: `--status` once contained a full-collection scan that exhausted the Spark-plan
> daily read quota mid-deploy (the project has since moved to Blaze). The scan is now behind
> `--deep-scan`. Don't full-scan `questions` casually — it's one read per doc.

## What the bank actually contains

| | Easy | Medium | Hard | total |
|---|---|---|---|---|
| Quantitative — table | 13 | 9 | 7 | **29** |
| Quantitative — graph | 6 | 7 | 7 | **20** |
| Textual: Finding | 4 | 10 | 11 | **25** |
| Quotation — literary | 6 | 8 | 2 | **16** |
| Quotation — sourced | 1 | 6 | 3 | **10** |
| **total** | **30** | **40** | **30** | **100** |

Answer key exactly 25 A / 25 B / 25 C / 25 D, no letter three times consecutively.
Quantitative stems: 30 blank-completion (easy-heavy) · 14 describe-that-support (hard-heavy) ·
5 use-to-support. 5 weaken items (4 hard, 1 medium, 0 easy — the official rate is 5%).
Zero hard quantitative items are direct lookups, matching the official bank.

## The three things imitators get wrong, and what was done about them

1. **Command of Evidence is half a data-reading test.** 49% of the official bank is a table or a
   graph. Third-party banks write 10–20% and mostly at the "read one cell" level. This set is 49%
   quantitative with the official table/graph split.
2. **The trap moves with difficulty.** Easy quantitative distractors are 83% data misreads. Hard
   ones are 52% *correct readings attached to the wrong conclusion* — the numbers in the wrong
   options are right. An item whose hard distractors are wrong numbers is mis-levelled.
3. **95% of the bank is "support," not "weaken."** Publishers overuse weaken badly. Five per
   hundred, concentrated in hard, none easy.

## Known deviations from the spec

Recorded honestly so the next pass knows where to look.

- **Easy and medium rationales run short** — 152 and 190 words against measured bands of 183–200
  and 199–220. Hard is on band at 232. The rationales are structurally complete (opening formula,
  claim restated verbatim, a mechanism named for every rebuttal, 27% concessive openings against
  an official 18–31%); they are simply terser than College Board's.
- **Literary sources are invented, not real.** College Board quotes genuine public-domain works.
  Quoting 64 passages from memory guarantees misquotation, so the works and authors here are
  invented and written in period register — the same choice already made in `wic-refresh-2026`.
  See `COE_STYLE_SPEC.md` §7.
- **The "name the exception" template is over-used in the medium quantitative band** — roughly
  half those items state a general trend and ask for the row that breaks it. It is a genuine
  College Board structure but should be diluted to about a third.
- **Finding-item keys skew short** (44% are the shortest option against an official 26%). Overall
  the bank is 18% key-longest / 16% key-shortest against an official 30% / 17%, so no answer
  position is length-cued, but this family could be rebalanced.
- **Options run long in the textual families.** Quotation options average 42 words against an
  official 23–35, and finding options 28–30 against 18–26. This is fallout from the fix for the
  length tell: the original drafts had the key as the longest option in 45 of 51 textual items —
  answerable without reading — so distractors were lengthened to match. Passage lengths are all
  on band; the right next step is to trim keys and distractors together rather than to revert.

## Provenance

Source export: `questionbank-export-2026-8-5 (11).pdf` — 226 official items with rationales
(56 easy / 69 medium / 101 hard), all skill = Command of Evidence. Two independent adversarial
review passes were run over the authored set; every factual defect they found against the figure
data was fixed, along with the "key is the longest option" tell that made the quotation families
answerable without reading.
