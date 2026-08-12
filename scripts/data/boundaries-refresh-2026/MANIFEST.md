# Boundaries refresh 2026 — as-built manifest

100 authored items replacing the current Boundaries bank in Smart Quizzes.
Spec: `BOUNDARIES_STYLE_SPEC.md`. Validator: `node scripts/validateBoundariesRefresh.js`.

## Files

| file | items | contents |
|---|---|---|
| `src/bnd-01-easy-a.json` | 15 | BND-E01 – E15 |
| `src/bnd-02-easy-b.json` | 15 | BND-E16 – E30 |
| `src/bnd-03-medium-a.json` | 14 | BND-M01 – M14 |
| `src/bnd-04-medium-b.json` | 13 | BND-M15 – M27 |
| `src/bnd-05-medium-c.json` | 13 | BND-M28 – M40 |
| `src/bnd-06-hard-a.json` | 15 | BND-H01 – H15 |
| `src/bnd-07-hard-b.json` | 15 | BND-H16 – H30 |
| `src/official-proper-nouns.json` | 709 | proper nouns extracted from the official export — avoid-list |
| `src/official-passages-index.json` | 211 | official passages — 8-gram overlap check |

Reference corpus: `questionbank-export-2026-8-5 (16).pdf`, 211 official College Board
Boundaries items (61 Easy / 54 Medium / 96 Hard) with official rationales.

## Item schema

```jsonc
{
  "id": "BND-H12",
  "difficulty": "easy" | "medium" | "hard",
  "family": "sentence-boundary | supplementary-element | no-punctuation-seam |
             coordination | series | colon | relative-clause | subordinate-main |
             titles-proper-nouns | interrogative",
  "menu": "full | boundary | bracket | connector | series | complex-series | interrogative",
  "convention": "…",          // verbatim from the official rationale vocabulary
  "keyMark": "comma | none | period | semicolon | colon | dash | question mark",
  "lane": "natural-science | social-science | humanities-arts | literature | history-civics",
  "hardLever": "comma-camouflage | false-completeness | rare-keyed-mark",   // hard items only
  "passage": "… ______ …",    // exactly one blank
  "options": ["…", "…", "…", "…"],
  "key": 0,                   // 0-indexed
  "why": "Choice {L} is the best answer. The convention being tested is …",
  "rebuttals": { "B": "…", "C": "…", "D": "…" },   // text follows "Choice X is incorrect because"
  "remember": "…"             // one-line takeaway for the review screen
}
```

The stem is constant and is **not** stored per item:
> Which choice completes the text so that it conforms to the conventions of Standard English?

## As-built distribution

| | easy | medium | hard | total |
|---|---|---|---|---|
| **items** | 30 | 40 | 30 | **100** |
| mean passage words | 38.2 | 44.7 | 46.3 | — |
| *(official)* | *39.9* | *49.2* | *48.1* | |
| mean untested commas | 1.8 | 2.8 | 3.3 | — |
| *(official)* | *2.16* | *2.69* | *3.21* | |

**Answer key:** A 25 · B 25 · C 25 · D 25. No three consecutive identical letters.

**Keyed mark**

| mark | easy | medium | hard | total | official share |
|---|---|---|---|---|---|
| comma | 13 | 15 | 4 | 32 | 28% |
| none (∅) | 8 | 8 | 6 | 22 | 22% |
| period | 5 | 4 | 6 | 15 | 16% |
| semicolon (incl. complex series) | 0 | 6 | 7 | 13 | 15% |
| dash | 1 | 4 | 3 | 8 | 6% |
| colon | 0 | 3 | 4 | 7 | 7% |
| question mark | 3 | 0 | 0 | 3 | 3% |

Difficulty-locked, matching the official bank: no colon or semicolon keys an easy
item; the interrogative family is easy-only.

