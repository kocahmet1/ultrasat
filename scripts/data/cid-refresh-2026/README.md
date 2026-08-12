# Central Ideas and Details — 2026 refresh

100 newly authored Central Ideas and Details items (30 easy / 40 medium / 30 hard), built to match
the measured profile of the 138 official College Board items in the question-bank export.

**Nothing here has been written to Firestore.** The upload script is dry-run-verified only.

---

## What the dry run found

```
Existing 'central-ideas-details' questions in Firestore:  181
  to retire (usageContext general or absent):              84
  left alone (already exam-scoped):                        97
```

The 84 retirable items are the ones smart quizzes currently serve. The 97 exam-scoped ones belong
to practice tests and are untouched. Note that several of the current 84 quote real copyrighted
literature directly (*Things Fall Apart*, Douglass's 1845 narrative) and many use generic stems
("The following text is from a discussion on renewable energy") — neither pattern appears in the
official bank.

---

## Files

| file | what it is |
|---|---|
| `CID_STYLE_SPEC.md` | The reverse-engineering. Measured length/stem/genre/trap distributions from the 138 official items, the trap taxonomy, the anti-heuristic calibration targets, and what actually moves difficulty. **Read this first** — it is the reusable asset. |
| `SLOTMAP.json` | The 100 prescribed slots: id, difficulty, stem type, genre, correct-answer letter, topic. Generated so the batch's distributions match the official ones exactly rather than by chance. |
| `lane_A..G.json` | Slot subsets used to parallelize authoring. |
| `src/lane_*.out.json` | Raw per-lane authoring output. |
| `cid_100_authored.json` | **The batch.** All 100 items, patched and validated. |
| `patch_decouple.json` | Rewrites for 5 items that reproduced real studies too closely. |
| `patch_trim1/2.json`, `patch_trim_lit.json` | Length-calibration patches. |
| `qc/QC_chunk1..4.md` | Adversarial review reports (4 reviewers × 25 items). |
| `cid_100_authored.prefix.json` | Pre-fix snapshot, for diffing. |

Pipeline code lives outside this folder:

- `scripts/lib/cidDocBuilder.js` — authoring record → Firestore document
- `scripts/retireAndUploadCid.js` — backup, retire, upload, rollback

---

## Running it

```bash
node scripts/retireAndUploadCid.js --dry-run     # read-only; prints the plan and a sample doc
node scripts/retireAndUploadCid.js               # backup -> retire 84 -> create 100
node scripts/retireAndUploadCid.js --retire-only
node scripts/retireAndUploadCid.js --upload-only
node scripts/retireAndUploadCid.js --rollback scripts/backups/cid_refresh_<ts>.json --delete-created
```

**Retiring is a `usageContext` flip, not a delete.** Question documents have no `retired`/`active`
field; the only soft-retire mechanism in this codebase is `usageContext`, which every practice
surface filters on (`questionBankServices.js:287`, `smartQuizUtils.js:752`, `questionsAPI.js:807`).
Retired items get `usageContext: 'retired'` — distinct from `'exam'`, so genuine exam questions stay
distinguishable — plus `retiredAt` and `retiredBy`. A full JSON backup of every touched document is
written to `scripts/backups/` before any write, and the script refuses to run twice without
`--force`.

---

## Schema gotchas this batch is built around

- **`correctAnswer` must be a number.** `SmartQuiz.jsx:219` scores with a strict `===` against the
  raw field. A string answer — which `docs/sample_questions_with_user_input.json` still shows —
  marks every attempt wrong, silently. The builder always emits a 0-based index.
- **`explanationStructured`**, not `structuredExplanation`. The latter appears nowhere in the repo.
- **`usageContext: 'general'`** is what makes a question visible to smart quizzes.
- Both **`subcategory` and `subCategory`** are written with the same kebab value, plus numeric
  `subcategoryId: 1`, because the fetcher queries all three as separate fallbacks.
- The API importer (`POST /api/questions/import`) dedupes on **exact `text` equality**. 44 of these
  items share the stem "Which choice best states the main idea of the text?", so importing this
  batch through that path would skip almost all of them. Use the node script.

Each doc also carries `authoringId` (e.g. `CID-M17`) and `authoringBatch: 'cid-refresh-2026'`, so
the batch can be re-found, re-patched, or removed later.

---

## Calibration

Measured against the 138 official items.

| | passage words (ours / CB) | range | sd | choice words (ours / CB) |
|---|---|---|---|---|
| easy | 92.6 / 88 | 76–124 | 8.8 | 12.6 / 12.9 |
| medium | 91.4 / 88 | 63–123 | 12.1 | 16.9 / 17.1 |
| hard | 104.0 / 98 | 90–148 | 12.9 | 26.2 / 23.7 |

Overall spread 63–148 against the official 48–159.

Difficulty is carried by the **answer choices**, which grow 108% from easy to hard, while passages
grow 12% — matching the official pattern. Manufacturing hard items with longer passages is the most
common way commercial banks miss.

**Anti-heuristic** — a student who never reads the passage must not beat 25%:

| signal | ours | official |
|---|---|---|
| correct answer is longest choice | 26% | 27% |
| correct answer is shortest choice | 23% | — |
| hedged (correct / wrong) | 32% / 24% | 29% / 18% |
| absolutes (correct / wrong) | 12% / 9% | 7% / 11% |
| answer letter | A25 B25 C25 D25 | A28 B26 C18 D28 |

**Composition** — genre: 32 science / 28 humanities / 25 literature / 15 social science.
Stems: 44 MAIN_IDEA, 22 DETAIL, 11 BASED_ON, 6 BEST_DESCRIBES, 6 SUGGEST, and a tail of
SUPPORTED_BY / WHICH_QUESTION / INDICATE / MAIN_PURPOSE / AGREE_WITH — reproducing the official
mix, including the collapse of "According to the text" from 44% of easy items to 2% of hard ones.

**Traps** — 106 out-of-scope, 60 reversal, 56 detail-as-main-idea, 29 wrong-relation,
28 unsupported-comparison, 18 overreach, 3 word-lift. Every distractor is tagged; every medium item
carries at least one distractor that is literally true but subordinate.

---

## QC

Four independent adversarial reviewers, 25 items each, instructed to break the items:
**84 OK / 15 MINOR / 1 BROKEN**. No item was found to have two defensible answers or an unsupported
key. Every defect was in originality or calibration hygiene, and all were fixed:

- **Real-name collisions** — `Achebe-Vance`, `Okonkwo`, `Peveril`, `Ixchiu`, `Achterberg`, `Vrba`,
  and a Woolf-echoing title were replaced. A full-bank scan now shows no reused surname and no
  collision with a real author, character, or researcher.
- **Real-study reproductions** — 5 items (frigatebird in-flight sleep, spider ballooning in electric
  fields, mother-tree carbon transfer, *The Thin Blue Line*, FRB 180916) reproduced famous real
  research closely enough that a well-read student could answer from memory. All five were
  re-engineered with different organisms, mechanisms, and measurements while preserving the keyed
  answer and each distractor's trap.
- **Calibration** — three keys were detectable by length; one over-attributed intent; one asserted a
  false theater-history timeline; one left "iambic pentameter" unglossed.

### Known limitations

- 11 of the 30 hard items run `wrong-relation + overreach + unsupported-comparison` instead of the
  spec's prescribed `wrong-relation + overreach/comparison + detail-as-main-idea`. The items are
  sound; the trap mix is just narrower than the official one.
- Easy items lean on a repeated distractor skeleton (2 × out-of-scope + 1 × reversal, the reversal
  built by negating the pivot). This matches the official easy pattern but is learnable in bulk.
- Literary passages are **original prose written in period register, attributed to invented authors
  and titles.** The official bank uses genuine public-domain excerpts. This is a deliberate
  divergence — fabricated text is never attributed to a real writer — but it means students will not
  encounter the specific canonical authors the real exam draws on.
