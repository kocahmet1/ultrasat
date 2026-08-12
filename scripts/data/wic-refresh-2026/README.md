# Words in Context refresh — 2026-08

Replaces the existing Words-in-Context pool used by Smart Quizzes with 100 newly authored
questions modelled on 200 official College Board items.

```
WIC_STYLE_SPEC.md            the measured authoring spec (read this first)
src/wic-0*.json              the authored source items (edit these)
src/official-*.json          collision lists extracted from the official bank
build.js                     compiles + validates → words-in-context-100.json
words-in-context-100.json    the import-ready artifact (generated — do not hand-edit)
```

## The set

| | easy | medium | hard | total |
|---|---|---|---|---|
| completion (*"…most logical and precise word or phrase?"*) | 25 | 33 | 26 | **84** |
| word meaning (*"As used in the text, what does 'X' most nearly mean?"*) | 5 | 7 | 4 | **16** |
| **total** | **30** | **40** | **30** | **100** |

Answer key is exactly 25 A / 25 B / 25 C / 25 D, with no run of three and no periodicity
(the build fails if either appears). Passage lengths track the official means: completion
52 / 54 / 55 words for easy / medium / hard; word-meaning 78 / 85 / 96.

Every item is original. The build cross-checks each keyed answer against the 189 keyed
answers in the official export and each proper noun against 821 names from it, and fails on
any collision.

## Rebuilding after an edit

```bash
node scripts/data/wic-refresh-2026/build.js
```

Validates structure, word-count envelopes, option shape, answer-key balance and periodicity,
duplicate keyed answers, distractor recycling, official-bank collisions, and that every span
quoted in a rationale appears verbatim in its own passage. Writes the artifact only if all
checks pass.

## Deploying

Two paths. Both are reversible.

### A. CLI (recommended — handles retirement too)

```bash
node scripts/retireAndRefreshWordsInContext.js --status
node scripts/retireAndRefreshWordsInContext.js --backfill-usage-context --apply
node scripts/retireAndRefreshWordsInContext.js --retire  --apply
node scripts/retireAndRefreshWordsInContext.js --import  --apply
node scripts/retireAndRefreshWordsInContext.js --status
```

Everything is a dry run without `--apply`, and every step writes a backup to
`scripts/backups/` that `--rollback <file>` restores.

Retirement is a soft flag: old questions get `usageContext:'retired'` plus `retired`,
`retiredAt` and `retiredReason`. Nothing is deleted, so user answer history and
`questionStats` stay intact.

### B. Admin UI

Upload `words-in-context-100.json` at `/admin/question-import` with **Force Overwrite
checked**. That flag is required: the endpoint de-duplicates on exact `text` equality, and
all 84 completion items share the same stem, so without it 83 of them are skipped as
duplicates. This path does not retire the old questions — do that from the admin question
manager or with the CLI above.

## The query change that goes with retirement

`getQuestionsBySubcategory()` used to fetch `limit(50)` documents and then drop non-general
ones in JavaScript. Retiring a large batch would leave those retired docs occupying slots
inside that 50-document window and starve the live pool. The primary query now constrains
`usageContext` server-side:

```js
where('subcategory', '==', kebab),
where('difficulty',  '==', difficulty),
where('usageContext','==', 'general'),
limit(limitCount)
```

Two prerequisites:

1. **Every question doc must carry `usageContext`.** Firestore equality filters skip
   documents missing the field. `--backfill-usage-context` sets `'general'` on any doc
   without it — run it before `--retire`.
2. **A composite index** on `questions: subcategory, difficulty, usageContext` (and
   `subcategory, usageContext`). Definitions are in `firestore.indexes.json` at the repo
   root; create them in the console or with `firebase deploy --only firestore:indexes`.

If the index is missing the narrowed query throws, the fetch loop logs a warning and falls
through to the previous un-narrowed query, and the old client-side filter still applies —
so the change degrades to current behaviour rather than breaking.

## Known limitation

The Practice Builder path (`createCustomSmartQuizInternal` in `smartQuizUtils.js`) still
fetches by `difficulty` alone with `limit(160)`/`limit(400)` and filters afterwards. Those
windows are wide enough that retiring one subcategory will not starve it, but the same
server-side narrowing would be worth applying there if retirement is ever done at scale.