**Family**: sentence-boundary 22 · supplementary-element 21 · no-punctuation-seam 14 ·
coordination 11 · series 10 · colon 7 · relative-clause 5 · subordinate-main 4 ·
interrogative 3 · titles-proper-nouns 3.

**Option menu**: full 34 · boundary 22 · bracket 22 · connector 9 · complex-series 6 ·
series 4 · interrogative 3.

**Topic lane**: natural science 31 · humanities & arts 23 · social science 16 ·
history & civics 15 · literature 15.

## Quality process

1. Authored against the spec, which was measured from all 211 official items.
2. `validateBoundariesRefresh.js` — 20 automated checks: option count, single blank,
   rebuttal coverage, rationale opening, convention vocabulary, keyMark/key agreement,
   passage-length bands, answer-key balance, consecutive-letter runs, the §5.9
   equivalence constraint (never a period *and* a semicolon at one clause boundary),
   lowercase-after-period, proper-noun reuse, and 8-gram overlap with the official bank.
3. Three independent adversarial audits (one per difficulty band) looking for
   double-keyed items, false rebuttals, misquotes, and false real-world claims.
   38 items were revised as a result — see `patch-02.js`.
4. Regression audit of all 38 revised items; 6 further defects fixed in `patch-03.js`.
5. Final regression audit of those 6; the last one (M40, false natural history about
   gliding possums) rebuilt in `patch-04.js` on the same grammatical structure.

`patch-01.js` (comma-density calibration and answer-key rebalancing) through
`patch-04.js` are kept as an audit trail. They are idempotent-unsafe — each edit must
match exactly once and the scripts abort without writing otherwise, so they should not
be re-run against the current files.

### What the audits actually caught

Worth recording, because these are the failure modes to watch for in the next
subcategory refresh:

- **Two defensible answers** (4 items). Always at the joints §5.9 predicts: a bare
  semicolon offered against a comma-plus-FANBOYS key; a single dash introducing a
  final appositive; a comma before a contrastive "but" in a compound predicate, which
  CMOS 6.22–6.23 permits.
- **Boundary-menu capitalization** (4 items). The period option must carry the
  capitalized first word of the new sentence — `"assumption. A"`, not `"assumption."`.
  Now checked automatically.
- **False real-world claims** (13 items). Invented history attached to real places
  (Karviná, Valparaíso), extinction narratives attached to extant IUCN-assessed
  species, and physiology that does not hold. Every named place, species, and process
  now either is invented outright or carries only claims that survive checking.
- **Rationale drift** (9 items). Quoted spans that no longer appear in the passage
  after an edit, and counts in the `remember` line that were simply wrong. Any future
  passage edit must re-check the `why`, `rebuttals`, and `remember` quotes.

## Deployment — 2026-08-07

Deployed to production Firestore by `scripts/retireAndUploadBoundaries.js` (same
pattern as `retireAndUploadCid.js`; retire sets both `usageContext: 'retired'` and
`retired: true`).

- Found 159 Boundaries docs. Retired the **42** in the quiz pool (usageContext
  general/absent: 15 easy / 14 medium / 13 hard). Left the 117 exam-scoped docs
  untouched. Nothing deleted.
- Created **100** new docs, `authoringBatch: 'boundaries-refresh-2026'`,
  `usageContext: 'general'`.
- Verified with the exact primary Smart Quiz query
  (`subcategory == 'boundaries' && difficulty == d && usageContext == 'general'`):
  easy 30 / medium 40 / hard 30, all from this batch, no strays. Every difficulty
  bucket is under the query's `limit(50)`, so the full set serves.
- Full pre-write backup (retired docs' complete data + created ids):
  `scripts/backups/boundaries_refresh_1786108849963.json`
- Rollback:
  `node scripts/retireAndUploadBoundaries.js --rollback scripts/backups/boundaries_refresh_1786108849963.json --delete-created`

Optional follow-up: `node scripts/backfill-concept-tags.js --subcategory boundaries --apply`
if concept-mastery tagging should cover the new items (costs model tokens).
