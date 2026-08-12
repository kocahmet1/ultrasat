# Item schema and machine-checked rules

Every item is a JSON object with exactly these keys:

```json
{
  "originalQuestionNumber": 1,
  "passage": "…the stimulus…",
  "text": "…the question stem…",
  "questionType": "multiple-choice",
  "options": ["…", "…", "…", "…"],
  "correctAnswer": 2,
  "acceptedAnswers": null,
  "difficulty": "easy",
  "subcategory": "words-in-context",
  "subcategoryId": 4,
  "explanation": "Choice C (cyclical) is correct. …"
}
```

`subcategory` → `subcategoryId`: central-ideas-details 1, inferences 2, command-of-evidence 3,
words-in-context 4, text-structure-purpose 5, cross-text-connections 6, rhetorical-synthesis 7,
transitions 8, boundaries 9, form-structure-sense 10.

## Rules the validator enforces — violating any of these fails the build

- `options` has exactly 4 entries, all non-empty, all distinct, **no `A)` prefixes, no HTML tags**.
- `correctAnswer` is an integer 0–3. `acceptedAnswers` is always `null`.
- `explanation` must **begin with the literal string `Choice X`** where X is the keyed letter, and
  run ≥120 characters. Follow the house pattern: state why the key is right with textual evidence,
  then take each distractor in order and say specifically why it fails. Do not use the words
  "tricky", "trap", or address the student as "you".
- `passage` is required on every item and is **prose-only ≤ 150 words**. Per-skill minimum words:
  words-in-context 50, text-structure-purpose 75, cross-text-connections 100,
  central-ideas-details 70, command-of-evidence 65, inferences 65, boundaries 35,
  form-structure-sense 35, transitions 45, rhetorical-synthesis 70.
- **Exactly one blank, written as six or more underscores `______`,** in every
  words-in-context, inferences, boundaries, form-structure-sense, and transitions passage,
  and in every quantitative command-of-evidence passage. **Zero blanks** in every other item type.
- cross-text-connections passages must literally contain `Text 1` and `Text 2`.
- rhetorical-synthesis passages need **at least 5 bullets marked with the `•` character**, and must
  open with the exact lead-in `While researching a topic, a student has taken the following notes:`
- Underline markers `[UNDERLINED]…[/UNDERLINED]` are allowed **only** on a
  text-structure-purpose item whose stem contains "function of the underlined" or a
  cross-text-connections item referring to an "underlined claim/portion/assertion" — exactly one
  non-empty span. They are forbidden everywhere else.
- Quantitative graphics may appear **only** on command-of-evidence items, one graphic per item.
  - An HTML `<table>` needs real `<th>` and `<td>` cells and must survive DOMPurify unchanged.
  - An `<svg>` needs `data-graph-type="bar"` or `"line"`, a `viewBox`, `role="img"`, a non-empty
    `<title>`, and a non-empty `<desc>`.
- **No length cue.** The keyed option must not be the uniquely longest option in more than half of
  the items where options run long. Where the key is long, pad a distractor to match.
- Passages must not near-duplicate each other (token Jaccard ≥ 0.52 fails).

## Verbatim stems — use these exactly, they are near-invariant boilerplate

| skill | stem |
|---|---|
| words-in-context (blank) | `Which choice completes the text with the most logical and precise word or phrase?` |
| words-in-context (as-used) | `As used in the text, what does the word "X" most nearly mean?` |
| text-structure-purpose (purpose) | `Which choice best states the main purpose of the text?` |
| text-structure-purpose (structure) | `Which choice best describes the overall structure of the text?` |
| text-structure-purpose (function) | `Which choice best describes the function of the underlined sentence in the text as a whole?` |
| cross-text-connections | `Based on the texts, how would the author of Text 2 most likely respond to the underlined claim in Text 1?` |
| central-ideas-details | `Which choice best states the main idea of the text?` |
| command-of-evidence (quant) | `Which choice most effectively uses data from the table to complete the statement?` (or `from the graph`) |
| command-of-evidence (quotation) | `Which quotation from "TITLE" most effectively illustrates the claim?` |
| command-of-evidence (finding) | `Which finding, if true, would most directly support the researchers' hypothesis?` |
| inferences | `Which choice most logically completes the text?` |
| boundaries | `Which choice completes the text so that it conforms to the conventions of Standard English?` |
| form-structure-sense | `Which choice completes the text so that it conforms to the conventions of Standard English?` |
| transitions | `Which choice completes the text with the most logical transition?` |
| rhetorical-synthesis | `The student wants to <GOAL>. Which choice most effectively uses relevant information from the notes to accomplish this goal?` |

Boundaries and form-structure-sense share a byte-identical stem — that is correct and intended.

## Option-architecture rules distilled from the official bank

- **Boundaries** distractors are a *punctuation shape sweep*: the same words in four punctuation
  states. When the key is a semicolon, the three distractors are a comma splice, a run-on, and a
  bare conjunction — **never a colon or a dash**. When the key is "no punctuation", the modal
  distractor triple is {colon, comma, semicolon} or {colon, comma, dash}.
- **Form, structure, and sense**: in 39 of 44 official subject–verb items **all three distractors
  sit in the opposite number** and vary only in tense/aspect as camouflage; options are ~2 words.
  Plant a number-mismatched noun immediately before the blank (CB does this in 90% of items that
  have intervening material). Do **not** write comparative/superlative, "the reason is because",
  illogical-comparison, or parallel-structure items — the official bank contains **zero** of these.
- **Words in context**: the default architecture is **three definition-misfits**, not one-of-each.
  Near-opposites appear in only 26% of items and topical associates in 33%. Keys are usually common
  words used precisely. Every distractor must fail a *gloss test* — you must be able to write
  "X means …, but the text says …".
- **Inferences**: exactly one option must be **entailed**, not merely plausible. Every hard item
  contains an *exclusion clause* whose only job is to kill a rival explanation
  (e.g. "a difference only partly attributable to…", "Barring the possibility that…"), and one
  distractor is precisely the thing that clause excludes.
- **Command of evidence, quantitative**: easy distractors are **real values read from the wrong
  row or column** — never fabricated numbers. Hard distractors are **true but inert**, typically
  reporting one arm of a comparison the claim requires two arms of.
- **Rhetorical synthesis**: distractors are **accurate about the notes and fail only on goal fit**.
  In 429 official wrong-answer rationales CB uses "inaccurate/misstates/distorts" **zero times**.
  The rationale formula is literally "The sentence [does Y]; it doesn't [goal clause verbatim]."
  Because compound goals make the key naturally long, deliberately pad one distractor to match.
- **Text structure**: option grammar is rigid. Main-purpose options begin `To` + infinitive;
  structure and function options begin `It` + verb. Structure distractors keep the key's
  move-skeleton and swap the content.
